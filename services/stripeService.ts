import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-04-22.dahlia",
});

export default stripe;

export const createPaymentIntent = async (
  amount: number,
  currency: string,
  metadata: Record<string, string>,
) => {
  return stripe.paymentIntents.create({
    // Stripe amounts are in the smallest currency unit.
    // NGN uses kobo (100 kobo = ₦1), so ₦5000 = 500000 kobo.
    amount: amount * 100,
    currency: currency.toLowerCase(),
    metadata,
    automatic_payment_methods: { enabled: true },
  });
};
