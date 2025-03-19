import { User, Til } from "../../api";

// Mock user data
export const CURRENT_USER: User = {
  id: "test-user-id",
  username: "testuser",
  displayName: "Test User",
  avatarUrl: "https://example.com/avatar.png",
  githubProfileUrl: "https://github.com/testuser",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  publicReposCount: 5,
  publicGistsCount: 2,
  followersCount: 10,
  followingCount: 5,
};

export const generateId = () => crypto.randomUUID();

export function mockTil(data: Partial<Til> = {}): Til {
  const isCurrentUser = data.userId === CURRENT_USER.id || !data.userId;

  const user = isCurrentUser ? CURRENT_USER : mockUser();

  return {
    id: generateId(),
    title: "Test Til",
    content: "Test content",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: user.id,
    saved: false,
    user,
    ...data,
  };
}

export function mockUser(data: Partial<User> = {}): User {
  return {
    id: generateId(),
    username: "testuser",
    displayName: "Test User",
    avatarUrl: "https://example.com/avatar.png",
    githubProfileUrl: "https://github.com/testuser",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publicReposCount: 5,
    publicGistsCount: 2,
    followersCount: 10,
    followingCount: 5,
    ...data,
  };
}
