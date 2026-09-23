import { Router } from "express";
import Inquiry from "../models/Inquiry.js";
import { rateLimit } from "../utils/rateLimit.js";
import { publicFail } from "../utils/httpErrors.js";
import { clip, isEmail } from "../utils/sanitize.js";

const router = Router();
const ROLES = new Set(["student", "parent", "professional", "partner", "other"]);

router.post("/", rateLimit({ max: 8 }), async (req, res) => {
  const body = req.body || {};
  const firstName = clip(body.firstName, 80);
  const lastName = clip(body.lastName, 80);
  const email = clip(body.email, 160).toLowerCase();
  const role = clip(body.role, 40).toLowerCase();
  const interests = Array.isArray(body.interests)
    ? body.interests.map((item) => clip(item, 80)).filter(Boolean).slice(0, 12)
    : [];

  if (!firstName || !email) {
    return res.status(400).json({ message: "Please enter your first name and email address." });
  }
  if (!isEmail(email)) {
    return res.status(400).json({ message: "Please enter a valid email address." });
  }

  try {
    await Inquiry.create({
      firstName,
      lastName,
      email,
      role: ROLES.has(role) ? role : clip(body.role, 40),
      interests,
    });
    return res.status(201).json({ ok: true });
  } catch (error) {
    return publicFail(res, 400, "Could not save your details. Please try again.", error);
  }
});

export default router;
