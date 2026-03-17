import express from "express";
import { createTracking } from "../controller/shipmentTrackingController.js";

const router = express.Router();

router.post("/", createTracking);

export default router;