'use client'

// Group detail page.
//
// Backend reality:
//  - There is NO single-group endpoint, so we fetch a page of groups and find
//    the requested one by id (best effort given the current API surface).
//  - Joining IS supported: POST /groups/:id/members (the user id comes from the
//    JWT server-side), so the "Unirse al grupo" action is real.
//  - There are still NO endpoints for leaving, forum posts, events, or member
//    lists. Those tabs are rendered from the isolated demo-data module and are
//    clearly marked "en desarrollo" so users are not misled.
//  - The only real relationship a user has to a group is `created_by`, which we
//    use to show an "owner" badge.
//
// When the backend ships the remaining endpoints, replace the demo sections
// with real `lib/api` calls and delete lib/demo-data.ts.

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { EmptyState } from '@/components/empty-state'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth-context'
import { listGroups, joinGroup, ApiError } from '@/lib/api'
import { mapGroup, depthLevelLabel, initialsFrom } from '@/lib/view-models'
import { DEMO_MEMBERS, DEMO_POSTS, DEMO_EVENTS } from '@/lib/demo-data'
import {
  Users,
  Calendar,
  MessageSquare,
  Info,
  ArrowLeft,
  Crown,
  Shield,
  User,
  Layers,
  BookOpen,
  Construction,
  Video,
  MapPin,
  AlertCircle,
  UserPlus,
  Loader2,
} from 'lucide-react'

const roleIcons = { admin: Crown, moderador: Shield, miembro: User } as const
const roleLabels = { admin: 'Administrador', moderador: 'Moderador', miembro: 'Miembro' } as const

function DemoNotice({ feature }: { feature: string }) {
  return (
    <Alert>
      <Construction className="h-4 w-4" />
      <AlertDescription>
        {feature} es una función en desarrollo. El contenido mostrado es solo demostrativo y aún no
        está conectado al servidor.
      </AlertDescription>
    </Alert>
  )
}

export default function GrupoPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const groupId = Number(resolvedParams.id)
  const router = useRouter()
  const { user } = useAuth()

  const { data, error, isLoading } = useSWR(['group-detail'], () =>
    listGroups({ page: 1, limit: 100 }),
  )

  const group = data?.items.map(mapGroup).find((g) => g.id === groupId)
  const isOwner = group?.createdBy === user?.userId

  const [isJoining, setIsJoining] = useState(false)
  const [hasJoined, setHasJoined] = useState(false)

  const handleJoin = async () => {
    setIsJoining(true)
    try {
      await joinGroup(groupId)
      setHasJoined(true)
      toast.success('Te uniste al grupo', {
        description: 'Ahora formas parte de esta comunidad.',
      })
    } catch (err) {
      toast.error('No pudimos unirte al grupo', {
        description:
          err instanceof ApiError ? err.message : 'Intenta nuevamente en unos momentos.',
      })
    } finally {
      setIsJoining(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Card className="border-destructive/30">
          <CardContent className="p-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">No pudimos cargar el grupo</p>
              <p className="text-sm text-muted-foreground mt-1">
                {error instanceof ApiError ? error.message : 'Verifica tu conexión.'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <EmptyState
          type="no-results"
          title="Grupo no encontrado"
          description="El grupo que buscas no existe o no está en la lista actual."
          action={{ label: 'Volver a explorar', onClick: () => router.push('/explorar') }}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Button
        variant="ghost"
        size="sm"
        className="mb-6 -ml-2 text-muted-foreground"
        onClick={() => router.back()}
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Volver
      </Button>

      {/* Group header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <BookOpen className="w-10 h-10 text-primary" />
          </div>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
              <h1 className="font-serif text-3xl font-bold text-foreground">{group.name}</h1>
              {isOwner && (
                <Badge variant="secondary" className="w-fit gap-1">
                  <Crown className="w-3.5 h-3.5" />
                  Eres el creador
                </Badge>
              )}
            </div>
            <p className="text-lg text-muted-foreground">{group.workTitle}</p>

            <div className="flex flex-wrap items-center gap-3 mt-4">
              <Badge variant="outline">{depthLevelLabel(group.depthLevel)}</Badge>
              {group.focusTypes.map((f) => (
                <Badge key={f.id} variant="secondary">
                  {f.name}
                </Badge>
              ))}
            </div>

            {!isOwner && (
              <div className="mt-6">
                <Button onClick={handleJoin} disabled={isJoining || hasJoined}>
                  {isJoining ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uniéndote...
                    </>
                  ) : hasJoined ? (
                    <>
                      <Users className="w-4 h-4 mr-2" />
                      Ya eres miembro
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Unirse al grupo
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="resumen">
        <TabsList className="w-full justify-start border-b border-border rounded-none h-auto p-0 bg-transparent mb-6">
          <TabsTrigger
            value="resumen"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
          >
            <Info className="w-4 h-4 mr-2" />
            Resumen
          </TabsTrigger>
          <TabsTrigger
            value="foro"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Foro
          </TabsTrigger>
          <TabsTrigger
            value="eventos"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Eventos
          </TabsTrigger>
          <TabsTrigger
            value="miembros"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
          >
            <Users className="w-4 h-4 mr-2" />
            Miembros
          </TabsTrigger>
        </TabsList>

        {/* Resumen */}
        <TabsContent value="resumen" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Acerca del grupo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {group.description || 'Este grupo todavía no tiene una descripción.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6 pt-6 border-t border-border/50">
                <div>
                  <p className="text-sm font-medium text-foreground mb-1 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                    Obra cultural
                  </p>
                  <p className="text-sm text-muted-foreground">{group.workTitle}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-1 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-muted-foreground" />
                    Enfoques y nivel
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{depthLevelLabel(group.depthLevel)}</Badge>
                    {group.focusTypes.map((f) => (
                      <Badge key={f.id} variant="secondary">
                        {f.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Foro (demo) */}
        <TabsContent value="foro" className="space-y-4">
          <DemoNotice feature="El foro" />
          {DEMO_POSTS.map((post) => (
            <Card key={post.id} className="border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="w-9 h-9">
                    <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                      {initialsFrom(post.authorName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-foreground text-sm">{post.authorName}</span>
                  {post.hasSpoiler && (
                    <Badge variant="outline" className="text-xs">
                      Spoiler: {post.spoilerProgress}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{post.content}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Eventos (demo) */}
        <TabsContent value="eventos" className="space-y-4">
          <DemoNotice feature="La gestión de eventos" />
          {DEMO_EVENTS.map((event) => (
            <Card key={event.id} className="border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{event.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                  </div>
                  <Badge variant="secondary" className="gap-1 shrink-0">
                    {event.modality === 'virtual' ? (
                      <Video className="w-3.5 h-3.5" />
                    ) : (
                      <MapPin className="w-3.5 h-3.5" />
                    )}
                    {event.modality === 'virtual' ? 'Virtual' : 'Presencial'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Miembros (demo) */}
        <TabsContent value="miembros" className="space-y-4">
          <DemoNotice feature="La lista de miembros" />
          <Card className="border-border/50">
            <CardContent className="pt-6 divide-y divide-border/50">
              {DEMO_MEMBERS.map((member) => {
                const RoleIcon = roleIcons[member.role]
                return (
                  <div key={member.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <Avatar className="w-9 h-9">
                      <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                        {initialsFrom(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="flex-1 font-medium text-foreground text-sm">
                      {member.name}
                    </span>
                    <Badge variant="outline" className="gap-1 text-xs">
                      <RoleIcon className="w-3.5 h-3.5" />
                      {roleLabels[member.role]}
                    </Badge>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
