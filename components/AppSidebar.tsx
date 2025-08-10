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
import { LayoutDashboard, Clock, Calendar, DollarSign, FileText, Users, MapPin, CheckSquare, UserCheck, TypeIcon as type, LucideIcon } from 'lucide-react'
import { useAuth } from "@/lib/auth-context"
import { useEffect, useMemo, useState } from "react"

// Lightweight client-side lang hook.
// Reads localStorage.lang, sets <html lang> and keeps dir="ltr".
type Lang = "fr" | "ar"
function useLang(defaultLang: Lang = "fr"): Lang {
  const [lang, setLang] = useState<Lang>(defaultLang)

  useEffect(() => {
    try {
      const stored = (typeof window !== "undefined" ? localStorage.getItem("lang") : null) as Lang | null
      const resolved: Lang = stored === "ar" ? "ar" : "fr"
      setLang(resolved)
      if (typeof document !== "undefined") {
        document.documentElement.lang = resolved
        document.documentElement.dir = "ltr"
      }
    } catch {
      // no-op
    }
  }, [])

  return lang
}

type MenuItem = {
  title: string
  description: string
  url: string
  icon: LucideIcon
  gradient: string
}

const employeeMenuItemsFr: MenuItem[] = [
  { title: "Tableau de Bord", url: "/dashboard", icon: LayoutDashboard, description: "Vue d'ensemble", gradient: "from-blue-500 to-cyan-500" },
  { title: "Pointeuse", url: "/dashboard/pointeuse", icon: Clock, description: "Gestion du temps", gradient: "from-emerald-500 to-teal-500" },
  { title: "Journal", url: "/dashboard/journal", icon: Calendar, description: "Planning et historique", gradient: "from-purple-500 to-pink-500" },
  { title: "Finance", url: "/dashboard/finance", icon: DollarSign, description: "Salaire et infractions", gradient: "from-yellow-500 to-orange-500" },
  { title: "Contrats", url: "/dashboard/contrats", icon: FileText, description: "Détails contractuels", gradient: "from-indigo-500 to-purple-500" },
  { title: "Demande Congé", url: "/dashboard/leave-request", icon: FileText, description: "Demandes de congé", gradient: "from-green-500 to-emerald-500" },
]
const adminMenuItemsFr: MenuItem[] = [
  { title: "Tableau de Bord", url: "/dashboard/admin", icon: LayoutDashboard, description: "Vue d'ensemble admin", gradient: "from-red-500 to-orange-500" },
  { title: "Employés", url: "/dashboard/admin/employees", icon: Users, description: "Gestion employés", gradient: "from-blue-500 to-indigo-500" },
  { title: "Restaurants", url: "/dashboard/admin/locations", icon: MapPin, description: "Gestion des lieux", gradient: "from-purple-500 to-pink-500" },
  { title: "Journal", url: "/dashboard/admin/journal", icon: Calendar, description: "Gestion des plannings", gradient: "from-emerald-500 to-cyan-500" },
  { title: "Finance", url: "/dashboard/admin/finance", icon: DollarSign, description: "Gestion financière", gradient: "from-yellow-500 to-amber-500" },
  { title: "Approbations", url: "/dashboard/admin/approvals", icon: CheckSquare, description: "Approbations Manager", gradient: "from-green-500 to-teal-500" },
]
const managerMenuItemsFr: MenuItem[] = [
  { title: "Tableau de Bord", url: "/dashboard/manager", icon: LayoutDashboard, description: "Vue d'ensemble", gradient: "from-blue-500 to-purple-500" },
  { title: "Pointeuse", url: "/dashboard/manager/pointeuse", icon: Clock, description: "Gestion tenues et temps", gradient: "from-emerald-500 to-teal-500" },
  { title: "Journal", url: "/dashboard/manager/journal", icon: Calendar, description: "Planning employés", gradient: "from-purple-500 to-pink-500" },
  { title: "Finance", url: "/dashboard/manager/finance", icon: DollarSign, description: "Salaires et finances", gradient: "from-yellow-500 to-orange-500" },
  { title: "Contrats", url: "/dashboard/manager/contrats", icon: FileText, description: "Gestion contrats", gradient: "from-indigo-500 to-purple-500" },
  { title: "Demandes Congé", url: "/dashboard/manager/leave-requests", icon: UserCheck, description: "Gestion demandes congé", gradient: "from-green-500 to-emerald-500" },
  { title: "Employés", url: "/dashboard/manager/employees", icon: Users, description: "Gestion équipe", gradient: "from-cyan-500 to-blue-500" },
]

// Arabic labels
const employeeMenuItemsAr: MenuItem[] = [
  { title: "لوحة التحكم", url: "/dashboard", icon: LayoutDashboard, description: "نظرة عامة", gradient: "from-blue-500 to-cyan-500" },
  { title: "آلة البصمة", url: "/dashboard/pointeuse", icon: Clock, description: "إدارة الوقت", gradient: "from-emerald-500 to-teal-500" },
  { title: "السجل", url: "/dashboard/journal", icon: Calendar, description: "الجدول والسجل", gradient: "from-purple-500 to-pink-500" },
  { title: "المالية", url: "/dashboard/finance", icon: DollarSign, description: "الراتب والمخالفات", gradient: "from-yellow-500 to-orange-500" },
  { title: "العقود", url: "/dashboard/contrats", icon: FileText, description: "تفاصيل العقد", gradient: "from-indigo-500 to-purple-500" },
  { title: "طلب إجازة", url: "/dashboard/leave-request", icon: FileText, description: "طلبات الإجازة", gradient: "from-green-500 to-emerald-500" },
]
const adminMenuItemsAr: MenuItem[] = [
  { title: "لوحة الإدارة", url: "/dashboard/admin", icon: LayoutDashboard, description: "نظرة عامة", gradient: "from-red-500 to-orange-500" },
  { title: "الموظفون", url: "/dashboard/admin/employees", icon: Users, description: "إدارة الموظفين", gradient: "from-blue-500 to-indigo-500" },
  { title: "المطاعم", url: "/dashboard/admin/locations", icon: MapPin, description: "إدارة المواقع", gradient: "from-purple-500 to-pink-500" },
  { title: "السجل", url: "/dashboard/admin/journal", icon: Calendar, description: "إدارة الجداول", gradient: "from-emerald-500 to-cyan-500" },
  { title: "المالية", url: "/dashboard/admin/finance", icon: DollarSign, description: "الإدارة المالية", gradient: "from-yellow-500 to-amber-500" },
  { title: "الموافقات", url: "/dashboard/admin/approvals", icon: CheckSquare, description: "موافقات المدير", gradient: "from-green-500 to-teal-500" },
  { title: "العقود", url: "/dashboard/admin/contrats", icon: FileText, description: "إدارة العقود", gradient: "from-indigo-500 to-purple-500" },

]
const managerMenuItemsAr: MenuItem[] = [
  { title: "لوحة المدير", url: "/dashboard/manager", icon: LayoutDashboard, description: "نظرة عامة", gradient: "from-blue-500 to-purple-500" },
  { title: "آلة البصمة", url: "/dashboard/manager/pointeuse", icon: Clock, description: "إدارة الوقت والزي", gradient: "from-emerald-500 to-teal-500" },
  { title: "المالية", url: "/dashboard/manager/finance", icon: DollarSign, description: "الرواتب والمالية", gradient: "from-yellow-500 to-orange-500" },
  { title: "طلبات الإجازة", url: "/dashboard/manager/leave-requests", icon: UserCheck, description: "إدارة الطلبات", gradient: "from-green-500 to-emerald-500" },
  { title: "السجل", url: "/dashboard/manager/journal", icon: Calendar, description: "إدارة الفريق", gradient: "from-cyan-500 to-blue-500" },
]

function getMenuItems(role: string | undefined, lang: Lang): MenuItem[] {
  const ar = lang === "ar"
  if (role === "admin") return ar ? adminMenuItemsAr : adminMenuItemsFr
  if (role === "manager") return ar ? managerMenuItemsAr : managerMenuItemsFr
  return ar ? employeeMenuItemsAr : employeeMenuItemsFr
}

function roleSpaceLabel(role: string | undefined, lang: Lang) {
  if (lang === "ar") {
    return role === "admin" ? "مساحة الإدارة" : role === "manager" ? "مساحة المدير" : "مساحة الموظف"
  }
  return role === "admin" ? "Espace Admin" : role === "manager" ? "Espace Manager" : "Espace Employé"
}

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const lang = useLang("fr")
  const { state } = useSidebar()
  const pathname = usePathname()
  const { user } = useAuth()

  const collapsed = state === "collapsed"
  const isActive = (path: string) => pathname === path
  const menuItems = useMemo(() => getMenuItems(user?.role, lang), [user?.role, lang])
  const handleNavigation = () => onNavigate?.()

  return (
    <Sidebar className="border-none bg-transparent" dir="ltr">
      <div className="relative h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden z-30 flex flex-col">
        {/* Background accents */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(120,119,198,0.12),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,119,198,0.08),transparent_50%)]" />
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
              style={{
                left: `${(i * 53) % 100}%`,
                top: `${(i * 37) % 100}%`,
                animationDelay: `${(i % 5) * 0.2}s`,
                animationDuration: `${2 + ((i * 17) % 20) / 10}s`,
              }}
            />
          ))}
        </div>

        {/* Header */}
        <SidebarHeader className="relative z-10 p-2 sm:p-3 backdrop-blur-xl bg-white/5 border-b border-white/10 flex-shrink-0">
          <div className="group relative transform-gpu perspective-1000">
            <div
              className="relative bg-gradient-to-r from-red-600/90 via-red-500/90 to-orange-600/90 backdrop-blur-xl border border-red-400/30 rounded-xl p-2 sm:p-3 text-white transition-all duration-500"
              style={{
                transform: "perspective(1000px) rotateX(3deg)",
                boxShadow:
                  "0 15px 30px -8px rgba(239, 68, 68, 0.4), 0 0 0 1px rgba(248, 113, 113, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
              }}
            >
              <div className="absolute -top-6 -right-6 sm:-top-8 sm:-right-8 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-yellow-400/20 to-red-400/20 rounded-full blur-2xl animate-pulse" />
              <Link href="/dashboard" onClick={handleNavigation} className="flex items-center cursor-pointer relative z-10">
                <div
                  className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-2xl border border-white/30 transform group-hover:scale-110 transition-all duration-300 flex-shrink-0 relative overflow-hidden"
                  style={{
                    boxShadow:
                      "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.2)",
                    transform: "perspective(1000px) rotateX(15deg) rotateY(-5deg)",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-black/10 rounded-xl" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10 rounded-xl" />
                  <img
                    src="/REDCASTEL.png"
                    alt="Red Castel Logo"
                    className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                    style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}
                  />
                </div>
                {!collapsed && (
                  <div className="ml-2 sm:ml-3 min-w-0 flex-1">
                    <h1 className="text-sm sm:text-base font-bold bg-gradient-to-r from-white via-yellow-100 to-white bg-clip-text text-transparent truncate" dir="auto">
                      {"Red Castle"}
                    </h1>
                    <p className="text-red-100/80 text-xs truncate" dir="auto">
                      {roleSpaceLabel(user?.role, lang)}
                    </p>
                  </div>
                )}
              </Link>
            </div>
          </div>
        </SidebarHeader>

        {/* Scrollable content */}
        <SidebarContent className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden backdrop-blur-sm">
          <div className="p-2">
            <SidebarGroup>
              <SidebarGroupLabel className="px-2 py-1 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1 sticky top-0 bg-slate-900/50 backdrop-blur-sm z-10">
                {!collapsed && (
                  <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent" dir="auto">
                    {lang === "ar" ? "التنقل" : "Navigation"}
                  </span>
                )}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-2 sm:space-y-3 pb-4">
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <div className="group relative transform-gpu perspective-1000">
                        <SidebarMenuButton
                          asChild
                          className={`h-auto p-0 rounded-xl transition-all duration-500 group relative overflow-hidden ${
                            isActive(item.url) ? "transform hover:scale-105" : "hover:scale-[1.02]"
                          }`}
                        >
                          <Link href={item.url} onClick={handleNavigation} className="block w-full">
                            <div
                              className={`relative p-3 sm:p-4 rounded-xl text-white transform transition-all duration-500 w-full ${
                                isActive(item.url)
                                  ? `bg-gradient-to-br ${item.gradient} shadow-2xl`
                                  : "bg-slate-800/50 hover:bg-slate-700/60 backdrop-blur-xl border border-slate-600/40 hover:border-slate-500/60"
                              }`}
                              style={
                                isActive(item.url)
                                  ? {
                                      transform: "perspective(1000px) rotateX(8deg) rotateY(-2deg)",
                                      boxShadow:
                                        "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.25)",
                                    }
                                  : {
                                      boxShadow: "0 12px 25px -6px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.08)",
                                    }
                              }
                            >
                              {/* Shine effect */}
                              {isActive(item.url) && (
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                              )}
                              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                              </div>

                              <div className="relative z-10 flex items-center">
                                <div
                                  className={`flex-shrink-0 transition-all duration-300 transform ${
                                    collapsed ? "mx-auto" : "mr-2 sm:mr-3"
                                  } ${isActive(item.url) ? "scale-110" : "group-hover:scale-105"}`}
                                >
                                  <div
                                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all duration-300 relative overflow-hidden transform-gpu ${
                                      isActive(item.url)
                                        ? "bg-gradient-to-br from-white/30 to-white/15 backdrop-blur-sm border border-white/40 shadow-2xl"
                                        : "bg-gradient-to-br from-slate-700/60 to-slate-800/60 group-hover:from-slate-600/70 group-hover:to-slate-700/70 border border-slate-600/60 shadow-xl"
                                    }`}
                                    style={
                                      isActive(item.url)
                                        ? {
                                            boxShadow:
                                              "0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.2)",
                                            transform: "perspective(1000px) rotateX(20deg) rotateY(-8deg) scale(1.05)",
                                          }
                                        : {
                                            boxShadow:
                                              "0 8px 25px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.15)",
                                            transform: "perspective(1000px) rotateX(12deg) rotateY(-4deg)",
                                          }
                                    }
                                  >
                                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-black/10 rounded-xl" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10 rounded-xl" />
                                    {isActive(item.url) && (
                                      <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} rounded-xl blur-lg opacity-30 animate-pulse`} />
                                    )}
                                    <item.icon
                                      className={`w-5 h-5 sm:w-6 sm:h-6 relative z-10 transition-all duration-300 ${
                                        isActive(item.url) ? "text-white" : "text-gray-200 group-hover:text-white"
                                      }`}
                                      style={{
                                        filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.6)) drop-shadow(0 1px 2px rgba(0,0,0,0.8))",
                                        textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                                      }}
                                    />
                                  </div>
                                </div>

                                {!collapsed && (
                                  <div className="flex-1 min-w-0 text-left">
                                    <div
                                      className={`text-base sm:text-lg font-black truncate mb-1 transition-all duration-300 tracking-wide ${
                                        isActive(item.url) ? "text-white drop-shadow-lg" : "text-gray-100 group-hover:text-white drop-shadow-md"
                                      }`}
                                      style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.5)", fontWeight: 900, letterSpacing: "0.5px" }}
                                      dir="auto"
                                    >
                                      {item.title}
                                    </div>
                                    <div
                                      className={`text-xs sm:text-sm font-bold truncate transition-all duration-300 tracking-wide ${
                                        isActive(item.url) ? "text-white/90 drop-shadow-md" : "text-gray-300 group-hover:text-gray-200 drop-shadow-sm"
                                      }`}
                                      style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.7)", fontWeight: 700, letterSpacing: "0.3px" }}
                                      dir="auto"
                                    >
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
          </div>
        </SidebarContent>

        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            33% { transform: translateY(-5px) rotate(1deg); }
            66% { transform: translateY(3px) rotate(-1deg); }
          }
          .animate-float { animation: float 4s ease-in-out infinite; }
          .overflow-y-auto::-webkit-scrollbar { width: 6px; }
          .overflow-y-auto::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.1); border-radius: 3px; }
          .overflow-y-auto::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 3px; }
          .overflow-y-auto::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.3); }
          .overflow-y-auto { scrollbar-width: thin; scrollbar-color: rgba(255, 255, 255, 0.2) rgba(0, 0, 0, 0.1); }
        `}</style>
      </div>
    </Sidebar>
  )
}
