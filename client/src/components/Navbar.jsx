import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // თქვენი კონტექსტი
import ThemeToggle from "./ThemeToggle"; // თქვენი თემა შეცვლის კომპონენტი

const Navbar = () => {
  const { role, email, logout } = useAuth(); // აქ უკვე გვაქვს email
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="p-4 bg-gray-900 text-black dark:text-white flex justify-between items-center shadow-md">
      
      {!role ? ( 
        <>
        
        <Link to="/"className="text-xl text-white font-bold"> MyApp</Link>
        
        </>
      ): (  
      <>
            <Link to="/dashboard"className="text-xl text-white font-bold"> MyApp</Link>
      </> )}
    

      <div className="flex gap-4 items-center">
        {!role ? (
          <>
            <Link
              to="/login"
              className="px-3 py-2 text-xs font-medium text-center inline-flex items-center text-white bg-blue-700 rounded-lg hover:bg-blue-800"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-3 py-2 text-xs font-medium text-center inline-flex items-center text-white bg-blue-700 rounded-lg hover:bg-blue-800"
            >
              Sign Up
            </Link>
          </>
        ) : (
          <>
           <ThemeToggle />
           <span className="text-sm text-gray-300">
              Welcome, {email} {/* Email გამოჩენა */}
            </span>
            <Link
              to="/dashboard"
              className="px-3 py-2 text-xs font-medium text-center inline-flex items-center text-white bg-blue-700 rounded-lg hover:bg-blue-800"
            >
              Dashboard
            </Link>

           

            {(role === "admin" || role === "sa") && (
              <>
            {/*      <Link
                  to="/online"
                  className="px-3 py-2 text-xs font-medium text-center inline-flex items-center text-white bg-blue-700 rounded-lg hover:bg-blue-800"
                >Online Users
                   </Link>  */}
              
                <Link
                  to="/users"
                  className="px-3 py-2 text-xs font-medium text-center inline-flex items-center text-white bg-blue-700 rounded-lg hover:bg-blue-800"
                >
                  Users
                </Link>
                <Link
                  to="/carriers"
                  className="px-3 py-2 text-xs font-medium text-center inline-flex items-center text-white bg-blue-700 rounded-lg hover:bg-blue-800"
                >
                  Carriers
                </Link>
                <Link
                  to="/groups"
                  className="px-3 py-2 text-xs font-medium text-center inline-flex items-center text-white bg-blue-700 rounded-lg hover:bg-blue-800"
                >
                  Groups
                </Link>
              
              </>
              )}  
            

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
