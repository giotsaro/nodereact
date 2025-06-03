import e from "express";
import { db } from "../config/db.js";
import { io } from "../index.js";
import zipcodes from "zipcodes";

// ყველა გადამზიდავის წამოღება
export const getCarriers = async (req, res) => {
  try {
    const groupId = req.query.group; // ვიღებთ group query param-ს
    let carriers = [];

    if (groupId) {
      // თუ group ID არის, გამოგვაქვს მხოლოდ ამ ჯგუფის გადამზიდავები
      const [rows] = await db.query(
        `SELECT c.* FROM carriers c
         JOIN carrier_groups cg ON c.id = cg.carrier_id
         WHERE cg.group_id = ?`,
        [groupId]
      );
      carriers = rows;
    } else {
      // თუკი არ არის group filter, გამოგვაქვს ყველა გადამზიდავი
      const [rows] = await db.query("SELECT * FROM carriers");
      carriers = rows;
    }

    // თითოეულ გადამზიდავზე ვამატებთ ჯგუფებს
    for (let carrier of carriers) {
      const [groupRows] = await db.query(
        `SELECT g.id, g.name FROM carrier_groups cg 
         JOIN groups g ON cg.group_id = g.id 
         WHERE cg.carrier_id = ?`,
        [carrier.id]
      );
      carrier.groups = groupRows;
    }

    res.json(carriers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error loading carriers" });
  }
};


// ერთი გადამზიდავის წამოღება ID-ით
export const getCarrierById = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM carriers WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0) return res.status(404).json({ message: "Not found" });

    const carrier = rows[0];

    const [groupRows] = await db.query(
      `SELECT g.id, g.name FROM carrier_groups cg 
       JOIN groups g ON cg.group_id = g.id 
       WHERE cg.carrier_id = ?`,
      [carrier.id]
    );
    carrier.groups = groupRows;

    res.json(carrier);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error loading carrier" });
  }
};

// ახალი გადამზიდავის დამატება
export const addCarrier = async (req, res) => {
  let {
    unit,
    name,
    dimensions,
    payload,
    phone,
    zip,
    date,
    insurance_date,
    comments,
    email,
    groups = [],
    emergency,
  } = req.body;
   
  // ვალიდაცია - აუცილებლად უნდა იყოს მითითებული unit, name და phone
  if (!unit || !name || !phone) {
    return res.status(400).json({ message: "Fields 'unit', 'name' and 'phone' are required." });
  }
  
  let location = "";

  const locationData = zipcodes.lookup(zip);
  if (locationData) {
    const { city, state } = locationData;
    location = `${city}, ${state}`;
  } else {
    location = `unknown`;
  }

  try {
    const [result] = await db.query(
      `INSERT INTO carriers 
        (unit, name, dimensions, payload, phone, location, zip, date, insurance_date, comments, email, emergency)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        unit,
        name,
        dimensions,
        payload,
        phone,
        location,
        zip,
        date,
        insurance_date,
        comments,
        email,
        emergency,
      ]
    );

    const carrierId = result.insertId;

 if (Array.isArray(groups) && groups.length > 0) {
  const values = groups.map((groupId) => [carrierId, groupId]);
  await db.query("INSERT INTO carrier_groups (carrier_id, group_id) VALUES ?", [values]);
}


    res.status(201).json({ message: "Carrier added", id: carrierId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding carrier" });
  }
};


// გადამზიდავის განახლება
export const updateCarrier = async (req, res) => {
  let {
    unit,
    name,
    dimensions,
    payload,
    phone,
    zip,
    date,
    insurance_date,
    comments,
    email,
    emergency,
    groups,
  } = req.body;

  let location = "";

  const locationData = zipcodes.lookup(zip);
  if (locationData) {
    const { city, state } = locationData;
    location = `${city}, ${state}`;
  } else {
    location = `unknown`;
  }

  try {
    await db.query(
      `UPDATE carriers SET
        unit = ?, name = ?, dimensions = ?, payload = ?, phone = ?, location = ?, zip = ?, date = ?, insurance_date = ?, comments = ?, email = ?, emergency = ?
      WHERE id = ?`,
      [unit, name, dimensions, payload, phone, location, zip, date, insurance_date, comments, email, emergency, req.params.id]
    );

    // მხოლოდ **თუ ახალი `groups` არსებობს**, განვაახლებთ
    if (Array.isArray(groups) && groups.length > 0) {
      // წავშალოთ ძველი `group` კავშირები
      await db.query(`DELETE FROM carrier_groups WHERE carrier_id = ?`, [req.params.id]);

      // დავამატოთ ახალი `group` კავშირები
      const values = groups.map((groupId) => [req.params.id, groupId]);
      await db.query("INSERT INTO carrier_groups (carrier_id, group_id) VALUES ?", [values]);
    }

    io.emit("carrierUpdated", {
      id: req.params.id,
      unit,
      name,
      zip,
      date,
      insurance_date,
      comments,
    });

    res.json({ message: "Carrier updated" });
  } catch (err) {
    console.error("Error updating carrier:", err);
    res.status(500).json({ message: "Error updating carrier" +err.message });
  }
};

// გადამზიდავის წაშლა
export const deleteCarrier = async (req, res) => {
  const carrierId = req.params.id;

  try {
    const [rows] = await db.query("SELECT * FROM carriers WHERE id = ?", [carrierId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Carrier not found" });
    }

    const carrier = rows[0];

    await db.query(
  `INSERT INTO deleted_carriers (unit, name, dimensions, payload, phone, location, zip, date, insurance_date, comments, email, emergency)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [
    carrier.unit,
    carrier.name,
    carrier.dimensions,
    carrier.payload,
    carrier.phone,
    carrier.location,
    carrier.zip,
    carrier.date,
    carrier.insurance_date,
    carrier.comments,
    carrier.email,
    carrier.emergency,
  ]
);


    await db.query("DELETE FROM carriers WHERE id = ?", [carrierId]);

    io.emit("carrierDeleted", { id: carrierId });

    res.json({ message: "Carrier deleted and archived successfully" });
  } catch (err) {
    console.error("Error deleting carrier:", err);
    res.status(500).json({ message: "Error deleting carrier" });
  }
};
