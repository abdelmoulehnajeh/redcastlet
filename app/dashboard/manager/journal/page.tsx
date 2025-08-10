"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Users, Clock, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useQuery, useMutation } from "@apollo/client"
import {
  GET_EMPLOYEES,
  GET_WORK_SCHEDULES,
  CREATE_MANAGER_WORK_SCHEDULE,
  SEND_APPROVAL_REQUEST,
} from "@/lib/graphql-queries"
import { useLang, type Lang } from "@/lib/i18n"

/* i18n */

type Dict = {
  headerTitle: string
  headerSubtitle: string

  weeklyTitle: string
  weeklyDesc: string
  employeeColumn: string

  employeesTitle: string
  employeesDesc: string

  editorTitle: (fullName: string) => string
  editorSubtitle: string
  positionForWeek: string
  selectPosition: string
  selectSlot: string

  dayMonday: string
  dayTuesday: string
  dayWednesday: string
  dayThursday: string
  dayFriday: string
  daySaturday: string
  daySunday: string

  shiftMorningName: string
  shiftEveningName: string
  shiftDoubleName: string
  shiftOffName: string

  shiftMorningLabel: string
  shiftEveningLabel: string
  shiftDoubleLabel: string
  shiftOffLabel: string

  btnPropose: string

  toastMissingEmployeeTitle: string
  toastMissingEmployeeDesc: string

  toastProposedTitle: string
  toastProposedDesc: string

  toastErrorTitle: string
  toastErrorDesc: string

  loadingTitle: string
  loadingSubtitle: string
  errorTitle: string
  errorMissingDataTitle: string
  errorMissingDataDesc: string
}

const translations: Record<Lang, Dict> = {
  fr: {
    headerTitle: "Journal Manager",
    headerSubtitle: "Proposez les plannings de votre équipe à l'administrateur",

    weeklyTitle: "Planning Hebdomadaire",
    weeklyDesc: "Horaires de travail par employé et par jour",
    employeeColumn: "Employé",

    employeesTitle: "Employés",
    employeesDesc: "Cliquez sur un employé pour proposer son planning",

    editorTitle: (fullName) => `Planning de ${fullName}`,
    editorSubtitle: "Définissez les horaires de travail pour la semaine et le poste",
    positionForWeek: "Poste pour cette semaine",
    selectPosition: "Sélectionner un poste",
    selectSlot: "Sélectionner un créneau",

    dayMonday: "Lundi",
    dayTuesday: "Mardi",
    dayWednesday: "Mercredi",
    dayThursday: "Jeudi",
    dayFriday: "Vendredi",
    daySaturday: "Samedi",
    daySunday: "Dimanche",

    shiftMorningName: "Matin",
    shiftEveningName: "Soirée",
    shiftDoubleName: "Doublage",
    shiftOffName: "Repos",

    shiftMorningLabel: "Matin (09:00 - 18:00)",
    shiftEveningLabel: "Soirée (18:00 - 03:00)",
    shiftDoubleLabel: "Doublage (09:00 - 03:00)",
    shiftOffLabel: "Repos",

    btnPropose: "Proposer le Planning",

    toastMissingEmployeeTitle: "Erreur",
    toastMissingEmployeeDesc: "Veuillez sélectionner un employé",

    toastProposedTitle: "Planning envoyé à l'admin pour approbation",
    toastProposedDesc: "Le planning a été proposé avec succès",

    toastErrorTitle: "Erreur",
    toastErrorDesc: "Impossible d'envoyer le planning",

    loadingTitle: "Chargement des données…",
    loadingSubtitle: "Veuillez patienter pendant le chargement",
    errorTitle: "Erreur de chargement des données",
    errorMissingDataTitle: "Erreur: Données manquantes du serveur",
    errorMissingDataDesc: "Vérifiez la connexion à la base de données ou contactez l'administrateur.",
  },
  ar: {
    headerTitle: "دفتر مدير",
    headerSubtitle: "اقترح جداول فريقك على المشرف",

    weeklyTitle: "الجدول الأسبوعي",
    weeklyDesc: "ساعات العمل لكل موظف ولكل يوم",
    employeeColumn: "الموظف",

    employeesTitle: "الموظفون",
    employeesDesc: "انقر على موظف لاقتراح جدوله",

    editorTitle: (fullName) => `جدول ${fullName}`,
    editorSubtitle: "حدد ساعات العمل للأسبوع والمنصب",
    positionForWeek: "المنصب لهذا الأسبوع",
    selectPosition: "اختر المنصب",
    selectSlot: "اختر الفترة",

    dayMonday: "الاثنين",
    dayTuesday: "الثلاثاء",
    dayWednesday: "الأربعاء",
    dayThursday: "الخميس",
    dayFriday: "الجمعة",
    daySaturday: "السبت",
    daySunday: "الأحد",

    shiftMorningName: "صباحي",
    shiftEveningName: "مسائي",
    shiftDoubleName: "مضاعف",
    shiftOffName: "راحة",

    shiftMorningLabel: "صباحي (09:00 - 18:00)",
    shiftEveningLabel: "مسائي (18:00 - 03:00)",
    shiftDoubleLabel: "مضاعف (09:00 - 03:00)",
    shiftOffLabel: "راحة",

    btnPropose: "اقتراح الجدول",

    toastMissingEmployeeTitle: "خطأ",
    toastMissingEmployeeDesc: "يرجى اختيار موظف",

    toastProposedTitle: "تم إرسال الجدول للمشرف",
    toastProposedDesc: "تم اقتراح الجدول بنجاح",

    toastErrorTitle: "خطأ",
    toastErrorDesc: "تعذّر إرسال الجدول",

    loadingTitle: "جارٍ تحميل البيانات…",
    loadingSubtitle: "يرجى الانتظار أثناء التحميل",
    errorTitle: "حدث خطأ أثناء تحميل البيانات",
    errorMissingDataTitle: "خطأ: بيانات مفقودة من الخادم",
    errorMissingDataDesc: "تحقق من الاتصال بقاعدة البيانات أو تواصل مع المشرف.",
  },
}

type DayKey = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"

// Shift values kept as French constants to match backend expectations.
const SHIFT_VALUE_MORNING = "Matin"
const SHIFT_VALUE_EVENING = "Soirée"
const SHIFT_VALUE_DOUBLE = "Doublage"
const SHIFT_VALUE_OFF = "Repos"

export default function ManagerJournalPage() {
  const { lang, formatDate } = useLang()
  const t = translations[lang]
  const align = lang === "ar" ? "text-right" : "text-left"
  const { toast } = useToast()

  // Assume manager's restaurant is known (replace with actual logic if needed)
  const managerRestaurant = "Red Castle lauina"

  const [selectedEmployee, setSelectedEmployee] = useState("")
  const [schedule, setSchedule] = useState<Record<string, string>>({})
  const [jobPosition, setJobPosition] = useState("")

  // Localized days of the current week
  const daysOfWeek = useMemo(
    () =>
      [
        { key: "monday", label: t.dayMonday },
        { key: "tuesday", label: t.dayTuesday },
        { key: "wednesday", label: t.dayWednesday },
        { key: "thursday", label: t.dayThursday },
        { key: "friday", label: t.dayFriday },
        { key: "saturday", label: t.daySaturday },
        { key: "sunday", label: t.daySunday },
      ] as Array<{ key: DayKey; label: string }>,
    [t],
  )

  // Localized shift labels, values fixed (FR) for backend
  const shifts = useMemo(
    () => [
      { value: SHIFT_VALUE_MORNING, label: t.shiftMorningLabel },
      { value: SHIFT_VALUE_EVENING, label: t.shiftEveningLabel },
      { value: SHIFT_VALUE_DOUBLE, label: t.shiftDoubleLabel },
      { value: SHIFT_VALUE_OFF, label: t.shiftOffLabel },
    ],
    [t],
  )

  // GraphQL queries
  const { data: employeesData, error: employeesError, loading: employeesLoading } = useQuery(GET_EMPLOYEES)

  // Fetch all schedules (admin-like view) to render the weekly grid
  const {
    data: schedulesData,
    error: schedulesError,
    loading: schedulesLoading,
    refetch,
  } = useQuery(GET_WORK_SCHEDULES)

  const [createManagerSchedule] = useMutation(CREATE_MANAGER_WORK_SCHEDULE)
  const [sendApprovalRequest] = useMutation(SEND_APPROVAL_REQUEST)

  const shiftName = (value: string) => {
    if (value === SHIFT_VALUE_MORNING) return t.shiftMorningName
    if (value === SHIFT_VALUE_EVENING) return t.shiftEveningName
    if (value === SHIFT_VALUE_DOUBLE) return t.shiftDoubleName
    return t.shiftOffName
  }

  // Helper: get the shift for an employee and day from schedulesData
  function getEmployeeSchedule(employeeId: string, dayKey: DayKey) {
    if (!schedulesData?.workSchedules) return null

    // Compute target date for this day in current week (Monday start)
    const today = new Date()
    const dayIndex = daysOfWeek.findIndex((d) => d.key === dayKey)
    const monday = new Date(today)
    monday.setDate(today.getDate() - today.getDay() + 1)
    const date = new Date(monday)
    date.setDate(monday.getDate() + dayIndex)
    date.setHours(0, 0, 0, 0)

    const sched = schedulesData.workSchedules.find((s: any) => {
      if (s.employee_id !== employeeId) return false
      let schedDate: Date
      if (/^\d+$/.test(String(s.date))) {
        schedDate = new Date(Number(s.date))
      } else {
        schedDate = new Date(s.date)
      }
      schedDate.setHours(0, 0, 0, 0)
      return schedDate.getTime() === date.getTime()
    })

    return sched ? { shift: sched.shift_type as string, job: sched.job_position as string } : null
  }

  const handleScheduleChange = (day: string, shift: string) => {
    setSchedule((prev) => ({ ...prev, [day]: shift }))
  }
  const handleSelectChange = (day: string) => (value: string) => {
    handleScheduleChange(day, value)
  }

  const selectedEmployeeData = employeesData?.employees.find((emp: any) => emp.id === selectedEmployee)

  async function proposeSchedule() {
    if (!selectedEmployee) {
      toast({
        title: t.toastMissingEmployeeTitle,
        description: t.toastMissingEmployeeDesc,
        variant: "destructive",
      })
      return
    }

    try {
      // Create entries for each selected day
      const createdSchedules = await Promise.all(
        daysOfWeek.map(async (day) => {
          const shift = schedule[day.key]
          if (!shift) return null

          // Compose the date for this week
          const today = new Date()
          const dayIndex = daysOfWeek.findIndex((d) => d.key === day.key)
          const monday = new Date(today)
          monday.setDate(today.getDate() - today.getDay() + 1)
          const date = new Date(monday)
          date.setDate(monday.getDate() + dayIndex)
          const dateString = date.toISOString().split("T")[0]

          // Default start/end times per shift (match labels)
          let start_time: string | null = null
          let end_time: string | null = null
          if (shift === SHIFT_VALUE_MORNING) {
            start_time = "09:00"
            end_time = "18:00"
          } else if (shift === SHIFT_VALUE_EVENING) {
            start_time = "18:00"
            end_time = "03:00"
          } else if (shift === SHIFT_VALUE_DOUBLE) {
            start_time = "09:00"
            end_time = "03:00"
          } // Repos -> keep nulls

          const result = await createManagerSchedule({
            variables: {
              employee_id: selectedEmployee,
              date: dateString,
              shift_type: shift, // Important: keep backend value in FR
              job_position: selectedEmployeeData?.job_title || "",
              is_working: shift !== SHIFT_VALUE_OFF,
              start_time,
              end_time,
            },
          })

          return result?.data?.createManagerWorkSchedule?.id || null
        }),
      )

      const reference_id = createdSchedules.find((id) => id !== null) || null

      await sendApprovalRequest({
        variables: {
          type: "schedule_change",
          reference_id,
          manager_id: selectedEmployee,
          data: JSON.stringify(schedule),
        },
      })

      toast({
        title: t.toastProposedTitle,
        description: t.toastProposedDesc,
      })
      setSchedule({})
      setJobPosition("")
      refetch()
    } catch (error) {
      console.error("Error proposing schedule:", error)
      toast({
        title: t.toastErrorTitle,
        description: t.toastErrorDesc,
        variant: "destructive",
      })
    }
  }

  // Utility: get localized date string for a day cell in the editor
  function dayDateString(dayKey: DayKey) {
    const today = new Date()
    const dayIndex = daysOfWeek.findIndex((d) => d.key === dayKey)
    const monday = new Date(today)
    monday.setDate(today.getDate() - today.getDay() + 1)
    const date = new Date(monday)
    date.setDate(monday.getDate() + dayIndex)
    return formatDate(date, { year: "numeric", month: "2-digit", day: "2-digit" })
  }

  // Loading / Error states (localized)
  if (employeesError || schedulesError) {
    return (
      <div className="p-8 text-center text-red-600">
        <h2 className="font-semibold mb-1" dir="auto">
          {t.errorTitle}
        </h2>
        <p>{employeesError?.message || schedulesError?.message}</p>
      </div>
    )
  }

  if (employeesLoading || schedulesLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <h2 className="text-white/90 font-semibold mb-1" dir="auto">
          {t.loadingTitle}
        </h2>
        <p dir="auto">{t.loadingSubtitle}</p>
      </div>
    )
  }

  // Defensive: If API returns undefined/null, show error
  if (!employeesData?.employees) {
    return (
      <div className="p-8 text-center text-red-600">
        <h2 className="font-semibold mb-1" dir="auto">
          {t.errorMissingDataTitle}
        </h2>
        <p dir="auto">{t.errorMissingDataDesc}</p>
      </div>
    )
  }

  // Employees mapped and filtered by manager's restaurant
  const employees = employeesData.employees.map((emp: any) => ({
    id: emp.id,
    name: `${emp.prenom} ${emp.nom}`,
    position: emp.job_title,
    job_title: emp.job_title,
    prenom: emp.prenom,
    nom: emp.nom,
    location: emp.location?.name || "",
  }))

  const filteredEmployees = employees.filter((emp: any) => emp.location === managerRestaurant)

  return (
    <div className="min-h-screen relative overflow-hidden animate-fade-in">
      {/* Floating particles background (absolute, so sidebar stays visible) */}
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

      <div className="space-y-8 p-3 sm:p-4 lg:p-6 relative z-20 max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="glass-card backdrop-blur-futuristic p-4 sm:p-6 lg:p-8 text-white shadow-2xl animate-fade-in relative overflow-hidden border border-white/10">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 via-green-900/40 to-blue-900/30 opacity-70 rounded-2xl" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-[shimmer_3s_ease-in-out_infinite] rounded-2xl" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-700/40 to-green-700/40 rounded-xl flex items-center justify-center border border-white/10">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1
                className="text-2xl md:text-3xl font-bold mb-1 bg-gradient-to-r from-white via-blue-200 to-green-200 bg-clip-text text-transparent"
                dir="auto"
              >
                {t.headerTitle}
              </h1>
              <p className="text-slate-200 text-sm md:text-base" dir="auto">
                {t.headerSubtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Weekly Schedule Table */}
        <Card className="glass-card backdrop-blur-futuristic border border-white/10 shadow-2xl bg-gradient-to-br from-slate-900/70 via-blue-900/60 to-slate-900/70">
          <CardHeader>
            <CardTitle className="text-white" dir="auto">
              {t.weeklyTitle}
            </CardTitle>
            <CardDescription className="text-blue-200" dir="auto">
              {t.weeklyDesc}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="p-3 font-semibold text-white text-left" dir="auto">
                      {t.employeeColumn}
                    </th>
                    {daysOfWeek.map((day) => (
                      <th key={day.key} className="text-center p-3 font-semibold text-white" dir="auto">
                        {day.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee: any) => (
                    <tr key={employee.id} className="border-b border-white/10 hover:bg-blue-900/30">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs bg-gradient-to-br from-blue-700/40 to-green-700/40 text-white">
                              {employee.name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium text-sm text-white truncate" dir="auto">
                              {employee.name}
                            </p>
                            <p className="text-xs text-blue-200 truncate" dir="auto">
                              {employee.position}
                            </p>
                          </div>
                        </div>
                      </td>
                      {daysOfWeek.map((day) => {
                        const sched = getEmployeeSchedule(employee.id, day.key)
                        const v = sched?.shift
                        return (
                          <td key={day.key} className="p-3 text-center">
                            {v ? (
                              <div className="flex flex-col items-center gap-1">
                                <Badge
                                  className={`text-xs glass-card border border-white/10 ${
                                    v === SHIFT_VALUE_MORNING
                                      ? "bg-blue-600/80 text-white"
                                      : v === SHIFT_VALUE_EVENING
                                        ? "bg-purple-600/80 text-white"
                                        : v === SHIFT_VALUE_DOUBLE
                                          ? "bg-orange-600/80 text-white"
                                          : "bg-slate-700/80 text-blue-200"
                                  }`}
                                  dir="auto"
                                >
                                  {shiftName(v)}
                                </Badge>
                                <span className="text-xs text-blue-200 truncate" dir="auto">
                                  {sched?.job || ""}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-blue-200">-</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Employee Selection Grid */}
        <Card className="glass-card backdrop-blur-futuristic border border-white/10 shadow-2xl bg-gradient-to-br from-slate-900/70 via-blue-900/60 to-slate-900/70">
          <CardHeader>
            <CardTitle className="flex items-center text-white" dir="auto">
              <Users className="w-5 h-5 mr-2" />
              {t.employeesTitle}
            </CardTitle>
            <CardDescription className="text-blue-200" dir="auto">
              {t.employeesDesc}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEmployees.map((employee: any) => (
                <div
                  key={employee.id}
                  className={`border border-white/10 rounded-xl p-4 cursor-pointer transition-colors glass-card bg-gradient-to-br from-blue-900/40 to-green-900/40 ${
                    selectedEmployee === employee.id ? "ring-2 ring-primary border-primary" : "hover:bg-blue-900/60"
                  }`}
                  onClick={() => setSelectedEmployee(employee.id)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-gradient-to-br from-blue-700/40 to-green-700/40 text-white">
                        {employee.prenom[0]}
                        {employee.nom[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium truncate text-white" dir="auto">
                        {employee.prenom} {employee.nom}
                      </h4>
                      <p className="text-sm text-blue-200 truncate" dir="auto">
                        {employee.job_title}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Schedule Editor */}
        {selectedEmployeeData && (
          <Card className="glass-card backdrop-blur-futuristic border border-white/10 shadow-2xl bg-gradient-to-br from-slate-900/70 via-blue-900/60 to-slate-900/70">
            <CardHeader>
              <CardTitle className="flex items-center text-white" dir="auto">
                <Clock className="w-5 h-5 mr-2" />
                {t.editorTitle(`${selectedEmployeeData.prenom} ${selectedEmployeeData.nom}`)}
              </CardTitle>
              <CardDescription className="text-blue-200" dir="auto">
                {t.editorSubtitle}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Job Position Selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-white" dir="auto">
                  {t.positionForWeek}
                </label>
                <Select value={jobPosition || selectedEmployeeData.job_title} onValueChange={setJobPosition}>
                  <SelectTrigger className="glass-card bg-gradient-to-br from-blue-900/40 to-green-900/40 border border-white/10 text-white">
                    <SelectValue placeholder={t.selectPosition} />
                  </SelectTrigger>
                  <SelectContent className="glass-card bg-gradient-to-br from-blue-900/80 to-green-900/80 border border-white/10 text-white">
                    {Array.from(new Set((employees || []).map((e: any) => e.job_title).filter(Boolean))).map((pos) => (
                      <SelectItem key={String(pos)} value={String(pos)}>
                        {String(pos)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {daysOfWeek.map((day) => (
                  <div
                    key={day.key}
                    className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 p-4 border border-white/10 rounded-lg glass-card bg-gradient-to-br from-blue-900/40 to-green-900/40"
                  >
                    <div className="md:w-48">
                      <span className="font-medium text-white" dir="auto">
                        {day.label}
                      </span>
                      <span className="ml-2 text-xs text-blue-200" dir="auto">
                        {dayDateString(day.key)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <Select value={schedule[day.key] || ""} onValueChange={handleSelectChange(day.key)}>
                        <SelectTrigger className="glass-card bg-gradient-to-br from-blue-900/40 to-green-900/40 border border-white/10 text-white">
                          <SelectValue placeholder={t.selectSlot} />
                        </SelectTrigger>
                        <SelectContent className="glass-card bg-gradient-to-br from-blue-900/80 to-green-900/80 border border-white/10 text-white">
                          {shifts.map((shift) => (
                            <SelectItem key={shift.value} value={shift.value}>
                              {shift.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {schedule[day.key] && (
                      <Badge
                        className={`glass-card border border-white/10 text-xs ${
                          schedule[day.key] === SHIFT_VALUE_OFF
                            ? "bg-slate-700/80 text-blue-200"
                            : "bg-green-600/80 text-white"
                        }`}
                        dir="auto"
                      >
                        {shiftName(schedule[day.key])}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={proposeSchedule}
                  className="glass-card bg-gradient-to-br from-green-700/40 to-blue-700/40 text-white border border-white/10 shadow"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {t.btnPropose}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
