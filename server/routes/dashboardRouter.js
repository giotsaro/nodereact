import express from "express";
import { updateDashboardFields, getDashboardData ,reserveCarrier} from "../controllers/dashboardController.js"; // Controllers
import { verifyToken, requireRole } from "../middleware/authMiddleware.js"; // Middleware

const router = express.Router();


// Dashboard Data Fetch Route
router.get("/", verifyToken, requireRole(["admin", "user", "sa"]), getDashboardData); // Fetch dashboard data
// Dashboard Update Route
router.put("/:id", verifyToken, requireRole(["admin", "sa", "user"]), updateDashboardFields); // Update dashboard fields

router.post("/reserve", verifyToken, requireRole(["admin", "sa", "user"]),  reserveCarrier);

export default router;
