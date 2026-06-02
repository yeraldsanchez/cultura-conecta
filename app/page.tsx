'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Film, BookOpen, Theater, Users, MessageSquare, Calendar, Shield, ChevronRight, Sparkles } from 'lucide-react'

export default function LandingPage() {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-serif font-bold text-lg">C</span>
              </div>
              <span className="font-serif font-semibold text-xl text-foreground">
                CulturaConecta
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                  Iniciar sesión
                </Button>
              </Link>
              <Link href="/registro">
                <Button>
                  Crear cuenta
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center">
            <Badge variant="secondary" className="mb-6 px-4 py-1.5">
              <Sparkles className="w-3.5 h-3.5 mr-2" />
              Comunidad cultural inteligente
            </Badge>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
              Encuentra personas que
              <br />
              <span className="text-primary">analizan las obras como tú</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty">
              CulturaConecta te conecta con personas afines no solo por categoría cultural, 
              sino también por tu enfoque de análisis y nivel de profundidad. 
              Conversaciones que realmente disfrutas.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
              <Link href="/registro">
                <Button size="lg" className="text-base px-8 h-12">
                  Crear cuenta gratis
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-base px-8 h-12">
                  Ya tengo cuenta
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Visual element */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
            <div className="relative rounded-2xl border border-border/50 bg-card p-8 shadow-xl overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Sample group cards */}
                <div className="bg-background rounded-xl p-5 border border-border/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Film className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Cinéfilos de Villeneuve</p>
                      <p className="text-xs text-muted-foreground">Dune: Parte Dos</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="text-[10px]">Análisis técnico</Badge>
                    <Badge variant="outline" className="text-[10px]">Analítico</Badge>
                  </div>
                </div>
                <div className="bg-background rounded-xl p-5 border border-border/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Club García Márquez</p>
                      <p className="text-xs text-muted-foreground">Cien Años de Soledad</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="text-[10px]">Temática</Badge>
                    <Badge variant="outline" className="text-[10px]">Intermedio</Badge>
                  </div>
                </div>
                <div className="bg-background rounded-xl p-5 border border-border/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-accent/20 text-accent-foreground">
                      <Theater className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Teatro CDMX</p>
                      <p className="text-xs text-muted-foreground">Hamlet Contemporáneo</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="text-[10px]">Actuación</Badge>
                    <Badge variant="outline" className="text-[10px]">Intermedio</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
              Cómo funciona
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Tres pasos para encontrar tu comunidad cultural ideal
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Crea tu perfil cultural',
                description: 'Define tus intereses, tipo de enfoque y nivel de profundidad para que te conectemos con personas afines.'
              },
              {
                step: '02',
                title: 'Encuentra grupos compatibles',
                description: 'Recibe sugerencias personalizadas o explora grupos que coincidan con tu estilo de análisis.'
              },
              {
                step: '03',
                title: 'Conversa y participa',
                description: 'Disfruta discusiones alineadas con tu enfoque, controla spoilers y asiste a eventos culturales.'
              }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="text-6xl font-serif font-bold text-primary/10 absolute -top-4 left-0">
                  {item.step}
                </div>
                <div className="pt-12">
                  <h3 className="font-serif text-xl font-semibold text-foreground mb-3">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
              Explora por categoría
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Encuentra comunidades dedicadas a tus pasiones culturales
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { 
                id: 'cine',
                icon: Film, 
                title: 'Cine', 
                description: 'Películas, series, documentales. Desde blockbusters hasta cine de autor.',
                examples: ['Dune', 'Oppenheimer', 'Barbie', 'Poor Things']
              },
              { 
                id: 'teatro',
                icon: Theater, 
                title: 'Teatro', 
                description: 'Obras, musicales, performances. Lo mejor de la escena local e internacional.',
                examples: ['Hamilton', 'Hamlet', 'Wicked', 'El Rey León']
              },
              { 
                id: 'lectura',
                icon: BookOpen, 
                title: 'Lectura', 
                description: 'Novelas, ensayos, poesía. Clubes de lectura con personas compatibles.',
                examples: ['1984', 'Cien Años de Soledad', 'El Alquimista']
              },
            ].map((category) => {
              const Icon = category.icon
              const isHovered = hoveredCategory === category.id
              
              return (
                <div
                  key={category.id}
                  className="group relative bg-card rounded-2xl p-8 border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredCategory(category.id)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-serif text-2xl font-semibold text-foreground mb-3">
                    {category.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {category.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {category.examples.slice(0, isHovered ? 4 : 2).map((example) => (
                      <Badge key={example} variant="secondary" className="text-xs">
                        {example}
                      </Badge>
                    ))}
                    {!isHovered && category.examples.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{category.examples.length - 2} más
                      </Badge>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
              ¿Por qué CulturaConecta?
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Diseñado para quienes buscan conversaciones culturales significativas
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Users,
                title: 'Grupos más afines',
                description: 'Conecta con personas que comparten tu enfoque de análisis y nivel de profundidad.'
              },
              {
                icon: MessageSquare,
                title: 'Conversaciones alineadas',
                description: 'Discusiones que se ajustan a cómo te gusta analizar las obras culturales.'
              },
              {
                icon: Calendar,
                title: 'Eventos culturales',
                description: 'Participa en encuentros virtuales o presenciales con tu comunidad.'
              },
              {
                icon: Shield,
                title: 'Control de spoilers',
                description: 'Marca tu progreso y evita spoilers. Disfruta a tu ritmo.'
              },
            ].map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <div key={index} className="bg-card rounded-xl p-6 border border-border/50">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-medium text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
            ¿Listo para encontrar tu comunidad?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            Únete a miles de personas que ya disfrutan conversaciones culturales significativas.
          </p>
          <div className="mt-10">
            <Link href="/registro">
              <Button size="lg" className="text-base px-8 h-12">
                Comenzar ahora — es gratis
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-serif font-bold">C</span>
              </div>
              <span className="font-serif font-semibold text-lg text-foreground">
                CulturaConecta
              </span>
            </div>
            <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Acerca de</a>
              <a href="#" className="hover:text-foreground transition-colors">Términos</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacidad</a>
              <a href="#" className="hover:text-foreground transition-colors">Contacto</a>
            </nav>
          </div>
          <div className="mt-8 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
            © 2024 CulturaConecta. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}
