"use client"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { DollarSign, Users, TrendingUp, AlertTriangle, Award, Search, Edit, Save, X } from "lucide-react"
import { useQuery, useMutation } from "@apollo/client"
import { GET_EMPLOYEES, UPDATE_EMPLOYEE } from "@/lib/graphql-queries"
import { toast } from "sonner"

const salaryData = [
  { month: "Jan", total: 45000 },
  { month: "Fév", total: 48000 },
  { month: "Mar", total: 52000 },
  { month: "Avr", total: 49000 },
  { month: "Mai", total: 51000 },
  { month: "Jun", total: 54000 },
]

const expenseData = [
  { name: "Salaires", value: 75, color: "#10b981" },
  { name: "Primes", value: 15, color: "#f59e0b" },
  { name: "Bonus", value: 7, color: "#3b82f6" },
  { name: "Avances", value: 3, color: "#ef4444" },
]

export default function ManagerFinancePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [editingEmployee, setEditingEmployee] = useState<any>(null)
  const [editData, setEditData] = useState<any>({})

  const { data: employeesData, refetch } = useQuery(GET_EMPLOYEES)
  const [updateEmployee] = useMutation(UPDATE_EMPLOYEE)

  const employees = employeesData?.employees || []

  const filteredEmployees = employees.filter(
    (emp: any) =>
      emp.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.job_title.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleEdit = (employee: any) => {
    setEditData({
      salaire: employee.salaire || 0,
      prime: employee.prime || 0,
      bonus: employee.bonus || 0,
      avance: employee.avance || 0,
      infractions: employee.infractions || 0,
      absence: employee.absence || 0,
      retard: employee.retard || 0,
    })
    setEditingEmployee(employee)
  }

  const handleSave = async () => {
    try {
      await updateEmployee({
        variables: { id: editingEmployee.id, ...editData },
      })
      toast.success("Employé mis à jour avec succès")
      setEditingEmployee(null)
      refetch()
    } catch (error) {
      toast.error("Erreur lors de la mise à jour")
      console.error("Error updating employee:", error)
    }
  }

  const handleCancel = () => {
    setEditingEmployee(null)
    setEditData({})
  }

  const totalSalaries = employees.reduce((sum: number, emp: any) => sum + (emp.salaire || 0), 0)
  const totalPrimes = employees.reduce((sum: number, emp: any) => sum + (emp.prime || 0), 0)
  const totalBonus = employees.reduce((sum: number, emp: any) => sum + (emp.bonus || 0), 0)
  const totalAvances = employees.reduce((sum: number, emp: any) => sum + (emp.avance || 0), 0)
  const totalInfractions = employees.reduce((sum: number, emp: any) => sum + (emp.infractions || 0), 0)

  const stats = [
    {
      title: "Salaires Totaux",
      value: `${totalSalaries.toLocaleString()}€`,
      description: "Masse salariale",
      icon: DollarSign,
      color: "text-primary",
      trend: "+5.2%",
    },
    {
      title: "Primes",
      value: `${totalPrimes.toLocaleString()}€`,
      description: "Primes mensuelles",
      icon: Award,
      color: "text-green-600",
      trend: "+2.1%",
    },
    {
      title: "Bonus",
      value: `${totalBonus.toLocaleString()}€`,
      description: "Bonus accordés",
      icon: TrendingUp,
      color: "text-restaurant-green",
      trend: "+8.3%",
    },
    {
      title: "Infractions",
      value: totalInfractions.toString(),
      description: "Total équipe",
      icon: AlertTriangle,
      color: "text-red-500",
      trend: "-12.5%",
    },
  ]

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in p-2 sm:p-4 lg:p-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-castle rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-elegant">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="w-8 h-8 sm:w-12 sm:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold mb-1">Finance Équipe</h1>
            <p className="text-white/90 text-xs sm:text-sm lg:text-base">Gérez les finances de votre équipe</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="dashboard-card hover-scale shadow-elegant border-0 bg-gradient-to-br from-card to-card/80"
          >
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between space-x-2 mb-2">
                <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${stat.color} flex-shrink-0`} />
                <Badge variant={stat.trend.startsWith("+") ? "default" : "destructive"} className="text-xs">
                  {stat.trend}
                </Badge>
              </div>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground mb-1">{stat.value}</div>
              <div className="text-xs sm:text-sm font-medium text-muted-foreground">{stat.title}</div>
              <div className="text-xs text-muted-foreground mt-1 hidden sm:block">{stat.description}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="dashboard-card shadow-elegant border-0 bg-gradient-to-br from-card to-card/80">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center text-base sm:text-lg">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Évolution Salaires
            </CardTitle>
            <CardDescription className="text-sm">Masse salariale mensuelle</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <ChartContainer
              config={{
                total: {
                  label: "Total",
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-[200px] sm:h-[250px] lg:h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salaryData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="dashboard-card shadow-elegant border-0 bg-gradient-to-br from-card to-card/80">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center text-base sm:text-lg">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Répartition Dépenses
            </CardTitle>
            <CardDescription className="text-sm">Distribution des coûts</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <ChartContainer
              config={{
                expenses: {
                  label: "Dépenses",
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-[200px] sm:h-[250px] lg:h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {expenseData.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    {item.name}: {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee Finance Management */}
      <Card className="dashboard-card shadow-elegant border-0 bg-gradient-to-br from-card to-card/80">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center text-base sm:text-lg">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Gestion Financière Employés
          </CardTitle>
          <CardDescription className="text-sm">Modifiez les salaires, primes et sanctions</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          {/* Search */}
          <div className="relative mb-4 sm:mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Rechercher un employé..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-sm h-10 sm:h-12"
            />
          </div>

          {/* Employee List */}
          <div className="space-y-3 sm:space-y-4">
            {filteredEmployees.map((employee: any) => (
              <div
                key={employee.id}
                className="border border-border rounded-xl p-4 sm:p-6 hover:bg-accent/30 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-castle rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm sm:text-base font-semibold text-foreground mb-1 truncate">
                        {employee.prenom} {employee.nom}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">{employee.job_title}</p>
                    </div>
                  </div>

                  {editingEmployee?.id === employee.id ? (
                    <div className="space-y-3 sm:space-y-4 w-full lg:w-auto lg:min-w-[400px]">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs font-medium">Salaire</Label>
                          <Input
                            type="number"
                            value={editData.salaire}
                            onChange={(e) =>
                              setEditData({ ...editData, salaire: Number.parseInt(e.target.value) || 0 })
                            }
                            className="text-xs h-8"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-medium">Prime</Label>
                          <Input
                            type="number"
                            value={editData.prime}
                            onChange={(e) => setEditData({ ...editData, prime: Number.parseInt(e.target.value) || 0 })}
                            className="text-xs h-8"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-medium">Bonus</Label>
                          <Input
                            type="number"
                            value={editData.bonus}
                            onChange={(e) => setEditData({ ...editData, bonus: Number.parseInt(e.target.value) || 0 })}
                            className="text-xs h-8"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-medium">Avance</Label>
                          <Input
                            type="number"
                            value={editData.avance}
                            onChange={(e) => setEditData({ ...editData, avance: Number.parseInt(e.target.value) || 0 })}
                            className="text-xs h-8"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs font-medium">Infractions</Label>
                          <Input
                            type="number"
                            value={editData.infractions}
                            onChange={(e) =>
                              setEditData({ ...editData, infractions: Number.parseInt(e.target.value) || 0 })
                            }
                            className="text-xs h-8"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-medium">Absences</Label>
                          <Input
                            type="number"
                            value={editData.absence}
                            onChange={(e) =>
                              setEditData({ ...editData, absence: Number.parseInt(e.target.value) || 0 })
                            }
                            className="text-xs h-8"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-medium">Retards</Label>
                          <Input
                            type="number"
                            value={editData.retard}
                            onChange={(e) => setEditData({ ...editData, retard: Number.parseInt(e.target.value) || 0 })}
                            className="text-xs h-8"
                          />
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={handleSave}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white text-xs"
                        >
                          <Save className="w-3 h-3 mr-1" />
                          Sauver
                        </Button>
                        <Button onClick={handleCancel} variant="outline" size="sm" className="text-xs bg-transparent">
                          <X className="w-3 h-3 mr-1" />
                          Annuler
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 w-full lg:w-auto">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                        <div className="text-center">
                          <div className="text-sm sm:text-base font-bold text-foreground">{employee.salaire || 0}€</div>
                          <div className="text-xs text-muted-foreground">Salaire</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm sm:text-base font-bold text-green-600">{employee.prime || 0}€</div>
                          <div className="text-xs text-muted-foreground">Prime</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm sm:text-base font-bold text-restaurant-green">
                            {employee.bonus || 0}€
                          </div>
                          <div className="text-xs text-muted-foreground">Bonus</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm sm:text-base font-bold text-red-600">{employee.avance || 0}€</div>
                          <div className="text-xs text-muted-foreground">Avance</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 sm:gap-4">
                        <div className="text-center">
                          <div className="text-sm sm:text-base font-bold text-red-500">{employee.infractions || 0}</div>
                          <div className="text-xs text-muted-foreground">Infractions</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm sm:text-base font-bold text-orange-500">{employee.absence || 0}</div>
                          <div className="text-xs text-muted-foreground">Absences</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm sm:text-base font-bold text-yellow-500">{employee.retard || 0}</div>
                          <div className="text-xs text-muted-foreground">Retards</div>
                        </div>
                      </div>

                      <div className="flex justify-center">
                        <Button
                          onClick={() => handleEdit(employee)}
                          variant="outline"
                          size="sm"
                          className="text-xs sm:text-sm h-8 sm:h-10"
                        >
                          <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          Modifier
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Performance indicator */}
                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs sm:text-sm font-medium text-muted-foreground">Performance</span>
                    <span className="text-xs sm:text-sm font-bold text-foreground">
                      {Math.max(
                        0,
                        100 -
                          ((employee.infractions || 0) * 5 + (employee.absence || 0) * 3 + (employee.retard || 0) * 2),
                      )}
                      %
                    </span>
                  </div>
                  <Progress
                    value={Math.max(
                      0,
                      100 -
                        ((employee.infractions || 0) * 5 + (employee.absence || 0) * 3 + (employee.retard || 0) * 2),
                    )}
                    className="h-2"
                  />
                </div>
              </div>
            ))}
          </div>

          {filteredEmployees.length === 0 && (
            <div className="text-center py-8 sm:py-12">
              <Users className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">Aucun employé trouvé</h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm ? "Aucun employé ne correspond à votre recherche." : "Aucun employé disponible."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
