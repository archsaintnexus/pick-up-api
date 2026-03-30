import Joi from "joi";
import { SHIPMENT_STATUSES } from "../constants/shipmentStatus.js";

export const validateShippingTrackingSchema = Joi.object({
    shipmentId: Joi.string().required(),
    trackingNumber: Joi.string().optional(),
    currentStatus: Joi.string().valid(...SHIPMENT_STATUSES).default('PENDING'),
    user: Joi.string().optional(),
    socketRoomId: Joi.string().optional()
})

export const validateTrackingEvent = Joi.object({
    status: Joi.string().valid(...SHIPMENT_STATUSES).required(),
    note: Joi.string().optional(),
    updatedBy: Joi.string().optional()
})

export const validatePOD = Joi.object({
    imageUrl: Joi.string().required(),
    uploadedBy: Joi.string().optional(),
    recipientName: Joi.string().optional()
})