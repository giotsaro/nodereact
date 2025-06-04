import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
  const { role, email, name, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const linkClass =
    "px-3 py-2 text-xs font-medium text-center inline-flex items-center text-white bg-blue-700 rounded-lg hover:bg-blue-800";

  const getHomeLink = () => {
    if (!role) return "/";
    if (role === "hr") return "/hr";
    return "/dashboard";
  };

  return (
    <nav className="p-4 bg-gray-900 text-black dark:text-white flex justify-between items-center shadow-md">
      {/* Logo/Home */}
      <Link to={getHomeLink()} className="text-xl text-white font-bold">
        MyApp
      </Link>

      {/* Right side links */}
      <div className="flex gap-4 items-center">
        {!role ? (
          <>
            <Link to="/login" className={linkClass}>
              Login
            </Link>
            <Link to="/signup" className={linkClass}>
              Sign Up
            </Link>
          </>
        ) : (
          <>
            <ThemeToggle />

            <span className="text-sm text-gray-300">
              Welcome{name ? `, ${name}` : ""}
            </span>

            {/* Dashboard */}
            {(role === "admin" || role === "sa" || role === "user") && (
              <Link to="/dashboard" className={linkClass}>
                Dashboard
              </Link>
            )}

            {/* HR Section */}
            {(role === "admin" || role === "sa" || role === "hr") && (
              <>
                <Link to="/hr" className={linkClass}>
                  HR
                </Link>
                <Link to="/drivers" className={linkClass}>
                  Drivers
                </Link>
                <Link to="/groups" className={linkClass}>
                  Groups
                </Link>
              </>
            )}

            {/* Admin-only */}
            {(role === "admin" || role === "sa") && (
              <Link to="/users" className={linkClass}>
                Users
              </Link>
            )}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="px-3 py-2 text-xs font-medium text-center inline-flex items-center text-white bg-red-700 rounded-lg hover:bg-red-800"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
