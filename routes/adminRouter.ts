import express from "express"
import { protector } from "../middleware/protector.js"
import {
    getAllShipments,
    getSingleShipmentAdmin,
  } from "../controller/adminShipmentController.js";
import { restrictTo } from "../middleware/restrictTo.js"
import validator from "../middleware/validator.js";
import { adminSchema, createLoginSchema } from "../SchemaTypes/userSchema.js";
import { login, register } from "../controller/authController.js";


const router = express.Router()

router.post("/auth/register",validator(adminSchema),register)
router.post("/auth/login",validator(createLoginSchema),login)


router.use(protector,restrictTo("admin"))


router.get("/shipments", getAllShipments);
router.get("/shipments/:shipmentId", getSingleShipmentAdmin);




export default router