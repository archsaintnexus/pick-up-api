import type { NextFunction, Request, Response } from "express";
import {
  initiatePayment,
  updatePaymentStatus,
  uploadPaymentReceipt,
} from "../services/paymentService.js";

export const initiatePaymentHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { shipmentId } = req.params;
    const { method } = req.body;
    const payment = await initiatePayment(shipmentId!, method);
    res.status(201).json({ status: "success", data: { payment } });
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
