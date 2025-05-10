import Joi from 'joi';
import validate from "../middlewares/validationMiddleware.js";

// CREATE EVENT VALIDATION
const createEventValidation = Joi.object({
    name: Joi.string().required(),
    tagline: Joi.string().required(),
    description: Joi.string().required(),
    category: Joi.string().optional(),
    tags: Joi.array().items(Joi.string()).optional(),

    //   media: Joi.object({
    //     images: Joi.array().items(Joi.string()).optional(),
    //     banner: Joi.string().optional()
    //   }).optional(),

    location: Joi.object({
        geotag: Joi.object({
            lat: Joi.number().optional(),
            lng: Joi.number().optional()
        }).optional(),
        state: Joi.string().optional(),
        city: Joi.string().optional(),
        country: Joi.string().optional(),
        zipcode: Joi.string().optional()
    }).optional(),

    // timings: Joi.object({
    //     open: Joi.string().optional(),
    //     close: Joi.string().optional()
    // }).optional(),

    totalTickets: Joi.number().optional(),

    ticketLink: Joi.string().uri().optional(),

    booking: Joi.object({
        start: Joi.string().optional(),
        end: Joi.string().optional()
    }).optional(),

    socials: Joi.object({
        facebook: Joi.string().optional(),
        instagram: Joi.string().optional(),
        twitter: Joi.string().optional(),
        linkedin: Joi.string().optional()
    }).optional(),

    faqs: Joi.array().items(
        Joi.object({
            q: Joi.string().optional(),
            a: Joi.string().optional()
        })
    ).optional(),

    price: Joi.number().optional(),
    agelimit: Joi.number().optional(),

    status: Joi.string().valid('Upcoming', 'Completed', 'Ongoing', 'Canceled').optional()
});

// UPDATE EVENT VALIDATION
const updateEventValidation = Joi.object({
    name: Joi.string().optional(),
    tagline: Joi.string().optional(),
    description: Joi.string().optional(),
    category: Joi.string().optional(),
    tags: Joi.array().items(Joi.string()).optional(),

    //   media: Joi.object({
    //     images: Joi.array().items(Joi.string()).optional(),
    //     banner: Joi.string().optional()
    //   }).optional(),

    location: Joi.object({
        geotag: Joi.object({
            lat: Joi.number().optional(),
            lng: Joi.number().optional()
        }).optional(),
        street: Joi.string().optional(),
        state: Joi.string().optional(),
        city: Joi.string().optional(),
        country: Joi.string().optional(),
        zipcode: Joi.string().optional()
    }).optional(),

    // timings: Joi.object({
    //     open: Joi.string().optional(),
    //     close: Joi.string().optional()
    // }).optional(),

    totalTickets: Joi.number().optional(),

    ticketLink: Joi.string().uri().optional(),

    booking: Joi.object({
        start: Joi.string().optional(),
        end: Joi.string().optional()
    }).optional(),

    socials: Joi.object({
        facebook: Joi.string().optional(),
        instagram: Joi.string().optional(),
        twitter: Joi.string().optional(),
        linkedin: Joi.string().optional()
    }).optional(),

    faqs: Joi.array().items(
        Joi.object({
            q: Joi.string().optional(),
            a: Joi.string().optional()
        })
    ).optional(),

    price: Joi.number().optional(),
    agelimit: Joi.number().optional(),

    status: Joi.string().valid('Upcoming', 'Completed', 'Ongoing', 'Canceled').optional()
});

export const validateCreateEvent = validate(createEventValidation);
export const validateUpdateEvent = validate(updateEventValidation);
