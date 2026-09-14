import { Router } from "express";
import mongoose from "mongoose";
import { requireAdmin } from "../utils/auth.js";
import { rateLimit } from "../utils/rateLimit.js";
import { readJson } from "../utils/localJson.js";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import "../models/Application.js";
import "../models/User.js";
import "../models/Enrollment.js";
import "../models/Booking.js";
import "../models/ContactMessage.js";
import "../models/Visitor.js";
import "../models/Graduate.js";
import "../models/Inquiry.js";
import "../models/Setting.js";

const router = Router();
const dataDir = join(dirname(fileURLToPath(import.meta.url)), "../data");

const HIDDEN = /password|hash|token|secret|otp/i;

const TABLES = [
  { id: "applications", label: "Applicants", model: "Application", file: "applications-store.json" },
  { id: "users", label: "Registered users", model: "User", file: "users-store.json" },
  { id: "enrollments", label: "Course registrations", model: "Enrollment", file: "enrollments-store.json" },
  { id: "bookings", label: "Booked calls", model: "Booking", file: "bookings-store.json" },
  { id: "contactmessages", label: "Contact messages", model: "ContactMessage", file: "contact-store.json" },
  { id: "visitors", label: "Website visitors", model: "Visitor", file: "visitors-store.json" },
  { id: "graduates", label: "Certificates", model: "Graduate", file: "graduates-store.json" },
  { id: "inquiries", label: "Inquiries", model: "Inquiry", file: "inquiries-store.json" },
  { id: "settings", label: "Settings", model: "Setting", file: "settings-store.json" },
];

function flattenValue(value) {
  if (value == null) return "";
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map((item) => flattenValue(item)).filter(Boolean).join(", ");
  if (typeof value === "object") {
    return Object.entries(value)
      .filter(([key]) => !HIDDEN.test(key))
      .map(([key, item]) => `${key}: ${flattenValue(item)}`)
      .filter((item) => !item.endsWith(": "))
      .join(" · ");
  }
  return String(value);
}

function flattenRow(doc) {
  const row = {};
  for (const [key, value] of Object.entries(doc || {})) {
    if (HIDDEN.test(key) || key === "__v") continue;
    if (key === "_id") {
      row.id = String(value);
      continue;
    }
    row[key] = flattenValue(value);
  }
  return row;
}

async function loadTable(table) {
  if (mongoose.connection.readyState === 1 && table.model) {
    const model = mongoose.models[table.model];
    if (model) {
      const docs = await model.find().sort({ _id: -1 }).limit(300).lean();
      return docs.map(flattenRow);
    }
  }
  const raw = readJson(join(dataDir, table.file), []);
  if (Array.isArray(raw)) return raw.map(flattenRow);
  if (raw && typeof raw === "object") return [flattenRow(raw)];
  return [];
}

router.get(
  "/",
  requireAdmin,
  rateLimit({ max: 20, windowMs: 15 * 60 * 1000, message: "Too many database requests. Please wait a few minutes." }),
  async (_req, res) => {
  try {
    const tables = [];
    for (const table of TABLES) {
      const rows = await loadTable(table);
      const columns = [];
      const seen = new Set();
      for (const row of rows) {
        for (const key of Object.keys(row)) {
          if (seen.has(key)) continue;
          seen.add(key);
          columns.push(key);
        }
      }
      tables.push({
        id: table.id,
        label: table.label,
        count: rows.length,
        columns,
        rows,
      });
    }
    res.json({
      source: mongoose.connection.readyState === 1 ? "mongodb" : "local files",
      tables,
    });
  } catch {
    res.status(400).json({ message: "Could not load the database tables." });
  }
});

export default router;
