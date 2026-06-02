'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { AppProvider, useApp } from '@/lib/app-context'

function AuthenticatedLayoutContent({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { user, logout } = useApp()
  
  const handleLogout = () => {
    logout()
    router.push('/')
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Header 
        user={user} 
        onLogout={handleLogout}
      />
      <main className="pb-20">
        {children}
      </main>
    </div>
  )
}

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  return (
    <AppProvider>
      <AuthenticatedLayoutContent>
        {children}
      </AuthenticatedLayoutContent>
    </AppProvider>
  )
}
