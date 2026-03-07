import express from "express";
import { createTestShipment } from "../controller/shipmentTestController.js";

import { getAllTestShipments } from "../controller/shipmentReadTestController.js";

const router = express.Router();

router.post("/test-create", createTestShipment);
router.post("/test-create", createTestShipment);
router.get("/test-all", getAllTestShipments);

export default router;