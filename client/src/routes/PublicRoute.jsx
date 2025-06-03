import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
  const role = localStorage.getItem("role");
  return !role ? children : <Navigate to="/" />;
};

export default PublicRoute;
