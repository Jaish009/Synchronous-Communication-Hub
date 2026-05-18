import express from "express";
import { getStreamToken, summarizeChannel, getSmartReplies } from "../controllers/chat.controller.js";
import { summarizeMessages } from "../services/gemini.service.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { tokenRateLimiter } from "../middleware/rateLimit.js";

const router = express.Router();

router.get("/token", tokenRateLimiter, protectRoute, getStreamToken);
router.post("/summarize", protectRoute, summarizeChannel);
router.post("/smart-replies", protectRoute, getSmartReplies);

router.get("/debug-gemini", async (req, res) => {
  try {
    const result = await summarizeMessages([{ text: "hello", user: { name: "test" } }]);
    res.json({ success: true, result });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message, full: String(e) });
  }
});
export default router;
