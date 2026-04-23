import express from "express";
import { getStreamToken } from "../controllers/chat.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { tokenRateLimiter } from "../middleware/rateLimit.js";

const router = express.Router();

router.get("/token", tokenRateLimiter, protectRoute, getStreamToken);

export default router;
