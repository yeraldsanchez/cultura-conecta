'use client'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Film, ArrowRight, Layers, Crown, Shield, User } from 'lucide-react'
import type { GroupVM } from '@/lib/view-models'
import { depthLevelLabel, roleLabel } from '@/lib/view-models'

interface GroupCardProps {
  group: GroupVM
  onView?: () => void
  isOwner?: boolean
  // When known (e.g. from GET /users/:id/groups), renders a role-aware
  // membership badge ("Administrador" / "Moderador" / "Miembro") instead of
  // the generic "Creado por ti" pill.
  role?: string | null
  variant?: 'default' | 'compact' | 'featured'
}

const ROLE_ICONS: Record<string, typeof Crown> = {
  admin: Crown,
  moderator: Shield,
  member: User,
}

function MembershipBadge({ isOwner, role }: { isOwner?: boolean; role?: string | null }) {
  if (!isOwner && !role) return null
  const effectiveRole = role ?? 'admin'
  const Icon = ROLE_ICONS[effectiveRole] ?? User
  const label = isOwner ? 'Creado por ti' : roleLabel(role)
  return (
    <Badge variant="secondary" className="text-[10px] shrink-0 gap-1">
      <Icon className="w-3 h-3" />
      {label}
    </Badge>
  )
}

export function GroupCard({ group, onView, isOwner, role, variant = 'default' }: GroupCardProps) {
  const focusTypes = group.focusTypes ?? []

  if (variant === 'compact') {
    return (
      <Card
        className="group hover:shadow-md transition-all duration-300 border-border/50 hover:border-primary/30 cursor-pointer"
        onClick={onView}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg shrink-0 bg-primary/10 text-primary">
              <Film className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-foreground truncate">{group.name}</h4>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{group.workTitle}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {depthLevelLabel(group.depthLevel)}
                </Badge>
                {focusTypes[0] && (
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    {focusTypes[0].name}
                  </span>
                )}
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
          <div className="absolute top-4 left-4 p-2.5 rounded-xl bg-primary/10 text-primary">
            <Film className="w-5 h-5" />
          </div>
        </div>
        <CardContent className="p-5">
          <h3 className="font-serif text-xl font-semibold text-foreground leading-tight">{group.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">{group.workTitle}</p>
          {group.description && (
            <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{group.description}</p>
          )}

          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="secondary" className="text-xs">
              {depthLevelLabel(group.depthLevel)}
            </Badge>
            {focusTypes.map((f) => (
              <Badge key={f.id} variant="outline" className="text-xs">
                {f.name}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-end mt-5 pt-4 border-t border-border/50">
            <Button variant="outline" size="sm" onClick={onView}>
              Ver grupo
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="group hover:shadow-md transition-all duration-300 border-border/50 hover:border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <Film className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-lg font-semibold text-foreground leading-tight">{group.name}</h3>
              <MembershipBadge isOwner={isOwner} role={role} />
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{group.workTitle}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {group.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{group.description}</p>
        )}

        <div className="flex flex-wrap gap-2 mt-4">
          <Badge variant="secondary" className="text-xs">
            {depthLevelLabel(group.depthLevel)}
          </Badge>
          {focusTypes.map((f) => (
            <Badge key={f.id} variant="outline" className="text-xs">
              {f.name}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-end mt-4 pt-4 border-t border-border/50">
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
