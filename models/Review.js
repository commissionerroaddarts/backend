import mongoose from 'mongoose';
import { validateURL } from '../utils/helper.js';

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  ratings: {
    boardCondition: { type: Number, min: 1, max: 5, required: true },
    throwingLaneConditions: { type: Number, min: 1, max: 5, required: true },
    lightingConditions: { type: Number, min: 1, max: 5, required: true },
    spaceAllocated: { type: Number, min: 1, max: 5, required: true },
    gamingAmbience: { type: Number, min: 1, max: 5, required: true },
    overallRating: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  img: {
    type: String,
    // validate: {
    //   validator: validateURL,
    //   message: 'Invalid URL format for img'
    // }
  },
  text: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Optional: Ensure one review per user per business
reviewSchema.index({ user: 1, business: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

export default Review;
