import Rating from "../models/ratingModel.js";
import Shipment from "../models/shipmentModel.js";
import ErrorClass from "../utils/ErrorClass.js";

type CreateRatingInput = {
  shipmentId: string;
  userId: string;
  rating: number;
  comment?: string;
};

export const createRating = async (payload: CreateRatingInput) => {
  const shipment = await Shipment.findById(payload.shipmentId);
  if (!shipment) {
    throw new ErrorClass("Shipment not found", 404);
  }

  if (shipment.status !== "DELIVERED") {
    throw new ErrorClass("You can only rate a delivered shipment", 400);
  }

  const existing = await Rating.findOne({ shipment: payload.shipmentId });
  if (existing) {
    throw new ErrorClass("This shipment has already been rated", 409);
  }

  const rating = await Rating.create({
    shipment: payload.shipmentId,
    user: payload.userId,
    rating: payload.rating,
    comment: payload.comment ?? null,
  });

  return rating;
};
