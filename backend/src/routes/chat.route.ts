import express from "express";
import { getStreamToken, summarizeChannel, getSmartReplies } from "../controllers/chat.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { tokenRateLimiter } from "../middleware/rateLimit.js";

const router = express.Router();

router.get("/token", tokenRateLimiter, protectRoute, getStreamToken);
router.post("/summarize", protectRoute, summarizeChannel);
router.post("/smart-replies", protectRoute, getSmartReplies);

export default router;
