import { useEffect, useState } from "react";
import API from "../../api/axios";
import { toast } from "sonner";

const OnlineUsers = () => {
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    fetchOnlineUsers();
  }, []);

  const fetchOnlineUsers = async () => {
    try {
      const res = await API.get("/online"); // შენს API-ში ონლაინ მომხმარებელთა როუტი
      setOnlineUsers(res.data);
     
    } catch (err) {
      toast.error(err.response?.data?.message || "function will be implemented later");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 dark:bg-gray-900 dark:text-white min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">
        Online Users ({onlineUsers.length})
      </h2>

      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-xs">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3 text-center">Socket ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {onlineUsers.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4">{user.name}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4 text-center">{user.socket_id}</td>
              </tr>
            ))}
            {onlineUsers.length === 0 && (
              <tr>
                <td colSpan="3" className="px-6 py-4 text-center text-gray-400">
                  No users online.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OnlineUsers;
