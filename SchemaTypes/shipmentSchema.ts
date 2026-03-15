import joi from "joi";

const shipmentStatuses = [
  "PENDING",
  "ASSIGNED",
  "PICKED_UP",
  "IN_TRANSIT",
  "DELIVERED",
  "CANCELLED",
];

export const cancelShipmentSchema = joi.object({
  reason: joi.string().min(3).max(200).required(),
});

export const createShipmentSchema = joi
  .object({
    userId: joi.string().hex().length(24).required(),
    pickupAddress: joi.string().trim().min(3).max(200).required(),
    dropoffAddress: joi.string().trim().min(3).max(200).required(),
    packageType: joi.string().trim().min(2).max(100).required(),
    weight: joi.number().positive().required(),
    price: joi.number().min(0).required(),
    currency: joi.string().trim().uppercase().length(3).default("NGN"),
    pickupWindowStart: joi.date().iso().optional(),
    pickupWindowEnd: joi
      .date()
      .iso()
      .greater(joi.ref("pickupWindowStart"))
      .optional()
      .messages({
        "date.greater":
          "pickupWindowEnd must be later than pickupWindowStart",
      }),
  })
  .custom((value, helpers) => {
    const hasStart = Boolean(value.pickupWindowStart);
    const hasEnd = Boolean(value.pickupWindowEnd);

    if (hasStart !== hasEnd) {
      return helpers.error("any.invalid");
    }

    return value;
  }, "pickup window validation")
  .messages({
    "any.invalid":
      "pickupWindowStart and pickupWindowEnd must both be provided together",
  });

export const shipmentHistoryQuerySchema = joi.object({
  status: joi.string().valid(...shipmentStatuses).optional(),
  from: joi.date().optional(),
  to: joi.date().optional(),
  page: joi.number().integer().min(1).default(1),
  limit: joi.number().integer().min(1).max(100).default(10),
});

export const adminShipmentQuerySchema = joi.object({
  status: joi.string().valid(...shipmentStatuses).optional(),
  assignedDriver: joi.string().optional(),
  from: joi.date().optional(),
  to: joi.date().optional(),
  page: joi.number().integer().min(1).default(1),
  limit: joi.number().integer().min(1).max(100).default(10),
});
