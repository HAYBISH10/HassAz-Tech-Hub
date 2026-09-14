import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import Setting from "../models/Setting.js";
import { catalog } from "../data/catalog.js";

const storePath = join(dirname(fileURLToPath(import.meta.url)), "../data/settings-store.json");
const KEY = "applicationsWindow";

export const INTAKE_MONTHS = [0, 5, 11];
export const INTAKE_NAMES = ["January", "June", "December"];
export const COHORT_OPTIONS = ["Cohort 1", "Cohort 2", "Cohort 3"];

function slugPart(value) {
  return (
    String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || ""
  );
}

export function monthFromName(name) {
  const index = INTAKE_NAMES.findIndex((item) => item.toLowerCase() === String(name || "").trim().toLowerCase());
  return index >= 0 ? INTAKE_MONTHS[index] : null;
}

export function cohortForMonth(month) {
  if (Number(month) === 0) return "Cohort 1";
  if (Number(month) === 5) return "Cohort 2";
  if (Number(month) === 11) return "Cohort 3";
  return "Cohort 1";
}

function cleanText(value) {
  return String(value || "").trim();
}

function readLocal() {
  if (!existsSync(storePath)) return {};
  try {
    return JSON.parse(readFileSync(storePath, "utf8") || "{}");
  } catch {
    return {};
  }
}

function writeLocal(value) {
  const dir = dirname(storePath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(storePath, JSON.stringify(value, null, 2));
}

function isoOrNull(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function parseIntakeMonth(value) {
  return INTAKE_MONTHS.includes(Number(value)) ? Number(value) : null;
}

function parseIntakeYear(value) {
  const year = Number(value);
  return Number.isInteger(year) && year >= 2000 && year <= 2100 ? year : null;
}

function asWindow(value = {}) {
  const intakeName = cleanText(value.intakeName);
  const cohort = cleanText(value.cohort);
  const month = parseIntakeMonth(value.intakeMonth) ?? monthFromName(intakeName);
  return {
    openAt: isoOrNull(value.openAt),
    closeAt: isoOrNull(value.closeAt),
    intakeMonth: month,
    intakeYear: parseIntakeYear(value.intakeYear),
    intakeName: intakeName || (month != null ? INTAKE_NAMES[INTAKE_MONTHS.indexOf(month)] : ""),
    cohort,
  };
}

export function hasIntake(value = {}) {
  const year = parseIntakeYear(value.intakeYear);
  const month = parseIntakeMonth(value.intakeMonth) ?? monthFromName(value.intakeName);
  return year !== null && (month !== null || Boolean(cleanText(value.intakeName)));
}

export function normalizeWindowValue(value = {}) {
  const areas = {};
  const courses = {};
  for (const [slug, window] of Object.entries(value.areas || {})) {
    if (!slug) continue;
    areas[slug] = asWindow(window);
  }
  for (const [slug, window] of Object.entries(value.courses || {})) {
    if (!slug) continue;
    courses[slug] = asWindow(window);
  }
  return {
    openAt: isoOrNull(value.openAt),
    closeAt: isoOrNull(value.closeAt),
    allowRejectedReapply: value.allowRejectedReapply !== false,
    intakeMonth: parseIntakeMonth(value.intakeMonth) ?? monthFromName(value.intakeName),
    intakeYear: parseIntakeYear(value.intakeYear),
    intakeName: cleanText(value.intakeName) || (INTAKE_NAMES[INTAKE_MONTHS.indexOf(parseIntakeMonth(value.intakeMonth))] || ""),
    cohort: cleanText(value.cohort),
    areas,
    courses,
  };
}

export async function getWindowValue() {
  let raw = {};
  if (mongoose.connection.readyState === 1) {
    const doc = await Setting.findOne({ key: KEY }).lean();
    raw = doc?.value || {};
  } else {
    raw = readLocal();
  }
  return normalizeWindowValue(raw);
}

export async function saveWindowValue(value) {
  const next = normalizeWindowValue(value);
  if (mongoose.connection.readyState === 1) {
    await Setting.findOneAndUpdate({ key: KEY }, { key: KEY, value: next }, { upsert: true });
    return next;
  }
  writeLocal(next);
  return next;
}

export function computeWindowStatus(value = {}) {
  const now = new Date();
  const openAt = value.openAt ? new Date(value.openAt) : null;
  const closeAt = value.closeAt ? new Date(value.closeAt) : null;

  let isOpen = false;
  let reason = "not-yet-open";

  if (openAt && now >= openAt) {
    if (closeAt && now > closeAt) {
      isOpen = false;
      reason = "closed";
    } else {
      isOpen = true;
      reason = "";
    }
  } else if (openAt && now < openAt) {
    isOpen = false;
    reason = "not-yet-open";
  }

  return {
    openAt: value.openAt || null,
    closeAt: value.closeAt || null,
    isOpen,
    reason,
    now: now.toISOString(),
  };
}

export function intakeKey(year, month, name = "", cohort = "") {
  const stamp = Number(year) || new Date().getFullYear();
  const cohortPart = slugPart(cohort);
  if (INTAKE_MONTHS.includes(Number(month))) {
    const base = `${stamp}-${String(Number(month) + 1).padStart(2, "0")}`;
    return cohortPart ? `${base}-${cohortPart}` : base;
  }
  const namePart = slugPart(name) || "intake";
  return cohortPart ? `${stamp}-${namePart}-${cohortPart}` : `${stamp}-${namePart}`;
}

export function describeIntake({ year, month, name, cohort } = {}) {
  const intakeMonth = INTAKE_MONTHS.includes(month) ? month : monthFromName(name);
  const intakeName = name || (intakeMonth != null ? INTAKE_NAMES[INTAKE_MONTHS.indexOf(intakeMonth)] : "Intake");
  const intakeYear = Number(year) || new Date().getFullYear();
  const cohortName = cleanText(cohort) || cohortForMonth(intakeMonth);
  const label = `${cohortName} · ${intakeName} ${intakeYear}`;
  return {
    name: intakeName,
    cohort: cohortName,
    month: intakeMonth,
    year: intakeYear,
    key: intakeKey(intakeYear, intakeMonth, intakeName, cohortName),
    label,
    cohortLabel: label,
  };
}

export function plannedCohorts(from = new Date(), pastYears = 1, futureYears = 2) {
  const startYear = from.getFullYear() - pastYears;
  const endYear = from.getFullYear() + futureYears;
  const list = [];
  for (let year = startYear; year <= endYear; year += 1) {
    for (const month of INTAKE_MONTHS) {
      list.push(describeIntake({ month, year }));
    }
  }
  return list;
}

export function windowIntake(value = {}, fallback = {}) {
  if (hasIntake(value)) return currentIntake(value);
  if (hasIntake(fallback)) return currentIntake(fallback);
  return currentIntake(fallback);
}

/** Map an application date onto January, June, or December. */
export function intakeFromDate(date = new Date()) {
  const stamp = date instanceof Date ? date : new Date(date);
  const safe = Number.isNaN(stamp.getTime()) ? new Date() : stamp;
  const month = safe.getMonth();
  const year = safe.getFullYear();
  if (month <= 3) return describeIntake({ name: "January", month: 0, year });
  if (month <= 7) return describeIntake({ name: "June", month: 5, year });
  return describeIntake({ name: "December", month: 11, year });
}

export function currentIntake(value = {}) {
  if (hasIntake(value)) {
    return describeIntake({
      month: Number(value.intakeMonth),
      year: Number(value.intakeYear),
      name: value.intakeName,
      cohort: value.cohort,
    });
  }
  return intakeFromDate();
}

export function matchesCohortFilters(app, filters = {}) {
  const year = filters.intakeYear || filters.year;
  const name = filters.intakeName || filters.monthName;
  const cohort = filters.intakeCohort || filters.cohort;
  if (year && Number(app.intakeYear || app.intake?.year) !== Number(year)) return false;
  if (name && String(app.intakeName || app.intake?.name || "").toLowerCase() !== String(name).toLowerCase()) {
    return false;
  }
  if (
    cohort &&
    String(app.intakeCohort || app.intake?.cohort || "").toLowerCase() !== String(cohort).toLowerCase()
  ) {
    return false;
  }
  return true;
}

export function withApplicationIntake(app, windowValue) {
  if (!app) return app;
  if (app.intakeKey && app.intakeName && app.intakeYear) {
    const intake = describeIntake({
      name: app.intakeName,
      month: INTAKE_MONTHS[INTAKE_NAMES.indexOf(app.intakeName)] ?? monthFromName(app.intakeName),
      year: app.intakeYear,
      cohort: app.intakeCohort || app.intake?.cohort,
    });
    return {
      ...app,
      intakeCohort: app.intakeCohort || intake.cohort,
      intake,
    };
  }
  const derived = app.submittedAt ? intakeFromDate(app.submittedAt) : currentIntake(windowValue);
  return {
    ...app,
    intakeName: derived.name,
    intakeYear: derived.year,
    intakeKey: derived.key,
    intakeCohort: derived.cohort,
    intake: derived,
  };
}

function soonestClosed(windows) {
  const upcoming = windows
    .filter((item) => item?.reason === "not-yet-open" && item.openAt)
    .sort((a, b) => new Date(a.openAt) - new Date(b.openAt));
  if (upcoming[0]) return upcoming[0];
  const closed = windows
    .filter((item) => item?.reason === "closed" && item.closeAt)
    .sort((a, b) => new Date(b.closeAt) - new Date(a.closeAt));
  return closed[0] || windows[0] || computeWindowStatus({});
}

export function resolveCourseWindow(value, categorySlug = "", programSlug = "") {
  const stored = normalizeWindowValue(value);
  const global = { ...computeWindowStatus(stored), scope: "all", scopeLabel: "All courses" };
  const areaStored = categorySlug ? stored.areas[categorySlug] || {} : {};
  const courseStored = programSlug ? stored.courses[programSlug] || {} : {};
  const area = categorySlug
    ? {
        ...computeWindowStatus(areaStored),
        scope: "area",
        scopeLabel: catalog.find((item) => item.slug === categorySlug)?.title || categorySlug,
      }
    : null;
  const course = programSlug
    ? {
        ...computeWindowStatus(courseStored),
        scope: "course",
        scopeLabel:
          catalog.flatMap((item) => item.programs).find((item) => item.slug === programSlug)?.title ||
          programSlug,
      }
    : null;

  const intake = hasIntake(courseStored)
    ? currentIntake(courseStored)
    : hasIntake(areaStored)
      ? currentIntake(areaStored)
      : currentIntake(stored);

  let picked;
  if (global.isOpen) picked = global;
  else if (course?.isOpen) picked = course;
  else if (area?.isOpen) picked = area;
  else {
    picked = {
      ...soonestClosed([course, area, global].filter(Boolean)),
      scope: course?.openAt ? "course" : area?.openAt ? "area" : "all",
      scopeLabel: course?.openAt ? course.scopeLabel : area?.openAt ? area.scopeLabel : "All courses",
    };
  }

  return {
    ...picked,
    intake,
    intakeMonth: intake.month,
    intakeYear: intake.year,
    intakeName: intake.name,
    cohort: intake.cohort,
    cohortLabel: intake.cohortLabel,
  };
}

export function anyWindowOpen(value) {
  const stored = normalizeWindowValue(value);
  if (computeWindowStatus(stored).isOpen) return true;
  if (Object.values(stored.areas).some((item) => computeWindowStatus(item).isOpen)) return true;
  if (Object.values(stored.courses).some((item) => computeWindowStatus(item).isOpen)) return true;
  return false;
}

function withStoredIntake(status, storedWindow, fallbackIntake = null) {
  const intake = hasIntake(storedWindow) ? currentIntake(storedWindow) : fallbackIntake;
  return {
    ...status,
    intakeMonth: storedWindow.intakeMonth ?? null,
    intakeYear: storedWindow.intakeYear ?? null,
    intakeName: storedWindow.intakeName || intake?.name || "",
    cohort: storedWindow.cohort || intake?.cohort || "",
    intake,
    cohortLabel: intake?.cohortLabel || "",
  };
}

function catalogWindows(stored) {
  const global = computeWindowStatus(stored);
  return catalog.map((category) => {
    const areaStored = stored.areas[category.slug] || {};
    const area = withStoredIntake(computeWindowStatus(areaStored), areaStored);
    return {
      slug: category.slug,
      title: category.title,
      ...area,
      resolvedOpen: global.isOpen || area.isOpen,
      courses: category.programs.map((program) => {
        const courseStored = stored.courses[program.slug] || {};
        const course = withStoredIntake(computeWindowStatus(courseStored), courseStored, area.intake);
        return {
          slug: program.slug,
          title: program.title,
          categorySlug: category.slug,
          ...course,
          resolvedOpen: global.isOpen || area.isOpen || course.isOpen,
        };
      }),
    };
  });
}

function displayDeadline(catalogView, global) {
  const items = [{ ...global, title: "All courses" }];
  for (const area of catalogView) {
    items.push(area);
    for (const course of area.courses) {
      items.push({ ...course, title: `${area.title} · ${course.title}` });
    }
  }
  const open = items.filter((item) => item.isOpen);
  if (open.length) {
    const closing = open
      .filter((item) => item.closeAt)
      .sort((a, b) => new Date(a.closeAt) - new Date(b.closeAt));
    const chosen = closing[0] || open[0];
    return {
      isOpen: true,
      openAt: chosen.openAt || null,
      closeAt: chosen.closeAt || null,
      reason: "",
      title: chosen.title || "Applications",
    };
  }
  const upcoming = items
    .filter((item) => item.reason === "not-yet-open" && item.openAt)
    .sort((a, b) => new Date(a.openAt) - new Date(b.openAt));
  if (upcoming[0]) {
    return {
      isOpen: false,
      openAt: upcoming[0].openAt,
      closeAt: upcoming[0].closeAt || null,
      reason: "not-yet-open",
      title: upcoming[0].title || "Applications",
    };
  }
  return {
    isOpen: false,
    openAt: global.openAt || null,
    closeAt: global.closeAt || null,
    reason: global.reason || "closed",
    title: "All courses",
  };
}

export function presentWindow(value, { categorySlug = "", programSlug = "" } = {}) {
  const stored = normalizeWindowValue(value);
  const global = computeWindowStatus(stored);
  const catalogView = catalogWindows(stored);
  const openAreas = catalogView.filter((item) => item.isOpen).map((item) => item.title);
  const openCourses = catalogView.flatMap((item) => item.courses.filter((course) => course.isOpen).map((course) => course.title));
  const resolved =
    categorySlug || programSlug ? resolveCourseWindow(stored, categorySlug, programSlug) : null;
  const anyOpen = anyWindowOpen(stored);
  const savedWindows = [];
  for (const area of catalogView) {
    if (area.openAt || area.closeAt || hasIntake(area)) {
      savedWindows.push({
        scope: "area",
        slug: area.slug,
        title: area.title,
        openAt: area.openAt,
        closeAt: area.closeAt,
        isOpen: area.isOpen,
        cohortLabel: area.cohortLabel || "",
      });
    }
    for (const course of area.courses) {
      if (course.openAt || course.closeAt || hasIntake(course)) {
        savedWindows.push({
          scope: "course",
          slug: course.slug,
          categorySlug: area.slug,
          title: `${area.title} · ${course.title}`,
          openAt: course.openAt,
          closeAt: course.closeAt,
          isOpen: course.isOpen,
          cohortLabel: course.cohortLabel || "",
        });
      }
    }
  }

  const globalIntake = currentIntake(stored);
  return {
    ...global,
    isOpen: resolved ? resolved.isOpen : anyOpen,
    globalOpen: global.isOpen,
    anyOpen,
    allowRejectedReapply: stored.allowRejectedReapply !== false,
    intake: globalIntake,
    intakeMonth: stored.intakeMonth,
    intakeYear: stored.intakeYear,
    intakeName: stored.intakeName || globalIntake.name,
    cohort: stored.cohort || globalIntake.cohort,
    catalog: catalogView,
    openSummary: {
      global: global.isOpen,
      areas: openAreas,
      courses: openCourses,
    },
    savedWindows,
    displayDeadline: displayDeadline(catalogView, global),
    resolved,
    now: new Date().toISOString(),
  };
}

export async function getApplicationWindowStatus(categorySlug = "", programSlug = "") {
  const value = await getWindowValue();
  if (categorySlug || programSlug) {
    const resolved = resolveCourseWindow(value, categorySlug, programSlug);
    return {
      ...resolved,
      allowRejectedReapply: value.allowRejectedReapply !== false,
      anyOpen: anyWindowOpen(value),
      globalOpen: computeWindowStatus(value).isOpen,
    };
  }
  const presented = presentWindow(value);
  return {
    ...presented,
    isOpen: presented.anyOpen,
  };
}

export async function getPresentedWindow(query = {}) {
  const value = await getWindowValue();
  return presentWindow(value, {
    categorySlug: String(query.category || query.categorySlug || "").trim(),
    programSlug: String(query.program || query.programSlug || "").trim(),
  });
}
