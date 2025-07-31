"use client"
import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  User,
  Edit,
  Save,
  X,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Clock,
  FileText,
  Award,
} from "lucide-react"
import { useQuery, useMutation } from "@apollo/client"
import { GET_EMPLOYEE, GET_WORK_SCHEDULES, GET_CONTRACTS, UPDATE_EMPLOYEE } from "@/lib/graphql-queries"
import { toast } from "sonner"

export default function EmployeeDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const employeeId = params.id as string

  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<any>({})

  const { data: employeeData, refetch } = useQuery(GET_EMPLOYEE, {
    variables: { id: employeeId },
  })

  const { data: schedulesData } = useQuery(GET_WORK_SCHEDULES, {
    variables: { employee_id: employeeId },
  })

  const { data: contractsData } = useQuery(GET_CONTRACTS, {
    variables: { employee_id: employeeId },
  })

  const [updateEmployee] = useMutation(UPDATE_EMPLOYEE)

  const employee = employeeData?.employee
  const schedules = schedulesData?.workSchedules || []
  const contracts = contractsData?.contracts || []

  const handleEdit = () => {
    setEditData({
      salaire: employee?.salaire || 0,
      prime: employee?.prime || 0,
      infractions: employee?.infractions || 0,
      absence: employee?.absence || 0,
      retard: employee?.retard || 0,
      bonus: employee?.bonus || 0,
      avance: employee?.avance || 0,
      tenu_de_travail: employee?.tenu_de_travail || 0,
    })
    setIsEditing(true)
  }

  const handleSave = async () => {
    try {
      await updateEmployee({
        variables: { id: employeeId, ...editData },
      })
      toast.success("Employé mis à jour avec succès")
      setIsEditing(false)
      refetch()
    } catch (error) {
      toast.error("Erreur lors de la mise à jour")
      console.error("Error updating employee:", error)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditData({})
  }

  if (!employee) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] p-4">
        <div className="animate-spin rounded-full h-16 w-16 sm:h-32 sm:w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const performanceScore = Math.max(0, 100 - (employee.infractions * 5 + employee.absence * 3 + employee.retard * 2))
  const totalHours = schedules.reduce((sum: number, schedule: any) => {
    if (schedule.start_time && schedule.end_time) {
      const start = new Date(`2024-01-01 ${schedule.start_time}`)
      const end = new Date(`2024-01-01 ${schedule.end_time}`)
      const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
      return sum + diff
    }
    return sum
  }, 0)

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in p-2 sm:p-4 lg:p-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-castle rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-elegant">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-white hover:bg-white/20 p-1 sm:p-2 flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold mb-1 truncate">
                {employee.prenom} {employee.nom}
              </h1>
              <p className="text-white/90 text-xs sm:text-sm lg:text-base">{employee.job_title}</p>
            </div>
          </div>
          <div className="flex space-x-2 w-full sm:w-auto">
            {!isEditing ? (
              <Button
                onClick={handleEdit}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 text-xs sm:text-sm flex-1 sm:flex-none"
              >
                <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Modifier
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleSave}
                  className="bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm flex-1 sm:flex-none"
                >
                  <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Sauver
                </Button>
                <Button
                  onClick={handleCancel}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm flex-1 sm:flex-none"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Annuler
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <Card className="dashboard-card shadow-elegant border-0 bg-gradient-to-br from-card to-card/80">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center text-base sm:text-lg">
            <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Informations Personnelles
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-medium text-muted-foreground">Nom Complet</Label>
              <div className="text-sm sm:text-base font-semibold text-foreground">
                {employee.prenom} {employee.nom}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-medium text-muted-foreground">Email</Label>
              <div className="flex items-center space-x-2">
                <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm sm:text-base font-semibold text-foreground truncate">{employee.email}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-medium text-muted-foreground">Téléphone</Label>
              <div className="flex items-center space-x-2">
                <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm sm:text-base font-semibold text-foreground">{employee.telephone}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-medium text-muted-foreground">Poste</Label>
              <div className="text-sm sm:text-base font-semibold text-foreground">{employee.job_title}</div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-medium text-muted-foreground">Statut</Label>
              <Badge variant={employee.status === "active" ? "default" : "secondary"} className="text-xs sm:text-sm">
                {employee.status === "active" ? "Actif" : "Inactif"}
              </Badge>
            </div>
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-medium text-muted-foreground">Date d'embauche</Label>
              <div className="flex items-center space-x-2">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm sm:text-base font-semibold text-foreground">
                  {formatDate(employee.created_at)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Info */}
      <Card className="dashboard-card shadow-elegant border-0 bg-gradient-to-br from-card to-card/80">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center text-base sm:text-lg">
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Informations Financières
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { key: "salaire", label: "Salaire", icon: DollarSign, color: "text-primary" },
              { key: "prime", label: "Prime", icon: Award, color: "text-green-600" },
              { key: "bonus", label: "Bonus", icon: TrendingUp, color: "text-green-600" },
              { key: "avance", label: "Avance", icon: DollarSign, color: "text-red-600" },
            ].map((item) => (
              <div key={item.key} className="space-y-2">
                <Label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center">
                  <item.icon className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 ${item.color}`} />
                  {item.label}
                </Label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={editData[item.key] || 0}
                    onChange={(e) => setEditData({ ...editData, [item.key]: Number.parseInt(e.target.value) || 0 })}
                    className="text-sm h-8 sm:h-10"
                  />
                ) : (
                  <div className="text-lg sm:text-xl font-bold text-foreground">{employee[item.key] || 0}€</div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-accent/30 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">Salaire Net Estimé</span>
              <span className="text-lg sm:text-xl font-bold text-foreground">
                {employee.salaire + employee.prime + employee.bonus - employee.avance}€
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance & Disciplinary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="dashboard-card shadow-elegant border-0 bg-gradient-to-br from-card to-card/80">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center text-base sm:text-lg">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-6">
            <div className="text-center">
              <div className="text-2xl sm:text-4xl font-bold text-foreground mb-2">{performanceScore}%</div>
              <Badge
                variant={performanceScore >= 80 ? "default" : performanceScore >= 60 ? "secondary" : "destructive"}
                className="text-xs sm:text-sm"
              >
                {performanceScore >= 80 ? "Excellent" : performanceScore >= 60 ? "Bon" : "À améliorer"}
              </Badge>
            </div>
            <div>
              <div className="flex justify-between text-xs sm:text-sm mb-1">
                <span>Performance globale</span>
                <span>{performanceScore}%</span>
              </div>
              <Progress value={performanceScore} className="h-2" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="text-center">
                <div className="text-lg sm:text-xl font-bold text-foreground">{totalHours.toFixed(0)}h</div>
                <div className="text-xs text-muted-foreground">Heures travaillées</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-xl font-bold text-foreground">{schedules.length}</div>
                <div className="text-xs text-muted-foreground">Sessions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card shadow-elegant border-0 bg-gradient-to-br from-card to-card/80">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center text-base sm:text-lg">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Données Disciplinaires
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 space-y-3 sm:space-y-4">
            {[
              { key: "infractions", label: "Infractions", max: 10, color: "text-red-500" },
              { key: "absence", label: "Absences", max: 15, color: "text-orange-500" },
              { key: "retard", label: "Retards", max: 20, color: "text-yellow-500" },
            ].map((item) => (
              <div key={item.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-medium">{item.label}</span>
                  <div className="text-right">
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editData[item.key] || 0}
                        onChange={(e) => setEditData({ ...editData, [item.key]: Number.parseInt(e.target.value) || 0 })}
                        className="w-16 sm:w-20 h-6 sm:h-8 text-xs sm:text-sm"
                      />
                    ) : (
                      <>
                        <span className="text-sm sm:text-lg font-bold text-foreground">{employee[item.key] || 0}</span>
                        <span className="text-xs text-muted-foreground">/{item.max}</span>
                      </>
                    )}
                  </div>
                </div>
                {!isEditing && <Progress value={((employee[item.key] || 0) / item.max) * 100} className="h-2" />}
              </div>
            ))}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-medium">Tenues de travail</span>
                <div className="text-right">
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editData.tenu_de_travail || 0}
                      onChange={(e) =>
                        setEditData({ ...editData, tenu_de_travail: Number.parseInt(e.target.value) || 0 })
                      }
                      className="w-16 sm:w-20 h-6 sm:h-8 text-xs sm:text-sm"
                    />
                  ) : (
                    <span className="text-sm sm:text-lg font-bold text-foreground">
                      {employee.tenu_de_travail || 0}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="dashboard-card shadow-elegant border-0 bg-gradient-to-br from-card to-card/80">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center text-base sm:text-lg">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Activité Récente
          </CardTitle>
          <CardDescription className="text-sm">Dernières sessions de travail</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          {schedules.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {schedules.slice(0, 5).map((schedule: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium">{formatDate(schedule.date)}</p>
                      <p className="text-xs text-muted-foreground">
                        {schedule.shift_type} - {schedule.job_position}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs sm:text-sm font-medium">
                      {schedule.start_time} - {schedule.end_time || "En cours"}
                    </p>
                    <Badge variant={schedule.is_working ? "default" : "secondary"} className="text-xs">
                      {schedule.is_working ? "Actif" : "Terminé"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8 text-muted-foreground">
              <Clock className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Aucune activité récente</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contracts */}
      {contracts.length > 0 && (
        <Card className="dashboard-card shadow-elegant border-0 bg-gradient-to-br from-card to-card/80">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center text-base sm:text-lg">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Contrats
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="space-y-3 sm:space-y-4">
              {contracts.map((contract: any, index: number) => (
                <div key={index} className="border border-border rounded-lg p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm sm:text-base font-semibold">Contrat {contract.contract_type}</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Du {formatDate(contract.start_date)}
                        {contract.end_date && ` au ${formatDate(contract.end_date)}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm sm:text-base font-semibold">{contract.salary}€</p>
                      <p className="text-xs text-muted-foreground">{contract.tenu_count} tenues</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
