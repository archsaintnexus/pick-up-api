import joi from "joi";
import { SHIPMENT_STATUSES } from "../constants/shipmentStatus.js";
const pickupPayloadSchema = joi.object({
  pickupAddress: joi.string().trim().min(3).max(200).required(),
  dropoffAddress: joi.string().trim().min(3).max(200).required(),
  packageType: joi.string().trim().min(2).max(80).required(),
  weight: joi.number().positive().max(1000).required(),
  currency: joi.string().trim().uppercase().length(3).optional(),
  vehicleType: joi.string().valid("motorcycle", "car", "van", "truck").required(),
  recipientName: joi.string().trim().min(1).max(100).required(),
  recipientPhone: joi.string().trim().min(7).max(20).required(),
  pickupDate: joi.date().greater("now").required(),
  timeWindow: joi.string().trim().min(1).max(50).required(),
  quantity: joi.number().integer().min(1).default(1),
  specialInstructions: joi.string().trim().max(500).optional(),
});

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const cancelShipmentSchema = joi.object({
  reason: joi.string().min(3).max(200).required(),
});

export const shipmentHistoryQuerySchema = joi.object({
  status: joi
    .string()
    .valid(...SHIPMENT_STATUSES)
    .optional(),
  from: joi.date().optional(),
  to: joi.date().optional(),
  page: joi.number().integer().min(1).default(1),
  limit: joi.number().integer().min(1).max(100).default(10),
});

export const adminShipmentQuerySchema = joi.object({
  status: joi
    .string()
    .valid(...SHIPMENT_STATUSES)
    .optional(),
  assignedDriver: joi.string().optional(),
  from: joi.date().optional(),
  to: joi.date().optional(),
  page: joi.number().integer().min(1).default(1),
  limit: joi.number().integer().min(1).max(100).default(10),
});

export const createPickupSchema = joi.object({
  pickupAddress: joi.string().trim().min(3).max(200).required(),
  dropoffAddress: joi.string().trim().min(3).max(200).required(),
  packageType: joi.string().trim().min(2).max(80).required(),
  weight: joi.number().positive().max(1000).required(),
  currency: joi.string().trim().uppercase().length(3).optional(),
  vehicleType: joi.string().valid("motorcycle", "car", "van", "truck").required(),
  recipientName: joi.string().trim().min(1).max(100).required(),
  recipientPhone: joi.string().trim().min(7).max(20).required(),
  pickupDate: joi.date().greater("now").required(),
  timeWindow: joi.string().trim().min(1).max(50).required(),
  quantity: joi.number().integer().min(1).default(1),
  specialInstructions: joi.string().trim().max(500).optional(),
});

export const createBulkPickupsSchema = joi.object({
  pickups: joi.array().items(pickupPayloadSchema).min(1).max(50).required(),
});

export const estimatePickupPriceSchema = joi.object({
  packageType: joi.string().trim().min(2).max(80).required(),
  weight: joi.number().positive().max(1000).required(),
});

export const assignDriverSchema = joi.object({
  driverId: joi.string().trim().pattern(objectIdPattern).required(),
});

export const createRatingSchema = joi.object({
  rating: joi.number().integer().min(1).max(5).required(),
  comment: joi.string().trim().max(500).optional(),
});
