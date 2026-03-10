import joi from "joi";

const shipmentStatuses = [
  "PENDING",
  "ASSIGNED",
  "PICKED_UP",
  "IN_TRANSIT",
  "DELIVERED",
  "CANCELLED",
];
const pickupPayloadSchema = joi.object({
  pickupAddress: joi.string().trim().min(3).max(200).required(),
  dropoffAddress: joi.string().trim().min(3).max(200).required(),
  packageType: joi.string().trim().min(2).max(80).required(),
  weight: joi.number().positive().max(1000).required(),
  currency: joi.string().trim().uppercase().length(3).optional(),
});

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const cancelShipmentSchema = joi.object({
  reason: joi.string().min(3).max(200).required(),
});

export const shipmentHistoryQuerySchema = joi.object({
  status: joi
    .string()
    .valid(...shipmentStatuses)
    .optional(),
  from: joi.date().optional(),
  to: joi.date().optional(),
  page: joi.number().integer().min(1).default(1),
  limit: joi.number().integer().min(1).max(100).default(10),
});

export const adminShipmentQuerySchema = joi.object({
  status: joi
    .string()
    .valid(...shipmentStatuses)
    .optional(),
  assignedDriver: joi.string().optional(),
  from: joi.date().optional(),
  to: joi.date().optional(),
  page: joi.number().integer().min(1).default(1),
  limit: joi.number().integer().min(1).max(100).default(10),
});

export const createPickupSchema = joi.object({
  user: joi.string().trim().pattern(objectIdPattern).required(),
  pickupAddress: joi.string().trim().min(3).max(200).required(),
  dropoffAddress: joi.string().trim().min(3).max(200).required(),
  packageType: joi.string().trim().min(2).max(80).required(),
  weight: joi.number().positive().max(1000).required(),
  currency: joi.string().trim().uppercase().length(3).optional(),
});

export const createBulkPickupsSchema = joi.object({
  user: joi.string().trim().pattern(objectIdPattern).required(),
  pickups: joi.array().items(pickupPayloadSchema).min(1).max(50).required(),
});

export const estimatePickupPriceSchema = joi.object({
  packageType: joi.string().trim().min(2).max(80).required(),
  weight: joi.number().positive().max(1000).required(),
});
