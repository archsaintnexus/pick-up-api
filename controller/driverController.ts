import type { NextFunction, Request, Response } from "express";
import {
  createDriverProfile,
  getDriverProfile,
  getDriverProfileByUserId,
  getAllDrivers,
  updateDriverProfile,
  updateAvailability,
  deleteDriverProfile,
  getDriverPerformanceMetrics,
} from "../services/driverService.js";
import { driverQuerySchema } from "../SchemaTypes/driverSchema.js";
import { createAuditLog } from "../services/auditService.js";
import ErrorClass from "../utils/ErrorClass.js";

export const createDriver = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const driverProfile = await createDriverProfile(req.body);

    await createAuditLog({
      actorId: req.user?.id ?? null,
      action: "CREATE_DRIVER_PROFILE",
      entity: "DriverProfile",
      entityId: driverProfile._id.toString(),
      metadata: {
        userId: req.body.userId,
        licenseNumber: req.body.licenseNumber,
      },
    });

    res.status(201).json({
      status: "success",
      data: { driverProfile },
    });
  } catch (error) {
    next(error);
  }
};

export const getDriver = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const driverProfile = await getDriverProfile(req.params.driverProfileId!);

    res.status(200).json({
      status: "success",
      data: { driverProfile },
    });
  } catch (error) {
    next(error);
  }
};

export const getMyProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const driverProfile = await getDriverProfileByUserId(req.user!.id);

    res.status(200).json({
      status: "success",
      data: { driverProfile },
    });
  } catch (error) {
    next(error);
  }
};

export const listAllDrivers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { error, value } = driverQuerySchema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const message = error.details.map((el) => el.message).join(", ");
      return next(new ErrorClass(message, 400));
    }

    const { drivers, total, page, limit } = await getAllDrivers(value);

    res.status(200).json({
      status: "success",
      results: drivers.length,
      data: { total, page, limit, drivers },
    });
  } catch (error) {
    next(error);
  }
};

export const updateDriver = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const driverProfile = await updateDriverProfile(
      req.params.driverProfileId!,
      req.body,
    );

    await createAuditLog({
      actorId: req.user?.id ?? null,
      action: "UPDATE_DRIVER_PROFILE",
      entity: "DriverProfile",
      entityId: driverProfile._id.toString(),
      metadata: req.body,
    });

    res.status(200).json({
      status: "success",
      data: { driverProfile },
    });
  } catch (error) {
    next(error);
  }
};

export const updateMyAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const driverProfile = await updateAvailability(
      req.user!.id,
      req.body.isAvailable,
    );

    await createAuditLog({
      actorId: req.user?.id ?? null,
      action: "UPDATE_DRIVER_AVAILABILITY",
      entity: "DriverProfile",
      entityId: driverProfile._id.toString(),
      metadata: { isAvailable: req.body.isAvailable },
    });

    res.status(200).json({
      status: "success",
      data: { driverProfile },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDriver = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const driverProfile = await deleteDriverProfile(
      req.params.driverProfileId!,
    );

    await createAuditLog({
      actorId: req.user?.id ?? null,
      action: "DELETE_DRIVER_PROFILE",
      entity: "DriverProfile",
      entityId: driverProfile._id.toString(),
      metadata: {},
    });

    res.status(200).json({
      status: "success",
      message: "Driver profile deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getDriverMetrics = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const metrics = await getDriverPerformanceMetrics(req.params.userId!);

    res.status(200).json({
      status: "success",
      data: { metrics },
    });
  } catch (error) {
    next(error);
  }
};
