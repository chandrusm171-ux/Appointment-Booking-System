import express from "express";
import rateLimit from "express-rate-limit";

import { loginAdmin, getCurrentAdmin, logoutAdmin } from "../controllers/adminController.js";
import {
  getAdminDashboard,
  getAllBookings,
  updateBooking,
} from "../controllers/adminController.js";
import {
  getAvailability,
  updateAvailability,
} from "../controllers/availabilityController.js";
import { protectAdmin } from "../middleware/adminAuth.js";

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: "Too many login attempts. Please wait 15 minutes and try again.",
    code: "LOGIN_RATE_LIMITED",
  },
});

router.post("/login", loginLimiter, loginAdmin);
router.get("/me", protectAdmin, getCurrentAdmin);
router.post("/logout", protectAdmin, logoutAdmin);

router.get("/dashboard", protectAdmin, getAdminDashboard);

router.get("/bookings", protectAdmin, getAllBookings);
router.put("/bookings/:id", protectAdmin, updateBooking);

router.get("/availability", protectAdmin, getAvailability);
router.put("/availability", protectAdmin, updateAvailability);

export default router;
