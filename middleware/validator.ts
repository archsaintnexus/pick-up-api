import type { NextFunction, Request, Response } from "express";
import joi from "joi";
import ErrorClass from "../utils/ErrorClass.js";

const validator = (schema: joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    void res;

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      errors: {
        wrap: {
          label: false,
        },
      },
    });

    if (error) {
      const message = error.details.map((el) => el.message).join(", ");
      return next(new ErrorClass(message, 400));
    }

    req.body = value;
    next();
  };
};

export default validator;
