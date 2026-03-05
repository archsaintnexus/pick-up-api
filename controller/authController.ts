import type { NextFunction, Request, Response } from "express";
import User from "../models/userModel.js"



export async function createUser(req: Request, res: Response, next: NextFunction) {
    
    console.log(req.body)

    res.status(200).json({
        status: "Success",
        message: "User created Successfully",
        data: {
           data: req.body
        }
    })

} 