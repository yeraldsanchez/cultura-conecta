'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Home, 
  Search, 
  Plus, 
  Users, 
  User, 
  LogOut, 
  Menu, 
  Bell,
  Settings,
  ChevronDown
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

interface HeaderProps {
  user?: {
    name?: string
    email: string
  } | null
  onLogout?: () => void
}

const navItems = [
  { href: '/dashboard', label: 'Inicio', icon: Home },
  { href: '/explorar', label: 'Explorar', icon: Search },
  { href: '/crear-grupo', label: 'Crear grupo', icon: Plus },
  { href: '/mis-grupos', label: 'Mis grupos', icon: Users },
]

export function Header({ user, onLogout }: HeaderProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const userInitials = user?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || user?.email[0].toUpperCase() || 'U'

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-serif font-bold text-lg">C</span>
            </div>
            <span className="font-serif font-semibold text-xl text-foreground hidden sm:block">
              CulturaConecta
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                      isActive && 'text-foreground bg-muted/50'
                    )}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </nav>
          
          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
            </Button>
            
            {/* User menu (desktop) */}
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-2">
                    <Avatar className="w-8 h-8 bg-primary/10">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-foreground hidden lg:block">
                      {user?.name || user?.email}
                    </span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium text-foreground">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/perfil" className="cursor-pointer">
                      <User className="w-4 h-4 mr-2" />
                      Mi perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/perfil/editar" className="cursor-pointer">
                      <Settings className="w-4 h-4 mr-2" />
                      Editar perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive cursor-pointer"
                    onClick={onLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {/* Mobile menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col h-full">
                  {/* User info */}
                  <div className="flex items-center gap-3 pb-6 border-b border-border">
                    <Avatar className="w-12 h-12 bg-primary/10">
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{user?.name || 'Usuario'}</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  
                  {/* Navigation */}
                  <nav className="flex-1 py-6 space-y-1">
                    {navItems.map((item) => {
                      const Icon = item.icon
                      const isActive = pathname === item.href
                      return (
                        <Link 
                          key={item.href} 
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Button
                            variant="ghost"
                            className={cn(
                              'w-full justify-start text-muted-foreground hover:text-foreground',
                              isActive && 'text-foreground bg-muted/50'
                            )}
                          >
                            <Icon className="w-5 h-5 mr-3" />
                            {item.label}
                          </Button>
                        </Link>
                      )
                    })}
                    <div className="pt-4 border-t border-border mt-4">
                      <Link href="/perfil" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
                          <User className="w-5 h-5 mr-3" />
                          Mi perfil
                        </Button>
                      </Link>
                      <Link href="/perfil/editar" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
                          <Settings className="w-5 h-5 mr-3" />
                          Editar perfil
                        </Button>
                      </Link>
                    </div>
                  </nav>
                  
                  {/* Logout */}
                  <div className="pt-4 border-t border-border">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        setMobileMenuOpen(false)
                        onLogout?.()
                      }}
                    >
                      <LogOut className="w-5 h-5 mr-3" />
                      Cerrar sesión
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
