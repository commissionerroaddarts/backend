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
            const email = session.metadata.email;
            const subscriptionId = session.subscription;

            const user = await User.findOne({email: email});
            if (user) {
                user.stripeSubscriptionId = subscriptionId;
                user.role = 'owner';
                await user.save();
                console.log(`✅ Subscription stored for ${email}`);
            } else {
                console.warn(`⚠️ No user found for email: ${email}`);
            }
        }
    } catch (error) {
        console.error('Error processing webhook event:', error);
        return res.status(500).send('Failed to process webhook');
    }

    res.status(200).send('Webhook received');
}
