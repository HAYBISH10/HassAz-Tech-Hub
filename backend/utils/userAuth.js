import crypto from "crypto";
import { extractToken } from "./auth.js";

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;
const sessions = new Map();

export function issueUserToken(userId) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  sessions.set(token, { userId: String(userId), expiresAt });
  return { token, expiresAt };
}

export function revokeUserToken(token) {
  if (token) sessions.delete(token);
}

export function readUserSession(token) {
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }
  return session;
}

export function requireUser(req, res, next) {
  const session = readUserSession(extractToken(req));
  if (!session) {
    return res.status(401).json({
      title: "Sign in required",
      message: "Please create an account or log in before registering for a course.",
    });
  }
  req.userId = session.userId;
  next();
}

export function optionalUser(req, _res, next) {
  const session = readUserSession(extractToken(req));
  if (session) req.userId = session.userId;
  next();
}

export function publicUser(user) {
  if (!user) return null;
  return {
    id: String(user.id || user._id),
    fullName: user.fullName,
    email: user.email,
    phone: user.phone || "",
    provider: user.provider || "local",
    createdAt: user.createdAt,
  };
}
