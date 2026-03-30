import mongoose, { Document, Schema } from "mongoose";
import { SHIPMENT_STATUSES, type ShipmentStatus } from "../constants/shipmentStatus.js";

// Sub Schemas
const TrackingEventSchema = new Schema({
    status: {
        type: String,
        enum: SHIPMENT_STATUSES,
        required: true
    },
    note: { 
        type: String 
    },
    updatedBy: { 
        type: Schema.Types.ObjectId, 
        ref: 'User' 
    },
    timestamp: { 
        type: Date, 
        default: Date.now 
    }
},{
    _id: true
});


const PODSchema = new Schema({
    imageUrl: {
        type: String,
        required: true
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    },
    uploadedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    recipientName: {
        type: String
    },
});


// Main Schema
const ShipmentTrackingSchema = new Schema(
    {
        shipmentId: {
            type: Schema.Types.ObjectId,
            ref: 'Shipment',
            required: true,
            unique: true,
        },
        trackingNumber: {
            type: String,
            required: true,
            unique: true,
        },
        currentStatus: {
            type: String,
            enum: SHIPMENT_STATUSES,
            default: 'PENDING'
        },
        timeline: [TrackingEventSchema],
        pod: PODSchema,
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        socketRoomId: {
            type: String,
            index: true
        }
    },
    {
        timestamps: true
    }
);

export interface IShipmentTracking extends Document {
  shipmentId: mongoose.Types.ObjectId;
  trackingNumber: string;
  currentStatus: ShipmentStatus;
  timeline: Array<{
    status: ShipmentStatus;
    note?: string;
    updatedBy?: mongoose.Types.ObjectId;
    timestamp: Date;
  }>;
  pod?: {
    imageUrl: string;
    uploadedAt: Date;
    uploadedBy?: mongoose.Types.ObjectId;
    recipientName?: string;
  };
  //notifications: mongoose.Types.ObjectId[];
  estimatedDelivery?: Date;
  assignedDriver?: mongoose.Types.ObjectId | null;
  user: mongoose.Types.ObjectId;
  socketRoomId: string;
}

export const ShipmentTracking = mongoose.model<IShipmentTracking>("ShipmentTracking", ShipmentTrackingSchema);