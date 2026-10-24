import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import connectDB from "./config/db.js";

import serviceRoutes from "./routes/serviceRoutes.js";
import availabilityRoutes from "./routes/availabilityRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error("JWT_SECRET must be set and contain at least 32 characters.");
  process.exit(1);
}

const app = express();

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

const PORT = process.env.PORT || 5000;

// ==========================================
// DATABASE
// ==========================================

connectDB();

// ==========================================
// CORS
// ==========================================

const allowedOrigins = (
  process.env.CLIENT_URL || "http://localhost:5175"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

console.log("Allowed CORS origins:", allowedOrigins);

app.use(helmet());

app.use(
  cors({
    origin: (origin, callback) => {
      // Thunder Client / Postman / server-to-server requests
      if (!origin) {
        return callback(null, true);
      }

      // Explicitly allowed origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Development: allow any localhost port
      if (
        process.env.NODE_ENV !== "production" &&
        /^http:\/\/localhost:\d+$/.test(origin)
      ) {
        return callback(null, true);
      }

      console.error("Blocked CORS origin:", origin);

      return callback(new Error("CORS origin not allowed."));
    },

    credentials: true,
  })
);

// ==========================================
// BODY PARSER
// ==========================================

app.use(express.json({ limit: "100kb" }));

// ==========================================
// RATE LIMITING
// ==========================================

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

app.use("/api", apiLimiter);

// ==========================================
// API ROUTES
// ==========================================

app.use("/api/admin", adminRoutes);

app.use("/api/services", serviceRoutes);

app.use("/api/availability", availabilityRoutes);

app.use("/api/bookings", bookingRoutes);

// ==========================================
// HEALTH CHECK
// ==========================================

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    status: "ok",
    service: "luma-studio-api",
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// ROOT
// ==========================================

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Luma Studio API is running",
  });
});

// ==========================================
// 404
// ==========================================

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ==========================================
// ERROR HANDLER
// ==========================================

app.use((error, _req, res, _next) => {
  console.error("Unhandled API error:", error.message);

  res.status(500).json({
    success: false,
    message: "Unexpected server error",
  });
});

// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});