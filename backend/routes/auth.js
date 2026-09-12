import { Router } from "express";
import { extractToken, login, logout } from "../utils/auth.js";

const router = Router();

router.post("/login", (req, res) => {
  const body = req.body || {};
  const result = login(body.username, body.password);
  if (!result) {
    return res.status(401).json({ message: "Incorrect username or password." });
  }
  res.json({ ok: true, token: result.token, expiresAt: result.expiresAt });
});

router.post("/logout", (req, res) => {
  logout(extractToken(req));
  res.json({ ok: true });
});

export default router;
