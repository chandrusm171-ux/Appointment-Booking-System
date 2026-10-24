import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

export const protectAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Admin token is required.",
        code: "AUTH_REQUIRED",
      });
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Admin token is required.",
        code: "AUTH_REQUIRED",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await Admin.findById(decoded.id).select("-password");

    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: "Admin account is inactive or no longer exists.",
        code: "AUTH_INVALID",
      });
    }

    if (admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "This account does not have admin access.",
        code: "ADMIN_FORBIDDEN",
      });
    }

    if (Number(decoded.tokenVersion ?? 0) !== Number(admin.tokenVersion ?? 0)) {
      return res.status(401).json({
        success: false,
        message: "Your admin session is no longer valid. Please sign in again.",
        code: "AUTH_REVOKED",
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    const code = error?.name === "TokenExpiredError" ? "AUTH_EXPIRED" : "AUTH_INVALID";
    console.error("Admin authentication error:", error.message);

    return res.status(401).json({
      success: false,
      message: code === "AUTH_EXPIRED" ? "Your admin session has expired. Please sign in again." : "Invalid admin session.",
      code,
    });
  }
};
