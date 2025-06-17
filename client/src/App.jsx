import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard.jsx";
import PublicRoute from "./routes/PublicRoute";
import PrivateRoute from "./routes/PrivateRoute";
import UsersPage from "./pages/admin/UsersPage";
import DriversPage from "./pages/admin/Drivers";
import NewDriver from "./pages/admin/NewDrivers";
import EditDriveer from "./pages/admin/EditDrivers";
import GroupPage from "./pages/admin/GroupPage";
import { Toaster } from 'sonner';
import NotFound from "./pages/NotFound";
import Online from "./pages/admin/OnlineUsers";
import HRDashboard from "./pages/hr/HR";
import RoleRedirect from "./pages/RoleRedirect";

import BillingPage from "./pages/admin/BillingPage";
import BillingForm from "./pages/admin/BillingForm";

function App() {
  return (
    <>
    <Router>
      <Navbar />
      <Routes>
          <Route path="/login" element={ <PublicRoute><Login /></PublicRoute> } />
          <Route path="/register" element={ <PublicRoute><Register /></PublicRoute> } />

          <Route path="/"element={<PrivateRoute allowedRoles={["admin", "sa", "user", "hr"]}><RoleRedirect /></PrivateRoute> }/>
          <Route path="/dashboard" element={ <PrivateRoute allowedRoles={["admin", "sa", "user"]}><Dashboard /></PrivateRoute> } />
          <Route path="/users" element={ <PrivateRoute allowedRoles={["admin", "sa"]}><UsersPage /></PrivateRoute> } />
          <Route path="/drivers" element={ <PrivateRoute allowedRoles={["admin", "sa","hr"]}><DriversPage /></PrivateRoute> } />
          <Route path="/drivers/new" element={ <PrivateRoute allowedRoles={["admin", "sa","hr"]}><NewDriver /></PrivateRoute> } />
          <Route path="/drivers/:id/edit" element={ <PrivateRoute allowedRoles={["admin", "sa","hr"]}><EditDriveer /></PrivateRoute> } />

          

          <Route path="/groups" element={ <PrivateRoute allowedRoles={["admin", "sa","hr"]}><GroupPage /></PrivateRoute> } />
          <Route path="/online" element={ <PrivateRoute allowedRoles={["admin", "sa"]}><Online /></PrivateRoute> } /> 

          <Route path="/hr" element={ <PrivateRoute allowedRoles={["hr","admin","sa"]}><HRDashboard /></PrivateRoute> } />
   


          <Route path="/billing" element={ <PrivateRoute allowedRoles={["admin", "sa","hr"]}><BillingPage /></PrivateRoute> } />
          <Route path="/billing/:id/edit" element={ <PrivateRoute allowedRoles={["admin", "sa","hr"]}><BillingForm /></PrivateRoute> } />
          <Route path="/billing/new" element={ <PrivateRoute allowedRoles={["admin", "sa","hr"]}><BillingForm /></PrivateRoute> } />

           <Route path="*" element={<NotFound />} />
      </Routes>

    </Router>
    <Toaster position="top-right" />
    </>
  );
}

export default App;
