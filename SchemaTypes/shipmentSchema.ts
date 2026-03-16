import joi from "joi";

const shipmentStatuses = [
  "PENDING",
  "ASSIGNED",
  "PICKED_UP",
  "IN_TRANSIT",
  "DELIVERED",
  "CANCELLED",
];

export const cancelShipmentSchema = joi.object({
  reason: joi.string().min(3).max(200).required(),
});

export const shipmentHistoryQuerySchema = joi.object({
  status: joi.string().valid(...shipmentStatuses).optional(),
  from: joi.date().optional(),
  to: joi.date().optional(),
  page: joi.number().integer().min(1).default(1),
  limit: joi.number().integer().min(1).max(100).default(10),
});

export const adminShipmentQuerySchema = joi.object({
  status: joi.string().valid(...shipmentStatuses).optional(),
  assignedDriver: joi.string().optional(),
  from: joi.date().optional(),
  to: joi.date().optional(),
  page: joi.number().integer().min(1).default(1),
  limit: joi.number().integer().min(1).max(100).default(10),
});
