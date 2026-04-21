import express from "express";
import { protector } from "../middleware/protector.js";
import validator from "../middleware/validator.js";
import {
  initiatePaymentSchema,
  updatePaymentStatusSchema,
  uploadReceiptSchema,
} from "../SchemaTypes/paymentSchema.js";
import {
  initiatePaymentHandler,
  updatePaymentStatusHandler,
  uploadReceiptHandler,
} from "../controller/paymentController.js";

const router = express.Router();

router.use(protector);

router.post(
  "/shipments/:shipmentId",
  validator(initiatePaymentSchema),
  initiatePaymentHandler,
);

router.patch(
  "/:paymentId/status",
  validator(updatePaymentStatusSchema),
  updatePaymentStatusHandler,
);

router.patch(
  "/:paymentId/receipt",
  validator(uploadReceiptSchema),
  uploadReceiptHandler,
);

export default router;
