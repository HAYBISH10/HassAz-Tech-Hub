import mongoose from "mongoose";

const visitorSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true },
    ip: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    firstPath: { type: String, default: "/" },
    lastPath: { type: String, default: "/" },
    pageViews: { type: Number, default: 1 },
    visitorNo: { type: Number, default: 0 },
    firstSeen: { type: Date, default: Date.now },
    lastSeen: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

visitorSchema.index({ lastSeen: -1 });
visitorSchema.index({ visitorNo: 1 });
visitorSchema.index({ ip: 1, userAgent: 1 });

export default mongoose.model("Visitor", visitorSchema);
