'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useAuth } from '@/lib/auth-context'
import {
  getCulturalWorks,
  getInterests,
  getFocusTypes,
  createCulturalWork,
  createGroup,
  ApiError,
  type CulturalWorkDTO,
} from '@/lib/api'
import { DEPTH_LEVELS, depthLevelLabel } from '@/lib/view-models'
import { cn } from '@/lib/utils'
import {
  Loader2,
  Check,
  ChevronsUpDown,
  Film,
  HelpCircle,
  Eye,
  Plus,
  AlertCircle,
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export default function CrearGrupoPage() {
  const router = useRouter()
  const { user } = useAuth()

  const { data: works, mutate: mutateWorks } = useSWR('cultural-works', getCulturalWorks)
  const { data: interests } = useSWR('interests', getInterests)
  const { data: focusTypes } = useSWR('focus-types', getFocusTypes)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedWork, setSelectedWork] = useState<CulturalWorkDTO | null>(null)
  const [selectedFocus, setSelectedFocus] = useState<number[]>([])
  const [level, setLevel] = useState('')

  // Inline "create new work" sub-form.
  const [creatingWork, setCreatingWork] = useState(false)
  const [newWorkTitle, setNewWorkTitle] = useState('')
  const [newWorkCategory, setNewWorkCategory] = useState('')
  const [workSaving, setWorkSaving] = useState(false)

  const [workOpen, setWorkOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!name.trim()) newErrors.name = 'El nombre del grupo es requerido'
    else if (name.trim().length < 5) newErrors.name = 'El nombre debe tener al menos 5 caracteres'

    if (!description.trim()) newErrors.description = 'La descripción es requerida'
    else if (description.trim().length < 20)
      newErrors.description = 'La descripción debe tener al menos 20 caracteres'

    if (!selectedWork) newErrors.work = 'Debes seleccionar una obra cultural'
    if (selectedFocus.length === 0) newErrors.focus = 'Selecciona al menos un tipo de enfoque'
    if (!level) newErrors.level = 'Selecciona un nivel de profundidad'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleBlur = (field: string) => setTouched((prev) => ({ ...prev, [field]: true }))

  const toggleFocus = (id: number) => {
    setSelectedFocus((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]))
  }

  const handleCreateWork = async () => {
    if (!newWorkTitle.trim() || !newWorkCategory) return
    setWorkSaving(true)
    try {
      const created = await createCulturalWork(newWorkTitle.trim(), Number(newWorkCategory))
      await mutateWorks()
      setSelectedWork(created)
      setCreatingWork(false)
      setNewWorkTitle('')
      setNewWorkCategory('')
    } catch (err) {
      setSubmitError(
        err instanceof ApiError ? err.message : 'No pudimos crear la obra cultural.',
      )
    } finally {
      setWorkSaving(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    setTouched({ name: true, description: true, work: true, focus: true, level: true })
    if (!validate()) return
    if (!user) {
      setSubmitError('Tu sesión expiró. Inicia sesión nuevamente.')
      return
    }

    setIsLoading(true)
    try {
      const group = await createGroup({
        name: name.trim(),
        description: description.trim(),
        work_id: selectedWork!.id,
        created_by: user.userId,
        depth_level: level,
        categories_ids: selectedFocus,
      })
      router.push(`/grupo/${group.id}`)
    } catch (err) {
      setSubmitError(
        err instanceof ApiError ? err.message : 'No pudimos crear el grupo. Intenta nuevamente.',
      )
      setIsLoading(false)
    }
  }

  const selectedFocusItems = (focusTypes ?? []).filter((f) => selectedFocus.includes(f.id))

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground">Crear nuevo grupo</h1>
        <p className="text-muted-foreground mt-1">
          Crea un espacio para discutir una obra cultural con personas afines
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <Card className="lg:col-span-2 border-border/50">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {submitError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del grupo *</Label>
                <Input
                  id="name"
                  placeholder="Ej: Cinéfilos de Villeneuve"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => handleBlur('name')}
                  className={cn(touched.name && errors.name && 'border-destructive')}
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
                  maxLength={500}
                  className={cn(
                    'min-h-24 resize-none',
                    touched.description && errors.description && 'border-destructive',
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
                        <p className="max-w-xs">
                          Cada grupo está asociado a una obra específica (película, libro u obra de
                          teatro)
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {!creatingWork ? (
                  <>
                    <Popover open={workOpen} onOpenChange={setWorkOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={workOpen}
                          className={cn(
                            'w-full justify-between font-normal',
                            !selectedWork && 'text-muted-foreground',
                            touched.work && errors.work && 'border-destructive',
                          )}
                          disabled={isLoading}
                          type="button"
                        >
                          {selectedWork ? (
                            <span className="flex items-center gap-2">
                              <Film className="w-4 h-4" />
                              {selectedWork.title}
                            </span>
                          ) : (
                            'Buscar y seleccionar obra...'
                          )}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Buscar obra..." />
                          <CommandList>
                            <CommandEmpty>No se encontraron obras.</CommandEmpty>
                            <CommandGroup>
                              {(works ?? []).map((work) => (
                                <CommandItem
                                  key={work.id}
                                  value={work.title}
                                  onSelect={() => {
                                    setSelectedWork(work)
                                    setWorkOpen(false)
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      selectedWork?.id === work.id ? 'opacity-100' : 'opacity-0',
                                    )}
                                  />
                                  <Film className="w-4 h-4 mr-2 text-muted-foreground" />
                                  <div className="flex flex-col">
                                    <span>{work.title}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {work.category_name}
                                    </span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary/90 hover:bg-primary/10 -ml-2"
                      onClick={() => setCreatingWork(true)}
                      disabled={isLoading}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Crear nueva obra
                    </Button>
                  </>
                ) : (
                  <div className="rounded-lg border border-border p-4 space-y-3">
                    <Input
                      placeholder="Título de la obra"
                      value={newWorkTitle}
                      onChange={(e) => setNewWorkTitle(e.target.value)}
                    />
                    <Select value={newWorkCategory} onValueChange={setNewWorkCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Categoría de la obra" />
                      </SelectTrigger>
                      <SelectContent>
                        {(interests ?? []).map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleCreateWork}
                        disabled={!newWorkTitle.trim() || !newWorkCategory || workSaving}
                      >
                        {workSaving ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          'Guardar obra'
                        )}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setCreatingWork(false)}
                        disabled={workSaving}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
                {touched.work && errors.work && (
                  <p className="text-sm text-destructive">{errors.work}</p>
                )}
              </div>

              {/* Focus types (multi-select) */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label>Tipo de enfoque *</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger type="button">
                        <HelpCircle className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm">
                        <p>Define cómo se analizarán las obras en este grupo. Puedes elegir varios.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(focusTypes ?? []).map((f) => {
                    const active = selectedFocus.includes(f.id)
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => toggleFocus(f.id)}
                        disabled={isLoading}
                        className={cn(
                          'rounded-full border px-3 py-1.5 text-sm transition-colors',
                          active
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border text-muted-foreground hover:border-primary/40',
                        )}
                      >
                        {active && <Check className="w-3 h-3 mr-1 inline" />}
                        {f.name}
                      </button>
                    )
                  })}
                </div>
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
                <Select value={level} onValueChange={setLevel} disabled={isLoading}>
                  <SelectTrigger
                    className={cn(touched.level && errors.level && 'border-destructive')}
                  >
                    <SelectValue placeholder="Selecciona un nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPTH_LEVELS.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {level && (
                  <p className="text-xs text-muted-foreground">
                    {DEPTH_LEVELS.find((d) => d.value === level)?.description}
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
                  {level && (
                    <Badge variant="secondary" className="text-xs">
                      {depthLevelLabel(level)}
                    </Badge>
                  )}
                  {selectedFocusItems.map((f) => (
                    <Badge key={f.id} variant="outline" className="text-xs">
                      {f.name}
                    </Badge>
                  ))}
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
