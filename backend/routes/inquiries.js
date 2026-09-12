import { Router } from "express";
import Inquiry from "../models/Inquiry.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const inquiry = await Inquiry.create(req.body);
    res.status(201).json(inquiry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
