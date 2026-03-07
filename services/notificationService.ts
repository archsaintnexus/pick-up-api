type NotificationPayload = {
  to?: string;
  subject?: string;
  message: string;
};

export const sendEmailNotification = async (payload: NotificationPayload) => {
  console.log("EMAIL TRIGGER:", payload);

  // Later:
  // use nodemailer or resend here
};

export const sendPushNotification = async (payload: NotificationPayload) => {
  console.log("PUSH TRIGGER:", payload);

  // Stub for now
};