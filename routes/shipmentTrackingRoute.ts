import { Router } from "express";
import validator from "../middleware/validator.js";
import { getPOD, getTimeline, getTracking, updateStatus, uploadPOD } from "../controller/shipmentTrackingController.js";
import { validatePOD, validateTrackingEvent } from "../SchemaTypes/shipmentTrackingSchema.js";
import express from "express";
import { createTracking } from "../controller/shipmentTrackingController.js";

const router = express.Router();


// Patch
router.route("/:trackingNumber/status").patch(validator(validateTrackingEvent), updateStatus);
router.route("/:trackingNumber/pod").patch(validator(validatePOD), uploadPOD);

// Get
router.route("/:trackingNumber").get(getTracking);
router.route("/:trackingNumber/timeline").get(getTimeline);
router.route("/:trackingNumber/pod").get(getPOD);

export default router;