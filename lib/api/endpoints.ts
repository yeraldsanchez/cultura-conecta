// Typed bindings for every CulturaConecta backend endpoint.
//
// These mirror the Go service output structs exactly. Endpoints still not
// exposed by the backend at all (single group fetch, leave group) intentionally
// have no function here — those flows fall back to clearly-marked local mock
// data / client-side fallbacks in the app layer.

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

// Suggested groups for the authenticated user (matches their depth level,
// interests and focus types, excluding groups they already belong to). The
// user id is taken from the JWT server-side.
export interface ListSuggestedGroupsParams {
  page?: number
  limit?: number
}

export async function getSuggestedGroups(
  params: ListSuggestedGroupsParams = {},
): Promise<PaginatedGroups> {
  const data = await apiRequest<PaginatedGroups>("/groups/suggestions", {
    query: { page: params.page, limit: params.limit },
  })
  return {
    items: data.items ?? [],
    total_count: data.total_count ?? 0,
    page: data.page ?? 1,
    limit: data.limit ?? 10,
  }
}

// Groups the given user belongs to (created or joined), with their role and
// join date. This is the real created+joined relationship — unlike `created_by`
// alone, it also includes groups the user joined without creating them.
export interface UserGroupDTO extends GroupDTO {
  role: string
  joined_at: string
}

export async function getGroupsByMember(userId: number): Promise<UserGroupDTO[]> {
  const data = await apiRequest<{ groups: UserGroupDTO[] }>(`/users/${userId}/groups`)
  return data.groups ?? []
}

// Members of a group (protected: requires an authenticated session, not
// necessarily membership in that specific group).
export interface GroupMemberDTO {
  user_id: number
  name: string | null
  role: string
  joined_at: string
}

export async function getGroupMembers(groupId: number): Promise<GroupMemberDTO[]> {
  const data = await apiRequest<{ members: GroupMemberDTO[] }>(`/groups/${groupId}/members`)
  return data.members ?? []
}

// --- Group forum posts ------------------------------------------------------

export interface PostDTO {
  id: number
  group_id: number
  user_id: number
  content: string
  has_spoiler: boolean
  spoiler_progress: string | null
  created_at: string
}

export interface CreatePostInput {
  content: string
  has_spoiler?: boolean
  spoiler_progress?: string | null
}

export async function createPost(groupId: number, input: CreatePostInput): Promise<PostDTO> {
  const data = await apiRequest<{ post: PostDTO }>(`/groups/${groupId}/posts`, {
    method: "POST",
    body: {
      content: input.content,
      has_spoiler: input.has_spoiler ?? false,
      spoiler_progress: input.spoiler_progress ?? null,
    },
  })
  return data.post
}

// Posts include the author's display name resolved server-side.
export interface PostWithAuthorDTO extends PostDTO {
  author_name: string | null
}

export interface ListGroupPostsParams {
  page?: number
  limit?: number
}

// Lists a group's forum posts (most recent first). Requires the authenticated
// user to be a member of the group.
export async function listGroupPosts(
  groupId: number,
  params: ListGroupPostsParams = {},
): Promise<PostWithAuthorDTO[]> {
  const data = await apiRequest<{ posts: PostWithAuthorDTO[] }>(`/groups/${groupId}/posts`, {
    query: { page: params.page, limit: params.limit },
  })
  return data.posts ?? []
}

// --- Group events ------------------------------------------------------------

export interface EventDTO {
  id: number
  group_id: number
  created_by: number
  title: string
  description: string | null
  event_date: string
  modality: "in-person" | "virtual"
  link: string | null
  created_at: string
}

export interface CreateEventInput {
  title: string
  description?: string | null
  // ISO 8601 datetime string, e.g. new Date(...).toISOString().
  event_date: string
  modality: "in-person" | "virtual"
  link?: string | null
}

// Creates an event in a group. The authenticated user must be a member.
export async function createEvent(groupId: number, input: CreateEventInput): Promise<EventDTO> {
  const data = await apiRequest<{ event: EventDTO }>(`/groups/${groupId}/events`, {
    method: "POST",
    body: {
      title: input.title,
      description: input.description ?? null,
      event_date: input.event_date,
      modality: input.modality,
      link: input.link ?? null,
    },
  })
  return data.event
}

// Lists every event for a group.
export async function getEvents(groupId: number): Promise<EventDTO[]> {
  const data = await apiRequest<{ events: EventDTO[] }>(`/groups/${groupId}/events`)
  return data.events ?? []
}

export interface AttendeeDTO {
  event_id: number
  user_id: number
  confirmed_at: string
}

// Confirms the authenticated user's attendance to an event. The user must be
// a member of the event's group. Returns 201 with the attendance record.
export async function confirmAttendance(groupId: number, eventId: number): Promise<AttendeeDTO> {
  const data = await apiRequest<{ attendee: AttendeeDTO }>(
    `/groups/${groupId}/events/${eventId}/attendees`,
    { method: "POST" },
  )
  return data.attendee
}

export interface AttendeeDetailDTO {
  user_id: number
  name: string | null
  confirmed_at: string
}

// Lists the confirmed attendees of an event.
export async function getEventAttendees(
  groupId: number,
  eventId: number,
): Promise<AttendeeDetailDTO[]> {
  const data = await apiRequest<{ attendees: AttendeeDetailDTO[] }>(
    `/groups/${groupId}/events/${eventId}/attendees`,
  )
  return data.attendees ?? []
}
