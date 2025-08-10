"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@apollo/client"
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Award,
  Minus,
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

import { useAuth } from "@/lib/auth-context"
import { GET_EMPLOYEE, GET_TIME_ENTRIES, GET_WORK_SCHEDULES_RANGE } from "@/lib/graphql-queries"
import { useLang, type Lang } from "@/lib/i18n"

type Dict = {
  headerTitle: string
  headerSubtitle: string

  salaryTitle: string
  salarySubtitle: string
  baseSalary: string
  monthlySalary: string
  bonus: string
  monthlyBonus: string
  advance: string
  salaryAdvance: string
  netSalary: string
  netSalaryFormula: string

  performanceTitle: string
  performanceSubtitle: string
  performanceGlobal: string
  gradeExcellent: string
  gradeGood: string
  gradeImprove: string

  disciplinaryTitle: string
  disciplinarySubtitle: string
  infractions: string
  infractionsDesc: string
  absences: string
  absencesDesc: string
  late: string
  lateDesc: string

  additionalInfoTitle: string
  additionalInfoSubtitle: string
  uniform: string
  uniformsProvided: string
  units: string
  status: string
  currentStatus: string
  active: string
  inactive: string

  currency: string

  presenceTitle: string
  presenceSubtitle: (m: string) => string
  workedDays: string
  doubleShifts: string
  offDays: string
}

const translations: Record<Lang, Dict> = {
  fr: {
    headerTitle: "Finance",
    headerSubtitle: "Consultez vos informations financières",

    salaryTitle: "Résumé salarial",
    salarySubtitle: "Votre rémunération mensuelle détaillée",
    baseSalary: "Salaire de base",
    monthlySalary: "Salaire mensuel",
    bonus: "Prime",
    monthlyBonus: "Prime mensuelle",
    advance: "Avance",
    salaryAdvance: "Avance sur salaire",
    netSalary: "Salaire net estimé",
    netSalaryFormula: "Calcul : Salaire + Prime - Avance",

    performanceTitle: "Score de performance",
    performanceSubtitle: "Basé sur votre assiduité et comportement",
    performanceGlobal: "Performance globale",
    gradeExcellent: "Excellent",
    gradeGood: "Bon",
    gradeImprove: "À améliorer",

    disciplinaryTitle: "Données disciplinaires",
    disciplinarySubtitle: "Suivi de votre assiduité",
    infractions: "Infractions",
    infractionsDesc: "Infractions totales",
    absences: "Absences",
    absencesDesc: "Jours d'absence",
    late: "Retards",
    lateDesc: "Nombre de retards",

    additionalInfoTitle: "Informations complémentaires",
    additionalInfoSubtitle: "Détails sur votre situation",
    uniform: "Tenue de travail",
    uniformsProvided: "Tenues fournies",
    units: "unités",
    status: "Statut employé",
    currentStatus: "Statut actuel",
    active: "Actif",
    inactive: "Inactif",

    currency: "DT",

    presenceTitle: "Présence du mois",
    presenceSubtitle: (m) => `Vue de vos shifts — ${m}`,
    workedDays: "Jours travaillés",
    doubleShifts: "Doublages",
    offDays: "Jours off",
  },
  ar: {
    headerTitle: "المالية",
    headerSubtitle: "اطّلع على معلوماتك المالية",

    salaryTitle: "ملخص الراتب",
    salarySubtitle: "تفاصيل راتبك الشهري",
    baseSalary: "الراتب الأساسي",
    monthlySalary: "راتب شهري",
    bonus: "منحة",
    monthlyBonus: "منحة شهرية",
    advance: "سلفة",
    salaryAdvance: "سلفة على الراتب",
    netSalary: "الراتب الصافي التقديري",
    netSalaryFormula: "الحساب: الراتب + المنحة - السلفة",

    performanceTitle: "درجة الأداء",
    performanceSubtitle: "استنادًا إلى الانضباط والسلوك",
    performanceGlobal: "الأداء العام",
    gradeExcellent: "ممتاز",
    gradeGood: "جيد",
    gradeImprove: "بحاجة لتحسين",

    disciplinaryTitle: "بيانات الانضباط",
    disciplinarySubtitle: "متابعة الانضباط",
    infractions: "مخالفات",
    infractionsDesc: "إجمالي المخالفات",
    absences: "غيابات",
    absencesDesc: "أيام الغياب",
    late: "تأخيرات",
    lateDesc: "عدد التأخيرات",

    additionalInfoTitle: "معلومات إضافية",
    additionalInfoSubtitle: "تفاصيل حول وضعك",
    uniform: "الزيّ المهني",
    uniformsProvided: "عدد الأزياء المُقدّمة",
    units: "وحدات",
    status: "حالة الموظف",
    currentStatus: "الحالة الحالية",
    active: "نشِط",
    inactive: "غير نشِط",

    currency: "د.ت",

    presenceTitle: "الحضور الشهري",
    presenceSubtitle: (m) => `عرض نوبات العمل — ${m}`,
    workedDays: "أيام العمل",
    doubleShifts: "النوبات المضاعفة",
    offDays: "أيام الراحة",
  },
}

type Employee = {
  salaire?: number | string
  prime?: number | string
  avance?: number | string
  infractions?: number | string
  absence?: number | string
  retard?: number | string
  tenu_de_travail?: number | string
  status?: string
}

function monthStartEnd(ym: string) {
  const start = new Date(`${ym}-01T00:00:00`)
  const end = new Date(start)
  end.setMonth(end.getMonth() + 1)
  end.setDate(0)
  return { startDate: start.toISOString().slice(0, 10), endDate: end.toISOString().slice(0, 10) }
}
function monthLabel(ym: string, locale: string) {
  try {
    const d = new Date(`${ym}-01T00:00:00`)
    return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(d)
  } catch {
    return ym
  }
}
function ymAdd(ym: string, delta: number) {
  const [y, m] = ym.split("-").map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

export default function FinancePage() {
  const { user } = useAuth()
  const { lang } = useLang()
  const t = translations[lang]
  const align = lang === "ar" ? "text-right" : "text-left"
  const locale = lang === "ar" ? "ar" : "fr-FR"
  const nf = useMemo(() => new Intl.NumberFormat(lang === "ar" ? "ar-TN" : "fr-TN"), [lang])

  const { data: employeeData, loading } = useQuery(GET_EMPLOYEE, {
    variables: { id: user?.employee_id },
    skip: !user?.employee_id,
    fetchPolicy: "cache-and-network",
  })

  const employee: Employee | undefined = employeeData?.employee
  const isLoading = loading || !employee

  const salaire = Number(employee?.salaire ?? 0)
  const prime = Number(employee?.prime ?? 0)
  const avance = Number(employee?.avance ?? 0)

  const infractions = Number(employee?.infractions ?? 0)
  const absence = Number(employee?.absence ?? 0)
  const retard = Number(employee?.retard ?? 0)

  const totalSalary = Math.max(0, salaire + prime - avance)
  const performanceScore = Math.max(0, Math.min(100, 100 - (infractions * 5 + absence * 3 + retard * 2)))

  const Money = ({ amount }: { amount: number }) => (
    <span dir="ltr" className="tabular-nums">
      {nf.format(amount)} {t.currency}
    </span>
  )

  // Presence calendar state
  const [selectedYm, setSelectedYm] = useState<string>(new Date().toISOString().slice(0, 7))
  const { startDate, endDate } = monthStartEnd(selectedYm)

  // Queries for selected month
  const { data: teData } = useQuery(GET_TIME_ENTRIES, {
    variables: { employeeId: user?.employee_id, startDate, endDate },
    skip: !user?.employee_id,
  })
  const { data: wsData } = useQuery(GET_WORK_SCHEDULES_RANGE, {
    variables: { employee_id: user?.employee_id, start: startDate, end: endDate },
    skip: !user?.employee_id,
  })
  const timeEntries = teData?.timeEntries || []
  const workSchedules = wsData?.workSchedulesRange || []

  // Build map date => dots (1 single, 2 doublage)
  const dotByDate = useMemo(() => {
    const map = new Map<string, number>()
    for (const s of workSchedules) {
      const date = String(s.date)
      let dots = 0
      if (s.shift_type === "Doublage") dots = 2
      else if (s.shift_type === "Matin" || s.shift_type === "Soirée") dots = 1
      map.set(date, Math.max(map.get(date) || 0, dots))
    }
    const countByDate = timeEntries.reduce<Record<string, number>>((acc, te: any) => {
      const d = String(te.date)
      acc[d] = (acc[d] || 0) + 1
      return acc
    }, {})
    for (const [d, c] of Object.entries(countByDate)) {
      if (!map.has(d)) map.set(d, Math.min(2, c))
    }
    return map
  }, [workSchedules, timeEntries])

  let workedDays = 0
  let doubleShifts = 0
  const daysInMonth = new Date(Number(selectedYm.split("-")[0]), Number(selectedYm.split("-")[1]), 0).getDate()
  for (let day = 1; day <= daysInMonth; day++) {
    const key = `${selectedYm}-${String(day).padStart(2, "0")}`
    const dots = dotByDate.get(key) || 0
    if (dots >= 1) workedDays++
    if (dots >= 2) doubleShifts++
  }
  const offDays = Math.max(0, daysInMonth - workedDays)

  function generateCalendarCells(ym: string): { type: "blank" | "day"; day?: number }[] {
    const first = new Date(`${ym}-01T00:00:00`)
    const startWeekday = (first.getDay() + 6) % 7 // Monday=0
    const end = new Date(first)
    end.setMonth(end.getMonth() + 1)
    end.setDate(0)
    const last = end.getDate()

    const cells: { type: "blank" | "day"; day?: number }[] = []
    for (let i = 0; i < startWeekday; i++) cells.push({ type: "blank" })
    for (let d = 1; d <= last; d++) cells.push({ type: "day", day: d })
    return cells
  }

  return (
    <div className="relative" dir="ltr">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-purple-900/30 via-slate-900/30 to-slate-950" />

      <main className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="rounded-2xl border bg-gradient-to-br from-slate-900/80 to-slate-800/70 border-slate-700 p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
              <DollarSign className="size-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-semibold tracking-tight text-white" dir="auto">
                {t.headerTitle}
              </h1>
              <p className="text-xs sm:text-sm text-white/80" dir="auto">
                {t.headerSubtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Salary Overview */}
        <Card className="rounded-2xl border border-slate-700 bg-slate-900/70 backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-base sm:text-lg flex items-center gap-2" dir="auto">
              <DollarSign className="size-5" />
              {t.salaryTitle}
            </CardTitle>
            <CardDescription className="text-slate-300" dir="auto">
              {t.salarySubtitle}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[
                {
                  title: t.baseSalary,
                  value: <Money amount={salaire} />,
                  description: t.monthlySalary,
                  icon: DollarSign,
                  color: "text-emerald-500",
                },
                {
                  title: t.bonus,
                  value: <Money amount={prime} />,
                  description: t.monthlyBonus,
                  icon: Award,
                  color: "text-emerald-400",
                },
                {
                  title: t.advance,
                  value: <Money amount={avance} />,
                  description: t.salaryAdvance,
                  icon: Minus,
                  color: "text-rose-500",
                },
              ].map((item, index) => (
                <div key={index} className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                  <div className="flex items-center justify-between">
                    <div className={`flex items-center gap-2 ${align}`}>
                      <item.icon className={`size-4 ${item.color}`} />
                      <span className="text-sm font-medium text-slate-300" dir="auto">
                        {item.title}
                      </span>
                    </div>
                  </div>
                  <div className={`text-2xl font-bold text-white ${align}`}>{item.value}</div>
                  <div className={`text-xs text-slate-400 ${align}`} dir="auto">
                    {item.description}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-xl border border-slate-800 bg-slate-900/60">
              {isLoading ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-40 animate-pulse rounded bg-slate-700/50" />
                    <div className="h-7 w-24 animate-pulse rounded bg-slate-700/50" />
                  </div>
                  <div className="h-3 w-56 animate-pulse rounded bg-slate-700/40" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-300" dir="auto">
                      {t.netSalary}
                    </span>
                    <span className="text-2xl font-bold text-white">
                      <Money amount={totalSalary} />
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1" dir="auto">
                    {t.netSalaryFormula}
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Presence monthly calendar */}
        <Card className="rounded-2xl border border-slate-700 bg-slate-900/70 backdrop-blur text-white">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white text-base sm:text-lg flex items-center gap-2" dir="auto">
                  <CalendarIcon className="size-5" />
                  {t.presenceTitle}
                </CardTitle>
                <CardDescription className="text-slate-300" dir="auto">
                  {t.presenceSubtitle(monthLabel(selectedYm, locale))}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setSelectedYm((p) => ymAdd(p, -1))}
                >
                  <ChevronLeft className="size-4" />
                  <span className="sr-only">Prev</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setSelectedYm((p) => ymAdd(p, 1))}
                >
                  <ChevronRight className="size-4" />
                  <span className="sr-only">Next</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-3 flex items-center gap-4 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="inline-block size-2 rounded-full bg-emerald-400" />
                <span dir="auto">
                  {t.workedDays}: {workedDays}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block size-2 rounded-full bg-emerald-400 shadow-[0_0_0_3px_rgba(16,185,129,0.35)]" />
                <span dir="auto">
                  {t.doubleShifts}: {doubleShifts}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block size-2 rounded-full bg-slate-600" />
                <span dir="auto">
                  {t.offDays}: {offDays}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 sm:gap-3">
              {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d) => (
                <div key={d} className="text-xs sm:text-sm text-slate-300 text-center">
                  {d}
                </div>
              ))}

              {(() => {
                const cells: { type: "blank" | "day"; day?: number }[] = (() => {
                  const first = new Date(`${selectedYm}-01T00:00:00`)
                  const startWeekday = (first.getDay() + 6) % 7 // Monday=0
                  const end = new Date(first)
                  end.setMonth(end.getMonth() + 1)
                  end.setDate(0)
                  const last = end.getDate()

                  const arr: { type: "blank" | "day"; day?: number }[] = []
                  for (let i = 0; i < startWeekday; i++) arr.push({ type: "blank" })
                  for (let d = 1; d <= last; d++) arr.push({ type: "day", day: d })
                  return arr
                })()

                return cells.map((cell, idx) => {
                  if (cell.type === "blank") {
                    return <div key={`blank-${idx}`} className="h-16 sm:h-20 rounded-xl bg-transparent" />
                  }
                  const dateStr = `${selectedYm}-${String(cell.day).padStart(2, "0")}`
                  const dots = dotByDate.get(dateStr) || 0
                  return (
                    <div
                      key={`day-${cell.day}`}
                      className={`h-16 sm:h-20 rounded-xl border border-white/10 relative overflow-hidden
                        ${dots > 0 ? "bg-emerald-500/5" : "bg-slate-800/30"}`}
                    >
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/5" />
                      </div>
                      <div className="p-2 flex flex-col h-full">
                        <div className="text-xs sm:text-sm text-white/90">{cell.day}</div>
                        <div className="mt-auto flex gap-1">
                          {dots === 0 && <span className="inline-block size-2 rounded-full bg-slate-600" />}
                          {dots >= 1 && <span className="inline-block size-2 rounded-full bg-emerald-400" />}
                          {dots >= 2 && (
                            <span className="inline-block size-2 rounded-full bg-emerald-400 shadow-[0_0_0_3px_rgba(16,185,129,0.35)]" />
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              })()}
            </div>
          </CardContent>
        </Card>

        {/* Performance & Disciplinary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card className="rounded-2xl border border-slate-700 bg-slate-900/70 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-base sm:text-lg flex items-center gap-2" dir="auto">
                <TrendingUp className="size-5" />
                {t.performanceTitle}
              </CardTitle>
              <CardDescription className="text-slate-300" dir="auto">
                {t.performanceSubtitle}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2 tabular-nums" dir="ltr">
                  {performanceScore}%
                </div>
                <Badge
                  variant={performanceScore >= 80 ? "default" : performanceScore >= 60 ? "secondary" : "destructive"}
                  className="text-xs"
                  dir="auto"
                >
                  {performanceScore >= 80 ? t.gradeExcellent : performanceScore >= 60 ? t.gradeGood : t.gradeImprove}
                </Badge>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300" dir="auto">
                      {t.performanceGlobal}
                    </span>
                    <span className="text-slate-300 tabular-nums" dir="ltr">
                      {performanceScore}%
                    </span>
                  </div>
                  <Progress value={performanceScore} className="h-2" />
                </div>
              </div>

              <div className="text-xs text-slate-400 text-center" dir="auto">
                {t.disciplinarySubtitle}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-slate-700 bg-slate-900/70 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-base sm:text-lg flex items-center gap-2" dir="auto">
                <AlertTriangle className="size-5" />
                {t.disciplinaryTitle}
              </CardTitle>
              <CardDescription className="text-slate-300" dir="auto">
                {t.disciplinarySubtitle}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { title: t.infractions, value: infractions, color: "text-rose-500" },
                { title: t.absences, value: absence, color: "text-orange-500" },
                { title: t.late, value: retard, color: "text-yellow-500" },
              ].map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className={`flex items-center justify-between ${align}`}>
                    <div className="flex items-center gap-2">
                      <span className={`size-4 ${item.color}`} />
                      <span className="text-sm font-medium text-slate-300" dir="auto">
                        {item.title}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-white tabular-nums" dir="ltr">
                        {item.value}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <Card className="rounded-2xl border border-slate-700 bg-slate-900/70 backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-base sm:text-lg" dir="auto">
              {t.additionalInfoTitle}
            </CardTitle>
            <CardDescription className="text-slate-300" dir="auto">
              {t.additionalInfoSubtitle}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={`info-skel-${i}`} className="space-y-3">
                    <div className="h-5 w-40 animate-pulse rounded bg-slate-700/50" />
                    <div className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-900/60">
                      <div className="h-4 w-32 animate-pulse rounded bg-slate-700/40" />
                      <div className="h-6 w-20 animate-pulse rounded bg-slate-700/40" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-3">
                  <h4 className={`font-semibold text-white ${align}`} dir="auto">
                    {t.uniform}
                  </h4>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-900/60">
                    <span className="text-sm text-slate-300" dir="auto">
                      {t.uniformsProvided}
                    </span>
                    <Badge variant="outline" className="bg-slate-800/50 text-slate-200" dir="auto">
                      <span className="tabular-nums" dir="ltr">
                        {Number(employee?.tenu_de_travail ?? 0)}
                      </span>{" "}
                      {t.units}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className={`font-semibold text-white ${align}`} dir="auto">
                    {t.status}
                  </h4>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-900/60">
                    <span className="text-sm text-slate-300" dir="auto">
                      {t.currentStatus}
                    </span>
                    <Badge
                      variant={String(employee?.status).toLowerCase() === "active" ? "default" : "secondary"}
                      className={String(employee?.status).toLowerCase() === "active" ? "bg-emerald-600 text-white" : ""}
                      dir="auto"
                    >
                      {String(employee?.status).toLowerCase() === "active" ? t.active : t.inactive}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
