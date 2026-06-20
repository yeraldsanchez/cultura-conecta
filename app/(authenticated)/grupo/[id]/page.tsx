'use client'

// Group detail page.
//
// Backend reality:
//  - There is still NO single-group endpoint. We first check the user's own
//    membership list (GET /users/:id/groups, which we need anyway to know
//    whether they belong to the group) and use that as the data source when
//    they do. Only when the group is NOT one they belong to (e.g. a
//    suggestion or something found through /explorar) do we fall back to a
//    page of GET /groups and search by id.
//  - Joining IS supported: POST /groups/:id/members.
//  - Members ARE supported: GET /groups/:id/members — real data, no more mock.
//  - The forum can CREATE posts (POST /groups/:id/posts) but the backend has
//    no endpoint to LIST them, so only posts created during this session are
//    shown (with a clear notice explaining why history isn't available).
//  - There is still NO endpoint for leaving a group or for events at all.
//    The Eventos tab is rendered from the isolated demo-data module and is
//    clearly marked "en desarrollo" so users are not misled; events created
//    there only live in local state for the current session.
//
// When the backend ships the remaining endpoints, replace the demo sections
// with real `lib/api` calls and delete lib/demo-data.ts.

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { EmptyState } from '@/components/empty-state'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth-context'
import {
  listGroups,
  joinGroup,
  getGroupsByMember,
  getGroupMembers,
  createPost,
  ApiError,
} from '@/lib/api'
import {
  mapGroup,
  mapUserGroup,
  mapGroupMember,
  mapPost,
  depthLevelLabel,
  roleLabel,
  initialsFrom,
  type GroupVM,
  type PostVM,
} from '@/lib/view-models'
import { DEMO_EVENTS, type DemoEvent } from '@/lib/demo-data'
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
  AlertTriangle,
  ChevronDown,
  UserPlus,
  Loader2,
  Plus,
} from 'lucide-react'

const ROLE_ICONS: Record<string, typeof Crown> = {
  admin: Crown,
  moderator: Shield,
  member: User,
}

export default function GrupoPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const groupId = Number(resolvedParams.id)
  const router = useRouter()
  const { user } = useAuth()
  const userId = user?.userId

  // 1. The user's own created+joined groups. We need this anyway to know the
  //    membership/role, and when the group IS one of these, it doubles as the
  //    group's data source (no extra request needed).
  const {
    data: userGroupsData,
    error: userGroupsError,
    isLoading: userGroupsLoading,
    mutate: mutateUserGroups,
  } = useSWR(userId ? ['user-groups', userId] : null, () => getGroupsByMember(userId!))

  const userGroups = (userGroupsData ?? []).map(mapUserGroup)
  const membership = userGroups.find((g) => g.id === groupId)

  // 2. Fallback for groups the user does not belong to: a page of the full
  //    catalog, searched by id (no single-group endpoint exists).
  const needsCatalogFallback = !userGroupsLoading && !membership
  const {
    data: catalogData,
    error: catalogError,
    isLoading: catalogLoading,
  } = useSWR(needsCatalogFallback ? ['group-detail-catalog'] : null, () =>
    listGroups({ page: 1, limit: 100 }),
  )

  const group: GroupVM | undefined =
    membership ?? catalogData?.items.map(mapGroup).find((g) => g.id === groupId)

  const isOwner = group?.createdBy === userId
  const isMember = Boolean(membership)

  // 3. Real members list.
  const {
    data: membersData,
    error: membersError,
    isLoading: membersLoading,
    mutate: mutateMembers,
  } = useSWR(group ? ['group-members', groupId] : null, () => getGroupMembers(groupId))

  const members = (membersData ?? []).map(mapGroupMember)

  const [activeTab, setActiveTab] = useState('resumen')

  // --- Join ------------------------------------------------------------------
  const [isJoining, setIsJoining] = useState(false)

  const handleJoin = async () => {
    setIsJoining(true)
    try {
      await joinGroup(groupId)
      toast.success('Te uniste al grupo', {
        description: 'Ahora formas parte de esta comunidad.',
      })
      await Promise.all([mutateUserGroups(), mutateMembers()])
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        toast.info('Ya eras miembro de este grupo')
        await Promise.all([mutateUserGroups(), mutateMembers()])
      } else {
        toast.error('No pudimos unirte al grupo', {
          description:
            err instanceof ApiError ? err.message : 'Intenta nuevamente en unos momentos.',
        })
      }
    } finally {
      setIsJoining(false)
    }
  }

  // --- Forum: create post (real) — no list endpoint, so only session posts show.
  const [sessionPosts, setSessionPosts] = useState<PostVM[]>([])
  const [postDialogOpen, setPostDialogOpen] = useState(false)
  const [newPostContent, setNewPostContent] = useState('')
  const [newPostHasSpoiler, setNewPostHasSpoiler] = useState(false)
  const [newPostSpoilerProgress, setNewPostSpoilerProgress] = useState('')
  const [isCreatingPost, setIsCreatingPost] = useState(false)

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return
    setIsCreatingPost(true)
    try {
      const created = await createPost(groupId, {
        content: newPostContent.trim(),
        has_spoiler: newPostHasSpoiler,
        spoiler_progress: newPostHasSpoiler ? newPostSpoilerProgress.trim() || null : null,
      })
      setSessionPosts((prev) => [mapPost(created), ...prev])
      setNewPostContent('')
      setNewPostHasSpoiler(false)
      setNewPostSpoilerProgress('')
      setPostDialogOpen(false)
      setActiveTab('foro')
      toast.success('Publicación creada')
    } catch (err) {
      toast.error('No pudimos publicar', {
        description:
          err instanceof ApiError ? err.message : 'Intenta nuevamente en unos momentos.',
      })
    } finally {
      setIsCreatingPost(false)
    }
  }

  // --- Events: fully mock, no backend support at all. Created events only
  // live in local state for the current session.
  const [localEvents, setLocalEvents] = useState<DemoEvent[]>([])
  const [eventDialogOpen, setEventDialogOpen] = useState(false)
  const [newEventTitle, setNewEventTitle] = useState('')
  const [newEventDescription, setNewEventDescription] = useState('')
  const [newEventDate, setNewEventDate] = useState('')
  const [newEventTime, setNewEventTime] = useState('')
  const [newEventModality, setNewEventModality] = useState<'virtual' | 'presencial'>('virtual')
  const [newEventLink, setNewEventLink] = useState('')

  const handleCreateEvent = () => {
    if (!newEventTitle.trim() || !newEventDate || !newEventTime) return
    const event: DemoEvent = {
      id: Date.now(),
      title: newEventTitle.trim(),
      description: newEventDescription.trim() || 'Sin descripción.',
      date: `${newEventDate}T${newEventTime}:00`,
      modality: newEventModality,
      link: newEventModality === 'virtual' ? newEventLink.trim() || undefined : undefined,
    }
    setLocalEvents((prev) => [event, ...prev])
    setNewEventTitle('')
    setNewEventDescription('')
    setNewEventDate('')
    setNewEventTime('')
    setNewEventModality('virtual')
    setNewEventLink('')
    setEventDialogOpen(false)
    setActiveTab('eventos')
    toast.info('Evento guardado solo en esta sesión', {
      description:
        'La gestión de eventos aún no está integrada con el servidor, así que no se compartirá con el resto del grupo.',
    })
  }

  const combinedEvents = [...localEvents, ...DEMO_EVENTS]

  // --- Loading / error / not-found states -------------------------------------
  const isLoading = userGroupsLoading || (needsCatalogFallback && catalogLoading)

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!group && (userGroupsError || catalogError)) {
    const loadError = userGroupsError || catalogError
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Card className="border-destructive/30">
          <CardContent className="p-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">No pudimos cargar el grupo</p>
              <p className="text-sm text-muted-foreground mt-1">
                {loadError instanceof ApiError ? loadError.message : 'Verifica tu conexión.'}
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
              {isMember && (
                <Badge variant="secondary" className="w-fit gap-1">
                  {isOwner ? <Crown className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
                  {isOwner ? 'Eres el creador' : 'Ya eres miembro'}
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
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                {membersLoading
                  ? 'Cargando miembros...'
                  : `${members.length} ${members.length === 1 ? 'miembro' : 'miembros'}`}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {isMember ? (
              <>
                <Dialog open={postDialogOpen} onOpenChange={setPostDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Publicar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Nueva publicación</DialogTitle>
                      <DialogDescription>Comparte tus pensamientos con el grupo</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <Textarea
                        placeholder="¿Qué quieres compartir?"
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        className="min-h-32 resize-none"
                      />

                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Switch
                            id="spoiler"
                            checked={newPostHasSpoiler}
                            onCheckedChange={setNewPostHasSpoiler}
                          />
                          <Label htmlFor="spoiler" className="text-sm">
                            Contiene spoilers
                          </Label>
                        </div>
                      </div>

                      {newPostHasSpoiler && (
                        <div className="space-y-2">
                          <Label htmlFor="progress">Progreso requerido para ver</Label>
                          <Input
                            id="progress"
                            placeholder="Ej: Capítulo 5, Película completa, Acto 2..."
                            value={newPostSpoilerProgress}
                            onChange={(e) => setNewPostSpoilerProgress(e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground">
                            Indica qué tanto de la obra debe haber visto/leído alguien para ver tu
                            publicación sin spoilers
                          </p>
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setPostDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleCreatePost} disabled={!newPostContent.trim() || isCreatingPost}>
                        {isCreatingPost ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Publicando...
                          </>
                        ) : (
                          'Publicar'
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Calendar className="w-4 h-4 mr-2" />
                      Crear evento
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Crear evento</DialogTitle>
                      <DialogDescription>Organiza un encuentro con el grupo</DialogDescription>
                    </DialogHeader>
                    <Alert className="mt-2">
                      <Construction className="h-4 w-4" />
                      <AlertDescription>
                        La gestión de eventos aún no está integrada con el servidor: este evento
                        solo se guardará en tu sesión actual y no será visible para el resto del
                        grupo.
                      </AlertDescription>
                    </Alert>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="event-title">Título del evento *</Label>
                        <Input
                          id="event-title"
                          placeholder="Ej: Discusión del capítulo 5"
                          value={newEventTitle}
                          onChange={(e) => setNewEventTitle(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="event-description">Descripción</Label>
                        <Textarea
                          id="event-description"
                          placeholder="Describe el evento..."
                          value={newEventDescription}
                          onChange={(e) => setNewEventDescription(e.target.value)}
                          className="min-h-20 resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="event-date">Fecha *</Label>
                          <Input
                            id="event-date"
                            type="date"
                            value={newEventDate}
                            onChange={(e) => setNewEventDate(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="event-time">Hora *</Label>
                          <Input
                            id="event-time"
                            type="time"
                            value={newEventTime}
                            onChange={(e) => setNewEventTime(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Modalidad</Label>
                        <div className="flex gap-3">
                          <Button
                            type="button"
                            variant={newEventModality === 'virtual' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setNewEventModality('virtual')}
                            className="flex-1"
                          >
                            <Video className="w-4 h-4 mr-2" />
                            Virtual
                          </Button>
                          <Button
                            type="button"
                            variant={newEventModality === 'presencial' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setNewEventModality('presencial')}
                            className="flex-1"
                          >
                            <MapPin className="w-4 h-4 mr-2" />
                            Presencial
                          </Button>
                        </div>
                      </div>

                      {newEventModality === 'virtual' && (
                        <div className="space-y-2">
                          <Label htmlFor="event-link">Enlace de la reunión</Label>
                          <Input
                            id="event-link"
                            placeholder="https://meet.google.com/..."
                            value={newEventLink}
                            onChange={(e) => setNewEventLink(e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setEventDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleCreateEvent}
                        disabled={!newEventTitle.trim() || !newEventDate || !newEventTime}
                      >
                        Crear evento
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            ) : (
              <Button onClick={handleJoin} disabled={isJoining}>
                {isJoining ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uniéndote...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Unirme al grupo
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
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
            <Badge variant="secondary" className="ml-2 text-xs">
              {sessionPosts.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="eventos"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Eventos
            <Badge variant="secondary" className="ml-2 text-xs">
              {combinedEvents.length}
            </Badge>
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

          {/* Recent activity (session-only posts) */}
          {sessionPosts.length > 0 && (
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Actividad reciente</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('foro')}>
                  Ver todo
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {sessionPosts.slice(0, 2).map((post) => (
                  <PostCard key={post.id} post={post} authorName={user?.name} />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Upcoming events (demo) */}
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Próximos eventos</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setActiveTab('eventos')}>
                Ver todo
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {combinedEvents.slice(0, 2).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Foro */}
        <TabsContent value="foro" className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Las publicaciones nuevas sí se guardan en el servidor, pero el backend todavía no
              expone un endpoint para listar publicaciones anteriores. Por eso solo verás aquí las
              que se hayan creado durante esta sesión.
            </AlertDescription>
          </Alert>

          {sessionPosts.length > 0 ? (
            sessionPosts.map((post) => <PostCard key={post.id} post={post} authorName={user?.name} />)
          ) : (
            <EmptyState
              type="no-posts"
              title="Aún no hay publicaciones en esta sesión"
              description={
                isMember
                  ? 'Sé el primero en iniciar una conversación.'
                  : 'Únete al grupo para participar en el foro.'
              }
              action={isMember ? { label: 'Crear publicación', onClick: () => setPostDialogOpen(true) } : undefined}
            />
          )}
        </TabsContent>

        {/* Eventos (demo) */}
        <TabsContent value="eventos" className="space-y-4">
          <Alert>
            <Construction className="h-4 w-4" />
            <AlertDescription>
              La gestión de eventos es una función en desarrollo: no existe todavía en el backend.
              Lo que ves aquí es contenido de ejemplo, salvo los eventos que crees, que solo se
              guardan en tu sesión actual.
            </AlertDescription>
          </Alert>

          {combinedEvents.length > 0 ? (
            combinedEvents.map((event) => <EventCard key={event.id} event={event} />)
          ) : (
            <EmptyState
              type="no-events"
              title="No hay eventos próximos"
              description={
                isMember
                  ? 'Crea un evento para reunir al grupo.'
                  : 'Únete al grupo para ver y crear eventos.'
              }
              action={isMember ? { label: 'Crear evento', onClick: () => setEventDialogOpen(true) } : undefined}
            />
          )}
        </TabsContent>

        {/* Miembros (real) */}
        <TabsContent value="miembros" className="space-y-4">
          {membersError ? (
            <Card className="border-destructive/30">
              <CardContent className="p-6 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">No pudimos cargar los miembros</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {membersError instanceof ApiError ? membersError.message : 'Verifica tu conexión.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : membersLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : members.length > 0 ? (
            <Card className="border-border/50">
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  {members.map((member) => {
                    const RoleIcon = ROLE_ICONS[member.role] ?? User
                    const displayName = member.name || `Usuario #${member.userId}`
                    return (
                      <div key={member.userId} className="flex items-center gap-4 p-4">
                        <Avatar className="w-10 h-10 bg-primary/10">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                            {initialsFrom(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">{displayName}</p>
                          <p className="text-xs text-muted-foreground">
                            Miembro desde{' '}
                            {format(new Date(member.joinedAt), 'MMMM yyyy', { locale: es })}
                          </p>
                        </div>
                        <Badge variant={member.role === 'admin' ? 'default' : 'secondary'} className="gap-1">
                          <RoleIcon className="w-3 h-3" />
                          {roleLabel(member.role)}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ) : (
            <EmptyState type="no-members" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function PostCard({ post, authorName }: { post: PostVM; authorName?: string }) {
  const [spoilerRevealed, setSpoilerRevealed] = useState(false)
  const isHidden = post.hasSpoiler && !spoilerRevealed

  return (
    <Card className="border-border/50">
      <CardContent className="p-5">
        {/* Author info */}
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="w-10 h-10 bg-primary/10">
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
              {initialsFrom(authorName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-foreground">{authorName || 'Tú'}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: es })}
            </p>
          </div>
          {post.hasSpoiler && (
            <Badge
              variant="destructive"
              className="shrink-0 bg-destructive/10 text-destructive border-destructive/20"
            >
              <AlertTriangle className="w-3 h-3 mr-1" />
              Spoiler
            </Badge>
          )}
        </div>

        {/* Content */}
        {isHidden ? (
          <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-sm text-foreground">
                  Esta publicación contiene spoilers
                </p>
                {post.spoilerProgress && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Progreso requerido:{' '}
                    <span className="font-medium">{post.spoilerProgress}</span>
                  </p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => setSpoilerRevealed(true)}
                >
                  <ChevronDown className="w-4 h-4 mr-1.5" />
                  Ver spoiler
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              'text-sm text-foreground leading-relaxed',
              post.hasSpoiler && 'bg-muted/30 rounded-lg p-4 border border-destructive/20',
            )}
          >
            {post.hasSpoiler && spoilerRevealed && (
              <Badge variant="destructive" className="mb-2 bg-destructive/10 text-destructive text-xs">
                ⚠️ Contenido con spoilers
              </Badge>
            )}
            <p>{post.content}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function EventCard({ event }: { event: DemoEvent }) {
  return (
    <Card className="border-border/50">
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
  )
}
