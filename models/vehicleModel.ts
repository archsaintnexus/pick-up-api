import mongoose from "mongoose";
import { VEHICLE_TYPES } from "../constants/driverConstants.js";
import type { VehicleType } from "../constants/driverConstants.js";

interface VehicleAttr {
  driver: string;
  plateNumber: string;
  make: string;
  vehicleModel: string;
  year: number;
  color: string;
  type: VehicleType;
}

interface VehicleModel extends mongoose.Model<VehicleDoc> {
  createVehicle(attrs: VehicleAttr): Promise<VehicleDoc>;
}

interface VehicleDoc extends mongoose.Document {
  driver: mongoose.Types.ObjectId;
  plateNumber: string;
  make: string;
  vehicleModel: string;
  year: number;
  color: string;
  type: VehicleType;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const vehicleSchema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DriverProfile",
      required: true,
    },
    plateNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    make: {
      type: String,
      required: true,
      trim: true,
    },
    vehicleModel: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: Number,
      required: true,
    },
    color: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: VEHICLE_TYPES,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

vehicleSchema.index({ driver: 1 });

vehicleSchema.pre(
  /^find/,
  function (
    this: mongoose.Query<VehicleDoc[], VehicleDoc>,
    next: mongoose.CallbackWithoutResultAndOptionalError,
  ) {
    this.find({ isActive: { $ne: false } });
    next();
  },
);

vehicleSchema.statics.createVehicle = async (attrs: VehicleAttr) => {
  return await new Vehicle(attrs).save();
};

const Vehicle = mongoose.model<VehicleDoc, VehicleModel>(
  "Vehicle",
  vehicleSchema,
);

export type { VehicleDoc };
export default Vehicle;
