import { Router } from "express";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import Graduate from "../models/Graduate.js";
import { seedGraduates } from "../data/graduates.js";
import { queueVerificationResultEmail, sendVerificationAdminEmail } from "../utils/mail.js";
import { certificateId, normalizeEmail, normalizeName } from "../utils/names.js";
import { readVerification } from "../utils/verificationTokens.js";
import { requireAdmin } from "../utils/auth.js";
import { rateLimit } from "../utils/rateLimit.js";

const storePath = join(dirname(fileURLToPath(import.meta.url)), "../data/graduates-store.json");
const router = Router();

// The graduate register is cached in memory and only re-read when the file
// changes on disk, so verification requests stay fast even back to back.
let localCache = { mtimeMs: 0, rows: null };

function readLocal() {
  if (!existsSync(storePath)) {
    writeLocal(seedGraduates);
    return seedGraduates;
  }
  try {
    const { mtimeMs } = statSync(storePath);
    if (localCache.rows && localCache.mtimeMs === mtimeMs) return localCache.rows;
    const rows = JSON.parse(readFileSync(storePath, "utf8") || "[]");
    const result = rows.length ? rows : seedGraduates;
    localCache = { mtimeMs, rows: result };
    return result;
  } catch {
    return seedGraduates;
  }
}

function writeLocal(list) {
  const dir = dirname(storePath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(storePath, JSON.stringify(list, null, 2));
  try {
    localCache = { mtimeMs: statSync(storePath).mtimeMs, rows: list };
  } catch {
    localCache = { mtimeMs: 0, rows: list };
  }
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
    res.status(400).json({ message: "Could not load graduates." });
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
    return res.status(400).json({ message: "Could not save graduate." });
  }
});

router.post("/verify", rateLimit({ max: 80, windowMs: 15 * 60 * 1000 }), async (req, res) => {
  const fullName = String(req.body.fullName || "").trim();
  const email = String(req.body.email || "").trim();
  const cert = String(req.body.certificateId || "").trim();

  if (!fullName || !email) {
    return res.status(400).json({ message: "Full name and email are required.", verified: false });
  }

  try {
    const list = await allGraduates();
    const match = findMatch(list, fullName, email, cert);

    // The student receives the result by email as well. It is queued in the
    // background so the on-page answer stays instant even when many certificates
    // are verified one after another. Staff get a separate notification.
    queueVerificationResultEmail({
      to: email,
      verified: Boolean(match),
      fullName,
      holderName: match?.fullName,
      program: match?.program,
      certificateId: match?.certificateId || cert,
    });
    sendVerificationAdminEmail({
      fullName,
      email,
      certificateId: cert,
      verified: Boolean(match),
      program: match?.program,
    }).catch(() => {});

    if (!match) {
      return res.json({ verified: false, message: "Certificate Verification Failed.", emailed: true });
    }
    return res.json({
      verified: true,
      message: "Certificate Verified Successfully",
      emailed: true,
      certificate: {
        fullName: match.fullName,
        program: match.program,
        details: match.details || "",
        certificateId: match.certificateId,
      },
    });
  } catch (error) {
    console.error("Verification error:", error);
    return res.status(400).json({ message: "Could not complete verification. Please try again.", verified: false });
  }
});

router.get("/verify/confirm/:token", rateLimit({ max: 60 }), async (req, res) => {
  const data = readVerification(req.params.token);
  if (!data) {
    return res.status(400).json({ verified: false, message: "This verification link is invalid." });
  }
  if (data.expired) {
    return res.json({ verified: false, expired: true, message: "This verification link has expired. Please submit the verification form again to receive a new link." });
  }

  try {
    const list = await allGraduates();
    const match = findMatch(list, data.fullName, data.email, data.certificateId);
    if (!match) {
      return res.json({ verified: false, message: "Certificate Verification Failed." });
    }
    return res.json({
      verified: true,
      message: "Certificate Verified Successfully",
      certificate: {
        fullName: match.fullName,
        program: match.program,
        details: match.details || "",
        certificateId: match.certificateId,
      },
    });
  } catch (error) {
    console.error("Verification confirm error:", error);
    return res.status(400).json({ verified: false, message: "Could not complete verification. Please try again." });
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
    return res.status(400).json({ message: "Could not delete this graduate." });
  }
});

export default router;
