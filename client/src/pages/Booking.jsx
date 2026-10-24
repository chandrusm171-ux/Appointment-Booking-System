import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";
import CustomerHeader from "../components/CustomerHeader";

const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const today = toDateKey(new Date());
const formatDate = (value) => value ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00`)) : "—";
const formatShortDate = (value) => value ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(new Date(`${value}T00:00:00`)) : "—";

function Booking() {
  const [searchParams] = useSearchParams();
  const serviceId = searchParams.get("serviceId");
  const [service, setService] = useState(null);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingService, setLoadingService] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [showReview, setShowReview] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingReference, setBookingReference] = useState("");

  const dateOptions = useMemo(() => {
    const dates = [];
    const base = new Date();
    base.setHours(12, 0, 0, 0);
    for (let index = 0; index < 14; index += 1) {
      const next = new Date(base);
      next.setDate(base.getDate() + index);
      const key = toDateKey(next);
      dates.push({
        key,
        day: new Intl.DateTimeFormat("en-IN", { weekday: "short" }).format(next),
        date: new Intl.DateTimeFormat("en-IN", { day: "numeric" }).format(next),
        month: new Intl.DateTimeFormat("en-IN", { month: "short" }).format(next),
      });
    }
    return dates;
  }, []);

  useEffect(() => {
    if (!serviceId) { setError("No service was selected."); setLoadingService(false); return; }
    const load = async () => {
      try {
        const response = await api.get("/services");
        const found = (response.data.data || []).find((item) => item._id === serviceId);
        if (!found) throw new Error("Service not found.");
        setService(found);
      } catch (requestError) {
        setError(requestError.response?.data?.message || requestError.message || "Unable to load service.");
      } finally { setLoadingService(false); }
    };
    load();
  }, [serviceId]);

  const step = useMemo(() => showReview ? 3 : selectedSlot ? 3 : date ? 2 : 1, [date, selectedSlot, showReview]);

  const loadSlots = async (selectedDate) => {
    if (!selectedDate) return;
    try {
      setLoadingSlots(true); setError("");
      const response = await api.get("/availability/slots", { params: { serviceId, date: selectedDate } });
      setSlots(response.data.slots || []);
    } catch (requestError) {
      setSlots([]); setError(requestError.response?.data?.message || "Unable to load available times.");
    } finally { setLoadingSlots(false); }
  };

  const handleDateChange = (value) => {
    setDate(value); setSelectedSlot(null); setShowReview(false); setBookingSuccess(false); setBookingReference(""); setSlots([]); setError("");
    if (value) loadSlots(value);
  };

  const handleContinue = () => {
    setError("");
    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) { setError("Please complete all customer details."); return; }
    setShowReview(true);
  };

  const handleConfirm = async () => {
    if (!service || !date || !selectedSlot) { setError("Please select a date and time."); return; }
    try {
      setBookingLoading(true); setError("");
      const response = await api.post("/bookings", { serviceId, customerName: customerName.trim(), customerEmail: customerEmail.trim(), customerPhone: customerPhone.trim(), date, startTime: selectedSlot.startTime });
      setBookingReference(response.data?.data?.reference || ""); setBookingSuccess(true);
      setSlots((current) => current.filter((slot) => slot.startTime !== selectedSlot.startTime));
    } catch (requestError) {
      if (requestError.response?.status === 409) {
        setSelectedSlot(null); setShowReview(false);
        setError(requestError.response?.data?.message || "That slot is no longer available. Please choose another time.");
        await loadSlots(date);
      } else setError(requestError.response?.data?.message || "Unable to complete the booking. Please try again.");
    } finally { setBookingLoading(false); }
  };

  if (loadingService) return <div className="page-shell"><CustomerHeader showBack /><div className="container booking-page"><div className="loading-state">Loading booking information…</div></div></div>;
  if (!service) return <div className="page-shell"><CustomerHeader showBack /><div className="container booking-page"><div className="alert alert-error">{error || "Service not found."}</div></div></div>;

  if (bookingSuccess) return (
    <div className="page-shell"><CustomerHeader />
      <main className="booking-page success-booking-page"><section className="success-card success-card-premium">
        <div className="success-check">✓</div>
        <p className="eyebrow">Luma Studio · Reserved</p>
        <h1>Your appointment is confirmed.</h1>
        <p className="success-lead">Everything is set. We look forward to welcoming you for your {service.name.toLowerCase()} appointment.</p>
        {bookingReference && <div className="reference-box"><span>Booking reference</span><strong>{bookingReference}</strong></div>}
        <div className="confirm-details">
          <div className="summary-row"><span>Service</span><strong>{service.name}</strong></div>
          <div className="summary-row"><span>Date</span><strong>{formatDate(date)}</strong></div>
          <div className="summary-row"><span>Time</span><strong>{selectedSlot?.startTime} – {selectedSlot?.endTime}</strong></div>
          <div className="summary-row"><span>Customer</span><strong>{customerName}</strong></div>
        </div>
        <Link className="luxury-button success-home-button" to="/">Return to Luma Studio <span>↗</span></Link>
      </section></main>
    </div>
  );

  return (
    <div className="page-shell"><CustomerHeader showBack />
      <main className="booking-page booking-page-premium"><div className="container">
        <div className="booking-intro">
          <div>
            <p className="eyebrow">Luma Studio · Appointment</p>
            <h1>Reserve your time.</h1>
            <p>Choose a date, find a live time slot and finish your booking in a few simple steps.</p>
          </div>
          <Link className="booking-change-service" to="/services">← Change service</Link>
        </div>

        <div className="booking-layout">
          <section className="booking-main-card booking-main-card-premium">
            <div className="booking-progress" aria-label="Booking progress">
              <div className={`booking-progress-item ${step >= 1 ? "active" : ""}`}><span>01</span><div><strong>Date</strong><small>Choose a day</small></div></div>
              <div className="booking-progress-line" />
              <div className={`booking-progress-item ${step >= 2 ? "active" : ""}`}><span>02</span><div><strong>Time</strong><small>Find a slot</small></div></div>
              <div className="booking-progress-line" />
              <div className={`booking-progress-item ${step >= 3 ? "active" : ""}`}><span>03</span><div><strong>Details</strong><small>Confirm you</small></div></div>
            </div>

            {error && <div className="alert alert-error booking-alert">{error}</div>}

            <section className="booking-step-block">
              <div className="booking-step-heading"><span className="booking-step-number">01</span><div><p className="booking-step-kicker">First, choose your day</p><h2>When would you like to visit?</h2><p>Live availability is checked for your selected service.</p></div></div>
              <div className="date-picker-grid">
                {dateOptions.map((option, index) => (
                  <button key={option.key} type="button" className={`date-choice ${date === option.key ? "selected" : ""}`} onClick={() => handleDateChange(option.key)}>
                    <span>{index === 0 ? "Today" : option.day}</span><strong>{option.date}</strong><small>{option.month}</small>
                  </button>
                ))}
              </div>
              <label className="custom-date-label" htmlFor="appointment-date">Need another date?</label>
              <input className="custom-date-input" id="appointment-date" type="date" value={date} min={today} onChange={(event) => handleDateChange(event.target.value)} />
            </section>

            {date && <section className="booking-step-block">
              <div className="booking-step-heading"><span className="booking-step-number">02</span><div><p className="booking-step-kicker">Then, find your time</p><h2>Available appointments</h2><p>{formatDate(date)} · Times update from the studio schedule.</p></div></div>
              {loadingSlots ? <div className="booking-loading"><span className="loading-dot" /> Checking live availability…</div> : slots.length === 0 ? <div className="booking-empty"><strong>No times available.</strong><span>There are no appointment times for {formatDate(date)}. Try another date above.</span></div> : <div className="premium-slots-grid">{slots.map((slot) => <button className={`premium-slot ${selectedSlot?.startTime === slot.startTime ? "selected" : ""}`} key={`${slot.startTime}-${slot.endTime}`} onClick={() => { setSelectedSlot(slot); setShowReview(false); setError(""); }} type="button"><span>{slot.startTime}</span><small>{slot.endTime}</small>{selectedSlot?.startTime === slot.startTime && <b>✓</b>}</button>)}</div>}
              {selectedSlot && <div className="selected-time-banner"><span>Selected time</span><strong>{selectedSlot.startTime} – {selectedSlot.endTime}</strong></div>}
            </section>}

            {selectedSlot && <section className="booking-step-block booking-details-block">
              <div className="booking-step-heading"><span className="booking-step-number">03</span><div><p className="booking-step-kicker">Finally, tell us who is coming</p><h2>Your details</h2><p>These details help us identify and contact you about the appointment.</p></div></div>
              <div className="form-grid premium-form-grid">
                <div className="form-field"><label htmlFor="customer-name">Full name</label><input id="customer-name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Your name" autoComplete="name" /></div>
                <div className="form-field"><label htmlFor="customer-phone">Phone number</label><input id="customer-phone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="9876543210" inputMode="tel" autoComplete="tel" /></div>
                <div className="form-field full"><label htmlFor="customer-email">Email address</label><input id="customer-email" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" /></div>
              </div>
              {!showReview && <button className="luxury-button booking-confirm-button" onClick={handleContinue}>Review appointment <span>→</span></button>}
            </section>}

            {showReview && <section className="booking-review-block"><div><span className="review-badge">Ready to confirm</span><h2>One last look.</h2><p>Your selected service, date, time and contact details are shown in the summary.</p></div><div className="review-actions"><button className="luxury-button" onClick={handleConfirm} disabled={bookingLoading}>{bookingLoading ? "Confirming…" : "Confirm booking →"}</button><button className="secondary-button" onClick={() => setShowReview(false)} disabled={bookingLoading}>Edit details</button></div></section>}
          </section>

          <aside className="booking-summary booking-summary-premium">
            <p className="eyebrow">Your appointment</p>
            <div className="summary-service-premium"><div className="summary-service-index">LS</div><div><h2>{service.name}</h2><p>{service.duration} min · Luma Studio</p></div></div>
            <div className="summary-divider" />
            <div className="premium-summary-item"><span>Date</span><strong>{formatDate(date)}</strong></div>
            <div className="premium-summary-item"><span>Time</span><strong>{selectedSlot ? `${selectedSlot.startTime} – ${selectedSlot.endTime}` : "Choose a time"}</strong></div>
            <div className="premium-summary-item"><span>Guest</span><strong>{customerName || "Your details"}</strong></div>
            <div className="summary-price"><span>Total</span><strong>₹{Number(service.price).toLocaleString("en-IN")}</strong></div>
            <p className="summary-note">Your selected time is held only when the booking is confirmed.</p>
          </aside>
        </div>
      </div></main>
    </div>
  );
}

export default Booking;
