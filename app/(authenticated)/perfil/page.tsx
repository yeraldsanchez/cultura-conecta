'use client'

// Profile page.
//
// Backend-aligned: there is NO GET-profile endpoint, so we render the session
// profile captured during onboarding (POST /users) and cached by the auth
// context. If the user logged in on a device where the profile was never
// created in-session, we show a notice instead of fabricating data.
// "Mis grupos" uses the real created_by relationship. Events/attendance have no
// backend endpoint and are intentionally not shown here.

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { GroupCard } from '@/components/group-card'
import { EmptyState } from '@/components/empty-state'
import { useAuth } from '@/lib/auth-context'
import { listGroups } from '@/lib/api'
import { mapGroup, depthLevelLabel, initialsFrom } from '@/lib/view-models'
import { Mail, Edit, Users, ArrowRight, Layers, Heart, Info } from 'lucide-react'

export default function PerfilPage() {
  const router = useRouter()
  const { user } = useAuth()

  const { data } = useSWR(['profile-groups'], () => listGroups({ page: 1, limit: 50 }))
  const myGroups = (data?.items ?? []).map(mapGroup).filter((g) => g.createdBy === user?.userId)

  if (!user) return null

  const profile = user.profile
  const displayName = user.name || profile?.name || 'Tu perfil'
  const email = user.email || profile?.email || ''
  const initials = initialsFrom(user.name || email)

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <Card className="border-border/50 overflow-hidden">
        <div className="h-24 bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20" />
        <CardContent className="pt-0 pb-6 px-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
            <Avatar className="w-24 h-24 border-4 border-card bg-primary/10">
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 sm:pb-2">
              <h1 className="font-serif text-2xl font-bold text-foreground">{displayName}</h1>
              {email && (
                <p className="text-muted-foreground flex items-center gap-1.5 mt-1">
                  <Mail className="w-4 h-4" />
                  {email}
                </p>
              )}
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

      {profile ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Cultural profile */}
          <Card className="lg:col-span-2 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Perfil cultural</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Interests (categories) */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-1.5">
                  <Heart className="w-4 h-4" />
                  Intereses
                </p>
                {profile.interests.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((i) => (
                      <Badge key={i.id} variant="secondary" className="px-3 py-1.5">
                        {i.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Sin intereses seleccionados.</p>
                )}
              </div>

              {/* Focus types */}
              <div className="pt-4 border-t border-border/50">
                <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  Tipos de enfoque
                </p>
                {profile.focus_types.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.focus_types.map((f) => (
                      <Badge key={f.id} variant="outline" className="px-3 py-1.5">
                        {f.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Sin enfoques seleccionados.</p>
                )}
              </div>

              {/* Level */}
              <div className="pt-4 border-t border-border/50">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Nivel de profundidad
                </p>
                <p className="font-medium text-foreground">
                  {depthLevelLabel(profile.depth_level)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="space-y-6">
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-4xl font-serif font-bold text-primary">{myGroups.length}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {myGroups.length === 1 ? 'Grupo creado' : 'Grupos creados'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="border-border/50 mt-6">
          <CardContent className="py-8">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Perfil cultural no disponible</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Tu perfil cultural se crea durante el onboarding. Como la API aún no expone una
                  consulta de perfil, no podemos recuperarlo en esta sesión. Puedes (re)configurarlo
                  desde la edición de perfil.
                </p>
                <Button className="mt-4" onClick={() => router.push('/perfil/editar')}>
                  Configurar perfil
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* My groups */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-muted-foreground" />
            <h2 className="font-serif text-xl font-semibold text-foreground">Mis grupos</h2>
          </div>
          {myGroups.length > 0 && (
            <Link href="/mis-grupos">
              <Button variant="ghost" size="sm" className="text-primary">
                Ver todos
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          )}
        </div>

        {myGroups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myGroups.slice(0, 4).map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                isOwner
                onView={() => router.push(`/grupo/${group.id}`)}
              />
            ))}
          </div>
        ) : (
          <Card className="border-border/50">
            <CardContent className="py-8">
              <EmptyState
                type="no-groups"
                description="Aún no has creado grupos."
                action={{ label: 'Crear grupo', onClick: () => router.push('/crear-grupo') }}
              />
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  )
}
