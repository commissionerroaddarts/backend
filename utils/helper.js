import jwt from "jsonwebtoken";
import axios from "axios";
import Stripe from "stripe";
import mongoose from "mongoose";

const isProduction = process.env.NODE_ENV === "production";
const stripe = Stripe(
  isProduction
    ? process.env.STRIPE_SECRET_KEY
    : process.env.STRIPE_SECRET_TEST_KEY
);

export function cleanFields(fieldsString = "") {
  return fieldsString.replace(/\s+/g, "").replace(/,/g, " ");
}

export function validateURL(v) {
  if (!v) return true;
  try {
    new URL(v);
    return true;
  } catch (err) {
    console.error(err);
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
  rating,
  selectedSort,
  skip,
  limit,
  city,
  state,
  zipcode,
}) {
  const pipeline = [{ $match: matchStage }];

  const sortingByNearby = lat && lng;
  const sortingByReviews =
    selectedSort?.averageRating || selectedSort?.totalReviews;

  // Step 1: Add Geo filter (if lat/lng provided or location-based fields)
  await addGeoFilterStage(pipeline, { lat, lng, city, state, zipcode });

  // Step 2: Add reviews
  addReviewLookupStage(pipeline);

  // Step 3: Filter by rating
  addRatingFilterStage(pipeline, rating);

  // Step 4: Filter out businesses without reviews (if sorting by reviews)
  if (!sortingByNearby && sortingByReviews) {
    pipeline.push({
      $match: { totalReviews: { $gt: 0 } },
    });
  }

  // Step 5: Pagination & Sorting
  addPaginationAndSortStage(pipeline, selectedSort, skip, limit);

  return pipeline;
}

export async function addGeoFilterStage(
  pipeline,
  { lat, lng, city, state, zipcode }
) {
  let geocodedLat = lat;
  let geocodedLng = lng;

  // If lat/lng not provided, try geocoding
  if ((!lat || !lng) && (city || state || zipcode)) {
    const geocoded = await geocodeLocation({ city, state, zipcode });
    if (geocoded) {
      geocodedLat = geocoded.lat;
      geocodedLng = geocoded.lng;
    }
  }

  if (geocodedLat && geocodedLng) {
    // Add distance calculation to all documents (if geotag exists)
    pipeline.push({
      $addFields: {
        distance: {
          $cond: [
            {
              $and: [
                { $ifNull: ["$location.geotag.lat", false] },
                { $ifNull: ["$location.geotag.lng", false] },
              ],
            },
            {
              $let: {
                vars: {
                  r: 6371,
                  dLat: {
                    $degreesToRadians: {
                      $subtract: [
                        { $toDouble: geocodedLat },
                        { $toDouble: "$location.geotag.lat" },
                      ],
                    },
                  },
                  dLng: {
                    $degreesToRadians: {
                      $subtract: [
                        { $toDouble: geocodedLng },
                        { $toDouble: "$location.geotag.lng" },
                      ],
                    },
                  },
                  lat1: {
                    $degreesToRadians: { $toDouble: "$location.geotag.lat" },
                  },
                  lat2: {
                    $degreesToRadians: { $toDouble: geocodedLat },
                  },
                },
                in: {
                  $multiply: [
                    "$$r",
                    {
                      $acos: {
                        $add: [
                          {
                            $multiply: [{ $sin: "$$lat1" }, { $sin: "$$lat2" }],
                          },
                          {
                            $multiply: [
                              { $cos: "$$lat1" },
                              { $cos: "$$lat2" },
                              { $cos: "$$dLng" },
                            ],
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            },
            null,
          ],
        },
      },
    });
  }
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

export function addReviewLookupStage(pipeline) {
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
        totalReviews: { $size: "$reviews" },
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
}

export function addRatingFilterStage(pipeline, rating) {
  if (rating) {
    pipeline.push({
      $match: { averageRating: { $gte: parseFloat(rating) } },
    });
  }
}

export function addPaginationAndSortStage(pipeline, selectedSort, skip, limit) {
  let sortStage = {};

  if (selectedSort?.averageRating) sortStage = { averageRating: -1 };
  else if (selectedSort?.totalReviews) sortStage = { totalReviews: -1 };
  else if (selectedSort?.distance)
    sortStage = { distance: 1 }; // Closest first
  else sortStage = { createdAt: -1 };

  pipeline.push({
    $facet: {
      data: [{ $sort: sortStage }, { $skip: skip }, { $limit: limit }],
      totalCount: [{ $count: "count" }],
    },
  });
}

// auth helper functions

const permissionsData = {
  "Basic Plan": { maxListings: 1 },
  "Standard Plan": { maxListings: 3 },
  "Premium Plan": { maxListings: 9 },
};

export const getSubscriptionDetails = async (subscriptionId) => {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const productId = subscription.items.data[0].price.product;
    const product = await stripe.products.retrieve(productId);

    const currentPeriodEnd =
      subscription.billing_cycle_anchor + 30 * 24 * 60 * 60;
    const subscriptionData = {
      plan: product.name,
      currentPeriodEnd,
      isAutoRenew: !subscription.cancel_at_period_end,
      status: subscription.status,
    };

    const permissions =
      subscription.status === "active"
        ? permissionsData[product.name]
        : undefined;

    return { subscriptionData, permissions };
  } catch (err) {
    console.error("Stripe Error:", err.message);
    return { subscriptionData: undefined, permissions: undefined };
  }
};

export const getSpecialUserPermissions = (email) => {
  if (email === "trlong44@gmail.com") {
    return { maxListings: 9999 };
  }
  return undefined;
};
