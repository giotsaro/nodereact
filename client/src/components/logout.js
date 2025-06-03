import API from "../api/axios";
import { useNavigate } from "react-router-dom";

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await API.post("/auth/logout");
      localStorage.removeItem("role"); // თუ რამე info გაქვს შენახული
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2">
      Logout
    </button>
  );
};

export default LogoutButton;
