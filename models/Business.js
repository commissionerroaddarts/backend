import mongoose from "mongoose";

const { Schema, model } = mongoose;

const businessSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    slug: { type: String, unique: true },
    tagline: { type: String, required: true },
    media: {
      images: { type: [String], default: undefined },
      video: { type: String, default: undefined },
      logo: { type: String, default: undefined },
      cover: { type: String, default: undefined },
    },
    shortDis: { type: String, required: true },
    location: {
      geotag: {
        lat: Number,
        lng: Number,
      },
      address: String,
      state: String,
      city: String,
      country: String,
      zipcode: String,
    },
    phone: { type: String },
    website: { type: String },
    timings: {
      mon: {
        open: String,
        close: String,
      },
      tue: {
        open: String,
        close: String,
      },
      wed: {
        open: String,
        close: String,
      },
      thu: {
        open: String,
        close: String,
      },
      fri: {
        open: String,
        close: String,
      },
      sat: {
        open: String,
        close: String,
      },
      sun: {
        open: String,
        close: String,
      },
    },
    socials: {
      facebook: String,
      instagram: String,
      twitter: String,
      linkedin: String,
      youtube: String,
      tiktok: String,
    },
    faqs: [
      {
        q: String,
        a: String,
      },
    ],
    price: {
      category: {
        type: String,
        enum: ["$", "$$", "$$$", "$$$$"],
      },
      min: Number,
      max: Number,
    },
    agelimit: { type: Number },
    category: { type: String },
    tags: [String],
    status: {
      type: String,
      enum: ["Active", "Closed Down", "Coming Soon", "Under Remodel"],
      default: "Active",
    },
    validation: {
      date: { type: Date },
      status: {
        type: String,
        enum: ["Accredited", "Validated", "Not Validated"],
        default: "Not Validated",
      },
    },
    bordtype: {
      type: String,
      enum: ["Steel Tip", "Soft Tip", "Both"],
    },
    promotion: {
      title: { type: String },
      description: { type: String },
    },

    amenities: {
      type: new Schema({
        wheelchairAccessible: { type: Boolean, default: false },
        outdoorSeating: { type: Boolean, default: false },
        heatedPatio: { type: Boolean, default: false },
        outdoorSmoking: { type: Boolean, default: false },
        acceptsCreditCards: { type: Boolean, default: false },
        petFriendly: { type: Boolean, default: false },
        freeWiFi: { type: Boolean, default: false },
        tvOnSite: { type: Boolean, default: false },
        happyHourSpecials: { type: Boolean, default: false },
        reservationsAccepted: { type: Boolean, default: false },
        privateEventSpace: { type: Boolean, default: false },
        bikeParking: { type: Boolean, default: false },
        validatedParking: { type: Boolean, default: false },
        billiards: { type: Boolean, default: false },
        cornhole: { type: Boolean, default: false },
        other: { type: [String], default: [] }, // 👈 custom amenities array
      }),
      default: {},
    },
  },
  { timestamps: true }
);

const Business = model("Business", businessSchema);

export default Business;
