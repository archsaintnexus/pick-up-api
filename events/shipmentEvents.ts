export type ShipmentCancelledEventPayload = {
  shipmentId: string;
  shipmentCode: string;
  userId: string;
  email: string;
  reason: string;
};

export type InvoiceGeneratedEventPayload = {
  shipmentId: string;
  invoiceId: string;
  invoiceNumber: string;
  userId: string;
  email: string;
};