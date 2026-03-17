import express from "express";
import { createInvoice, downloadInvoice } from "../controller/invoiceController.js";

const router = express.Router();

router.post("/shipments/:shipmentId", createInvoice);
router.get("/shipments/:shipmentId/download", downloadInvoice);

export default router;
