import { describe, it, expect, beforeEach, afterEach } from "vitest";
import express from "express";
import { db, User } from "../db.js";
import usersRouter from "./users.js";
import supertest from "supertest";

// Create a test app with the users router
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/users", usersRouter);
  return app;
};

beforeEach(() => {
  // Clear the database before each test
  // This ensures tests don't affect each other
  db.clear();
});

afterEach(() => {
  // Clean up after each test
  db.clear();
});

describe("GET /users", () => {
  it("should return an empty array when no users exist", async () => {
    const app = createTestApp();
    const response = await supertest(app).get("/users");

    // Assertions
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(0);
  });

  it("should return all users when users exist", async () => {
    // Create test users
    const user1 = db.users.create({
      username: "testuser1",
      password: "Password123!",
      avatarUrl: "https://example.com/avatar1.png",
      displayName: "Test User 1",
      githubProfileUrl: "https://github.com/testuser1",
      publicReposCount: 5,
      publicGistsCount: 2,
      followersCount: 10,
      followingCount: 5,
    });

    const user2 = db.users.create({
      username: "testuser2",
      password: "Password123!",
      avatarUrl: "https://example.com/avatar2.png",
      displayName: "Test User 2",
      githubProfileUrl: "https://github.com/testuser2",
      publicReposCount: 3,
      publicGistsCount: 1,
      followersCount: 7,
      followingCount: 3,
    });

    // Ensure users were created successfully
    expect(user1.ok).toBe(true);
    expect(user2.ok).toBe(true);

    const app = createTestApp();
    const response = await supertest(app).get("/users");

    // Assertions
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(2);

    // Check that the response contains the created users (without passwords)
    const userIds = response.body.map((user: User) => user.id);
    if (user1.ok && user2.ok) {
      expect(userIds).toContain(user1.data.id);
      expect(userIds).toContain(user2.data.id);
    }

    // Verify no passwords are returned
    response.body.forEach((user: User) => {
      expect(user).not.toHaveProperty("password");
    });
  });
});

describe("GET /users/:id", () => {
  it("should return a user when a valid ID is provided", async () => {
    // Create a test user
    const createResult = db.users.create({
      username: "testuser",
      password: "Password123!",
      avatarUrl: "https://example.com/avatar.png",
      displayName: "Test User",
      githubProfileUrl: "https://github.com/testuser",
      publicReposCount: 5,
      publicGistsCount: 2,
      followersCount: 10,
      followingCount: 5,
    });

    expect(createResult.ok).toBe(true);

    // Only proceed if user creation was successful
    if (!createResult.ok) {
      throw new Error("Failed to create test user");
    }

    const userId = createResult.data.id;

    const app = createTestApp();
    const response = await supertest(app).get(`/users/${userId}`);

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id", userId);
    expect(response.body).toHaveProperty("username", "testuser");
    expect(response.body).toHaveProperty("displayName", "Test User");
    expect(response.body).not.toHaveProperty("password");
  });

  it("should return 404 when an invalid ID is provided", async () => {
    const app = createTestApp();
    const response = await supertest(app).get("/users/nonexistent-id");

    // Assertions
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error", "User not found");
  });
});
