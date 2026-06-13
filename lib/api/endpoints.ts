// Typed bindings for every CulturaConecta backend endpoint.
//
// These mirror the Go service output structs exactly. Endpoints not yet exposed
// by the backend (single group fetch, leave group, members list, forum, events)
// intentionally have no function here — those flows fall back to clearly-marked
// local mock data in the app layer.

import { apiRequest } from "./client"

// --- Auth ------------------------------------------------------------------

export interface RegisterResponse {
  // Backend returns { user_id: <int> } (pointer serialized as number).
  user_id: number
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface RefreshResponse {
  access_token: string
  token_type: string
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

// Exchanges a refresh token for a fresh access token. Used both explicitly on
// logout-adjacent flows and implicitly by the client's 401 retry logic.
export function refreshAccessToken(refreshToken: string) {
  return apiRequest<RefreshResponse>("/auth/refresh", {
    method: "POST",
    body: { refresh_token: refreshToken },
    auth: false,
  })
}

// Revokes the refresh token server-side. Returns 204 (no body).
export function logout(refreshToken: string) {
  return apiRequest<void>("/auth/logout", {
    method: "POST",
    body: { refresh_token: refreshToken },
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

// Creates a new interest in the catalog (returns 201 with { interest }).
export async function createInterest(name: string): Promise<CatalogItem> {
  const data = await apiRequest<{ interest: CatalogItem }>("/interests", {
    method: "POST",
    body: { name },
    auth: false,
  })
  return data.interest
}

// Creates a new focus type in the catalog (returns 201 with { focus_type }).
export async function createFocusType(name: string): Promise<CatalogItem> {
  const data = await apiRequest<{ focus_type: CatalogItem }>("/focus-types", {
    method: "POST",
    body: { name },
    auth: false,
  })
  return data.focus_type
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

// Fetches a user profile by id (protected).
export async function getProfile(userId: number): Promise<ProfileDTO> {
  const data = await apiRequest<{ profile: ProfileDTO }>(`/users/${userId}`)
  return data.profile
}

export interface PatchProfileInput {
  name?: string
  depth_level?: string
}

// Partially updates a profile. Backend requires at least one field present.
export async function patchProfile(userId: number, input: PatchProfileInput): Promise<ProfileDTO> {
  const data = await apiRequest<{ profile: ProfileDTO }>(`/users/${userId}`, {
    method: "PATCH",
    body: input,
  })
  return data.profile
}

// Adds an interest (category) to a profile and returns the updated profile.
export async function addInterest(userId: number, categoryId: number): Promise<ProfileDTO> {
  const data = await apiRequest<{ profile: ProfileDTO }>(`/users/${userId}/interests`, {
    method: "POST",
    body: { category_id: categoryId },
  })
  return data.profile
}

// Removes an interest (category) from a profile and returns the updated profile.
export async function removeInterest(userId: number, categoryId: number): Promise<ProfileDTO> {
  const data = await apiRequest<{ profile: ProfileDTO }>(`/users/${userId}/interests/${categoryId}`, {
    method: "DELETE",
  })
  return data.profile
}

// Adds a focus type to a profile and returns the updated profile.
export async function addFocusType(userId: number, focusTypeId: number): Promise<ProfileDTO> {
  const data = await apiRequest<{ profile: ProfileDTO }>(`/users/${userId}/focus-types`, {
    method: "POST",
    body: { focus_type_id: focusTypeId },
  })
  return data.profile
}

// Removes a focus type from a profile and returns the updated profile.
export async function removeFocusType(userId: number, focusTypeId: number): Promise<ProfileDTO> {
  const data = await apiRequest<{ profile: ProfileDTO }>(`/users/${userId}/focus-types/${focusTypeId}`, {
    method: "DELETE",
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

// Joins the authenticated user to a group. The user id is taken from the JWT
// server-side, so no body is needed. Returns 204 (no content).
export async function joinGroup(groupId: number): Promise<void> {
  await apiRequest<void>(`/groups/${groupId}/members`, {
    method: "POST",
  })
}
