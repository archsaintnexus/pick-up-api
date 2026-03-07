import type { Request, Response, NextFunction } from "express";
import Shipment from "../models/shipmentModel.js";

export const getAllTestShipments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const shipments = await Shipment.find().sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      results: shipments.length,
      data: {
        shipments,
      },
    });
  } catch (error) {
    next(error);
  }
};