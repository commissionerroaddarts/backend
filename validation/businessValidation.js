import Joi from 'joi';
import validate from "../middlewares/validationMiddleware.js";

const createValidation = Joi.object({
    name: Joi.string().trim().required(),
    tagline: Joi.string().required(),
    shortDis: Joi.string().required(),
    category: Joi.string().optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    bordtype: Joi.string().valid('Steel Tip', 'Soft Tip', 'Both').required(),
    location: Joi.object({
        geotag: Joi.object({
            lat: Joi.number().optional(),
            lng: Joi.number().optional()
        }).optional(),
        address: Joi.string().optional(),
        state: Joi.string().optional(),
        city: Joi.string().optional(),
        country: Joi.string().optional(),
        zipcode: Joi.string().optional()
    }).optional(),



    timings: Joi.object({
        mon: Joi.object({
            open: Joi.string().optional(),
            close: Joi.string().optional()
        }).optional(),
        tue: Joi.object({
            open: Joi.string().optional(),
            close: Joi.string().optional()
        }).optional(),
        wed: Joi.object({
            open: Joi.string().optional(),
            close: Joi.string().optional()
        }).optional(),
        thu: Joi.object({
            open: Joi.string().optional(),
            close: Joi.string().optional()
        }).optional(),
        fri: Joi.object({
            open: Joi.string().optional(),
            close: Joi.string().optional()
        }).optional(),
        sat: Joi.object({
            open: Joi.string().optional(),
            close: Joi.string().optional()
        }).optional(),
        sun: Joi.object({
            open: Joi.string().optional(),
            close: Joi.string().optional()
        }).optional()
    }).optional(),

    socials: Joi.object({
        facebook: Joi.string().optional(),
        instagram: Joi.string().optional(),
        twitter: Joi.string().optional(),
        linkedin: Joi.string().optional(),
        youtube: Joi.string().optional(),
        tiktok: Joi.string().optional(),
    }).optional(),

    faqs: Joi.array().items(
        Joi.object({
            q: Joi.string().optional(),
            a: Joi.string().optional()
        })
    ).optional(),

    website: Joi.string().optional(),
    phone: Joi.string().optional(),

    price: Joi.object({
        category: Joi.string().valid('$', '$$', '$$$', '$$$$').optional(),
        min: Joi.number().optional(),
        max: Joi.number().optional()
    }).optional(),

    agelimit: Joi.number().allow(null).optional(),

    status: Joi.string().valid('Active', 'Closed Down', 'Coming Soon', 'Under Remodel').optional(),

    promotion: Joi.object({
        title: Joi.string().optional(),
        description: Joi.string().optional()
    }).optional(),

    // amenities: Joi.object({
    //     wheelchairAccessible: Joi.boolean().optional(),
    //     validatedParking: Joi.boolean().optional(),
    //     smokingOutsideOnly: Joi.boolean().optional(),
    //     outdoorSeating: Joi.boolean().optional(),
    //     heatedOutdoorSeating: Joi.boolean().optional(),
    //     bikeParking: Joi.boolean().optional(),
    //     acceptsCreditCards: Joi.boolean().optional(),
    //     freeWiFi: Joi.boolean().optional(),
    //     tv: Joi.boolean().optional(),
    //     happyHourSpecials: Joi.boolean().optional(),
    //     coveredOutdoorSeating: Joi.boolean().optional()
    // }).optional(),

     amenities: Joi.object()
        .pattern(Joi.string(), Joi.boolean())
        .optional(),

    validation: Joi.object({
        date: Joi.date().optional(),
        status: Joi.string().valid('Accredited', 'Validated', 'Not Validated').optional()
    }).optional()
});



const updateBusinessValidation = Joi.object({
    name: Joi.string().trim().optional(),
    tagline: Joi.string().optional(),
    shortDis: Joi.string().optional(),
    category: Joi.string().optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    bordtype: Joi.string().valid('Steel Tip', 'Soft Tip', 'Both').optional(),

    location: Joi.object({
        geotag: Joi.object({
            lat: Joi.number().optional(),
            lng: Joi.number().optional()
        }).optional(),
        address: Joi.string().optional(),
        state: Joi.string().optional(),
        city: Joi.string().optional(),
        country: Joi.string().optional(),
        zipcode: Joi.string().optional()
    }).optional(),

    // media: Joi.object({
    //     images: Joi.array().items(Joi.string()).optional(),
    //     video: Joi.string().optional(),
    //     logo: Joi.string().optional()
    // }).optional(),


    website: Joi.string().optional(),
    phone: Joi.string().optional(),

    timings: Joi.object({
        mon: Joi.object({
            open: Joi.string().optional(),
            close: Joi.string().optional()
        }).optional(),
        tue: Joi.object({
            open: Joi.string().optional(),
            close: Joi.string().optional()
        }).optional(),
        wed: Joi.object({
            open: Joi.string().optional(),
            close: Joi.string().optional()
        }).optional(),
        thu: Joi.object({
            open: Joi.string().optional(),
            close: Joi.string().optional()
        }).optional(),
        fri: Joi.object({
            open: Joi.string().optional(),
            close: Joi.string().optional()
        }).optional(),
        sat: Joi.object({
            open: Joi.string().optional(),
            close: Joi.string().optional()
        }).optional(),
        sun: Joi.object({
            open: Joi.string().optional(),
            close: Joi.string().optional()
        }).optional()
    }).optional(),

    socials: Joi.object({
        facebook: Joi.string().optional(),
        instagram: Joi.string().optional(),
        twitter: Joi.string().optional(),
        linkedin: Joi.string().optional(),
        youtube: Joi.string().optional(),
        tiktok: Joi.string().optional(),
    }).optional(),

    faqs: Joi.array().items(
        Joi.object({
            q: Joi.string().optional(),
            a: Joi.string().optional()
        })
    ).optional(),

    price: Joi.object({
        category: Joi.string().valid('$', '$$', '$$$', '$$$$').optional(),
        min: Joi.number().optional(),
        max: Joi.number().optional()
    }).optional(),

    agelimit: Joi.number().allow(null).optional(),

    status: Joi.string().valid('Active', 'Closed Down', 'Coming Soon', 'Under Remodel').optional(),

    promotion: Joi.object({
        title: Joi.string().optional(),
        description: Joi.string().optional()
    }).optional(),

    // amenities: Joi.object({
    //     wheelchairAccessible: Joi.boolean().optional(),
    //     validatedParking: Joi.boolean().optional(),
    //     smokingOutsideOnly: Joi.boolean().optional(),
    //     outdoorSeating: Joi.boolean().optional(),
    //     heatedOutdoorSeating: Joi.boolean().optional(),
    //     bikeParking: Joi.boolean().optional(),
    //     acceptsCreditCards: Joi.boolean().optional(),
    //     freeWiFi: Joi.boolean().optional(),
    //     tv: Joi.boolean().optional(),
    //     happyHourSpecials: Joi.boolean().optional(),
    //     coveredOutdoorSeating: Joi.boolean().optional()
    // }).optional(),

    amenities: Joi.object()
        .pattern(Joi.string(), Joi.boolean())
        .optional(),

    validation: Joi.object({
            date: Joi.date().optional(),
            status: Joi.string().valid('Accredited', 'Validated', 'Not Validated').optional()
        }).optional()
});

export const validateCreate = validate(createValidation);
export const validateUpdate = validate(updateBusinessValidation);
