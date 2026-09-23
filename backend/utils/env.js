import crypto from "crypto";

export function isProduction() {
  return process.env.NODE_ENV === "production";
}

export function frontendOrigin() {
  return String(process.env.FRONTEND_URL || "").replace(/\/$/, "");
}

export function backendOrigin() {
  return String(process.env.BACKEND_URL || "").replace(/\/$/, "");
}

export function usesHttps() {
  if (String(process.env.FORCE_HTTPS || "").toLowerCase() === "false") return false;
  if (isProduction()) return true;
  return /^https:\/\//i.test(frontendOrigin()) || /^https:\/\//i.test(backendOrigin());
}

let cachedSecret = "";

export function sessionSecret() {
  if (cachedSecret) return cachedSecret;
  const explicit = String(process.env.SESSION_SECRET || "").trim();
  if (explicit.length >= 16) {
    cachedSecret = explicit;
    return cachedSecret;
  }
  if (isProduction()) {
    throw new Error("SESSION_SECRET must be set to at least 16 characters in production.");
  }
  cachedSecret = crypto
    .createHash("sha256")
    .update(`hassaz-dev|${process.env.ADMIN_PASSWORD || "dev"}`)
    .digest("hex");
  return cachedSecret;
}

export function assertProductionConfig() {
  if (!isProduction()) return;
  const missing = [];
  if (!String(process.env.ADMIN_PASSWORD || "").trim()) missing.push("ADMIN_PASSWORD");
  if (!String(process.env.SESSION_SECRET || "").trim() || String(process.env.SESSION_SECRET).trim().length < 16) {
    missing.push("SESSION_SECRET");
  }
  if (missing.length) {
    console.error(`Missing required production environment variables: ${missing.join(", ")}`);
    process.exit(1);
  }
}
