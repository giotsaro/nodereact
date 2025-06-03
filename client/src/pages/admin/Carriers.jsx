import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import { toast } from 'sonner'; 


const CarriersPage = () => {
  const [carriers, setCarriers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [searchTerm, setSearchTerm] = useState("");


  useEffect(() => {
    fetchCarriers();
    fetchGroups();
  }, []);

  const fetchCarriers = async (groupId = "") => {
    try {
      const res = await API.get("/carriers", {
        params: groupId ? { group: groupId } : {},
      });
      setCarriers(res.data);
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
        await API.delete(`/carriers/${id}`);
        setCarriers((prev) => prev.filter((carrier) => carrier.id !== id));
      } catch (err) {
        toast.error(err.response?.data?.message || err.message || "Server error");
      }
    }
  };

  const filteredCarriers = carriers.filter((carrier) => {
    const term = searchTerm.toLowerCase();
    return (
      carrier.unit?.toLowerCase().includes(term) ||
      carrier.name?.toLowerCase().includes(term) ||
      carrier.phone?.toLowerCase().includes(term) ||
      carrier.email?.toLowerCase().includes(term) ||
      carrier.emergency?.toLowerCase().includes(term) ||
      carrier.payload?.toLowerCase().includes(term) ||
      carrier.groups?.some((g) => g.name.toLowerCase().includes(term))
    );
  });
  


  return (
    <div className="max-w-7xl mx-auto p-6 dark:bg-gray-900 dark:text-white min-h-screen">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h2 className="text-3xl font-bold">Carriers</h2>
        <Link
          to="/carriers/new"
          className="px-3 py-2 text-xs font-medium text-center inline-flex items-center text-white bg-blue-700 rounded-lg hover:bg-blue-800"
        >
          Add New Carrier
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
        fetchCarriers(groupId);
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
        სულ გადამზიდავები: {filteredCarriers.length}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse bg-white dark:bg-gray-800">
          <thead className="hidden md:table-header-group">
            <tr className="bg-gray-200 dark:bg-gray-700">
              <th className="p-3 text-center">Unit</th>
              <th className="p-3 text-center">Info</th>
              <th className="p-3 text-center">Address</th>
              <th className="p-3 text-center">Capacity</th>
              <th className="p-3 text-center">Date</th>
              <th className="p-3 text-center">Insurance Date</th>
              <th className="p-3 text-center">Comments</th>
              <th className="p-3 text-center">Emergency</th>
              <th className="p-3 text-center">Groups</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="block md:table-row-group">
            {filteredCarriers.map((carrier) => (
              <tr
                key={carrier.id}
                className="block md:table-row border md:border-none border-gray-200 dark:border-gray-700 mb-4 md:mb-0"
              >
                <td className="p-2 md:table-cell before:content-['Unit:'] before:block md:before:hidden">
                  {carrier.unit}
                </td>

                <td className="p-2 md:table-cell before:content-['Info:'] before:block md:before:hidden">
                  <div>
                    <strong>Name:</strong> {carrier.name}
                  </div>
                  <div>
                    <strong>Phone:</strong> {carrier.phone}
                  </div>
                  <div>
                    <strong>Email:</strong> {carrier.email}
                  </div>
                </td>

                <td className="p-2 md:table-cell before:content-['Address:'] before:block md:before:hidden">
                  <div>
                    <strong>ZIP:</strong> {carrier.zip}
                  </div>
                  <div>
                    <strong>Location:</strong> {carrier.location}
                  </div>
                </td>

                <td className="p-2 md:table-cell before:content-['Capacity:'] before:block md:before:hidden">
                  <div>
                    <strong>Dimensions:</strong> {carrier.dimensions}
                  </div>
                  <div>
                    <strong>Payload:</strong> {carrier.payload}
                  </div>
                </td>

                <td className="p-2 md:table-cell before:content-['Date:'] before:block md:before:hidden">
                  {new Date(carrier.date).toLocaleString()}
                </td>

                <td className="p-2 md:table-cell before:content-['Insurance Date:'] before:block md:before:hidden">
                  <span
                    className={`${
                      carrier.ins_exp ? "bg-red-500 text-white" : ""
                    }`}
                  >
                   


                    {carrier.insurance_date ? 
  new Date(carrier.insurance_date).toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  
  }) 
  : "unknown"}
                  </span>
                </td>

                <td className="p-2 md:table-cell before:content-['Comments:'] before:block md:before:hidden">
                  {carrier.comments}
                </td>
                <td className="p-2 md:table-cell before:content-['Emergency:'] before:block md:before:hidden">
                  {carrier.emergency}
                </td>

                <td className="p-2 md:table-cell before:content-['Groups:'] before:block md:before:hidden">
                  {carrier.groups?.length > 0
                    ? carrier.groups.map((g) => g.name).join(", ")
                    : "No groups"}
                </td>

                <td className="p-2 md:table-cell before:content-['Actions:'] before:block md:before:hidden">
                  <div className="space-x-2">
                    <Link
                      to={`/carriers/${carrier.id}/edit`}
                      className="text-yellow-500 hover:text-yellow-400 text-sm font-medium"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(carrier.id)}
                      className="text-red-500 hover:text-red-400 text-sm font-medium"
                    >
                      Delete
                    </button>
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

export default CarriersPage;
