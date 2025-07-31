"use client"

import type React from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Menu, User, Settings, Bell, ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect, useMemo } from "react"
import { useSidebar } from "@/components/ui/sidebar"

interface AnimatedParticle {
  id: number
  left: string
  top: string
  delay: string
  duration: string
}

function DashboardHeader() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { toggleSidebar, isMobile } = useSidebar()
  const [mounted, setMounted] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  
  // Apollo
  const { data: approvalsData } = typeof window !== "undefined" && user?.role === "admin"
    ? require("@apollo/client").useQuery(require("@/lib/graphql-queries").GET_ADMIN_APPROVALS, { variables: { status: "pending" } })
    : { data: null }
  const pendingApprovals = approvalsData?.adminApprovals || []

  // Generate stable particles for header
  const headerParticles = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      left: `${25 + (i * 12.5)}%`,
      top: `${20 + (i % 3) * 25}%`,
      delay: `${i * 0.3}s`,
      duration: `${2 + (i % 3)}s`
    }))
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-300 border border-red-400/30 backdrop-blur-sm"
      case "manager":
        return "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border border-blue-400/30 backdrop-blur-sm"
      case "employee":
        return "bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border border-green-400/30 backdrop-blur-sm"
      default:
        return "bg-gradient-to-r from-gray-500/20 to-slate-500/20 text-gray-300 border border-gray-400/30 backdrop-blur-sm"
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "🔥 Administrateur"
      case "manager":
        return "⚡ Manager"
      case "employee":
        return "✨ Employé"
      default:
        return "Utilisateur"
    }
  }

  const handleNotificationClick = (id: string) => {
    router.push("/dashboard/admin/approvals")
    setShowNotifications(false)
  }

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-slate-900/95 via-purple-900/95 to-slate-900/95 backdrop-blur-xl border-b border-white/10">
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 bg-gradient-to-r from-slate-700 to-slate-600 rounded-xl animate-pulse" />
            <div className="h-6 w-32 bg-gradient-to-r from-slate-700 to-slate-600 rounded-xl animate-pulse" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-gradient-to-r from-slate-700 to-slate-600 rounded-full animate-pulse" />
            <div className="h-8 w-20 bg-gradient-to-r from-slate-700 to-slate-600 rounded-xl animate-pulse" />
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-slate-900/95 via-purple-900/95 to-slate-900/95 backdrop-blur-xl border-b border-white/10 shadow-2xl">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(120,119,198,0.1),transparent_50%)]"></div>
        {/* Floating particles with stable positions */}
        {mounted && headerParticles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-0.5 h-0.5 bg-white/30 rounded-full animate-pulse"
            style={{
              left: particle.left,
              top: particle.top,
              animationDelay: particle.delay,
              animationDuration: particle.duration
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex h-16 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="md:hidden bg-slate-800/50 hover:bg-slate-700/60 backdrop-blur-xl border border-slate-600/40 text-white hover:text-white transition-all duration-300"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          )}
          <div className="hidden md:block">
            <SidebarTrigger className="bg-slate-800/50 hover:bg-slate-700/60 backdrop-blur-xl border border-slate-600/40 text-white hover:text-white transition-all duration-300 rounded-xl" />
          </div>
          <div className="group relative flex-1">
            <div className="bg-gradient-to-r from-slate-800/60 via-purple-800/60 to-slate-800/60 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-xl shadow-2xl max-w-full lg:max-w-md xl:max-w-lg 2xl:max-w-xl">
              <h1 className="text-lg font-bold bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent leading-tight">
                {user?.role === "admin" ? "Administration" : user?.role === "manager" ? "Management" : "Espace Employé"}
              </h1>
              <p className="text-xs text-slate-300 hidden sm:block">Tableau de bord Red Castle</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Notifications Button for admin */}
          {user?.role === "admin" && (
            <div className="relative group">
              <Button
                variant="ghost"
                size="icon"
                className="bg-slate-800/50 hover:bg-slate-700/60 backdrop-blur-xl border border-slate-600/40 text-white hover:text-white transition-all duration-300 rounded-xl relative"
                onClick={() => setShowNotifications((v) => !v)}
              >
                <Bell className="h-4 w-4" />
                {pendingApprovals.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-red-500 to-orange-500 rounded-full text-[10px] text-white flex items-center justify-center animate-pulse font-bold shadow-lg">
                    {pendingApprovals.length}
                  </span>
                )}
                <span className="sr-only">Notifications</span>
              </Button>
              
              {/* Enhanced Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 z-50 transform-gpu perspective-1000">
                  <div 
                    className="relative bg-gradient-to-br from-slate-900/95 via-purple-900/95 to-slate-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden"
                    style={{
                      transform: 'perspective(1000px) rotateX(5deg)',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    {/* Animated background */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(120,119,198,0.12),transparent_50%)]"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,119,198,0.08),transparent_50%)]"></div>
                    
                    <div className="relative z-10 p-4">
                      <h3 className="text-base font-bold mb-3 bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">
                        🔔 Approbations en attente
                      </h3>
                      {pendingApprovals.length === 0 ? (
                        <div className="text-sm text-slate-400 py-4 text-center bg-slate-800/30 rounded-xl backdrop-blur-sm border border-slate-600/30">
                          ✨ Aucune notification
                        </div>
                      ) : (
                        <ul className="space-y-2 max-h-64 overflow-y-auto">
                          {pendingApprovals.map((approval: any) => (
                            <li key={approval.id}>
                              <button
                                className="w-full text-left p-3 bg-slate-800/40 hover:bg-slate-700/50 backdrop-blur-xl border border-slate-600/30 hover:border-slate-500/50 rounded-xl transition-all duration-300 group transform hover:scale-[1.02]"
                                onClick={() => handleNotificationClick(approval.id)}
                              >
                                <span className="font-semibold text-white group-hover:text-cyan-200 transition-colors">
                                  {approval.type === "schedule_change" ? "📅 Changement de planning" : approval.type}
                                </span>
                                <span className="block text-xs text-slate-400 mt-1">
                                  Reçu le {new Date(approval.created_at).toLocaleString("fr-FR")}
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Enhanced User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="bg-gradient-to-r from-slate-800/60 via-purple-800/60 to-slate-800/60 hover:from-slate-700/70 hover:via-purple-700/70 hover:to-slate-700/70 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300 rounded-xl flex items-center gap-3 px-4 py-2 h-auto"
              >
                <Avatar className="h-8 w-8 border-2 border-white/30 shadow-lg">
                  <AvatarFallback className="bg-gradient-to-br from-red-500 to-orange-500 text-white text-sm font-bold shadow-inner">
                    {user?.username?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm font-bold text-white drop-shadow-sm">{user?.username}</span>
                  <Badge className={`text-xs font-semibold ${getRoleColor(user?.role || "")} shadow-sm`}>
                    {getRoleLabel(user?.role || "")}
                  </Badge>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-300 transition-transform group-hover:rotate-180 duration-300" />
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent 
              align="end" 
              className="w-64 bg-gradient-to-br from-slate-900/95 via-purple-900/95 to-slate-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden p-0"
              style={{
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
              }}
            >
              {/* Animated background for dropdown */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(120,119,198,0.12),transparent_50%)]"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,119,198,0.08),transparent_50%)]"></div>
              
              <div className="relative z-10">
                <DropdownMenuLabel className="font-normal p-4 bg-gradient-to-r from-slate-800/50 to-purple-800/50 border-b border-white/10">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-white/30 shadow-lg">
                        <AvatarFallback className="bg-gradient-to-br from-red-500 to-orange-500 text-white font-bold shadow-inner">
                          {user?.username?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-bold text-white drop-shadow-sm">{user?.username}</p>
                        <Badge className={`text-xs font-semibold ${getRoleColor(user?.role || "")} shadow-sm`}>
                          {getRoleLabel(user?.role || "")}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </DropdownMenuLabel>
                
                <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-white/20 to-transparent h-px" />
                
                <div className="p-2">
                  <DropdownMenuItem className="bg-slate-800/40 hover:bg-slate-700/50 backdrop-blur-xl border border-slate-600/30 hover:border-slate-500/50 rounded-xl mb-2 p-3 text-white hover:text-cyan-200 transition-all duration-300 cursor-pointer group">
                    <User className="mr-3 h-4 w-4 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold">Profil</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem className="bg-slate-800/40 hover:bg-slate-700/50 backdrop-blur-xl border border-slate-600/30 hover:border-slate-500/50 rounded-xl mb-2 p-3 text-white hover:text-cyan-200 transition-all duration-300 cursor-pointer group">
                    <Settings className="mr-3 h-4 w-4 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold">Paramètres</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-white/10 to-transparent h-px my-2" />
                  
                  <DropdownMenuItem 
                    onClick={handleLogout} 
                    className="bg-red-900/40 hover:bg-red-800/50 backdrop-blur-xl border border-red-600/40 hover:border-red-500/60 rounded-xl p-3 text-red-300 hover:text-red-200 transition-all duration-300 cursor-pointer group"
                  >
                    <LogOut className="mr-3 h-4 w-4 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold">Déconnexion</span>
                  </DropdownMenuItem>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  // Generate stable particles for main background
  const backgroundParticles = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: `${(i * 5.26) % 100}%`,
      top: `${(i * 7.89) % 100}%`,
      delay: `${(i * 0.25) % 5}s`,
      duration: `${3 + (i % 4)}s`
    }))
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSidebarNavigate = () => {
    // Close mobile sidebar after navigation
  }

  if (!mounted) {
    return (
      <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Sidebar Skeleton */}
        <div className="hidden md:block w-64 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-slate-700 to-slate-600 rounded-xl animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-24 bg-gradient-to-r from-slate-700 to-slate-600 rounded animate-pulse" />
                <div className="h-3 w-16 bg-gradient-to-r from-slate-700 to-slate-600 rounded animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-2xl animate-pulse backdrop-blur-sm" />
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="sticky top-0 z-50 w-full bg-gradient-to-r from-slate-900/95 via-purple-900/95 to-slate-900/95 backdrop-blur-xl border-b border-white/10">
            <div className="flex h-16 items-center justify-between px-4 lg:px-6">
              <div className="h-6 w-32 bg-gradient-to-r from-slate-700 to-slate-600 rounded-xl animate-pulse" />
              <div className="h-8 w-20 bg-gradient-to-r from-slate-700 to-slate-600 rounded-xl animate-pulse" />
            </div>
          </div>
          <main className="flex-1 p-4 lg:p-6 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <div className="mx-auto max-w-7xl space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-slate-800/40 backdrop-blur-xl rounded-3xl shadow-sm animate-pulse border border-slate-600/50" />
              ))}
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Dynamic animated background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.08),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(120,219,255,0.08),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,119,198,0.08),transparent_50%)]"></div>
          {/* Floating particles with stable positions */}
          {mounted && backgroundParticles.map((particle) => (
            <div
              key={particle.id}
              className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
              style={{
                left: particle.left,
                top: particle.top,
                animationDelay: particle.delay,
                animationDuration: particle.duration
              }}
            />
          ))}
        </div>

        <AppSidebar onNavigate={handleSidebarNavigate} />
        <div className="flex-1 flex flex-col min-w-0 relative z-10">
          <DashboardHeader />
          <main className="flex-1 p-4 lg:p-6 overflow-auto">
            <div className="mx-auto max-w-7xl">
              <div className="animate-in fade-in duration-500">{children}</div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  // Generate stable skeleton particles
  const skeletonParticles = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: `${(i * 5.26) % 100}%`,
      top: `${(i * 7.89) % 100}%`,
      delay: `${(i * 0.25) % 5}s`,
      duration: `${3 + (i % 4)}s`
    }))
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isLoading && !user && mounted) {
      router.push("/login")
    }
  }, [user, isLoading, router, mounted])

  // Show loading until mounted and auth is resolved
  if (!mounted || isLoading) {
    return (
      <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Dynamic animated background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.08),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(120,219,255,0.08),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,119,198,0.08),transparent_50%)]"></div>
          {/* Floating particles with stable positions */}
          {skeletonParticles.map((particle) => (
            <div
              key={particle.id}
              className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
              style={{
                left: particle.left,
                top: particle.top,
                animationDelay: particle.delay,
                animationDuration: particle.duration
              }}
            />
          ))}
        </div>

        <div className="hidden md:block w-64 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative z-10">
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-slate-700 to-slate-600 rounded-xl animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-24 bg-gradient-to-r from-slate-700 to-slate-600 rounded animate-pulse" />
                <div className="h-3 w-16 bg-gradient-to-r from-slate-700 to-slate-600 rounded animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-2xl animate-pulse backdrop-blur-sm" />
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col min-w-0 relative z-10">
          <div className="sticky top-0 z-50 w-full bg-gradient-to-r from-slate-900/95 via-purple-900/95 to-slate-900/95 backdrop-blur-xl border-b border-white/10">
            <div className="flex h-16 items-center justify-between px-4 lg:px-6">
              <div className="h-6 w-32 bg-gradient-to-r from-slate-700 to-slate-600 rounded-xl animate-pulse" />
              <div className="h-8 w-20 bg-gradient-to-r from-slate-700 to-slate-600 rounded-xl animate-pulse" />
            </div>
          </div>
          <main className="flex-1 p-4 lg:p-6">
            <div className="mx-auto max-w-7xl space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-slate-800/40 backdrop-blur-xl rounded-3xl shadow-sm animate-pulse border border-slate-600/50" />
              ))}
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <DashboardContent>{children}</DashboardContent>
}