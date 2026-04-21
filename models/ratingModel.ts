import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
  {
    shipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shipment",
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: null,
      trim: true,
    },
  },
  { timestamps: true },
);

const Rating = mongoose.model("Rating", ratingSchema);

export default Rating;
