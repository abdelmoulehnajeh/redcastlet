"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useQuery, useMutation } from "@apollo/client"
import { GET_LOCATION, CREATE_EMPLOYEE, UPDATE_EMPLOYEE, DELETE_EMPLOYEE } from "@/lib/graphql-queries"
import { toast } from "sonner"
import {
  ArrowLeft,
  MapPin,
  Users,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail,
  UserCheck,
  Building2,
  Clock,
} from "lucide-react"

interface Employee {
  id: string
  username: string
  email: string
  nom: string
  prenom: string
  telephone?: string
  job_title: string
  salaire?: number
  status: string
  created_at: string
  profile: {
    first_name: string
    last_name: string
    phone?: string
  }
}

interface Location {
  id: string
  name: string
  address: string
  phone?: string
  employees: Employee[]
  manager?: {
    id: string
    profile: {
      first_name: string
      last_name: string
    }
  }
}

const LocationDetailPage = () => {
  const params = useParams()
  const router = useRouter()
  const locationId = params.id as string

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    job_title: "",
    role: "employee",
    salaire: "",
    username: "",
  })

  const {
    data: locationData,
    loading,
    refetch,
  } = useQuery(GET_LOCATION, {
    variables: { id: locationId },
  })
  const [createEmployee] = useMutation(CREATE_EMPLOYEE)
  const [updateEmployee] = useMutation(UPDATE_EMPLOYEE)
  const [deleteEmployee] = useMutation(DELETE_EMPLOYEE)

  const location: Location | null = locationData?.location || null

  const handleAddEmployee = async () => {
    try {
      await createEmployee({
        variables: {
          username: formData.username,
          email: formData.email,
          nom: formData.nom,
          prenom: formData.prenom,
          telephone: formData.telephone,
          job_title: formData.job_title,
          salaire: Number.parseFloat(formData.salaire) || 0,
          location_id: locationId,
        },
      })

      toast.success("Employé ajouté avec succès")
      setIsAddDialogOpen(false)
      setFormData({
        nom: "",
        prenom: "",
        email: "",
        telephone: "",
        job_title: "",
        role: "employee",
        salaire: "",
        username: "",
      })
      refetch()
    } catch (error) {
      toast.error("Impossible d'ajouter l'employé")
      console.error("Error adding employee:", error)
    }
  }

  const handleEditEmployee = async () => {
    if (!selectedEmployee) return

    try {
      await updateEmployee({
        variables: {
          id: selectedEmployee.id,
          salaire: Number.parseFloat(formData.salaire) || selectedEmployee.salaire,
          status: formData.role,
        },
      })

      toast.success("Employé modifié avec succès")
      setIsEditDialogOpen(false)
      setSelectedEmployee(null)
      refetch()
    } catch (error) {
      toast.error("Impossible de modifier l'employé")
      console.error("Error updating employee:", error)
    }
  }

  const handleDeleteEmployee = async (employeeId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet employé ?")) return

    try {
      await deleteEmployee({
        variables: { id: employeeId },
      })

      toast.success("Employé supprimé avec succès")
      refetch()
    } catch (error) {
      toast.error("Impossible de supprimer l'employé")
      console.error("Error deleting employee:", error)
    }
  }

  const openEditDialog = (employee: Employee) => {
    setSelectedEmployee(employee)
    setFormData({
      nom: employee.nom,
      prenom: employee.prenom,
      email: employee.email,
      telephone: employee.telephone || "",
      job_title: employee.job_title,
      role: employee.status,
      salaire: employee.salaire?.toString() || "",
      username: employee.username,
    })
    setIsEditDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="relative min-h-[400px] py-8 px-2 sm:px-6 md:px-10 lg:px-20">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="w-full h-full animate-float bg-gradient-to-br from-[#23243a]/60 via-[#2d2e4a]/60 to-[#1a1b2e]/80 opacity-90 blur-2xl" />
        </div>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Skeleton className="w-10 h-10 rounded-lg bg-glass-card" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48 bg-glass-card" />
              <Skeleton className="h-4 w-32 bg-glass-card" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="glass-card bg-gradient-to-br from-white/10 to-white/5 border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="w-12 h-12 rounded-xl bg-glass-card" />
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-8 bg-glass-card" />
                      <Skeleton className="h-4 w-20 bg-glass-card" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!location) {
    return (
      <div className="relative flex items-center justify-center min-h-[400px] py-8 px-2 sm:px-6 md:px-10 lg:px-20">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="w-full h-full animate-float bg-gradient-to-br from-[#23243a]/60 via-[#2d2e4a]/60 to-[#1a1b2e]/80 opacity-90 blur-2xl" />
        </div>
        <div className="text-center glass-card bg-gradient-to-br from-white/10 to-white/5 border-white/10 p-8 rounded-2xl shadow-xl">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2 text-white">Restaurant non trouvé</h3>
          <p className="text-muted-foreground mb-4">Ce restaurant n'existe pas ou a été supprimé.</p>
          <Button onClick={() => router.back()} className="glass-card bg-gradient-to-br from-red-700/80 to-red-900/60 text-white shadow hover:bg-red-700/80 hover:border-red-400/60 border border-red-400/30">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </div>
      </div>
    )
  }

  const totalSalary = location.employees.reduce((sum, emp) => sum + (emp.salaire || 0), 0)
  const activeEmployees = location.employees.filter((emp) => emp.status === "active").length

  return (
    <div className="relative min-h-screen py-8 px-2 sm:px-6 md:px-10 lg:px-20 animate-fade-in">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="w-full h-full animate-float bg-gradient-to-br from-[#23243a]/60 via-[#2d2e4a]/60 to-[#1a1b2e]/80 opacity-90 blur-2xl" />
      </div>

      {/* Header */}
      <div className="glass-card bg-gradient-to-r from-red-700/80 to-red-900/60 rounded-2xl p-6 text-white shadow-xl border border-white/10 mb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="glass-card bg-gradient-to-br from-white/10 to-white/5 border border-white/20 text-white hover:bg-white/10 hover:border-accent/60 focus:ring-accent/40 shadow"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1 drop-shadow">{location.name}</h1>
              <div className="flex items-center text-white/90 text-sm">
                <MapPin className="w-4 h-4 mr-1" />
                {location.address}
              </div>
              {location.phone && (
                <div className="flex items-center text-white/90 text-sm mt-1">
                  <Phone className="w-4 h-4 mr-1" />
                  {location.phone}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
        <Card className="glass-card bg-gradient-to-br from-blue-900/40 to-blue-700/10 border-blue-400/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-900/40 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-100">{location.employees.length}</p>
                <p className="text-sm text-blue-200/80">Total Employés</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card bg-gradient-to-br from-green-900/40 to-green-700/10 border-green-400/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-900/40 rounded-xl flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-green-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-100">{activeEmployees}</p>
                <p className="text-sm text-green-200/80">Employés Actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card bg-gradient-to-br from-yellow-900/40 to-yellow-700/10 border-yellow-400/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-yellow-900/40 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-yellow-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-100">{totalSalary.toLocaleString()}DT</p>
                <p className="text-sm text-yellow-200/80">Masse Salariale</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employees */}
      <Card className="glass-card bg-gradient-to-br from-white/10 to-white/5 border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center text-white drop-shadow">
                <Users className="w-5 h-5 mr-2" />
                {location.name}
              </CardTitle>
              <CardDescription className="text-gray-200">Gérez les employés de ce restaurant</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="glass-card bg-gradient-to-br from-red-700/80 to-red-900/60 text-white shadow hover:bg-red-700/80 hover:border-red-400/60 border border-red-400/30">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter Employé
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card bg-gradient-to-br from-white/10 to-white/5 border-white/10">
                <DialogHeader>
                  <DialogTitle className="text-white drop-shadow">Ajouter un Employé</DialogTitle>
                  <DialogDescription className="text-gray-200">Créez un nouveau compte employé pour ce restaurant.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="prenom" className="text-white">Prénom</Label>
                      <Input
                        id="prenom"
                        value={formData.prenom}
                        onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                        className="bg-glass-card/80 text-white border-white/10 placeholder:text-gray-300"
                      />
                    </div>
                    <div>
                      <Label htmlFor="nom" className="text-white">Nom</Label>
                      <Input
                        id="nom"
                        value={formData.nom}
                        onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                        className="bg-glass-card/80 text-white border-white/10 placeholder:text-gray-300"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="username" className="text-white">Nom d'utilisateur</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="bg-glass-card/80 text-white border-white/10 placeholder:text-gray-300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-white">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-glass-card/80 text-white border-white/10 placeholder:text-gray-300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="telephone" className="text-white">Téléphone</Label>
                    <Input
                      id="telephone"
                      value={formData.telephone}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                      className="bg-glass-card/80 text-white border-white/10 placeholder:text-gray-300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="job_title" className="text-white">Poste</Label>
                    <Input
                      id="job_title"
                      value={formData.job_title}
                      onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                      className="bg-glass-card/80 text-white border-white/10 placeholder:text-gray-300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="salaire" className="text-white">Salaire (DT)</Label>
                    <Input
                      id="salaire"
                      type="number"
                      value={formData.salaire}
                      onChange={(e) => setFormData({ ...formData, salaire: e.target.value })}
                      className="bg-glass-card/80 text-white border-white/10 placeholder:text-gray-300"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="glass-card bg-gradient-to-br from-white/10 to-white/5 border border-white/20 text-white hover:bg-white/10 hover:border-accent/60 focus:ring-accent/40">
                      Annuler
                    </Button>
                    <Button onClick={handleAddEmployee} className="glass-card bg-gradient-to-br from-red-700/80 to-red-900/60 text-white shadow hover:bg-red-700/80 hover:border-red-400/60 border border-red-400/30">
                      Ajouter
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {location.employees.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-white">Aucun employé</h3>
              <p className="text-muted-foreground">Ajoutez votre premier employé pour ce restaurant.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {location.employees.map((employee) => (
                <div
                  key={employee.id}
                  className="glass-card bg-gradient-to-br from-white/10 to-white/5 border-white/10 rounded-xl p-6 space-y-4 hover:shadow-xl transition-all hover:border-red-200"
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-red-900/40 text-red-200 font-semibold">
                        {employee.profile.first_name?.[0] || employee.prenom?.[0] || ""}
                        {employee.profile.last_name?.[0] || employee.nom?.[0] || ""}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-white drop-shadow">
                        {employee.profile.first_name || employee.prenom} {employee.profile.last_name || employee.nom}
                      </h4>
                      <p className="text-sm text-gray-200">{employee.job_title}</p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center text-gray-300">
                      <Mail className="w-4 h-4 mr-2" />
                      {employee.email}
                    </div>
                    {(employee.profile.phone || employee.telephone) && (
                      <div className="flex items-center text-gray-300">
                        <Phone className="w-4 h-4 mr-2" />
                        {employee.profile.phone || employee.telephone}
                      </div>
                    )}
                    {employee.salaire && (
                      <div className="flex items-center text-gray-300">
                        <DollarSign className="w-4 h-4 mr-2" />
                        {employee.salaire.toLocaleString()}DT
                      </div>
                    )}
                    <div className="flex items-center text-gray-300">
                      <Clock className="w-4 h-4 mr-2" />
                      Depuis {new Date(employee.created_at).toLocaleDateString("fr-FR")}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <Badge
                      variant={employee.status === "active" ? "default" : "secondary"}
                      className={employee.status === "active" ? "bg-green-900/40 text-green-200" : "bg-gray-700/60 text-gray-200"}
                    >
                      {employee.status === "active" ? "Actif" : "Inactif"}
                    </Badge>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(employee)}
                        className="glass-card bg-gradient-to-br from-white/10 to-white/5 border border-white/20 text-white hover:bg-accent/10 hover:border-accent/60 focus:ring-accent/40"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteEmployee(employee.id)}
                        className="glass-card bg-gradient-to-br from-red-900/40 to-red-900/10 border border-red-400/30 text-red-300 hover:bg-red-900/30 hover:border-red-400/60 focus:ring-red-400/40"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Employee Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="glass-card bg-gradient-to-br from-white/10 to-white/5 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white drop-shadow">Modifier Employé</DialogTitle>
            <DialogDescription className="text-gray-200">Modifiez les informations de l'employé.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-salaire" className="text-white">Salaire (DT)</Label>
              <Input
                id="edit-salaire"
                type="number"
                value={formData.salaire}
                onChange={(e) => setFormData({ ...formData, salaire: e.target.value })}
                className="bg-glass-card/80 text-white border-white/10 placeholder:text-gray-300"
              />
            </div>
            <div>
              <Label htmlFor="edit-status" className="text-white">Statut</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger className="glass-card bg-gradient-to-br from-white/10 to-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card bg-gradient-to-br from-white/10 to-white/5 border-white/10 text-white">
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="glass-card bg-gradient-to-br from-white/10 to-white/5 border border-white/20 text-white hover:bg-white/10 hover:border-accent/60 focus:ring-accent/40">
                Annuler
              </Button>
              <Button onClick={handleEditEmployee} className="glass-card bg-gradient-to-br from-red-700/80 to-red-900/60 text-white shadow hover:bg-red-700/80 hover:border-red-400/60 border border-red-400/30">
                Modifier
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default LocationDetailPage
