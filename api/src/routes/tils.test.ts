import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import express from "express";
import supertest from "supertest";

import { db } from "../db.js";
import tilsRouter from "./tils.js";
import authRouter from "./auth.js";

// Create a test app with the tils router
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/auth", authRouter);
  app.use("/tils", tilsRouter);
  return app;
};

const mockUserData = {
  avatarUrl: "https://example.com/avatar.png",
  displayName: "Test User",
  githubProfileUrl: "https://github.com/testuser",
  publicReposCount: 5,
  publicGistsCount: 2,
  followersCount: 10,
  followingCount: 5,
  githubProfileCreatedAt: "2020-01-01T00:00:00Z",
};

// Helper function to create a test user and get a token
const seedUser = (username: string = "myUser") => {
  const createResult = db.users.create({
    username,
    password: "Password123!",
    ...mockUserData,
  });

  if (!createResult.ok) {
    throw new Error("Failed to create user");
  }

  const user = createResult.data;

  const tokenResult = db.tokens.create(user.id);

  if (!tokenResult.ok) {
    throw new Error("Failed to create token");
  }

  return { userId: user.id, token: tokenResult.data };
};

// Helper function to create a TIL
const createTestTil = async (
  app: ReturnType<typeof createTestApp>,
  token: string,
  tilData = {
    title: "Test TIL",
    content: "This is a test TIL content",
  },
) => {
  const response = await supertest(app)
    .post("/tils")
    .set("Authorization", `Bearer ${token}`)
    .send(tilData);

  return response.body;
};

beforeEach(() => {
  vi.clearAllMocks();
  // Clear the database before each test
  db.clear();
});

afterEach(() => {
  vi.resetAllMocks();
});

describe("POST /tils", () => {
  it("should create a new TIL when authenticated", async () => {
    const app = createTestApp();
    const { token } = seedUser();

    const tilData = {
      title: "Test TIL",
      content: "This is a test TIL content",
    };

    const response = await supertest(app)
      .post("/tils")
      .set("Authorization", `Bearer ${token}`)
      .send(tilData);

    // Assertions
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("title", tilData.title);
    expect(response.body).toHaveProperty("content", tilData.content);
    expect(response.body).toHaveProperty("createdAt");
    expect(response.body).toHaveProperty("updatedAt");

    // Verify TIL was created in the database
    const tilResult = db.tils.getById(response.body.id);
    expect(tilResult.ok).toBe(true);

    if (tilResult.ok) {
      expect(tilResult.data.title).toBe(tilData.title);
      expect(tilResult.data.content).toBe(tilData.content);
    }
  });

  it("should return 401 if not authenticated", async () => {
    const app = createTestApp();

    const tilData = {
      title: "Test TIL",
      content: "This is a test TIL content",
    };

    const response = await supertest(app).post("/tils").send(tilData);

    // Assertions
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("error", "Unauthorized");
  });

  it("should return 400 if validation fails", async () => {
    const { token } = seedUser();
    const app = createTestApp();

    const invalidTilData = {
      title: "Te", // Too short
      content: "Short", // Too short
    };

    const response = await supertest(app)
      .post("/tils")
      .set("Authorization", `Bearer ${token}`)
      .send(invalidTilData);

    // Assertions
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error", "Validation failed");
  });
});

describe("GET /tils", () => {
  it("should return all TILs when authenticated", async () => {
    const app = createTestApp();
    const { token } = seedUser();

    // Create some test TILs
    const til1 = await createTestTil(app, token, {
      title: "TIL 1",
      content: "Content for TIL 1",
    });

    const til2 = await createTestTil(app, token, {
      title: "TIL 2",
      content: "Content for TIL 2",
    });

    // Get all TILs
    const response = await supertest(app)
      .get("/tils")
      .set("Authorization", `Bearer ${token}`);

    // Assertions
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(2);

    // Check if the created TILs are in the response
    const tilIds = response.body.map((til) => til.id);
    expect(tilIds).toContain(til1.id);
    expect(tilIds).toContain(til2.id);
  });

  it("should filter TILs by userId when query parameter is provided", async () => {
    const app = createTestApp();

    // Create first user and their TILs
    const { token: token1 } = seedUser("user1");
    const til1 = await createTestTil(app, token1, {
      title: "User 1 TIL 1",
      content: "Content for User 1 TIL 1",
    });

    const til2 = await createTestTil(app, token1, {
      title: "User 1 TIL 2",
      content: "Content for User 1 TIL 2",
    });

    // Create second user and their TILs
    const { token: token2 } = seedUser("user2");
    const til3 = await createTestTil(app, token2, {
      title: "User 2 TIL 1",
      content: "Content for User 2 TIL 1",
    });

    // Get TILs filtered by first user's ID
    const response = await supertest(app)
      .get(`/tils?userId=${til1.userId}`)
      .set("Authorization", `Bearer ${token1}`);

    // Assertions
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(2);

    // Check if only first user's TILs are in the response
    const tilIds = response.body.map((til) => til.id);
    expect(tilIds).toContain(til1.id);
    expect(tilIds).toContain(til2.id);
    expect(tilIds).not.toContain(til3.id);

    // Verify all TILs belong to the requested user
    response.body.forEach((til) => {
      expect(til.userId).toBe(til1.userId);
    });

    // Also verify we can get second user's TILs
    const response2 = await supertest(app)
      .get(`/tils?userId=${til3.userId}`)
      .set("Authorization", `Bearer ${token2}`);

    expect(response2.status).toBe(200);
    expect(response2.body.length).toBe(1);
    expect(response2.body[0].id).toBe(til3.id);
  });

  it("should return empty array when user has no TILs", async () => {
    const app = createTestApp();

    // Create first user with TILs
    const { token: token1 } = seedUser("user1");
    await createTestTil(app, token1);

    // Create second user with no TILs
    const { token: token2, userId: userId2 } = seedUser("user2");

    // Get TILs filtered by second user's ID (who has no TILs)
    const response = await supertest(app)
      .get(`/tils?userId=${userId2}`)
      .set("Authorization", `Bearer ${token2}`);

    // Assertions
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(0);
  });

  it("should return 401 if not authenticated", async () => {
    const app = createTestApp();
    const response = await supertest(app).get("/tils");

    // Assertions
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("error", "Unauthorized");
  });

  it("should return an empty array when no TILs exist", async () => {
    const app = createTestApp();
    const { token } = seedUser();

    const response = await supertest(app)
      .get("/tils")
      .set("Authorization", `Bearer ${token}`);

    // Assertions
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(0);
  });

  it("should return only saved TILs when saved=true query parameter is provided", async () => {
    const app = createTestApp();

    // Create user and their TILs
    const { token } = seedUser("user1");

    // Create some TILs
    const til1 = await createTestTil(app, token, {
      title: "TIL 1",
      content: "Content for TIL 1",
    });

    const til2 = await createTestTil(app, token, {
      title: "TIL 2",
      content: "Content for TIL 2",
    });

    const til3 = await createTestTil(app, token, {
      title: "TIL 3",
      content: "Content for TIL 3",
    });

    // Save only til1 and til3
    await supertest(app)
      .post(`/tils/${til1.id}/save`)
      .set("Authorization", `Bearer ${token}`);

    await supertest(app)
      .post(`/tils/${til3.id}/save`)
      .set("Authorization", `Bearer ${token}`);

    // Get saved TILs
    const response = await supertest(app)
      .get("/tils?saved=true")
      .set("Authorization", `Bearer ${token}`);

    // Assertions
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(2);

    // Check if only the saved TILs are in the response
    const tilIds = response.body.map((til) => til.id);
    expect(tilIds).toContain(til1.id);
    expect(tilIds).not.toContain(til2.id);
    expect(tilIds).toContain(til3.id);
  });

  it("should include saved status in TIL responses", async () => {
    const app = createTestApp();

    // Create user and their TILs
    const { token } = seedUser("user1");

    // Create some TILs
    const til1 = await createTestTil(app, token, {
      title: "TIL 1",
      content: "Content for TIL 1",
    });

    const til2 = await createTestTil(app, token, {
      title: "TIL 2",
      content: "Content for TIL 2",
    });

    // Save only til1
    await supertest(app)
      .post(`/tils/${til1.id}/save`)
      .set("Authorization", `Bearer ${token}`);

    // Get all TILs
    const response = await supertest(app)
      .get("/tils")
      .set("Authorization", `Bearer ${token}`);

    // Assertions
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);

    // Find til1 and til2 in the response
    const responseTil1 = response.body.find((til) => til.id === til1.id);
    const responseTil2 = response.body.find((til) => til.id === til2.id);

    // Check saved status
    expect(responseTil1).toHaveProperty("saved", true);
    expect(responseTil2).toHaveProperty("saved", false);
  });
});

describe("GET /tils/:id", () => {
  it("should return a specific TIL by ID when authenticated", async () => {
    const app = createTestApp();
    const { token } = seedUser();

    // Create a test TIL
    const til = await createTestTil(app, token);

    // Get the TIL by ID
    const response = await supertest(app)
      .get(`/tils/${til.id}`)
      .set("Authorization", `Bearer ${token}`);

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id", til.id);
    expect(response.body).toHaveProperty("title", til.title);
    expect(response.body).toHaveProperty("content", til.content);
  });

  it("should return 401 if not authenticated", async () => {
    const app = createTestApp();
    const { token } = seedUser();

    // Create a test TIL
    const til = await createTestTil(app, token);

    // Try to get the TIL without authentication
    const response = await supertest(app).get(`/tils/${til.id}`);

    // Assertions
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("error", "Unauthorized");
  });

  it("should return 404 if TIL not found", async () => {
    const app = createTestApp();
    const { token } = seedUser();

    // Try to get a non-existent TIL
    const response = await supertest(app)
      .get("/tils/nonexistent-id")
      .set("Authorization", `Bearer ${token}`);

    // Assertions
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error", "TIL not found");
  });
});

describe("DELETE /tils/:id", () => {
  it("should delete a TIL when authenticated and authorized", async () => {
    const app = createTestApp();
    const { token } = seedUser();

    // Create a test TIL
    const til = await createTestTil(app, token);

    // Delete the TIL
    const deleteResponse = await supertest(app)
      .delete(`/tils/${til.id}`)
      .set("Authorization", `Bearer ${token}`);

    // Assertions
    expect(deleteResponse.status).toBe(204);

    // Verify TIL was deleted
    const tilResult = db.tils.getById(til.id);
    expect(tilResult.ok).toBe(false);
  });

  it("should return 401 if not authenticated", async () => {
    const app = createTestApp();
    const { token } = seedUser();

    // Create a test TIL
    const til = await createTestTil(app, token);

    // Try to delete without authentication
    const response = await supertest(app).delete(`/tils/${til.id}`);

    // Assertions
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("error", "Unauthorized");

    // Verify TIL was not deleted
    const tilResult = db.tils.getById(til.id);
    expect(tilResult.ok).toBe(true);
  });

  it("should return 403 if trying to delete another user's TIL", async () => {
    const app = createTestApp();

    // Create first user and their TIL
    const { token: token1 } = seedUser("user1");
    const til1 = await createTestTil(app, token1, {
      title: "TIL 1",
      content: "Content for TIL 1",
    });

    const til2 = await createTestTil(app, token1, {
      title: "TIL 2",
      content: "Content for TIL 2",
    });

    // Create second user and their TIL
    const { token: token2 } = seedUser("user2");
    const til3 = await createTestTil(app, token2, {
      title: "TIL 3",
      content: "Content for TIL 3",
    });

    // Try to delete first user's TIL with second user's token
    const response = await supertest(app)
      .delete(`/tils/${til1.id}`)
      .set("Authorization", `Bearer ${token2}`);

    // Assertions
    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty(
      "error",
      "You can only delete your own TILs",
    );

    // Verify TILs were not deleted
    const til1Result = db.tils.getById(til1.id);
    expect(til1Result.ok).toBe(true);
    if (til1Result.ok) {
      expect(til1Result.data.userId).toBe(til1.userId);
    }

    const til2Result = db.tils.getById(til2.id);
    expect(til2Result.ok).toBe(true);
    if (til2Result.ok) {
      expect(til2Result.data.userId).toBe(til2.userId);
    }

    const til3Result = db.tils.getById(til3.id);
    expect(til3Result.ok).toBe(true);
    if (til3Result.ok) {
      expect(til3Result.data.userId).toBe(til3.userId);
    }
  });

  it("should return 404 if TIL not found", async () => {
    const app = createTestApp();
    const { token } = seedUser();

    // Try to delete a non-existent TIL
    const response = await supertest(app)
      .delete("/tils/nonexistent-id")
      .set("Authorization", `Bearer ${token}`);

    // Assertions
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error");
  });
});

describe("TIL Saving/Unsaving", () => {
  it("should save a TIL for the current user", async () => {
    const app = createTestApp();
    const { token } = seedUser();

    // Create a test TIL
    const til = await createTestTil(app, token);

    // Save the TIL
    const saveResponse = await supertest(app)
      .post(`/tils/${til.id}/save`)
      .set("Authorization", `Bearer ${token}`);

    // Assertions
    expect(saveResponse.status).toBe(200);
    expect(saveResponse.body).toHaveProperty(
      "message",
      "TIL saved successfully",
    );

    // Verify the TIL is saved by checking the saved status
    const checkResponse = await supertest(app)
      .get(`/tils/${til.id}/saved`)
      .set("Authorization", `Bearer ${token}`);

    expect(checkResponse.status).toBe(200);
    expect(checkResponse.body).toHaveProperty("saved", true);

    // Also verify by getting saved TILs
    const savedResponse = await supertest(app)
      .get("/tils?saved=true")
      .set("Authorization", `Bearer ${token}`);

    expect(savedResponse.status).toBe(200);
    expect(savedResponse.body.length).toBe(1);
    expect(savedResponse.body[0].id).toBe(til.id);
  });

  it("should return 404 when trying to save a non-existent TIL", async () => {
    const app = createTestApp();
    const { token } = seedUser();

    // Try to save a non-existent TIL
    const response = await supertest(app)
      .post("/tils/nonexistent-id/save")
      .set("Authorization", `Bearer ${token}`);

    // Assertions
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error", "TIL not found");
  });

  it("should unsave a previously saved TIL", async () => {
    const app = createTestApp();
    const { token } = seedUser();

    // Create a test TIL
    const til = await createTestTil(app, token);

    // Save the TIL first
    await supertest(app)
      .post(`/tils/${til.id}/save`)
      .set("Authorization", `Bearer ${token}`);

    // Unsave the TIL
    const unsaveResponse = await supertest(app)
      .delete(`/tils/${til.id}/save`)
      .set("Authorization", `Bearer ${token}`);

    // Assertions
    expect(unsaveResponse.status).toBe(204);

    // Verify the TIL is no longer saved
    const checkResponse = await supertest(app)
      .get(`/tils/${til.id}/saved`)
      .set("Authorization", `Bearer ${token}`);

    expect(checkResponse.status).toBe(200);
    expect(checkResponse.body).toHaveProperty("saved", false);

    // Also verify by getting saved TILs
    const savedResponse = await supertest(app)
      .get("/tils?saved=true")
      .set("Authorization", `Bearer ${token}`);

    expect(savedResponse.status).toBe(200);
    expect(savedResponse.body.length).toBe(0);
  });

  it("should return 404 when trying to unsave a TIL that is not saved", async () => {
    const app = createTestApp();
    const { token } = seedUser();

    // Create a test TIL but don't save it
    const til = await createTestTil(app, token);

    // Try to unsave the TIL
    const response = await supertest(app)
      .delete(`/tils/${til.id}/save`)
      .set("Authorization", `Bearer ${token}`);

    // Assertions
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error");
  });

  it("should check if a TIL is saved by the current user", async () => {
    const app = createTestApp();
    const { token } = seedUser();

    // Create a test TIL
    const til = await createTestTil(app, token);

    // Check if the TIL is saved (should be false initially)
    const initialCheckResponse = await supertest(app)
      .get(`/tils/${til.id}/saved`)
      .set("Authorization", `Bearer ${token}`);

    expect(initialCheckResponse.status).toBe(200);
    expect(initialCheckResponse.body).toHaveProperty("saved", false);

    // Save the TIL
    await supertest(app)
      .post(`/tils/${til.id}/save`)
      .set("Authorization", `Bearer ${token}`);

    // Check if the TIL is saved now (should be true)
    const afterSaveCheckResponse = await supertest(app)
      .get(`/tils/${til.id}/saved`)
      .set("Authorization", `Bearer ${token}`);

    expect(afterSaveCheckResponse.status).toBe(200);
    expect(afterSaveCheckResponse.body).toHaveProperty("saved", true);
  });

  it("should return 404 when checking saved status for a non-existent TIL", async () => {
    const app = createTestApp();
    const { token } = seedUser();

    // Try to check saved status for a non-existent TIL
    const response = await supertest(app)
      .get("/tils/nonexistent-id/saved")
      .set("Authorization", `Bearer ${token}`);

    // Assertions
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error", "TIL not found");
  });

  it("should return 401 when trying to save/unsave/check without authentication", async () => {
    const app = createTestApp();
    const { token } = seedUser();

    // Create a test TIL
    const til = await createTestTil(app, token);

    // Try to save without authentication
    const saveResponse = await supertest(app).post(`/tils/${til.id}/save`);

    expect(saveResponse.status).toBe(401);

    // Try to unsave without authentication
    const unsaveResponse = await supertest(app).delete(`/tils/${til.id}/save`);

    expect(unsaveResponse.status).toBe(401);

    // Try to check saved status without authentication
    const checkResponse = await supertest(app).get(`/tils/${til.id}/saved`);

    expect(checkResponse.status).toBe(401);
  });
});
