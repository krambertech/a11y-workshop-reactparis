# API Documentation

## Overview

This document outlines the API endpoints for the TIL (Today I Learned) application. The backend is implemented as a simple Express.js server with in-memory storage, designed for demonstration and workshop purposes.

## Base URL

All API endpoints are prefixed with `/api`.

## Endpoints

### Health Check

```http
GET /api/health
```

Check if the API server is running and healthy.

#### Response (200 OK)

```json
{
  "status": "ok",
  "timestamp": "2024-03-15T13:24:14.000Z"
}
```

| Field | Type | Description |
|-------|------|-------------|
| status | string | Server status ("ok" or "error") |
| timestamp | string | Current server time in ISO format |
| message | string | Optional message (only present in error responses) |

#### Error Response (500 Internal Server Error)

```json
{
  "status": "error",
  "timestamp": "2024-03-15T13:24:14.000Z",
  "message": "Service temporarily unavailable"
}
```

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```http
Authorization: Bearer <token>
```

### Register User

```http
POST /api/auth/register
```

Register a new user with GitHub username and password.

#### Request Body

```typescript
{
  username: string,  // GitHub username (min 3, max 20 characters)
  password: string,  // min 8 chars, must contain number and special char
  bio: string        // optional, max 200 characters
}
```

#### Response (201 Created)

```typescript
{
  id: string,
  username: string,
  avatarUrl: string,
  displayName: string,
  githubProfileUrl: string,
  company: string | undefined,
  bio: string | undefined,
  location: string | undefined,
  blog: string | undefined,
  publicReposCount: number,
  publicGistsCount: number,
  followersCount: number,
  followingCount: number,
  githubProfileCreatedAt: string,
  createdAt: string,
  updatedAt: string
}
```

#### Errors
- `400 Bad Request` - Invalid input or username taken
- `400 Bad Request` - GitHub profile not found
- `500 Internal Server Error` - Server error

### Login

```http
POST /api/auth/login
```

Login with username and password.

#### Request Body

```typescript
{
  username: string,  // min 3, max 20 characters
  password: string   // min 8 characters
}
```

#### Response (200 OK)

```typescript
{
  user: {
    id: string,
    username: string,
    avatarUrl: string,
    displayName: string,
    githubProfileUrl: string,
    company: string | undefined,
    bio: string | undefined,
    location: string | undefined,
    blog: string | undefined,
    publicReposCount: number,
    publicGistsCount: number,
    followersCount: number,
    followingCount: number,
    githubProfileCreatedAt: string,
    createdAt: string,
    updatedAt: string
  },
  token: string
}
```

#### Errors
- `400 Bad Request` - Validation failed
- `401 Unauthorized` - Invalid username or password
- `500 Internal Server Error` - Failed to log in

### Logout

```http
POST /api/auth/logout
```

Logout the current user by invalidating their token.

#### Headers
```http
Authorization: Bearer <token>
```

#### Response
- `204 No Content` - Successfully logged out
- `400 Bad Request` - Invalid token format
- `500 Internal Server Error` - Failed to log out

### Get Current User

```http
GET /api/auth/me
```

Get the current user's profile.

#### Headers
```http
Authorization: Bearer <token>
```

#### Response (200 OK)

```typescript
{
  id: string,
  username: string,
  avatarUrl: string,
  displayName: string,
  githubProfileUrl: string,
  company: string | undefined,
  bio: string | undefined,
  location: string | undefined,
  blog: string | undefined,
  publicReposCount: number,
  publicGistsCount: number,
  followersCount: number,
  followingCount: number,
  githubProfileCreatedAt: string,
  createdAt: string,
  updatedAt: string
}
```

#### Errors
- `401 Unauthorized` - Invalid token
- `404 Not Found` - User not found
- `500 Internal Server Error` - Failed to get user profile

### Delete Current User

```http
DELETE /api/auth/me
```

Delete the current user's account.

#### Headers
```http
Authorization: Bearer <token>
```

#### Response
- `204 No Content` - Successfully deleted
- `404 Not Found` - User not found
- `500 Internal Server Error` - Failed to delete user

## Users

### Get All Users

```http
GET /api/users
```

Get a list of all users.

#### Response (200 OK)

```typescript
[
  {
    id: string,
    username: string,
    avatarUrl: string,
    displayName: string,
    githubProfileUrl: string,
    company: string | undefined,
    bio: string | undefined,
    location: string | undefined,
    blog: string | undefined,
    publicReposCount: number,
    publicGistsCount: number,
    followersCount: number,
    followingCount: number,
    githubProfileCreatedAt: string,
    createdAt: string,
    updatedAt: string
  },
  // ...more users
]
```

#### Errors
- `500 Internal Server Error` - Failed to get users

### Get User by ID

```http
GET /api/users/:id
```

Get a specific user by their ID.

#### Parameters
- `id` - User ID

#### Response (200 OK)

```typescript
{
  id: string,
  username: string,
  avatarUrl: string,
  displayName: string,
  githubProfileUrl: string,
  company: string | undefined,
  bio: string | undefined,
  location: string | undefined,
  blog: string | undefined,
  publicReposCount: number,
  publicGistsCount: number,
  followersCount: number,
  followingCount: number,
  githubProfileCreatedAt: string,
  createdAt: string,
  updatedAt: string
}
```

#### Errors
- `404 Not Found` - User not found
- `500 Internal Server Error` - Failed to get user

## TILs (Today I Learned)

### Create TIL

```http
POST /api/tils
```

Create a new TIL entry.

#### Headers
```http
Authorization: Bearer <token>
```

#### Request Body

```typescript
{
  title: string,   // min 3 characters
  content: string  // min 8 characters
}
```

#### Response (201 Created)

```typescript
{
  id: string,
  title: string,
  content: string,
  userId: string,
  createdAt: string,
  updatedAt: string,
  saved: boolean,
  user: {
    // User object (same structure as above)
  }
}
```

#### Errors
- `400 Bad Request` - Validation failed
- `401 Unauthorized` - Invalid token
- `500 Internal Server Error` - Failed to create TIL

### Get TILs

```http
GET /api/tils
```

Get all TILs or filter by user ID or saved status.

#### Headers
```http
Authorization: Bearer <token>
```

#### Query Parameters
- `userId` (optional) - Filter TILs by user ID
- `saved` (optional) - Set to "true" to get only TILs saved by the current user

#### Response (200 OK)

```typescript
[
  {
    id: string,
    title: string,
    content: string,
    userId: string,
    createdAt: string,
    updatedAt: string,
    saved: boolean,
    user: {
      // User object (same structure as above)
    }
  },
  // ...more TILs
]
```

#### Errors
- `400 Bad Request` - Invalid query parameters
- `401 Unauthorized` - Invalid token
- `500 Internal Server Error` - Failed to get TILs

### Get TIL by ID

```http
GET /api/tils/:id
```

Get a specific TIL by ID.

#### Headers
```http
Authorization: Bearer <token>
```

#### Parameters
- `id` - TIL ID

#### Response (200 OK)

```typescript
{
  id: string,
  title: string,
  content: string,
  userId: string,
  createdAt: string,
  updatedAt: string,
  saved: boolean,
  user: {
    // User object (same structure as above)
  }
}
```

#### Errors
- `401 Unauthorized` - Invalid token
- `404 Not Found` - TIL not found
- `500 Internal Server Error` - Failed to get TIL

### Update TIL

```http
PUT /api/tils/:id
```

Update a TIL by ID. Only the owner can update their TIL.

#### Headers
```http
Authorization: Bearer <token>
```

#### Parameters
- `id` - TIL ID

#### Request Body

```typescript
{
  title: string,   // min 3 characters
  content: string  // min 8 characters
}
```

#### Response (200 OK)

```typescript
{
  id: string,
  title: string,
  content: string,
  userId: string,
  createdAt: string,
  updatedAt: string,
  saved: boolean,
  user: {
    // User object (same structure as above)
  }
}
```

#### Errors
- `400 Bad Request` - Validation failed
- `401 Unauthorized` - Invalid token
- `403 Forbidden` - Not the owner of the TIL
- `404 Not Found` - TIL not found
- `500 Internal Server Error` - Failed to update TIL

### Delete TIL

```http
DELETE /api/tils/:id
```

Delete a TIL by ID. Only the owner can delete their TIL.

#### Headers
```http
Authorization: Bearer <token>
```

#### Parameters
- `id` - TIL ID

#### Response
- `204 No Content` - Successfully deleted
- `401 Unauthorized` - Invalid token
- `403 Forbidden` - Not the owner of the TIL
- `404 Not Found` - TIL not found
- `500 Internal Server Error` - Failed to delete TIL

### Save TIL

```http
POST /api/tils/:id/save
```

Save a TIL for the current user.

#### Headers
```http
Authorization: Bearer <token>
```

#### Parameters
- `id` - TIL ID

#### Response (200 OK)

```typescript
{
  id: string,
  title: string,
  content: string,
  userId: string,
  createdAt: string,
  updatedAt: string,
  saved: boolean,
  user: {
    // User object (same structure as above)
  }
}
```

#### Errors
- `401 Unauthorized` - Invalid token
- `404 Not Found` - TIL not found
- `400 Bad Request` - Failed to save TIL
- `500 Internal Server Error` - Failed to save TIL

### Unsave TIL

```http
DELETE /api/tils/:id/save
```

Unsave a TIL for the current user.

#### Headers
```http
Authorization: Bearer <token>
```

#### Parameters
- `id` - TIL ID

#### Response (200 OK)

```typescript
{
  id: string,
  title: string,
  content: string,
  userId: string,
  createdAt: string,
  updatedAt: string,
  saved: boolean,
  user: {
    // User object (same structure as above)
  }
}
```

#### Errors
- `401 Unauthorized` - Invalid token
- `404 Not Found` - TIL not found or not saved
- `400 Bad Request` - Failed to unsave TIL
- `500 Internal Server Error` - Failed to unsave TIL

### Check if TIL is Saved

```http
GET /api/tils/:id/saved
```

Check if a TIL is saved by the current user.

#### Headers
```http
Authorization: Bearer <token>
```

#### Parameters
- `id` - TIL ID

#### Response (200 OK)

```typescript
{
  saved: boolean
}
```

#### Errors
- `401 Unauthorized` - Invalid token
- `404 Not Found` - TIL not found
- `400 Bad Request` - Failed to check if TIL is saved
- `500 Internal Server Error` - Failed to check if TIL is saved

## Error Responses

All error responses follow this format:

```typescript
{
  error: string,
  details?: Array<{
    code: string,
    message: string,
    path: string[]
  }>
}
```

### Validation Error (400 Bad Request)

```json
{
  "error": "Validation failed",
  "details": [
    {
      "code": "too_small",
      "minimum": 3,
      "type": "string",
      "inclusive": true,
      "exact": false,
      "message": "Title must be at least 3 characters",
      "path": ["title"]
    }
  ]
}
```

### Authentication Error (401 Unauthorized)

```json
{
  "error": "Invalid username or password"
}
```

### Authorization Error (403 Forbidden)

```json
{
  "error": "You can only update your own TILs"
}
```

### Not Found Error (404 Not Found)

```json
{
  "error": "TIL not found"
}
```

## Implementation Notes

- This API is implemented using Express.js with an in-memory database
- Authentication is handled with JWT tokens
- GitHub profile information is fetched from the GitHub API
- All data is ephemeral and will be reset when the server restarts
- This API is intended for demonstration and workshop purposes only

## Development

Start the development server:

```bash
npm run api
```

The server will start on `http://localhost:3001`.

Run the API tests:

```bash
npm run test:api
```

This will run all API tests using Vitest.

## Notes

- All data is stored in memory and will be reset when the server restarts
- Passwords are stored in plain text (not for production use)
- GitHub profile data is fetched on registration
