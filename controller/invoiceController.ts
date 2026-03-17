import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import eventBus from "../events/eventBus.js";
import { ensureShipmentInvoice, generateInvoicePdfBuffer } from "../services/invoiceService.js";
import ErrorClass from "../utils/ErrorClass.js";

type InvoiceEventUser = {
  _id?: string;
  email?: string;
};

const emitInvoiceGeneratedIfCreated = ({
  created,
  shipmentId,
  invoiceId,
  invoiceNumber,
  user,
}: {
  created: boolean;
  shipmentId: string;
  invoiceId: string;
  invoiceNumber: string;
  user: InvoiceEventUser | null;
}) => {
  if (!created || !user?._id || !user.email) {
    return;
  }

  eventBus.emit("invoice.generated", {
    shipmentId,
    invoiceId,
    invoiceNumber,
    userId: String(user._id),
    email: user.email,
  });
};

const validateShipmentId = (shipmentId: string | undefined) => {
  if (!shipmentId) {
    throw new ErrorClass("Shipment ID is required", 400);
  }

  if (!mongoose.isValidObjectId(shipmentId)) {
    throw new ErrorClass("Invalid shipment ID", 400);
  }

  return shipmentId;
};

export const createInvoice = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const shipmentId = validateShipmentId(req.params.shipmentId);

    const result = await ensureShipmentInvoice(shipmentId);

    emitInvoiceGeneratedIfCreated({
      created: result.created,
      shipmentId: String(result.shipment._id),
      invoiceId: String(result.invoice._id),
      invoiceNumber: result.invoice.invoiceNumber,
      user: result.user,
    });

    res.status(result.created ? 201 : 200).json({
      status: "success",
      message: result.created
        ? "Invoice created successfully"
        : "Invoice already exists",
      data: {
        invoice: result.invoice,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const downloadInvoice = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const shipmentId = validateShipmentId(req.params.shipmentId);

    const result = await ensureShipmentInvoice(shipmentId);
    const pdfBuffer = await generateInvoicePdfBuffer(result);

    emitInvoiceGeneratedIfCreated({
      created: result.created,
      shipmentId: String(result.shipment._id),
      invoiceId: String(result.invoice._id),
      invoiceNumber: result.invoice.invoiceNumber,
      user: result.user,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="invoice-${result.invoice.invoiceNumber}.pdf"`
    );
    res.setHeader("Content-Length", pdfBuffer.length.toString());

    res.status(200).send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};
