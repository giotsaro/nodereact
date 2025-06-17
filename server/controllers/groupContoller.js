import { db } from "../config/config.js";

// ყველა ჯგუფის წამოღება
export const getGroups = async (req, res) => {
  try {
    const [groups] = await db.query("SELECT id, name, description FROM `groups`");
    res.status(200).json(groups);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ჯგუფის დამატება
export const addGroup = async (req, res) => {
  const { name, description } = req.body;
  try {
    const q = "INSERT INTO `groups` (name, description) VALUES (?, ?)";
    await db.query(q, [name, description]);
    res.status(201).json({ message: "Group added" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ჯგუფის განახლება
export const updateGroup = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  try {
    const q = "UPDATE `groups` SET name = ?, description = ? WHERE id = ?";
    await db.query(q, [name, description, id]);
    res.status(200).json({ message: "Group updated" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ჯგუფის წაშლა
export const deleteGroup = async (req, res) => {
  const { id } = req.params;

  try {
    // Check for linked users
    const [userLinks] = await db.query("SELECT * FROM user_groups WHERE group_id = ?", [id]);
    if (userLinks.length > 0) {
      return res.status(400).json({ message: "This group is linked to users. Remove user associations first." });
    }

    // Check for linked carriers
    const [carrierLinks] = await db.query("SELECT * FROM carrier_groups WHERE group_id = ?", [id]);
    if (carrierLinks.length > 0) {
      return res.status(400).json({ message: "This group is linked to carriers. Remove carrier associations first." });
    }

    // If no links, delete the group
    await db.query("DELETE FROM `groups` WHERE id = ?", [id]);
    res.status(200).json({ message: "Group deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

export const getGroupsOfUser = async (req, res) => {

  const userId = req.user.id; // Assuming user ID is stored in req.user
  try {
    const [groups] = await db.query(
      "SELECT g.id, g.name, g.description FROM `groups` g JOIN user_groups ug ON g.id = ug.group_id WHERE ug.user_id = ?",
      [userId]
    );
    res.status(200).json(groups);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}