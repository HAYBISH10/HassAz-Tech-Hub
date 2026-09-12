import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    categorySlug: { type: String, required: true },
    programSlug: { type: String, required: true },
    programTitle: { type: String, required: true },
    categoryTitle: { type: String, default: "" },
    modeId: { type: String, default: "" },
    status: { type: String, enum: ["registered", "withdrawn"], default: "registered" },
  },
  { timestamps: true }
);

enrollmentSchema.index({ userId: 1, programSlug: 1 }, { unique: true });

export default mongoose.model("Enrollment", enrollmentSchema);
