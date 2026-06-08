// View models + adapters that translate raw backend DTOs into shapes the UI
// consumes. Keeping the mapping here means components never depend on the exact
// backend JSON layout, and any future backend change is absorbed in one place.

import type { GroupDTO, CatalogItem } from "@/lib/api"

// --- Depth level -----------------------------------------------------------
// The backend stores `depth_level` as a free-form string, so the frontend owns
// the canonical set of options it offers. Unknown values are still rendered
// gracefully (e.g. a value created directly in the DB).

export interface DepthLevelOption {
  value: string
  label: string
  description: string
}

export const DEPTH_LEVELS: DepthLevelOption[] = [
  { value: "casual", label: "Casual", description: "Conversaciones ligeras y entretenidas, sin profundizar demasiado." },
  { value: "intermedio", label: "Intermedio", description: "Discusiones con algo de análisis pero accesibles para todos." },
  { value: "analitico", label: "Analítico", description: "Análisis detallado con referencias y argumentos elaborados." },
  { value: "tecnico", label: "Técnico / Profundo", description: "Discusiones especializadas con terminología y conocimiento técnico." },
]

export function depthLevelLabel(value: string | null | undefined): string {
  if (!value) return "Sin definir"
  const found = DEPTH_LEVELS.find((d) => d.value === value)
  if (found) return found.label
  // Fallback: capitalize the raw backend value.
  return value.charAt(0).toUpperCase() + value.slice(1)
}

// --- Groups ----------------------------------------------------------------
// Note: in the current backend a group's "interests" array is actually populated
// from FOCUS TYPES (see GroupService.CreateGroup -> AssignFocusTypeToGroup).
// The group list response has no cultural category field; it only exposes the
// associated work, depth level and focus types. We surface those as "enfoques".

export interface GroupVM {
  id: number
  name: string
  description: string | null
  workId: number
  workTitle: string
  createdBy: number
  depthLevel: string
  focusTypes: CatalogItem[]
}

export function mapGroup(dto: GroupDTO): GroupVM {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description ?? null,
    workId: dto.work_id,
    workTitle: dto.work_title,
    createdBy: dto.created_by,
    depthLevel: dto.depth_level,
    focusTypes: dto.interests ?? [],
  }
}

export function initialsFrom(nameOrEmail: string | undefined | null): string {
  if (!nameOrEmail) return "U"
  const trimmed = nameOrEmail.trim()
  if (trimmed.includes("@")) return trimmed[0]?.toUpperCase() ?? "U"
  return (
    trimmed
      .split(/\s+/)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U"
  )
}
