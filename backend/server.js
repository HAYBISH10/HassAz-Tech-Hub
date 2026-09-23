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
import databaseRoutes from "./routes/database.js";
import intakeRoutes from "./routes/intakes.js";
import { assertProductionConfig, frontendOrigin, isProduction, usesHttps } from "./utils/env.js";
import { rateLimit } from "./utils/rateLimit.js";

dotenv.config();
assertProductionConfig();

const app = express();
const port = process.env.PORT || 5000;
const here = dirname(fileURLToPath(import.meta.url));
const frontendDist = join(here, "../Frontend/dist");

app.disable("x-powered-by");
  if (isProduction()) {
    app.set("trust proxy", 1);
  } else {
    app.set("trust proxy", "loopback");
  }

function isAllowedOrigin(origin) {
  if (!origin) return true;
  try {
    const url = new URL(origin);
    const host = url.hostname;
    const frontend = frontendOrigin();
    if (frontend && origin === frontend) return true;
    const extra = String(process.env.CORS_ORIGINS || "")
      .split(",")
      .map((item) => item.trim().replace(/\/$/, ""))
      .filter(Boolean);
    if (extra.includes(origin)) return true;
    if (!isProduction()) {
      if (host === "localhost" || host === "127.0.0.1") return true;
      if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) return true;
      if (/^192\.168\./.test(host) || /^10\./.test(host)) return true;
    }
    return false;
  } catch {
    return false;
  }
}

app.use((req, res, next) => {
  if (!usesHttps()) return next();
  const proto = String(req.headers["x-forwarded-proto"] || req.protocol || "");
  if (proto === "https" || req.secure) return next();
  const host = req.headers.host;
  if (!host) return next();
  return res.redirect(301, `https://${host}${req.originalUrl}`);
});

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-DNS-Prefetch-Control", "off");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self' https://accounts.google.com",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "script-src 'self' https://accounts.google.com https://apis.google.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://accounts.google.com https://oauth2.googleapis.com",
      "frame-src https://accounts.google.com https://apis.google.com",
    ].join("; ")
  );
  if (usesHttps()) {
    res.setHeader("Strict-Transport-Security", "max-age=15552000; includeSubDomains");
  }
  next();
});

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "700kb" }));

app.use("/api", (req, res, next) => {
  const path = req.path || "";
  const publicCache =
    req.method === "GET" &&
    (path === "/health" ||
      path === "/site" ||
      path === "/courses" ||
      path === "/courses/catalog" ||
      path === "/bookings/config" ||
      path === "/intakes");
  res.setHeader("Cache-Control", publicCache ? "public, max-age=60" : "no-store");
  next();
});

app.use("/api", rateLimit({ max: 400, windowMs: 15 * 60 * 1000, message: "Too many requests. Please wait a moment." }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, name: "HassAz Tech Hub API" });
});

app.get("/api/public/email-logo.png", (_req, res) => {
  const file = join(here, "assets/logo-email.png");
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
app.use("/api/database", databaseRoutes);
app.use("/api/intakes", intakeRoutes);

if (existsSync(join(frontendDist, "index.html"))) {
  app.use(
    express.static(frontendDist, {
      maxAge: isProduction() ? "7d" : 0,
      index: false,
      setHeaders(res, filePath) {
        if (filePath.endsWith(".html")) res.setHeader("Cache-Control", "no-cache");
      },
    })
  );
  app.use((req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();
    if (req.path.startsWith("/api")) return next();
    res.sendFile(join(frontendDist, "index.html"), (err) => (err ? next() : undefined));
  });
}

app.use((err, _req, res, _next) => {
  console.error(err?.message || err);
  if (String(err?.message || "").includes("CORS")) {
    return res.status(403).json({ message: "Request blocked." });
  }
  res.status(500).json({ message: "Something went wrong." });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`HassAz backend running on http://localhost:${port}`);
  connectDb().catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    if (isProduction()) {
      console.error("MongoDB is required in production. Set MONGO_URI and ALLOW_REMOTE_MONGO=true for Atlas.");
      process.exit(1);
    }
    console.log("API is running without MongoDB. Applications and graduates save to local files.");
  });
});
