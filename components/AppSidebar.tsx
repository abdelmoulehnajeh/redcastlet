"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  Clock,
  Calendar,
  DollarSign,
  FileText,
  ChefHat,
  Users,
  MapPin,
  CheckSquare,
  UserCheck,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"

const employeeMenuItems = [
  {
    title: "Tableau de Bord",
    url: "/dashboard",
    icon: LayoutDashboard,
    description: "Vue d'ensemble",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "Pointeuse",
    url: "/dashboard/pointeuse",
    icon: Clock,
    description: "Gestion du temps",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    title: "Journal",
    url: "/dashboard/journal",
    icon: Calendar,
    description: "Planning et historique",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    title: "Finance",
    url: "/dashboard/finance",
    icon: DollarSign,
    description: "Salaire et infractions",
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    title: "Contrats",
    url: "/dashboard/contrats",
    icon: FileText,
    description: "Détails contractuels",
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    title: "Demande Congé",
    url: "/dashboard/leave-request",
    icon: FileText,
    description: "Demandes de congé",
    gradient: "from-green-500 to-emerald-500",
  },
]

const adminMenuItems = [
  {
    title: "Tableau de Bord",
    url: "/dashboard/admin",
    icon: LayoutDashboard,
    description: "Vue d'ensemble admin",
    gradient: "from-red-500 to-orange-500",
  },
  {
    title: "Employés",
    url: "/dashboard/admin/employees",
    icon: Users,
    description: "Gestion employés",
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    title: "Restaurants",
    url: "/dashboard/admin/locations",
    icon: MapPin,
    description: "Gestion des lieux",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    title: "Journal",
    url: "/dashboard/admin/journal",
    icon: Calendar,
    description: "Gestion des plannings",
    gradient: "from-emerald-500 to-cyan-500",
  },
  {
    title: "Finance",
    url: "/dashboard/admin/finance",
    icon: DollarSign,
    description: "Gestion financière",
    gradient: "from-yellow-500 to-amber-500",
  },
  {
    title: "Approbations",
    url: "/dashboard/admin/approvals",
    icon: CheckSquare,
    description: "Approbations Manager",
    gradient: "from-green-500 to-teal-500",
  },
]

const managerMenuItems = [
  {
    title: "Tableau de Bord",
    url: "/dashboard/manager",
    icon: LayoutDashboard,
    description: "Vue d'ensemble",
    gradient: "from-blue-500 to-purple-500",
  },
  {
    title: "Pointeuse",
    url: "/dashboard/manager/pointeuse",
    icon: Clock,
    description: "Gestion tenues et temps",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    title: "Journal",
    url: "/dashboard/manager/journal",
    icon: Calendar,
    description: "Planning employés",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    title: "Finance",
    url: "/dashboard/manager/finance",
    icon: DollarSign,
    description: "Salaires et finances",
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    title: "Contrats",
    url: "/dashboard/manager/contrats",
    icon: FileText,
    description: "Gestion contrats",
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    title: "Demandes Congé",
    url: "/dashboard/manager/leave-requests",
    icon: UserCheck,
    description: "Gestion demandes congé",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    title: "Employés",
    url: "/dashboard/manager/employees",
    icon: Users,
    description: "Gestion équipe",
    gradient: "from-cyan-500 to-blue-500",
  },
]

interface AppSidebarProps {
  onNavigate?: () => void
}

export function AppSidebar({ onNavigate }: AppSidebarProps) {
  const { state } = useSidebar()
  const pathname = usePathname()
  const { user } = useAuth()
  const collapsed = state === "collapsed"

  const isActive = (path: string) => pathname === path

  const menuItems =
    user?.role === "admin" ? adminMenuItems : user?.role === "manager" ? managerMenuItems : employeeMenuItems

  const handleNavigation = () => {
    if (onNavigate) {
      onNavigate()
    }
  }

  return (
    <Sidebar className="border-none bg-transparent">
      <div className="relative h-full w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden z-30">
        {/* Dynamic animated background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(120,119,198,0.12),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,119,198,0.08),transparent_50%)]"></div>
          {/* Floating particles */}
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        <SidebarHeader className="relative z-10 p-3 backdrop-blur-xl bg-white/5 border-b border-white/10">
          <div className="group relative transform-gpu perspective-1000">
            <div 
              className="relative bg-gradient-to-r from-red-600/90 via-red-500/90 to-orange-600/90 backdrop-blur-xl border border-red-400/30 rounded-xl p-3 text-white transform hover:rotateX-2 hover:rotateY-1 transition-all duration-500"
              style={{
                transform: 'perspective(1000px) rotateX(3deg)',
                boxShadow: '0 15px 30px -8px rgba(239, 68, 68, 0.4), 0 0 0 1px rgba(248, 113, 113, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            >
              {/* Glowing orb effect */}
              <div className="absolute -top-8 -right-8 w-16 h-16 bg-gradient-to-br from-yellow-400/20 to-red-400/20 rounded-full blur-2xl animate-pulse"></div>
              
              <Link href="/dashboard" onClick={handleNavigation} className="flex items-center cursor-pointer relative z-10">
                <div className="w-12 h-12 bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-2xl border border-white/30 transform group-hover:scale-110 transition-all duration-300 flex-shrink-0 relative overflow-hidden"
                     style={{
                       boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.2)',
                       transform: 'perspective(1000px) rotateX(15deg) rotateY(-5deg)'
                     }}>
                  {/* 3D depth layer */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-black/10 rounded-xl"></div>
                  {/* Icon glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-red-400/20 rounded-xl blur-lg opacity-50"></div>
                  <ChefHat className="w-7 h-7 text-white relative z-10 drop-shadow-lg" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
                </div>
                {!collapsed && (
                  <div className="ml-3 min-w-0 flex-1">
                    <h1 className="text-base font-bold bg-gradient-to-r from-white via-yellow-100 to-white bg-clip-text text-transparent truncate">
                      Red Castle
                    </h1>
                    <p className="text-red-100/80 text-xs truncate">
                      Espace {user?.role === "admin" ? "Admin" : user?.role === "manager" ? "Manager" : "Employé"}
                    </p>
                  </div>
                )}
              </Link>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="relative z-10 p-2 backdrop-blur-sm">
          <SidebarGroup>
            <SidebarGroupLabel className="px-2 py-1 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
              {!collapsed && (
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Navigation
                </span>
              )}
            </SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu className="space-y-3">
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <div className="group relative transform-gpu perspective-1000">
                      <SidebarMenuButton
                        asChild
                        className={`
                          h-auto p-0 rounded-xl transition-all duration-500 group relative overflow-hidden
                          ${isActive(item.url) ? 'transform hover:scale-105' : 'hover:scale-[1.02]'}
                        `}
                      >
                        <Link href={item.url} onClick={handleNavigation} className="block w-full">
                          <div
                            className={`
                              relative p-4 rounded-xl text-white transform transition-all duration-500 w-full
                              ${isActive(item.url) 
                                ? `bg-gradient-to-br ${item.gradient} shadow-2xl` 
                                : 'bg-slate-800/50 hover:bg-slate-700/60 backdrop-blur-xl border border-slate-600/40 hover:border-slate-500/60'
                              }
                            `}
                            style={isActive(item.url) ? {
                              transform: 'perspective(1000px) rotateX(8deg) rotateY(-2deg)',
                              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.25)'
                            } : {
                              boxShadow: '0 12px 25px -6px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.08)'
                            }}
                          >
                            {/* Animated glow effect for active items */}
                            {isActive(item.url) && (
                              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            )}
                            
                            {/* Shine effect */}
                            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            </div>

                            <div className="relative z-10 flex items-center">
                              <div className={`
                                flex-shrink-0 transition-all duration-300 transform
                                ${collapsed ? "mx-auto" : "mr-3"}
                                ${isActive(item.url) ? "scale-110" : "group-hover:scale-105"}
                              `}>
                                <div className={`
                                  w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 relative overflow-hidden transform-gpu
                                  ${isActive(item.url) 
                                    ? 'bg-gradient-to-br from-white/30 to-white/15 backdrop-blur-sm border border-white/40 shadow-2xl' 
                                    : 'bg-gradient-to-br from-slate-700/60 to-slate-800/60 group-hover:from-slate-600/70 group-hover:to-slate-700/70 border border-slate-600/60 shadow-xl'
                                  }
                                `}
                                style={isActive(item.url) ? {
                                  boxShadow: '0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.2)',
                                  transform: 'perspective(1000px) rotateX(20deg) rotateY(-8deg) scale(1.05)'
                                } : {
                                  boxShadow: '0 8px 25px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.15)',
                                  transform: 'perspective(1000px) rotateX(12deg) rotateY(-4deg)'
                                }}
                                >
                                  {/* 3D depth layers */}
                                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-black/10 rounded-xl"></div>
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10 rounded-xl"></div>
                                  
                                  {/* Dynamic glow effect */}
                                  {isActive(item.url) && (
                                    <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} rounded-xl blur-lg opacity-30 animate-pulse`}></div>
                                  )}
                                  
                                  {/* Icon with enhanced 3D effect */}
                                  <item.icon 
                                    className={`w-6 h-6 relative z-10 transition-all duration-300 ${
                                      isActive(item.url) ? 'text-white' : 'text-gray-200 group-hover:text-white'
                                    }`}
                                    style={{ 
                                      filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.6)) drop-shadow(0 1px 2px rgba(0,0,0,0.8))',
                                      textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                                    }} 
                                  />
                                </div>
                              </div>
                              
                              {!collapsed && (
                                <div className="flex-1 min-w-0 text-left">
                                  <div className={`
                                    text-lg font-black truncate mb-1 transition-all duration-300 tracking-wide
                                    ${isActive(item.url) 
                                      ? 'text-white drop-shadow-lg' 
                                      : 'text-gray-100 group-hover:text-white drop-shadow-md'
                                    }
                                  `}
                                  style={{ 
                                    textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.5)',
                                    fontWeight: '900',
                                    letterSpacing: '0.5px'
                                  }}>
                                    {item.title}
                                  </div>
                                  <div className={`
                                    text-sm font-bold truncate transition-all duration-300 tracking-wide
                                    ${isActive(item.url) 
                                      ? 'text-white/90 drop-shadow-md' 
                                      : 'text-gray-300 group-hover:text-gray-200 drop-shadow-sm'
                                    }
                                  `}
                                  style={{ 
                                    textShadow: '1px 1px 3px rgba(0,0,0,0.7)',
                                    fontWeight: '700',
                                    letterSpacing: '0.3px'
                                  }}>
                                    {item.description}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </Link>
                      </SidebarMenuButton>
                    </div>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            33% { transform: translateY(-5px) rotate(1deg); }
            66% { transform: translateY(3px) rotate(-1deg); }
          }
          .animate-float {
            animation: float 4s ease-in-out infinite;
          }
        `}</style>
      </div>
    </Sidebar>
  )
}