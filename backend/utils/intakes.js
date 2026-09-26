import crypto from "crypto";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import Setting from "../models/Setting.js";
import { catalog, flattenPrograms } from "../data/catalog.js";
import { readJson, writeJson } from "./localJson.js";

const storePath = join(dirname(fileURLToPath(import.meta.url)), "../data/intakes-store.json");
const KEY = "courseIntakes";
const DEFAULT_FEE = "Ksh 21,000";
const DEFAULT_MONTHLY = "Ksh 3,500";
const MAX_INSTALLMENT_MONTHS = 36;

function emptyState() {
  return { year: 2026, heading: "Intakes in progress", offers: [] };
}

function mongoReady() {
  return mongoose.connection.readyState === 1;
}

export async function getIntakeState() {
  let state = emptyState();
  if (mongoReady()) {
    const doc = await Setting.findOne({ key: KEY }).lean();
    if (doc?.value) state = { ...emptyState(), ...doc.value, offers: doc.value.offers || [] };
  } else {
    state = { ...emptyState(), ...readJson(storePath, emptyState()) };
  }
  const seeded = normalizeOffers(seedMissingOffers(state));
  const previousCount = (state.offers || []).length;
  const needsSave =
    seeded.offers.length !== previousCount ||
    seeded.offers.some((item, index) => {
      const prior = (state.offers || [])[index];
      return !prior || prior.fee !== item.fee || prior.monthlyFee !== item.monthlyFee;
    });
  if (needsSave) await saveIntakeState(seeded);
  return seeded;
}

export async function saveIntakeState(state) {
  const value = {
    year: Number(state.year) || new Date().getFullYear(),
    heading: state.heading || "Intakes in progress",
    offers: state.offers || [],
  };
  if (mongoReady()) {
    await Setting.findOneAndUpdate({ key: KEY }, { key: KEY, value }, { upsert: true });
    return value;
  }
  writeJson(storePath, value);
  return value;
}

function defaultOffer(program, mode) {
  return {
    id: crypto.randomUUID(),
    categorySlug: program.categorySlug,
    programSlug: program.slug,
    modeId: mode.id,
    label: mode.label,
    startDate: mode.startDate || "Upcoming intake",
    duration: mode.duration || "",
    schedule: mode.schedule || "",
    fee: DEFAULT_FEE,
    monthlyFee: DEFAULT_MONTHLY,
    cohort: "Cohort 1",
    published: true,
  };
}

function normalizeOffers(state) {
  return {
    ...state,
    offers: (state.offers || []).map((offer) => ({
      ...offer,
      fee: !offer.fee || offer.fee === "Ksh 20,000" ? DEFAULT_FEE : offer.fee,
      monthlyFee: offer.monthlyFee || DEFAULT_MONTHLY,
    })),
  };
}

function seedMissingOffers(state) {
  const programs = flattenPrograms(catalog);
  const existing = new Set((state.offers || []).map((item) => `${item.programSlug}::${item.modeId}`));
  const extras = [];
  for (const program of programs) {
    for (const mode of program.modes || []) {
      const key = `${program.slug}::${mode.id}`;
      if (existing.has(key)) continue;
      extras.push(defaultOffer(program, mode));
    }
  }
  if (!extras.length) return state;
  return { ...state, offers: [...(state.offers || []), ...extras] };
}

export function findOffer(state, id) {
  return (state.offers || []).find((item) => String(item.id) === String(id)) || null;
}

export function programContext(programSlug) {
  const program = flattenPrograms(catalog).find((item) => item.slug === programSlug);
  return program || null;
}

export function publicOffer(offer) {
  return {
    id: offer.id,
    categorySlug: offer.categorySlug,
    programSlug: offer.programSlug,
    modeId: offer.modeId,
    label: offer.label,
    startDate: offer.startDate,
    duration: offer.duration,
    schedule: offer.schedule,
    fee: offer.fee,
    monthlyFee: offer.monthlyFee || DEFAULT_MONTHLY,
    cohort: offer.cohort || "",
    published: offer.published !== false,
    brochureUrl: `/api/intakes/${offer.id}/brochure.pdf`,
    installmentsUrl: `/api/intakes/${offer.id}/installments.pdf`,
  };
}

export function parseKes(value) {
  const n = Number(String(value || "").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function formatKes(n) {
  return `Ksh ${Math.round(n).toLocaleString("en-KE")}`;
}

export function installmentSummary(offer) {
  const total = parseKes(offer.fee);
  const monthly = parseKes(offer.monthlyFee) || parseKes(DEFAULT_MONTHLY);
  if (!total || !monthly) {
    return { months: 0, monthly: 0, total: 0, lastAmount: 0 };
  }
  const months = Math.min(MAX_INSTALLMENT_MONTHS, Math.max(1, Math.ceil(total / monthly)));
  const lastAmount = Math.max(0, total - monthly * (months - 1));
  return { months, monthly, total, lastAmount };
}

export function installmentOptions(offer) {
  const plan = installmentSummary(offer);
  if (!plan.total) {
    return [
      {
        name: "Tuition payment",
        total: offer.fee || DEFAULT_FEE,
        note: "Tuition is confirmed during admissions. Contact HIACDI Tech Hub for the current intake plan.",
        rows: [],
      },
    ];
  }

  const monthlyRows = [];
  for (let month = 1; month <= plan.months; month += 1) {
    const amount = month === plan.months ? plan.lastAmount : plan.monthly;
    monthlyRows.push({
      payment: `Month ${month}`,
      due: month === 1 ? offer.startDate || "On or before class start" : `Start of month ${month}`,
      amount: formatKes(amount),
    });
  }

  return [
    {
      name: "Option 1: Pay in full",
      total: formatKes(plan.total),
      note: "Pay the full tuition in one payment before class begins.",
      rows: [{ payment: "Full tuition", due: offer.startDate || "Before class starts", amount: formatKes(plan.total) }],
    },
    {
      name: "Option 2: Monthly installment",
      total: formatKes(plan.total),
      note: `Pay ${formatKes(plan.monthly)} each month for ${plan.months} month${plan.months === 1 ? "" : "s"}. Total tuition is ${formatKes(plan.total)}.`,
      rows: monthlyRows,
    },
  ];
}
