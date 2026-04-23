import { Request, Response } from "express";
import { generateStreamToken } from "../config/stream.js";

export const getStreamToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).auth.userId as string;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const token = generateStreamToken(userId);
    res.status(200).json({ token });
  } catch (error) {
    console.log("Error generating Stream token:", error);
    res.status(500).json({
      message: "Failed to generate Stream token",
    });
  }
};

import { summarizeMessages, generateSmartReplies } from "../services/gemini.service.js";

export const summarizeChannel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ message: "Valid messages array is required" });
      return;
    }
    const summary = await summarizeMessages(messages);
    res.status(200).json({ summary });
  } catch (error: any) {
    console.error("Error in summarizeChannel:", error);
    res.status(500).json({ message: error.message || "Failed to summarize channel" });
  }
};

export const getSmartReplies = async (req: Request, res: Response): Promise<void> => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ message: "Valid messages array is required" });
      return;
    }
    const replies = await generateSmartReplies(messages);
    res.status(200).json({ replies });
  } catch (error: any) {
    console.error("Error in getSmartReplies:", error);
    res.status(500).json({ message: error.message || "Failed to generate smart replies" });
  }
};
