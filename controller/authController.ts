import type { NextFunction, Request, Response } from "express";
import User from "../models/userModel.js";
import ErrorClass from "../utils/ErrorClass.js";

export async function register(req: Request, res: Response, next: NextFunction) {
  

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



export async function login(req: Request, res: Response, next: NextFunction) {
  const { email, password } = req.body
  
  if (!email && !password) return next(new ErrorClass("Invalid Credentials .. Provide Credentials to Login", 400))
  
  const user = await User.findUser( email )
  
  if ( !user ||   !(await user.comparePassword(password))) return next(new ErrorClass("Invalid email or password", 401))
  
  
    res.status(201).json({
      status: "success",
      message: "User Logged In successfully",
      data: {
        user,
      },
    });
 
}


export async function verifyOtp(req: Request, res: Response, next: NextFunction) {
  
}


export async function protector(req: Request, res: Response, next: NextFunction) {
  
}


export async function getMe(req: Request, res: Response, next: NextFunction) {
  
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  
}

export async function logOut(req: Request, res: Response, next: NextFunction) {
  
}