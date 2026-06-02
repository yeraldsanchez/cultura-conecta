'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { AlertTriangle, ChevronDown, MessageCircle } from 'lucide-react'
import type { ForumPost } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface PostCardProps {
  post: ForumPost
  onView?: () => void
}

export function PostCard({ post, onView }: PostCardProps) {
  const [spoilerRevealed, setSpoilerRevealed] = useState(false)
  
  const authorInitials = post.author.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || post.author.email[0].toUpperCase()
  
  return (
    <Card className="hover:shadow-sm transition-all duration-300 border-border/50">
      <CardContent className="p-5">
        {/* Author info */}
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="w-10 h-10 bg-primary/10">
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
              {authorInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-foreground">{post.author.name || post.author.email}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: es })}
            </p>
          </div>
          {post.hasSpoiler && (
            <Badge variant="destructive" className="shrink-0 bg-destructive/10 text-destructive border-destructive/20">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Spoiler
            </Badge>
          )}
        </div>
        
        {/* Content */}
        {post.hasSpoiler && !spoilerRevealed ? (
          <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-sm text-foreground">Esta publicación contiene spoilers</p>
                {post.spoilerProgress && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Progreso requerido: <span className="font-medium">{post.spoilerProgress}</span>
                  </p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => setSpoilerRevealed(true)}
                >
                  <ChevronDown className="w-4 h-4 mr-1.5" />
                  Ver spoiler
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className={cn(
            "text-sm text-foreground leading-relaxed",
            post.hasSpoiler && "bg-muted/30 rounded-lg p-4 border border-destructive/20"
          )}>
            {post.hasSpoiler && spoilerRevealed && (
              <Badge variant="destructive" className="mb-2 bg-destructive/10 text-destructive text-xs">
                ⚠️ Contenido con spoilers
              </Badge>
            )}
            <p>{post.content}</p>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/50">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={onView}
          >
            <MessageCircle className="w-4 h-4 mr-1.5" />
            {post.commentsCount} {post.commentsCount === 1 ? 'comentario' : 'comentarios'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
