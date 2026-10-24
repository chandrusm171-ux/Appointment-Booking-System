import Availability from "../models/Availability.js";
import Booking from "../models/Booking.js";
import Service from "../models/Service.js";

const ACTIVE_BOOKING_STATUSES = ["pending", "confirmed", "completed"];

const timeToMinutes = (time) => {
  const [hours, minutes] = String(time).split(":").map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

const getDayName = (dateString) => {
  const date = new Date(`${dateString}T12:00:00Z`);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: "UTC",
  })
    .format(date)
    .toLowerCase();
};

const getTodayInIndia = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

const getCurrentMinutesInIndia = () => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const hour = Number(parts.find((item) => item.type === "hour")?.value || 0);
  const minute = Number(parts.find((item) => item.type === "minute")?.value || 0);

  return hour * 60 + minute;
};

const isValidDate = (dateString) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString || "")) return false;
  const date = new Date(`${dateString}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === dateString;
};

const overlaps = (start, end, otherStart, otherEnd) =>
  start < otherEnd && end > otherStart;

const isInsideBreak = (start, end, breaks = []) =>
  breaks.some((item) =>
    overlaps(
      start,
      end,
      timeToMinutes(item.start),
      timeToMinutes(item.end)
    )
  );

const getWorkingHours = async () => {
  let availability = await Availability.findOne({ key: "default" });

  if (!availability) {
    availability = await Availability.create({ key: "default" });
  }

  return availability;
};

export const getAvailableSlots = async (serviceId, date) => {
  if (!isValidDate(date)) {
    throw new Error("Please provide a valid date.");
  }

  const service = await Service.findOne({
    _id: serviceId,
    isActive: true,
  });

  if (!service) {
    throw new Error("Service not found or inactive.");
  }

  const today = getTodayInIndia();

  // Past dates can never be booked.
  if (date < today) {
    return [];
  }

  const availability = await getWorkingHours();
  const dayName = getDayName(date);
  const hours = availability[dayName];

  // Closed day.
  if (!hours || !hours.isOpen) {
    return [];
  }

  const openMinutes = timeToMinutes(hours.open);
  const closeMinutes = timeToMinutes(hours.close);
  const serviceDuration = Number(service.duration);

  // For today, remove slots whose start time has already passed.
  const earliestStart =
    date === today ? getCurrentMinutesInIndia() + 1 : openMinutes;

  const bookings = await Booking.find({
    date,
    status: { $in: ACTIVE_BOOKING_STATUSES },
  }).select("startTime endTime");

  const slots = [];

  // Keep the existing 15-minute scheduling granularity.
  for (
    let start = openMinutes;
    start + serviceDuration <= closeMinutes;
    start += 15
  ) {
    if (start < earliestStart) continue;

    const end = start + serviceDuration;

    // Do not offer appointments that overlap an admin-configured break.
    if (isInsideBreak(start, end, hours.breaks || [])) {
      continue;
    }

    // Do not offer appointments that overlap active bookings.
    const hasConflict = bookings.some((booking) =>
      overlaps(
        start,
        end,
        timeToMinutes(booking.startTime),
        timeToMinutes(booking.endTime)
      )
    );

    if (!hasConflict) {
      slots.push({
        startTime: minutesToTime(start),
        endTime: minutesToTime(end),
      });
    }
  }

  return slots;
};
