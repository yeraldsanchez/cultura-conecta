'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, MapPin, Video, Users, CheckCircle2 } from 'lucide-react'
import type { GroupEvent } from '@/lib/types'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface EventCardProps {
  event: GroupEvent
  onView?: () => void
  onToggleAttendance?: () => void
  variant?: 'default' | 'compact'
}

export function EventCard({ event, onView, onToggleAttendance, variant = 'default' }: EventCardProps) {
  const isPast = new Date(event.date) < new Date()
  const isVirtual = event.modality === 'virtual'
  
  if (variant === 'compact') {
    return (
      <Card className={cn(
        "hover:shadow-sm transition-all duration-300 border-border/50",
        isPast && "opacity-60"
      )}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={cn(
              'p-2 rounded-lg shrink-0',
              isVirtual ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'
            )}>
              {isVirtual ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-foreground truncate">{event.title}</h4>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(new Date(event.date), "d MMM, HH:mm", { locale: es })}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={isVirtual ? 'secondary' : 'outline'} className="text-[10px] px-1.5 py-0">
                  {isVirtual ? 'Virtual' : 'Presencial'}
                </Badge>
                {event.isAttending && (
                  <span className="text-[10px] text-primary flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    Asistirás
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card className={cn(
      "hover:shadow-md transition-all duration-300 border-border/50 hover:border-primary/30",
      isPast && "opacity-60"
    )}>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className={cn(
            'p-3 rounded-xl shrink-0',
            isVirtual ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'
          )}>
            {isVirtual ? <Video className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-serif text-lg font-semibold text-foreground">{event.title}</h3>
              <Badge variant={isVirtual ? 'secondary' : 'outline'} className="shrink-0">
                {isVirtual ? 'Virtual' : 'Presencial'}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{event.description}</p>
            
            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {format(new Date(event.date), "EEEE d 'de' MMMM", { locale: es })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {format(new Date(event.date), "HH:mm", { locale: es })} hrs
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                {event.attendeesCount} asistentes
              </span>
            </div>
            
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border/50">
              {!isPast && (
                <Button
                  variant={event.isAttending ? 'outline' : 'default'}
                  size="sm"
                  onClick={onToggleAttendance}
                  className={event.isAttending ? 'border-primary text-primary' : ''}
                >
                  {event.isAttending ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-1.5" />
                      Asistencia confirmada
                    </>
                  ) : (
                    'Confirmar asistencia'
                  )}
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onView}>
                Ver detalle
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
