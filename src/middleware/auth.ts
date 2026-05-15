import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/index.js";

// Middleware that validates JWT and attaches user payload to request
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ message: "Missing or malformed token" });
      return;
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "Malformed token" });
      return;
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      res.status(401).json({ message: "Invalid token" });
      return;
    }
    // Attach user payload (including role) to request
    (req as any).user = decoded;
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Authentication error" });
  }
};

// Middleware that allows only ADMIN users to proceed
export const adminOnly = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const user = (req as any).user;

  if (!user || user.role !== "ADMIN") {
    res.status(403).json({ message: "Admin privileges required" });
    return;
  }
  next();
};
