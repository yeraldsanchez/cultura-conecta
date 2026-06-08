// Decodes the `sub` (user id) from a JWT issued by the backend.
// The backend signs HS256 tokens with claims { sub, exp, iat } where `sub`
// is the numeric user id. We only need to read the payload client-side; the
// backend remains the source of truth for verification.

interface JwtPayload {
  sub?: number | string
  exp?: number
  iat?: number
}

function base64UrlDecode(input: string): string {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/")
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4))
  if (typeof window !== "undefined" && typeof window.atob === "function") {
    return decodeURIComponent(
      Array.prototype.map
        .call(window.atob(padded + pad), (c: string) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    )
  }
  return Buffer.from(padded + pad, "base64").toString("utf-8")
}

export function decodeJwt(token: string): JwtPayload | null {
  const parts = token.split(".")
  if (parts.length !== 3) return null
  try {
    return JSON.parse(base64UrlDecode(parts[1])) as JwtPayload
  } catch {
    return null
  }
}

export function getUserIdFromToken(token: string): number | null {
  const payload = decodeJwt(token)
  if (!payload?.sub) return null
  const id = typeof payload.sub === "string" ? Number.parseInt(payload.sub, 10) : payload.sub
  return Number.isFinite(id) ? id : null
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeJwt(token)
  if (!payload?.exp) return false
  return Date.now() >= payload.exp * 1000
}
