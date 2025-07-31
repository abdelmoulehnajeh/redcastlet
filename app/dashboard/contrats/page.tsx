"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Download, Calendar, DollarSign, User, MapPin } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useQuery } from "@apollo/client"
import { GET_EMPLOYEE, GET_CONTRACTS } from "@/lib/graphql-queries"

export default function ContratsPage() {
  const { user } = useAuth()

  const { data: employeeData } = useQuery(GET_EMPLOYEE, {
    variables: { id: user?.employee_id },
    skip: !user?.employee_id,
  })

  const { data: contractsData } = useQuery(GET_CONTRACTS, {
    variables: { employee_id: user?.employee_id },
    skip: !user?.employee_id,
  })

  const employee = employeeData?.employee
  const contracts = contractsData?.contracts || []

  if (!employee) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
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

  const getContractStatus = (contract: any) => {
    const now = new Date()
    const startDate = new Date(contract.start_date)
    const endDate = contract.end_date ? new Date(contract.end_date) : null

    if (now < startDate) return { status: "À venir", variant: "secondary" as const }
    if (endDate && now > endDate) return { status: "Expiré", variant: "destructive" as const }
    return { status: "Actif", variant: "default" as const }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-castle rounded-2xl p-6 text-white shadow-elegant">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">Contrats</h1>
            <p className="text-white/90">Consultez vos informations contractuelles</p>
          </div>
        </div>
      </div>

      {/* Employee Info */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="w-5 h-5 mr-2" />
            Informations Employé
          </CardTitle>
          <CardDescription>Vos données personnelles et professionnelles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Nom Complet</label>
              <div className="text-lg font-semibold text-foreground">
                {employee.prenom} {employee.nom}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <div className="text-lg font-semibold text-foreground">{employee.email}</div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Téléphone</label>
              <div className="text-lg font-semibold text-foreground">{employee.telephone}</div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Poste</label>
              <div className="text-lg font-semibold text-foreground">{employee.job_title}</div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Statut</label>
              <Badge variant={employee.status === "active" ? "default" : "secondary"}>
                {employee.status === "active" ? "Actif" : "Inactif"}
              </Badge>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Date d'embauche</label>
              <div className="text-lg font-semibold text-foreground">{formatDate(employee.created_at)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contracts */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Mes Contrats
          </CardTitle>
          <CardDescription>
            {contracts.length > 0 ? `Vous avez ${contracts.length} contrat(s) enregistré(s)` : "Aucun contrat trouvé"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {contracts.length > 0 ? (
            <div className="space-y-4">
              {contracts.map((contract: any, index: number) => {
                const contractStatus = getContractStatus(contract)
                return (
                  <div key={index} className="border border-border rounded-xl p-6 hover:bg-accent/30 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold text-foreground">Contrat {contract.contract_type}</h3>
                          <Badge variant={contractStatus.variant}>{contractStatus.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">ID: {contract.id}</p>
                      </div>

                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Télécharger
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Date de début</p>
                          <p className="text-sm font-medium">{formatDate(contract.start_date)}</p>
                        </div>
                      </div>

                      {contract.end_date && (
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-restaurant-red/10 rounded-lg flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-restaurant-red" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Date de fin</p>
                            <p className="text-sm font-medium">{formatDate(contract.end_date)}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-restaurant-green/10 rounded-lg flex items-center justify-center">
                          <DollarSign className="w-4 h-4 text-restaurant-green" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Salaire</p>
                          <p className="text-sm font-medium">{contract.salary}€</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Tenues</p>
                          <p className="text-sm font-medium">{contract.tenu_count} unités</p>
                        </div>
                      </div>
                    </div>

                    {contract.documents && (
                      <div className="mt-4 p-3 bg-accent/30 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Documents</p>
                        <p className="text-sm">{contract.documents}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Aucun contrat trouvé</h3>
              <p className="text-muted-foreground">
                Vos contrats apparaîtront ici une fois qu'ils seront ajoutés par l'administration.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>Actions Rapides</CardTitle>
          <CardDescription>Gérez vos documents contractuels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button className="h-12 btn-restaurant">
              <FileText className="w-5 h-5 mr-2" />
              Demander une copie de contrat
            </Button>
            <Button variant="outline" className="h-12 bg-transparent">
              <MapPin className="w-5 h-5 mr-2" />
              Contacter les RH
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
