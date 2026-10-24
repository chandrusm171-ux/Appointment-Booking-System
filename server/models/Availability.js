import mongoose from "mongoose";

const breakSchema = new mongoose.Schema(
  {
    start: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
    end: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
  },
  { _id: false }
);

const daySchema = new mongoose.Schema(
  {
    isOpen: {
      type: Boolean,
      default: true,
    },
    open: {
      type: String,
      default: "09:00",
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
    close: {
      type: String,
      default: "18:00",
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
    breaks: {
      type: [breakSchema],
      default: [],
    },
  },
  { _id: false }
);

const availabilitySchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "default",
      unique: true,
    },

    monday: {
      type: daySchema,
      default: () => ({
        isOpen: true,
        open: "09:00",
        close: "18:00",
        breaks: [],
      }),
    },

    tuesday: {
      type: daySchema,
      default: () => ({
        isOpen: true,
        open: "09:00",
        close: "18:00",
        breaks: [],
      }),
    },

    wednesday: {
      type: daySchema,
      default: () => ({
        isOpen: true,
        open: "09:00",
        close: "18:00",
        breaks: [],
      }),
    },

    thursday: {
      type: daySchema,
      default: () => ({
        isOpen: true,
        open: "09:00",
        close: "18:00",
        breaks: [],
      }),
    },

    friday: {
      type: daySchema,
      default: () => ({
        isOpen: true,
        open: "09:00",
        close: "18:00",
        breaks: [],
      }),
    },

    saturday: {
      type: daySchema,
      default: () => ({
        isOpen: true,
        open: "10:00",
        close: "15:00",
        breaks: [],
      }),
    },

    sunday: {
      type: daySchema,
      default: () => ({
        isOpen: false,
        open: "09:00",
        close: "18:00",
        breaks: [],
      }),
    },
  },
  {
    timestamps: true,
  }
);

const Availability = mongoose.model("Availability", availabilitySchema);

export default Availability;
