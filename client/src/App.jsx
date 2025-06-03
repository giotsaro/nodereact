import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import PublicRoute from "./routes/PublicRoute";
import PrivateRoute from "./routes/PrivateRoute";
import UsersPage from "./pages/admin/UsersPage";
import CarriersPage from "./pages/admin/Carriers";
import NewCarrier from "./pages/admin/NewCarrier";
import EditCarrier from "./pages/admin/EditCarrier";
import GroupPage from "./pages/admin/GroupPage";
import { Toaster } from 'sonner';
import NotFound from "./pages/NotFound";
import Online from "./pages/admin/OnlineUsers";

function App() {
  return (
    <>
    <Router>
      <Navbar />
      <Routes>
          <Route path="/login" element={ <PublicRoute><Login /></PublicRoute> } />
          <Route path="/register" element={ <PublicRoute><Register /></PublicRoute> } />


          <Route path="/dashboard" element={ <PrivateRoute allowedRoles={["admin", "sa", "user"]}><Dashboard /></PrivateRoute> } />
          <Route path="/users" element={ <PrivateRoute allowedRoles={["admin", "sa"]}><UsersPage /></PrivateRoute> } />
          <Route path="/carriers" element={ <PrivateRoute allowedRoles={["admin", "sa"]}><CarriersPage /></PrivateRoute> } />
          <Route path="/carriers/new" element={ <PrivateRoute allowedRoles={["admin", "sa"]}><NewCarrier /></PrivateRoute> } />
          <Route path="/carriers/:id/edit" element={ <PrivateRoute allowedRoles={["admin", "sa"]}><EditCarrier /></PrivateRoute> } />
          <Route path="/" element={<div className="text-3xl text-blue-600 font-bold underline">საწყისი გვერდი</div>} />

          <Route path="/groups" element={ <PrivateRoute allowedRoles={["admin", "sa"]}><GroupPage /></PrivateRoute> } />

           <Route path="/online" element={ <PrivateRoute allowedRoles={["admin", "sa"]}><Online /></PrivateRoute> } /> 

           <Route path="*" element={<NotFound />} />
      </Routes>

    </Router>
    <Toaster position="top-right" />
    </>
  );
}

export default App;
