"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Users, Clock, DollarSign, AlertTriangle, TrendingUp, Calendar } from "lucide-react"
import { useQuery } from "@apollo/client"
import { GET_EMPLOYEES, GET_WORK_SCHEDULES } from "@/lib/graphql-queries"

const teamPerformanceData = [
  { month: "Jan", performance: 85 },
  { month: "Fév", performance: 88 },
  { month: "Mar", performance: 92 },
  { month: "Avr", performance: 87 },
  { month: "Mai", performance: 90 },
  { month: "Jun", performance: 94 },
]

const statusData = [
  { name: "Actifs", value: 12, color: "#10b981" },
  { name: "Congés", value: 3, color: "#f59e0b" },
  { name: "Absents", value: 1, color: "#ef4444" },
]

export default function ManagerDashboard() {
  const { data: employeesData } = useQuery(GET_EMPLOYEES)
  const { data: schedulesData } = useQuery(GET_WORK_SCHEDULES)

  const employees = employeesData?.employees || []
  const schedules = schedulesData?.workSchedules || []

  const activeEmployees = employees.filter((emp: any) => emp.status === "active").length
  const totalInfractions = employees.reduce((sum: number, emp: any) => sum + (emp.infractions || 0), 0)
  const totalAbsences = employees.reduce((sum: number, emp: any) => sum + (emp.absence || 0), 0)
  const averageSalary =
    employees.length > 0
      ? Math.round(employees.reduce((sum: number, emp: any) => sum + (emp.salaire || 0), 0) / employees.length)
      : 0

  const stats = [
    {
      title: "Équipe Active",
      value: activeEmployees.toString(),
      description: `${employees.length} employés total`,
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Heures Planifiées",
      value: `${schedules.length * 8}h`,
      description: "Cette semaine",
      icon: Clock,
      color: "text-restaurant-green",
    },
    {
      title: "Salaire Moyen",
      value: `${averageSalary}€`,
      description: "Par employé",
      icon: DollarSign,
      color: "text-restaurant-red",
    },
    {
      title: "Infractions",
      value: totalInfractions.toString(),
      description: `${totalAbsences} absences`,
      icon: AlertTriangle,
      color: "text-orange-500",
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-castle rounded-2xl p-6 text-white shadow-elegant">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">Tableau de Bord Manager</h1>
            <p className="text-white/90">Gérez votre équipe et les opérations</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="dashboard-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Performance Équipe
            </CardTitle>
            <CardDescription>Performance mensuelle de l'équipe</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                performance: {
                  label: "Performance",
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teamPerformanceData}>
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="performance" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Statut Équipe
            </CardTitle>
            <CardDescription>Répartition actuelle de l'équipe</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                status: {
                  label: "Statut",
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="flex justify-center space-x-4 mt-4">
              {statusData.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-muted-foreground">
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>Actions Rapides</CardTitle>
          <CardDescription>Accès rapide aux fonctionnalités de gestion</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button className="h-12 btn-restaurant">
              <Calendar className="w-5 h-5 mr-2" />
              Gérer Planning
            </Button>
            <Button className="h-12 btn-secondary-restaurant">
              <Users className="w-5 h-5 mr-2" />
              Voir Équipe
            </Button>
            <Button className="h-12 btn-secondary-restaurant">
              <Clock className="w-5 h-5 mr-2" />
              Pointeuse Équipe
            </Button>
            <Button className="h-12 btn-secondary-restaurant">
              <DollarSign className="w-5 h-5 mr-2" />
              Gestion Salaires
            </Button>
            <Button className="h-12 btn-secondary-restaurant">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Infractions
            </Button>
            <Button className="h-12 btn-secondary-restaurant">
              <TrendingUp className="w-5 h-5 mr-2" />
              Rapports
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
