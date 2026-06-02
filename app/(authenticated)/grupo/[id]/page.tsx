'use client'

import { useState, useMemo, use } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { PostCard } from '@/components/post-card'
import { EventCard } from '@/components/event-card'
import { EmptyState } from '@/components/empty-state'
import { useApp } from '@/lib/app-context'
import { categoryLabels, focusLabels, levelLabels } from '@/lib/types'
import type { CulturalCategory, EventModality } from '@/lib/types'
import { cn } from '@/lib/utils'
import { 
  Film, 
  BookOpen, 
  Theater, 
  Users, 
  Calendar, 
  MessageSquare, 
  Info,
  Plus,
  ArrowLeft,
  Crown,
  Shield,
  User,
  Loader2,
  Video,
  MapPin
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const categoryIcons: Record<CulturalCategory, typeof Film> = {
  cine: Film,
  teatro: Theater,
  lectura: BookOpen,
}

export default function GrupoPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { groups, posts, events, userGroups, joinGroup, leaveGroup, createPost, createEvent, toggleEventAttendance } = useApp()
  
  const group = useMemo(() => groups.find(g => g.id === resolvedParams.id), [groups, resolvedParams.id])
  const groupPosts = useMemo(() => posts.filter(p => p.groupId === resolvedParams.id), [posts, resolvedParams.id])
  const groupEvents = useMemo(() => events.filter(e => e.groupId === resolvedParams.id), [events, resolvedParams.id])
  const isMember = useMemo(() => userGroups.some(g => g.id === resolvedParams.id), [userGroups, resolvedParams.id])
  
  const [activeTab, setActiveTab] = useState('resumen')
  const [isJoining, setIsJoining] = useState(false)
  
  // Create post dialog state
  const [postDialogOpen, setPostDialogOpen] = useState(false)
  const [newPostContent, setNewPostContent] = useState('')
  const [newPostHasSpoiler, setNewPostHasSpoiler] = useState(false)
  const [newPostSpoilerProgress, setNewPostSpoilerProgress] = useState('')
  const [isCreatingPost, setIsCreatingPost] = useState(false)
  
  // Create event dialog state
  const [eventDialogOpen, setEventDialogOpen] = useState(false)
  const [newEventTitle, setNewEventTitle] = useState('')
  const [newEventDescription, setNewEventDescription] = useState('')
  const [newEventDate, setNewEventDate] = useState('')
  const [newEventTime, setNewEventTime] = useState('')
  const [newEventModality, setNewEventModality] = useState<EventModality>('virtual')
  const [newEventLink, setNewEventLink] = useState('')
  const [isCreatingEvent, setIsCreatingEvent] = useState(false)
  
  if (!group) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <EmptyState
          type="no-results"
          title="Grupo no encontrado"
          description="El grupo que buscas no existe o fue eliminado."
          action={{ label: 'Volver a explorar', onClick: () => router.push('/explorar') }}
        />
      </div>
    )
  }
  
  const Icon = categoryIcons[group.category]
  
  const handleJoin = async () => {
    setIsJoining(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    joinGroup(group.id)
    setIsJoining(false)
  }
  
  const handleLeave = async () => {
    setIsJoining(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    leaveGroup(group.id)
    setIsJoining(false)
  }
  
  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return
    
    setIsCreatingPost(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    createPost(
      group.id,
      newPostContent,
      newPostHasSpoiler,
      newPostHasSpoiler ? newPostSpoilerProgress : undefined
    )
    
    setNewPostContent('')
    setNewPostHasSpoiler(false)
    setNewPostSpoilerProgress('')
    setPostDialogOpen(false)
    setIsCreatingPost(false)
    setActiveTab('foro')
  }
  
  const handleCreateEvent = async () => {
    if (!newEventTitle.trim() || !newEventDate || !newEventTime) return
    
    setIsCreatingEvent(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    createEvent(group.id, {
      title: newEventTitle,
      description: newEventDescription,
      date: new Date(`${newEventDate}T${newEventTime}`),
      modality: newEventModality,
      link: newEventModality === 'virtual' ? newEventLink : undefined,
    })
    
    setNewEventTitle('')
    setNewEventDescription('')
    setNewEventDate('')
    setNewEventTime('')
    setNewEventModality('virtual')
    setNewEventLink('')
    setEventDialogOpen(false)
    setIsCreatingEvent(false)
    setActiveTab('eventos')
  }
  
  // Mock members for display
  const mockMembers = [
    { id: '1', name: 'Carlos Ruiz', email: 'carlos@email.com', role: 'admin' as const, joinedAt: new Date('2024-01-15') },
    { id: '2', name: 'María López', email: 'maria@email.com', role: 'moderador' as const, joinedAt: new Date('2024-01-20') },
    { id: '3', name: 'Roberto Díaz', email: 'roberto@email.com', role: 'miembro' as const, joinedAt: new Date('2024-02-01') },
    { id: '4', name: 'Elena García', email: 'elena@email.com', role: 'miembro' as const, joinedAt: new Date('2024-02-15') },
    { id: '5', name: 'Andrés Mora', email: 'andres@email.com', role: 'miembro' as const, joinedAt: new Date('2024-03-01') },
  ]
  
  const roleIcons = {
    admin: Crown,
    moderador: Shield,
    miembro: User,
  }
  
  const roleLabels = {
    admin: 'Administrador',
    moderador: 'Moderador',
    miembro: 'Miembro',
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Back button */}
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
          {/* Icon */}
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="w-10 h-10 text-primary" />
          </div>
          
          {/* Info */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
              <h1 className="font-serif text-3xl font-bold text-foreground">{group.name}</h1>
              {isMember && (
                <Badge variant="secondary" className="w-fit">Ya eres miembro</Badge>
              )}
            </div>
            <p className="text-lg text-muted-foreground">{group.work.title}</p>
            
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <Badge variant="secondary">{categoryLabels[group.category]}</Badge>
              <Badge variant="outline">{focusLabels[group.focus]}</Badge>
              <Badge variant="outline">{levelLabels[group.level]}</Badge>
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                {group.memberCount} miembros
              </span>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {isMember ? (
              <>
                {/* Create post dialog */}
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
                      <DialogDescription>
                        Comparte tus pensamientos con el grupo
                      </DialogDescription>
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
                            Indica qué tanto de la obra debe haber visto/leído alguien para ver tu publicación sin spoilers
                          </p>
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setPostDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button 
                        onClick={handleCreatePost}
                        disabled={!newPostContent.trim() || isCreatingPost}
                      >
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
                
                {/* Create event dialog */}
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
                      <DialogDescription>
                        Organiza un encuentro con el grupo
                      </DialogDescription>
                    </DialogHeader>
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
                        disabled={!newEventTitle.trim() || !newEventDate || !newEventTime || isCreatingEvent}
                      >
                        {isCreatingEvent ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Creando...
                          </>
                        ) : (
                          'Crear evento'
                        )}
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
                  'Unirme al grupo'
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
            <Badge variant="secondary" className="ml-2 text-xs">{groupPosts.length}</Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="eventos"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Eventos
            <Badge variant="secondary" className="ml-2 text-xs">{groupEvents.length}</Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="miembros"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
          >
            <Users className="w-4 h-4 mr-2" />
            Miembros
          </TabsTrigger>
        </TabsList>
        
        {/* Tab: Resumen */}
        <TabsContent value="resumen" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Acerca del grupo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{group.description}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6 pt-6 border-t border-border/50">
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Obra cultural</p>
                  <p className="text-sm text-muted-foreground">{group.work.title}</p>
                  {(group.work.author || group.work.director) && (
                    <p className="text-xs text-muted-foreground">
                      {group.work.author || group.work.director} • {group.work.year}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Compatibilidad</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{categoryLabels[group.category]}</Badge>
                    <Badge variant="outline">{focusLabels[group.focus]}</Badge>
                    <Badge variant="outline">{levelLabels[group.level]}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Recent activity */}
          {groupPosts.length > 0 && (
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Actividad reciente</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('foro')}>
                  Ver todo
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {groupPosts.slice(0, 2).map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </CardContent>
            </Card>
          )}
          
          {/* Upcoming events */}
          {groupEvents.length > 0 && (
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Próximos eventos</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('eventos')}>
                  Ver todo
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {groupEvents.slice(0, 2).map((event) => (
                  <EventCard 
                    key={event.id} 
                    event={event}
                    variant="compact"
                    onToggleAttendance={() => toggleEventAttendance(event.id)}
                  />
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Tab: Foro */}
        <TabsContent value="foro" className="space-y-4">
          {groupPosts.length > 0 ? (
            groupPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
            <EmptyState
              type="no-posts"
              title="El foro está vacío"
              description={isMember ? "Sé el primero en iniciar una conversación." : "Únete al grupo para participar en el foro."}
              action={isMember ? { label: 'Crear publicación', onClick: () => setPostDialogOpen(true) } : undefined}
            />
          )}
        </TabsContent>
        
        {/* Tab: Eventos */}
        <TabsContent value="eventos" className="space-y-4">
          {groupEvents.length > 0 ? (
            groupEvents.map((event) => (
              <EventCard 
                key={event.id} 
                event={event}
                onToggleAttendance={() => toggleEventAttendance(event.id)}
              />
            ))
          ) : (
            <EmptyState
              type="no-events"
              title="No hay eventos próximos"
              description={isMember ? "Crea un evento para reunir al grupo." : "Únete al grupo para ver y crear eventos."}
              action={isMember ? { label: 'Crear evento', onClick: () => setEventDialogOpen(true) } : undefined}
            />
          )}
        </TabsContent>
        
        {/* Tab: Miembros */}
        <TabsContent value="miembros">
          <Card className="border-border/50">
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {mockMembers.map((member) => {
                  const RoleIcon = roleIcons[member.role]
                  const initials = member.name
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                  
                  return (
                    <div key={member.id} className="flex items-center gap-4 p-4">
                      <Avatar className="w-10 h-10 bg-primary/10">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground">{member.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Miembro desde {format(member.joinedAt, "MMMM yyyy", { locale: es })}
                        </p>
                      </div>
                      <Badge 
                        variant={member.role === 'admin' ? 'default' : 'secondary'}
                        className="gap-1"
                      >
                        <RoleIcon className="w-3 h-3" />
                        {roleLabels[member.role]}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
