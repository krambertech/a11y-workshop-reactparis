import "@testing-library/jest-dom";

import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { setupServer } from "msw/node";

import { handlers } from "./handlers.ts";

// Mock CSS modules
vi.mock("*.module.css", () => {
  return {
    default: {},
  };
});

// Set up MSW server with our API handlers
export const server = setupServer(...handlers);

// Start the server before all tests
beforeAll(() => {
  server.listen();
});

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers();
  cleanup();
});

// Close the server after all tests
afterAll(() => server.close());
