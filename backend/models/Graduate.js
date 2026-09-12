import mongoose from "mongoose";

const graduateSchema = new mongoose.Schema(
  {
    certificateId: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    nameKey: { type: String, required: true },
    emailKey: { type: String, required: true },
    program: { type: String, required: true },
    details: { type: String, default: "" },
    categorySlug: { type: String, default: "" },
    programSlug: { type: String, default: "" },
    aliases: { type: [String], default: [] },
    awarded: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: "awardedAt", updatedAt: true } }
);

graduateSchema.index({ nameKey: 1, emailKey: 1 }, { unique: true });

export default mongoose.model("Graduate", graduateSchema);
