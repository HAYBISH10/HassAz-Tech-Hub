import crypto from "crypto";
import bcrypt from "bcryptjs";
import { isProduction } from "./env.js";
import { ADMIN_COOKIE, USER_COOKIE, clearAuthCookie, readCookie } from "./cookies.js";
import { revokeToken, signToken, verifyToken } from "./sessions.js";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "HIACDI Tech Hub";
const rawAdminPassword = String(process.env.ADMIN_PASSWORD || "").trim();
const ADMIN_PASSWORD_HASH = rawAdminPassword
  ? bcrypt.hashSync(rawAdminPassword, 12)
  : isProduction()
    ? ""
    : bcrypt.hashSync("HIACDIiHUb@008", 12);

function timingEqual(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  if (a.length !== b.length) {
    crypto.timingSafeEqual(a, Buffer.alloc(a.length));
    return false;
  }
  return crypto.timingSafeEqual(a, b);
}

export function bearerToken(req) {
  const header = req.headers.authorization || "";
  return header.startsWith("Bearer ") ? header.slice(7).trim() : "";
}

export function extractToken(req) {
  return bearerToken(req);
}

export function extractUserToken(req) {
  return bearerToken(req) || readCookie(req, USER_COOKIE);
}

export async function checkCredentials(username, password) {
  if (typeof username !== "string" || typeof password !== "string") return false;
  if (!ADMIN_PASSWORD_HASH) return false;
  const userOk = timingEqual(username.trim(), ADMIN_USERNAME);
  const passOk = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
  return userOk && passOk;
}

export async function login(username, password) {
  if (!(await checkCredentials(username, password))) return null;
  return signToken("admin", "staff");
}

export function attachAdminSession(res, _issued) {
  if (res) clearAuthCookie(res, ADMIN_COOKIE);
}

export function logout(token, res) {
  revokeToken(token);
  if (res) clearAuthCookie(res, ADMIN_COOKIE);
}

export function requireAdmin(req, res, next) {
  const token = extractToken(req);
  const session = verifyToken(token, "admin");
  if (!session) {
    return res.status(401).json({ message: "Please sign in as admin to continue." });
  }
  req.adminSession = session;
  next();
}
