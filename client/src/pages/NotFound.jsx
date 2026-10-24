import { Link, useLocation } from "react-router-dom";
import CustomerHeader from "../components/CustomerHeader";

function NotFound() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  if (isAdmin) {
    return (
      <main className="system-state-page admin-system-state">
        <section className="system-state-card">
          <span className="brand-mark">LS</span>
          <p className="eyebrow">Luma Studio · Admin workspace</p>
          <h1>Page not found.</h1>
          <p>The admin page you requested does not exist or may have moved.</p>
          <div className="system-state-actions">
            <Link className="luxury-button" to="/admin/dashboard">Go to dashboard ↗</Link>
            <Link className="secondary-button" to="/">Customer site</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <div className="page-shell">
      <CustomerHeader />
      <main className="system-state-page customer-system-state">
        <section className="system-state-card">
          <span className="brand-mark">LS</span>
          <p className="eyebrow">Luma Studio · 404</p>
          <h1>This page isn't part of the experience.</h1>
          <p>Let's take you back to the studio and find the right place.</p>
          <div className="system-state-actions">
            <Link className="luxury-button" to="/">Return to Luma Studio ↗</Link>
            <Link className="secondary-button" to="/services">Explore services</Link>
          </div>
        </section>
      </main>
    </div>
  );
}

export default NotFound;
