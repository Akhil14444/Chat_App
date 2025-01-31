import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173", // Allow local frontend
      "https://chat-app-1-y0cp.onrender.com", // Allow deployed frontend
    ],
    credentials: true,
  },
});

// Used to store online users { userId: socketId }
const userSocketMap = {};

// Function to get receiver's socket ID (only if online)
export function getReceiverSocketId(userId) {
  const socketId = userSocketMap[userId];
  return socketId && io.sockets.sockets.get(socketId) ? socketId : null;
}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  // Store userId with socketId
  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  // Notify all clients about online users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Check if a user is online
  socket.on("check-user-online", (receiverUserId) => {
    const receiverSocketId = getReceiverSocketId(receiverUserId);
    socket.emit("user-online-status", {
      userId: receiverUserId,
      isOnline: !!receiverSocketId,
    });
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);

    // Find userId by socketId before deleting
    const userId = Object.keys(userSocketMap).find(
      (key) => userSocketMap[key] === socket.id
    );

    if (userId) {
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });
});

export { io, app, server };
