import type { NextFunction, Request, Response } from "express";
import User from "../models/userModel.js";
import ErrorClass from "../utils/ErrorClass.js";
import jwtToken from "../services/jwt.js";


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

  
  if (!token || token === "null") return next(new ErrorClass("You are not logged in .. Please login and try again", 401)) 
  
  
  
  const decoded = await jwtToken.verifyJwt(token).catch(()=>null)


  if (!decoded) return next(new ErrorClass("Invalid or expired token.", 401))

  const user = await User.findById(decoded.id)

  if (!user || !user.isActive) return next(new ErrorClass("The user belonging to this token no longer exists.", 401))

  if(!user.isVerified) return next(new ErrorClass("User account not verified.. ",401))
  
  if(user.changedPasswordAfter(decoded?.iat!)) return next(new ErrorClass(  "User recently changed password. Please log in again.",
    401))

  
  req.user = user;
  next()
}
