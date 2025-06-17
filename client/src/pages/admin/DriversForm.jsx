import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import { toast } from "sonner";

const DriverForm = ({ onSubmit, initialData = {}, isEditing = false }) => {
  const [formData, setFormData] = useState({
    unit: "",
    name: "",
    dimensions: "",
    payload: "",
    license_plate: "",
    phone: "",
    location: "",
    zip: "",
    date: "",
    insurance_date: "",
    registration_date: "",
    comments: "",
    email: "",
    emergency: "",
    groups: [],
  });
  const navigate = useNavigate();

  const [drivers, setDrivers] = useState([]);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
      }));
    }
  }, [initialData]);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await API.get("/groups");
      setGroups(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Server error");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

 const handleAddDriver = async (newDriver) => {
  if (!newDriver.unit || !newDriver.name || !newDriver.phone) {
     toast.error("'unit', 'name' და 'phone' is required");
    return;
  }

  try {
    const res = await API.post("/drivers", newDriver);
    setDrivers((prev) => [...prev, { ...newDriver, id: res.data.id }]);
    toast.success("successfully added new driver");
    navigate("/drivers"); // გადამისამართება გადამზიდავების სიაში
  } catch (err) {
    toast.error(err.response?.data?.message || err.message || "error adding driver");
  }
};


const handleUpdateDriver = async (id, updatedDriver) => {
  if (!updatedDriver.unit || !updatedDriver.name || !updatedDriver.phone) {
    toast.error("'unit', 'name' და 'phone' is required");
    return;
  }

  try {
    await API.put(`/drivers/${id}`, updatedDriver);
    setDrivers((prev) =>
      prev.map((driver) => (driver.id === id ? { ...driver, ...updatedDriver } : driver))
    );
    toast.success("updated successfully");
     navigate("/drivers");
  } catch (err) {
    toast.error(err.response?.data?.message || err.message || "update error");
  }
};


const handleSubmit = (driver) => {
  if (driver.id) {
    handleUpdateDriver(driver.id, driver);
  } else {
    handleAddDriver(driver);
  }
};





  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 sm:grid-cols-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
    >
      {[
        { name: "unit", label: "Unit" },
        { name: "name", label: "Name" },
        { name: "dimensions", label: "Dimensions" },
        { name: "payload", label: "Payload" },
        { name: "license_plate", label: "Picense Plate" },
        { name: "phone", label: "Phone" },
        { name: "zip", label: "ZIP" },
        { name: "date", label: "Date", type: "datetime-local" }, // ⏱️ შეიცვალა "date" → "datetime-local"
        { name: "insurance_date", label: "Insurance Date", type: "datetime-local" },
        { name: "registration_date", label: "Registration Date", type: "datetime-local" },
        { name: "comments", label: "Comments" },
        { name: "email", label: "Email", type: "email" },
        { name: "emergency", label: "Emergency" },
      ].map(({ name, label, type = "text" }) => (
        <div key={name} className="flex flex-col">
          <label
            htmlFor={name}
            className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
          </label>
          <input
            type={type}
            name={name}
            id={name}
            placeholder={label}
            value={formData[name] || ""}
            onChange={handleChange}
            className="p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
      ))}

      <div className="col-span-full flex flex-col">
        <label
          htmlFor="groups"
          className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Groups
        </label>
        <select
          name="groups"
          multiple
          value={formData.groups}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions, (o) => o.value);
            setFormData((prev) => ({ ...prev, groups: selected }));
          }}
          className="p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </div>

           <button
            type="button"
            onClick={() => handleSubmit(formData)}
            className="col-span-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded"
          >
            {isEditing ? "Update Driver" : "Add Driver"}
          </button>

    </form>
  );
};

export default DriverForm;