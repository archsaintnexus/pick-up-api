import PDFDocument from "pdfkit";
import Invoice from "../models/invoiceModel.js";
import Shipment from "../models/shipmentModel.js";
import ErrorClass from "../utils/ErrorClass.js";

type PopulatedShipmentUser = {
  _id?: string;
  fullName?: string;
  email?: string;
  companyName?: string | null;
  companyAddress?: string | null;
};

type InvoiceDocument = {
  _id: { toString(): string };
  invoiceNumber: string;
  amount: number;
  currency: string;
  issuedAt: Date;
  status: string;
};

type ShipmentDocument = {
  _id: { toString(): string };
  shipmentCode: string;
  pickupAddress: string;
  dropoffAddress: string;
  packageType: string;
  weight: number;
  price: number;
  currency: string;
  invoiceGenerated: boolean;
  invoiceNumber: string | null;
  user: unknown;
  save: () => Promise<unknown>;
};

export type InvoicePdfData = {
  invoiceNumber: string;
  issuedAt: Date;
  status: string;
  amount: number;
  currency: string;
  shipmentCode: string;
  pickupAddress: string;
  dropoffAddress: string;
  packageType: string;
  weight: number;
  customerName: string;
  customerEmail: string;
  companyName: string | null;
  companyAddress: string | null;
};

export type EnsureShipmentInvoiceResult = {
  invoice: InvoiceDocument;
  shipment: ShipmentDocument;
  user: PopulatedShipmentUser | null;
  created: boolean;
  pdfData: InvoicePdfData;
};

type InvoicePdfSource = EnsureShipmentInvoiceResult | InvoicePdfData;

export const generateInvoiceNumber = (shipmentCode: string) => {
  return `INV-${shipmentCode}`;
};

const formatCurrency = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const buildInvoicePdfData = ({
  invoice,
  shipment,
  user,
}: {
  invoice: InvoiceDocument;
  shipment: ShipmentDocument;
  user: PopulatedShipmentUser | null;
}): InvoicePdfData => {
  return {
    invoiceNumber: invoice.invoiceNumber,
    issuedAt: invoice.issuedAt,
    status: invoice.status,
    amount: invoice.amount,
    currency: invoice.currency,
    shipmentCode: shipment.shipmentCode,
    pickupAddress: shipment.pickupAddress,
    dropoffAddress: shipment.dropoffAddress,
    packageType: shipment.packageType,
    weight: shipment.weight,
    customerName: user?.fullName ?? user?.companyName ?? "Customer",
    customerEmail: user?.email ?? "Not available",
    companyName: user?.companyName ?? null,
    companyAddress: user?.companyAddress ?? null,
  };
};

const syncShipmentInvoiceFields = async ({
  shipment,
  invoiceNumber,
}: {
  shipment: ShipmentDocument;
  invoiceNumber: string;
}) => {
  let shouldSave = false;

  if (!shipment.invoiceGenerated) {
    shipment.invoiceGenerated = true;
    shouldSave = true;
  }

  if (shipment.invoiceNumber !== invoiceNumber) {
    shipment.invoiceNumber = invoiceNumber;
    shouldSave = true;
  }

  if (shouldSave) {
    await shipment.save();
  }
};

export const ensureShipmentInvoice = async (
  shipmentId: string
): Promise<EnsureShipmentInvoiceResult> => {
  const shipmentDoc = await Shipment.findById(shipmentId).populate(
    "user",
    "fullName email companyName companyAddress"
  );
  const shipment = shipmentDoc as ShipmentDocument | null;

  if (!shipment) {
    throw new ErrorClass("Shipment not found", 404);
  }

  const user = shipment.user as unknown as PopulatedShipmentUser | null;
  const existingInvoiceDoc = await Invoice.findOne({ shipment: shipment._id });
  const existingInvoice = existingInvoiceDoc as InvoiceDocument | null;

  if (existingInvoice) {
    await syncShipmentInvoiceFields({
      shipment,
      invoiceNumber: existingInvoice.invoiceNumber,
    });

    return {
      invoice: existingInvoice,
      shipment,
      user,
      created: false,
      pdfData: buildInvoicePdfData({
        invoice: existingInvoice,
        shipment,
        user,
      }),
    };
  }

  const createdInvoice = await Invoice.create({
    shipment: shipment._id,
    invoiceNumber: generateInvoiceNumber(shipment.shipmentCode),
    amount: shipment.price,
    currency: shipment.currency,
  });
  const invoice = createdInvoice as unknown as InvoiceDocument;

  await syncShipmentInvoiceFields({
    shipment,
    invoiceNumber: invoice.invoiceNumber,
  });

  return {
    invoice,
    shipment,
    user,
    created: true,
    pdfData: buildInvoicePdfData({
      invoice,
      shipment,
      user,
    }),
  };
};

export const createShipmentInvoice = async (shipmentId: string) => {
  const { invoice } = await ensureShipmentInvoice(shipmentId);
  return invoice;
};

export const generateInvoicePdfBuffer = async (
  source: InvoicePdfSource
): Promise<Buffer> => {
  const pdfData = "pdfData" in source ? source.pdfData : source;

  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => {
      chunks.push(Buffer.from(chunk));
    });

    doc.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    doc.on("error", reject);

    doc
      .fontSize(22)
      .text("PickUp Logistics", { align: "left" })
      .moveDown(0.3)
      .fontSize(11)
      .fillColor("#444444")
      .text(`Invoice Number: ${pdfData.invoiceNumber}`)
      .text(`Issued At: ${formatDate(pdfData.issuedAt)}`)
      .text(`Status: ${pdfData.status}`)
      .moveDown();

    doc
      .fillColor("#111111")
      .fontSize(14)
      .text("Customer Details")
      .moveDown(0.3)
      .fontSize(11)
      .text(`Name: ${pdfData.customerName}`)
      .text(`Email: ${pdfData.customerEmail}`);

    if (pdfData.companyName) {
      doc.text(`Company: ${pdfData.companyName}`);
    }

    if (pdfData.companyAddress) {
      doc.text(`Company Address: ${pdfData.companyAddress}`);
    }

    doc
      .moveDown()
      .fontSize(14)
      .text("Shipment Details")
      .moveDown(0.3)
      .fontSize(11)
      .text(`Shipment Code: ${pdfData.shipmentCode}`)
      .text(`Pickup Address: ${pdfData.pickupAddress}`)
      .text(`Dropoff Address: ${pdfData.dropoffAddress}`)
      .text(`Package Type: ${pdfData.packageType}`)
      .text(`Weight: ${pdfData.weight} kg`)
      .moveDown();

    doc
      .fontSize(14)
      .text("Billing")
      .moveDown(0.3)
      .fontSize(11)
      .text(`Amount: ${formatCurrency(pdfData.amount, pdfData.currency)}`)
      .text(`Currency: ${pdfData.currency}`);

    doc.end();
  });
};
