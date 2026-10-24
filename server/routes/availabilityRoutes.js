import express from "express";
import { getAvailableSlotsForCustomer } from "../controllers/availabilityController.js";

const router = express.Router();

// Public customer slot calculation.
router.get("/slots", getAvailableSlotsForCustomer);

export default router;
