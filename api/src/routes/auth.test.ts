import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import express from "express";
import { db } from "../db.js";
import authRouter from "./auth.js";
import supertest from "supertest";
import { fetchGitHubProfile, type GithubProfile } from "../helpers/github.js";

// Create a test app with the auth router
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/auth", authRouter);
  return app;
};

function mockGitHubProfile(
  profile: Partial<GithubProfile> = {},
): GithubProfile {
  return {
    avatar_url: "https://example.com/avatar.png",
    name: "Test User",
    html_url: "https://github.com/testuser",
    company: null,
    bio: null,
    location: null,
    blog: null,
    public_repos: 5,
    public_gists: 2,
    followers: 10,
    following: 5,
    created_at: "2020-01-01T00:00:00Z",
    ...profile,
  };
}

// Mock the GitHub service
vi.mock("../helpers/github.js", { spy: true });

beforeEach(() => {
  vi.clearAllMocks();

  // Clear the database before each test
  // This ensures tests don't affect each other
  db.clear();

  (fetchGitHubProfile as ReturnType<typeof vi.fn>).mockResolvedValue(
    mockGitHubProfile(),
  );
});

afterEach(() => {
  vi.resetAllMocks();
});

describe("POST /register", () => {
  it("should register a new user with valid credentials", async () => {
    const app = createTestApp();
    const response = await supertest(app).post("/auth/register").send({
      username: "testuser",
      password: "Password123!",
    });

    // Assertions
    expect(response.status).toBe(201);
    expect(response.body.username).toBe("testuser");
    expect(response.body.displayName).toBe("Test User");
    expect(fetchGitHubProfile).toHaveBeenCalledWith("testuser");

    // Verify user was created in the database
    const userResult = db.users.getByUsername("testuser");
    expect(userResult.ok).toBe(true);
  });

  it("should return 400 if username already exists", async () => {
    // Create a user first
    const app = createTestApp();
    await supertest(app).post("/auth/register").send({
      username: "existinguser",
      password: "Password123!",
    });

    // Try to create the same user again
    const response = await supertest(app).post("/auth/register").send({
      username: "existinguser",
      password: "NewPassword123!!",
    });

    // Assertions
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error", "Username already taken");
  });

  it("should return 400 if GitHub profile not found", async () => {
    // Mock GitHub API response for non-existent user
    (fetchGitHubProfile as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      null,
    );

    const app = createTestApp();
    const response = await supertest(app).post("/auth/register").send({
      username: "nonexistentuser",
      password: "Password123!",
    });

    // Assertions
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error", "Github profile not found");

    // Verify user was not created in the database
    const userResult = db.users.getByUsername("nonexistentuser");
    expect(userResult.ok).toBe(false);
  });

  it("should return 400 if validation fails", async () => {
    const app = createTestApp();
    const response = await supertest(app).post("/auth/register").send({
      username: "te", // Too short
      password: "short", // Missing requirements
    });

    // Assertions
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error", "Validation failed");
    expect(response.body).toHaveProperty("details");
  });
});

describe("POST /login", () => {
  it("should login a user with valid credentials", async () => {
    const app = createTestApp();

    // Register the user first
    await supertest(app).post("/auth/register").send({
      username: "loginuser",
      password: "Password123!",
    });

    // Now try to login
    const loginResponse = await supertest(app).post("/auth/login").send({
      username: "loginuser",
      password: "Password123!",
    });

    // Assertions
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body).toHaveProperty("user");
    expect(loginResponse.body).toHaveProperty("token");
    expect(loginResponse.body.user.username).toBe("loginuser");
  });

  it("should return 401 if user not found", async () => {
    const app = createTestApp();
    const response = await supertest(app).post("/auth/login").send({
      username: "nonexistentuser",
      password: "Password123!",
    });

    // Assertions
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty(
      "error",
      "Invalid username or password",
    );
  });

  it("should return 401 if password is incorrect", async () => {
    const app = createTestApp();

    // Register the user first
    await supertest(app).post("/auth/register").send({
      username: "passworduser",
      password: "Password123!",
    });

    // Now try to login with wrong password
    const loginResponse = await supertest(app).post("/auth/login").send({
      username: "passworduser",
      password: "WrongPassword123!",
    });

    // Assertions
    expect(loginResponse.status).toBe(401);
    expect(loginResponse.body).toHaveProperty(
      "error",
      "Invalid username or password",
    );
  });
});

describe("POST /logout", () => {
  it("should logout a user with valid token", async () => {
    const app = createTestApp();

    // Register the user first
    await supertest(app).post("/auth/register").send({
      username: "logoutuser",
      password: "Password123!",
    });

    const loginResponse = await supertest(app).post("/auth/login").send({
      username: "logoutuser",
      password: "Password123!",
    });

    const token = loginResponse.body.token;

    // Reset mocks
    vi.clearAllMocks();

    // Now try to logout
    const logoutResponse = await supertest(app)
      .post("/auth/logout")
      .set("Authorization", `Bearer ${token}`);

    // Assertions
    expect(logoutResponse.status).toBe(204);

    // Verify token is invalidated by trying to use it again
    const meResponse = await supertest(app)
      .get("/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(meResponse.status).toBe(401);
  });

  it("should return 401 if no token provided", async () => {
    const app = createTestApp();
    const response = await supertest(app).post("/auth/logout");

    // Assertions
    expect(response.status).toBe(401);
  });
});

describe("GET /me", () => {
  it("should return the current user", async () => {
    const app = createTestApp();

    // Register the user first
    await supertest(app).post("/auth/register").send({
      username: "meuser",
      password: "Password123!",
    });

    const loginResponse = await supertest(app).post("/auth/login").send({
      username: "meuser",
      password: "Password123!",
    });

    const token = loginResponse.body.token;

    // Now try to get current user
    const meResponse = await supertest(app)
      .get("/auth/me")
      .set("Authorization", `Bearer ${token}`);

    // Assertions
    expect(meResponse.status).toBe(200);
    expect(meResponse.body).toHaveProperty("username", "meuser");
    expect(meResponse.body).toHaveProperty("id");
  });

  it("should return 401 if no token provided", async () => {
    const app = createTestApp();
    const response = await supertest(app).get("/auth/me");

    // Assertions
    expect(response.status).toBe(401);
  });
});
