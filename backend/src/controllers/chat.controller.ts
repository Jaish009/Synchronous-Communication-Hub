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
