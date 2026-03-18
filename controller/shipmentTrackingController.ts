import type { NextFunction, Request, Response } from "express";
import { nanoid } from "nanoid";
import { ShipmentTracking } from "../models/shipmentTrackingModel.js";
import ErrorClass from "../utils/ErrorClass.js";
import { io } from "../server.js";
import { sendPushNotification } from "../services/notificationService.js";
import { STATUS_MESSAGES } from "../constants/shipmentStatus.js";
import User from "../models/userModel.js";
import Shipment from "../models/shipmentModel.js";

// POST 
export const createTracking = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const trackingNumber = `TRK-${nanoid(10).toUpperCase()}`;
        const { shipmentId, userId } = req.body;

        const user = await User.findOne({
            _id: userId
        });

        if(!user){
            return next(new ErrorClass("Unauthorized user", 401));
        }

        const shipment = await Shipment.findOne({
            _id: shipmentId
        });

        if(!shipment){
            return next(new ErrorClass("Shipment not found", 404));
        }

        const socketRoomId = `tracking_${trackingNumber}`;

        const existingTracking = await ShipmentTracking.findOne({ trackingNumber });

        if (existingTracking) {
            return next(new ErrorClass("Tracking already exists for this shipment", 409));
        }

        const tracking = await ShipmentTracking.create({
            shipmentId,
            trackingNumber,
            user: userId,
            socketRoomId,
            currentStatus: "PENDING",
            timeline: [{
                status: "PENDING",
                timestamp: new Date()
            }]
        });


        await sendPushNotification({
            userId,
            event: "tracking_created",
            message: `Tracking set up for shipment ${trackingNumber}`,
            data: { trackingNumber, socketRoomId }
        });

        return res.status(201).json({
            status: "success",
            message: "Tracking created successfully",
            data: {
                tracking,
                socketRoomId
            }
        });
    } catch (error) {
        next(error);
    }
}


// PATCH
export const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { trackingNumber } = req.params;
        const { status, note, updatedBy } = req.body;

        if(status === "PENDING"){
            return next(new ErrorClass("Status cannot be set back to PENDING", 400));
        }

        if(status === "DELIVERED"){
            return next(new ErrorClass("use the /pod endpoint to mark as delivered", 400));
        }

       const existingTracking = await ShipmentTracking.findOne({ trackingNumber });

        if (!existingTracking) {
            return next(new ErrorClass("Tracking not found", 404));
        }

        if (existingTracking.currentStatus === status) {
            return next(new ErrorClass("Shipment is already at this status", 409));
        }
        

        const statusUpdate = await ShipmentTracking.findOneAndUpdate(
            {trackingNumber},
            {
                currentStatus: status,
                $push: {
                    timeline: {
                        status,
                        note,
                        updatedBy,
                        timestamp: new Date()
                    }
                }
            },
            { new: true }
        );

        if(!statusUpdate){
            return next(new ErrorClass("Update not found", 404));
        }

        if (!statusUpdate.socketRoomId) {
            return next(new ErrorClass("Socket room not found", 400));
        }

        const roomId = statusUpdate.socketRoomId

        io.to(roomId).emit("status_updated", {
            trackingNumber,
            currentStatus: status,
            note,
            timestamp: new Date()
        });

        const notificationMessage = STATUS_MESSAGES[status] ?? `Your shipment status has been updated to ${status}`;

        await sendPushNotification({
            userId: existingTracking.user.toString(),
            event: "status_updated",
            message: notificationMessage,
            data: { trackingNumber, currentStatus: status }
        });

        return res.status(200).json({
            status: "success",
            message: "Tracking status updated successfully",
            data:{
                statusUpdate
            }
        });
    } catch (error) {
        next(error);
    }
}

export const uploadPOD = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { trackingNumber } = req.params;
        const { imageUrl, uploadedBy, recipientName } = req.body;

        if(!imageUrl || !recipientName){
            return next(new ErrorClass("All fields are required", 400));
        }

        const podData = await ShipmentTracking.findOneAndUpdate(
            {trackingNumber},
            {
                currentStatus: "DELIVERED",
                pod: {
                    imageUrl,
                    uploadedBy,
                    recipientName
                },
                $push: {
                    timeline: {
                        status: "DELIVERED",
                        note: `Package delivered. Received by ${recipientName}`,
                        updatedBy: uploadedBy,
                        timestamp: new Date()
                    }
                }
            },
            { new: true }
        );

        if(!podData){
            return next(new ErrorClass("Shipment not found", 404));
        }

        if (!podData.socketRoomId) {
            return next(new ErrorClass("Socket room not found", 400));
        }

        const roomId = podData.socketRoomId; 

        io.to(roomId).emit("pickup_completed", {
            trackingNumber,
            currentStatus: "DELIVERED",
            pod: {
                imageUrl,
                uploadedBy,
                recipientName
            },
            timestamp: new Date()
        });

        io.to(roomId).emit("tracking_complete", { trackingNumber });

        await sendPushNotification({
            userId: podData.user.toString(),
            event: "pickup_completed",
            message: `Your shipment has been delivered to ${recipientName}`,
            data: { trackingNumber, recipientName }
        });

        return res.status(200).json({
            status: "success",
            message: "Proof of delivery updated successfully",
            data: {
                podData
            }
        });
    } catch (error) {
        next(error);
    }
}


// GET
export const getTracking = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { trackingNumber } = req.params;

        const tracking = await ShipmentTracking.findOne({
            trackingNumber
        });

        if(!tracking){
            return next(new ErrorClass("Tracking number not found", 404));
        };

        return res.status(200).json({
            status: "success",
            message: "Tracking retrieved successfully",
            data: {
                tracking
            }
        });
    } catch (error) {
        next(error);
    }
}

export const getTimeline = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { trackingNumber } = req.params;

        const tracking = await ShipmentTracking.findOne({
            trackingNumber
        });

        if(!tracking){
            return next(new ErrorClass("Tracking number not found", 404));
        };

        return res.status(200).json({
            status: "success",
            message: "Timeline retrieved successfully",
            data: {
                timeline: tracking.timeline
            }
        });
    } catch (error) {
        next(error);
    }
}
export const getPOD = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { trackingNumber } = req.params;

        const tracking = await ShipmentTracking.findOne({
            trackingNumber
        });

        if(!tracking){
            return next(new ErrorClass("Tracking number not found", 404));
        };

        return res.status(200).json({
            status: "success",
            message: "Proof of delivery retrieved successfully",
            data: {
                pod: tracking.pod
            }
        });
    } catch (error) {
        next(error);
    }
}
