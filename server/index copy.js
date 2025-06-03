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
import carrierInsuranceCron from "./cron/carrierInsurance.js";



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
app.use("/api/groups",groupRouter );

carrierInsuranceCron(io);



// Socket.IO connection
io.on("connection", (socket) => {
  console.log("🟢 New client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
