"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Clock,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  FileText,
  MapPin,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  Building,
  UserPlus,
} from "lucide-react"
import { useQuery, useMutation } from "@apollo/client"
import {
  GET_DASHBOARD_STATS,
  GET_LOCATIONS,
  GET_EMPLOYEES,
  CREATE_EMPLOYEE,
  DELETE_EMPLOYEE,
  UPDATE_EMPLOYEE,
} from "@/lib/graphql-queries"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

export default function DashboardPage() {
  const { user } = useAuth()
  const [showAllEmployees, setShowAllEmployees] = useState(false)
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false)
  const [isEditEmployeeOpen, setIsEditEmployeeOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
  const [newEmployee, setNewEmployee] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    job_title: "",
    salaire: "",
    location_id: "",
    role: "employee",
    username: "",
  })

  const { data, loading, error } = useQuery(GET_DASHBOARD_STATS, {
    variables: { userId: user?.id, role: user?.role },
  })

  const {
    data: locationsData,
    loading: locationsLoading,
    refetch: refetchLocations,
  } = useQuery(GET_LOCATIONS, {
    skip: user?.role !== "admin",
  })

  const {
    data: employeesData,
    loading: employeesLoading,
    refetch: refetchEmployees,
  } = useQuery(GET_EMPLOYEES, {
    skip: user?.role !== "admin",
  })

  const [createEmployee] = useMutation(CREATE_EMPLOYEE, {
    onCompleted: () => {
      toast.success("Employé créé avec succès")
      setIsAddEmployeeOpen(false)
      setNewEmployee({
        nom: "",
        prenom: "",
        email: "",
        telephone: "",
        job_title: "",
        salaire: "",
        location_id: "",
        role: "employee",
        username: "",
      })
      refetchEmployees()
      refetchLocations()
    },
    onError: (error) => {
      toast.error("Erreur lors de la création: " + error.message)
    },
  })

  const [deleteEmployee] = useMutation(DELETE_EMPLOYEE, {
    onCompleted: () => {
      toast.success("Employé supprimé avec succès")
      refetchEmployees()
      refetchLocations()
    },
    onError: (error) => {
      toast.error("Erreur lors de la suppression: " + error.message)
    },
  })

  const [updateEmployee] = useMutation(UPDATE_EMPLOYEE, {
    onCompleted: () => {
      toast.success("Employé mis à jour avec succès")
      setIsEditEmployeeOpen(false)
      setSelectedEmployee(null)
      refetchEmployees()
      refetchLocations()
    },
    onError: (error) => {
      toast.error("Erreur lors de la mise à jour: " + error.message)
    },
  })

  const handleCreateEmployee = () => {
    if (!newEmployee.nom || !newEmployee.prenom || !newEmployee.email || !newEmployee.username) {
      toast.error("Veuillez remplir tous les champs obligatoires")
      return
    }

    createEmployee({
      variables: {
        nom: newEmployee.nom,
        prenom: newEmployee.prenom,
        email: newEmployee.email,
        telephone: newEmployee.telephone,
        job_title: newEmployee.job_title,
        salaire: Number.parseFloat(newEmployee.salaire) || 0,
        location_id: newEmployee.location_id || null,
        role: newEmployee.role,
        username: newEmployee.username,
      },
    })
  }

  const handleDeleteEmployee = (employeeId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet employé ?")) {
      deleteEmployee({ variables: { id: employeeId } })
    }
  }

  const handleUpdateEmployee = () => {
    if (!selectedEmployee) return

    updateEmployee({
      variables: {
        id: selectedEmployee.id,
        salaire: Number.parseFloat(selectedEmployee.salaire) || 0,
        prime: Number.parseFloat(selectedEmployee.prime) || 0,
        infractions: Number.parseInt(selectedEmployee.infractions) || 0,
        absence: Number.parseInt(selectedEmployee.absence) || 0,
        retard: Number.parseInt(selectedEmployee.retard) || 0,
        bonus: Number.parseFloat(selectedEmployee.bonus) || 0,
        avance: Number.parseFloat(selectedEmployee.avance) || 0,
        tenu_de_travail: Number.parseInt(selectedEmployee.tenu_de_travail) || 0,
        status: selectedEmployee.status,
      },
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Animated background particles */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>

        <div className="relative z-10 p-6 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 rounded-2xl p-6 animate-pulse transform hover:scale-105 transition-all duration-300"
                style={{
                  transform: 'perspective(1000px) rotateX(10deg) rotateY(5deg)',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                }}
              >
                <div className="h-4 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gradient-to-r from-emerald-400/30 to-cyan-400/30 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-white/20 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const stats = data?.dashboardStats || {}
  const locations = locationsData?.locations || []
  const employees = employeesData?.employees || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Dynamic animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(120,219,255,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,119,198,0.1),transparent_50%)]"></div>

        {/* Floating particles */}
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 p-6 space-y-8">
        {/* Welcome Section - 3D Hero */}
        <div className="group relative transform-gpu perspective-1000">
          <div
            className="relative bg-gradient-to-r from-red-600/90 via-red-500/90 to-orange-600/90 backdrop-blur-xl border border-red-400/30 rounded-3xl p-8 text-white transform hover:rotateX-2 hover:rotateY-2 transition-all duration-500"
            style={{
              transform: 'perspective(1000px) rotateX(5deg)',
              boxShadow: '0 35px 80px -15px rgba(239, 68, 68, 0.4), 0 0 0 1px rgba(248, 113, 113, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          >
            {/* Glowing orb effect */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-yellow-400/20 to-red-400/20 rounded-full blur-3xl animate-pulse"></div>

            <div className="relative z-10">
              <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-yellow-100 to-white bg-clip-text text-transparent">
                Bienvenue, {user?.username}!
              </h1>
              <p className="text-red-100 text-lg sm:text-xl mb-6 leading-relaxed">
                {user?.role === "admin"
                  ? "Gérez votre restaurant depuis ce tableau de bord administrateur futuriste"
                  : user?.role === "manager"
                    ? "Supervisez votre équipe et les opérations avec une interface révolutionnaire"
                    : "Consultez vos informations dans un environnement 3D immersif"}
              </p>
              <Badge
                variant="secondary"
                className="mt-3 bg-white/20 text-white border-white/30 px-6 py-2 text-lg font-semibold backdrop-blur-sm hover:bg-white/30 transition-all duration-300 transform hover:scale-105"
              >
                {user?.role === "admin" ? "🔥 Administrateur" : user?.role === "manager" ? "⚡ Manager" : "✨ Employé"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats Grid - 3D Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {user?.role === "employee" && (
            <>
              <StatsCard3D
                title="Heures ce mois"
                value={`${stats.monthlyHours || 0}h`}
                subtitle={`+${stats.weeklyHours || 0}h cette semaine`}
                icon={<Clock className="h-8 w-8" />}
                gradient="from-blue-500 to-cyan-500"
                glowColor="rgba(59, 130, 246, 0.4)"
              />
              <StatsCard3D
                title="Salaire estimé"
                value={`${stats.estimatedSalary || 0}€`}
                subtitle={`Basé sur ${stats.hourlyRate || 0}€/h`}
                icon={<DollarSign className="h-8 w-8" />}
                gradient="from-emerald-500 to-teal-500"
                glowColor="rgba(16, 185, 129, 0.4)"
              />
              <StatsCard3D
                title="Congés restants"
                value={`${stats.remainingLeave || 0}`}
                subtitle="jours disponibles"
                icon={<Calendar className="h-8 w-8" />}
                gradient="from-violet-500 to-purple-500"
                glowColor="rgba(139, 92, 246, 0.4)"
              />
              <StatsCard3D
                title="Statut"
                value="Actif"
                subtitle="Dernière connexion aujourd'hui"
                icon={<CheckCircle className="h-8 w-8" />}
                gradient="from-green-500 to-emerald-500"
                glowColor="rgba(34, 197, 94, 0.4)"
              />
            </>
          )}

          {(user?.role === "manager" || user?.role === "admin") && (
            <>
              <StatsCard3D
                title="Employés actifs"
                value={`${stats.activeEmployees || employees.length}`}
                subtitle={`sur ${stats.totalEmployees || employees.length} employés`}
                icon={<Users className="h-8 w-8" />}
                gradient="from-blue-500 to-indigo-500"
                glowColor="rgba(59, 130, 246, 0.4)"
              />
              <StatsCard3D
                title="Restaurants"
                value={`${locations.length}`}
                subtitle="établissements actifs"
                icon={<Building className="h-8 w-8" />}
                gradient="from-purple-500 to-pink-500"
                glowColor="rgba(147, 51, 234, 0.4)"
              />
              <StatsCard3D
                title="Demandes en attente"
                value={`${stats.pendingRequests || 0}`}
                subtitle="à traiter"
                icon={<AlertCircle className="h-8 w-8" />}
                gradient="from-orange-500 to-red-500"
                glowColor="rgba(249, 115, 22, 0.4)"
              />
              <StatsCard3D
                title="Revenus"
                value={`${stats.monthlyRevenue || 0}€`}
                subtitle={`+${stats.revenueGrowth || 0}% vs mois dernier`}
                icon={<TrendingUp className="h-8 w-8" />}
                gradient="from-emerald-500 to-green-500"
                glowColor="rgba(16, 185, 129, 0.4)"
              />
            </>
          )}
        </div>

        {/* Admin Locations Section - 3D */}
        {user?.role === "admin" && (
          <Card3D>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                  <MapPin className="h-7 w-7 text-red-400" />
                  Gestion des Restaurants
                </CardTitle>
                <CardDescription className="text-gray-300 text-lg">Gérez vos différents établissements</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {locationsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <LocationCard3D isLoading={true} />
                    </div>
                  ))}
                </div>
              ) : locations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {locations.map((location: any) => (
                    <LocationCard3D key={location.id} location={location} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <MapPin className="h-16 w-16 mx-auto mb-6 opacity-50" />
                  <p className="text-xl">Aucun restaurant configuré</p>
                </div>
              )}
            </CardContent>
          </Card3D>
        )}

    {/* Admin Employees Management Section - Mobile Responsive */}
        {user?.role === "admin" && (
          <Card3D>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  <Users className="h-6 w-6 sm:h-7 sm:w-7 text-blue-400" />
                  Gestion des Employés
                </CardTitle>
                <CardDescription className="text-gray-300 text-base sm:text-lg">Gérez tous vos employés</CardDescription>
              </div>
              <Dialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="w-full sm:w-auto bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold px-4 sm:px-6 py-3 rounded-xl transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                    style={{
                      boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.4)'
                    }}
                  >
                    <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    <span className="hidden sm:inline">Nouvel Employé</span>
                    <span className="sm:hidden">Ajouter</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-md mx-auto bg-slate-800/95 backdrop-blur-xl border border-slate-600/50 rounded-2xl text-white">
                  <DialogHeader>
                    <DialogTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Ajouter un Employé</DialogTitle>
                    <DialogDescription className="text-gray-300">Créez un nouveau compte employé</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="prenom" className="text-gray-300">Prénom *</Label>
                        <Input
                          id="prenom"
                          value={newEmployee.prenom}
                          onChange={(e) => setNewEmployee({ ...newEmployee, prenom: e.target.value })}
                          placeholder="Jean"
                          className="bg-slate-700/50 border-slate-600 text-white rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                        />
                      </div>
                      <div>
                        <Label htmlFor="nom" className="text-gray-300">Nom *</Label>
                        <Input
                          id="nom"
                          value={newEmployee.nom}
                          onChange={(e) => setNewEmployee({ ...newEmployee, nom: e.target.value })}
                          placeholder="Dupont"
                          className="bg-slate-700/50 border-slate-600 text-white rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="username" className="text-gray-300">Nom d'utilisateur *</Label>
                      <Input
                        id="username"
                        value={newEmployee.username}
                        onChange={(e) => setNewEmployee({ ...newEmployee, username: e.target.value })}
                        placeholder="jean.dupont"
                        className="bg-slate-700/50 border-slate-600 text-white rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-gray-300">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newEmployee.email}
                        onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                        placeholder="jean.dupont@example.com"
                        className="bg-slate-700/50 border-slate-600 text-white rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                      />
                    </div>
                    <div>
                      <Label htmlFor="telephone" className="text-gray-300">Téléphone</Label>
                      <Input
                        id="telephone"
                        value={newEmployee.telephone}
                        onChange={(e) => setNewEmployee({ ...newEmployee, telephone: e.target.value })}
                        placeholder="0123456789"
                        className="bg-slate-700/50 border-slate-600 text-white rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                      />
                    </div>
                    <div>
                      <Label htmlFor="job_title" className="text-gray-300">Poste</Label>
                      <Input
                        id="job_title"
                        value={newEmployee.job_title}
                        onChange={(e) => setNewEmployee({ ...newEmployee, job_title: e.target.value })}
                        placeholder="Serveur, Cuisinier, Manager..."
                        className="bg-slate-700/50 border-slate-600 text-white rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="salaire" className="text-gray-300">Salaire (€)</Label>
                        <Input
                          id="salaire"
                          type="number"
                          value={newEmployee.salaire}
                          onChange={(e) => setNewEmployee({ ...newEmployee, salaire: e.target.value })}
                          placeholder="2000"
                          className="bg-slate-700/50 border-slate-600 text-white rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                        />
                      </div>
                      <div>
                        <Label htmlFor="role" className="text-gray-300">Rôle</Label>
                        <Select
                          value={newEmployee.role}
                          onValueChange={(value) => setNewEmployee({ ...newEmployee, role: value })}
                        >
                          <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-600 text-white">
                            <SelectItem value="employee">Employé</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="location" className="text-gray-300">Restaurant</Label>
                      <Select
                        value={newEmployee.location_id}
                        onValueChange={(value) => setNewEmployee({ ...newEmployee, location_id: value })}
                      >
                        <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white rounded-xl">
                          <SelectValue placeholder="Sélectionner un restaurant" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600 text-white">
                          {locations.map((location: any) => (
                            <SelectItem key={location.id} value={location.id}>
                              {location.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => setIsAddEmployeeOpen(false)} className="w-full sm:w-auto border-slate-600 text-gray-300 hover:bg-slate-700">
                      Annuler
                    </Button>
                    <Button onClick={handleCreateEmployee} className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                      Créer
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
              {employeesLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-4 sm:p-6 border border-slate-600/50 rounded-2xl animate-pulse bg-slate-700/30">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-600 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-600 rounded w-1/4"></div>
                        <div className="h-3 bg-slate-600 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : employees.length > 0 ? (
                <>
                  {/* Mobile Card View */}
                  <div className="block lg:hidden space-y-4">
                    {(showAllEmployees ? employees : employees.slice(0, 3)).map((employee: any) => (
                      <div key={employee.id} className="bg-slate-800/50 backdrop-blur-sm border border-slate-600/50 rounded-2xl p-4 hover:bg-slate-700/50 transition-all duration-300">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-white text-lg">
                              {employee.prenom} {employee.nom}
                            </h3>
                            <p className="text-sm text-gray-400">ID: {employee.id}</p>
                          </div>
                          <div className="flex gap-2 ml-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedEmployee(employee)
                                setIsEditEmployeeOpen(true)
                              }}
                              className="border-blue-400/50 text-blue-400 hover:bg-blue-400/20 hover:border-blue-400 transition-all duration-300 p-2"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteEmployee(employee.id)}
                              className="border-red-400/50 text-red-400 hover:bg-red-400/20 hover:border-red-400 transition-all duration-300 p-2"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {/* Contact Info */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                              <Mail className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{employee.email}</span>
                            </div>
                            {employee.telephone && (
                              <div className="flex items-center gap-2 text-sm text-gray-300">
                                <Phone className="h-3 w-3 flex-shrink-0" />
                                <span>{employee.telephone}</span>
                              </div>
                            )}
                          </div>

                          {/* Job Title */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Poste:</span>
                            <span className="text-sm text-gray-300 font-medium">{employee.job_title || "Non défini"}</span>
                          </div>

                          {/* Location */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Restaurant:</span>
                            {employee.location ? (
                              <div className="flex items-center gap-1 text-sm text-gray-300">
                                <Building className="h-3 w-3" />
                                <span className="truncate max-w-[150px]">{employee.location.name}</span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">Non assigné</span>
                            )}
                          </div>

                          {/* Salary */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Salaire:</span>
                            <span className="text-sm text-gray-300 font-medium">{employee.salaire ? `${employee.salaire}€` : "Non défini"}</span>
                          </div>

                          {/* Status */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Statut:</span>
                            <Badge variant={employee.status === "active" ? "default" : "secondary"} className={`text-xs ${employee.status === "active" ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-gray-500/20 text-gray-400 border-gray-500/30"}`}>
                              {employee.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Show More Button for Mobile */}
                    {employees.length > 3 && (
                      <div className="flex justify-center pt-4">
                        <Button
                          onClick={() => setShowAllEmployees(!showAllEmployees)}
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold px-6 py-3 rounded-xl transform hover:scale-105 transition-all duration-300 shadow-lg"
                        >
                          {showAllEmployees ? (
                            <>
                              Voir moins
                              <svg className="w-4 h-4 ml-2 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </>
                          ) : (
                            <>
                              En savoir plus ({employees.length - 3} autres)
                              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden lg:block overflow-x-auto rounded-2xl border border-slate-600/50 bg-slate-800/30 backdrop-blur-sm">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-600 hover:bg-slate-700/50">
                          <TableHead className="text-gray-300 font-semibold">Employé</TableHead>
                          <TableHead className="text-gray-300 font-semibold">Contact</TableHead>
                          <TableHead className="text-gray-300 font-semibold">Poste</TableHead>
                          <TableHead className="text-gray-300 font-semibold">Restaurant</TableHead>
                          <TableHead className="text-gray-300 font-semibold">Salaire</TableHead>
                          <TableHead className="text-gray-300 font-semibold">Statut</TableHead>
                          <TableHead className="text-gray-300 font-semibold">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {employees.map((employee: any) => (
                          <TableRow key={employee.id} className="border-slate-600/50 hover:bg-slate-700/30 transition-all duration-300">
                            <TableCell>
                              <div>
                                <div className="font-medium text-white">
                                  {employee.prenom} {employee.nom}
                                </div>
                                <div className="text-sm text-gray-400">ID: {employee.id}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-sm text-gray-300">
                                  <Mail className="h-3 w-3" />
                                  {employee.email}
                                </div>
                                {employee.telephone && (
                                  <div className="flex items-center gap-1 text-sm text-gray-300">
                                    <Phone className="h-3 w-3" />
                                    {employee.telephone}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-300">{employee.job_title || "Non défini"}</TableCell>
                            <TableCell>
                              {employee.location ? (
                                <div className="flex items-center gap-1 text-gray-300">
                                  <Building className="h-3 w-3" />
                                  {employee.location.name}
                                </div>
                              ) : (
                                <span className="text-gray-500">Non assigné</span>
                              )}
                            </TableCell>
                            <TableCell className="text-gray-300">{employee.salaire ? `${employee.salaire}€` : "Non défini"}</TableCell>
                            <TableCell>
                              <Badge variant={employee.status === "active" ? "default" : "secondary"} className={employee.status === "active" ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-gray-500/20 text-gray-400 border-gray-500/30"}>
                                {employee.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedEmployee(employee)
                                    setIsEditEmployeeOpen(true)
                                  }}
                                  className="border-blue-400/50 text-blue-400 hover:bg-blue-400/20 hover:border-blue-400 transition-all duration-300 transform hover:scale-105"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteEmployee(employee.id)}
                                  className="border-red-400/50 text-red-400 hover:bg-red-400/20 hover:border-red-400 transition-all duration-300 transform hover:scale-105"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Users className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-6 opacity-50" />
                  <p className="text-lg sm:text-xl">Aucun employé trouvé</p>
                </div>
              )}
            </CardContent>
          </Card3D>
        )}

        {/* Spacer for mobile */}
        <div className="h-20"></div>

        {/* Edit Employee Dialog - 3D */}
        <Dialog open={isEditEmployeeOpen} onOpenChange={setIsEditEmployeeOpen}>
          <DialogContent className="max-w-md bg-slate-800/95 backdrop-blur-xl border border-slate-600/50 rounded-2xl text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Modifier l'Employé
              </DialogTitle>
              <DialogDescription className="text-gray-300">
                Modifiez les informations de {selectedEmployee?.prenom} {selectedEmployee?.nom}
              </DialogDescription>
            </DialogHeader>
            {selectedEmployee && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-salaire" className="text-gray-300">Salaire (€)</Label>
                    <Input
                      id="edit-salaire"
                      type="number"
                      value={selectedEmployee.salaire || ""}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee, salaire: e.target.value })}
                      className="bg-slate-700/50 border-slate-600 text-white rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-prime" className="text-gray-300">Prime (€)</Label>
                    <Input
                      id="edit-prime"
                      type="number"
                      value={selectedEmployee.prime || ""}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee, prime: e.target.value })}
                      className="bg-slate-700/50 border-slate-600 text-white rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="edit-infractions" className="text-gray-300">Infractions</Label>
                    <Input
                      id="edit-infractions"
                      type="number"
                      value={selectedEmployee.infractions || ""}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee, infractions: e.target.value })}
                      className="bg-slate-700/50 border-slate-600 text-white rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-absence" className="text-gray-300">Absences</Label>
                    <Input
                      id="edit-absence"
                      type="number"
                      value={selectedEmployee.absence || ""}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee, absence: e.target.value })}
                      className="bg-slate-700/50 border-slate-600 text-white rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-retard" className="text-gray-300">Retards</Label>
                    <Input
                      id="edit-retard"
                      type="number"
                      value={selectedEmployee.retard || ""}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee, retard: e.target.value })}
                      className="bg-slate-700/50 border-slate-600 text-white rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-bonus" className="text-gray-300">Bonus (€)</Label>
                    <Input
                      id="edit-bonus"
                      type="number"
                      value={selectedEmployee.bonus || ""}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee, bonus: e.target.value })}
                      className="bg-slate-700/50 border-slate-600 text-white rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-avance" className="text-gray-300">Avance (€)</Label>
                    <Input
                      id="edit-avance"
                      type="number"
                      value={selectedEmployee.avance || ""}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee, avance: e.target.value })}
                      className="bg-slate-700/50 border-slate-600 text-white rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-tenu" className="text-gray-300">Tenues de travail</Label>
                    <Input
                      id="edit-tenu"
                      type="number"
                      value={selectedEmployee.tenu_de_travail || ""}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee, tenu_de_travail: e.target.value })}
                      className="bg-slate-700/50 border-slate-600 text-white rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-status" className="text-gray-300">Statut</Label>
                    <Select
                      value={selectedEmployee.status}
                      onValueChange={(value) => setSelectedEmployee({ ...selectedEmployee, status: value })}
                    >
                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600 text-white">
                        <SelectItem value="active">Actif</SelectItem>
                        <SelectItem value="inactive">Inactif</SelectItem>
                        <SelectItem value="suspended">Suspendu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditEmployeeOpen(false)} className="border-slate-600 text-gray-300 hover:bg-slate-700">
                Annuler
              </Button>
              <Button onClick={handleUpdateEmployee} className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600">
                Sauvegarder
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Card3D>
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-sm sm:text-base">
                ⚡
              </div>
              Actions rapides
            </CardTitle>
            <CardDescription className="text-gray-300 text-base sm:text-lg">Accédez rapidement aux fonctionnalités principales</CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-8">
            {/* Mobile: Single Column Layout */}
            <div className="block sm:hidden space-y-3">
              {user?.role === "employee" && (
                <>
                  <QuickActionMobile
                    href="/dashboard/pointeuse"
                    icon={<Clock className="h-5 w-5" />}
                    title="Pointer"
                    subtitle="Enregistrer vos heures"
                    gradient="from-blue-500 to-cyan-500"
                  />
                  <QuickActionMobile
                    href="/dashboard/journal"
                    icon={<Calendar className="h-5 w-5" />}
                    title="Planning"
                    subtitle="Voir votre planning"
                    gradient="from-purple-500 to-pink-500"
                  />
                  <QuickActionMobile
                    href="/dashboard/leave-request"
                    icon={<FileText className="h-5 w-5" />}
                    title="Congé"
                    subtitle="Demander un congé"
                    gradient="from-emerald-500 to-teal-500"
                  />
                  <QuickActionMobile
                    href="/dashboard/finance"
                    icon={<DollarSign className="h-5 w-5" />}
                    title="Salaire"
                    subtitle="Voir vos finances"
                    gradient="from-yellow-500 to-orange-500"
                  />
                </>
              )}

              {(user?.role === "manager" || user?.role === "admin") && (
                <>
                  <QuickActionMobile
                    href={user?.role === "admin" ? "/dashboard/admin/employees" : "/dashboard/manager/employees"}
                    icon={<Users className="h-5 w-5" />}
                    title="Employés"
                    subtitle="Gérer les employés"
                    gradient="from-blue-500 to-indigo-500"
                  />
                  <QuickActionMobile
                    href={user?.role === "admin" ? "/dashboard/admin/journal" : "/dashboard/manager/journal"}
                    icon={<Calendar className="h-5 w-5" />}
                    title="Planning"
                    subtitle="Gérer les plannings"
                    gradient="from-purple-500 to-violet-500"
                  />
                  <QuickActionMobile
                    href={user?.role === "admin" ? "/dashboard/admin/approvals" : "/dashboard/manager/leave-requests"}
                    icon={<CheckCircle className="h-5 w-5" />}
                    title="Approuver"
                    subtitle="Traiter les demandes"
                    gradient="from-green-500 to-emerald-500"
                  />
                  <QuickActionMobile
                    href={user?.role === "admin" ? "/dashboard/admin/finance" : "/dashboard/manager/finance"}
                    icon={<DollarSign className="h-5 w-5" />}
                    title="Finance"
                    subtitle="Gérer les finances"
                    gradient="from-yellow-500 to-amber-500"
                  />
                </>
              )}
            </div>

            {/* Desktop/Tablet: Grid Layout */}
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {user?.role === "employee" && (
                <>
                  <QuickActionCard3D
                    href="/dashboard/pointeuse"
                    icon={<Clock className="h-6 w-6 lg:h-8 lg:w-8" />}
                    title="Pointer"
                    gradient="from-blue-500 to-cyan-500"
                  />
                  <QuickActionCard3D
                    href="/dashboard/journal"
                    icon={<Calendar className="h-6 w-6 lg:h-8 lg:w-8" />}
                    title="Planning"
                    gradient="from-purple-500 to-pink-500"
                  />
                  <QuickActionCard3D
                    href="/dashboard/leave-request"
                    icon={<FileText className="h-6 w-6 lg:h-8 lg:w-8" />}
                    title="Congé"
                    gradient="from-emerald-500 to-teal-500"
                  />
                  <QuickActionCard3D
                    href="/dashboard/finance"
                    icon={<DollarSign className="h-6 w-6 lg:h-8 lg:w-8" />}
                    title="Salaire"
                    gradient="from-yellow-500 to-orange-500"
                  />
                </>
              )}

              {(user?.role === "manager" || user?.role === "admin") && (
                <>
                  <QuickActionCard3D
                    href={user?.role === "admin" ? "/dashboard/admin/employees" : "/dashboard/manager/employees"}
                    icon={<Users className="h-6 w-6 lg:h-8 lg:w-8" />}
                    title="Employés"
                    gradient="from-blue-500 to-indigo-500"
                  />
                  <QuickActionCard3D
                    href={user?.role === "admin" ? "/dashboard/admin/journal" : "/dashboard/manager/journal"}
                    icon={<Calendar className="h-6 w-6 lg:h-8 lg:w-8" />}
                    title="Planning"
                    gradient="from-purple-500 to-violet-500"
                  />
                  <QuickActionCard3D
                    href={user?.role === "admin" ? "/dashboard/admin/approvals" : "/dashboard/manager/leave-requests"}
                    icon={<CheckCircle className="h-6 w-6 lg:h-8 lg:w-8" />}
                    title="Approuver"
                    gradient="from-green-500 to-emerald-500"
                  />
                  <QuickActionCard3D
                    href={user?.role === "admin" ? "/dashboard/admin/finance" : "/dashboard/manager/finance"}
                    icon={<DollarSign className="h-6 w-6 lg:h-8 lg:w-8" />}
                    title="Finance"
                    gradient="from-yellow-500 to-amber-500"
                  />
                </>
              )}
            </div>
          </CardContent>
        </Card3D>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(1deg); }
          66% { transform: translateY(5px) rotate(-1deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

// 3D Stats Card Component
function StatsCard3D({ title, value, subtitle, icon, gradient, glowColor }: any) {
  return (
    <div className="group relative transform-gpu perspective-1000">
      <div
        className={`relative bg-gradient-to-br ${gradient} backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-white transform hover:rotateX-12 hover:rotateY-6 hover:scale-105 transition-all duration-500 cursor-pointer`}
        style={{
          transform: 'perspective(1000px) rotateX(10deg) rotateY(-5deg)',
          boxShadow: `0 25px 50px -12px ${glowColor}, 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)`
        }}
      >
        {/* Animated glow effect */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${glowColor}, transparent 70%)`,
            filter: 'blur(20px)'
          }}
        ></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="text-white/80 font-medium text-sm tracking-wide uppercase">
              {title}
            </div>
            <div className="text-white/60 group-hover:text-white/80 transition-colors duration-300">
              {icon}
            </div>
          </div>
          <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            {value}
          </div>
          <div className="text-white/70 text-sm">
            {subtitle}
          </div>
        </div>

        {/* Shine effect */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        </div>
      </div>
    </div>
  )
}

// 3D Card Component
function Card3D({ children, className = "" }: any) {
  return (
    <div className="group relative transform-gpu perspective-1000">
      <div
        className={`relative bg-slate-800/40 backdrop-blur-xl border border-slate-600/50 rounded-3xl text-white transform hover:rotateX-2 hover:rotateY-1 transition-all duration-500 ${className}`}
        style={{
          transform: 'perspective(1000px) rotateX(2deg)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Animated border glow */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-400/20 via-cyan-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>

        <div className="relative z-10 p-8">
          {children}
        </div>
      </div>
    </div>
  )
}

// 3D Location Card Component
function LocationCard3D({ location, isLoading = false }: any) {
  if (isLoading) {
    return (
      <div className="relative bg-slate-700/30 backdrop-blur-lg border border-slate-600/50 rounded-2xl p-6 animate-pulse">
        <div className="h-6 bg-slate-600 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-slate-600 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-slate-600 rounded w-2/3 mb-2"></div>
        <div className="h-10 bg-slate-600 rounded w-full"></div>
      </div>
    )
  }

  return (
    <div className="group relative transform-gpu perspective-1000">
      <div
        className="relative bg-gradient-to-br from-slate-700/50 to-slate-800/50 backdrop-blur-xl border border-slate-600/50 rounded-2xl p-6 text-white transform hover:rotateX-6 hover:rotateY-3 hover:scale-105 transition-all duration-500"
        style={{
          transform: 'perspective(1000px) rotateX(5deg) rotateY(-2deg)',
          boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)'
        }}
      >
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        <div className="relative z-10">
          <div className="mb-4">
            <h3 className="text-xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
              {location.name}
            </h3>
            <p className="text-gray-400 flex items-center gap-2 mt-2">
              <MapPin className="h-4 w-4" />
              {location.address}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Employés:</span>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                {location.employees?.length || 0}
              </Badge>
            </div>
            {location.manager && (
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Manager:</span>
                <span className="font-medium text-white">
                  {location.manager.profile?.first_name} {location.manager.profile?.last_name}
                </span>
              </div>
            )}
            <div className="mt-6">
              <Button
                asChild
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold rounded-xl transform hover:scale-105 transition-all duration-300"
                style={{
                  boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.3)'
                }}
              >
                <Link href={`/dashboard/admin/location/${location.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  Voir les Employés
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

{/* Mobile-Optimized Quick Action Component */}
function QuickActionMobile({ href, icon, title, subtitle, gradient }: any) {
  return (
    <Link href={href} className="block">
      <div className={`relative bg-gradient-to-r ${gradient} backdrop-blur-sm border border-white/20 rounded-xl p-4 text-white hover:scale-[1.02] active:scale-95 transition-all duration-200 shadow-lg`}>
        {/* Subtle glow for mobile */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/5 to-transparent opacity-0 active:opacity-100 transition-opacity duration-200"></div>
        
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex-shrink-0 p-2 bg-white/10 rounded-lg backdrop-blur-sm">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white text-base leading-tight">
              {title}
            </h3>
            <p className="text-white/80 text-sm mt-1 leading-tight">
              {subtitle}
            </p>
          </div>
          <div className="flex-shrink-0 text-white/60">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  )
}

{/* Updated 3D Quick Action Card Component for Desktop */}
function QuickActionCard3D({ href, icon, title, gradient }: any) {
  return (
    <div className="group relative transform-gpu perspective-1000">
      <Link href={href}>
        <div
          className={`relative bg-gradient-to-br ${gradient} backdrop-blur-xl border border-white/20 rounded-2xl p-4 sm:p-6 text-white transform hover:rotateX-12 hover:rotateY-6 hover:scale-110 transition-all duration-500 cursor-pointer`}
          style={{
            transform: 'perspective(1000px) rotateX(8deg) rotateY(-4deg)',
            boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)'
          }}
        >
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div className="relative z-10 flex flex-col items-center space-y-2 sm:space-y-3">
            <div className="text-white/90 group-hover:text-white transition-colors duration-300 transform group-hover:scale-110">
              {icon}
            </div>
            <span className="text-xs sm:text-sm font-semibold text-center text-white/90 group-hover:text-white transition-colors duration-300 leading-tight">
              {title}
            </span>
          </div>

          {/* Shine effect */}
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </div>
        </div>
      </Link>
    </div>
  )
}
