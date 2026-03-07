type NotificationPayload = {
  to?: string;
  subject?: string;
  message: string;
};

export const sendEmailNotification = async (payload: NotificationPayload) => {
  console.log("EMAIL TRIGGER:", payload);


};

export const sendPushNotification = async (payload: NotificationPayload) => {
  console.log("PUSH TRIGGER:", payload);

};