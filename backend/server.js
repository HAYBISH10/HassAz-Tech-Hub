import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { connectDb } from "./config/db.js";
import courseRoutes from "./routes/courses.js";
import inquiryRoutes from "./routes/inquiries.js";
import siteRoutes from "./routes/site.js";
import bookingRoutes from "./routes/bookings.js";
import applicationRoutes from "./routes/applications.js";
import graduateRoutes from "./routes/graduates.js";
import settingsRoutes from "./routes/settings.js";
import contactRoutes from "./routes/contact.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import enrollmentRoutes from "./routes/enrollments.js";
import broadcastRoutes from "./routes/broadcast.js";
import visitRoutes from "./routes/visits.js";
import chatRoutes from "./routes/chat.js";
import intakeRoutes from "./routes/intakes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, name: "HassAz Tech Hub API" });
});

app.get("/api/public/email-logo.png", (_req, res) => {
  const file = join(dirname(fileURLToPath(import.meta.url)), "assets/logo-email.png");
  if (!existsSync(file)) return res.status(404).end();
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.type("png");
  res.sendFile(file);
});

app.use("/api/courses", courseRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/site", siteRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/graduates", graduateRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/broadcast", broadcastRoutes);
app.use("/api/visits", visitRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/intakes", intakeRoutes);

app.listen(port, "0.0.0.0", () => {
  console.log(`HassAz backend running on http://localhost:${port}`);
  connectDb().catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    console.log("API is running without MongoDB. Applications and graduates save to local files.");
  });
});
