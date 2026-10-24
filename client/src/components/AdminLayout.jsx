import { NavLink, useNavigate } from "react-router-dom";
import api from "../services/api";
import { clearAdminSession, getStoredAdmin } from "../services/auth";

function AdminLayout({ title, children }) {
  const navigate = useNavigate();
  const admin = getStoredAdmin();

  const logout = async () => {
    try {
      await api.post("/admin/logout");
    } catch {
      // Local session is still cleared if the network request fails.
    } finally {
      clearAdminSession();
      navigate("/admin/login", { replace: true });
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="admin-header-inner">
          <NavLink className="brand" to="/admin/dashboard">
            <span className="brand-mark">LS</span>
            <span className="brand-copy"><strong>LUMA STUDIO</strong><span>Admin workspace</span></span>
          </NavLink>
          <div className="admin-session-badge"><span className="session-dot" /> Secure session</div>
          <div className="admin-header-right">
            <div className="admin-info">
              <strong>{admin?.name || "Luma Studio Admin"}</strong>
              <span>{admin?.email || "admin@lumastudio.com"}</span>
            </div>
            <button className="header-link" onClick={logout}>Logout</button>
          </div>
        </div>
      </header>

      <main className="admin-container">
        <nav className="admin-nav" aria-label="Admin navigation">
          <NavLink to="/admin/dashboard">Dashboard</NavLink>
          <NavLink to="/admin/bookings">Bookings</NavLink>
          <NavLink to="/admin/history">History</NavLink>
          <NavLink to="/admin/services">Services</NavLink>
          <NavLink to="/admin/availability">Availability</NavLink>
        </nav>
        {title && <div className="sr-only">{title}</div>}
        {children}
      </main>
    </div>
  );
}

export default AdminLayout;
