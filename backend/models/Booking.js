import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: "" },
    date: { type: String, required: true },
    time: { type: String, required: true },
    timezone: { type: String, default: "Africa/Nairobi" },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
