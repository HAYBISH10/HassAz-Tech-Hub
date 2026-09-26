export function normalizeName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeEmail(value) {
  return String(value || "").toLowerCase().trim();
}

export function normalizePhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "";
  // Compare on the last 9 digits so 0712345678, +254712345678, and 254712345678 all match.
  return digits.length > 9 ? digits.slice(-9) : digits;
}

export function certificateId() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `HIACDI-CERT-${stamp}-${rand}`;
}
