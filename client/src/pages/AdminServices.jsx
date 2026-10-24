import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import AdminLayout from "../components/AdminLayout";

const emptyForm = { name: "", description: "", price: "", duration: "", isActive: true };

function AdminServices() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchServices = useCallback(async () => {
    try { setLoading(true); setError(""); const response = await api.get("/services/admin/all"); setServices(response.data.data || []); }
    catch (requestError) { setError(requestError.response?.data?.message || "Unable to load services."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (!localStorage.getItem("adminToken")) { navigate("/admin/login", { replace: true }); return; } fetchServices(); }, [fetchServices, navigate]);

  const visibleServices = useMemo(() => services.filter((service) => {
    const matchesQuery = `${service.name} ${service.description}`.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === "all" || (filter === "active" ? service.isActive : !service.isActive);
    return matchesQuery && matchesFilter;
  }), [services, query, filter]);

  const openAdd = () => { setEditingService(null); setFormData({ ...emptyForm }); setShowForm(true); setError(""); setMessage(""); };
  const openEdit = (service) => { setEditingService(service); setFormData({ name: service.name, description: service.description, price: service.price, duration: service.duration, isActive: service.isActive }); setShowForm(true); setError(""); setMessage(""); };
  const change = (event) => { const { name, value, type, checked } = event.target; setFormData((current) => ({ ...current, [name]: type === "checkbox" ? checked : value })); };

  const submit = async (event) => {
    event.preventDefault(); setError(""); setMessage("");
    if (!formData.name.trim() || !formData.description.trim() || Number(formData.price) < 0 || Number(formData.duration) < 15) { setError("Enter a valid name, description, price and a duration of at least 15 minutes."); return; }
    try {
      setSaving(true);
      const payload = { name: formData.name.trim(), description: formData.description.trim(), price: Number(formData.price), duration: Number(formData.duration), isActive: formData.isActive };
      const response = editingService ? await api.put(`/services/${editingService._id}`, payload) : await api.post("/services", payload);
      setMessage(response.data.message || (editingService ? "Service updated." : "Service created."));
      setShowForm(false); setEditingService(null); await fetchServices();
    } catch (requestError) { setError(requestError.response?.data?.message || "Unable to save service."); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    const service = services.find((item) => item._id === id);
    if (!window.confirm(`Delete “${service?.name || "this service"}”? This cannot be undone.`)) return;
    try { setError(""); const response = await api.delete(`/services/${id}`); setMessage(response.data.message || "Service deleted."); await fetchServices(); }
    catch (requestError) { setError(requestError.response?.data?.message || "Unable to delete service."); }
  };

  const toggleActive = async (service) => {
    try { setError(""); const response = await api.put(`/services/${service._id}`, { name: service.name, description: service.description, price: service.price, duration: service.duration, isActive: !service.isActive }); setServices((current) => current.map((item) => item._id === service._id ? response.data.data : item)); setMessage(`${service.name} is now ${!service.isActive ? "active" : "inactive"}.`); }
    catch (requestError) { setError(requestError.response?.data?.message || "Unable to update service status."); }
  };

  if (loading) return <AdminLayout title="Services"><div className="loading-state">Loading service catalogue…</div></AdminLayout>;

  return <AdminLayout title="Services">
    <section className="admin-hero admin-hero-services"><div><span className="admin-eyebrow">CATALOGUE MANAGEMENT</span><h1>Services</h1><p>Shape the experiences customers see, book and pay for at Luma Studio.</p></div><div className="admin-hero-stat"><strong>{services.length}</strong><span>Total services</span></div></section>
    {error && <div className="error-message">{error}</div>}{message && <div className="success-message">{message}</div>}

    <section className="service-toolbar">
      <div className="service-toolbar-copy"><span className="panel-kicker">YOUR CATALOGUE</span><h2>{visibleServices.length} {visibleServices.length === 1 ? "service" : "services"}</h2><p>Keep your pricing and durations accurate so booking slots stay predictable.</p></div>
      <button className="primary-button add-service-button" onClick={openAdd}>+ Add service</button>
    </section>

    <section className="service-filters"><div className="service-search-wrap"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search services…" aria-label="Search services" /></div><div className="filter-row compact-filters"><button className={`filter-chip ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>All <b>{services.length}</b></button><button className={`filter-chip ${filter === "active" ? "active" : ""}`} onClick={() => setFilter("active")}>Active <b>{services.filter((item) => item.isActive).length}</b></button><button className={`filter-chip ${filter === "inactive" ? "active" : ""}`} onClick={() => setFilter("inactive")}>Inactive <b>{services.filter((item) => !item.isActive).length}</b></button></div></section>

    {showForm && <section className="service-editor-card"><div className="service-editor-head"><div><span className="panel-kicker">{editingService ? "EDIT SERVICE" : "NEW SERVICE"}</span><h2>{editingService ? "Update experience" : "Create an experience"}</h2><p>Customers will see this information while choosing a service.</p></div><button className="modal-close" onClick={() => setShowForm(false)} aria-label="Close service form">×</button></div><form onSubmit={submit}><div className="form-row"><div className="form-field"><label htmlFor="service-name">Service name</label><input id="service-name" name="name" value={formData.name} onChange={change} placeholder="Signature Haircut" required /></div><div className="form-field"><label htmlFor="service-price">Price (₹)</label><input id="service-price" name="price" type="number" min="0" value={formData.price} onChange={change} placeholder="1200" required /></div></div><div className="form-row" style={{ marginTop: 14 }}><div className="form-field"><label htmlFor="service-duration">Duration (minutes)</label><input id="service-duration" name="duration" type="number" min="15" step="15" value={formData.duration} onChange={change} placeholder="60" required /></div><label className="service-active-switch"><input id="service-active" name="isActive" type="checkbox" checked={formData.isActive} onChange={change} /><span /><b>{formData.isActive ? "Visible to customers" : "Hidden from customers"}</b></label></div><div className="form-field" style={{ marginTop: 14 }}><label htmlFor="service-description">Description</label><textarea id="service-description" name="description" value={formData.description} onChange={change} placeholder="Professional styling for everyday looks…" rows="4" required /></div><div className="form-actions"><button className="primary-button" disabled={saving}>{saving ? "Saving…" : editingService ? "Update service" : "Create service"}</button><button type="button" className="secondary-button" onClick={() => setShowForm(false)}>Cancel</button></div></form></section>}

    {!visibleServices.length ? <div className="admin-empty-state"><div className="empty-icon">⌕</div><h3>No services match your search</h3><p>Try another search or clear the filter.</p></div> : <div className="premium-service-grid">{visibleServices.map((service, index) => <article className="premium-service-card" key={service._id}><div className="premium-service-top"><span className="service-number">{String(index + 1).padStart(2, "0")}</span><button className={`service-status-toggle ${service.isActive ? "on" : ""}`} onClick={() => toggleActive(service)} aria-label={`Set ${service.name} ${service.isActive ? "inactive" : "active"}`}><span />{service.isActive ? "Active" : "Inactive"}</button></div><div className="premium-service-body"><h3>{service.name}</h3><p>{service.description}</p></div><div className="premium-service-meta"><div><span>Duration</span><strong>{service.duration} min</strong></div><div><span>Price</span><strong>{formatCurrency(service.price)}</strong></div></div><div className="premium-service-actions"><button className="secondary-button" onClick={() => openEdit(service)}>Edit service</button><button className="icon-danger-button" onClick={() => remove(service._id)} aria-label={`Delete ${service.name}`}>×</button></div></article>)}</div>}
  </AdminLayout>;
}
export default AdminServices;
