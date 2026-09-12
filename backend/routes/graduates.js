import { Router } from "express";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import Graduate from "../models/Graduate.js";
import { seedGraduates } from "../data/graduates.js";
import { sendVerificationResultEmail } from "../utils/mail.js";
import { certificateId, normalizeEmail, normalizeName } from "../utils/names.js";
import { requireAdmin } from "../utils/auth.js";

const storePath = join(dirname(fileURLToPath(import.meta.url)), "../data/graduates-store.json");
const router = Router();

function readLocal() {
  if (!existsSync(storePath)) {
    writeLocal(seedGraduates);
    return seedGraduates;
  }
  try {
    const rows = JSON.parse(readFileSync(storePath, "utf8") || "[]");
    return rows.length ? rows : seedGraduates;
  } catch {
    return seedGraduates;
  }
}

function writeLocal(list) {
  const dir = dirname(storePath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(storePath, JSON.stringify(list, null, 2));
}

async function allGraduates() {
  if (mongoose.connection.readyState === 1) {
    let rows = await Graduate.find().sort({ awardedAt: -1 }).lean();
    if (!rows.length) {
      await Graduate.insertMany(seedGraduates);
      rows = await Graduate.find().sort({ awardedAt: -1 }).lean();
    }
    return rows;
  }
  return readLocal();
}

function tokensCover(longer, shorter) {
  const extra = String(longer || "").split(" ").filter(Boolean);
  const needed = String(shorter || "").split(" ").filter(Boolean);
  return needed.length > 0 && needed.every((token) => extra.includes(token));
}

function nameMatches(item, nameKey) {
  const keys = [item.nameKey, ...(item.aliases || []).map(normalizeName)].filter(Boolean);
  return keys.some((key) => key === nameKey || tokensCover(nameKey, key) || tokensCover(key, nameKey));
}

function findMatch(list, fullName, email, cert) {
  const nameKey = normalizeName(fullName);
  const emailKey = normalizeEmail(email);
  return list.find((item) => {
    const awarded = item.awarded !== false;
    const emailOk = item.emailKey === emailKey;
    const certOk = !cert || item.certificateId === cert;
    return awarded && emailOk && certOk && nameMatches(item, nameKey);
  });
}

router.get("/", requireAdmin, async (_req, res) => {
  try {
    res.json(await allGraduates());
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/", requireAdmin, async (req, res) => {
  const fullName = String(req.body.fullName || "").trim();
  const email = normalizeEmail(req.body.email);
  const program = String(req.body.program || "").trim();
  const details = String(req.body.details || "").trim();
  if (!fullName || !email || !program) {
    return res.status(400).json({ message: "Full name, email, and program are required." });
  }

  const record = {
    certificateId: certificateId(),
    fullName,
    email,
    nameKey: normalizeName(fullName),
    emailKey: email,
    program,
    details,
    categorySlug: String(req.body.categorySlug || "").trim(),
    programSlug: String(req.body.programSlug || "").trim(),
    awarded: true,
  };

  try {
    if (mongoose.connection.readyState === 1) {
      const created = await Graduate.create(record);
      return res.status(201).json(created);
    }
    const list = readLocal();
    if (list.some((item) => item.nameKey === record.nameKey && item.emailKey === record.emailKey)) {
      return res.status(400).json({ message: "This graduate is already registered." });
    }
    list.unshift(record);
    writeLocal(list);
    return res.status(201).json(record);
  } catch (error) {
    return res.status(400).json({ message: error.message || "Could not save graduate." });
  }
});

router.post("/verify", async (req, res) => {
  const fullName = String(req.body.fullName || "").trim();
  const email = String(req.body.email || "").trim();
  const cert = String(req.body.certificateId || "").trim();

  if (!fullName || !email) {
    return res.status(400).json({ message: "Full name and email are required.", ok: false });
  }

  try {
    const list = await allGraduates();
    const match = findMatch(list, fullName, email, cert);

    if (!match) {
      // No matching graduate record: notify whoever submitted the form that this could not be
      // verified, without exposing any graduate/certificate details.
      const mail = await sendVerificationResultEmail({ to: email, verified: false });
      return res.json({ ok: false, emailed: mail.emailed, message: mail.letter.text });
    }

    // Match found: notify the registered graduate email that verification succeeded — again,
    // without echoing certificate/program details back in the response or the email body.
    const mail = await sendVerificationResultEmail({
      to: match.email,
      verified: true,
      fullName: match.fullName,
      program: match.program,
    });

    return res.json({ ok: true, emailed: mail.emailed, message: mail.letter.text });
  } catch (error) {
    return res.status(400).json({ message: error.message, ok: false });
  }
});

router.delete("/:certificateId", requireAdmin, async (req, res) => {
  try {
    let deleted = false;
    if (mongoose.connection.readyState === 1) {
      const result = await Graduate.findOneAndDelete({ certificateId: req.params.certificateId }).lean();
      if (result) deleted = true;
    }

    const list = readLocal();
    const index = list.findIndex((item) => item.certificateId === req.params.certificateId);
    if (index !== -1) {
      list.splice(index, 1);
      writeLocal(list);
      deleted = true;
    }

    if (!deleted) return res.status(404).json({ message: "Graduate record not found." });
    return res.json({ message: "Graduate deleted.", certificateId: req.params.certificateId });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

export default router;
