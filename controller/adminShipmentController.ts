import type { NextFunction, Request, Response } from "express";
import Shipment from "../models/shipmentModel.js";
import ErrorClass from "../utils/ErrorClass.js";
import { adminShipmentQuerySchema } from "../SchemaTypes/shipmentSchema.js";

export const getAllShipments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { error, value } = adminShipmentQuerySchema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const message = error.details.map((el) => el.message).join(", ");
      return next(new ErrorClass(message, 400));
    }

    const { status, assignedDriver, from, to, page, limit } = value;

    const queryObj: Record<string, unknown> = {};

    if (status) {
      queryObj.status = status;
    }

    if (assignedDriver) {
      queryObj.assignedDriver = assignedDriver;
    }

    if (from || to) {
      queryObj.createdAt = {};
      if (from) {
        (queryObj.createdAt as Record<string, unknown>).$gte = new Date(from);
      }
      if (to) {
        (queryObj.createdAt as Record<string, unknown>).$lte = new Date(to);
      }
    }

    const skip = (page - 1) * limit;

    const shipments = await Shipment.find(queryObj)
      .populate("user", "fullName email role")
      .populate("assignedDriver", "fullName email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Shipment.countDocuments(queryObj);

    res.status(200).json({
      status: "success",
      results: shipments.length,
      data: {
        total,
        page,
        limit,
        shipments,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getSingleShipmentAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { shipmentId } = req.params;

    const shipment = await Shipment.findById(shipmentId)
      .populate("user", "fullName email role")
      .populate("assignedDriver", "fullName email role");

    if (!shipment) {
      return next(new ErrorClass("Shipment not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        shipment,
      },
    });
  } catch (error) {
    next(error);
  }
};