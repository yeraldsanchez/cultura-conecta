"use client"

// Real session + auth context for CulturaConecta.
//
// This replaces the previous mock implementation. It now:
//  - calls the real /auth/login + /auth/register endpoints,
//  - persists the JWT (via lib/api token helpers) and decodes the user id,
//  - hydrates the session from localStorage on mount,
//  - tracks the profile created during onboarding (POST /users) so the UI can
//    show name + cultural preferences without a profile-fetch endpoint.
//
// IMPORTANT: the backend has no "get profile" endpoint yet, so a profile that
// was created in a previous session cannot be re-fetched. We therefore cache
// the last known profile alongside the token. See TODO(api) markers below.

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import {
  ApiError,
  clearToken,
  getToken,
  getUserIdFromToken,
  isTokenExpired,
  login as apiLogin,
  register as apiRegister,
  setToken,
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
  logout: () => void
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

  // Hydrate from a previously stored token on first mount.
  useEffect(() => {
    const token = getToken()
    if (token && !isTokenExpired(token)) {
      const id = getUserIdFromToken(token)
      if (id !== null) {
        const cached = readCachedProfile()
        setUser(
          buildUser(id, cached?.email, cached && cached.user_id === id ? cached : null),
        )
      }
    } else if (token) {
      // Expired token: clean up.
      clearToken()
      writeCachedProfile(null)
    }
    setIsInitializing(false)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { token } = await apiLogin(email, password)
    setToken(token)
    const id = getUserIdFromToken(token)
    if (id === null) {
      clearToken()
      throw new ApiError("No se pudo leer la sesión del token recibido.", 0)
    }
    // No profile-fetch endpoint: reuse a cached profile only if it matches this user.
    const cached = readCachedProfile()
    const profile = cached && cached.user_id === id ? cached : null
    if (!profile) writeCachedProfile(null)
    setUser(buildUser(id, email, profile))
  }, [])

  const register = useCallback(async (email: string, password: string) => {
    const { user_id } = await apiRegister(email, password)
    return user_id
  }, [])

  const logout = useCallback(() => {
    clearToken()
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
