// Base URL for the Go (Gin) backend. Configure via NEXT_PUBLIC_API_URL.
// In local development the Go service defaults to http://localhost:8080.
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "https://api-cultura-conecta.onrender.com"

// All backend routes are mounted under /api/v1.
export const API_PREFIX = "/api/v1"

// The backend issues a short-lived access token (15 min) plus a long-lived
// refresh token (7 days). We persist both client-side and transparently
// exchange the refresh token for a new access token when the access token
// expires (see lib/api/client.ts).
export const ACCESS_TOKEN_STORAGE_KEY = "cc_access_token"
export const REFRESH_TOKEN_STORAGE_KEY = "cc_refresh_token"
