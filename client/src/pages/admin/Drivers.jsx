import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import { toast } from 'sonner'; 


const DriversPage = () => {
  const [drivers, setDrivers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [searchTerm, setSearchTerm] = useState("");


  useEffect(() => {
    fetchDrivers();
    fetchGroups();
  }, []);

  const fetchDrivers = async (groupId = "") => {
    try {
      const res = await API.get("/drivers", {
        params: groupId ? { group: groupId } : {},
      });
      setDrivers(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Server error");
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await API.get("/groups");
      setGroups(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Server error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("are you sure?")) {
      try {
        await API.delete(`/drivers/${id}`);
        setDrivers((prev) => prev.filter((driver) => driver.id !== id));
      } catch (err) {
        toast.error(err.response?.data?.message || err.message || "Server error");
      }
    }
  };

  const filteredDrivers = drivers.filter((driver) => {
    const term = searchTerm.toLowerCase();
    return (
      driver.unit?.toLowerCase().includes(term) ||
      driver.name?.toLowerCase().includes(term) ||
      driver.phone?.toLowerCase().includes(term) ||
      driver.email?.toLowerCase().includes(term) ||
      driver.emergency?.toLowerCase().includes(term) ||
      driver.payload?.toLowerCase().includes(term) ||
      driver.groups?.some((g) => g.name.toLowerCase().includes(term))
    );
  });
  


  return (
    <div className="max-w-7xl mx-auto p-6 dark:bg-gray-900 dark:text-white min-h-screen">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h2 className="text-3xl font-bold">Driver</h2>
        <Link
          to="/drivers/new"
          className="px-3 py-2 text-xs font-medium text-center inline-flex items-center text-white bg-blue-700 rounded-lg hover:bg-blue-800"
        >
          Add New Driver
        </Link>
      </div>

 <div className="flex flex-col md:flex-row md:items-end gap-4 mb-4">

  {/* Search Input */}
  <div className="flex-1">
    <label className="block mb-1 font-medium">Search</label>
    <input
      type="text"
      placeholder="Search"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
    />
  </div>
  {/* Filter by Group */}
  <div className="flex-1">
    <label className="block mb-1 font-medium">Filter by Group</label>
    <select
      value={selectedGroup}
      onChange={(e) => {
        const groupId = e.target.value;
        setSelectedGroup(groupId);
        fetchDrivers(groupId);
      }}
      className="w-full px-4 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
    >
      <option value="">All Groups</option>
      {groups.map((group) => (
        <option key={group.id} value={group.id}>
          {group.name}
        </option>
      ))}
    </select>
  </div>

  
</div>


      <div className="mb-4 text-lg font-medium">
       Drivers: {fetchDrivers.length}
      </div>

      <div className="overflow-x-visible">
        <table className="w-full table-auto border-collapse text-center bg-gray-300 dark:bg-gray-800">
          <thead className="hidden md:table-header-group">
            <tr className="bg-gray-200 dark:bg-gray-700">
              <th className="p-3 text-center">Unit</th>
              <th className="p-3 text-center">Info</th>
              <th className="p-3 text-center">Address</th>
              <th className="p-3 text-center">Details</th>
              <th className="p-3 text-center">Date</th>
              <th className="p-3 text-center">Insurance Date</th>
              <th className="p-3 text-center">Comments</th>
              <th className="p-3 text-center">Emergency</th>
              <th className="p-3 text-center">Groups</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="block md:table-row-group">
            {filteredDrivers.map((driver) => (
              <tr
                key={driver.id}
                className="block md:table-row border md:border-none border-gray-200 dark:border-gray-700 mb-4 md:mb-0"
              >
                <td className="p-2 md:table-cell before:content-['Unit:'] before:block md:before:hidden">
                  {driver.unit}
                </td>

                <td className="p-2 md:table-cell before:content-['Info:'] before:block md:before:hidden">
                  <div>
                    <strong>Name:</strong> {driver.name}
                    <hr />
                  </div>
                  <div>
                    <strong>Phone:</strong> {driver.phone}
                     <hr />
                  </div>
                  <div>
                    <strong>Email:</strong> {driver.email}
                     <hr />
                  </div>
                </td>

                <td className="p-2 md:table-cell before:content-['Address:'] before:block md:before:hidden">
                  <div>
                    <strong>ZIP:</strong> {driver.zip}
                  </div>
                   <hr />
                  <div>
                    <strong>Location:</strong> {driver.location}
                  </div>
                   <hr />
                </td>

                <td className="p-2 md:table-cell before:content-['Capacity:'] before:block md:before:hidden">
                  <div>
                    <strong>Dimensions:</strong> {driver.dimensions}
                  </div>
                   <hr />
                  <div>
                    <strong>Payload:</strong> {driver.payload}
                  </div>
                   <hr />
                  <div>
                    <strong>License Plate</strong> {driver.license_plate}
                  </div>
                   <hr />
                </td>

                <td className="p-2 md:table-cell before:content-['Date:'] before:block md:before:hidden">
                  {new Date(driver.date).toLocaleString()}
                </td>

                <td className="p-2 md:table-cell before:content-['Insurance Date:'] before:block md:before:hidden">
                   <p>
                  <span
                    className={`${
                      driver.ins_exp ? "bg-red-500 text-white" : ""
                    }`}
                  >Insurance  date:
                  {driver.insurance_date ? 
  new Date(driver.insurance_date).toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  
  }) 
  : "unknown"}
                  </span>
                  
                  <hr />
                  </p>
                  <p>
                        <span
                    className={`${
                      driver.reg_exp ? "bg-red-500 text-white" : ""
                    }`}
                  > registration date: 
                   


                    {driver.registration_date ? 
  new Date(driver.registration_date).toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  
  }) 
  : "unknown"}
                  </span>
                  </p>
                </td>

                <td className="p-2 md:table-cell before:content-['Comments:'] before:block md:before:hidden">
                  {driver.comments}
                </td>
                <td className="p-2 md:table-cell before:content-['Emergency:'] before:block md:before:hidden">
                  {driver.emergency}
                </td>

                <td className="p-2 md:table-cell before:content-['Groups:'] before:block md:before:hidden">
                  {driver.groups?.length > 0
                    ? driver.groups.map((g) => g.name).join(", ")
                    : "No groups"}
                </td>

                <td className="p-2 md:table-cell before:content-['Actions:'] before:block md:before:hidden">
                  <div className="space-x-2">
                    <p>
                    <Link
                      to={`/drivers/${driver.id}/edit`}
                      className="text-yellow-500 hover:text-yellow-400 text-sm font-medium"
                    >
                      Edit
                    </Link>
                    </p>
                    <p>
                    <Link
                      onClick={() => handleDelete(driver.id)}
                      className="text-red-500 hover:text-red-400 text-sm font-medium"
                    >
                      Delete
                    </Link>
                    </p>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DriversPage;
