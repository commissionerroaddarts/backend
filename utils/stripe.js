import Stripe from "stripe";
const isProduction = process.env.NODE_ENV === "production";
const stripe = Stripe(
  isProduction
    ? process.env.STRIPE_SECRET_KEY
    : process.env.STRIPE_SECRET_TEST_KEY
);

export const getStripeSubscriptionIdByEmail = async (email) => {
  try {
    const customers = await stripe.customers.list({
      email: email.trim(),
      limit: 1,
    });

    if (customers.data.length === 0) return null;

    const customerId = customers.data[0].id;

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 1,
    });

    if (subscriptions.data.length === 0) return null;

    return subscriptions.data[0].id;
  } catch (error) {
    console.error("Error in getStripeSubscriptionIdByEmail:", error.message);
    return null;
  }
};
