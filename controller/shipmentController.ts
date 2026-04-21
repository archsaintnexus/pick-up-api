import type { NextFunction, Request, Response } from "express";
import Shipment from "../models/shipmentModel.js";
import ErrorClass from "../utils/ErrorClass.js";
import { createShipmentInvoice } from "../services/invoiceService.js";
import { shipmentHistoryQuerySchema } from "../SchemaTypes/shipmentSchema.js";
import {
  createBulkPickup,
  createSinglePickup,
  estimatedShipmentPrice,
  assignDriverToShipment,
  updateShipmentStatus,
  getShipmentStats,
} from "../services/shipmentService.js";
import { createRating } from "../services/ratingService.js";
import { createAuditLog } from "../services/auditService.js";
import eventBus from "../events/eventBus.js";

type PopulatedUser = {
  _id: string;
  email: string;
  fullName?: string;
};

export const estimatePickupPrice = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { weight, packageType } = req.body;
    const estimatesPrice = estimatedShipmentPrice(weight, packageType);
    res.status(200).json({
      status: "success",
      data: {
        estimatesPrice,
        currency: "NGN",
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createPickup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const shipment = await createSinglePickup({
      ...req.body,
      user: req.user!.id,
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

export const createBulkPickups = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { pickups } = req.body;
    if (!pickups || !Array.isArray(pickups) || pickups.length === 0) {
      throw new ErrorClass("Pickups array is required", 400);
    }
    const { shipments, totalPrice } = await createBulkPickup({ user: req.user!.id, pickups });

    res
      .status(201)
      .json({ status: "success", data: { shipments, totalPrice } });
  } catch (error) {
    next(error);
  }
};

export const getShipmentHistory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { error, value } = shipmentHistoryQuerySchema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const message = error.details.map((el) => el.message).join(", ");
      return next(new ErrorClass(message, 400));
    }

    const { status, from, to, page, limit } = value;
    const { userId } = req.params;

    const queryObj: Record<string, unknown> = { user: userId };

    if (status) {
      queryObj.status = status;
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

export const cancelShipment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const shipmentId = req.params.shipmentId!;
    const { reason } = req.body;

    const shipment = await Shipment.findById(shipmentId).populate(
      "user",
      "email fullName"
    );

    if (!shipment) {
      return next(new ErrorClass("Shipment not found", 404));
    }

    if (!["PENDING", "ASSIGNED"].includes(shipment.status)) {
      return next(
        new ErrorClass("Shipment cannot be cancelled at this stage", 400),
      );
    }

    const populatedUser = shipment.user as unknown as PopulatedUser;

    if (!populatedUser?.email) {
      return next(new ErrorClass("Shipment user email not found", 400));
    }

    shipment.status = "CANCELLED";
    shipment.cancelReason = reason;
    shipment.cancelledAt = new Date();

    await shipment.save();

    eventBus.emit("shipment.cancelled", {
      shipmentId: String(shipment._id),
      shipmentCode: shipment.shipmentCode,
      userId: String(populatedUser._id),
      email: populatedUser.email,
      reason,
    });

    res.status(200).json({
      status: "success",
      message: "Shipment cancelled successfully",
      data: {
        shipment,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const generateInvoice = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const shipmentId = req.params.shipmentId!;

    if (!shipmentId) {
      return next(new ErrorClass("Shipment ID is required", 400));
    }

    const shipment = await Shipment.findById(shipmentId).populate(
      "user",
      "email fullName"
    );

    if (!shipment) {
      return next(new ErrorClass("Shipment not found", 404));
    }

    const populatedUser = shipment.user as unknown as PopulatedUser;

    if (!populatedUser?.email) {
      return next(new ErrorClass("Shipment user email not found", 400));
    }

    const invoice = await createShipmentInvoice(shipmentId);

    eventBus.emit("invoice.generated", {
      shipmentId: String(shipment._id),
      invoiceId: String(invoice._id),
      invoiceNumber: invoice.invoiceNumber,
      userId: String(populatedUser._id),
      email: populatedUser.email,
    });

    res.status(200).json({
      status: "success",
      data: {
        invoice,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const assignDriver = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const shipmentId = req.params.shipmentId!;
    const { driverId } = req.body;

    if (!driverId) {
      return next(new ErrorClass("Driver ID is required", 400));
    }

    const shipment = await assignDriverToShipment(shipmentId, driverId);

    await createAuditLog({
      actorId: req.user?.id ?? null,
      action: "ASSIGN_DRIVER",
      entity: "Shipment",
      entityId: shipment._id.toString(),
      metadata: {
        shipmentCode: shipment.shipmentCode,
        driverId,
      },
    });

    const populatedShipment = await Shipment.findById(shipment._id).populate(
      "user",
      "email fullName"
    );

    if (populatedShipment) {
      const populatedUser = populatedShipment.user as unknown as {
        _id: string;
        email: string;
        fullName?: string;
      };

      eventBus.emit("shipment.status_changed", {
        shipmentId: String(shipment._id),
        shipmentCode: shipment.shipmentCode,
        userId: String(populatedUser._id),
        email: populatedUser.email,
        status: "ASSIGNED",
        driverId,
      });
    }

    res.status(200).json({
      status: "success",
      message: "Driver assigned successfully",
      data: { shipment },
    });
  } catch (error) {
    next(error);
  }
};

export const markPickedUp = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const shipmentId = req.params.shipmentId!;

    const shipment = await updateShipmentStatus(shipmentId, "PICKED_UP");

    await createAuditLog({
      actorId: req.user?.id ?? null,
      action: "MARK_PICKED_UP",
      entity: "Shipment",
      entityId: shipment._id.toString(),
      metadata: {
        shipmentCode: shipment.shipmentCode,
      },
    });

    const populatedShipment = await Shipment.findById(shipment._id).populate(
      "user",
      "email fullName"
    );

    if (populatedShipment) {
      const populatedUser = populatedShipment.user as unknown as {
        _id: string;
        email: string;
        fullName?: string;
      };

      eventBus.emit("shipment.status_changed", {
        shipmentId: String(shipment._id),
        shipmentCode: shipment.shipmentCode,
        userId: String(populatedUser._id),
        email: populatedUser.email,
        status: "PICKED_UP",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Shipment picked up successfully",
      data: { shipment },
    });
  } catch (error) {
    next(error);
  }
};

export const markInTransit = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const shipmentId = req.params.shipmentId!;

    const shipment = await updateShipmentStatus(shipmentId, "IN_TRANSIT");

    await createAuditLog({
      actorId: req.user?.id ?? null,
      action: "MARK_IN_TRANSIT",
      entity: "Shipment",
      entityId: shipment._id.toString(),
      metadata: {
        shipmentCode: shipment.shipmentCode,
      },
    });

    const populatedShipment = await Shipment.findById(shipment._id).populate(
      "user",
      "email fullName"
    );

    if (populatedShipment) {
      const populatedUser = populatedShipment.user as unknown as {
        _id: string;
        email: string;
        fullName?: string;
      };

      eventBus.emit("shipment.status_changed", {
        shipmentId: String(shipment._id),
        shipmentCode: shipment.shipmentCode,
        userId: String(populatedUser._id),
        email: populatedUser.email,
        status: "IN_TRANSIT",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Shipment is in transit",
      data: { shipment },
    });
  } catch (error) {
    next(error);
  }
};

export const getStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = req.params;
    const stats = await getShipmentStats(userId!);
    res.status(200).json({ status: "success", data: { stats } });
  } catch (error) {
    next(error);
  }
};

export const submitRating = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { shipmentId } = req.params;
    const { rating, comment } = req.body;
    const result = await createRating({
      shipmentId: shipmentId!,
      userId: req.user!.id,
      rating,
      comment,
    });
    res.status(201).json({ status: "success", data: { rating: result } });
  } catch (error) {
    next(error);
  }
};

export const markDelivered = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const shipmentId = req.params.shipmentId!;

    const shipment = await updateShipmentStatus(shipmentId, "DELIVERED");

    await createAuditLog({
      actorId: req.user?.id ?? null,
      action: "MARK_DELIVERED",
      entity: "Shipment",
      entityId: shipment._id.toString(),
      metadata: {
        shipmentCode: shipment.shipmentCode,
      },
    });

    const populatedShipment = await Shipment.findById(shipment._id).populate(
      "user",
      "email fullName"
    );

    if (populatedShipment) {
      const populatedUser = populatedShipment.user as unknown as {
        _id: string;
        email: string;
        fullName?: string;
      };

      eventBus.emit("shipment.status_changed", {
        shipmentId: String(shipment._id),
        shipmentCode: shipment.shipmentCode,
        userId: String(populatedUser._id),
        email: populatedUser.email,
        status: "DELIVERED",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Shipment delivered successfully",
      data: { shipment },
    });
  } catch (error) {
    next(error);
  }
};
