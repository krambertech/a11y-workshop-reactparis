import { Router, Request, Response } from "express";
import { db, User } from "../db.js";

const router = Router();

// Get all users
export type UsersResponse = User[];

router.get("/", async (_req: Request, res: Response) => {
  try {
    const usersResult = db.users.list();

    if (!usersResult.ok) {
      return res.status(500).json({
        error: usersResult.error.message,
      });
    }

    res.status(200).json(usersResult.data);
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({
      error: "Failed to get users",
    });
  }
});

// Get user by ID
export type UserResponse = User;

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userResult = db.users.getById(id);

    if (!userResult.ok) {
      return res.status(404).json({
        error: userResult.error.message,
      });
    }

    res.status(200).json(userResult.data);
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({
      error: "Failed to get user",
    });
  }
});

export default router;
