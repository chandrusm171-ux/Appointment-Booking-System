import Booking from "../models/Booking.js";
import Service from "../models/Service.js";
import "../models/Provider.js";
import { getAvailableSlots } from "../services/availabilityService.js";

const generateReference = () => {
  const randomPart = Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();

  return `LUMA-${Date.now()}-${randomPart}`;
};

export const createBooking = async (req, res) => {
  try {
    const {
      serviceId,
      customerName,
      customerEmail,
      customerPhone,
      date,
      startTime,
    } = req.body;

    // 1. Validate required fields
    if (
      !serviceId ||
      !customerName ||
      !customerEmail ||
      !date ||
      !startTime
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required booking details",
      });
    }

    // 2. Find service
    const service = await Service.findOne({
      _id: serviceId,
      isActive: true,
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found or is no longer available",
      });
    }

    // 3. Get currently available slots
    const availableSlots = await getAvailableSlots(
      serviceId,
      date
    );

    // 4. Find requested slot
    const selectedSlot = availableSlots.find(
      (slot) => slot.startTime === startTime
    );

    if (!selectedSlot) {
      return res.status(409).json({
        success: false,
        message:
          "This time slot is no longer available. Please select another time.",
      });
    }

    // 5. Create booking
    const booking = await Booking.create({
      reference: generateReference(),
      service: service._id,
      customerName,
      customerEmail,
      customerPhone,
      date,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      status: "pending",
    });

    // 6. Return booking
    const populatedBooking = await Booking.findById(
      booking._id
    ).populate("service");

    return res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      data: populatedBooking,
    });
  } catch (error) {
    console.error("Create booking error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create booking",
    });
  }
};