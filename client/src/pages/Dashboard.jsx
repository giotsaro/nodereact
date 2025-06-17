// Dashboard.jsx

import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate,Link } from "react-router-dom";
import API from "../api/axios";
import socket from "../socket";
import { useAuth } from "../context/AuthContext";
import Timer from "./Timer";
import { toast } from 'sonner'; 



const Dashboard = () => {

 

  const { role} = useAuth();
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(false);
  const [zipError, setZipError] = useState("");
  const timeoutRef = useRef(null);


  const [search, setSearch] = useState("");
  const [sortByZip, setSortByZip] = useState("");
  const [radius, setRadius] = useState("");
  const [group, setGroup] = useState("all");
  const [hideUnavailable, setHideUnavailable] = useState(false);
  const [hideOnLoad, setHideOnLoad] = useState(false);
  const [loading, setLoading] = useState(false);




  const isValidZip = /^\d{5}$/.test(sortByZip);


  const [debouncedFilters, setDebouncedFilters] = useState({});
  const [groupsList, setGroupsList] = useState([]);

const fetchDrivers = useCallback(async () => {
  try {
    setLoading(true);
    const res = await API.get("/dashboard");
    setDrivers(res.data);
  } catch (err) {
    if (err.response?.status) {
      navigate("/login");
    }
  } finally {
    setLoading(false);
  }
}, [navigate]);

  const handleKeyDown = useCallback((event) => {
    if (event.key === "Escape") {
      setIsModalOpen(false);
    }
  }, []);

// ფუნქცია გარეთ
const formatDateForInput = (dateStr) => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hour}:${minute}`;
};

// მოდალის გამხსნელი
const openModal = (dirver) => {
  setSelectedDriver({
    ...dirver,
    date: dirver.date ? formatDateForInput(dirver.date) : "",
  });
  setIsModalOpen(true);
};
 const closeModal = () => {
  setSelectedDriver(null);
  setIsModalOpen(false);
  setZipError("");
  setError(false);
};


  const handleUpdate = async () => {
  try {
    setZipError("");
    setError(false);
    await API.put(`/dashboard/${selectedDriver.id}`, {
      zip: selectedDriver.zip,
      date: selectedDriver.date,
      comments: selectedDriver.comments,
      onload: selectedDriver.onload ? 1 : 0,
      available: selectedDriver.available ? 1 : 0,
    });
    closeModal();  // აქ უკვე ასუფთავებს selectedDriver-ს და სხვა ველებს
    fetchDrivers();
  } catch (err) {
    if (err.response?.status === 400 && err.response.data.message?.toLowerCase().includes("zip")) {
      setZipError("Invalid ZIP code");
      return;
    }
    setError(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setError(false);
      timeoutRef.current = null;
    }, 3000);
  }
};


  const handleReserve = async (driverId) => {
    try {
      const res = await API.post("/dashboard/reserve", { driverId });
    
      toast.success(res.data.message);
      fetchDrivers();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Server error");
    }
  };

const handleClearFilters = () => {
  setSearch("");
  setSortByZip("");
  setRadius("");
  setGroup("all");
  setHideUnavailable(false);
  setHideOnLoad(false);
};




/*   useEffect(() => {
    const handler = setTimeout(() => {
    const filters = {
  search,
  group,
  hideOnLoad,
  hideUnavailable,
  ...(sortByZip.length === 5 && { zip: sortByZip, radius }),
};

      setDebouncedFilters(filters);
    }, 400);
    return () => clearTimeout(handler);
  }, [search, sortByZip, radius, group, hideUnavailable,  hideOnLoad]);

  useEffect(() => {
    const loadFilteredData = async () => {
      try {
        const res = await API.get("/dashboard", { params: debouncedFilters });
        setDrivers(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    loadFilteredData();
  }, [debouncedFilters]);

  useEffect(() => {
    fetchDrivers();
    socket.on("dashboardUpdated", fetchDrivers);
    return () => socket.off("dashboardUpdated", fetchDrivers);
  }, [fetchDrivers]);

 */




useEffect(() => {
  const handler = setTimeout(() => {
    const filters = {
      search,
      group,
      hideOnLoad,
      hideUnavailable,
      ...(sortByZip.length === 5 && { zip: sortByZip, radius }),
    };
    setDebouncedFilters(filters);
  }, 400);

  return () => clearTimeout(handler);
}, [search, sortByZip, radius, group, hideUnavailable, hideOnLoad]);

useEffect(() => {
  const loadFilteredData = async () => {
    try {
      const res = await API.get("/dashboard", { params: debouncedFilters });
      setDrivers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (Object.keys(debouncedFilters).length > 0) {
    loadFilteredData();
  }

  const handleSocketUpdate = () => {
    loadFilteredData(); // Socket.IO-ს დროსაც იგივე filter-ებით გამოიძახოს
  };

  socket.on("dashboardUpdated", handleSocketUpdate);

  return () => socket.off("dashboardUpdated", handleSocketUpdate);
}, [debouncedFilters]);








  

  useEffect(() => {
    if (isModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, handleKeyDown]);



useEffect(() => {
  const fetchGroups = async () => {
    try {
      let res;

      if (role === "admin" || role === "sa") {
        res = await API.get("/groups");
      } else if (role === "user") {
        res = await API.get("/groups/getGroupsOfUser");
      } else {
        setGroupsList([]);
        return;
      }

      setGroupsList(res.data);
    } catch (error) {
      console.error("Error fetching groups:", error);
      setGroupsList([]);
    }
  };

  if (role) {
    fetchGroups();
  } else {
    setGroupsList([]);
  }
}, [role]);






useEffect(() => {
  if (sortByZip.length !== 5) {
    setRadius("");
  }
}, [sortByZip]); 


const handlePhoneCall = (phone) => {
  window.location.href = `tel:${phone}`;
};


useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && isModalOpen) {
      e.preventDefault(); // აჩერებს ფორმის default submit-ს
      handleUpdate();     // იძახებს შენს ფუნქციას
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [isModalOpen, selectedDriver]); // დამოკიდებულია მოდალზე






/////////////////////////////////////////////////////////////////////////////////////////////////////




  return (
    <>
    <div className="max-w-7xl mx-auto p-6 dark:bg-gray-900 dark:text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* Form Section */}
 <div className="bg-gray-400 dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
  <div
    className={`grid ${
      role === "admin" || role === "sa"|| role === "user"
        ? "gap-4 sm:grid-cols-4"
        : "gap-3 sm:grid-cols-3"
    }`}
  >
    <input
      type="text"
      placeholder="Search by name"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
    />

   <input
  type="text"
  placeholder="Sort by ZIP"
  value={sortByZip}
  onChange={(e) => {
    const numericValue = e.target.value.replace(/\D/g, ""); // მხოლოდ ციფრები
    setSortByZip(numericValue);
  }}
  maxLength={5}
  className={`p-2 rounded border ${
    sortByZip && sortByZip.length !== 5 ? "border-red-500" : "border-gray-300"
  } dark:border-gray-600 dark:bg-gray-700 dark:text-white`}
/>


    <input
      type="number"
      placeholder="Radius (miles)"
      value={radius}
      onChange={(e) => setRadius(e.target.value)}
      disabled={sortByZip.length !== 5}
      className={`p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white ${
        sortByZip.length !== 5 ? "opacity-50 cursor-not-allowed" : ""
      }`}
    />

    {(role === "admin" || role === "sa" || role === "user" ) && (
      <select
        value={group}
        onChange={(e) => setGroup(e.target.value)}
        className="p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
      >
        <option value="all">All</option>
        {groupsList.map(g => (
          <option key={g.id} value={g.name}>
            {g.name}
          </option>
        ))}
      </select>
    )}

    {/* Switch buttons */}
    <div className="flex items-center gap-6 col-span-full sm:col-span-2 flex-wrap mt-2">
      {/* Hide Available */}
      <div className="flex items-center gap-2">
        <span className="text-sm dark:text-white">Hide Unavailable</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={hideUnavailable}
            onChange={() => setHideUnavailable(!hideUnavailable)}
          />
          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:bg-blue-600 transition-all"></div>
          <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md transform peer-checked:translate-x-full transition-transform"></div>
        </label>
      </div>

      {/* Hide OnLoad */}
      <div className="flex items-center gap-2">
        <span className="text-sm dark:text-white">Hide OnLoad</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={hideOnLoad}
            onChange={() => setHideOnLoad(!hideOnLoad)}
          />
          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:bg-blue-600 transition-all"></div>
          <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md transform peer-checked:translate-x-full transition-transform"></div>
        </label>
      </div>
    </div>

    <div className="col-span-full flex justify-end mt-4">
      <button
        onClick={handleClearFilters}
        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded"
      >
        Clear Filters
      </button>
    </div>
  </div>
</div>


    
      <div className="mb-4 text-lg font-medium">
        Total Drivers: {drivers.length}
      </div>
    
      <div className="overflow-x-visible ">
        <table className="w-full  table-auto border-collapse text-center bg-gray-300 dark:bg-gray-800">
          <thead>
            <tr className="bg-blue-500 dark:bg-gray-700 text-white">
              <th className="p-3 text-center">Unit</th>
              <th className="p-3 text-center">Driver</th>
              <th className="p-3 text-center">Details</th>
            

              
              <th className="p-3 text-center">Location</th>
              
              <th className="p-3 text-center">Date</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Comments</th>
            
              <th className="p-3 text-center">Emergency</th>
              <th className="p-3 text-center">Distance</th>
              <th className="p-3 text-center">Group</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y  divide-gray-200 dark:divide-gray-800">

            {loading && <tr><td>Loading drivers...</td></tr>}

            {drivers.map((driver) => (
              <tr
                key={driver.id}
                className={`transition-all ${
                  driver.reserved_by
                    ? "bg-yellow-600 dark:bg-yellow-700 dark:hover:bg-yellow-600 hover:bg-yellow-500"
                    : "dark:bg-gray-700"
                } border-t dark:border-gray-800 text-gray-800 dark:text-gray-100 hover:bg-gray-400 dark:hover:bg-gray-600`}
              >
                <td className="p-2">{driver.unit}</td>
                <td className="p-2">
                  <p>{driver.name}</p> <p> <button 
    onClick={() => handlePhoneCall(driver.phone)}
    className="text-blue-600 hover:text-blue-800 hover:underline"
  >
    {driver.phone}
  </button> </p>
                  <p>{driver.email}</p>
  
  </td>
                <td className="p-3 "> <p> Dimensions: <strong>{driver.dimensions} </strong></p>
                 <p> payload: <strong>{driver.payload}</strong></p>
                 <p>  license plate: <strong> {driver.license_plate}</strong></p>
                  
                  </td>
                

                

                <td className="p-2">  
                  
                
      <a
        href={`https://www.google.com/maps?q=${driver.latitude},${driver.longitude}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline dark:text-blue-400"
      ><p>ZIP</p>
        </a>
        <p> {driver.zip}</p>                   
        <p>{driver.location}</p></td>
        


        <td className="p-2">{driver.date}</td>
        <td className="p-2">
      <p
  className={`text-xs font-semibold px-2.5 py-0.5 rounded ${
    driver.available && !driver.onload
      ? "bg-green-500 text-white"         // Available
      : driver.onload
      ? "bg-amber-200 text-orange-500"    // Onload
      : "bg-red-500 text-white"           // Unavailable
  }`}
>
  {driver.available && !driver.onload
    ? "Available"
    : driver.onload
    ? "Onload"
    : "Unavailable"}
</p>

          
        {/* Insurance Expiration */}
        <p className={`text-xs font-semibold px-2.5 py-0.5 rounded mt-1 ${
          driver.ins_exp ? "bg-red-500 text-white" : "bg-green-500 text-white"
        }`}>
          Insurance <span className={`text-xs font-semibold px-2.5 py-0.5 rounded mt-1 ${
          driver.ins_exp ? "bg-red-500 text-white" : "bg-green-500 text-white"
        }`}>
          {driver.insurance_date ? driver.insurance_date : "unknown"}
        </span>
        </p>
        
       
       {/* Insurance Expiration */}
        <p className={`text-xs font-semibold px-2.5 py-0.5 rounded mt-1 ${
          driver.reg_exp ? "bg-red-500 text-white" : "bg-green-500 text-white"
        }`}>
          Registration <span className={`text-xs font-semibold px-2.5 py-0.5 rounded mt-1 ${
          driver.reg_exp ? "bg-red-500 text-white" : "bg-green-500 text-white"
        }`}>
          {driver.registration_date ? driver.registration_date : "unknown"}
        </span>
        </p>



        </td>
                <td className="p-2">{driver.comments}</td>
                <td className="p-2">{driver.emergency}</td>
                
                   

                      
                <td className="p-2">{driver.distance}</td>
                <td>
                      {driver.groups?.length > 0
                        ? driver.groups.map(group => group.name).join(", ")
                        : "No groups"}
                    </td>
                <td className="p-2 space-y-1">
                  <Link
                    onClick={() => openModal(driver)}
                    className="text-blue-600 hover:text-blue-800 px-2 py-1 font-medium block w-full text-left"
                  >
                    Edit
                  </Link>
                  <Link
                    onClick={() => handleReserve(driver.id)}
                    className={`${
                      driver.reserved_by 
                        ? "text-red-600 hover:text-red-800" 
                        : "text-green-600 hover:text-green-800"
                    } px-2 py-1 font-medium block w-full text-left`}
                  >
                    {driver.reserved_by ? "Cancel" : "Reserve"}
                  </Link>
                  {driver.reserved_by && (
                    <div className="mt-1 text-sm text-green-800 dark:text-green-300">
                      <div>
                        <strong>Reserved by: </strong>
                        {driver.reserved_by_name || "Unknown"}
                      </div>
                      <Timer startTime={driver.reserved_at} />
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    
      {/* Modal */}
      {isModalOpen && selectedDriver && (
        <div
  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  onClick={closeModal}
>
  <div
    className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md"
    onClick={(e) => e.stopPropagation()}
  >
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold">Edit Carrier</h2>
      <button
        onClick={closeModal}
        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        ✕
      </button>
    </div>

    <div className="space-y-4">

      <div>
        <label className="block mb-1 text-sm font-medium">
          location:
        </label>
        <p className="bg-gray-100 dark:bg-gray-700 dark:text-white">
          {selectedDriver.location}
        </p>
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium">ZIP:</label>
        <input
          type="text"
          value={selectedDriver.zip}
          onChange={(e) => {
            setSelectedDriver({ ...selectedDriver, zip: e.target.value });
            setZipError(""); // reset ZIP error on typing
          }}
          className={`w-full p-2 border rounded bg-gray-100 dark:bg-gray-700 dark:text-white ${
            zipError ? "border-red-500" : ""
          }`}
        />
        {zipError && (
          <div className="text-red-600 text-sm mt-2">{zipError}</div>
        )}
        {error && (
          <div className="text-red-600 text-sm mt-2">
            Something went wrong. Please try again.
          </div>
        )}
      </div>



          <div>
                <label className="block mb-1 text-sm font-medium">Date and Time:</label>
           <input
            type="datetime-local"
            value={selectedDriver.date }
            onChange={(e) => setSelectedDriver({ ...selectedDriver, date: e.target.value })}
            className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-700 dark:text-white"
          />

      </div>
           {/* New Switch Buttons */}
      <div className="flex items-center space-x-4">
  {/* onload switch */}
  <label className="flex items-center space-x-2 cursor-pointer">
    <span className="text-sm font-medium">onload:</span>
    <div className="relative">
      <input
        type="checkbox"
        checked={selectedDriver.onload === 1}
        onChange={() => {
          setSelectedDriver({
            ...selectedDriver,
            onload: selectedDriver.onload === 1 ? 0 : 1,
          });
        }}
        className="sr-only"
        id="onload-switch"
      />
      <div
        className={`w-10 h-5 rounded-full shadow-inner transition-colors duration-300 ${
          selectedDriver.onload === 1 ? "bg-amber-400" : "bg-green-500"
        }`}
      ></div>
      <div
        className={`dot absolute left-0 top-0 w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-300 ${
          selectedDriver.onload === 1 ? "translate-x-full" : ""
        }`}
      ></div>
    </div>
    <span className="text-sm">{selectedDriver.onload === 1 ? "Yes" : "No"}</span>
  </label>

  {/* unavailable switch */}
  <label className="flex items-center space-x-2 cursor-pointer">
    <span className="text-sm font-medium">unavailable:</span>
    <div className="relative">
      <input
        type="checkbox"
        checked={selectedDriver.available === 0}
        onChange={() => {
          setSelectedDriver({
            ...selectedDriver,
            available: selectedDriver.available === 0 ? 1 : 0,
          });
        }}
        className="sr-only"
        id="unavailable-switch"
      />
      <div
        className={`w-10 h-5 rounded-full shadow-inner transition-colors duration-300 ${
          selectedDriver.available === 0 ? "bg-red-500" : "bg-green-500"
        }`}
      ></div>
      <div
        className={`dot absolute left-0 top-0 w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-300 ${
          selectedDriver.available === 0 ? "translate-x-full" : ""
        }`}
      ></div>
    </div>
    <span className="text-sm">{selectedDriver.available === 0 ? "Yes" : "No"}</span>
  </label>
</div>




      <div>
        <label className="block mb-1 text-sm font-medium">
          Comments:
        </label>
        <textarea
          rows="3"
          value={selectedDriver.comments}
          onChange={(e) =>
            setSelectedDriver({
              ...selectedDriver,
              comments: e.target.value,
            })
          }
          className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-700 dark:text-white"
        />
      </div>

 


    </div>

    <div className="flex justify-end space-x-2 mt-6">
      <button
        onClick={closeModal}
        className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded transition"
      >
        Cancel
      </button>
      <button
        onClick={handleUpdate}
        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition"
      >
        Save Changes
      </button>
    </div>
  </div>
</div>

      )}
    </div>

    
    




    </>
  );
};

export default Dashboard;