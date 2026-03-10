import express from "express";
import validator from "../middleware/validator.js";
import {
  cancelShipmentSchema,
  createPickupSchema,
  createBulkPickupsSchema,
  estimatePickupPriceSchema,
} from "../SchemaTypes/shipmentSchema.js";

import {
  getShipmentHistory,
  cancelShipment,
  generateInvoice,
  createPickup,
  createBulkPickups,
  estimatePickupPrice,
} from "../controller/shipmentController.js";

const router = express.Router();
router.post(
  "/pickups/estimate",
  validator(estimatePickupPriceSchema),
  estimatePickupPrice,
);
router.post("/pickups", validator(createPickupSchema), createPickup);

router.post(
  "/pickups/bulk",
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

export default router;
