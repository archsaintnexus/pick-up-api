import fs from "node:fs";
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

type CustomerSnapshot = {
  fullName: string;
  email: string;
  companyName: string | null;
  companyAddress: string | null;
};

type ShipmentSnapshot = {
  shipmentCode: string;
  pickupAddress: string;
  dropoffAddress: string;
  packageType: string;
  weight: number;
};

type InvoiceDocument = {
  _id: { toString(): string };
  invoiceNumber: string;
  amount: number;
  currency: string;
  issuedAt: Date;
  status: string;
  customerSnapshot?: CustomerSnapshot;
  shipmentSnapshot?: ShipmentSnapshot;
  save: () => Promise<unknown>;
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

const resolvePdfFonts = () => {
  const regularCandidates = [
    process.env.INVOICE_PDF_FONT_PATH,
    "C:\\Windows\\Fonts\\arial.ttf",
    "C:\\Windows\\Fonts\\calibri.ttf",
    "C:\\Windows\\Fonts\\segoeui.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf",
    "/System/Library/Fonts/Supplemental/Arial.ttf",
  ].filter((value): value is string => Boolean(value));

  const boldCandidates = [
    process.env.INVOICE_PDF_FONT_BOLD_PATH,
    "C:\\Windows\\Fonts\\arialbd.ttf",
    "C:\\Windows\\Fonts\\calibrib.ttf",
    "C:\\Windows\\Fonts\\segoeuib.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf",
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
  ].filter((value): value is string => Boolean(value));

  const regular =
    regularCandidates.find((fontPath) => fs.existsSync(fontPath)) ?? null;
  const bold =
    boldCandidates.find((fontPath) => fs.existsSync(fontPath)) ?? regular;

  return { regular, bold };
};

const formatCurrency = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
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
  const fallbackSnapshots = buildInvoiceSnapshots(shipment, user);
  const customerSnapshot =
    invoice.customerSnapshot ?? fallbackSnapshots.customerSnapshot;
  const shipmentSnapshot =
    invoice.shipmentSnapshot ?? fallbackSnapshots.shipmentSnapshot;

  return {
    invoiceNumber: invoice.invoiceNumber,
    issuedAt: invoice.issuedAt,
    status: invoice.status,
    amount: invoice.amount,
    currency: invoice.currency,
    shipmentCode: shipmentSnapshot.shipmentCode,
    pickupAddress: shipmentSnapshot.pickupAddress,
    dropoffAddress: shipmentSnapshot.dropoffAddress,
    packageType: shipmentSnapshot.packageType,
    weight: shipmentSnapshot.weight,
    customerName: customerSnapshot.fullName,
    customerEmail: customerSnapshot.email,
    companyName: customerSnapshot.companyName,
    companyAddress: customerSnapshot.companyAddress,
  };
};

const buildInvoiceSnapshots = (
  shipment: ShipmentDocument,
  user: PopulatedShipmentUser | null,
) => {
  const customerSnapshot: CustomerSnapshot = {
    fullName: user?.fullName ?? user?.companyName ?? "Customer",
    email: user?.email ?? "not-available@pickup-logistics.local",
    companyName: user?.companyName ?? null,
    companyAddress: user?.companyAddress ?? null,
  };

  const shipmentSnapshot: ShipmentSnapshot = {
    shipmentCode: shipment.shipmentCode,
    pickupAddress: shipment.pickupAddress,
    dropoffAddress: shipment.dropoffAddress,
    packageType: shipment.packageType,
    weight: shipment.weight,
  };

  return {
    customerSnapshot,
    shipmentSnapshot,
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

const ensureInvoiceSnapshots = async ({
  invoice,
  shipment,
  user,
}: {
  invoice: InvoiceDocument;
  shipment: ShipmentDocument;
  user: PopulatedShipmentUser | null;
}) => {
  if (invoice.customerSnapshot && invoice.shipmentSnapshot) {
    return;
  }

  const { customerSnapshot, shipmentSnapshot } = buildInvoiceSnapshots(
    shipment,
    user,
  );

  invoice.customerSnapshot = customerSnapshot;
  invoice.shipmentSnapshot = shipmentSnapshot;
  await invoice.save();
};

export const ensureShipmentInvoice = async (
  shipmentId: string,
): Promise<EnsureShipmentInvoiceResult> => {
  const shipmentDoc = await Shipment.findById(shipmentId).populate(
    "user",
    "fullName email companyName companyAddress",
  );
  const shipment = shipmentDoc as ShipmentDocument | null;

  if (!shipment) {
    throw new ErrorClass("Shipment not found", 404);
  }

  const user = shipment.user as unknown as PopulatedShipmentUser | null;
  const existingInvoiceDoc = await Invoice.findOne({ shipment: shipment._id });
  const existingInvoice = existingInvoiceDoc as InvoiceDocument | null;

  if (existingInvoice) {
    await ensureInvoiceSnapshots({
      invoice: existingInvoice,
      shipment,
      user,
    });

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
    ...buildInvoiceSnapshots(shipment, user),
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
  source: InvoicePdfSource,
): Promise<Buffer> => {
  const pdfData = "pdfData" in source ? source.pdfData : source;

  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 0,
      info: {
        Title: `Invoice ${pdfData.invoiceNumber}`,
        Author: "PickUp Logistics",
      },
    });
    const fonts = resolvePdfFonts();
    const chunks: Buffer[] = [];
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margin = 44;
    const contentWidth = pageWidth - margin * 2;
    const regularFont = fonts.regular ? "InvoiceRegular" : "Helvetica";
    const boldFont = fonts.bold ? "InvoiceBold" : "Helvetica-Bold";
    const palette = {
      ink: "#0F172A",
      primary: "#14324A",
      accent: "#E58E0B",
      accentSoft: "#FFF3DD",
      line: "#D7DEE8",
      muted: "#667085",
      paper: "#F8FAFC",
      white: "#FFFFFF",
    };
    const amountDue = formatCurrency(pdfData.amount, pdfData.currency);

    doc.on("data", (chunk: Buffer) => {
      chunks.push(Buffer.from(chunk));
    });

    doc.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    doc.on("error", reject);

    if (fonts.regular) {
      doc.registerFont("InvoiceRegular", fonts.regular);
    }

    if (fonts.bold) {
      doc.registerFont("InvoiceBold", fonts.bold);
    }

    const drawCard = ({
      x,
      y,
      width,
      height,
      fill,
      stroke,
      radius = 18,
    }: {
      x: number;
      y: number;
      width: number;
      height: number;
      fill: string;
      stroke: string;
      radius?: number;
    }) => {
      doc.save();
      doc.lineWidth(1);
      doc.roundedRect(x, y, width, height, radius);
      doc.fillAndStroke(fill, stroke);
      doc.restore();
    };

    const drawField = ({
      x,
      y,
      label,
      value,
      width,
    }: {
      x: number;
      y: number;
      label: string;
      value: string;
      width: number;
    }) => {
      doc
        .font(regularFont)
        .fontSize(9)
        .fillColor(palette.muted)
        .text(label, x, y, { width });

      doc
        .font(boldFont)
        .fontSize(11)
        .fillColor(palette.ink)
        .text(value, x, y + 14, { width });
    };

    doc.save();
    doc.rect(0, 0, pageWidth, 148).fill(palette.primary);
    doc.rect(0, 148, pageWidth, 8).fill(palette.accent);
    doc.restore();

    doc
      .font(boldFont)
      .fontSize(28)
      .fillColor(palette.white)
      .text("PickUp Logistics", margin, 42, { width: 250 });

    doc
      .font(regularFont)
      .fontSize(11)
      .fillColor("#D8E1EA")
      .text("Shipment invoice and billing summary", margin, 78, {
        width: 250,
      });

    doc
      .font(boldFont)
      .fontSize(26)
      .fillColor(palette.white)
      .text("INVOICE", pageWidth - margin - 180, 40, {
        width: 180,
        align: "right",
      });

    doc
      .font(regularFont)
      .fontSize(10)
      .fillColor("#D8E1EA")
      .text(
        `Invoice Number: ${pdfData.invoiceNumber}`,
        pageWidth - margin - 220,
        78,
        {
          width: 220,
          align: "right",
        },
      )
      .text(
        `Issued At: ${formatDate(pdfData.issuedAt)}`,
        pageWidth - margin - 220,
        94,
        {
          width: 220,
          align: "right",
        },
      );

    drawCard({
      x: pageWidth - margin - 96,
      y: 114,
      width: 96,
      height: 24,
      fill: palette.accent,
      stroke: palette.accent,
      radius: 12,
    });

    doc
      .font(boldFont)
      .fontSize(10)
      .fillColor(palette.primary)
      .text(pdfData.status.toUpperCase(), pageWidth - margin - 96, 121, {
        width: 96,
        align: "center",
      });

    drawCard({
      x: margin,
      y: 192,
      width: contentWidth,
      height: 92,
      fill: palette.accentSoft,
      stroke: "#F3C987",
    });

    doc
      .font(regularFont)
      .fontSize(10)
      .fillColor(palette.muted)
      .text("Amount Due", margin + 22, 204);

    doc
      .font(boldFont)
      .fontSize(28)
      .fillColor(palette.primary)
      .text(amountDue, margin + 22, 220, { width: 220 });

    doc
      .font(regularFont)
      .fontSize(10)
      .fillColor(palette.muted)
      .text("Shipment Code", pageWidth - margin - 170, 204, {
        width: 148,
        align: "right",
      });

    doc
      .font(boldFont)
      .fontSize(14)
      .fillColor(palette.ink)
      .text(pdfData.shipmentCode, pageWidth - margin - 170, 220, {
        width: 148,
        align: "right",
      });

    doc
      .font(regularFont)
      .fontSize(10)
      .fillColor(palette.muted)
      .text("Currency", pageWidth - margin - 170, 244, {
        width: 148,
        align: "right",
      });

    doc
      .font(boldFont)
      .fontSize(12)
      .fillColor(palette.ink)
      .text(pdfData.currency, pageWidth - margin - 170, 258, {
        width: 148,
        align: "right",
      });

    const cardTop = 296;
    const cardGap = 18;
    const cardWidth = (contentWidth - cardGap) / 2;
    const cardHeight = 152;

    drawCard({
      x: margin,
      y: cardTop,
      width: cardWidth,
      height: cardHeight,
      fill: palette.white,
      stroke: palette.line,
    });

    drawCard({
      x: margin + cardWidth + cardGap,
      y: cardTop,
      width: cardWidth,
      height: cardHeight,
      fill: palette.paper,
      stroke: palette.line,
    });

    doc
      .font(boldFont)
      .fontSize(13)
      .fillColor(palette.primary)
      .text("Bill To", margin + 20, cardTop + 18);

    const billToFields = [
      { label: "Name", value: pdfData.customerName },
      { label: "Email", value: pdfData.customerEmail },
      { label: "Company", value: pdfData.companyName },
      { label: "Address", value: pdfData.companyAddress },
    ].filter((field): field is { label: string; value: string } =>
      Boolean(field.value),
    );

    let lineY = cardTop + 52;
    for (const field of billToFields) {
      doc
        .font(regularFont)
        .fontSize(9)
        .fillColor(palette.muted)
        .text(`${field.label}:`, margin + 20, lineY, {
          width: 70,
        });

      doc
        .font(regularFont)
        .fontSize(11)
        .fillColor(palette.ink)
        .text(field.value, margin + 92, lineY - 1, {
          width: cardWidth - 112,
        });

      lineY += 18;
    }

    doc
      .font(boldFont)
      .fontSize(13)
      .fillColor(palette.primary)
      .text(
        "Shipment Summary",
        margin + cardWidth + cardGap + 20,
        cardTop + 18,
      );

    const summaryX = margin + cardWidth + cardGap + 20;
    drawField({
      x: summaryX,
      y: cardTop + 45,
      label: "Shipment Code",
      value: pdfData.shipmentCode,
      width: cardWidth - 40,
    });
    drawField({
      x: summaryX,
      y: cardTop + 80,
      label: "Package Type",
      value: pdfData.packageType,
      width: cardWidth - 40,
    });
    drawField({
      x: summaryX,
      y: cardTop + 115,
      label: "Weight",
      value: `${pdfData.weight} kg`,
      width: cardWidth - 40,
    });

    const routeTop = 468;
    drawCard({
      x: margin,
      y: routeTop,
      width: contentWidth,
      height: 118,
      fill: palette.white,
      stroke: palette.line,
    });

    doc
      .font(boldFont)
      .fontSize(13)
      .fillColor(palette.primary)
      .text("Route", margin + 20, routeTop + 18);

    doc
      .font(regularFont)
      .fontSize(9)
      .fillColor(palette.muted)
      .text("Pickup", margin + 20, routeTop + 52);

    doc
      .font(regularFont)
      .fontSize(11)
      .fillColor(palette.ink)
      .text(pdfData.pickupAddress, margin + 20, routeTop + 68, {
        width: 170,
      });

    doc
      .font(regularFont)
      .fontSize(9)
      .fillColor(palette.muted)
      .text("Dropoff", pageWidth - margin - 190, routeTop + 52, {
        width: 170,
        align: "right",
      });

    doc
      .font(regularFont)
      .fontSize(11)
      .fillColor(palette.ink)
      .text(pdfData.dropoffAddress, pageWidth - margin - 190, routeTop + 68, {
        width: 170,
        align: "right",
      });

    doc.save();
    doc.lineWidth(2).strokeColor(palette.accent);
    doc
      .moveTo(margin + 208, routeTop + 78)
      .lineTo(pageWidth - margin - 208, routeTop + 78)
      .stroke();
    doc.circle(margin + 208, routeTop + 78, 4).fill(palette.accent);
    doc.circle(pageWidth - margin - 208, routeTop + 78, 4).fill(palette.accent);
    doc.restore();

    doc
      .font(boldFont)
      .fontSize(22)
      .fillColor(palette.accent)
      .text("→", pageWidth / 2 - 20, routeTop + 64);

    const billingTop = 604;
    drawCard({
      x: margin,
      y: billingTop,
      width: contentWidth,
      height: 146,
      fill: palette.paper,
      stroke: palette.line,
    });

    doc
      .font(boldFont)
      .fontSize(13)
      .fillColor(palette.primary)
      .text("Billing Summary", margin + 20, billingTop + 18);

    doc
      .font(regularFont)
      .fontSize(9)
      .fillColor(palette.muted)
      .text("Description", margin + 20, billingTop + 52)
      .text("Qty", margin + 265, billingTop + 52, {
        width: 40,
        align: "center",
      })
      .text("Amount", pageWidth - margin - 120, billingTop + 52, {
        width: 100,
        align: "right",
      });

    doc.save();
    doc.lineWidth(1).strokeColor(palette.line);
    doc
      .moveTo(margin + 20, billingTop + 70)
      .lineTo(pageWidth - margin - 20, billingTop + 70)
      .stroke();
    doc.restore();

    doc
      .font(regularFont)
      .fontSize(11)
      .fillColor(palette.ink)
      .text("Pickup logistics service", margin + 20, billingTop + 86, {
        width: 210,
      })
      .text("1", margin + 265, billingTop + 86, { width: 40, align: "center" })
      .text(amountDue, pageWidth - margin - 120, billingTop + 86, {
        width: 100,
        align: "right",
      });

    drawCard({
      x: pageWidth - margin - 180,
      y: billingTop + 110,
      width: 170,
      height: 26,
      fill: palette.primary,
      stroke: palette.primary,
      radius: 12,
    });

    doc
      .font(regularFont)
      .fontSize(9)
      .fillColor("#C7D4E0")
      .text("Total Due", pageWidth - margin - 167, billingTop + 117, {
        width: 60,
      });

    doc
      .font(boldFont)
      .fontSize(14)
      .fillColor(palette.white)
      .text(amountDue, pageWidth - margin - 110, billingTop + 114, {
        width: 90,
        align: "right",
      });

    doc
      .font(regularFont)
      .fontSize(9)
      .fillColor(palette.muted)
      .text(
        "This invoice was generated automatically by PickUp Logistics and is valid without a signature.",
        margin,
        pageHeight - 60,
        {
          width: contentWidth,
          align: "center",
        },
      );

    doc.end();
  });
};
