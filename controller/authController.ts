import type { NextFunction, Request, Response } from "express";
import User from "../models/userModel.js";
import ErrorClass from "../utils/ErrorClass.js";
import jwtToken from "../services/jwt.js";
import sendToken from "../services/sendToken.js";
import BodyFilter from "../utils/BodyFilter.js";
import otpService from "../services/otp.js";
import emailQueue from "../Queues/emailQueue.js";
import crypto from "crypto";





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
  
  const otp = await otpService.generateOTP(user._id.toString())
 
 await emailQueue.add("sendOtp", {
    email: user.email,
    otp:otp
  })
  


 
  sendToken(req,res,201,user)
}



export async function login(req: Request, res: Response, next: NextFunction) {
  const { email, password } = req.body
  
  if (!email && !password) return next(new ErrorClass("Invalid Credentials .. Provide Credentials to Login", 400))
  
  const user = await User.findUser(email)
  
 


  if ( !user ||   !(await user.comparePassword(password))) return next(new ErrorClass("Invalid email or password", 401))
  
  if(!user.isVerified) return next(new ErrorClass("User account not verified.. ",401))
  
  sendToken(req,res,200,user)
  
}


export async function verifyOtp(req: Request, res: Response, next: NextFunction) {
  const {email,otp} = req.body
  
  const user = await User.findUser(email)

  if(!user) return next(new ErrorClass("User does not exist",404))

  if(!(await otpService.verifyOTP(user._id.toString(),otp))) return next(new ErrorClass("Invalid Otp or Otp has expired",401))

  
  user.isVerified = true
  await user.save({validateBeforeSave:false})


  sendToken(req,res,200,user)


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

  const user = await User.findById(decoded.id)

  if (!user) return next(new ErrorClass("The user belonging to this token no longer exists.", 401))

  if(!user.isVerified) return next(new ErrorClass("User account not verified.. ",401))
  
  if(user.changedPasswordAfter(decoded?.iat!)) return next(new ErrorClass(  "User recently changed password. Please log in again.",
    401))

  
  req.user = user;
  next()
}


export async function getMe(req: Request, res: Response, next: NextFunction) {
  const user = await User.findById(req.user._id) 

  if (!user) return next(new ErrorClass("User does not exist", 404))
  
  
  res.status(200).json({
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

  if (!user) return next(new ErrorClass("User does not exist", 404))
  
  const token = user.resetPassword()
  
  await user.save({ validateBeforeSave: false })



  /// currently making use of bullMQ for background jobs
  
  try {
    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/auth/resetPassword/${token}`;

    await emailQueue.add("resetPassword", {
      email,
      resetUrl
    })
    res.status(200).json({
      status: "Success",
      message:"Reset Password Link sent to your email"
    })
  } catch (error) {
    user.passwordResetExpires = undefined;
    user.passwordResetToken = undefined;
    await user.save({ validateBeforeSave: false })
    
    return next(new ErrorClass("There was an error sending the email. Try again later!",500))
    
  }

}


export async function updatePassword(req: Request, res: Response, next: NextFunction) {
  const { currentPassword, password, confirmPassword } = req.body
  
  const user = await User.findById(req.user._id)

  if (!user) return next(new ErrorClass("User does not exist", 404))
  
  if (!(await user.comparePassword(currentPassword))) return next(new ErrorClass("Incorrect Password", 403))
  
  user.password = password
  user.confirmPassword = confirmPassword

  await user.save()

  sendToken(req,res,200,user)

}



export async function resetPassword(req: Request, res: Response, next: NextFunction) {

  const {token} = req.params
const resetToken = crypto.createHash("sha256").update(token!).digest("hex")

  const user = await User.findOne({
    passwordResetToken: resetToken,
    passwordResetExpires: { $gt: Date.now() }
 
  })


  if(!user) return next(new ErrorClass("Token is invalid or has expired",400))

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;

  await user.save()

  sendToken(req,res,200,user)
  
}