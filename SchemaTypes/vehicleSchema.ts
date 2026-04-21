import joi from "joi";
import { VEHICLE_TYPES } from "../constants/driverConstants.js";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const createVehicleSchema = joi.object({
  driverProfileId: joi.string().trim().pattern(objectIdPattern).required(),
  plateNumber: joi.string().trim().min(3).max(15).required(),
  make: joi.string().trim().min(2).max(50).required(),
  vehicleModel: joi.string().trim().min(1).max(50).required(),
  year: joi
    .number()
    .integer()
    .min(1990)
    .max(new Date().getFullYear() + 1)
    .required(),
  color: joi.string().trim().min(2).max(30).required(),
  type: joi
    .string()
    .valid(...VEHICLE_TYPES)
    .required(),
});

export const updateVehicleSchema = joi.object({
  plateNumber: joi.string().trim().min(3).max(15).optional(),
  make: joi.string().trim().min(2).max(50).optional(),
  vehicleModel: joi.string().trim().min(1).max(50).optional(),
  year: joi
    .number()
    .integer()
    .min(1990)
    .max(new Date().getFullYear() + 1)
    .optional(),
  color: joi.string().trim().min(2).max(30).optional(),
  type: joi
    .string()
    .valid(...VEHICLE_TYPES)
    .optional(),
});
