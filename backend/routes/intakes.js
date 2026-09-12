import crypto from "crypto";
import { Router } from "express";
import { requireAdmin } from "../utils/auth.js";
import { streamBrochurePdf, streamInstallmentsPdf } from "../utils/brochures.js";
import {
  findOffer,
  getIntakeState,
  programContext,
  publicOffer,
  saveIntakeState,
} from "../utils/intakes.js";

const router = Router();

function sanitizeOffer(body, current = {}) {
  const text = (value, fallback = "") => {
    if (value === undefined || value === null) return fallback;
    return String(value).trim().slice(0, 400);
  };
  return {
    id: current.id || crypto.randomUUID(),
    categorySlug: text(body.categorySlug, current.categorySlug),
    programSlug: text(body.programSlug, current.programSlug),
    modeId: text(body.modeId, current.modeId || `mode-${Date.now()}`),
    label: text(body.label, current.label || "Learning mode"),
    startDate: text(body.startDate, current.startDate || "Upcoming intake"),
    duration: text(body.duration, current.duration),
    schedule: text(body.schedule, current.schedule),
    fee: text(body.fee, current.fee || "Ksh 21,000"),
    monthlyFee: text(body.monthlyFee, current.monthlyFee || "Ksh 3,500"),
    cohort: text(body.cohort, current.cohort || "Cohort 1"),
    published: body.published === undefined ? current.published !== false : Boolean(body.published),
  };
}

router.get("/", async (_req, res) => {
  try {
    const state = await getIntakeState();
    res.json({
      year: state.year,
      heading: state.heading,
      offers: state.offers.filter((item) => item.published !== false).map(publicOffer),
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/admin", requireAdmin, async (_req, res) => {
  try {
    const state = await getIntakeState();
    res.json({
      year: state.year,
      heading: state.heading,
      offers: state.offers.map(publicOffer),
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put("/settings", requireAdmin, async (req, res) => {
  try {
    const state = await getIntakeState();
    const year = Number(req.body.year);
    state.year = Number.isFinite(year) && year >= 2020 ? year : state.year;
    if (req.body.heading !== undefined) state.heading = String(req.body.heading || "Intakes in progress").slice(0, 80);
    const saved = await saveIntakeState(state);
    res.json({ year: saved.year, heading: saved.heading });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/", requireAdmin, async (req, res) => {
  try {
    const state = await getIntakeState();
    const offer = sanitizeOffer(req.body);
    if (!offer.programSlug || !offer.categorySlug) {
      return res.status(400).json({ message: "Choose a course before adding a learning mode." });
    }
    state.offers.push(offer);
    await saveIntakeState(state);
    res.status(201).json(publicOffer(offer));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const state = await getIntakeState();
    const index = state.offers.findIndex((item) => String(item.id) === String(req.params.id));
    if (index === -1) return res.status(404).json({ message: "Intake offer not found." });
    state.offers[index] = sanitizeOffer(req.body, state.offers[index]);
    await saveIntakeState(state);
    res.json(publicOffer(state.offers[index]));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const state = await getIntakeState();
    const next = state.offers.filter((item) => String(item.id) !== String(req.params.id));
    if (next.length === state.offers.length) return res.status(404).json({ message: "Intake offer not found." });
    state.offers = next;
    await saveIntakeState(state);
    res.json({ ok: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

async function pdfContext(id) {
  const state = await getIntakeState();
  const offer = findOffer(state, id);
  if (!offer || offer.published === false) return null;
  const program = programContext(offer.programSlug);
  if (!program) return null;
  return { offer, program, categoryTitle: program.category, year: state.year };
}

router.get("/:id/brochure.pdf", async (req, res) => {
  try {
    const ctx = await pdfContext(req.params.id);
    if (!ctx) return res.status(404).json({ message: "Brochure not found." });
    streamBrochurePdf(ctx, res);
  } catch (error) {
    if (!res.headersSent) res.status(400).json({ message: error.message });
  }
});

router.get("/:id/brochure", async (req, res) => {
  try {
    const ctx = await pdfContext(req.params.id);
    if (!ctx) return res.status(404).json({ message: "Brochure not found." });
    streamBrochurePdf(ctx, res);
  } catch (error) {
    if (!res.headersSent) res.status(400).json({ message: error.message });
  }
});

router.get("/:id/installments.pdf", async (req, res) => {
  try {
    const ctx = await pdfContext(req.params.id);
    if (!ctx) return res.status(404).json({ message: "Payment guide not found." });
    streamInstallmentsPdf(ctx, res);
  } catch (error) {
    if (!res.headersSent) res.status(400).json({ message: error.message });
  }
});

router.get("/:id/installments", async (req, res) => {
  try {
    const ctx = await pdfContext(req.params.id);
    if (!ctx) return res.status(404).json({ message: "Payment guide not found." });
    streamInstallmentsPdf(ctx, res);
  } catch (error) {
    if (!res.headersSent) res.status(400).json({ message: error.message });
  }
});

export default router;
