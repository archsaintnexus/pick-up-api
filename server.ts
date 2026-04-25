import dotenv from "dotenv";
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: './config.env' })
}

import app from "./app.js";
import connectDB from "./db.js";
import { initSocket } from "./socket.js";
import { registerEventListeners } from "./events/registerEventListeners.js";
import "./worker/emailWorker.js";

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION... SHUTTING DOWN!!!");
  if (err instanceof Error) {
    console.log(err.stack);
    console.log(err.name);
    console.log(err.message);
  }
  process.exit(1);
});


connectDB();

registerEventListeners();

const port = process.env.PORT || 8000;

const server = app.listen(port, () => {
    console.log(`App is running on port ${port} `);
});


initSocket(server);

process.on("unhandledRejection", (err) => {
    console.log("UNHANDLED REJECTION...... SHUTTING DOWN !!!!")
    if (err instanceof Error) {
        console.log(err.stack)
        console.log(err.name);
        console.log(err.message);
      }
    server.close(() => {
         process.exit(1)
     })
})
