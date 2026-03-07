import type { NextFunction, Request, Response } from "express"
import joi from "joi"
import ErrorClass from "../utils/ErrorClass.js";




const validator = (schema: joi.ObjectSchema) => {
    return (req:Request, res:Response, next:NextFunction) => {
        const { error } = schema.validate(req.body, {
            abortEarly: false, // Return all errors, not just the first one
            stripUnknown: true, // Remove unknown properties
            errors: {
                wrap: {
                    label: false // Don't wrap error labels
                }
            }
        });
        if (error) {
            const message = error.details.map((el) => el.message).join(", ");
            return next(new ErrorClass(message, 400));
          }
          next();
    }
}

export default validator