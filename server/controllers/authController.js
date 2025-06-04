//authController.js

import { db } from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const q = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
    await db.query(q, [name, email, hashedPassword, role || "user"]);
    res.status(201).json({ message: "User registered" });
  } catch (err) {
   // console.error("❌ Register Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  console.log("🔐 Login request:", email, password);
  try {
    const [results] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = results[0];
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (err) {
    //console.error("❌ Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out" });
};
