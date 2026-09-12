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

export async function getApplicationsWindow() {
  if (mongoose.connection.readyState === 1) {
    const doc = await Setting.findOne({ key: KEY }).lean();
    return doc?.value || {};
  }
  return readLocal();
}

export async function saveApplicationsWindow(value) {
  if (mongoose.connection.readyState === 1) {
    await Setting.findOneAndUpdate({ key: KEY }, { key: KEY, value }, { upsert: true });
    return;
  }
  writeLocal(value);
}

export function computeApplicationsWindowStatus(value) {
  const now = new Date();
  const openAt = value.openAt ? new Date(value.openAt) : null;
  const closeAt = value.closeAt ? new Date(value.closeAt) : null;

  let isOpen = true;
  let reason = "";
  if (openAt && now < openAt) {
    isOpen = false;
    reason = "not-yet-open";
  } else if (closeAt && now > closeAt) {
    isOpen = false;
    reason = "closed";
  }

  return {
    openAt: value.openAt || null,
    closeAt: value.closeAt || null,
    isOpen,
    reason,
    now: now.toISOString(),
  };
}

export async function getApplicationsWindowStatus() {
  const value = await getApplicationsWindow();
  return computeApplicationsWindowStatus(value);
}
