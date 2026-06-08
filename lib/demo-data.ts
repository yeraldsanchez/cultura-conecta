// ============================================================================
// TEMPORARY DEMO DATA — NOT BACKED BY THE API
// ============================================================================
// The current CulturaConecta backend exposes ONLY: auth, profile creation,
// catalog (interests/focus-types), cultural works, and groups (list + create).
//
// The features below have NO endpoint yet, so they are kept here as clearly
// isolated mock data. They are intentionally NOT mixed into the real API layer
// (`lib/api/*`). Any UI consuming this module must render a visible
// "función en desarrollo / demo" notice so users are not misled.
//
// When the backend ships these endpoints, delete this file and replace the
// imports with real `lib/api` calls. Extension points are marked with TODO(api).
// ============================================================================

export interface DemoMember {
  id: number
  name: string
  role: "admin" | "moderador" | "miembro"
}

export interface DemoPost {
  id: number
  authorName: string
  content: string
  hasSpoiler: boolean
  spoilerProgress?: string
  createdAt: string
}

export interface DemoEvent {
  id: number
  title: string
  description: string
  date: string
  modality: "presencial" | "virtual"
  link?: string
}

// TODO(api): replace with GET /groups/:id/members once available.
export const DEMO_MEMBERS: DemoMember[] = [
  { id: 1, name: "Ana Martínez", role: "admin" },
  { id: 2, name: "Carlos Ruiz", role: "moderador" },
  { id: 3, name: "María López", role: "miembro" },
  { id: 4, name: "Roberto Díaz", role: "miembro" },
]

// TODO(api): replace with GET /groups/:id/posts once available.
export const DEMO_POSTS: DemoPost[] = [
  {
    id: 1,
    authorName: "Carlos Ruiz",
    content:
      "Este es un ejemplo de publicación del foro. El foro todavía no está conectado a la API, por lo que estos mensajes son solo demostrativos.",
    hasSpoiler: false,
    createdAt: "2024-03-15T10:30:00",
  },
  {
    id: 2,
    authorName: "María López",
    content:
      "Contenido con spoiler de ejemplo para mostrar cómo se vería el desenlace de la obra una vez el foro esté disponible.",
    hasSpoiler: true,
    spoilerProgress: "Obra completa",
    createdAt: "2024-03-14T15:45:00",
  },
]

// TODO(api): replace with GET /groups/:id/events once available.
export const DEMO_EVENTS: DemoEvent[] = [
  {
    id: 1,
    title: "Sesión de discusión (demo)",
    description:
      "Evento de demostración. La gestión de eventos aún no está disponible en el backend.",
    date: "2024-12-20T18:00:00",
    modality: "virtual",
    link: "https://meet.example.com/demo",
  },
]
