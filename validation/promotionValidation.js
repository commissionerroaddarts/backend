import Joi from 'joi';
import validate from "../middlewares/validationMiddleware.js";

const promotionValidation = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
});

export const validatePromotion = validate(promotionValidation);
