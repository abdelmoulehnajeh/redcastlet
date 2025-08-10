"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
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
import { Clock, Calendar, DollarSign, Users, TrendingUp, AlertCircle, CheckCircle, FileText, MapPin, Eye, Edit, Trash2, Phone, Mail, Building, UserPlus } from 'lucide-react'
import { useQuery, useMutation } from "@apollo/client"
import {
  GET_DASHBOARD_STATS,
  GET_LOCATIONS,
  GET_EMPLOYEES,
  CREATE_EMPLOYEE,
  DELETE_EMPLOYEE,
  UPDATE_EMPLOYEE,
} from "@/lib/graphql-queries"
import { toast } from "sonner"

type Lang = "fr" | "ar"

type Dict = {
  welcome: (username?: string) => string
  introAdmin: string
  introManager: string
  introEmployee: string
  roleAdmin: string
  roleManager: string
  roleEmployee: string

  // Stats cards (employee)
  statsHoursThisMonth: string
  statsHoursThisWeek: (h: number | string) => string
  statsEstimatedSalary: string
  statsBasedOnRate: (rate: number | string) => string
  statsRemainingLeave: string
  statsDaysAvailable: string
  statsStatus: string
  active: string
  inactive: string
  suspended: string

  // Stats cards (admin)
  statsActiveEmployees: string
  statsOutOfEmployees: (active: number | string, total: number | string) => string
  statsRestaurants: string
  statsRestaurantsSubtitle: string
  statsPenalties: string
  statsPenaltiesSubtitle: string
  statsAdvance: string
  statsRevenueSubtitle: (growth: number | string) => string

  // Locations section
  locationsTitle: string
  locationsDesc: string
  noLocations: string
  viewEmployees: string
  managerLabel: string
  employeesLabel: string

  // Employees section
  employeesTitle: string
  employeesDesc: string
  filterRestaurant: string
  filterStatus: string
  all: string

  // Add employee dialog
  newEmployeeBtn: string
  addEmployeeTitle: string
  addEmployeeDesc: string
  firstName: string
  lastName: string
  username: string
  email: string
  phone: string
  jobTitle: string
  salary: string
  role: string
  restaurant: string
  admin: string
  employee: string
  cancel: string
  create: string
  selectRestaurant: string

  // Edit employee dialog
  editEmployeeTitle: string
  editEmployeeDesc: (fn?: string, ln?: string) => string
  bonus: string
  fines: string
  absences: string
  delays: string
  advances: string
  uniforms: string
  save: string

  // Table / cards
  employeeCol: string
  contactCol: string
  jobCol: string
  restaurantCol: string
  salaryCol: string
  statusCol: string
  actionsCol: string
  notDefined: string
  notAssigned: string
  idLabel: string

  // Empty states
  noEmployees: string

  // Mobile show more
  showLess: string
  showMore: (n: number) => string

  // Quick actions
  quickActionsTitle: string
  quickActionsDesc: string
  clockIn: string
  schedule: string
  leave: string
  finance: string
  manageEmployees: string
  manageSchedules: string
  approve: string
  manageFinance: string
  clockInSubtitle: string
  scheduleSubtitle: string
  leaveSubtitle: string
  financeSubtitle: string

  // Toasts
  employeeCreated: string
  employeeCreateError: (msg: string) => string
  employeeDeleted: string
  employeeDeleteError: (msg: string) => string
  employeeUpdated: string
  employeeUpdateError: (msg: string) => string

  // Buttons common
  add: string
}

const translations: Record<Lang, Dict> = {
  fr: {
    welcome: (u) => `Bienvenue, ${u ?? ""}!`,
    introAdmin: "Gérez votre restaurant depuis ce tableau de bord administrateur futuriste",
    introManager: "Supervisez votre équipe et les opérations avec une interface révolutionnaire",
    introEmployee: "Consultez vos informations dans un environnement 3D immersif",
    roleAdmin: "🔥 Administrateur",
    roleManager: "⚡ Manager",
    roleEmployee: "✨ Employé",

    statsHoursThisMonth: "Heures ce mois",
    statsHoursThisWeek: (h) => `+${h} cette semaine`,
    statsEstimatedSalary: "Salaire estimé",
    statsBasedOnRate: (r) => `Basé sur ${r}/h`,
    statsRemainingLeave: "Congés restants",
    statsDaysAvailable: "jours disponibles",
    statsStatus: "Statut",
    active: "actif",
    inactive: "inactif",
    suspended: "suspendu",

    statsActiveEmployees: "Employés actifs",
    statsOutOfEmployees: (_a, t) => `sur ${t} employés`,
    statsRestaurants: "Restaurants",
    statsRestaurantsSubtitle: "établissements actifs",
    statsPenalties: "Pénalités",
    statsPenaltiesSubtitle: "par mois",
    statsAdvance: "Avance",
    statsRevenueSubtitle: (g) => `+${g}% vs mois dernier`,

    locationsTitle: "Gestion des Restaurants",
    locationsDesc: "Gérez vos différents établissements",
    noLocations: "Aucun restaurant configuré",
    viewEmployees: "Voir les Employés",
    managerLabel: "Manager :",
    employeesLabel: "Employés :",

    employeesTitle: "Gestion des Employés",
    employeesDesc: "Gérez tous vos employés",
    filterRestaurant: "Restaurant:",
    filterStatus: "Statut:",
    all: "Tous",

    newEmployeeBtn: "Nouvel Employé",
    addEmployeeTitle: "Ajouter un Employé",
    addEmployeeDesc: "Créez un nouveau compte employé",
    firstName: "Prénom *",
    lastName: "Nom *",
    username: "Nom d'utilisateur *",
    email: "Email *",
    phone: "Téléphone",
    jobTitle: "Poste",
    salary: "Salaire (DT)",
    role: "Rôle",
    restaurant: "Restaurant",
    admin: "Admin",
    employee: "Employé",
    cancel: "Annuler",
    create: "Créer",
    selectRestaurant: "Sélectionner un restaurant",

    editEmployeeTitle: "Modifier l'Employé",
    editEmployeeDesc: (fn, ln) => `Modifiez les informations de ${fn ?? ""} ${ln ?? ""}`,
    bonus: "Prime (DT)",
    fines: "Infractions",
    absences: "Absences",
    delays: "Retards",
    advances: "Avance (DT)",
    uniforms: "Tenues de travail",
    save: "Sauvegarder",

    employeeCol: "Employé",
    contactCol: "Contact",
    jobCol: "Poste",
    restaurantCol: "Restaurant",
    salaryCol: "Salaire",
    statusCol: "Statut",
    actionsCol: "Actions",
    notDefined: "Non défini",
    notAssigned: "Non assigné",
    idLabel: "ID:",

    noEmployees: "Aucun employé trouvé",

    showLess: "Voir moins",
    showMore: (n) => `En savoir plus (${n} autres)`,

    quickActionsTitle: "Actions rapides",
    quickActionsDesc: "Accédez rapidement aux fonctionnalités principales",
    clockIn: "Pointer",
    schedule: "Planning",
    leave: "Congé",
    finance: "Salaire",
    manageEmployees: "Employés",
    manageSchedules: "Planning",
    approve: "Approuver",
    manageFinance: "Finance",
    clockInSubtitle: "Enregistrer vos heures",
    scheduleSubtitle: "Voir votre planning",
    leaveSubtitle: "Demander un congé",
    financeSubtitle: "Voir vos finances",

    employeeCreated: "Employé créé avec succès",
    employeeCreateError: (m) => `Erreur lors de la création: ${m}`,
    employeeDeleted: "Employé supprimé avec succès",
    employeeDeleteError: (m) => `Erreur lors de la suppression: ${m}`,
    employeeUpdated: "Employé mis à jour avec succès",
    employeeUpdateError: (m) => `Erreur lors de la mise à jour: ${m}`,

    add: "Ajouter",
  },
  ar: {
    welcome: (u) => `مرحباً، ${u ?? ""}!`,
    introAdmin: "إدارة المطعم من لوحة تحكم متقدمة",
    introManager: "أشرف على الفريق والعمليات بواجهة ثورية",
    introEmployee: "اطّلع على معلوماتك في بيئة ثلاثية الأبعاد",
    roleAdmin: "🔥 مدير النظام",
    roleManager: "⚡ مدير",
    roleEmployee: "✨ موظف",

    statsHoursThisMonth: "الساعات هذا الشهر",
    statsHoursThisWeek: (h) => `+${h} هذا الأسبوع`,
    statsEstimatedSalary: "الراتب التقديري",
    statsBasedOnRate: (r) => `حسب ${r}/ساعة`,
    statsRemainingLeave: "الإجازات المتبقية",
    statsDaysAvailable: "أيام متاحة",
    statsStatus: "الحالة",
    active: "نشط",
    inactive: "غير نشط",
    suspended: "موقوف",

    statsActiveEmployees: "الموظفون النشطون",
    statsOutOfEmployees: (_a, t) => `من أصل ${t} موظف`,
    statsRestaurants: "المطاعم",
    statsRestaurantsSubtitle: "فروع نشطة",
    statsPenalties: "الجزاءات",
    statsPenaltiesSubtitle: "شهرياً",
    statsAdvance: "سلفة",
    statsRevenueSubtitle: (g) => `+${g}% مقارنة بالشهر الماضي`,

    locationsTitle: "إدارة المطاعم",
    locationsDesc: "إدارة الفروع المختلفة",
    noLocations: "لا توجد مطاعم مضافة",
    viewEmployees: "عرض الموظفين",
    managerLabel: "المدير:",
    employeesLabel: "الموظفون:",

    employeesTitle: "إدارة الموظفين",
    employeesDesc: "إدارة جميع الموظفين",
    filterRestaurant: "المطعم:",
    filterStatus: "الحالة:",
    all: "الكل",

    newEmployeeBtn: "موظف جديد",
    addEmployeeTitle: "إضافة موظف",
    addEmployeeDesc: "إنشاء حساب موظف جديد",
    firstName: "الاسم الأول *",
    lastName: "اسم العائلة *",
    username: "اسم المستخدم *",
    email: "البريد الإلكتروني *",
    phone: "الهاتف",
    jobTitle: "الوظيفة",
    salary: "الراتب (DT)",
    role: "الدور",
    restaurant: "المطعم",
    admin: "مدير النظام",
    employee: "موظف",
    cancel: "إلغاء",
    create: "إنشاء",
    selectRestaurant: "اختر مطعماً",

    editEmployeeTitle: "تعديل الموظف",
    editEmployeeDesc: (fn, ln) => `تعديل بيانات ${fn ?? ""} ${ln ?? ""}`,
    bonus: "علاوة (DT)",
    fines: "المخالفات",
    absences: "الغيابات",
    delays: "التأخيرات",
    advances: "سلفة (DT)",
    uniforms: "الزي الرسمي",
    save: "حفظ",

    employeeCol: "الموظف",
    contactCol: "التواصل",
    jobCol: "الوظيفة",
    restaurantCol: "المطعم",
    salaryCol: "الراتب",
    statusCol: "الحالة",
    actionsCol: "إجراءات",
    notDefined: "غير محدد",
    notAssigned: "غير معيّن",
    idLabel: "المعرف:",

    noEmployees: "لا يوجد موظفون",

    showLess: "عرض أقل",
    showMore: (n) => `المزيد (${n} أخرى)`,

    quickActionsTitle: "إجراءات سريعة",
    quickActionsDesc: "وصول سريع للوظائف الأساسية",
    clockIn: "تسجيل الحضور",
    schedule: "الجدول",
    leave: "إجازة",
    finance: "المالية",
    manageEmployees: "الموظفون",
    manageSchedules: "الجدول",
    approve: "اعتماد",
    manageFinance: "المالية",
    clockInSubtitle: "تسجيل ساعاتك",
    scheduleSubtitle: "عرض جدولك",
    leaveSubtitle: "طلب إجازة",
    financeSubtitle: "عرض أمورك المالية",

    employeeCreated: "تم إنشاء الموظف بنجاح",
    employeeCreateError: (m) => `خطأ أثناء الإنشاء: ${m}`,
    employeeDeleted: "تم حذف الموظف بنجاح",
    employeeDeleteError: (m) => `خطأ أثناء الحذف: ${m}`,
    employeeUpdated: "تم تحديث بيانات الموظف بنجاح",
    employeeUpdateError: (m) => `خطأ أثناء التحديث: ${m}`,

    add: "إضافة",
  },
}

export default function DashboardPage() {
  const { user } = useAuth()

  // Language from localStorage
  const [lang, setLang] = useState<Lang>("fr")
  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = localStorage.getItem("lang")
    if (stored === "ar" || stored === "fr") {
      setLang(stored)
    } else {
      localStorage.setItem("lang", "fr")
      setLang("fr")
    }
  }, [])

  // Keep layout LTR to preserve design; only set lang for a11y
  useEffect(() => {
    if (typeof document === "undefined") return
    document.documentElement.setAttribute("lang", lang)
    document.documentElement.setAttribute("dir", "ltr")
  }, [lang])

  const t = translations[lang]

  const [showAllEmployees, setShowAllEmployees] = useState(false)
  const [employeeLocationFilter, setEmployeeLocationFilter] = useState<string>("")
  const [employeeStatusFilter, setEmployeeStatusFilter] = useState<string>("")
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

  const { data, loading } = useQuery(GET_DASHBOARD_STATS, {
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
      toast.success(t.employeeCreated)
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
      toast.error(t.employeeCreateError(error.message))
    },
  })

  const [deleteEmployee] = useMutation(DELETE_EMPLOYEE, {
    onCompleted: () => {
      toast.success(t.employeeDeleted)
      refetchEmployees()
      refetchLocations()
    },
    onError: (error) => {
      toast.error(t.employeeDeleteError(error.message))
    },
  })

  const [updateEmployee] = useMutation(UPDATE_EMPLOYEE, {
    onCompleted: () => {
      toast.success(t.employeeUpdated)
      setIsEditEmployeeOpen(false)
      setSelectedEmployee(null)
      refetchEmployees()
      refetchLocations()
    },
    onError: (error) => {
      toast.error(t.employeeUpdateError(error.message))
    },
  })

  const handleCreateEmployee = () => {
    if (!newEmployee.nom || !newEmployee.prenom || !newEmployee.email || !newEmployee.username) {
      toast.error(lang === "ar" ? "يرجى ملء جميع الحقول المطلوبة" : "Veuillez remplir tous les champs obligatoires")
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
    const confirmed =
      lang === "ar"
        ? confirm("هل أنت متأكد من حذف هذا الموظف؟")
        : confirm("Êtes-vous sûr de vouloir supprimer cet employé ?")
    if (confirmed) {
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
        avance: Number.parseFloat(selectedEmployee.avance) || 0,
        tenu_de_travail: Number.parseInt(selectedEmployee.tenu_de_travail) || 0,
        status: selectedEmployee.status,
      },
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
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
                  transform: "perspective(1000px) rotateX(10deg) rotateY(5deg)",
                  boxShadow:
                    "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)",
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

  const filteredEmployees = employees.filter((emp: any) => {
    let locationMatch = true
    if (employeeLocationFilter) {
      if (emp.location_id) {
        locationMatch = emp.location_id === employeeLocationFilter
      } else if (emp.location && emp.location.id) {
        locationMatch = emp.location.id === employeeLocationFilter
      } else {
        locationMatch = false
      }
    }
    const statusMatch = employeeStatusFilter ? emp.status === employeeStatusFilter : true
    return locationMatch && statusMatch
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden" dir="ltr">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(120,219,255,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,119,198,0.1),transparent_50%)]"></div>
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 p-6 space-y-8">
        {/* Welcome Section */}
        <div className="group relative transform-gpu perspective-1000">
          <div
            className="relative bg-gradient-to-r from-red-600/90 via-red-500/90 to-orange-600/90 backdrop-blur-xl border border-red-400/30 rounded-3xl p-8 text-white transition-all duration-500"
            style={{
              transform: "perspective(1000px) rotateX(5deg)",
              boxShadow:
                "0 35px 80px -15px rgba(239, 68, 68, 0.4), 0 0 0 1px rgba(248, 113, 113, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
            }}
          >
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-yellow-400/20 to-red-400/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="relative z-10">
              <h1 dir="auto" className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-yellow-100 to-white bg-clip-text text-transparent">
                {t.welcome(user?.username)}
              </h1>
              <p dir="auto" className="text-red-100 text-lg sm:text-xl mb-6 leading-relaxed">
                {user?.role === "admin" ? t.introAdmin : user?.role === "manager" ? t.introManager : t.introEmployee}
              </p>
              <Badge
                variant="secondary"
                className="mt-3 bg-white/20 text-white border-white/30 px-6 py-2 text-lg font-semibold backdrop-blur-sm transition-all duration-300"
              >
                {user?.role === "admin" ? t.roleAdmin : user?.role === "manager" ? t.roleManager : t.roleEmployee}
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {user?.role === "employee" && (
            <>
              <StatsCard3D
                title={t.statsHoursThisMonth}
                value={`${stats.monthlyHours || 0}h`}
                subtitle={t.statsHoursThisWeek(stats.weeklyHours || 0)}
                icon={<Clock className="h-8 w-8" />}
                gradient="from-blue-500 to-cyan-500"
                glowColor="rgba(59, 130, 246, 0.4)"
              />
              <StatsCard3D
                title={t.statsEstimatedSalary}
                value={`${stats.estimatedSalary || 0}DT`}
                subtitle={t.statsBasedOnRate(stats.hourlyRate || 0)}
                icon={<DollarSign className="h-8 w-8" />}
                gradient="from-emerald-500 to-teal-500"
                glowColor="rgba(16, 185, 129, 0.4)"
              />
              <StatsCard3D
                title={t.statsRemainingLeave}
                value={`${stats.remainingLeave || 0}`}
                subtitle={t.statsDaysAvailable}
                icon={<Calendar className="h-8 w-8" />}
                gradient="from-violet-500 to-purple-500"
                glowColor="rgba(139, 92, 246, 0.4)"
              />
              <StatsCard3D
                title={t.statsStatus}
                value={lang === "ar" ? t.active : "Actif"}
                subtitle={lang === "ar" ? "آخر تسجيل دخول اليوم" : "Dernière connexion aujourd'hui"}
                icon={<CheckCircle className="h-8 w-8" />}
                gradient="from-green-500 to-emerald-500"
                glowColor="rgba(34, 197, 94, 0.4)"
              />
            </>
          )}

          {user?.role === "admin" && (
            <>
              <Link href="/dashboard/admin/employees">
                <StatsCard3D
                  title={t.statsActiveEmployees}
                  value={`${stats.activeEmployees || employees.length}`}
                  subtitle={t.statsOutOfEmployees(stats.activeEmployees || employees.length, stats.totalEmployees || employees.length)}
                  icon={<Users className="h-8 w-8" />}
                  gradient="from-blue-500 to-indigo-500"
                  glowColor="rgba(59, 130, 246, 0.4)"
                />
              </Link>
              <Link href="/dashboard/admin/locations">
                <StatsCard3D
                  title={t.statsRestaurants}
                  value={`${locations.length}`}
                  subtitle={t.statsRestaurantsSubtitle}
                  icon={<Building className="h-8 w-8" />}
                  gradient="from-purple-500 to-pink-500"
                  glowColor="rgba(147, 51, 234, 0.4)"
                />
              </Link>
              <Link href="/dashboard/admin/finance">
                <StatsCard3D
                  title={t.statsPenalties}
                  value={`${stats.pendingRequests || 0}`}
                  subtitle={t.statsPenaltiesSubtitle}
                  icon={<AlertCircle className="h-8 w-8" />}
                  gradient="from-orange-500 to-red-500"
                  glowColor="rgba(249, 115, 22, 0.4)"
                />
              </Link>
              <Link href="/dashboard/admin/finance">
                <StatsCard3D
                  title={t.statsAdvance}
                  value={`${stats.monthlyRevenue || 0}DT`}
                  subtitle={t.statsRevenueSubtitle(stats.revenueGrowth || 0)}
                  icon={<TrendingUp className="h-8 w-8" />}
                  gradient="from-emerald-500 to-green-500"
                  glowColor="rgba(16, 185, 129, 0.4)"
                />
              </Link>
            </>
          )}
        </div>

        {/* Admin Locations Section */}
        {user?.role === "admin" && (
          <Card3D>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                  <MapPin className="h-7 w-7 text-red-400" />
                  <span dir="auto">{t.locationsTitle}</span>
                </CardTitle>
                <CardDescription className="text-gray-300 text-lg" dir="auto">
                  {t.locationsDesc}
                </CardDescription>
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
                    <LocationCard3D key={location.id} location={location} t={t} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <MapPin className="h-16 w-16 mx-auto mb-6 opacity-50" />
                  <p className="text-xl" dir="auto">
                    {t.noLocations}
                  </p>
                </div>
              )}
            </CardContent>
          </Card3D>
        )}

        {/* Admin Employees Management */}
        {user?.role === "admin" && (
          <Card3D>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="w-full">
                <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  <Users className="h-6 w-6 sm:h-7 sm:w-7 text-blue-400" />
                  <span dir="auto">{t.employeesTitle}</span>
                </CardTitle>
                <CardDescription className="text-gray-300 text-base sm:text-lg" dir="auto">
                  {t.employeesDesc}
                </CardDescription>

                <div className="flex flex-col sm:flex-row gap-2 mt-4">
                  <div className="flex flex-col sm:flex-row gap-2 w-full">
                    <div className="flex-1 min-w-[150px]">
                      <label
                        htmlFor="employee-location-filter"
                        className="text-gray-300 text-sm font-medium block mb-1 sm:mb-0 sm:inline"
                        dir="auto"
                      >
                        {t.filterRestaurant}
                      </label>
                      <div className="relative">
                        <select
                          id="employee-location-filter"
                          value={employeeLocationFilter}
                          onChange={(e) => setEmployeeLocationFilter(e.target.value)}
                          className="w-full bg-slate-800/90 border border-slate-600/50 text-white text-sm rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition-all duration-300 appearance-none pr-10 shadow-sm hover:bg-slate-700/90 hover:border-blue-400/70"
                        >
                          <option value="">{t.all}</option>
                          {locations.map((loc: any) => (
                            <option key={loc.id} value={loc.id}>
                              {loc.name}
                            </option>
                          ))}
                        </select>
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 min-w-[150px]">
                      <label
                        htmlFor="employee-status-filter"
                        className="text-gray-300 text-sm font-medium block mb-1 sm:mb-0 sm:inline"
                        dir="auto"
                      >
                        {t.filterStatus}
                      </label>
                      <div className="relative">
                        <select
                          id="employee-status-filter"
                          value={employeeStatusFilter}
                          onChange={(e) => setEmployeeStatusFilter(e.target.value)}
                          className="w-full bg-slate-800/90 border border-slate-600/50 text-white text-sm rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition-all duration-300 appearance-none pr-10 shadow-sm hover:bg-slate-700/90 hover:border-blue-400/70"
                        >
                          <option value="">{t.all}</option>
                          <option value="active">{t.active}</option>
                          <option value="inactive">{t.inactive}</option>
                          <option value="suspended">{t.suspended}</option>
                        </select>
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Dialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="w-full sm:w-auto bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold px-4 sm:px-6 py-3 rounded-xl transition-all duration-300 shadow-lg"
                    style={{ boxShadow: "0 10px 25px -5px rgba(239, 68, 68, 0.4)" }}
                  >
                    <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    <span className="hidden sm:inline" dir="auto">
                      {t.newEmployeeBtn}
                    </span>
                    <span className="sm:hidden" dir="auto">
                      {t.add}
                    </span>
                  </Button>
                </DialogTrigger>

                <DialogContent className="w-[95vw] max-w-md mx-auto bg-slate-800/95 backdrop-blur-xl border border-slate-600/50 rounded-2xl text-white">
                  <DialogHeader>
                    <DialogTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent" dir="auto">
                      {t.addEmployeeTitle}
                    </DialogTitle>
                    <DialogDescription className="text-gray-300" dir="auto">
                      {t.addEmployeeDesc}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="prenom" className="text-gray-300" dir="auto">
                          {t.firstName}
                        </Label>
                        <Input
                          id="prenom"
                          value={newEmployee.prenom}
                          onChange={(e) => setNewEmployee({ ...newEmployee, prenom: e.target.value })}
                          placeholder={lang === "ar" ? "محمد" : "Jean"}
                          className="bg-slate-700/50 border-slate-600 text-white rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                        />
                      </div>
                      <div>
                        <Label htmlFor="nom" className="text-gray-300" dir="auto">
                          {t.lastName}
                        </Label>
                        <Input
                          id="nom"
                          value={newEmployee.nom}
                          onChange={(e) => setNewEmployee({ ...newEmployee, nom: e.target.value })}
                          placeholder={lang === "ar" ? "الهاشمي" : "Dupont"}
                          className="bg-slate-700/50 border-slate-600 text-white rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="username" className="text-gray-300" dir="auto">
                        {t.username}
                      </Label>
                      <Input
                        id="username"
                        value={newEmployee.username}
                        onChange={(e) => setNewEmployee({ ...newEmployee, username: e.target.value })}
                        placeholder={lang === "ar" ? "mohamed.ali" : "jean.dupont"}
                        className="bg-slate-700/50 border-slate-600 text-white rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-gray-300" dir="auto">
                        {t.email}
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={newEmployee.email}
                        onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                        placeholder={lang === "ar" ? "mohamed.ali@example.com" : "jean.dupont@example.com"}
                        className="bg-slate-700/50 border-slate-600 text-white rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                      />
                    </div>

                    <div>
                      <Label htmlFor="telephone" className="text-gray-300" dir="auto">
                        {t.phone}
                      </Label>
                      <Input
                        id="telephone"
                        value={newEmployee.telephone}
                        onChange={(e) => setNewEmployee({ ...newEmployee, telephone: e.target.value })}
                        placeholder="0123456789"
                        className="bg-slate-700/50 border-slate-600 text-white rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                      />
                    </div>

                    <div>
                      <Label htmlFor="job_title" className="text-gray-300" dir="auto">
                        {t.jobTitle}
                      </Label>
                      <Input
                        id="job_title"
                        value={newEmployee.job_title}
                        onChange={(e) => setNewEmployee({ ...newEmployee, job_title: e.target.value })}
                        placeholder={lang === "ar" ? "نادل، طاهٍ، مدير..." : "Serveur, Cuisinier, Manager..."}
                        className="bg-slate-700/50 border-slate-600 text-white rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="salaire" className="text-gray-300" dir="auto">
                          {t.salary}
                        </Label>
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
                        <Label htmlFor="role" className="text-gray-300" dir="auto">
                          {t.role}
                        </Label>
                        <Select value={newEmployee.role} onValueChange={(value) => setNewEmployee({ ...newEmployee, role: value })}>
                          <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-600 text-white">
                            <SelectItem value="employee">{t.employee}</SelectItem>
                            <SelectItem value="manager">{t.roleManager.replace("⚡ ", "")}</SelectItem>
                            <SelectItem value="admin">{t.admin}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="location" className="text-gray-300" dir="auto">
                        {t.restaurant}
                      </Label>
                      <Select
                        value={newEmployee.location_id}
                        onValueChange={(value) => setNewEmployee({ ...newEmployee, location_id: value })}
                      >
                        <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white rounded-xl">
                          <SelectValue placeholder={t.selectRestaurant} />
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
                      {t.cancel}
                    </Button>
                    <Button onClick={handleCreateEmployee} className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                      {t.create}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>

            <CardContent className="px-2 sm:px-6">
              {employeesLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-4 p-4 sm:p-6 border border-slate-600/50 rounded-2xl animate-pulse bg-slate-700/30"
                    >
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-600 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-600 rounded w-1/4"></div>
                        <div className="h-3 bg-slate-600 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredEmployees.length > 0 ? (
                <>
                  {/* Mobile Card View */}
                  <div className="block lg:hidden space-y-4">
                    {(showAllEmployees ? filteredEmployees : filteredEmployees.slice(0, 3)).map((employee: any) => (
                      <div
                        key={employee.id}
                        className="bg-slate-800/50 backdrop-blur-sm border border-slate-600/50 rounded-2xl p-4 hover:bg-slate-700/50 transition-all duration-300"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-white text-lg" dir="auto">
                              {employee.prenom} {employee.nom}
                            </h3>
                            <p className="text-sm text-gray-400">
                              {t.idLabel} {employee.id}
                            </p>
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
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                              <Mail className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate" dir="auto">{employee.email}</span>
                            </div>
                            {employee.telephone && (
                              <div className="flex items-center gap-2 text-sm text-gray-3 00">
                                <Phone className="h-3 w-3 flex-shrink-0" />
                                <span>{employee.telephone}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">{t.jobTitle.replace(" (DT)", "")}</span>
                            <span className="text-sm text-gray-300 font-medium" dir="auto">
                              {employee.job_title || t.notDefined}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">{t.restaurant}</span>
                            {employee.location ? (
                              <div className="flex items-center gap-1 text-sm text-gray-300" dir="auto">
                                <Building className="h-3 w-3" />
                                <span className="truncate max-w-[150px]">{employee.location.name}</span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">{t.notAssigned}</span>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">{t.salary.replace(" (DT)", "")}</span>
                            <span className="text-sm text-gray-300 font-medium">
                              {employee.salaire ? `${employee.salaire}DT` : t.notDefined}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">{t.statusCol}</span>
                            <Badge
                              variant={employee.status === "active" ? "default" : "secondary"}
                              className={`text-xs ${
                                employee.status === "active"
                                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                                  : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                              }`}
                            >
                              {employee.status === "active"
                                ? t.active
                                : employee.status === "inactive"
                                  ? t.inactive
                                  : t.suspended}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                    {employees.length > 3 && (
                      <div className="flex justify-center pt-4">
                        <Button
                          onClick={() => setShowAllEmployees(!showAllEmployees)}
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg"
                        >
                          {showAllEmployees ? (
                            <>
                              {t.showLess}
                              <svg className="w-4 h-4 ml-2 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </>
                          ) : (
                            <>
                              {t.showMore(employees.length - 3)}
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
                          <TableHead className="text-gray-300 font-semibold" dir="auto">{t.employeeCol}</TableHead>
                          <TableHead className="text-gray-300 font-semibold" dir="auto">{t.contactCol}</TableHead>
                          <TableHead className="text-gray-300 font-semibold" dir="auto">{t.jobCol}</TableHead>
                          <TableHead className="text-gray-300 font-semibold" dir="auto">{t.restaurantCol}</TableHead>
                          <TableHead className="text-gray-300 font-semibold" dir="auto">{t.salaryCol}</TableHead>
                          <TableHead className="text-gray-300 font-semibold" dir="auto">{t.statusCol}</TableHead>
                          <TableHead className="text-gray-300 font-semibold" dir="auto">{t.actionsCol}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEmployees.map((employee: any) => (
                          <TableRow key={employee.id} className="border-slate-600/50 hover:bg-slate-700/30 transition-all duration-300">
                            <TableCell>
                              <div>
                                <div className="font-medium text-white" dir="auto">
                                  {employee.prenom} {employee.nom}
                                </div>
                                <div className="text-sm text-gray-400">
                                  {t.idLabel} {employee.id}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-sm text-gray-300" dir="auto">
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
                            <TableCell className="text-gray-300" dir="auto">{employee.job_title || t.notDefined}</TableCell>
                            <TableCell>
                              {employee.location ? (
                                <div className="flex items-center gap-1 text-gray-300" dir="auto">
                                  <Building className="h-3 w-3" />
                                  {employee.location.name}
                                </div>
                              ) : (
                                <span className="text-gray-500">{t.notAssigned}</span>
                              )}
                            </TableCell>
                            <TableCell className="text-gray-300">
                              {employee.salaire ? `${employee.salaire}DT` : t.notDefined}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={employee.status === "active" ? "default" : "secondary"}
                                className={
                                  employee.status === "active"
                                    ? "bg-green-500/20 text-green-400 border-green-500/30"
                                    : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                                }
                              >
                                {employee.status === "active"
                                  ? t.active
                                  : employee.status === "inactive"
                                    ? t.inactive
                                    : t.suspended}
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
                                  className="border-blue-400/50 text-blue-400 hover:bg-blue-400/20 hover:border-blue-400 transition-all duration-300"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteEmployee(employee.id)}
                                  className="border-red-400/50 text-red-400 hover:bg-red-400/20 hover:border-red-400 transition-all duration-300"
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
                  <p className="text-lg sm:text-xl" dir="auto">
                    {t.noEmployees}
                  </p>
                </div>
              )}
            </CardContent>
          </Card3D>
        )}

        {/* Spacer for mobile */}
        <div className="h-20"></div>

        {/* Edit Employee Dialog */}
        <Dialog open={isEditEmployeeOpen} onOpenChange={setIsEditEmployeeOpen}>
          <DialogContent className="max-w-md bg-slate-800/95 backdrop-blur-xl border border-slate-600/50 rounded-2xl text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent" dir="auto">
                {t.editEmployeeTitle}
              </DialogTitle>
              <DialogDescription className="text-gray-300" dir="auto">
                {t.editEmployeeDesc(selectedEmployee?.prenom, selectedEmployee?.nom)}
              </DialogDescription>
            </DialogHeader>

            {selectedEmployee && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-salaire" className="text-gray-300" dir="auto">
                      {t.salary}
                    </Label>
                    <Input
                      id="edit-salaire"
                      type="number"
                      value={selectedEmployee.salaire || ""}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee, salaire: e.target.value })}
                      className="bg-slate-700/50 border-slate-600 text-white rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-prime" className="text-gray-300" dir="auto">
                      {t.bonus}
                    </Label>
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
                    <Label htmlFor="edit-infractions" className="text-gray-300" dir="auto">
                      {t.fines}
                    </Label>
                    <Input
                      id="edit-infractions"
                      type="number"
                      value={selectedEmployee.infractions || ""}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee, infractions: e.target.value })}
                      className="bg-slate-700/50 border-slate-600 text-white rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-absence" className="text-gray-300" dir="auto">
                      {t.absences}
                    </Label>
                    <Input
                      id="edit-absence"
                      type="number"
                      value={selectedEmployee.absence || ""}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee, absence: e.target.value })}
                      className="bg-slate-700/50 border-slate-600 text-white rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-retard" className="text-gray-300" dir="auto">
                      {t.delays}
                    </Label>
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
                    <Label htmlFor="edit-avance" className="text-gray-300" dir="auto">
                      {t.advances}
                    </Label>
                    <Input
                      id="edit-avance"
                      type="number"
                      value={selectedEmployee.avance || ""}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee, avance: e.target.value })}
                      className="bg-slate-700/50 border-slate-600 text-white rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-tenu" className="text-gray-300" dir="auto">
                      {t.uniforms}
                    </Label>
                    <Input
                      id="edit-tenu"
                      type="number"
                      value={selectedEmployee.tenu_de_travail || ""}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee, tenu_de_travail: e.target.value })}
                      className="bg-slate-700/50 border-slate-600 text-white rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-status" className="text-gray-300" dir="auto">
                    {t.statusCol}
                  </Label>
                  <Select value={selectedEmployee.status} onValueChange={(value) => setSelectedEmployee({ ...selectedEmployee, status: value })}>
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600 text-white">
                      <SelectItem value="active">{t.active}</SelectItem>
                      <SelectItem value="inactive">{t.inactive}</SelectItem>
                      <SelectItem value="suspended">{t.suspended}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditEmployeeOpen(false)} className="border-slate-600 text-gray-300 hover:bg-slate-700">
                {t.cancel}
              </Button>
              <Button onClick={handleUpdateEmployee} className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600">
                {t.save}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Quick Actions */}
        <Card3D>
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-sm sm:text-base">
                {"⚡"}
              </div>
              <span dir="auto">{t.quickActionsTitle}</span>
            </CardTitle>
            <CardDescription className="text-gray-300 text-base sm:text-lg" dir="auto">
              {t.quickActionsDesc}
            </CardDescription>
          </CardHeader>

          <CardContent className="px-4 sm:px-8">
            {/* Mobile */}
            <div className="block sm:hidden space-y-3">
              {user?.role === "employee" && (
                <>
                  <QuickActionMobile
                    href="/dashboard/pointeuse"
                    icon={<Clock className="h-5 w-5" />}
                    title={t.clockIn}
                    subtitle={t.clockInSubtitle}
                    gradient="from-blue-500 to-cyan-500"
                  />
                  <QuickActionMobile
                    href="/dashboard/journal"
                    icon={<Calendar className="h-5 w-5" />}
                    title={t.schedule}
                    subtitle={t.scheduleSubtitle}
                    gradient="from-purple-500 to-pink-500"
                  />
                  <QuickActionMobile
                    href="/dashboard/leave-request"
                    icon={<FileText className="h-5 w-5" />}
                    title={t.leave}
                    subtitle={t.leaveSubtitle}
                    gradient="from-emerald-500 to-teal-500"
                  />
                  <QuickActionMobile
                    href="/dashboard/finance"
                    icon={<DollarSign className="h-5 w-5" />}
                    title={t.finance}
                    subtitle={t.financeSubtitle}
                    gradient="from-yellow-500 to-orange-500"
                  />
                </>
              )}

              {(user?.role === "manager" || user?.role === "admin") && (
                <>
                  <QuickActionMobile
                    href={user?.role === "admin" ? "/dashboard/admin/employees" : "/dashboard/manager/employees"}
                    icon={<Users className="h-5 w-5" />}
                    title={t.manageEmployees}
                    subtitle={lang === "ar" ? "إدارة الموظفين" : "Gérer les employés"}
                    gradient="from-blue-500 to-indigo-500"
                  />
                  <QuickActionMobile
                    href={user?.role === "admin" ? "/dashboard/admin/journal" : "/dashboard/manager/journal"}
                    icon={<Calendar className="h-5 w-5" />}
                    title={t.manageSchedules}
                    subtitle={lang === "ar" ? "إدارة الجداول" : "Gérer les plannings"}
                    gradient="from-purple-500 to-violet-500"
                  />
                  <QuickActionMobile
                    href={user?.role === "admin" ? "/dashboard/admin/approvals" : "/dashboard/manager/leave-requests"}
                    icon={<CheckCircle className="h-5 w-5" />}
                    title={t.approve}
                    subtitle={lang === "ar" ? "معالجة الطلبات" : "Traiter les demandes"}
                    gradient="from-green-500 to-emerald-500"
                  />
                  <QuickActionMobile
                    href={user?.role === "admin" ? "/dashboard/admin/finance" : "/dashboard/manager/finance"}
                    icon={<DollarSign className="h-5 w-5" />}
                    title={t.manageFinance}
                    subtitle={lang === "ar" ? "إدارة المالية" : "Gérer les finances"}
                    gradient="from-yellow-500 to-amber-500"
                  />
                </>
              )}
            </div>

            {/* Desktop/Tablet */}
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {user?.role === "employee" && (
                <>
                  <QuickActionCard3D
                    href="/dashboard/pointeuse"
                    icon={<Clock className="h-6 w-6 lg:h-8 lg:w-8" />}
                    title={t.clockIn}
                    gradient="from-blue-500 to-cyan-500"
                  />
                  <QuickActionCard3D
                    href="/dashboard/journal"
                    icon={<Calendar className="h-6 w-6 lg:h-8 lg:w-8" />}
                    title={t.schedule}
                    gradient="from-purple-500 to-pink-500"
                  />
                  <QuickActionCard3D
                    href="/dashboard/leave-request"
                    icon={<FileText className="h-6 w-6 lg:h-8 lg:w-8" />}
                    title={t.leave}
                    gradient="from-emerald-500 to-teal-500"
                  />
                  <QuickActionCard3D
                    href="/dashboard/finance"
                    icon={<DollarSign className="h-6 w-6 lg:h-8 lg:w-8" />}
                    title={t.finance}
                    gradient="from-yellow-500 to-orange-500"
                  />
                </>
              )}

              {(user?.role === "manager" || user?.role === "admin") && (
                <>
                  <QuickActionCard3D
                    href={user?.role === "admin" ? "/dashboard/admin/employees" : "/dashboard/manager/employees"}
                    icon={<Users className="h-6 w-6 lg:h-8 lg:w-8" />}
                    title={t.manageEmployees}
                    gradient="from-blue-500 to-indigo-500"
                  />
                  <QuickActionCard3D
                    href={user?.role === "admin" ? "/dashboard/admin/journal" : "/dashboard/manager/journal"}
                    icon={<Calendar className="h-6 w-6 lg:h-8 lg:w-8" />}
                    title={t.manageSchedules}
                    gradient="from-purple-500 to-violet-500"
                  />
                  <QuickActionCard3D
                    href={user?.role === "admin" ? "/dashboard/admin/approvals" : "/dashboard/manager/leave-requests"}
                    icon={<CheckCircle className="h-6 w-6 lg:h-8 lg:w-8" />}
                    title={t.approve}
                    gradient="from-green-500 to-emerald-500"
                  />
                  <QuickActionCard3D
                    href={user?.role === "admin" ? "/dashboard/admin/finance" : "/dashboard/manager/finance"}
                    icon={<DollarSign className="h-6 w-6 lg:h-8 lg:w-8" />}
                    title={t.manageFinance}
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
        select, select:focus {
          border-radius: 0.75rem !important;
        }
        select option {
          border-radius: 0.75rem !important;
        }
        select::-webkit-scrollbar { border-radius: 0.75rem; }
      `}</style>
    </div>
  )
}

// 3D Stats Card (keeps layout LTR; text uses dir="auto" for Arabic compatibility)
function StatsCard3D({ title, value, subtitle, icon, gradient, glowColor }: any) {
  return (
    <div className="group relative transform-gpu perspective-1000">
      <div
        className={`relative bg-gradient-to-br ${gradient} backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-white transform hover:rotateX-12 hover:rotateY-6 hover:scale-105 transition-all duration-500 cursor-pointer`}
        style={{
          transform: "perspective(1000px) rotateX(10deg) rotateY(-5deg)",
          boxShadow: `0 25px 50px -12px ${glowColor}, 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)`,
        }}
      >
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"
          style={{ background: `radial-gradient(circle at 50% 50%, ${glowColor}, transparent 70%)`, filter: "blur(20px)" }}
        />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="text-white/80 font-medium text-sm tracking-wide uppercase" dir="auto">{title}</div>
            <div className="text-white/60 group-hover:text-white/80 transition-colors duration-300">{icon}</div>
          </div>
          <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            {value}
          </div>
          <div className="text-white/70 text-sm" dir="auto">{subtitle}</div>
        </div>
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        </div>
      </div>
    </div>
  )
}

// 3D Card Wrapper
function Card3D({ children, className = "" }: any) {
  return (
    <div className="group relative transform-gpu perspective-1000">
      <div
        className={`relative bg-slate-800/40 backdrop-blur-xl border border-slate-600/50 rounded-3xl text-white transform hover:rotateX-2 hover:rotateY-1 transition-all duration-500 ${className}`}
        style={{
          transform: "perspective(1000px) rotateX(2deg)",
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        }}
      >
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-400/20 via-cyan-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
        <div className="relative z-10 p-8">{children}</div>
      </div>
    </div>
  )
}

// Location Card
function LocationCard3D({ location, isLoading = false, t }: any) {
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
          transform: "perspective(1000px) rotateX(5deg) rotateY(-2deg)",
          boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)",
        }}
      >
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative z-10">
          <div className="mb-4">
            <h3 className="text-xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent" dir="auto">
              {location.name}
            </h3>
            <p className="text-gray-400 flex items-center gap-2 mt-2" dir="auto">
              <MapPin className="h-4 w-4" />
              {location.address}
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300" dir="auto">{t.employeesLabel}</span>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                {location.employees?.length || 0}
              </Badge>
            </div>
            {location.manager && (
              <div className="flex justify-between items-center">
                <span className="text-gray-300" dir="auto">{t.managerLabel}</span>
                <span className="font-medium text-white" dir="auto">
                  {location.manager.profile?.first_name} {location.manager.profile?.last_name}
                </span>
              </div>
            )}
            <div className="mt-6">
              <Button
                asChild
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold rounded-xl transition-all duration-300"
                style={{ boxShadow: "0 10px 25px -5px rgba(239, 68, 68, 0.3)" }}
              >
                <Link href={`/dashboard/admin/location/${location.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  <span dir="auto">{t.viewEmployees}</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Mobile-Optimized Quick Action Component (keeps LTR layout)
function QuickActionMobile({ href, icon, title, subtitle, gradient }: any) {
  return (
    <Link href={href} className="block">
      <div className={`relative bg-gradient-to-r ${gradient} backdrop-blur-sm border border-white/20 rounded-xl p-4 text-white hover:scale-[1.02] active:scale-95 transition-all duration-200 shadow-lg`}>
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/5 to-transparent opacity-0 active:opacity-100 transition-opacity duration-200"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex-shrink-0 p-2 bg-white/10 rounded-lg backdrop-blur-sm">{icon}</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white text-base leading-tight" dir="auto">{title}</h3>
            <p className="text-white/80 text-sm mt-1 leading-tight" dir="auto">{subtitle}</p>
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

// Desktop Quick Action
function QuickActionCard3D({ href, icon, title, gradient }: any) {
  return (
    <div className="group relative transform-gpu perspective-1000">
      <Link href={href}>
        <div
          className={`relative bg-gradient-to-br ${gradient} backdrop-blur-xl border border-white/20 rounded-2xl p-4 sm:p-6 text-white transform hover:rotateX-12 hover:rotateY-6 hover:scale-110 transition-all duration-500 cursor-pointer`}
          style={{
            transform: "perspective(1000px) rotateX(8deg) rotateY(-4deg)",
            boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)",
          }}
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10 flex flex-col items-center space-y-2 sm:space-y-3">
            <div className="text-white/90 group-hover:text-white transition-colors duration-300 transform group-hover:scale-110">
              {icon}
            </div>
            <span className="text-xs sm:text-sm font-semibold text-center text-white/90 group-hover:text-white transition-colors duration-300 leading-tight" dir="auto">
              {title}
            </span>
          </div>
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </div>
        </div>
      </Link>
    </div>
  )
}
