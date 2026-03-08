import type { NextFunction, Request, Response } from "express";
import User from "../models/userModel.js";
import ErrorClass from "../utils/ErrorClass.js";

export async function createUser(req: Request, res: Response, next: NextFunction) {
  

  const existingUser = await User.findUser(req.body.email)

    if (existingUser) {
      return next(new ErrorClass("User with this email already exists", 400));
    }

    const user = await User.createUser({
      fullName: req.body.fullName,
      email: req.body.email,
      companyName: req.body.companyName,
      companyAddress: req.body.companyAddress,
      role: req.body.role,
      password: req.body.password,
      confirmPassword:req.body.confirmPassword
    });

    res.status(201).json({
      status: "success",
      message: "User created successfully",
      data: {
        user,
      },
    });



}