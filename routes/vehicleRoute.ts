import express from "express";
import validator from "../middleware/validator.js";
import { protector } from "../middleware/protector.js";
import { restrictTo } from "../middleware/restrictTo.js";
import {
  createVehicleSchema,
  updateVehicleSchema,
} from "../SchemaTypes/vehicleSchema.js";
import {
  createVehicle,
  getVehicle,
  getDriverVehicles,
  updateVehicle,
  deleteVehicle,
} from "../controller/vehicleController.js";

const router = express.Router();

router.use(protector);

router.post(
  "/",
  restrictTo("admin"),
  validator(createVehicleSchema),
  createVehicle,
);
router.get(
  "/driver/:driverProfileId",
  restrictTo("admin", "driver"),
  getDriverVehicles,
);
router.get("/:vehicleId", restrictTo("admin", "driver"), getVehicle);
router.patch(
  "/:vehicleId",
  restrictTo("admin"),
  validator(updateVehicleSchema),
  updateVehicle,
);
router.delete("/:vehicleId", restrictTo("admin"), deleteVehicle);

export default router;
