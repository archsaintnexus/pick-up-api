import type { Request, Response, NextFunction } from "express";
import Shipment from "../models/shipmentModel.js";

export const createTestShipment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const shipment = await Shipment.create({
      shipmentCode: "PU-1001",
      user: "67cc41d2a9f1d2c3b4e5f678",
      assignedDriver: null,
      status: "PENDING",
      pickupAddress: "12 Allen Avenue, Ikeja",
      dropoffAddress: "45 Admiralty Way, Lekki",
      packageType: "Documents",
      weight: 2,
      price: 5000,
      currency: "NGN",
    });

    res.status(201).json({
      status: "success",
      data: {
        shipment,
      },
    });
  } catch (error) {
    next(error);
  }
};