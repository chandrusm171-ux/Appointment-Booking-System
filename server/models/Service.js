import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Service name is required"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Service description is required"],
      trim: true,
    },

    price: {
      type: Number,
      required: [true, "Service price is required"],
      min: [0, "Price cannot be negative"],
    },

    duration: {
      type: Number,
      required: [true, "Service duration is required"],
      min: [15, "Duration must be at least 15 minutes"],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Service = mongoose.model("Service", serviceSchema);

export default Service;