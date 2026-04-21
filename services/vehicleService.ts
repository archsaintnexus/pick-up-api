import DriverProfile from "../models/driverProfileModel.js";
import Vehicle from "../models/vehicleModel.js";
import ErrorClass from "../utils/ErrorClass.js";
import type { VehicleType } from "../constants/driverConstants.js";

type CreateVehicleInput = {
  driverProfileId: string;
  plateNumber: string;
  make: string;
  vehicleModel: string;
  year: number;
  color: string;
  type: VehicleType;
};

export const createVehicle = async (payload: CreateVehicleInput) => {
  const driverProfile = await DriverProfile.findById(payload.driverProfileId);
  if (!driverProfile) {
    throw new ErrorClass("Driver profile not found", 404);
  }

  const vehicle = await Vehicle.create({
    driver: payload.driverProfileId,
    plateNumber: payload.plateNumber,
    make: payload.make,
    vehicleModel: payload.vehicleModel,
    year: payload.year,
    color: payload.color,
    type: payload.type,
  });

  return vehicle;
};

export const getVehicle = async (vehicleId: string) => {
  const vehicle = await Vehicle.findById(vehicleId).populate("driver");
  if (!vehicle) {
    throw new ErrorClass("Vehicle not found", 404);
  }

  return vehicle;
};

export const getVehiclesByDriver = async (driverProfileId: string) => {
  const vehicles = await Vehicle.find({ driver: driverProfileId }).sort({
    createdAt: -1,
  });

  return vehicles;
};

export const updateVehicle = async (
  vehicleId: string,
  updates: Partial<{
    plateNumber: string;
    make: string;
    vehicleModel: string;
    year: number;
    color: string;
    type: VehicleType;
  }>,
) => {
  const vehicle = await Vehicle.findByIdAndUpdate(vehicleId, updates, {
    new: true,
    runValidators: true,
  });

  if (!vehicle) {
    throw new ErrorClass("Vehicle not found", 404);
  }

  return vehicle;
};

export const deleteVehicle = async (vehicleId: string) => {
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    throw new ErrorClass("Vehicle not found", 404);
  }

  vehicle.isActive = false;
  await vehicle.save();

  return vehicle;
};
