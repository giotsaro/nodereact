import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../api/axios";
import { toast } from "sonner";

const initialState = {
  full_name: "",
  dob: "",
  phone1: "",
  phone2: "",
  email: "",
  zip: "",
  address: "",
  city: "",
  state: "",
  reputation: "",
  notes: "",
  legal_name: "",
  ein: "",
};

export default function BillingForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialState);
  const isEditing = !!id;

  useEffect(() => {
    if (isEditing) {
      API.get(`/billing/${id}`)
        .then((res) => {
          const data = res.data;
          if (data.dob) {
            data.dob = data.dob.slice(0, 10);
          }
          setFormData(data);
        })
        .catch(() => toast.error("error loading billing data"));
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await API.put(`/billing/${id}`, formData);
        toast.success("updated successfully");
      } else {
        await API.post("/billing", formData);
        toast.success("added successfully");
      }
      navigate("/billing");
    } catch (err) {
      toast.error("error occurred: " + (err.response?.data?.message || err.message || "error"));
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto text-black dark:text-white">
      <h1 className="text-2xl font-bold mb-4">{isEditing ? "Edit Account" : "New Account"}</h1>

      <form
  onSubmit={handleSubmit}
  className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow max-w-7xl mx-auto"
>
  {Object.keys(initialState).map((key) => {
    const isDateField = key === "dob";
    return (
      <div key={key} className="flex flex-col">
        <label htmlFor={key} className="mb-1 text-sm font-medium capitalize text-gray-700 dark:text-gray-300">
          {key.replace(/_/g, " ")}
        </label>
        <input
          id={key}
          type={isDateField ? "date" : "text"}
          className="text-sm p-2 h-10 border rounded w-full text-black dark:text-white bg-white dark:bg-gray-700"
          value={formData[key]}
          onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
        />
      </div>
    );
  })}

  {/* Submit & Cancel Buttons */}
  <div className="col-span-1 md:col-span-3 flex justify-end gap-4 mt-4">
    <button
      type="submit"
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
    >
      {isEditing ? "Update" : "Save"}
    </button>
    <button
      type="button"
      onClick={() => navigate("/billing")}
      className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
    >
      Cancel
    </button>
  </div>
</form>

    </div>
  );
}
