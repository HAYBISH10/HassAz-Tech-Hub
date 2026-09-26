import { Router } from "express";
import { answerChat } from "../utils/chat.js";
import { rateLimit } from "../utils/rateLimit.js";

const router = Router();

router.post(
  "/",
  rateLimit({
    max: 30,
    windowMs: 15 * 60 * 1000,
    message: "HIACDI AI is receiving many questions. Please wait a moment and try again.",
  }),
  async (req, res) => {
    try {
      const { reply } = await answerChat(req.body?.messages);
      res.json({ reply, name: "HIACDI AI" });
    } catch (error) {
      res.status(error.status === 400 ? 400 : 503).json({
        message:
          error.status === 400
            ? error.message
            : "HIACDI AI could not answer just now. Please try again.",
      });
    }
  }
);

export default router;
