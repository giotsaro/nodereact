//index.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import UsersRouter from "./routes/UsersRouter.js";
import carrierRouter from "./routes/carrierRouter.js";
import dashboardRouter from "./routes/dashboardRouter.js";
import groupRouter from "./routes/groupRouter.js";
import jwt from "jsonwebtoken";

import onlineRouter from "./routes/onlineRouter.js";
import carrierInsuranceCron from "./cron/carrierInsurance.js";
import { saveSocketId, removeSocketId, fetchOnlineUsers } from "./controllers/onlineController.js";

import http from "http";
import { Server } from "socket.io";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Setup Socket.IO
export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", UsersRouter);
app.use("/api/carriers", carrierRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/groups", groupRouter);
app.use("/api/online", onlineRouter);


carrierInsuranceCron(io);




// Socket.IO connection
io.on("connection", async (socket) => {
  console.log("🟢 Connected:", socket.id, "User ID:", socket.user?.id);

  if (socket.user?.id) {
    try {
      await saveSocketId(socket.user.id, socket.id);
    } catch (err) {
      console.error("Error saving socket ID:", err.message);
    }
  }

  socket.on("disconnect", async () => {
    console.log("🔴 Disconnected:", socket.id);
    try {
      await removeSocketId(socket.id);
    } catch (err) {
      console.error("Error removing socket ID:", err.message);
    }
  });
});


// Socket.IO Auth Middleware
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Authentication required"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    console.error("❌ Socket Auth Error:", err.message);
    next(new Error("Invalid token"));
  }
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
