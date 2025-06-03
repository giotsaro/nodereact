import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [role, setRole] = useState(localStorage.getItem("role") || null);
  const [email, setEmail] = useState(localStorage.getItem("email") || null);

  const login = (userRole, userEmail) => {
    setRole(userRole);
    setEmail(userEmail);

    localStorage.setItem("role", userRole);
    localStorage.setItem("email", userEmail);
  };

  const logout = () => {
    setRole(null);
    setEmail(null);

    localStorage.removeItem("role");
    localStorage.removeItem("email");
  };

  return (
    <AuthContext.Provider value={{ role, email, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
