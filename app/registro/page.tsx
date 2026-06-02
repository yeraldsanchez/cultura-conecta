'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, Loader2, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function RegistroPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  // Password validation rules
  const passwordRules = [
    { label: 'Mínimo 8 caracteres', check: (p: string) => p.length >= 8 },
    { label: 'Al menos una mayúscula', check: (p: string) => /[A-Z]/.test(p) },
    { label: 'Al menos un número', check: (p: string) => /[0-9]/.test(p) },
  ]

  const validateEmail = (value: string) => {
    if (!value) return 'El correo electrónico es requerido'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Ingresa un correo electrónico válido'
    return ''
  }

  const validatePassword = (value: string) => {
    if (!value) return 'La contraseña es requerida'
    if (value.length < 8) return 'La contraseña debe tener al menos 8 caracteres'
    if (!/[A-Z]/.test(value)) return 'La contraseña debe tener al menos una mayúscula'
    if (!/[0-9]/.test(value)) return 'La contraseña debe tener al menos un número'
    return ''
  }

  const validateConfirmPassword = (value: string) => {
    if (!value) return 'Confirma tu contraseña'
    if (value !== password) return 'Las contraseñas no coinciden'
    return ''
  }

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    
    let error = ''
    if (field === 'email') error = validateEmail(email)
    if (field === 'password') error = validatePassword(password)
    if (field === 'confirmPassword') error = validateConfirmPassword(confirmPassword)
    
    setErrors(prev => ({ ...prev, [field]: error }))
  }

  const isFormValid = () => {
    return (
      !validateEmail(email) &&
      !validatePassword(password) &&
      !validateConfirmPassword(confirmPassword)
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate all fields
    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)
    const confirmError = validateConfirmPassword(confirmPassword)
    
    setErrors({
      email: emailError,
      password: passwordError,
      confirmPassword: confirmError,
    })
    setTouched({ email: true, password: true, confirmPassword: true })
    
    if (emailError || passwordError || confirmError) return
    
    setIsLoading(true)
    
    // Simulate registration
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    router.push('/onboarding')
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-serif font-bold text-lg">C</span>
            </div>
            <span className="font-serif font-semibold text-xl text-foreground">
              CulturaConecta
            </span>
          </Link>
          
          <Card className="border-border/50 shadow-lg">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="font-serif text-2xl">Crear cuenta</CardTitle>
              <CardDescription>
                Únete a la comunidad cultural más afín a ti
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => handleBlur('email')}
                    className={cn(
                      touched.email && errors.email && 'border-destructive focus-visible:ring-destructive'
                    )}
                    disabled={isLoading}
                  />
                  {touched.email && errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>
                
                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => handleBlur('password')}
                      className={cn(
                        'pr-10',
                        touched.password && errors.password && 'border-destructive focus-visible:ring-destructive'
                      )}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  {/* Password rules */}
                  {password && (
                    <div className="space-y-1.5 pt-2">
                      {passwordRules.map((rule, index) => {
                        const passed = rule.check(password)
                        return (
                          <div key={index} className="flex items-center gap-2 text-xs">
                            {passed ? (
                              <Check className="w-3.5 h-3.5 text-green-600" />
                            ) : (
                              <X className="w-3.5 h-3.5 text-muted-foreground" />
                            )}
                            <span className={passed ? 'text-green-600' : 'text-muted-foreground'}>
                              {rule.label}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
                
                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onBlur={() => handleBlur('confirmPassword')}
                      className={cn(
                        'pr-10',
                        touched.confirmPassword && errors.confirmPassword && 'border-destructive focus-visible:ring-destructive'
                      )}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {touched.confirmPassword && errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                  )}
                  {confirmPassword && confirmPassword === password && (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Las contraseñas coinciden
                    </p>
                  )}
                </div>
                
                {/* Submit */}
                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={isLoading || !isFormValid()}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creando cuenta...
                    </>
                  ) : (
                    'Crear cuenta'
                  )}
                </Button>
              </form>
              
              <div className="mt-6 text-center text-sm text-muted-foreground">
                ¿Ya tienes cuenta?{' '}
                <Link href="/login" className="text-primary font-medium hover:underline">
                  Inicia sesión
                </Link>
              </div>
            </CardContent>
          </Card>
          
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Al crear tu cuenta, aceptas nuestros{' '}
            <a href="#" className="underline hover:text-foreground">Términos de servicio</a>
            {' '}y{' '}
            <a href="#" className="underline hover:text-foreground">Política de privacidad</a>
          </p>
        </div>
      </div>
      
      {/* Right side - Visual */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-muted/30 p-12">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-8">
            <span className="font-serif text-4xl text-primary">✦</span>
          </div>
          <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
            Tu comunidad cultural te espera
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Conecta con personas que comparten tu pasión por el cine, teatro y lectura. 
            Conversaciones profundas con quienes analizan las obras como tú.
          </p>
        </div>
      </div>
    </div>
  )
}
