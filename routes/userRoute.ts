import express from "express"

import { createUser } from "../controller/authController.js"
import validator from "../middleware/validator.js"
import { createUserSchema } from "../SchemaTypes/userSchema.js"


const router = express.Router()


router.post("/signUp", validator(createUserSchema),createUser)




export default router