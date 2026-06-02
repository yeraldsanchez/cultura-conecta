'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useApp } from '@/lib/app-context'
import { CategorySelector, FocusSelector, LevelSelector } from '@/components/profile-selectors'
import { categoryLabels, focusLabels, levelLabels } from '@/lib/types'
import type { CulturalCategory, AnalysisFocus, DepthLevel } from '@/lib/types'
import { 
  AlertCircle, 
  Loader2, 
  ArrowLeft,
  Film,
  BookOpen,
  Theater,
  Check
} from 'lucide-react'

const categoryIcons = {
  cine: Film,
  teatro: Theater,
  lectura: BookOpen,
}

export default function EditarPerfilPage() {
  const router = useRouter()
  const { user, updateProfile } = useApp()
  
  const [categories, setCategories] = useState<CulturalCategory[]>(user?.categories || [])
  const [focus, setFocus] = useState<AnalysisFocus | null>(user?.focus || null)
  const [level, setLevel] = useState<DepthLevel | null>(user?.level || null)
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const canSave = categories.length > 0 && focus !== null && level !== null
  
  const hasChanges = () => {
    if (!user) return false
    const categoriesChanged = JSON.stringify(categories.sort()) !== JSON.stringify([...user.categories].sort())
    const focusChanged = focus !== user.focus
    const levelChanged = level !== user.level
    return categoriesChanged || focusChanged || levelChanged
  }
  
  const handleSubmit = async () => {
    if (!canSave) {
      setError('Por favor completa todos los campos requeridos')
      return
    }
    
    setIsLoading(true)
    setError('')
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    updateProfile(categories, focus!, level!)
    
    toast.success('Perfil actualizado correctamente', {
      description: 'Tus preferencias han sido guardadas.'
    })
    
    router.push('/perfil')
  }
  
  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Back button */}
      <Button 
        variant="ghost" 
        size="sm" 
        className="mb-6 -ml-2 text-muted-foreground"
        onClick={() => router.back()}
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Volver al perfil
      </Button>
      
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="font-serif text-2xl">Editar perfil cultural</CardTitle>
          <CardDescription>
            Actualiza tus intereses para recibir mejores sugerencias de grupos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* Categories */}
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-foreground mb-1">Categorías de interés</h3>
              <p className="text-sm text-muted-foreground">
                Selecciona al menos una categoría
              </p>
            </div>
            <CategorySelector 
              selected={categories} 
              onChange={setCategories} 
            />
            {categories.length === 0 && (
              <p className="text-sm text-destructive">
                Selecciona al menos una categoría
              </p>
            )}
          </div>
          
          {/* Focus */}
          <div className="space-y-4 pt-6 border-t border-border/50">
            <div>
              <h3 className="font-medium text-foreground mb-1">Tipo de enfoque</h3>
              <p className="text-sm text-muted-foreground">
                Define cómo prefieres analizar las obras
              </p>
            </div>
            <FocusSelector 
              selected={focus} 
              onChange={setFocus} 
            />
          </div>
          
          {/* Level */}
          <div className="space-y-4 pt-6 border-t border-border/50">
            <div>
              <h3 className="font-medium text-foreground mb-1">Nivel de profundidad</h3>
              <p className="text-sm text-muted-foreground">
                ¿Qué tan profundas quieres que sean las conversaciones?
              </p>
            </div>
            <LevelSelector 
              selected={level} 
              onChange={setLevel} 
            />
          </div>
          
          {/* Summary */}
          {canSave && hasChanges() && (
            <div className="p-4 bg-muted/50 rounded-xl border border-border/50">
              <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                Resumen de cambios
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground w-20">Intereses:</span>
                  <div className="flex flex-wrap gap-1">
                    {categories.map((cat) => {
                      const Icon = categoryIcons[cat]
                      return (
                        <Badge key={cat} variant="secondary" className="text-xs">
                          <Icon className="w-3 h-3 mr-1" />
                          {categoryLabels[cat]}
                        </Badge>
                      )
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground w-20">Enfoque:</span>
                  <Badge variant="outline" className="text-xs">
                    {focus && focusLabels[focus]}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground w-20">Nivel:</span>
                  <Badge variant="outline" className="text-xs">
                    {level && levelLabels[level]}
                  </Badge>
                </div>
              </div>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!canSave || isLoading || !hasChanges()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar cambios'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
