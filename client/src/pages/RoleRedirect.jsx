import { useEffect } from "react"; 
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RoleRedirect = () => {
  const navigate = useNavigate();
  const { role } = useAuth(); // აქ სწორად ვიღებთ role-ს

  useEffect(() => {
    if (!role) return;

    console.log("RoleRedirect component mounted. Current role:", role);

    switch (role) {
      case "admin":
      case "sa":
      case "user":
        navigate("/dashboard");
        break;
      case "hr":
        navigate("/hr");
        break;
      default:
        navigate("/login"); 
    }
  }, [role, navigate]);

  return null; // აქ არაფრის დაბრუნება არ არის საჭირო
};

export default RoleRedirect;
