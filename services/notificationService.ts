import { Resend } from "resend";
import ErrorClass from "../utils/ErrorClass.js";
import { getIo, getConnectedUserSocket } from "../socket.js";

type EmailNotificationPayload = {
  to: string;
  subject: string;
  message: string;
};

type PushNotificationPayload = {
  userId: string;
  event: string;
  message: string;
  data?: Record<string, unknown>;
};

type ShipmentCancelledPayload = {
  userId: string;
  email: string;
  shipmentCode: string;
};

type InvoiceGeneratedPayload = {
  userId: string;
  email: string;
  invoiceNumber: string;
};

const getResendClient = () => {
  if (!process.env.RESEND_API_KEY) {
    throw new ErrorClass("RESEND_API_KEY is not configured", 500);
  }

  return new Resend(process.env.RESEND_API_KEY);
};

export const sendEmailNotification = async ({
  to,
  subject,
  message,
}: EmailNotificationPayload) => {
  try {
    if (!process.env.RESEND_FROM_EMAIL) {
      throw new ErrorClass("RESEND_FROM_EMAIL is not configured", 500);
    }

    const resend = getResendClient();

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>PickUp Logistics</h2>
          <p>${message}</p>
        </div>
      `,
    });

    if (error) {
      console.error("RESEND ERROR:", error);
      throw new ErrorClass("Failed to send email notification", 500);
    }

    console.log("EMAIL SENT:", data);
    return data;
  } catch (error) {
    console.error("EMAIL NOTIFICATION FAILED:", error);
    throw error;
  }
};

export const sendPushNotification = async ({
  userId,
  event,
  message,
  data = {},
}: PushNotificationPayload) => {
  try {
    const io = getIo();
    const socketId = getConnectedUserSocket(userId);

    if (!socketId) {
      console.log(`User ${userId} is offline. No live socket notification sent.`);
      return;
    }

    io.to(socketId).emit(event, {
      message,
      ...data,
    });

    console.log(`SOCKET EVENT SENT to user ${userId}:`, event);
  } catch (error) {
    console.error("SOCKET NOTIFICATION FAILED:", error);
  }
};

export const notifyShipmentCancelled = async ({
  userId,
  email,
  shipmentCode,
}: ShipmentCancelledPayload) => {
  await sendEmailNotification({
    to: email,
    subject: "Shipment Cancelled",
    message: `Shipment ${shipmentCode} has been cancelled.`,
  });

  await sendPushNotification({
    userId,
    event: "shipment.cancelled",
    message: `Shipment ${shipmentCode} has been cancelled.`,
    data: { shipmentCode },
  });
};

export const notifyInvoiceGenerated = async ({
  userId,
  email,
  invoiceNumber,
}: InvoiceGeneratedPayload) => {
  await sendEmailNotification({
    to: email,
    subject: "Invoice Generated",
    message: `Invoice ${invoiceNumber} has been generated successfully.`,
  });

  await sendPushNotification({
    userId,
    event: "invoice.generated",
    message: `Invoice ${invoiceNumber} has been generated successfully.`,
    data: { invoiceNumber },
  });
};

export const notifyShipmentStatusChanged = async ({
  userId,
  email,
  shipmentCode,
  status,
  driverId,
}: {
  userId: string;
  email: string;
  shipmentCode: string;
  status: string;
  driverId?: string;
}) => {
  const statusMessages: Record<string, string> = {
    ASSIGNED: "A driver has been assigned to your shipment",
    PICKED_UP: "Your shipment has been picked up",
    IN_TRANSIT: "Your shipment is on the way",
    DELIVERED: "Your shipment has been delivered",
    CANCELLED: "Your shipment has been cancelled",
  };

  const message =
    statusMessages[status] ?? `Shipment status updated to ${status}`;

  await sendEmailNotification({
    to: email,
    subject: `Shipment Status Update: ${status}`,
    message: `${message} (${shipmentCode})`,
  });

  await sendPushNotification({
    userId,
    event: "shipment.status_changed",
    message,
    data: { shipmentCode, status, driverId },
  });
};
