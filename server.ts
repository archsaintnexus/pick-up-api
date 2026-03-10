import dotenv from "dotenv";
dotenv.config({ path: "./config.env" });
import app from "./app.js";
import connectDB from "./db.js";

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION... SHUTTING DOWN!!!");
  if (err instanceof Error) {
    console.log(err.stack);
    console.log(err.name);
    console.log(err.message);
  }
  process.exit(1);
});

connectDB(); // Connect to the DB here!!!!

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`App is running on port ${port} `);
});

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION...... SHUTTING DOWN !!!!");
  if (err instanceof Error) {
    console.log(err.stack);
    console.log(err.name);
    console.log(err.message);
  }
  server.close(() => {
    process.exit(1);
  });
});
