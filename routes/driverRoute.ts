import express from "express";
import validator from "../middleware/validator.js";
import { protector } from "../middleware/protector.js";
import { restrictTo } from "../middleware/restrictTo.js";
import {
  createDriverProfileSchema,
  updateDriverProfileSchema,
  updateAvailabilitySchema,
} from "../SchemaTypes/driverSchema.js";
import {
  createDriver,
  getDriver,
  getMyProfile,
  listAllDrivers,
  updateDriver,
  updateMyAvailability,
  deleteDriver,
  getDriverMetrics,
} from "../controller/driverController.js";

const router = express.Router();

router.use(protector);

// Driver self-service routes (must be before /:driverProfileId)
router.get("/me", restrictTo("driver"), getMyProfile);
router.patch(
  "/me/availability",
  restrictTo("driver"),
  validator(updateAvailabilitySchema),
  updateMyAvailability,
);

// Admin CRUD
router.post(
  "/",
  restrictTo("admin"),
  validator(createDriverProfileSchema),
  createDriver,
);
router.get("/", restrictTo("admin"), listAllDrivers);
router.get("/:driverProfileId", restrictTo("admin"), getDriver);
router.patch(
  "/:driverProfileId",
  restrictTo("admin"),
  validator(updateDriverProfileSchema),
  updateDriver,
);
router.delete("/:driverProfileId", restrictTo("admin"), deleteDriver);

// Performance metrics
router.get("/:userId/metrics", restrictTo("admin", "driver"), getDriverMetrics);

export default router;
