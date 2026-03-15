import express from "express"

import { forgotPassword,  login, logOut, register, resendOtp, resetPassword, updatePassword, verifyOtp } from "../controller/authController.js"
import validator from "../middleware/validator.js"
import { createLoginSchema, createUserSchema, deleteAccountSchema, forgotPasswordSchema, OtpSchema, resendOtpSchema, resetPasswordSchema, updatePasswordSchema, updateUserSchema } from "../SchemaTypes/userSchema.js"
import { passwordLimiter, resendOtpLimiter, verifyOtpLimiter } from "../middleware/limiter.js"
import { protector } from "../middleware/protector.js"
import { deleteAccount, getMe, updateProfile } from "../controller/userController.js"


const router = express.Router()


router.post("/auth/register", validator(createUserSchema), register)
router.post("/auth/login", validator(createLoginSchema),passwordLimiter, login)
router.post("/auth/verifyOtp",verifyOtpLimiter,validator(OtpSchema), verifyOtp)
router.post("/auth/resendOtp",resendOtpLimiter,validator(resendOtpSchema),resendOtp)
router.post("/auth/forgotPassword",validator(forgotPasswordSchema), passwordLimiter,forgotPassword)
router.patch("/auth/resetPassword/:token",validator(resetPasswordSchema),passwordLimiter,resetPassword)


router.use(protector)


router.get("/me",getMe)
router.patch("/me", validator(updateUserSchema) ,updateProfile)
router.patch("/updatePassword",validator(updatePasswordSchema),passwordLimiter,updatePassword)
router.post("/logout", logOut)
router.patch("/deleteAccount",validator(deleteAccountSchema),passwordLimiter,deleteAccount)

export default router