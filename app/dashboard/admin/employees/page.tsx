"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useMutation, useQuery } from "@apollo/client"
import Swal from "sweetalert2"
import "sweetalert2/dist/sweetalert2.min.css"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"

import {
  Search,
  Plus,
  Edit,
  Trash2,
  Users,
  UserCheck,
  UserX,
  DollarSign,
  ChevronsUpDown,
  Check,
  PlusCircle,
  Eye,
  EyeOff,
} from "lucide-react"

import { GET_EMPLOYEES, GET_LOCATIONS, CREATE_EMPLOYEE, DELETE_EMPLOYEE } from "@/lib/graphql-queries"
import { toast } from "sonner"

type Lang = "fr" | "ar"

type Dict = {
  headerTitle: string
  headerSubtitle: string
  statsTotal: string
  statsActive: string
  statsInactive: string
  statsAvgSalary: string
  filters: string
  searchPlaceholder: string
  status: string
  allStatuses: string
  statusActive: string
  statusInactive: string
  statusSuspended: string
  restaurant: string
  allRestaurants: string
  tableTitle: string
  tableSubtitle: string
  newEmployee: string
  colName: string
  colEmail: string
  colJob: string
  colRestaurant: string
  colSalary: string
  colStatus: string
  colUsername: string
  colPassword: string
  colActions: string
  notAssigned: string
  noneFound: string
  createTitle: string
  createDesc: string
  labelLastName: string
  labelFirstName: string
  labelUsername: string
  labelEmail: string
  labelPhone: string
  labelJob: string
  jobPlaceholder: string
  labelSalary: string
  labelRestaurant: string
  selectRestaurant: string
  labelRole: string
  selectRole: string
  roleEmployee: string
  roleManager: string
  cancel: string
  createEmployee: string
  deleteTitle: string
  deleteDesc: (prenom: string, nom: string) => string
  deleteConfirm: string
  badgeActive: string
  badgeInactive: string
  badgeSuspended: string
  createdOk: string
  createdErr: string
  updatedOk: string
  updatedErr: string
  deletedOk: string
  deletedErr: string
  fillRequired: string
  revealPassword: string
  hidePassword: string
}

const translations: Record<Lang, Dict> = {
  fr: {
    headerTitle: "Gestion des Employés",
    headerSubtitle: "Tableau de bord des employés - Vue d'ensemble et gestion",
    statsTotal: "Total Employés",
    statsActive: "Employés Actifs",
    statsInactive: "Employés Inactifs",
    statsAvgSalary: "Salaire Moyen",
    filters: "Filtres",
    searchPlaceholder: "Rechercher par nom, email, username ou poste...",
    status: "Statut",
    allStatuses: "Tous les statuts",
    statusActive: "Actif",
    statusInactive: "Inactif",
    statusSuspended: "Suspendu",
    restaurant: "Restaurant",
    allRestaurants: "Tous les restaurants",
    tableTitle: "Liste des Employés",
    tableSubtitle: "Gérez tous vos employés et leurs informations",
    newEmployee: "Nouvel Employé",
    colName: "Nom",
    colEmail: "Email",
    colJob: "Poste",
    colRestaurant: "Restaurant",
    colSalary: "Salaire",
    colStatus: "Statut",
    colUsername: "Nom d'utilisateur",
    colPassword: "Mot de passe",
    colActions: "Actions",
    notAssigned: "Non assigné",
    noneFound: "Aucun employé trouvé",
    createTitle: "Créer un nouvel employé",
    createDesc: "Remplissez les informations de base pour créer un compte employé.",
    labelLastName: "Nom",
    labelFirstName: "Prénom",
    labelUsername: "Nom d'utilisateur",
    labelEmail: "Email",
    labelPhone: "Téléphone",
    labelJob: "Poste",
    jobPlaceholder: "serveur, etc ...",
    labelSalary: "Salaire (DT)",
    labelRestaurant: "Restaurant",
    selectRestaurant: "Sélectionner un restaurant",
    labelRole: "Rôle",
    selectRole: "Sélectionner un rôle",
    roleEmployee: "Employé",
    roleManager: "Manager",
    cancel: "Annuler",
    createEmployee: "Créer l'employé",
    deleteTitle: "Êtes-vous sûr ?",
    deleteDesc: (p, n) =>
      "Cette action ne peut pas être annulée. Cela supprimera définitivement l'employé " +
      `${p} ${n}` +
      " et toutes ses données associées.",
    deleteConfirm: "Supprimer",
    badgeActive: "Actif",
    badgeInactive: "Inactif",
    badgeSuspended: "Suspendu",
    createdOk: "Employé créé avec succès",
    createdErr: "Erreur lors de la création de l'employé",
    updatedOk: "Employé mis à jour avec succès",
    updatedErr: "Erreur lors de la mise à jour",
    deletedOk: "Employé supprimé avec succès",
    deletedErr: "Erreur lors de la suppression",
    fillRequired: "Veuillez remplir tous les champs obligatoires.",
    revealPassword: "Afficher le mot de passe",
    hidePassword: "Masquer le mot de passe",
  },
  ar: {
    headerTitle: "إدارة الموظفين",
    headerSubtitle: "لوحة الموظفين - نظرة عامة وإدارة",
    statsTotal: "إجمالي الموظفين",
    statsActive: "الموظفون النشطون",
    statsInactive: "الموظفون غير النشطين",
    statsAvgSalary: "متوسط الراتب",
    filters: "عوامل التصفية",
    searchPlaceholder: "ابحث بالاسم أو البريد أو اسم المستخدم أو المنصب...",
    status: "الحالة",
    allStatuses: "كل الحالات",
    statusActive: "نشط",
    statusInactive: "غير نشط",
    statusSuspended: "موقوف",
    restaurant: "المطعم",
    allRestaurants: "جميع المطاعم",
    tableTitle: "قائمة الموظفين",
    tableSubtitle: "إدارة جميع الموظفين ومعلوماتهم",
    newEmployee: "موظف جديد",
    colName: "الاسم",
    colEmail: "البريد الإلكتروني",
    colJob: "الوظيفة",
    colRestaurant: "المطعم",
    colSalary: "الراتب",
    colStatus: "الحالة",
    colUsername: "اسم المستخدم",
    colPassword: "كلمة المرور",
    colActions: "إجراءات",
    notAssigned: "غير معيّن",
    noneFound: "لا يوجد موظفون",
    createTitle: "إنشاء موظف جديد",
    createDesc: "املأ المعلومات الأساسية لإنشاء حساب موظف.",
    labelLastName: "اسم العائلة",
    labelFirstName: "الاسم الأول",
    labelUsername: "اسم المستخدم",
    labelEmail: "البريد الإلكتروني",
    labelPhone: "الهاتف",
    labelJob: "المنصب",
    jobPlaceholder: "server، إلخ ...",
    labelSalary: "الراتب (DT)",
    labelRestaurant: "المطعم",
    selectRestaurant: "اختر مطعماً",
    labelRole: "الدور",
    selectRole: "اختر دوراً",
    roleEmployee: "موظف",
    roleManager: "مدير",
    cancel: "إلغاء",
    createEmployee: "إنشاء الموظف",
    deleteTitle: "هل أنت متأكد؟",
    deleteDesc: (p, n) =>
      "لا يمكن التراجع عن هذا الإجراء. سيؤدي إلى حذف الموظف " + `${p} ${n}` + " نهائياً وجميع بياناته المرتبطة.",
    deleteConfirm: "حذف",
    badgeActive: "نشط",
    badgeInactive: "غير نشط",
    badgeSuspended: "موقوف",
    createdOk: "تم إنشاء الموظف بنجاح",
    createdErr: "حدث خطأ أثناء إنشاء الموظف",
    updatedOk: "تم تحديث الموظف بنجاح",
    updatedErr: "حدث خطأ أثناء التحديث",
    deletedOk: "تم حذف الموظف بنجاح",
    deletedErr: "حدث خطأ أثناء الحذف",
    fillRequired: "يرجى تعبئة جميع الحقول المطلوبة.",
    revealPassword: "إظهار كلمة المرور",
    hidePassword: "إخفاء كلمة المرور",
  },
}

function useLang(): Lang {
  const [lang, setLang] = useState<Lang>("fr")
  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = localStorage.getItem("lang")
    if (stored === "ar" || stored === "fr") setLang(stored)
    else {
      localStorage.setItem("lang", "fr")
      setLang("fr")
    }
  }, [])
  useEffect(() => {
    if (typeof document === "undefined") return
    document.documentElement.setAttribute("lang", lang)
    document.documentElement.setAttribute("dir", "ltr")
  }, [lang])
  return lang
}

interface Employee {
  id: string
  nom: string
  prenom: string
  email: string
  telephone: string
  job_title: string
  salaire: number
  status: string
  created_at: string
  location: { id: string; name: string } | null
  user: { id: string; username: string; password: string } | null
}

interface Location {
  id: string
  name: string
  address?: string
}

const POSTES_KEY = "postes"
function loadPostes(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(POSTES_KEY)
    const list = raw ? (JSON.parse(raw) as string[]) : []
    return Array.isArray(list) ? list.filter(Boolean) : []
  } catch {
    return []
  }
}
function savePostes(list: string[]) {
  try {
    window.localStorage.setItem(POSTES_KEY, JSON.stringify(list))
  } catch {
    // ignore
  }
}

export default function AdminEmployeesPage() {
  const lang = useLang()
  const t = translations[lang]
  const locale = lang === "ar" ? "ar" : "fr-FR"

  // search and filters
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [locationFilter, setLocationFilter] = useState("all")

  // dialogs and forms
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
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

  // postes combobox state
  const [postes, setPostes] = useState<string[]>([])
  const [jobPopoverOpen, setJobPopoverOpen] = useState(false)
  const [jobSearch, setJobSearch] = useState("")
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setPostes(loadPostes())
  }, [])

  const {
    data: employeesData,
    loading: employeesLoading,
    error,
    refetch: refetchEmployees,
  } = useQuery<{ employees: Employee[] }>(GET_EMPLOYEES, { fetchPolicy: "cache-and-network" })
  const { data: locationsData } = useQuery<{ locations: Location[] }>(GET_LOCATIONS)
  const [createEmployee] = useMutation(CREATE_EMPLOYEE)
  const [deleteEmployee] = useMutation(DELETE_EMPLOYEE)

  const employees: Employee[] = employeesData?.employees || []
  const locations: Location[] = locationsData?.locations || []

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.user?.username || "").toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || employee.status === statusFilter
    const matchesLocation = locationFilter === "all" || employee.location?.id === locationFilter
    return matchesSearch && matchesStatus && matchesLocation
  })

  const fmt = (n: number) => n.toLocaleString(locale)
  const fmtMoney = (n: number) => `${fmt(n)}DT`

  const canCreate = useMemo(() => {
    return newEmployee.username && newEmployee.email && newEmployee.nom && newEmployee.prenom && newEmployee.job_title
  }, [newEmployee])

  const handleCreateEmployee = async () => {
    if (!canCreate) {
      toast.error(t.fillRequired)
      return
    }
    try {
      await createEmployee({
        variables: {
          username: newEmployee.username,
          email: newEmployee.email,
          nom: newEmployee.nom,
          prenom: newEmployee.prenom,
          telephone: newEmployee.telephone,
          job_title: newEmployee.job_title,
          role: newEmployee.role,
          salaire: Number.parseFloat(newEmployee.salaire) || 0,
          location_id: newEmployee.location_id || null,
        },
      })

      // Save job_title into localStorage('postes') and update state
      const normalized = newEmployee.job_title.trim()
      if (normalized) {
        setPostes((prev) => {
          const next = Array.from(new Set([normalized, ...prev])).slice(0, 50)
          savePostes(next)
          return next
        })
      }

      // SweetAlert2 success toast
      await Swal.fire({
        icon: "success",
        title: t.createdOk,
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1800,
        timerProgressBar: true,
      })

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
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: t.createdErr,
        text: error?.message || "",
        timer: 2500,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      })
      console.error("Error creating employee:", error)
    }
  }

  const handleDeleteEmployee = async (employeeId: string) => {
    try {
      await deleteEmployee({ variables: { id: employeeId } })
      toast.success(t.deletedOk)
      refetchEmployees()
    } catch (error: any) {
      toast.error(t.deletedErr, { description: error?.message })
      console.error("Error deleting employee:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: t.badgeActive, variant: "default" as const },
      inactive: { label: t.badgeInactive, variant: "secondary" as const },
      suspended: { label: t.badgeSuspended, variant: "destructive" as const },
    }
    const config = (statusConfig as any)[status] || ({ label: status, variant: "outline" as const } as const)
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  if (employeesLoading) {
    return (
      <div className="space-y-6" dir="ltr">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold" dir="auto">
            {t.headerTitle}
          </h1>
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
  const totalSalaries = employees.reduce((sum, e) => sum + (e.salaire || 0), 0)
  const avgSalary = employees.length > 0 ? totalSalaries / employees.length : 0

  return (
    <div className="min-h-screen relative overflow-hidden" dir="ltr">
      {/* floating particles */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-30 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${6 + Math.random() * 4}s`,
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
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 via-purple-600 to-blue-700 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-2xl">
                <Users className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white drop-shadow-lg" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h1
                className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent leading-tight"
                dir="auto"
              >
                {t.headerTitle}
              </h1>
              <p className="text-slate-200 text-sm sm:text-base lg:text-lg font-medium" dir="auto">
                {t.headerSubtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <Card className="glass-card backdrop-blur-futuristic border-0 shadow-2xl">
            <CardContent className="p-4 sm:p-5 lg:p-6 relative z-10 flex flex-col items-center">
              <Users className="w-8 h-8 text-blue-400 mb-2" />
              <div className="text-2xl font-bold text-white">{fmt(employees.length)}</div>
              <div className="text-xs text-slate-200" dir="auto">
                {t.statsTotal}
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card backdrop-blur-futuristic border-0 shadow-2xl">
            <CardContent className="p-4 sm:p-5 lg:p-6 relative z-10 flex flex-col items-center">
              <UserCheck className="w-8 h-8 text-green-400 mb-2" />
              <div className="text-2xl font-bold text-white">{fmt(activeEmployees)}</div>
              <div className="text-xs text-slate-200" dir="auto">
                {t.statsActive}
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card backdrop-blur-futuristic border-0 shadow-2xl">
            <CardContent className="p-4 sm:p-5 lg:p-6 relative z-10 flex flex-col items-center">
              <UserX className="w-8 h-8 text-red-400 mb-2" />
              <div className="text-2xl font-bold text-white">{fmt(inactiveEmployees)}</div>
              <div className="text-xs text-slate-200" dir="auto">
                {t.statsInactive}
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card backdrop-blur-futuristic border-0 shadow-2xl">
            <CardContent className="p-4 sm:p-5 lg:p-6 relative z-10 flex flex-col items-center">
              <DollarSign className="w-8 h-8 text-yellow-400 mb-2" />
              <div className="text-2xl font-bold text-white">{fmtMoney(avgSalary)}</div>
              <div className="text-xs text-slate-200" dir="auto">
                {t.statsAvgSalary}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="glass-card backdrop-blur-futuristic border-0 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white" dir="auto">
              {t.filters}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {/* Search Input */}
              <div className="w-full">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder={t.searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 glass-card backdrop-blur-futuristic bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Selects */}
              <div className="flex flex-col xs:flex-row gap-3 sm:gap-4">
                <div className="flex-1">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full glass-card backdrop-blur-futuristic bg-slate-800/50 border-slate-600 text-white">
                      <SelectValue placeholder={t.status} />
                    </SelectTrigger>
                    <SelectContent className="glass-card backdrop-blur-futuristic bg-slate-900/95 border-slate-700 shadow-xl">
                      <SelectItem value="all" className="text-white hover:bg-slate-800/80 focus:bg-slate-800/80">
                        <span dir="auto">{t.allStatuses}</span>
                      </SelectItem>
                      <SelectItem value="active" className="text-white hover:bg-slate-800/80 focus:bg-slate-800/80">
                        <span dir="auto">{t.statusActive}</span>
                      </SelectItem>
                      <SelectItem value="inactive" className="text-white hover:bg-slate-800/80 focus:bg-slate-800/80">
                        <span dir="auto">{t.statusInactive}</span>
                      </SelectItem>
                      <SelectItem value="suspended" className="text-white hover:bg-slate-800/80 focus:bg-slate-800/80">
                        <span dir="auto">{t.statusSuspended}</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1">
                  <Select value={locationFilter} onValueChange={setLocationFilter}>
                    <SelectTrigger className="w-full glass-card backdrop-blur-futuristic bg-slate-800/50 border-slate-600 text-white">
                      <SelectValue placeholder={t.restaurant} />
                    </SelectTrigger>
                    <SelectContent className="glass-card backdrop-blur-futuristic bg-slate-900/95 border-slate-700 shadow-xl">
                      <SelectItem value="all" className="text-white hover:bg-slate-800/80 focus:bg-slate-800/80">
                        <span dir="auto">{t.allRestaurants}</span>
                      </SelectItem>
                      {locations.map((location) => (
                        <SelectItem
                          key={location.id}
                          value={location.id}
                          className="text-white hover:bg-slate-800/80 focus:bg-slate-800/80"
                        >
                          <span dir="auto">{location.name}</span>
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
            <div className="flex items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-white" dir="auto">
                  {t.tableTitle}
                </CardTitle>
                <CardDescription className="text-slate-200" dir="auto">
                  {t.tableSubtitle}
                </CardDescription>
              </div>

              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="mt-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0">
                    <Plus className="mr-2 h-4 w-4" />
                    <span dir="auto">{t.newEmployee}</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] glass-card backdrop-blur-futuristic bg-slate-900/95 border-slate-700 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-white" dir="auto">
                      {t.createTitle}
                    </DialogTitle>
                    <DialogDescription className="text-slate-200" dir="auto">
                      {t.createDesc}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nom" className="text-white" dir="auto">
                          {t.labelLastName}
                        </Label>
                        <Input
                          id="nom"
                          value={newEmployee.nom}
                          onChange={(e) => setNewEmployee({ ...newEmployee, nom: e.target.value })}
                          required
                          className="glass-card backdrop-blur-futuristic bg-slate-800/50 border-slate-600 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="prenom" className="text-white" dir="auto">
                          {t.labelFirstName}
                        </Label>
                        <Input
                          id="prenom"
                          value={newEmployee.prenom}
                          onChange={(e) => setNewEmployee({ ...newEmployee, prenom: e.target.value })}
                          required
                          className="glass-card backdrop-blur-futuristic bg-slate-800/50 border-slate-600 text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="username" className="text-white" dir="auto">
                          {t.labelUsername}
                        </Label>
                        <Input
                          id="username"
                          value={newEmployee.username}
                          onChange={(e) => setNewEmployee({ ...newEmployee, username: e.target.value })}
                          required
                          className="glass-card backdrop-blur-futuristic bg-slate-800/50 border-slate-600 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-white" dir="auto">
                          {t.labelEmail}
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={newEmployee.email}
                          onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                          required
                          className="glass-card backdrop-blur-futuristic bg-slate-800/50 border-slate-600 text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="telephone" className="text-white" dir="auto">
                          {t.labelPhone}
                        </Label>
                        <Input
                          id="telephone"
                          value={newEmployee.telephone}
                          onChange={(e) => setNewEmployee({ ...newEmployee, telephone: e.target.value })}
                          className="glass-card backdrop-blur-futuristic bg-slate-800/50 border-slate-600 text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="job_title_combobox" className="text-white" dir="auto">
                          {t.labelJob}
                        </Label>
                        <Popover open={jobPopoverOpen} onOpenChange={setJobPopoverOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              id="job_title_combobox"
                              variant="outline"
                              role="combobox"
                              aria-expanded={jobPopoverOpen}
                              className="w-full justify-between glass-card backdrop-blur-futuristic bg-slate-800/50 border-slate-600 text-white"
                            >
                              <span className="truncate" dir="auto">
                                {newEmployee.job_title ? newEmployee.job_title : t.jobPlaceholder}
                              </span>
                              <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50 shrink-0" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0 glass-card backdrop-blur-futuristic bg-slate-900/95 border-slate-700 text-white">
                            <Command shouldFilter={false}>
                              <CommandInput
                                placeholder={t.jobPlaceholder}
                                value={jobSearch}
                                onValueChange={(v) => setJobSearch(v)}
                              />
                              <CommandList>
                                <CommandEmpty>
                                  <div className="p-3 text-sm text-slate-300">{"Aucun résultat"}</div>
                                </CommandEmpty>
                                <CommandGroup heading={<span className="text-xs text-slate-400">{"Suggestions"}</span>}>
                                  {postes
                                    .filter((p) => p.toLowerCase().includes(jobSearch.toLowerCase()))
                                    .map((p) => (
                                      <CommandItem
                                        key={p}
                                        value={p}
                                        onSelect={() => {
                                          setNewEmployee({ ...newEmployee, job_title: p })
                                          setJobPopoverOpen(false)
                                          setJobSearch("")
                                        }}
                                        className="cursor-pointer"
                                      >
                                        <Check
                                          className={`mr-2 h-4 w-4 ${
                                            newEmployee.job_title === p ? "opacity-100" : "opacity-0"
                                          }`}
                                        />
                                        <span dir="auto">{p}</span>
                                      </CommandItem>
                                    ))}
                                </CommandGroup>
                                {jobSearch.trim() &&
                                  !postes.map((x) => x.toLowerCase()).includes(jobSearch.trim().toLowerCase()) && (
                                    <CommandGroup>
                                      <CommandItem
                                        value={`__create__${jobSearch}`}
                                        onSelect={() => {
                                          setNewEmployee({ ...newEmployee, job_title: jobSearch.trim() })
                                          setJobPopoverOpen(false)
                                          setJobSearch("")
                                        }}
                                        className="cursor-pointer"
                                      >
                                        <PlusCircle className="mr-2 h-4 w-4 opacity-80" />
                                        <span dir="auto">{`Utiliser "${jobSearch.trim()}"`}</span>
                                      </CommandItem>
                                    </CommandGroup>
                                  )}
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        {newEmployee.job_title && (
                          <div className="text-xs text-slate-300" dir="auto">
                            {newEmployee.job_title}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="salaire" className="text-white" dir="auto">
                          {t.labelSalary}
                        </Label>
                        <Input
                          id="salaire"
                          type="number"
                          value={newEmployee.salaire}
                          onChange={(e) => setNewEmployee({ ...newEmployee, salaire: e.target.value })}
                          className="glass-card backdrop-blur-futuristic bg-slate-800/50 border-slate-600 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location" className="text-white" dir="auto">
                          {t.labelRestaurant}
                        </Label>
                        <Select
                          value={newEmployee.location_id}
                          onValueChange={(value) => setNewEmployee({ ...newEmployee, location_id: value })}
                        >
                          <SelectTrigger className="glass-card backdrop-blur-futuristic bg-slate-800/50 border-slate-600 text-white">
                            <SelectValue placeholder={t.selectRestaurant} />
                          </SelectTrigger>
                          <SelectContent className="glass-card backdrop-blur-futuristic bg-slate-900/95 border-slate-700 shadow-xl">
                            {locations.map((location) => (
                              <SelectItem
                                key={location.id}
                                value={location.id}
                                className="text-white hover:bg-slate-800/80 focus:bg-slate-800/80"
                              >
                                <span dir="auto">{location.name}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role" className="text-white" dir="auto">
                        {t.labelRole}
                      </Label>
                      <Select
                        value={newEmployee.role}
                        onValueChange={(value) => setNewEmployee({ ...newEmployee, role: value })}
                      >
                        <SelectTrigger className="glass-card backdrop-blur-futuristic bg-slate-800/50 border-slate-600 text-white">
                          <SelectValue placeholder={t.selectRole} />
                        </SelectTrigger>
                        <SelectContent className="glass-card backdrop-blur-futuristic bg-slate-900/95 border-slate-700 shadow-xl">
                          <SelectItem
                            value="employee"
                            className="text-white hover:bg-slate-800/80 focus:bg-slate-800/80"
                          >
                            <span dir="auto">{t.roleEmployee}</span>
                          </SelectItem>
                          <SelectItem
                            value="manager"
                            className="text-white hover:bg-slate-800/80 focus:bg-slate-800/80"
                          >
                            <span dir="auto">{t.roleManager}</span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                      className="glass-card backdrop-blur-futuristic bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50"
                    >
                      <span dir="auto">{t.cancel}</span>
                    </Button>
                    <Button
                      onClick={handleCreateEmployee}
                      disabled={!canCreate}
                      aria-disabled={!canCreate}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <span dir="auto">{t.createEmployee}</span>
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-200" dir="auto">
                    {t.colName}
                  </TableHead>
                  <TableHead className="text-slate-200" dir="auto">
                    {t.colEmail}
                  </TableHead>
                  <TableHead className="text-slate-200" dir="auto">
                    {t.colJob}
                  </TableHead>
                  <TableHead className="text-slate-200" dir="auto">
                    {t.colRestaurant}
                  </TableHead>
                  <TableHead className="text-slate-200" dir="auto">
                    {t.colSalary}
                  </TableHead>
                  <TableHead className="text-slate-200" dir="auto">
                    {t.colStatus}
                  </TableHead>
                  <TableHead className="text-slate-200" dir="auto">
                    {t.colUsername}
                  </TableHead>
                  <TableHead className="text-slate-200" dir="auto">
                    {t.colPassword}
                  </TableHead>
                  <TableHead className="text-slate-200" dir="auto">
                    {t.colActions}
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredEmployees.map((employee) => {
                  const username = employee.user?.username || "—"
                  const pwd = employee.user?.password
                  const isRevealed = revealed[employee.id] === true
                  const masked = pwd ? "•".repeat(Math.max(pwd.length, 6)) : "—"
                  return (
                    <TableRow key={employee.id} className="border-slate-700 hover:bg-slate-800/20">
                      <TableCell className="font-medium text-white" dir="auto">
                        {employee.prenom} {employee.nom}
                      </TableCell>
                      <TableCell className="text-slate-200">{employee.email}</TableCell>
                      <TableCell className="text-slate-200" dir="auto">
                        {employee.job_title}
                      </TableCell>
                      <TableCell className="text-slate-200" dir="auto">
                        {employee.location ? employee.location.name : t.notAssigned}
                      </TableCell>
                      <TableCell className="text-slate-200">{fmtMoney(employee.salaire || 0)}</TableCell>
                      <TableCell>{getStatusBadge(employee.status)}</TableCell>
                      <TableCell className="text-slate-200">{username}</TableCell>
                      <TableCell className="text-slate-200" dir="auto">
                        {!pwd ? (
                          <span>{"—"}</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-mono">{isRevealed ? pwd : masked}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7 glass-card backdrop-blur-futuristic bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700/50"
                              onClick={() => setRevealed((prev) => ({ ...prev, [employee.id]: !prev[employee.id] }))}
                              aria-label={isRevealed ? t.hidePassword : t.revealPassword}
                              title={isRevealed ? t.hidePassword : t.revealPassword}
                            >
                              {isRevealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Link href={`/dashboard/admin/employee/${employee.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="glass-card backdrop-blur-futuristic bg-slate-800/50 border-slate-600 text-blue-400 hover:bg-slate-700/50 hover:text-blue-300"
                              aria-label="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="glass-card backdrop-blur-futuristic bg-slate-800/50 border-slate-600 text-red-400 hover:bg-slate-700/50 hover:text-red-300"
                                aria-label="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="glass-card backdrop-blur-futuristic bg-slate-900/95 border-slate-700 text-white">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-white" dir="auto">
                                  {t.deleteTitle}
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-slate-200" dir="auto">
                                  {t.deleteDesc(employee.prenom, employee.nom)}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="glass-card backdrop-blur-futuristic bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50">
                                  <span dir="auto">{t.cancel}</span>
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteEmployee(employee.id)}
                                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-0"
                                >
                                  <span dir="auto">{t.deleteConfirm}</span>
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>

            {filteredEmployees.length === 0 && (
              <div className="text-center py-8 text-slate-400" dir="auto">
                {t.noneFound}
              </div>
            )}
            {error && (
              <div className="text-center py-3 text-red-300" dir="auto">
                {"Erreur de chargement de la liste"}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  )
}
