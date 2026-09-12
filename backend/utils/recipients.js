import { dirname, join } from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import Application from "../models/Application.js";
import ContactMessage from "../models/ContactMessage.js";
import Enrollment from "../models/Enrollment.js";
import { flattenPrograms } from "../data/catalog.js";
import { getIntakeState } from "./intakes.js";
import { readJson } from "./localJson.js";
import { normalizeEmail } from "./names.js";
import { findUserById, listUsers } from "./usersRepo.js";

const dataDir = join(dirname(fileURLToPath(import.meta.url)), "../data");

function addRecipient(map, row) {
  const email = normalizeEmail(row.email);
  if (!email || !email.includes("@")) return;
  const current = map.get(email);
  const next = {
    email,
    fullName: String(row.fullName || current?.fullName || "").trim() || "Student",
    programSlug: row.programSlug || current?.programSlug || "",
    categorySlug: row.categorySlug || current?.categorySlug || "",
    programTitle: row.programTitle || current?.programTitle || "",
    modeId: row.modeId || current?.modeId || "",
    modeLabel: row.modeLabel || current?.modeLabel || "",
    cohort: row.cohort || current?.cohort || "",
    source: row.source || current?.source || "",
  };
  map.set(email, next);
}

async function readList(file, fallback = []) {
  return readJson(join(dataDir, file), fallback);
}

function offerFor(offers, programSlug, modeId) {
  if (!programSlug) return null;
  return (
    offers.find((item) => item.programSlug === programSlug && modeId && item.modeId === modeId) ||
    offers.find((item) => item.programSlug === programSlug) ||
    null
  );
}

export function matchesIntake(student, offer) {
  if (!offer || student.programSlug !== offer.programSlug) return false;
  if (offer.categorySlug && student.categorySlug && student.categorySlug !== offer.categorySlug) return false;
  if (student.modeId) return student.modeId === offer.modeId;
  if (offer.cohort && student.cohort) return student.cohort === offer.cohort;
  return true;
}

async function listEnrollments() {
  if (mongoose.connection.readyState === 1) {
    return (await Enrollment.find({ status: { $ne: "withdrawn" } }).lean()) || [];
  }
  return (await readList("enrollments-store.json")).filter((item) => item.status !== "withdrawn");
}

async function listApplications() {
  const local = await readList("applications-store.json");
  if (mongoose.connection.readyState === 1) {
    const rows = await Application.find({}).lean();
    return [...local, ...rows];
  }
  return local;
}

export async function listBroadcastRecords() {
  const [users, enrollments, applications, contactsLocal, intakeState] = await Promise.all([
    listUsers(),
    listEnrollments(),
    listApplications(),
    readList("contact-store.json"),
    getIntakeState().catch(() => ({ year: new Date().getFullYear(), offers: [] })),
  ]);
  const offers = intakeState.offers || [];
  const userById = new Map(users.map((user) => [String(user.id), user]));

  const registered = new Map();
  const everyone = new Map();

  for (const user of users) {
    addRecipient(everyone, {
      email: user.email || user.emailKey,
      fullName: user.fullName,
      source: "account",
    });
  }

  for (const row of enrollments) {
    const user = userById.get(String(row.userId)) || (await findUserById(row.userId));
    const offer = offerFor(offers, row.programSlug, row.modeId);
    const record = {
      email: user?.email || user?.emailKey,
      fullName: user?.fullName,
      programSlug: row.programSlug || "",
      categorySlug: row.categorySlug || "",
      programTitle: row.programTitle || "",
      modeId: row.modeId || "",
      modeLabel: offer?.label || "",
      cohort: offer?.cohort || "",
      source: "enrollment",
    };
    addRecipient(registered, record);
    addRecipient(everyone, record);
  }

  for (const app of applications) {
    const status = app.status || "Submitted";
    const offer = offerFor(offers, app.program?.programSlug, app.program?.modeId);
    const record = {
      email: app.contactInformation?.email || app.emailKey,
      fullName: app.personalInformation?.fullName || app.contactInformation?.fullName,
      programSlug: app.program?.programSlug || "",
      categorySlug: app.program?.categorySlug || "",
      programTitle: app.program?.program || "",
      modeId: app.program?.modeId || "",
      modeLabel: offer?.label || app.program?.mode || "",
      cohort: offer?.cohort || "",
      source: "application",
    };
    addRecipient(everyone, record);
    if (status !== "Rejected") addRecipient(registered, record);
  }

  const contacts = [...contactsLocal];
  if (mongoose.connection.readyState === 1) {
    contacts.push(...((await ContactMessage.find({}, { email: 1, fullName: 1 }).lean()) || []));
  }
  for (const item of contacts) {
    addRecipient(everyone, { email: item.email, fullName: item.fullName, source: "contact" });
  }

  return {
    all: [...everyone.values()],
    registered: [...registered.values()],
    offers,
    year: intakeState.year || new Date().getFullYear(),
  };
}

export function filterBroadcastRecords(records, filters = {}) {
  const intakeId = String(filters.intakeId || "").trim();
  if (intakeId) {
    const offer = records.offers.find((item) => String(item.id) === intakeId);
    if (!offer) return [];
    return records.registered.filter((item) => matchesIntake(item, offer));
  }
  const pool = filters.audience === "registered" || filters.audience === "intake" ? records.registered : records.all;
  const categorySlug = String(filters.categorySlug || "").trim();
  const programSlug = String(filters.programSlug || "").trim();
  const cohort = String(filters.cohort || "").trim();
  return pool.filter((item) => {
    if (categorySlug && item.categorySlug !== categorySlug) return false;
    if (programSlug && item.programSlug !== programSlug) return false;
    if (cohort && item.cohort !== cohort) return false;
    return true;
  });
}

export async function listStudentRecipients(filters = {}) {
  const records = await listBroadcastRecords();
  return filterBroadcastRecords(records, filters);
}

function publicStudent(item) {
  return {
    fullName: item.fullName,
    email: item.email,
    programTitle: item.programTitle || "",
    cohort: item.cohort || "",
    modeLabel: item.modeLabel || "",
    source: item.source || "",
  };
}

export async function broadcastPreview(filters = {}) {
  const records = await listBroadcastRecords();
  const scoped = Boolean(String(filters.intakeId || "").trim()) || String(filters.audience || "") === "all";
  const recipients = scoped ? filterBroadcastRecords(records, filters) : [];
  const programs = flattenPrograms();
  const programBySlug = new Map(programs.map((item) => [item.slug, item]));
  const intakes = (records.offers || [])
    .filter((offer) => offer.published !== false)
    .map((offer) => {
      const program = programBySlug.get(offer.programSlug);
      const count = records.registered.filter((item) => matchesIntake(item, offer)).length;
      return {
        id: String(offer.id),
        year: records.year,
        categorySlug: offer.categorySlug || program?.categorySlug || "",
        categoryTitle: program?.category || "",
        programSlug: offer.programSlug,
        programTitle: program?.title || offer.programSlug,
        cohort: offer.cohort || "Cohort 1",
        label: offer.label || "",
        startDate: offer.startDate || "",
        count,
      };
    })
    .sort((a, b) => a.categoryTitle.localeCompare(b.categoryTitle) || a.programTitle.localeCompare(b.programTitle));

  const selected = intakes.find((item) => item.id === String(filters.intakeId || "")) || null;

  return {
    year: records.year,
    count: recipients.length,
    audience: filters.intakeId ? "intake" : filters.audience || "all",
    selectedIntake: selected,
    intakes,
    students: recipients.map(publicStudent),
    sampleNames: recipients.slice(0, 8).map((item) => item.fullName),
  };
}
