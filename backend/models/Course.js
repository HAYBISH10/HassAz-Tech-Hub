import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  summary: { type: String, required: true },
  category: { type: String, required: true },
});

export default mongoose.model("Course", courseSchema);
