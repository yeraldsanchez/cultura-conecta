'use client'

// Dashboard / home for authenticated users.
//
// Backend-aligned:
//   - "Grupos para descubrir" comes from GET /groups/suggestions — the backend
//     matches the user's depth level, interests and focus types and already
//     excludes groups the user belongs to. Requires a cultural profile to
//     return anything (it joins against user_profiles).
//   - "Mis grupos" comes from GET /users/:id/groups — every group the user
//     created OR joined, with their role in each. This is the real
//     created+joined relationship, not just `created_by`.
//   - Events now have full backend support, but only scoped to a single group
//     (GET /groups/:id/events). There is no "all my groups' events" endpoint,
//     so an aggregated events feed here would need one request per group; see
//     the group detail page (app/(authenticated)/grupo/[id]/page.tsx) for the
//     real per-group events list, creation and attendance confirmation.

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { GroupCard } from '@/components/group-card'
import { EmptyState } from '@/components/empty-state'
import { useAuth } from '@/lib/auth-context'
import { getSuggestedGroups, getGroupsByMember, ApiError } from '@/lib/api'
import { mapGroup, mapUserGroup, depthLevelLabel } from '@/lib/view-models'
import { Plus, Search, ArrowRight, Sparkles, Users, AlertCircle, Layers } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()

  const {
    data: suggestedData,
    error: suggestedError,
    isLoading: suggestedLoading,
  } = useSWR(user ? ['dashboard-suggestions', user.userId] : null, () =>
    getSuggestedGroups({ page: 1, limit: 6 }),
  )

  const {
    data: myGroupsData,
    error: myGroupsError,
    isLoading: myGroupsLoading,
  } = useSWR(user ? ['user-groups', user.userId] : null, () => getGroupsByMember(user!.userId))

  const suggestedGroups = (suggestedData?.items ?? []).map(mapGroup)
  const myGroups = (myGroupsData ?? []).map(mapUserGroup)

  const profile = user?.profile ?? null
  const interests = profile?.interests ?? []
  const focusTypes = profile?.focus_types ?? []

  const isLoading = suggestedLoading || myGroupsLoading

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
              {`¡Hola, ${user?.name?.split(' ')[0] || 'de nuevo'}!`}
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
        {profile && (
          <Card className="mt-6 border-border/50 bg-muted/30">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                {interests.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Intereses:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {interests.map((i) => (
                        <Badge key={i.id} variant="secondary">
                          {i.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {focusTypes.length > 0 && (
                  <>
                    <div className="hidden sm:block w-px h-6 bg-border" />
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Enfoques:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {focusTypes.map((f) => (
                          <Badge key={f.id} variant="outline" className="gap-1">
                            <Layers className="w-3 h-3" />
                            {f.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                <div className="hidden sm:block w-px h-6 bg-border" />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Nivel:</span>
                  <Badge variant="outline">{depthLevelLabel(profile.depth_level)}</Badge>
                </div>
                <Link href="/perfil" className="ml-auto">
                  <Button variant="ghost" size="sm" className="text-primary">
                    Ver perfil
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Suggested groups */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="font-serif text-xl font-semibold text-foreground">
              Grupos para descubrir
            </h2>
          </div>
          <Link href="/explorar">
            <Button variant="ghost" size="sm" className="text-primary">
              Ver todos
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        {suggestedError ? (
          <Card className="border-destructive/30">
            <CardContent className="p-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">No pudimos cargar las sugerencias</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {suggestedError instanceof ApiError
                    ? suggestedError.message
                    : 'Verifica tu conexión con el servidor.'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : suggestedGroups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestedGroups.slice(0, 6).map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                variant="featured"
                onView={() => router.push(`/grupo/${group.id}`)}
              />
            ))}
          </div>
        ) : !profile ? (
          <EmptyState
            type="incomplete-profile"
            title="Completa tu perfil cultural"
            description="Las sugerencias se calculan según tus intereses, enfoques y nivel de profundidad. Configura tu perfil para empezar a recibirlas."
            action={{ label: 'Configurar perfil', onClick: () => router.push('/perfil/editar') }}
            secondaryAction={{ label: 'Explorar', onClick: () => router.push('/explorar') }}
          />
        ) : (
          <EmptyState
            type="no-groups"
            title="Aún no tenemos sugerencias para ti"
            description="No encontramos grupos que coincidan con tu perfil cultural todavía. Explora el catálogo completo o crea tu propio grupo."
            action={{ label: 'Crear grupo', onClick: () => router.push('/crear-grupo') }}
            secondaryAction={{ label: 'Explorar', onClick: () => router.push('/explorar') }}
          />
        )}
      </section>

      {/* My groups (created + joined) */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-secondary" />
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

        {myGroupsError ? (
          <Card className="border-destructive/30">
            <CardContent className="p-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">No pudimos cargar tus grupos</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {myGroupsError instanceof ApiError
                    ? myGroupsError.message
                    : 'Verifica tu conexión con el servidor.'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : myGroups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myGroups.slice(0, 3).map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                role={group.role}
                isOwner={group.createdBy === user?.userId}
                onView={() => router.push(`/grupo/${group.id}`)}
              />
            ))}
          </div>
        ) : (
          <Card className="border-border/50">
            <CardContent className="py-8">
              <EmptyState
                type="no-groups"
                title="Todavía no perteneces a ningún grupo"
                description="Únete a un grupo que te interese o crea el tuyo propio para reunir a personas con tus mismos intereses culturales."
                action={{ label: 'Explorar grupos', onClick: () => router.push('/explorar') }}
                secondaryAction={{ label: 'Crear grupo', onClick: () => router.push('/crear-grupo') }}
              />
            </CardContent>
          </Card>
        )}
      </section>
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
      <div>
        <Skeleton className="h-6 w-32 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    </div>
  )
}
