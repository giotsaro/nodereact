import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const run = async () => {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  const users = [
    { name: "Super Admin", email: "sa@mail.com", password: "qwert123", role: "sa" },
    { name: "Admin", email: "admin@mail.com", password: "qwert123", role: "admin" },
    { name: "User", email: "user@mail.com", password: "qwert123", role: "user" },
    { name: "human recources", email: "hr@mail.com", password: "qwert123", role: "hr" },
   
  ];

  for (const user of users) {
    const hashed = await bcrypt.hash(user.password, 10);
    await db.execute(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [user.name, user.email, hashed, user.role]
    );
    console.log(`✅ Inserted ${user.email}`);
  }

  db.end();
};

run().catch(console.error);
