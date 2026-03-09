import express from "express"

import {getMe, login, logOut, protector, register, updateProfile, verifyOtp } from "../controller/authController.js"
import validator from "../middleware/validator.js"
import { createLoginSchema, createUserSchema } from "../SchemaTypes/userSchema.js"


const router = express.Router()


router.post("/auth/register", validator(createUserSchema), register)
router.post("/auth/login", validator(createLoginSchema), login)
router.post("/auth/verify-otp",verifyOtp)


router.use(protector)


router.get("/users/me",getMe)
router.post("/users/me", updateProfile)
router.post("/logout",logOut)

export default router