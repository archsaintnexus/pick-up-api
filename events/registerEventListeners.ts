import eventBus from "./eventBus.js";
import type {
  ShipmentCancelledEventPayload,
  InvoiceGeneratedEventPayload,
} from "./shipmentEvents.js";
import { createAuditLog } from "../services/auditService.js";
import {
  notifyShipmentCancelled,
  notifyInvoiceGenerated,
} from "../services/notificationService.js";

export const registerEventListeners = () => {
  eventBus.on(
    "shipment.cancelled",
    async (payload: ShipmentCancelledEventPayload) => {
      try {
        await createAuditLog({
          actorId: null,
          action: "CANCEL_SHIPMENT",
          entity: "Shipment",
          entityId: payload.shipmentId,
          metadata: {
            shipmentCode: payload.shipmentCode,
            reason: payload.reason,
          },
        });

        await notifyShipmentCancelled({
          userId: payload.userId,
          shipmentCode: payload.shipmentCode,
          email: payload.email,
        });
      } catch (error) {
        console.error("shipment.cancelled listener failed:", error);
      }
    }
  );

  eventBus.on(
    "invoice.generated",
    async (payload: InvoiceGeneratedEventPayload) => {
      try {
        await createAuditLog({
          actorId: null,
          action: "GENERATE_INVOICE",
          entity: "Invoice",
          entityId: payload.invoiceId,
          metadata: {
            shipmentId: payload.shipmentId,
            invoiceNumber: payload.invoiceNumber,
          },
        });

        await notifyInvoiceGenerated({
          userId: payload.userId,
          email: payload.email,
          invoiceNumber: payload.invoiceNumber,
        });
      } catch (error) {
        console.error("invoice.generated listener failed:", error);
      }
    }
  );
};