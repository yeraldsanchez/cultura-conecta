'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { GroupCard } from '@/components/group-card'
import { EmptyState } from '@/components/empty-state'
import { useAuth } from '@/lib/auth-context'
import { listGroups, getFocusTypes, ApiError } from '@/lib/api'
import { mapGroup, DEPTH_LEVELS } from '@/lib/view-models'
import {
  Search,
  Filter,
  X,
  SlidersHorizontal,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

const PAGE_SIZE = 8

export default function ExplorarPage() {
  const router = useRouter()
  const { user } = useAuth()

  // Committed search term (only applied on submit so we don't spam the API).
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [depthFilter, setDepthFilter] = useState<string>('all')
  const [focusFilter, setFocusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Focus types power the "enfoque" filter (sent as categories_ids server-side).
  const { data: focusTypes } = useSWR('focus-types', getFocusTypes)

  const { data, error, isLoading } = useSWR(
    ['groups', page, searchQuery, depthFilter, focusFilter],
    () =>
      listGroups({
        page,
        limit: PAGE_SIZE,
        name: searchQuery || undefined,
        depth_level: depthFilter !== 'all' ? depthFilter : undefined,
        categories_ids: focusFilter !== 'all' ? focusFilter : undefined,
      }),
    { keepPreviousData: true },
  )

  const groups = (data?.items ?? []).map(mapGroup)
  const totalCount = data?.total_count ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  const activeFiltersCount = [depthFilter !== 'all', focusFilter !== 'all'].filter(Boolean).length

  const clearFilters = () => {
    setDepthFilter('all')
    setFocusFilter('all')
    setSearchInput('')
    setSearchQuery('')
    setPage(1)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    setSearchQuery(searchInput.trim())
  }

  const FilterControls = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Tipo de enfoque</Label>
        <Select
          value={focusFilter}
          onValueChange={(value) => {
            setFocusFilter(value)
            setPage(1)
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos los enfoques" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los enfoques</SelectItem>
            {(focusTypes ?? []).map((f) => (
              <SelectItem key={f.id} value={String(f.id)}>
                {f.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Nivel de profundidad</Label>
        <Select
          value={depthFilter}
          onValueChange={(value) => {
            setDepthFilter(value)
            setPage(1)
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos los niveles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los niveles</SelectItem>
            {DEPTH_LEVELS.map((d) => (
              <SelectItem key={d.value} value={d.value}>
                {d.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {activeFiltersCount > 0 && (
        <Button variant="outline" className="w-full" onClick={clearFilters}>
          <X className="w-4 h-4 mr-2" />
          Limpiar filtros
        </Button>
      )}
    </div>
  )

  const focusLabel = (id: string) => (focusTypes ?? []).find((f) => String(f.id) === id)?.name ?? id
  const depthLabel = (val: string) => DEPTH_LEVELS.find((d) => d.value === val)?.label ?? val

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground">Explorar grupos</h1>
        <p className="text-muted-foreground mt-1">
          Encuentra grupos compatibles con tus intereses culturales
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar filters (desktop) */}
        <aside className="hidden lg:block w-72 shrink-0">
          <Card className="border-border/50 sticky top-24">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <h2 className="font-medium text-foreground">Filtros</h2>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </div>
              <FilterControls />
            </CardContent>
          </Card>
        </aside>

        <div className="flex-1">
          {/* Search bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar por nombre del grupo..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" className="shrink-0">
                Buscar
              </Button>

              {/* Mobile filter button */}
              <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="outline" className="shrink-0">
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Filtros
                    {activeFiltersCount > 0 && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Filtros</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterControls />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </form>

          {/* Active filters chips */}
          {(activeFiltersCount > 0 || searchQuery) && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-sm text-muted-foreground">Filtros activos:</span>
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  {`"${searchQuery}"`}
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setSearchInput('')
                      setPage(1)
                    }}
                    aria-label="Quitar búsqueda"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {focusFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {focusLabel(focusFilter)}
                  <button onClick={() => setFocusFilter('all')} aria-label="Quitar filtro de enfoque">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {depthFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {depthLabel(depthFilter)}
                  <button onClick={() => setDepthFilter('all')} aria-label="Quitar filtro de nivel">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}

          {/* Results count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              {totalCount} {totalCount === 1 ? 'grupo encontrado' : 'grupos encontrados'}
            </p>
          </div>

          {/* Results */}
          {error ? (
            <Card className="border-destructive/30">
              <CardContent className="p-6 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">No pudimos cargar los grupos</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {error instanceof ApiError ? error.message : 'Verifica tu conexión con el servidor.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          ) : groups.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {groups.map((group) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    isOwner={user?.userId === group.createdBy}
                    onView={() => router.push(`/grupo/${group.id}`)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground px-2">
                    Página {page} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Siguiente
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <EmptyState
              type="no-results"
              title="No encontramos grupos"
              description="Intenta ajustar los filtros o buscar con otros términos."
              action={{ label: 'Limpiar filtros', onClick: clearFilters }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
