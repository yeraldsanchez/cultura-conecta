'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { GroupCard } from '@/components/group-card'
import { EventCard } from '@/components/event-card'
import { EmptyState } from '@/components/empty-state'
import { useApp } from '@/lib/app-context'
import { categoryLabels, focusLabels, levelLabels, focusDescriptions, levelDescriptions } from '@/lib/types'
import type { CulturalCategory } from '@/lib/types'
import { 
  Film, 
  BookOpen, 
  Theater, 
  Mail,
  Calendar,
  Edit,
  Users,
  ArrowRight
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const categoryIcons: Record<CulturalCategory, typeof Film> = {
  cine: Film,
  teatro: Theater,
  lectura: BookOpen,
}

export default function PerfilPage() {
  const router = useRouter()
  const { user, userGroups, events } = useApp()
  
  const userInitials = user?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || user?.email[0].toUpperCase() || 'U'
  
  const upcomingEvents = events.filter(e => 
    e.isAttending && new Date(e.date) > new Date()
  ).slice(0, 3)
  
  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <Card className="border-border/50 overflow-hidden">
        <div className="h-24 bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20" />
        <CardContent className="pt-0 pb-6 px-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
            <Avatar className="w-24 h-24 border-4 border-card bg-primary/10">
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 sm:pb-2">
              <h1 className="font-serif text-2xl font-bold text-foreground">
                {user.name || 'Usuario'}
              </h1>
              <p className="text-muted-foreground flex items-center gap-1.5 mt-1">
                <Mail className="w-4 h-4" />
                {user.email}
              </p>
            </div>
            <Link href="/perfil/editar">
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Editar perfil
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
      
      {/* Profile details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Cultural profile */}
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Perfil cultural</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Categories */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-3">Categorías de interés</p>
              <div className="flex flex-wrap gap-2">
                {user.categories.map((cat) => {
                  const Icon = categoryIcons[cat]
                  return (
                    <Badge key={cat} variant="secondary" className="gap-1.5 px-3 py-1.5">
                      <Icon className="w-4 h-4" />
                      {categoryLabels[cat]}
                    </Badge>
                  )
                })}
              </div>
            </div>
            
            {/* Focus */}
            <div className="pt-4 border-t border-border/50">
              <p className="text-sm font-medium text-muted-foreground mb-2">Tipo de enfoque</p>
              <p className="font-medium text-foreground">{focusLabels[user.focus]}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {focusDescriptions[user.focus]}
              </p>
            </div>
            
            {/* Level */}
            <div className="pt-4 border-t border-border/50">
              <p className="text-sm font-medium text-muted-foreground mb-2">Nivel de profundidad</p>
              <div className="flex items-center gap-3">
                <p className="font-medium text-foreground">{levelLabels[user.level]}</p>
                <div className="flex gap-1">
                  {['casual', 'intermedio', 'analitico', 'tecnico'].map((l, i) => {
                    const levelIndex = ['casual', 'intermedio', 'analitico', 'tecnico'].indexOf(user.level)
                    return (
                      <div
                        key={l}
                        className={`w-2 h-2 rounded-full ${
                          i <= levelIndex ? 'bg-primary' : 'bg-border'
                        }`}
                      />
                    )
                  })}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {levelDescriptions[user.level]}
              </p>
            </div>
            
            {/* Member since */}
            <div className="pt-4 border-t border-border/50">
              <p className="text-sm font-medium text-muted-foreground mb-2">Miembro desde</p>
              <p className="text-sm text-foreground flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                {format(new Date(user.createdAt), "d 'de' MMMM, yyyy", { locale: es })}
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Stats */}
        <div className="space-y-6">
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-4xl font-serif font-bold text-primary">
                  {userGroups.length}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {userGroups.length === 1 ? 'Grupo' : 'Grupos'}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-4xl font-serif font-bold text-secondary">
                  {upcomingEvents.length}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {upcomingEvents.length === 1 ? 'Evento próximo' : 'Eventos próximos'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* My groups */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-muted-foreground" />
            <h2 className="font-serif text-xl font-semibold text-foreground">Mis grupos</h2>
          </div>
          <Link href="/mis-grupos">
            <Button variant="ghost" size="sm" className="text-primary">
              Ver todos
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
        
        {userGroups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userGroups.slice(0, 4).map((group) => (
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
      <section className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-serif text-xl font-semibold text-foreground">
            Eventos a los que asistiré
          </h2>
        </div>
        
        {upcomingEvents.length > 0 ? (
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <EventCard 
                key={event.id} 
                event={event}
                variant="compact"
              />
            ))}
          </div>
        ) : (
          <Card className="border-border/50">
            <CardContent className="py-8">
              <EmptyState
                type="no-events"
                description="No tienes eventos próximos confirmados."
              />
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  )
}
