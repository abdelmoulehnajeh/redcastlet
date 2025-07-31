"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, Award, Minus } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useQuery } from "@apollo/client"
import { GET_EMPLOYEE } from "@/lib/graphql-queries"

export default function FinancePage() {
  const { user } = useAuth()

  const { data: employeeData } = useQuery(GET_EMPLOYEE, {
    variables: { id: user?.employee_id },
    skip: !user?.employee_id,
  })

  const employee = employeeData?.employee

  if (!employee) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  const salaryData = [
    {
      title: "Salaire de Base",
      value: `${employee.salaire}€`,
      description: "Salaire mensuel",
      icon: DollarSign,
      color: "text-primary",
      trend: null,
    },
    {
      title: "Prime",
      value: `${employee.prime}€`,
      description: "Prime mensuelle",
      icon: Award,
      color: "text-restaurant-green",
      trend: "up",
    },
    {
      title: "Bonus",
      value: `${employee.bonus}€`,
      description: "Bonus accumulé",
      icon: TrendingUp,
      color: "text-restaurant-green",
      trend: "up",
    },
    {
      title: "Avance",
      value: `${employee.avance}€`,
      description: "Avance sur salaire",
      icon: Minus,
      color: "text-restaurant-red",
      trend: "down",
    },
  ]

  const disciplinaryData = [
    {
      title: "Infractions",
      value: employee.infractions,
      description: "Infractions totales",
      icon: AlertTriangle,
      color: "text-red-500",
      max: 10,
    },
    {
      title: "Absences",
      value: employee.absence,
      description: "Jours d'absence",
      icon: TrendingDown,
      color: "text-orange-500",
      max: 15,
    },
    {
      title: "Retards",
      value: employee.retard,
      description: "Nombre de retards",
      icon: TrendingDown,
      color: "text-yellow-500",
      max: 20,
    },
  ]

  const totalSalary = employee.salaire + employee.prime + employee.bonus - employee.avance
  const performanceScore = Math.max(0, 100 - (employee.infractions * 5 + employee.absence * 3 + employee.retard * 2))

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-castle rounded-2xl p-6 text-white shadow-elegant">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">Finance</h1>
            <p className="text-white/90">Consultez vos informations financières</p>
          </div>
        </div>
      </div>

      {/* Salary Overview */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Résumé Salarial
          </CardTitle>
          <CardDescription>Votre rémunération mensuelle détaillée</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {salaryData.map((item, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                    <span className="text-sm font-medium text-muted-foreground">{item.title}</span>
                  </div>
                  {item.trend && (
                    <Badge variant={item.trend === "up" ? "default" : "destructive"} className="text-xs">
                      {item.trend === "up" ? "+" : "-"}
                    </Badge>
                  )}
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{item.value}</div>
                  <div className="text-xs text-muted-foreground">{item.description}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-accent/30 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Salaire Net Estimé</span>
              <span className="text-2xl font-bold text-foreground">{totalSalary}€</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">Calcul: Salaire + Prime + Bonus - Avance</div>
          </div>
        </CardContent>
      </Card>

      {/* Performance & Disciplinary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Score de Performance
            </CardTitle>
            <CardDescription>Basé sur votre assiduité et comportement</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground mb-2">{performanceScore}%</div>
              <Badge
                variant={performanceScore >= 80 ? "default" : performanceScore >= 60 ? "secondary" : "destructive"}
              >
                {performanceScore >= 80 ? "Excellent" : performanceScore >= 60 ? "Bon" : "À améliorer"}
              </Badge>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Performance globale</span>
                  <span>{performanceScore}%</span>
                </div>
                <Progress value={performanceScore} className="h-2" />
              </div>
            </div>

            <div className="text-xs text-muted-foreground text-center">
              Le score est calculé en fonction des infractions, absences et retards
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Données Disciplinaires
            </CardTitle>
            <CardDescription>Suivi de votre assiduité</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {disciplinaryData.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                    <span className="text-sm font-medium">{item.title}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-foreground">{item.value}</span>
                    <span className="text-xs text-muted-foreground">/{item.max}</span>
                  </div>
                </div>
                <Progress value={(item.value / item.max) * 100} className="h-2" />
                <div className="text-xs text-muted-foreground">{item.description}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Additional Info */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>Informations Complémentaires</CardTitle>
          <CardDescription>Détails sur votre situation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Tenue de Travail</h4>
              <div className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                <span className="text-sm">Tenues fournies</span>
                <Badge variant="outline">{employee.tenu_de_travail} unités</Badge>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Statut Employé</h4>
              <div className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                <span className="text-sm">Statut actuel</span>
                <Badge variant={employee.status === "active" ? "default" : "secondary"}>
                  {employee.status === "active" ? "Actif" : "Inactif"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
