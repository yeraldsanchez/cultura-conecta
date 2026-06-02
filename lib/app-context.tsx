'use client'

import { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import type { User, Group, GroupEvent, ForumPost, CulturalCategory, AnalysisFocus, DepthLevel } from '@/lib/types'

// Mock data for demonstration
const mockUser: User = {
  id: '1',
  email: 'ana.martinez@email.com',
  name: 'Ana Martínez',
  categories: ['cine', 'lectura'],
  focus: 'trama-reflexion',
  level: 'intermedio',
  createdAt: new Date('2024-01-15'),
  onboardingCompleted: true,
}

const mockGroups: Group[] = [
  {
    id: '1',
    name: 'Cinéfilos de Villeneuve',
    description: 'Grupo dedicado a analizar las películas de Denis Villeneuve. Desde Incendies hasta Dune, exploramos su estilo visual único y narrativas complejas.',
    work: { id: 'w1', title: 'Dune: Parte Dos', category: 'cine', director: 'Denis Villeneuve', year: 2024 },
    category: 'cine',
    focus: 'analisis-tecnico',
    level: 'analitico',
    creatorId: '2',
    memberCount: 47,
    createdAt: new Date('2024-02-01'),
  },
  {
    id: '2',
    name: 'Club de Lectura García Márquez',
    description: 'Leemos y discutimos las obras de Gabriel García Márquez. Actualmente en Cien Años de Soledad, capítulo por capítulo.',
    work: { id: 'w2', title: 'Cien Años de Soledad', category: 'lectura', author: 'Gabriel García Márquez', year: 1967 },
    category: 'lectura',
    focus: 'tematica-simbolismo',
    level: 'intermedio',
    creatorId: '3',
    memberCount: 32,
    createdAt: new Date('2024-01-20'),
  },
  {
    id: '3',
    name: 'Teatro Contemporáneo CDMX',
    description: 'Discutimos las puestas en escena actuales en Ciudad de México. Críticas, recomendaciones y análisis de actuaciones.',
    work: { id: 'w3', title: 'Hamlet (Versión Contemporánea)', category: 'teatro', author: 'William Shakespeare', year: 2024 },
    category: 'teatro',
    focus: 'actuacion-interpretacion',
    level: 'intermedio',
    creatorId: '4',
    memberCount: 18,
    createdAt: new Date('2024-03-01'),
  },
  {
    id: '4',
    name: 'Oppenheimer: Análisis Profundo',
    description: 'Exploramos cada detalle de la obra maestra de Christopher Nolan. Discusiones sobre historia, ciencia y cinematografía.',
    work: { id: 'w4', title: 'Oppenheimer', category: 'cine', director: 'Christopher Nolan', year: 2023 },
    category: 'cine',
    focus: 'trama-reflexion',
    level: 'analitico',
    creatorId: '1',
    memberCount: 89,
    createdAt: new Date('2023-08-15'),
  },
  {
    id: '5',
    name: 'Lectores de Murakami',
    description: 'Para los amantes del realismo mágico japonés. Actualmente leyendo Kafka en la Orilla.',
    work: { id: 'w5', title: 'Kafka en la Orilla', category: 'lectura', author: 'Haruki Murakami', year: 2002 },
    category: 'lectura',
    focus: 'tematica-simbolismo',
    level: 'intermedio',
    creatorId: '5',
    memberCount: 54,
    createdAt: new Date('2024-02-10'),
  },
  {
    id: '6',
    name: 'Cine de Terror Clásico',
    description: 'Revisamos los clásicos del cine de terror. Análisis casual y divertido de películas icónicas.',
    work: { id: 'w6', title: 'El Resplandor', category: 'cine', director: 'Stanley Kubrick', year: 1980 },
    category: 'cine',
    focus: 'conversacion-casual',
    level: 'casual',
    creatorId: '6',
    memberCount: 76,
    createdAt: new Date('2024-01-05'),
  },
]

const mockPosts: ForumPost[] = [
  {
    id: 'p1',
    groupId: '1',
    authorId: '2',
    author: { ...mockUser, id: '2', name: 'Carlos Ruiz', email: 'carlos@email.com' },
    content: '¿Alguien más notó cómo Villeneuve utiliza el silencio en las escenas del desierto? Es casi como si el vacío sonoro amplificara la inmensidad del paisaje.',
    hasSpoiler: false,
    createdAt: new Date('2024-03-15T10:30:00'),
    commentsCount: 12,
  },
  {
    id: 'p2',
    groupId: '1',
    authorId: '3',
    author: { ...mockUser, id: '3', name: 'María López', email: 'maria@email.com' },
    content: 'La escena donde Paul tiene la visión de Chani es absolutamente devastadora. La forma en que se revela su futuro...',
    hasSpoiler: true,
    spoilerProgress: 'Película completa',
    createdAt: new Date('2024-03-14T15:45:00'),
    commentsCount: 8,
  },
  {
    id: 'p3',
    groupId: '1',
    authorId: '4',
    author: { ...mockUser, id: '4', name: 'Roberto Díaz', email: 'roberto@email.com' },
    content: 'Comparando la cinematografía de Greig Fraser en Dune con su trabajo en The Batman. ¿Qué opinan del uso de luz natural?',
    hasSpoiler: false,
    createdAt: new Date('2024-03-13T09:00:00'),
    commentsCount: 23,
  },
]

const mockEvents: GroupEvent[] = [
  {
    id: 'e1',
    groupId: '1',
    creatorId: '2',
    creator: { ...mockUser, id: '2', name: 'Carlos Ruiz', email: 'carlos@email.com' },
    title: 'Maratón Villeneuve: Arrival + Dune',
    description: 'Veremos Arrival seguida de Dune Parte Uno para analizar la evolución del estilo visual de Villeneuve.',
    date: new Date('2024-04-20T18:00:00'),
    modality: 'presencial',
    attendeesCount: 15,
    isAttending: false,
  },
  {
    id: 'e2',
    groupId: '1',
    creatorId: '3',
    creator: { ...mockUser, id: '3', name: 'María López', email: 'maria@email.com' },
    title: 'Discusión: El sonido en Dune',
    description: 'Sesión virtual para analizar el diseño sonoro de Hans Zimmer y cómo complementa la narrativa visual.',
    date: new Date('2024-04-15T20:00:00'),
    modality: 'virtual',
    link: 'https://meet.google.com/abc-defg-hij',
    attendeesCount: 28,
    isAttending: true,
  },
  {
    id: 'e3',
    groupId: '2',
    creatorId: '3',
    creator: { ...mockUser, id: '3', name: 'Elena García', email: 'elena@email.com' },
    title: 'Lectura en vivo: Capítulo 10',
    description: 'Leemos juntos el capítulo 10 de Cien Años de Soledad y discutimos en tiempo real.',
    date: new Date('2024-04-18T19:00:00'),
    modality: 'virtual',
    link: 'https://zoom.us/j/123456789',
    attendeesCount: 12,
    isAttending: false,
  },
]

interface AppState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  groups: Group[]
  userGroups: Group[]
  suggestedGroups: Group[]
  currentGroup: Group | null
  posts: ForumPost[]
  events: GroupEvent[]
}

interface AppContextType extends AppState {
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  register: (email: string, password: string) => Promise<boolean>
  completeOnboarding: (categories: CulturalCategory[], focus: AnalysisFocus, level: DepthLevel) => void
  updateProfile: (categories: CulturalCategory[], focus: AnalysisFocus, level: DepthLevel) => void
  setCurrentGroup: (group: Group | null) => void
  joinGroup: (groupId: string) => void
  leaveGroup: (groupId: string) => void
  createGroup: (group: Omit<Group, 'id' | 'creatorId' | 'memberCount' | 'createdAt'>) => Group
  createPost: (groupId: string, content: string, hasSpoiler: boolean, spoilerProgress?: string) => void
  createEvent: (groupId: string, event: Omit<GroupEvent, 'id' | 'groupId' | 'creatorId' | 'creator' | 'attendeesCount' | 'isAttending'>) => void
  toggleEventAttendance: (eventId: string) => void
  searchGroups: (query: string, filters?: { category?: CulturalCategory; focus?: AnalysisFocus; level?: DepthLevel }) => Group[]
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    groups: mockGroups,
    userGroups: [],
    suggestedGroups: [],
    currentGroup: null,
    posts: mockPosts,
    events: mockEvents,
  })

  const login = useCallback(async (email: string, _password: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true }))
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const user = { ...mockUser, email }
    const userGroups = mockGroups.slice(0, 3)
    const suggestedGroups = mockGroups.slice(3)
    
    setState(prev => ({
      ...prev,
      user,
      isAuthenticated: true,
      isLoading: false,
      userGroups,
      suggestedGroups,
    }))
    return true
  }, [])

  const logout = useCallback(() => {
    setState(prev => ({
      ...prev,
      user: null,
      isAuthenticated: false,
      userGroups: [],
      suggestedGroups: [],
      currentGroup: null,
    }))
  }, [])

  const register = useCallback(async (email: string, _password: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true }))
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const newUser: User = {
      id: Date.now().toString(),
      email,
      categories: [],
      focus: 'trama-reflexion',
      level: 'intermedio',
      createdAt: new Date(),
      onboardingCompleted: false,
    }
    
    setState(prev => ({
      ...prev,
      user: newUser,
      isAuthenticated: true,
      isLoading: false,
    }))
    return true
  }, [])

  const completeOnboarding = useCallback((categories: CulturalCategory[], focus: AnalysisFocus, level: DepthLevel) => {
    setState(prev => {
      if (!prev.user) return prev
      
      const updatedUser = {
        ...prev.user,
        categories,
        focus,
        level,
        onboardingCompleted: true,
      }
      
      // Generate suggested groups based on user preferences
      const suggested = prev.groups.filter(g => 
        categories.includes(g.category) || g.focus === focus || g.level === level
      )
      
      return {
        ...prev,
        user: updatedUser,
        suggestedGroups: suggested,
      }
    })
  }, [])

  const updateProfile = useCallback((categories: CulturalCategory[], focus: AnalysisFocus, level: DepthLevel) => {
    setState(prev => {
      if (!prev.user) return prev
      
      const updatedUser = {
        ...prev.user,
        categories,
        focus,
        level,
      }
      
      const suggested = prev.groups.filter(g => 
        categories.includes(g.category) || g.focus === focus || g.level === level
      )
      
      return {
        ...prev,
        user: updatedUser,
        suggestedGroups: suggested,
      }
    })
  }, [])

  const setCurrentGroup = useCallback((group: Group | null) => {
    setState(prev => ({ ...prev, currentGroup: group }))
  }, [])

  const joinGroup = useCallback((groupId: string) => {
    setState(prev => {
      const group = prev.groups.find(g => g.id === groupId)
      if (!group || prev.userGroups.some(g => g.id === groupId)) return prev
      
      const updatedGroup = { ...group, memberCount: group.memberCount + 1 }
      return {
        ...prev,
        userGroups: [...prev.userGroups, updatedGroup],
        groups: prev.groups.map(g => g.id === groupId ? updatedGroup : g),
        suggestedGroups: prev.suggestedGroups.filter(g => g.id !== groupId),
      }
    })
  }, [])

  const leaveGroup = useCallback((groupId: string) => {
    setState(prev => {
      const group = prev.groups.find(g => g.id === groupId)
      if (!group) return prev
      
      const updatedGroup = { ...group, memberCount: Math.max(0, group.memberCount - 1) }
      return {
        ...prev,
        userGroups: prev.userGroups.filter(g => g.id !== groupId),
        groups: prev.groups.map(g => g.id === groupId ? updatedGroup : g),
        suggestedGroups: [...prev.suggestedGroups, updatedGroup],
      }
    })
  }, [])

  const createGroup = useCallback((groupData: Omit<Group, 'id' | 'creatorId' | 'memberCount' | 'createdAt'>): Group => {
    const newGroup: Group = {
      ...groupData,
      id: Date.now().toString(),
      creatorId: state.user?.id || '1',
      memberCount: 1,
      createdAt: new Date(),
    }
    
    setState(prev => ({
      ...prev,
      groups: [...prev.groups, newGroup],
      userGroups: [...prev.userGroups, newGroup],
    }))
    
    return newGroup
  }, [state.user?.id])

  const createPost = useCallback((groupId: string, content: string, hasSpoiler: boolean, spoilerProgress?: string) => {
    const newPost: ForumPost = {
      id: Date.now().toString(),
      groupId,
      authorId: state.user?.id || '1',
      author: state.user || mockUser,
      content,
      hasSpoiler,
      spoilerProgress,
      createdAt: new Date(),
      commentsCount: 0,
    }
    
    setState(prev => ({
      ...prev,
      posts: [newPost, ...prev.posts],
    }))
  }, [state.user])

  const createEvent = useCallback((groupId: string, eventData: Omit<GroupEvent, 'id' | 'groupId' | 'creatorId' | 'creator' | 'attendeesCount' | 'isAttending'>) => {
    const newEvent: GroupEvent = {
      ...eventData,
      id: Date.now().toString(),
      groupId,
      creatorId: state.user?.id || '1',
      creator: state.user || mockUser,
      attendeesCount: 1,
      isAttending: true,
    }
    
    setState(prev => ({
      ...prev,
      events: [newEvent, ...prev.events],
    }))
  }, [state.user])

  const toggleEventAttendance = useCallback((eventId: string) => {
    setState(prev => ({
      ...prev,
      events: prev.events.map(e => {
        if (e.id !== eventId) return e
        const isAttending = !e.isAttending
        return {
          ...e,
          isAttending,
          attendeesCount: isAttending ? e.attendeesCount + 1 : Math.max(0, e.attendeesCount - 1),
        }
      }),
    }))
  }, [])

  const searchGroups = useCallback((query: string, filters?: { category?: CulturalCategory; focus?: AnalysisFocus; level?: DepthLevel }): Group[] => {
    return state.groups.filter(group => {
      const matchesQuery = !query || 
        group.name.toLowerCase().includes(query.toLowerCase()) ||
        group.description.toLowerCase().includes(query.toLowerCase()) ||
        group.work.title.toLowerCase().includes(query.toLowerCase())
      
      const matchesCategory = !filters?.category || group.category === filters.category
      const matchesFocus = !filters?.focus || group.focus === filters.focus
      const matchesLevel = !filters?.level || group.level === filters.level
      
      return matchesQuery && matchesCategory && matchesFocus && matchesLevel
    })
  }, [state.groups])

  return (
    <AppContext.Provider value={{
      ...state,
      login,
      logout,
      register,
      completeOnboarding,
      updateProfile,
      setCurrentGroup,
      joinGroup,
      leaveGroup,
      createGroup,
      createPost,
      createEvent,
      toggleEventAttendance,
      searchGroups,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
