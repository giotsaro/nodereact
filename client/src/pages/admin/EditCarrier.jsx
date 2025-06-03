import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CarrierForm from "./CarrierForm";
import API from "../../api/axios";

const EditCarrier = () => {
  const { id } = useParams();
  const [carrierData, setCarrierData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCarrierData();
  }, [id]);

  const fetchCarrierData = async () => {
    try {
      const response = await API.get(`/carriers/${id}`);
      setCarrierData(response.data);
    } catch (error) {
      console.error("❌ Error fetching carrier:", error);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      await API.put(`/carriers/${id}`, formData);
      navigate("/carriers"); // დაბრუნება carriers გვერდზე
    } catch (error) {
      console.error("❌ Error updating carrier:", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 dark:bg-gray-900 dark:text-white min-h-screen">
      <h2 className="text-3xl font-bold mb-6">Edit Carrier</h2>
      {carrierData ? (
        <CarrierForm
          onSubmit={handleSubmit}
          initialData={carrierData}
          isEditing={true}
        />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default EditCarrier;
