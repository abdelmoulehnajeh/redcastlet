"use client"

import { useEffect, useMemo, useState } from "react"
import { useQuery, useMutation } from "@apollo/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin, CalendarIcon, Play, Square, AlertCircle, Timer } from "lucide-react"
import { GET_TIME_ENTRIES, CLOCK_IN_MUTATION, CLOCK_OUT_MUTATION } from "@/lib/graphql-queries"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { useLang, getISODateInTZ, TN_TIMEZONE } from "@/lib/i18n"

type TimeEntry = {
  id: string
  status?: string | null
  clock_in?: string | null
  clock_out?: string | null
  total_hours?: number | null
}

function isFiniteNumber(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n)
}

/**
 * Parse a DB timestamp safely as LOCAL time, avoiding timezone surprises.
 * Supports:
 * - ISO strings with/without timezone
 * - "YYYY-MM-DD HH:mm:ss" (space separated)
 * - Unix seconds / milliseconds
 * - Date object
 */
function parseDbDateLocal(input: string | number | Date | null | undefined): Date | null {
  if (!input) return null
  if (input instanceof Date) {
    return isNaN(input.getTime()) ? null : new Date(input.getTime())
  }
  if (typeof input === "number") {
    // If seconds, convert to ms
    const ms = input < 1e12 ? input * 1000 : input
    const d = new Date(ms)
    return isNaN(d.getTime()) ? null : d
  }
  if (typeof input === "string") {
    const raw = input.trim()
    // pure digits -> unix seconds or ms
    if (/^\d+$/.test(raw)) {
      const num = Number(raw)
      return parseDbDateLocal(num)
    }

    // Normalize space to 'T'
    const s = raw.replace(" ", "T")

    // If string includes timezone (Z or +hh:mm or -hh:mm), rely on Date to parse
    if (/[zZ]|[+-]\d{2}:?\d{2}$/.test(s)) {
      const d = new Date(s)
      return isNaN(d.getTime()) ? null : d
    }

    // If no timezone, parse as LOCAL explicitly to avoid browser differences
    // Expected formats like: YYYY-MM-DDTHH:mm:ss(.sss)?
    const [datePart, timePart = "00:00:00"] = s.split("T")
    const [y, m, d] = datePart.split("-").map((v) => Number(v))
    if (!isFiniteNumber(y) || !isFiniteNumber(m) || !isFiniteNumber(d)) return null

    const [hhStr = "0", mmStr = "0", ssStr = "0"] = timePart.split(":")
    const hh = Number(hhStr)
    const mm = Number(mmStr)
    // Handle seconds with fractional part
    const ssFloat = Number(ssStr)
    const ss = Math.floor(isNaN(ssFloat) ? 0 : ssFloat)
    const ms = Math.round((isNaN(ssFloat) ? 0 : ssFloat - ss) * 1000)

    const local = new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, ss || 0, ms || 0)
    return isNaN(local.getTime()) ? null : local
  }
  return null
}

function formatHMS(diffMs: number): string {
  if (!Number.isFinite(diffMs) || diffMs < 0) diffMs = 0
  const hours = Math.floor(diffMs / 3_600_000)
  const minutes = Math.floor((diffMs % 3_600_000) / 60_000)
  const seconds = Math.floor((diffMs % 60_000) / 1000)
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`
}

export default function PointeusePage() {
  const { t, formatDate, formatTime } = useLang()
  const { user } = useAuth()
  const { toast } = useToast()

  const [now, setNow] = useState<Date>(new Date())
  const [isClocked, setIsClocked] = useState(false)
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null)
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null)

  // IMPORTANT: Keep "no +1h offset" — we parse as LOCAL with parseDbDateLocal().

  // Fetch today's entries in TN timezone window
  const todayLocal = getISODateInTZ(new Date(), TN_TIMEZONE)
  const { data: timeEntriesData, refetch } = useQuery(GET_TIME_ENTRIES, {
    variables: {
      employeeId: user?.employee_id,
      startDate: todayLocal,
      endDate: todayLocal,
    },
    skip: !user?.employee_id,
    fetchPolicy: "cache-and-network",
  })
  const [clockIn] = useMutation(CLOCK_IN_MUTATION)
  const [clockOut] = useMutation(CLOCK_OUT_MUTATION)

  const todayEntries: TimeEntry[] = timeEntriesData?.timeEntries ?? []

  // Consider an entry active if status is "active" (any case) OR no clock_out yet.
  const activeEntry = useMemo(() => {
    return (
      todayEntries.find((e) => {
        const status = (e.status ?? "").toString().toLowerCase()
        const byStatus = status === "active" || status === "en_cours" || status === "in_progress"
        const byNullOut = !e.clock_out && !!e.clock_in
        return byStatus || byNullOut
      }) ?? null
    )
  }, [todayEntries])

  // Tick every second for live working time
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Sync active entry
  useEffect(() => {
    if (activeEntry) {
      setIsClocked(true)
      setCurrentEntry(activeEntry)
    } else {
      setIsClocked(false)
      setCurrentEntry(null)
    }
  }, [activeEntry])

  // Geolocation (best-effort)
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude })
      },
      () => {
        // silent
      },
    )
  }, [])

  const handleClockIn = async () => {
    try {
      const result = await clockIn({
        variables: {
          employeeId: user?.employee_id,
          locationId: user?.location_id ?? null,
        },
      })
      setIsClocked(true)
      setCurrentEntry(result.data?.clockIn ?? null)
      toast({
        title: t("check_in", "Pointage d’arrivée"),
        description: t("toast_checkin_success", "Vous avez pointé votre arrivée avec succès"),
      })
      refetch()
    } catch (error) {
      toast({
        title: t("toast_error", "Erreur"),
        description: t("toast_checkin_error", "Erreur lors du pointage d'arrivée"),
        variant: "destructive",
      })
    }
  }

  const handleClockOut = async () => {
    if (!currentEntry) return
    try {
      await clockOut({
        variables: { timeEntryId: currentEntry.id },
      })
      setIsClocked(false)
      setCurrentEntry(null)
      toast({
        title: t("check_out", "Pointage de départ"),
        description: t("toast_checkout_success", "Vous avez pointé votre départ avec succès"),
      })
      refetch()
    } catch (error) {
      toast({
        title: t("toast_error", "Erreur"),
        description: t("toast_checkout_error", "Erreur lors du pointage de départ"),
        variant: "destructive",
      })
    }
  }

  const formatClock = (date: Date) =>
    formatTime(date, { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })
  const formatDay = (date: Date) =>
    formatDate(date, { weekday: "long", year: "numeric", month: "long", day: "numeric" })

  const calculateWorkingTime = () => {
    const start = parseDbDateLocal(currentEntry?.clock_in ?? null)
    if (!start) return "00:00:00"
    const diff = now.getTime() - start.getTime()
    return formatHMS(diff)
  }

  const getTotalHoursToday = () => {
    return todayEntries.reduce((total: number, entry: TimeEntry) => {
      const v = entry.total_hours
      return total + (isFiniteNumber(v as number) ? (v as number) : 0)
    }, 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold" dir="auto">
          {t("punch_title", "Pointeuse")}
        </h1>
        <p className="text-muted-foreground" dir="auto">
          {t("punch_subtitle", "Gérez vos heures de travail")}
        </p>
      </div>

      {/* Current Time */}
      <div className="glass-card rounded-3xl shadow-2xl border-0 text-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900/80 backdrop-blur-futuristic">
        <div className="p-8 space-y-4">
          <div className="text-4xl sm:text-6xl font-mono font-bold text-red-600 drop-shadow-lg">{formatClock(now)}</div>
          <div className="text-lg text-slate-300 font-medium" dir="auto">
            {formatDay(now)}
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="glass-card rounded-3xl shadow-2xl border border-white/10 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900/80 backdrop-blur-futuristic">
        <div className="px-8 pt-8 pb-4">
          <div className="flex items-center gap-2 mb-4">
            <Timer className="w-5 h-5 text-blue-400" />
            <span className="text-lg font-semibold text-slate-200" dir="auto">
              {t("current_status", "Statut Actuel")}
            </span>
          </div>

          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isClocked ? "bg-green-500" : "bg-gray-400"}`} />
              <span className="font-medium text-slate-300" dir="auto">
                {isClocked ? t("on_duty", "En service") : t("off_duty", "Hors service")}
              </span>
            </div>
            <Badge
              variant="outline"
              className={
                isClocked
                  ? "bg-emerald-500/15 text-emerald-300 border-emerald-400/30 backdrop-blur px-3 py-1 rounded-full"
                  : "bg-slate-500/20 text-slate-300 border-slate-300/30 backdrop-blur px-3 py-1 rounded-full"
              }
              dir="auto"
            >
              {isClocked ? t("active", "Actif") : t("inactive", "Inactif")}
            </Badge>
          </div>

          {/* Arrivée and working time */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground" dir="auto">
                {t("arrived_at", "Arrivée")}:
              </span>
              <span className="font-medium">
                {(() => {
                  const start = parseDbDateLocal(currentEntry?.clock_in ?? null)
                  return start ? formatTime(start, { hour: "2-digit", minute: "2-digit", hour12: false }) : "—"
                })()}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground" dir="auto">
                {t("working_time", "Temps de travail")}:
              </span>
              <span className="font-mono font-bold text-red-600">
                {isClocked && currentEntry ? calculateWorkingTime() : "00:00:00"}
              </span>
            </div>
          </div>

          {location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2" dir="auto">
              <MapPin className="w-4 h-4" />
              <span>
                {t("position", "Position")}: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Button
          onClick={handleClockIn}
          disabled={isClocked}
          size="lg"
          className="h-16 bg-green-600 hover:bg-green-700 disabled:opacity-50"
        >
          <Play className="w-6 h-6 mr-2" />
          <span dir="auto">{t("punch_in_btn", "Pointer l'arrivée")}</span>
        </Button>
        <Button
          onClick={handleClockOut}
          disabled={!isClocked}
          size="lg"
          variant="destructive"
          className="h-16 disabled:opacity-50"
        >
          <Square className="w-6 h-6 mr-2" />
          <span dir="auto">{t("punch_out_btn", "Pointer le départ")}</span>
        </Button>
      </div>

      {/* Today summary */}
      <div className="glass-card rounded-3xl shadow-2xl border border-white/10 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900/80 backdrop-blur-futuristic">
        <div className="px-8 pt-8 pb-4">
          <div className="flex items-center gap-2 mb-4">
            <CalendarIcon className="w-5 h-5 text-blue-400" />
            <span className="text-lg font-semibold text-slate-200" dir="auto">
              {t("today_summary", "Résumé du jour")}
            </span>
          </div>
          <div className="text-slate-400 mb-4" dir="auto">
            {formatDay(new Date())}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-xl bg-white/5">
              <div className="text-2xl font-bold text-blue-400">{getTotalHoursToday().toFixed(1)}h</div>
              <div className="text-sm text-slate-300" dir="auto">
                {t("worked_hours", "Heures travaillées")}
              </div>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/5">
              <div className="text-2xl font-bold text-green-400">
                {todayEntries.filter((e) => (e.status ?? "").toString().toLowerCase() === "completed").length}
              </div>
              <div className="text-sm text-slate-300" dir="auto">
                {t("sessions_done", "Sessions terminées")}
              </div>
            </div>
            <div className="text-center p-4 rounded-xl bg-white/5">
              <div className="text-2xl font-bold text-orange-400">{isClocked ? "1" : "0"}</div>
              <div className="text-sm text-slate-300" dir="auto">
                {t("active_session", "Session active")}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Today entries */}
      {todayEntries.length > 0 && (
        <div className="glass-card rounded-3xl shadow-2xl border border-white/10 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900/80 backdrop-blur-futuristic">
          <div className="px-8 pt-8 pb-4">
            <div className="text-lg font-semibold text-slate-200 mb-4" dir="auto">
              {t("today_history", "Historique du jour")}
            </div>
            <div className="space-y-3">
              {todayEntries.map((entry) => {
                const start = parseDbDateLocal(entry.clock_in ?? null)
                const end = parseDbDateLocal(entry.clock_out ?? null)
                const startStr = start ? formatTime(start, { hour: "2-digit", minute: "2-digit", hour12: false }) : "—"
                const endStr = end ? formatTime(end, { hour: "2-digit", minute: "2-digit", hour12: false }) : null

                const status = (entry.status ?? "").toString().toLowerCase()
                const isActive =
                  status === "active" || status === "en_cours" || status === "in_progress" || (!end && start)
                const isCompleted = status === "completed" || (!!start && !!end)

                return (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isActive ? "bg-green-500" : isCompleted ? "bg-blue-500" : "bg-gray-400"
                        }`}
                      />
                      <div>
                        <div className="font-medium text-slate-200">
                          {endStr ? `${startStr} - ${endStr}` : startStr}
                        </div>
                        <div className="text-sm text-slate-400" dir="auto">
                          {isActive
                            ? t("in_progress", "En cours")
                            : isCompleted
                              ? t("done", "Terminé")
                              : t("unknown_status", "Statut inconnu")}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-slate-200">
                        {isFiniteNumber(entry.total_hours)
                          ? `${(entry.total_hours as number).toFixed(1)}h`
                          : isActive && start
                            ? (() => {
                                const live = now.getTime() - start.getTime()
                                return live > 0 ? `${(live / 3_600_000).toFixed(1)}h` : "0.0h"
                              })()
                            : "-"}
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          isActive
                            ? "bg-emerald-500/15 text-emerald-300 border-emerald-400/30 backdrop-blur px-2.5 py-1 rounded-full"
                            : isCompleted
                              ? "bg-blue-500/15 text-blue-300 border-blue-400/30 backdrop-blur px-2.5 py-1 rounded-full"
                              : "bg-slate-500/20 text-slate-300 border-slate-300/30 backdrop-blur px-2.5 py-1 rounded-full"
                        }
                        dir="auto"
                      >
                        {isActive ? t("active", "Actif") : isCompleted ? t("done", "Terminé") : (entry.status ?? "-")}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Location warning */}
      {!location && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription dir="auto">
            {t(
              "geo_warning",
              "La géolocalisation n'est pas disponible. Certaines fonctionnalités peuvent être limitées.",
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
