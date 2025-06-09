//index.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import UsersRouter from "./routes/UsersRouter.js";
import driverRouter from "./routes/driverRouter.js";
import dashboardRouter from "./routes/dashboardRouter.js";
import groupRouter from "./routes/groupRouter.js";
import driverInsuranceCron from "./cron/driverInsurance.js";
import onlineRouter from "./routes/onlineRouter.js";
import hrRouter from "./routes/hrRouter.js";
import billingRouter from "./routes/billingRouter.js";



import http from "http";
import { Server } from "socket.io";



dotenv.config();

const app = express();
const server = http.createServer(app);

// Setup Socket.IO
export const io = new Server(server, {
  cors: {
    origin: "https://caucasusgroup.com",
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: "https://caucasusgroup.com",
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
app.use("/api/drivers", driverRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/groups",groupRouter );
app.use("/api/online", onlineRouter);
app.use("/api/hr" , hrRouter);
app.use("/api/billing", billingRouter);

driverInsuranceCron(io);




// Socket.IO connection
io.on("connection", (socket) => {
  console.log("🟢 client connected:", socket.id);
  

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
  });
}); 





// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
