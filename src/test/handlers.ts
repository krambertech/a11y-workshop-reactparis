import { http, HttpResponse } from "msw";
import { CURRENT_USER } from "./mocks";

// MSW handlers for API requests
export const handlers = [
  // Get current user handler
  http.get("/api/auth/me", () => {
    return HttpResponse.json(CURRENT_USER);
  }),
];
