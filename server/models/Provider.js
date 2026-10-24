import mongoose from "mongoose";

const providerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, default: "", trim: true, lowercase: true },
    avatar: { type: String, default: "" },
    active: { type: Boolean, default: true },
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],
  },
  { timestamps: true }
);

const Provider = mongoose.model("Provider", providerSchema);
export default Provider;
