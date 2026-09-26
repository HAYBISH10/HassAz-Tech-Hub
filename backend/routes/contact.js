import crypto from "crypto";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { Router } from "express";
import mongoose from "mongoose";
import ContactMessage from "../models/ContactMessage.js";
import { requireAdmin } from "../utils/auth.js";
import { readJson, writeJson } from "../utils/localJson.js";
import { rateLimit } from "../utils/rateLimit.js";
import { sendContactAcknowledgementEmail, sendContactDecisionEmail, sendMail } from "../utils/mail.js";
import { clip, isEmail } from "../utils/sanitize.js";

const storePath = join(dirname(fileURLToPath(import.meta.url)), "../data/contact-store.json");
const router = Router();
const notifyTo = process.env.CONTACT_NOTIFY_EMAIL || "hiacditechhub@gmail.com";
const STATUSES = ["unread", "read", "resolved", "approved", "rejected"];

function withId(row) {
  return { ...row, id: String(row.id || row._id || ""), status: row.status || "unread" };
}

async function allMessages() {
  if (mongoose.connection.readyState === 1) {
    return (await ContactMessage.find().sort({ createdAt: -1 }).lean()).map(withId);
  }
  return readJson(storePath, []).map(withId);
}

function findLocalIndex(list, id) {
  return list.findIndex((item) => String(item.id) === String(id));
}

router.get("/", requireAdmin, async (_req, res) => {
  const messages = await allMessages();
  res.json({
    messages,
    unreadCount: messages.filter((item) => item.status === "unread").length,
  });
});

router.patch("/:id/status", requireAdmin, async (req, res) => {
  const status = req.body?.status;
  if (!STATUSES.includes(status)) {
    return res.status(400).json({ message: "Status must be unread, approved, or rejected." });
  }

  try {
    let updated = null;
    if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(req.params.id)) {
      updated = await ContactMessage.findByIdAndUpdate(req.params.id, { status }, { new: true }).lean();
      if (updated) updated = withId(updated);
    }
    if (!updated) {
      const list = readJson(storePath, []);
      const index = findLocalIndex(list, req.params.id);
      if (index === -1) return res.status(404).json({ message: "Message not found." });
      list[index] = { ...list[index], status };
      writeJson(storePath, list);
      updated = withId(list[index]);
    }

    if (status === "approved" || status === "rejected") {
      sendContactDecisionEmail({
        to: updated.email,
        fullName: updated.fullName,
        subject: updated.subject,
        approved: status === "approved",
      }).catch(() => {});
    }
    return res.json(updated);
  } catch (error) {
    return res.status(400).json({ message: "Could not update this message." });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(req.params.id)) {
      const removed = await ContactMessage.findByIdAndDelete(req.params.id).lean();
      if (removed) return res.json({ ok: true, id: String(removed._id) });
    }
    const list = readJson(storePath, []);
    const index = findLocalIndex(list, req.params.id);
    if (index === -1) return res.status(404).json({ message: "Message not found." });
    const [removed] = list.splice(index, 1);
    writeJson(storePath, list);
    return res.json({ ok: true, id: String(removed.id) });
  } catch {
    return res.status(400).json({ message: "Could not delete this message." });
  }
});

router.post("/", rateLimit({ max: 8 }), async (req, res) => {
  const body = req.body || {};
  const fullName = clip(body.fullName, 120);
  const email = clip(body.email, 160);
  const phone = clip(body.phone, 40);
  const subject = clip(body.subject, 160);
  const message = clip(body.message, 4000);

  if (!fullName || !email || !phone || !subject || !message) {
    return res.status(400).json({ message: "Please complete all fields before submitting the form." });
  }
  if (!isEmail(email)) {
    return res.status(400).json({ message: "Please enter a valid email address." });
  }

  const record = {
    fullName,
    email,
    phone,
    subject,
    message,
    status: "unread",
    createdAt: new Date().toISOString(),
  };

  try {
    if (mongoose.connection.readyState === 1) {
      await ContactMessage.create(record);
    } else {
      writeJson(storePath, [{ ...record, id: crypto.randomUUID() }, ...readJson(storePath, [])]);
    }
  } catch {
    writeJson(storePath, [{ ...record, id: crypto.randomUUID() }, ...readJson(storePath, [])]);
  }

  sendMail({
    to: notifyTo,
    subject: `New contact message: ${subject}`,
    text: [`Full name: ${fullName}`, `Email: ${email}`, `Phone: ${phone}`, `Subject: ${subject}`, "", message].join("\n"),
  }).catch(() => {});

  const ack = await sendContactAcknowledgementEmail({ to: email, fullName, subject });
  return res.status(201).json({ ok: true, emailed: ack.emailed });
});

export default router;
