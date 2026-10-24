import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

function CustomerHeader({ showBack = false }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  const close = () => setOpen(false);

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link className="brand" to="/" onClick={close}>
          <span className="brand-mark">LS</span>
          <span className="brand-copy"><strong>LUMA STUDIO</strong><span>Modern appointments</span></span>
        </Link>
        <button className="mobile-menu-button" type="button" aria-label="Toggle navigation" aria-expanded={open} onClick={() => setOpen((value) => !value)}><span /><span /></button>
        <nav className={`customer-nav ${open ? "open" : ""}`} aria-label="Main navigation">
          <Link className={isHome ? "active" : ""} to="/" onClick={close}>Home</Link>
          <a href={isHome ? "#experience" : "/#experience"} onClick={close}>Experience</a>
          <Link className={location.pathname === "/services" ? "active" : ""} to="/services" onClick={close}>Services</Link>
          <a href={isHome ? "#how-it-works" : "/#how-it-works"} onClick={close}>How it works</a>
          {showBack ? <Link className="nav-cta" to="/services" onClick={close}>Back to services <span>↗</span></Link> : <Link className="nav-cta" to="/services" onClick={close}>Book appointment <span>↗</span></Link>}
        </nav>
      </div>
    </header>
  );
}

export default CustomerHeader;
