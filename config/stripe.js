import Stripe from "stripe";
import User from "../models/User.js";

export const stripeWebhookFn = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
        event = Stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error('❌ Webhook signature verification failed.', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const userId = session.metadata.userId;
            const subscriptionId = session.subscription;

            const user = await User.findById(userId);
            if (user) {
                user.stripeSubscriptionId = subscriptionId;
                await user.save();
                console.log(`✅ Subscription stored for ${userId}`);
            } else {
                console.warn(`⚠️ No user found for email: ${userId}`);
            }
        }
    } catch (error) {
        console.error('Error processing webhook event:', error);
        return res.status(500).send('Failed to process webhook');
    }

    res.status(200).send('Webhook received');
}