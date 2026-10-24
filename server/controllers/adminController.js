import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import Admin from "../models/Admin.js";
import Booking from "../models/Booking.js";
import Service from "../models/Service.js";
import Availability from "../models/Availability.js";
import { getAvailableSlots } from "../services/availabilityService.js";
// ==============================
// ADMIN LOGIN
// ==============================
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // Find admin
    const admin = await Admin.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Check account status
    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: "Admin account is inactive.",
      });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(
      password,
      admin.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Create JWT
    const token = jwt.sign(
      {
        id: admin._id,
        email: admin.email,
        role: admin.role,
        tokenVersion: admin.tokenVersion || 0,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "8h",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Admin login successful.",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during admin login.",
    });
  }
};

// ==============================
// CURRENT ADMIN SESSION
// ==============================
export const getCurrentAdmin = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      id: req.admin._id,
      name: req.admin.name,
      email: req.admin.email,
      role: req.admin.role,
      isActive: req.admin.isActive,
    },
  });
};

// ==============================
// LOGOUT / REVOKE CURRENT TOKENS
// ==============================
export const logoutAdmin = async (req, res) => {
  try {
    await Admin.findByIdAndUpdate(req.admin._id, { $inc: { tokenVersion: 1 } });
    return res.status(200).json({
      success: true,
      message: "Admin session revoked successfully.",
    });
  } catch (error) {
    console.error("Admin logout error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to revoke admin session.",
    });
  }
};

// ==============================
// ADMIN DASHBOARD
// ==============================
export const getDashboardStats = async (req, res) => {
  try {
    // Get today's date in India
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
    }).format(new Date());

    // Total bookings
    const totalBookings = await Booking.countDocuments();

    // Today's bookings
    const todaysBookings = await Booking.countDocuments({
      date: today,
    });

    // Active services
    const totalServices = await Service.countDocuments({
      isActive: true,
    });

    // Recent bookings
    const recentBookings = await Booking.find()
      .populate("service")
      .sort({ createdAt: -1 })
      .limit(10);

    return res.status(200).json({
      success: true,

      data: {
        totalBookings,
        todaysBookings,
        totalServices,

        recentBookings,

        admin: {
          id: req.admin._id,
          name: req.admin.name,
          email: req.admin.email,
          role: req.admin.role,
        },
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard statistics.",
    });
  }
};

// ==========================================
// GET ALL BOOKINGS - ADMIN
// ==========================================

const timeToMinutes = (time) => {
  const [hours, minutes] = String(time).split(":").map(Number);
  return hours * 60 + minutes;
};

const isValidDate = (date) => /^\d{4}-\d{2}-\d{2}$/.test(date || "");
const isValidTime = (time) => /^([01]\d|2[0-3]):[0-5]\d$/.test(time || "");

const addMinutesToTime = (time, duration) => {
  const total = timeToMinutes(time) + Number(duration || 0);
  const hours = Math.floor(total / 60) % 24;
  const minutes = total % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

// Compare an appointment against India Standard Time so the admin UI
// consistently moves finished appointments into History.
const getBookingEndTimestamp = (date, endTime) =>
  new Date(`${date}T${endTime}:00+05:30`).getTime();

const isPastBooking = (booking) =>
  getBookingEndTimestamp(booking.date, booking.endTime) <= Date.now();

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("service")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("Get all bookings error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
    });
  }
};

export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id).populate("service");

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    const {
      serviceId,
      customerName,
      customerEmail,
      customerPhone,
      date,
      startTime,
      status,
      notes,
    } = req.body;

    const nextServiceId = serviceId || booking.service?._id || booking.service;
    const nextDate = date || booking.date;
    const nextStartTime = startTime || booking.startTime;
    const nextStatus = status || booking.status;

    if (!customerName?.trim() || !customerEmail?.trim() || !customerPhone?.trim()) {
      return res.status(400).json({ success: false, message: "Customer name, email and phone are required." });
    }

    if (!isValidDate(nextDate) || !isValidTime(nextStartTime)) {
      return res.status(400).json({ success: false, message: "Please provide a valid appointment date and start time." });
    }

    const allowedStatuses = ["pending", "confirmed", "completed", "missed", "cancelled"];
    if (!allowedStatuses.includes(nextStatus)) {
      return res.status(400).json({ success: false, message: "Invalid booking status." });
    }

    const service = await Service.findById(nextServiceId);
    if (!service) {
      return res.status(404).json({ success: false, message: "Selected service was not found." });
    }

    // A rescheduled/edited active appointment must use a currently available slot.
    // Closed records can still be edited without reserving a new slot.
    const needsAvailabilityCheck = ["pending", "confirmed"].includes(nextStatus);
    let nextEndTime = addMinutesToTime(nextStartTime, service.duration);

    if (needsAvailabilityCheck) {
      const slots = await getAvailableSlots(nextServiceId, nextDate);
      const matchingSlot = slots.find((slot) => slot.startTime === nextStartTime);

      // The existing booking occupies its old slot, so allow the unchanged slot.
      const unchangedSlot =
        booking.service?._id?.toString() === nextServiceId.toString() &&
        booking.date === nextDate &&
        booking.startTime === nextStartTime;

      if (!matchingSlot && !unchangedSlot) {
        return res.status(409).json({
          success: false,
          message: "That appointment time is not available. Please choose another slot.",
        });
      }

      nextEndTime = unchangedSlot ? booking.endTime : matchingSlot.endTime;
    }

    const effectiveEndTime = nextEndTime || addMinutesToTime(nextStartTime, service.duration);
    const requestedAppointmentHasPassed = getBookingEndTimestamp(nextDate, effectiveEndTime) <= Date.now();

    if (["completed", "missed"].includes(nextStatus) && !requestedAppointmentHasPassed) {
      return res.status(400).json({
        success: false,
        message: "An appointment can be marked finished or missed only after its scheduled end time.",
      });
    }

    booking.service = service._id;
    booking.customerName = customerName.trim();
    booking.customerEmail = customerEmail.trim().toLowerCase();
    booking.customerPhone = customerPhone.trim();
    booking.date = nextDate;
    booking.startTime = nextStartTime;
    booking.endTime = effectiveEndTime;
    booking.status = nextStatus;
    booking.notes = String(notes || "").trim();

    await booking.save();

    const updated = await Booking.findById(booking._id).populate("service");

    return res.status(200).json({
      success: true,
      message: "Booking updated successfully.",
      data: updated,
    });
  } catch (error) {
    console.error("Update booking error:", error);
    return res.status(500).json({ success: false, message: "Failed to update booking." });
  }
};

export const getAdminDashboard = async (req, res) => {
  try {
    const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
    const totalBookings = await Booking.countDocuments();
    const allBookings = await Booking.find().select("date endTime status").lean();
    const upcomingBookings = allBookings.filter((booking) => !isPastBooking(booking));
    const historyBookings = allBookings.filter((booking) => isPastBooking(booking));
    const pendingBookings = upcomingBookings.filter((booking) => booking.status === "pending").length;
    const confirmedBookings = upcomingBookings.filter((booking) => booking.status === "confirmed").length;
    const finishedBookings = historyBookings.filter((booking) => booking.status === "completed").length;
    const missedBookings = historyBookings.filter((booking) => !["completed", "cancelled"].includes(booking.status)).length;

    const todayBookings = await Booking.find({ date: today })
      .sort({ startTime: 1 })
      .populate("service")
      .lean();

    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate("service")
      .lean();

    const serviceRows = await Booking.aggregate([
      { $group: { _id: "$service", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);
    const serviceIds = serviceRows.map((row) => row._id).filter(Boolean);
    const serviceDocs = await Service.find({ _id: { $in: serviceIds } }).select("name").lean();
    const serviceNames = new Map(serviceDocs.map((service) => [String(service._id), service.name]));
    const topServices = serviceRows.map((row) => ({ serviceId: row._id, name: serviceNames.get(String(row._id)) || "Unknown service", count: row.count }));

    const totalServices = await Service.countDocuments({ isActive: true });

    return res.status(200).json({
      success: true,
      data: {
        totalBookings,
        todaysBookings: todayBookings.length,
        totalServices,
        upcomingBookings: upcomingBookings.length,
        historyBookings: historyBookings.length,
        pendingBookings,
        confirmedBookings,
        finishedBookings,
        missedBookings,
        todayBookings,
        recentBookings,
        topServices,
        admin: { id: req.admin._id, name: req.admin.name, email: req.admin.email, role: req.admin.role },
      },
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return res.status(500).json({ success: false, message: "Unable to load dashboard data." });
  }
};

// ==========================================
// GET WORKING HOURS
// ==========================================

export const getWorkingHours = async (req, res) => {
  try {
    let availability = await Availability.findOne({
      key: "default",
    });

    // Create default availability if it does not exist
    if (!availability) {
      availability = await Availability.create({
        key: "default",
      });
    }

    return res.status(200).json({
      success: true,
      data: availability,
    });
  } catch (error) {
    console.error("Get working hours error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch working hours.",
    });
  }
};


// ==========================================
// UPDATE WORKING HOURS
// ==========================================

export const updateWorkingHours = async (req, res) => {
  try {
    const {
      monday,
      tuesday,
      wednesday,
      thursday,
      friday,
      saturday,
      sunday,
    } = req.body;

    const days = {
      monday,
      tuesday,
      wednesday,
      thursday,
      friday,
      saturday,
      sunday,
    };

    // Validate each supplied day
    for (const [dayName, day] of Object.entries(days)) {
      if (!day) {
        continue;
      }

      if (typeof day.isOpen !== "boolean") {
        return res.status(400).json({
          success: false,
          message: `${dayName}: isOpen must be true or false.`,
        });
      }

      // Closed day does not need time validation
      if (!day.isOpen) {
        continue;
      }

      if (!day.open || !day.close) {
        return res.status(400).json({
          success: false,
          message: `${dayName}: opening and closing time are required.`,
        });
      }

      const timePattern =
        /^([01]\d|2[0-3]):([0-5]\d)$/;

      if (
        !timePattern.test(day.open) ||
        !timePattern.test(day.close)
      ) {
        return res.status(400).json({
          success: false,
          message: `${dayName}: invalid time format.`,
        });
      }

      if (day.open >= day.close) {
        return res.status(400).json({
          success: false,
          message: `${dayName}: opening time must be before closing time.`,
        });
      }

      if (Array.isArray(day.breaks)) {
        for (const breakWindow of day.breaks) {
          if (!breakWindow?.start || !breakWindow?.end || !timePattern.test(breakWindow.start) || !timePattern.test(breakWindow.end)) {
            return res.status(400).json({ success: false, message: `${dayName}: every break needs valid start and end times.` });
          }
          if (breakWindow.start >= breakWindow.end) {
            return res.status(400).json({ success: false, message: `${dayName}: break start must be before break end.` });
          }
          if (breakWindow.start < day.open || breakWindow.end > day.close) {
            return res.status(400).json({ success: false, message: `${dayName}: breaks must stay inside working hours.` });
          }
        }
      }
    }

    const availability =
      await Availability.findOneAndUpdate(
        { key: "default" },
        {
          $set: {
            monday,
            tuesday,
            wednesday,
            thursday,
            friday,
            saturday,
            sunday,
          },
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
    console.error("Update working hours error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update working hours.",
    });
  }
};