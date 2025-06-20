import express from "express";
import Stripe from "stripe";
import User from "../models/User.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import bodyParser from "body-parser";
import path from "path";
import fs from "fs";
import { stripeWebhookFn } from "../config/stripe.js";

import pkg from "lodash";
const { toUpper } = pkg;

const isProduction = process.env.NODE_ENV === "production";
const stripe = Stripe(
  isProduction
    ? process.env.STRIPE_SECRET_KEY
    : process.env.STRIPE_SECRET_TEST_KEY
);
const router = express.Router();

router.post("/import-products", async (req, res) => {
  try {
    const productsFile = path.join("./products.json");
    const rawData = fs.readFileSync(productsFile);
    const products = JSON.parse(rawData);

    const results = [];

    for (const product of products) {
      // 1. Create Product
      const stripeProduct = await stripe.products.create({
        name: product.name,
        description: product.description,
        metadata: {
          original_id: product.id,
          features: product.features.map((f) => f.name).join(", "),
        },
      });

      // 2. Create Monthly Price
      const monthlyPrice = await stripe.prices.create({
        unit_amount: product.prices.monthly.amount,
        currency: product.prices.monthly.currency,
        recurring: { interval: "month" },
        product: stripeProduct.id,
      });

      // 3. Create Yearly Price
      const yearlyPrice = await stripe.prices.create({
        unit_amount: product.prices.yearly.amount,
        currency: product.prices.yearly.currency,
        recurring: { interval: "year" },
        product: stripeProduct.id,
      });

      results.push({
        product: stripeProduct,
        prices: { monthly: monthlyPrice.id, yearly: yearlyPrice.id },
      });
    }

    res.status(200).json({
      message: "All products imported successfully!",
      data: results,
    });
  } catch (err) {
    console.error("Import failed:", err);
    res.status(500).json({
      error: "Import failed",
      details: err.message,
    });
  }
});

router.get("/plans", async (req, res) => {
  try {
    const products = await stripe.products.list({ active: true });
    const prices = await stripe.prices.list({ active: true });

    // Combine product and price data
    const plans = products.data.map((product) => {
      const priceObj = prices.data
        .filter((price) => price.product === product.id)
        .reduce((acc, price) => {
          if (price.recurring?.interval === "month") {
            acc.monthly = {
              priceId: price.id,
              amount: price.unit_amount,
              currency: price.currency,
            };
          } else if (price.recurring?.interval === "year") {
            acc.yearly = {
              priceId: price.id,
              amount: price.unit_amount,
              currency: price.currency,
            };
          }
          return acc;
        }, {});

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        features: product.marketing_features,
        prices: priceObj, // Include both yearly and monthly prices from acc
      };
    });

    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/apply-promo", async (req, res) => {
  const { promoCode, priceId } = req.body;

  try {
    const price = await stripe.prices.retrieve(priceId);
    if (!price)
      return res.status(404).json({ success: false, error: "Price not found" });

    const promo = await stripe.promotionCodes.list({
      code: promoCode,
      active: true,
    });
    if (promo.data.length > 0) {
      const discount = promo.data[0].coupon.percent_off;
      const newAmount = Math.round(price.unit_amount * (1 - discount / 100));
      return res.json({
        success: true,
        newAmount,
        discount,
        originalAmount: price.unit_amount,
      });
    }
    return res.json({ success: false });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Create PaymentIntent and return client secret
router.post("/create-payment-intent", async (req, res) => {
  const { priceId, promoCode } = req.body;

  try {
    const price = await stripe.prices.retrieve(priceId);
    if (!price) return res.status(400).json({ error: "Invalid price" });

    let finalAmount = price.unit_amount;

    if (promoCode) {
      const promo = await stripe.promotionCodes.list({
        code: promoCode,
        active: true,
      });
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

router.post("/checkout", async (req, res) => {
  const { priceId, email, promoCode, plan } = req.body;
  // const userId = req.user.id;  // Assuming userId comes from authenticated request
  // const email = req.user.email;  // Optional, you can use email in the metadata or for other purposes

  const discountamount = {
    DARTCLUB10: {
      basic: "basic-1-month",
      standard: "standard-1-month",
      premium: "premium-1-month",
    },
    DARTVENUE: {
      basic: "basic-1-month",
      standard: "standard-1-month",
      premium: "premium-1-month",
    },
    FREEAD365: {
      standard: "free-ad-365",
    },
  };

  const promoCodeKey = toUpper(promoCode);
  const couponId = discountamount[promoCodeKey]?.[plan];
  const selectedDiscount = couponId ? [{ coupon: couponId }] : [];

  if (!priceId) {
    return res.status(400).json({ error: "Missing priceId in request body" });
  }

  if (!email) {
    return res.status(400).json({ error: "Missing email in request body" });
  }

  try {
    // 1. Check if the customer exists using userId metadata
    const customers = await stripe.customers.list({
      email: email.trim(),
      limit: 1,
    });

    let customer = customers.data.length ? customers.data[0] : null;

    if (!customer) {
      // If no customer exists, create a new one
      customer = await stripe.customers.create({
        email, // Optional: you can skip or store email as metadata if needed
        // metadata: { userId },  // Attach userId as metadata for future reference
      });
    }

    // 2. Create a PaymentIntent or Checkout Session with the selected plan
    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      mode: "subscription", // Payment mode as subscription
      customer: customer.id, // Associate customer with userId
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      // allow_promotion_codes: false,
      discounts: selectedDiscount,

      // allow_promotion_codes: promoCode ? undefined : true,
      // promoCode
      //     ? [
      //         {
      //             promotion_code: (
      //                 await stripe.promotionCodes.list({ code: promoCode, active: true })
      //             ).data[0]?.id,
      //         },
      //     ]
      //     : [],

      return_url: `${process.env.FRONTEND_URL}/return?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        email: email.trim(),
      },
    });

    res.json({
      clientSecret: session.client_secret,
    });
  } catch (error) {
    console.error("Error creating custom checkout session:", error);
    res.status(500).send(error.message);
  }
});

router.post("/upgrade", async (req, res) => {
  const { subscriptionId, priceId } = req.body;

  if (!subscriptionId || !priceId) {
    return res.status(400).json({
      error: `Missing ${subscriptionId ?? "subscriptionId"} , ${priceId ?? "priceId"}`,
    });
  }

  try {
    // 1. Fetch the current subscription
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    if (!subscription || subscription.status !== "active") {
      return res.status(404).json({ error: "Active subscription not found" });
    }

    const subscriptionItemId = subscription.items.data[0].id;

    // 2. Update the subscription to the new price
    const updatedSubscription = await stripe.subscriptions.update(
      subscription.id,
      {
        items: [
          {
            id: subscriptionItemId,
            price: priceId,
          },
        ],
        proration_behavior: "create_prorations", // Optional: adjusts billing proportionally
      }
    );

    res.json({
      message: "Subscription upgraded successfully",
      subscription: updatedSubscription,
    });
  } catch (err) {
    console.error("Upgrade error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Fetch session status after payment
router.get("/session_status", async (req, res) => {
  const sessionId = req.query.sessionId;
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
router.get("/", authMiddleware, async (req, res) => {
  const userId = req.user.id; // Assuming you use middleware to get logged in user

  try {
    // 1. Get user's subscription ID from DB
    const user = await User.findById(userId); // Or however you fetch user
    const subscriptionId = user.stripeSubscriptionId;

    if (!subscriptionId) {
      return res
        .status(404)
        .json({ error: "No subscription found for this user" });
    }

    // 2. Fetch subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // 3. Parse and return the details
    const currentPlan =
      subscription.items.data[0].price.nickname ||
      subscription.items.data[0].price.id;
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000); // UNIX timestamp → Date
    const cancelAtPeriodEnd = !subscription.cancel_at_period_end;

    return res.json({
      plan: currentPlan,
      currentPeriodEnd,
      cancelAtPeriodEnd,
      status: subscription.status, // valuses will be active, past_due, canceled, incomplete, unpaid
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    if (error.type === "StripeCardError") {
      res.status(400).json({ error: "Your card was declined" });
    } else if (error.type === "StripeInvalidRequestError") {
      res
        .status(400)
        .json({ error: "Invalid parameters passed to Stripe API" });
    } else {
      res
        .status(500)
        .json({ error: "Internal server error. Please try again later." });
    }
  }
});

router.get("/checkout/:sessionId", async (req, res) => {
  const { sessionId } = req.params;
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    res.json(session);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching session details from Stripe" });
  }
});

router.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  stripeWebhookFn
);

// Endpoint for canceling subscription
router.post("/cancel", async (req, res) => {
  const userId = req.user.id; // Ensure req.user is set by authentication middleware

  try {
    // Get user's subscription ID from DB (directly from the User model)
    const user = await User.findById(userId);
    if (!user || !user.stripeSubscriptionId) {
      return res
        .status(404)
        .json({ error: "No subscription found for this user" });
    }

    // Cancel subscription in Stripe (at the end of the current period)
    const subscription = await stripe.subscriptions.update(
      user.stripeSubscriptionId,
      {
        cancel_at_period_end: true, // This cancels the subscription at the end of the billing cycle
      }
    );

    // Optionally, you can cancel immediately by using cancel_at_period_end: false

    // Update user's subscription status in DB (optional)
    user.stripeSubscriptionId = null; // Remove the stripe subscription ID, or you can keep it if needed
    await user.save();

    res.status(200).json({ message: "Subscription canceled successfully" });
  } catch (error) {
    console.error("Error fetching subscription details:", error);
    if (error.type === "StripeInvalidRequestError") {
      res.status(400).json({ error: "Invalid request to Stripe API" });
    } else if (error.type === "StripeAPIError") {
      res.status(500).json({ error: "Stripe API error occurred" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

export default router;
