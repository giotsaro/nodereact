import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DriverForm from "./DriversForm";
import API from "../../api/axios";

const EditDriver = () => {
  const { id } = useParams();
  const [driverData, setDriverData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDriverData();
  }, [id]);

  const fetchDriverData = async () => {
    try {
      const response = await API.get(`/drivers/${id}`);
      setDriverData(response.data);
    } catch (error) {
      console.error("❌ Error fetching driver:", error);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      await API.put(`/drivers/${id}`, formData);
      navigate("/drivers"); // დაბრუნება drivers გვერდზე
    } catch (error) {
      console.error("❌ Error updating driver:", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 dark:bg-gray-900 dark:text-white min-h-screen">
      <h2 className="text-3xl font-bold mb-6">Edit Driver</h2>
      {driverData ? (
        <DriverForm
          onSubmit={handleSubmit}
          initialData={driverData}
          isEditing={true}
        />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default EditDriver;
