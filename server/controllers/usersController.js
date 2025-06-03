import { db } from "../config/db.js";
import bcrypt from "bcryptjs";
import { io } from "../index.js";

// ყველა მომხმარებელი (გარდა sa-ის)
export const getUsers = async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.role, 
        u.created_at,
        IFNULL(GROUP_CONCAT(g.name), '') AS groups
      FROM users u
      LEFT JOIN user_groups ug ON u.id = ug.user_id
      LEFT JOIN groups g ON ug.group_id = g.id
      WHERE u.role != 'sa'
      GROUP BY u.id
    `);

    const formattedUsers = users.map(user => ({
      ...user,
      groups: user.groups ? user.groups.split(',') : []
    }));

    io.emit("userListChanged");
    res.status(200).json(formattedUsers);
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

// მომხმარებლის დამატება (sa როლის გარეშე)
export const addUser = async (req, res) => {
  let { name, email, password, role = "user", groups = [] } = req.body;

  // ზუსტად დააკონტროლეთ role-ს მნიშვნელობა
  if (role !== "admin" && role !== "user") {
    role = "user";  // თუ role არ არის "admin" ან "user", დაადეთ default "user"
  }

  

  try {
    // შეამოწმეთ, რომ ყველა ველი არსებობს
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }
    // გადაამოწმეთ, არსებობს თუ არა უკვე მომხმარებელი იმავე email-ით
    const [existingUsers] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertQuery = `
      INSERT INTO users (name, email, password, role) 
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.query(insertQuery, [name, email, hashedPassword, role]);
    const userId = result.insertId;

    // თუ როლი არაა admin, ჩაასვი ჯგუფები
    if (role !== "admin" && groups.length) {
      const groupInserts = groups.map(groupId => [userId, groupId]);
      await db.query("INSERT INTO user_groups (user_id, group_id) VALUES ?", [groupInserts]);
    }

    io.emit("userListChanged");
    res.status(201).json({ message: "User added", id: userId });
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
};




// მომხმარებლის განახლება (sa როლის გარეშე)
export const updateUser = async (req, res) => {
  const { name, email, role, password, groups = [] } = req.body;
  const { id } = req.params;

  console.log("Updating user:", id, name, email, role, groups);

  try {
    const [check] = await db.query("SELECT role FROM users WHERE id = ?", [id]);
    if (check.length && check[0].role === "sa") {
      return res.status(403).json({ message: "Cannot update super admin" });
    }
    if (role === "sa") {
      return res.status(403).json({ message: "Cannot assign super admin role" });
    }

    let updateQuery, updateParams;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery = `
        UPDATE users 
        SET name = ?, email = ?, password = ?, role = ? 
        WHERE id = ?
      `;
      updateParams = [name, email, hashedPassword, role, id];
    } else {
      updateQuery = `
        UPDATE users 
        SET name = ?, email = ?, role = ? 
        WHERE id = ?
      `;
      updateParams = [name, email, role, id];
    }

    await db.query(updateQuery, updateParams);

    // განვაახლოთ ჯგუფები
    await db.query("DELETE FROM user_groups WHERE user_id = ?", [id]);

    if (groups.length) {
      const groupInserts = groups.map(groupId => [id, groupId]);
      await db.query("INSERT INTO user_groups (user_id, group_id) VALUES ?", [groupInserts]);
    }

    io.emit("userListChanged");
    res.status(200).json({ message: "User updated" });
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
};


// მომხმარებლის წაშლა (გარდა sa-ის)
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const [check] = await db.query("SELECT role FROM users WHERE id = ?", [id]);
    if (check.length && check[0].role === "sa") {
      return res.status(403).json({ message: "Cannot delete super admin" });
    }

    await db.query("DELETE FROM user_groups WHERE user_id = ?", [id]);
    await db.query("DELETE FROM users WHERE id = ?", [id]);

    io.emit("userListChanged");
    res.status(200).json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
};
