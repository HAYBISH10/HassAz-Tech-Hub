import { Router } from "express";
import { attachAdminSession, extractToken, login, logout } from "../utils/auth.js";
import { rateLimit } from "../utils/rateLimit.js";

const router = Router();
const loginLimit = rateLimit({
  max: 5,
  windowMs: 15 * 60 * 1000,
  message: "Too many sign-in attempts. Please wait a few minutes.",
});

router.post("/login", loginLimit, async (req, res) => {
  const body = req.body || {};
  const result = await login(body.username, body.password);
  if (!result) {
    return res.status(401).json({ message: "Incorrect username or password." });
  }
  attachAdminSession(res, result);
  res.json({ ok: true, token: result.token, expiresAt: result.expiresAt });
});

router.post("/logout", (req, res) => {
  logout(extractToken(req), res);
  res.json({ ok: true });
});

export default router;
