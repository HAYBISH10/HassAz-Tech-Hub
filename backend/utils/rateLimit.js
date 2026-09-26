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

export function rateLimit({ windowMs = 15 * 60 * 1000, max = 8, message } = {}) {
  return (req, res, next) => {
    if (verifyToken(extractToken(req), "admin")) return next();
    const key = `${req.method}:${req.ip || "unknown"}:${req.baseUrl}${req.path}`;
    const now = Date.now();
    const current = buckets.get(key) || [];
    const recent = current.filter((stamp) => now - stamp < windowMs);
    if (recent.length >= max) {
      return res.status(429).json({
        message: message || "Too many attempts. Please wait a few minutes and try again.",
      });
    }
    recent.push(now);
    buckets.set(key, recent);
    next();
  };
}
