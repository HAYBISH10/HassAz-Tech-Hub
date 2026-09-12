import crypto from "crypto";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "HassAz Tech Hub";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "HassAziHUb@008";
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

// In-memory admin session tokens. Fine for a single-admin panel; resets on restart.
const tokens = new Map();

function issueToken() {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  tokens.set(token, expiresAt);
  return { token, expiresAt };
}

function isValidToken(token) {
  if (!token) return false;
  const expiresAt = tokens.get(token);
  if (!expiresAt) return false;
  if (Date.now() > expiresAt) {
    tokens.delete(token);
    return false;
  }
  return true;
}

export function checkCredentials(username, password) {
  return (
    typeof username === "string" &&
    typeof password === "string" &&
    username.trim() === ADMIN_USERNAME &&
    password === ADMIN_PASSWORD
  );
}

export function login(username, password) {
  if (!checkCredentials(username, password)) return null;
  return issueToken();
}

export function logout(token) {
  if (token) tokens.delete(token);
}

function extractToken(req) {
  const header = req.headers.authorization || "";
  return header.startsWith("Bearer ") ? header.slice(7).trim() : "";
}

export function requireAdmin(req, res, next) {
  const token = extractToken(req);
  if (!isValidToken(token)) {
    return res.status(401).json({ message: "Please sign in as admin to continue." });
  }
  next();
}

export { extractToken };
