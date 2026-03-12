import type { Request, Response } from "express";
import type { UserDoc } from "../models/userModel.js"
import jwtToken from "./jwt.js";

function sendToken(req:Request,res: Response, statusCode: number, userData: UserDoc) {
  const token = jwtToken.signJwt(userData._id.toString());

  const cookieOption = {
    expires: new Date(
      Date.now() + Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    // secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
  };

  res.cookie("jwt", token, cookieOption);

  const user = userData.toObject()
  delete user.password;

  res.status(statusCode).json({
    status: "success",
    token: token,
    data: {
      user,
    },
  });
}

export default sendToken