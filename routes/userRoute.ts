import express from "express"

import {forgotPassword, getMe, login, logOut, protector, register, resetPassword, updatePassword, updateProfile, verifyOtp } from "../controller/authController.js"
import validator from "../middleware/validator.js"
import { createLoginSchema, createUserSchema } from "../SchemaTypes/userSchema.js"


const router = express.Router()


router.post("/auth/register", validator(createUserSchema), register)
router.post("/auth/login", validator(createLoginSchema), login)
router.post("/auth/verify-otp", verifyOtp)
router.post("/auth/users/forgotPassword", forgotPassword)
router.post("/auth/users/resetPassword/:token",resetPassword)


router.use(protector)


router.get("/users/me",getMe)
router.post("/users/me", updateProfile)
router.post("/users/updatePassword",updatePassword)
router.post("/logout",logOut)

export default router