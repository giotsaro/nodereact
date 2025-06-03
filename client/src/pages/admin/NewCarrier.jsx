import CarrierForm from "./CarrierForm";
import API from "../../api/axios";
import { useNavigate } from "react-router-dom";

const NewCarrier = () => {
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    try {
      await API.post("/carriers", formData);
      navigate("/carriers"); // დაბრუნება carriers გვერდზე
    } catch (error) {
      console.error("❌ Error adding carrier:", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 dark:bg-gray-900 dark:text-white min-h-screen">
      <h2 className="text-3xl font-bold mb-6">Add New Carrier</h2>
      <CarrierForm onSubmit={handleSubmit} isEditing={false} />
    </div>
  );
};

export default NewCarrier;
