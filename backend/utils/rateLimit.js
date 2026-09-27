import { extractToken } from "./auth.js";
import { verifyToken } from "./sessions.js";

const buckets = new Map();

// Periodically drop stale buckets so the map never grows without bound.
setInterval(() => {
  const cutoff = Date.now() - 60 * 60 * 1000;
  for (const [key, stamps] of buckets) {
    if (!stamps.length || stamps[stamps.length - 1] < cutoff) buckets.delete(key);
  }
}, 10 * 60 * 1000).unref();

function bucketKey(req) {
  return `${req.method}:${req.ip || "unknown"}:${req.baseUrl}${req.path}`;
}

function recentStamps(key, windowMs) {
  const now = Date.now();
  const recent = (buckets.get(key) || []).filter((stamp) => now - stamp < windowMs);
  buckets.set(key, recent);
  return recent;
}

export function isRateLimited(req, { windowMs = 15 * 60 * 1000, max = 8 } = {}) {
  if (verifyToken(extractToken(req), "admin")) return false;
  return recentStamps(bucketKey(req), windowMs).length >= max;
}

export function hitRateLimit(req, { windowMs = 15 * 60 * 1000 } = {}) {
  const key = bucketKey(req);
  const recent = recentStamps(key, windowMs);
  recent.push(Date.now());
  buckets.set(key, recent);
}

export function clearRateLimit(req) {
  buckets.delete(bucketKey(req));
}

export function rateLimit({ windowMs = 15 * 60 * 1000, max = 8, message } = {}) {
  return (req, res, next) => {
    if (verifyToken(extractToken(req), "admin")) return next();
    const recent = recentStamps(bucketKey(req), windowMs);
    if (recent.length >= max) {
      return res.status(429).json({
        message: message || "Too many attempts. Please wait a few minutes and try again.",
      });
    }
    recent.push(Date.now());
    buckets.set(bucketKey(req), recent);
    next();
  };
}
