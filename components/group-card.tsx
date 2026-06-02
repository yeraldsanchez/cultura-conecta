'use client'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Film, BookOpen, Theater, Users, ArrowRight } from 'lucide-react'
import type { Group, CulturalCategory } from '@/lib/types'
import { categoryLabels, focusLabels, levelLabels } from '@/lib/types'

const categoryIcons: Record<CulturalCategory, typeof Film> = {
  cine: Film,
  teatro: Theater,
  lectura: BookOpen,
}

const categoryColors: Record<CulturalCategory, string> = {
  cine: 'bg-primary/10 text-primary',
  teatro: 'bg-secondary/10 text-secondary',
  lectura: 'bg-accent/20 text-accent-foreground',
}

interface GroupCardProps {
  group: Group
  onView?: () => void
  onJoin?: () => void
  isMember?: boolean
  variant?: 'default' | 'compact' | 'featured'
}

export function GroupCard({ group, onView, onJoin, isMember, variant = 'default' }: GroupCardProps) {
  const Icon = categoryIcons[group.category]
  
  if (variant === 'compact') {
    return (
      <Card className="group hover:shadow-md transition-all duration-300 border-border/50 hover:border-primary/30 cursor-pointer" onClick={onView}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={cn('p-2 rounded-lg shrink-0', categoryColors[group.category])}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-foreground truncate">{group.name}</h4>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{group.work.title}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {levelLabels[group.level]}
                </Badge>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {group.memberCount}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  if (variant === 'featured') {
    return (
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30">
        <div className="relative h-32 bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20">
          <div className={cn('absolute top-4 left-4 p-2.5 rounded-xl', categoryColors[group.category])}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        <CardContent className="p-5">
          <h3 className="font-serif text-xl font-semibold text-foreground leading-tight">{group.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">{group.work.title}</p>
          <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{group.description}</p>
          
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="secondary" className="text-xs">
              {categoryLabels[group.category]}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {focusLabels[group.focus]}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {levelLabels[group.level]}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-border/50">
            <span className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              {group.memberCount} miembros
            </span>
            {isMember ? (
              <Button variant="outline" size="sm" onClick={onView}>
                Ver grupo
              </Button>
            ) : (
              <Button size="sm" onClick={onJoin}>
                Unirme
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card className="group hover:shadow-md transition-all duration-300 border-border/50 hover:border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className={cn('p-2.5 rounded-xl', categoryColors[group.category])}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-serif text-lg font-semibold text-foreground leading-tight">{group.name}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">{group.work.title}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2">{group.description}</p>
        
        <div className="flex flex-wrap gap-2 mt-4">
          <Badge variant="secondary" className="text-xs">
            {categoryLabels[group.category]}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {focusLabels[group.focus]}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {levelLabels[group.level]}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
          <span className="text-sm text-muted-foreground flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            {group.memberCount} miembros
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-primary hover:text-primary/90 hover:bg-primary/10"
            onClick={onView}
          >
            Ver detalle
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
