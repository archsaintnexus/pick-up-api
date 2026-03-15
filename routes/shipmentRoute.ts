import express from "express";
import validator from "../middleware/validator.js";
import {
  cancelShipmentSchema,
  createShipmentSchema,
} from "../SchemaTypes/shipmentSchema.js";
import {
  createShipment,
  getShipmentHistory,
  cancelShipment,
  generateInvoice,
} from "../controller/shipmentController.js";

const router = express.Router();

router.post("/", validator(createShipmentSchema), createShipment);
router.get("/history/:userId", getShipmentHistory);
router.patch("/:shipmentId/cancel", validator(cancelShipmentSchema), cancelShipment);
router.get("/:shipmentId/invoice", generateInvoice);

export default router;
