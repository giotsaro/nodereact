import e from "express";
import { db } from "../config/db.js";
import { io } from "../index.js";
import zipcodes from "zipcodes";

// ყველა გადამზიდავის წამოღება
export const getDrivers = async (req, res) => {
  try {
    const groupId = req.query.group; // ვიღებთ group query param-ს
    let drivers = [];

    if (groupId) {
      // თუ group ID არის, გამოგვაქვს მხოლოდ ამ ჯგუფის გადამზიდავები
      const [rows] = await db.query(
        `SELECT c.* FROM drivers c
         JOIN driver_groups cg ON c.id = cg.driver_id
         WHERE cg.group_id = ?`,
        [groupId]
      );
      drivers = rows;
    } else {
      // თუკი არ არის group filter, გამოგვაქვს ყველა გადამზიდავი
      const [rows] = await db.query("SELECT * FROM drivers");
      drivers = rows;
    }

    // თითოეულ გადამზიდავზე ვამატებთ ჯგუფებს
    for (let driver of drivers) {
      const [groupRows] = await db.query(
        `SELECT g.id, g.name FROM driver_groups cg 
         JOIN groups g ON cg.group_id = g.id 
         WHERE cg.driver_id = ?`,
        [driver.id]
      );
      driver.groups = groupRows;
    }

    res.json(drivers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error loading drivers" });
  }
};


// ერთი გადამზიდავის წამოღება ID-ით
export const getDriverById = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM drivers WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0) return res.status(404).json({ message: "Not found" });

    const driver = rows[0];

    const [groupRows] = await db.query(
      `SELECT g.id, g.name FROM driver_groups cg 
       JOIN groups g ON cg.group_id = g.id 
       WHERE cg.driver_id = ?`,
      [driver.id]
    );
    driver.groups = groupRows;

    res.json(driver);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error loading drivers" });
  }
};

// ახალი გადამზიდავის დამატება
export const addDriver = async (req, res) => {
  let {
    unit,
    name,
    dimensions,
    payload,
    license_plate,
    phone,
    zip,
    date,
    insurance_date,
    registration_date,
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
      `INSERT INTO drivers 
        (unit, name, dimensions, payload,  license_plate, phone, location, zip, date, insurance_date,registration_date, comments, email, emergency)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        unit,
        name,
        dimensions,
        payload,
        license_plate,
        phone,
        location,
        zip,
        date,
        insurance_date,
        registration_date,
        comments,
        email,
        emergency,
      ]
    );

    const driverId = result.insertId;

 if (Array.isArray(groups) && groups.length > 0) {
  const values = groups.map((groupId) => [driverId, groupId]);
  await db.query("INSERT INTO driver_groups (driver_id, group_id) VALUES ?", [values]);
}


    res.status(201).json({ message: "Driver added", id: driverId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding driver" });
  }
};


// გადამზიდავის განახლება
export const updateDriver = async (req, res) => {
  let {
    unit,
    name,
    dimensions,
    payload,
    license_plate,
    phone,
    zip,
    date,
    insurance_date,
    registration_date,
    comments,
    email,
    emergency,
    groups,
  } = req.body;

  //console.log(req.body);

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
      `UPDATE drivers SET
        unit = ?, name = ?, dimensions = ?, payload = ?, license_plate = ?, phone = ?, location = ?, zip = ?, date = ?, insurance_date = ?, registration_date = ?, comments = ?, email = ?, emergency = ?
      WHERE id = ?`,
      [unit, name, dimensions, payload, license_plate, phone, location, zip, date, insurance_date,registration_date, comments, email, emergency, req.params.id]
    );

    // მხოლოდ **თუ ახალი `groups` არსებობს**, განვაახლებთ 
    if (Array.isArray(groups) && groups.length > 0) {
      // წავშალოთ ძველი `group` კავშირები
      await db.query(`DELETE FROM driver_groups WHERE driver_id = ?`, [req.params.id]);

      // დავამატოთ ახალი `group` კავშირები
      const values = groups.map((groupId) => [req.params.id, groupId]);
      await db.query("INSERT INTO driver_groups (driver_id, group_id) VALUES ?", [values]);
    }

    io.emit("driverUpdated", {
      id: req.params.id,
      unit,
      name,
      zip,
      date,
      insurance_date,
      registration_date,
      comments,
    });

    res.json({ message: "Driver updated" });
  } catch (err) {
    console.error("Error updating driver:", err);
    res.status(500).json({ message: "Error updating driver" +err.message });
  }
};

// გადამზიდავის წაშლა
export const deleteDriver = async (req, res) => {
  const driverId = req.params.id;

  try {
    const [rows] = await db.query("SELECT * FROM drivers WHERE id = ?", [driverId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "driver not found" });
    }

    const driver = rows[0];

   await db.query(
  `INSERT INTO deleted_drivers (unit, name, dimensions, payload, license_plate, phone, location, zip, date, insurance_date, registration_date, comments, email, emergency)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)`, // აქ ?-ები ემთხვევა სვეტების რაოდენობას
  [
    driver.unit,
    driver.name,
    driver.dimensions,
    driver.payload,
    driver.license_plate,
    driver.phone,
    driver.location,
    driver.zip,
    driver.date,
    driver.insurance_date,
    driver.registration_date || null, // თუ არ არსებობს, იყოს NULL
    driver.comments || null, // თუ არ არსებობს, იყოს NULL
    driver.email,
    driver.emergency
  ]
);

    await db.query("DELETE FROM drivers WHERE id = ?", [driverId]);

    io.emit("driverDeleted", { id: driverId });

    res.json({ message: "Driver deleted and archived successfully" });
  } catch (err) {
    console.error("Error deleting driver:", err);
    res.status(500).json({ message: "Error deleting driver" });
  }
};
