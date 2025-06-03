//onlineController.js

import { db } from "../config/db.js";

// დაამატე ან განაახლე socketId კონკრეტული user-ისთვის
export const saveSocketId = async (userId, socketId) => {
  try {
    await db.query(`
      INSERT INTO online_users (user_id, socket_id)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE socket_id = VALUES(socket_id)
    `, [userId, socketId]);
  } catch (err) {
    console.error("❌ Error saving socket ID:", err);
  }
};

// წაშალე როცა მომხმარებელი გათიშავს კავშირს
export const removeSocketId = async (socketId) => {
  try {
    await db.query("DELETE FROM online_users WHERE socket_id = ?", [socketId]);
  } catch (err) {
    console.error("❌ Error removing socket ID:", err);
  }
};

// ონლაინ მომხმარებლების სია


export const getOnlineUsers = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT u.id, u.name, u.email
      FROM users u
      JOIN online_users o ON u.id = o.user_id
    `);
    res.status(200).json(rows);
  } catch (err) {
    console.error("❌ Error fetching online users:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// გამოიყენება პირდაპირ მონაცემების მისაღებად (შიგნით ბაზიდან წამოღება)
export const fetchOnlineUsers = async () => {
  try {
    const [rows] = await db.query(`
      SELECT u.id, u.name, u.email
      FROM users u
      JOIN online_users o ON u.id = o.user_id
    `);
    return rows;
  } catch (err) {
    console.error("❌ Error fetching online users:", err);
    throw err;
  }
};
