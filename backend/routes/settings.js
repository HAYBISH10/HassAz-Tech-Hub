import { Router } from "express";
import { requireAdmin } from "../utils/auth.js";
import { rateLimit } from "../utils/rateLimit.js";
import {
  getPresentedWindow,
  getWindowValue,
  normalizeWindowValue,
  presentWindow,
  saveWindowValue,
} from "../utils/applicationWindow.js";

const router = Router();

function readDate(body, key, fallback) {
  if (body[key] === undefined) return fallback;
  if (!body[key]) return null;
  const date = new Date(body[key]);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toISOString();
}

function readIntakeField(body, key, fallback) {
  if (body[key] === undefined) return fallback ?? null;
  if (body[key] === "" || body[key] === null) return null;
  const value = Number(body[key]);
  return Number.isFinite(value) ? value : fallback ?? null;
}

function readText(body, key, fallback = "") {
  if (body[key] === undefined) return fallback || "";
  return String(body[key] || "").trim();
}

function scopedWindow(body, previous = {}) {
  const intakeName = readText(body, "intakeName", previous.intakeName);
  const cohort = readText(body, "cohort", previous.cohort);
  let intakeMonth = readIntakeField(body, "intakeMonth", previous.intakeMonth);
  if (body.intakeName !== undefined) {
    const named = ["January", "June", "December"].indexOf(intakeName);
    if (named >= 0) intakeMonth = [0, 5, 11][named];
  }
  return {
    openAt: readDate(body, "openAt", previous.openAt || null),
    closeAt: readDate(body, "closeAt", previous.closeAt || null),
    intakeMonth,
    intakeYear: readIntakeField(body, "intakeYear", previous.intakeYear),
    intakeName,
    cohort,
  };
}

router.get("/applications", async (req, res) => {
  try {
    res.json(await getPresentedWindow(req.query));
  } catch {
    res.status(400).json({ message: "Could not load application windows." });
  }
});

router.put("/applications", requireAdmin, rateLimit({ max: 40, windowMs: 15 * 60 * 1000 }), async (req, res) => {
  try {
    const current = await getWindowValue();
    const body = req.body || {};
    const scope = String(body.scope || "all");
    const slug = String(body.slug || "").trim();
    const next = normalizeWindowValue(current);

    if (body.allowRejectedReapply !== undefined) {
      next.allowRejectedReapply = Boolean(body.allowRejectedReapply);
    }
    if (scope === "all" || scope === "intake") {
      if (body.intakeMonth !== undefined || body.intakeYear !== undefined || body.intakeName !== undefined || body.cohort !== undefined) {
        next.intakeMonth = readIntakeField(body, "intakeMonth", next.intakeMonth);
        next.intakeYear = readIntakeField(body, "intakeYear", next.intakeYear);
        if (body.intakeName !== undefined) next.intakeName = readText(body, "intakeName", next.intakeName);
        if (body.cohort !== undefined) next.cohort = readText(body, "cohort", next.cohort);
        const named = ["January", "June", "December"].indexOf(next.intakeName);
        if (named >= 0) next.intakeMonth = [0, 5, 11][named];
      }
    }

    if (body.delete) {
      if (scope === "area" && slug) delete next.areas[slug];
      else if (scope === "course" && slug) delete next.courses[slug];
      else if (scope === "all") {
        next.openAt = null;
        next.closeAt = null;
      }
    } else if (scope === "area" && slug) {
      next.areas[slug] = scopedWindow(body, next.areas[slug] || {});
    } else if (scope === "course" && slug) {
      next.courses[slug] = scopedWindow(body, next.courses[slug] || {});
    } else if (scope !== "intake") {
      next.openAt = readDate(body, "openAt", next.openAt);
      next.closeAt = readDate(body, "closeAt", next.closeAt);
    }

    await saveWindowValue(next);
    res.json(presentWindow(next, {
      categorySlug: String(req.query.category || "").trim(),
      programSlug: String(req.query.program || "").trim(),
    }));
  } catch {
    res.status(400).json({ message: "Could not update application windows." });
  }
});

export default router;
