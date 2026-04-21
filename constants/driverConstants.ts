export const VEHICLE_TYPES = [
  "motorcycle",
  "car",
  "van",
  "truck",
] as const;

export type VehicleType = typeof VEHICLE_TYPES[number];
