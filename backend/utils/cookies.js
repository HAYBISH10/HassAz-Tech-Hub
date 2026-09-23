import { usesHttps } from "./env.js";

export const ADMIN_COOKIE = "hassaz_admin";
export const USER_COOKIE = "hassaz_user";

function parseCookies(header) {
  const out = {};
  for (const part of String(header || "").split(";")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    out[key] = decodeURIComponent(value);
  }
  return out;
}

export function readCookie(req, name) {
  return parseCookies(req.headers?.cookie)[name] || "";
}

export function setAuthCookie(res, name, token, expiresAt) {
  const maxAge = Math.max(0, Number(expiresAt) - Date.now());
  res.cookie(name, token, {
    httpOnly: true,
    secure: usesHttps(),
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}

export function clearAuthCookie(res, name) {
  res.clearCookie(name, {
    httpOnly: true,
    secure: usesHttps(),
    sameSite: "lax",
    path: "/",
  });
}
