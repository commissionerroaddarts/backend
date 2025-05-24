import Joi from 'joi';
import mongoose from 'mongoose';
import validate from '../middlewares/validationMiddleware.js';

// Helper to validate MongoDB ObjectId
const objectId = Joi.string().custom((value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
    }
    return value;
}, 'ObjectId Validation');



const createReviewSchema = Joi.object({
    // user: objectId.required(),
    business: objectId.required(),
    boardCondition: Joi.number().min(1).max(5).required(),
    throwingLaneConditions: Joi.number().min(1).max(5).required(),
    lightingConditions: Joi.number().min(1).max(5).required(),
    spaceAllocated: Joi.number().min(1).max(5).required(),
    gamingAmbience: Joi.number().min(1).max(5).required(),
    img: Joi.string().optional().messages({
        'string.uri': 'Invalid URL format for img'
    }),
    text: Joi.string().required()
});

const updateReviewSchema = Joi.object({
    // user: objectId.optional(),
    // business: objectId.optional(),
    boardCondition: Joi.number().min(1).max(5).optional(),
    throwingLaneConditions: Joi.number().min(1).max(5).optional(),
    lightingConditions: Joi.number().min(1).max(5).optional(),
    spaceAllocated: Joi.number().min(1).max(5).optional(),
    gamingAmbience: Joi.number().min(1).max(5).optional(),
    img: Joi.string().optional().messages({
        'string.uri': 'Invalid URL format for img'
    }),
    text: Joi.string().optional()
}).min(1); // Ensures at least one field is being updated

export const validateUpdateReview = validate(updateReviewSchema);

export const validateCreateReview = validate(createReviewSchema);
