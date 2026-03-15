import express from "express";
import "express-async-errors";
import mongoSanitize from "@exortek/express-mongo-sanitize";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";

import globalErrorHandler from "./controller/errorController.js";

import userRouter from "./routes/userRoute.js";
import shipmentRouter from "./routes/shipmentRoute.js";
import adminShipmentRouter from "./routes/adminShipmentRoute.js";
import trackingRouter from "./routes/shipmentTrackingRoute.js"

import errorHandler from "errorhandler";
import ErrorClass from "./utils/ErrorClass.js";


import shipmentTestRouter from "./routes/shipmentTestRoute.js";


const app = express();


if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(cors());
app.use(helmet());

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(mongoSanitize());



app.use("/api/v1/users", userRouter);
app.use("/api/v1/shipments", shipmentRouter);
app.use("/api/v1/tracking", trackingRouter);
app.use("/api/v1/admin", adminShipmentRouter);

app.use("/api/v1/test-shipments", shipmentTestRouter);

app.use((req, res, next) => {
  next(new ErrorClass(`Can't find route ${req.originalUrl} on this server!!`, 404));
});

app.use(globalErrorHandler);

if (process.env.NODE_ENV === "development") {
  app.use(errorHandler());
}

export default app;