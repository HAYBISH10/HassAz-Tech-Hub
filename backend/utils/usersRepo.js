import crypto from "crypto";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import User from "../models/User.js";
import PasswordReset from "../models/PasswordReset.js";
import { readJson, writeJson } from "./localJson.js";
import { normalizeEmail, normalizePhone } from "./names.js";

const usersPath = join(dirname(fileURLToPath(import.meta.url)), "../data/users-store.json");
const resetsPath = join(dirname(fileURLToPath(import.meta.url)), "../data/resets-store.json");

function mongoReady() {
  return mongoose.connection.readyState === 1;
}

export function withId(record) {
  if (!record) return record;
  return { ...record, id: String(record.id || record._id) };
}

export async function listUsers() {
  if (mongoReady()) {
    return (await User.find().sort({ createdAt: -1 }).lean()).map(withId);
  }
  return readJson(usersPath, []);
}

export async function findUserByEmail(email) {
  const emailKey = normalizeEmail(email);
  if (!emailKey) return null;
  if (mongoReady()) {
    const found = await User.findOne({ emailKey }).lean();
    return found ? withId(found) : null;
  }
  return readJson(usersPath, []).find((item) => item.emailKey === emailKey) || null;
}

export async function findUserById(id) {
  if (!id) return null;
  if (mongoReady() && mongoose.isValidObjectId(id)) {
    const found = await User.findById(id).lean();
    return found ? withId(found) : null;
  }
  return readJson(usersPath, []).find((item) => String(item.id) === String(id)) || null;
}

export async function findUserByGoogleId(googleId) {
  if (!googleId) return null;
  if (mongoReady()) {
    const found = await User.findOne({ googleId }).lean();
    return found ? withId(found) : null;
  }
  return readJson(usersPath, []).find((item) => item.googleId === googleId) || null;
}

export async function createUser(record) {
  const emailKey = normalizeEmail(record.email);
  const phoneKey = normalizePhone(record.phone);
  const payload = {
    ...record,
    email: emailKey,
    emailKey,
    phone: String(record.phone || "").trim(),
    phoneKey,
  };

  if (mongoReady()) {
    const created = await User.create(payload);
    return withId(created.toObject());
  }

  const list = readJson(usersPath, []);
  if (list.some((item) => item.emailKey === emailKey)) {
    const error = new Error("duplicate-email");
    error.code = "DUPLICATE_EMAIL";
    throw error;
  }
  const saved = { ...payload, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  list.unshift(saved);
  writeJson(usersPath, list);
  return saved;
}

export async function updateUser(id, patch) {
  if (mongoReady() && mongoose.isValidObjectId(id)) {
    const updated = await User.findByIdAndUpdate(id, patch, { new: true }).lean();
    return updated ? withId(updated) : null;
  }
  const list = readJson(usersPath, []);
  const index = list.findIndex((item) => String(item.id) === String(id));
  if (index === -1) return null;
  list[index] = { ...list[index], ...patch };
  writeJson(usersPath, list);
  return list[index];
}

export function hashResetToken(token) {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

export async function createResetToken(emailKey) {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashResetToken(token);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  const record = { emailKey, tokenHash, expiresAt: expiresAt.toISOString(), usedAt: null };

  if (mongoReady()) {
    await PasswordReset.create({ emailKey, tokenHash, expiresAt, usedAt: null });
  } else {
    const list = readJson(resetsPath, []);
    list.push(record);
    writeJson(resetsPath, list);
  }
  return { token, expiresAt };
}

export async function consumeResetToken(token) {
  const tokenHash = hashResetToken(token);
  const now = new Date();

  if (mongoReady()) {
    const found = await PasswordReset.findOne({ tokenHash }).lean();
    if (!found || found.usedAt || new Date(found.expiresAt) < now) return null;
    await PasswordReset.updateOne({ _id: found._id }, { usedAt: now });
    return found;
  }

  const list = readJson(resetsPath, []);
  const index = list.findIndex((item) => item.tokenHash === tokenHash);
  if (index === -1) return null;
  const found = list[index];
  if (found.usedAt || new Date(found.expiresAt) < now) return null;
  list[index] = { ...found, usedAt: now.toISOString() };
  writeJson(resetsPath, list);
  return found;
}
