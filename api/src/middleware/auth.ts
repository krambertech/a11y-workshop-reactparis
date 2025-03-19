import { Request, Response, NextFunction } from "express";
import { db } from "../db.js";

// Augment Express Request type
declare module "express-serve-static-core" {
  interface Request {
    userId: string;
  }
}

/**
 * Authentication middleware that validates JWT tokens
 *
 * @description
 * This middleware checks for a valid JWT token in the Authorization header.
 * It validates the token and adds the userId to the request object for use in route handlers.
 *
 * @example
 * ```typescript
 * router.get("/protected", authMiddleware, (req, res) => {
 *   // req.userId is available here
 * });
 * ```
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "No token provided",
    });
  }

  // //  await for 1 second
  // await new Promise((resolve) => setTimeout(resolve, 300));

  const token = authHeader.split(" ")[1];
  const result = db.tokens.validate(token);

  if (!result.ok) {
    return res.status(401).json({
      error: "Unauthorized",
      message: result.error.message,
    });
  }

  // Add userId to request for route handlers
  req.userId = result.data;
  next();
};
