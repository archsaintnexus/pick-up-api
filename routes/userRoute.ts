import express from "express"

import {forgotPassword, getMe, login, logOut, protector, register, resetPassword, updatePassword, updateProfile, verifyOtp } from "../controller/authController.js"
import validator from "../middleware/validator.js"
import { createLoginSchema, createUserSchema } from "../SchemaTypes/userSchema.js"


const router = express.Router()


router.post("/auth/register", validator(createUserSchema), register)
router.post("/auth/login", validator(createLoginSchema), login)
router.post("/auth/verifyOtp", verifyOtp)
router.post("/auth/forgotPassword", forgotPassword)
router.patch("/auth/resetPassword/:token",resetPassword)


router.use(protector)


router.get("/me",getMe)
router.patch("/me", updateProfile)
router.patch("/updatePassword",updatePassword)
router.post("/logout",logOut)

export default router