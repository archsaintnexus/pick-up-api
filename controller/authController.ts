import type { NextFunction, Request, Response } from "express";
import User from "../models/userModel.js";
import ErrorClass from "../utils/ErrorClass.js";
import jwtToken from "../services/jwt.js";
import sendToken from "../services/sendToken.js";
import BodyFilter from "../utils/BodyFilter.js";





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

  
  sendToken(res,201,user)
}



export async function login(req: Request, res: Response, next: NextFunction) {
  const { email, password } = req.body
  
  if (!email && !password) return next(new ErrorClass("Invalid Credentials .. Provide Credentials to Login", 400))
  
  const user = await User.findUser( email )
  
  if ( !user ||   !(await user.comparePassword(password))) return next(new ErrorClass("Invalid email or password", 401))
  
  
  
  sendToken(res,200,user)
  
}


export async function verifyOtp(req: Request, res: Response, next: NextFunction) {
  
}


export async function protector(req: Request, res: Response, next: NextFunction) {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization?.startsWith("Bearer")
  ) {
    token = req.headers.authorization?.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  
  if (!token) return next(new ErrorClass("You are not logged in .. Please login and try again", 401))
  
  const decoded = await jwtToken.verifyJwt(token).catch(()=>null)

  if (!decoded) return next(new ErrorClass("Invalid or expired token.", 401))

  const user = await User.findById(decoded?.id!)

  if (!user) return next(new ErrorClass("The user belonging to this token no longer exists.", 401))
  
  if(user.changedPasswordAfter(decoded?.iat!)) return next(new ErrorClass(  "User recently changed password. Please log in again.",
    401))

  
  req.user = user;
  next()
}


export async function getMe(req: Request, res: Response, next: NextFunction) {
  const user = await User.findById(req.user._id) 

  if (!user) return next(new ErrorClass("User does not exist", 404))
  
  
  res.status(201).json({
    status: "Success",
    data: {
   user
 }
  })
  
  
  
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {

  const data = BodyFilter(req.body, "password", "role","email") /// added this checker here so users can't change their roles and also this route is not for password update so user's can't update password

  const user = await User.findByIdAndUpdate(req.user._id, data, {
    runValidators: false,
    new:true
  })

  if(!user) return next(new ErrorClass("User does not exist",404))

  res.status(200).json({
    status: "Success",
    message: "User Profile Updated",
    data: {
      user
    }
  })

  
}

export async function logOut(req: Request, res: Response, next: NextFunction) {
  
}


export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  const { email } = req.body
  
  if(!email) return next(new ErrorClass("Email is required",400))
  
  const user = await User.findUser(email)

  if(!user) return next(new ErrorClass("User does not exist",404))

}


export async function updatePassword(req: Request, res: Response, next: NextFunction) {
  const { currentPassword, password, confirmPassword } = req.body
  
  const user = await User.findById(req.user._id)

  if (!user) return next(new ErrorClass("User does not exist", 404))
  
  if (!(await user.comparePassword(currentPassword))) return next(new ErrorClass("Incorrect Password", 403))
  
  user.password = password
  user.confirmPassword = confirmPassword

  await user.save()

  sendToken(res,200,user)
  

}