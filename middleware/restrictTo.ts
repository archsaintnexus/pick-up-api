import type { NextFunction, Request, Response } from "express";
import ErrorClass from "../utils/ErrorClass.js";


export function restrictTo(...role: string[]) {
   return (req:Request, res:Response, next:NextFunction) => {
    if (!req.user || !role.includes(req.user.role )) {
      return next(new ErrorClass("You are not permitted to perform this operation",403))
   
    }
    next()
  }
}

