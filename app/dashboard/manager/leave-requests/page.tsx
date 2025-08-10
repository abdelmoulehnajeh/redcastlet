"use client"

import { useState, useMemo } from "react"
import { useQuery, useMutation } from "@apollo/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Calendar, Search, Check, X, Clock, AlertCircle } from "lucide-react"
import { GET_LEAVE_REQUESTS, APPROVE_LEAVE_REQUEST } from "@/lib/graphql-queries"
import { useToast } from "@/hooks/use-toast"
import { useLang, type Lang } from "@/lib/i18n"

type Dict = {
  headerTitle: string
  headerSubtitle: string
  pendingCount: (n: number) => string

  statPending: string
  statApproved: string
  statRejected: string

  searchPlaceholder: string
  filterStatus: string
  filterType: string
  all: string
  statusPending: string
  statusApproved: string
  statusRejected: string

  typeVacation: string
  typeSick: string
  typePersonal: string
  typeMaternity: string

  startDate: string
  endDate: string
  duration: string
  requestedOn: string
  reason: string
  days: (n: number) => string

  btnApprove: string
  btnReject: string
  labelApprovedBy: (name: string, date: string, approved: boolean) => string

  emptyTitle: string
  emptyFiltered: string
  emptyAll: string

  dialogTitleApprove: string
  dialogTitleReject: string
  dialogFor: (first: string, last: string, from: string, to: string) => string
  dialogComments: string
  dialogCommentsOpt: string
  dialogCommentsReq: string
  dialogCancel: string

  toastProcessedTitle: string
  toastProcessedDesc: (approved: boolean) => string
  toastErrorTitle: string
  toastErrorDesc: string

  loadingTitle: string
  loadingSubtitle: string
  errorLoad: string
  retry: string
}

const translations: Record<Lang, Dict> = {
  fr: {
    headerTitle: "Demandes de Congé",
    headerSubtitle: "Gérez les demandes de congé de votre équipe",
    pendingCount: (n) => `${n} en attente`,

    statPending: "En attente",
    statApproved: "Approuvées",
    statRejected: "Rejetées",

    searchPlaceholder: "Rechercher par employé ou raison...",
    filterStatus: "Statut",
    filterType: "Type",
    all: "Tous",
    statusPending: "En attente",
    statusApproved: "Approuvé",
    statusRejected: "Rejeté",

    typeVacation: "Vacances",
    typeSick: "Maladie",
    typePersonal: "Personnel",
    typeMaternity: "Maternité",

    startDate: "Date de début",
    endDate: "Date de fin",
    duration: "Durée",
    requestedOn: "Demandé le",
    reason: "Raison",
    days: (n) => `${n} jour(s)`,

    btnApprove: "Approuver",
    btnReject: "Rejeter",
    labelApprovedBy: (name, date, approved) => `${approved ? "Approuvé" : "Rejeté"} par ${name} le ${date}`,

    emptyTitle: "Aucune demande trouvée",
    emptyFiltered: "Aucune demande ne correspond à vos critères de recherche.",
    emptyAll: "Aucune demande de congé pour le moment.",

    dialogTitleApprove: "Approuver la demande",
    dialogTitleReject: "Rejeter la demande",
    dialogFor: (first, last, from, to) => `Demande de ${first} ${last} du ${from} au ${to}`,
    dialogComments: "Commentaires",
    dialogCommentsOpt: "(optionnel)",
    dialogCommentsReq: "(obligatoire)",
    dialogCancel: "Annuler",

    toastProcessedTitle: "Demande traitée",
    toastProcessedDesc: (approved) => `La demande de congé a été ${approved ? "approuvée" : "rejetée"}.`,
    toastErrorTitle: "Erreur",
    toastErrorDesc: "Erreur lors du traitement de la demande.",

    loadingTitle: "Demandes de Congé",
    loadingSubtitle: "Chargement des demandes...",
    errorLoad: "Erreur lors du chargement des demandes",
    retry: "Réessayer",
  },
  ar: {
    headerTitle: "طلبات الإجازة",
    headerSubtitle: "إدارة طلبات الإجازة لفريقك",
    pendingCount: (n) => `${n} قيد الانتظار`,

    statPending: "قيد الانتظار",
    statApproved: "مقبولة",
    statRejected: "مرفوضة",

    searchPlaceholder: "ابحث حسب الموظف أو السبب...",
    filterStatus: "الحالة",
    filterType: "النوع",
    all: "الكل",
    statusPending: "قيد الانتظار",
    statusApproved: "مقبول",
    statusRejected: "مرفوض",

    typeVacation: "إجازة",
    typeSick: "مرضية",
    typePersonal: "شخصية",
    typeMaternity: "أمومة",

    startDate: "تاريخ البدء",
    endDate: "تاريخ الانتهاء",
    duration: "المدة",
    requestedOn: "تم الطلب في",
    reason: "السبب",
    days: (n) => `${n} يوم`,

    btnApprove: "قبول",
    btnReject: "رفض",
    labelApprovedBy: (name, date, approved) => `${approved ? "قُبلت" : "رُفضت"} بواسطة ${name} في ${date}`,

    emptyTitle: "لا توجد طلبات",
    emptyFiltered: "لا توجد طلبات تطابق معايير البحث.",
    emptyAll: "لا توجد طلبات إجازة حاليًا.",

    dialogTitleApprove: "قبول الطلب",
    dialogTitleReject: "رفض الطلب",
    dialogFor: (first, last, from, to) => `طلب ${first} ${last} من ${from} إلى ${to}`,
    dialogComments: "التعليقات",
    dialogCommentsOpt: "(اختياري)",
    dialogCommentsReq: "(إلزامي)",
    dialogCancel: "إلغاء",

    toastProcessedTitle: "تم معالجة الطلب",
    toastProcessedDesc: (approved) => `تم ${approved ? "قبول" : "رفض"} طلب الإجازة.`,
    toastErrorTitle: "خطأ",
    toastErrorDesc: "حدث خطأ أثناء معالجة الطلب.",

    loadingTitle: "طلبات الإجازة",
    loadingSubtitle: "جارٍ تحميل الطلبات...",
    errorLoad: "حدث خطأ أثناء تحميل الطلبات",
    retry: "إعادة المحاولة",
  },
}

export default function ManagerLeaveRequestsPage() {
  const { lang, formatDate } = useLang()
  const t = translations[lang]
  const align = lang === "ar" ? "text-right" : "text-left"
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [approvalComments, setApprovalComments] = useState("")
  const [approvalAction, setApprovalAction] = useState<"approve" | "reject">("approve")

  const { data, loading, error, refetch } = useQuery(GET_LEAVE_REQUESTS)
  const [approveLeaveRequest] = useMutation(APPROVE_LEAVE_REQUEST)

  const leaveRequests = data?.leaveRequests || []

  const filteredRequests = useMemo(() => {
    return leaveRequests.filter((request: any) => {
      const first = request.employee.profile?.first_name || ""
      const last = request.employee.profile?.last_name || ""
      const employeeName = `${first} ${last}`.toLowerCase()
      const username = (request.employee.username || "").toLowerCase()
      const reason = (request.reason || "").toLowerCase()
      const s = searchTerm.toLowerCase()

      const matchesSearch = employeeName.includes(s) || username.includes(s) || reason.includes(s)
      const matchesStatus = filterStatus === "all" || request.status === filterStatus
      const matchesType = filterType === "all" || request.type === filterType
      return matchesSearch && matchesStatus && matchesType
    })
  }, [leaveRequests, searchTerm, filterStatus, filterType])

  const handleApproval = async () => {
    if (!selectedRequest) return
    try {
      await approveLeaveRequest({
        variables: {
          id: selectedRequest.id,
          approved: approvalAction === "approve",
          comments: approvalComments,
        },
      })
      toast({
        title: t.toastProcessedTitle,
        description: t.toastProcessedDesc(approvalAction === "approve"),
      })
      setShowApprovalDialog(false)
      setSelectedRequest(null)
      setApprovalComments("")
      refetch()
    } catch {
      toast({
        title: t.toastErrorTitle,
        description: t.toastErrorDesc,
        variant: "destructive",
      })
    }
  }

  const openApprovalDialog = (request: any, action: "approve" | "reject") => {
    setSelectedRequest(request)
    setApprovalAction(action)
    setShowApprovalDialog(true)
  }

  const longDate = (dateString: string) => {
    const d = new Date(dateString)
    return formatDate(d, { year: "numeric", month: "long", day: "numeric" })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800" dir="auto">
            {t.statusPending}
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800" dir="auto">
            {t.statusApproved}
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="destructive" dir="auto">
            {t.statusRejected}
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" dir="auto">
            {status}
          </Badge>
        )
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "vacation":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800" dir="auto">
            {t.typeVacation}
          </Badge>
        )
      case "sick":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800" dir="auto">
            {t.typeSick}
          </Badge>
        )
      case "personal":
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800" dir="auto">
            {t.typePersonal}
          </Badge>
        )
      case "maternity":
        return (
          <Badge variant="outline" className="bg-pink-100 text-pink-800" dir="auto">
            {t.typeMaternity}
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" dir="auto">
            {type}
          </Badge>
        )
    }
  }

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold" dir="auto">
              {t.loadingTitle}
            </h1>
            <p className="text-muted-foreground" dir="auto">
              {t.loadingSubtitle}
            </p>
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                  <div className="h-5 bg-gray-200 rounded w-16"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4" dir="auto">
            {t.errorLoad}
          </p>
          <Button onClick={() => refetch()}>{t.retry}</Button>
        </div>
      </div>
    )
  }

  const pendingRequests = leaveRequests.filter((req: any) => req.status === "pending").length
  const approvedRequests = leaveRequests.filter((req: any) => req.status === "approved").length
  const rejectedRequests = leaveRequests.filter((req: any) => req.status === "rejected").length

  return (
    <div className="relative min-h-screen py-8 px-2 sm:px-6 md:px-10 lg:px-20">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="w-full h-full animate-float bg-gradient-to-br from-[#23243a]/60 via-[#2d2e4a]/60 to-[#1a1b2e]/80 opacity-90 blur-2xl" />
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow" dir="auto">
            {t.headerTitle}
          </h1>
          <p className="text-muted-foreground" dir="auto">
            {t.headerSubtitle}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-glass-card px-4 py-2 rounded-xl shadow border border-white/10">
          <AlertCircle className="w-5 h-5 text-orange-400" />
          <span className="text-sm font-medium text-orange-200" dir="auto">
            {t.pendingCount(pendingRequests)}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
        <Card className="glass-card bg-gradient-to-br from-yellow-900/40 to-yellow-700/10 border-yellow-400/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-2xl font-bold text-yellow-100">{pendingRequests}</p>
                <p className="text-sm text-yellow-200/80" dir="auto">
                  {t.statPending}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card bg-gradient-to-br from-green-900/40 to-green-700/10 border-green-400/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Check className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-green-100">{approvedRequests}</p>
                <p className="text-sm text-green-200/80" dir="auto">
                  {t.statApproved}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card bg-gradient-to-br from-red-900/40 to-red-700/10 border-red-400/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <X className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-2xl font-bold text-red-100">{rejectedRequests}</p>
                <p className="text-sm text-red-200/80" dir="auto">
                  {t.statRejected}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="glass-card bg-gradient-to-br from-white/10 to-white/5 border-white/10">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-glass-card text-white placeholder:text-gray-300 border-white/10 focus:ring-accent/40"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32 glass-card bg-gradient-to-br from-white/10 to-white/5 border-white/10 text-white">
                  <SelectValue placeholder={t.filterStatus} />
                </SelectTrigger>
                <SelectContent className="glass-card bg-gradient-to-br from-white/10 to-white/5 border-white/10 text-white">
                  <SelectItem value="all">{t.all}</SelectItem>
                  <SelectItem value="pending">{t.statusPending}</SelectItem>
                  <SelectItem value="approved">{t.statusApproved}</SelectItem>
                  <SelectItem value="rejected">{t.statusRejected}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32 glass-card bg-gradient-to-br from-white/10 to-white/5 border-white/10 text-white">
                  <SelectValue placeholder={t.filterType} />
                </SelectTrigger>
                <SelectContent className="glass-card bg-gradient-to-br from-white/10 to-white/5 border-white/10 text-white">
                  <SelectItem value="all">{t.all}</SelectItem>
                  <SelectItem value="vacation">{t.typeVacation}</SelectItem>
                  <SelectItem value="sick">{t.typeSick}</SelectItem>
                  <SelectItem value="personal">{t.typePersonal}</SelectItem>
                  <SelectItem value="maternity">{t.typeMaternity}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leave Requests List */}
      <div className="space-y-4">
        {filteredRequests.map((request: any) => (
          <Card
            key={request.id}
            className="glass-card bg-gradient-to-br from-white/10 to-white/5 border-white/10 hover:shadow-xl transition-shadow"
          >
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    {request.employee.profile?.first_name?.[0] || request.employee.username[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate text-white drop-shadow" dir="auto">
                      {request.employee.profile?.first_name} {request.employee.profile?.last_name}
                    </CardTitle>
                    <CardDescription className="truncate text-gray-300">@{request.employee.username}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getTypeBadge(request.type)}
                  {getStatusBadge(request.status)}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className={align}>
                  <p className="text-muted-foreground" dir="auto">
                    {t.startDate}
                  </p>
                  <p className="font-medium text-white">{longDate(request.start_date)}</p>
                </div>
                <div className={align}>
                  <p className="text-muted-foreground" dir="auto">
                    {t.endDate}
                  </p>
                  <p className="font-medium text-white">{longDate(request.end_date)}</p>
                </div>
                <div className={align}>
                  <p className="text-muted-foreground" dir="auto">
                    {t.duration}
                  </p>
                  <p className="font-medium text-white">
                    {t.days(calculateDays(request.start_date, request.end_date))}
                  </p>
                </div>
                <div className={align}>
                  <p className="text-muted-foreground" dir="auto">
                    {t.requestedOn}
                  </p>
                  <p className="font-medium text-white">{longDate(request.created_at)}</p>
                </div>
              </div>

              {request.reason && (
                <div>
                  <p className="text-muted-foreground text-sm mb-1" dir="auto">
                    {t.reason}
                  </p>
                  <p className="text-sm bg-glass-card/80 p-3 rounded-lg text-white border border-white/10" dir="auto">
                    {request.reason}
                  </p>
                </div>
              )}

              {request.status === "pending" && (
                <div className="flex justify-end space-x-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openApprovalDialog(request, "reject")}
                    className="text-red-400 hover:text-red-500 border-red-400/40 bg-transparent hover:bg-red-900/10"
                  >
                    <X className="w-4 h-4 mr-1" />
                    {t.btnReject}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => openApprovalDialog(request, "approve")}
                    className="bg-green-600/90 hover:bg-green-700/90 text-white shadow"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    {t.btnApprove}
                  </Button>
                </div>
              )}

              {request.status !== "pending" && request.approved_by && (
                <div className="text-sm text-muted-foreground pt-2 border-t border-white/10" dir="auto">
                  {t.labelApprovedBy(
                    request.approved_by.username,
                    longDate(request.approved_at),
                    request.status === "approved",
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <Card className="glass-card bg-gradient-to-br from-white/10 to-white/5 border-white/10">
          <CardContent className="text-center py-12">
            <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2 text-white" dir="auto">
              {t.emptyTitle}
            </h3>
            <p className="text-muted-foreground" dir="auto">
              {searchTerm || filterStatus !== "all" || filterType !== "all" ? t.emptyFiltered : t.emptyAll}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="glass-card bg-gradient-to-br from-white/10 to-white/5 border-white/10 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-white drop-shadow" dir="auto">
              {approvalAction === "approve" ? t.dialogTitleApprove : t.dialogTitleReject}
            </DialogTitle>
            <DialogDescription className="text-gray-200" dir="auto">
              {selectedRequest &&
                t.dialogFor(
                  selectedRequest.employee.profile?.first_name || "",
                  selectedRequest.employee.profile?.last_name || "",
                  longDate(selectedRequest.start_date),
                  longDate(selectedRequest.end_date),
                )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="comments" className="text-white" dir="auto">
                {t.dialogComments} {approvalAction === "reject" ? t.dialogCommentsReq : t.dialogCommentsOpt}
              </Label>
              <Textarea
                id="comments"
                placeholder={approvalAction === "approve" ? `${t.dialogComments}...` : `${t.dialogComments}...`}
                value={approvalComments}
                onChange={(e) => setApprovalComments(e.target.value)}
                rows={3}
                className="bg-glass-card/80 text-white border-white/10 placeholder:text-gray-300"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowApprovalDialog(false)}
              className="text-white border-white/20"
            >
              {t.dialogCancel}
            </Button>
            <Button
              onClick={handleApproval}
              className={
                approvalAction === "approve"
                  ? "bg-green-600/90 hover:bg-green-700/90 text-white shadow"
                  : "bg-red-600/90 hover:bg-red-700/90 text-white shadow"
              }
              disabled={approvalAction === "reject" && !approvalComments.trim()}
            >
              {approvalAction === "approve" ? (
                <>
                  <Check className="w-4 h-4 mr-2" /> {t.btnApprove}
                </>
              ) : (
                <>
                  <X className="w-4 h-4 mr-2" /> {t.btnReject}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
