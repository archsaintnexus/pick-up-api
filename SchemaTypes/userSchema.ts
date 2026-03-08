import joi from "joi"



export const createUserSchema = joi.object({
    fullName: joi.string().min(6).max(30).required(),
    email: joi.string().email().required(),
    companyName: joi.when("role", {
        is: "business",
        then: joi.string().required(),
        otherwise:joi.string().optional()
    }),
    companyAddress: joi.when("role", {
        is: "business",
        then: joi.string().required(),
        otherwise:joi.string().optional()
    }),
    role:joi.string().valid("customer","business","admin","driver").default("customer"),
    password: joi.string().min(8).max(30).pattern(new RegExp('^[a-zA-Z0-9]{8,30}$')).required().messages({
        "string.pattern.base": "Password must be 8-30 characters and contain only letters and numbers",
      }),
    confirmPassword: joi.any().valid(joi.ref("password")).required().messages({
        "any.only": "Passwords do not match",
        "any.required": "Please confirm your password",
    })

})


export const createLoginSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().pattern(new RegExp('^[a-zA-Z0-9]{8,30}$')).required().messages({
        "string.pattern.base": "Password must be 8-30 characters and contain only letters and numbers",
    })

})


export const forgotPasswordSchema = joi.object({
    email: joi.string().email().required(),
})

