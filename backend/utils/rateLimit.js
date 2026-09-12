const buckets = new Map();

export function rateLimit({ windowMs = 15 * 60 * 1000, max = 8, message } = {}) {
  return (req, res, next) => {
    const key = `${req.ip || "unknown"}:${req.baseUrl}${req.path}`;
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
