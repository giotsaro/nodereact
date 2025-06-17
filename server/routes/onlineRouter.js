//onlineRouter.js

import express from "express";
import { getOnlineUsers } from "../controllers/onlineController.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// ონლაინ მომხმარებლების სია (მხოლოდ admin ან sa)
router.get("/", verifyToken, requireRole(["admin", "sa"]), getOnlineUsers);

export default router;
