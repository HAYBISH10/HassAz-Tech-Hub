import mongoose from "mongoose";

export async function connectDb() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hassaz-tech-hub";
  if (!uri.includes("127.0.0.1") && !uri.includes("localhost") && process.env.ALLOW_REMOTE_MONGO !== "true") {
    throw new Error("MongoDB must stay on localhost unless ALLOW_REMOTE_MONGO=true is set.");
  }
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 4000 });
  console.log("MongoDB connected");
}
