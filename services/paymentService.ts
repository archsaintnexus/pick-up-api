import { v4 as uuidv4 } from "uuid";
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

  const payment = await Payment.create({
    shipment: shipmentId,
    method,
    amount: shipment.price,
    currency: shipment.currency,
    reference: uuidv4(),
  });

  return payment;
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
