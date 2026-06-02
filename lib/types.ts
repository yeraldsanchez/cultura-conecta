// CulturaConecta Type Definitions

export type CulturalCategory = 'cine' | 'teatro' | 'lectura'

export type AnalysisFocus = 
  | 'trama-reflexion'
  | 'analisis-tecnico'
  | 'actuacion-interpretacion'
  | 'tematica-simbolismo'
  | 'ritmo-lectura'
  | 'conversacion-casual'

export type DepthLevel = 'casual' | 'intermedio' | 'analitico' | 'tecnico'

export type EventModality = 'presencial' | 'virtual'

export type GroupRole = 'admin' | 'moderador' | 'miembro'

export interface User {
  id: string
  email: string
  name?: string
  avatar?: string
  categories: CulturalCategory[]
  focus: AnalysisFocus
  level: DepthLevel
  createdAt: Date
  onboardingCompleted: boolean
}

export interface CulturalWork {
  id: string
  title: string
  category: CulturalCategory
  author?: string
  director?: string
  year?: number
  imageUrl?: string
}

export interface Group {
  id: string
  name: string
  description: string
  work: CulturalWork
  category: CulturalCategory
  focus: AnalysisFocus
  level: DepthLevel
  creatorId: string
  memberCount: number
  createdAt: Date
  imageUrl?: string
}

export interface GroupMember {
  userId: string
  user: User
  groupId: string
  role: GroupRole
  joinedAt: Date
}

export interface ForumPost {
  id: string
  groupId: string
  authorId: string
  author: User
  content: string
  hasSpoiler: boolean
  spoilerProgress?: string
  createdAt: Date
  commentsCount: number
}

export interface GroupEvent {
  id: string
  groupId: string
  creatorId: string
  creator: User
  title: string
  description: string
  date: Date
  modality: EventModality
  link?: string
  attendeesCount: number
  isAttending?: boolean
}

export interface Notification {
  id: string
  type: 'new_post' | 'new_event' | 'group_invite' | 'event_reminder'
  title: string
  message: string
  read: boolean
  createdAt: Date
  link?: string
}

// Focus labels in Spanish
export const focusLabels: Record<AnalysisFocus, string> = {
  'trama-reflexion': 'Trama y reflexión',
  'analisis-tecnico': 'Análisis técnico',
  'actuacion-interpretacion': 'Actuación e interpretación',
  'tematica-simbolismo': 'Temática y simbolismo',
  'ritmo-lectura': 'Ritmo de lectura',
  'conversacion-casual': 'Conversación casual',
}

// Level labels in Spanish
export const levelLabels: Record<DepthLevel, string> = {
  'casual': 'Casual',
  'intermedio': 'Intermedio',
  'analitico': 'Analítico',
  'tecnico': 'Técnico / Profundo',
}

// Category labels in Spanish
export const categoryLabels: Record<CulturalCategory, string> = {
  'cine': 'Cine',
  'teatro': 'Teatro',
  'lectura': 'Lectura',
}

// Focus descriptions
export const focusDescriptions: Record<AnalysisFocus, string> = {
  'trama-reflexion': 'Te enfocas en la historia, los personajes y las reflexiones que genera la obra.',
  'analisis-tecnico': 'Analizas aspectos como dirección, cinematografía, edición o estructura narrativa.',
  'actuacion-interpretacion': 'Te interesa discutir el trabajo actoral y las interpretaciones.',
  'tematica-simbolismo': 'Buscas significados profundos, simbolismos y temas subyacentes.',
  'ritmo-lectura': 'Prefieres avanzar junto con otros al mismo ritmo de lectura.',
  'conversacion-casual': 'Disfrutas conversaciones relajadas sin análisis muy profundo.',
}

// Level descriptions
export const levelDescriptions: Record<DepthLevel, string> = {
  'casual': 'Conversaciones ligeras y entretenidas, sin profundizar demasiado.',
  'intermedio': 'Discusiones con algo de análisis pero accesibles para todos.',
  'analitico': 'Análisis detallado con referencias y argumentos elaborados.',
  'tecnico': 'Discusiones especializadas con terminología y conocimiento técnico.',
}
