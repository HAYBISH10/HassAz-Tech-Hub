import { extractUserToken } from "./auth.js";
import { USER_COOKIE, clearAuthCookie, setAuthCookie } from "./cookies.js";
import { revokeToken, signToken, verifyToken } from "./sessions.js";

export function issueUserToken(userId) {
  return signToken("user", userId);
}

export function attachUserSession(res, issued) {
  if (!issued?.token) return;
  setAuthCookie(res, USER_COOKIE, issued.token, issued.expiresAt);
}

export function revokeUserToken(token, res) {
  revokeToken(token);
  if (res) clearAuthCookie(res, USER_COOKIE);
}

export function readUserSession(token) {
  const session = verifyToken(token, "user");
  if (!session) return null;
  return { userId: session.subject, expiresAt: session.expiresAt };
}

export function requireUser(req, res, next) {
  const session = readUserSession(extractUserToken(req));
  if (!session) {
    return res.status(401).json({
      title: "Sign in required",
      message: "Please apply for a course from the Apply page.",
    });
  }
  req.userId = session.userId;
  next();
}

export function optionalUser(req, _res, next) {
  const session = readUserSession(extractUserToken(req));
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
