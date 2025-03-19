import { Router, Request, Response } from "express";
import { z } from "zod";

/** Response schema for health check endpoint */
export const healthResponseSchema = z.object({
  status: z.enum(["ok", "error"]),
  timestamp: z.string(),
  message: z.string().optional(),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;

const router = Router();

/** Health check endpoint to verify API status */
router.get("/", (_req: Request, res: Response) => {
  try {
    const timestamp = new Date().toISOString();
    const response = healthResponseSchema.parse({
      status: "ok",
      timestamp,
    });

    res.json(response);
  } catch (error) {
    console.error("❌ Error:", error);
    const errorResponse = healthResponseSchema.parse({
      status: "error",
      timestamp: new Date().toISOString(),
      message: "Service temporarily unavailable",
    });

    res.status(500).json(errorResponse);
  }
});

export default router;
