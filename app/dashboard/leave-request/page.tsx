"use client"

import { useMemo, useState } from "react"
import type React from "react"
import { useQuery, useMutation } from "@apollo/client"
import { Calendar, Plus, FileText, Clock, CheckCircle, XCircle } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

import { useAuth } from "@/lib/auth-context"
import { useLang, type Lang } from "@/lib/i18n"
import { CREATE_LEAVE_REQUEST, GET_LEAVE_REQUESTS } from "@/lib/graphql-queries"
import { toast } from "sonner"

type Dict = {
  headerTitle: string
  headerSubtitle: string
  newRequest: string

  formTitle: string
  formSubtitle: string
  typeLabel: string
  typePlaceholder: string
  startLabel: string
  endLabel: string
  durationLabel: string
  days: (n: number | string) => string
  reasonLabel: string
  reasonPlaceholder: string
  submit: string
  submitting: string
  cancel: string

  listTitle: string
  listSubtitleNone: string
  listSubtitleSome: (n: number) => string
  requestedOn: (d: string) => string
  startDate: string
  endDate: string
  duration: string
  reason: string
  managerComment: string
  adminComment: string
  noneFoundTitle: string
  noneFoundDesc: string
  createCta: string

  statusApproved: string
  statusRejected: string
  statusPending: string

  typeVacation: string
  typeSick: string
  typePersonal: string
  typeFamily: string
  typeMaternity: string
  typePaternity: string

  toastMissing: string
  toastCreated: string
  toastError: string
}

const translations: Record<Lang, Dict> = {
  fr: {
    headerTitle: "Demandes de congé",
    headerSubtitle: "Gérez vos demandes de congé",
    newRequest: "Nouvelle demande",

    formTitle: "Nouvelle demande de congé",
    formSubtitle: "Remplissez le formulaire pour soumettre votre demande",
    typeLabel: "Type de congé*",
    typePlaceholder: "Sélectionnez le type",
    startLabel: "Date de début*",
    endLabel: "Date de fin*",
    durationLabel: "Durée",
    days: (n) => `${n} jour(s)`,
    reasonLabel: "Motif (optionnel)",
    reasonPlaceholder: "Décrivez brièvement le motif de votre demande…",
    submit: "Soumettre la demande",
    submitting: "Soumission…",
    cancel: "Annuler",

    listTitle: "Mes demandes",
    listSubtitleNone: "Aucune demande trouvée",
    listSubtitleSome: (n) => `Vous avez ${n} demande(s) enregistrée(s)`,
    requestedOn: (d) => `Demandé le ${d}`,
    startDate: "Date de début",
    endDate: "Date de fin",
    duration: "Durée",
    reason: "Motif",
    managerComment: "Commentaire Manager",
    adminComment: "Commentaire Admin",
    noneFoundTitle: "Aucune demande trouvée",
    noneFoundDesc: "Vous n'avez pas encore soumis de demande de congé.",
    createCta: "Créer une demande",

    statusApproved: "Approuvé",
    statusRejected: "Rejeté",
    statusPending: "En attente",

    typeVacation: "Congés payés",
    typeSick: "Congé maladie",
    typePersonal: "Congé personnel",
    typeFamily: "Congé familial",
    typeMaternity: "Congé maternité",
    typePaternity: "Congé paternité",

    toastMissing: "Veuillez remplir tous les champs obligatoires",
    toastCreated: "Demande de congé soumise avec succès",
    toastError: "Erreur lors de la soumission de la demande",
  },
  ar: {
    headerTitle: "طلبات الإجازة",
    headerSubtitle: "قم بإدارة طلبات إجازتك",
    newRequest: "طلب جديد",

    formTitle: "طلب إجازة جديد",
    formSubtitle: "املأ النموذج لإرسال طلبك",
    typeLabel: "نوع الإجازة*",
    typePlaceholder: "اختر النوع",
    startLabel: "تاريخ البدء*",
    endLabel: "تاريخ الانتهاء*",
    durationLabel: "المدة",
    days: (n) => `${n} يوم`,
    reasonLabel: "السبب (اختياري)",
    reasonPlaceholder: "صف بإيجاز سبب طلبك…",
    submit: "إرسال الطلب",
    submitting: "جارٍ الإرسال…",
    cancel: "إلغاء",

    listTitle: "طلباتي",
    listSubtitleNone: "لا توجد طلبات",
    listSubtitleSome: (n) => `لديك ${n} طلب`,
    requestedOn: (d) => `تم الطلب في ${d}`,
    startDate: "تاريخ البدء",
    endDate: "تاريخ الانتهاء",
    duration: "المدة",
    reason: "السبب",
    managerComment: "تعليق المدير",
    adminComment: "تعليق الإدارة",
    noneFoundTitle: "لا توجد طلبات",
    noneFoundDesc: "لم ترسل أي طلب إجازة بعد.",
    createCta: "إنشاء طلب",

    statusApproved: "مقبول",
    statusRejected: "مرفوض",
    statusPending: "قيد الانتظار",

    typeVacation: "إجازة مدفوعة",
    typeSick: "إجازة مرضية",
    typePersonal: "إجازة شخصية",
    typeFamily: "إجازة عائلية",
    typeMaternity: "إجازة أمومة",
    typePaternity: "إجازة أبوة",

    toastMissing: "يرجى ملء جميع الحقول المطلوبة",
    toastCreated: "تم إرسال طلب الإجازة بنجاح",
    toastError: "حدث خطأ أثناء إرسال الطلب",
  },
}

type LeaveTypeValue = "vacation" | "sick" | "personal" | "family" | "maternity" | "paternity"

const typeKeys: LeaveTypeValue[] = ["vacation", "sick", "personal", "family", "maternity", "paternity"]

function statusKind(status?: string) {
  const s = String(status || "pending").toLowerCase()
  if (s === "approved") return "approved" as const
  if (s === "rejected") return "rejected" as const
  return "pending" as const
}

function kindStyles(kind: "approved" | "rejected" | "pending") {
  if (kind === "approved") {
    return {
      leftAccent: "before:bg-gradient-to-b before:from-emerald-500 before:to-emerald-400",
      badge: "bg-emerald-600 text-white",
      iconFg: "text-emerald-400",
      iconBg: "bg-emerald-500/10",
      borderHover: "hover:border-emerald-500/40",
    }
  }
  if (kind === "rejected") {
    return {
      leftAccent: "before:bg-gradient-to-b before:from-rose-500 before:to-rose-400",
      badge: "bg-rose-600 text-white",
      iconFg: "text-rose-400",
      iconBg: "bg-rose-500/10",
      borderHover: "hover:border-rose-500/40",
    }
  }
  return {
    leftAccent: "before:bg-gradient-to-b before:from-amber-500 before:to-amber-400",
    badge: "bg-amber-600 text-white",
    iconFg: "text-amber-400",
    iconBg: "bg-amber-500/10",
    borderHover: "hover:border-amber-500/40",
  }
}

export default function LeaveRequestPage() {
  const { user } = useAuth()
  const { lang, formatDate } = useLang()
  const t = translations[lang]
  const align = lang === "ar" ? "text-right" : "text-left"

  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    type: "" as LeaveTypeValue | "",
    start_date: "",
    end_date: "",
    reason: "",
  })

  const { data: leaveRequestsData, loading } = useQuery(GET_LEAVE_REQUESTS, {
    variables: { employee_id: user?.employee_id },
    skip: !user?.employee_id,
    fetchPolicy: "cache-and-network",
  })
  const [createLeaveRequest, { loading: creating }] = useMutation(CREATE_LEAVE_REQUEST)

  const leaveRequests = Array.isArray(leaveRequestsData?.leaveRequests) ? leaveRequestsData.leaveRequests : []

  const leaveTypes = useMemo(
    () =>
      typeKeys.map((key) => ({
        value: key,
        label:
          key === "vacation"
            ? t.typeVacation
            : key === "sick"
            ? t.typeSick
            : key === "personal"
            ? t.typePersonal
            : key === "family"
            ? t.typeFamily
            : key === "maternity"
            ? t.typeMaternity
            : t.typePaternity,
      })),
    [t]
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


  function calculateDays(startDate: string, endDate: string) {
    const start = new Date(startDate)
    const end = new Date(endDate)
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0
    const diff = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.type || !formData.start_date || !formData.end_date) {
      toast.error(t.toastMissing)
      return
    }
    try {
      await createLeaveRequest({
        variables: {
          employee_id: user?.employee_id,
          type: formData.type,
          start_date: formData.start_date,
          end_date: formData.end_date,
          reason: formData.reason,
        },
      })
      toast.success(t.toastCreated)
      setFormData({ type: "", start_date: "", end_date: "", reason: "" })
      setShowForm(false)
    } catch (err) {
      console.error("Error creating leave request:", err)
      toast.error(t.toastError)
    }
  }

  function StatusBadge({ status }: { status?: string }) {
    const kind = statusKind(status)
    return (
      <Badge className={cn("px-2", kind === "approved" ? "bg-emerald-600 text-white" : kind === "rejected" ? "bg-rose-600 text-white" : "bg-amber-600 text-white")}>
        {kind === "approved" ? <CheckCircle className="size-3 mr-1" /> : kind === "rejected" ? <XCircle className="size-3 mr-1" /> : <Clock className="size-3 mr-1" />}
        {kind === "approved" ? t.statusApproved : kind === "rejected" ? t.statusRejected : t.statusPending}
      </Badge>
    )
  }

  return (
    <div className="relative" dir="ltr">
      {/* Background gradient for visual consistency */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-purple-900/30 via-slate-900/30 to-slate-950" />

      <div className="mx-auto max-w-[1200px] px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-5 sm:space-y-6">
        {/* Header */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-800/70 p-4 sm:p-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <Calendar className="size-5 text-white" />
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
            <Button
              onClick={() => setShowForm((s) => !s)}
              className="bg-white/15 hover:bg-white/25 text-white border border-white/20"
            >
              <Plus className="size-4 mr-2" />
              {t.newRequest}
            </Button>
          </div>
        </div>

        {/* New Request Form */}
        {showForm && (
          <Card className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_30px_rgba(0,0,0,0.35)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-base sm:text-lg flex items-center gap-2" dir="auto">
                <Plus className="size-5" />
                {t.formTitle}
              </CardTitle>
              <CardDescription className="text-slate-300" dir="auto">
                {t.formSubtitle}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div
                  className="
                    grid gap-4
                    grid-cols-1
                    sm:grid-cols-2
                  "
                >
                  <div className="space-y-2">
                    <Label htmlFor="type" dir="auto">
                      {t.typeLabel}
                    </Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as LeaveTypeValue })}>
                      <SelectTrigger>
                        <SelectValue placeholder={t.typePlaceholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {leaveTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="start_date" dir="auto">
                      {t.startLabel}
                    </Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_date" dir="auto">
                      {t.endLabel}
                    </Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label dir="auto">{t.durationLabel}</Label>
                    <div className="rounded-xl border border-white/5 bg-slate-950/30 px-3 py-2 text-white">
                      <span className="text-base font-semibold">
                        {formData.start_date && formData.end_date ? t.days(calculateDays(formData.start_date, formData.end_date)) : t.days("--")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason" dir="auto">
                    {t.reasonLabel}
                  </Label>
                  <Textarea
                    id="reason"
                    placeholder={t.reasonPlaceholder}
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button type="submit" disabled={creating} className="h-11 bg-emerald-600 hover:bg-emerald-600/90">
                    {creating ? t.submitting : t.submit}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="h-11">
                    {t.cancel}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Requests List */}
        <Card className="rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_30px_rgba(0,0,0,0.35)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-base sm:text-lg flex items-center gap-2" dir="auto">
              <FileText className="size-5" />
              {t.listTitle}
            </CardTitle>
            <CardDescription className="text-slate-300" dir="auto">
              {loading ? "—" : leaveRequests.length > 0 ? t.listSubtitleSome(leaveRequests.length) : t.listSubtitleNone}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <RequestSkeleton key={`req-skel-${i}`} />
                ))}
              </div>
            ) : leaveRequests.length > 0 ? (
              <div className="space-y-4">
                {leaveRequests.map((req: any, i: number) => {
                  const kind = statusKind(req.status)
                  const styles = kindStyles(kind)
                  const typeLabel = leaveTypes.find((t) => t.value === req.type)?.label || req.type

                  return (
                    <div
                      key={req.id ?? i}
                      className={cn(
                        "relative rounded-2xl border border-slate-800/80 bg-slate-950/40 p-4 sm:p-5 transition-colors",
                        "before:absolute before:left-0 before:top-5 before:bottom-5 before:w-1.5 before:rounded-r",
                        styles.leftAccent,
                        styles.borderHover
                      )}
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4 mb-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2" dir="auto">
                            <h3 className="text-base sm:text-lg font-semibold text-white">{typeLabel}</h3>
                            <Badge className={styles.badge}>
                              {kind === "approved" ? t.statusApproved : kind === "rejected" ? t.statusRejected : t.statusPending}
                            </Badge>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-400" dir="auto">
                            {t.requestedOn(longDate(req.created_at))}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                        <Meta
                          iconBg={styles.iconBg}
                          icon={<Calendar className={styles.iconFg} aria-hidden="true" />}
                          label={t.startDate}
                          value={longDate(req.start_date)}
                          align={align}
                        />
                        <Meta
                          iconBg={styles.iconBg}
                          icon={<Calendar className={styles.iconFg} aria-hidden="true" />}
                          label={t.endDate}
                          value={longDate(req.end_date)}
                          align={align}
                        />
                        <Meta
                          iconBg="bg-slate-800"
                          icon={<Clock className="text-slate-300" aria-hidden="true" />}
                          label={t.duration}
                          value={
                            <span className="tabular-nums" dir="ltr">
                              {req.days_count} {t.days("")}
                            </span>
                          }
                          align={align}
                        />
                      </div>

                      {req.reason && (
                        <div className="mt-4">
                          <p className="text-xs text-slate-400 mb-1" dir="auto">
                            {t.reason}
                          </p>
                          <div className="rounded-xl border border-white/5 bg-slate-900/60 px-3 py-2 text-slate-200 text-sm" dir="auto">
                            {req.reason}
                          </div>
                        </div>
                      )}

                      {(req.manager_comment || req.admin_comment) && (
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {req.manager_comment && (
                            <CommentBlock label={t.managerComment} text={req.manager_comment} />
                          )}
                          {req.admin_comment && <CommentBlock label={t.adminComment} text={req.admin_comment} />}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="size-16 mx-auto text-slate-400/50 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2" dir="auto">
                  {t.noneFoundTitle}
                </h3>
                <p className="text-slate-400 mb-4" dir="auto">
                  {t.noneFoundDesc}
                </p>
                <Button onClick={() => setShowForm(true)} className="bg-emerald-600 hover:bg-emerald-600/90">
                  <Plus className="size-4 mr-2" />
                  {t.createCta}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/* ——— Presentational helpers ——— */

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

function CommentBlock({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-slate-950/30 p-3 sm:p-4">
      <p className="text-[10px] sm:text-xs text-slate-400 mb-1" dir="auto">
        {label}
      </p>
      <p className="text-sm text-slate-200" dir="auto">
        {text}
      </p>
    </div>
  )
}

function RequestSkeleton() {
  return (
    <div className="relative rounded-2xl border border-slate-800/80 bg-slate-950/40 p-4 sm:p-5">
      <div className="absolute left-0 top-5 bottom-5 w-1.5 rounded-r bg-slate-700/50" />
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4 mb-2">
        <div className="space-y-2">
          <div className="h-5 w-56 animate-pulse rounded bg-slate-700/50" />
          <div className="h-4 w-40 animate-pulse rounded bg-slate-700/40" />
        </div>
        <div className="h-9 w-32 animate-pulse rounded bg-slate-700/40" />
      </div>
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
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
      <div className="mt-3 h-10 w-full animate-pulse rounded-xl bg-slate-800/40 border border-white/5" />
    </div>
  )
}
