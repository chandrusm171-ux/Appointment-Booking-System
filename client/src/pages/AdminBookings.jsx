import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import AdminLayout from "../components/AdminLayout";
import {
  formatBookingDate,
  formatBookingTime,
  getBookingDisplayStatus,
  getStatusLabel,
  isBookingPast,
} from "../utils/bookingUtils";

const filters = [
  { value: "all", label: "All upcoming" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
];

const emptyEdit = {
  serviceId: "",
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  date: "",
  startTime: "",
  status: "pending",
  notes: "",
};

function AdminBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [editingBooking, setEditingBooking] = useState(null);
  const [editData, setEditData] = useState(emptyEdit);
  const [slots, setSlots] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [bookingsResponse, servicesResponse] = await Promise.all([
        api.get("/admin/bookings"),
        api.get("/services/admin/all"),
      ]);
      setBookings(bookingsResponse.data.data || []);
      setServices(servicesResponse.data.data || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load bookings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("adminToken")) {
      navigate("/admin/login", { replace: true });
      return;
    }
    fetchData();
  }, [fetchData, navigate]);

  const upcomingBookings = useMemo(
    () => bookings.filter((booking) => !isBookingPast(booking)),
    [bookings]
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return upcomingBookings.filter((booking) => {
      const status = getBookingDisplayStatus(booking);
      const haystack = [
        booking.reference,
        booking.customerName,
        booking.customerEmail,
        booking.customerPhone,
        booking.service?.name,
        booking.date,
      ].join(" ").toLowerCase();
      return (filter === "all" || status === filter) && haystack.includes(normalizedQuery);
    });
  }, [filter, query, upcomingBookings]);

  const openEdit = async (booking) => {
    setEditingBooking(booking);
    setEditData({
      serviceId: booking.service?._id || booking.service || "",
      customerName: booking.customerName || "",
      customerEmail: booking.customerEmail || "",
      customerPhone: booking.customerPhone || "",
      date: booking.date || "",
      startTime: booking.startTime || "",
      status: booking.status || "pending",
      notes: booking.notes || "",
    });
    setSlots([]);
    setError("");
    setMessage("");
    if (booking.service?._id && booking.date) {
      try {
        setLoadingSlots(true);
        const response = await api.get("/availability/slots", {
          params: { serviceId: booking.service._id, date: booking.date },
        });
        setSlots(response.data.slots || []);
      } catch {
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    }
  };

  const closeEdit = () => {
    setEditingBooking(null);
    setEditData(emptyEdit);
    setSlots([]);
  };

  const change = (event) => {
    const { name, value } = event.target;
    setEditData((current) => ({ ...current, [name]: value }));
  };

  const loadSlots = async (serviceId, date) => {
    if (!serviceId || !date) return;
    try {
      setLoadingSlots(true);
      const response = await api.get("/availability/slots", {
        params: { serviceId, date },
      });
      setSlots(response.data.slots || []);
    } catch (requestError) {
      setSlots([]);
      setError(requestError.response?.data?.message || "Unable to load appointment times.");
    } finally {
      setLoadingSlots(false);
    }
  };

  const changeAppointmentField = async (event) => {
    const { name, value } = event.target;
    setEditData((current) => ({ ...current, [name]: value, ...(name === "serviceId" ? { startTime: "" } : {}) }));
    if (name === "serviceId") await loadSlots(value, editData.date);
    if (name === "date") await loadSlots(editData.serviceId, value);
  };

  const submitEdit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await api.put(`/admin/bookings/${editingBooking._id}`, editData);
      setBookings((current) => current.map((item) => item._id === response.data.data._id ? response.data.data : item));
      setMessage("Booking updated successfully.");
      closeEdit();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to update booking.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AdminLayout title="Bookings"><div className="loading-state">Loading appointments…</div></AdminLayout>;

  return (
    <AdminLayout title="Bookings">
      <section className="admin-hero admin-hero-bookings">
        <div>
          <span className="admin-eyebrow">APPOINTMENT MANAGEMENT</span>
          <h1>Upcoming bookings</h1>
          <p>Keep today's schedule clear, update appointments, and move completed visits into History automatically.</p>
        </div>
        <div className="admin-hero-stat"><strong>{upcomingBookings.length}</strong><span>upcoming</span></div>
      </section>

      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}

      <div className="admin-toolbar-card">
        <div className="toolbar-main">
          <div>
            <h2>Appointment list</h2>
            <p>{filtered.length} shown · {upcomingBookings.length} upcoming</p>
          </div>
          <input className="input-control admin-search" placeholder="Search customer, reference, service…" value={query} onChange={(event) => setQuery(event.target.value)} />
        </div>
        <div className="filter-row">
          {filters.map((item) => <button key={item.value} type="button" className={`filter-chip ${filter === item.value ? "active" : ""}`} onClick={() => setFilter(item.value)}>{item.label}</button>)}
          <button type="button" className="filter-chip history-link" onClick={() => navigate("/admin/history")}>View history →</button>
        </div>
      </div>

      {!filtered.length ? (
        <div className="empty-state admin-empty-state"><span className="empty-icon">✓</span><h3>No upcoming appointments</h3><p>{upcomingBookings.length ? "Try another filter or search term." : "New customer appointments will appear here."}</p></div>
      ) : (
        <div className="admin-booking-list">
          {filtered.map((booking) => {
            const status = getBookingDisplayStatus(booking);
            return (
              <article className="booking-row-card" key={booking._id || booking.id}>
                <div className="booking-row-date"><strong>{new Date(`${booking.date}T12:00:00+05:30`).getDate()}</strong><span>{new Intl.DateTimeFormat("en-IN", { month: "short", timeZone: "Asia/Kolkata" }).format(new Date(`${booking.date}T12:00:00+05:30`))}</span></div>
                <div className="booking-row-main">
                  <div className="booking-row-top"><span className="booking-reference">{booking.reference}</span><span className={`status-pill ${status}`}>{getStatusLabel(status)}</span></div>
                  <h3>{booking.customerName || "Unnamed customer"}</h3>
                  <p>{booking.service?.name || "Service"} · {formatBookingTime(booking.startTime)} – {formatBookingTime(booking.endTime)}</p>
                  <div className="booking-contact">{booking.customerEmail || "—"} <span>•</span> {booking.customerPhone || "—"}</div>
                </div>
                <div className="booking-row-actions"><span className="booking-full-date">{formatBookingDate(booking.date)}</span><button className="edit-button" type="button" onClick={() => openEdit(booking)}>Edit booking</button></div>
              </article>
            );
          })}
        </div>
      )}

      {editingBooking && (
        <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && closeEdit()}>
          <section className="edit-modal" role="dialog" aria-modal="true" aria-labelledby="edit-booking-title">
            <div className="modal-header"><div><span className="admin-eyebrow">BOOKING EDITOR</span><h2 id="edit-booking-title">Edit appointment</h2><p>{editingBooking.reference}</p></div><button className="modal-close" type="button" onClick={closeEdit} aria-label="Close">×</button></div>
            <form onSubmit={submitEdit}>
              <div className="form-row">
                <div className="form-field"><label htmlFor="edit-name">Customer name</label><input id="edit-name" name="customerName" value={editData.customerName} onChange={change} required /></div>
                <div className="form-field"><label htmlFor="edit-phone">Phone</label><input id="edit-phone" name="customerPhone" value={editData.customerPhone} onChange={change} required /></div>
              </div>
              <div className="form-field" style={{ marginTop: 14 }}><label htmlFor="edit-email">Email</label><input id="edit-email" name="customerEmail" type="email" value={editData.customerEmail} onChange={change} required /></div>
              <div className="form-row" style={{ marginTop: 14 }}>
                <div className="form-field"><label htmlFor="edit-service">Service</label><select id="edit-service" name="serviceId" value={editData.serviceId} onChange={change}>{services.map((service) => <option key={service._id} value={service._id}>{service.name} · ₹{Number(service.price).toLocaleString("en-IN")}</option>)}</select></div>
                <div className="form-field"><label htmlFor="edit-status">Status</label><select id="edit-status" name="status" value={editData.status} onChange={change}><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="completed">Finished</option><option value="missed">Missed</option><option value="cancelled">Cancelled</option></select></div>
              </div>
              <div className="form-row" style={{ marginTop: 14 }}>
                <div className="form-field"><label htmlFor="edit-date">Appointment date</label><input id="edit-date" name="date" type="date" value={editData.date} onChange={changeAppointmentField} required /></div>
                <div className="form-field"><label htmlFor="edit-time">Appointment time</label><select id="edit-time" name="startTime" value={editData.startTime} onChange={change} required><option value="">Choose time</option>{editData.startTime && !slots.some((slot) => slot.startTime === editData.startTime) && <option value={editData.startTime}>{formatBookingTime(editData.startTime)} · current</option>}{slots.map((slot) => <option key={slot.startTime} value={slot.startTime}>{formatBookingTime(slot.startTime)} – {formatBookingTime(slot.endTime)}</option>)}</select>{loadingSlots && <small className="field-hint">Loading available times…</small>}</div>
              </div>
              <div className="form-field" style={{ marginTop: 14 }}><label htmlFor="edit-notes">Internal note</label><textarea id="edit-notes" name="notes" value={editData.notes} onChange={change} rows="3" placeholder="Optional admin note…" /></div>
              <div className="modal-actions"><button className="secondary-button" type="button" onClick={closeEdit}>Cancel</button><button className="primary-button" type="submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button></div>
            </form>
          </section>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminBookings;
