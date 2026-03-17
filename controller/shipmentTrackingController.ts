import type { Request, Response } from "express";

export const createTracking = async (_req: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    message: "Tracking endpoint placeholder",
  });
};