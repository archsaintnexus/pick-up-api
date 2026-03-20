import type { NextFunction, Request, Response } from "express";
import User from "../models/userModel.js";
import ErrorClass from "../utils/ErrorClass.js";
import sendToken from "../services/sendToken.js";
import otpService from "../services/otp.js";
import emailQueue from "../Queues/emailQueue.js";
import crypto from "crypto";


export async function register(req: Request, res: Response, next: NextFunction) {
  const existingUser = await User.findUser(req.body.email)

    if (existingUser) {
      return next(new ErrorClass("User with this email already exists", 400));
    }
  
  if (!req.body.confirmPassword) return next(new ErrorClass("Please Provide confirm password", 400))
  
  if(req.body.password !== req.body.confirmPassword) return next(new ErrorClass("Password does not match",400))

    const user = await User.createUser({
      fullName: req.body.fullName,
      email: req.body.email,
      companyName: req.body.companyName,
      companyAddress: req.body.companyAddress,
      role: req.body.role,
      password: req.body.password,
      phoneNumber: req.body.phoneNumber,
      phoneNumber2: req.body.phoneNumber2 || undefined
    });
  
  if (user.role === "admin") {
   return  res.status(201).json({
      status: "Success",
      message:"Admin Created Successfully."
    })
  }
  const otp = await otpService.generateOTP(user._id.toString())
  
 
  await emailQueue.add("sendOtp", {
     email: user.email,
     otp:otp
  }, {
    attempts: 5,
    backoff: {
      type: "exponential",
      delay:5000 // restarts every 5 second
    }
   })
   
   res.status(201).json({
     status: "Success",
     message:"An OTP has been sent to your email."
   })
}



export async function login(req: Request, res: Response, next: NextFunction) {
  const { email, password } = req.body
  
  if (!email || !password) return next(new ErrorClass("Invalid Credentials .. Provide Credentials to Login", 400))
  
  const user = await User.findUser(email)
  if ( !user ||   !(await user.comparePassword(password))) return next(new ErrorClass("Invalid email or password", 401))
  if (!user.isActive) return next(new ErrorClass("User does not exist",404))
  if (!user.isVerified) return next(new ErrorClass("User account not verified.. ", 401))

  
  sendToken(req,res,200,user,"Login Successful")
  
}


export async function verifyOtp(req: Request, res: Response, next: NextFunction) {
  const {email,otp} = req.body
  
  const user = await User.findUser(email)

  if (!user || !user.isActive) return next(new ErrorClass("User does not exist", 404))
  
  if(user.isVerified) return next(new ErrorClass("User is already verified. Proceed to Login Page",400))

  if(!(await otpService.verifyOTP(user._id.toString(),otp))) return next(new ErrorClass("Invalid Otp or Otp has expired",401))

  
  await emailQueue.add("email_verified/account_verified", {
    email: user.email,
    fullName:user.fullName
  })
  
  user.isVerified = true
  await user.save({validateBeforeSave:false})


  sendToken(req,res,200,user,"Your Email has been verified successfully..")


}



export async function logOut(req: Request, res: Response) {
  res.cookie("jwt", "loggedOut", {
    httpOnly: true,
    expires:new Date(0),
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
  });
  res.status(200).json({
    status: "Success",
    message: "Logged out Successfully",
  });
  
}


export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  const { email } = req.body
  
  if(!email) return next(new ErrorClass("Email is required",400))
  
  const user = await User.findUser(email)

  if (!user) return next(new ErrorClass("User does not exist", 404))
  
  const token = user.resetPassword()
  
  await user.save({ validateBeforeSave: false })

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
    console.log(error)
    user.passwordResetExpires = undefined;
    user.passwordResetToken = undefined;
    await user.save({ validateBeforeSave: false })
    
    return next(new ErrorClass("There was an error sending the email. Try again later!",500))
    
  }

}


export async function updatePassword(req: Request, res: Response, next: NextFunction) {
  const { currentPassword, password, confirmPassword } = req.body
  
  const user = (await User.findById(req.user._id).select("+password"))!



  if (!(await user.comparePassword(currentPassword))) return next(new ErrorClass("Incorrect Password", 403))
  
  user.password = password
  user.confirmPassword = confirmPassword

  await emailQueue.add("updatePasswordMail", {
    email: user.email
 }, {
   attempts: 5,
   backoff: {
     type: "exponential",
     delay:5000 // restarts every 5 second
   }
  })
  

  await user.save()

  sendToken(req,res,200,user,"Password Updated Successfully")

}


export async function resendOtp(req: Request, res: Response, next: NextFunction) {

  const { email } = req.body
  
  const user = await User.findUser(email)

  if (!user || !user.isActive) return next(new ErrorClass("User does not exist..", 404))
  if(user.isVerified) return next(new ErrorClass("User is already verified. Proceed to Login Page",400))
  
    const otp = await otpService.generateOTP(user._id.toString())
 
    await emailQueue.add("sendOtp", {
       email: user.email,
       otp:otp
    }, {
      attempts: 5,
      backoff: {
        type: "exponential",
        delay:5000 // restarts every 5 second
      }
     })
     
   
   
    
     res.status(200).json({
      status: "Success",
      message: "OTP resent to your email."
    })
  
  
}



export async function resetPassword(req: Request, res: Response, next: NextFunction) {
 const {token} = req.params
 const resetToken = crypto.createHash("sha256").update(token!).digest("hex")

  const user = await User.findOne({
    passwordResetToken: resetToken,
    passwordResetExpires: { $gt: Date.now() },
 
  })


  if(!user) return next(new ErrorClass("Token is invalid or has expired",400))

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;

  await emailQueue.add("resetPasswordMail", {
    email: user.email
 }, {
   attempts: 5,
   backoff: {
     type: "exponential",
     delay:5000 // restarts every 5 second
   }
  })
  

  await user.save()

  sendToken(req,res,200,user,"Password Reset Successful")
  
}


