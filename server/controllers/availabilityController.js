import Availability from "../models/Availability.js";
import { getAvailableSlots } from "../services/availabilityService.js";

const days = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

const toMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const validateDay = (dayName, day) => {
  if (!day || typeof day.isOpen !== "boolean") {
    throw new Error(`${dayName}: isOpen must be true or false.`);
  }

  if (!day.isOpen) return;

  if (!timePattern.test(day.open) || !timePattern.test(day.close)) {
    throw new Error(`${dayName}: invalid opening or closing time.`);
  }

  if (toMinutes(day.open) >= toMinutes(day.close)) {
    throw new Error(`${dayName}: opening time must be before closing time.`);
  }

  for (const breakPeriod of day.breaks || []) {
    if (!timePattern.test(breakPeriod.start) || !timePattern.test(breakPeriod.end)) {
      throw new Error(`${dayName}: invalid break time.`);
    }

    if (toMinutes(breakPeriod.start) >= toMinutes(breakPeriod.end)) {
      throw new Error(`${dayName}: break start must be before break end.`);
    }

    if (
      toMinutes(breakPeriod.start) < toMinutes(day.open) ||
      toMinutes(breakPeriod.end) > toMinutes(day.close)
    ) {
      throw new Error(`${dayName}: breaks must be inside working hours.`);
    }
  }
};

export const getAvailability = async (_req, res) => {
  try {
    let availability = await Availability.findOne({ key: "default" });

    if (!availability) {
      availability = await Availability.create({ key: "default" });
    }

    return res.status(200).json({
      success: true,
      data: availability,
    });
  } catch (error) {
    console.error("Availability GET error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load working hours.",
    });
  }
};

export const updateAvailability = async (req, res) => {
  try {
    for (const dayName of days) {
      validateDay(dayName, req.body[dayName]);
    }

    const availability = await Availability.findOneAndUpdate(
      { key: "default" },
      {
        $set: Object.fromEntries(
          days.map((dayName) => [dayName, {
            isOpen: req.body[dayName].isOpen,
            open: req.body[dayName].open,
            close: req.body[dayName].close,
            breaks: req.body[dayName].breaks || [],
          }])
        ),
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Working hours updated successfully.",
      data: availability,
    });
  } catch (error) {
    console.error("Availability PUT error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update working hours.",
    });
  }
};

export const getAvailableSlotsForCustomer = async (req, res) => {
  try {
    const { serviceId, date } = req.query;

    if (!serviceId || !date) {
      return res.status(400).json({
        success: false,
        message: "serviceId and date are required.",
      });
    }

    const slots = await getAvailableSlots(serviceId, date);

    return res.status(200).json({
      success: true,
      date,
      serviceId,
      slots,
    });
  } catch (error) {
    console.error("Availability slots error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to calculate availability.",
    });
  }
};
