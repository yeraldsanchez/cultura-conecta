'use client'

// Edit profile page.
//
// When the user has no cultural profile yet we initialize it with POST /users
// (createProfile). When a profile already exists we perform real partial
// updates: PATCH /users/:id for name + depth level, and the add/remove
// interest & focus-type endpoints to reconcile the selected sets against what
// the profile currently has. The form is driven by the live catalog
// (interests + focus types) instead of hardcoded enums.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth-context'
import {
  InterestSelector,
  FocusTypeSelector,
  DepthLevelSelector,
} from '@/components/catalog-selectors'
import {
  getInterests,
  getFocusTypes,
  createProfile,
  patchProfile,
  addInterest,
  removeInterest,
  addFocusType,
  removeFocusType,
  ApiError,
} from '@/lib/api'
import { AlertCircle, Loader2, ArrowLeft, Info } from 'lucide-react'

export default function EditarPerfilPage() {
  const router = useRouter()
  const { user, setProfile } = useAuth()
  const profile = user?.profile ?? null

  const { data: interests, isLoading: loadingInterests } = useSWR(['interests'], getInterests)
  const { data: focusTypes, isLoading: loadingFocus } = useSWR(['focus-types'], getFocusTypes)

  const [name, setName] = useState(profile?.name ?? user?.name ?? '')
  const [selectedInterests, setSelectedInterests] = useState<number[]>(
    profile?.interests.map((i) => i.id) ?? [],
  )
  const [selectedFocus, setSelectedFocus] = useState<number[]>(
    profile?.focus_types.map((f) => f.id) ?? [],
  )
  const [level, setLevel] = useState<string | null>(profile?.depth_level ?? null)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const canSave =
    name.trim().length > 0 &&
    selectedInterests.length > 0 &&
    selectedFocus.length > 0 &&
    level !== null

  const handleSubmit = async () => {
    if (!user) return
    if (!canSave) {
      setError('Por favor completa todos los campos requeridos.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      let updated

      if (!profile) {
        // No cultural profile yet: initialize it in one call.
        updated = await createProfile({
          user_id: user.userId,
          name: name.trim(),
          depth_level: level!,
          focus_ids: selectedFocus,
          interests_ids: selectedInterests,
        })
      } else {
        // Existing profile: reconcile against the backend with real partial
        // updates. Start with name + depth level via PATCH.
        const nameChanged = name.trim() !== profile.name
        const levelChanged = level !== profile.depth_level
        if (nameChanged || levelChanged) {
          updated = await patchProfile(user.userId, {
            ...(nameChanged ? { name: name.trim() } : {}),
            ...(levelChanged ? { depth_level: level! } : {}),
          })
        }

        // Reconcile interests: add the newly selected, remove the deselected.
        const currentInterests = profile.interests.map((i) => i.id)
        for (const id of selectedInterests.filter((id) => !currentInterests.includes(id))) {
          updated = await addInterest(user.userId, id)
        }
        for (const id of currentInterests.filter((id) => !selectedInterests.includes(id))) {
          updated = await removeInterest(user.userId, id)
        }

        // Reconcile focus types the same way.
        const currentFocus = profile.focus_types.map((f) => f.id)
        for (const id of selectedFocus.filter((id) => !currentFocus.includes(id))) {
          updated = await addFocusType(user.userId, id)
        }
        for (const id of currentFocus.filter((id) => !selectedFocus.includes(id))) {
          updated = await removeFocusType(user.userId, id)
        }

        // If nothing changed, fall back to the freshest server copy.
        if (!updated) {
          updated = await patchProfile(user.userId, { name: name.trim() })
        }
      }

      setProfile(updated)
      toast.success('Perfil guardado correctamente', {
        description: 'Tus preferencias han sido actualizadas.',
      })
      router.push('/perfil')
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'No pudimos guardar tu perfil. Intenta nuevamente.',
      )
      setIsLoading(false)
    }
  }

  if (!user) return null

  const catalogLoading = loadingInterests || loadingFocus

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Button
        variant="ghost"
        size="sm"
        className="mb-6 -ml-2 text-muted-foreground"
        onClick={() => router.back()}
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Volver
      </Button>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="font-serif text-2xl">Perfil cultural</CardTitle>
          <CardDescription>
            Configura tus intereses para recibir mejores sugerencias de grupos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              {profile
                ? 'Los cambios se guardan directamente en tu perfil cultural.'
                : 'Aún no tienes un perfil cultural; al guardar lo crearemos con estas preferencias.'}
            </AlertDescription>
          </Alert>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre para mostrar</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="¿Cómo quieres que te vean?"
              maxLength={80}
            />
          </div>

          {catalogLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <>
              {/* Interests */}
              <div className="space-y-4 pt-2 border-t border-border/50">
                <div>
                  <h3 className="font-medium text-foreground mb-1">Intereses</h3>
                  <p className="text-sm text-muted-foreground">Selecciona al menos uno.</p>
                </div>
                <InterestSelector
                  items={interests ?? []}
                  selected={selectedInterests}
                  onChange={setSelectedInterests}
                />
              </div>

              {/* Focus types */}
              <div className="space-y-4 pt-6 border-t border-border/50">
                <div>
                  <h3 className="font-medium text-foreground mb-1">Tipos de enfoque</h3>
                  <p className="text-sm text-muted-foreground">
                    Define cómo prefieres analizar las obras.
                  </p>
                </div>
                <FocusTypeSelector
                  items={focusTypes ?? []}
                  selected={selectedFocus}
                  onChange={setSelectedFocus}
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
                <DepthLevelSelector selected={level} onChange={setLevel} />
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => router.back()} disabled={isLoading}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={!canSave || isLoading || catalogLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar perfil'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
