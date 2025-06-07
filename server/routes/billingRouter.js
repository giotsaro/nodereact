import express from "express";
import {
  getBilling,
  addBilling,
  updateBilling,
  deleteBilling,
  getBillingById,
} from "../controllers/billingContoller.js";

import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// ყველა Billing (მხოლოდ admin ან hr ან sa)
router.get("/", verifyToken, requireRole(["admin", "hr", "sa"]), getBilling);

router.get("/:id", verifyToken, requireRole(["admin", "hr", "sa"]), getBillingById);

// ახალი Billing-ის დამატება (მხოლოდ admin ან hr ან sa)
router.post("/", verifyToken, requireRole(["admin", "hr", "sa"]), addBilling);

// Billing-ის ჩასწორება (მხოლოდ admin ან hr ან sa)
router.put("/:id", verifyToken, requireRole(["admin", "hr", "sa"]), updateBilling);

// Billing-ის წაშლა (მხოლოდ admin ან hr ან sa)
router.delete("/:id", verifyToken, requireRole(["admin", "hr", "sa"]), deleteBilling);

export default router;