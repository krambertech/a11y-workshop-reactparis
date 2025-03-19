import { Router, Request, Response } from "express";
import { z } from "zod";
import { db } from "../db.js";
import { authMiddleware } from "../middleware/auth.js";
import { Til, User } from "../db.js";

const router = Router();

// Validation schemas
const tilSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(8, "Content must be at least 8 characters"),
});

// Type for TIL with saved status and expanded user
export type ExpandedTil = Til & {
  saved: boolean;
  user: User;
};

const expandTil = (til: Til, userId: string): ExpandedTil => {
  const userResult = db.users.getById(til.userId);
  if (!userResult.ok) {
    throw new Error("Failed to get user");
  }

  const isSavedResult = db.tils.isSavedByUser(userId, til.id);
  return {
    ...til,
    user: userResult.data,
    saved: isSavedResult.ok ? isSavedResult.data : false,
  };
};

// Routes
export type TilResponse = ExpandedTil;

router.post("/", authMiddleware, (req: Request, res: Response) => {
  try {
    const validationResult = tilSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: validationResult.error.errors,
      });
    }

    const { title, content } = validationResult.data;
    const result = db.tils.create({
      title,
      content,
      userId: req.userId,
    });

    if (!result.ok) {
      return res.status(400).json({
        error: result.error.message,
      });
    }

    // Process the TIL to add saved status and user info
    const processedTil = expandTil(result.data, req.userId);

    res.status(201).json(processedTil);
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({
      error: "Failed to create TIL",
    });
  }
});

export type TilListResponse = ExpandedTil[];

router.get("/", authMiddleware, (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string | undefined;
    const onlySaved = req.query.saved === "true";

    // If onlySaved is true, get only saved TILs for the current user
    if (onlySaved) {
      const savedResult = db.tils.getSavedByUserId(req.userId);

      if (!savedResult.ok) {
        return res.status(400).json({
          error: savedResult.error.message,
        });
      }

      // Process each TIL to add saved status and user info
      const processedTils = savedResult.data.map((til) =>
        expandTil(til, req.userId),
      );

      return res.status(200).json(processedTils);
    }

    // If userId is provided, get TILs for that user
    const result = userId ? db.tils.getByUserId(userId) : db.tils.list();

    if (!result.ok) {
      return res.status(400).json({
        error: result.error.message,
      });
    }

    // Process each TIL to add saved status and user info
    const processedTils = result.data.map((til) => expandTil(til, req.userId));

    res.status(200).json(processedTils);
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({
      error: "Failed to get TILs",
    });
  }
});

router.get("/:id", authMiddleware, (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const result = db.tils.getById(id);

    if (!result.ok) {
      return res.status(404).json({
        error: "TIL not found",
      });
    }

    // Process the TIL to add saved status and user info
    const processedTil = expandTil(result.data, req.userId);

    res.status(200).json(processedTil);
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({
      error: "Failed to get TIL",
    });
  }
});

router.put("/:id", authMiddleware, (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const result = db.tils.getById(id);

    if (!result.ok) {
      return res.status(404).json({
        error: "TIL not found",
      });
    }

    // Check if the TIL belongs to the user
    if (result.data.userId !== req.userId) {
      return res.status(403).json({
        error: "You can only update your own TILs",
      });
    }

    const validationResult = tilSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: validationResult.error.errors,
      });
    }

    const { title, content } = validationResult.data;
    const updateResult = db.tils.update({
      id,
      title,
      content,
    });

    if (!updateResult.ok) {
      return res.status(400).json({
        error: updateResult.error.message,
      });
    }

    // Process the updated TIL to add saved status and user info
    const processedTil = expandTil(updateResult.data, req.userId);

    res.status(200).json(processedTil);
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({
      error: "Failed to update TIL",
    });
  }
});

router.delete("/:id", authMiddleware, (req: Request, res: Response) => {
  try {
    // First check if the TIL exists and belongs to the user
    const tilResult = db.tils.getById(req.params.id);

    if (!tilResult.ok) {
      return res.status(404).json({
        error: "TIL not found",
      });
    }

    // Check if the TIL belongs to the user
    if (tilResult.data.userId !== req.userId) {
      return res.status(403).json({
        error: "You can only delete your own TILs",
      });
    }

    // Delete the TIL
    const deleteResult = db.tils.delete(req.params.id);

    if (!deleteResult.ok) {
      return res.status(400).json({
        error: deleteResult.error.message,
      });
    }

    res.status(204).send();
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({
      error: "Failed to delete TIL",
    });
  }
});

// Save a TIL
router.post("/:id/save", authMiddleware, (req: Request, res: Response) => {
  try {
    const tilId = req.params.id;

    // Check if TIL exists
    const tilResult = db.tils.getById(tilId);
    if (!tilResult.ok) {
      return res.status(404).json({
        error: "TIL not found",
      });
    }

    // Save the TIL for the current user
    const saveResult = db.tils.saveTil(req.userId, tilId);

    if (!saveResult.ok) {
      return res.status(400).json({
        error: saveResult.error.message,
      });
    }

    res.status(200).json(expandTil(saveResult.data, req.userId));
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({
      error: "Failed to save TIL",
    });
  }
});

// Unsave a TIL
router.delete("/:id/save", authMiddleware, (req: Request, res: Response) => {
  try {
    const tilId = req.params.id;

    // Unsave the TIL for the current user
    const unsaveResult = db.tils.unsaveTil(req.userId, tilId);

    if (!unsaveResult.ok) {
      // If the TIL is not saved, return 404
      if (
        unsaveResult.error.code === "TIL_NOT_SAVED" ||
        unsaveResult.error.code === "NO_SAVED_TILS"
      ) {
        return res.status(404).json({
          error: unsaveResult.error.message,
        });
      }

      return res.status(400).json({
        error: unsaveResult.error.message,
      });
    }

    res.status(200).json(expandTil(unsaveResult.data, req.userId));
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({
      error: "Failed to unsave TIL",
    });
  }
});

// Check if a TIL is saved by the current user
router.get("/:id/saved", authMiddleware, (req: Request, res: Response) => {
  try {
    const tilId = req.params.id;

    // Check if TIL exists
    const tilResult = db.tils.getById(tilId);
    if (!tilResult.ok) {
      return res.status(404).json({
        error: "TIL not found",
      });
    }

    // Check if the TIL is saved by the current user
    const isSavedResult = db.tils.isSavedByUser(req.userId, tilId);

    if (!isSavedResult.ok) {
      return res.status(400).json({
        error: isSavedResult.error.message,
      });
    }

    res.status(200).json({ saved: isSavedResult.data });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({
      error: "Failed to check if TIL is saved",
    });
  }
});

export default router;
