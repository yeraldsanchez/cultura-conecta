"use client"

// Real session + auth context for CulturaConecta.
//
// This now:
//  - calls the real /auth/login + /auth/register endpoints,
//  - persists the access + refresh tokens (via lib/api token helpers) and
//    decodes the user id from the access token,
//  - hydrates the session from localStorage on mount (instant render) — the
//    authenticated layout then refreshes the profile from the server via
//    GET /users/:id (see app/(authenticated)/layout.tsx), since that endpoint
//    exists and a cache-only profile would go stale across devices/browsers,
//  - revokes the refresh token server-side on logout (/auth/logout),
//  - reacts to refresh failures (expired/revoked session) by resetting state.
//
// login() below still falls back to the cached profile rather than awaiting a
// profile fetch itself, so a slow/flaky GET /users/:id never blocks sign-in —
// the layout's background refresh corrects it moments later either way.

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import {
  ApiError,
  clearTokens,
  getAccessToken,
  getRefreshToken,
  getUserIdFromToken,
  isTokenExpired,
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
  setSessionExpiredHandler,
  setTokens,
  type ProfileDTO,
} from "@/lib/api"

const PROFILE_STORAGE_KEY = "cc_profile"

export interface SessionUser {
  userId: number
  email?: string
  // Display name comes from the profile created during onboarding.
  name?: string
  // Profile fields are present only after onboarding (POST /users) in this session,
  // or restored from the cached profile.
  profile: ProfileDTO | null
}

function buildUser(id: number, email: string | undefined, profile: ProfileDTO | null): SessionUser {
  return {
    userId: id,
    email: profile?.email || email,
    name: profile?.name,
    profile,
  }
}

interface AuthContextType {
  user: SessionUser | null
  isAuthenticated: boolean
  isInitializing: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<number>
  logout: () => Promise<void>
  setProfile: (profile: ProfileDTO) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function readCachedProfile(): ProfileDTO | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as ProfileDTO) : null
  } catch {
    return null
  }
}

function writeCachedProfile(profile: ProfileDTO | null) {
  if (typeof window === "undefined") return
  if (profile) window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile))
  else window.localStorage.removeItem(PROFILE_STORAGE_KEY)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  // Hydrate from previously stored tokens on first mount.
  useEffect(() => {
    const accessToken = getAccessToken()
    const refreshToken = getRefreshToken()

    if (accessToken && !isTokenExpired(accessToken)) {
      const id = getUserIdFromToken(accessToken)
      if (id !== null) {
        const cached = readCachedProfile()
        setUser(buildUser(id, cached?.email, cached && cached.user_id === id ? cached : null))
      }
    } else if (accessToken && refreshToken) {
      // Access token expired but we still have a refresh token: keep the cached
      // session and let the client transparently refresh on the next request.
      const id = getUserIdFromToken(accessToken)
      if (id !== null) {
        const cached = readCachedProfile()
        setUser(buildUser(id, cached?.email, cached && cached.user_id === id ? cached : null))
      }
    } else if (accessToken || refreshToken) {
      // No usable session: clean up.
      clearTokens()
      writeCachedProfile(null)
    }
    setIsInitializing(false)
  }, [])

  // Let the API client notify us when a refresh fails (session expired/revoked).
  useEffect(() => {
    setSessionExpiredHandler(() => {
      writeCachedProfile(null)
      setUser(null)
    })
    return () => setSessionExpiredHandler(null)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { access_token, refresh_token } = await apiLogin(email, password)
    setTokens(access_token, refresh_token)
    const id = getUserIdFromToken(access_token)
    if (id === null) {
      clearTokens()
      throw new ApiError("No se pudo leer la sesión del token recibido.", 0)
    }
    // Optimistic profile: reuse the cached one if it matches this user so the
    // UI has something to render immediately. The authenticated layout's
    // background GET /users/:id refresh corrects this moments after login.
    const cached = readCachedProfile()
    const profile = cached && cached.user_id === id ? cached : null
    if (!profile) writeCachedProfile(null)
    setUser(buildUser(id, email, profile))
  }, [])

  const register = useCallback(async (email: string, password: string) => {
    const { user_id } = await apiRegister(email, password)
    return user_id
  }, [])

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken()
    // Best-effort server-side revocation; never block the client logout on it.
    if (refreshToken) {
      try {
        await apiLogout(refreshToken)
      } catch {
        // Ignore network/validation errors — we clear local state regardless.
      }
    }
    clearTokens()
    writeCachedProfile(null)
    setUser(null)
  }, [])

  const setProfile = useCallback((profile: ProfileDTO) => {
    writeCachedProfile(profile)
    setUser((prev) => buildUser(prev?.userId ?? profile.user_id, profile.email || prev?.email, profile))
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isInitializing,
        login,
        register,
        logout,
        setProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider")
  return ctx
}
