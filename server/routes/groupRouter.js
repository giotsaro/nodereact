import express from "express";
import {
getGroups,
addGroup,  
updateGroup,
deleteGroup,
getGroupsOfUser

} from "../controllers/groupContoller.js";

import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();


// ყველა მომხმარებელი (მხოლოდ admin ან sa)
router.get("/", verifyToken, requireRole(["admin", "hr","sa","user"]), getGroups);

// ახალი მომხმარებლის დამატება (მხოლოდ admin ან sa)
router.post("/", verifyToken, requireRole(["admin", "hr","sa"]), addGroup);

// მომხმარებლის ჩასწორება (მხოლოდ admin ან sa)
router.put("/:id", verifyToken, requireRole(["admin", "hr","sa"]), updateGroup);

// მომხმარებლის წაშლა (მხოლოდ admin ან sa)
router.delete("/:id", verifyToken, requireRole(["admin", "hr","sa"]), deleteGroup);

router.get("/getGroupsOfUser", verifyToken, requireRole(["user"]), getGroupsOfUser);



export default router;
