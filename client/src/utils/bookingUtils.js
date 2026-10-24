const INDIA_TIME_ZONE = "Asia/Kolkata";

export const getBookingEndTimestamp = (booking) => {
  if (!booking?.date || !booking?.endTime) return Number.POSITIVE_INFINITY;
  return new Date(`${booking.date}T${booking.endTime}:00+05:30`).getTime();
};

export const isBookingPast = (booking, now = Date.now()) =>
  getBookingEndTimestamp(booking) <= now;

export const getBookingDisplayStatus = (booking, now = Date.now()) => {
  if (booking?.status === "completed") return "completed";
  if (booking?.status === "missed") return "missed";
  if (booking?.status === "cancelled") return "cancelled";
  if (isBookingPast(booking, now)) return "missed";
  return booking?.status || "pending";
};

export const getStatusLabel = (status) => ({
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Finished",
  missed: "Missed",
  cancelled: "Cancelled",
}[status] || "Pending");

export const formatBookingDate = (date) => {
  if (!date) return "—";
  const parsed = new Date(`${date}T12:00:00+05:30`);
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: INDIA_TIME_ZONE,
  }).format(parsed);
};

export const formatBookingTime = (time) => {
  if (!time) return "—";
  const [hour, minute] = time.split(":").map(Number);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(minute).padStart(2, "0")} ${suffix}`;
};
