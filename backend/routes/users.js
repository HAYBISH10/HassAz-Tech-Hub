import { Router } from "express";
import { OAuth2Client } from "google-auth-library";
import { rateLimit } from "../utils/rateLimit.js";
import { hashPassword, validatePasswordPair, verifyPassword } from "../utils/passwords.js";
import { extractToken, requireAdmin } from "../utils/auth.js";
import { issueUserToken, publicUser, requireUser, revokeUserToken } from "../utils/userAuth.js";
import {
  consumeResetToken,
  createResetToken,
  createUser,
  findUserByEmail,
  findUserByGoogleId,
  findUserById,
  listUsers,
  updateUser,
} from "../utils/usersRepo.js";
import { normalizeEmail, normalizePhone } from "../utils/names.js";
import {
  sendPasswordChangedEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from "../utils/mail.js";

const router = Router();
const authLimit = rateLimit({ max: 8, message: "Too many sign-in attempts. Please wait a few minutes." });
const googleClientId = process.env.GOOGLE_CLIENT_ID || "";
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
const frontendUrl = (process.env.FRONTEND_URL || "http://172.30.212.229:5175").replace(/\/$/, "");
const backendUrl = (process.env.BACKEND_URL || "http://172.30.212.229:5000").replace(/\/$/, "");

function googleRedirectUri() {
  return process.env.GOOGLE_REDIRECT_URI || `http://127.0.0.1:${process.env.PORT || 5000}/api/users/google/callback`;
}

function sessionPayload(user) {
  const issued = issueUserToken(user.id);
  return { ok: true, token: issued.token, expiresAt: issued.expiresAt, user: publicUser(user) };
}

router.get("/google/config", (_req, res) => {
  res.json({
    enabled: Boolean(googleClientId && googleClientSecret),
    clientId: googleClientId || "",
  });
});

router.get("/signups", requireAdmin, async (_req, res) => {
  const users = await listUsers();
  const ordered = [...users].sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
  res.json({
    count: ordered.length,
    users: ordered.map((user, index) => ({
      no: index + 1,
      id: String(user.id || user._id || ""),
      fullName: user.fullName || "",
      email: user.email || "",
      phone: user.phone || "",
      provider: user.provider || "local",
      createdAt: user.createdAt || null,
    })),
  });
});

router.post("/register", authLimit, async (req, res) => {
  const body = req.body || {};
  const fullName = String(body.fullName || "").trim();
  const email = normalizeEmail(body.email);
  const phone = String(body.phone || "").trim();
  const passwordError = validatePasswordPair(body.password, body.confirmPassword);
  if (!fullName || !email) {
    return res.status(400).json({ message: "Full name and email address are required." });
  }
  if (passwordError) return res.status(400).json({ message: passwordError });

  try {
    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({
        title: "Account Already Exists",
        message: "An account with this email address already exists. Please log in instead.",
      });
    }
    const created = await createUser({
      fullName,
      email,
      phone,
      passwordHash: await hashPassword(body.password),
      provider: "local",
    });
    sendWelcomeEmail({ to: created.email, fullName: created.fullName }).catch(() => {});
    return res.status(201).json(sessionPayload(created));
  } catch (error) {
    if (error.code === 11000 || error.code === "DUPLICATE_EMAIL") {
      return res.status(409).json({
        title: "Account Already Exists",
        message: "An account with this email address already exists. Please log in instead.",
      });
    }
    return res.status(400).json({ message: error.message || "Could not create this account." });
  }
});

router.post("/login", authLimit, async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || "");
  const user = await findUserByEmail(email);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return res.status(401).json({ message: "Incorrect email or password." });
  }
  return res.json(sessionPayload(user));
});

router.post("/logout", (req, res) => {
  revokeUserToken(extractToken(req));
  res.json({ ok: true });
});

router.get("/me", requireUser, async (req, res) => {
  const user = await findUserById(req.userId);
  if (!user) return res.status(401).json({ message: "Please sign in to continue." });
  res.json({ user: publicUser(user) });
});

router.post("/forgot-password", authLimit, async (req, res) => {
  const generic = {
    ok: true,
    message: "If an account exists for that email, a password reset link has been sent.",
  };
  const email = normalizeEmail(req.body?.email);
  if (!email) return res.json(generic);

  try {
    const user = await findUserByEmail(email);
    if (user) {
      const { token } = await createResetToken(user.emailKey);
      const resetUrl = `${frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;
      await sendPasswordResetEmail({ to: user.email, fullName: user.fullName, resetUrl });
    }
  } catch (error) {
    console.error("Password reset email failed:", error.message);
  }
  return res.json(generic);
});

router.post("/reset-password", authLimit, async (req, res) => {
  const token = String(req.body?.token || "").trim();
  const passwordError = validatePasswordPair(req.body?.password, req.body?.confirmPassword);
  if (!token) return res.status(400).json({ message: "This reset link is missing or invalid." });
  if (passwordError) return res.status(400).json({ message: passwordError });

  const reset = await consumeResetToken(token);
  if (!reset) {
    return res.status(400).json({
      message: "This password reset link is invalid, expired, or has already been used.",
    });
  }

  const user = await findUserByEmail(reset.emailKey);
  if (!user) return res.status(400).json({ message: "This password reset link is invalid." });

  await updateUser(user.id, { passwordHash: await hashPassword(req.body.password) });
  sendPasswordChangedEmail({ to: user.email, fullName: user.fullName }).catch(() => {});
  return res.json({ ok: true, message: "Your password has been updated. You can now log in." });
});

async function upsertGoogleUser({ email, fullName, googleId }) {
  const byGoogle = await findUserByGoogleId(googleId);
  if (byGoogle) return byGoogle;
  const byEmail = await findUserByEmail(email);
  if (byEmail) {
    return updateUser(byEmail.id, {
      googleId,
      provider: byEmail.passwordHash ? "local+google" : "google",
    });
  }
  const created = await createUser({
    fullName: fullName || email.split("@")[0],
    email,
    phone: "",
    passwordHash: "",
    googleId,
    provider: "google",
  });
  sendWelcomeEmail({ to: created.email, fullName: created.fullName }).catch(() => {});
  return created;
}

router.post("/google", authLimit, async (req, res) => {
  if (!googleClientId) {
    return res.status(503).json({
      message: "Google sign-in is not configured yet. Please use email and password, or ask HassAz Tech Hub to add Google credentials.",
    });
  }
  const credential = String(req.body?.credential || "").trim();
  if (!credential) return res.status(400).json({ message: "Google sign-in did not return a credential." });

  try {
    const client = new OAuth2Client(googleClientId);
    const ticket = await client.verifyIdToken({ idToken: credential, audience: googleClientId });
    const payload = ticket.getPayload() || {};
    const email = normalizeEmail(payload.email);
    if (!email || !payload.email_verified) {
      return res.status(400).json({ message: "Google did not provide a verified email address." });
    }
    const user = await upsertGoogleUser({
      email,
      fullName: payload.name || "",
      googleId: payload.sub,
    });
    return res.json(sessionPayload(user));
  } catch (error) {
    console.error("Google sign-in failed:", error.message);
    return res.status(401).json({ message: "Google sign-in could not be verified. Please try again." });
  }
});

router.get("/google/start", (req, res) => {
  if (!googleClientId || !googleClientSecret) {
    return res.redirect(`${frontendUrl}/login?google=unavailable`);
  }
  const requestedNext = String(req.query.next || "/account");
  const next = requestedNext.startsWith("/") ? requestedNext : "/account";
  const client = new OAuth2Client(googleClientId, googleClientSecret, googleRedirectUri());
  const url = client.generateAuthUrl({
    access_type: "offline",
    prompt: "select_account",
    scope: ["openid", "email", "profile"],
    state: next,
  });
  res.redirect(url);
});

router.get("/google/callback", async (req, res) => {
  const next = String(req.query.state || "/account");
  const safeNext = next.startsWith("/") ? next : "/account";
  if (!googleClientId || !googleClientSecret) {
    return res.redirect(`${frontendUrl}/login?google=unavailable`);
  }
  try {
    const client = new OAuth2Client(googleClientId, googleClientSecret, googleRedirectUri());
    const { tokens } = await client.getToken(String(req.query.code || ""));
    const ticket = await client.verifyIdToken({ idToken: tokens.id_token, audience: googleClientId });
    const payload = ticket.getPayload() || {};
    const email = normalizeEmail(payload.email);
    if (!email) throw new Error("No verified Google email");
    const user = await upsertGoogleUser({
      email,
      fullName: payload.name || "",
      googleId: payload.sub,
    });
    const session = issueUserToken(user.id);
    const params = new URLSearchParams({
      token: session.token,
      expiresAt: String(session.expiresAt),
      next: safeNext,
    });
    return res.redirect(`${frontendUrl}/auth/callback?${params.toString()}`);
  } catch (error) {
    console.error("Google OAuth callback failed:", error.message);
    return res.redirect(`${frontendUrl}/login?google=error`);
  }
});

export default router;
