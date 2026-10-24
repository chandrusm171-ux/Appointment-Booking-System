import Service from "../models/Service.js";
import Booking from "../models/Booking.js";

// ==========================================
// GET ALL ACTIVE SERVICES
// Public
// ==========================================
export const getServices = async (req, res) => {
  try {
    const services = await Service.find({ isActive: true })
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (error) {
    console.error("Get services error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch services",
    });
  }
};

// ==========================================
// GET ALL SERVICES
// Admin
// ==========================================
export const getAllServices = async (req, res) => {
  try {
    const services = await Service.find()
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (error) {
    console.error("Get all services error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch services",
    });
  }
};

// ==========================================
// CREATE SERVICE
// Admin
// ==========================================
export const createService = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      duration,
      isActive = true,
    } = req.body;

    if (!name || !description || price === undefined || !duration) {
      return res.status(400).json({
        success: false,
        message: "Name, description, price and duration are required",
      });
    }

    const service = await Service.create({
      name,
      description,
      price,
      duration,
      isActive,
    });

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      data: service,
    });
  } catch (error) {
    console.error("Create service error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create service",
    });
  }
};

// ==========================================
// UPDATE SERVICE
// Admin
// ==========================================
export const updateService = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      description,
      price,
      duration,
      isActive,
    } = req.body;

    const service = await Service.findByIdAndUpdate(
      id,
      {
        name,
        description,
        price,
        duration,
        isActive,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Service updated successfully",
      data: service,
    });
  } catch (error) {
    console.error("Update service error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update service",
    });
  }
};

// ==========================================
// DELETE SERVICE
// Admin
// ==========================================
export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    const bookingCount = await Booking.countDocuments({ service: id });
    if (bookingCount > 0) {
      return res.status(409).json({
        success: false,
        message: "This service is linked to existing bookings. Deactivate it instead of deleting it.",
      });
    }

    await service.deleteOne();

    res.status(200).json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    console.error("Delete service error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete service",
    });
  }
};