import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import { toast } from "sonner";

const CarrierForm = ({ onSubmit, initialData = {}, isEditing = false }) => {
  const [formData, setFormData] = useState({
    unit: "",
    name: "",
    dimensions: "",
    payload: "",
    phone: "",
    location: "",
    zip: "",
    date: "",
    insurance_date: "",
    comments: "",
    email: "",
    emergency: "",
    groups: [],
  });
  const navigate = useNavigate();

  const [carriers, setCarriers] = useState([]);
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

 const handleAddCarrier = async (newCarrier) => {
  if (!newCarrier.unit || !newCarrier.name || !newCarrier.phone) {
     toast.error("'unit', 'name' და 'phone' is required");
    return;
  }

  try {
    const res = await API.post("/carriers", newCarrier);
    setCarriers((prev) => [...prev, { ...newCarrier, id: res.data.id }]);
    toast.success("successfully added new carrier");
    navigate("/carriers"); // გადამისამართება გადამზიდავების სიაში
  } catch (err) {
    toast.error(err.response?.data?.message || err.message || "error adding carrier");
  }
};


const handleUpdateCarrier = async (id, updatedCarrier) => {
  if (!updatedCarrier.unit || !updatedCarrier.name || !updatedCarrier.phone) {
    toast.error("'unit', 'name' და 'phone' is required");
    return;
  }

  try {
    await API.put(`/carriers/${id}`, updatedCarrier);
    setCarriers((prev) =>
      prev.map((carrier) => (carrier.id === id ? { ...carrier, ...updatedCarrier } : carrier))
    );
    toast.success("updated successfully");
     navigate("/carriers");
  } catch (err) {
    toast.error(err.response?.data?.message || err.message || "update error");
  }
};


const handleSubmit = (carrier) => {
  if (carrier.id) {
    handleUpdateCarrier(carrier.id, carrier);
  } else {
    handleAddCarrier(carrier);
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
        { name: "phone", label: "Phone" },
        { name: "zip", label: "ZIP" },
        { name: "date", label: "Date", type: "datetime-local" }, // ⏱️ შეიცვალა "date" → "datetime-local"
        { name: "insurance_date", label: "Insurance Date", type: "datetime-local" },
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
            {isEditing ? "Update Carrier" : "Add Carrier"}
          </button>

    </form>
  );
};

export default CarrierForm;