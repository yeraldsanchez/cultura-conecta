// View models + adapters that translate raw backend DTOs into shapes the UI
// consumes. Keeping the mapping here means components never depend on the exact
// backend JSON layout, and any future backend change is absorbed in one place.

import type {
  GroupDTO,
  CatalogItem,
  UserGroupDTO,
  GroupMemberDTO,
  PostDTO,
} from "@/lib/api"

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

// --- Membership (groups a user created or joined) ---------------------------
// `GET /users/:id/groups` returns every group the user belongs to, with their
// role in it ("admin" for groups they created, "member" once they join, and —
// per the DB schema, though the API never assigns it yet — "moderator").

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  moderator: "Moderador",
  member: "Miembro",
}

export function roleLabel(role: string | null | undefined): string {
  if (!role) return "Miembro"
  return ROLE_LABELS[role] ?? role.charAt(0).toUpperCase() + role.slice(1)
}

export interface UserGroupVM extends GroupVM {
  role: string
  joinedAt: string
}

export function mapUserGroup(dto: UserGroupDTO): UserGroupVM {
  return {
    ...mapGroup(dto),
    role: dto.role,
    joinedAt: dto.joined_at,
  }
}

// --- Group members -----------------------------------------------------------

export interface GroupMemberVM {
  userId: number
  name: string | null
  role: string
  joinedAt: string
}

export function mapGroupMember(dto: GroupMemberDTO): GroupMemberVM {
  return {
    userId: dto.user_id,
    name: dto.name,
    role: dto.role,
    joinedAt: dto.joined_at,
  }
}

// --- Forum posts --------------------------------------------------------------
// NOTE: there is no endpoint to list historical posts (see lib/api/endpoints.ts),
// so this view model only ever maps posts created in the current session.

export interface PostVM {
  id: number
  groupId: number
  userId: number
  content: string
  hasSpoiler: boolean
  spoilerProgress: string | null
  createdAt: string
}

export function mapPost(dto: PostDTO): PostVM {
  return {
    id: dto.id,
    groupId: dto.group_id,
    userId: dto.user_id,
    content: dto.content,
    hasSpoiler: dto.has_spoiler,
    spoilerProgress: dto.spoiler_progress,
    createdAt: dto.created_at,
  }
}
