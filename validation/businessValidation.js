import Joi from "joi";
import validate from "../middlewares/validationMiddleware.js";

const createValidation = Joi.object({
  name: Joi.string().trim().required(),
  tagline: Joi.string().required(),
  shortDis: Joi.string().required(),
  category: Joi.string().allow("").optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  bordtype: Joi.string().valid("Steel Tip", "Soft Tip", "Both").required(),
  location: Joi.object({
    geotag: Joi.object({
      lat: Joi.number().optional(),
      lng: Joi.number().optional(),
    }).optional(),
    address: Joi.string().allow("").optional(),
    state: Joi.string().allow("").optional(),
    city: Joi.string().allow("").optional(),
    country: Joi.string().allow("").optional(),
    zipcode: Joi.string().allow("").optional(),
  }).optional(),

  timings: Joi.object({
    mon: Joi.object({
      open: Joi.string().allow("").optional(),
      close: Joi.string().allow("").optional(),
    }).optional(),
    tue: Joi.object({
      open: Joi.string().allow("").optional(),
      close: Joi.string().allow("").optional(),
    }).optional(),
    wed: Joi.object({
      open: Joi.string().allow("").optional(),
      close: Joi.string().allow("").optional(),
    }).optional(),
    thu: Joi.object({
      open: Joi.string().allow("").optional(),
      close: Joi.string().allow("").optional(),
    }).optional(),
    fri: Joi.object({
      open: Joi.string().allow("").optional(),
      close: Joi.string().allow("").optional(),
    }).optional(),
    sat: Joi.object({
      open: Joi.string().allow("").optional(),
      close: Joi.string().allow("").optional(),
    }).optional(),
    sun: Joi.object({
      open: Joi.string().allow("").optional(),
      close: Joi.string().allow("").optional(),
    }).optional(),
  }).optional(),

  socials: Joi.object({
    facebook: Joi.string().allow("").optional(),
    instagram: Joi.string().allow("").optional(),
    twitter: Joi.string().allow("").optional(),
    linkedin: Joi.string().allow("").optional(),
    youtube: Joi.string().allow("").optional(),
    tiktok: Joi.string().allow("").optional(),
  }).optional(),

  faqs: Joi.array()
    .items(
      Joi.object({
        q: Joi.string().allow("").optional(),
        a: Joi.string().allow("").optional(),
      })
    )
    .optional(),

  website: Joi.string().allow("").optional(),
  phone: Joi.string().allow("").optional(),

  price: Joi.object({
    category: Joi.string().valid("$", "$$", "$$$", "$$$$").optional(),
    min: Joi.number().optional(),
    max: Joi.number().optional(),
  }).optional(),

  agelimit: Joi.number().allow(null).optional(),

  status: Joi.string()
    .valid("Active", "Closed Down", "Coming Soon", "Under Remodel")
    .optional(),

  promotion: Joi.object({
    title: Joi.string().allow("").optional(),
    description: Joi.string().allow("").optional(),
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

  amenities: Joi.object({
    wheelchairAccessible: Joi.boolean().optional(),
    outdoorSeating: Joi.boolean().optional(),
    heatedPatio: Joi.boolean().optional(),
    outdoorSmoking: Joi.boolean().optional(),
    acceptsCreditCards: Joi.boolean().optional(),
    petFriendly: Joi.boolean().optional(),
    freeWiFi: Joi.boolean().optional(),
    tvOnSite: Joi.boolean().optional(),
    happyHourSpecials: Joi.boolean().optional(),
    reservationsAccepted: Joi.boolean().optional(),
    privateEventSpace: Joi.boolean().optional(),
    bikeParking: Joi.boolean().optional(),
    validatedParking: Joi.boolean().optional(),
    billiards: Joi.boolean().optional(),
    cornhole: Joi.boolean().optional(),
    other: Joi.array().items(Joi.string().max(100)).optional(),
  }).optional(),

  validation: Joi.object({
    date: Joi.date().optional(),
    status: Joi.string()
      .valid("Accredited", "Validated", "Not Validated")
      .optional(),
  }).optional(),
});

const updateBusinessValidation = Joi.object({
  name: Joi.string().trim().optional(),
  tagline: Joi.string().allow("").optional(),
  shortDis: Joi.string().allow("").optional(),
  category: Joi.string().allow("").optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  bordtype: Joi.string().valid("Steel Tip", "Soft Tip", "Both").optional(),

  location: Joi.object({
    geotag: Joi.object({
      lat: Joi.number().optional(),
      lng: Joi.number().optional(),
    }).optional(),
    address: Joi.string().allow("").optional(),
    state: Joi.string().allow("").optional(),
    city: Joi.string().allow("").optional(),
    country: Joi.string().allow("").optional(),
    zipcode: Joi.string().allow("").optional(),
  }).optional(),

  // media: Joi.object({
  //     images: Joi.array().items(Joi.string()).optional(),
  //     video: Joi.string().allow('').optional(),
  //     logo: Joi.string().allow('').optional()
  // }).optional(),

  website: Joi.string().allow("").optional(),
  phone: Joi.string().allow("").optional(),

  timings: Joi.object({
    mon: Joi.object({
      open: Joi.string().allow("").optional(),
      close: Joi.string().allow("").optional(),
    }).optional(),
    tue: Joi.object({
      open: Joi.string().allow("").optional(),
      close: Joi.string().allow("").optional(),
    }).optional(),
    wed: Joi.object({
      open: Joi.string().allow("").optional(),
      close: Joi.string().allow("").optional(),
    }).optional(),
    thu: Joi.object({
      open: Joi.string().allow("").optional(),
      close: Joi.string().allow("").optional(),
    }).optional(),
    fri: Joi.object({
      open: Joi.string().allow("").optional(),
      close: Joi.string().allow("").optional(),
    }).optional(),
    sat: Joi.object({
      open: Joi.string().allow("").optional(),
      close: Joi.string().allow("").optional(),
    }).optional(),
    sun: Joi.object({
      open: Joi.string().allow("").optional(),
      close: Joi.string().allow("").optional(),
    }).optional(),
  }).optional(),

  socials: Joi.object({
    facebook: Joi.string().allow("").optional(),
    instagram: Joi.string().allow("").optional(),
    twitter: Joi.string().allow("").optional(),
    linkedin: Joi.string().allow("").optional(),
    youtube: Joi.string().allow("").optional(),
    tiktok: Joi.string().allow("").optional(),
  }).optional(),

  faqs: Joi.array()
    .items(
      Joi.object({
        q: Joi.string().allow("").optional(),
        a: Joi.string().allow("").optional(),
      })
    )
    .optional(),

  price: Joi.object({
    category: Joi.string().valid("$", "$$", "$$$", "$$$$").optional(),
    min: Joi.number().optional(),
    max: Joi.number().optional(),
  }).optional(),

  agelimit: Joi.number().allow(null).optional(),

  status: Joi.string()
    .valid("Active", "Closed Down", "Coming Soon", "Under Remodel")
    .optional(),

  promotion: Joi.object({
    title: Joi.string().allow("").optional(),
    description: Joi.string().allow("").optional(),
  }).optional(),

  amenities: Joi.object({
    wheelchairAccessible: Joi.boolean().optional(),
    outdoorSeating: Joi.boolean().optional(),
    heatedPatio: Joi.boolean().optional(),
    outdoorSmoking: Joi.boolean().optional(),
    acceptsCreditCards: Joi.boolean().optional(),
    petFriendly: Joi.boolean().optional(),
    freeWiFi: Joi.boolean().optional(),
    tvOnSite: Joi.boolean().optional(),
    happyHourSpecials: Joi.boolean().optional(),
    reservationsAccepted: Joi.boolean().optional(),
    privateEventSpace: Joi.boolean().optional(),
    bikeParking: Joi.boolean().optional(),
    validatedParking: Joi.boolean().optional(),
    billiards: Joi.boolean().optional(),
    cornhole: Joi.boolean().optional(),
    other: Joi.array().items(Joi.string().max(100)).optional(),
  }),

  validation: Joi.object({
    date: Joi.date().optional(),
    status: Joi.string()
      .valid("Accredited", "Validated", "Not Validated")
      .optional(),
  }).optional(),
});

export const validateCreate = validate(createValidation);
export const validateUpdate = validate(updateBusinessValidation);
