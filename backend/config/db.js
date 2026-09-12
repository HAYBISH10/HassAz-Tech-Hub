import mongoose from "mongoose";

export async function connectDb() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hassaz-tech-hub";
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 4000 });
  console.log("MongoDB connected");
}
