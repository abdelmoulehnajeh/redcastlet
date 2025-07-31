"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { useQuery, useMutation } from "@apollo/client"
import { GET_LEAVE_REQUESTS, APPROVE_LEAVE_REQUEST, GET_ADMIN_APPROVALS } from "@/lib/graphql-queries"
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
  Eye,
  MessageSquare,
  Filter,
  RefreshCw
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

export default function AdminApprovalsPage() {
  const [comments, setComments] = useState<{ [key: string]: string }>({})
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [refreshing, setRefreshing] = useState(false)

  // Fetch admin approvals notifications
  const {
    data: adminApprovalsData,
    loading: loadingApprovals,
    refetch: refetchApprovals,
    error: approvalsError
  } = useQuery(GET_ADMIN_APPROVALS, {
    variables: { status: filter === 'all' ? undefined : filter },
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all'
  })

  // Fetch leave requests
  const {
    data: leaveRequestsData,
    loading: loadingRequests,
    refetch: refetchRequests,
    error: requestsError
  } = useQuery(GET_LEAVE_REQUESTS, {
    variables: { status: filter === 'all' ? undefined : filter },
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all'
  })

  const [approveLeaveRequest, { loading: approvingRequest }] = useMutation(APPROVE_LEAVE_REQUEST)

  const adminApprovals: AdminApproval[] = adminApprovalsData?.adminApprovals || []
  const leaveRequests: LeaveRequest[] = leaveRequestsData?.leaveRequests || []

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await Promise.all([refetchApprovals(), refetchRequests()])
      toast.success("Données actualisées")
    } catch (error) {
      toast.error("Erreur lors de l'actualisation")
    } finally {
      setRefreshing(false)
    }
  }

  const handleLeaveApproval = async (requestId: string, status: "approved" | "rejected") => {
    try {
      await approveLeaveRequest({
        variables: {
          id: requestId,
          status: status,
          comment: comments[requestId] || "",
        },
      })

      toast.success(
        `Demande de congé ${status === "approved" ? "approuvée" : "rejetée"}`,
        {
          description: `La décision a été enregistrée avec succès`,
        }
      )
      
      setComments(prev => ({ ...prev, [requestId]: "" }))
      await refetchRequests()
    } catch (error) {
      toast.error("Erreur lors du traitement", {
        description: "Veuillez réessayer ou contacter le support"
      })
      console.error("Error approving leave request:", error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const leaveTypes = {
    vacation: { label: "Congés payés", color: "bg-blue-500", icon: "🏖️" },
    sick: { label: "Congé maladie", color: "bg-red-500", icon: "🏥" },
    personal: { label: "Congé personnel", color: "bg-purple-500", icon: "👤" },
    family: { label: "Congé familial", color: "bg-green-500", icon: "👨‍👩‍👧‍👦" },
    maternity: { label: "Congé maternité", color: "bg-pink-500", icon: "👶" },
    paternity: { label: "Congé paternité", color: "bg-indigo-500", icon: "👨‍👶" },
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, icon: Clock, color: "text-orange-600" },
      approved: { variant: "default" as const, icon: CheckCircle, color: "text-green-600" },
      rejected: { variant: "destructive" as const, icon: XCircle, color: "text-red-600" }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const IconComponent = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const isLoading = loadingApprovals || loadingRequests || refreshing

  if (isLoading && !adminApprovals.length && !leaveRequests.length) {
    return <LoadingSkeleton />
  }

  const totalPending = adminApprovals.filter(a => a.status === 'pending').length + 
                      leaveRequests.filter(r => r.status === 'pending').length
  const totalApproved = adminApprovals.filter(a => a.status === 'approved').length + 
                       leaveRequests.filter(r => r.status === 'approved').length
  const totalRejected = adminApprovals.filter(a => a.status === 'rejected').length + 
                       leaveRequests.filter(r => r.status === 'rejected').length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Enhanced Header - Responsive */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl sm:rounded-3xl"></div>
          <div className="absolute inset-0 bg-black/20 rounded-2xl sm:rounded-3xl"></div>
          <div className="relative p-4 sm:p-6 lg:p-8 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-3 sm:space-x-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center border border-white/20">
                  <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 tracking-tight">
                    Approbations Admin
                  </h1>
                  <p className="text-white/90 text-sm sm:text-base lg:text-lg hidden sm:block">
                    Validation finale des demandes et notifications système
                  </p>
                  <p className="text-white/90 text-sm sm:hidden">
                    Validation des demandes
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleRefresh}
                variant="secondary"
                size="sm"
                className="bg-white/20 backdrop-blur-sm border-white/20 text-white hover:bg-white/30 w-full sm:w-auto"
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards - Fully Responsive */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <StatsCard
            title="En Attente"
            value={totalPending}
            icon={Clock}
            gradient="from-orange-500 to-amber-500"
            description="Actions requises"
          />
          <StatsCard
            title="Approuvées"
            value={totalApproved}
            icon={CheckCircle}
            gradient="from-green-500 to-emerald-500"
            description="Validations réussies"
          />
          <StatsCard
            title="Rejetées"
            value={totalRejected}
            icon={XCircle}
            gradient="from-red-500 to-rose-500"
            description="Demandes refusées"
          />
          <StatsCard
            title="Total"
            value={totalPending + totalApproved + totalRejected}
            icon={TrendingUp}
            gradient="from-blue-500 to-cyan-500"
            description="Toutes demandes"
          />
        </div>

        {/* Filter Tabs - Mobile Responsive */}
        <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
          <CardContent className="p-3 sm:p-6">
            <div className="flex flex-wrap gap-2">
              {['all', 'pending', 'approved', 'rejected'].map((status) => (
                <Button
                  key={status}
                  variant={filter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(status as any)}
                  className={`transition-all duration-200 flex-1 sm:flex-none min-w-0 ${
                    filter === status 
                      ? 'bg-indigo-600 text-white shadow-lg' 
                      : 'hover:bg-indigo-50 hover:border-indigo-200'
                  }`}
                >
                  <Filter className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                  <span className="text-xs sm:text-sm truncate">
                    {status === 'all' ? 'Toutes' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Error Handling */}
        {(approvalsError || requestsError) && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 text-red-700">
                <AlertTriangle className="w-5 h-5" />
                <div>
                  <p className="font-semibold">Erreur de chargement</p>
                  <p className="text-sm text-red-600">
                    {approvalsError?.message || requestsError?.message}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Admin Notifications - Mobile Responsive */}
        <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
          <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-xl">Notifications Système</CardTitle>
                  <CardDescription className="text-sm">Actions à traiter</CardDescription>
                </div>
              </div>
              {adminApprovals.length > 0 && (
                <Badge variant="secondary" className="px-2 py-1 text-xs sm:px-3 sm:text-sm self-start sm:self-auto">
                  {adminApprovals.length} notification(s)
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            {adminApprovals.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {adminApprovals.map((notif) => (
                  <NotificationCard
                    key={notif.id}
                    notification={notif}
                    comment={comments[notif.id] || ""}
                    onCommentChange={(value) => setComments(prev => ({ ...prev, [notif.id]: value }))}
                    formatDate={formatDateTime}
                  />
                ))}
              </div>
            ) : (
              <EmptyState 
                icon={AlertTriangle}
                title="Aucune notification"
                description="Toutes les notifications ont été traitées"
              />
            )}
          </CardContent>
        </Card>

        {/* Leave Requests - Mobile Responsive */}
        <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
          <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-xl">Demandes de Congé</CardTitle>
                  <CardDescription className="text-sm">Validation des demandes</CardDescription>
                </div>
              </div>
              {leaveRequests.length > 0 && (
                <Badge variant="secondary" className="px-2 py-1 text-xs sm:px-3 sm:text-sm self-start sm:self-auto">
                  {leaveRequests.length} demande(s)
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
                    onCommentChange={(value) => setComments(prev => ({ ...prev, [request.id]: value }))}
                    onApprove={() => handleLeaveApproval(request.id, "approved")}
                    onReject={() => handleLeaveApproval(request.id, "rejected")}
                    leaveTypes={leaveTypes}
                    formatDate={formatDate}
                    isLoading={approvingRequest}
                  />
                ))}
              </div>
            ) : (
              <EmptyState 
                icon={CheckCircle}
                title="Aucune demande en attente"
                description="Toutes les demandes de congé ont été traitées"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Component helpers - Responsive Updates
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
)

const StatsCard = ({ title, value, icon: Icon, gradient, description }: any) => (
  <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
    <CardContent className="p-3 sm:p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{title}</p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground hidden sm:block">{description}</p>
        </div>
        <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r ${gradient} rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 ml-2`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
)

const NotificationCard = ({ notification, comment, onCommentChange, formatDate }: any) => (
  <div className="border border-border/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 bg-gradient-to-r from-white to-gray-50 shadow-sm hover:shadow-md transition-all duration-200">
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
      <div className="space-y-2">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse flex-shrink-0" />
          <h3 className="text-base sm:text-lg font-semibold text-foreground truncate">
            {notification.type.charAt(0).toUpperCase() + notification.type.slice(1).replace('_', ' ')}
          </h3>
          <Badge variant={notification.status === "pending" ? "secondary" : notification.status === "approved" ? "default" : "destructive"} className="text-xs">
            {notification.status}
          </Badge>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-xs sm:text-sm text-muted-foreground">
          <span className="font-medium">Réf: {notification.reference_id}</span>
          <span className="hidden sm:inline">Manager: {notification.manager_id}</span>
          <span>Créé: {formatDate(notification.created_at)}</span>
        </div>
      </div>
    </div>

    <div className="p-3 sm:p-4 bg-slate-50 rounded-lg sm:rounded-xl">
      <p className="text-xs text-muted-foreground mb-2">Données de la notification</p>
      <pre className="text-xs overflow-x-auto max-h-24 sm:max-h-32 whitespace-pre-wrap break-words text-slate-700">
        {notification.data}
      </pre>
    </div>

    <div className="space-y-3">
      <Textarea
        placeholder="Commentaire administrateur (optionnel)..."
        value={comment}
        onChange={(e) => onCommentChange(e.target.value)}
        rows={2}
        className="border-slate-200 focus:border-indigo-300 text-sm"
      />
      
      {notification.status === "pending" && (
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button
            className="bg-green-600 hover:bg-green-700 text-white shadow-md flex-1 sm:flex-none"
            size="sm"
            onClick={() => toast.success("Notification acceptée (implémentation backend requise)")}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Accepter
          </Button>
          <Button
            variant="destructive"
            className="shadow-md flex-1 sm:flex-none"
            size="sm"
            onClick={() => toast.success("Notification rejetée (implémentation backend requise)")}
          >
            <XCircle className="w-4 h-4 mr-2" />
            Rejeter
          </Button>
        </div>
      )}
    </div>
  </div>
)

const LeaveRequestCard = ({ request, comment, onCommentChange, onApprove, onReject, leaveTypes, formatDate, isLoading }: any) => {
  const leaveType = leaveTypes[request.type as keyof typeof leaveTypes] || { 
    label: request.type, 
    color: "bg-gray-500", 
    icon: "📄" 
  }

  return (
    <div className="border border-border/50 rounded-2xl p-6 space-y-4 bg-gradient-to-r from-white to-blue-50/30 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{leaveType.icon}</span>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{leaveType.label}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {request.employee.profile.first_name} {request.employee.profile.last_name}
                </span>
              </div>
            </div>
          </div>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          En attente
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
          <Calendar className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-xs text-muted-foreground">Début</p>
            <p className="text-sm font-medium">{formatDate(request.start_date)}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
          <Calendar className="w-5 h-5 text-red-600" />
          <div>
            <p className="text-xs text-muted-foreground">Fin</p>
            <p className="text-sm font-medium">{formatDate(request.end_date)}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
          <Clock className="w-5 h-5 text-green-600" />
          <div>
            <p className="text-xs text-muted-foreground">Durée</p>
            <p className="text-sm font-medium">{request.days_count} jour(s)</p>
          </div>
        </div>
      </div>

      {request.reason && (
        <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-400">
          <div className="flex items-start space-x-2">
            <MessageSquare className="w-4 h-4 text-amber-600 mt-0.5" />
            <div>
              <p className="text-xs text-amber-700 font-medium mb-1">Motif de la demande</p>
              <p className="text-sm text-amber-800">{request.reason}</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <Textarea
          placeholder="Votre commentaire sur cette décision..."
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
          rows={2}
          className="border-slate-200 focus:border-indigo-300"
        />
        
        <div className="flex space-x-3">
          <Button
            onClick={onApprove}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 text-white shadow-md flex-1 md:flex-none"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            {isLoading ? "En cours..." : "Approuver"}
          </Button>
          <Button 
            onClick={onReject}
            disabled={isLoading}
            variant="destructive"
            className="shadow-md flex-1 md:flex-none"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Rejeter
          </Button>
        </div>
      </div>
    </div>
  )
}

const EmptyState = ({ icon: Icon, title, description }: any) => (
  <div className="text-center py-16">
    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
      <Icon className="w-10 h-10 text-gray-400" />
    </div>
    <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-muted-foreground max-w-md mx-auto">{description}</p>
  </div>
)