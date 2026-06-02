'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useApp } from '@/lib/app-context'
import { categoryLabels, focusLabels, levelLabels, focusDescriptions, levelDescriptions } from '@/lib/types'
import type { CulturalCategory, AnalysisFocus, DepthLevel, CulturalWork } from '@/lib/types'
import { cn } from '@/lib/utils'
import { 
  AlertCircle, 
  Loader2, 
  Check, 
  ChevronsUpDown,
  Film,
  BookOpen,
  Theater,
  HelpCircle,
  Eye
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

// Mock cultural works for demo
const mockWorks: CulturalWork[] = [
  { id: 'w1', title: 'Dune: Parte Dos', category: 'cine', director: 'Denis Villeneuve', year: 2024 },
  { id: 'w2', title: 'Oppenheimer', category: 'cine', director: 'Christopher Nolan', year: 2023 },
  { id: 'w3', title: 'Poor Things', category: 'cine', director: 'Yorgos Lanthimos', year: 2023 },
  { id: 'w4', title: 'Barbie', category: 'cine', director: 'Greta Gerwig', year: 2023 },
  { id: 'w5', title: 'El Resplandor', category: 'cine', director: 'Stanley Kubrick', year: 1980 },
  { id: 'w6', title: 'Cien Años de Soledad', category: 'lectura', author: 'Gabriel García Márquez', year: 1967 },
  { id: 'w7', title: 'Kafka en la Orilla', category: 'lectura', author: 'Haruki Murakami', year: 2002 },
  { id: 'w8', title: '1984', category: 'lectura', author: 'George Orwell', year: 1949 },
  { id: 'w9', title: 'El Alquimista', category: 'lectura', author: 'Paulo Coelho', year: 1988 },
  { id: 'w10', title: 'Hamlet', category: 'teatro', author: 'William Shakespeare', year: 1600 },
  { id: 'w11', title: 'Hamilton', category: 'teatro', author: 'Lin-Manuel Miranda', year: 2015 },
  { id: 'w12', title: 'Wicked', category: 'teatro', author: 'Stephen Schwartz', year: 2003 },
]

const categoryIcons = {
  cine: Film,
  teatro: Theater,
  lectura: BookOpen,
}

export default function CrearGrupoPage() {
  const router = useRouter()
  const { createGroup } = useApp()
  
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedWork, setSelectedWork] = useState<CulturalWork | null>(null)
  const [category, setCategory] = useState<CulturalCategory | ''>('')
  const [focus, setFocus] = useState<AnalysisFocus | ''>('')
  const [level, setLevel] = useState<DepthLevel | ''>('')
  
  const [workOpen, setWorkOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  
  const filteredWorks = category 
    ? mockWorks.filter(w => w.category === category)
    : mockWorks
  
  const validate = () => {
    const newErrors: Record<string, string> = {}
    
    if (!name.trim()) newErrors.name = 'El nombre del grupo es requerido'
    else if (name.length < 5) newErrors.name = 'El nombre debe tener al menos 5 caracteres'
    
    if (!description.trim()) newErrors.description = 'La descripción es requerida'
    else if (description.length < 20) newErrors.description = 'La descripción debe tener al menos 20 caracteres'
    
    if (!selectedWork) newErrors.work = 'Debes seleccionar una obra cultural'
    if (!category) newErrors.category = 'Selecciona una categoría'
    if (!focus) newErrors.focus = 'Selecciona un tipo de enfoque'
    if (!level) newErrors.level = 'Selecciona un nivel de profundidad'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setTouched({
      name: true,
      description: true,
      work: true,
      category: true,
      focus: true,
      level: true,
    })
    
    if (!validate()) return
    
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const newGroup = createGroup({
      name,
      description,
      work: selectedWork!,
      category: category as CulturalCategory,
      focus: focus as AnalysisFocus,
      level: level as DepthLevel,
    })
    
    router.push(`/grupo/${newGroup.id}`)
  }
  
  const handleWorkSelect = (work: CulturalWork) => {
    setSelectedWork(work)
    setCategory(work.category)
    setWorkOpen(false)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground">
          Crear nuevo grupo
        </h1>
        <p className="text-muted-foreground mt-1">
          Crea un espacio para discutir una obra cultural con personas afines
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <Card className="lg:col-span-2 border-border/50">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del grupo *</Label>
                <Input
                  id="name"
                  placeholder="Ej: Cinéfilos de Villeneuve"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => handleBlur('name')}
                  className={cn(
                    touched.name && errors.name && 'border-destructive'
                  )}
                  disabled={isLoading}
                />
                {touched.name && errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>
              
              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Descripción *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe el propósito del grupo, qué tipo de discusiones tendrán, y qué buscan en los nuevos miembros..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={() => handleBlur('description')}
                  className={cn(
                    'min-h-24 resize-none',
                    touched.description && errors.description && 'border-destructive'
                  )}
                  disabled={isLoading}
                />
                <div className="flex justify-between">
                  {touched.description && errors.description ? (
                    <p className="text-sm text-destructive">{errors.description}</p>
                  ) : (
                    <span />
                  )}
                  <p className="text-xs text-muted-foreground">{description.length}/500</p>
                </div>
              </div>
              
              {/* Cultural Work */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label>Obra cultural *</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger type="button">
                        <HelpCircle className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Cada grupo está asociado a una obra específica (película, libro u obra de teatro)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Popover open={workOpen} onOpenChange={setWorkOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={workOpen}
                      className={cn(
                        'w-full justify-between font-normal',
                        !selectedWork && 'text-muted-foreground',
                        touched.work && errors.work && 'border-destructive'
                      )}
                      disabled={isLoading}
                      type="button"
                    >
                      {selectedWork ? (
                        <span className="flex items-center gap-2">
                          {(() => {
                            const Icon = categoryIcons[selectedWork.category]
                            return <Icon className="w-4 h-4" />
                          })()}
                          {selectedWork.title}
                        </span>
                      ) : (
                        'Buscar y seleccionar obra...'
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Buscar obra..." />
                      <CommandList>
                        <CommandEmpty>No se encontraron obras.</CommandEmpty>
                        <CommandGroup>
                          {filteredWorks.map((work) => {
                            const Icon = categoryIcons[work.category]
                            return (
                              <CommandItem
                                key={work.id}
                                value={work.title}
                                onSelect={() => handleWorkSelect(work)}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    selectedWork?.id === work.id ? 'opacity-100' : 'opacity-0'
                                  )}
                                />
                                <Icon className="w-4 h-4 mr-2 text-muted-foreground" />
                                <div className="flex flex-col">
                                  <span>{work.title}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {work.author || work.director} • {work.year}
                                  </span>
                                </div>
                              </CommandItem>
                            )
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {touched.work && errors.work && (
                  <p className="text-sm text-destructive">{errors.work}</p>
                )}
              </div>
              
              {/* Category */}
              <div className="space-y-2">
                <Label>Categoría *</Label>
                <Select 
                  value={category} 
                  onValueChange={(value) => setCategory(value as CulturalCategory)}
                  disabled={isLoading}
                >
                  <SelectTrigger className={cn(
                    touched.category && errors.category && 'border-destructive'
                  )}>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([value, label]) => {
                      const Icon = categoryIcons[value as CulturalCategory]
                      return (
                        <SelectItem key={value} value={value}>
                          <span className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            {label}
                          </span>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                {touched.category && errors.category && (
                  <p className="text-sm text-destructive">{errors.category}</p>
                )}
              </div>
              
              {/* Focus */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label>Tipo de enfoque *</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger type="button">
                        <HelpCircle className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm">
                        <p>Define cómo se analizarán las obras en este grupo</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Select 
                  value={focus} 
                  onValueChange={(value) => setFocus(value as AnalysisFocus)}
                  disabled={isLoading}
                >
                  <SelectTrigger className={cn(
                    touched.focus && errors.focus && 'border-destructive'
                  )}>
                    <SelectValue placeholder="Selecciona un enfoque" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(focusLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        <div className="flex flex-col">
                          <span>{label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {focus && (
                  <p className="text-xs text-muted-foreground">
                    {focusDescriptions[focus as AnalysisFocus]}
                  </p>
                )}
                {touched.focus && errors.focus && (
                  <p className="text-sm text-destructive">{errors.focus}</p>
                )}
              </div>
              
              {/* Level */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label>Nivel de profundidad *</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger type="button">
                        <HelpCircle className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm">
                        <p>Define qué tan profundas serán las discusiones en este grupo</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Select 
                  value={level} 
                  onValueChange={(value) => setLevel(value as DepthLevel)}
                  disabled={isLoading}
                >
                  <SelectTrigger className={cn(
                    touched.level && errors.level && 'border-destructive'
                  )}>
                    <SelectValue placeholder="Selecciona un nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(levelLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {level && (
                  <p className="text-xs text-muted-foreground">
                    {levelDescriptions[level as DepthLevel]}
                  </p>
                )}
                {touched.level && errors.level && (
                  <p className="text-sm text-destructive">{errors.level}</p>
                )}
              </div>
              
              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creando grupo...
                    </>
                  ) : (
                    'Crear grupo'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        {/* Preview */}
        <div className="lg:col-span-1">
          <Card className="border-border/50 sticky top-24">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">Vista previa</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="font-serif font-semibold text-foreground">
                    {name || 'Nombre del grupo'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedWork?.title || 'Obra cultural'}
                  </p>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {description || 'Descripción del grupo...'}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {category && (
                    <Badge variant="secondary" className="text-xs">
                      {categoryLabels[category]}
                    </Badge>
                  )}
                  {focus && (
                    <Badge variant="outline" className="text-xs">
                      {focusLabels[focus as AnalysisFocus]}
                    </Badge>
                  )}
                  {level && (
                    <Badge variant="outline" className="text-xs">
                      {levelLabels[level as DepthLevel]}
                    </Badge>
                  )}
                </div>
                
                <p className="text-xs text-muted-foreground">
                  Serás el administrador de este grupo
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
