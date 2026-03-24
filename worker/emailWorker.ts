import dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: "./config.env" });
}

import { Worker } from "bullmq";
import EmailService from "../services/Email.js";

const connection = process.env.REDIS_URL
  ? { url: process.env.REDIS_URL }
  : {
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      tls: process.env.NODE_ENV === "production" ? {} : undefined,
      family: 4,
    };

const emailWorker = new Worker(
  "emailQueue",
  async (job) => {
    switch (job.name) {
      case "sendOtp": {
        const { email, otp } = job.data;
        await EmailService.sendOtp(email, otp);
        break;
      }

      case "resetPassword": {
        const { email, resetUrl } = job.data;
        await EmailService.sendPasswordResetLink(email, resetUrl);
        break;
      }

      case "email_verified/account_verified": {
        const { email, fullName } = job.data;
        await EmailService.sendWelcomeEmail(email, fullName);
        break;
      }

      case "updatePasswordMail": {
        const { email } = job.data;
        await EmailService.sendUpdatePasswordMail(email);
        break;
      }

      case "resetPasswordMail": {
        const { email } = job.data;
        await EmailService.sendResetPasswordConfirmEmail(email);
        break;
      }

      default:
        console.log(`Unknown job name: ${job.name}`);
    }
  },
  {
    connection:
      process.env.NODE_ENV === "test"
        ? { host: "127.0.0.1", port: 6379, family: 4 }
        : (connection as any),
  }
);

console.log("Worker is listening for jobs...");

emailWorker.on("completed", (job) => {
  console.log(`Job:${job.id}, completed`);
});

emailWorker.on("failed", (job, err) => {
  console.log(`Job:${job?.id}, failed!`, err);
});

emailWorker.on("progress", (job) => {
  console.log(`Job:${job.id}, in progress`);
});

emailWorker.on("error", (err) => {
  console.error("Email worker error:", err.message);
});

export default emailWorker;