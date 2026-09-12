import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ["unread", "read", "resolved", "approved", "rejected"], default: "unread" },
  },
  { timestamps: true }
);

contactSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("ContactMessage", contactSchema);
