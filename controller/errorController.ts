import type { NextFunction, Request, Response } from "express";

type AppError = Error & {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
};

function sendProdError(err: AppError, res: Response) {
  return res.status(err.statusCode || 500).json({
    status: err.status || "error",
    message: err.message,
  });
}

function sendDevError(err: AppError, _req: Request, res: Response) {
  return res.status(err.statusCode || 500).json({
    status: err.status || "error",
    error: err,
    message: err.message,
    stack: err.stack,
  });
}

const errorController = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  void next; // prevents eslint unused warning

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendDevError(err, req, res);
  } else {
    sendProdError(err, res);
  }
};

export default errorController;