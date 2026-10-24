import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    reference: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },

    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Provider",
      default: null,
    },

    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },

    customerEmail: {
      type: String,
      required: [true, "Customer email is required"],
      trim: true,
      lowercase: true,
    },

    customerPhone: {
      type: String,
      required: [true, "Customer phone is required"],
      trim: true,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    date: {
      type: String,
      required: [true, "Booking date is required"],
      match: /^\d{4}-\d{2}-\d{2}$/,
    },

    startTime: {
      type: String,
      required: [true, "Start time is required"],
      match: /^([01]\d|2[0-3]):[0-5]\d$/,
    },

    endTime: {
      type: String,
      required: [true, "End time is required"],
      match: /^([01]\d|2[0-3]):[0-5]\d$/,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "missed", "cancelled"],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ date: 1, startTime: 1, status: 1 });
bookingSchema.index({ date: 1, status: 1 });

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
