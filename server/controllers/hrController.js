import { db } from "../config/config.js";
import { io } from "../index.js";

// Get total counts of drivers and billing records
export const getHRStats = async (req, res) => {
  try {
    // Count drivers
    const [driverCountResult] = await db.execute("SELECT COUNT(*) as count FROM drivers");
    const driverCount = driverCountResult[0].count;

    // Count billing
    const [billingCountResult] = await db.execute("SELECT COUNT(*) as count FROM billing");
    const billingCount = billingCountResult[0].count;

    // Optional: emit event via socket.io
    // io.emit("hrStatsUpdated", { driverCount, billingCount });

    res.status(200).json({
      driverCount,
      billingCount,
    });
  } catch (error) {
    console.error("Error fetching HR stats:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
