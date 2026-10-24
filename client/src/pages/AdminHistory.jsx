import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import AdminLayout from "../components/AdminLayout";
import { formatBookingDate, formatBookingTime, getBookingDisplayStatus, getStatusLabel, isBookingPast } from "../utils/bookingUtils";

const filters = [
  { value: "all", label: "All history" },
  { value: "completed", label: "Finished" },
  { value: "missed", label: "Missed" },
  { value: "cancelled", label: "Cancelled" },
];

function AdminHistory() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!localStorage.getItem("adminToken")) { navigate("/admin/login", { replace: true }); return; }
    const load = async () => {
      try { const response = await api.get("/admin/bookings"); setBookings(response.data.data || []); }
      catch (requestError) { setError(requestError.response?.data?.message || "Unable to load booking history."); }
      finally { setLoading(false); }
    };
    load();
  }, [navigate]);

  const history = useMemo(() => bookings.filter((booking) => isBookingPast(booking)), [bookings]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return history.filter((booking) => {
      const status = getBookingDisplayStatus(booking);
      const haystack = [booking.reference, booking.customerName, booking.customerEmail, booking.customerPhone, booking.service?.name, booking.date].join(" ").toLowerCase();
      return (filter === "all" || status === filter) && haystack.includes(normalizedQuery);
    });
  }, [filter, history, query]);

  if (loading) return <AdminLayout title="History"><div className="loading-state">Loading history…</div></AdminLayout>;

  return <AdminLayout title="History">
    <section className="admin-hero admin-hero-history">
      <div><span className="admin-eyebrow">APPOINTMENT ARCHIVE</span><h1>Booking history</h1><p>Finished and missed appointments stay here after their scheduled time has passed.</p></div>
      <div className="history-hero-icon">↗</div>
    </section>
    {error && <div className="error-message">{error}</div>}
    <div className="admin-toolbar-card">
      <div className="toolbar-main"><div><h2>Past appointments</h2><p>{filtered.length} shown · {history.length} archived</p></div><input className="input-control admin-search" placeholder="Search history…" value={query} onChange={(event) => setQuery(event.target.value)} /></div>
      <div className="filter-row">{filters.map((item) => <button key={item.value} type="button" className={`filter-chip ${filter === item.value ? "active" : ""}`} onClick={() => setFilter(item.value)}>{item.label}</button>)}<button type="button" className="filter-chip history-link" onClick={() => navigate("/admin/bookings")}>← Upcoming bookings</button></div>
    </div>
    {!filtered.length ? <div className="empty-state admin-empty-state"><span className="empty-icon">◷</span><h3>No history records</h3><p>{history.length ? "No appointments match this filter." : "Past appointments will automatically appear here."}</p></div> : <div className="admin-booking-list history-list">
      {filtered.map((booking) => { const status = getBookingDisplayStatus(booking); return <article className="booking-row-card history-row" key={booking._id || booking.id}>
        <div className="booking-row-date history-date"><strong>{new Date(`${booking.date}T12:00:00+05:30`).getDate()}</strong><span>{new Intl.DateTimeFormat("en-IN", { month: "short", timeZone: "Asia/Kolkata" }).format(new Date(`${booking.date}T12:00:00+05:30`))}</span></div>
        <div className="booking-row-main"><div className="booking-row-top"><span className="booking-reference">{booking.reference}</span><span className={`status-pill ${status}`}>{getStatusLabel(status)}</span></div><h3>{booking.customerName || "Unnamed customer"}</h3><p>{booking.service?.name || "Service"} · {formatBookingTime(booking.startTime)} – {formatBookingTime(booking.endTime)}</p><div className="booking-contact">{booking.customerEmail || "—"} <span>•</span> {booking.customerPhone || "—"}</div></div>
        <div className="booking-row-actions"><span className="booking-full-date">{formatBookingDate(booking.date)}</span><span className="history-caption">Archived appointment</span></div>
      </article>; })}
    </div>}
  </AdminLayout>;
}

export default AdminHistory;
