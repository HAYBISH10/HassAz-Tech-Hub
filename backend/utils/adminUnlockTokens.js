import crypto from "crypto";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { readJson, writeJson } from "./localJson.js";

const storePath = join(dirname(fileURLToPath(import.meta.url)), "../data/admin-unlock-tokens.json");

function emptyStore() {
  return { tokens: [] };
}

function readStore() {
  const stored = readJson(storePath, emptyStore());
  return { tokens: Array.isArray(stored.tokens) ? stored.tokens : [] };
}

function writeStore(store) {
  writeJson(storePath, store);
}

export function normalizeUnlockToken(value) {
  return String(value || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

function makeCode() {
  const raw = crypto.randomBytes(6).toString("hex").toUpperCase();
  return `HIACDI-${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}`;
}

function masterUnlockToken() {
  return normalizeUnlockToken(process.env.ADMIN_UNLOCK_TOKEN || "");
}

export function listUnlockTokens() {
  return readStore().tokens.map((item) => ({
    id: item.id,
    code: item.usedAt ? "" : item.code,
    label: item.label || "Staff unlock",
    createdAt: item.createdAt,
    usedAt: item.usedAt || null,
  }));
}

export function createUnlockToken(label = "") {
  const store = readStore();
  const token = {
    id: crypto.randomUUID(),
    code: makeCode(),
    label: String(label || "Staff unlock").trim().slice(0, 80) || "Staff unlock",
    createdAt: new Date().toISOString(),
    usedAt: null,
  };
  store.tokens.unshift(token);
  writeStore(store);
  return { id: token.id, code: token.code, label: token.label, createdAt: token.createdAt, usedAt: null };
}

export function deleteUnlockToken(id) {
  const store = readStore();
  const next = store.tokens.filter((item) => item.id !== id);
  if (next.length === store.tokens.length) return false;
  writeStore({ tokens: next });
  return true;
}

export function consumeUnlockToken(rawCode) {
  const code = normalizeUnlockToken(rawCode);
  if (!code) return false;

  const master = masterUnlockToken();
  if (master && code === master) return true;

  const store = readStore();
  const found = store.tokens.find((item) => !item.usedAt && normalizeUnlockToken(item.code) === code);
  if (!found) return false;
  found.usedAt = new Date().toISOString();
  writeStore(store);
  return true;
}
