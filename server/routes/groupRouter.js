import express from "express";
import {
getGroups,
addGroup,  
updateGroup,
deleteGroup,

} from "../controllers/groupContoller.js";

import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// ყველა მომხმარებელი (მხოლოდ admin ან sa)
router.get("/", verifyToken, requireRole(["admin", "sa"]), getGroups);

// ახალი მომხმარებლის დამატება (მხოლოდ admin ან sa)
router.post("/", verifyToken, requireRole(["admin", "sa"]), addGroup);

// მომხმარებლის ჩასწორება (მხოლოდ admin ან sa)
router.put("/:id", verifyToken, requireRole(["admin", "sa"]), updateGroup);

// მომხმარებლის წაშლა (მხოლოდ admin ან sa)
router.delete("/:id", verifyToken, requireRole(["admin", "sa"]), deleteGroup);

export default router;
