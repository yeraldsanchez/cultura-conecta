'use client'

import { cn } from '@/lib/utils'
import { Check, Film, BookOpen, Theater } from 'lucide-react'
import type { CulturalCategory, AnalysisFocus, DepthLevel } from '@/lib/types'
import { focusLabels, levelLabels, focusDescriptions, levelDescriptions } from '@/lib/types'

const categoryIcons = {
  cine: Film,
  teatro: Theater,
  lectura: BookOpen,
}

const categoryInfo = {
  cine: { label: 'Cine', description: 'Películas, series, documentales' },
  teatro: { label: 'Teatro', description: 'Obras, musicales, performances' },
  lectura: { label: 'Lectura', description: 'Novelas, ensayos, poesía' },
}

interface CategorySelectorProps {
  selected: CulturalCategory[]
  onChange: (categories: CulturalCategory[]) => void
}

export function CategorySelector({ selected, onChange }: CategorySelectorProps) {
  const categories: CulturalCategory[] = ['cine', 'teatro', 'lectura']
  
  const toggleCategory = (category: CulturalCategory) => {
    if (selected.includes(category)) {
      onChange(selected.filter(c => c !== category))
    } else {
      onChange([...selected, category])
    }
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {categories.map((category) => {
        const Icon = categoryIcons[category]
        const info = categoryInfo[category]
        const isSelected = selected.includes(category)
        
        return (
          <button
            key={category}
            type="button"
            onClick={() => toggleCategory(category)}
            className={cn(
              'relative flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-200',
              'hover:border-primary/50 hover:bg-primary/5',
              isSelected 
                ? 'border-primary bg-primary/5' 
                : 'border-border bg-card'
            )}
          >
            {isSelected && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-3 h-3 text-primary-foreground" />
              </div>
            )}
            <div className={cn(
              'w-14 h-14 rounded-xl flex items-center justify-center transition-colors',
              isSelected ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
            )}>
              <Icon className="w-7 h-7" />
            </div>
            <div className="text-center">
              <p className={cn(
                'font-medium',
                isSelected ? 'text-primary' : 'text-foreground'
              )}>
                {info.label}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{info.description}</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}

interface FocusSelectorProps {
  selected: AnalysisFocus | null
  onChange: (focus: AnalysisFocus) => void
}

export function FocusSelector({ selected, onChange }: FocusSelectorProps) {
  const focuses: AnalysisFocus[] = [
    'trama-reflexion',
    'analisis-tecnico',
    'actuacion-interpretacion',
    'tematica-simbolismo',
    'ritmo-lectura',
    'conversacion-casual',
  ]
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {focuses.map((focus) => {
        const isSelected = selected === focus
        
        return (
          <button
            key={focus}
            type="button"
            onClick={() => onChange(focus)}
            className={cn(
              'relative flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200',
              'hover:border-primary/50 hover:bg-primary/5',
              isSelected 
                ? 'border-primary bg-primary/5' 
                : 'border-border bg-card'
            )}
          >
            <div className={cn(
              'w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center transition-colors',
              isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'
            )}>
              {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
            </div>
            <div>
              <p className={cn(
                'font-medium text-sm',
                isSelected ? 'text-primary' : 'text-foreground'
              )}>
                {focusLabels[focus]}
              </p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {focusDescriptions[focus]}
              </p>
            </div>
          </button>
        )
      })}
    </div>
  )
}

interface LevelSelectorProps {
  selected: DepthLevel | null
  onChange: (level: DepthLevel) => void
}

export function LevelSelector({ selected, onChange }: LevelSelectorProps) {
  const levels: DepthLevel[] = ['casual', 'intermedio', 'analitico', 'tecnico']
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {levels.map((level, index) => {
        const isSelected = selected === level
        
        return (
          <button
            key={level}
            type="button"
            onClick={() => onChange(level)}
            className={cn(
              'relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200',
              'hover:border-primary/50 hover:bg-primary/5',
              isSelected 
                ? 'border-primary bg-primary/5' 
                : 'border-border bg-card'
            )}
          >
            {/* Level indicator */}
            <div className="flex gap-1">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-2 h-2 rounded-full transition-colors',
                    i <= index
                      ? isSelected ? 'bg-primary' : 'bg-muted-foreground/50'
                      : 'bg-border'
                  )}
                />
              ))}
            </div>
            <p className={cn(
              'font-medium text-sm text-center',
              isSelected ? 'text-primary' : 'text-foreground'
            )}>
              {levelLabels[level]}
            </p>
            <p className="text-[10px] text-muted-foreground text-center leading-tight hidden sm:block">
              {levelDescriptions[level]}
            </p>
          </button>
        )
      })}
    </div>
  )
}
