import express from "express";
import {
  getAllShipments,
  getSingleShipmentAdmin,
} from "../controller/adminShipmentController.js";

const router = express.Router();

router.get("/shipments", getAllShipments);
router.get("/shipments/:shipmentId", getSingleShipmentAdmin);

export default router;