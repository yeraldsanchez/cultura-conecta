'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GroupCard } from '@/components/group-card'
import { EmptyState } from '@/components/empty-state'
import { useApp } from '@/lib/app-context'
import { 
  Plus, 
  Users, 
  Crown
} from 'lucide-react'
import Link from 'next/link'

export default function MisGruposPage() {
  const router = useRouter()
  const { userGroups, user } = useApp()
  
  // For demo, assume user is admin of groups they're in
  const adminGroups = userGroups.filter((_, i) => i === 0)
  const memberGroups = userGroups.filter((_, i) => i !== 0)

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Mis grupos
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestiona los grupos a los que perteneces
          </p>
        </div>
        <Link href="/crear-grupo">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Crear grupo
          </Button>
        </Link>
      </div>
      
      {userGroups.length > 0 ? (
        <Tabs defaultValue="todos">
          <TabsList className="mb-6">
            <TabsTrigger value="todos" className="gap-2">
              <Users className="w-4 h-4" />
              Todos
              <Badge variant="secondary" className="ml-1">{userGroups.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="admin" className="gap-2">
              <Crown className="w-4 h-4" />
              Administro
              <Badge variant="secondary" className="ml-1">{adminGroups.length}</Badge>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="todos">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userGroups.map((group, index) => (
                <div key={group.id} className="relative">
                  {index === 0 && (
                    <Badge className="absolute -top-2 -right-2 z-10 gap-1">
                      <Crown className="w-3 h-3" />
                      Admin
                    </Badge>
                  )}
                  <GroupCard
                    group={group}
                    isMember
                    onView={() => router.push(`/grupo/${group.id}`)}
                  />
                </div>
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
                    isMember
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
              description="Explora grupos compatibles con tus intereses o crea el tuyo propio."
              action={{ label: 'Explorar grupos', onClick: () => router.push('/explorar') }}
              secondaryAction={{ label: 'Crear grupo', onClick: () => router.push('/crear-grupo') }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
