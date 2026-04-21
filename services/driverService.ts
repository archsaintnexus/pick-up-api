import mongoose from "mongoose";
import DriverProfile from "../models/driverProfileModel.js";
import Vehicle from "../models/vehicleModel.js";
import User from "../models/userModel.js";
import Shipment from "../models/shipmentModel.js";
import ErrorClass from "../utils/ErrorClass.js";
import type { VehicleType } from "../constants/driverConstants.js";

type CreateDriverProfileInput = {
  userId: string;
  licenseNumber: string;
  licenseExpiry: Date;
  vehicleType: VehicleType;
};

type DriverQuery = {
  isAvailable?: boolean;
  vehicleType?: VehicleType;
  page: number;
  limit: number;
};

export const createDriverProfile = async (payload: CreateDriverProfileInput) => {
  const user = await User.findById(payload.userId);
  if (!user) {
    throw new ErrorClass("User not found", 404);
  }

  if (user.role !== "driver") {
    throw new ErrorClass("User is not a driver", 400);
  }

  const existing = await DriverProfile.findOne({ user: payload.userId });
  if (existing) {
    throw new ErrorClass("Driver profile already exists", 409);
  }

  const driverProfile = await DriverProfile.create({
    user: payload.userId,
    licenseNumber: payload.licenseNumber,
    licenseExpiry: payload.licenseExpiry,
    vehicleType: payload.vehicleType,
  });

  return driverProfile;
};

export const getDriverProfile = async (driverProfileId: string) => {
  const profile = await DriverProfile.findById(driverProfileId).populate(
    "user",
    "fullName email phoneNumber",
  );

  if (!profile) {
    throw new ErrorClass("Driver profile not found", 404);
  }

  return profile;
};

export const getDriverProfileByUserId = async (userId: string) => {
  const profile = await DriverProfile.findOne({ user: userId }).populate(
    "user",
    "fullName email phoneNumber",
  );

  if (!profile) {
    throw new ErrorClass("Driver profile not found", 404);
  }

  return profile;
};

export const getAllDrivers = async (query: DriverQuery) => {
  const filter: Record<string, unknown> = {};

  if (query.isAvailable !== undefined) {
    filter.isAvailable = query.isAvailable;
  }

  if (query.vehicleType) {
    filter.vehicleType = query.vehicleType;
  }

  const skip = (query.page - 1) * query.limit;

  const drivers = await DriverProfile.find(filter)
    .populate("user", "fullName email phoneNumber")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(query.limit);

  const total = await DriverProfile.countDocuments(filter);

  return { drivers, total, page: query.page, limit: query.limit };
};

export const updateDriverProfile = async (
  driverProfileId: string,
  updates: Partial<{
    licenseNumber: string;
    licenseExpiry: Date;
    vehicleType: VehicleType;
  }>,
) => {
  const profile = await DriverProfile.findByIdAndUpdate(
    driverProfileId,
    updates,
    { new: true, runValidators: true },
  ).populate("user", "fullName email phoneNumber");

  if (!profile) {
    throw new ErrorClass("Driver profile not found", 404);
  }

  return profile;
};

export const updateAvailability = async (
  userId: string,
  isAvailable: boolean,
) => {
  const profile = await DriverProfile.findOneAndUpdate(
    { user: userId },
    { isAvailable },
    { new: true, runValidators: true },
  ).populate("user", "fullName email phoneNumber");

  if (!profile) {
    throw new ErrorClass("Driver profile not found", 404);
  }

  return profile;
};

export const deleteDriverProfile = async (driverProfileId: string) => {
  const profile = await DriverProfile.findById(driverProfileId);
  if (!profile) {
    throw new ErrorClass("Driver profile not found", 404);
  }

  profile.isActive = false;
  profile.isAvailable = false;
  await profile.save();

  await Vehicle.updateMany(
    { driver: driverProfileId },
    { isActive: false },
  );

  return profile;
};

export const getDriverPerformanceMetrics = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user || user.role !== "driver") {
    throw new ErrorClass("Driver not found", 404);
  }

  const statusCounts = await Shipment.aggregate([
    { $match: { assignedDriver: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const metrics = {
    totalAssigned: 0,
    delivered: 0,
    cancelled: 0,
    inTransit: 0,
    pickedUp: 0,
    assigned: 0,
    activeShipments: 0,
  };

  for (const entry of statusCounts) {
    const status = entry._id as string;
    const count = entry.count as number;
    metrics.totalAssigned += count;

    switch (status) {
      case "DELIVERED":
        metrics.delivered = count;
        break;
      case "CANCELLED":
        metrics.cancelled = count;
        break;
      case "IN_TRANSIT":
        metrics.inTransit = count;
        break;
      case "PICKED_UP":
        metrics.pickedUp = count;
        break;
      case "ASSIGNED":
        metrics.assigned = count;
        break;
    }
  }

  metrics.activeShipments =
    metrics.assigned + metrics.pickedUp + metrics.inTransit;

  return metrics;
};
