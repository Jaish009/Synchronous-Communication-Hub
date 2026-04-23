import { Request, Response, NextFunction } from "express";

export const protectRoute = (req: Request, res: Response, next: NextFunction): void => {
  if (!(req as any).auth || !(req as any).auth.userId) {
    res.status(401).json({ message: "Unauthorized - you must be logged in" });
    return;
  }

  next();
};
