import express from "express";
import validator from "../middleware/validator.js";
import { protector } from "../middleware/protector.js";
import { restrictTo } from "../middleware/restrictTo.js";
import {
  cancelShipmentSchema,
  createPickupSchema,
  createBulkPickupsSchema,
  estimatePickupPriceSchema,
  assignDriverSchema,
} from "../SchemaTypes/shipmentSchema.js";

import {
  getShipmentHistory,
  cancelShipment,
  generateInvoice,
  createPickup,
  createBulkPickups,
  estimatePickupPrice,
  assignDriver,
  markPickedUp,
  markInTransit,
  markDelivered,
} from "../controller/shipmentController.js";
import { validateShippingTrackingSchema } from "../SchemaTypes/shipmentTrackingSchema.js";
import { createTracking } from "../controller/shipmentTrackingController.js";

const router = express.Router();

// All shipment routes require authentication
router.use(protector);

router.post(
  "/pickups/estimate",
  validator(estimatePickupPriceSchema),
  estimatePickupPrice,
);
router.post(
  "/pickups",
  restrictTo("customer", "business", "admin"),
  validator(createPickupSchema),
  createPickup,
);

router.post(
  "/pickups/bulk",
  restrictTo("business", "admin"),
  validator(createBulkPickupsSchema),
  createBulkPickups,
);

router.get("/history/:userId", getShipmentHistory);

router.patch(
  "/:shipmentId/cancel",
  validator(cancelShipmentSchema),
  cancelShipment,
);

router.get("/:shipmentId/invoice", generateInvoice);

// Status transition endpoints
router.post(
  "/:shipmentId/assign",
  restrictTo("admin"),
  validator(assignDriverSchema),
  assignDriver,
);
router.post("/:shipmentId/pickup", restrictTo("driver", "admin"), markPickedUp);
router.post("/:shipmentId/transit", restrictTo("driver", "admin"), markInTransit);
router.post("/:shipmentId/deliver", restrictTo("driver", "admin"), markDelivered);

// For Tracking
router.route("/:shipmentId/tracking").post(validator(validateShippingTrackingSchema), createTracking)

export default router;
