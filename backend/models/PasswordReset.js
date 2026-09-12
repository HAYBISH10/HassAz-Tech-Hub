import mongoose from "mongoose";

const passwordResetSchema = new mongoose.Schema(
  {
    emailKey: { type: String, required: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("PasswordReset", passwordResetSchema);
