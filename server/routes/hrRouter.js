import express from "express";
import { getHRStats } from "../controllers/hrController.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();



router.get("/", verifyToken, requireRole(["admin", "hr", "sa"]), getHRStats);

export default router;
