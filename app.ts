import express from "express";
import mongoSanitize from "@exortek/express-mongo-sanitize";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import responseTime from "response-time";

import userRouter from "./routes/userRoute.js";
import addressRouter from "./routes/addressRouter.js";
import shipmentRouter from "./routes/shipmentRoute.js";
import trackingRouter from "./routes/shipmentTrackingRoute.js";
import invoiceRouter from "./routes/invoiceRoute.js";
import driverRouter from "./routes/driverRoute.js";
import vehicleRouter from "./routes/vehicleRoute.js";
import paymentRouter from "./routes/paymentRoute.js";
import { stripeWebhookHandler } from "./controller/paymentController.js";

import "express-async-errors";
import errorHandler from "errorhandler";
import ErrorClass from "./utils/ErrorClass.js";

import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger.json" with { type: "json" };

import globalErrorHandler from "./controller/errorController.js";

const app = express();

// Trust the first proxy (Render, Cloudflare) so that express-rate-limit
// can correctly read the client IP from X-Forwarded-For.
app.set("trust proxy", 1);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://localhost:3001",
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
app.use(helmet());
app.use(responseTime());
app.use(cookieParser());

// Stripe webhooks must receive the raw request body for signature verification.
// This route is registered BEFORE express.json() so the body is not pre-parsed.
// It also has no auth middleware — Stripe calls it directly with its own signature.
app.post(
  "/api/v1/payments/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhookHandler,
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(mongoSanitize());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "UP",
    service: "pick-up-logistics-api",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

app.use("/api/v1/users", userRouter);
app.use("/api/v1/address", addressRouter);
app.use("/api/v1/shipments", shipmentRouter);
app.use("/api/v1/tracking", trackingRouter);
app.use("/api/v1/invoices", invoiceRouter);
app.use("/api/v1/drivers", driverRouter);
app.use("/api/v1/vehicles", vehicleRouter);
app.use("/api/v1/payments", paymentRouter);

app.use((_req, _res, next) => {
  next(new ErrorClass(`Can't find route ${_req.originalUrl} on this server!!`, 404));
});

app.use(globalErrorHandler);

if (process.env.NODE_ENV === "development") {
  app.use(errorHandler());
}

export default app;
