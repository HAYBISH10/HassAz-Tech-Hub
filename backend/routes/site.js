import { Router } from "express";
import { siteContent } from "../data/content.js";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    ...siteContent,
    whatsapp: process.env.WHATSAPP || siteContent.whatsapp,
  });
});

export default router;
