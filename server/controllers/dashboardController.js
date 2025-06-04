import { db } from "../config/db.js";
import { io } from "../index.js";
import zipcodes from "zipcodes"; // ✅ დაამატე zipcodes ბიბლიოთეკა

export const updateDashboardFields = async (req, res) => {
  const { id } = req.params;
  const updatedFields = req.body;

  // დაამატე ახალი valid fields
  const validFields = ['zip', 'date', 'comments', 'onload', 'available'];
  const updates = [];
  const values = [];

  for (const [field, newValue] of Object.entries(updatedFields)) {
    if (validFields.includes(field)) {
      updates.push(`${field} = ?`);
      values.push(newValue);

      // თუ zip იცვლება, დაამატე location-ც
      if (field === 'zip') {
        const locationInfo = zipcodes.lookup(newValue);
        if (locationInfo) {
          const locationString = `${locationInfo.city}, ${locationInfo.state}`;
          updates.push(`location = ?`);
          values.push(locationString);
        } else {
          return res.status(400).json({ message: "Invalid ZIP code" });
        }
      }
    } else {
      return res.status(400).json({ message: `Invalid field name: ${field}` });
    }
  }

  if (updates.length === 0) {
    return res.status(400).json({ message: "No valid fields to update" });
  }

  values.push(id);

  try {
    const q = `UPDATE drivers SET ${updates.join(", ")} WHERE id = ?`;
    await db.query(q, values);

    // Socket.IO-თი აცნობე ცვლილებები
    io.emit("dashboardUpdated", { updatedFields, driverId: id });

    res.status(200).json({ message: "Driver updated successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating dashboard fields" });
  }
};







export const getDashboardData = async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;
  const { zip: filterZip, radius, search, group, hideOnLoad, hideUnavailable } = req.query;

  try {
    let drivers;

    if (userRole === "admin" || userRole === "sa") {
      if (group && group !== "all") {
        [drivers] = await db.query(
          `
          SELECT DISTINCT c.*, u.name AS reserved_by_name
          FROM drivers c
          LEFT JOIN users u ON c.reserved_by = u.id
          JOIN drivers_groups cg ON c.id = cg.driver_id
          JOIN groups g ON cg.group_id = g.id
          WHERE g.name = ?
          `,
          [group]
        );
      } else {
        [drivers] = await db.query(`
          SELECT c.*, u.name AS reserved_by_name 
          FROM drivers c
          LEFT JOIN users u ON c.reserved_by = u.id
        `);
      }
    } else {
      [drivers] = await db.query(
        `
        SELECT DISTINCT c.*, u.name AS reserved_by_name 
        FROM drivers c
        LEFT JOIN users u ON c.reserved_by = u.id
        JOIN driver_groups cg ON c.id = cg.driver_id
        JOIN user_groups ug ON cg.group_id = ug.group_id
        WHERE ug.user_id = ?
        ${group && group !== "all" ? "AND cg.group_id = (SELECT id FROM groups WHERE name = ?)" : ""}
        `,
        group && group !== "all" ? [userId, group] : [userId]
      );
    }

    const filterZipValid = zipcodes.lookup(filterZip);
    const radiusNumber = Number(radius);

    
drivers = drivers.map((driver) => {
  const driverZipValid = zipcodes.lookup(driver.zip);
  let distance = null;

  if (filterZipValid && driverZipValid) {
    distance = zipcodes.distance(filterZip, driver.zip);
  }


    // Format date
  let formattedDate = null;
  if (driver.date) {
    const dateObj = new Date(driver.date);
    formattedDate = dateObj.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,

    });
  }







  // Format insurance_date
  let formattedInsuranceDate = null;
  if (driver.insurance_date) {
    const dateObj = new Date(driver.insurance_date);
    formattedInsuranceDate = dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }

  // Format regisration_date
  let formattedRegistrationDate = null;
  if (driver.registration_date) {
    const dateObj = new Date(driver.registration_date);
    formattedRegistrationDate = dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }

 // console.log(driver.registration_date, formattedRegistrationDate);


  const lat = driverZipValid?.latitude || null;
  const lng = driverZipValid?.longitude || null;

  return {
    ...driver,
    distance: distance !== null ? distance : Infinity,
     date: formattedDate,
    insurance_date: formattedInsuranceDate,
    registration_date: formattedRegistrationDate,
    latitude: lat,
    longitude: lng,
  };
});


    // Filter by hideOnLoad if true: exclude drivers where onload = 1
    if (hideOnLoad === "true") {
      drivers = drivers.filter((driver) => driver.onload !== 1);
    }

    // Filter by hideUnavailable if true: exclude drivers where available = 0
    if (hideUnavailable === "true") {
      drivers = drivers.filter((driver) => driver.available !== 0);
    }

    // Filter by radius if provided
    if (filterZipValid && radius && !isNaN(radiusNumber)) {
      drivers = drivers.filter((driver) => driver.distance <= radiusNumber);
    }

    // Sort by distance
    drivers.sort((a, b) => a.distance - b.distance);

    // Optional search filter

      if (search && search.trim() !== "") {
        const searchLower = search.toLowerCase();
        drivers = drivers.filter((driver) => {
          return (
            driver.name?.toLowerCase().includes(searchLower) ||
            driver.zip?.toString().includes(searchLower) ||
            driver.distance?.toString().includes(searchLower) ||
            driver.unit?.toLowerCase().includes(searchLower)
          );
        });
      }





    // Load associated group names for each driver
    for (let driver of drivers) {
      const [groupRows] = await db.query(
        `SELECT g.name, g.description 
         FROM driver_groups cg 
         JOIN groups g ON cg.group_id = g.id 
         WHERE cg.driver_id = ?`,
        [driver.id]
      );
      driver.groups = groupRows.map((row) => ({
        name: row.name,
        description: row.description,
      }));
    }

    res.json(drivers);
  } catch (err) {
    console.error("Error in getDashboardData:", err);
    res.status(500).json({ message: "Error loading drivers" });
  }
};








export const reserveDriver = async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;
  const { driverId } = req.body;

  try {
    // გადაამოწმე გადამზიდავის სტატუსი
    const [driverRows] = await db.query(
      "SELECT reserved_by FROM drivers WHERE id = ?",
      [driverId]
    );

    if (driverRows.length === 0) {
      return res.status(404).json({ message: "driver not found" });
    }

    const reservedBy = driverRows[0].reserved_by;

    // თუ დარეზერვებულია სხვაზე და არც admin/sa ხარ — ვერ დააჯავშნე
    if (reservedBy && reservedBy !== userId && userRole !== "admin" && userRole !== "sa") {
      return res.status(400).json({ message: "driver is already reserved" });
    }

    // თუ დარეზერვებულია იმავე user-ზე ან admin/sa ხარ — გაუქმება
    if (reservedBy && (reservedBy === userId || userRole === "admin" || userRole === "sa")) {
      await db.query(
        "UPDATE drivers SET reserved_by = NULL, reserved_at = NULL WHERE id = ?",
        [driverId]
      );
      io.emit("dashboardUpdated");
      return res.status(200).json({ message: "Reservation cancelled" });
    }

    // სხვა შემთხვევაში — დაჯავშნა
    const now = new Date();
    await db.query(
      "UPDATE drivers SET reserved_by = ?, reserved_at = ? WHERE id = ?",
      [userId, now, driverId]
    );
    io.emit("dashboardUpdated");
    res.status(200).json({ message: "driver reserved successfully!" });

    // ავტომატური გაუქმება 15 წუთში
    setTimeout(async () => {
      const [checkAgain] = await db.query(
        "SELECT reserved_by FROM drivers WHERE id = ?",
        [driverId]
      );
   
      

      // თუ ისევ იმავე user-ზეა, გააუქმე
      if (checkAgain[0].reserved_by === userId) {
        await db.query(
          "UPDATE drivers SET reserved_by = NULL, reserved_at = NULL WHERE id = ?",
          [driverId]
        );
        io.emit("dashboardUpdated");
      }
    }, 15 * 60 * 1000);
    
  } catch (err) {
    console.error("Error reserving driver:", err);
    res.status(500).json({ message: "Failed to reserve driver" });
  }
};


