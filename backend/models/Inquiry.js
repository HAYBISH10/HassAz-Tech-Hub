import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, default: "" },
    email: { type: String, required: true },
    role: { type: String, default: "" },
    interests: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("Inquiry", inquirySchema);
