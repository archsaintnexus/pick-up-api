import dotenv from "dotenv";
dotenv.config({ path: "./config.env" });

import app from "./app.js";
import connectDB from "./db.js";
import { initSocket } from "./socket.js";
import { registerEventListeners } from "./events/registerEventListeners.js";
import { Server } from "socket.io";

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

const port = process.env.PORT || 3000;

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

// Socket Connection
export const io = new Server(server, {
    cors: { 
        origin: "*" ,
        methods: ["GET", "POST"]
    }
})

io.on("connection", (socket) => {
    console.log("A user connected: ", socket.id);

    //Room
    socket.on("join_tracking_room", (trackingNumber: string) => {
        const roomId = `tracking_${trackingNumber}`
        socket.join(roomId)
        console.log(`Client joined room: ${roomId}`);

        socket.emit("joined_room", { roomId, trackingNumber })
    });

    socket.on("leave_tracking_room", (trackingNumber: string) => {
        const roomId = `tracking_${trackingNumber}`;
        socket.leave(roomId);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected: ", socket.id)
    })
})






