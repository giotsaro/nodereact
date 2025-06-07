import { useEffect, useState } from "react";
import API from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { toast } from 'sonner'; 


import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';


const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [password, setPassword] = useState("");
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const navigate = useNavigate();





const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};




  useEffect(() => {
    fetchUsers();
    fetchGroups();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await API.get("/groups");
      setGroups(res.data);
    } catch (err) {
      console.error("Error fetching groups:", err);
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setRole("user");
    setPassword("");
    setSelectedGroups([]);
    setEditingUser(null);
  };






const handleAddUser = async () => {
  try {
    if (role === "sa") {
      alert("You cannot assign 'Super Admin' role.");
      return;
    }

    // აქ ყველასთვის გავუგზავნოთ groups
    const payload = { name, email, role, password, groups: selectedGroups };

    const res = await API.post("/users", payload);
    console.log("User added:", res.data);
    const userId = res.data.id;

    if (!userId) {
      throw new Error("User ID not returned from API");
    }

    

    resetForm();
    fetchUsers();
  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.message || err.message || "Server error");
  }
};




const handleEditUser = (user) => {
  if (user.role === "sa") return;

  setName(user.name);
  setEmail(user.email);
  setRole(user.role);
  setPassword("");

  // გადაყვანე group names → IDs
  const matchingGroupIds = groups
    .filter((g) => user.groups.includes(g.name)) // შეადარე სახელებით
    .map((g) => g.id); // ამოიღე ID-ები

  setSelectedGroups(matchingGroupIds);
  setEditingUser(user);
};




const handleUpdateUser = async () => {
  try {
    if (role === "sa") {
      alert("You cannot change role to 'Super Admin'.");
      return;
    }

    // ყოველთვის groups-ებიც გავუგზავნოთ
    const payload = {
      name,
      email,
      role,
      password,
      groups: selectedGroups,
    };

    await API.put(`/users/${editingUser.id}`, payload);

    resetForm();
    fetchUsers();
  } catch (err) {
    console.error("Error updating user:", err);
  }
};



  const handleDeleteUser = async (id) => {
    try {
      const user = users.find((u) => u.id === id);
      if (user?.role === "sa") {
        alert("You cannot delete a Super Admin.");
        return;
      }

      await API.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  /* const handleGroupToggle = (groupId) => {
    if (selectedGroups.includes(groupId)) {
      setSelectedGroups(selectedGroups.filter((id) => id !== groupId));
    } else {
      setSelectedGroups([...selectedGroups, groupId]);
    }
  }; */




  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    setSelectedGroups(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-6 dark:bg-gray-900 dark:text-white min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-center">User Management</h2>

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 text-sm shadow-md rounded-lg p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4">
          {editingUser ? "Edit User" : "Add New User"}
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <input
            type="text"
            placeholder="Name"
            className="p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            className="p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="p-2 rounded border  text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700"
          >
            <option value="user">User</option>
            <option value="hr">HR</option>
            <option value="admin">Admin</option>
          </select>
        </div>




<div className="mt-4 ">
  <FormControl sx={{ width: 900, }} >
    

  <InputLabel id="group-select-label"
    sx={{ color: 'blue', '&.Mui-focused': { color: 'blue' } }}
  >
    Groups
  </InputLabel>





    <Select
      
      labelId="group-select-label"
      id="group-multiple-checkbox"  
      multiple
      value={selectedGroups}
      onChange={handleChange}
      input={<OutlinedInput label="Groups" />}
      renderValue={(selected) =>
        groups
          .filter((group) => selected.includes(group.id))
          .map((g) => (
            <span
              key={g.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: g.color,
                color: 'blue',
                borderRadius: '8px',
                padding: '2px 8px',
                marginRight: '6px',
                fontSize: '0.875rem',
              }}
            >
              {g.name}
            </span>
          ))
      }
      MenuProps={MenuProps}
    >
      {groups.map((group) => (
        <MenuItem key={group.id} value={group.id}>
          <Checkbox checked={selectedGroups.includes(group.id)} />
          <span
            style={{
              display: 'inline-block',
              width: 12,
              height: 12,
              backgroundColor: group.color,
              borderRadius: '50%',
              marginRight: 8,
            }}
          />
          <ListItemText primary={group.name} />
        </MenuItem>
      ))}
    </Select>
  </FormControl>
</div>











        <div className="mt-6 flex gap-4">
          <button
            onClick={editingUser ? handleUpdateUser : handleAddUser}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {editingUser ? "Update User" : "Add User"}
          </button>
          {editingUser && (
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-xs">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Groups</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4">{user.name}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4 capitalize">{user.role}</td>
                <td className="px-6 py-4">
                    {user.groups?.length > 0
                      ? user.groups.join(", ")
                      : "No groups"}
                </td>

                <td className="px-6 py-4 flex justify-center space-x-2">
                  {user.role !== "sa" && (
                    <>
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-yellow-500 hover:text-yellow-400 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-500 hover:text-red-400 font-medium"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersPage;
