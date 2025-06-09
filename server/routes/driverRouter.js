import express from "express";
import { getDrivers, getDriverById, addDriver, updateDriver, deleteDriver } from "../controllers/driverController.js";
import { updateDashboardFields ,getDashboardData } from "../controllers/dashboardController.js"; // ახალი ფუნქცია
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";
import { db } from "../config/config.js"; // საჭიროა `deleted_drivers` route-ისთვის
const router = express.Router();

// 🔐 წაშლილი გადამზიდების ნახვა მხოლოდ `sa` როლისთვის
router.get("/deleted-drivers", verifyToken, requireRole(["sa"]), async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM deleted_drivers ORDER BY deleted_at DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching deleted drivers" });
  }
});

// ყველა გადამზიდავის მიღება
router.get("/", verifyToken, requireRole(["admin", "hr","sa"]), getDrivers);

// კონკრეტული გადამზიდავის დეტალები
router.get("/:id", verifyToken, requireRole(["admin", "hr","sa"]), getDriverById);

// ახალი გადამზიდავის დამატება
router.post("/", verifyToken, requireRole(["admin", "hr","sa"]), addDriver);

// გადამზიდავის განახლება
router.put("/:id", verifyToken, requireRole(["admin", "hr","sa"]), updateDriver);

// გადამზიდავის წაშლა
router.delete("/:id", verifyToken, requireRole(["admin", "hr","sa"]), deleteDriver);


export default router;
