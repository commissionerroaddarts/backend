import jwt from "jsonwebtoken";

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
  if (agelimit) matchStage.agelimit = { $lte: parseInt(agelimit) };
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
    ];
  }

  return matchStage;
}

export function buildAggregationPipeline({
  matchStage,
  lat,
  lng,
  radius,
  rating,
  selectedSort,
  skip,
  limit,
}) {
  const pipeline = [{ $match: matchStage }];

  if (lat && lng && radius) {
    const radiusInRadians = parseFloat(radius) / 6378.1;

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
                [parseFloat(lng), parseFloat(lat)],
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
