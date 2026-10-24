import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import CustomerHeader from "../components/CustomerHeader";

function Services() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/services");
      setServices(response.data.data || []);
    } catch (requestError) {
      console.error("Failed to fetch services:", requestError);
      setError(requestError.response?.data?.message || "Unable to load services. Please try again.");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchServices(); }, []);

  return (
    <div className="services-page-shell">
      <CustomerHeader />
      <main className="customer-main">
        <div className="container">
          <section className="hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">Luma Studio · Choose your experience</p>
              <h1 className="hero-title">Choose your service.<br />We will take care of the rest.</h1>
              <p className="hero-subtitle">Explore our signature cuts, styling and consultation experiences, then choose a date and live appointment time that works for you.</p>
              <div className="hero-note">
                <span className="pill">✓ Real-time availability</span>
                <span className="pill">✓ Instant confirmation</span>
                <span className="pill">✓ Secure booking</span>
              </div>
            </div>
            <aside className="hero-card">
              <div className="hero-card-content">
                <p className="eyebrow" style={{ color: "#94a3b8" }}>Your next appointment</p>
                <h2>Find a time that works for you.</h2>
                <p>Our availability engine checks working hours and existing bookings before showing a slot.</p>
              </div>
              <div className="hero-card-footer">
                <div className="hero-card-stat"><strong>{services.length}</strong><span>services available</span></div>
                <div className="hero-card-stat"><strong>15 min</strong><span>booking intervals</span></div>
              </div>
            </aside>
          </section>

          <section aria-labelledby="services-heading">
            <div className="section-head">
              <div><h2 id="services-heading">Our services</h2><p>Select a service to see available appointments.</p></div>
            </div>

            {loading && <div className="service-grid">{[1,2,3,4].map((item) => <div className="service-card" key={item} aria-hidden="true"><div className="skeleton" /><div className="skeleton skeleton-title" /><div className="skeleton skeleton-text" /><div className="skeleton skeleton-button" /></div>)}</div>}

            {!loading && error && <div className="loading-state"><div className="alert alert-error">{error}</div><button className="primary-button" style={{ marginTop: 14 }} onClick={fetchServices}>Try again</button></div>}

            {!loading && !error && services.length === 0 && <div className="empty-state">No services are currently available.</div>}

            {!loading && !error && services.length > 0 && (
              <div className="service-grid">
                {services.map((service, index) => (
                  <article className="service-card" key={service._id}>
                    <div className="service-top"><span className="service-icon">{String(index + 1).padStart(2, "0")}</span><span className="status-dot">Available</span></div>
                    <h3>{service.name}</h3>
                    <p>{service.description}</p>
                    <div className="service-meta"><span className="service-duration">{service.duration} min</span><span className="service-price">₹{Number(service.price).toLocaleString("en-IN")}</span></div>
                    <button className="primary-button" onClick={() => navigate(`/booking?serviceId=${service._id}`)}>Book appointment</button>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default Services;
