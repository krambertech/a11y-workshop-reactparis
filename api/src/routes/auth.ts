import { Router, Request, Response } from "express";
import { z } from "zod";

import { db } from "../db.js";
import { authMiddleware } from "../middleware/auth.js";
import { fetchGitHubProfile } from "../helpers/github.js";

export const loginPassword = z
  .string()
  .min(8, "Password must be at least 8 characters");

export const registerPassword = loginPassword
  .regex(/.*[0-9].*/, "Password must contain at least one number")
  .regex(
    /.*[!@#$%^&*].*/,
    "Password must contain at least one special character"
  );

export const username = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(20, "Username must be less than 20 characters");

const router = Router();

// Validation schemas
export const registerCredentialsSchema = z.object({
  username: username,
  password: registerPassword,
  bio: z.string().max(200, "Bio must be less than 200 characters").optional(),
});

export const loginCredentialsSchema = z.object({
  username: username,
  password: loginPassword,
});

// Register new user
export type RegisterCredentials = z.infer<typeof registerCredentialsSchema>;

router.post("/register", async (req: Request, res: Response) => {
  try {
    const data = registerCredentialsSchema.parse(req.body);

    const existingUser = db.users.getByUsername(data.username);
    if (existingUser.ok) {
      return res.status(400).json({
        error: "Username already taken",
      });
    }

    const githubProfile = await fetchGitHubProfile(data.username);
    if (!githubProfile) {
      return res.status(400).json({
        error: "Github profile not found",
      });
    }

    const result = db.users.create({
      username: data.username,
      password: data.password,
      avatarUrl:
        githubProfile.avatar_url ??
        `https://avatars.jakerunzer.com/${data.username}`,
      displayName: githubProfile.name ?? data.username,
      githubProfileUrl: githubProfile.html_url,
      company: githubProfile.company ?? undefined,
      bio: githubProfile.bio ?? data.bio ?? undefined,
      location: githubProfile.location ?? undefined,
      blog: githubProfile.blog ?? undefined,
      publicReposCount: githubProfile.public_repos,
      publicGistsCount: githubProfile.public_gists,
      followersCount: githubProfile.followers,
      followingCount: githubProfile.following,
      githubProfileCreatedAt: githubProfile.created_at,
    });

    if (!result.ok) {
      return res.status(400).json({
        error: result.error.message,
        details: result.error.details,
      });
    }

    res.status(201).json(result.data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.errors,
      });
    }

    console.error("❌ Error:", error);
    res.status(500).json({
      error: "Failed to create user",
    });
  }
});

// Login user
export type LoginCredentials = z.infer<typeof loginCredentialsSchema>;

router.post("/login", async (req: Request, res: Response) => {
  try {
    const data = loginCredentialsSchema.parse(req.body);
    const userResult = db.users.getByUsername(data.username);

    if (!userResult.ok) {
      return res.status(401).json({
        error: "Invalid username or password",
      });
    }

    const user = userResult.data;
    const passwordResult = db.users.checkPassword(user.id, data.password);

    if (!passwordResult.ok || !passwordResult.data) {
      return res.status(401).json({
        error: "Invalid username or password",
      });
    }

    // Create JWT token
    const tokenResult = db.tokens.create(user.id);
    if (!tokenResult.ok) {
      return res.status(500).json({
        error: "Failed to create authentication token",
      });
    }

    res.status(200).json({
      user,
      token: tokenResult.data,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.errors,
      });
    }

    console.error("❌ Error:", error);
    res.status(500).json({
      error: "Failed to log in",
    });
  }
});

router.post("/logout", authMiddleware, (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization!.split(" ")[1];
    const result = db.tokens.delete(token);

    if (!result.ok) {
      return res.status(400).json({
        error: result.error.message,
      });
    }

    res.status(204).send();
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({
      error: "Failed to log out",
    });
  }
});

router.get("/me", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userResult = db.users.getById(req.userId);

    if (!userResult.ok) {
      return res.status(404).json({
        error: userResult.error.message,
      });
    }

    // Return existing user data if GitHub update fails
    res.status(200).json(userResult.data);
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({
      error: "Failed to get user profile",
    });
  }
});

router.delete("/me", authMiddleware, (req: Request, res: Response) => {
  try {
    const user = db.users.getById(req.userId);
    if (!user.ok) {
      return res.status(404).json({
        error: user.error.message,
      });
    }

    const result = db.users.delete(user.data.id);
    if (!result.ok) {
      return res.status(500).json({
        error: result.error.message,
      });
    }

    res.status(204).send();
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({
      error: "Failed to delete user",
    });
  }
});

export default router;
