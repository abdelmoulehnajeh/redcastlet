"use client"
import { useState } from "react"
import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Plus, FileText, Clock, CheckCircle, XCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useMutation, useQuery } from "@apollo/client"
import { CREATE_LEAVE_REQUEST, GET_LEAVE_REQUESTS } from "@/lib/graphql-queries"
import { toast } from "sonner"

export default function LeaveRequestPage() {
  const { user } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    type: "",
    start_date: "",
    end_date: "",
    reason: "",
  })

  const { data: leaveRequestsData, refetch } = useQuery(GET_LEAVE_REQUESTS, {
    variables: { employee_id: user?.employee_id },
  })

  const [createLeaveRequest, { loading }] = useMutation(CREATE_LEAVE_REQUEST)

  const leaveRequests = leaveRequestsData?.leaveRequests || []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.type || !formData.start_date || !formData.end_date) {
      toast.error("Veuillez remplir tous les champs obligatoires")
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

      toast.success("Demande de congé soumise avec succès")
      setFormData({ type: "", start_date: "", end_date: "", reason: "" })
      setShowForm(false)
      refetch()
    } catch (error) {
      toast.error("Erreur lors de la soumission de la demande")
      console.error("Error creating leave request:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approuvé
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Rejeté
          </Badge>
        )
      case "pending":
      default:
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            En attente
          </Badge>
        )
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays
  }

  const leaveTypes = [
    { value: "vacation", label: "Congés payés" },
    { value: "sick", label: "Congé maladie" },
    { value: "personal", label: "Congé personnel" },
    { value: "family", label: "Congé familial" },
    { value: "maternity", label: "Congé maternité" },
    { value: "paternity", label: "Congé paternité" },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-castle rounded-2xl p-6 text-white shadow-elegant">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1">Demandes de Congé</h1>
              <p className="text-white/90">Gérez vos demandes de congé</p>
            </div>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle Demande
          </Button>
        </div>
      </div>

      {/* New Request Form */}
      {showForm && (
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Nouvelle Demande de Congé
            </CardTitle>
            <CardDescription>Remplissez le formulaire pour soumettre votre demande</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="type">Type de congé *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez le type" />
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
                  <Label htmlFor="start_date">Date de début *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">Date de fin *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Durée</Label>
                  <div className="p-3 bg-accent/30 rounded-lg">
                    <span className="text-lg font-semibold">
                      {formData.start_date && formData.end_date
                        ? `${calculateDays(formData.start_date, formData.end_date)} jour(s)`
                        : "-- jour(s)"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Motif (optionnel)</Label>
                <Textarea
                  id="reason"
                  placeholder="Décrivez brièvement le motif de votre demande..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex space-x-4">
                <Button type="submit" disabled={loading} className="btn-restaurant">
                  {loading ? "Soumission..." : "Soumettre la demande"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Requests List */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Mes Demandes
          </CardTitle>
          <CardDescription>
            {leaveRequests.length > 0
              ? `Vous avez ${leaveRequests.length} demande(s) enregistrée(s)`
              : "Aucune demande trouvée"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {leaveRequests.length > 0 ? (
            <div className="space-y-4">
              {leaveRequests.map((request: any, index: number) => (
                <div key={index} className="border border-border rounded-xl p-6 hover:bg-accent/30 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          {leaveTypes.find((t) => t.value === request.type)?.label || request.type}
                        </h3>
                        {getStatusBadge(request.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">Demandé le {formatDate(request.created_at)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Date de début</p>
                      <p className="text-sm font-medium">{formatDate(request.start_date)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Date de fin</p>
                      <p className="text-sm font-medium">{formatDate(request.end_date)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Durée</p>
                      <p className="text-sm font-medium">{request.days_count} jour(s)</p>
                    </div>
                  </div>

                  {request.reason && (
                    <div className="mb-4">
                      <p className="text-xs text-muted-foreground mb-1">Motif</p>
                      <p className="text-sm bg-accent/30 p-3 rounded-lg">{request.reason}</p>
                    </div>
                  )}

                  {(request.manager_comment || request.admin_comment) && (
                    <div className="space-y-2">
                      {request.manager_comment && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Commentaire Manager</p>
                          <p className="text-sm bg-blue-50 p-3 rounded-lg">{request.manager_comment}</p>
                        </div>
                      )}
                      {request.admin_comment && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Commentaire Admin</p>
                          <p className="text-sm bg-purple-50 p-3 rounded-lg">{request.admin_comment}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Aucune demande trouvée</h3>
              <p className="text-muted-foreground mb-4">Vous n'avez pas encore soumis de demande de congé.</p>
              <Button onClick={() => setShowForm(true)} className="btn-restaurant">
                <Plus className="w-4 h-4 mr-2" />
                Créer une demande
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
