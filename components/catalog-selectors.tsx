'use client'

// API-driven selectors for onboarding / profile.
//
// Unlike the original profile-selectors.tsx (which hardcoded the cultural enums),
// these render whatever the backend returns from /interests and /focus-types,
// plus the frontend-owned depth-level options. This keeps the UI aligned with
// the real catalog instead of a static list.

import { cn } from '@/lib/utils'
import { Check, Film, BookOpen, Theater, Tag } from 'lucide-react'
import type { CatalogItem } from '@/lib/api'
import { DEPTH_LEVELS } from '@/lib/view-models'

// Best-effort icon per known category name (interests come from the API).
function iconForInterest(name: string) {
  const n = name.toLowerCase()
  if (n.includes('cine') || n.includes('pel')) return Film
  if (n.includes('teatro')) return Theater
  if (n.includes('lect') || n.includes('libro')) return BookOpen
  return Tag
}

interface InterestSelectorProps {
  items: CatalogItem[]
  selected: number[]
  onChange: (ids: number[]) => void
}

export function InterestSelector({ items, selected, onChange }: InterestSelectorProps) {
  const toggle = (id: number) => {
    if (selected.includes(id)) onChange(selected.filter((c) => c !== id))
    else onChange([...selected, id])
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {items.map((item) => {
        const Icon = iconForInterest(item.name)
        const isSelected = selected.includes(item.id)
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => toggle(item.id)}
            className={cn(
              'relative flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-200',
              'hover:border-primary/50 hover:bg-primary/5',
              isSelected ? 'border-primary bg-primary/5' : 'border-border bg-card',
            )}
          >
            {isSelected && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-3 h-3 text-primary-foreground" />
              </div>
            )}
            <div
              className={cn(
                'w-14 h-14 rounded-xl flex items-center justify-center transition-colors',
                isSelected ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground',
              )}
            >
              <Icon className="w-7 h-7" />
            </div>
            <p className={cn('font-medium text-center', isSelected ? 'text-primary' : 'text-foreground')}>
              {item.name}
            </p>
          </button>
        )
      })}
    </div>
  )
}

interface FocusSelectorProps {
  items: CatalogItem[]
  selected: number[]
  onChange: (ids: number[]) => void
}

// The backend accepts one or more focus types per profile (focus_ids[]),
// so we allow multi-select here.
export function FocusTypeSelector({ items, selected, onChange }: FocusSelectorProps) {
  const toggle = (id: number) => {
    if (selected.includes(id)) onChange(selected.filter((c) => c !== id))
    else onChange([...selected, id])
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {items.map((item) => {
        const isSelected = selected.includes(item.id)
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => toggle(item.id)}
            className={cn(
              'relative flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200',
              'hover:border-primary/50 hover:bg-primary/5',
              isSelected ? 'border-primary bg-primary/5' : 'border-border bg-card',
            )}
          >
            <div
              className={cn(
                'w-5 h-5 rounded-md border-2 shrink-0 mt-0.5 flex items-center justify-center transition-colors',
                isSelected ? 'border-primary bg-primary' : 'border-muted-foreground',
              )}
            >
              {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
            </div>
            <p className={cn('font-medium text-sm', isSelected ? 'text-primary' : 'text-foreground')}>
              {item.name}
            </p>
          </button>
        )
      })}
    </div>
  )
}

interface DepthLevelSelectorProps {
  selected: string | null
  onChange: (value: string) => void
}

export function DepthLevelSelector({ selected, onChange }: DepthLevelSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {DEPTH_LEVELS.map((level, index) => {
        const isSelected = selected === level.value
        return (
          <button
            key={level.value}
            type="button"
            onClick={() => onChange(level.value)}
            className={cn(
              'relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200',
              'hover:border-primary/50 hover:bg-primary/5',
              isSelected ? 'border-primary bg-primary/5' : 'border-border bg-card',
            )}
          >
            <div className="flex gap-1">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-2 h-2 rounded-full transition-colors',
                    i <= index ? (isSelected ? 'bg-primary' : 'bg-muted-foreground/50') : 'bg-border',
                  )}
                />
              ))}
            </div>
            <p className={cn('font-medium text-sm text-center', isSelected ? 'text-primary' : 'text-foreground')}>
              {level.label}
            </p>
            <p className="text-[10px] text-muted-foreground text-center leading-tight hidden sm:block">
              {level.description}
            </p>
          </button>
        )
      })}
    </div>
  )
}
