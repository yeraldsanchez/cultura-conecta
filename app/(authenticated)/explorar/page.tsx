'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
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
  SelectValue 
} from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { GroupCard } from '@/components/group-card'
import { EmptyState } from '@/components/empty-state'
import { useApp } from '@/lib/app-context'
import { categoryLabels, focusLabels, levelLabels } from '@/lib/types'
import type { CulturalCategory, AnalysisFocus, DepthLevel } from '@/lib/types'
import { 
  Search, 
  Filter, 
  X, 
  SlidersHorizontal,
  Loader2
} from 'lucide-react'

export default function ExplorarPage() {
  const router = useRouter()
  const { searchGroups, joinGroup, userGroups } = useApp()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<CulturalCategory | 'all'>('all')
  const [focusFilter, setFocusFilter] = useState<AnalysisFocus | 'all'>('all')
  const [levelFilter, setLevelFilter] = useState<DepthLevel | 'all'>('all')
  const [isSearching, setIsSearching] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  
  // Filter and search groups
  const filteredGroups = useMemo(() => {
    const results = searchGroups(
      searchQuery,
      {
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        focus: focusFilter !== 'all' ? focusFilter : undefined,
        level: levelFilter !== 'all' ? levelFilter : undefined,
      }
    )
    return results
  }, [searchQuery, categoryFilter, focusFilter, levelFilter, searchGroups])
  
  const activeFiltersCount = [
    categoryFilter !== 'all',
    focusFilter !== 'all',
    levelFilter !== 'all',
  ].filter(Boolean).length
  
  const clearFilters = () => {
    setCategoryFilter('all')
    setFocusFilter('all')
    setLevelFilter('all')
    setSearchQuery('')
  }
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSearching(true)
    // Simulate search delay
    setTimeout(() => setIsSearching(false), 300)
  }
  
  const isUserMember = (groupId: string) => {
    return userGroups.some(g => g.id === groupId)
  }
  
  const FilterControls = () => (
    <div className="space-y-6">
      {/* Category */}
      <div className="space-y-2">
        <Label>Categoría</Label>
        <Select 
          value={categoryFilter} 
          onValueChange={(value) => setCategoryFilter(value as CulturalCategory | 'all')}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todas las categorías" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {Object.entries(categoryLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Focus */}
      <div className="space-y-2">
        <Label>Tipo de enfoque</Label>
        <Select 
          value={focusFilter} 
          onValueChange={(value) => setFocusFilter(value as AnalysisFocus | 'all')}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos los enfoques" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los enfoques</SelectItem>
            {Object.entries(focusLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Level */}
      <div className="space-y-2">
        <Label>Nivel de profundidad</Label>
        <Select 
          value={levelFilter} 
          onValueChange={(value) => setLevelFilter(value as DepthLevel | 'all')}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos los niveles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los niveles</SelectItem>
            {Object.entries(levelLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Clear filters */}
      {activeFiltersCount > 0 && (
        <Button 
          variant="outline" 
          className="w-full"
          onClick={clearFilters}
        >
          <X className="w-4 h-4 mr-2" />
          Limpiar filtros
        </Button>
      )}
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground">
          Explorar grupos
        </h1>
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
        
        {/* Main content */}
        <div className="flex-1">
          {/* Search bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar por nombre, obra o descripción..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
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
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-sm text-muted-foreground">Filtros activos:</span>
              {categoryFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {categoryLabels[categoryFilter]}
                  <button onClick={() => setCategoryFilter('all')}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {focusFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {focusLabels[focusFilter]}
                  <button onClick={() => setFocusFilter('all')}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {levelFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {levelLabels[levelFilter]}
                  <button onClick={() => setLevelFilter('all')}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
          
          {/* Results count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              {filteredGroups.length} {filteredGroups.length === 1 ? 'grupo encontrado' : 'grupos encontrados'}
            </p>
          </div>
          
          {/* Results */}
          {isSearching ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          ) : filteredGroups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredGroups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  isMember={isUserMember(group.id)}
                  onView={() => router.push(`/grupo/${group.id}`)}
                  onJoin={() => joinGroup(group.id)}
                />
              ))}
            </div>
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
