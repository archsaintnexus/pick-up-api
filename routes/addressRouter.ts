import express from "express"
import { protector } from "../middleware/protector.js"
import { createAddress, deleteAddress, getAllAddress, setDefault, updateAddress } from "../controller/addressController.js"
import { createAddressSchema, updateAddressSchema } from "../SchemaTypes/addressSchema.js"
import validator from "../middleware/validator.js"
import { restrictTo } from "../middleware/restrictTo.js"



const router = express.Router()



// this route is not accessible to drivers and business also  users that aren't logged in aren't allowed here
router.use(protector,restrictTo("customer"))

router.route("/").get(getAllAddress).post(validator(createAddressSchema),createAddress)
router.route("/:addressId").patch(validator(updateAddressSchema), updateAddress).delete(deleteAddress)
router.route("/:addressId/set-default").patch(setDefault)




export default router 