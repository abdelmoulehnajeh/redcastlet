"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useQuery, useMutation } from "@apollo/client"
import {
  GET_EMPLOYEES,
  GET_LOCATIONS,
  GET_TIME_ENTRIES,
  GET_WORK_SCHEDULES_RANGE,
  GET_PAYROLL_PAYMENTS,
  PAY_SALARY,
} from "@/lib/graphql-queries"
import { toast } from "sonner"
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Search,
  Download,
  Calculator,
  CreditCard,
  Banknote,
  X,
} from "lucide-react"

interface Employee {
  id: string
  nom: string
  prenom: string
  email: string
  job_title: string
  salaire: number
  prime: number
  avance: number
  infractions: number
  absence: number
  retard: number
  tenu_de_travail: number
  status: string
  price_h?: number
  location: { id: string; name: string } | null
}

interface Location {
  id: string
  name: string
}

type Lang = "fr" | "ar"

type Dict = {
  pageTitle: string
  pageSubtitle: string
  payrollMass: string
  payrollMassSub: string
  bonuses: string
  bonusesSub: string
  penalties: string
  penaltiesSub: string
  advances: string
  advancesSub: string
  filters: string
  searchPlaceholder: string
  restaurant: string
  allRestaurants: string
  month: string
  export: string
  tableTitle: string
  tableSubtitle: (m: string) => string
  colEmployee: string
  colRestaurant: string
  colBaseSalary: string
  colBonus: string
  colAdvance: string
  colPenalties: string
  colNetPay: string
  colStatus: string
  colActions: string
  notAssigned: string
  noneFound: string
  paid: string
  unpaid: string
  paidWith: (amount: string) => string
  calendarTitle: (name: string) => string
  calendarDesc: (m: string) => string
  legendSingle: string
  legendDouble: string
  legendOff: string
  close: string
}

const translations: Record<Lang, Dict> = {
  fr: {
    pageTitle: "Gestion Financière",
    pageSubtitle: "Salaires, primes, pénalités et avances",
    payrollMass: "Masse Salariale",
    payrollMassSub: "Total net à payer",
    bonuses: "Primes",
    bonusesSub: "Récompenses",
    penalties: "Pénalités",
    penaltiesSub: "Retards & absences",
    advances: "Avances",
    advancesSub: "À déduire",
    filters: "Filtres",
    searchPlaceholder: "Rechercher un employé...",
    restaurant: "Restaurant",
    allRestaurants: "Tous les restaurants",
    month: "Mois",
    export: "Export",
    tableTitle: "Gestion des Salaires",
    tableSubtitle: (m) => `Vue des salaires pour ${m}`,
    colEmployee: "Employé",
    colRestaurant: "Restaurant",
    colBaseSalary: "Salaire Base",
    colBonus: "Prime",
    colAdvance: "Avance",
    colPenalties: "Pénalités",
    colNetPay: "Net à Payer",
    colStatus: "Statut",
    colActions: "Actions",
    notAssigned: "Non assigné",
    noneFound: "Aucun employé trouvé",
    paid: "Payé",
    unpaid: "Non payé",
    paidWith: (amount) => `Payé • ${amount}`,
    calendarTitle: (name) => `Planning du mois — ${name}`,
    calendarDesc: (m) => `Points: 1 = shift simple, 2 = doublage. Mois affiché: ${m}`,
    legendSingle: "Shift simple",
    legendDouble: "Doublage",
    legendOff: "Repos / Non travaillé",
    close: "Fermer",
  },
  ar: {
    pageTitle: "الإدارة المالية",
    pageSubtitle: "الرواتب، العلاوات، العقوبات والسلف",
    payrollMass: "كتلة الأجور",
    payrollMassSub: "صافي الإجمالي للدفع",
    bonuses: "العلاوات",
    bonusesSub: "مكافآت",
    penalties: "العقوبات",
    penaltiesSub: "تأخيرات وغيابات",
    advances: "السلف",
    advancesSub: "يتم خصمها",
    filters: "عوامل التصفية",
    searchPlaceholder: "ابحث عن موظف...",
    restaurant: "المطعم",
    allRestaurants: "جميع المطاعم",
    month: "الشهر",
    export: "تصدير",
    tableTitle: "إدارة الرواتب",
    tableSubtitle: (m) => `عرض الرواتب لشهر ${m}`,
    colEmployee: "الموظف",
    colRestaurant: "المطعم",
    colBaseSalary: "الراتب الأساسي",
    colBonus: "العلاوة",
    colAdvance: "السلفة",
    colPenalties: "العقوبات",
    colNetPay: "الصافي للدفع",
    colStatus: "الحالة",
    colActions: "إجراءات",
    notAssigned: "غير معيّن",
    noneFound: "لا يوجد موظفون",
    paid: "مدفوع",
    unpaid: "غير مدفوع",
    paidWith: (amount) => `مدفوع • ${amount}`,
    calendarTitle: (name) => `تقويم الشهر — ${name}`,
    calendarDesc: (m) => `النقاط: 1 = نوبة واحدة، 2 = مضاعفة. الشهر: ${m}`,
    legendSingle: "نوبة واحدة",
    legendDouble: "مضاعفة",
    legendOff: "راحة / غير عامل",
    close: "إغلاق",
  },
}

function useLang(): Lang {
  const [lang, setLang] = useState<Lang>("fr")
  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = localStorage.getItem("lang")
    if (stored === "ar" || stored === "fr") setLang(stored)
  }, [])
  useEffect(() => {
    if (typeof document === "undefined") return
    document.documentElement.setAttribute("lang", lang)
    document.documentElement.setAttribute("dir", "ltr")
  }, [lang])
  return lang
}

// Helpers: month, calendar
function monthLabel(ym: string, locale: string) {
  try {
    const d = new Date(`${ym}-01T00:00:00`)
    return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(d)
  } catch {
    return ym
  }
}
function monthStartEnd(ym: string) {
  const start = new Date(`${ym}-01T00:00:00`)
  const end = new Date(start)
  end.setMonth(end.getMonth() + 1)
  end.setDate(0)
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
    lastDay: end.getDate(),
  }
}

export default function AdminFinancePage() {
  const lang = useLang()
  const t = translations[lang]
  const locale = lang === "ar" ? "ar" : "fr-FR"

  const [searchTerm, setSearchTerm] = useState("")
  const [locationFilter, setLocationFilter] = useState("all")
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [openCalendarFor, setOpenCalendarFor] = useState<Employee | null>(null)

  const { data: employeesData, loading: employeesLoading, refetch: refetchEmployees } = useQuery(GET_EMPLOYEES)
  const { data: locationsData } = useQuery(GET_LOCATIONS)
  const { data: paymentsData, refetch: refetchPayments } = useQuery(GET_PAYROLL_PAYMENTS, {
    variables: { period: selectedMonth },
  })
  const [paySalary, { loading: paying }] = useMutation(PAY_SALARY)

  const employees: Employee[] = employeesData?.employees || []
  const locations: Location[] = locationsData?.locations || []
  const payments:
    | Array<{ employee_id: string; paid: boolean; amount?: number | null; hours_worked?: number | null }>
    | [] = paymentsData?.payrollPayments || []
  const paidMap = new Map(payments.map((p) => [String(p.employee_id), p.paid]))
  const amountMap = new Map(payments.map((p) => [String(p.employee_id), p.amount ?? null]))

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLocation = locationFilter === "all" || employee.location?.id === locationFilter
    return matchesSearch && matchesLocation && employee.status === "active"
  })

  const calculateNetSalary = (employee: Employee) => {
    // Keep existing logic for preview display; actual payment amount is computed on the server (hours * price_h)
    const baseSalary = employee.salaire || 0
    const prime = employee.prime || 0
    const avance = employee.avance || 0
    const penalties = (employee.infractions || 0) * 15 + (employee.retard || 0) * 15 + (employee.absence || 0) * 10
    return baseSalary + prime - avance - penalties
  }

  const totalSalaries = filteredEmployees.reduce((sum, emp) => sum + calculateNetSalary(emp), 0)
  const totalBonuses = filteredEmployees.reduce((sum, emp) => sum + (emp.prime || 0), 0)
  const totalPenalties = filteredEmployees.reduce(
    (sum, emp) => sum + (emp.infractions || 0) * 15 + (emp.retard || 0) * 15 + (emp.absence || 0) * 10,
    0,
  )
  const totalAdvances = filteredEmployees.reduce((sum, emp) => sum + (emp.avance || 0), 0)

  const formatAmount = (n: number) =>
    `${n.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}DT`
  const monthText = monthLabel(selectedMonth, locale)

  if (employeesLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold" dir="auto">
            {t.pageTitle}
          </h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  <Skeleton className="h-4 w-20" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden animate-fade-in" dir="ltr">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-green-900/60 to-slate-900/80 backdrop-blur-[6px]" />
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-green-400 to-blue-400 rounded-full opacity-30 animate-float"
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
        <div className="glass-card backdrop-blur-futuristic p-4 sm:p-6 lg:p-8 text-white shadow-2xl relative overflow-hidden border border-white/10">
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/30 via-green-800/40 to-blue-900/30 opacity-70 rounded-2xl" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-[shimmer_3s_ease-in-out_infinite] rounded-2xl" />
          <div className="flex items-center space-x-4 relative z-10">
            <div className="w-12 h-12 bg-gradient-to-br from-green-700/40 to-blue-700/40 rounded-xl flex items-center justify-center border border-white/10">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1
                className="text-2xl md:text-3xl font-bold mb-1 bg-gradient-to-r from-white via-green-200 to-blue-200 bg-clip-text text-transparent"
                dir="auto"
              >
                {t.pageTitle}
              </h1>
              <p className="text-slate-200 text-sm md:text-base" dir="auto">
                {t.pageSubtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Financial Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="glass-card backdrop-blur-futuristic border border-white/10 shadow-2xl bg-gradient-to-br from-slate-900/70 via-green-900/60 to-slate-900/70">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white" dir="auto">
                {t.payrollMass}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{formatAmount(totalSalaries)}</div>
              <p className="text-xs text-green-200" dir="auto">
                {t.payrollMassSub}
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card backdrop-blur-futuristic border border-white/10 shadow-2xl bg-gradient-to-br from-slate-900/70 via-green-900/60 to-slate-900/70">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white" dir="auto">
                {t.bonuses}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">+{formatAmount(totalBonuses)}</div>
              <p className="text-xs text-blue-200" dir="auto">
                {t.bonusesSub}
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card backdrop-blur-futuristic border border-white/10 shadow-2xl bg-gradient-to-br from-slate-900/70 via-green-900/60 to-slate-900/70">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white" dir="auto">
                {t.penalties}
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">-{formatAmount(totalPenalties)}</div>
              <p className="text-xs text-red-200" dir="auto">
                {t.penaltiesSub}
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card backdrop-blur-futuristic border border-white/10 shadow-2xl bg-gradient-to-br from-slate-900/70 via-green-900/60 to-slate-900/70">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white" dir="auto">
                {t.advances}
              </CardTitle>
              <CreditCard className="h-4 w-4 text-orange-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-400">-{formatAmount(totalAdvances)}</div>
              <p className="text-xs text-orange-200" dir="auto">
                {t.advancesSub}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="glass-card backdrop-blur-futuristic border border-white/10 shadow-2xl bg-gradient-to-br from-slate-900/70 via-green-900/60 to-slate-900/70">
          <CardHeader>
            <CardTitle className="text-white" dir="auto">
              {t.filters}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-green-300" />
                  <Input
                    placeholder={t.searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 glass-card bg-gradient-to-br from-slate-800/80 to-green-900/80 border border-white/10 text-white"
                  />
                </div>
              </div>

              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-[180px] glass-card bg-gradient-to-br from-slate-800/80 to-green-900/80 border border-white/10 text-white">
                  <SelectValue placeholder={t.restaurant} />
                </SelectTrigger>
                <SelectContent className="glass-card bg-gradient-to-br from-slate-900/90 to-green-900/90 border border-white/10 text-white">
                  <SelectItem value="all" className="glass-card bg-transparent text-white">
                    <span dir="auto">{t.allRestaurants}</span>
                  </SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id} className="glass-card bg-transparent text-white">
                      <span dir="auto">{location.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-[150px] glass-card bg-gradient-to-br from-slate-800/80 to-green-900/80 border border-white/10 text-white"
                aria-label={t.month}
              />

              <Button
                variant="outline"
                className="glass-card bg-gradient-to-br from-slate-800/80 to-green-900/80 border border-white/10 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                <span dir="auto">{t.export}</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Salary Management Table */}
        <Card className="glass-card backdrop-blur-futuristic border border-white/10 shadow-2xl bg-gradient-to-br from-slate-900/70 via-green-900/60 to-slate-900/70">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Calculator className="w-5 h-5 mr-2" />
              <span dir="auto">{t.tableTitle}</span>
            </CardTitle>
            <CardDescription className="text-green-200" dir="auto">
              {t.tableSubtitle(monthText)}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Table className="text-white">
              <TableHeader>
                <TableRow>
                  <TableHead dir="auto">{t.colEmployee}</TableHead>
                  <TableHead dir="auto">{t.colRestaurant}</TableHead>
                  <TableHead dir="auto">{t.colBaseSalary}</TableHead>
                  <TableHead dir="auto">{t.colBonus}</TableHead>
                  <TableHead dir="auto">{t.colAdvance}</TableHead>
                  <TableHead dir="auto">{t.colPenalties}</TableHead>
                  <TableHead dir="auto">{t.colNetPay}</TableHead>
                  <TableHead dir="auto">{t.colStatus}</TableHead>
                  <TableHead dir="auto">{t.colActions}</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredEmployees.map((employee) => {
                  const penalties =
                    (employee.infractions || 0) * 15 + (employee.retard || 0) * 15 + (employee.absence || 0) * 10
                  const netSalary = calculateNetSalary(employee)
                  const paid = paidMap.get(String(employee.id)) === true
                  const amt = amountMap.get(String(employee.id))
                  const paidLabel = paid && typeof amt === "number" ? t.paidWith(formatAmount(amt)) : t.paid

                  return (
                    <TableRow key={employee.id} className="hover:bg-white/5 transition-colors">
                      <TableCell className="font-medium">
                        <button
                          onClick={() => setOpenCalendarFor(employee)}
                          className="text-left hover:underline decoration-green-400/70 underline-offset-4"
                          aria-label="Ouvrir le calendrier"
                        >
                          <div className="font-semibold text-white" dir="auto">
                            {employee.prenom} {employee.nom}
                          </div>
                          <div className="text-sm text-green-200" dir="auto">
                            {employee.job_title}
                          </div>
                        </button>
                      </TableCell>

                      <TableCell className="text-blue-200" dir="auto">
                        {employee.location ? employee.location.name : t.notAssigned}
                      </TableCell>

                      <TableCell>
                        <span className="font-medium text-white">
                          {formatAmount((employee.salaire || 0) as number)}
                        </span>
                      </TableCell>

                      <TableCell>
                        <span className="font-medium text-blue-300">+{formatAmount(employee.prime || 0)}</span>
                      </TableCell>

                      <TableCell>
                        <span className="font-medium text-orange-300">-{formatAmount(employee.avance || 0)}</span>
                      </TableCell>

                      <TableCell>
                        <div className="text-sm">
                          <div className="text-red-400 font-medium">-{formatAmount(penalties)}</div>
                          <div className="text-xs text-red-200">
                            {employee.retard || 0}R • {employee.absence || 0}A • {employee.infractions || 0}I
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="font-bold text-lg">
                          <span className={netSalary >= 0 ? "text-green-400" : "text-red-400"}>
                            {formatAmount(netSalary)}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        {paid ? (
                          <Badge className="bg-emerald-600/30 text-emerald-300 border border-emerald-600/40" dir="auto">
                            {paidLabel}
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-600/30 text-yellow-300 border border-yellow-600/40" dir="auto">
                            {t.unpaid}
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={paid || paying}
                            className="glass-card bg-gradient-to-br from-slate-800/80 to-green-900/80 border border-white/10 text-white"
                            aria-label="Marquer comme payé"
                            onClick={async () => {
                              try {
                                await paySalary({ variables: { employee_id: employee.id, period: selectedMonth } })
                                toast.success(
                                  "Salaire payé (basé sur heures × prix horaire) et primes/avances réinitialisées.",
                                )
                                await refetchPayments()
                                await refetchEmployees()
                              } catch (e) {
                                console.error(e)
                                toast.error("Échec du paiement.")
                              }
                            }}
                          >
                            <Banknote className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="glass-card bg-gradient-to-br from-slate-800/80 to-green-900/80 border border-white/10 text-white"
                            aria-label="Exporter le bulletin"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>

            {filteredEmployees.length === 0 && (
              <div className="text-center py-8 text-green-200" dir="auto">
                {t.noneFound}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Calendar modal */}
      <WorkCalendarModal
        lang={lang}
        employee={openCalendarFor}
        onOpenChange={(open) => !open && setOpenCalendarFor(null)}
        ym={selectedMonth}
      />

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

function WorkCalendarModal({
  lang,
  employee,
  ym,
  onOpenChange,
}: {
  lang: Lang
  employee: Employee | null
  ym: string
  onOpenChange: (open: boolean) => void
}) {
  const t = translations[lang]
  const locale = lang === "ar" ? "ar" : "fr-FR"
  const open = !!employee
  const { startDate, endDate, lastDay } = monthStartEnd(ym)
  const monthText = monthLabel(ym, locale)

  const { data: teData, loading: teLoading } = useQuery(GET_TIME_ENTRIES, {
    variables: { employeeId: employee?.id, startDate, endDate },
    skip: !employee,
    fetchPolicy: "cache-and-network",
  })

  const { data: wsData, loading: wsLoading } = useQuery(GET_WORK_SCHEDULES_RANGE, {
    variables: { employee_id: employee?.id, start: startDate, end: endDate },
    skip: !employee,
    fetchPolicy: "cache-and-network",
  })

  const timeEntries = teData?.timeEntries || []
  const workSchedules = wsData?.workSchedulesRange || []

  // Build day -> dotCount
  const dayDots: Record<number, number> = {}
  for (let d = 1; d <= lastDay; d++) dayDots[d] = 0

  // From work schedules first
  for (const s of workSchedules) {
    const d = new Date(s.date + "T00:00:00")
    const day = d.getDate()
    let dot = 0
    if (s.shift_type === "Doublage") dot = 2
    else if (s.shift_type === "Matin" || s.shift_type === "Soirée") dot = 1
    else dot = 0
    dayDots[day] = Math.max(dayDots[day], dot)
  }

  // Fallback: time entries counts if no schedule
  const teCountByDay = timeEntries.reduce<Record<number, number>>((acc, te: any) => {
    if (!te.date) return acc
    const d = new Date(String(te.date) + "T00:00:00")
    const day = d.getDate()
    acc[day] = (acc[day] || 0) + 1
    return acc
  }, {})
  for (const [k, v] of Object.entries(teCountByDay)) {
    const day = Number(k)
    if (dayDots[day] === 0) {
      dayDots[day] = Math.min(2, v) // 1 or 2 entries
    }
  }

  const isLoading = teLoading || wsLoading

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl sm:max-w-4xl border border-white/10 bg-gradient-to-br from-slate-950/90 via-slate-900/90 to-slate-950/90 backdrop-blur-xl text-white rounded-2xl p-0 overflow-hidden">
        <DialogHeader className="p-4 sm:p-6 border-b border-white/10">
          <DialogTitle className="text-lg sm:text-xl font-semibold" dir="auto">
            {employee ? t.calendarTitle(`${employee.prenom} ${employee.nom}`) : t.calendarTitle("")}
          </DialogTitle>
          <DialogDescription className="text-slate-300" dir="auto">
            {t.calendarDesc(monthText)}
          </DialogDescription>
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 sm:right-4 sm:top-4 text-white/80 hover:text-white"
              aria-label={t.close}
            >
              <X className="h-5 w-5" />
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1">
                <span className="inline-block size-2 rounded-full bg-emerald-400" />
                <span dir="auto">{t.legendSingle}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="inline-block size-2 rounded-full bg-emerald-400 shadow-[0_0_0_3px_rgba(16,185,129,0.35)]" />
                <span dir="auto">{t.legendDouble}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="inline-block size-2 rounded-full bg-slate-600" />
                <span dir="auto">{t.legendOff}</span>
              </div>
            </div>
            <div className="text-xs text-slate-300" dir="auto">
              {monthText}
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 sm:gap-3">
            {/* Weekday headers */}
            {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d) => (
              <div key={d} className="text-xs sm:text-sm text-slate-300 text-center">
                {d}
              </div>
            ))}
            {/* Calendar grid */}
            {generateCalendarCells(ym).map((cell, idx) => {
              if (cell.type === "blank") {
                return <div key={`blank-${idx}`} className="h-16 sm:h-20 rounded-xl bg-transparent" />
              }
              const dots = dayDots[cell.day] || 0
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
            })}
          </div>

          {isLoading && (
            <div className="mt-4 text-sm text-slate-300" dir="auto">
              Chargement du planning...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

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
