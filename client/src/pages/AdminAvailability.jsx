import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import AdminLayout from "../components/AdminLayout";

const days = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
const labels = { monday:"Monday", tuesday:"Tuesday", wednesday:"Wednesday", thursday:"Thursday", friday:"Friday", saturday:"Saturday", sunday:"Sunday" };
const defaults = { monday:{isOpen:true,open:"09:00",close:"18:00",breaks:[]}, tuesday:{isOpen:true,open:"09:00",close:"18:00",breaks:[]}, wednesday:{isOpen:true,open:"09:00",close:"18:00",breaks:[]}, thursday:{isOpen:true,open:"09:00",close:"18:00",breaks:[]}, friday:{isOpen:true,open:"09:00",close:"18:00",breaks:[]}, saturday:{isOpen:true,open:"10:00",close:"15:00",breaks:[]}, sunday:{isOpen:false,open:"09:00",close:"18:00",breaks:[]} };
const normalize = (data) => Object.fromEntries(days.map((day) => [day, { isOpen:data?.[day]?.isOpen ?? defaults[day].isOpen, open:data?.[day]?.open || defaults[day].open, close:data?.[day]?.close || defaults[day].close, breaks:data?.[day]?.breaks || [] }]));
const toMinutes = (value) => { const [h,m] = String(value).split(":").map(Number); return h * 60 + m; };

function AdminAvailability() {
  const navigate = useNavigate();
  const [availability,setAvailability] = useState(defaults);
  const [services,setServices] = useState([]);
  const [selectedService,setSelectedService] = useState("");
  const [date,setDate] = useState("");
  const [slots,setSlots] = useState([]);
  const [loading,setLoading] = useState(true);
  const [loadingSlots,setLoadingSlots] = useState(false);
  const [saving,setSaving] = useState(false);
  const [error,setError] = useState("");
  const [message,setMessage] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("adminToken")) { navigate("/admin/login", { replace:true }); return; }
    const load = async () => {
      try { const [hoursResponse,servicesResponse] = await Promise.all([api.get("/admin/availability"),api.get("/services/admin/all")]); setAvailability(normalize(hoursResponse.data.data)); const active=(servicesResponse.data.data||[]).filter((s)=>s.isActive); setServices(active); if(active.length) setSelectedService(active[0]._id); }
      catch(e){ setError(e.response?.data?.message || "Unable to load availability."); } finally { setLoading(false); }
    }; load();
  },[navigate]);

  const openDays = useMemo(() => days.filter((day) => availability[day]?.isOpen), [availability]);
  const totalBreaks = useMemo(() => days.reduce((sum, day) => sum + (availability[day]?.breaks?.length || 0), 0), [availability]);
  const updateDay=(day,field,value)=>setAvailability((current)=>({...current,[day]:{...current[day],[field]:value}}));
  const addBreak=(day)=>setAvailability((current)=>({...current,[day]:{...current[day],breaks:[...current[day].breaks,{start:"13:00",end:"14:00"}]}}));
  const updateBreak=(day,index,field,value)=>setAvailability((current)=>({...current,[day]:{...current[day],breaks:current[day].breaks.map((item,i)=>i===index?{...item,[field]:value}:item)}}));
  const removeBreak=(day,index)=>setAvailability((current)=>({...current,[day]:{...current[day],breaks:current[day].breaks.filter((_,i)=>i!==index)}}));

  const validate = () => {
    for (const day of days) {
      const item = availability[day];
      if (!item.isOpen) continue;
      if (toMinutes(item.open) >= toMinutes(item.close)) return `${labels[day]}: opening time must be before closing time.`;
      for (const breakItem of item.breaks) {
        if (toMinutes(breakItem.start) >= toMinutes(breakItem.end)) return `${labels[day]}: every break must have a valid start and end time.`;
        if (toMinutes(breakItem.start) < toMinutes(item.open) || toMinutes(breakItem.end) > toMinutes(item.close)) return `${labels[day]}: breaks must stay inside working hours.`;
      }
    }
    return "";
  };

  const save = async () => { const validationError = validate(); if (validationError) { setError(validationError); return; } try { setSaving(true);setError(""); const response=await api.put("/admin/availability",availability); setAvailability(normalize(response.data.data)); setMessage(response.data.message||"Working hours updated successfully."); setTimeout(()=>setMessage(""),3500); } catch(e){setError(e.response?.data?.message||"Unable to update working hours.");} finally{setSaving(false);} };
  const loadSlots = async () => { if(!selectedService||!date)return; try{setLoadingSlots(true);setError("");const response=await api.get("/availability/slots",{params:{serviceId:selectedService,date}});setSlots(response.data.slots||[]);}catch(e){setSlots([]);setError(e.response?.data?.message||"Unable to calculate available slots.");}finally{setLoadingSlots(false);} };

  if(loading) return <AdminLayout title="Availability"><div className="loading-state">Loading studio schedule…</div></AdminLayout>;
  return <AdminLayout title="Availability">
    <section className="admin-hero admin-hero-availability"><div><span className="admin-eyebrow">SCHEDULING MANAGEMENT</span><h1>Availability</h1><p>Define when the studio is open. These rules directly shape the appointment slots customers can book.</p></div><div className="admin-hero-stat"><strong>{openDays.length}</strong><span>Open days / week</span></div></section>
    {error&&<div className="error-message">{error}</div>}{message&&<div className="success-message">{message}</div>}

    <section className="availability-overview"><div><span>OPEN DAYS</span><strong>{openDays.length}<small>/ 7</small></strong></div><div><span>BREAK WINDOWS</span><strong>{totalBreaks}</strong></div><div><span>DEFAULT SLOT</span><strong>15<small> min</small></strong></div><div><span>ACTIVE SERVICES</span><strong>{services.length}</strong></div></section>

    <section className="availability-section"><div className="section-heading premium-heading"><div><span className="panel-kicker">WEEKLY SCHEDULE</span><h2 className="section-title">Business hours</h2><p>Open or close a day, set its hours, and add optional break windows.</p></div><button className="primary-button" onClick={save} disabled={saving}>{saving?"Saving…":"Save schedule"}</button></div>
      <div className="premium-hours-card">{days.map((day)=>{const item=availability[day];return <article className={`premium-hours-row ${item.isOpen ? "open" : "closed"}`} key={day}><div className="hours-day-block"><div className="day-index">{String(days.indexOf(day)+1).padStart(2,"0")}</div><div><strong>{labels[day]}</strong><span>{item.isOpen ? `${item.open} – ${item.close}` : "Closed all day"}</span></div></div><label className="premium-toggle"><input type="checkbox" checked={item.isOpen} onChange={(e)=>updateDay(day,"isOpen",e.target.checked)}/><span /></label>{item.isOpen && <><div className="hours-time-fields premium-time-fields"><div className="form-group"><label>Opens</label><input type="time" value={item.open} onChange={(e)=>updateDay(day,"open",e.target.value)}/></div><div className="form-group"><label>Closes</label><input type="time" value={item.close} onChange={(e)=>updateDay(day,"close",e.target.value)}/></div></div><div className="premium-breaks"><div className="breaks-header"><span>Breaks</span><button type="button" className="text-button" onClick={()=>addBreak(day)}>+ Add</button></div>{item.breaks.length===0 ? <p className="no-break">No break added</p> : item.breaks.map((breakItem,index)=><div className="break-row" key={`${day}-${index}`}><input type="time" value={breakItem.start} onChange={(e)=>updateBreak(day,index,"start",e.target.value)}/><span>to</span><input type="time" value={breakItem.end} onChange={(e)=>updateBreak(day,index,"end",e.target.value)}/><button className="remove-break" type="button" onClick={()=>removeBreak(day,index)}>×</button></div>)}</div></>}</article>})}</div>
    </section>

    <section className="availability-section slot-preview-card"><div className="section-heading premium-heading"><div><span className="panel-kicker">SLOT PREVIEW</span><h2 className="section-title">Test your schedule</h2><p>See exactly what a customer will receive for a selected service and date.</p></div></div><div className="preview-controls"><div className="form-group"><label>Service</label><select value={selectedService} onChange={(e)=>{setSelectedService(e.target.value);setSlots([])}}><option value="">Select a service</option>{services.map((service)=><option key={service._id} value={service._id}>{service.name} · {service.duration} min</option>)}</select></div><div className="form-group"><label>Date</label><input type="date" value={date} min={new Date().toISOString().split("T")[0]} onChange={(e)=>{setDate(e.target.value);setSlots([])}}/></div><button className="primary-button preview-button" onClick={loadSlots} disabled={!selectedService||!date||loadingSlots}>{loadingSlots?"Checking…":"Preview slots"}</button></div>{slots.length>0?<div className="premium-slots-grid">{slots.map((slot)=><div className="premium-slot" key={`${slot.startTime}-${slot.endTime}`}><strong>{slot.startTime}</strong><span>{slot.endTime}</span></div>)}</div>:date&&!loadingSlots?<div className="admin-empty-state compact-empty"><div className="empty-icon">◷</div><h3>No available slots</h3><p>Check the working hours, breaks, existing bookings or choose another date.</p></div>:null}</section>
  </AdminLayout>;
}
export default AdminAvailability;
