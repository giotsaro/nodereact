
import API from "../../api/axios";
import { useNavigate } from "react-router-dom";
import DriverForm from "./DriversForm";

const NewDriver = () => {
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    try {
      await API.post("/drivers", formData);
      navigate("/drivers"); // დაბრუნება drivers გვერდზე
    } catch (error) {
      console.error("❌ Error adding drivers:", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 dark:bg-gray-900 dark:text-white min-h-screen">
      <h2 className="text-3xl font-bold mb-6">Add New Driver</h2>
      <DriverForm onSubmit={handleSubmit} isEditing={false} />
    </div>
  );
};

export default NewDriver;
