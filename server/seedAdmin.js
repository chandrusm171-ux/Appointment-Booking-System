import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import connectDB from "./config/db.js";
import Admin from "./models/Admin.js";

dotenv.config();

const createAdmin = async () => {
  try {
    await connectDB();

    const email = (process.env.ADMIN_EMAIL || "admin@lumastudio.com").toLowerCase().trim();
    const password = process.env.ADMIN_PASSWORD;

    if (!password || password.length < 10) {
      throw new Error("Set ADMIN_PASSWORD in .env with at least 10 characters before running the admin seed.");
    }

    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      console.log("Admin already exists.");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await Admin.create({
      name: "Luma Studio Admin",
      email,
      password: hashedPassword,
      role: "admin",
      isActive: true,
    });

    console.log("Admin created successfully.");
    console.log("Email:", admin.email);
    console.log("Password: value from ADMIN_PASSWORD in .env");

    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();