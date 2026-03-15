export const SHIPMENT_STATUSES = [
  "PENDING",
  "ASSIGNED",
  "PICKED_UP",
  "IN_TRANSIT",
  "DELIVERED",
  "CANCELLED",
] as const;

export type ShipmentStatus = typeof SHIPMENT_STATUSES[number];

export const STATUS_MESSAGES: Record<string, string> = {
  ASSIGNED:   "A driver has been assigned to your shipment",
  PICKED_UP:  "Your shipment has been picked up",
  IN_TRANSIT: "Your shipment is on the way",
  CANCELLED:  "Your shipment has been cancelled",
};