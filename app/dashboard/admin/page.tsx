"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line } from "recharts"
import {
  Users,
  MapPin,
  DollarSign,
  TrendingUp,
  Clock,
  CheckSquare,
  Building2,
  UserCheck,
  Calendar,
  Shield,
  ActivityIcon,
  X,
} from "lucide-react"
import Link from "next/link"
import { useQuery, gql } from "@apollo/client"
import { formatDistanceToNow } from "date-fns"
import { fr, ar as arLocale } from "date-fns/locale"
import { useLang } from "@/lib/i18n"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { GET_ADMIN_DATA } from "@/lib/graphql-queries"
import { useAuth } from "@/lib/auth-context"

const revenueData = [
  { month: "Jan", revenue: 125000, employees: 45 },
  { month: "Fév", revenue: 132000, employees: 47 },
  { month: "Mar", revenue: 128000, employees: 46 },
  { month: "Avr", revenue: 145000, employees: 48 },
  { month: "Mai", revenue: 138000, employees: 49 },
  { month: "Jun", revenue: 152000, employees: 52 },
]

const locationData = [
  { name: "Red Castle Cuisine Centrale", employees: 18, revenue: 65000, status: "active" },
  { name: "Red Castle El Manzah", employees: 15, revenue: 48000, status: "active" },
  { name: "Red Castle Lauina", employees: 19, revenue: 39000, status: "active" },
]

const RECENT_ACTIVITIES_QUERY = gql`
  query RecentActivities($limit: Int) {
    recentActivities(limit: $limit) {
      id
      title
      description
      type
      urgent
      created_at
    }
  }
`

export default function AdminDashboard() {
  const { user } = useAuth()
  const { lang, t, locale, formatNumber } = useLang("fr")

  // Dialog states
  const [openActivitiesList, setOpenActivitiesList] = React.useState(false)
  const [selectedActivity, setSelectedActivity] = React.useState<any | null>(null)

  // Use combined admin data query - single API call for all admin dashboard data
  const { data, loading, error } = useQuery(GET_ADMIN_DATA, {
    variables: {
      userId: user?.id,
      role: user?.role,
      approvalStatus: "pending",
    },
    skip: !user?.id || user?.role !== "admin",
    fetchPolicy: "cache-first",
    nextFetchPolicy: "cache-first",
    notifyOnNetworkStatusChange: false,
  })

  // Fetch recent activities separately as it's optional
  const {
    data: activitiesData,
    loading: activitiesLoading,
    error: activitiesError,
  } = useQuery(RECENT_ACTIVITIES_QUERY, {
    variables: { limit: 10 },
    fetchPolicy: "cache-first",
    nextFetchPolicy: "cache-first",
    notifyOnNetworkStatusChange: false,
  })

  const recentActivities = activitiesData?.recentActivities || []
  const stats = data?.dashboardStats || {}
  const employees = data?.employees || []
  const locations = data?.locations || []
  const adminApprovals = data?.adminApprovals || []

  const totalEmployees = employees.length
  const totalRevenue = locationData.reduce((sum, loc) => sum + loc.revenue, 0)
  const pendingApprovals = adminApprovals.length
  const activeLocations = locations.filter((loc: any) => (loc.employees?.length || 0) > 0).length

  const monthKey = (m: string) => {
    const map: Record<string, string> = {
      Jan: t("m_jan"),
      Fév: t("m_feb"),
      Mar: t("m_mar"),
      Avr: t("m_apr"),
      Mai: t("m_may"),
      Jun: t("m_jun"),
    }
    return map[m] ?? m
  }

  const revenueKLabel =
    lang === "ar"
      ? `${new Intl.NumberFormat(locale).format(Math.round(totalRevenue / 1000))} ألف د.ت`
      : `${new Intl.NumberFormat(locale).format(Math.round(totalRevenue / 1000))}KDT`

  const dashboardStats = [
    {
      title: t("stat_total_employees"),
      value: formatNumber(totalEmployees),
      description: t("stat_all_restaurants"),
      icon: Users,
      color: "text-blue-400",
      bgColor: "from-blue-500/20 to-cyan-500/20",
      trend: "+12%",
      link: "/dashboard/admin/employees",
    },
    {
      title: t("stat_active_locations"),
      value: formatNumber(activeLocations),
      description: t("stat_locations_open"),
      icon: MapPin,
      color: "text-green-400",
      bgColor: "from-green-500/20 to-emerald-500/20",
      trend: "100%",
      link: "/dashboard/admin/locations",
    },
    {
      title: t("stat_revenue"),
      value: revenueKLabel,
      description: t("stat_this_month"),
      icon: DollarSign,
      color: "text-yellow-400",
      bgColor: "from-yellow-500/20 to-orange-500/20",
      trend: "+8.2%",
      link: "/dashboard/admin/finance",
    },
    {
      title: t("stat_approvals"),
      value: formatNumber(pendingApprovals),
      description: t("stat_pending"),
      icon: CheckSquare,
      color: "text-red-400",
      bgColor: "from-red-500/20 to-pink-500/20",
      trend: t("urgent"),
      link: "/dashboard/admin/approvals",
    },
  ]

  // Helpers: parse Postgres timestamp (without tz) as LOCAL time (avoid +1h)
  function parseLocalDate(createdAt: unknown) {
    if (!createdAt) return null
    const raw = String(createdAt).trim()
    let cleaned = raw.replace(/(\.\d{1,6})$/, "").replace(" ", "T")
    if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) cleaned += "T00:00:00"
    const d1 = new Date(cleaned)
    if (!isNaN(d1.getTime())) return d1
    const parts = raw.split(" ")
    const fallback = parts[0] + "T" + (parts[1]?.slice(0, 8) ?? "00:00:00")
    const d2 = new Date(fallback)
    if (!isNaN(d2.getTime())) return d2
    return null
  }

  function computeRelTime(createdAt: unknown) {
    const dateObj = parseLocalDate(createdAt)
    if (!dateObj) return t("invalid_date")
    try {
      return formatDistanceToNow(dateObj, {
        addSuffix: true,
        locale: lang === "ar" ? arLocale : fr,
      })
    } catch {
      return t("invalid_date")
    }
  }

  function formatExactDateTime(createdAt: unknown) {
    const dateObj = parseLocalDate(createdAt)
    if (!dateObj) return t("invalid_date")
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "full",
      timeStyle: "short",
    }).format(dateObj)
  }

  function renderActivityItem(activity: any) {
    const relTime = computeRelTime(activity.created_at)

    let icon = <Clock className="w-4 h-4" />
    let chipClass = "bg-orange-500/15 text-orange-300 border-orange-500/30"
    if (activity.type === "leave") {
      icon = <Calendar className="w-4 h-4" />
      chipClass = "bg-blue-500/15 text-blue-300 border-blue-500/30"
    } else if (activity.type === "finance") {
      icon = <DollarSign className="w-4 h-4" />
      chipClass = "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
    } else if (activity.type === "employee") {
      icon = <UserCheck className="w-4 h-4" />
      chipClass = "bg-purple-500/15 text-purple-300 border-purple-500/30"
    }

    return (
      <div
        key={activity.id}
        role="button"
        tabIndex={0}
        aria-label={activity.title || t("recent_activities")}
        onClick={() => setSelectedActivity(activity)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            setSelectedActivity(activity)
          }
        }}
        className="group relative rounded-xl border border-white/10 bg-white/5 hover:bg-white/[0.08] transition-colors duration-200 overflow-hidden"
      >
        <div className="p-4 sm:p-5">
          <div className="flex items-start gap-3 sm:gap-4">
            <div
              className={`flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-lg border ${chipClass}`}
            >
              {icon}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-white text-sm sm:text-base font-semibold leading-tight truncate" dir="auto">
                  {activity.title}
                </h4>
                {activity.urgent && (
                  <Badge className="bg-red-500/20 text-red-200 border-red-500/30">{t("urgent")}</Badge>
                )}
                <span className="text-[11px] sm:text-xs text-slate-400">•</span>
                <span className="text-[11px] sm:text-xs text-slate-400">{relTime}</span>
              </div>

              <p
                className="mt-2 text-slate-200 text-sm sm:text-[15px] leading-relaxed underline-offset-2 group-hover:underline"
                dir="auto"
              >
                {activity.description}
              </p>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-40" />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Loading skeleton */}
        <div aria-hidden="true">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-30 animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 6}s`,
                animationDuration: `${6 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>

        <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-3 sm:p-4 lg:p-6 relative z-10">
          <div className="glass-card backdrop-blur-futuristic p-4 sm:p-6 lg:p-8 text-white shadow-2xl animate-pulse">
            <div className="h-8 bg-white/20 rounded w-64 mb-4"></div>
            <div className="h-4 bg-white/20 rounded w-48"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="glass-card backdrop-blur-futuristic border-0 shadow-2xl animate-pulse">
                <CardContent className="p-4 sm:p-5 lg:p-6">
                  <div className="h-6 bg-white/20 rounded w-32 mb-2"></div>
                  <div className="h-8 bg-white/20 rounded w-16 mb-2"></div>
                  <div className="h-4 bg-white/20 rounded w-24"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* floating particles */}
      <div aria-hidden="true">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-30 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${6 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-3 sm:p-4 lg:p-6 relative z-10">
        {/* Header */}
        <div className="glass-card backdrop-blur-futuristic p-4 sm:p-6 lg:p-8 text-white shadow-2xl transform hover:scale-[1.01] transition-all duration-500 animate-fade-in relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-red-700/30 to-red-800/20 opacity-50"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] animate-[shimmer_3s_ease-in-out_infinite]"></div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6 relative z-10">
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-2xl animate-glow">
                <Building2 className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white drop-shadow-lg" />
              </div>
              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center animate-float">
                <ActivityIcon className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
              </div>
              <div
                className="absolute -bottom-1 -left-1 sm:-bottom-2 sm:-left-2 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center animate-float"
                style={{ animationDelay: "1s" }}
              >
                <Shield className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h1
                className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent leading-tight"
                dir="auto"
              >
                {t("admin_title")}
              </h1>
              <p className="text-slate-200 text-sm sm:text-base lg:text-lg font-medium" dir="auto">
                {t("admin_subtitle")}
              </p>

              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs sm:text-sm text-slate-300" dir="auto">
                    {t("system_active")}
                  </span>
                </div>
                <span className="text-xs sm:text-sm text-slate-400 hidden sm:block">•</span>
                <span className="text-xs sm:text-sm text-slate-300" dir="auto">
                  {t("last_update_now")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {dashboardStats.map((stat, index) => (
            <Link key={index} href={stat.link}>
              <Card className="glass-card backdrop-blur-futuristic border-0 shadow-2xl transform transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer group relative overflow-hidden">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} opacity-50 group-hover:opacity-70 transition-opacity duration-500`}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                <CardContent className="p-4 sm:p-5 lg:p-6 relative z-10">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div className="relative">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-lg lg:rounded-xl flex items-center justify-center bg-gradient-to-br from-slate-700/50 to-slate-800/50 backdrop-blur-sm border border-white/10 group-hover:scale-110 transition-transform duration-300">
                        <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color} drop-shadow-lg`} />
                      </div>
                      <div
                        className="absolute inset-0 rounded-lg lg:rounded-xl border-2 border-current opacity-20 animate-ping"
                        style={{ color: stat.color.replace("text-", "") }}
                      />
                    </div>
                    <Badge
                      variant={stat.trend === t("urgent") ? "destructive" : "default"}
                      className={`${
                        stat.trend === t("urgent")
                          ? "bg-red-500/20 text-red-300 border-red-500/30"
                          : "bg-green-500/20 text-green-300 border-green-500/30"
                      } backdrop-blur-sm font-semibold text-xs sm:text-sm px-2 py-1`}
                    >
                      {stat.trend}
                    </Badge>
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <div className="text-2xl sm:text-3xl font-bold text-white mb-1 group-hover:scale-105 transition-transform duration-300">
                      {stat.value}
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-slate-200" dir="auto">
                      {stat.title}
                    </div>
                    <div className="text-xs text-slate-400" dir="auto">
                      {stat.description}
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          <Card className="glass-card backdrop-blur-futuristic border-0 shadow-2xl transform hover:scale-[1.02] transition-all duration-500 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-transparent"></div>
            <CardHeader className="relative z-10 p-4 sm:p-5 lg:p-6">
              <CardTitle className="flex items-center text-white text-lg sm:text-xl">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <span className="truncate" dir="auto">
                  {t("chart_global_perf")}
                </span>
              </CardTitle>
              <CardDescription className="text-slate-300 text-xs sm:text-sm" dir="auto">
                {t("chart_global_perf_desc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 p-4 sm:p-5 lg:p-6 pt-0">
              <ChartContainer
                config={{
                  revenue: {
                    label: t("stat_revenue"),
                    color: "#3b82f6",
                  },
                  employees: {
                    label: t("employees"),
                    color: "#8b5cf6",
                  },
                }}
                className="h-[250px] sm:h-[300px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={revenueData.map((d) => ({ ...d, month: monthKey(d.month) }))}
                    margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                  >
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: "#3b82f6", strokeWidth: 2, stroke: "#ffffff" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="employees"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5, fill: "#8b5cf6", strokeWidth: 2, stroke: "#ffffff" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="glass-card backdrop-blur-futuristic border-0 shadow-2xl transform hover:scale-[1.02] transition-all duration-500 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-transparent"></div>
            <CardHeader className="relative z-10 p-4 sm:p-5 lg:p-6">
              <CardTitle className="flex items-center text-white text-lg sm:text-xl">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <span className="truncate" dir="auto">
                  {t("chart_perf_by_location")}
                </span>
              </CardTitle>
              <CardDescription className="text-slate-300 text-xs sm:text-sm" dir="auto">
                {t("chart_perf_by_location_desc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 p-4 sm:p-5 lg:p-6 pt-0">
              <ChartContainer
                config={{
                  revenue: {
                    label: t("stat_revenue"),
                    color: "#10b981",
                  },
                }}
                className="h-[250px] sm:h-[300px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={locationData} layout="horizontal" margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <XAxis
                      type="number"
                      stroke="#94a3b8"
                      fontSize={12}
                      tickFormatter={(v: number) => new Intl.NumberFormat(locale).format(v)}
                    />
                    <YAxis dataKey="name" type="category" width={140} stroke="#94a3b8" fontSize={10} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="revenue"
                      fill="#10b981"
                      radius={[0, 6, 6, 0]}
                      className="hover:opacity-80 transition-opacity duration-300"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Restaurants Overview */}
        <Card className="glass-card backdrop-blur-futuristic border-0 shadow-2xl transform hover:scale-[1.01] transition-all duration-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-transparent"></div>
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center text-white text-2xl">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-4">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span dir="auto">{t("restaurants_manage")}</span>
            </CardTitle>
            <CardDescription className="text-slate-300 text-base" dir="auto">
              {t("restaurants_overview")}
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {locationData.map((location, index) => (
                <Link key={index} href={`/dashboard/admin/location/${index + 1}`}>
                  <div className="glass-card backdrop-blur-futuristic p-6 hover:scale-105 transition-all duration-500 cursor-pointer group relative overflow-hidden border-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-700/30 to-slate-800/30 group-hover:from-slate-600/40 group-hover:to-slate-700/40 transition-all duration-500"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-6">
                        <div className="relative">
                          <div className="w-14 h-14 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <Building2 className="w-7 h-7 text-white drop-shadow-lg" />
                          </div>
                          <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                        </div>
                        <Badge
                          className="bg-green-500/20 text-green-300 border-green-500/30 backdrop-blur-sm font-semibold text-xs sm:text-sm"
                          dir="auto"
                        >
                          {t("active")}
                        </Badge>
                      </div>

                      <h3
                        className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 group-hover:text-blue-300 transition-colors duration-300 line-clamp-2"
                        dir="auto"
                      >
                        {location.name}
                      </h3>

                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center justify-between p-2 sm:p-3 bg-slate-700/30 rounded-lg backdrop-blur-sm">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                              <Users className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                            </div>
                            <span className="text-xs sm:text-sm text-slate-300 font-medium" dir="auto">
                              {t("employees")}
                            </span>
                          </div>
                          <span className="font-bold text-white text-sm sm:text-lg">
                            {formatNumber(location.employees)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-2 sm:p-3 bg-slate-700/30 rounded-lg backdrop-blur-sm">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                              <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                            </div>
                            <span className="text-xs sm:text-sm text-slate-300 font-medium" dir="auto">
                              {t("monthly_revenue")}
                            </span>
                          </div>
                          <span className="font-bold text-white text-sm sm:text-lg">
                            {lang === "ar"
                              ? `${new Intl.NumberFormat(locale).format(Math.round(location.revenue / 1000))} ألف د.ت`
                              : `${new Intl.NumberFormat(locale).format(Math.round(location.revenue / 1000))}KDT`}
                          </span>
                        </div>

                        <div className="pt-2">
                          <div className="flex justify-between text-xs sm:text-sm mb-2">
                            <span className="text-slate-300 font-medium" dir="auto">
                              {t("performance")}
                            </span>
                            <span className="text-white font-bold">
                              {new Intl.NumberFormat(locale).format(Math.round((location.revenue / 65000) * 100))}%
                            </span>
                          </div>
                          <div className="relative">
                            <Progress value={(location.revenue / 65000) * 100} className="h-2 sm:h-3 bg-slate-700/50" />
                            <div
                              className="absolute top-0 left-0 h-2 sm:h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-1000 animate-pulse"
                              style={{ width: `${(location.revenue / 65000) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities (card) */}
        <Card className="glass-card backdrop-blur-futuristic border-0 shadow-2xl transform hover:scale-[1.01] transition-all duration-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-red-500/10 to-transparent"></div>

          {/* Click header to open list modal (not full-screen) */}
          <CardHeader
            role="button"
            tabIndex={0}
            onClick={() => setOpenActivitiesList(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                setOpenActivitiesList(true)
              }
            }}
            className="relative z-10 p-4 sm:p-5 lg:p-6 cursor-pointer select-none"
          >
            <CardTitle className="flex items-center text-white text-lg sm:text-xl lg:text-2xl">
              <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg lg:rounded-xl flex items-center justify-center mr-3 lg:mr-4">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="truncate" dir="auto">
                {t("recent_activities")}
              </span>
            </CardTitle>
            <CardDescription className="text-slate-300 text-sm sm:text-base" dir="auto">
              {t("recent_activities_desc")}
            </CardDescription>
          </CardHeader>

          <CardContent className="relative z-10 p-4 sm:p-5 lg:p-6 pt-0">
            <div className="space-y-3 sm:space-y-4">
              {activitiesLoading && <div className="text-slate-400">{t("loading_activities")}</div>}
              {activitiesError && <div className="text-red-400">{t("error_loading_activities")}</div>}
              {!activitiesLoading && !activitiesError && recentActivities.length === 0 && (
                <div className="text-slate-400">{t("no_recent_activity")}</div>
              )}

              {recentActivities.map((activity: any) => renderActivityItem(activity))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activities LIST modal (centered box, like create-employee dialog) */}
      <Dialog open={openActivitiesList} onOpenChange={setOpenActivitiesList}>
        <DialogContent className="sm:max-w-[900px] w-full max-h-[85vh] glass-card backdrop-blur-futuristic bg-slate-900/95 border-slate-700 text-white overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-white" dir="auto">
              {t("recent_activities")}
            </DialogTitle>
            <DialogDescription className="text-slate-300" dir="auto">
              {t("recent_activities_desc")}
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto pr-1" style={{ maxHeight: "60vh" }}>
            <div className="space-y-3 sm:space-y-4">
              {activitiesLoading && <div className="text-slate-400">{t("loading_activities")}</div>}
              {activitiesError && <div className="text-red-400">{t("error_loading_activities")}</div>}
              {!activitiesLoading && !activitiesError && recentActivities.length === 0 && (
                <div className="text-slate-400">{t("no_recent_activity")}</div>
              )}
              {recentActivities.map((activity: any) => renderActivityItem(activity))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <DialogClose asChild>
              <Button
                variant="outline"
                className="glass-card bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50"
              >
                {t("cancel") || "Fermer"}
              </Button>
            </DialogClose>
          </div>

          {/* Top-right X button */}
          <DialogClose asChild>
            <button
              aria-label="Close"
              className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md bg-slate-800/60 hover:bg-slate-700/70 border border-slate-700 text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogClose>
        </DialogContent>
      </Dialog>

      {/* Activity DETAIL modal (centered box, same style as create-employee) */}
      <Dialog open={!!selectedActivity} onOpenChange={(open) => !open && setSelectedActivity(null)}>
        <DialogContent className="sm:max-w-[720px] w-full glass-card backdrop-blur-futuristic bg-slate-900/95 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white" dir="auto">
              {selectedActivity?.title ?? ""}
            </DialogTitle>
            <DialogDescription className="text-slate-300">
              {selectedActivity
                ? `${computeRelTime(selectedActivity.created_at)} • ${formatExactDateTime(selectedActivity.created_at)}`
                : ""}
            </DialogDescription>
          </DialogHeader>

          {selectedActivity && (
            <div className="space-y-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 sm:p-5">
                <p
                  className="text-slate-100 text-[15px] sm:text-base leading-relaxed whitespace-pre-wrap break-words"
                  dir="auto"
                >
                  {selectedActivity.description}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-300">
                <span className="inline-flex items-center gap-1 rounded-md bg-slate-800/60 px-2 py-1">
                  {selectedActivity.type === "leave" ? (
                    <Calendar className="w-3 h-3" />
                  ) : selectedActivity.type === "finance" ? (
                    <DollarSign className="w-3 h-3" />
                  ) : selectedActivity.type === "employee" ? (
                    <UserCheck className="w-3 h-3" />
                  ) : (
                    <Clock className="w-3 h-3" />
                  )}
                  <span className="capitalize">{selectedActivity.type}</span>
                </span>
                {selectedActivity.urgent && (
                  <Badge className="bg-red-500/20 text-red-200 border-red-500/30">{t("urgent")}</Badge>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button
                variant="outline"
                className="glass-card bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50"
              >
                {t("cancel") || "Fermer"}
              </Button>
            </DialogClose>
          </div>

          {/* Top-right X button */}
          <DialogClose asChild>
            <button
              aria-label="Close"
              className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md bg-slate-800/60 hover:bg-slate-700/70 border border-slate-700 text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogClose>
        </DialogContent>
      </Dialog>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  )
}
