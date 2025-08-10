"use client"

import { useMemo } from "react"
import { useQuery } from "@apollo/client"
import { FileText, Download, Calendar, DollarSign, User, MapPin, BadgeIcon as IdCard } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { useAuth } from "@/lib/auth-context"
import { GET_EMPLOYEE, GET_CONTRACTS } from "@/lib/graphql-queries"
import { useLang, type Lang } from "@/lib/i18n"

type Dict = {
  headerTitle: string
  headerSubtitle: string

  empInfoTitle: string
  empInfoSubtitle: string
  fullName: string
  email: string
  phone: string
  position: string
  status: string
  active: string
  inactive: string
  hireDate: string

  contractsTitle: string
  contractsSubtitleNone: string
  contractsSubtitleSome: (n: number) => string
  contractLabel: string
  idLabel: string
  startDate: string
  endDate: string
  salary: string
  uniforms: string
  units: string
  documents: string
  statusActive: string
  statusExpired: string
  statusUpcoming: string
  download: string
  noContractsTitle: string
  noContractsDesc: string

  quickActionsTitle: string
  quickActionsSubtitle: string
  actionRequestCopy: string
  actionContactHR: string

  currency: string
}

const translations: Record<Lang, Dict> = {
  fr: {
    headerTitle: "Contrats",
    headerSubtitle: "Consultez vos informations contractuelles",

    empInfoTitle: "Informations Employé",
    empInfoSubtitle: "Vos données personnelles et professionnelles",
    fullName: "Nom complet",
    email: "Email",
    phone: "Téléphone",
    position: "Poste",
    status: "Statut",
    active: "Actif",
    inactive: "Inactif",
    hireDate: "Date d'embauche",

    contractsTitle: "Mes contrats",
    contractsSubtitleNone: "Aucun contrat trouvé",
    contractsSubtitleSome: (n) => `Vous avez ${n} contrat(s) enregistré(s)`,
    contractLabel: "Contrat",
    idLabel: "ID",
    startDate: "Date de début",
    endDate: "Date de fin",
    salary: "Salaire",
    uniforms: "Tenues",
    units: "unités",
    documents: "Documents",
    statusActive: "Sari",
    statusExpired: "Expiré",
    statusUpcoming: "À venir",
    download: "Télécharger",
    noContractsTitle: "Aucun contrat trouvé",
    noContractsDesc:
      "Vos contrats apparaîtront ici une fois qu'ils seront ajoutés par l'administration.",

    quickActionsTitle: "Actions rapides",
    quickActionsSubtitle: "Gérez vos documents contractuels",
    actionRequestCopy: "Demander une copie de contrat",
    actionContactHR: "Contacter les RH",

    currency: "DT",
  },
  ar: {
    headerTitle: "العقود",
    headerSubtitle: "اطّلع على معلومات عقودك",

    empInfoTitle: "معلومات الموظف",
    empInfoSubtitle: "بياناتك الشخصية والمهنية",
    fullName: "الاسم الكامل",
    email: "البريد الإلكتروني",
    phone: "الهاتف",
    position: "المنصب",
    status: "الحالة",
    active: "نشِط",
    inactive: "غير نشِط",
    hireDate: "تاريخ التعيين",

    contractsTitle: "عقودي",
    contractsSubtitleNone: "لا توجد عقود",
    contractsSubtitleSome: (n) => `لديك ${n} عقد`,
    contractLabel: "عقد",
    idLabel: "المعرف",
    startDate: "تاريخ البدء",
    endDate: "تاريخ الانتهاء",
    salary: "الراتب",
    uniforms: "الأزياء",
    units: "وحدات",
    documents: "المستندات",
    statusActive: "ساري",
    statusExpired: "منتهي",
    statusUpcoming: "قادم",
    download: "تنزيل",
    noContractsTitle: "لا توجد عقود",
    noContractsDesc: "ستظهر عقودك هنا عندما تتم إضافتها من قبل الإدارة.",

    quickActionsTitle: "إجراءات سريعة",
    quickActionsSubtitle: "إدارة مستندات عقودك",
    actionRequestCopy: "طلب نسخة عقد",
    actionContactHR: "الاتصال بالموارد البشرية",

    currency: "د.ت",
  },
}

type Employee = {
  prenom?: string
  nom?: string
  email?: string
  telephone?: string
  job_title?: string
  status?: string
  created_at?: string | Date
  salaire?: number | string
}

type Contract = {
  id: string | number
  contract_type?: string
  start_date?: string | Date
  end_date?: string | Date | null
  salary?: number | string
  tenu_count?: number | string
  documents?: string | null
}

function statusKind(contract: Contract) {
  const now = new Date()
  const start = contract.start_date ? new Date(contract.start_date) : null
  const end = contract.end_date ? new Date(contract.end_date) : null
  if (start && now < start) return "upcoming" as const
  if (end && now > end) return "expired" as const
  return "active" as const
}

function kindStyles(kind: "active" | "expired" | "upcoming") {
  // Avoid blues; use emerald, rose, amber
  if (kind === "active") {
    return {
      leftAccent: "before:bg-gradient-to-b before:from-emerald-500 before:to-emerald-400",
      badge: "bg-emerald-600 text-white",
      iconBg: "bg-emerald-500/10",
      iconFg: "text-emerald-400",
      hoverBorder: "hover:border-emerald-500/40",
    }
  }
  if (kind === "expired") {
    return {
      leftAccent: "before:bg-gradient-to-b before:from-rose-500 before:to-rose-400",
      badge: "bg-rose-600 text-white",
      iconBg: "bg-rose-500/10",
      iconFg: "text-rose-400",
      hoverBorder: "hover:border-rose-500/40",
    }
  }
  return {
    leftAccent: "before:bg-gradient-to-b before:from-amber-500 before:to-amber-400",
    badge: "bg-amber-600 text-white",
    iconBg: "bg-amber-500/10",
    iconFg: "text-amber-400",
    hoverBorder: "hover:border-amber-500/40",
  }
}

export default function ContractsPage() {
  const { user } = useAuth()
  const { lang, formatDate } = useLang()
  const t = translations[lang]
  const align = lang === "ar" ? "text-right" : "text-left"
  const nf = useMemo(() => new Intl.NumberFormat(lang === "ar" ? "ar-TN" : "fr-TN"), [lang])

  const { data: employeeData, loading: loadingEmp } = useQuery(GET_EMPLOYEE, {
    variables: { id: user?.employee_id },
    skip: !user?.employee_id,
    fetchPolicy: "cache-and-network",
  })

  const { data: contractsData, loading: loadingContracts } = useQuery(GET_CONTRACTS, {
    variables: { employee_id: user?.employee_id },
    skip: !user?.employee_id,
    fetchPolicy: "cache-and-network",
  })

  const employee: Employee | undefined = employeeData?.employee
  const contracts: Contract[] = Array.isArray(contractsData?.contracts) ? contractsData.contracts : []
  const isLoadingEmp = loadingEmp || !employee
  const isLoadingContracts = loadingContracts && contracts.length === 0

  const Money = ({ amount }: { amount: number }) => (
    <span dir="ltr" className="tabular-nums">
      {nf.format(amount)} {t.currency}
    </span>
  )

 function longDate(d?: string | number | Date | null) {
  if (d == null) return "—";

  let date: Date;

  if (d instanceof Date) {
    date = d;
  } else if (typeof d === "number") {
    // Detect seconds vs milliseconds
    date = new Date(d < 1e12 ? d * 1000 : d);
  } else if (typeof d === "string" && !isNaN(Number(d))) {
    // Numeric string (timestamp)
    const num = Number(d);
    date = new Date(num < 1e12 ? num * 1000 : num);
  } else {
    // Date string
    date = new Date(d);
  }

  if (isNaN(date.getTime())) return "—";

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

  return (
    <div className="relative" dir="ltr">
      {/* Background that matches Journal / Finance */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-purple-900/30 via-slate-900/30 to-slate-950" />

      <div className="mx-auto max-w-[1200px] px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-5 sm:space-y-6">
        {/* Header */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-800/70 p-4 sm:p-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)]">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
              <FileText className="size-5 text-white" />
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

        {/* Employee Info */}
        <Card className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_30px_rgba(0,0,0,0.35)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-base sm:text-lg flex items-center gap-2" dir="auto">
              <User className="size-5" />
              {t.empInfoTitle}
            </CardTitle>
            <CardDescription className="text-slate-300" dir="auto">
              {t.empInfoSubtitle}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingEmp ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ValueTileSkeleton key={`emp-skel-${i}`} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                <ValueTile label={t.fullName} value={`${employee?.prenom ?? ""} ${employee?.nom ?? ""}`} align={align} />
                <ValueTile label={t.email} value={employee?.email || "—"} align={align} mono />
                <ValueTile label={t.phone} value={employee?.telephone || "—"} align={align} mono />
                <ValueTile label={t.position} value={employee?.job_title || "—"} align={align} />
                <StatusTile label={t.status} activeLabel={t.active} inactiveLabel={t.inactive} status={String(employee?.status)} align={align} />
                <ValueTile label={t.hireDate} value={longDate(employee?.created_at ?? null)} align={align} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contracts */}
        <Card className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_30px_rgba(0,0,0,0.35)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-base sm:text-lg flex items-center gap-2" dir="auto">
              <IdCard className="size-5" />
              {t.contractsTitle}
            </CardTitle>
            <CardDescription className="text-slate-300" dir="auto">
              {isLoadingContracts ? "—" : contracts.length > 0 ? t.contractsSubtitleSome(contracts.length) : t.contractsSubtitleNone}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingContracts ? (
              <div className="space-y-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <ContractSkeleton key={`c-skel-${i}`} />
                ))}
              </div>
            ) : contracts.length > 0 ? (
              <div className="space-y-4">
                {contracts.map((contract, idx) => {
                  const kind = statusKind(contract)
                  const styles = kindStyles(kind)
                  const salary = Number(contract.salary ?? 0)
                  const uniforms = Number(contract.tenu_count ?? 0)
                  const statusLabel =
                    kind === "active" ? translations[lang].statusActive : kind === "expired" ? translations[lang].statusExpired : translations[lang].statusUpcoming

                  return (
                    <div
                      key={contract.id ?? idx}
                      className={cn(
                        "relative rounded-2xl border border-slate-800/80 bg-slate-950/40 p-4 sm:p-5 transition-colors",
                        "before:absolute before:left-0 before:top-5 before:bottom-5 before:w-1.5 before:rounded-r",
                        styles.leftAccent,
                        styles.hoverBorder
                      )}
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">
                        <div className="space-y-1">
                          <div className={cn("flex items-center gap-2", align)} dir="auto">
                            <h3 className="text-base sm:text-lg font-semibold text-white">
                              {t.contractLabel}{" "}
                              <span className="text-slate-300">{contract.contract_type || "—"}</span>
                            </h3>
                            <Badge className={styles.badge}>{statusLabel}</Badge>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-400" dir="auto">
                            {t.idLabel}:{" "}
                            <span className="tabular-nums" dir="ltr">
                              {contract.id}
                            </span>
                          </p>
                        </div>

                        <div className="flex md:items-center justify-end">
                          <Button variant="outline" size="sm" className="w-full md:w-auto bg-pink-600 hover:bg-pink-700 disabled:opacity-50">
                            <Download className="size-4 mr-2" />
                            {t.download}
                          </Button>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
                        <Meta
                          iconBg={styles.iconBg}
                          icon={<Calendar className={styles.iconFg} aria-hidden="true" />}
                          label={t.startDate}
                          value={longDate(contract.start_date ?? null)}
                          align={align}
                        />
                        <Meta
                          iconBg={contract.end_date ? styles.iconBg : "bg-slate-700/20"}
                          icon={<Calendar className={contract.end_date ? styles.iconFg : "text-slate-400"} aria-hidden="true" />}
                          label={t.endDate}
                          value={contract.end_date ? longDate(contract.end_date) : "—"}
                          align={align}
                        />
                        <Meta
                          iconBg="bg-sky-500/10"
                          icon={<DollarSign className="text-sky-400" aria-hidden="true" />}
                          label={t.salary}
                          value={<Money amount={salary} />}
                          align={align}
                        />
                        <Meta
                          iconBg="bg-slate-800"
                          icon={<FileText className="text-slate-300" aria-hidden="true" />}
                          label={t.uniforms}
                          value={
                            <span dir="auto">
                              <span className="tabular-nums" dir="ltr">
                                {uniforms}
                              </span>{" "}
                              {t.units}
                            </span>
                          }
                          align={align}
                        />
                      </div>

                      {contract.documents && (
                        <div className="mt-4">
                          <div className="text-xs text-slate-400 mb-1" dir="auto">
                            {t.documents}
                          </div>
                          <div className="rounded-xl border border-white/5 bg-slate-900/60 px-3 py-2 text-slate-200 text-sm overflow-hidden truncate" dir="auto">
                            {contract.documents}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="size-16 mx-auto text-slate-400/50 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2" dir="auto">
                  {t.noContractsTitle}
                </h3>
                <p className="text-slate-400" dir="auto">
                  {t.noContractsDesc}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_30px_rgba(0,0,0,0.35)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-base sm:text-lg" dir="auto">
              {t.quickActionsTitle}
            </CardTitle>
            <CardDescription className="text-slate-300" dir="auto">
              {t.quickActionsSubtitle}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Button className="h-12 bg-emerald-600 hover:bg-emerald-600/90">
                <FileText className="size-5 mr-2" aria-hidden="true" />
                {t.actionRequestCopy}
              </Button>
              <Button variant="outline" className="h-12 bg-transparent">
                <MapPin className="size-5 mr-2" aria-hidden="true" />
                {t.actionContactHR}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/* ————— Presentational building blocks ————— */

function ValueTile({
  label,
  value,
  align,
  mono,
}: {
  label: string
  value: React.ReactNode
  align: "text-left" | "text-right"
  mono?: boolean
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-slate-950/30 p-3 sm:p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className={cn("text-[10px] sm:text-xs font-medium text-slate-400 mb-1", align)} dir="auto">
        {label}
      </div>
      <div
        className={cn(
          "rounded-xl border border-white/5 bg-slate-900/60 px-3 py-2 text-sm sm:text-base font-semibold text-white",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
          align,
          mono && "tabular-nums"
        )}
        dir="auto"
      >
        {value}
      </div>
    </div>
  )
}

function StatusTile({
  label,
  status,
  activeLabel,
  inactiveLabel,
  align,
}: {
  label: string
  status: string
  activeLabel: string
  inactiveLabel: string
  align: "text-left" | "text-right"
}) {
  const isActive = String(status).toLowerCase() === "active"
  return (
    <div className="rounded-2xl border border-white/5 bg-slate-950/30 p-3 sm:p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className={cn("text-[10px] sm:text-xs font-medium text-slate-400 mb-1", align)} dir="auto">
        {label}
      </div>
      <div className={cn("flex", align === "text-right" ? "justify-end" : "justify-start")}>
        <Badge className={cn("px-2", isActive ? "bg-emerald-600 text-white" : "bg-slate-700 text-slate-100")} dir="auto">
          {isActive ? activeLabel : inactiveLabel}
        </Badge>
      </div>
    </div>
  )
}

function Meta({
  icon,
  iconBg,
  label,
  value,
  align,
}: {
  icon: React.ReactNode
  iconBg: string
  label: string
  value: React.ReactNode
  align: "text-left" | "text-right"
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-slate-950/30 p-3 sm:p-4">
      <div className="flex items-center gap-2">
        <div className={cn("size-8 rounded-lg flex items-center justify-center shrink-0", iconBg)}>{icon}</div>
        <div className="min-w-0">
          <p className="text-[10px] sm:text-xs text-slate-400" dir="auto">
            {label}
          </p>
          <p className={cn("text-sm sm:text-base font-medium text-white truncate", align)} dir="auto">
            {value}
          </p>
        </div>
      </div>
    </div>
  )
}

function ValueTileSkeleton() {
  return (
    <div className="rounded-2xl border border-white/5 bg-slate-950/30 p-3 sm:p-4">
      <div className="h-3 w-24 animate-pulse rounded bg-slate-700/40 mb-2" />
      <div className="h-9 sm:h-10 w-full animate-pulse rounded-xl bg-slate-800/50 border border-white/5" />
    </div>
  )
}

function ContractSkeleton() {
  return (
    <div className="relative rounded-2xl border border-slate-800/80 bg-slate-950/40 p-4 sm:p-5">
      <div className="absolute left-0 top-5 bottom-5 w-1.5 rounded-r bg-slate-700/50" />
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4 mb-4">
        <div className="space-y-2">
          <div className="h-5 w-56 animate-pulse rounded bg-slate-700/50" />
          <div className="h-4 w-40 animate-pulse rounded bg-slate-700/40" />
        </div>
        <div className="h-9 w-36 animate-pulse rounded bg-slate-700/40" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-white/5 bg-slate-950/30 p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-slate-800" />
              <div className="space-y-2">
                <div className="h-3 w-20 animate-pulse rounded bg-slate-700/40" />
                <div className="h-4 w-28 animate-pulse rounded bg-slate-700/50" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 h-10 w-full animate-pulse rounded-xl bg-slate-800/40 border border-white/5" />
    </div>
  )
}
