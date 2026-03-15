import type { NextFunction, Request, Response } from "express";
import User from "../models/userModel.js";
import BodyFilter from "../utils/BodyFilter.js";
import ErrorClass from "../utils/ErrorClass.js";



export async function deleteAccount(req: Request, res: Response,next:NextFunction) {
  const { password } = req.body
  
  const user = (await User.findById(req.user._id).select("+password"))!
  
  if (!(await user.comparePassword(password))) return next(new ErrorClass("Password does not match",403))

  user.isActive = false
  await user.save({validateBeforeSave:false})
res.cookie("jwt","",{ httpOnly: true, expires: new Date(0) })

    res.status(200).json({
        status: "Success",
        message:"User Account deleted Successfully"
  })

}


export async function updateProfile(req: Request, res: Response) {

  const data = BodyFilter(req.body, "fullName", "companyName","companyAddress") /// this only allows a specific field to be updated

  const user = await User.findByIdAndUpdate(req.user._id, data, {
    runValidators: false,
    new:true
  })  

  res.status(200).json({
    status: "Success",
    message: "User Profile Updated",
    data: {
      user
    }
  })

  
}



export async function getMe(req: Request, res: Response) {
  const user = await User.findById(req.user._id).select("-__v -createdAt -updatedAt -isActive ")

    res.status(200).json({
    status: "Success",
    data: {
   user
 }
  })  
}