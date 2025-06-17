import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault(); // პრევენთ გავაკეთოთ form-ის დეფოლტ ქცევას
    try {
      const res = await API.post("/auth/login", { email, password });
      login(res.data.role, res.data.email, res.data.name); // AuthContext-ში როლის, ელფოსტის და სახელის შენახვა

      if (["admin", "sa", "user"].includes(res.data.role)) {
        navigate("/dashboard");
      }else if (res.data.role === "hr") {
        navigate("/hr");  
      }else {
        navigate("/login");
      }
    } catch (err) {
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  };

  const inputClass =
    "border p-1.5 w-full rounded-lg transition outline-none focus:border-blue-500 " +
    (error ? "border-red-500" : "border-gray-300 dark:border-gray-600") +
    " bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm";

  return (
    <div className="p-4 max-w-sm mx-auto min-h-[70vh] mt-[5px] flex flex-col justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white overflow-auto">
      <div className="max-h-[80vh] flex flex-col justify-center space-y-3">
        <h2 className="text-xl font-bold mb-4 text-center">Login</h2>
        
        <form onSubmit={handleLogin} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className={`${inputClass} mb-3`}
            required
            autoComplete="on"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className={`${inputClass} mb-3`}
            required
            autoComplete="on"
          />

          {error && (
            <p className="text-red-500 mb-3 text-sm text-center">
              Invalid email or password
            </p>
          )}

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-1.5 w-full rounded-lg transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;