// Base URL for the Go (Gin) backend. Configure via NEXT_PUBLIC_API_URL.
// In local development the Go service defaults to http://localhost:8080.
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "https://api-cultura-conecta.onrender.com"

// All backend routes are mounted under /api/v1.
export const API_PREFIX = "/api/v1"

export const TOKEN_STORAGE_KEY = "cc_token"
