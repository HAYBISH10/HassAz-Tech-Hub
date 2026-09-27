import { Router } from "express";
import { attachAdminSession, extractToken, login, logout, requireAdmin } from "../utils/auth.js";
import { clearAdminLoginLock, readAdminLoginLock, recordAdminLoginFailure } from "../utils/adminLoginLock.js";
import {
  consumeUnlockToken,
  createUnlockToken,
  deleteUnlockToken,
  listUnlockTokens,
} from "../utils/adminUnlockTokens.js";

const router = Router();
const LOCKED_MESSAGE = "Sign-in rejected. Too many wrong passwords. Ask a senior staff member for an unlock token.";

router.post("/login", async (req, res) => {
  if (readAdminLoginLock().locked) {
    return res.status(403).json({ locked: true, message: LOCKED_MESSAGE });
  }

  const body = req.body || {};
  const result = await login(body.username, body.password);
  if (!result) {
    const failure = recordAdminLoginFailure();
    if (failure.locked) {
      return res.status(403).json({ locked: true, message: LOCKED_MESSAGE });
    }
    const tries = failure.remaining;
    return res.status(401).json({
      remaining: tries,
      message: `Incorrect username or password. ${tries} ${tries === 1 ? "try" : "tries"} left.`,
    });
  }

  clearAdminLoginLock();
  attachAdminSession(res, result);
  res.json({ ok: true, token: result.token, expiresAt: result.expiresAt });
});

router.post("/logout", (req, res) => {
  logout(extractToken(req), res);
  res.json({ ok: true });
});

router.get("/lock-status", (_req, res) => {
  res.json({ locked: readAdminLoginLock().locked });
});

router.post("/unlock", (req, res) => {
  const token = String(req.body?.token || "").trim();
  if (!readAdminLoginLock().locked) {
    return res.json({ ok: true, message: "Sign-in is already open." });
  }
  if (!consumeUnlockToken(token)) {
    return res.status(401).json({ message: "That unlock token is not valid." });
  }
  clearAdminLoginLock();
  return res.json({ ok: true, message: "Restriction removed. You can sign in now." });
});

router.get("/unlock-tokens", requireAdmin, (_req, res) => {
  res.json({ tokens: listUnlockTokens() });
});

router.post("/unlock-tokens", requireAdmin, (req, res) => {
  const created = createUnlockToken(req.body?.label);
  res.status(201).json(created);
});

router.delete("/unlock-tokens/:id", requireAdmin, (req, res) => {
  if (!deleteUnlockToken(req.params.id)) {
    return res.status(404).json({ message: "That token was not found." });
  }
  res.json({ ok: true });
});

export default router;
