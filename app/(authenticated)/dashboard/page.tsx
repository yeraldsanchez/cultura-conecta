'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { GroupCard } from '@/components/group-card'
import { EventCard } from '@/components/event-card'
import { EmptyState } from '@/components/empty-state'
import { useApp } from '@/lib/app-context'
import { categoryLabels, focusLabels, levelLabels } from '@/lib/types'
import { 
  Film, 
  BookOpen, 
  Theater, 
  Plus, 
  Search, 
  ArrowRight,
  Sparkles,
  Calendar,
  Users
} from 'lucide-react'
import type { CulturalCategory } from '@/lib/types'

const categoryIcons: Record<CulturalCategory, typeof Film> = {
  cine: Film,
  teatro: Theater,
  lectura: BookOpen,
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, suggestedGroups, userGroups, events, joinGroup, login } = useApp()
  const [isLoading, setIsLoading] = useState(true)
  
  // Simulate initial data load and auto-login for demo
  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        await login('ana.martinez@email.com', 'demo123')
      }
      setIsLoading(false)
    }
    loadData()
  }, [user, login])
  
  const upcomingEvents = events.filter(e => new Date(e.date) > new Date()).slice(0, 2)
  
  if (isLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Welcome section */}
      <section className="mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
              ¡Hola, {user?.name?.split(' ')[0] || 'Usuario'}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Descubre grupos afines a tus intereses culturales
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/explorar">
              <Button variant="outline">
                <Search className="w-4 h-4 mr-2" />
                Explorar
              </Button>
            </Link>
            <Link href="/crear-grupo">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Crear grupo
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Profile summary */}
        <Card className="mt-6 border-border/50 bg-muted/30">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Intereses:</span>
                <div className="flex gap-1.5">
                  {user?.categories.map((cat) => {
                    const Icon = categoryIcons[cat]
                    return (
                      <Badge key={cat} variant="secondary" className="gap-1">
                        <Icon className="w-3 h-3" />
                        {categoryLabels[cat]}
                      </Badge>
                    )
                  })}
                </div>
              </div>
              <div className="hidden sm:block w-px h-6 bg-border" />
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Enfoque:</span>
                <Badge variant="outline">{user?.focus && focusLabels[user.focus]}</Badge>
              </div>
              <div className="hidden sm:block w-px h-6 bg-border" />
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Nivel:</span>
                <Badge variant="outline">{user?.level && levelLabels[user.level]}</Badge>
              </div>
              <Link href="/perfil/editar" className="ml-auto">
                <Button variant="ghost" size="sm" className="text-primary">
                  Editar perfil
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
      
      {/* Suggested groups */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="font-serif text-xl font-semibold text-foreground">
              Grupos sugeridos para ti
            </h2>
          </div>
          <Link href="/explorar">
            <Button variant="ghost" size="sm" className="text-primary">
              Ver todos
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
        
        {suggestedGroups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestedGroups.slice(0, 6).map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                variant="featured"
                onView={() => router.push(`/grupo/${group.id}`)}
                onJoin={() => joinGroup(group.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            type="no-groups"
            title="No hay sugerencias disponibles"
            description="Explora grupos manualmente o ajusta tu perfil para mejores resultados."
            action={{ label: 'Explorar grupos', onClick: () => router.push('/explorar') }}
            secondaryAction={{ label: 'Editar perfil', onClick: () => router.push('/perfil/editar') }}
          />
        )}
      </section>
      
      {/* Two-column layout for My Groups and Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* My groups */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-secondary" />
              <h2 className="font-serif text-xl font-semibold text-foreground">
                Mis grupos
              </h2>
            </div>
            <Link href="/mis-grupos">
              <Button variant="ghost" size="sm" className="text-primary">
                Ver todos
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          
          {userGroups.length > 0 ? (
            <div className="space-y-4">
              {userGroups.slice(0, 3).map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  variant="compact"
                  isMember
                  onView={() => router.push(`/grupo/${group.id}`)}
                />
              ))}
            </div>
          ) : (
            <Card className="border-border/50">
              <CardContent className="py-8">
                <EmptyState
                  type="no-groups"
                  description="Únete a grupos para verlos aquí."
                  action={{ label: 'Explorar grupos', onClick: () => router.push('/explorar') }}
                />
              </CardContent>
            </Card>
          )}
        </section>
        
        {/* Upcoming events */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-accent-foreground" />
              <h2 className="font-serif text-xl font-semibold text-foreground">
                Próximos eventos
              </h2>
            </div>
          </div>
          
          {upcomingEvents.length > 0 ? (
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  variant="compact"
                  onView={() => router.push(`/evento/${event.id}`)}
                />
              ))}
            </div>
          ) : (
            <Card className="border-border/50">
              <CardContent className="py-8">
                <EmptyState
                  type="no-events"
                  description="Los eventos de tus grupos aparecerán aquí."
                />
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-10">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-80" />
        <Skeleton className="h-20 w-full mt-6" />
      </div>
      <div className="mb-10">
        <Skeleton className="h-6 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <Skeleton className="h-6 w-32 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </div>
        <div>
          <Skeleton className="h-6 w-40 mb-6" />
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
