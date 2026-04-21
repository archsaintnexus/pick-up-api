import type { NextFunction, Request, Response } from "express";
import {
  createVehicle as createVehicleSvc,
  getVehicle as getVehicleSvc,
  getVehiclesByDriver,
  updateVehicle as updateVehicleSvc,
  deleteVehicle as deleteVehicleSvc,
} from "../services/vehicleService.js";
import { createAuditLog } from "../services/auditService.js";

export const createVehicle = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const vehicle = await createVehicleSvc(req.body);

    await createAuditLog({
      actorId: req.user?.id ?? null,
      action: "CREATE_VEHICLE",
      entity: "Vehicle",
      entityId: vehicle._id.toString(),
      metadata: { plateNumber: vehicle.plateNumber, driverProfileId: req.body.driverProfileId },
    });

    res.status(201).json({
      status: "success",
      data: { vehicle },
    });
  } catch (error) {
    next(error);
  }
};

export const getVehicle = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const vehicle = await getVehicleSvc(req.params.vehicleId!);

    res.status(200).json({
      status: "success",
      data: { vehicle },
    });
  } catch (error) {
    next(error);
  }
};

export const getDriverVehicles = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const vehicles = await getVehiclesByDriver(req.params.driverProfileId!);

    res.status(200).json({
      status: "success",
      results: vehicles.length,
      data: { vehicles },
    });
  } catch (error) {
    next(error);
  }
};

export const updateVehicle = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const vehicle = await updateVehicleSvc(req.params.vehicleId!, req.body);

    await createAuditLog({
      actorId: req.user?.id ?? null,
      action: "UPDATE_VEHICLE",
      entity: "Vehicle",
      entityId: vehicle._id.toString(),
      metadata: req.body,
    });

    res.status(200).json({
      status: "success",
      data: { vehicle },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteVehicle = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const vehicle = await deleteVehicleSvc(req.params.vehicleId!);

    await createAuditLog({
      actorId: req.user?.id ?? null,
      action: "DELETE_VEHICLE",
      entity: "Vehicle",
      entityId: vehicle._id.toString(),
      metadata: {},
    });

    res.status(200).json({
      status: "success",
      message: "Vehicle deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
