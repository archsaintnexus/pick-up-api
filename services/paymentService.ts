import { v4 as uuidv4 } from "uuid";
import type Stripe from "stripe";
import stripe, { createPaymentIntent } from "./stripeService.js";
import Payment from "../models/paymentModel.js";
import Shipment from "../models/shipmentModel.js";
import ErrorClass from "../utils/ErrorClass.js";

export const initiatePayment = async (
  shipmentId: string,
  method: "card" | "bank_transfer",
) => {
  const shipment = await Shipment.findById(shipmentId);
  if (!shipment) {
    throw new ErrorClass("Shipment not found", 404);
  }

  const existing = await Payment.findOne({ shipment: shipmentId });
  if (existing) {
    throw new ErrorClass("Payment already exists for this shipment", 409);
  }

  if (method === "card") {
    // Create a Stripe PaymentIntent. The frontend uses the clientSecret
    // to render Stripe's payment UI and confirm the payment — card details
    // never reach our server.
    const intent = await createPaymentIntent(shipment.price, shipment.currency, {
      shipmentId: shipmentId,
      shipmentCode: shipment.shipmentCode,
    });

    const payment = await Payment.create({
      shipment: shipmentId,
      method,
      amount: shipment.price,
      currency: shipment.currency,
      stripePaymentIntentId: intent.id,
      reference: intent.id,
    });

    return { payment, clientSecret: intent.client_secret };
  }

  // bank_transfer: manual flow — user pays via bank then uploads receipt.
  // Stripe does not support NGN bank transfers natively.
  const payment = await Payment.create({
    shipment: shipmentId,
    method,
    amount: shipment.price,
    currency: shipment.currency,
    reference: uuidv4(),
  });

  return { payment, clientSecret: null };
};

export const updatePaymentStatus = async (
  paymentId: string,
  status: "success" | "failed",
) => {
  const payment = await Payment.findById(paymentId);
  if (!payment) {
    throw new ErrorClass("Payment not found", 404);
  }

  if (payment.status !== "pending") {
    throw new ErrorClass("Only pending payments can be updated", 400);
  }

  payment.status = status;
  if (status === "success") {
    payment.paidAt = new Date();
  }
  await payment.save();

  return payment;
};

export const uploadPaymentReceipt = async (
  paymentId: string,
  receiptUrl: string,
) => {
  const payment = await Payment.findById(paymentId);
  if (!payment) {
    throw new ErrorClass("Payment not found", 404);
  }

  if (payment.method !== "bank_transfer") {
    throw new ErrorClass(
      "Receipt upload is only allowed for bank transfer payments",
      400,
    );
  }

  payment.receiptUrl = receiptUrl;
  await payment.save();

  return payment;
};

// Called by the webhook controller. Stripe sends this POST automatically
// when a payment succeeds or fails — we use it as the source of truth
// for payment outcomes (never trust the frontend to report success).
export const handleStripeWebhook = async (
  rawBody: Buffer,
  signature: string,
) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new ErrorClass("Stripe webhook secret is not configured", 500);
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    throw new ErrorClass("Webhook signature verification failed", 400);
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const intent = event.data.object as Stripe.PaymentIntent;
      await Payment.findOneAndUpdate(
        { stripePaymentIntentId: intent.id },
        { status: "success", paidAt: new Date() },
      );
      break;
    }
    case "payment_intent.payment_failed": {
      const intent = event.data.object as Stripe.PaymentIntent;
      await Payment.findOneAndUpdate(
        { stripePaymentIntentId: intent.id },
        { status: "failed" },
      );
      break;
    }
    default:
      break;
  }

  return { received: true };
};
