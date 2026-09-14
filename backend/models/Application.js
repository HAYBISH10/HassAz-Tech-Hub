import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    applicationNumber: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["Submitted", "Under Review", "Accepted", "Enrolled", "Completed", "Rejected"],
      default: "Submitted",
    },
    state: {
      type: String,
      enum: ["Open", "Closed"],
      default: "Open",
    },
    personalInformation: { type: Object, default: {} },
    contactInformation: { type: Object, default: {} },
    guardianInformation: { type: Object, default: {} },
    education: { type: Object, default: {} },
    program: { type: Object, default: {} },
    technologyBackground: { type: Object, default: {} },
    skills: { type: [String], default: [] },
    experience: { type: Object, default: {} },
    goals: { type: Object, default: {} },
    trainingPreferences: { type: Object, default: {} },
    documents: { type: Object, default: {} },
    source: { type: String, default: "" },
    consent: { type: Object, default: {} },
    reviewedAt: { type: Date, default: null },
    userId: { type: String, default: "" },
    emailKey: { type: String, default: "" },
    phoneKey: { type: String, default: "" },
    intakeName: { type: String, default: "" },
    intakeYear: { type: Number, default: null },
    intakeKey: { type: String, default: "" },
    intakeCohort: { type: String, default: "" },
  },
  { timestamps: { createdAt: "submittedAt", updatedAt: true } }
);

applicationSchema.index(
  { emailKey: 1 },
  { unique: true, partialFilterExpression: { emailKey: { $gt: "" }, status: { $ne: "Rejected" } } }
);
applicationSchema.index(
  { phoneKey: 1 },
  { unique: true, partialFilterExpression: { phoneKey: { $gt: "" }, status: { $ne: "Rejected" } } }
);

export default mongoose.model("Application", applicationSchema);
