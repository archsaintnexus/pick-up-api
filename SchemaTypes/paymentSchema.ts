import joi from "joi";

export const initiatePaymentSchema = joi.object({
  method: joi.string().valid("card", "bank_transfer").required(),
});

export const updatePaymentStatusSchema = joi.object({
  status: joi.string().valid("success", "failed").required(),
});

export const uploadReceiptSchema = joi.object({
  receiptUrl: joi.string().uri().required(),
});
