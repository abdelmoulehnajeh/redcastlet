"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useQuery, useMutation } from "@apollo/client"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Phone, Calendar, MapPin, Briefcase, Edit2, Check, X } from "lucide-react"
import { GET_EMPLOYEE_DETAILS, UPDATE_EMPLOYEE_PROFILE } from "@/lib/graphql-queries"
import { toast } from "sonner"

type Lang = "fr" | "ar"

type Dict = {
  profileTitle: string
  profileSubtitle: string
  personalInfo: string
  contactInfo: string
  workInfo: string
  basicInfo: string
  firstName: string
  lastName: string
  email: string
  phone: string
  jobTitle: string
  department: string
  hireDate: string
  employeeId: string
  role: string
  status: string
  location: string
  edit: string
  save: string
  cancel: string
  updateSuccess: string
  updateError: string
  loading: string
  noData: string
  roleAdmin: string
  roleManager: string
  roleEmployee: string
  active: string
  inactive: string
  suspended: string
  notDefined: string
  notAssigned: string
}

const translations: Record<Lang, Dict> = {
  fr: {
    profileTitle: "Mon Profil",
    profileSubtitle: "Gérez vos informations personnelles",
    personalInfo: "Informations Personnelles",
    contactInfo: "Informations de Contact",
    workInfo: "Informations Professionnelles",
    basicInfo: "Informations de Base",
    firstName: "Prénom",
    lastName: "Nom",
    email: "Email",
    phone: "Téléphone",
    jobTitle: "Poste",
    department: "Département",
    hireDate: "Date d'embauche",
    employeeId: "ID Employé",
    role: "Rôle",
    status: "Statut",
    location: "Restaurant",
    edit: "Modifier",
    save: "Enregistrer",
    cancel: "Annuler",
    updateSuccess: "Profil mis à jour avec succès",
    updateError: "Erreur lors de la mise à jour du profil",
    loading: "Chargement...",
    noData: "Aucune donnée disponible",
    roleAdmin: "🔥 Administrateur",
    roleManager: "⚡ Manager",
    roleEmployee: "✨ Employé",
    active: "Actif",
    inactive: "Inactif",
    suspended: "Suspendu",
    notDefined: "Non défini",
    notAssigned: "Non assigné",
  },
  ar: {
    profileTitle: "ملفي الشخصي",
    profileSubtitle: "إدارة معلوماتك الشخصية",
    personalInfo: "المعلومات الشخصية",
    contactInfo: "معلومات الاتصال",
    workInfo: "المعلومات المهنية",
    basicInfo: "المعلومات الأساسية",
    firstName: "الاسم الأول",
    lastName: "اسم العائلة",
    email: "البريد الإلكتروني",
    phone: "الهاتف",
    jobTitle: "المنصب",
    department: "القسم",
    hireDate: "تاريخ التوظيف",
    employeeId: "معرف الموظف",
    role: "الدور",
    status: "الحالة",
    location: "المطعم",
    edit: "تعديل",
    save: "حفظ",
    cancel: "إلغاء",
    updateSuccess: "تم تحديث الملف الشخصي بنجاح",
    updateError: "خطأ في تحديث الملف الشخصي",
    loading: "جاري التحميل...",
    noData: "لا توجد بيانات متاحة",
    roleAdmin: "🔥 مدير النظام",
    roleManager: "⚡ مدير",
    roleEmployee: "✨ موظف",
    active: "نشط",
    inactive: "غير نشط",
    suspended: "موقوف",
    notDefined: "غير محدد",
    notAssigned: "غير معيّن",
  },
}

export default function ProfilePage() {
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

  // Keep layout LTR but set lang for a11y
  useEffect(() => {
    if (typeof document === "undefined") return
    document.documentElement.setAttribute("lang", lang)
    document.documentElement.setAttribute("dir", "ltr")
  }, [lang])

  const t = translations[lang]

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
  })

  // Get employee details - Use cache-first to reduce API calls
  const { data, loading, refetch } = useQuery(GET_EMPLOYEE_DETAILS, {
    variables: { id: user?.employee_id },
    skip: !user?.employee_id,
    fetchPolicy: "cache-first",
    nextFetchPolicy: "cache-first",
    notifyOnNetworkStatusChange: false,
  })

  const employee = data?.employee

  // Initialize form data when employee data loads
  useEffect(() => {
    if (employee) {
      setFormData({
        nom: employee.nom || "",
        prenom: employee.prenom || "",
        email: employee.email || "",
        telephone: employee.telephone || "",
      })
    }
  }, [employee])

  const [updateProfile] = useMutation(UPDATE_EMPLOYEE_PROFILE, {
    onCompleted: () => {
      toast.success(t.updateSuccess)
      setIsEditing(false)
      // Update cache instead of refetching
      refetch()
    },
    onError: (error) => {
      toast.error(t.updateError)
      console.error("Profile update error:", error)
    },
  })

  const handleSave = () => {
    if (!user?.employee_id) return

    updateProfile({
      variables: {
        id: user.employee_id,
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        telephone: formData.telephone,
      },
    })
  }

  const handleCancel = () => {
    if (employee) {
      setFormData({
        nom: employee.nom || "",
        prenom: employee.prenom || "",
        email: employee.email || "",
        telephone: employee.telephone || "",
      })
    }
    setIsEditing(false)
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return t.roleAdmin
      case "manager":
        return t.roleManager
      case "employee":
        return t.roleEmployee
      default:
        return role
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return t.active
      case "inactive":
        return t.inactive
      case "suspended":
        return t.suspended
      default:
        return status || t.notDefined
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "inactive":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
      case "suspended":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return t.notDefined
    try {
      return new Date(dateString).toLocaleDateString(lang === "ar" ? "ar-TN" : "fr-TN")
    } catch {
      return t.notDefined
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(120,219,255,0.1),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,119,198,0.1),transparent_50%)]"></div>
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full animate-pulse"
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
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Header Skeleton */}
            <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl border border-slate-600/50 rounded-3xl p-8 animate-pulse">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-24 h-24 bg-gradient-to-r from-slate-700 to-slate-600 rounded-full"></div>
                <div className="flex-1 space-y-4">
                  <div className="h-8 bg-gradient-to-r from-slate-700 to-slate-600 rounded w-64"></div>
                  <div className="h-4 bg-gradient-to-r from-slate-700 to-slate-600 rounded w-32"></div>
                </div>
              </div>
            </div>

            {/* Content Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl border border-slate-600/50 rounded-3xl p-8 animate-pulse"
                >
                  <div className="space-y-6">
                    <div className="h-6 bg-gradient-to-r from-slate-700 to-slate-600 rounded w-1/2"></div>
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="space-y-2">
                        <div className="h-4 bg-gradient-to-r from-slate-700 to-slate-600 rounded w-1/3"></div>
                        <div className="h-10 bg-gradient-to-r from-slate-700 to-slate-600 rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 mx-auto mb-6 text-gray-400 opacity-50" />
          <p className="text-xl text-gray-400" dir="auto">
            {t.noData}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden"
      dir="ltr"
    >
      {/* Background effects */}
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

      <div className="relative z-10 p-4 md:p-6 space-y-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header Card */}
          <Card3D>
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <Avatar className="w-20 h-20 md:w-24 md:h-24 border-4 border-white/30 shadow-2xl">
                  <AvatarFallback className="bg-gradient-to-br from-red-500 to-orange-500 text-white text-2xl md:text-3xl font-bold shadow-inner">
                    {employee.prenom?.charAt(0)?.toUpperCase() || "U"}
                    {employee.nom?.charAt(0)?.toUpperCase() || ""}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 text-center md:text-left">
                  <CardTitle
                    className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent mb-2"
                    dir="auto"
                  >
                    {t.profileTitle}
                  </CardTitle>
                  <p className="text-gray-300 text-base md:text-lg mb-4" dir="auto">
                    {t.profileSubtitle}
                  </p>

                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    <Badge
                      className="bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-300 border border-red-400/30 backdrop-blur-sm px-3 py-1"
                      dir="auto"
                    >
                      {getRoleLabel(user?.role || "")}
                    </Badge>
                    <Badge className={`px-3 py-1 ${getStatusColor(employee.status)}`} dir="auto">
                      {getStatusLabel(employee.status)}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-2">
                  {!isEditing ? (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold px-4 py-2 rounded-xl transition-all duration-300 shadow-lg"
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      <span dir="auto">{t.edit}</span>
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={handleSave}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold px-4 py-2 rounded-xl transition-all duration-300 shadow-lg"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        <span dir="auto">{t.save}</span>
                      </Button>
                      <Button
                        onClick={handleCancel}
                        variant="outline"
                        className="border-slate-600 text-gray-300 hover:bg-slate-700 hover:border-slate-500 px-4 py-2 rounded-xl transition-all duration-300 bg-transparent"
                      >
                        <X className="h-4 w-4 mr-2" />
                        <span dir="auto">{t.cancel}</span>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card3D>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personal Information */}
            <Card3D>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  <User className="h-6 w-6 text-blue-400" />
                  <span dir="auto">{t.personalInfo}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="prenom" className="text-gray-300 text-sm font-medium mb-2 block" dir="auto">
                      {t.firstName}
                    </Label>
                    {isEditing ? (
                      <Input
                        id="prenom"
                        value={formData.prenom}
                        onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                        className="bg-slate-700/50 border-slate-600 text-white rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                        placeholder={lang === "ar" ? "محمد" : "Jean"}
                      />
                    ) : (
                      <div
                        className="bg-slate-800/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white"
                        dir="auto"
                      >
                        {employee.prenom || t.notDefined}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="nom" className="text-gray-300 text-sm font-medium mb-2 block" dir="auto">
                      {t.lastName}
                    </Label>
                    {isEditing ? (
                      <Input
                        id="nom"
                        value={formData.nom}
                        onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                        className="bg-slate-700/50 border-slate-600 text-white rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                        placeholder={lang === "ar" ? "الهاشمي" : "Dupont"}
                      />
                    ) : (
                      <div
                        className="bg-slate-800/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white"
                        dir="auto"
                      >
                        {employee.nom || t.notDefined}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="employee-id" className="text-gray-300 text-sm font-medium mb-2 block" dir="auto">
                    {t.employeeId}
                  </Label>
                  <div className="bg-slate-800/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                    <span>#{employee.id}</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="hire-date" className="text-gray-300 text-sm font-medium mb-2 block" dir="auto">
                    {t.hireDate}
                  </Label>
                  <div className="bg-slate-800/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{formatDate(employee.created_at)}</span>
                  </div>
                </div>
              </CardContent>
            </Card3D>

            {/* Contact Information */}
            <Card3D>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  <Mail className="h-6 w-6 text-emerald-400" />
                  <span dir="auto">{t.contactInfo}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="email" className="text-gray-300 text-sm font-medium mb-2 block" dir="auto">
                    {t.email}
                  </Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-slate-700/50 border-slate-600 text-white rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                      placeholder={lang === "ar" ? "mohamed.ali@example.com" : "jean.dupont@example.com"}
                    />
                  ) : (
                    <div className="bg-slate-800/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span dir="auto">{employee.email || t.notDefined}</span>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="telephone" className="text-gray-300 text-sm font-medium mb-2 block" dir="auto">
                    {t.phone}
                  </Label>
                  {isEditing ? (
                    <Input
                      id="telephone"
                      value={formData.telephone}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                      className="bg-slate-700/50 border-slate-600 text-white rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                      placeholder="0123456789"
                    />
                  ) : (
                    <div className="bg-slate-800/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{employee.telephone || t.notDefined}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card3D>

            {/* Work Information - Full Width */}
            <div className="lg:col-span-2">
              <Card3D>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    <Briefcase className="h-6 w-6 text-purple-400" />
                    <span dir="auto">{t.workInfo}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <Label className="text-gray-300 text-sm font-medium mb-2 block" dir="auto">
                        {t.jobTitle}
                      </Label>
                      <div className="bg-slate-800/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-gray-400" />
                        <span dir="auto">{employee.job_title || t.notDefined}</span>
                      </div>
                    </div>

                    <div>
                      <Label className="text-gray-300 text-sm font-medium mb-2 block" dir="auto">
                        {t.location}
                      </Label>
                      <div className="bg-slate-800/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span dir="auto">{employee.location?.name || t.notAssigned}</span>
                      </div>
                    </div>

                    <div>
                      <Label className="text-gray-300 text-sm font-medium mb-2 block" dir="auto">
                        {t.role}
                      </Label>
                      <div className="bg-slate-800/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white">
                        <Badge
                          className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-400/30 backdrop-blur-sm"
                          dir="auto"
                        >
                          {getRoleLabel(user?.role || "")}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card3D>
            </div>
          </div>
        </div>
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

// 3D Card Wrapper Component
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
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  )
}
