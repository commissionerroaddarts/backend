import express from 'express';
import Stripe from 'stripe';
import User from '../models/User.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

import bodyParser from 'body-parser';
import { stripeWebhookFn } from '../config/stripe.js';

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const router = express.Router();


router.get('/plans', async (req, res) => {
    try {
        const products = await stripe.products.list({ active: true });
        const prices = await stripe.prices.list({ active: true });

        // Combine product and price data
        const plans = products.data.map(product => {
            const priceObj = prices.data.find(price => price.product === product.id);
            return {
                id: product.id,
                name: product.name,
                description: product.description || '', // Fetch marketing description
                features: product.marketing_features, // Fetch marketing features from metadata
                price: priceObj?.unit_amount || 0,
                priceId: priceObj?.id || null,
                currency: priceObj?.currency || 'usd',
            };
        });


        res.json(plans);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.post('/apply-promo', async (req, res) => {
    const { promoCode, priceId } = req.body;

    try {
        const price = await stripe.prices.retrieve(priceId);
        if (!price) return res.status(404).json({ success: false, error: 'Price not found' });

        const promo = await stripe.promotionCodes.list({ code: promoCode, active: true });
        if (promo.data.length > 0) {
            const discount = promo.data[0].coupon.percent_off;
            const newAmount = Math.round(price.unit_amount * (1 - discount / 100));
            return res.json({ 
                success: true, 
                newAmount, 
                discount, 
                originalAmount: price.unit_amount 
            });
        }
        return res.json({ success: false });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});


// Create PaymentIntent and return client secret
router.post('/create-payment-intent', async (req, res) => {
    const { priceId, promoCode } = req.body;

    try {
        const price = await stripe.prices.retrieve(priceId);
        if (!price) return res.status(400).json({ error: 'Invalid price' });

        let finalAmount = price.unit_amount;

        if (promoCode) {
            const promo = await stripe.promotionCodes.list({ code: promoCode, active: true });
            if (promo.data.length > 0) {
                const discount = promo.data[0].coupon.percent_off;
                finalAmount = Math.round(price.unit_amount * (1 - discount / 100));
            }
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: finalAmount,
            currency: price.currency,
            automatic_payment_methods: { enabled: true },
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



router.post('/checkout', authMiddleware, async (req, res) => {
    const { priceId } = req.body;
    const userId = req.user.id;  // Assuming userId comes from authenticated request
    const email = req.user.email;  // Optional, you can use email in the metadata or for other purposes

    if (!priceId) {
        return res.status(400).json({ error: 'Missing priceId in request body' });
    }

    try {
        // 1. Check if the customer exists using userId metadata
        const customers = await stripe.customers.list({
            email,  // Use email to search for an existing customer
        });

        let customer = customers.data.length ? customers.data[0] : null;

        if (!customer) {
            // If no customer exists, create a new one
            customer = await stripe.customers.create({
                email,  // Optional: you can skip or store email as metadata if needed
                metadata: { userId },  // Attach userId as metadata for future reference
            });
        }

        // 2. Create a PaymentIntent or Checkout Session with the selected plan
        const session = await stripe.checkout.sessions.create({
            ui_mode: 'embedded',
            mode: 'subscription',  // Payment mode as subscription
            customer: customer.id, // Associate customer with userId
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            allow_promotion_codes: true,

            return_url: `${process.env.FRONTEND_URL}/return?session_id={CHECKOUT_SESSION_ID}`,
            metadata: {
                userId,  // Store userId in metadata for future reference
            },
        });


        res.json({
            clientSecret: session.client_secret,
        });
    } catch (error) {
        console.error('Error creating custom checkout session:', error);
        res.status(500).send(error.message);
    }
});



// Fetch session status after payment
router.get("/session_status", async (req, res) => {
    const sessionId = req.query.session_id;
    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        res.send({
            status: session.status,
            customer_email: session.customer_details?.email,
        });
    } catch (err) {
        res.status(400).json({ error: "Invalid session ID" });
    }
});





// Assuming you're using Express and have the stripe instance set up
router.get('/', authMiddleware, async (req, res) => {
    const userId = req.user.id; // Assuming you use middleware to get logged in user

    try {
        // 1. Get user's subscription ID from DB
        const user = await User.findById(userId); // Or however you fetch user
        const subscriptionId = user.stripeSubscriptionId;

        if (!subscriptionId) {
            return res.status(404).json({ error: 'No subscription found for this user' });
        }

        // 2. Fetch subscription from Stripe
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        // 3. Parse and return the details
        const currentPlan = subscription.items.data[0].price.nickname || subscription.items.data[0].price.id;
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000); // UNIX timestamp → Date
        const cancelAtPeriodEnd = !subscription.cancel_at_period_end;

        return res.json({
            plan: currentPlan,
            currentPeriodEnd,
            cancelAtPeriodEnd,
            status: subscription.status, // valuses will be active, past_due, canceled, incomplete, unpaid
        });

    } catch (error) {
        console.error('Error creating checkout session:', error);
        if (error.type === 'StripeCardError') {
            res.status(400).json({ error: 'Your card was declined' });
        } else if (error.type === 'StripeInvalidRequestError') {
            res.status(400).json({ error: 'Invalid parameters passed to Stripe API' });
        } else {
            res.status(500).json({ error: 'Internal server error. Please try again later.' });
        }
    }
});

router.get('/checkout/:sessionId', async (req, res) => {
    const { sessionId } = req.params;
    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        res.json(session);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching session details from Stripe' });
    }
});


router.post('/webhook', bodyParser.raw({ type: 'application/json' }), stripeWebhookFn );


// Endpoint for canceling subscription
router.post('/cancel', async (req, res) => {
    const userId = req.user.id;  // Ensure req.user is set by authentication middleware

    try {
        // Get user's subscription ID from DB (directly from the User model)
        const user = await User.findById(userId);
        if (!user || !user.stripeSubscriptionId) {
            return res.status(404).json({ error: 'No subscription found for this user' });
        }

        // Cancel subscription in Stripe (at the end of the current period)
        const subscription = await stripe.subscriptions.update(user.stripeSubscriptionId, {
            cancel_at_period_end: true, // This cancels the subscription at the end of the billing cycle
        });

        // Optionally, you can cancel immediately by using cancel_at_period_end: false

        // Update user's subscription status in DB (optional)
        user.stripeSubscriptionId = null; // Remove the stripe subscription ID, or you can keep it if needed
        await user.save();

        res.status(200).json({ message: 'Subscription canceled successfully' });

    } catch (error) {
        console.error('Error fetching subscription details:', error);
        if (error.type === 'StripeInvalidRequestError') {
            res.status(400).json({ error: 'Invalid request to Stripe API' });
        } else if (error.type === 'StripeAPIError') {
            res.status(500).json({ error: 'Stripe API error occurred' });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});





export default router;