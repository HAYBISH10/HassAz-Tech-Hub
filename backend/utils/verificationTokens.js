import crypto from "crypto";
import { sessionSecret } from "./env.js";

// Verification links stay valid for 24 hours.
const TTL_MS = 24 * 60 * 60 * 1000;

function safeEqual(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  if (a.length !== b.length) {
    crypto.timingSafeEqual(a, Buffer.alloc(a.length));
    return false;
  }
  return crypto.timingSafeEqual(a, b);
}

export function signVerification({ fullName, email, certificateId }) {
  const exp = Date.now() + TTL_MS;
  const payload = Buffer.from(
    JSON.stringify({
      n: String(fullName || ""),
      e: String(email || ""),
      c: String(certificateId || ""),
      exp,
    })
  ).toString("base64url");
  const sig = crypto.createHmac("sha256", sessionSecret()).update(`cert-verify:${payload}`).digest("base64url");
  return `${payload}.${sig}`;
}

export function readVerification(token) {
  if (!token || typeof token !== "string" || token.length > 2000) return null;
  const dot = token.indexOf(".");
  if (dot < 1) return null;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = crypto.createHmac("sha256", sessionSecret()).update(`cert-verify:${payload}`).digest("base64url");
  if (!safeEqual(sig, expected)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!data.exp || Date.now() > Number(data.exp)) return { expired: true };
    return {
      fullName: String(data.n || ""),
      email: String(data.e || ""),
      certificateId: String(data.c || ""),
      expiresAt: Number(data.exp),
    };
  } catch {
    return null;
  }
}
