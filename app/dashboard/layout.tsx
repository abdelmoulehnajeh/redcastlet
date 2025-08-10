"use client"

import type React from "react"
import { useState, useEffect, useMemo, useRef, useCallback, useContext, createContext } from "react"
import { useRouter } from "next/navigation"
import { useLazyQuery, useMutation, useQuery } from "@apollo/client"

import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
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
import {
  GET_NOTIFICATIONS,
  MARK_NOTIFICATION_SEEN,
  MARK_ALL_NOTIFICATIONS_SEEN,
  GET_ADMIN_APPROVALS,
} from "@/lib/graphql-queries"

import { LogOut, User, Settings, Bell, ChevronDown, X, CheckCircle, Calendar } from "lucide-react"

type Lang = "fr" | "ar"

type Dict = {
  headerTitle: (role: string) => string
  headerSubtitle: string
  roleAdmin: string
  roleManager: string
  roleEmployee: string
  roleUser: string
  toggleSidebar: string
  notifications: string
  profile: string
  settings: string
  logout: string
  notifTitle: string
  noNotifications: string
  scheduleChange: string
  leaveResultAccepted: string
  leaveResultRejected: string
  planningUpdated: string
  dateUnknown: string
  receivedAt: (date: string) => string
  markAll: string
  enableSound: string
  soundBlocked: string
}

const translations: Record<Lang, Dict> = {
  fr: {
    headerTitle: (role) => (role === "admin" ? "Administration" : role === "manager" ? "Management" : "Espace Employé"),
    headerSubtitle: "Tableau de bord Red Castle",
    roleAdmin: "🔥 Administrateur",
    roleManager: "⚡ Manager",
    roleEmployee: "✨ Employé",
    roleUser: "Utilisateur",
    toggleSidebar: "Basculer la barre latérale",
    notifications: "Notifications",
    profile: "Profil",
    settings: "Paramètres",
    logout: "Déconnexion",
    notifTitle: "🔔 Notifications",
    noNotifications: "✨ Aucune notification",
    scheduleChange: "📅 Changement de planning",
    leaveResultAccepted: "✅ Votre demande de congé a été acceptée",
    leaveResultRejected: "❌ Votre demande de congé a été refusée",
    planningUpdated: "📅 Planning mis à jour",
    dateUnknown: "Date inconnue",
    receivedAt: (date) => `Reçu le ${date}`,
    markAll: "Tout marquer comme lu",
    enableSound: "Activer le son",
    soundBlocked: "Le navigateur a bloqué l'autoplay. Cliquez pour activer le son.",
  },
  ar: {
    headerTitle: (role) => (role === "admin" ? "الإدارة" : role === "manager" ? "الإشراف" : "مساحة الموظف"),
    headerSubtitle: "لوحة تحكم ريد كاسل",
    roleAdmin: "🔥 مدير النظام",
    roleManager: "⚡ مدير",
    roleEmployee: "✨ موظف",
    roleUser: "مستخدم",
    toggleSidebar: "فتح القائمة الجانبية",
    notifications: "الإشعارات",
    profile: "الملف الشخصي",
    settings: "الإعدادات",
    logout: "تسجيل الخروج",
    notifTitle: "🔔 الإشعارات",
    noNotifications: "✨ لا توجد إشعارات",
    scheduleChange: "📅 تغيير الجدول",
    leaveResultAccepted: "✅ تم قبول طلب الإجازة",
    leaveResultRejected: "❌ تم رفض طلب الإجازة",
    planningUpdated: "📅 تم تحديث التخطيط",
    dateUnknown: "تاريخ غير معروف",
    receivedAt: (date) => `تم الاستلام في ${date}`,
    markAll: "تحديد الكل كمقروء",
    enableSound: "تفعيل الصوت",
    soundBlocked: "حجب المتصفح التشغيل التلقائي. انقر لتفعيل الصوت.",
  },
}

const DEFAULT_LANG: Lang = "fr"
const DEFAULT_TZ = "Africa/Tunis"

function getLocale(lang: Lang) {
  return lang === "ar" ? "ar-TN" : "fr-TN"
}

function useDashboardLang() {
  const [lang, setLang] = useState<Lang>(DEFAULT_LANG)

  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = window.localStorage.getItem("lang")
    if (stored === "fr" || stored === "ar") {
      setLang(stored)
    } else {
      window.localStorage.setItem("lang", DEFAULT_LANG)
      setLang(DEFAULT_LANG)
    }
  }, [])

  useEffect(() => {
    if (typeof document === "undefined") return
    document.documentElement.setAttribute("lang", lang)
    document.documentElement.setAttribute("dir", "ltr")
  }, [lang])

  const dict = translations[lang]
  return { lang, dict }
}

interface AnimatedParticle {
  id: number
  left: string
  top: string
  delay: string
  duration: string
}

function formatDateInTZ(date: Date, lang: Lang) {
  try {
    return new Intl.DateTimeFormat(getLocale(lang), {
      timeZone: DEFAULT_TZ,
      dateStyle: "short",
      timeStyle: "short",
    }).format(date)
  } catch {
    return date.toLocaleString(getLocale(lang))
  }
}

type Notification = {
  id: string
  user_id: string
  role: string
  title: string
  message: string
  type: string
  reference_id?: string
  seen: boolean
  created_at: string
}

/* ---------------------- Notifications Provider ---------------------- */

type NotificationsContextType = {
  unseenCount: number
  notifications: Notification[]
  markAsSeen: (id: string) => Promise<void>
  markAllAsSeen: () => Promise<void>
  alertEnabled: boolean
  setAlertEnabled: (enabled: boolean) => void
}

const NotificationsContext = createContext<NotificationsContextType | null>(null)

function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider")
  return ctx
}

function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unseenCount, setUnseenCount] = useState(0)

  // localStorage-backed alert sound toggle
  const [alertEnabled, setAlertEnabledState] = useState<boolean>(() => {
    if (typeof window === "undefined") return true
    const v = window.localStorage.getItem("alert")
    return v ? v === "on" : true
  })
  const setAlertEnabled = useCallback((enabled: boolean) => {
    setAlertEnabledState(enabled)
    try {
      window.localStorage.setItem("alert", enabled ? "on" : "off")
      const bc = new BroadcastChannel("rc-notifications")
      bc.postMessage({ type: "alert-toggle", payload: { enabled } })
      bc.close()
    } catch {
      // ignore
    }
  }, [])

  // Apollo helpers
  const [fetchAll] = useLazyQuery(GET_NOTIFICATIONS, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
  })
  const [markSeenMutation] = useMutation(MARK_NOTIFICATION_SEEN)
  const [markAllSeenMutation] = useMutation(MARK_ALL_NOTIFICATIONS_SEEN)

  // Keep unseen count in sync with notifications list
  useEffect(() => {
    setUnseenCount((notifications || []).filter((n) => !n.seen).length)
  }, [notifications])

  // Fetch exactly once per full page reload (guard by ref + sessionStorage)
  const hasFetchedRef = useRef(false)
  useEffect(() => {
    if (!user?.id) return
    const sessionKey = `rc:notifications:fetched:${user.id}`
    const alreadyFetched = typeof sessionStorage !== "undefined" && sessionStorage.getItem(sessionKey) === "true"
    if (hasFetchedRef.current || alreadyFetched) return
    hasFetchedRef.current = true
    ;(async () => {
      try {
        const { data } = await fetchAll({
          variables: {
            user_id: user.id,
            role: user.role,
            only_unseen: false,
          },
        })
        const list: Notification[] = data?.notifications ?? []
        setNotifications(list)
        if (typeof sessionStorage !== "undefined") {
          sessionStorage.setItem(sessionKey, "true")
        }
      } catch {
        // ignore
      }
    })()
  }, [user?.id, user?.role, fetchAll])

  // Cross-tab sync: apply changes without refetching
  useEffect(() => {
    if (typeof window === "undefined") return
    const bc = new BroadcastChannel("rc-notifications")
    const onMsg = (e: MessageEvent) => {
      const msg = e.data
      if (!msg || typeof msg !== "object") return
      if (msg.type === "mark-seen" && msg.payload?.id) {
        const id = String(msg.payload.id)
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, seen: true } : n)))
      } else if (msg.type === "mark-all-seen") {
        setNotifications((prev) => prev.map((n) => ({ ...n, seen: true })))
      } else if (msg.type === "alert-toggle") {
        const enabled = !!msg.payload?.enabled
        setAlertEnabledState(enabled)
      }
    }
    bc.addEventListener("message", onMsg)
    return () => {
      bc.removeEventListener("message", onMsg)
      bc.close()
    }
  }, [])

  // Mutators
  const broadcast = (msg: any) => {
    try {
      const bc = new BroadcastChannel("rc-notifications")
      bc.postMessage(msg)
      bc.close()
    } catch {
      // ignore
    }
  }

  const markAsSeen = useCallback(
    async (id: string) => {
      try {
        await markSeenMutation({ variables: { id } })
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, seen: true } : n)))
        broadcast({ type: "mark-seen", payload: { id } })
      } catch {
        // ignore
      }
    },
    [markSeenMutation],
  )

  const markAllAsSeen = useCallback(async () => {
    if (!user?.id) return
    try {
      await markAllSeenMutation({ variables: { user_id: user.id } })
      setNotifications((prev) => prev.map((n) => ({ ...n, seen: true })))
      broadcast({ type: "mark-all-seen" })
    } catch {
      // ignore
    }
  }, [markAllSeenMutation, user?.id])

  const value: NotificationsContextType = {
    unseenCount,
    notifications,
    markAsSeen,
    markAllAsSeen,
    alertEnabled,
    setAlertEnabled,
  }

  return (
    <NotificationsContext.Provider value={value}>
      <GlobalNotificationController />
      {children}
    </NotificationsContext.Provider>
  )
}

/* ---------------- Global sound controller (edge-triggered) ---------------- */

function GlobalNotificationController() {
  const { unseenCount, alertEnabled } = useNotifications()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const prevUnseenRef = useRef<number>(0)
  const awaitingGestureRef = useRef(false)

  const tryPlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio
      .play()
      .then(() => {
        awaitingGestureRef.current = false
      })
      .catch(() => {
        if (!awaitingGestureRef.current) {
          awaitingGestureRef.current = true
          const handler = () => {
            tryPlay()
            document.removeEventListener("click", handler)
            document.removeEventListener("keydown", handler)
            document.removeEventListener("touchstart", handler)
          }
          document.addEventListener("click", handler, { passive: true })
          document.addEventListener("keydown", handler)
          document.addEventListener("touchstart", handler, { passive: true })
        }
      })
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const prev = prevUnseenRef.current
    const curr = unseenCount

    // Play only if enabled and we go from 0 to > 0
    if (alertEnabled && prev === 0 && curr > 0) {
      tryPlay()
    }

    // Stop when all seen or disabled
    if (curr === 0 || !alertEnabled) {
      audio.pause()
      audio.currentTime = 0
    }

    prevUnseenRef.current = curr
  }, [unseenCount, alertEnabled, tryPlay])

  useEffect(() => {
    return () => {
      const audio = audioRef.current
      if (audio) {
        audio.pause()
        audio.currentTime = 0
      }
    }
  }, [])

  return <audio ref={audioRef} src="/alert.mp3" preload="auto" loop playsInline className="hidden" />
}

/* ------------------------------ Header ------------------------------ */

function DashboardHeader() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { isMobile } = useSidebar()
  const { lang, dict } = useDashboardLang()
  const { unseenCount, notifications, markAsSeen, markAllAsSeen, alertEnabled, setAlertEnabled } = useNotifications()

  const [mounted, setMounted] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  // Also keep admin pending approvals count visible (optional)
  const { data: approvalsData } = useQuery(GET_ADMIN_APPROVALS, {
    variables: { status: "pending" },
    skip: user?.role !== "admin",
  })
  const pendingApprovals = approvalsData?.adminApprovals || []

  useEffect(() => setMounted(true), [])

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
        return dict.roleAdmin
      case "manager":
        return dict.roleManager
      case "employee":
        return dict.roleEmployee
      default:
        return dict.roleUser
    }
  }

  const toggleNotifications = async () => {
    setShowNotifications((s) => !s)
  }
  const closeNotifications = () => setShowNotifications(false)

  const handleNotificationClick = async (n: Notification) => {
    // Navigate based on type
    if (n.type === "schedule_change") {
      if (user?.role === "employee") {
        router.push("/dashboard/journal")
      } else if (user?.role === "admin") {
        router.push("/dashboard/admin/approvals")
      } else if (user?.role === "manager") {
        router.push("/dashboard/manager/leave-requests")
      }
    } else if (n.type === "leave_request") {
      if (user?.role === "employee") {
        router.push("/dashboard/leave-request")
      } else if (user?.role === "manager") {
        router.push("/dashboard/manager/leave-requests")
      } else {
        router.push("/dashboard/admin/approvals")
      }
    }
    await markAsSeen(n.id)
  }

  const handleMarkAll = async () => {
    await markAllAsSeen()
  }

  // neon effect when unseen notifications exist
  const neonPulse = unseenCount > 0

  const headerParticles: AnimatedParticle[] = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        id: i,
        left: `${25 + i * 12.5}%`,
        top: `${20 + (i % 3) * 25}%`,
        delay: `${i * 0.3}s`,
        duration: `${2 + (i % 3)}s`,
      })),
    [],
  )

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
    <>
      <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-slate-900/95 via-purple-900/95 to-slate-900/95 backdrop-blur-xl border-b border-white/10 shadow-2xl">
        {/* Background accents */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(120,119,198,0.1),transparent_50%)]"></div>
          {headerParticles.map((p) => (
            <div
              key={p.id}
              className="absolute w-0.5 h-0.5 bg-white/30 rounded-full animate-pulse"
              style={{
                left: p.left,
                top: p.top,
                animationDelay: p.delay,
                animationDuration: p.duration,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex h-16 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            {/* Mobile sidebar trigger visible on small screens */}
            <SidebarTrigger
              className="md:hidden bg-slate-800/50 hover:bg-slate-700/60 backdrop-blur-xl border border-slate-600/40 text-white hover:text-white transition-all duration-300 rounded-xl"
              aria-label={dict.toggleSidebar}
              title={dict.toggleSidebar}
            />
            {/* Desktop sidebar trigger */}
            <SidebarTrigger className="hidden md:inline-flex bg-slate-800/50 hover:bg-slate-700/60 backdrop-blur-xl border border-slate-600/40 text-white hover:text-white transition-all duration-300 rounded-xl" />

            <div className="group relative flex-1">
              <div className="bg-gradient-to-r from-slate-800/60 via-purple-800/60 to-slate-800/60 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-xl shadow-2xl max-w-full lg:max-w-md xl:max-w-lg 2xl:max-w-xl">
                <h1
                  className="text-lg font-bold bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent leading-tight"
                  dir="auto"
                >
                  {dict.headerTitle(user?.role || "")}
                </h1>
                <p className="text-xs text-slate-300 hidden sm:block" dir="auto">
                  {dict.headerSubtitle}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative group">
              <Button
                variant="ghost"
                size="icon"
                className={`bg-slate-800/50 hover:bg-slate-700/60 backdrop-blur-xl border border-slate-600/40 text-white hover:text-white transition-all duration-300 rounded-xl relative ${
                  neonPulse ? "ring-2 ring-cyan-400/50 shadow-[0_0_25px_rgba(34,211,238,0.45)]" : ""
                }`}
                onClick={toggleNotifications}
              >
                <Bell className={`h-4 w-4 ${neonPulse ? "text-cyan-300" : ""}`} />
                {unseenCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full text-[10px] text-white flex items-center justify-center animate-pulse font-bold shadow-lg">
                    {unseenCount}
                  </span>
                )}
                <span className="sr-only" dir="auto">
                  {dict.notifications}
                </span>
              </Button>
            </div>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-gradient-to-r from-slate-800/60 via-purple-800/60 to-slate-800/60 hover:from-slate-700/70 hover:via-purple-700/70 hover:to-slate-700/70 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300 rounded-xl flex items-center gap-3 px-4 py-2 h-auto">
                  <Avatar className="h-8 w-8 border-2 border-white/30 shadow-lg">
                    <AvatarFallback className="bg-gradient-to-br from-red-500 to-orange-500 text-white text-sm font-bold shadow-inner">
                      {user?.username?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="text-sm font-bold text-white drop-shadow-sm" dir="auto">
                      {user?.username}
                    </span>
                    <Badge className={`text-xs font-semibold ${getRoleColor(user?.role || "")} shadow-sm`} dir="auto">
                      {getRoleLabel(user?.role || "")}
                    </Badge>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-300 transition-transform group-hover:rotate-180 duration-300" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-64 bg-gradient-to-br from-slate-900/95 via-purple-900/95 to-slate-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden p-0"
              >
                <div className="relative z-10">
                  <DropdownMenuLabel className="font-normal p-4 bg-gradient-to-r from-slate-800/50 to-purple-800/50 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-white/30 shadow-lg">
                        <AvatarFallback className="bg-gradient-to-br from-red-500 to-orange-500 text-white font-bold shadow-inner">
                          {user?.username?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-bold text-white drop-shadow-sm" dir="auto">
                          {user?.username}
                        </p>
                        <Badge
                          className={`text-xs font-semibold ${getRoleColor(user?.role || "")} shadow-sm`}
                          dir="auto"
                        >
                          {getRoleLabel(user?.role || "")}
                        </Badge>
                      </div>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-white/10 to-transparent h-px my-2" />

                  <div className="p-2">
                    <DropdownMenuItem className="bg-slate-800/40 hover:bg-slate-700/50 border border-slate-600/30 hover:border-slate-500/50 rounded-xl mb-2 p-3 text-white hover:text-cyan-200 transition-all duration-300 cursor-pointer group">
                      <User className="mr-3 h-4 w-4" />
                      <span className="font-semibold" dir="auto">
                        {translations[lang].profile}
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="bg-slate-800/40 hover:bg-slate-700/50 border border-slate-600/30 hover:border-slate-500/50 rounded-xl mb-2 p-3 text-white hover:text-cyan-200 transition-all duration-300 cursor-pointer group">
                      <Settings className="mr-3 h-4 w-4" />
                      <span className="font-semibold" dir="auto">
                        {translations[lang].settings}
                      </span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-white/10 to-transparent h-px my-2" />

                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="bg-red-900/40 hover:bg-red-800/50 border border-red-600/40 hover:border-red-500/60 rounded-xl p-3 text-red-300 hover:text-red-200 transition-all duration-300 cursor-pointer group"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      <span className="font-semibold" dir="auto">
                        {translations[lang].logout}
                      </span>
                    </DropdownMenuItem>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Notifications Panel */}
      {showNotifications && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] md:hidden" onClick={closeNotifications} />
          <div
            className={`fixed z-[70] transform-gpu ${
              isMobile ? "inset-x-4 top-20 bottom-20" : "right-4 top-20 w-96 max-w-[calc(100vw-2rem)]"
            }`}
          >
            <div className="relative bg-gradient-to-br from-slate-900/98 via-purple-900/98 to-slate-900/98 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden h-full flex flex-col">
              <div className="relative z-10 p-4 border-b border-white/10 flex items-center justify-between">
                <h3
                  className="text-base md:text-lg font-bold bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent"
                  dir="auto"
                >
                  {dict.notifTitle}
                </h3>
                <div className="flex items-center gap-2">
                  {notifications.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMarkAll}
                      className="text-cyan-200 hover:text-cyan-100 hover:bg-cyan-900/30"
                    >
                      {dict.markAll}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAlertEnabled(!alertEnabled)}
                    className={`hover:text-cyan-100 ${alertEnabled ? "text-cyan-200" : "text-slate-400"}`}
                    title={dict.enableSound}
                  >
                    {dict.enableSound}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={closeNotifications}
                    className="bg-slate-800/50 hover:bg-slate-700/60 border border-slate-600/40 text-white rounded-xl h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="relative z-10 flex-1 overflow-hidden">
                {notifications.length === 0 ? (
                  <div className="p-4 h-full flex items-center justify-center">
                    <div
                      className="text-sm text-slate-400 py-8 text-center bg-slate-800/30 rounded-xl backdrop-blur-sm border border-slate-600/30 w-full"
                      dir="auto"
                    >
                      {translations[lang].noNotifications}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 h-full overflow-y-auto">
                    <ul className="space-y-3">
                      {notifications.map((n: Notification) => {
                        const isSeen = n.seen
                        const created = (() => {
                          const dateObj = new Date(n.created_at)
                          return isNaN(dateObj.getTime()) ? null : formatDateInTZ(dateObj, lang)
                        })()
                        const icon =
                          n.type === "schedule_change" ? (
                            <Calendar className="h-4 w-4" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )
                        return (
                          <li key={n.id}>
                            <button
                              className={`w-full text-left p-3 border rounded-xl transition-all duration-300 group transform ${
                                isSeen
                                  ? "bg-slate-800/20 hover:bg-slate-700/30 border-slate-700/40 hover:border-slate-600/50"
                                  : "bg-gradient-to-r from-cyan-900/30 to-indigo-900/30 hover:from-cyan-900/40 hover:to-indigo-900/40 border-cyan-600/40 hover:border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.25)]"
                              }`}
                              onClick={() => handleNotificationClick(n)}
                            >
                              <div className="flex items-start gap-3">
                                {!isSeen && (
                                  <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0 animate-ping" />
                                )}
                                <div className="flex-shrink-0 mt-0.5 text-cyan-200">{icon}</div>
                                <div className="flex-1 min-w-0">
                                  <span
                                    className={`font-semibold block ${isSeen ? "text-slate-300" : "text-white"}`}
                                    dir="auto"
                                  >
                                    {n.title}
                                  </span>
                                  {n.message && (
                                    <span
                                      className={`block text-xs mt-0.5 ${isSeen ? "text-slate-400" : "text-cyan-100/90"}`}
                                      dir="auto"
                                    >
                                      {n.message}
                                    </span>
                                  )}
                                  <span className="block text-[11px] text-slate-400 mt-1" dir="auto">
                                    {created ? translations[lang].receivedAt(created) : translations[lang].dateUnknown}
                                  </span>
                                </div>
                              </div>
                            </button>
                          </li>
                        )
                      })}
                    </ul>

                    {/* Admin quick link to approvals */}
                    {user?.role === "admin" && pendingApprovals.length > 0 && (
                      <div className="mt-4">
                        <Button
                          onClick={() => {
                            router.push("/dashboard/admin/approvals")
                            closeNotifications()
                          }}
                          className="w-full bg-indigo-700 hover:bg-indigo-800"
                        >
                          Aller aux Approbations ({pendingApprovals.length})
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

/* ------------------------------ Shell ------------------------------ */

function DashboardContent({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  // Stable particles for background (visual only)
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Background accents */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.08),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(120,219,255,0.08),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,119,198,0.08),transparent_50%)]"></div>
        </div>

        <AppSidebar onNavigate={() => {}} />

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

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!isLoading && !user && mounted) {
      router.push("/login")
    }
  }, [user, isLoading, router, mounted])

  if (!mounted || isLoading) {
    return (
      <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden"></div>
    )
  }

  if (!user) return null

  return (
    <NotificationsProvider>
      <DashboardContent>{children}</DashboardContent>
    </NotificationsProvider>
  )
}
