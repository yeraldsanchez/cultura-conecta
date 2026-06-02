'use client'

import { cn } from '@/lib/utils'
import { FileQuestion, Search, Users, Calendar, MessageSquare, UserCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  type: 'no-groups' | 'no-results' | 'no-members' | 'no-events' | 'no-posts' | 'incomplete-profile'
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  className?: string
}

const emptyStateConfig = {
  'no-groups': {
    icon: Users,
    defaultTitle: 'Todavía no perteneces a ningún grupo',
    defaultDescription: 'Explora grupos compatibles con tus intereses o crea el tuyo propio.',
  },
  'no-results': {
    icon: Search,
    defaultTitle: 'No encontramos resultados',
    defaultDescription: 'Intenta ajustar los filtros o buscar con otros términos.',
  },
  'no-members': {
    icon: Users,
    defaultTitle: 'Aún no hay miembros',
    defaultDescription: 'Sé el primero en unirte a este grupo.',
  },
  'no-events': {
    icon: Calendar,
    defaultTitle: 'No hay eventos próximos',
    defaultDescription: 'Los eventos que se creen en el grupo aparecerán aquí.',
  },
  'no-posts': {
    icon: MessageSquare,
    defaultTitle: 'El foro está vacío',
    defaultDescription: 'Sé el primero en iniciar una conversación.',
  },
  'incomplete-profile': {
    icon: UserCircle,
    defaultTitle: 'Perfil incompleto',
    defaultDescription: 'Completa tu perfil cultural para recibir mejores sugerencias.',
  },
}

export function EmptyState({ 
  type, 
  title, 
  description, 
  action, 
  secondaryAction,
  className 
}: EmptyStateProps) {
  const config = emptyStateConfig[type]
  const Icon = config.icon
  
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-12 px-4 text-center',
      className
    )}>
      <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
        {title || config.defaultTitle}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {description || config.defaultDescription}
      </p>
      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {action && (
            <Button onClick={action.onClick}>
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
