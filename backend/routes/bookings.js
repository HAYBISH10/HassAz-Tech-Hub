import crypto from "crypto";
import { Router } from "express";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { siteContent } from "../data/content.js";
import Booking from "../models/Booking.js";
import { requireAdmin } from "../utils/auth.js";
import { rateLimit } from "../utils/rateLimit.js";
import { publicFail } from "../utils/httpErrors.js";
import { clip, isEmail } from "../utils/sanitize.js";
import {
  sendBookingApprovedEmail,
  sendBookingConfirmationEmail,
  sendBookingRejectedEmail,
} from "../utils/mail.js";

const ALLOWED_STATUSES = ["pending", "approved", "rejected"];

const storePath = join(dirname(fileURLToPath(import.meta.url)), "../data/bookings-store.json");
const router = Router();

function readLocal() {
  if (!existsSync(storePath)) return [];
  let list;
  try {
    list = JSON.parse(readFileSync(storePath, "utf8") || "[]");
  } catch {
    return [];
  }

  // Backfill records saved before "id"/"status" existed so they can still be managed from admin.
  let migrated = false;
  const withDefaults = list.map((item) => {
    if (item.id && item.status) return item;
    migrated = true;
    return { ...item, id: item.id || crypto.randomUUID(), status: item.status || "pending" };
  });
  if (migrated) writeLocal(withDefaults);
  return withDefaults;
}

function writeLocal(list) {
  const dir = dirname(storePath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(storePath, JSON.stringify(list, null, 2));
}

function saveLocal(record) {
  const current = readLocal();
  current.push(record);
  writeLocal(current);
  return record;
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function dateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function buildSlots(config) {
  const now = new Date();
  const slotsByDate = {};
  const days = (config.weeksAhead || 8) * 7;

  for (let i = 0; i < days; i += 1) {
    const date = new Date(now);
    date.setHours(0, 0, 0, 0);
    date.setDate(now.getDate() + i);
    if (!config.openWeekdays.includes(date.getDay())) continue;
    if (i === 0) continue;
    slotsByDate[dateKey(date)] = config.times;
  }

  return slotsByDate;
}

router.get("/config", (_req, res) => {
  const config = siteContent.booking;
  res.json({
    ...config,
    name: siteContent.name,
    motto: siteContent.motto,
    logoSrc: siteContent.hero.logoSrc,
    slotsByDate: buildSlots(config),
  });
});

router.get("/", requireAdmin, async (_req, res) => {
  try {
    let bookings = [];
    if (mongoose.connection.readyState === 1) {
      const rows = await Booking.find().sort({ createdAt: -1 }).lean();
      bookings = rows.map((row) => ({ ...row, id: String(row._id), status: row.status || "pending" }));
    }
    const local = readLocal()
      .slice()
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return res.json([...bookings, ...local]);
  } catch {
    return res.json(readLocal());
  }
});

router.post("/", rateLimit({ max: 8 }), async (req, res) => {
  const name = clip(req.body?.name, 120);
  const email = clip(req.body?.email, 160);
  const phone = clip(req.body?.phone, 40);
  const date = clip(req.body?.date, 40);
  const time = clip(req.body?.time, 40);
  if (!name || !email || !date || !time) {
    return res.status(400).json({ message: "Name, email, date and time are required." });
  }
  if (!isEmail(email)) {
    return res.status(400).json({ message: "Please enter a valid email address." });
  }

  const payload = {
    name,
    email,
    phone: phone || "",
    date,
    time,
    timezone: siteContent.booking.timezone,
  };

  let saved = null;
  try {
    if (mongoose.connection.readyState === 1) {
      saved = await Booking.create(payload);
    } else {
      saved = saveLocal({
        ...payload,
        id: crypto.randomUUID(),
        status: "pending",
        createdAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    return publicFail(res, 400, "Could not book this call. Please try again.", error);
  }

  let emailed = false;
  let nextWeekDate = "";
  try {
    const outcome = await sendBookingConfirmationEmail({
      to: email,
      name,
      date,
      time,
      timezone: payload.timezone,
    });
    emailed = outcome.emailed;
    nextWeekDate = outcome.letter?.nextWeekDate || "";
  } catch (error) {
    console.error("Booking confirmation email failed:", error.message);
  }

  return res.status(201).json({ ...(saved.toObject ? saved.toObject() : saved), emailed, nextWeekDate });
});

router.patch("/:id/status", requireAdmin, async (req, res) => {
  const { status } = req.body || {};
  if (!ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({ message: "Status must be pending, approved, or rejected." });
  }

  try {
    let updated = null;

    if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(req.params.id)) {
      updated = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true }).lean();
    }

    if (!updated) {
      const list = readLocal();
      const index = list.findIndex((item) => item.id === req.params.id);
      if (index !== -1) {
        list[index] = { ...list[index], status };
        writeLocal(list);
        updated = list[index];
      }
    }

    if (!updated) return res.status(404).json({ message: "Booking not found." });

    let emailed = false;
    if (status === "approved" || status === "rejected") {
      try {
        const sender = status === "approved" ? sendBookingApprovedEmail : sendBookingRejectedEmail;
        const outcome = await sender({
          to: updated.email,
          name: updated.name,
          date: updated.date,
          time: updated.time,
          timezone: updated.timezone,
        });
        emailed = outcome.emailed;
      } catch (error) {
        console.error("Booking status email failed:", error.message);
      }
    }

    return res.json({ ...updated, emailed });
  } catch (error) {
    return publicFail(res, 400, "Could not update this booking.", error);
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    let deleted = false;

    if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(req.params.id)) {
      const result = await Booking.findByIdAndDelete(req.params.id).lean();
      if (result) deleted = true;
    }

    const list = readLocal();
    const index = list.findIndex((item) => item.id === req.params.id);
    if (index !== -1) {
      list.splice(index, 1);
      writeLocal(list);
      deleted = true;
    }

    if (!deleted) return res.status(404).json({ message: "Booking not found." });
    return res.json({ message: "Booking deleted.", id: req.params.id });
  } catch (error) {
    return publicFail(res, 400, "Could not delete this booking.", error);
  }
});

export default router;
