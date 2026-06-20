'use client'

// Backend-aligned: GET /users/:id (getProfile) now exists, so the cultural
// profile is refreshed from the server here instead of trusting only the
// local cache, which used to be the only source (see lib/auth-context.tsx).
// This runs once per session in the background and never blocks rendering —
// a 404 just means the user hasn't completed onboarding yet.

import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { Loader2 } from 'lucide-react'
import { Header } from '@/components/header'
import { useAuth } from '@/lib/auth-context'
import { getProfile, ApiError } from '@/lib/api'

function AuthenticatedLayoutContent({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { user, isAuthenticated, isInitializing, logout, setProfile } = useAuth()

  // Route guard: send unauthenticated visitors to the login screen.
  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      router.replace('/login')
    }
  }, [isInitializing, isAuthenticated, router])

  useSWR(
    isAuthenticated && user ? ['hydrate-profile', user.userId] : null,
    () => getProfile(user!.userId),
    {
      onSuccess: (profile) => setProfile(profile),
      onError: (err) => {
        // A 404 just means this user hasn't created a cultural profile yet
        // (skipped/abandoned onboarding) — not worth surfacing as an error.
        if (!(err instanceof ApiError && err.status === 404)) {
          console.error('No se pudo actualizar el perfil desde el servidor.', err)
        }
      },
      revalidateOnFocus: false,
    },
  )

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  if (isInitializing || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin" aria-hidden="true" />
          <p className="text-sm">Cargando tu sesión…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={user ? { name: user.name, email: user.email ?? '' } : null}
        onLogout={handleLogout}
      />
      <main className="pb-20">{children}</main>
    </div>
  )
}

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  return <AuthenticatedLayoutContent>{children}</AuthenticatedLayoutContent>
}
