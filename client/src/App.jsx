import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Services from "./pages/Services";
import Booking from "./pages/Booking";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminBookings from "./pages/AdminBookings";
import AdminHistory from "./pages/AdminHistory";
import AdminServices from "./pages/AdminServices";
import AdminAvailability from "./pages/AdminAvailability";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./pages/NotFound";
import "./App.css";

function App() {
  return <BrowserRouter><ErrorBoundary><Routes>
    <Route path="/" element={<Home />} />
    <Route path="/services" element={<Services />} />
    <Route path="/booking" element={<Booking />} />
    <Route path="/admin/login" element={<AdminLogin />} />
    <Route element={<ProtectedRoute />}>
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/bookings" element={<AdminBookings />} />
      <Route path="/admin/history" element={<AdminHistory />} />
      <Route path="/admin/services" element={<AdminServices />} />
      <Route path="/admin/availability" element={<AdminAvailability />} />
    </Route>
    <Route path="*" element={<NotFound />} />
  </Routes></ErrorBoundary></BrowserRouter>;
}
export default App;
