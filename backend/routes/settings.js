import { Router } from "express";
import { requireAdmin } from "../utils/auth.js";
import { computeWindowStatus, getWindowValue, saveWindowValue } from "../utils/applicationWindow.js";

const router = Router();

router.get("/applications", async (_req, res) => {
  try {
    const value = await getWindowValue();
    res.json(computeWindowStatus(value));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put("/applications", requireAdmin, async (req, res) => {
  try {
    const current = await getWindowValue();
    const openAt =
      req.body.openAt === undefined
        ? current.openAt || null
        : req.body.openAt
          ? new Date(req.body.openAt).toISOString()
          : null;
    const closeAt =
      req.body.closeAt === undefined
        ? current.closeAt || null
        : req.body.closeAt
          ? new Date(req.body.closeAt).toISOString()
          : null;
    const allowRejectedReapply =
      req.body.allowRejectedReapply === undefined
        ? current.allowRejectedReapply !== false
        : Boolean(req.body.allowRejectedReapply);
    const value = { openAt, closeAt, allowRejectedReapply };
    await saveWindowValue(value);
    res.json(computeWindowStatus(value));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
