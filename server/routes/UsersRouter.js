import express from "express";
import {
  getUsers,
  addUser,
  updateUser,
  deleteUser,
} from "../controllers/usersController.js";

import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// ყველა მომხმარებელი (მხოლოდ admin ან sa)
router.get("/", verifyToken, requireRole(["admin", "sa"]), getUsers);

// ახალი მომხმარებლის დამატება (მხოლოდ admin ან sa)
router.post("/", verifyToken, requireRole(["admin", "sa"]), addUser);

// მომხმარებლის ჩასწორება (მხოლოდ admin ან sa)
router.put("/:id", verifyToken, requireRole(["admin", "sa"]), updateUser);

// მომხმარებლის წაშლა (მხოლოდ admin ან sa)
router.delete("/:id", verifyToken, requireRole(["admin", "sa"]), deleteUser);

export default router;
