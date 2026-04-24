import type { NextFunction, Request, Response } from "express";
import {
  initiatePayment,
  updatePaymentStatus,
  uploadPaymentReceipt,
  handleStripeWebhook,
} from "../services/paymentService.js";
import ErrorClass from "../utils/ErrorClass.js";

export const initiatePaymentHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { shipmentId } = req.params;
    const { method } = req.body;
    const { payment, clientSecret } = await initiatePayment(shipmentId!, method);

    res.status(201).json({
      status: "success",
      data: {
        payment,
        // clientSecret is returned for card payments only.
        // The frontend passes this to Stripe.js to confirm the payment.
        // It is null for bank_transfer payments.
        clientSecret,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updatePaymentStatusHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { paymentId } = req.params;
    const { status } = req.body;
    const payment = await updatePaymentStatus(paymentId!, status);
    res.status(200).json({ status: "success", data: { payment } });
  } catch (error) {
    next(error);
  }
};

export const uploadReceiptHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { paymentId } = req.params;
    const { receiptUrl } = req.body;
    const payment = await uploadPaymentReceipt(paymentId!, receiptUrl);
    res.status(200).json({ status: "success", data: { payment } });
  } catch (error) {
    next(error);
  }
};

// Stripe calls this endpoint automatically when a payment succeeds or fails.
// It must NOT use the protector middleware — Stripe has no JWT token.
// It also must receive the RAW request body (not JSON-parsed) for
// signature verification. This is handled in app.ts via express.raw().
export const stripeWebhookHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const signature = req.headers["stripe-signature"] as string | undefined;
    if (!signature) {
      return next(new ErrorClass("Missing stripe-signature header", 400));
    }

    const result = await handleStripeWebhook(req.body as Buffer, signature);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
