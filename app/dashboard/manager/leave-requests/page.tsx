"use client"

import { useState } from "react"
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

export default function ManagerLeaveRequestsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [approvalComments, setApprovalComments] = useState("")
  const [approvalAction, setApprovalAction] = useState<"approve" | "reject">("approve")
  const { toast } = useToast()

  const { data, loading, error, refetch } = useQuery(GET_LEAVE_REQUESTS)
  const [approveLeaveRequest] = useMutation(APPROVE_LEAVE_REQUEST)

  const leaveRequests = data?.leaveRequests || []

  const filteredRequests = leaveRequests.filter((request: any) => {
    const employeeName = `${request.employee.profile?.first_name} ${request.employee.profile?.last_name}`.toLowerCase()
    const matchesSearch =
      employeeName.includes(searchTerm.toLowerCase()) ||
      request.employee.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.reason.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === "all" || request.status === filterStatus
    const matchesType = filterType === "all" || request.type === filterType

    return matchesSearch && matchesStatus && matchesType
  })

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
        title: "Demande traitée",
        description: `La demande de congé a été ${approvalAction === "approve" ? "approuvée" : "rejetée"}.`,
      })

      setShowApprovalDialog(false)
      setSelectedRequest(null)
      setApprovalComments("")
      refetch()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors du traitement de la demande.",
        variant: "destructive",
      })
    }
  }

  const openApprovalDialog = (request: any, action: "approve" | "reject") => {
    setSelectedRequest(request)
    setApprovalAction(action)
    setShowApprovalDialog(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            En attente
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Approuvé
          </Badge>
        )
      case "rejected":
        return <Badge variant="destructive">Rejeté</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "vacation":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Vacances
          </Badge>
        )
      case "sick":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Maladie
          </Badge>
        )
      case "personal":
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800">
            Personnel
          </Badge>
        )
      case "maternity":
        return (
          <Badge variant="outline" className="bg-pink-100 text-pink-800">
            Maternité
          </Badge>
        )
      default:
        return <Badge variant="outline">{type}</Badge>
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
            <h1 className="text-2xl sm:text-3xl font-bold">Demandes de Congé</h1>
            <p className="text-muted-foreground">Gérez les demandes de congé de votre équipe</p>
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
          <p className="text-red-600 mb-4">Erreur lors du chargement des demandes</p>
          <Button onClick={() => refetch()}>Réessayer</Button>
        </div>
      </div>
    )
  }

  const pendingRequests = leaveRequests.filter((req: any) => req.status === "pending").length
  const approvedRequests = leaveRequests.filter((req: any) => req.status === "approved").length
  const rejectedRequests = leaveRequests.filter((req: any) => req.status === "rejected").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Demandes de Congé</h1>
          <p className="text-muted-foreground">Gérez les demandes de congé de votre équipe</p>
        </div>
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-orange-500" />
          <span className="text-sm font-medium">{pendingRequests} en attente</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{pendingRequests}</p>
                <p className="text-sm text-muted-foreground">En attente</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Check className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{approvedRequests}</p>
                <p className="text-sm text-muted-foreground">Approuvées</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <X className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{rejectedRequests}</p>
                <p className="text-sm text-muted-foreground">Rejetées</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher par employé ou raison..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="approved">Approuvé</SelectItem>
                  <SelectItem value="rejected">Rejeté</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="vacation">Vacances</SelectItem>
                  <SelectItem value="sick">Maladie</SelectItem>
                  <SelectItem value="personal">Personnel</SelectItem>
                  <SelectItem value="maternity">Maternité</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leave Requests List */}
      <div className="space-y-4">
        {filteredRequests.map((request: any) => (
          <Card key={request.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center text-white font-bold">
                    {request.employee.profile?.first_name?.[0] || request.employee.username[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">
                      {request.employee.profile?.first_name} {request.employee.profile?.last_name}
                    </CardTitle>
                    <CardDescription className="truncate">@{request.employee.username}</CardDescription>
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
                <div>
                  <p className="text-muted-foreground">Date de début</p>
                  <p className="font-medium">{formatDate(request.start_date)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date de fin</p>
                  <p className="font-medium">{formatDate(request.end_date)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Durée</p>
                  <p className="font-medium">{calculateDays(request.start_date, request.end_date)} jour(s)</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Demandé le</p>
                  <p className="font-medium">{formatDate(request.created_at)}</p>
                </div>
              </div>

              {request.reason && (
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Raison</p>
                  <p className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">{request.reason}</p>
                </div>
              )}

              {request.status === "pending" && (
                <div className="flex justify-end space-x-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openApprovalDialog(request, "reject")}
                    className="text-red-600 hover:text-red-700 bg-transparent"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Rejeter
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => openApprovalDialog(request, "approve")}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Approuver
                  </Button>
                </div>
              )}

              {request.status !== "pending" && request.approved_by && (
                <div className="text-sm text-muted-foreground pt-2 border-t">
                  {request.status === "approved" ? "Approuvé" : "Rejeté"} par {request.approved_by.username} le{" "}
                  {formatDate(request.approved_at)}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucune demande trouvée</h3>
            <p className="text-muted-foreground">
              {searchTerm || filterStatus !== "all" || filterType !== "all"
                ? "Aucune demande ne correspond à vos critères de recherche."
                : "Aucune demande de congé pour le moment."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{approvalAction === "approve" ? "Approuver" : "Rejeter"} la demande</DialogTitle>
            <DialogDescription>
              {selectedRequest && (
                <>
                  Demande de {selectedRequest.employee.profile?.first_name}{" "}
                  {selectedRequest.employee.profile?.last_name}
                  du {formatDate(selectedRequest.start_date)} au {formatDate(selectedRequest.end_date)}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="comments">
                Commentaires {approvalAction === "reject" ? "(obligatoire)" : "(optionnel)"}
              </Label>
              <Textarea
                id="comments"
                placeholder={approvalAction === "approve" ? "Commentaires sur l'approbation..." : "Raison du rejet..."}
                value={approvalComments}
                onChange={(e) => setApprovalComments(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleApproval}
              className={
                approvalAction === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
              }
              disabled={approvalAction === "reject" && !approvalComments.trim()}
            >
              {approvalAction === "approve" ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Approuver
                </>
              ) : (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Rejeter
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
