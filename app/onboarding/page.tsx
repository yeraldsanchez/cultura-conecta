'use client'

// Onboarding / initial profile configuration.
//
// Aligned to the real backend contract POST /users:
//   { user_id, name, depth_level, focus_ids[], interests_ids[] }
// The catalog options come from GET /interests (categories) and GET /focus-types.
//
// A "name" step was ADDED because the backend requires `name` (migration 000004
// + CreateProfileRequest binding:"required"). Without it the request would fail.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, AlertCircle, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { InterestSelector, FocusTypeSelector, DepthLevelSelector } from '@/components/catalog-selectors'
import { useAuth } from '@/lib/auth-context'
import { ApiError, createProfile, getFocusTypes, getInterests } from '@/lib/api'
import { depthLevelLabel } from '@/lib/view-models'

export default function OnboardingPage() {
  const router = useRouter()
  const { user, isInitializing, setProfile } = useAuth()

  const { data: interests, isLoading: loadingInterests, error: interestsError } = useSWR('interests', getInterests)
  const { data: focusTypes, isLoading: loadingFocus, error: focusError } = useSWR('focus-types', getFocusTypes)

  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Form state mapped 1:1 to the backend payload.
  const [name, setName] = useState('')
  const [interestIds, setInterestIds] = useState<number[]>([])
  const [focusIds, setFocusIds] = useState<number[]>([])
  const [depthLevel, setDepthLevel] = useState<string | null>(null)

  const totalSteps = 4
  const catalogLoading = loadingInterests || loadingFocus
  const catalogError = interestsError || focusError

  const canProceed = () => {
    if (currentStep === 1) return name.trim().length >= 2
    if (currentStep === 2) return interestIds.length > 0
    if (currentStep === 3) return focusIds.length > 0
    if (currentStep === 4) return depthLevel !== null
    return false
  }

  const handleNext = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1)
  }
  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async () => {
    if (!user) {
      setError('Tu sesión expiró. Vuelve a iniciar sesión.')
      return
    }
    if (!canProceed() || depthLevel === null) {
      setError('Por favor completa todos los campos requeridos')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const profile = await createProfile({
        user_id: user.userId,
        name: name.trim(),
        depth_level: depthLevel,
        focus_ids: focusIds,
        interests_ids: interestIds,
      })
      setProfile(profile)
      router.push('/dashboard')
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'No se pudo guardar tu perfil. Intenta nuevamente.',
      )
      setIsLoading(false)
    }
  }

  // Guard: must be authenticated to create a profile.
  if (!isInitializing && !user) {
    router.replace('/login')
    return null
  }

  const selectedInterestNames = (interests ?? []).filter((i) => interestIds.includes(i.id)).map((i) => i.name)
  const selectedFocusNames = (focusTypes ?? []).filter((f) => focusIds.includes(f.id)).map((f) => f.name)

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-serif font-bold text-xl">C</span>
          </div>
          <span className="font-serif font-semibold text-2xl text-foreground">CulturaConecta</span>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                  step <= currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                )}
              >
                {step < currentStep ? <Check className="w-4 h-4" /> : step}
              </div>
              {step < 4 && (
                <div className={cn('w-10 h-0.5 mx-2 transition-colors', step < currentStep ? 'bg-primary' : 'bg-border')} />
              )}
            </div>
          ))}
        </div>

        <Card className="border-border/50 shadow-xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="font-serif text-2xl sm:text-3xl">Configura tu perfil cultural</CardTitle>
            <CardDescription className="text-base mt-2">
              {currentStep === 1 && '¿Cómo te llamas?'}
              {currentStep === 2 && 'Selecciona las categorías culturales que te interesan'}
              {currentStep === 3 && '¿Cómo prefieres analizar las obras culturales?'}
              {currentStep === 4 && '¿Qué nivel de profundidad buscas en las conversaciones?'}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {catalogError && currentStep >= 2 && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No se pudieron cargar las opciones desde el servidor. Verifica que la API esté disponible.
                </AlertDescription>
              </Alert>
            )}

            {/* Step 1: Name */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Este nombre será visible para otras personas de la comunidad.
                </p>
                <div className="space-y-2 max-w-sm mx-auto">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    placeholder="Ej: Ana Martínez"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                  />
                  {name.length > 0 && name.trim().length < 2 && (
                    <p className="text-sm text-destructive">Ingresa al menos 2 caracteres.</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Interests (categories) */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <p className="text-sm text-muted-foreground text-center">
                  Selecciona al menos una categoría para personalizar tu experiencia
                </p>
                {catalogLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}
                  </div>
                ) : (
                  <InterestSelector items={interests ?? []} selected={interestIds} onChange={setInterestIds} />
                )}
              </div>
            )}

            {/* Step 3: Focus types */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <p className="text-sm text-muted-foreground text-center">
                  Puedes elegir uno o varios enfoques de análisis
                </p>
                {catalogLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16" />)}
                  </div>
                ) : (
                  <FocusTypeSelector items={focusTypes ?? []} selected={focusIds} onChange={setFocusIds} />
                )}
              </div>
            )}

            {/* Step 4: Depth level + summary */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <p className="text-sm text-muted-foreground text-center">
                  Define qué tan profundas quieres que sean las conversaciones
                </p>
                <DepthLevelSelector selected={depthLevel} onChange={setDepthLevel} />

                {depthLevel && (
                  <div className="mt-8 p-4 bg-muted/50 rounded-xl border border-border/50">
                    <p className="text-sm font-medium text-foreground mb-3">Resumen de tu perfil</p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-xs text-muted-foreground w-20 shrink-0 pt-0.5">Nombre:</span>
                        <span className="text-sm text-foreground">{name}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-xs text-muted-foreground w-20 shrink-0 pt-0.5">Intereses:</span>
                        <div className="flex flex-wrap gap-1">
                          {selectedInterestNames.map((n) => (
                            <Badge key={n} variant="secondary" className="text-xs">{n}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-xs text-muted-foreground w-20 shrink-0 pt-0.5">Enfoques:</span>
                        <div className="flex flex-wrap gap-1">
                          {selectedFocusNames.map((n) => (
                            <Badge key={n} variant="outline" className="text-xs">{n}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-20 shrink-0">Nivel:</span>
                        <Badge variant="outline" className="text-xs">{depthLevelLabel(depthLevel)}</Badge>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/50">
              <Button variant="ghost" onClick={handleBack} disabled={currentStep === 1 || isLoading}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Volver
              </Button>

              {currentStep < totalSteps ? (
                <Button onClick={handleNext} disabled={!canProceed() || isLoading}>
                  Continuar
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={!canProceed() || isLoading}>
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

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Esta información es necesaria para crear tu perfil cultural en CulturaConecta.
        </p>
      </div>
    </div>
  )
}
