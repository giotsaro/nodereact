import { db, config } from './config/config.js';
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import http from "http";
import { Server } from "socket.io";

// Routes
import authRoutes from "./routes/authRoutes.js";
import UsersRouter from "./routes/UsersRouter.js";
import driverRouter from "./routes/driverRouter.js";
import dashboardRouter from "./routes/dashboardRouter.js";
import groupRouter from "./routes/groupRouter.js";
import onlineRouter from "./routes/onlineRouter.js";
import hrRouter from "./routes/hrRouter.js";
import billingRouter from "./routes/billingRouter.js";

// Cron Jobs
import driverInsuranceCron from "./cron/driverInsurance.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Setup Socket.IO
export const io = new Server(server, {
  cors: {
   // origin: "https://caucasusgroup.com", // შეცვალე საჭიროების შემთხვევაში
    origin: "http://localhost:5173", // შეცვალე საჭიროების შემთხვევაში
    credentials: true,
  },
});

// Middleware
app.use(cors({
   origin: "http://localhost:5173",
  //origin: "https://caucasusgroup.com", // შეცვალე საჭიროების შემთხვევაში
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Test Route
app.get("/", (req, res) => {
  res.send("v1 API is running...");
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", UsersRouter);
app.use("/api/drivers", driverRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/groups", groupRouter);
app.use("/api/online", onlineRouter);
app.use("/api/hr", hrRouter);
app.use("/api/billing", billingRouter);

// Start Cron Jobs
driverInsuranceCron(io);

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
  });
});

// Start server
const PORT = config.port || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
