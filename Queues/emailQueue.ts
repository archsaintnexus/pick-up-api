import dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: "./config.env" });
}

import { Queue } from "bullmq";

const connection = process.env.REDIS_URL
  ? { url: process.env.REDIS_URL }
  : {
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      tls: process.env.NODE_ENV === "production" ? {} : undefined,
      family: 4,
    };

const emailQueue = new Queue("emailQueue", {
  connection:
    process.env.NODE_ENV === "test"
      ? { host: "127.0.0.1", port: 6379, family: 4 }
      : (connection as any),
});

export default emailQueue;