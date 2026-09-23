import crypto from "crypto";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { Router } from "express";
import mongoose from "mongoose";
import Enrollment from "../models/Enrollment.js";
import { catalog } from "../data/catalog.js";
import { resolveCourseWindow, getWindowValue } from "../utils/applicationWindow.js";
import { readJson, writeJson } from "../utils/localJson.js";
import { requireUser } from "../utils/userAuth.js";
import { findUserById } from "../utils/usersRepo.js";
import { sendEnrollmentEmail } from "../utils/mail.js";

const router = Router();
const storePath = join(dirname(fileURLToPath(import.meta.url)), "../data/enrollments-store.json");

function findProgram(categorySlug, programSlug) {
  const category = catalog.find((item) => item.slug === categorySlug);
  const program = category?.programs.find((item) => item.slug === programSlug);
  if (!category || !program) return null;
  return { category, program };
}

function withId(row) {
  return { ...row, id: String(row.id || row._id) };
}

async function listForUser(userId) {
  if (mongoose.connection.readyState === 1) {
    return (await Enrollment.find({ userId, status: "registered" }).sort({ createdAt: -1 }).lean()).map(withId);
  }
  return readJson(storePath, []).filter((item) => item.userId === userId && item.status !== "withdrawn");
}

router.get("/me", requireUser, async (req, res) => {
  res.json(await listForUser(req.userId));
});

router.post("/", requireUser, async (req, res) => {
  const user = await findUserById(req.userId);
  if (!user) return res.status(401).json({ message: "Please sign in to continue." });

  const categorySlug = String(req.body?.categorySlug || "").trim();
  const programSlug = String(req.body?.programSlug || "").trim();
  const windowStatus = resolveCourseWindow(await getWindowValue(), categorySlug, programSlug);
  if (!windowStatus.isOpen) {
    return res.status(403).json({
      message: "This course is not open for registration. Kindly contact the Academic Director for HassAz Tech Hub.",
      window: { isOpen: false, reason: windowStatus.reason || "" },
    });
  }

  const modeId = String(req.body?.modeId || "").trim();
  const match = findProgram(categorySlug, programSlug);
  if (!match) return res.status(404).json({ message: "That course was not found." });

  const existing = (await listForUser(req.userId)).find((item) => item.programSlug === programSlug);
  if (existing) {
    return res.status(409).json({
      title: "Already registered",
      message: "You are already registered for this course.",
    });
  }

  const payload = {
    userId: req.userId,
    categorySlug,
    programSlug,
    programTitle: match.program.title,
    categoryTitle: match.category.title,
    modeId,
    status: "registered",
  };

  try {
    let saved;
    if (mongoose.connection.readyState === 1) {
      saved = withId((await Enrollment.create(payload)).toObject());
    } else {
      const list = readJson(storePath, []);
      saved = { ...payload, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
      list.unshift(saved);
      writeJson(storePath, list);
    }
    sendEnrollmentEmail({ to: user.email, fullName: user.fullName, programTitle: match.program.title }).catch(() => {});
    return res.status(201).json({
      ...saved,
      title: "Registration Successful",
      message: "You have successfully registered for this course. A confirmation has been sent to your email.",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        title: "Already registered",
        message: "You are already registered for this course.",
      });
    }
    return res.status(400).json({ message: "Could not register for this course." });
  }
});

export default router;
