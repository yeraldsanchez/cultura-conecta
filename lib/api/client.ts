// Thin HTTP client for the CulturaConecta Go backend.
//
// The backend wraps every successful payload in `{ "data": ... }` and every
// failure in `{ status, error, message, details? }`. This client unwraps the
// success envelope and throws a typed `ApiError` on failures so callers can
// surface backend validation messages directly.

import { API_BASE_URL, API_PREFIX, TOKEN_STORAGE_KEY } from "./config"

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

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function setToken(token: string) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export function clearToken() {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(TOKEN_STORAGE_KEY)
}

// --- Request helper --------------------------------------------------------

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  body?: unknown
  query?: Record<string, string | number | undefined | null>
  // When true, attaches the stored bearer token (when present).
  auth?: boolean
  signal?: AbortSignal
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
  const { method = "GET", body, query, auth = true, signal } = options

  const headers: Record<string, string> = {}
  if (body !== undefined) headers["Content-Type"] = "application/json"

  if (auth) {
    const token = getToken()
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
