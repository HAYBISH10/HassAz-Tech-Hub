import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { readJson, writeJson } from "./localJson.js";

const storePath = join(dirname(fileURLToPath(import.meta.url)), "../data/admin-login-lock.json");
export const ADMIN_LOGIN_MAX_FAILS = 4;

function emptyLock() {
  return { fails: 0, locked: false, lockedAt: null };
}

export function readAdminLoginLock() {
  const stored = readJson(storePath, emptyLock());
  return {
    fails: Number(stored.fails || 0),
    locked: Boolean(stored.locked),
    lockedAt: stored.lockedAt || null,
  };
}

export function writeAdminLoginLock(next) {
  writeJson(storePath, {
    fails: Number(next.fails || 0),
    locked: Boolean(next.locked),
    lockedAt: next.lockedAt || null,
  });
}

export function clearAdminLoginLock() {
  writeAdminLoginLock(emptyLock());
}

export function recordAdminLoginFailure() {
  const current = readAdminLoginLock();
  const fails = current.fails + 1;
  const locked = fails >= ADMIN_LOGIN_MAX_FAILS;
  writeAdminLoginLock({
    fails,
    locked,
    lockedAt: locked ? new Date().toISOString() : null,
  });
  return { fails, locked, remaining: Math.max(0, ADMIN_LOGIN_MAX_FAILS - fails) };
}
