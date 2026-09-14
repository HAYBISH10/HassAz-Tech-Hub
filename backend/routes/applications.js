import { Router } from "express";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import Application from "../models/Application.js";
import { buildApplicationsWorkbook, streamApplicationsPdf } from "../utils/exports.js";
import { requireAdmin } from "../utils/auth.js";
import { normalizeEmail, normalizePhone } from "../utils/names.js";
import {
  sendApplicationApprovedEmail,
  sendApplicationReceivedEmail,
  sendApplicationRejectedEmail,
  sendDuplicateApplicationEmail,
} from "../utils/mail.js";
import {
  currentIntake,
  getWindowValue,
  resolveCourseWindow,
  withApplicationIntake,
} from "../utils/applicationWindow.js";
import { requireUser } from "../utils/userAuth.js";
import { rateLimit } from "../utils/rateLimit.js";
import { findUserById } from "../utils/usersRepo.js";
import { catalog } from "../data/catalog.js";

function applicationMatchesFilters(app, categorySlug, programSlug, intakeKey) {
  const cat = String(categorySlug || "").trim();
  const prog = String(programSlug || "").trim();
  const intake = String(intakeKey || "").trim();
  if (intake && String(app.intakeKey || app.intake?.key || "") !== intake) return false;
  if (!cat && !prog) return true;

  const storedCat = app.program?.categorySlug || "";
  const storedProg = app.program?.programSlug || "";
  const courseTitle = String(app.program?.program || app.program?.title || "").toLowerCase();
  const areaName = String(app.program?.category || "").toLowerCase();

  if (cat) {
    const category = catalog.find((item) => item.slug === cat);
    const areaOk =
      storedCat === cat ||
      (category && areaName === String(category.title).toLowerCase()) ||
      (category &&
        category.programs.some((item) => {
          const title = String(item.title).toLowerCase();
          return title && (courseTitle === title || courseTitle.includes(title));
        }));
    if (!areaOk) return false;
  }
  if (prog) {
    const program = catalog.flatMap((item) => item.programs).find((item) => item.slug === prog);
    const title = String(program?.title || "").toLowerCase();
    const courseOk =
      storedProg === prog || (title && (courseTitle === title || courseTitle.includes(title)));
    if (!courseOk) return false;
  }
  return true;
}

const ALLOWED_STATUSES = ["Submitted", "Under Review", "Accepted", "Enrolled", "Completed", "Rejected"];

const storePath = join(dirname(fileURLToPath(import.meta.url)), "../data/applications-store.json");
const router = Router();

function applicationNumber() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `HAZ-${stamp}-${rand}`;
}

function readLocal() {
  if (!existsSync(storePath)) return [];
  try {
    return JSON.parse(readFileSync(storePath, "utf8") || "[]");
  } catch {
    return [];
  }
}

function writeLocal(list) {
  const dir = dirname(storePath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(storePath, JSON.stringify(list, null, 2));
}

function saveLocal(record) {
  const current = readLocal();
  current.push(record);
  writeLocal(current);
}

function withState(app) {
  if (!app) return app;
  return { ...app, state: app.state === "Closed" ? "Closed" : "Open" };
}

function sortNewest(a, b) {
  return new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0);
}

async function allApplications() {
  const local = readLocal().map(withState);
  let mongo = [];
  if (mongoose.connection.readyState === 1) {
    try {
      mongo = (await Application.find().sort({ submittedAt: -1 }).lean()).map(withState);
    } catch {
      mongo = [];
    }
  }

  const seen = new Set();
  const merged = [];
  for (const app of [...mongo, ...local]) {
    const key = app.applicationNumber;
    if (key && seen.has(key)) continue;
    if (key) seen.add(key);
    merged.push(app);
  }
  return merged.sort(sortNewest).map((app) => withApplicationIntake(app));
}

function findDuplicate(existingApps, incoming, { allowRejectedReapply = true } = {}) {
  const email = normalizeEmail(incoming?.contactInformation?.email || incoming?.email);
  const phone = normalizePhone(incoming?.contactInformation?.phone || incoming?.phone);
  if (!email && !phone) return null;

  for (const app of existingApps) {
    const existingEmail = normalizeEmail(app.contactInformation?.email || app.emailKey);
    const existingPhone = normalizePhone(app.contactInformation?.phone || app.phoneKey);
    const matched = [];
    if (email && existingEmail === email) matched.push("email");
    if (phone && existingPhone === phone) matched.push("phone");
    if (!matched.length) continue;
    if (allowRejectedReapply && app.status === "Rejected") continue;
    return { app, matched };
  }
  return null;
}

router.get("/", requireAdmin, async (_req, res) => {
  try {
    return res.json(await allApplications());
  } catch {
    return res.json(readLocal().map(withState));
  }
});

router.get("/mine", requireUser, async (req, res) => {
  const apps = await allApplications();
  res.json(apps.filter((app) => String(app.userId || "") === String(req.userId)));
});

router.get("/export/excel", requireAdmin, async (req, res) => {
  try {
    const categorySlug = String(req.query.categorySlug || "").trim();
    const programSlug = String(req.query.programSlug || "").trim();
    const intakeKey = String(req.query.intakeKey || "").trim();
    const apps = (await allApplications()).filter((app) =>
      applicationMatchesFilters(app, categorySlug, programSlug, intakeKey)
    );
    const category = catalog.find((item) => item.slug === categorySlug);
    const program = catalog.flatMap((item) => item.programs || []).find((item) => item.slug === programSlug);
    const workbook = await buildApplicationsWorkbook(apps, {
      groupByArea: !categorySlug && !programSlug,
      sheetLabel: program?.title || category?.title || "Applications",
    });
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="hassaz-applications-${Date.now()}.xlsx"`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/export/pdf", requireAdmin, async (req, res) => {
  try {
    const categorySlug = String(req.query.categorySlug || "").trim();
    const programSlug = String(req.query.programSlug || "").trim();
    const intakeKey = String(req.query.intakeKey || "").trim();
    const apps = (await allApplications()).filter((app) =>
      applicationMatchesFilters(app, categorySlug, programSlug, intakeKey)
    );
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="hassaz-applications-${Date.now()}.pdf"`);
    await streamApplicationsPdf(apps, res);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/:applicationNumber/export/excel", requireAdmin, async (req, res) => {
  try {
    const apps = await allApplications();
    const found = apps.find((item) => item.applicationNumber === req.params.applicationNumber);
    if (!found) return res.status(404).json({ message: "Application not found." });
    const workbook = await buildApplicationsWorkbook([found], { groupByArea: false, sheetLabel: "Application" });
    const safeName = String(found.personalInformation?.fullName || found.applicationNumber)
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="hassaz-applicant-${safeName || found.applicationNumber}.xlsx"`
    );
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.patch("/:applicationNumber/status", requireAdmin, async (req, res) => {
  const status = req.body.status;
  if (!ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({ message: "Invalid status." });
  }

  const isDecision = status === "Accepted" || status === "Rejected";
  const patch = { status, ...(isDecision ? { state: "Closed", reviewedAt: new Date() } : {}) };

  try {
    let updated = null;
    if (mongoose.connection.readyState === 1) {
      updated = await Application.findOneAndUpdate(
        { applicationNumber: req.params.applicationNumber },
        patch,
        { new: true }
      ).lean();
    }

    if (!updated) {
      const list = readLocal();
      const index = list.findIndex((item) => item.applicationNumber === req.params.applicationNumber);
      if (index === -1) return res.status(404).json({ message: "Application not found." });
      list[index] = { ...list[index], ...patch };
      writeLocal(list);
      updated = list[index];
    }

    const fullName = updated.personalInformation?.fullName || "Applicant";
    const email = updated.contactInformation?.email;
    const program = updated.program?.program || "your selected program";

    let emailed = false;
    if (email && status === "Accepted") {
      const outcome = await sendApplicationApprovedEmail({
        to: email,
        fullName,
        program,
        appliedAt: updated.submittedAt,
      });
      emailed = outcome.emailed;
    } else if (email && status === "Rejected") {
      const outcome = await sendApplicationRejectedEmail({ to: email, fullName, program });
      emailed = outcome.emailed;
    }

    return res.json({ ...withState(updated), emailed });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.patch("/:applicationNumber", requireAdmin, async (req, res) => {
  const state = req.body.state === "Closed" ? "Closed" : "Open";
  const reviewedAt = state === "Closed" ? new Date() : null;

  try {
    if (mongoose.connection.readyState === 1) {
      const updated = await Application.findOneAndUpdate(
        { applicationNumber: req.params.applicationNumber },
        { state, reviewedAt },
        { new: true }
      ).lean();
      if (updated) return res.json(withState(updated));
    }

    const list = readLocal();
    const index = list.findIndex((item) => item.applicationNumber === req.params.applicationNumber);
    if (index === -1) return res.status(404).json({ message: "Application not found." });
    list[index] = { ...list[index], state, reviewedAt };
    writeLocal(list);
    return res.json(withState(list[index]));
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.delete("/:applicationNumber", requireAdmin, async (req, res) => {
  try {
    let deleted = false;
    if (mongoose.connection.readyState === 1) {
      const result = await Application.findOneAndDelete({
        applicationNumber: req.params.applicationNumber,
      }).lean();
      if (result) deleted = true;
    }

    const list = readLocal();
    const index = list.findIndex((item) => item.applicationNumber === req.params.applicationNumber);
    if (index !== -1) {
      list.splice(index, 1);
      writeLocal(list);
      deleted = true;
    }

    if (!deleted) return res.status(404).json({ message: "Application not found." });
    return res.json({ message: "Applicant deleted.", applicationNumber: req.params.applicationNumber });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.get("/:applicationNumber", requireAdmin, async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const found = await Application.findOne({ applicationNumber: req.params.applicationNumber }).lean();
      if (found) return res.json(withState(found));
    }
    const local = readLocal().find((item) => item.applicationNumber === req.params.applicationNumber);
    if (local) return res.json(withState(local));
    return res.status(404).json({ message: "Application not found." });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

async function notifyApplicationReceived(application) {
  const email = application?.contactInformation?.email;
  if (!email) return;
  const fullName = application.personalInformation?.fullName || "Applicant";
  const program = application.program?.program || "your selected program";
  try {
    await sendApplicationReceivedEmail({
      to: email,
      fullName,
      program,
      applicationNumber: application.applicationNumber,
    });
  } catch (error) {
    console.error("Application received email failed:", error.message);
  }
}

router.post("/", requireUser, rateLimit({ max: 5, message: "Too many application attempts. Please wait a few minutes." }), async (req, res) => {
  const user = await findUserById(req.userId);
  if (!user) {
    return res.status(401).json({
      title: "Sign in required",
      message: "Please create an account or log in before registering for a course.",
    });
  }

  const body = req.body || {};
  const email = normalizeEmail(body.contactInformation?.email || user.email);
  const phone = normalizePhone(body.contactInformation?.phone || user.phone);
  const fullName = String(body.personalInformation?.fullName || user.fullName || "").trim();
  const incoming = {
    ...body,
    personalInformation: { ...(body.personalInformation || {}), fullName },
    contactInformation: { ...(body.contactInformation || {}), email, phone: body.contactInformation?.phone || user.phone },
  };

  let rules = {};
  let windowStatus = null;
  try {
    rules = await getWindowValue();
    const categorySlug = String(body.program?.categorySlug || body.categorySlug || "").trim();
    const programSlug = String(body.program?.programSlug || body.programSlug || "").trim();
    windowStatus = resolveCourseWindow(rules, categorySlug, programSlug);
    if (!windowStatus.isOpen) {
      return res.status(403).json({
        message: "No application windows that are open, Kindly Contact Academic Director For HassAz Tech Hub",
      });
    }
  } catch {
    return res.status(503).json({
      message: "Applications are temporarily unavailable. Please try again shortly.",
    });
  }

  try {
    const allowRejectedReapply = rules.allowRejectedReapply !== false;
    const existingApps = await allApplications();
    const duplicate = findDuplicate(existingApps, incoming, { allowRejectedReapply });
    if (duplicate) {
      const statusLabel =
        duplicate.app.status === "Accepted"
          ? "Approved"
          : duplicate.app.status === "Rejected"
            ? "Rejected"
            : duplicate.app.status === "Submitted"
              ? "Pending"
              : duplicate.app.status || "Pending";
      sendDuplicateApplicationEmail({
        to: email || user.email,
        fullName,
        applicationNumber: duplicate.app.applicationNumber,
        status: statusLabel,
      }).catch(() => {});
      return res.status(409).json({
        title: "Application Already Exists",
        message:
          "An application using this email address or phone number already exists. Kindly wait for a response regarding your previous application.",
        applicationNumber: duplicate.app.applicationNumber,
        status: duplicate.app.status || "Submitted",
        statusLabel,
      });
    }
  } catch (error) {
    console.error("Duplicate application check failed:", error.message);
  }

  const intake = windowStatus?.intake || currentIntake(rules);
  const payload = {
    ...incoming,
    applicationNumber: applicationNumber(),
    status: "Submitted",
    state: "Open",
    userId: req.userId,
    emailKey: email,
    phoneKey: phone,
    intakeName: intake.name,
    intakeYear: intake.year,
    intakeKey: intake.key,
    intakeCohort: intake.cohort,
    intake,
  };

  try {
    if (mongoose.connection.readyState === 1) {
      const created = await Application.create(payload);
      notifyApplicationReceived(created);
      return res.status(201).json(created);
    }
    saveLocal(payload);
    notifyApplicationReceived(payload);
    return res.status(201).json(payload);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        title: "Application Already Exists",
        message:
          "An application using this email address or phone number already exists. Kindly wait for a response regarding your previous application.",
      });
    }
    try {
      saveLocal(payload);
      notifyApplicationReceived(payload);
      return res.status(201).json(payload);
    } catch {
      return res.status(400).json({ message: error.message || "Could not save application." });
    }
  }
});

export default router;
