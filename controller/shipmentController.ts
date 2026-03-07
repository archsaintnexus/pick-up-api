import type { NextFunction, Request, Response } from "express";
import Shipment from "../models/shipmentModel.js";
import ErrorClass from "../utils/ErrorClass.js";
import { createAuditLog } from "../services/auditService.js";
import { createShipmentInvoice } from "../services/invoiceService.js";
import {
  sendEmailNotification,
  sendPushNotification,
} from "../services/notificationService.js";
import { shipmentHistoryQuerySchema } from "../SchemaTypes/shipmentSchema.js";

export const getShipmentHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
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
  next: NextFunction
) => {
  try {
    const { shipmentId } = req.params;
    const { reason } = req.body;

    const shipment = await Shipment.findById(shipmentId);

    if (!shipment) {
      return next(new ErrorClass("Shipment not found", 404));
    }

    if (!["PENDING", "ASSIGNED"].includes(shipment.status)) {
      return next(
        new ErrorClass("Shipment cannot be cancelled at this stage", 400)
      );
    }

    shipment.status = "CANCELLED";
    shipment.cancelReason = reason;
    shipment.cancelledAt = new Date();

    await shipment.save();

    await createAuditLog({
      actorId: null,
      action: "CANCEL_SHIPMENT",
      entity: "Shipment",
      entityId: shipment._id.toString(),
      metadata: {
        shipmentCode: shipment.shipmentCode,
        reason,
      },
    });

    await sendEmailNotification({
      subject: "Shipment Cancelled",
      message: `Shipment ${shipment.shipmentCode} has been cancelled.`,
    });

    await sendPushNotification({
      message: `Shipment ${shipment.shipmentCode} has been cancelled.`,
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
  next: NextFunction
) => {
  try {
    const { shipmentId } = req.params;

    if (!shipmentId) {
      return next(new ErrorClass("Shipment ID is required", 400));
    }

    const invoice = await createShipmentInvoice(shipmentId);

    await createAuditLog({
      actorId: null,
      action: "GENERATE_INVOICE",
      entity: "Invoice",
      entityId: invoice._id.toString(),
      metadata: {
        shipmentId,
        invoiceNumber: invoice.invoiceNumber,
      },
    });

    await sendEmailNotification({
      subject: "Invoice Generated",
      message: `Invoice ${invoice.invoiceNumber} has been generated successfully.`,
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