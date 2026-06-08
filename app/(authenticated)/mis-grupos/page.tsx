'use client'

// "Mis grupos" page.
//
// Backend-aligned: the API has no membership/join endpoints, so the only
// user<->group relationship that exists is `created_by`. This page therefore
// shows the groups the current user created. We fetch a page of groups and
// filter by created_by client-side (there is no server-side "owner" filter).

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { GroupCard } from '@/components/group-card'
import { EmptyState } from '@/components/empty-state'
import { useAuth } from '@/lib/auth-context'
import { listGroups, ApiError } from '@/lib/api'
import { mapGroup } from '@/lib/view-models'
import { Plus, AlertCircle } from 'lucide-react'

export default function MisGruposPage() {
  const router = useRouter()
  const { user } = useAuth()

  const { data, error, isLoading } = useSWR(['my-groups'], () =>
    listGroups({ page: 1, limit: 50 }),
  )

  const myGroups = (data?.items ?? [])
    .map(mapGroup)
    .filter((g) => g.createdBy === user?.userId)

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Mis grupos</h1>
          <p className="text-muted-foreground mt-1">Grupos que has creado en la comunidad</p>
        </div>
        <Link href="/crear-grupo">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Crear grupo
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : error ? (
        <Card className="border-destructive/30">
          <CardContent className="p-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">No pudimos cargar tus grupos</p>
              <p className="text-sm text-muted-foreground mt-1">
                {error instanceof ApiError
                  ? error.message
                  : 'Verifica tu conexión con el servidor.'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : myGroups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {myGroups.map((group) => (
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
          <CardContent className="py-12">
            <EmptyState
              type="no-groups"
              title="Todavía no has creado ningún grupo"
              description="Crea tu primer grupo y reúne a personas que comparten tus intereses culturales. Cuando crees grupos, aparecerán aquí."
              action={{ label: 'Crear grupo', onClick: () => router.push('/crear-grupo') }}
              secondaryAction={{ label: 'Explorar grupos', onClick: () => router.push('/explorar') }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
