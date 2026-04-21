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
    weight: {
      type: Number,
      required: true,
      min: 0,
    },
    vehicleType: {
      type: String,
      enum: ["motorcycle", "car", "van", "truck"],
      required: true,
    },
    recipientName: {
      type: String,
      required: true,
      trim: true,
    },
    recipientPhone: {
      type: String,
      required: true,
      trim: true,
    },
    pickupDate: {
      type: Date,
      required: true,
    },
    timeWindow: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    specialInstructions: {
      type: String,
      default: null,
      trim: true,
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
