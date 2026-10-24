import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import Service from "./models/Service.js";

dotenv.config();

const services = [
  {
    name: "Signature Haircut",
    description:
      "A personalized haircut designed around your style and preferences.",
    price: 800,
    duration: 45,
    isActive: true,
  },
  {
    name: "Hair Styling",
    description:
      "Professional styling for everyday looks, events, and special occasions.",
    price: 1200,
    duration: 60,
    isActive: true,
  },
  {
    name: "Hair & Scalp Consultation",
    description:
      "A focused consultation to understand your hair and scalp needs.",
    price: 600,
    duration: 30,
    isActive: true,
  },
  {
    name: "Premium Styling",
    description:
      "A complete premium styling experience tailored to your desired look.",
    price: 1800,
    duration: 90,
    isActive: true,
  },
];

const seedServices = async () => {
  try {
    await connectDB();

    for (const service of services) {
      await Service.findOneAndUpdate(
        { name: service.name },
        service,
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );
    }

    console.log("Services seeded successfully");

    await mongoose.connection.close();

    console.log("Database connection closed");

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);

    await mongoose.connection.close();

    process.exit(1);
  }
};

seedServices();