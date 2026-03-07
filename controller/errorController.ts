import type { NextFunction, Request, Response } from "express";

function sendProdError(err: any, res: Response) {
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
}

function sendDevError(err: any, req: Request, res: Response) {
  return res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
}

const errorController = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendDevError(err, req, res);
  } else {
    sendProdError(err, res);
  }
};

export default errorController;