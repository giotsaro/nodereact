const db = require("../config/db");

const getUsers = () => {
    return new Promise((resolve, reject) => {
      db.query("SELECT * FROM users WHERE role != 'sa'", (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  };
  
  
  

// ✅ Add user only if role is not 'sa'
const addUser = (name, email, role) => {
  if (role === "sa") {
    return Promise.reject(new Error("Cannot add user with role 'sa'"));
  }

  return new Promise((resolve, reject) => {
    db.query(
      'INSERT INTO users (name, email, role) VALUES (?, ?, ?)',
      [name, email, role],
      (err, results) => {
        if (err) reject(err);
        else resolve(results);
      }
    );
  });
};

// ✅ Update user unless existing or new role is 'sa'
const updateUser = (id, name, email, role) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT role FROM users WHERE id = ?', [id], (err, results) => {
      if (err) return reject(err);
      if (!results.length) return reject(new Error("User not found"));

      const currentRole = results[0].role;
      if (currentRole === "sa" || role === "sa") {
        return reject(new Error("Cannot update user with role 'sa'"));
      }

      db.query(
        'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
        [name, email, role, id],
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });
  });
};

// ✅ Delete user only if their role is not 'sa'
const deleteUser = (id) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT role FROM users WHERE id = ?', [id], (err, results) => {
      if (err) return reject(err);
      if (!results.length) return reject(new Error("User not found"));

      const role = results[0].role;
      if (role === "sa") {
        return reject(new Error("Cannot delete user with role 'sa'"));
      }

      db.query('DELETE FROM users WHERE id = ?', [id], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  });
};

module.exports = {
  getUsers,
  addUser,
  updateUser,
  deleteUser,
};
