'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Loader2, AlertCircle, ChevronLeft, ChevronRight, Check, Film, BookOpen, Theater } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CategorySelector, FocusSelector, LevelSelector } from '@/components/profile-selectors'
import type { CulturalCategory, AnalysisFocus, DepthLevel } from '@/lib/types'
import { categoryLabels, focusLabels, levelLabels } from '@/lib/types'

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Form state
  const [categories, setCategories] = useState<CulturalCategory[]>([])
  const [focus, setFocus] = useState<AnalysisFocus | null>(null)
  const [level, setLevel] = useState<DepthLevel | null>(null)
  
  const totalSteps = 3
  
  const canProceed = () => {
    if (currentStep === 1) return categories.length > 0
    if (currentStep === 2) return focus !== null
    if (currentStep === 3) return level !== null
    return false
  }
  
  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }
  
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }
  
  const handleSubmit = async () => {
    if (!canProceed()) {
      setError('Por favor completa todos los campos requeridos')
      return
    }
    
    setIsLoading(true)
    setError('')
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    router.push('/dashboard')
  }
  
  const categoryIcons = {
    cine: Film,
    teatro: Theater,
    lectura: BookOpen,
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-serif font-bold text-xl">C</span>
          </div>
          <span className="font-serif font-semibold text-2xl text-foreground">
            CulturaConecta
          </span>
        </div>
        
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                step < currentStep 
                  ? 'bg-primary text-primary-foreground' 
                  : step === currentStep 
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
              )}>
                {step < currentStep ? <Check className="w-4 h-4" /> : step}
              </div>
              {step < 3 && (
                <div className={cn(
                  'w-12 h-0.5 mx-2 transition-colors',
                  step < currentStep ? 'bg-primary' : 'bg-border'
                )} />
              )}
            </div>
          ))}
        </div>
        
        <Card className="border-border/50 shadow-xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="font-serif text-2xl sm:text-3xl">
              Configura tu perfil cultural
            </CardTitle>
            <CardDescription className="text-base mt-2">
              {currentStep === 1 && 'Selecciona las categorías culturales que te interesan'}
              {currentStep === 2 && '¿Cómo prefieres analizar las obras culturales?'}
              {currentStep === 3 && '¿Qué nivel de profundidad buscas en las conversaciones?'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {/* Step 1: Categories */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <p className="text-sm text-muted-foreground text-center">
                  Selecciona al menos una categoría para recibir sugerencias personalizadas
                </p>
                <CategorySelector 
                  selected={categories} 
                  onChange={setCategories} 
                />
                {categories.length === 0 && (
                  <p className="text-sm text-destructive text-center">
                    Selecciona al menos una categoría para continuar
                  </p>
                )}
              </div>
            )}
            
            {/* Step 2: Focus */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <p className="text-sm text-muted-foreground text-center">
                  Esto nos ayuda a conectarte con personas que comparten tu estilo de análisis
                </p>
                <FocusSelector 
                  selected={focus} 
                  onChange={setFocus} 
                />
                {focus === null && (
                  <p className="text-sm text-destructive text-center">
                    Selecciona un enfoque para continuar
                  </p>
                )}
              </div>
            )}
            
            {/* Step 3: Level */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <p className="text-sm text-muted-foreground text-center">
                  Define qué tan profundas quieres que sean las conversaciones
                </p>
                <LevelSelector 
                  selected={level} 
                  onChange={setLevel} 
                />
                {level === null && (
                  <p className="text-sm text-destructive text-center">
                    Selecciona un nivel para continuar
                  </p>
                )}
                
                {/* Summary */}
                {level && (
                  <div className="mt-8 p-4 bg-muted/50 rounded-xl border border-border/50">
                    <p className="text-sm font-medium text-foreground mb-3">Resumen de tu perfil</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-20">Intereses:</span>
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
                        <span className="text-xs text-muted-foreground w-20">Enfoque:</span>
                        <Badge variant="outline" className="text-xs">
                          {focus && focusLabels[focus]}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-20">Nivel:</span>
                        <Badge variant="outline" className="text-xs">
                          {level && levelLabels[level]}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/50">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentStep === 1 || isLoading}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Volver
              </Button>
              
              {currentStep < totalSteps ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed() || isLoading}
                >
                  Continuar
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceed() || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      Guardar y continuar
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Skip hint */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Esta información es necesaria para personalizar tu experiencia. 
          Podrás modificarla después desde tu perfil.
        </p>
      </div>
    </div>
  )
}
