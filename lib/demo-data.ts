// ============================================================================
// TEMPORARY DEMO DATA — NOT BACKED BY THE API
// ============================================================================
// The CulturaConecta backend now exposes: auth, profile management, catalog
// (interests/focus-types), cultural works, groups (list/create/suggestions),
// group membership (join + list members), and forum post CREATION.
//
// Events have NO backend support at all yet (no service, handler, or route —
// only an empty `events` table in the schema), so they are kept here as
// clearly isolated mock data. Any UI consuming this module must render a
// visible "función en desarrollo / demo" notice so users are not misled.
//
// The forum has a create-post endpoint but no endpoint to LIST posts, so the
// group detail page does not use mock posts anymore — it shows posts created
// during the current session (real API calls) instead. See
// app/(authenticated)/grupo/[id]/page.tsx.
//
// When the backend ships an events endpoint, delete DEMO_EVENTS and replace
// the Eventos tab with real `lib/api` calls.
// ============================================================================

export interface DemoEvent {
  id: number
  title: string
  description: string
  date: string
  modality: "presencial" | "virtual"
  link?: string
}

// TODO(api): replace with a real events endpoint once the backend ships one.
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
