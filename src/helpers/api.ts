import { z } from "zod";
import { LoginCredentials, RegisterCredentials, Til, User } from "../../api";

/**
 * Re-export API types
 */
export type { LoginCredentials, RegisterCredentials, Til, User };

// Zod schema for API errors
const apiErrorSchema = z.object({
  error: z.string(),
  details: z.array(
    z.object({
      path: z.array(z.string()),
      message: z.string(),
    }),
  ),
});

export type ApiError = z.infer<typeof apiErrorSchema>;

/**
 * Custom error class that preserves API error structure
 */
export class ApiValidationError extends Error {
  details: ApiError["details"];

  constructor(message: string, details: ApiError["details"]) {
    super(message);
    this.name = "ApiValidationError";
    this.details = details;
  }
}

/**
 * Options for API requests
 */
export type ApiRequestOptions<TBody = unknown> = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: TBody;
  headers?: Record<string, string>;
  includeCredentials?: boolean;
};

async function parseErrorResponse(
  response: Response,
): Promise<ApiValidationError | Error> {
  try {
    const errorData = await response.json();
    const result = apiErrorSchema.safeParse(errorData);

    if (result.success) {
      return new ApiValidationError(result.data.error, result.data.details);
    }

    if (errorData.error && typeof errorData.error === "string") {
      return new Error(errorData.error);
    }

    return new Error(`${response.status}: ${response.statusText}`);
  } catch (error) {
    if (error instanceof Error) {
      return error;
    }

    return new Error(String(error));
  }
}

/**
 * Make an API request to the specified endpoint
 */
export async function apiRequest<TResponse, TBody = unknown>(
  endpoint: string,
  options: ApiRequestOptions<TBody> = {},
): Promise<TResponse> {
  const {
    method = "GET",
    body,
    headers = {},
    includeCredentials = false,
  } = options;

  // Prepare headers
  const requestHeaders = { ...headers };

  // Add content type for requests with body
  if (body) {
    requestHeaders["Content-Type"] = "application/json";
  }

  // Add auth token if available and requested
  const token = localStorage.getItem("token");
  if (token) {
    requestHeaders["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`/api${endpoint}`, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
    credentials: includeCredentials ? "include" : "same-origin",
  });

  // Handle successful response
  if (response.ok) {
    try {
      // For 204 No Content, return null
      if (response.status === 204) {
        return null as TResponse;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      throw new Error("Unknown error");
    }
  }

  // Handle error response
  const error = await parseErrorResponse(response);
  throw error;
}

// Type for creating/updating a TIL
export type TilInput = {
  title: string;
  content: string;
};

// Type for TIL filter options
export type TilFilterOptions = {
  userId?: string;
  saved?: boolean;
};

type LoginResponse = {
  token: string;
  user: User;
};

// API functions
export const api = {
  // Auth API functions
  auth: {
    /**
     * Login user with credentials
     */
    async login(credentials: LoginCredentials): Promise<LoginResponse> {
      return apiRequest<LoginResponse>("/auth/login", {
        method: "POST",
        body: credentials,
      });
    },

    /**
     * Register a new user
     */
    async register(credentials: RegisterCredentials): Promise<User> {
      return apiRequest<User>("/auth/register", {
        method: "POST",
        body: credentials,
      });
    },

    /**
     * Logout the current user
     */
    async logout(): Promise<void> {
      return apiRequest<void>("/auth/logout", {
        method: "POST",
      });
    },

    /**
     * Get the current user's profile
     */
    async me() {
      return apiRequest<User>("/auth/me");
    },
  },

  // TIL API functions
  tils: {
    /**
     * Get TILs with optional filters
     * @param options Filter options
     * - userId: Get TILs by a specific user
     * - saved: Get TILs saved by the current user
     */
    async list(options: TilFilterOptions = {}): Promise<Til[]> {
      // Build query string from options
      const params = new URLSearchParams();

      if (options.userId) {
        params.append("userId", options.userId);
      }

      if (options.saved) {
        params.append("saved", "true");
      }

      const queryString = params.toString();
      const endpoint = queryString ? `/tils?${queryString}` : "/tils";

      return apiRequest<Til[]>(endpoint);
    },

    /**
     * Get a TIL by ID
     */
    async getById(id: string): Promise<Til> {
      return apiRequest<Til>(`/tils/${id}`);
    },

    /**
     * Create a new TIL
     */
    async create(til: TilInput): Promise<Til> {
      return apiRequest<Til, TilInput>("/tils", {
        method: "POST",
        body: til,
      });
    },

    /**
     * Update a TIL
     */
    async update(id: string, til: TilInput): Promise<Til> {
      return apiRequest<Til, TilInput>(`/tils/${id}`, {
        method: "PUT",
        body: til,
      });
    },

    /**
     * Delete a TIL
     */
    async delete(id: string): Promise<void> {
      return apiRequest<void>(`/tils/${id}`, {
        method: "DELETE",
      });
    },

    /**
     * Save a TIL for the current user
     */
    async save(id: string): Promise<Til> {
      return apiRequest<Til>(`/tils/${id}/save`, {
        method: "POST",
      });
    },

    /**
     * Unsave a TIL for the current user
     */
    async unsave(id: string): Promise<Til> {
      return apiRequest<Til>(`/tils/${id}/save`, {
        method: "DELETE",
      });
    },
  },

  // User API functions
  users: {
    /**
     * Get all users
     */
    async list(): Promise<User[]> {
      return apiRequest<User[]>("/users");
    },

    /**
     * Get a user by ID
     */
    async getById(id: string): Promise<User> {
      return apiRequest<User>(`/users/${id}`);
    },
  },
};
