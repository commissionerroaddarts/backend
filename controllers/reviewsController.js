import mongoose from "mongoose";
import Review from "../models/Review.js";
import Business from './../models/Business.js';
import { createNotification } from "../utils/createNotification.js";
import sendMail from './../config/mail.js';
import { REVIEW_NOTIFICATION } from "../constants/emailTemplets.js";



export const bulkCreateReviews = async (req, res, next) => {
    try {
        const reviews = req.body; // Expecting an array of review objects

        // Validate that the reviews array is not empty
        if (!Array.isArray(reviews) || reviews.length === 0) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'No reviews provided or incorrect format.',
                }
            });
        }

        // Calculate the overallRating for each review
        const updatedReviews = reviews.map((review) => {
            const {
                boardCondition,
                throwingLaneConditions,
                lightingConditions,
                spaceAllocated,
                gamingAmbience,
            } = review.ratings;

            const overallRating = Math.round(
                (boardCondition + throwingLaneConditions + lightingConditions + spaceAllocated + gamingAmbience) / 5 * 10
            ) / 10; // Round to 1 decimal

            return {
                ...review,
                ratings: {
                    ...review.ratings,
                    overallRating
                }
            };
        });

        // Optionally, validate each review (optional, you can skip if already validated earlier)
        const invalidReviews = updatedReviews.filter(review => {
            const { business, user, ratings, text } = review;
            return !business || !user || !ratings || !text ||
                Object.values(ratings).some(value => typeof value !== 'number');
        });

        if (invalidReviews.length > 0) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Some reviews are missing required fields or contain invalid data.',
                    invalidReviews,
                }
            });
        }

        const createdReviews = await Review.insertMany(updatedReviews);

        res.status(201).json({
            success: true,
            message: 'Reviews created successfully',
            data: createdReviews
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                error: {
                    message: 'Duplicate review entries detected',
                }
            });
        }
        next(error);
    }
};



// Create a new review
export const createReview = async (req, res, next) => {
    try {
        const {
            business,
            boardCondition,
            throwingLaneConditions,
            lightingConditions,
            spaceAllocated,
            gamingAmbience,
            img,
            text,
        } = req.body;

        const businessExists = await Business.findById(business).populate('userId', 'email firstname');
        if (!businessExists) {
            return res.status(404).json({
                success: false,
                error: {
                    message: 'Business not found',
                }
            });
        }

        const overallRating = Math.round(
            (boardCondition + throwingLaneConditions + lightingConditions + spaceAllocated + gamingAmbience) / 5 * 10
        ) / 10; // Round to 1 decimal

        const user = req.user.id;
        const reviewData = {
            user,
            business,
            ratings: {
                boardCondition,
                throwingLaneConditions,
                lightingConditions,
                spaceAllocated,
                gamingAmbience,
                overallRating
            },
            img,
            text
        };

        const review = await Review.create(reviewData);


        const notificationData = {
            userId: businessExists.userId,
            title: `${req.user.username} added review on ${businessExists.name}.`,
            link: `${process.env.FRONTEND_URL}/establishments/${businessExists.id}`
        }

        createNotification(notificationData)

        sendMail(REVIEW_NOTIFICATION(businessExists.userId.email ,businessExists.name , notificationData.link))

        res.status(201).json({
            success: true,
            message: 'Review created successfully',
            data: review
        });


    } catch (error) {


        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                error: {
                    message: 'You have already submitted a review for this business',
                }
            });
        }

        next(error);
    }
};

export const getAllReviews = async (req, res, next) => {
    try {
        let { page = 1, limit = 10, sort, business, user, search } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);
        const skip = (page - 1) * limit;

        // Build dynamic filter
        const filter = {};
        if (business) {
            filter.business = business;
        }
        if (user) {
            filter.user = user;
        }

        const sortOption = sort === 'rating'
            ? { rating: -1, createdAt: -1 } // sort by rating first, then newest
            : { createdAt: -1 };            // default: newest first

        // Calculate stats if filtering by business
        let totalReviews = 0;
        let averageRating = 0;


        if (business && !user) {
            const stats = await Review.aggregate([{
                $match: {
                    business: new mongoose.Types.ObjectId(business)
                }
            },
            {
                $group: {
                    _id: null,
                    totalReviews: { $sum: 1 },
                    averageRating: { $avg: "$ratings.overallRating" }
                }
            }]);

            if (stats.length > 0) {
                totalReviews = stats[0].totalReviews;
                averageRating = stats[0].averageRating;
            }
        } else {
            totalReviews = await Review.countDocuments(filter);
        }

        const matchStage = {
            $match: {}
        };

        if (user) {
            matchStage.$match.user = new mongoose.Types.ObjectId(user);
        }

        if (business) {
            matchStage.$match.business = new mongoose.Types.ObjectId(business);
        }

        if (search) {
            matchStage.$match['businessDoc.name'] = {
                $regex: search,
                $options: 'i'
            };
        }

        const reviews = await Review.aggregate([
            // Join user
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'userDoc'
                }
            },
            { $unwind: '$userDoc' },

            // Join business
            {
                $lookup: {
                    from: 'businesses',
                    localField: 'business',
                    foreignField: '_id',
                    as: 'businessDoc'
                }
            },
            { $unwind: '$businessDoc' },

            // Add filter
            matchStage,

            // Sort
            {
                $sort: sort === 'rating'
                    ? { 'ratings.overallRating': -1, createdAt: -1 }
                    : { createdAt: -1 }
            },

            // Pagination
            { $skip: skip },
            { $limit: limit },

            // Project only needed fields
            {
                $project: {
                    _id: 1,
                    text: 1,
                    img: 1,
                    createdAt: 1,
                    ratings: 1,
                    'user._id': '$userDoc._id',
                    'user.username': '$userDoc.username',
                    'user.email': '$userDoc.email',
                    'user.profileImg': '$userDoc.profileImg',
                    'business._id': '$businessDoc._id',
                    'business.slug': '$businessDoc.slug',
                    'business.name': '$businessDoc.name',
                    'business.media.logo': '$businessDoc.media.logo',
                }
            }
        ]);

        // const reviews = await Review.find(filter)
        //     .populate('user', 'username email profileImg')
        //     .populate('business', 'name media.logo')
        //     .sort(sortOption)
        //     .skip(skip)
        //     .limit(limit);

        let submittedReview;
        if (req.user && req.user.id, business, !user) {
            submittedReview = await Review.findOne({
                user: req.user.id,
                business,
            }).select('ratings text img createdAt');
        }

        res.status(200).json({
            success: true,
            data: reviews,
            totalReviews,
            averageRating: user ? undefined : averageRating,
            submittedReview: submittedReview || undefined,
            totalPages: Math.ceil(totalReviews / limit),
            page,
            limit,
        });
    } catch (error) {
        next(error);
    }
};

export const updateReview = async (req, res, next) => {
    try {
        const { id } = req.params;
        const {
            boardCondition,
            throwingLaneConditions,
            lightingConditions,
            spaceAllocated,
            gamingAmbience,
            img,
            text
        } = req.body;
        const overallRating = Math.round(
            (boardCondition + throwingLaneConditions + lightingConditions + spaceAllocated + gamingAmbience) / 5 * 10
        ) / 10; // Round to 1 decimal


        const reviewData = {
            ratings: {
                boardCondition,
                throwingLaneConditions,
                lightingConditions,
                spaceAllocated,
                gamingAmbience,
                overallRating
            },
            img,
            text
        };

        const review = await Review.findByIdAndUpdate(
            id,
            reviewData,
            { new: true, runValidators: true }
        );

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Review updated successfully',
            data: review
        });
    } catch (error) {
        next(error);
    }
};

// Delete a review
export const deleteReview = async (req, res, next) => {
    try {
        const { id } = req.params;
        const review = await Review.findByIdAndDelete(id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Review deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};
