import mongoose from "mongoose";

const shipmentSchema = new mongoose.Schema(
  {
    shipmentCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: ["PENDING", "ASSIGNED", "PICKED_UP", "IN_TRANSIT", "DELIVERED", "CANCELLED"],
      default: "PENDING",
    },
    pickupAddress: {
      type: String,
      required: true,
      trim: true,
    },
    dropoffAddress: {
      type: String,
      required: true,
      trim: true,
    },
    packageType: {
      type: String,
      required: true,
      trim: true,
    },
    pickupWindowStart: {
      type: Date,
      default: null,
    },
    pickupWindowEnd: {
      type: Date,
      default: null,
    },
    weight: {
      type: Number,
      required: true,
      min: 0,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "NGN",
      trim: true,
    },
    cancelReason: {
      type: String,
      default: null,
      trim: true,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    invoiceGenerated: {
      type: Boolean,
      default: false,
    },
    invoiceNumber: {
      type: String,
      default: null,
      trim: true,
    },
  },
  { timestamps: true }
);

const Shipment = mongoose.model("Shipment", shipmentSchema);

export default Shipment;
