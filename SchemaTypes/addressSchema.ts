import joi from "joi"


export const createAddressSchema = joi.object({
    street: joi.string().min(3).max(120).required(),
    state: joi.string().min(2).max(60).required(),
    label: joi.string().min(2).max(40).default("home"),
    postalCode:joi.string().pattern(/^[A-Za-z0-9 ]+$/).optional()
})


export const updateAddressSchema = joi.object({
    street: joi.string().min(3).max(120).optional(),
    state: joi.string().min(2).max(60).optional(),
    label: joi.string().min(2).max(40).optional(),
    postalCode:joi.string().pattern(/^[A-Za-z0-9 ]+$/).optional()

})





