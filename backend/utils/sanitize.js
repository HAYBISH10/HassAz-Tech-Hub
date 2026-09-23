const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isEmail(value) {
  const email = String(value || "").trim();
  return email.length <= 160 && EMAIL_RE.test(email);
}

export function clip(value, max = 400) {
  return String(value || "").trim().slice(0, max);
}

export function sanitizeValue(value, depth = 0) {
  if (depth > 5 || value == null) return value == null ? "" : value;
  if (typeof value === "string") return value.slice(0, 4000);
  if (typeof value === "number") return Number.isFinite(value) ? value : "";
  if (typeof value === "boolean") return value;
  if (Array.isArray(value)) {
    return value.slice(0, 40).map((item) => sanitizeValue(item, depth + 1));
  }
  if (typeof value === "object") {
    const out = {};
    for (const [key, item] of Object.entries(value)) {
      const name = String(key || "").slice(0, 80);
      if (!name || name.startsWith("$") || name.includes(".")) continue;
      out[name] = sanitizeValue(item, depth + 1);
    }
    return out;
  }
  return "";
}

export function sanitizeObject(value) {
  const cleaned = sanitizeValue(value);
  return cleaned && typeof cleaned === "object" && !Array.isArray(cleaned) ? cleaned : {};
}
