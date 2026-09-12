import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import Setting from "../models/Setting.js";

const storePath = join(dirname(fileURLToPath(import.meta.url)), "../data/settings-store.json");
const KEY = "applicationsWindow";

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

export async function getWindowValue() {
  if (mongoose.connection.readyState === 1) {
    const doc = await Setting.findOne({ key: KEY }).lean();
    return doc?.value || {};
  }
  return readLocal();
}

export async function saveWindowValue(value) {
  if (mongoose.connection.readyState === 1) {
    await Setting.findOneAndUpdate({ key: KEY }, { key: KEY, value }, { upsert: true });
    return;
  }
  writeLocal(value);
}

export function computeWindowStatus(value) {
  // Strict, admin-controlled window: applications are CLOSED by default.
  // They are only open while "now" falls inside an explicit admin-set
  // window that has a start date (openAt) which has already been reached,
  // and — if a close date is set — has not yet passed. If the admin has
  // never set an opening date at all, applications stay closed forever
  // until they do.
  const now = new Date();
  const openAt = value.openAt ? new Date(value.openAt) : null;
  const closeAt = value.closeAt ? new Date(value.closeAt) : null;

  let isOpen = false;
  let reason = "not-yet-open"; // no window has been opened by admin yet

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
    allowRejectedReapply: value.allowRejectedReapply !== false,
    now: now.toISOString(),
  };
}

export async function getApplicationWindowStatus() {
  const value = await getWindowValue();
  return computeWindowStatus(value);
}
