import mongoose from 'mongoose';

const { Schema } = mongoose;

// Define the UserSubscription schema
const userSubscriptionSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Link to the User model
      required: true,
    },
    stripeCustomerId: {
      type: String,
      required: true,
    },
    stripeSubscriptionId: {
      type: String,
      required: true,
    },
    stripePriceId: {
      type: String,
      required: true, 
    },
    plan: {
      type: String,
      enum: ['basic', 'business', 'enterprise'], // Store the plan name
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'past_due', 'canceled', 'incomplete', 'unpaid'], // Subscription status from Stripe
      default: 'active', // Default status
    },
    currentPeriodEnd: {
      type: Date,
      required: true, // Subscription's end date (expiry date)
    },
    autoRenewal: {
      type: Boolean,
      default: true, // If auto-renewal is enabled or not
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

// Create the UserSubscription model
const UserSubscription = mongoose.model('UserSubscription', userSubscriptionSchema);

export default UserSubscription;
