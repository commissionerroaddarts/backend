import jwt from "jsonwebtoken";
import axios from "axios";

export function cleanFields(fieldsString = "") {
  return fieldsString.replace(/\s+/g, "").replace(/,/g, " ");
}

export function validateURL(v) {
  if (!v) return true;
  try {
    new URL(v);
    return true;
  } catch (err) {
    return false;
  }
}

export const generateAccessToken = (user, ex = "1d") => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
      email: user.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: ex,
    }
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
      email: user.email,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

export const generateUniqueSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // remove non-word characters
    .replace(/\s+/g, "-") // replace spaces with hyphens
    .replace(/--+/g, "-") // replace multiple hyphens with single
    .replace(/^-+|-+$/g, ""); // trim hyphens from start/end
};

export function buildMatchStage(query) {
  const {
    category,
    priceCategory,
    city,
    state,
    country,
    bordtype,
    agelimit,
    user,
    search,
    status,
    validation,
    amenities,
  } = query;

  const matchStage = {};
  const buildRegex = (value) => ({ $regex: new RegExp(`^${value}$`, "i") });

  if (status) matchStage.status = buildRegex(status);
  if (validation) matchStage["validation.status"] = buildRegex(validation);
  if (category) matchStage.category = buildRegex(category);
  if (priceCategory) matchStage["price.category"] = priceCategory;
  if (city) matchStage["location.city"] = buildRegex(city);
  if (state) matchStage["location.state"] = buildRegex(state);
  if (country) matchStage["location.country"] = buildRegex(country);
  if (bordtype) matchStage.bordtype = buildRegex(bordtype);
  if (agelimit) {
    matchStage.$or = [
      { agelimit: { $lte: parseInt(agelimit) } },
      { agelimit: { $exists: false } },
      { agelimit: null },
    ];
  }
  if (user) matchStage.userId = new mongoose.Types.ObjectId(user);

  if (amenities) {
    const amenitiesArr = amenities.split(",");
    amenitiesArr.forEach((amenity) => {
      matchStage[`amenities.${amenity}`] = true;
    });
  }

  if (search) {
    matchStage.$or = [
      { name: { $regex: search, $options: "i" } },
      { tagline: { $regex: search, $options: "i" } },
      { shortDis: { $regex: search, $options: "i" } },
      { tags: { $regex: search, $options: "i" } },
      { "location.address": { $regex: search, $options: "i" } },
      { "location.zipcode": { $regex: search, $options: "i" } },
      { bordtype: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } },
    ];
  }

  return matchStage;
}

export async function buildAggregationPipeline({
  matchStage,
  lat,
  lng,
  radius,
  rating,
  selectedSort,
  skip,
  limit,
  city,
  state,
  zipcode,
}) {
  const pipeline = [{ $match: matchStage }];

  let geocodedLat = lat;
  let geocodedLng = lng;
  let geocodedRadius = radius || 500;
  // If no lat/lng provided, but city/state/zipcode is, geocode it
  if ((!geocodedLat || !geocodedLng) && (city || state || zipcode)) {
    const geocoded = await geocodeLocation({
      city: city,
      state: state,
      zipcode: zipcode,
    });
    console.log("Geocoded location:", geocoded);
    if (geocoded) {
      geocodedLat = geocoded.lat;
      geocodedLng = geocoded.lng;
    }
  }

  if (geocodedLat && geocodedLng) {
    const radiusInRadians = parseFloat(geocodedRadius) / 6378.1;

    pipeline.push(
      {
        $addFields: {
          locationPoint: {
            type: "Point",
            coordinates: ["$location.geotag.lng", "$location.geotag.lat"],
          },
        },
      },
      {
        $match: {
          locationPoint: {
            $geoWithin: {
              $centerSphere: [
                [parseFloat(geocodedLng), parseFloat(geocodedLat)],
                radiusInRadians,
              ],
            },
          },
        },
      }
    );
  }

  pipeline.push(
    {
      $lookup: {
        from: "reviews",
        localField: "_id",
        foreignField: "business",
        as: "reviews",
      },
    },
    {
      $addFields: {
        totalRatings: { $size: "$reviews" },
        averageRating: {
          $cond: [
            { $gt: [{ $size: "$reviews" }, 0] },
            { $avg: "$reviews.ratings.overallRating" },
            0,
          ],
        },
      },
    },
    {
      $project: {
        reviews: 0,
      },
    }
  );

  if (rating) {
    pipeline.push({
      $match: { averageRating: { $gte: parseFloat(rating) } },
    });
  }

  pipeline.push({
    $facet: {
      data: [{ $sort: selectedSort }, { $skip: skip }, { $limit: limit }],
      totalCount: [{ $count: "count" }],
    },
  });

  return pipeline;
}

export const geocodeLocation = async ({ city, state, zipcode }) => {
  const addressParts = [city, state, zipcode].filter(Boolean);
  const address = addressParts.join(", ");

  if (!address) return null;

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

  const { data } = await axios.get(url);
  const result = data.results[0];

  if (result) {
    const { lat, lng } = result.geometry.location;
    return { lat, lng };
  }

  return null;
};
