import { useEffect, useState } from "react";
import API from "../../api/axios";
import { toast } from 'sonner';

const GroupPage = () => {
  const [groups, setGroups] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingGroup, setEditingGroup] = useState(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await API.get("/groups");
      setGroups(res.data);
     
    } catch (err) {
      toast.error(err.response?.data?.message || "Server error");
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setEditingGroup(null);
  };

  const handleAddGroup = async () => {
    if (!name.trim()) {
      toast.error("Group name is required");
      return;
    } 
    try {
      await API.post("/groups", { name, description });
      resetForm();
      fetchGroups();
    } catch (err) {
      toast.error(err.response?.data?.message || "Server error");
    }
  };

  const handleEditGroup = (group) => {
    setName(group.name);
    setDescription(group.description || "");
    setEditingGroup(group);
  };

  const handleUpdateGroup = async () => {
    try {
      await API.put(`/groups/${editingGroup.id}`, { name, description });
      resetForm();
      fetchGroups();
    } catch (err) {
      toast.error(err.response?.data?.message || "Server error");
    }
  };

  const handleDeleteGroup = async (id) => {
    try {
      await API.delete(`/groups/${id}`);
      fetchGroups();
    } catch (err) {
      toast.error(err.response?.data?.message || "Server error");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 dark:bg-gray-900 dark:text-white min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">
        Group Management
      </h2>

      {/* Form Section */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4">
          {editingGroup ? "Edit Group" : "Add New Group"}
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <input
            type="text"
            placeholder="Group Name"
            className="p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            value={name}
            required
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Description"
            className="p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            value={description}
            
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Submit & Cancel Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <button
            onClick={editingGroup ? handleUpdateGroup : handleAddGroup}
            className="px-3 py-2 text-xs font-medium text-center inline-flex items-center text-white bg-blue-700 rounded-lg hover:bg-blue-800"
          >
            {editingGroup ? "Update Group" : "Add Group"}
          </button>

          {editingGroup && (
            <button
              onClick={resetForm}
              className="px-3 py-2 text-xs font-medium text-center inline-flex items-center text-white bg-red-500 rounded-lg hover:bg-red-800"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Groups Table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-xs">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Description</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {groups.map((group) => (
              <tr key={group.id}>
                <td className="px-6 py-4">{group.name}</td>
                <td className="px-6 py-4">{group.description}</td>
                <td className="px-6 py-4 flex justify-center space-x-2">
                  <button
                    onClick={() => handleEditGroup(group)}
                    className="text-yellow-500 hover:text-yellow-400 font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteGroup(group.id)}
                    className="text-red-500 hover:text-red-400 font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {groups.length === 0 && (
              <tr>
                <td colSpan="3" className="px-6 py-4 text-center text-gray-400">
                  No groups found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GroupPage;
