// Typed bindings for every CulturaConecta backend endpoint.
//
// These mirror the Go service output structs exactly. Where the backend has
// no endpoint yet (single group, join/leave, members, forum, events, profile
// fetch/update) there is intentionally no function here — those flows fall back
// to clearly-marked local mock data in the app layer.

import { apiRequest } from "./client"

// --- Auth ------------------------------------------------------------------

export interface RegisterResponse {
  // Backend returns { user_id: <int> } (pointer serialized as number).
  user_id: number
}

export interface LoginResponse {
  token: string
}

export function register(email: string, password: string) {
  return apiRequest<RegisterResponse>("/auth/register", {
    method: "POST",
    body: { email, password },
    auth: false,
  })
}

export function login(email: string, password: string) {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  })
}

// --- Catalog: interests & focus types --------------------------------------

export interface CatalogItem {
  id: number
  name: string
}

export async function getInterests(): Promise<CatalogItem[]> {
  const data = await apiRequest<{ interests: CatalogItem[] }>("/interests", { auth: false })
  return data.interests ?? []
}

export async function getFocusTypes(): Promise<CatalogItem[]> {
  const data = await apiRequest<{ focus_types: CatalogItem[] }>("/focus-types", { auth: false })
  return data.focus_types ?? []
}

// --- Cultural works --------------------------------------------------------

export interface CulturalWorkDTO {
  id: number
  title: string
  category_id: number
  category_name: string
  created_at: string
}

export async function getCulturalWorks(): Promise<CulturalWorkDTO[]> {
  const data = await apiRequest<{ cultural_works: CulturalWorkDTO[] }>("/cultural-works", { auth: false })
  return data.cultural_works ?? []
}

export async function createCulturalWork(title: string, categoryId: number): Promise<CulturalWorkDTO> {
  const data = await apiRequest<{ cultural_work: CulturalWorkDTO }>("/cultural-works", {
    method: "POST",
    body: { title, category_id: categoryId },
  })
  return data.cultural_work
}

// --- User profile ----------------------------------------------------------

export interface ProfileDTO {
  user_id: number
  name: string
  email: string
  profile_id: number
  depth_level: string
  focus_types: CatalogItem[]
  interests: CatalogItem[]
}

export interface CreateProfileInput {
  user_id: number
  name: string
  depth_level: string
  focus_ids: number[]
  interests_ids: number[]
}

export async function createProfile(input: CreateProfileInput): Promise<ProfileDTO> {
  const data = await apiRequest<{ profile: ProfileDTO }>("/users", {
    method: "POST",
    body: input,
  })
  return data.profile
}

// --- Groups ----------------------------------------------------------------

export interface GroupDTO {
  id: number
  name: string
  work_id: number
  work_title: string
  created_by: number
  description: string | null
  depth_level: string
  interests: CatalogItem[]
}

export interface ListGroupsParams {
  page?: number
  limit?: number
  name?: string
  depth_level?: string
  work_id?: number
  // Comma-separated focus-type ids server-side (param name: categories_ids).
  categories_ids?: string
}

export interface PaginatedGroups {
  items: GroupDTO[]
  total_count: number
  page: number
  limit: number
}

export async function listGroups(params: ListGroupsParams = {}): Promise<PaginatedGroups> {
  const data = await apiRequest<PaginatedGroups>("/groups", {
    auth: false,
    query: {
      page: params.page,
      limit: params.limit,
      name: params.name,
      depth_level: params.depth_level,
      work_id: params.work_id,
      categories_ids: params.categories_ids,
    },
  })
  return {
    items: data.items ?? [],
    total_count: data.total_count ?? 0,
    page: data.page ?? 1,
    limit: data.limit ?? 10,
  }
}

export interface CreateGroupInput {
  name: string
  description: string
  work_id: number
  created_by: number
  depth_level: string
  categories_ids: number[]
}

export async function createGroup(input: CreateGroupInput): Promise<GroupDTO> {
  const data = await apiRequest<{ group: GroupDTO }>("/groups", {
    method: "POST",
    body: input,
  })
  return data.group
}
