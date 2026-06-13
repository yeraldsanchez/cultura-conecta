'use client'

import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Header } from '@/components/header'
import { useAuth } from '@/lib/auth-context'

function AuthenticatedLayoutContent({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { user, isAuthenticated, isInitializing, logout } = useAuth()

  // Route guard: send unauthenticated visitors to the login screen.
  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      router.replace('/login')
    }
  }, [isInitializing, isAuthenticated, router])

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
