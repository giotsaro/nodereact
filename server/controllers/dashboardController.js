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
    const q = `UPDATE carriers SET ${updates.join(", ")} WHERE id = ?`;
    await db.query(q, values);

    // Socket.IO-თი აცნობე ცვლილებები
    io.emit("dashboardUpdated", { updatedFields, carrierId: id });

    res.status(200).json({ message: "Carrier updated successfully!" });
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
    let carriers;

    if (userRole === "admin" || userRole === "sa") {
      if (group && group !== "all") {
        [carriers] = await db.query(
          `
          SELECT DISTINCT c.*, u.name AS reserved_by_name
          FROM carriers c
          LEFT JOIN users u ON c.reserved_by = u.id
          JOIN carrier_groups cg ON c.id = cg.carrier_id
          JOIN groups g ON cg.group_id = g.id
          WHERE g.name = ?
          `,
          [group]
        );
      } else {
        [carriers] = await db.query(`
          SELECT c.*, u.name AS reserved_by_name 
          FROM carriers c
          LEFT JOIN users u ON c.reserved_by = u.id
        `);
      }
    } else {
      [carriers] = await db.query(
        `
        SELECT DISTINCT c.*, u.name AS reserved_by_name 
        FROM carriers c
        LEFT JOIN users u ON c.reserved_by = u.id
        JOIN carrier_groups cg ON c.id = cg.carrier_id
        JOIN user_groups ug ON cg.group_id = ug.group_id
        WHERE ug.user_id = ?
        ${group && group !== "all" ? "AND cg.group_id = (SELECT id FROM groups WHERE name = ?)" : ""}
        `,
        group && group !== "all" ? [userId, group] : [userId]
      );
    }

    const filterZipValid = zipcodes.lookup(filterZip);
    const radiusNumber = Number(radius);

    
carriers = carriers.map((carrier) => {
  const carrierZipValid = zipcodes.lookup(carrier.zip);
  let distance = null;

  if (filterZipValid && carrierZipValid) {
    distance = zipcodes.distance(filterZip, carrier.zip);
  }


    // Format date
  let formattedDate = null;
  if (carrier.date) {
    const dateObj = new Date(carrier.date);
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
  if (carrier.insurance_date) {
    const dateObj = new Date(carrier.insurance_date);
    formattedInsuranceDate = dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }

  const lat = carrierZipValid?.latitude || null;
  const lng = carrierZipValid?.longitude || null;

  return {
    ...carrier,
    distance: distance !== null ? distance : Infinity,
     date: formattedDate,
    insurance_date: formattedInsuranceDate,
    latitude: lat,
    longitude: lng,
  };
});


    // Filter by hideOnLoad if true: exclude carriers where onload = 1
    if (hideOnLoad === "true") {
      carriers = carriers.filter((carrier) => carrier.onload !== 1);
    }

    // Filter by hideUnavailable if true: exclude carriers where available = 0
    if (hideUnavailable === "true") {
      carriers = carriers.filter((carrier) => carrier.available !== 0);
    }

    // Filter by radius if provided
    if (filterZipValid && radius && !isNaN(radiusNumber)) {
      carriers = carriers.filter((carrier) => carrier.distance <= radiusNumber);
    }

    // Sort by distance
    carriers.sort((a, b) => a.distance - b.distance);

    // Optional search filter

      if (search && search.trim() !== "") {
        const searchLower = search.toLowerCase();
        carriers = carriers.filter((carrier) => {
          return (
            carrier.name?.toLowerCase().includes(searchLower) ||
            carrier.zip?.toString().includes(searchLower) ||
            carrier.distance?.toString().includes(searchLower) ||
            carrier.unit?.toLowerCase().includes(searchLower)
          );
        });
      }





    // Load associated group names for each carrier
    for (let carrier of carriers) {
      const [groupRows] = await db.query(
        `SELECT g.name, g.description 
         FROM carrier_groups cg 
         JOIN groups g ON cg.group_id = g.id 
         WHERE cg.carrier_id = ?`,
        [carrier.id]
      );
      carrier.groups = groupRows.map((row) => ({
        name: row.name,
        description: row.description,
      }));
    }

    res.json(carriers);
  } catch (err) {
    console.error("Error in getDashboardData:", err);
    res.status(500).json({ message: "Error loading carriers" });
  }
};








export const reserveCarrier = async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;
  const { carrierId } = req.body;

  try {
    // გადაამოწმე გადამზიდავის სტატუსი
    const [carrierRows] = await db.query(
      "SELECT reserved_by FROM carriers WHERE id = ?",
      [carrierId]
    );

    if (carrierRows.length === 0) {
      return res.status(404).json({ message: "Carrier not found" });
    }

    const reservedBy = carrierRows[0].reserved_by;

    // თუ დარეზერვებულია სხვაზე და არც admin/sa ხარ — ვერ დააჯავშნე
    if (reservedBy && reservedBy !== userId && userRole !== "admin" && userRole !== "sa") {
      return res.status(400).json({ message: "Carrier is already reserved" });
    }

    // თუ დარეზერვებულია იმავე user-ზე ან admin/sa ხარ — გაუქმება
    if (reservedBy && (reservedBy === userId || userRole === "admin" || userRole === "sa")) {
      await db.query(
        "UPDATE carriers SET reserved_by = NULL, reserved_at = NULL WHERE id = ?",
        [carrierId]
      );
      io.emit("dashboardUpdated");
      return res.status(200).json({ message: "Reservation cancelled" });
    }

    // სხვა შემთხვევაში — დაჯავშნა
    const now = new Date();
    await db.query(
      "UPDATE carriers SET reserved_by = ?, reserved_at = ? WHERE id = ?",
      [userId, now, carrierId]
    );
    io.emit("dashboardUpdated");
    res.status(200).json({ message: "Carrier reserved successfully!" });

    // ავტომატური გაუქმება 15 წუთში
    setTimeout(async () => {
      const [checkAgain] = await db.query(
        "SELECT reserved_by FROM carriers WHERE id = ?",
        [carrierId]
      );
   
      

      // თუ ისევ იმავე user-ზეა, გააუქმე
      if (checkAgain[0].reserved_by === userId) {
        await db.query(
          "UPDATE carriers SET reserved_by = NULL, reserved_at = NULL WHERE id = ?",
          [carrierId]
        );
        io.emit("dashboardUpdated");
      }
    }, 15 * 60 * 1000);
    
  } catch (err) {
    console.error("Error reserving carrier:", err);
    res.status(500).json({ message: "Failed to reserve carrier" });
  }
};


