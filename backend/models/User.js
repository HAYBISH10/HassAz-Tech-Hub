import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    emailKey: { type: String, required: true, unique: true },
    phone: { type: String, default: "" },
    phoneKey: { type: String, default: "" },
    passwordHash: { type: String, default: "" },
    googleId: { type: String, default: "" },
    provider: { type: String, enum: ["local", "google", "local+google"], default: "local" },
  },
  { timestamps: true }
);

userSchema.index({ phoneKey: 1 }, { unique: true, sparse: true, partialFilterExpression: { phoneKey: { $gt: "" } } });
userSchema.index({ googleId: 1 }, { unique: true, sparse: true, partialFilterExpression: { googleId: { $gt: "" } } });

export default mongoose.model("User", userSchema);
