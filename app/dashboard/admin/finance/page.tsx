"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { useQuery, useMutation } from "@apollo/client"
import { GET_EMPLOYEES, GET_LOCATIONS, UPDATE_EMPLOYEE } from "@/lib/graphql-queries"
import { toast } from "sonner"
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Search,
  Download,
  Calculator,
  CreditCard,
  Banknote,
  Minus,
  Plus,
} from "lucide-react"

interface Employee {
  id: string
  nom: string
  prenom: string
  email: string
  job_title: string
  salaire: number
  prime: number
  bonus: number
  avance: number
  infractions: number
  absence: number
  retard: number
  tenu_de_travail: number
  status: string
  location: {
    id: string
    name: string
  }
}

interface Location {
  id: string
  name: string
}

export default function AdminFinancePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [locationFilter, setLocationFilter] = useState("all")
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))

  const { data: employeesData, loading: employeesLoading, refetch } = useQuery(GET_EMPLOYEES)
  const { data: locationsData } = useQuery(GET_LOCATIONS)
  const [updateEmployee] = useMutation(UPDATE_EMPLOYEE)

  const employees: Employee[] = employeesData?.employees || []
  const locations: Location[] = locationsData?.locations || []

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesLocation = locationFilter === "all" || employee.location?.id === locationFilter

    return matchesSearch && matchesLocation && employee.status === "active"
  })

  const handleSalaryUpdate = async (employeeId: string, field: string, value: number) => {
    try {
      await updateEmployee({
        variables: {
          id: employeeId,
          [field]: value,
        },
      })

      toast.success("Salaire mis à jour avec succès")
      refetch()
    } catch (error) {
      toast.error("Erreur lors de la mise à jour")
      console.error("Error updating salary:", error)
    }
  }

  const calculateNetSalary = (employee: Employee) => {
    const baseSalary = employee.salaire || 0
    const prime = employee.prime || 0
    const bonus = employee.bonus || 0
    const avance = employee.avance || 0
    const penalties = (employee.infractions || 0) * 15 + (employee.retard || 0) * 15 + (employee.absence || 0) * 10

    return baseSalary + prime + bonus - avance - penalties
  }

  const totalSalaries = filteredEmployees.reduce((sum, emp) => sum + calculateNetSalary(emp), 0)
  const totalBonuses = filteredEmployees.reduce((sum, emp) => sum + (emp.bonus || 0), 0)
  const totalPenalties = filteredEmployees.reduce(
    (sum, emp) => sum + (emp.infractions || 0) * 15 + (emp.retard || 0) * 15 + (emp.absence || 0) * 10,
    0,
  )
  const totalAdvances = filteredEmployees.reduce((sum, emp) => sum + (emp.avance || 0), 0)

  if (employeesLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Finance</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  <Skeleton className="h-4 w-20" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden animate-fade-in">
      {/* Floating particles background (absolute, so sidebar stays visible) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-green-900/60 to-slate-900/80 backdrop-blur-[6px]" />
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-green-400 to-blue-400 rounded-full opacity-30 animate-float"
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
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/30 via-green-800/40 to-blue-900/30 opacity-70 rounded-2xl" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-[shimmer_3s_ease-in-out_infinite] rounded-2xl" />
          <div className="flex items-center space-x-4 relative z-10">
            <div className="w-12 h-12 bg-gradient-to-br from-green-700/40 to-blue-700/40 rounded-xl flex items-center justify-center border border-white/10">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1 bg-gradient-to-r from-white via-green-200 to-blue-200 bg-clip-text text-transparent">Gestion Financière</h1>
              <p className="text-slate-200 text-sm md:text-base">Salaires, primes, pénalités et avances</p>
            </div>
          </div>
        </div>

        {/* Financial Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="glass-card backdrop-blur-futuristic border border-white/10 shadow-2xl bg-gradient-to-br from-slate-900/70 via-green-900/60 to-slate-900/70">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Masse Salariale</CardTitle>
              <DollarSign className="h-4 w-4 text-green-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{totalSalaries.toLocaleString()}€</div>
              <p className="text-xs text-green-200">Total net à payer</p>
            </CardContent>
          </Card>

          <Card className="glass-card backdrop-blur-futuristic border border-white/10 shadow-2xl bg-gradient-to-br from-slate-900/70 via-green-900/60 to-slate-900/70">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Primes & Bonus</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">+{totalBonuses.toLocaleString()}€</div>
              <p className="text-xs text-blue-200">Récompenses</p>
            </CardContent>
          </Card>

          <Card className="glass-card backdrop-blur-futuristic border border-white/10 shadow-2xl bg-gradient-to-br from-slate-900/70 via-green-900/60 to-slate-900/70">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Pénalités</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">-{totalPenalties.toLocaleString()}€</div>
              <p className="text-xs text-red-200">Retards & absences</p>
            </CardContent>
          </Card>

          <Card className="glass-card backdrop-blur-futuristic border border-white/10 shadow-2xl bg-gradient-to-br from-slate-900/70 via-green-900/60 to-slate-900/70">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Avances</CardTitle>
              <CreditCard className="h-4 w-4 text-orange-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-400">-{totalAdvances.toLocaleString()}€</div>
              <p className="text-xs text-orange-200">À déduire</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="glass-card backdrop-blur-futuristic border border-white/10 shadow-2xl bg-gradient-to-br from-slate-900/70 via-green-900/60 to-slate-900/70">
          <CardHeader>
            <CardTitle className="text-white">Filtres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-green-300" />
                  <Input
                    placeholder="Rechercher un employé..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 glass-card bg-gradient-to-br from-slate-800/80 to-green-900/80 border border-white/10 text-white"
                  />
                </div>
              </div>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-[180px] glass-card bg-gradient-to-br from-slate-800/80 to-green-900/80 border border-white/10 text-white">
                  <SelectValue placeholder="Restaurant" />
                </SelectTrigger>
                <SelectContent className="glass-card bg-gradient-to-br from-slate-900/90 to-green-900/90 border border-white/10 text-white">
                  <SelectItem value="all" className="glass-card bg-transparent text-white">Tous les restaurants</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id} className="glass-card bg-transparent text-white">
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-[150px] glass-card bg-gradient-to-br from-slate-800/80 to-green-900/80 border border-white/10 text-white"
              />
              <Button variant="outline" className="glass-card bg-gradient-to-br from-slate-800/80 to-green-900/80 border border-white/10 text-white">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Salary Management Table */}
        <Card className="glass-card backdrop-blur-futuristic border border-white/10 shadow-2xl bg-gradient-to-br from-slate-900/70 via-green-900/60 to-slate-900/70">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Calculator className="w-5 h-5 mr-2" />
              Gestion des Salaires
            </CardTitle>
            <CardDescription className="text-green-200">Gérez les salaires, primes, pénalités et avances pour {selectedMonth}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table className="text-white">
              <TableHeader>
                <TableRow>
                  <TableHead>Employé</TableHead>
                  <TableHead>Restaurant</TableHead>
                  <TableHead>Salaire Base</TableHead>
                  <TableHead>Prime</TableHead>
                  <TableHead>Bonus</TableHead>
                  <TableHead>Avance</TableHead>
                  <TableHead>Pénalités</TableHead>
                  <TableHead>Net à Payer</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => {
                  const penalties =
                    (employee.infractions || 0) * 15 + (employee.retard || 0) * 15 + (employee.absence || 0) * 10
                  const netSalary = calculateNetSalary(employee)

                  return (
                    <TableRow key={employee.id} className="hover:bg-white/5 transition-colors">
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold text-white">
                            {employee.prenom} {employee.nom}
                          </div>
                          <div className="text-sm text-green-200">{employee.job_title}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-blue-200">{employee.location ? employee.location.name : "Non assigné"}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-white">{(employee.salaire || 0).toLocaleString()}€</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="glass-card bg-gradient-to-br from-slate-800/80 to-green-900/80 border border-white/10 text-white"
                            onClick={() => handleSalaryUpdate(employee.id, "prime", (employee.prime || 0) - 50)}
                            disabled={(employee.prime || 0) <= 0}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-16 text-center font-medium text-white">{(employee.prime || 0).toLocaleString()}€</span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="glass-card bg-gradient-to-br from-slate-800/80 to-green-900/80 border border-white/10 text-white"
                            onClick={() => handleSalaryUpdate(employee.id, "prime", (employee.prime || 0) + 50)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="glass-card bg-gradient-to-br from-slate-800/80 to-green-900/80 border border-white/10 text-white"
                            onClick={() => handleSalaryUpdate(employee.id, "bonus", (employee.bonus || 0) - 25)}
                            disabled={(employee.bonus || 0) <= 0}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-16 text-center font-medium text-blue-300">
                            {(employee.bonus || 0).toLocaleString()}€
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="glass-card bg-gradient-to-br from-slate-800/80 to-green-900/80 border border-white/10 text-white"
                            onClick={() => handleSalaryUpdate(employee.id, "bonus", (employee.bonus || 0) + 25)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="glass-card bg-gradient-to-br from-slate-800/80 to-green-900/80 border border-white/10 text-white"
                            onClick={() => handleSalaryUpdate(employee.id, "avance", (employee.avance || 0) - 50)}
                            disabled={(employee.avance || 0) <= 0}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-16 text-center font-medium text-orange-300">
                            {(employee.avance || 0).toLocaleString()}€
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="glass-card bg-gradient-to-br from-slate-800/80 to-green-900/80 border border-white/10 text-white"
                            onClick={() => handleSalaryUpdate(employee.id, "avance", (employee.avance || 0) + 50)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="text-red-400 font-medium">-{penalties}€</div>
                          <div className="text-xs text-red-200">
                            {employee.retard || 0}R • {employee.absence || 0}A • {employee.infractions || 0}I
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-bold text-lg">
                          <span className={netSalary >= 0 ? "text-green-400" : "text-red-400"}>
                            {netSalary.toLocaleString()}€
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="glass-card bg-gradient-to-br from-slate-800/80 to-green-900/80 border border-white/10 text-white">
                            <Banknote className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="glass-card bg-gradient-to-br from-slate-800/80 to-green-900/80 border border-white/10 text-white">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            {filteredEmployees.length === 0 && (
              <div className="text-center py-8 text-green-200">Aucun employé trouvé</div>
            )}
          </CardContent>
        </Card>
      </div>
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}
