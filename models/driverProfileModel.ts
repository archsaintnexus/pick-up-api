import mongoose from "mongoose";
import { VEHICLE_TYPES } from "../constants/driverConstants.js";
import type { VehicleType } from "../constants/driverConstants.js";

interface DriverProfileAttr {
  user: string;
  licenseNumber: string;
  licenseExpiry: Date;
  vehicleType: VehicleType;
}

interface DriverProfileModel extends mongoose.Model<DriverProfileDoc> {
  createDriverProfile(attrs: DriverProfileAttr): Promise<DriverProfileDoc>;
}

interface DriverProfileDoc extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  licenseNumber: string;
  licenseExpiry: Date;
  vehicleType: VehicleType;
  isAvailable: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const driverProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    licenseNumber: {
      type: String,
      required: true,
      trim: true,
    },
    licenseExpiry: {
      type: Date,
      required: true,
    },
    vehicleType: {
      type: String,
      enum: VEHICLE_TYPES,
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

driverProfileSchema.index({ isAvailable: 1, isActive: 1 });

driverProfileSchema.pre(
  /^find/,
  function (
    this: mongoose.Query<DriverProfileDoc[], DriverProfileDoc>,
    next: mongoose.CallbackWithoutResultAndOptionalError,
  ) {
    this.find({ isActive: { $ne: false } });
    next();
  },
);

driverProfileSchema.statics.createDriverProfile = async (
  attrs: DriverProfileAttr,
) => {
  return await new DriverProfile(attrs).save();
};

const DriverProfile = mongoose.model<DriverProfileDoc, DriverProfileModel>(
  "DriverProfile",
  driverProfileSchema,
);

export type { DriverProfileDoc };
export default DriverProfile;
