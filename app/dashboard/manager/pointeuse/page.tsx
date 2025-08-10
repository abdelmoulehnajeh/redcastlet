"use client"

import { useMemo, useState } from "react"
import { useQuery, useMutation } from "@apollo/client"
import { Clock, Users, Search, Filter, Play, Square, Calendar, TrendingUp } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { GET_EMPLOYEES, GET_WORK_SCHEDULES, CREATE_WORK_SCHEDULE } from "@/lib/graphql-queries"
import { useLang, type Lang } from "@/lib/i18n"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

/* i18n */

type Dict = {
  headerTitle: string
  headerSubtitle: string

  statTeam: string
  statTeamDesc: string
  statOnDuty: string
  statOnDutyDesc: string
  statPlanned: string
  statPlannedDesc: string
  statHours: string
  statHoursDesc: string

  searchPlaceholder: string
  filterAll: string
  filterActive: string
  filterInactive: string

  sectionTitle: string
  sectionSubtitle: (d: string) => string

  onDuty: string
  offDuty: string
  start: string
  stop: string
  history: string
  role: string
  shift: string
  uniforms: string
  startTime: string
  endTime: string

  emptyTitle: string
  emptyDescFiltered: string
  emptyDescAll: string

  toastStart: string
  toastStop: string
  toastError: string

  morning: string
  evening: string
  double: string
}

const translations: Record<Lang, Dict> = {
  fr: {
    headerTitle: "Pointeuse Équipe",
    headerSubtitle: "Gérez les temps de travail de votre équipe",

    statTeam: "Équipe Totale",
    statTeamDesc: "Employés",
    statOnDuty: "En Service",
    statOnDutyDesc: "Actuellement",
    statPlanned: "Planifiés",
    statPlannedDesc: "Aujourd'hui",
    statHours: "Heures Total",
    statHoursDesc: "Estimées",

    searchPlaceholder: "Rechercher un employé...",
    filterAll: "Tous",
    filterActive: "Actifs",
    filterInactive: "Inactifs",

    sectionTitle: "Gestion Temps Équipe",
    sectionSubtitle: (d) => `Gérez les heures de travail pour le ${d}`,

    onDuty: "En Service",
    offDuty: "Hors Service",
    start: "Commencer",
    stop: "Terminer",
    history: "Historique",
    role: "Poste",
    shift: "Service",
    uniforms: "Tenues",
    startTime: "Début",
    endTime: "Fin",

    emptyTitle: "Aucun employé trouvé",
    emptyDescFiltered: "Aucun employé ne correspond à vos critères.",
    emptyDescAll: "Aucun employé disponible.",

    toastStart: "Travail commencé",
    toastStop: "Travail terminé",
    toastError: "Erreur lors de l'action",

    morning: "Matin",
    evening: "Soirée",
    double: "Doublage",
  },
  ar: {
    headerTitle: "نظام حضور الفريق",
    headerSubtitle: "إدارة أوقات عمل فريقك",

    statTeam: "إجمالي الفريق",
    statTeamDesc: "موظفون",
    statOnDuty: "على رأس العمل",
    statOnDutyDesc: "حاليًا",
    statPlanned: "مخططون",
    statPlannedDesc: "اليوم",
    statHours: "إجمالي الساعات",
    statHoursDesc: "تقديري",

    searchPlaceholder: "ابحث عن موظف...",
    filterAll: "الكل",
    filterActive: "نشطون",
    filterInactive: "غير نشطين",

    sectionTitle: "إدارة وقت الفريق",
    sectionSubtitle: (d) => `إدارة ساعات العمل لـ ${d}`,

    onDuty: "على رأس العمل",
    offDuty: "خارج العمل",
    start: "بدء",
    stop: "إنهاء",
    history: "السجل",
    role: "المنصب",
    shift: "الوردية",
    uniforms: "الأزياء",
    startTime: "البدء",
    endTime: "النهاية",

    emptyTitle: "لا يوجد موظفون",
    emptyDescFiltered: "لا يوجد موظفون يطابقون معاييرك.",
    emptyDescAll: "لا يوجد موظفون متاحون.",

    toastStart: "تم بدء العمل",
    toastStop: "تم إنهاء العمل",
    toastError: "حدث خطأ أثناء الإجراء",

    morning: "صباحي",
    evening: "مسائي",
    double: "مزدوج",
  },
}

/* Types */

type Employee = {
  id: string
  nom: string
  prenom: string
  job_title: string
  status: string
  tenu_de_travail?: number
}

type Schedule = {
  id: string
  employee_id: string
  date: string
  start_time?: string | null
  end_time?: string | null
  shift_type?: string | null
  is_working?: boolean | null
}

/* Utils */

function fmtTime(value?: string | null) {
  if (!value) return "—"
  return String(value).slice(0, 5)
}

export default function ManagerPointeusePage() {
  const { lang, formatDate } = useLang()
  const t = translations[lang]

  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])

  const { data: employeesData, loading: loadingEmployees } = useQuery(GET_EMPLOYEES)
  const { data: schedulesData, loading: loadingSchedules, refetch } = useQuery(GET_WORK_SCHEDULES, {
    variables: { date: selectedDate },
  })
  const [createSchedule, { loading: mutating }] = useMutation(CREATE_WORK_SCHEDULE)

  const employees: Employee[] = Array.isArray(employeesData?.employees) ? employeesData.employees : []
  const schedules: Schedule[] = Array.isArray(schedulesData?.workSchedules) ? schedulesData.workSchedules : []

  const filteredEmployees = useMemo(() => {
    const s = searchTerm.trim().toLowerCase()
    return employees.filter((emp) => {
      const matchesSearch =
        !s ||
        emp.nom.toLowerCase().includes(s) ||
        emp.prenom.toLowerCase().includes(s) ||
        (emp.job_title || "").toLowerCase().includes(s)
      const matchesStatus = filterStatus === "all" || emp.status === filterStatus
      return matchesSearch && matchesStatus
    })
  }, [employees, searchTerm, filterStatus])

  function getScheduleFor(empId: string) {
    return schedules.find((sc) => sc.employee_id === empId && sc.date === selectedDate)
  }

  function isOnDuty(empId: string) {
    const sc = getScheduleFor(empId)
    return Boolean(sc?.is_working && sc?.start_time && !sc?.end_time)
  }

  const activeEmployees = filteredEmployees.filter((emp) => schedules.some((s) => s.employee_id === emp.id && s.is_working)).length
  const totalHoursEstimate = schedules.length * 8

  async function handleTimeAction(employeeId: string, action: "start" | "end") {
    const now = new Date()
    const timeString = now.toTimeString().split(" ")[0]
    try {
      if (action === "start") {
        await createSchedule({
          variables: {
            employee_id: employeeId,
            date: selectedDate,
            start_time: timeString,
            shift_type: "morning",
            job_position: "employee",
            is_working: true,
          },
        })
        toast.success(t.toastStart)
      } else {
        await createSchedule({
          variables: {
            employee_id: employeeId,
            date: selectedDate,
            end_time: timeString,
            shift_type: "morning",
            job_position: "employee",
            is_working: false,
          },
        })
        toast.success(t.toastStop)
      }
      refetch()
    } catch (err) {
      console.error("Error with time action:", err)
      toast.error(t.toastError)
    }
  }

  function shiftLabel(v?: string | null) {
    const s = String(v || "").toLowerCase()
    if (s.includes("doubl")) return t.double
    if (s.includes("soir") || s.includes("even")) return t.evening
    return t.morning
  }

  const selectedDateHuman = useMemo(() => {
    const d = new Date(selectedDate)
    return formatDate(d, { year: "numeric", month: "long", day: "numeric" })
  }, [selectedDate, formatDate])

  return (
    <div className="min-h-screen relative overflow-hidden animate-fade-in">
      {/* Floating particles background (keep original look) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-blue-900/60 to-slate-900/80 backdrop-blur-[6px]" />
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-blue-400 to-green-400 rounded-full opacity-30 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${6 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-3 sm:p-4 lg:p-6 relative z-20 max-w-screen-xl mx-auto">
        {/* Header (exact style preserved) */}
        <div className="glass-card backdrop-blur-futuristic p-4 sm:p-6 lg:p-8 text-white shadow-2xl relative overflow-hidden border border-white/10">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 via-green-900/40 to-blue-900/30 opacity-70 rounded-2xl" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-[shimmer_3s_ease-in-out_infinite] rounded-2xl" />
          <div className="flex items-center space-x-4 relative z-10">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-700/40 to-green-700/40 rounded-xl flex items-center justify-center border border-white/10">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl md:text-3xl font-bold mb-1 bg-gradient-to-r from-white via-blue-200 to-green-200 bg-clip-text text-transparent" dir="auto">
                {t.headerTitle}
              </h1>
              <p className="text-slate-200 text-sm md:text-base" dir="auto">
                {t.headerSubtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Stats (kept) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {[
            { title: t.statTeam, value: filteredEmployees.length.toString(), description: t.statTeamDesc, icon: Users, color: "text-primary" },
            { title: t.statOnDuty, value: activeEmployees.toString(), description: t.statOnDutyDesc, icon: TrendingUp, color: "text-green-400" },
            { title: t.statPlanned, value: schedules.length.toString(), description: t.statPlannedDesc, icon: Calendar, color: "text-blue-400" },
            { title: t.statHours, value: `${totalHoursEstimate}h`, description: t.statHoursDesc, icon: Clock, color: "text-cyan-400" },
          ].map((stat, index) => (
            <Card
              key={index}
              className="glass-card backdrop-blur-futuristic border border-white/10 shadow-2xl bg-gradient-to-br from-slate-900/70 via-blue-900/60 to-slate-900/70"
            >
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between space-x-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs sm:text-sm font-medium text-blue-200 leading-tight" dir="auto">
                      {stat.title}
                    </div>
                    <div className="text-xs text-green-200 mt-1 leading-tight hidden sm:block" dir="auto">
                      {stat.description}
                    </div>
                  </div>
                  <stat.icon className={cn("w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 flex-shrink-0", stat.color)} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Date and Filters (kept) */}
        <Card className="glass-card backdrop-blur-futuristic border border-white/10 shadow-2xl bg-gradient-to-br from-slate-900/70 via-blue-900/60 to-slate-900/70">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-200 w-4 h-4" />
                  <Input
                    placeholder={t.searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 text-sm h-10 sm:h-12 glass-card bg-gradient-to-br from-blue-900/40 to-green-900/40 border border-white/10 text-white placeholder:text-blue-200"
                  />
                </div>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Filter className="w-4 h-4 text-blue-200 flex-shrink-0" />
                  <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
                    <SelectTrigger className="w-full sm:w-[140px] text-sm h-10 sm:h-12 glass-card bg-gradient-to-br from-blue-900/40 to-green-900/40 border border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-card bg-gradient-to-br from-blue-900/80 to-green-900/80 border border-white/10 text-white">
                      <SelectItem value="all" className="text-sm">
                        {t.filterAll}
                      </SelectItem>
                      <SelectItem value="active" className="text-sm">
                        {t.filterActive}
                      </SelectItem>
                      <SelectItem value="inactive" className="text-sm">
                        {t.filterInactive}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Calendar className="w-4 h-4 text-blue-200 flex-shrink-0" />
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="text-sm h-10 sm:h-12 w-full sm:w-auto glass-card bg-gradient-to-br from-blue-900/40 to-green-900/40 border border-white/10 text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employee Time Tracking (kept) */}
        <Card className="glass-card backdrop-blur-futuristic border border-white/10 shadow-2xl bg-gradient-to-br from-slate-900/70 via-blue-900/60 to-slate-900/70">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center text-base sm:text-lg text-white">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              {t.sectionTitle}
            </CardTitle>
            <CardDescription className="text-sm text-blue-200" dir="auto">
              {t.sectionSubtitle(
                formatDate(new Date(selectedDate), { year: "numeric", month: "long", day: "numeric" })
              )}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 pt-0">
            {loadingEmployees || loadingSchedules ? (
              <div className="space-y-3 sm:space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="border border-white/10 rounded-xl p-4 sm:p-6 glass-card bg-gradient-to-br from-blue-900/40 to-green-900/40"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-800/60" />
                        <div className="space-y-2">
                          <div className="h-4 w-40 bg-slate-700/50 rounded animate-pulse" />
                          <div className="h-3 w-24 bg-slate-700/40 rounded animate-pulse" />
                        </div>
                      </div>
                      <div className="h-10 w-40 bg-slate-800/60 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredEmployees.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {filteredEmployees.map((employee: Employee) => {
                  const schedule = getScheduleFor(employee.id)
                  const working = isOnDuty(employee.id)

                  return (
                    <div
                      key={employee.id}
                      className="border border-white/10 rounded-xl p-4 sm:p-6 glass-card bg-gradient-to-br from-blue-900/40 to-green-900/40 hover:bg-blue-900/60 transition-colors"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-700/40 to-green-700/40 rounded-lg flex items-center justify-center flex-shrink-0 border border-white/10">
                            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                              <h3 className="text-sm sm:text-base font-semibold text-white truncate" dir="auto">
                                {employee.prenom} {employee.nom}
                              </h3>
                              <Badge
                                className={cn(
                                  "text-xs w-fit glass-card border border-white/10",
                                  working ? "bg-green-600/80 text-white" : "bg-blue-900/60 text-blue-200"
                                )}
                                dir="auto"
                              >
                                {working ? t.onDuty : t.offDuty}
                              </Badge>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs sm:text-sm text-blue-200">
                              <span dir="auto">
                                {t.role}: {employee.job_title}
                              </span>
                              {schedule && <span className="hidden sm:inline">•</span>}
                              {schedule && (
                                <span>
                                  {fmtTime(schedule.start_time)} - {fmtTime(schedule.end_time)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:flex-shrink-0">
                          {!working ? (
                            <Button
                              onClick={() => handleTimeAction(employee.id, "start")}
                              disabled={mutating}
                              className="glass-card bg-gradient-to-br from-green-700/40 to-blue-700/40 text-white border border-white/10 text-xs sm:text-sm h-8 sm:h-10 shadow"
                            >
                              <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                              {t.start}
                            </Button>
                          ) : (
                            <Button
                              onClick={() => handleTimeAction(employee.id, "end")}
                              disabled={mutating}
                              className="glass-card bg-gradient-to-br from-blue-700/40 to-green-700/40 text-white border border-white/10 text-xs sm:text-sm h-8 sm:h-10 shadow"
                            >
                              <Square className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                              {t.stop}
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="glass-card bg-gradient-to-br from-blue-900/40 to-green-900/40 border border-white/10 text-white text-xs sm:text-sm h-8 sm:h-10 shadow"
                          >
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            {t.history}
                          </Button>
                        </div>
                      </div>

                      {/* Time Details */}
                      {schedule && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                            <div className="text-center">
                              <div className="text-sm sm:text-base font-bold text-white">{fmtTime(schedule.start_time)}</div>
                              <div className="text-xs text-blue-200" dir="auto">
                                {t.startTime}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm sm:text-base font-bold text-white">{fmtTime(schedule.end_time)}</div>
                              <div className="text-xs text-blue-200" dir="auto">
                                {t.endTime}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm sm:text-base font-bold text-white">{shiftLabel(schedule.shift_type)}</div>
                              <div className="text-xs text-blue-200" dir="auto">
                                {t.shift}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm sm:text-base font-bold text-white">
                                <span className="tabular-nums" dir="ltr">
                                  {employee.tenu_de_travail || 0}
                                </span>
                              </div>
                              <div className="text-xs text-blue-200" dir="auto">
                                {t.uniforms}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <Users className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-blue-200/50 mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2" dir="auto">
                  {t.emptyTitle}
                </h3>
                <p className="text-sm text-blue-200" dir="auto">
                  {searchTerm || filterStatus !== "all" ? t.emptyDescFiltered : t.emptyDescAll}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
