import express from "express";
import "express-async-errors";
import mongoSanitize from "@exortek/express-mongo-sanitize";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser"
import responseTime from "response-time";



// individual routes
import userRouter from "./routes/userRoute.js";
import addressRouter from "./routes/addressRouter.js"
import shipmentRouter from "./routes/shipmentRoute.js";
import adminRouter from './routes/adminRouter.js'

// to handle errors
import "express-async-errors"
import errorHandler from "errorhandler";
import ErrorClass from "./utils/ErrorClass.js";

import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger.json" with { type: "json" };

//global error handler
import globalErrorHandler from "./controller/errorController.js";




const app = express();


if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(cors());
app.use(helmet());
app.use(responseTime())
app.use(cookieParser())

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(mongoSanitize());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// HEALTH CHECK ROUTE
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    service: "pick-up-logistics-api",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});


app.use("/api/v1/users", userRouter);
app.use("/api/v1/address",addressRouter)
app.use("/api/v1/shipments", shipmentRouter);
app.use("/api/v1/admin", adminRouter);

app.use((req, res, next) => {
  next(new ErrorClass(`Can't find route ${req.originalUrl} on this server!!`, 404));
});

app.use(globalErrorHandler);

if (process.env.NODE_ENV === "development") {
  app.use(errorHandler());
}

export default app;
