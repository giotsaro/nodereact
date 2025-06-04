import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [role, setRole] = useState(localStorage.getItem("role") || null);
  const [email, setEmail] = useState(localStorage.getItem("email") || null);
  const [name, setName] = useState(localStorage.getItem("name") || null);

  const login = (userRole, userEmail,userName) => {
    setRole(userRole);
    setEmail(userEmail);
    setName(userName);

    localStorage.setItem("role", userRole);
    localStorage.setItem("email", userEmail);
    localStorage.setItem("name", userName);
  };

  const logout = () => {
    setRole(null);
    setEmail(null);
    setName(null);

    localStorage.removeItem("role");
    localStorage.removeItem("email");
    localStorage.removeItem("name");
  };

  return (
    <AuthContext.Provider value={{ role, email,name, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
