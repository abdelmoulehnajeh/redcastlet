"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { useQuery, useMutation } from "@apollo/client"
import {
  GET_LEAVE_REQUESTS,
  APPROVE_LEAVE_REQUEST,
  GET_ADMIN_APPROVALS,
  APPROVE_SCHEDULE_CHANGE,
  REJECT_SCHEDULE_CHANGE,
} from "@/lib/graphql-queries"
import { toast } from "sonner"
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Calendar,
  Users,
  AlertTriangle,
  TrendingUp,
  Filter,
  RefreshCw,
  MessageSquare,
} from "lucide-react"

interface LeaveRequest {
  id: string
  employee_id: string
  type: string
  start_date: string
  end_date: string
  days_count: number
  reason: string
  status: string
  created_at: string
  manager_comment?: string
  admin_comment?: string
  employee: {
    id: string
    nom: string
    prenom: string
    profile: {
      first_name: string
      last_name: string
    }
  }
}

interface AdminApproval {
  id: string
  type: string
  status: string
  reference_id: string
  manager_id: string
  created_at: string
  reviewed_at?: string
  data: string
}

type Lang = "fr" | "ar"

type Dict = {
  approvalsTitle: string
  approvalsSubtitle: string
  approvalsSubtitleShort: string
  refresh: string
  // toasts
  refreshed: string
  refreshError: string
  leaveApproved: string
  leaveRejected: string
  decisionSaved: string
  processError: string
  processErrorDesc: string
  scheduleApproved: string
  scheduleRejected: string
  // stats
  statsPending: string
  statsApproved: string
  statsRejected: string
  statsTotal: string
  statsPendingDesc: string
  statsApprovedDesc: string
  statsRejectedDesc: string
  statsTotalDesc: string
  // filters
  filterAll: string
  filterPending: string
  filterApproved: string
  filterRejected: string
  // error card
  loadErrorTitle: string
  // notifications section
  systemNotifications: string
  actionsToProcess: string
  notificationsCount: (n: number) => string
  // notification card
  refLabel: string
  managerLabel: string
  createdLabel: string
  notifDataTitle: string
  adminCommentPlaceholder: string
  notifAccept: string
  notifReject: string
  // leave section
  leaveRequestsTitle: string
  leaveRequestsSubtitle: string
  leaveRequestsCount: (n: number) => string
  // leave types
  leaveTypes: Record<string, { label: string; icon: string }>
  // statuses
  statusPending: string
  statusApproved: string
  statusRejected: string
  // leave details
  startLabel: string
  endLabel: string
  durationLabel: string
  daysSuffix: string
  reasonTitle: string
  decisionCommentPlaceholder: string
  approveBtn: string
  rejectBtn: string
  loadingLabel: string
  // empty states
  noNotificationsTitle: string
  noNotificationsDesc: string
  noLeaveTitle: string
  noLeaveDesc: string
  // dates
  dateUnknown: string
}

const translations: Record<Lang, Dict> = {
  fr: {
    approvalsTitle: "Approbations Admin",
    approvalsSubtitle: "Validation finale des demandes managers et employés",
    approvalsSubtitleShort: "Valider les demandes",
    refresh: "Actualiser",
    refreshed: "Données actualisées",
    refreshError: "Erreur lors de l'actualisation",
    leaveApproved: "Demande de congé approuvée",
    leaveRejected: "Demande de congé rejetée",
    decisionSaved: "La décision a été enregistrée avec succès",
    processError: "Erreur lors du traitement",
    processErrorDesc: "Veuillez réessayer ou contacter le support",
    scheduleApproved: "Changement de planning approuvé",
    scheduleRejected: "Changement de planning rejeté",

    statsPending: "En Attente",
    statsApproved: "Approuvées",
    statsRejected: "Rejetées",
    statsTotal: "Total",
    statsPendingDesc: "Actions requises",
    statsApprovedDesc: "Validations réussies",
    statsRejectedDesc: "Demandes refusées",
    statsTotalDesc: "Toutes demandes",

    filterAll: "Toutes",
    filterPending: "En attente",
    filterApproved: "Approuvées",
    filterRejected: "Rejetées",

    loadErrorTitle: "Erreur de chargement",

    systemNotifications: "Demandes Managers",
    actionsToProcess: "Actions à traiter",
    notificationsCount: (n) => `${n} notification(s)`,

    refLabel: "Réf",
    managerLabel: "Manager",
    createdLabel: "Créé",
    notifDataTitle: "Données",
    adminCommentPlaceholder: "Commentaire administrateur (optionnel)...",
    notifAccept: "Approuver",
    notifReject: "Rejeter",

    leaveRequestsTitle: "Demandes de Congé Employés",
    leaveRequestsSubtitle: "Approuvez ou rejetez les demandes",
    leaveRequestsCount: (n) => `${n} demande(s)`,

    leaveTypes: {
      vacation: { label: "Congés payés", icon: "🏖️" },
      sick: { label: "Congé maladie", icon: "🏥" },
      personal: { label: "Congé personnel", icon: "👤" },
      family: { label: "Congé familial", icon: "👨‍👩‍👧‍👦" },
      maternity: { label: "Congé maternité", icon: "👶" },
      paternity: { label: "Congé paternité", icon: "👨‍👶" },
    },

    statusPending: "En attente",
    statusApproved: "Approuvée",
    statusRejected: "Rejetée",

    startLabel: "Début",
    endLabel: "Fin",
    durationLabel: "Durée",
    daysSuffix: "jour(s)",
    reasonTitle: "Motif de la demande",
    decisionCommentPlaceholder: "Votre commentaire sur cette décision...",
    approveBtn: "Approuver",
    rejectBtn: "Rejeter",
    loadingLabel: "En cours...",

    noNotificationsTitle: "Aucune demande manager",
    noNotificationsDesc: "Toutes les demandes managers sont traitées",
    noLeaveTitle: "Aucune demande en attente",
    noLeaveDesc: "Toutes les demandes de congé ont été traitées",

    dateUnknown: "Date inconnue",
  },
  ar: {
    approvalsTitle: "موافقات الإدارة",
    approvalsSubtitle: "المصادقة النهائية لطلبات المديرين والموظفين",
    approvalsSubtitleShort: "مصادقة الطلبات",
    refresh: "تحديث",
    refreshed: "تم تحديث البيانات",
    refreshError: "حدث خطأ أثناء التحديث",
    leaveApproved: "تمت الموافقة على طلب الإجازة",
    leaveRejected: "تم رفض طلب الإجازة",
    decisionSaved: "تم حفظ القرار بنجاح",
    processError: "حدث خطأ أثناء المعالجة",
    processErrorDesc: "يرجى المحاولة مرة أخرى",
    scheduleApproved: "تمت الموافقة على تغيير التخطيط",
    scheduleRejected: "تم رفض تغيير التخطيط",

    statsPending: "قيد الانتظار",
    statsApproved: "تمت الموافقة",
    statsRejected: "مرفوضة",
    statsTotal: "الإجمالي",
    statsPendingDesc: "إجراءات مطلوبة",
    statsApprovedDesc: "عمليات موافقة ناجحة",
    statsRejectedDesc: "طلبات مرفوضة",
    statsTotalDesc: "جميع الطلبات",

    filterAll: "الكل",
    filterPending: "قيد الانتظار",
    filterApproved: "موافق عليها",
    filterRejected: "مرفوضة",

    loadErrorTitle: "خطأ في التحميل",

    systemNotifications: "طلبات المدير",
    actionsToProcess: "إجراءات للمعالجة",
    notificationsCount: (n) => `${n} إشعار`,

    refLabel: "مرجع",
    managerLabel: "المدير",
    createdLabel: "تم الإنشاء",
    notifDataTitle: "البيانات",
    adminCommentPlaceholder: "تعليق المشرف (اختياري)...",
    notifAccept: "قبول",
    notifReject: "رفض",

    leaveRequestsTitle: "طلبات الإجازة للموظفين",
    leaveRequestsSubtitle: "الموافقة أو الرفض",
    leaveRequestsCount: (n) => `${n} طلب`,

    leaveTypes: {
      vacation: { label: "إجازة مدفوعة", icon: "🏖️" },
      sick: { label: "إجازة مرضية", icon: "🏥" },
      personal: { label: "إجازة شخصية", icon: "👤" },
      family: { label: "إجازة عائلية", icon: "👨‍👩‍👧‍👦" },
      maternity: { label: "إجازة أمومة", icon: "👶" },
      paternity: { label: "إجازة أبوة", icon: "👨‍👶" },
    },

    statusPending: "قيد الانتظار",
    statusApproved: "موافَق عليها",
    statusRejected: "مرفوضة",

    startLabel: "البداية",
    endLabel: "النهاية",
    durationLabel: "المدة",
    daysSuffix: "يوم",
    reasonTitle: "سبب الطلب",
    decisionCommentPlaceholder: "تعليقك على هذا القرار...",
    approveBtn: "الموافقة",
    rejectBtn: "رفض",
    loadingLabel: "جاري...",

    noNotificationsTitle: "لا توجد طلبات مدير",
    noNotificationsDesc: "تمت معالجة جميع ال��لبات",
    noLeaveTitle: "لا توجد طلبات قيد الانتظار",
    noLeaveDesc: "تمت معالجة جميع الطلبات",
    dateUnknown: "تاريخ غير معروف",
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

export default function AdminApprovalsPage() {
  const lang = useLang()
  const t = translations[lang]

  const [comments, setComments] = useState<{ [key: string]: string }>({})
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending")
  const [refreshing, setRefreshing] = useState(false)

  // Fetch admin approvals (requests from managers)
  const {
    data: adminApprovalsData,
    loading: loadingApprovals,
    refetch: refetchApprovals,
    error: approvalsError,
  } = useQuery(GET_ADMIN_APPROVALS, {
    variables: { status: filter === "all" ? undefined : filter },
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
  })

  // Fetch leave requests (from employees)
  const {
    data: leaveRequestsData,
    loading: loadingRequests,
    refetch: refetchRequests,
    error: requestsError,
  } = useQuery(GET_LEAVE_REQUESTS, {
    variables: { status: filter === "all" ? undefined : filter },
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
  })

  // Mutations
  const [approveLeaveRequest, { loading: approvingRequest }] = useMutation(APPROVE_LEAVE_REQUEST)
  const [approveScheduleChange, { loading: approvingSchedule }] = useMutation(APPROVE_SCHEDULE_CHANGE)
  const [rejectScheduleChange, { loading: rejectingSchedule }] = useMutation(REJECT_SCHEDULE_CHANGE)

  const adminApprovals: AdminApproval[] = adminApprovalsData?.adminApprovals || []
  const leaveRequests: LeaveRequest[] = leaveRequestsData?.leaveRequests || []

  const formatDate = (dateInput: string | number | null | undefined) => {
    let dateObj: Date | null = null
    if (dateInput) {
      if (typeof dateInput === "number") {
        dateObj = new Date(dateInput)
      } else if (typeof dateInput === "string") {
        const parsed = Date.parse(dateInput)
        if (!isNaN(parsed)) {
          dateObj = new Date(parsed)
        } else if (!isNaN(Number(dateInput))) {
          dateObj = new Date(Number(dateInput))
        }
      }
    }
    if (dateObj && !isNaN(dateObj.getTime())) {
      try {
        return new Intl.DateTimeFormat(lang === "ar" ? "ar" : "fr-FR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }).format(dateObj)
      } catch {
        return dateObj.toLocaleDateString(lang === "ar" ? "ar" : "fr-FR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      }
    }
    return t.dateUnknown
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await Promise.all([refetchApprovals(), refetchRequests()])
      toast.success(t.refreshed)
    } catch (error) {
      toast.error(t.refreshError)
    } finally {
      setRefreshing(false)
    }
  }

  const handleLeaveApproval = async (requestId: string, status: "approved" | "rejected") => {
    try {
      await approveLeaveRequest({
        variables: {
          id: requestId,
          status,
          comment: comments[requestId] || "",
        },
      })
      toast.success(status === "approved" ? t.leaveApproved : t.leaveRejected, {
        description: t.decisionSaved,
      })
      setComments((prev) => ({ ...prev, [requestId]: "" }))
      await refetchRequests()
    } catch (error) {
      toast.error(t.processError, { description: t.processErrorDesc })
      console.error("Error approving leave request:", error)
    }
  }

  const handleApprovalDecision = async (approvalId: string, status: "approved" | "rejected") => {
    try {
      if (status === "approved") {
        await approveScheduleChange({ variables: { approval_id: approvalId } })
        toast.success(t.scheduleApproved, { description: t.decisionSaved })
      } else {
        await rejectScheduleChange({ variables: { approval_id: approvalId, comment: comments[approvalId] || "" } })
        toast.success(t.scheduleRejected, { description: t.decisionSaved })
      }
      setComments((prev) => ({ ...prev, [approvalId]: "" }))
      await refetchApprovals()
    } catch (error) {
      toast.error(t.processError, { description: t.processErrorDesc })
      console.error("Error processing manager approval:", error)
    }
  }

  const totalPending =
    adminApprovals.filter((a) => a.status === "pending").length +
    leaveRequests.filter((r) => r.status === "pending").length
  const totalApproved =
    adminApprovals.filter((a) => a.status === "approved").length +
    leaveRequests.filter((r) => r.status === "approved").length
  const totalRejected =
    adminApprovals.filter((a) => a.status === "rejected").length +
    leaveRequests.filter((r) => r.status === "rejected").length

  const isLoading = loadingApprovals || loadingRequests || refreshing

  if (isLoading && !adminApprovals.length && !leaveRequests.length) {
    return <LoadingSkeleton />
  }

  return (
    <div className="min-h-screen relative overflow-hidden animate-fade-in" dir="ltr">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-indigo-900/60 to-slate-900/80 backdrop-blur-[6px]" />
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-indigo-400 to-blue-400 rounded-full opacity-30 animate-float"
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
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/30 via-purple-900/40 to-blue-900/30 opacity-70 rounded-2xl" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
            <div className="flex items-center space-x-3 sm:space-x-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-700/40 to-purple-700/40 rounded-xl sm:rounded-2xl flex items-center justify-center border border-white/10">
                <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h1
                  className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 tracking-tight bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent"
                  dir="auto"
                >
                  {t.approvalsTitle}
                </h1>
                <p className="text-slate-200 text-sm sm:text-base lg:text-lg hidden sm:block" dir="auto">
                  {t.approvalsSubtitle}
                </p>
                <p className="text-slate-200 text-sm sm:hidden" dir="auto">
                  {t.approvalsSubtitleShort}
                </p>
              </div>
            </div>
            <Button
              onClick={handleRefresh}
              variant="secondary"
              size="sm"
              className="glass-card bg-gradient-to-br from-slate-800/80 to-indigo-900/80 border border-white/10 text-white hover:bg-white/30 w-full sm:w-auto"
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              <span dir="auto">{t.refresh}</span>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <StatsCard
            title={translations[lang].statsPending}
            value={totalPending}
            icon={Clock}
            gradient="from-orange-500 to-amber-500"
            description={translations[lang].statsPendingDesc}
            glass
          />
          <StatsCard
            title={translations[lang].statsApproved}
            value={totalApproved}
            icon={CheckCircle}
            gradient="from-green-500 to-emerald-500"
            description={translations[lang].statsApprovedDesc}
            glass
          />
          <StatsCard
            title={translations[lang].statsRejected}
            value={totalRejected}
            icon={XCircle}
            gradient="from-red-500 to-rose-500"
            description={translations[lang].statsRejectedDesc}
            glass
          />
          <StatsCard
            title={translations[lang].statsTotal}
            value={totalPending + totalApproved + totalRejected}
            icon={TrendingUp}
            gradient="from-blue-500 to-cyan-500"
            description={translations[lang].statsTotalDesc}
            glass
          />
        </div>

        {/* Filter */}
        <Card className="glass-card backdrop-blur-futuristic border border-white/10 shadow-2xl bg-gradient-to-br from-slate-900/70 via-indigo-900/60 to-slate-900/70">
          <CardContent className="p-3 sm:p-6">
            <div className="flex flex-wrap gap-2">
              {(["all", "pending", "approved", "rejected"] as const).map((status) => {
                const isActive = filter === status
                let accent = ""
                if (status === "all") accent = "from-indigo-700/80 to-blue-700/80"
                if (status === "pending") accent = "from-orange-700/80 to-amber-700/80"
                if (status === "approved") accent = "from-green-700/80 to-emerald-700/80"
                if (status === "rejected") accent = "from-red-700/80 to-rose-700/80"
                const label =
                  status === "all"
                    ? translations[lang].filterAll
                    : status === "pending"
                      ? translations[lang].filterPending
                      : status === "approved"
                        ? translations[lang].filterApproved
                        : translations[lang].filterRejected
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setFilter(status)}
                    className={`glass-card border border-white/10 px-4 py-2 rounded-xl flex-1 sm:flex-none min-w-0 flex items-center justify-center gap-2 transition-all duration-200 text-xs sm:text-sm font-semibold shadow-md ${
                      isActive
                        ? `bg-gradient-to-br ${accent} text-white ring-2 ring-indigo-400/60`
                        : "bg-gradient-to-br from-slate-800/70 to-indigo-900/70 text-indigo-200 hover:ring-2 hover:ring-indigo-400/30"
                    }`}
                  >
                    <Filter
                      className={`w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 ${isActive ? "text-white" : "text-indigo-300"}`}
                    />
                    <span className="truncate" dir="auto">
                      {label}
                    </span>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Error */}
        {(approvalsError || requestsError) && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 text-red-700">
                <AlertTriangle className="w-5 h-5" />
                <div>
                  <p className="font-semibold" dir="auto">
                    {translations[lang].loadErrorTitle}
                  </p>
                  <p className="text-sm text-red-600" dir="auto">
                    {approvalsError?.message || requestsError?.message}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Manager Approvals */}
        <Card className="glass-card backdrop-blur-futuristic border border-white/10 shadow-2xl bg-gradient-to-br from-slate-900/70 via-indigo-900/60 to-slate-900/70">
          <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-xl" dir="auto">
                    {translations[lang].systemNotifications}
                  </CardTitle>
                  <CardDescription className="text-sm" dir="auto">
                    {translations[lang].actionsToProcess}
                  </CardDescription>
                </div>
              </div>
              {adminApprovals.length > 0 && (
                <Badge className="glass-card bg-gradient-to-br from-indigo-700/40 to-blue-700/40 text-indigo-100 border-0 px-2 py-1 text-xs sm:px-3 sm:text-sm self-start sm:self-auto shadow">
                  <span dir="auto">{translations[lang].notificationsCount(adminApprovals.length)}</span>
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            {adminApprovals.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {adminApprovals.map((notif) => (
                  <ApprovalCard
                    key={notif.id}
                    notification={notif}
                    comment={comments[notif.id] || ""}
                    onCommentChange={(value: string) => setComments((prev) => ({ ...prev, [notif.id]: value }))}
                    formatDate={formatDate}
                    t={translations[lang]}
                    onApprove={() => handleApprovalDecision(notif.id, "approved")}
                    onReject={() => handleApprovalDecision(notif.id, "rejected")}
                    loadingAction={approvingSchedule || rejectingSchedule}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={AlertTriangle}
                title={translations[lang].noNotificationsTitle}
                description={translations[lang].noNotificationsDesc}
              />
            )}
          </CardContent>
        </Card>

        {/* Leave Requests */}
        <Card className="glass-card backdrop-blur-futuristic border border-white/10 shadow-2xl bg-gradient-to-br from-slate-900/70 via-indigo-900/60 to-slate-900/70">
          <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-xl" dir="auto">
                    {translations[lang].leaveRequestsTitle}
                  </CardTitle>
                  <CardDescription className="text-sm" dir="auto">
                    {translations[lang].leaveRequestsSubtitle}
                  </CardDescription>
                </div>
              </div>
              {leaveRequests.length > 0 && (
                <Badge className="glass-card bg-gradient-to-br from-green-700/40 to-emerald-700/40 text-green-100 border-0 px-2 py-1 text-xs sm:px-3 sm:text-sm self-start sm:self-auto shadow">
                  <span dir="auto">{translations[lang].leaveRequestsCount(leaveRequests.length)}</span>
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            {leaveRequests.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {leaveRequests.map((request) => (
                  <LeaveRequestCard
                    key={request.id}
                    request={request}
                    comment={comments[request.id] || ""}
                    onCommentChange={(value: string) => setComments((prev) => ({ ...prev, [request.id]: value }))}
                    onApprove={() => handleLeaveApproval(request.id, "approved")}
                    onReject={() => handleLeaveApproval(request.id, "rejected")}
                    t={translations[lang]}
                    lang={lang}
                    formatDate={formatDate}
                    isLoading={approvingRequest}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={CheckCircle}
                title={translations[lang].noLeaveTitle}
                description={translations[lang].noLeaveDesc}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Skeleton
const LoadingSkeleton = () => (
  <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
    <div className="bg-gradient-to-r from-gray-300 to-gray-400 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-xl sm:rounded-2xl" />
        <div className="space-y-2">
          <div className="h-6 sm:h-8 w-48 sm:w-64 bg-white/20 rounded" />
          <div className="h-3 sm:h-4 w-32 sm:w-48 bg-white/20 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-3 sm:h-4 w-12 sm:w-16" />
                  <Skeleton className="h-6 sm:h-8 w-6 sm:w-8" />
                </div>
                <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </div>
)

const StatsCard = ({ title, value, icon: Icon, gradient, description, glass }: any) => (
  <Card
    className={`border-0 shadow-lg ${
      glass
        ? "glass-card backdrop-blur-futuristic border border-white/10 bg-gradient-to-br from-slate-900/70 via-indigo-900/60 to-slate-900/70"
        : "bg-white/70 backdrop-blur-sm"
    } hover:shadow-xl transition-all duration-300`}
  >
    <CardContent className="p-3 sm:p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-medium text-indigo-200 truncate" dir="auto">
            {title}
          </p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">{value}</p>
          <p className="text-xs text-indigo-200 hidden sm:block" dir="auto">
            {description}
          </p>
        </div>
        <div
          className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r ${gradient} rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 ml-2`}
        >
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
)

function ApprovalCard({
  notification,
  comment,
  onCommentChange,
  formatDate,
  t,
  onApprove,
  onReject,
  loadingAction,
}: {
  notification: AdminApproval
  comment: string
  onCommentChange: (v: string) => void
  formatDate: (d: string | number | null | undefined) => string
  t: Dict
  onApprove: () => void
  onReject: () => void
  loadingAction: boolean
}) {
  const statusClass =
    notification.status === "pending"
      ? "bg-gradient-to-br from-orange-700/40 to-amber-700/40 text-orange-100"
      : notification.status === "approved"
        ? "bg-gradient-to-br from-green-700/40 to-emerald-700/40 text-green-100"
        : "bg-gradient-to-br from-red-700/40 to-rose-700/40 text-red-100"
  const statusLabel =
    notification.status === "pending"
      ? t.statusPending
      : notification.status === "approved"
        ? t.statusApproved
        : t.statusRejected

  return (
    <div className="border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 glass-card bg-gradient-to-br from-slate-800/70 to-indigo-900/70 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse flex-shrink-0" />
            <h3 className="text-base sm:text-lg font-semibold text-foreground truncate" dir="auto">
              {notification.type.charAt(0).toUpperCase() + notification.type.slice(1).replace("_", " ")}
            </h3>
            <Badge className={`text-xs px-2 py-1 rounded-lg border-0 glass-card shadow ${statusClass}`}>
              <span dir="auto">{statusLabel}</span>
            </Badge>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-xs sm:text-sm text-muted-foreground">
            <span className="font-medium" dir="auto">
              {t.refLabel}: {notification.reference_id}
            </span>
            <span className="hidden sm:inline" dir="auto">
              {t.managerLabel}: {notification.manager_id}
            </span>
            <span dir="auto">
              {t.createdLabel}: {formatDate(notification.created_at)}
            </span>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4 glass-card bg-gradient-to-br from-slate-900/80 to-indigo-900/80 rounded-lg sm:rounded-xl">
        <p className="text-xs text-muted-foreground mb-2" dir="auto">
          {t.notifDataTitle}
        </p>
        <pre
          className="text-xs overflow-x-auto max-h-24 sm:max-h-32 whitespace-pre-wrap break-words text-slate-200"
          dir="auto"
        >
          {notification.data}
        </pre>
      </div>

      <div className="space-y-3">
        {notification.status === "pending" && (
          <>
            <Textarea
              placeholder={t.adminCommentPlaceholder}
              value={comment}
              onChange={(e) => onCommentChange(e.target.value)}
              rows={2}
              className="glass-card bg-gradient-to-br from-slate-900/80 to-indigo-900/80 border border-white/10 text-white text-sm"
            />
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button
                className="bg-green-600 hover:bg-green-700 text-white shadow-md flex-1 sm:flex-none glass-card"
                size="sm"
                onClick={onApprove}
                disabled={loadingAction}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                <span dir="auto">{t.notifAccept}</span>
              </Button>
              <Button
                variant="destructive"
                className="shadow-md flex-1 sm:flex-none glass-card"
                size="sm"
                onClick={onReject}
                disabled={loadingAction}
              >
                <XCircle className="w-4 h-4 mr-2" />
                <span dir="auto">{t.notifReject}</span>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function LeaveRequestCard({
  request,
  comment,
  onCommentChange,
  onApprove,
  onReject,
  t,
  lang,
  formatDate,
  isLoading,
}: {
  request: LeaveRequest
  comment: string
  onCommentChange: (v: string) => void
  onApprove: () => void
  onReject: () => void
  t: Dict
  lang: Lang
  formatDate: (d: string | number | null | undefined) => string
  isLoading: boolean
}) {
  const leaveMeta =
    t.leaveTypes[request.type] || ({ label: request.type, icon: "📄" } as { label: string; icon: string })
  const isPending = request.status === "pending"

  return (
    <div className="border border-white/10 rounded-2xl p-6 space-y-4 glass-card bg-gradient-to-br from-slate-800/70 to-indigo-900/70 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{leaveMeta.icon}</span>
            <div>
              <h3 className="text-lg font-semibold text-white" dir="auto">
                {leaveMeta.label}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <Users className="w-4 h-4 text-indigo-200" />
                <span className="text-sm text-indigo-200" dir="auto">
                  {request.employee.profile.first_name} {request.employee.profile.last_name}
                </span>
              </div>
            </div>
          </div>
        </div>
        <Badge
          className={`flex items-center gap-1 glass-card border-0 shadow ${
            isPending
              ? "bg-gradient-to-br from-amber-700/40 to-orange-700/40 text-amber-100"
              : request.status === "approved"
                ? "bg-gradient-to-br from-green-700/40 to-emerald-700/40 text-green-100"
                : "bg-gradient-to-br from-red-700/40 to-rose-700/40 text-red-100"
          }`}
        >
          <Clock className="w-3 h-3" />
          <span dir="auto">
            {isPending ? t.statusPending : request.status === "approved" ? t.statusApproved : t.statusRejected}
          </span>
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center space-x-3 p-3 glass-card bg-gradient-to-br from-blue-900/70 to-indigo-900/80 rounded-lg border border-white/10">
          <Calendar className="w-5 h-5 text-blue-200" />
          <div>
            <p className="text-xs text-blue-200" dir="auto">
              {t.startLabel}
            </p>
            <p className="text-sm font-medium text-white" dir="auto">
              {formatDate(request.start_date)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3 p-3 glass-card bg-gradient-to-br from-red-900/70 to-indigo-900/80 rounded-lg border border-white/10">
          <Calendar className="w-5 h-5 text-red-200" />
          <div>
            <p className="text-xs text-red-200" dir="auto">
              {t.endLabel}
            </p>
            <p className="text-sm font-medium text-white" dir="auto">
              {formatDate(request.end_date)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3 p-3 glass-card bg-gradient-to-br from-green-900/70 to-indigo-900/80 rounded-lg border border-white/10">
          <Clock className="w-5 h-5 text-green-200" />
          <div>
            <p className="text-xs text-green-200" dir="auto">
              {t.durationLabel}
            </p>
            <p className="text-sm font-medium text-white" dir="auto">
              {request.days_count} {t.daysSuffix}
            </p>
          </div>
        </div>
      </div>

      {request.reason && (
        <div className="p-4 glass-card bg-gradient-to-br from-amber-900/70 to-indigo-900/80 rounded-lg border-l-4 border-amber-400 border border-white/10">
          <div className="flex items-start space-x-2">
            <MessageSquare className="w-4 h-4 text-amber-200 mt-0.5" />
            <div>
              <p className="text-xs text-amber-200 font-medium mb-1" dir="auto">
                {t.reasonTitle}
              </p>
              <p className="text-sm text-white" dir="auto">
                {request.reason}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {isPending ? (
          <>
            <Textarea
              placeholder={t.decisionCommentPlaceholder}
              value={comment}
              onChange={(e) => onCommentChange(e.target.value)}
              rows={2}
              className="glass-card bg-gradient-to-br from-slate-900/90 to-indigo-900/90 border border-white/10 text-white placeholder:text-indigo-300 focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex space-x-3">
              <Button
                onClick={onApprove}
                disabled={isLoading}
                className="bg-green-700 hover:bg-green-800 text-white shadow-md flex-1 md:flex-none glass-card border border-white/10"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                <span dir="auto">{isLoading ? t.loadingLabel : t.approveBtn}</span>
              </Button>
              <Button
                onClick={onReject}
                disabled={isLoading}
                variant="destructive"
                className="shadow-md flex-1 md:flex-none glass-card border border-white/10"
              >
                <XCircle className="w-4 h-4 mr-2" />
                <span dir="auto">{t.rejectBtn}</span>
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}

function EmptyState({ icon: Icon, title, description }: any) {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 mx-auto mb-6 glass-card bg-gradient-to-br from-slate-800/70 to-indigo-900/70 rounded-full flex items-center justify-center">
        <Icon className="w-10 h-10 text-indigo-300" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2" dir="auto">
        {title}
      </h3>
      <p className="text-indigo-200 max-w-md mx-auto" dir="auto">
        {description}
      </p>
    </div>
  )
}
