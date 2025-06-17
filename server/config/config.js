import mysql from "mysql2";
import dotenv from "dotenv";
import path from "path";

const envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env.development";
dotenv.config({ path: path.resolve(process.cwd(), envFile) });
console.log("🔧 Environment loaded:", envFile);

// DB pool
const db = mysql
  .createPool({
    //port: process.env.PORT || 5000,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,

  })
  .promise();
  console.log("🔗 Database connected:", process.env.DB_NAME);

const config = {
  port: process.env.PORT || 5000,
};

export { db, config };
