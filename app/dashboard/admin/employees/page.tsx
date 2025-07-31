"use client"

import { useState } from "react"
import { useQuery, useMutation } from "@apollo/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Search, Plus, Edit, Trash2, Users, UserCheck, UserX, DollarSign } from "lucide-react"
import { GET_EMPLOYEES, GET_LOCATIONS, CREATE_EMPLOYEE, UPDATE_EMPLOYEE, DELETE_EMPLOYEE } from "@/lib/graphql-queries"
import { toast } from "sonner"
import Link from "next/link"

interface Employee {
  id: string
  nom: string
  prenom: string
  email: string
  telephone: string
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
  created_at: string
  location: {
    id: string
    name: string
  }
}

interface Location {
  id: string
  name: string
  address: string
}

export default function AdminEmployeesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [locationFilter, setLocationFilter] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [newEmployee, setNewEmployee] = useState({
    username: "",
    email: "",
    nom: "",
    prenom: "",
    telephone: "",
    job_title: "",
    salaire: "",
    role: "employee",
    location_id: "",
  })

  const { data: employeesData, loading: employeesLoading, refetch: refetchEmployees } = useQuery(GET_EMPLOYEES)
  const { data: locationsData } = useQuery(GET_LOCATIONS)
  const [createEmployee] = useMutation(CREATE_EMPLOYEE)
  const [updateEmployee] = useMutation(UPDATE_EMPLOYEE)
  const [deleteEmployee] = useMutation(DELETE_EMPLOYEE)

  const employees: Employee[] = employeesData?.employees || []
  const locations: Location[] = locationsData?.locations || []

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.job_title.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || employee.status === statusFilter
    const matchesLocation = locationFilter === "all" || employee.location?.id === locationFilter

    return matchesSearch && matchesStatus && matchesLocation
  })

  const handleCreateEmployee = async () => {
    try {
      await createEmployee({
        variables: {
          username: newEmployee.username,
          email: newEmployee.email,
          nom: newEmployee.nom,
          prenom: newEmployee.prenom,
          telephone: newEmployee.telephone,
          job_title: newEmployee.job_title,
          salaire: Number.parseFloat(newEmployee.salaire) || 0,
          role: newEmployee.role,
          location_id: newEmployee.location_id,
        },
      })

      toast.success("Employé créé avec succès")
      setIsCreateDialogOpen(false)
      setNewEmployee({
        username: "",
        email: "",
        nom: "",
        prenom: "",
        telephone: "",
        job_title: "",
        salaire: "",
        role: "employee",
        location_id: "",
      })
      refetchEmployees()
    } catch (error) {
      toast.error("Erreur lors de la création de l'employé")
      console.error("Error creating employee:", error)
    }
  }

  const handleUpdateEmployee = async (employee: Employee, updates: any) => {
    try {
      await updateEmployee({
        variables: {
          id: employee.id,
          ...updates,
        },
      })

      toast.success("Employé mis à jour avec succès")
      refetchEmployees()
    } catch (error) {
      toast.error("Erreur lors de la mise à jour")
      console.error("Error updating employee:", error)
    }
  }

  const handleDeleteEmployee = async (employeeId: string) => {
    try {
      await deleteEmployee({
        variables: { id: employeeId },
      })

      toast.success("Employé supprimé avec succès")
      refetchEmployees()
    } catch (error) {
      toast.error("Erreur lors de la suppression")
      console.error("Error deleting employee:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "Actif", variant: "default" as const },
      inactive: { label: "Inactif", variant: "secondary" as const },
      suspended: { label: "Suspendu", variant: "destructive" as const },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: "outline" as const }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  if (employeesLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Employés</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const activeEmployees = employees.filter((e) => e.status === "active").length
  const inactiveEmployees = employees.filter((e) => e.status === "inactive").length
  const totalSalaries = employees.reduce((sum, e) => sum + e.salaire, 0)
  const avgSalary = employees.length > 0 ? totalSalaries / employees.length : 0

  return (
    <div className="min-h-screen relative overflow-hidden">
  
      <div >
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-30 animate-float"
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
        <div className="glass-card backdrop-blur-futuristic p-4 sm:p-6 lg:p-8 text-white shadow-2xl transform hover:scale-[1.01] transition-all duration-500 animate-fade-in relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-700/30 to-blue-800/20 opacity-50"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] animate-[shimmer_3s_ease-in-out_infinite]"></div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 lg:space-x-6 relative z-10">
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 via-purple-600 to-blue-700 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-2xl animate-glow">
                <Users className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white drop-shadow-lg" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent leading-tight">
                Gestion des Employés
              </h1>
              <p className="text-slate-200 text-sm sm:text-base lg:text-lg font-medium">
                Tableau de bord des employés - Vue d'ensemble et gestion
              </p>
            </div>
          </div>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <Card className="glass-card backdrop-blur-futuristic border-0 shadow-2xl">
            <CardContent className="p-4 sm:p-5 lg:p-6 relative z-10 flex flex-col items-center">
              <Users className="w-8 h-8 text-blue-400 mb-2" />
              <div className="text-2xl font-bold text-white">{employees.length}</div>
              <div className="text-xs text-slate-200">Total Employés</div>
            </CardContent>
          </Card>
          <Card className="glass-card backdrop-blur-futuristic border-0 shadow-2xl">
            <CardContent className="p-4 sm:p-5 lg:p-6 relative z-10 flex flex-col items-center">
              <UserCheck className="w-8 h-8 text-green-400 mb-2" />
              <div className="text-2xl font-bold text-white">{activeEmployees}</div>
              <div className="text-xs text-slate-200">Employés Actifs</div>
            </CardContent>
          </Card>
          <Card className="glass-card backdrop-blur-futuristic border-0 shadow-2xl">
            <CardContent className="p-4 sm:p-5 lg:p-6 relative z-10 flex flex-col items-center">
              <UserX className="w-8 h-8 text-red-400 mb-2" />
              <div className="text-2xl font-bold text-white">{inactiveEmployees}</div>
              <div className="text-xs text-slate-200">Employés Inactifs</div>
            </CardContent>
          </Card>
          <Card className="glass-card backdrop-blur-futuristic border-0 shadow-2xl">
            <CardContent className="p-4 sm:p-5 lg:p-6 relative z-10 flex flex-col items-center">
              <DollarSign className="w-8 h-8 text-yellow-400 mb-2" />
              <div className="text-2xl font-bold text-white">{avgSalary.toLocaleString()}€</div>
              <div className="text-xs text-slate-200">Salaire Moyen</div>
            </CardContent>
          </Card>
        </div>
        {/* Filters */}
        <Card className="glass-card backdrop-blur-futuristic border-0 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white">Filtres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {/* Search Input - Full width on all screens */}
              <div className="w-full">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Rechercher par nom, email ou poste..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 glass-card backdrop-blur-futuristic bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>
              </div>
              
              {/* Select buttons - Side by side on mobile, responsive */}
              <div className="flex flex-col xs:flex-row gap-3 sm:gap-4">
                <div className="flex-1">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full glass-card backdrop-blur-futuristic bg-slate-800/50 border-slate-600 text-white">
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent className="glass-card backdrop-blur-futuristic bg-slate-900/95 border-slate-700 shadow-xl">
                      <SelectItem value="all" className="text-white hover:bg-slate-800/80 focus:bg-slate-800/80">Tous les statuts</SelectItem>
                      <SelectItem value="active" className="text-white hover:bg-slate-800/80 focus:bg-slate-800/80">Actif</SelectItem>
                      <SelectItem value="inactive" className="text-white hover:bg-slate-800/80 focus:bg-slate-800/80">Inactif</SelectItem>
                      <SelectItem value="suspended" className="text-white hover:bg-slate-800/80 focus:bg-slate-800/80">Suspendu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex-1">
                  <Select value={locationFilter} onValueChange={setLocationFilter}>
                    <SelectTrigger className="w-full glass-card backdrop-blur-futuristic bg-slate-800/50 border-slate-600 text-white">
                      <SelectValue placeholder="Restaurant" />
                    </SelectTrigger>
                    <SelectContent className="glass-card backdrop-blur-futuristic bg-slate-900/95 border-slate-700 shadow-xl">
                      <SelectItem value="all" className="text-white hover:bg-slate-800/80 focus:bg-slate-800/80">Tous les restaurants</SelectItem>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id} className="text-white hover:bg-slate-800/80 focus:bg-slate-800/80">
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Employees Table */}
        <Card className="glass-card backdrop-blur-futuristic border-0 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white">Liste des Employés</CardTitle>
            <CardDescription className="text-slate-200">Gérez tous vos employés et leurs informations</CardDescription>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0">
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvel Employé
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] glass-card backdrop-blur-futuristic bg-slate-900/95 border-slate-700 text-white">
                <DialogHeader>
                  <DialogTitle className="text-white">Créer un nouvel employé</DialogTitle>
                  <DialogDescription className="text-slate-200">Remplissez les informations de base pour créer un compte employé.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nom" className="text-white">Nom</Label>
                      <Input
                        id="nom"
                        value={newEmployee.nom}
                        onChange={(e) => setNewEmployee({ ...newEmployee, nom: e.target.value })}
                        className="glass-card backdrop-blur-futuristic bg-slate-800/50 border-slate-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prenom" className="text-white">Prénom</Label>
                      <Input
                        id="prenom"
                        value={newEmployee.prenom}
                        onChange={(e) => setNewEmployee({ ...newEmployee, prenom: e.target.value })}
                        className="glass-card backdrop-blur-futuristic bg-slate-800/50 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-white">Nom d'utilisateur</Label>
                      <Input
                        id="username"
                        value={newEmployee.username}
                        onChange={(e) => setNewEmployee({ ...newEmployee, username: e.target.value })}
                        className="glass-card backdrop-blur-futuristic bg-slate-800/50 border-slate-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newEmployee.email}
                        onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                        className="glass-card backdrop-blur-futuristic bg-slate-800/50 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="telephone" className="text-white">Téléphone</Label>
                      <Input
                        id="telephone"
                        value={newEmployee.telephone}
                        onChange={(e) => setNewEmployee({ ...newEmployee, telephone: e.target.value })}
                        className="glass-card backdrop-blur-futuristic bg-slate-800/50 border-slate-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="job_title" className="text-white">Poste</Label>
                      <Input
                        id="job_title"
                        value={newEmployee.job_title}
                        onChange={(e) => setNewEmployee({ ...newEmployee, job_title: e.target.value })}
                        className="glass-card backdrop-blur-futuristic bg-slate-800/50 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="salaire" className="text-white">Salaire (€)</Label>
                      <Input
                        id="salaire"
                        type="number"
                        value={newEmployee.salaire}
                        onChange={(e) => setNewEmployee({ ...newEmployee, salaire: e.target.value })}
                        className="glass-card backdrop-blur-futuristic bg-slate-800/50 border-slate-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-white">Restaurant</Label>
                      <Select
                        value={newEmployee.location_id}
                        onValueChange={(value) => setNewEmployee({ ...newEmployee, location_id: value })}
                      >
                        <SelectTrigger className="glass-card backdrop-blur-futuristic bg-slate-800/50 border-slate-600 text-white">
                          <SelectValue placeholder="Sélectionner un restaurant" />
                        </SelectTrigger>
                        <SelectContent className="glass-card backdrop-blur-futuristic bg-slate-900/95 border-slate-700 shadow-xl">
                          {locations.map((location) => (
                            <SelectItem key={location.id} value={location.id} className="text-white hover:bg-slate-800/80 focus:bg-slate-800/80">
                              {location.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-white">Rôle</Label>
                    <Select
                      value={newEmployee.role}
                      onValueChange={(value) => setNewEmployee({ ...newEmployee, role: value })}
                    >
                      <SelectTrigger className="glass-card backdrop-blur-futuristic bg-slate-800/50 border-slate-600 text-white">
                        <SelectValue placeholder="Sélectionner un rôle" />
                      </SelectTrigger>
                      <SelectContent className="glass-card backdrop-blur-futuristic bg-slate-900/95 border-slate-700 shadow-xl">
                        <SelectItem value="employee" className="text-white hover:bg-slate-800/80 focus:bg-slate-800/80">Employé</SelectItem>
                        <SelectItem value="manager" className="text-white hover:bg-slate-800/80 focus:bg-slate-800/80">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="glass-card backdrop-blur-futuristic bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50">
                    Annuler
                  </Button>
                  <Button onClick={handleCreateEmployee} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0">Créer l'employé</Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-200">Nom</TableHead>
                  <TableHead className="text-slate-200">Email</TableHead>
                  <TableHead className="text-slate-200">Poste</TableHead>
                  <TableHead className="text-slate-200">Restaurant</TableHead>
                  <TableHead className="text-slate-200">Salaire</TableHead>
                  <TableHead className="text-slate-200">Statut</TableHead>
                  <TableHead className="text-slate-200">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.id} className="border-slate-700 hover:bg-slate-800/20">
                    <TableCell className="font-medium text-white">
                      {employee.prenom} {employee.nom}
                    </TableCell>
                    <TableCell className="text-slate-200">{employee.email}</TableCell>
                    <TableCell className="text-slate-200">{employee.job_title}</TableCell>
                    <TableCell className="text-slate-200">{employee.location ? employee.location.name : "Non assigné"}</TableCell>
                    <TableCell className="text-slate-200">{employee.salaire.toLocaleString()}€</TableCell>
                    <TableCell>{getStatusBadge(employee.status)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Link href={`/dashboard/admin/employee/${employee.id}`}>
                          <Button variant="outline" size="sm" className="glass-card backdrop-blur-futuristic bg-slate-800/50 border-slate-600 text-blue-400 hover:bg-slate-700/50 hover:text-blue-300">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="glass-card backdrop-blur-futuristic bg-slate-800/50 border-slate-600 text-red-400 hover:bg-slate-700/50 hover:text-red-300">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="glass-card backdrop-blur-futuristic bg-slate-900/95 border-slate-700 text-white">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-white">Êtes-vous sûr ?</AlertDialogTitle>
                              <AlertDialogDescription className="text-slate-200">
                                Cette action ne peut pas être annulée. Cela supprimera définitivement l'employé
                                {employee.prenom} {employee.nom} et toutes ses données associées.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="glass-card backdrop-blur-futuristic bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50">Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteEmployee(employee.id)}
                                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-0"
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredEmployees.length === 0 && (
              <div className="text-center py-8 text-slate-400">Aucun employé trouvé</div>
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