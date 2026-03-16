import joi from "joi"


export const createAddressSchema = joi.object({
    street: joi.string().min(3).max(120).required(),
    city: joi.string().min(2).max(60).required(),
    state: joi.string().min(2).max(60).required(),
    label: joi.string().min(2).max(40).default("home"),
    country:joi.string().min(2).max(100).default("Nigeria"),
    postalCode:joi.string().pattern(/^[A-Za-z0-9 ]+$/).optional()
})


export const updateAddressSchema = joi.object({
    street: joi.string().min(3).max(120).optional(),
    city: joi.string().min(2).max(60).optional(),
    state: joi.string().min(2).max(60).optional(),
    label: joi.string().min(2).max(40).optional(),
    postalCode: joi.string().pattern(/^[A-Za-z0-9 ]+$/).optional(),
    country:joi.string().min(2).max(100).default("Nigeria").optional(),

})





