"use client"

import { useMemo } from "react"
import { Calendar, Clock } from 'lucide-react'
import { useQuery } from "@apollo/client"
import { useAuth } from "@/lib/auth-context"
import { GET_WORK_SCHEDULES } from "@/lib/graphql-queries"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useLang, type Lang } from "@/lib/i18n"

type Dict = {
  headerTitle: string
  headerSubtitle: string
  tableTitle: string
  tableSubtitle: string
  thDay: string
  thType: string
  thStart: string
  thEnd: string
  thStatus: string
  noSessions: string
  worked: string
  off: string
}

const translations: Record<Lang, Dict> = {
  fr: {
    headerTitle: "Journal de Travail",
    headerSubtitle: "Consultez votre planning et historique",
    tableTitle: "Mes horaires de travail",
    tableSubtitle: "Liste de vos sessions de travail",
    thDay: "Jour",
    thType: "Type",
    thStart: "Début",
    thEnd: "Fin",
    thStatus: "Statut",
    noSessions: "Aucune session trouvée.",
    worked: "Travaillé",
    off: "Repos",
  },
  ar: {
    headerTitle: "سجل العمل",
    headerSubtitle: "اطّلع على جدولك وسجلّك",
    tableTitle: "ساعات عملي",
    tableSubtitle: "قائمة جلسات عملك",
    thDay: "اليوم",
    thType: "النوع",
    thStart: "البدء",
    thEnd: "النهاية",
    thStatus: "الحالة",
    noSessions: "لا توجد جلسات.",
    worked: "تم العمل",
    off: "راحة",
  },
}

function parseAnyDate(input: string | number | Date): Date | null {
  if (input instanceof Date) return isNaN(input.getTime()) ? null : input
  if (typeof input === "number") {
    const d = new Date(input)
    return isNaN(d.getTime()) ? null : d
  }
  if (typeof input === "string") {
    const s = input.trim()
    // numeric timestamp string
    if (/^\d+$/.test(s)) {
      const d = new Date(Number(s))
      return isNaN(d.getTime()) ? null : d
    }
    // ISO-like first
    const iso = Date.parse(s)
    if (!isNaN(iso)) {
      const d = new Date(iso)
      return isNaN(d.getTime()) ? null : d
    }
    // yyyy-mm-dd fallback
    const parts = s.replace(/['"\s]/g, "").split("-")
    if (parts.length === 3 && parts[0].length === 4) {
      const y = Number(parts[0])
      const m = Number(parts[1]) - 1
      const da = Number(parts[2])
      const d = new Date(y, m, da)
      return isNaN(d.getTime()) ? null : d
    }
  }
  return null
}

function formatISOInTunis(d: Date) {
  // Format YYYY-MM-DD using Africa/Tunis
  const fmt = new Intl.DateTimeFormat("fr-TN", {
    timeZone: "Africa/Tunis",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
  const parts = fmt.formatToParts(d)
  const y = parts.find(p => p.type === "year")?.value ?? "0000"
  const m = parts.find(p => p.type === "month")?.value ?? "01"
  const da = parts.find(p => p.type === "day")?.value ?? "01"
  return `${y}-${m}-${da}`
}

function shiftLabel(value: string, lang: Lang) {
  if (lang === "ar") {
    switch (value) {
      case "Matin":
        return "صباحي"
      case "Soirée":
        return "مسائي"
      case "Doublage":
        return "مزدوج"
      case "Repos":
        return "راحة"
      default:
        return value || "—"
    }
  }
  // fr / default
  return value || "—"
}

export default function JournalPage() {
  // i18n and formatting
  const { lang, formatDate } = useLang()
  const t = translations[lang]
  const align = lang === "ar" ? "text-right" : "text-left"

  const { user } = useAuth()
  const { data: scheduleData, loading } = useQuery(GET_WORK_SCHEDULES, {
    variables: { employee_id: user?.employee_id },
    skip: !user?.employee_id,
    fetchPolicy: "cache-and-network",
  })

  const schedules = Array.isArray(scheduleData?.workSchedules) ? scheduleData.workSchedules : []

  const sortedSchedules = useMemo(() => {
    const items = [...schedules]
    const sortKey = (raw: string | number) => {
      const d = parseAnyDate(raw)
      if (!d) return { dow: 8, ts: Number.MAX_SAFE_INTEGER } // push invalid to end
      const dow = d.getDay() === 0 ? 7 : d.getDay() // Mon=1..Sun=7
      return { dow, ts: d.getTime() }
    }
    return items.sort((a: any, b: any) => {
      const A = sortKey(a.date)
      const B = sortKey(b.date)
      if (A.dow !== B.dow) return A.dow - B.dow
      return A.ts - B.ts
    })
  }, [schedules])

  const formatDayLabel = (raw: string | number) => {
    const d = parseAnyDate(raw)
    if (!d) return "—"
    const dayName = formatDate(d, { weekday: "long" })
    const iso = formatISOInTunis(d)
    // Example: الاثنين 2025-07-21 (Arabic) or lundi 2025-07-21 (French)
    return `${dayName} ${iso}`
  }

  return (
    <div className="relative" dir="ltr">
      {/* Decorative background (subtle) */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-purple-900/30 via-slate-900/30 to-slate-950" />

      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="rounded-2xl border bg-gradient-to-br from-slate-900/80 to-slate-800/70 border-slate-700 p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
              <Calendar className="size-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1
                className="text-lg sm:text-2xl font-semibold tracking-tight text-white"
                dir="auto"
              >
                {t.headerTitle}
              </h1>
              <p className="text-xs sm:text-sm text-white/80" dir="auto">
                {t.headerSubtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <Card className="rounded-2xl border border-slate-700 bg-slate-900/70 backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-base sm:text-lg" dir="auto">
              {t.tableTitle}
            </CardTitle>
            <CardDescription className="text-slate-300" dir="auto">
              {t.tableSubtitle}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Desktop/tablet: table */}
            <div className="hidden md:block">
              <div className="relative overflow-x-auto rounded-xl">
                <Table className="min-w-[860px]">
                  <TableHeader>
                    <TableRow className="bg-slate-800/70 border-slate-700">
                      <TableHead className={`${align} text-slate-100`}>{t.thDay}</TableHead>
                      <TableHead className={`${align} text-slate-100`}>{t.thType}</TableHead>
                      <TableHead className={`${align} text-slate-100`}>{t.thStart}</TableHead>
                      <TableHead className={`${align} text-slate-100`}>{t.thEnd}</TableHead>
                      <TableHead className={`${align} text-slate-100`}>{t.thStatus}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 6 }).map((_, i) => (
                        <TableRow key={`skeleton-${i}`} className="border-slate-800/70">
                          <TableCell colSpan={5}>
                            <div className="h-5 w-full animate-pulse rounded bg-slate-700/50" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : sortedSchedules.length === 0 ? (
                      <TableRow className="border-slate-800/70">
                        <TableCell colSpan={5} className="text-center text-slate-400 py-6" dir="auto">
                          {t.noSessions}
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedSchedules.map((schedule: any, idx: number) => {
                        const isWorking = !!schedule.is_working
                        const start = schedule?.start_time ? String(schedule.start_time).slice(0, 5) : "—"
                        const end = schedule?.end_time ? String(schedule.end_time).slice(0, 5) : "—"
                        const shift = shiftLabel(String(schedule.shift_type ?? ""), lang)
                        return (
                          <TableRow
                            key={schedule.id ?? idx}
                            className="border-slate-800/70 hover:bg-red-800/40"
                          >
                            <TableCell className={`text-white ${align}`} dir="auto">
                              {formatDayLabel(schedule.date)}
                            </TableCell>
                            <TableCell className={`${align}`}>
                              <Badge
                                variant={isWorking ? "default" : "secondary"}
                                className={`px-2 ${isWorking ? "bg-orange-600 text-white" : "bg-red-600"}`}
                              >
                                <span dir="auto">{shift}</span>
                              </Badge>
                            </TableCell>
                            <TableCell className={`text-slate-200 ${align}`}>{start}</TableCell>
                            <TableCell className={`text-slate-200 ${align}`}>{end}</TableCell>
                            <TableCell className={`${align}`}>
                              <div
                                className={`inline-flex items-center gap-2 px-2 py-1 rounded-lg ${isWorking ? "bg-emerald-950/40" : "bg-red-800/40"
                                  }`}
                              >
                                <Clock
                                  className={`size-4 ${isWorking ? "text-emerald-400" : "text-slate-300"}`}
                                />
                                <span
                                  className={isWorking ? "text-emerald-200" : "text-slate-200"}
                                  dir="auto"
                                >
                                  {isWorking ? t.worked : t.off}
                                </span>
                              </div>

                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Mobile: card list */}
            <div className="md:hidden space-y-3">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={`m-skel-${i}`} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                    <div className="h-5 w-2/3 animate-pulse rounded bg-slate-700/50 mb-3" />
                    <div className="grid grid-cols-2 gap-3">
                      <div className="h-4 w-full animate-pulse rounded bg-slate-700/40" />
                      <div className="h-4 w-full animate-pulse rounded bg-slate-700/40" />
                      <div className="h-4 w-full animate-pulse rounded bg-slate-700/40" />
                      <div className="h-4 w-full animate-pulse rounded bg-slate-700/40" />
                    </div>
                  </div>
                ))
                : (sortedSchedules.length === 0 ? (
                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-center text-slate-400" dir="auto">
                    {t.noSessions}
                  </div>
                ) : (
                  sortedSchedules.map((schedule: any, idx: number) => {
                    const isWorking = !!schedule.is_working
                    const start = schedule?.start_time ? String(schedule.start_time).slice(0, 5) : "—"
                    const end = schedule?.end_time ? String(schedule.end_time).slice(0, 5) : "—"
                    const shift = shiftLabel(String(schedule.shift_type ?? ""), lang)
                    return (
                      <div
                        key={schedule.id ?? idx}
                        className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <p className="font-medium text-white" dir="auto">
                            {formatDayLabel(schedule.date)}
                          </p>
                          <Badge
                            variant={isWorking ? "default" : "secondary"}
                            className={`px-2 ${isWorking ? "bg-blue-600 text-white" : ""}`}
                          >
                            <span dir="auto">{shift}</span>
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-slate-400" dir="auto">{t.thStart}</div>
                          <div className="text-slate-200 text-right">{start}</div>
                          <div className="text-slate-400" dir="auto">{t.thEnd}</div>
                          <div className="text-slate-200 text-right">{end}</div>
                          <div className="text-slate-400" dir="auto">{t.thStatus}</div>
                          <div className="text-slate-200 text-right flex items-center justify-end gap-2">
                            <Clock className={`size-4 ${isWorking ? "text-emerald-400" : "text-slate-400"}`} />
                            <span className={isWorking ? "text-emerald-300" : "text-slate-400"} dir="auto">
                              {isWorking ? t.worked : t.off}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
