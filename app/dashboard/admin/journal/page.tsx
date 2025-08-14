"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
  Calendar,
  Clock,
  Save,
  User,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  AlertTriangle,
  Bell,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useQuery, useMutation, useLazyQuery } from "@apollo/client"
import {
  GET_EMPLOYEES,
  GET_LOCATIONS,
  GET_WORK_SCHEDULES,
  GET_WORK_SCHEDULES_RANGE,
  CREATE_WORK_SCHEDULE,
  UPDATE_WORK_SCHEDULE,
  NOTIFY_PLANNING_FOR_EMPLOYEE,
} from "@/lib/graphql-queries"

type Lang = "fr" | "ar"

type Dict = {
  pageTitle: string
  pageSubtitle: string
  weeklyTitle: string
  weeklySubtitle: string
  thEmployee: string
  filterByRestaurant: string
  allRestaurants: string
  selectEmployee: string
  chooseEmployee: string
  employeesTitle: string
  employeesSubtitle: string
  editorTitle: (first: string, last: string) => string
  editorSubtitle: string
  weekRoleLabel: string
  selectRole: string
  selectShift: string
  saveSchedule: string
  days: { key: string; label: string }[]
  shifts: { value: "Matin" | "Soirée" | "Doublage" | "Repos"; label: string }[]
  dash: string
  loading: string
  loadErrorTitle: string
  missingDataTitle: string
  missingDataDesc: string
  errTitle: string
  selectEmployeeErr: string
  saveOkTitle: string
  saveOkDesc: string
  saveErrTitle: string
  saveErrDesc: string
  monthlyPlan: string
  monthlyPlanSubtitle: (monthText: string) => string
  legendSimple: string
  legendDouble: string
  legendRest: string
  selectLocation: string
  selectShiftShort: string
  apply: string
  clear: string
  confirmPlan: string
  clearAll: string
  prevMonth: string
  nextMonth: string
  locationAbbrev: string
  notifPlanOk: string
  weeklyPlan: string
}

const translations: Record<Lang, Dict> = {
  fr: {
    pageTitle: "Journal Administrateur",
    pageSubtitle: "Gérez les plannings de vos employés",
    weeklyTitle: "Planning Hebdomadaire",
    weeklySubtitle: "Horaires de travail par employé et par jour",
    thEmployee: "Employé",
    filterByRestaurant: "Filtrer par Restaurant",
    allRestaurants: "Tous les restaurants",
    selectEmployee: "Sélectionner un Employé",
    chooseEmployee: "Choisir un employé",
    employeesTitle: "Employés",
    employeesSubtitle: "Cliquez sur un employé pour modifier son planning",
    editorTitle: (f, l) => `Planning de ${f} ${l}`,
    editorSubtitle: "Définissez les horaires de travail pour la semaine et le poste",
    weekRoleLabel: "Poste pour cette semaine",
    selectRole: "Sélectionner un poste",
    selectShift: "Sélectionner un créneau",
    saveSchedule: "Sauvegarder le Planning",
    days: [
      { key: "monday", label: "Lundi" },
      { key: "tuesday", label: "Mardi" },
      { key: "wednesday", label: "Mercredi" },
      { key: "thursday", label: "Jeudi" },
      { key: "friday", label: "Vendredi" },
      { key: "saturday", label: "Samedi" },
      { key: "sunday", label: "Dimanche" },
    ],
    shifts: [
      { value: "Matin", label: "Matin (09:00 - 18:00)" },
      { value: "Soirée", label: "Soirée (18:00 - 03:00)" },
      { value: "Doublage", label: "Doublage (09:00 - 03:00)" },
      { value: "Repos", label: "Repos" },
    ],
    dash: "-",
    loading: "Chargement des données...",
    loadErrorTitle: "Erreur de chargement des données",
    missingDataTitle: "Erreur: Données manquantes du serveur",
    missingDataDesc: "Vérifiez la connexion à la base de données ou contactez l'administrateur.",
    errTitle: "Erreur",
    selectEmployeeErr: "Veuillez sélectionner un employé",
    saveOkTitle: "Planning sauvegardé",
    saveOkDesc: "Le planning a été mis à jour avec succès",
    saveErrTitle: "Erreur",
    saveErrDesc: "Impossible de sauvegarder le planning",
    monthlyPlan: "Planifier le mois",
    monthlyPlanSubtitle: (m) => `Points: 1 = shift simple, 2 = doublage. Mois affiché: ${m}`,
    legendSimple: "Shift simple",
    legendDouble: "Doublage",
    legendRest: "Repos / Non travaillé",
    selectLocation: "Restaurant",
    selectShiftShort: "Shift",
    apply: "Appliquer",
    clear: "Effacer",
    confirmPlan: "Confirmer le planning",
    clearAll: "Vider le mois",
    prevMonth: "Mois précédent",
    nextMonth: "Mois suivant",
    locationAbbrev: "Rest.",
    notifPlanOk: "Planning du mois envoyé à l'employé",
    weeklyPlan: "Planning Hebdo",
  },
  ar: {
    pageTitle: "دفتر المسؤول",
    pageSubtitle: "إدارة جداول عمل الموظفين",
    weeklyTitle: "الجدول الأسبوعي",
    weeklySubtitle: "ساعات العمل لكل موظف ولكل يوم",
    thEmployee: "الموظف",
    filterByRestaurant: "تصفية حسب المطعم",
    allRestaurants: "جميع المطاعم",
    selectEmployee: "اختيار موظف",
    chooseEmployee: "اختر موظفًا",
    employeesTitle: "الموظفون",
    employeesSubtitle: "انقر على موظف لتعديل جدوله",
    editorTitle: (f, l) => `جدول ${f} ${l}`,
    editorSubtitle: "حدد ساعات العمل للأسبوع والمنصب",
    weekRoleLabel: "المنصب لهذا الأسبوع",
    selectRole: "اختر منصبًا",
    selectShift: "اختر فترة",
    saveSchedule: "حفظ الجدول",
    days: [
      { key: "monday", label: "الإثنين" },
      { key: "tuesday", label: "الثلاثاء" },
      { key: "wednesday", label: "الأربعاء" },
      { key: "thursday", label: "الخميس" },
      { key: "friday", label: "الجمعة" },
      { key: "saturday", label: "السبت" },
      { key: "sunday", label: "الأحد" },
    ],
    shifts: [
      { value: "Matin", label: "صباحي (09:00 - 18:00)" },
      { value: "Soirée", label: "مسائي (18:00 - 03:00)" },
      { value: "Doublage", label: "مزدوج (09:00 - 03:00)" },
      { value: "Repos", label: "راحة" },
    ],
    dash: "-",
    loading: "جارٍ تحميل البيانات...",
    loadErrorTitle: "خطأ في تحميل البيانات",
    missingDataTitle: "خطأ: بيانات مفقودة من الخادم",
    missingDataDesc: "تحقق من الاتصال بقاعدة البيانات أو تواصل مع المسؤول.",
    errTitle: "خطأ",
    selectEmployeeErr: "يرجى اختيار موظف",
    saveOkTitle: "تم حفظ الجدول",
    saveOkDesc: "تم تحديث الجدول بنجاح",
    saveErrTitle: "خطأ",
    saveErrDesc: "تعذر حفظ الجدول",
    monthlyPlan: "تخطيط الشهر",
    monthlyPlanSubtitle: (m) => `النقاط: 1 = فترة واحدة، 2 = مزدوج. الشهر المعروض: ${m}`,
    legendSimple: "فترة واحدة",
    legendDouble: "مزدوج",
    legendRest: "راحة / غير عامل",
    selectLocation: "مطعم",
    selectShiftShort: "الفترة",
    apply: "تطبيق",
    clear: "مسح",
    confirmPlan: "تأكيد التخطيط",
    clearAll: "مسح الشهر",
    prevMonth: "الشهر السابق",
    nextMonth: "الشهر التالي",
    locationAbbrev: "مطعم",
    notifPlanOk: "تم إرسال تخطيط الشهر للموظف",
    weeklyPlan: "الجدول الأسبوعي",
  },
}

function useLang(): Lang {
  const [lang, setLang] = useState<Lang>("fr")
  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = localStorage.getItem("lang")
    if (stored === "ar" || stored === "fr") setLang(stored)
    else {
      localStorage.setItem("lang", "fr")
      setLang("fr")
    }
  }, [])
  useEffect(() => {
    if (typeof document === "undefined") return
    document.documentElement.setAttribute("lang", lang)
    document.documentElement.setAttribute("dir", "ltr")
  }, [lang])
  return lang
}

// ----- Helpers for month calendar -----
function getMonthInfo(date: Date) {
  const year = date.getFullYear()
  const month = date.getMonth() // 0-11
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  // We use Monday as first day of week (1=Mon,...,7=Sun)
  const firstWeekday = (first.getDay() + 6) % 7 // 0..6 with 0=Mon
  const daysInMonth = last.getDate()
  const grid: (Date | null)[] = []
  for (let i = 0; i < firstWeekday; i++) grid.push(null)
  for (let d = 1; d <= daysInMonth; d++) grid.push(new Date(year, month, d))
  return { year, month, first, last, grid, daysInMonth }
}

function ymd(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${dd}`
}

// Normalizes various date inputs into "YYYY-MM-DD"
function normalizeDateKey(input: unknown): string {
  if (input == null) return ""
  if (typeof input === "string") {
    // Already "YYYY-MM-DD"
    if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input
    // Maybe a numeric string (epoch ms or seconds)
    const num = Number(input)
    if (Number.isFinite(num)) {
      const d =
        String(input).length >= 12 // heuristic: ms vs s
          ? new Date(num)
          : new Date(num * 1000)
      return ymd(d)
    }
    // Fallback: parseable date string
    const parsed = Date.parse(input)
    if (!Number.isNaN(parsed)) return ymd(new Date(parsed))
    return input
  }
  if (typeof input === "number" && Number.isFinite(input)) {
    // Assume epoch ms
    const d = new Date(input)
    return ymd(d)
  }
  try {
    const d = new Date(String(input))
    if (!Number.isNaN(d.getTime())) return ymd(d)
  } catch {}
  return ""
}

type DayAssignment = {
  shift: "Matin" | "Soirée" | "Doublage" | "Repos"
  location_id?: string
  job_position?: string
}

function getAbbrev(name: string, max = 3) {
  const parts = name.trim().split(/\s+/)
  const letters = parts.map((p) => p[0]?.toUpperCase()).join("")
  const abbr = letters || name.slice(0, max).toUpperCase()
  return abbr.slice(0, max)
}

// ----- Component -----
export default function AdminJournalPage() {
  const lang = useLang()
  const t = translations[lang]
  const { toast } = useToast()

  const [selectedEmployee, setSelectedEmployee] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("")
  const [schedule, setSchedule] = useState<Record<string, string>>({})
  const [jobPosition, setJobPosition] = useState("")

  // New: monthly planner
  const [plannerOpen, setPlannerOpen] = useState(false)
  const [plannerMonth, setPlannerMonth] = useState<Date>(() => {
    const d = new Date()
    d.setDate(1)
    return d
  })
  const [monthEdits, setMonthEdits] = useState<Record<string, DayAssignment>>({})
  const [editingDay, setEditingDay] = useState<string | null>(null)
  const [plannerLoading, setPlannerLoading] = useState(false)
  const [viewPlansOpen, setViewPlansOpen] = useState(false)
  const [plansLoading, setPlansLoading] = useState(false)
  const [monthlyPlans, setMonthlyPlans] = useState<any[]>([])

  const [currentDayAlerts, setCurrentDayAlerts] = useState<Record<string, boolean>>({})
  const [lastApiCall, setLastApiCall] = useState<number>(0)
  const [cachedSchedules, setCachedSchedules] = useState<any[]>([])

  // GraphQL queries/mutations
  const {
    data: employeesData,
    error: employeesError,
    loading: employeesLoading,
  } = useQuery(GET_EMPLOYEES, {
    fetchPolicy: "cache-first",
    errorPolicy: "all",
    notifyOnNetworkStatusChange: false,
  })
  const {
    data: locationsData,
    error: locationsError,
    loading: locationsLoading,
  } = useQuery(GET_LOCATIONS, {
    fetchPolicy: "cache-first",
    errorPolicy: "all",
  })
  const {
    data: schedulesData,
    error: schedulesError,
    loading: schedulesLoading,
    refetch,
  } = useQuery(GET_WORK_SCHEDULES, {
    fetchPolicy: "cache-and-network",
    pollInterval: 300000, // Poll every 5 minutes instead of constant refetching
    errorPolicy: "all",
  })
  const [getRange, { data: rangeData }] = useLazyQuery(GET_WORK_SCHEDULES_RANGE)
  const [createSchedule] = useMutation(CREATE_WORK_SCHEDULE)
  const [updateSchedule] = useMutation(UPDATE_WORK_SCHEDULE)
  const [notifyPlanning] = useMutation(NOTIFY_PLANNING_FOR_EMPLOYEE)

  const allLocationsList = useMemo(() => {
    return (locationsData?.locations ?? []).map((l: any) => ({
      id: String(l.id),
      name: String(l.name ?? ""),
    }))
  }, [locationsData])

  const top3Locations = useMemo(() => {
    return allLocationsList.slice(0, 3)
  }, [allLocationsList])

  const daysOfWeek = t.days
  const shifts = t.shifts

  const [grid, setGrid] = useState<(Date | null)[]>([])
  const [monthLabel, setMonthLabel] = useState("")

  useEffect(() => {
    const monthInfo = getMonthInfo(plannerMonth)
    setGrid(monthInfo.grid)
    setMonthLabel(
      new Intl.DateTimeFormat(lang === "ar" ? "ar-TN" : "fr-FR", {
        month: "long",
        year: "numeric",
      }).format(plannerMonth),
    )
  }, [plannerMonth, lang])

  // Build employees
  // Memoized employees and locations
  const employees = useMemo(
    () =>
      (employeesData?.employees ?? []).map((emp: any) => ({
        id: emp.id,
        name: `${emp.prenom} ${emp.nom}`,
        position: emp.job_title,
        location: emp.location?.name || "",
        job_title: emp.job_title,
        prenom: emp.prenom,
        nom: emp.nom,
        profile: emp.profile,
        locationObj: emp.location,
      })),
    [employeesData],
  )

  const allJobPositions: string[] = useMemo(
    () => Array.from(new Set(employees.map((emp: any) => emp.job_title).filter(Boolean))),
    [employees],
  )

  const locations = useMemo(
    () => Array.from(new Set(employees.map((emp: any) => emp.location))).filter(Boolean),
    [employees],
  )
  const filteredEmployees = useMemo(
    () =>
      selectedLocation && selectedLocation !== "all"
        ? employees.filter((emp: any) => emp.location === selectedLocation)
        : employees,
    [employees, selectedLocation],
  )

  const selectedEmployeeData = useMemo(
    () => filteredEmployees.find((emp: any) => emp.id === selectedEmployee),
    [filteredEmployees, selectedEmployee],
  )

  // Helper: get the shift for an employee and day from schedulesData
  function getEmployeeSchedule(employeeId: string, dayKey: string) {
    if (!schedulesData?.workSchedules) return null
    const today = new Date()
    const dayIndex = daysOfWeek.findIndex((d) => d.key === dayKey)
    const monday = new Date(today)
    monday.setDate(today.getDate() - today.getDay() + 1)
    const date = new Date(monday)
    date.setDate(monday.getDate() + dayIndex)
    date.setHours(0, 0, 0, 0)
    const sched = schedulesData.workSchedules.find((s: any) => {
      if (s.employee_id !== employeeId) return false
      if (typeof s.date === "string" && s.date.includes("-")) {
        const cmp = new Date(s.date)
        cmp.setHours(0, 0, 0, 0)
        return cmp.getTime() === date.getTime()
      }
      const n = Number(s.date)
      if (Number.isFinite(n)) {
        const schedDate = new Date(n)
        schedDate.setHours(0, 0, 0, 0)
        return schedDate.getTime() === date.getTime()
      }
      return false
    })
    return sched ? { shift: sched.shift_type as string, job: sched.job_position as string } : null
  }

  // ----- Monthly Planner logic -----
  const openPlanner = async () => {
    if (!selectedEmployee) {
      toast({ title: t.errTitle, description: t.selectEmployeeErr, variant: "destructive" })
      return
    }
    try {
      setPlannerLoading(true)
      const { first, last } = getMonthInfo(plannerMonth)
      const start = first.toISOString().slice(0, 10)
      const end = last.toISOString().slice(0, 10)
      const res = await getRange({ variables: { employee_id: selectedEmployee, start, end } })
      const existing = (res.data?.workSchedulesRange ?? []) as any[]
      const prefilled: Record<string, DayAssignment> = {}
      existing.forEach((s: any) => {
        if (s?.date) {
          const key = normalizeDateKey(s.date)
          if (!key) return
          prefilled[key] = {
            shift: (s.shift_type as DayAssignment["shift"]) ?? "Repos",
            location_id: undefined,
            job_position: s.job_position ?? undefined,
          }
        }
      })
      setMonthEdits(prefilled)
      setPlannerOpen(true)
    } finally {
      setPlannerLoading(false)
    }
  }

  const changeMonth = (delta: number) => {
    const d = new Date(plannerMonth)
    d.setMonth(d.getMonth() + delta)
    setPlannerMonth(d)
    setEditingDay(null)
  }

  const applyForDay = (dateStr: string, payload: DayAssignment | null) => {
    setMonthEdits((prev) => {
      const next = { ...prev }
      if (!payload || payload.shift === "Repos") {
        delete next[dateStr] // rest == no point
      } else {
        next[dateStr] = payload
      }
      return next
    })
    setEditingDay(null)
  }

  const clearAllMonth = () => {
    setMonthEdits({})
    setEditingDay(null)
  }

  // Save month plan
  const saveMonth = async () => {
    if (!selectedEmployee) {
      toast({ title: t.errTitle, description: t.selectEmployeeErr, variant: "destructive" })
      return
    }
    try {
      const entries = Object.entries(monthEdits)
      if (entries.length === 0) {
        setPlannerOpen(false)
        return
      }
      // Persist each day
      await Promise.all(
        entries.map(async ([dateKey, assign]) => {
          const normalized = normalizeDateKey(dateKey)
          if (!normalized) return

          let start_time: string | null = null
          let end_time: string | null = null
          let is_working = true
          if (assign.shift === "Matin") {
            start_time = "09:00"
            end_time = "18:00"
          } else if (assign.shift === "Soirée") {
            start_time = "18:00"
            end_time = "03:00"
          } else if (assign.shift === "Doublage") {
            start_time = "09:00"
            end_time = "03:00"
          } else {
            start_time = null
            end_time = null
            is_working = false
          }

          await createSchedule({
            variables: {
              employee_id: selectedEmployee,
              date: normalized,
              start_time,
              end_time,
              shift_type: assign.shift,
              job_position: jobPosition || selectedEmployeeData?.job_title || "",
              is_working,
            },
          })
        }),
      )

      // Notify employee for this month
      const ym = `${plannerMonth.getFullYear()}-${String(plannerMonth.getMonth() + 1).padStart(2, "0")}`
      await notifyPlanning({ variables: { employee_id: selectedEmployee, month: ym } })

      toast({ title: t.saveOkTitle, description: t.notifPlanOk })
      setPlannerOpen(false)
      refetch()
    } catch (e) {
      toast({ title: t.saveErrTitle, description: t.saveErrDesc, variant: "destructive" })
    }
  }

  // Select up to 3 locations for the quick picker
  // const top3Locations = useMemo(() => {
  //   const list: { id: string; name: string }[] = (locationsData?.locations ?? []).map((l: any) => ({
  //     id: String(l.id),
  //     name: l.name as string,
  //   }))
  //   return list.slice(0, 3)
  // }, [locationsData])

  // UI helpers
  const handleScheduleChange = (day: string, shift: string) => {
    setSchedule((prev) => ({ ...prev, [day]: shift }))
  }
  const handleSelectChange = (day: string) => (value: string) => {
    handleScheduleChange(day, value)
  }

  const checkCurrentDayAssignments = useMemo(() => {
    const today = new Date()
    const todayKey = ymd(today)
    const alerts: Record<string, boolean> = {}

    if (employeesData?.employees && schedulesData?.workSchedules) {
      const employees = employeesData.employees
      const schedules = schedulesData.workSchedules

      employees.forEach((employee: any) => {
        const todaySchedule = schedules.find(
          (s: any) => s.employee_id === employee.id && normalizeDateKey(s.date) === todayKey,
        )

        // Check if employee needs restaurant assignment for today
        const needsUpdate =
          !todaySchedule || !todaySchedule.shift_type || todaySchedule.shift_type === "Repos" || !employee.location

        if (needsUpdate) {
          alerts[employee.id] = true
        }
      })
    }

    return alerts
  }, [employeesData, schedulesData])

  useEffect(() => {
    setCurrentDayAlerts(checkCurrentDayAssignments)
  }, [checkCurrentDayAssignments])

  const optimizedRefetch = useMemo(() => {
    return () => {
      const now = Date.now()
      if (now - lastApiCall < 30000) {
        // Prevent API calls more frequent than 30 seconds
        return Promise.resolve()
      }
      setLastApiCall(now)
      return refetch()
    }
  }, [refetch, lastApiCall])

  function getCurrentDayRestaurantStatus(employeeId: string) {
    const today = new Date()
    const todayKey = ymd(today)

    if (!schedulesData?.workSchedules) return { needsUpdate: true, restaurant: null, shift: null }

    const todaySchedule = schedulesData.workSchedules.find(
      (s: any) => s.employee_id === employeeId && normalizeDateKey(s.date) === todayKey,
    )

    const employee = employeesData?.employees?.find((emp: any) => emp.id === employeeId)
    const restaurant = employee?.location?.name

    const needsUpdate =
      !todaySchedule || !todaySchedule.shift_type || todaySchedule.shift_type === "Repos" || !restaurant

    return {
      needsUpdate,
      restaurant,
      shift: todaySchedule?.shift_type,
      restaurantCode: restaurant ? getAbbrev(restaurant, 3) : null,
    }
  }

  // ----- Render -----
  return (
    <div className="min-h-screen relative overflow-hidden" dir="ltr">
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-purple-900/60 to-slate-900/80 backdrop-blur-[6px]" />
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

      <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-3 sm:p-4 lg:p-6 relative z-20 max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="glass-card backdrop-blur-futuristic p-4 sm:p-6 lg:p-8 text-white shadow-2xl animate-fade-in relative overflow-hidden border border-white/10">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 via-purple-900/40 to-blue-900/30 opacity-70 rounded-2xl" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-[shimmer_3s_ease-in-out_infinite] rounded-2xl" />
          <div className="flex items-center space-x-4 relative z-10">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-700/40 to-purple-700/40 rounded-xl flex items-center justify-center border border-white/10">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h1
                className="text-2xl md:text-3xl font-bold mb-1 bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent"
                dir="auto"
              >
                {t.pageTitle}
              </h1>
              <p className="text-slate-200 text-sm md:text-base" dir="auto">
                {t.pageSubtitle}
              </p>
            </div>
            {Object.keys(currentDayAlerts).length > 0 && (
              <div className="flex items-center space-x-2 bg-orange-600/20 border border-orange-500/30 rounded-lg px-3 py-2">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                <div className="text-sm">
                  <div className="text-orange-200 font-medium">{Object.keys(currentDayAlerts).length} employé(s)</div>
                  <div className="text-orange-300 text-xs">Besoin d'assignation restaurant</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {Object.keys(currentDayAlerts).length > 0 && (
          <Card className="glass-card backdrop-blur-futuristic border border-orange-500/30 shadow-2xl bg-gradient-to-br from-orange-900/20 via-red-900/20 to-orange-900/20">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-200">
                <Bell className="w-5 h-5 mr-2" />
                Assignations Restaurant - Aujourd'hui
              </CardTitle>
              <CardDescription className="text-orange-300">
                Les employés suivants ont besoin d'une assignation restaurant pour aujourd'hui
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.keys(currentDayAlerts).map((employeeId) => {
                  const employee = employeesData?.employees?.find((emp: any) => emp.id === employeeId)
                  const status = getCurrentDayRestaurantStatus(employeeId)

                  if (!employee) return null

                  return (
                    <div key={employeeId} className="bg-orange-900/30 border border-orange-500/30 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-orange-100">
                            {employee.prenom} {employee.nom}
                          </div>
                          <div className="text-xs text-orange-300">{employee.job_title}</div>
                          <div className="text-xs text-orange-400 mt-1">
                            {status.restaurant
                              ? `${status.restaurantCode} - ${status.shift || "Pas de shift"}`
                              : "Pas de restaurant"}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="bg-orange-600 hover:bg-orange-700 text-white"
                          onClick={() => {
                            setSelectedEmployee(employeeId)
                            openPlanner()
                          }}
                        >
                          Assigner
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Weekly Schedule Table (kept) */}
        <Card className="glass-card backdrop-blur-futuristic border border-white/10 shadow-2xl bg-gradient-to-br from-slate-900/70 via-purple-900/60 to-slate-900/70">
          <CardHeader>
            <CardTitle dir="auto">{t.weeklyTitle}</CardTitle>
            <CardDescription dir="auto">{t.weeklySubtitle}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-white">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold" dir="auto">
                      {t.thEmployee}
                    </th>
                    {daysOfWeek.map((day) => (
                      <th key={day.key} className="text-center p-3 font-semibold" dir="auto">
                        {day.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee: any) => {
                    const needsCurrentDayUpdate = currentDayAlerts[employee.id]

                    return (
                      <tr
                        key={employee.id}
                        className={`border-b hover:bg-white/5 transition-colors ${needsCurrentDayUpdate ? "bg-orange-900/20 border-orange-500/30" : ""}`}
                      >
                        <td className="p-3">
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="text-xs bg-gradient-to-br from-blue-700/60 to-purple-700/60 text-white">
                                {employee.name
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center space-x-2">
                                <p className="font-medium text-sm truncate" dir="auto">
                                  {employee.name}
                                </p>
                                {needsCurrentDayUpdate && (
                                  <AlertTriangle
                                    className="w-4 h-4 text-orange-400 flex-shrink-0"
                                    title="Besoin d'assignation aujourd'hui"
                                  />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate" dir="auto">
                                {employee.position || t.dash}
                              </p>
                              <div className="mt-2 flex gap-2">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className={`${needsCurrentDayUpdate ? "bg-orange-700/40 hover:bg-orange-700/50 text-orange-100 border border-orange-500/40" : "bg-emerald-700/30 hover:bg-emerald-700/40 text-emerald-100 border border-emerald-500/30"}`}
                                  onClick={() => {
                                    setSelectedEmployee(employee.id)
                                    openPlanner()
                                  }}
                                >
                                  {needsCurrentDayUpdate ? "Assigner Urgent" : t.monthlyPlan}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-slate-300 hover:text-white"
                                  onClick={() => setSelectedEmployee(employee.id)}
                                >
                                  {t.weeklyPlan}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </td>
                        {daysOfWeek.map((day) => {
                          const schedule = getEmployeeSchedule(employee.id, day.key)
                          const isToday =
                            day.key === new Date().toLocaleDateString("en-CA").split("-")[2].toLowerCase().slice(0, 3)
                          const todayNeedsUpdate = isToday && needsCurrentDayUpdate

                          return (
                            <td
                              key={day.key}
                              className={`text-center p-3 ${todayNeedsUpdate ? "bg-orange-900/30 border border-orange-500/30 rounded" : ""}`}
                            >
                              {schedule ? (
                                <div className="space-y-1">
                                  <Badge
                                    variant={schedule.shift === "Repos" ? "outline" : "default"}
                                    className={`text-xs ${
                                      schedule.shift === "Matin"
                                        ? "bg-blue-700/30 text-blue-200"
                                        : schedule.shift === "Soirée"
                                          ? "bg-purple-700/30 text-purple-200"
                                          : schedule.shift === "Doublage"
                                            ? "bg-orange-700/30 text-orange-200"
                                            : "bg-slate-700/30 text-slate-200"
                                    }`}
                                  >
                                    {schedule.shift}
                                  </Badge>
                                  {schedule.job && <div className="text-xs text-muted-foreground">{schedule.job}</div>}
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-xs">{t.dash}</span>
                              )}
                              {isToday && employee.location && (
                                <div className="text-xs text-blue-300 mt-1">{getAbbrev(employee.location.name, 3)}</div>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass-card backdrop-blur-futuristic border border-white/10 shadow-2xl bg-gradient-to-br from-slate-900/70 via-purple-900/60 to-slate-900/70">
            <CardHeader>
              <CardTitle className="flex items-center" dir="auto">
                <MapPin className="w-5 h-5 mr-2" />
                {t.filterByRestaurant}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedLocation || "all"} onValueChange={setSelectedLocation}>
                <SelectTrigger className="glass-card bg-gradient-to-br from-slate-800/80 to-purple-900/80 border border-white/10 text-white">
                  <SelectValue placeholder={t.allRestaurants} />
                </SelectTrigger>
                <SelectContent className="glass-card bg-gradient-to-br from-slate-900/90 to-purple-900/90 border border-white/10 text-white">
                  <SelectItem value="all" className="glass-card bg-transparent text-white">
                    <span dir="auto">{t.allRestaurants}</span>
                  </SelectItem>
                  {locations.map((location: any) => (
                    <SelectItem key={location} value={location} className="glass-card bg-transparent text-white">
                      <span dir="auto">{location}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="glass-card backdrop-blur-futuristic border border-white/10 shadow-2xl bg-gradient-to-br from-slate-900/70 via-purple-900/60 to-slate-900/70">
            <CardHeader>
              <CardTitle className="flex items-center" dir="auto">
                <User className="w-5 h-5 mr-2" />
                {t.selectEmployee}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger className="glass-card bg-gradient-to-br from-slate-800/80 to-purple-900/80 border border-white/10 text-white">
                  <SelectValue placeholder={t.chooseEmployee} />
                </SelectTrigger>
                <SelectContent className="glass-card bg-gradient-to-br from-slate-900/90 to-purple-900/90 border border-white/10 text-white">
                  {filteredEmployees.map((employee: any) => (
                    <SelectItem key={employee.id} value={employee.id} className="glass-card bg-transparent text-white">
                      <div className="flex items-center space-x-2">
                        <span dir="auto">
                          {employee.prenom} {employee.nom}
                        </span>
                        <Badge variant="outline" className="text-xs bg-blue-700/30 text-blue-200 border-0" dir="auto">
                          {employee.job_title || t.dash}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* Quick access to monthly planner */}
              {selectedEmployee && (
                <div className="mt-4 flex gap-2">
                  <Button
                    onClick={openPlanner}
                    className="btn-restaurant bg-emerald-700/40 hover:bg-emerald-700/50 border border-emerald-500/30"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    {t.monthlyPlan}
                  </Button>
            
                </div>
              )}
              {/* View Plans Dialog */}
              <Dialog
                open={viewPlansOpen}
                onOpenChange={async (open) => {
                  setViewPlansOpen(open)
                  if (open && selectedEmployee) {
                    setPlansLoading(true)
                    // Fetch all plans for the last 6 months in a single API call
                    const now = new Date()
                    const startMonth = new Date(now.getFullYear(), now.getMonth() - 5, 1)
                    const endMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
                    const start = startMonth.toISOString().slice(0, 10)
                    const end = endMonth.toISOString().slice(0, 10)
                    try {
                      const res = await getRange({ variables: { employee_id: selectedEmployee, start, end } })
                      const scheds = res.data?.workSchedulesRange ?? []
                      // Group by month
                      const plansByMonth: Record<string, any[]> = {}
                      scheds.forEach((s: any) => {
                        const key = typeof s.date === "string" ? s.date.slice(0, 7) : ""
                        if (!key) return
                        if (!plansByMonth[key]) plansByMonth[key] = []
                        plansByMonth[key].push(s)
                      })
                      // Build monthlyPlans array sorted by most recent month first
                      const months = Object.keys(plansByMonth).sort((a, b) => b.localeCompare(a))
                      const plans = months.map((ym) => {
                        const [year, month] = ym.split("-").map(Number)
                        const monthDate = new Date(year, month - 1, 1)
                        return {
                          ym,
                          label: new Intl.DateTimeFormat(lang === "ar" ? "ar-TN" : "fr-FR", {
                            month: "long",
                            year: "numeric",
                          }).format(monthDate),
                          scheds: plansByMonth[ym],
                        }
                      })
                      setMonthlyPlans(plans)
                    } catch {
                      setMonthlyPlans([])
                    }
                    setPlansLoading(false)
                  }
                }}
              >
                <DialogContent className="max-w-2xl w-full glass-card bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-900/95 border border-white/10 text-white">
                  <DialogHeader>
                    <DialogTitle>Plannings sauvegardés</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-2 min-h-[120px]">
                    {plansLoading ? (
                      <div className="text-center text-slate-400 py-8">Chargement...</div>
                    ) : monthlyPlans.length === 0 ? (
                      <div className="text-center text-slate-400 py-8">Aucun planning trouvé pour cet employé.</div>
                    ) : (
                      monthlyPlans.map((plan) => (
                        <div key={plan.ym} className="flex items-center justify-between bg-slate-800/60 rounded p-2">
                          <div>
                            <span className="font-mono text-slate-200">{plan.label}</span>
                            <span className="ml-2 text-slate-400">({plan.scheds.length} shifts)</span>
                          </div>
                          <Button
                            size="sm"
                            className="bg-indigo-700 hover:bg-indigo-800"
                            onClick={() => {
                              // Load this plan into planner for editing
                              const prefilled: Record<string, DayAssignment> = {}
                              plan.scheds.forEach((s: any) => {
                                if (s?.date) {
                                  const key = normalizeDateKey(s.date)
                                  if (!key) return
                                  prefilled[key] = {
                                    shift: (s.shift_type as DayAssignment["shift"]) ?? "Repos",
                                    location_id: s.location_id ?? undefined,
                                    job_position: s.job_position ?? undefined,
                                  }
                                }
                              })
                              setMonthEdits(prefilled)
                              setPlannerMonth(new Date(plan.ym + "-01"))
                              setViewPlansOpen(false)
                              setPlannerOpen(true)
                            }}
                          >
                            Modifier
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        {/* Schedule Editor (kept) */}
        {selectedEmployeeData && (
          <Card className="glass-card backdrop-blur-futuristic border border-white/10 shadow-2xl bg-gradient-to-br from-slate-900/70 via-purple-900/60 to-slate-900/70">
            <CardHeader>
              <CardTitle className="flex items-center" dir="auto">
                <Clock className="w-5 h-5 mr-2" />
                {t.editorTitle(selectedEmployeeData.prenom, selectedEmployeeData.nom)}
              </CardTitle>
              <CardDescription dir="auto">{t.editorSubtitle}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Job Position Selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-white" dir="auto">
                  {t.weekRoleLabel}
                </label>
                <Select value={jobPosition || selectedEmployeeData.job_title} onValueChange={setJobPosition}>
                  <SelectTrigger className="glass-card bg-gradient-to-br from-slate-800/80 to-purple-900/80 border border-white/10 text-white">
                    <SelectValue placeholder={t.selectRole} />
                  </SelectTrigger>
                  <SelectContent className="glass-card bg-gradient-to-br from-slate-900/90 to-purple-900/90 border border-white/10 text-white">
                    {allJobPositions.map((pos: string) => (
                      <SelectItem key={pos} value={pos} className="glass-card bg-transparent text-white">
                        <span dir="auto">{pos}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Weekly per-day picks */}
              <div className="grid grid-cols-1 gap-4">
                {daysOfWeek.map((day) => (
                  <div
                    key={day.key}
                    className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4 p-4 border border-white/10 rounded-lg glass-card bg-gradient-to-br from-slate-800/70 to-purple-900/70"
                  >
                    <div className="md:w-32">
                      <span className="font-medium text-white" dir="auto">
                        {day.label}
                      </span>
                      <span className="ml-2 text-xs text-blue-200">
                        {(() => {
                          const today = new Date()
                          const dayIndex = daysOfWeek.findIndex((d) => d.key === day.key)
                          const monday = new Date(today)
                          monday.setDate(today.getDate() - today.getDay() + 1)
                          const date = new Date(monday)
                          date.setDate(monday.getDate() + dayIndex)
                          return date.toISOString().split("T")[0]
                        })()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <Select value={schedule[day.key] || ""} onValueChange={handleSelectChange(day.key)}>
                        <SelectTrigger className="glass-card bg-gradient-to-br from-slate-800/80 to-purple-900/80 border border-white/10 text-white">
                          <SelectValue placeholder={t.selectShift} />
                        </SelectTrigger>
                        <SelectContent className="glass-card bg-gradient-to-br from-slate-900/90 to-purple-900/90 border border-white/10 text-white">
                          {shifts.map((shift) => (
                            <SelectItem
                              key={shift.value}
                              value={shift.value}
                              className="glass-card bg-transparent text-white"
                            >
                              <span dir="auto">{shift.label}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {schedule[day.key] && (
                      <Badge
                        variant={schedule[day.key] === "Repos" ? "outline" : "default"}
                        className={`text-xs px-2 py-1 rounded-lg border-0 ${
                          schedule[day.key] === "Matin"
                            ? "bg-blue-700/30 text-blue-200"
                            : schedule[day.key] === "Soirée"
                              ? "bg-purple-700/30 text-purple-200"
                              : schedule[day.key] === "Doublage"
                                ? "bg-orange-700/30 text-orange-200"
                                : "bg-slate-700/30 text-slate-200"
                        }`}
                      >
                        <span dir="auto">{shifts.find((s) => s.value === schedule[day.key])?.label.split(" ")[0]}</span>
                      </Badge>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={async () => {
                    if (!selectedEmployee) {
                      toast({ title: t.errTitle, description: t.selectEmployeeErr, variant: "destructive" })
                      return
                    }
                    try {
                      await Promise.all(
                        t.days.map(async (day) => {
                          const shift = schedule[day.key]
                          if (!shift) return
                          const today = new Date()
                          const dayIndex = t.days.findIndex((d) => d.key === day.key)
                          const monday = new Date(today)
                          monday.setDate(today.getDate() - today.getDay() + 1)
                          const date = new Date(monday)
                          date.setDate(monday.getDate() + dayIndex)
                          const dateString = date.toISOString().split("T")[0]
                          let start_time: string | null = null
                          let end_time: string | null = null
                          if (shift === "Matin") {
                            start_time = "09:00"
                            end_time = "18:00"
                          } else if (shift === "Soirée") {
                            start_time = "18:00"
                            end_time = "03:00"
                          } else if (shift === "Doublage") {
                            start_time = "09:00"
                            end_time = "03:00"
                          } else {
                            start_time = null
                            end_time = null
                          }

                          const job_position =
                            jobPosition ||
                            filteredEmployees.find((e: any) => e.id === selectedEmployee)?.job_title ||
                            ""

                          const existing = schedulesData?.workSchedules?.find(
                            (s: any) => s.date === dateString && s.employee_id === selectedEmployee,
                          )
                          if (existing) {
                            await updateSchedule({
                              variables: {
                                id: existing.id,
                                shift_type: shift,
                                is_working: shift !== "Repos",
                                start_time,
                                end_time,
                                job_position,
                              },
                            })
                          } else {
                            await createSchedule({
                              variables: {
                                employee_id: selectedEmployee,
                                date: dateString,
                                shift_type: shift,
                                job_position,
                                is_working: shift !== "Repos",
                                start_time,
                                end_time,
                              },
                            })
                          }
                        }),
                      )
                      toast({ title: t.saveOkTitle, description: t.saveOkDesc })
                      setSchedule({})
                      refetch()
                    } catch (error) {
                      toast({ title: t.saveErrTitle, description: t.saveErrDesc, variant: "destructive" })
                    }
                  }}
                  className="btn-restaurant"
                >
                  <Save className="w-4 h-4 mr-2" />
                  <span dir="auto">{t.saveSchedule}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Monthly Planner Dialog */}
        <Dialog open={plannerOpen} onOpenChange={setPlannerOpen}>
          <DialogContent className="w-[96vw] sm:w-auto sm:max-w-4xl max-w-[1000px] sm:mx-auto h-auto sm:max-h-[88vh] overflow-y-auto glass-card bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-900/95 border border-white/10 text-white p-0">
            <DialogHeader className="sticky top-0 z-10 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-900/80 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 py-4">
              <DialogTitle>
                {selectedEmployeeData
                  ? `Planning du mois — ${selectedEmployeeData.prenom} ${selectedEmployeeData.nom}`
                  : t.monthlyPlan}
              </DialogTitle>
              <DialogDescription>{t.monthlyPlanSubtitle(monthLabel)}</DialogDescription>
              {selectedEmployee && currentDayAlerts[selectedEmployee] && (
                <div className="flex items-center space-x-2 bg-orange-600/20 border border-orange-500/30 rounded-lg px-3 py-2 mt-2">
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                  <span className="text-sm text-orange-200">
                    Cet employé a besoin d'une assignation restaurant pour aujourd'hui
                  </span>
                </div>
              )}
            </DialogHeader>

            <div className="px-4 sm:px-6 py-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="text-xs text-slate-300">{t.legendSimple}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex flex-col gap-0.5">
                      <span className="block w-2.5 h-2 rounded-full bg-cyan-400" />
                      <span className="block w-2.5 h-2 rounded-full bg-cyan-400" />
                    </span>
                    <span className="text-xs text-slate-300">{t.legendDouble}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-500" />
                    <span className="text-xs text-slate-300">{t.legendRest}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => changeMonth(-1)} aria-label={t.prevMonth}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div className="px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-sm">{monthLabel}</div>
                  <Button variant="ghost" size="icon" onClick={() => changeMonth(1)} aria-label={t.nextMonth}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="w-full overflow-x-auto touch-pan-x">
                <div className="min-w-[420px] sm:min-w-0">
                  <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mt-2 text-[11px] sm:text-xs text-slate-400">
                    <div>Lun</div>
                    <div>Mar</div>
                    <div>Mer</div>
                    <div>Jeu</div>
                    <div>Ven</div>
                    <div>Sam</div>
                    <div>Dim</div>
                  </div>

                  <div className="grid grid-cols-7 gap-1.5 sm:gap-3 mt-2">
                    {grid.map((d, idx) => {
                      if (!d) return <div key={`empty-${idx}`} />
                      const ds = ymd(d)
                      const assign = monthEdits[ds]
                      const shift = assign?.shift
                      const isDouble = shift === "Doublage"
                      const isSimple = shift === "Matin" || shift === "Soirée"

                      const isToday = ds === ymd(new Date())
                      const todayNeedsUpdate = isToday && selectedEmployee && currentDayAlerts[selectedEmployee]

                      return (
                        <Popover key={ds} open={editingDay === ds} onOpenChange={(o) => setEditingDay(o ? ds : null)}>
                          <PopoverTrigger asChild>
                            <button
                              className={`relative rounded-2xl px-2.5 pt-2.5 pb-6 sm:px-3 sm:pt-3 sm:pb-7 text-left transition-colors h-20 sm:h-28 ${
                                todayNeedsUpdate
                                  ? "bg-orange-600/20 hover:bg-orange-600/30 border-2 border-orange-500/50 animate-pulse"
                                  : isToday
                                    ? "bg-blue-600/20 hover:bg-blue-600/30 border-2 border-blue-500/50"
                                    : "bg-white/5 hover:bg-white/10 border border-white/10"
                              }`}
                              onClick={() => setEditingDay(ds)}
                            >
                              <span
                                className={`text-[13px] sm:text-sm font-medium ${
                                  todayNeedsUpdate ? "text-orange-200" : isToday ? "text-blue-200" : "text-slate-200"
                                }`}
                              >
                                {d.getDate()}
                              </span>

                              {isToday && (
                                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-400 rounded-full"></span>
                              )}

                              {todayNeedsUpdate && (
                                <AlertTriangle className="absolute top-1 right-1 w-3 h-3 text-orange-400" />
                              )}

                              {/* Points */}
                              <div className="absolute left-2 bottom-2 flex flex-col items-start gap-0.5">
                                {isDouble ? (
                                  <>
                                    <span className="w-2.5 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                                    <span className="w-2.5 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                                  </>
                                ) : isSimple ? (
                                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                                ) : null}
                              </div>

                              {(() => {
                                // Show location abbreviation for any assignment
                                if (assign?.location_id) {
                                  const ln = allLocationsList.find((l) => l.id === assign.location_id)?.name ?? ""
                                  const ab = ln ? getAbbrev(ln, 3) : ""
                                  return ln ? (
                                    <span
                                      className="absolute right-2 bottom-2 text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800/70 text-slate-100 border border-white/10"
                                      title={ln}
                                      aria-label={`Restaurant ${ln}`}
                                    >
                                      {ab}
                                    </span>
                                  ) : null
                                }

                                // Show "REP" for rest days (Repos)
                                if (assign?.shift_type === "Repos") {
                                  return (
                                    <span
                                      className="absolute right-2 bottom-2 text-[10px] px-1.5 py-0.5 rounded-md bg-slate-700/70 text-slate-300 border border-white/10"
                                      title="Repos"
                                      aria-label="Jour de repos"
                                    >
                                      REP
                                    </span>
                                  )
                                }

                                return null
                              })()}
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[96vw] max-w-[360px] sm:w-80 p-0 bg-gradient-to-br from-slate-900/95 to-slate-900/95 border border-white/10 text-white">
                            <div className="p-3 space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="text-sm text-slate-300">
                                  {new Intl.DateTimeFormat("fr-FR", {
                                    weekday: "long",
                                    day: "2-digit",
                                    month: "long",
                                  }).format(d)}
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setEditingDay(null)}>
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>

                              {/* Quick locations (up to 3) */}
                              <div>
                                <Label className="text-xs text-slate-400">{t.selectLocation}</Label>
                                <RadioGroup
                                  value={assign?.location_id ?? top3Locations[0]?.id ?? ""}
                                  onValueChange={(v) =>
                                    setMonthEdits((prev) => ({
                                      ...prev,
                                      [ds]: { ...(prev[ds] ?? { shift: "Matin" }), location_id: v },
                                    }))
                                  }
                                  className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2"
                                >
                                  {top3Locations.map((loc) => (
                                    <Label
                                      key={loc.id}
                                      htmlFor={`loc-${ds}-${loc.id}`}
                                      className={`cursor-pointer rounded-md px-2 py-1.5 text-xs border ${
                                        (assign?.location_id ?? top3Locations[0]?.id) === loc.id
                                          ? "bg-emerald-700/30 border-emerald-500/40"
                                          : "bg-white/5 border-white/10 hover:bg-white/10"
                                      }`}
                                      title={loc.name}
                                    >
                                      <RadioGroupItem id={`loc-${ds}-${loc.id}`} value={loc.id} className="sr-only" />
                                      {getAbbrev(loc.name, 10)}
                                    </Label>
                                  ))}
                                </RadioGroup>

                                {/* Full list when more than 3 locations */}
                                {allLocationsList.length > 3 && (
                                  <div className="mt-2">
                                    <Select
                                      value={assign?.location_id ?? ""}
                                      onValueChange={(v) =>
                                        setMonthEdits((prev) => ({
                                          ...prev,
                                          [ds]: { ...(prev[ds] ?? { shift: "Matin" }), location_id: v },
                                        }))
                                      }
                                    >
                                      <SelectTrigger className="glass-card bg-white/5 border-white/10 text-white">
                                        <SelectValue placeholder={t.selectLocation} />
                                      </SelectTrigger>
                                      <SelectContent className="glass-card bg-slate-900/95 border-white/10 text-white max-h-56">
                                        {allLocationsList.map((loc) => (
                                          <SelectItem
                                            key={loc.id}
                                            value={loc.id}
                                            className="glass-card bg-transparent text-white"
                                          >
                                            {loc.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                )}
                              </div>

                              {/* Shift picker */}
                              <div>
                                <Label className="text-xs text-slate-400">{t.selectShiftShort}</Label>
                                <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                                  {(["Matin", "Soirée", "Doublage", "Repos"] as const).map((s) => (
                                    <button
                                      key={s}
                                      className={`px-2 py-1.5 rounded-md text-xs border ${
                                        (assign?.shift ?? "Matin") === s
                                          ? s === "Doublage"
                                            ? "bg-cyan-700/30 border-cyan-500/40"
                                            : s === "Repos"
                                              ? "bg-slate-700/40 border-slate-500/40"
                                              : "bg-emerald-700/30 border-emerald-500/40"
                                          : "bg-white/5 border-white/10 hover:bg-white/10"
                                      }`}
                                      onClick={() =>
                                        setMonthEdits((prev) => ({ ...prev, [ds]: { ...(prev[ds] ?? {}), shift: s } }))
                                      }
                                    >
                                      {s}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="flex justify-end gap-2 pt-2">
                                <Button
                                  variant="ghost"
                                  onClick={() => applyForDay(ds, null)}
                                  className="text-slate-200 hover:text-white"
                                >
                                  {t.clear}
                                </Button>
                                <Button
                                  onClick={() =>
                                    applyForDay(ds, {
                                      shift: (monthEdits[ds]?.shift ?? "Matin") as DayAssignment["shift"],
                                      location_id: monthEdits[ds]?.location_id ?? top3Locations[0]?.id,
                                    })
                                  }
                                  className="bg-emerald-700/40 hover:bg-emerald-700/50 border border-emerald-500/30"
                                >
                                  <Check className="w-4 h-4 mr-1.5" />
                                  {t.apply}
                                </Button>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <Button variant="ghost" onClick={clearAllMonth} className="text-slate-300 hover:text-white">
                  {t.clearAll}
                </Button>
                <div className="flex gap-2">
                  <DialogClose asChild>
                    <Button variant="ghost" className="text-slate-300 hover:text-white">
                      Annuler
                    </Button>
                  </DialogClose>
                  <Button onClick={saveMonth} disabled={plannerLoading} className="bg-indigo-700 hover:bg-indigo-800">
                    {t.confirmPlan}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}
