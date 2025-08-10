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
      value: `${averageSalary}DT`,
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
    <div className="min-h-screen relative overflow-hidden animate-fade-in">
      {/* Floating particles background (absolute, so sidebar stays visible) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-blue-900/60 to-slate-900/80 backdrop-blur-[6px]" />
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-blue-400 to-green-400 rounded-full opacity-30 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${6 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>
      <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-3 sm:p-4 lg:p-6 relative z-20 max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="glass-card backdrop-blur-futuristic p-4 sm:p-6 lg:p-8 text-white shadow-2xl animate-fade-in relative overflow-hidden border border-white/10">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 via-green-900/40 to-blue-900/30 opacity-70 rounded-2xl" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-[shimmer_3s_ease-in-out_infinite] rounded-2xl" />
          <div className="flex items-center space-x-4 relative z-10">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-700/40 to-green-700/40 rounded-xl flex items-center justify-center border border-white/10">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1 bg-gradient-to-r from-white via-blue-200 to-green-200 bg-clip-text text-transparent">Tableau de Bord Manager</h1>
              <p className="text-slate-200 text-sm md:text-base">Gérez votre équipe et les opérations</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="glass-card backdrop-blur-futuristic border border-white/10 shadow-2xl bg-gradient-to-br from-slate-900/70 via-blue-900/60 to-slate-900/70">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-700/40 to-green-700/40 rounded-xl flex items-center justify-center border border-white/10">
                    <stat.icon className={`w-6 h-6 ${stat.color} text-white`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-sm text-blue-200">{stat.title}</p>
                    <p className="text-xs text-green-200">{stat.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass-card backdrop-blur-futuristic border border-white/10 shadow-2xl bg-gradient-to-br from-slate-900/70 via-blue-900/60 to-slate-900/70">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <TrendingUp className="w-5 h-5 mr-2" />
                Performance Équipe
              </CardTitle>
              <CardDescription className="text-blue-200">Performance mensuelle de l'équipe</CardDescription>
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
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#a5b4fc' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#a5b4fc' }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="performance" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="glass-card backdrop-blur-futuristic border border-white/10 shadow-2xl bg-gradient-to-br from-slate-900/70 via-blue-900/60 to-slate-900/70">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Users className="w-5 h-5 mr-2" />
                Statut Équipe
              </CardTitle>
              <CardDescription className="text-blue-200">Répartition actuelle de l'équipe</CardDescription>
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
                    <div className="w-3 h-3 rounded-full border border-white/10" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-blue-200">
                      {item.name}: {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="glass-card backdrop-blur-futuristic border border-white/10 shadow-2xl bg-gradient-to-br from-slate-900/70 via-blue-900/60 to-slate-900/70">
          <CardHeader>
            <CardTitle className="text-white">Actions Rapides</CardTitle>
            <CardDescription className="text-blue-200">Accès rapide aux fonctionnalités de gestion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button className="h-12 glass-card bg-gradient-to-br from-blue-700/40 to-green-700/40 text-white border border-white/10 shadow">
                <Calendar className="w-5 h-5 mr-2" />
                Gérer Planning
              </Button>
              <Button className="h-12 glass-card bg-gradient-to-br from-blue-700/40 to-green-700/40 text-white border border-white/10 shadow">
                <Users className="w-5 h-5 mr-2" />
                Voir Équipe
              </Button>
              <Button className="h-12 glass-card bg-gradient-to-br from-blue-700/40 to-green-700/40 text-white border border-white/10 shadow">
                <Clock className="w-5 h-5 mr-2" />
                Pointeuse Équipe
              </Button>
              <Button className="h-12 glass-card bg-gradient-to-br from-blue-700/40 to-green-700/40 text-white border border-white/10 shadow">
                <DollarSign className="w-5 h-5 mr-2" />
                Gestion Salaires
              </Button>
              <Button className="h-12 glass-card bg-gradient-to-br from-blue-700/40 to-green-700/40 text-white border border-white/10 shadow">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Infractions
              </Button>
              <Button className="h-12 glass-card bg-gradient-to-br from-blue-700/40 to-green-700/40 text-white border border-white/10 shadow">
                <TrendingUp className="w-5 h-5 mr-2" />
                Rapports
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
