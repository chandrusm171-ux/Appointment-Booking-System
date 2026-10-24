import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import AdminLayout from "../components/AdminLayout";
import { formatBookingTime, getBookingDisplayStatus, getStatusLabel } from "../utils/bookingUtils";

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;
const formatDate = (date) => {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }).format(new Date(`${date}T12:00:00+05:30`));
};

function AdminDashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!localStorage.getItem("adminToken")) { navigate("/admin/login", { replace: true }); return; }
    const load = async () => {
      try { const response = await api.get("/admin/dashboard"); setDashboard(response.data.data); }
      catch (requestError) { setError(requestError.response?.data?.message || "Unable to load dashboard data."); }
      finally { setLoading(false); }
    };
    load();
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, [navigate]);

  const todayBookings = useMemo(() => (dashboard?.todayBookings || []).map((booking) => ({ ...booking, displayStatus: getBookingDisplayStatus(booking, now) })), [dashboard, now]);
  const greeting = useMemo(() => { const hour = Number(new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", hour: "numeric", hour12: false }).format(new Date())); return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"; }, [now]);

  if (loading) return <AdminLayout title="Dashboard"><div className="loading-state">Loading your studio overview…</div></AdminLayout>;

  return <AdminLayout title="Dashboard">
    <section className="admin-dashboard-hero">
      <div>
        <span className="admin-eyebrow">LUMA STUDIO · ADMIN WORKSPACE</span>
        <h1>{greeting}, {dashboard?.admin?.name?.split(" ")[0] || "Admin"}.</h1>
        <p>Keep today’s appointments moving, maintain your service menu, and control the studio schedule from one place.</p>
      </div>
      <div className="dashboard-hero-actions"><button className="light-button" onClick={() => navigate("/admin/bookings")}>View bookings ↗</button><button className="hero-icon-button" onClick={() => window.location.reload()} aria-label="Refresh dashboard">↻</button></div>
    </section>

    {error && <div className="error-message">{error}</div>}

    <section className="dashboard-kpi-grid">
      <article className="dashboard-kpi primary"><span>Today</span><strong>{dashboard?.todaysBookings ?? 0}</strong><small>appointments scheduled</small><b>●</b></article>
      <article className="dashboard-kpi"><span>Upcoming</span><strong>{dashboard?.upcomingBookings ?? 0}</strong><small>future appointments</small><b>↗</b></article>
      <article className="dashboard-kpi"><span>Pending</span><strong>{dashboard?.pendingBookings ?? 0}</strong><small>awaiting confirmation</small><b>○</b></article>
      <article className="dashboard-kpi"><span>History</span><strong>{dashboard?.historyBookings ?? 0}</strong><small>past appointments</small><b>◷</b></article>
    </section>

    <section className="dashboard-main-grid">
      <div className="dashboard-panel today-panel">
        <div className="panel-heading"><div><span className="panel-kicker">LIVE SCHEDULE</span><h2>Today’s appointments</h2></div><button className="text-link-button" onClick={() => navigate("/admin/bookings")}>See all →</button></div>
        {!todayBookings.length ? <div className="dashboard-empty"><div>◌</div><h3>Your day is clear</h3><p>No appointments are scheduled for today.</p></div> : <div className="today-list">{todayBookings.map((booking) => <article className="today-booking" key={booking._id}><div className="today-time"><strong>{formatBookingTime(booking.startTime)}</strong><span>{formatBookingTime(booking.endTime)}</span></div><div className="today-customer"><strong>{booking.customerName}</strong><span>{booking.service?.name || "Service"}</span><small>{booking.customerPhone || booking.customerEmail}</small></div><span className={`status-pill ${booking.displayStatus}`}>{getStatusLabel(booking.displayStatus)}</span><button className="row-arrow" onClick={() => navigate("/admin/bookings")}>→</button></article>)}</div>}
      </div>

      <div className="dashboard-panel service-performance">
        <div className="panel-heading"><div><span className="panel-kicker">SERVICE MIX</span><h2>Popular services</h2></div><button className="text-link-button" onClick={() => navigate("/admin/services")}>Manage →</button></div>
        {!dashboard?.topServices?.length ? <div className="dashboard-empty compact"><div>✦</div><p>Service activity will appear here after bookings are made.</p></div> : <div className="service-performance-list">{dashboard.topServices.map((item, index) => <div className="performance-row" key={item.serviceId || item.name}><span className="performance-index">0{index + 1}</span><div className="performance-copy"><strong>{item.name}</strong><div><span style={{ width: `${Math.max(8, item.count / Math.max(1, dashboard.topServices[0].count) * 100)}%` }} /></div></div><b>{item.count}</b></div>)}</div>}
        <div className="mini-metrics"><div><span>Finished</span><strong>{dashboard?.finishedBookings ?? 0}</strong></div><div><span>Missed</span><strong>{dashboard?.missedBookings ?? 0}</strong></div><div><span>Services</span><strong>{dashboard?.totalServices ?? 0}</strong></div></div>
      </div>
    </section>

    <section className="dashboard-section-heading"><div><span className="panel-kicker">QUICK ACTIONS</span><h2>Manage your studio</h2><p>Everything important is one click away.</p></div></section>
    <section className="quick-action-grid">
      <button className="quick-action-card dark" onClick={() => navigate("/admin/bookings")}><span>01</span><strong>Appointments</strong><p>Review, edit and update upcoming bookings.</p><em>Open bookings ↗</em></button>
      <button className="quick-action-card" onClick={() => navigate("/admin/services")}><span>02</span><strong>Services</strong><p>Control your catalogue, pricing and durations.</p><em>Manage services ↗</em></button>
      <button className="quick-action-card" onClick={() => navigate("/admin/availability")}><span>03</span><strong>Availability</strong><p>Set working hours, breaks and slot rules.</p><em>Set schedule ↗</em></button>
      <button className="quick-action-card" onClick={() => navigate("/admin/history")}><span>04</span><strong>History</strong><p>Review finished, missed and cancelled visits.</p><em>View history ↗</em></button>
    </section>

    <section className="recent-activity-panel">
      <div className="panel-heading"><div><span className="panel-kicker">RECENT ACTIVITY</span><h2>Latest bookings</h2></div><button className="text-link-button" onClick={() => navigate("/admin/bookings")}>Open bookings →</button></div>
      {!dashboard?.recentBookings?.length ? <div className="dashboard-empty compact"><p>No booking activity yet.</p></div> : <div className="activity-table"><div className="activity-head"><span>Reference</span><span>Customer</span><span>Service</span><span>Date</span><span>Status</span></div>{dashboard.recentBookings.map((booking) => <div className="activity-row" key={booking._id}><span className="mono-text">{booking.reference || "—"}</span><strong>{booking.customerName || "—"}</strong><span>{booking.service?.name || "—"}</span><span>{formatDate(booking.date)}</span><span className={`status-pill ${getBookingDisplayStatus(booking, now)}`}>{getStatusLabel(getBookingDisplayStatus(booking, now))}</span></div>)}</div>}
    </section>
  </AdminLayout>;
}
export default AdminDashboard;
