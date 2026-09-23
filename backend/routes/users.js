import { Router } from "express";
import { requireAdmin } from "../utils/auth.js";
import { listUsers } from "../utils/usersRepo.js";

const router = Router();

function learnerAccountsClosed(_req, res) {
  return res.status(410).json({
    message: "HassAz Tech Hub does not use public learner accounts. Apply for a bootcamp from the Apply page.",
  });
}

router.get("/google/config", (_req, res) => {
  res.json({ enabled: false, clientId: "" });
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

router.post("/register", learnerAccountsClosed);
router.post("/login", learnerAccountsClosed);
router.post("/logout", learnerAccountsClosed);
router.get("/me", learnerAccountsClosed);
router.post("/forgot-password", learnerAccountsClosed);
router.post("/reset-password", learnerAccountsClosed);
router.post("/google", learnerAccountsClosed);
router.get("/google/start", learnerAccountsClosed);
router.get("/google/callback", learnerAccountsClosed);

export default router;
