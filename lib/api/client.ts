// Thin HTTP client for the CulturaConecta Go backend.
//
// The backend wraps every successful payload in `{ "data": ... }` and every
// failure in `{ status, error, message, details? }`. This client unwraps the
// success envelope and throws a typed `ApiError` on failures so callers can
// surface backend validation messages directly.
//
// Auth uses a short-lived access token (15 min) plus a long-lived refresh
// token (7 days). When an authenticated request returns 401, the client
// transparently exchanges the refresh token for a new access token and retries
// the original request once. If the refresh fails, the session is cleared.

import {
  ACCESS_TOKEN_STORAGE_KEY,
  API_BASE_URL,
  API_PREFIX,
  REFRESH_TOKEN_STORAGE_KEY,
} from "./config"

export interface FieldError {
  field: string
  message: string
}

interface ErrorEnvelope {
  status: number
  error: string
  message: string
  details?: FieldError[]
}

export class ApiError extends Error {
  status: number
  details: FieldError[]

  constructor(message: string, status: number, details: FieldError[] = []) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.details = details
  }
}

// --- Token helpers (client-side only) -------------------------------------

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)
}

export function setTokens(accessToken: string, refreshToken?: string) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken)
  if (refreshToken !== undefined) {
    window.localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken)
  }
}

export function clearTokens() {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
  window.localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
}

// Optional callback invoked when the session can no longer be refreshed, so the
// auth context can reset its state. Registered by the AuthProvider.
let onSessionExpired: (() => void) | null = null
export function setSessionExpiredHandler(handler: (() => void) | null) {
  onSessionExpired = handler
}

// --- Refresh-token exchange ------------------------------------------------

// Performed with a raw fetch (no envelope retry) to avoid recursion. Shares a
// single in-flight promise so concurrent 401s only trigger one refresh.
let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return null

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}${API_PREFIX}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        })
        if (!res.ok) return null
        const text = await res.text()
        const json = text ? safeParse(text) : null
        const data =
          json && typeof json === "object" && "data" in json
            ? (json as { data: { access_token?: string } }).data
            : (json as { access_token?: string } | null)
        const newAccess = data?.access_token ?? null
        if (newAccess) setTokens(newAccess)
        return newAccess
      } catch {
        return null
      } finally {
        refreshPromise = null
      }
    })()
  }

  return refreshPromise
}

// --- Request helper --------------------------------------------------------

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  body?: unknown
  query?: Record<string, string | number | undefined | null>
  // When true, attaches the stored bearer token (when present).
  auth?: boolean
  signal?: AbortSignal
  // Internal: prevents infinite retry loops after a token refresh.
  _retried?: boolean
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const url = new URL(`${API_BASE_URL}${API_PREFIX}${path}`)
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") continue
      url.searchParams.set(key, String(value))
    }
  }
  return url.toString()
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, query, auth = true, signal, _retried = false } = options

  const headers: Record<string, string> = {}
  if (body !== undefined) headers["Content-Type"] = "application/json"

  if (auth) {
    const token = getAccessToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  let response: Response
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    })
  } catch {
    throw new ApiError(
      "No se pudo conectar con el servidor. Verifica tu conexión o que la API esté disponible.",
      0,
    )
  }

  // On a 401 for an authenticated request, try refreshing the access token once
  // and replay the original request.
  if (response.status === 401 && auth && !_retried) {
    const newAccess = await refreshAccessToken()
    if (newAccess) {
      return apiRequest<T>(path, { ...options, _retried: true })
    }
    // Refresh failed: the session is no longer valid.
    clearTokens()
    onSessionExpired?.()
  }

  // 204 / empty responses
  const text = await response.text()
  const json = text ? safeParse(text) : null

  if (!response.ok) {
    const envelope = json as ErrorEnvelope | null
    throw new ApiError(
      envelope?.message || envelope?.error || `Error ${response.status}`,
      response.status,
      envelope?.details ?? [],
    )
  }

  // Successful payloads are wrapped in { data: ... }
  if (json && typeof json === "object" && "data" in json) {
    return (json as { data: T }).data
  }
  return json as T
}

function safeParse(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}
