import express from "express";

import {
  getServices,
  getAllServices,
  createService,
  updateService,
  deleteService,
} from "../controllers/serviceController.js";

import { protectAdmin } from "../middleware/adminAuth.js";

const router = express.Router();

// ==========================================
// PUBLIC
// ==========================================

// Get active services
router.get("/", getServices);


// ==========================================
// ADMIN
// ==========================================

// Get all services
router.get(
  "/admin/all",
  protectAdmin,
  getAllServices
);

// Create service
router.post(
  "/",
  protectAdmin,
  createService
);

// Update service
router.put(
  "/:id",
  protectAdmin,
  updateService
);

// Delete service
router.delete(
  "/:id",
  protectAdmin,
  deleteService
);

export default router;