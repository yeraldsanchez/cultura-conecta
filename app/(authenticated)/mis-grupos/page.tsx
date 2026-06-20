'use client'

// "Mis grupos" page.
//
// Backend-aligned: GET /users/:id/groups returns every group the current user
// created OR joined, along with their role in each ("admin" for groups they
// created, "member" once they join someone else's group). This is the real
// created+joined relationship — unlike `created_by` alone.
//
// Structure follows the reference design: an "Todos" tab with every group the
// user belongs to, and an "Administro" tab scoped to the groups where their
// role is "admin".

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { GroupCard } from '@/components/group-card'
import { EmptyState } from '@/components/empty-state'
import { useAuth } from '@/lib/auth-context'
import { getGroupsByMember, ApiError } from '@/lib/api'
import { mapUserGroup } from '@/lib/view-models'
import { Plus, Users, Crown, AlertCircle } from 'lucide-react'

export default function MisGruposPage() {
  const router = useRouter()
  const { user } = useAuth()

  const { data, error, isLoading } = useSWR(user ? ['user-groups', user.userId] : null, () =>
    getGroupsByMember(user!.userId),
  )

  const userGroups = (data ?? []).map(mapUserGroup)
  const adminGroups = userGroups.filter((g) => g.role === 'admin')

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Mis grupos</h1>
          <p className="text-muted-foreground mt-1">Gestiona los grupos a los que perteneces</p>
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
      ) : userGroups.length > 0 ? (
        <Tabs defaultValue="todos">
          <TabsList className="mb-6">
            <TabsTrigger value="todos" className="gap-2">
              <Users className="w-4 h-4" />
              Todos
              <Badge variant="secondary" className="ml-1">
                {userGroups.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="admin" className="gap-2">
              <Crown className="w-4 h-4" />
              Administro
              <Badge variant="secondary" className="ml-1">
                {adminGroups.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="todos">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userGroups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  role={group.role}
                  isOwner={group.createdBy === user?.userId}
                  onView={() => router.push(`/grupo/${group.id}`)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="admin">
            {adminGroups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {adminGroups.map((group) => (
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
              <EmptyState
                type="no-groups"
                title="No administras ningún grupo"
                description="Crea tu primer grupo y conviértete en administrador."
                action={{ label: 'Crear grupo', onClick: () => router.push('/crear-grupo') }}
              />
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="border-border/50">
          <CardContent className="py-12">
            <EmptyState
              type="no-groups"
              title="Todavía no perteneces a ningún grupo"
              description="Explora grupos compatibles con tus intereses o crea el tuyo propio. Cuando te unas a un grupo o crees uno, aparecerá aquí."
              action={{ label: 'Explorar grupos', onClick: () => router.push('/explorar') }}
              secondaryAction={{ label: 'Crear grupo', onClick: () => router.push('/crear-grupo') }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
