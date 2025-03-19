import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";

import { seedUsers, seedTils } from "./seed.js";

// JWT secret key (ideally this should be an environment variable)
const JWT_SECRET = "super-secret-key-change-this-in-production";
const JWT_EXPIRES_IN = "24h";

// Error types
export type DbError = {
  code: string;
  message: string;
  details?: unknown;
};

// Validation schemas
export const userSchema = z.object({
  id: z.string(),
  username: z.string().min(3),
  password: z.string().min(8),
  createdAt: z.string(),
  updatedAt: z.string(),
  avatarUrl: z.string().url(),
  displayName: z.string(),
  githubProfileUrl: z.string(),
  company: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  blog: z.string().optional(),
  publicReposCount: z.number(),
  publicGistsCount: z.number(),
  followersCount: z.number(),
  followingCount: z.number(),
  githubProfileCreatedAt: z.string().optional(),
});

export type InternalUser = z.infer<typeof userSchema>;
export type User = Omit<InternalUser, "password">;

export const tilSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  content: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().optional(),
});

export type Til = z.infer<typeof tilSchema>;

// In-memory store
const store = {
  users: new Map<string, InternalUser>(),
  blacklistedTokens: new Set<string>(),
  tokens: new Map<string, string>(), // JWT tokens
  tils: new Map<string, Til>(),
  savedTils: new Map<string, Set<string>>(), // userId -> Set of tilIds
};

// Seed the database
const seed = () => {
  seedUsers.forEach((user) => store.users.set(user.id, user));
  seedTils.forEach((til) => store.tils.set(til.id, til));
};

// Result types for better error handling
type Result<T> = { ok: true; data: T } | { ok: false; error: DbError };

// Helper functions
const validateUser = (user: unknown): Result<InternalUser> => {
  const result = userSchema.safeParse(user);
  if (!result.success) {
    return {
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid user data",
        details: result.error.errors,
      },
    };
  }
  return { ok: true, data: result.data };
};

const validateTil = (til: unknown): Result<Til> => {
  const result = tilSchema.safeParse(til);
  if (!result.success) {
    return {
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid TIL data",
        details: result.error.errors,
      },
    };
  }
  return { ok: true, data: result.data };
};

// SatitizeUser
const sanitizeUser = (user: InternalUser): User => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...safeUser } = user;
  return safeUser;
};

// User management

const users = {
  create: (
    user: Omit<InternalUser, "id" | "createdAt" | "updatedAt">
  ): Result<User> => {
    try {
      const userId = uuidv4();
      const userToAdd = {
        id: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...user,
      };
      // Validate user data
      const validUser = validateUser(userToAdd);

      if (!validUser.ok) {
        return validUser;
      }

      if (store.users.has(validUser.data.id)) {
        return {
          ok: false,
          error: {
            code: "USER_EXISTS",
            message: "User already exists",
          },
        };
      }

      const usernameExists = Array.from(store.users.values()).some(
        (u) => u.username === validUser.data.username
      );

      if (usernameExists) {
        return {
          ok: false,
          error: {
            code: "USERNAME_EXISTS",
            message: "Username already exists",
          },
        };
      }

      store.users.set(validUser.data.id, validUser.data);
      return { ok: true, data: sanitizeUser(validUser.data) };
    } catch (err) {
      return {
        ok: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid user data",
          details: err instanceof z.ZodError ? err.errors : undefined,
        },
      };
    }
  },

  delete: (id: string): Result<void> => {
    if (!store.users.has(id)) {
      return {
        ok: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "User not found",
        },
      };
    }

    store.users.delete(id);
    store.savedTils.delete(id);

    // Delete all user's TILs
    store.tils.forEach((til) => {
      if (til.userId === id) {
        store.tils.delete(til.id);
      }
    });

    return { ok: true, data: undefined };
  },

  getById: (id: string): Result<User> => {
    const user = store.users.get(id);

    if (!user) {
      return {
        ok: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "User not found",
        },
      };
    }

    return { ok: true, data: sanitizeUser(user) };
  },

  getByUsername: (username: string): Result<User> => {
    const user = Array.from(store.users.values()).find(
      (u) => u.username === username
    );

    if (!user) {
      return {
        ok: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "User not found",
        },
      };
    }

    return { ok: true, data: sanitizeUser(user) };
  },

  list: (): Result<User[]> => ({
    ok: true,
    data: Array.from(store.users.values()).map(sanitizeUser),
  }),

  checkPassword: (id: string, password: string): Result<boolean> => {
    const user = store.users.get(id);

    if (!user) {
      return {
        ok: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "User not found",
        },
      };
    }

    return { ok: true, data: user.password === password };
  },

  count: (): number => store.users.size,
};

// Token management
const tokens = {
  create: (userId: string): Result<string> => {
    try {
      const token = jwt.sign({ userId }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      });
      store.tokens.set(token, userId);
      return { ok: true, data: token };
    } catch (error) {
      return {
        ok: false,
        error: {
          code: "TOKEN_CREATION_ERROR",
          message: "Failed to create token",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  },

  validate: (token: string): Result<string> => {
    try {
      // Check if token is blacklisted
      if (store.blacklistedTokens.has(token)) {
        return {
          ok: false,
          error: {
            code: "INVALID_TOKEN",
            message: "Token has been invalidated",
          },
        };
      }

      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      return { ok: true, data: decoded.userId };
    } catch (error) {
      return {
        ok: false,
        error: {
          code: "INVALID_TOKEN",
          message: "Invalid token",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  },

  delete: (token: string): Result<void> => {
    try {
      // Add token to blacklist
      store.blacklistedTokens.add(token);
      store.tokens.delete(token);
      return { ok: true, data: undefined };
    } catch (error) {
      return {
        ok: false,
        error: {
          code: "TOKEN_DELETION_ERROR",
          message: "Failed to invalidate token",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  },
};

// TIL management
const tils = {
  create: (til: Omit<Til, "id" | "createdAt" | "updatedAt">): Result<Til> => {
    try {
      const tilId = uuidv4();
      const tilToAdd = {
        id: tilId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...til,
      };
      // Validate TIL data
      const validTil = validateTil(tilToAdd);

      if (!validTil.ok) {
        return validTil;
      }

      store.tils.set(validTil.data.id, validTil.data);
      return { ok: true, data: validTil.data };
    } catch (err) {
      return {
        ok: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid til data",
          details: err instanceof z.ZodError ? err.errors : undefined,
        },
      };
    }
  },

  delete: (id: string): Result<void> => {
    if (!store.tils.has(id)) {
      return {
        ok: false,
        error: {
          code: "TIL_NOT_FOUND",
          message: "TIL not found",
        },
      };
    }

    store.tils.delete(id);
    return { ok: true, data: undefined };
  },

  list: (): Result<Til[]> => ({
    ok: true,
    data: Array.from(store.tils.values()).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ),
  }),

  count: (): number => store.tils.size,

  getByUserId: (userId: string): Result<Til[]> => ({
    ok: true,
    data: Array.from(store.tils.values())
      .filter((til) => til.userId === userId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
  }),

  getById: (id: string): Result<Til> => {
    const til = store.tils.get(id);

    if (!til) {
      return {
        ok: false,
        error: {
          code: "TIL_NOT_FOUND",
          message: "TIL not found",
        },
      };
    }

    return { ok: true, data: til };
  },

  update: (til: Partial<Til> & { id: string }): Result<Til> => {
    const existingTil = store.tils.get(til.id);

    if (!existingTil) {
      return {
        ok: false,
        error: {
          code: "TIL_NOT_FOUND",
          message: "TIL not found",
        },
      };
    }

    const updatedTil = {
      ...existingTil,
      ...til,
      updatedAt: new Date().toISOString(),
    };

    const validTil = validateTil(updatedTil);

    if (!validTil.ok) {
      return validTil;
    }

    store.tils.set(til.id, validTil.data);
    return { ok: true, data: validTil.data };
  },

  // Save a TIL for a user
  saveTil: (userId: string, tilId: string): Result<Til> => {
    // Check if the TIL exists
    const til = store.tils.get(tilId);
    if (!til) {
      return {
        ok: false,
        error: {
          code: "TIL_NOT_FOUND",
          message: "TIL not found",
        },
      };
    }

    // Check if the user exists
    const user = store.users.get(userId);
    if (!user) {
      return {
        ok: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "User not found",
        },
      };
    }

    // Get or create the set of saved TILs for the user
    if (!store.savedTils.has(userId)) {
      store.savedTils.set(userId, new Set<string>());
    }

    // Add the TIL to the user's saved TILs
    store.savedTils.get(userId)?.add(tilId);

    return { ok: true, data: til };
  },

  // Unsave a TIL for a user
  unsaveTil: (userId: string, tilId: string): Result<Til> => {
    const til = store.tils.get(tilId);
    if (!til) {
      return {
        ok: false,
        error: {
          code: "TIL_NOT_FOUND",
          message: "TIL not found",
        },
      };
    }

    // Check if the user has any saved TILs
    if (!store.savedTils.has(userId)) {
      return {
        ok: false,
        error: {
          code: "NO_SAVED_TILS",
          message: "User has no saved TILs",
        },
      };
    }

    // Check if the TIL is in the user's saved TILs
    const userSavedTils = store.savedTils.get(userId);
    if (!userSavedTils?.has(tilId)) {
      return {
        ok: false,
        error: {
          code: "TIL_NOT_SAVED",
          message: "TIL is not saved by the user",
        },
      };
    }

    // Remove the TIL from the user's saved TILs
    userSavedTils.delete(tilId);

    return { ok: true, data: til };
  },

  // Get all TILs saved by a user
  getSavedByUserId: (userId: string): Result<Til[]> => {
    // Check if the user exists
    const user = store.users.get(userId);
    if (!user) {
      return {
        ok: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "User not found",
        },
      };
    }

    // Get the set of saved TILs for the user
    const savedTilIds = store.savedTils.get(userId) || new Set<string>();

    // Get the TIL objects for the saved TIL IDs
    const savedTils: Til[] = [];
    savedTilIds.forEach((tilId) => {
      const til = store.tils.get(tilId);
      if (til) {
        savedTils.push(til);
      }
    });

    // Sort savedTils by createdAt in descending order (newest first)
    savedTils.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return { ok: true, data: savedTils };
  },

  // Check if a TIL is saved by a user
  isSavedByUser: (userId: string, tilId: string): Result<boolean> => {
    // Check if the user has any saved TILs
    if (!store.savedTils.has(userId)) {
      return { ok: true, data: false };
    }

    // Check if the TIL is in the user's saved TILs
    const userSavedTils = store.savedTils.get(userId);
    const isSaved = userSavedTils?.has(tilId) || false;

    return { ok: true, data: isSaved };
  },
};

// Seed the database
seed();

// Users namespace with CRUD operations
export const db = {
  tokens,
  users,
  tils,

  clear: () => {
    store.users.clear();
    store.blacklistedTokens.clear();
    store.tokens.clear();
    store.tils.clear();
    store.savedTils.clear();
  },
};
