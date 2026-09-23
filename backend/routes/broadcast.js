import { Router } from "express";
import { requireAdmin } from "../utils/auth.js";
import { rateLimit } from "../utils/rateLimit.js";
import { sendBroadcastEmail } from "../utils/mail.js";
import { broadcastPreview, listStudentRecipients } from "../utils/recipients.js";

const router = Router();
const FLYER_CID = "hassazflyer";

function parseFlyer(value) {
  const text = String(value || "").trim();
  const match = text.match(/^data:(image\/(?:jpeg|jpg|png|webp|gif));base64,([A-Za-z0-9+/=\s]+)$/i);
  if (!match) return null;
  const content = Buffer.from(match[2].replace(/\s/g, ""), "base64");
  if (!content.length || content.length > 450000) {
    const error = new Error("Please use a smaller flyer image (under 400 KB after compression).");
    error.status = 400;
    throw error;
  }
  const contentType = match[1].toLowerCase() === "image/jpg" ? "image/jpeg" : match[1].toLowerCase();
  return {
    filename: contentType.includes("png") ? "flyer.png" : "flyer.jpg",
    content,
    cid: FLYER_CID,
    contentType,
    contentDisposition: "inline",
  };
}

function filtersFrom(input = {}) {
  const audience = String(input.audience || "cohort").trim();
  const allowed = ["registered", "intake", "cohort", "all"];
  return {
    audience: allowed.includes(audience) ? audience : "cohort",
    categorySlug: String(input.categorySlug || "").trim(),
    programSlug: String(input.programSlug || "").trim(),
    cohort: String(input.cohort || input.intakeCohort || "").trim(),
    intakeCohort: String(input.intakeCohort || input.cohort || "").trim(),
    intakeName: String(input.intakeName || "").trim(),
    intakeYear: String(input.intakeYear || input.year || "").trim(),
    year: String(input.year || input.intakeYear || "").trim(),
    intakeId: String(input.intakeId || "").trim(),
    kind: String(input.kind || "announcement").trim(),
  };
}

router.get("/recipients", requireAdmin, async (req, res) => {
  try {
    res.json(await broadcastPreview(filtersFrom(req.query)));
  } catch (error) {
    res.status(400).json({ message: "Could not load recipients." });
  }
});

router.post(
  "/",
  requireAdmin,
  rateLimit({
    max: 12,
    windowMs: 60 * 60 * 1000,
    message: "Please wait before sending another broadcast.",
  }),
  async (req, res) => {
    const subject = String(req.body?.subject || "").trim();
    const message = String(req.body?.message || "").trim();
    if (!subject || !message) {
      return res.status(400).json({ message: "Subject and message are required." });
    }

    let flyer = null;
    try {
      flyer = parseFlyer(req.body?.flyer);
    } catch (error) {
      return res.status(error.status || 400).json({ message: error.message });
    }

    const filters = filtersFrom(req.body);
    const recipients = await listStudentRecipients(filters);
    if (!recipients.length) {
      return res.status(400).json({
        message:
          filters.intakeId || filters.audience === "registered" || filters.audience === "intake"
            ? "No students are registered for that intake yet."
            : "There are no student email addresses to send to yet.",
      });
    }

    let sent = 0;
    let failed = 0;
    for (const student of recipients) {
      const result = await sendBroadcastEmail({
        to: student.email,
        fullName: student.fullName,
        subject,
        message,
        flyer,
        programTitle: student.programTitle,
        kind: filters.kind,
      });
      if (result.emailed) sent += 1;
      else failed += 1;
    }

    const who = filters.intakeId
      ? `student${recipients.length === 1 ? "" : "s"} on this intake`
      : filters.cohort || filters.intakeName || filters.intakeYear
        ? `student${recipients.length === 1 ? "" : "s"} in this cohort`
        : `student${recipients.length === 1 ? "" : "s"}`;
    return res.json({
      ok: true,
      count: recipients.length,
      sent,
      failed,
      message: `Announcement sent to ${recipients.length} ${who}.`,
    });
  }
);

export default router;
