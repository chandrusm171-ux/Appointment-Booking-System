import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import CustomerHeader from "../components/CustomerHeader";

const features = [
  { number: "01", title: "Curated services", text: "Thoughtful cuts, styling and consultations designed around your look." },
  { number: "02", title: "Live availability", text: "See real appointment slots based on studio hours and existing bookings." },
  { number: "03", title: "Simple booking", text: "Choose your service, pick a time and confirm without unnecessary steps." },
];

function Home() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);

  useEffect(() => {
    api.get("/services").then((response) => setServices(response.data.data || [])).catch(() => setServices([]));
  }, []);

  return (
    <div className="home-page">
      <CustomerHeader />

      <main>
        <section className="home-hero">
          <div className="home-hero-glow home-hero-glow-one" />
          <div className="home-hero-glow home-hero-glow-two" />
          <div className="container home-hero-grid">
            <div className="home-hero-copy">
              <div className="hero-kicker"><span className="kicker-dot" /> Luma Studio · Personal beauty experience</div>
              <h1>Look good.<br /><em>Feel like you.</em></h1>
              <p>Modern hair care and styling, thoughtfully delivered in a calm studio environment. Choose your service and reserve a time that works for you.</p>
              <div className="hero-actions">
                <button className="luxury-button" onClick={() => navigate("/services")}>Book an appointment <span>↗</span></button>
                <a className="text-cta" href="#experience">Explore Luma <span>↓</span></a>
              </div>
              <div className="hero-trust-row">
                <div><strong>15 min</strong><span>booking intervals</span></div>
                <div><strong>{services.length || "—"}</strong><span>services available</span></div>
                <div><strong>7 days</strong><span>planned availability</span></div>
              </div>
            </div>

            <div className="home-hero-visual">
              <div className="hero-image-frame">
                <img src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1100&q=85" alt="Modern Luma Studio salon interior" />
                <div className="hero-image-overlay" />
                <div className="floating-booking-card">
                  <span className="floating-label">NEXT STEP</span>
                  <strong>Choose your service</strong>
                  <span>Then we'll show live appointment times.</span>
                </div>
                <div className="image-caption"><span>01</span><span>Modern studio · Calm atmosphere</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="brand-strip" aria-label="Luma Studio highlights">
          <div className="container brand-strip-inner">
            <span>PERSONALIZED</span><span>MODERN</span><span>PRECISE</span><span>EFFORTLESS</span><span>MADE FOR YOU</span>
          </div>
        </section>

        <section className="experience-section" id="experience">
          <div className="container">
            <div className="section-intro split-intro">
              <div><span className="section-label">THE LUMA EXPERIENCE</span><h2>A studio experience that feels as good as the result.</h2></div>
              <p>From the first click to the final look, Luma Studio is designed around clarity, comfort and personal attention.</p>
            </div>
            <div className="feature-grid">
              {features.map((feature) => <article className="feature-card" key={feature.number}><span>{feature.number}</span><div><h3>{feature.title}</h3><p>{feature.text}</p></div><span className="feature-arrow">↗</span></article>)}
            </div>
          </div>
        </section>

        <section className="services-preview-section" id="services">
          <div className="container">
            <div className="section-intro services-intro"><div><span className="section-label">OUR SERVICES</span><h2>Made for your next look.</h2></div><Link className="outline-link" to="/services">View all services <span>↗</span></Link></div>
            <div className="home-service-grid">
              {services.slice(0, 4).map((service, index) => (
                <article className="home-service-card" key={service._id}>
                  <div className="service-index">0{index + 1}</div><div className="service-card-line" />
                  <h3>{service.name}</h3><p>{service.description}</p>
                  <div className="home-service-bottom"><span>{service.duration} min</span><strong>₹{Number(service.price).toLocaleString("en-IN")}</strong></div>
                  <button onClick={() => navigate(`/booking?serviceId=${service._id}`)}>Book <span>↗</span></button>
                </article>
              ))}
              {!services.length && [1,2,3].map((item) => <div className="home-service-card service-placeholder" key={item} />)}
            </div>
          </div>
        </section>

        <section className="story-section">
          <div className="container story-grid">
            <div className="story-image"><img src="https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=85" alt="Client enjoying a beauty styling experience" /><div className="story-stamp">LUMA<br />STUDIO</div></div>
            <div className="story-copy"><span className="section-label">WHY LUMA</span><h2>Personal style, without the complicated booking experience.</h2><p>We believe booking should feel as considered as the service itself. That's why the Luma experience combines a refined studio atmosphere with a clear, real-time appointment journey.</p><div className="story-list"><div><strong>01</strong><span>Choose a service that fits your needs.</span></div><div><strong>02</strong><span>See available times before you commit.</span></div><div><strong>03</strong><span>Confirm your appointment in minutes.</span></div></div><button className="dark-text-button" onClick={() => navigate("/services")}>Find your service <span>↗</span></button></div>
          </div>
        </section>

        <section className="process-section" id="how-it-works">
          <div className="container">
            <div className="section-intro center-intro"><span className="section-label">HOW IT WORKS</span><h2>Your appointment, three simple moves.</h2><p>No account required. Just choose, schedule and confirm.</p></div>
            <div className="process-grid"><div><span>01</span><h3>Choose</h3><p>Pick the service that matches the look or treatment you want.</p></div><div><span>02</span><h3>Schedule</h3><p>Select a date and an available time from our live schedule.</p></div><div><span>03</span><h3>Confirm</h3><p>Enter your contact details and receive your booking reference.</p></div></div>
          </div>
        </section>

        <section className="home-cta-section">
          <div className="container"><div className="home-cta"><div><span className="section-label">READY WHEN YOU ARE</span><h2>Your next look starts here.</h2><p>Browse the services and reserve a time in just a few steps.</p></div><button className="light-button" onClick={() => navigate("/services")}>Book an appointment <span>↗</span></button></div></div>
        </section>
      </main>

      <footer className="site-footer"><div className="container footer-grid"><div><Link className="footer-brand" to="/"><span className="brand-mark">LS</span><strong>LUMA STUDIO</strong></Link><p>Modern appointments, personal service.</p></div><div><span>Explore</span><Link to="/">Home</Link><Link to="/services">Services</Link><Link to="/admin/login">Admin</Link></div><div><span>Booking</span><a href="#services">Browse services</a><Link to="/services">Reserve a time</Link></div></div><div className="container footer-bottom"><span>© 2026 Luma Studio</span><span>Designed for a calm, modern booking experience.</span></div></footer>
    </div>
  );
}

export default Home;
