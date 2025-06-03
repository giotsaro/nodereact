import express from "express";
import { getCarriers, getCarrierById, addCarrier, updateCarrier, deleteCarrier } from "../controllers/carrierController.js";
import { updateDashboardFields ,getDashboardData } from "../controllers/dashboardController.js"; // ახალი ფუნქცია
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";
import { db } from "../config/db.js"; // საჭიროა `deleted-carriers` route-ისთვის
const router = express.Router();

// 🔐 წაშლილი გადამზიდების ნახვა მხოლოდ `sa` როლისთვის
router.get("/deleted-carriers", verifyToken, requireRole(["sa"]), async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM deleted_carriers ORDER BY deleted_at DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching deleted carriers" });
  }
});

// ყველა გადამზიდავის მიღება
router.get("/", verifyToken, requireRole(["admin", "sa"]), getCarriers);

// კონკრეტული გადამზიდავის დეტალები
router.get("/:id", verifyToken, requireRole(["admin", "sa"]), getCarrierById);

// ახალი გადამზიდავის დამატება
router.post("/", verifyToken, requireRole(["admin", "sa"]), addCarrier);

// გადამზიდავის განახლება
router.put("/:id", verifyToken, requireRole(["admin", "sa"]), updateCarrier);

// გადამზიდავის წაშლა
router.delete("/:id", verifyToken, requireRole(["admin", "sa"]), deleteCarrier);


export default router;
