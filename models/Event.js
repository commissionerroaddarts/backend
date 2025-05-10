import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const eventSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    tagline: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String },
    tags: [String],
    media: {
        images: [String],
        banner: String
    },
    location: {
        geotag: {
            lat: Number,
            lng: Number
        },
        state: String,
        city: String,
        country: String,
        zipcode: String
    },
    // timings: {
    //     open: String,  // Format "HH:mm"
    //     close: String
    // },
    totalTickets: { type: Number },
    ticketLink: {
        type: String,
        match: /^https?:\/\/.+/
    },
    price: { type: Number },
    booking: {
        start: String,  // Format "YYYY-MM-DD" or ISO if you want
        end: String
    },
    socials: {
        facebook: String,
        instagram: String,
        twitter: String,
        linkedin: String,
    },
    faqs: [
        {
            q: String,
            a: String
        }
    ],
    agelimit: { type: Number },
    status: { 
        type: String, 
        enum: ['Upcoming', 'Completed', 'Ongoing', 'Canceled'] ,
        default: 'upcoming' 
    }
}, { timestamps: true });

const Event = model('Event', eventSchema);

export default Event;
