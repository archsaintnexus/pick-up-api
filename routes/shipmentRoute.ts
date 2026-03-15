import express from "express";
import validator from "../middleware/validator.js";
import { cancelShipmentSchema } from "../SchemaTypes/shipmentSchema.js";
import {
  getShipmentHistory,
  cancelShipment,
  generateInvoice,
} from "../controller/shipmentController.js";
import { validateShippingTrackingSchema } from "../SchemaTypes/shipmentTrackingSchema.js";
import { createTracking } from "../controller/shipmentTrackingController.js";

const router = express.Router();

router.get("/history/:userId", getShipmentHistory);
router.patch("/:shipmentId/cancel", validator(cancelShipmentSchema), cancelShipment);
router.get("/:shipmentId/invoice", generateInvoice);

// For Tracking
router.route("/:shipmentId/tracking").post(validator(validateShippingTrackingSchema), createTracking)

export default router;