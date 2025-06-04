import { db } from "./config/db.js";
import bcrypt from "bcrypt";

const hashedPassword = bcrypt.hashSync("password", 10);

const q = `
  INSERT INTO carriers (name, email, password, role)
  VALUES (?, ?, ?, ?)
`;

db.query(q, ["Test User", "mail@mail.com", hashedPassword, "user"], (err, result) => {
  if (err) {
    console.error("❌ Seeder Error:", err);
  } else {
    console.log("✅ Seeder completed successfully");
  }
  process.exit();
});
