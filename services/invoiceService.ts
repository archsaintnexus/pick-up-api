import Invoice from "../models/invoiceModel.js";
import Shipment from "../models/shipmentModel.js";
import ErrorClass from "../utils/ErrorClass.js";

export const generateInvoiceNumber = () => {
  return `INV-${Date.now()}`;
};

export const createShipmentInvoice = async (shipmentId: string) => {
  const shipment = await Shipment.findById(shipmentId);

  if (!shipment) {
    throw new ErrorClass("Shipment not found", 404);
  }

  const existingInvoice = await Invoice.findOne({ shipment: shipment._id });
  if (existingInvoice) {
    return existingInvoice;
  }

  const invoice = await Invoice.create({
    shipment: shipment._id,
    invoiceNumber: generateInvoiceNumber(),
    amount: shipment.price,
    currency: shipment.currency,
  });

  shipment.invoiceGenerated = true;
  shipment.invoiceNumber = invoice.invoiceNumber;
  await shipment.save();

  return invoice;
};