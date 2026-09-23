import crypto from "crypto";
import { sessionSecret } from "./env.js";

export const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;
const revoked = new Map();

function sha(value) {
  return crypto.createHash("sha256").update(String(value)).digest("hex");
}

function safeEqual(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  if (a.length !== b.length) {
    crypto.timingSafeEqual(a, Buffer.alloc(a.length));
    return false;
  }
  return crypto.timingSafeEqual(a, b);
}

export function signToken(kind, subject) {
  const exp = Date.now() + TOKEN_TTL_MS;
  const payload = Buffer.from(JSON.stringify({ k: kind, s: String(subject), exp })).toString("base64url");
  const sig = crypto.createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
  return { token: `${payload}.${sig}`, expiresAt: exp };
}

export function verifyToken(token, kind) {
  if (!token || typeof token !== "string" || token.length > 800) return null;
  if (revoked.has(sha(token))) return null;
  const dot = token.indexOf(".");
  if (dot < 1) return null;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = crypto.createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
  if (!safeEqual(sig, expected)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (data.k !== kind || !data.exp || Date.now() > Number(data.exp)) return null;
    return { kind: data.k, subject: String(data.s || ""), expiresAt: Number(data.exp) };
  } catch {
    return null;
  }
}

export function revokeToken(token) {
  if (!token) return;
  revoked.set(sha(token), Date.now() + TOKEN_TTL_MS);
}

export function pruneRevoked() {
  const now = Date.now();
  for (const [key, exp] of revoked) {
    if (exp <= now) revoked.delete(key);
  }
}

setInterval(pruneRevoked, 60 * 60 * 1000).unref?.();
