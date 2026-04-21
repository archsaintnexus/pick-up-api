import joi from "joi";
import { VEHICLE_TYPES } from "../constants/driverConstants.js";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const createDriverProfileSchema = joi.object({
  userId: joi.string().trim().pattern(objectIdPattern).required(),
  licenseNumber: joi.string().trim().min(5).max(30).required(),
  licenseExpiry: joi.date().greater("now").required(),
  vehicleType: joi
    .string()
    .valid(...VEHICLE_TYPES)
    .required(),
});

export const updateDriverProfileSchema = joi.object({
  licenseNumber: joi.string().trim().min(5).max(30).optional(),
  licenseExpiry: joi.date().greater("now").optional(),
  vehicleType: joi
    .string()
    .valid(...VEHICLE_TYPES)
    .optional(),
});

export const updateAvailabilitySchema = joi.object({
  isAvailable: joi.boolean().required(),
});

export const driverQuerySchema = joi.object({
  isAvailable: joi.boolean().optional(),
  vehicleType: joi
    .string()
    .valid(...VEHICLE_TYPES)
    .optional(),
  page: joi.number().integer().min(1).default(1),
  limit: joi.number().integer().min(1).max(100).default(10),
});
