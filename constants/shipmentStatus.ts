export const SHIPMENT_STATUSES = [
  "PENDING",
  "ASSIGNED",
  "PICKED_UP",
  "IN_TRANSIT",
  "DELIVERED",
  "CANCELLED",
] as const;

export type ShipmentStatus = typeof SHIPMENT_STATUSES[number];