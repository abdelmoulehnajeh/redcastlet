"use client"

import { useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  User,
  Edit,
  Save,
  X,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Clock,
  FileText,
  Award,
  Plus,
} from "lucide-react"
import { useQuery, useMutation } from "@apollo/client"
import {
  GET_EMPLOYEE_DETAILS,
  GET_EMPLOYEE_DISCIPLINARY_DATA,
  UPDATE_EMPLOYEE,
  UPDATE_EMPLOYEE_PROFILE,
  UPDATE_USER_PASSWORD,
  UPDATE_USER_INFO,
  CREATE_INFRACTION,
  CREATE_ABSENCE,
  CREATE_RETARD,
  CREATE_TENUE_TRAVAIL,
} from "@/lib/graphql-queries"
import { toast } from "sonner"
import { useLang } from "@/lib/i18n"
import { fr, ar as arLocale } from "date-fns/locale"
import { format } from "date-fns"

export default function EmployeeDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const employeeId = params.id as string

  // i18n (hook order always at the top)
  const { lang, t, locale, formatNumber, formatCurrency } = useLang("fr")

  // Local edit state hooks
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<any>({})
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false)

  const [disciplinaryForms, setDisciplinaryForms] = useState({
    infraction: { name: "", price: "", description: "" },
    absence: { name: "", price: "", description: "" },
    retard: { name: "", price: "", description: "" },
    tenue: { name: "", price: "", description: "" },
  })

  // Single GraphQL query to get all employee data
  const { data, loading, refetch } = useQuery(GET_EMPLOYEE_DETAILS, {
    variables: { id: employeeId },
    fetchPolicy: "cache-first",
    nextFetchPolicy: "cache-first",
    notifyOnNetworkStatusChange: false,
    errorPolicy: "all",
  })

  const {
    data: disciplinaryData,
    loading: disciplinaryLoading,
    refetch: refetchDisciplinary,
  } = useQuery(GET_EMPLOYEE_DISCIPLINARY_DATA, {
    variables: { employee_id: employeeId },
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
  })

  const [updateEmployee] = useMutation(UPDATE_EMPLOYEE, {
    // Update cache after mutation
    update(cache, { data: mutationData }) {
      if (mutationData?.updateEmployee) {
        cache.modify({
          id: cache.identify({ __typename: "Employee", id: employeeId }),
          fields: {
            salaire: () => mutationData.updateEmployee.salaire,
            prime: () => mutationData.updateEmployee.prime,
            avance: () => mutationData.updateEmployee.avance,
            infractions: () => mutationData.updateEmployee.infractions,
            absence: () => mutationData.updateEmployee.absence,
            retard: () => mutationData.updateEmployee.retard,
            tenu_de_travail: () => mutationData.updateEmployee.tenu_de_travail,
            status: () => mutationData.updateEmployee.status,
            price_h: () => mutationData.updateEmployee.price_h,
            location_id: () => mutationData.updateEmployee.location_id,
          },
        })
      }
    },
  })

  const [updateEmployeeProfile] = useMutation(UPDATE_EMPLOYEE_PROFILE, {
    update(cache, { data: mutationData }) {
      if (mutationData?.updateEmployeeProfile) {
        cache.modify({
          id: cache.identify({ __typename: "Employee", id: employeeId }),
          fields: {
            nom: () => mutationData.updateEmployeeProfile.nom,
            prenom: () => mutationData.updateEmployeeProfile.prenom,
            email: () => mutationData.updateEmployeeProfile.email,
            telephone: () => mutationData.updateEmployeeProfile.telephone,
            location_id: () => mutationData.updateEmployeeProfile.location_id,
            job_title: () => mutationData.updateEmployeeProfile.job_title,
          },
        })
      }
    },
  })

  const [updateUserInfo] = useMutation(UPDATE_USER_INFO, {
    update(cache, { data: mutationData }) {
      if (mutationData?.updateUserInfo) {
        // Update cache with new user info
        cache.modify({
          id: cache.identify({ __typename: "Employee", id: employeeId }),
          fields: {
            user: () => mutationData.updateUserInfo,
            created_at: () => mutationData.updateUserInfo.employee?.created_at,
          },
        })
      }
    },
  })

  const [updateUserPassword] = useMutation(UPDATE_USER_PASSWORD)

  const [createInfraction] = useMutation(CREATE_INFRACTION, {
    onCompleted: () => {
      refetchDisciplinary()
      setDisciplinaryForms((prev) => ({ ...prev, infraction: { name: "", price: "", description: "" } }))
      toast.success("Infraction ajoutée avec succès")
    },
    onError: (error) => {
      toast.error("Erreur lors de l'ajout de l'infraction")
      console.error("Error creating infraction:", error)
    },
  })

  const [createAbsence] = useMutation(CREATE_ABSENCE, {
    onCompleted: () => {
      refetchDisciplinary()
      setDisciplinaryForms((prev) => ({ ...prev, absence: { name: "", price: "", description: "" } }))
      toast.success("Absence ajoutée avec succès")
    },
    onError: (error) => {
      toast.error("Erreur lors de l'ajout de l'absence")
      console.error("Error creating absence:", error)
    },
  })

  const [createRetard] = useMutation(CREATE_RETARD, {
    onCompleted: () => {
      refetchDisciplinary()
      setDisciplinaryForms((prev) => ({ ...prev, retard: { name: "", price: "", description: "" } }))
      toast.success("Retard ajouté avec succès")
    },
    onError: (error) => {
      toast.error("Erreur lors de l'ajout du retard")
      console.error("Error creating retard:", error)
    },
  })

  const [createTenueTravail] = useMutation(CREATE_TENUE_TRAVAIL, {
    onCompleted: () => {
      refetchDisciplinary()
      setDisciplinaryForms((prev) => ({ ...prev, tenue: { name: "", price: "", description: "" } }))
      toast.success("Tenue de travail ajoutée avec succès")
    },
    onError: (error) => {
      toast.error("Erreur lors de l'ajout de la tenue de travail")
      console.error("Error creating tenue travail:", error)
    },
  })

  const employee = data?.employee
  const schedules = data?.workSchedules || []
  const contracts = data?.contracts || []

  const infractions = disciplinaryData?.infractions || []
  const absences = disciplinaryData?.absences || []
  const retards = disciplinaryData?.retards || []
  const tenuesTravail = disciplinaryData?.tenuesTravail || []

  const locationOptions = [
    { id: "1", name: "Red Castle lauina" },
    { id: "2", name: "Red Castle Manzah" },
    { id: "3", name: "Red Castle Cuisine Centrale" },
  ]

  const handleDisciplinaryFormChange = (type: string, field: string, value: string) => {
    setDisciplinaryForms((prev) => ({
      ...prev,
      [type]: { ...prev[type], [field]: value },
    }))
  }

  const handleAddDisciplinaryItem = async (type: string) => {
    const form = disciplinaryForms[type]

    if (!form.name.trim() || !form.price) {
      toast.error("Veuillez remplir le nom et le prix")
      return
    }

    const variables = {
      employee_id: employeeId,
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: Number.parseFloat(form.price) || 0,
    }

    try {
      switch (type) {
        case "infraction":
          await createInfraction({ variables })
          break
        case "absence":
          await createAbsence({ variables })
          break
        case "retard":
          await createRetard({ variables })
          break
        case "tenue":
          await createTenueTravail({ variables })
          break
      }
    } catch (error) {
      console.error(`Error adding ${type}:`, error)
    }
  }

  const formatDisciplinaryDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return format(date, "dd/MM/yyyy", { locale: fr })
    } catch (error) {
      return dateString
    }
  }

  const handleEdit = () => {
    const formatHireDate = (dateValue: string | number) => {
      if (!dateValue) return ""

      // If it's a timestamp (number as string), convert to date
      if (/^\d+$/.test(String(dateValue))) {
        const date = new Date(Number(dateValue))
        return date.toISOString().split("T")[0]
      }

      // If it's already an ISO string, extract date part
      if (typeof dateValue === "string" && dateValue.includes("T")) {
        return dateValue.split("T")[0]
      }

      // Try to parse as date and format
      try {
        const date = new Date(dateValue)
        if (!isNaN(date.getTime())) {
          return date.toISOString().split("T")[0]
        }
      } catch (error) {
        console.error("Error parsing date:", error)
      }

      return ""
    }

    setEditData({
      prenom: employee?.prenom || "",
      nom: employee?.nom || "",
      email: employee?.email || "",
      telephone: employee?.telephone || "",
      job_title: employee?.job_title || "",
      location_id: employee?.location?.id || "",
      status: employee?.status || "active",
      username: employee?.user?.username || "",
      password: "",
      hire_date: formatHireDate(employee?.created_at),
      salaire: employee?.salaire || 0,
      prime: employee?.prime || 0,
      infractions: employee?.infractions || 0,
      absence: employee?.absence || 0,
      retard: employee?.retard || 0,
      avance: employee?.avance || 0,
      tenu_de_travail: employee?.tenu_de_travail || 0,
    })
    setIsEditing(true)
  }

  const handleSave = async () => {
    try {
      const personalData = {
        prenom: editData.prenom?.trim() || "",
        nom: editData.nom?.trim() || "",
        email: editData.email?.trim() || "",
        telephone: editData.telephone?.trim() || "",
        location_id: editData.location_id ? Number.parseInt(editData.location_id, 10) : null,
        job_title: editData.job_title?.trim() || "",
      }

      const financialData = Object.fromEntries(
        Object.entries({
          salaire: editData.salaire,
          prime: editData.prime,
          infractions: editData.infractions,
          absence: editData.absence,
          retard: editData.retard,
          avance: editData.avance,
          tenu_de_travail: editData.tenu_de_travail,
          status: editData.status,
        }).map(([k, v]) => [k, k === "status" ? v : Number.isFinite(Number(v)) ? Math.max(0, Number(v)) : 0]),
      )

      const userInfoData: any = {}
      if (editData.username && editData.username !== employee?.user?.username) {
        userInfoData.username = editData.username.trim()
      }
      if (editData.hire_date && editData.hire_date !== employee?.created_at?.split("T")[0]) {
        userInfoData.hire_date = editData.hire_date
      }

      await updateEmployeeProfile({
        variables: { id: employeeId, ...personalData },
      })

      await updateEmployee({
        variables: { id: employeeId, ...financialData },
      })

      // Update user info if there are changes
      if (Object.keys(userInfoData).length > 0) {
        await updateUserInfo({
          variables: { employee_id: employeeId, ...userInfoData },
        })
      }

      // Update password if provided
      if (editData.password && editData.password.trim()) {
        await updateUserPassword({
          variables: {
            employee_id: employeeId,
            currentPassword: "password123", // Default password - in real app, ask for current password
            newPassword: editData.password.trim(),
          },
        })
      }

      toast.success(t("toast_update_success"))
      setIsEditing(false)
    } catch (error) {
      toast.error(t("toast_update_error"))
      console.error("Error updating employee:", error)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditData({})
  }

  const formatDate = (dateString: string) => {
    try {
      let date: Date

      // If it's a timestamp (number as string), convert to date
      if (/^\d+$/.test(String(dateString))) {
        date = new Date(Number(dateString))
      } else {
        date = new Date(dateString)
      }

      if (isNaN(date.getTime())) {
        console.log("[v0] Invalid date value:", dateString)
        return t("invalid_date")
      }

      console.log("[v0] Formatting date:", dateString, "->", date)
      return format(date, "PPPP", { locale: lang === "ar" ? arLocale : fr })
    } catch (error) {
      console.log("[v0] Date formatting error:", error, "for value:", dateString)
      return t("invalid_date")
    }
  }

  const performanceScore = useMemo(() => {
    const infractions = employee?.infractions ?? 0
    const absence = employee?.absence ?? 0
    const retard = employee?.retard ?? 0
    return Math.max(0, 100 - (infractions * 5 + absence * 3 + retard * 2))
  }, [employee?.infractions, employee?.absence, employee?.retard])

  const totalHours = useMemo(() => {
    return schedules.reduce((sum: number, schedule: any) => {
      if (schedule.start_time && schedule.end_time) {
        const start = new Date(`2024-01-01 ${schedule.start_time}`)
        const end = new Date(`2024-01-01 ${schedule.end_time}`)
        const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
        return sum + diff
      }
      return sum
    }, 0)
  }, [schedules])

  const getLocationName = (locationId: string | number) => {
    console.log("[v0] Location ID received:", locationId, "Type:", typeof locationId)

    if (!locationId) {
      console.log("[v0] Location ID is null/undefined")
      return "Non assigné"
    }

    const location = locationOptions.find((loc) => loc.id === String(locationId))
    console.log("[v0] Found location:", location)

    return location ? location.name : "Non assigné"
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-purple-900/60 to-slate-900/80 backdrop-blur-[6px]" />
        </div>
        <div className="flex items-center justify-center min-h-[50vh] p-4 relative z-20">
          <div className="animate-spin rounded-full h-16 w-16 sm:h-20 sm:w-20 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  // Show error state
  if (!employee) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-purple-900/60 to-slate-900/80 backdrop-blur-[6px]" />
        </div>
        <div className="flex items-center justify-center min-h-[50vh] p-4 relative z-20">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-white mb-2">Employee not found</h2>
            <Button onClick={() => router.back()} variant="outline">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-purple-900/60 to-slate-900/80 backdrop-blur-[6px]" />
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
        <div className="glass-card backdrop-blur-futuristic p-4 sm:p-6 lg:p-8 text-white shadow-2xl animate-fade-in relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-700/30 to-blue-800/20 opacity-50"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] animate-[shimmer_3s_ease-in-out_infinite]"></div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 relative z-10">
            <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="text-white hover:bg-white/20 p-1 sm:p-2 flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1
                  className="text-lg sm:text-2xl lg:text-3xl font-bold mb-1 truncate bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent"
                  dir="auto"
                >
                  {employee?.prenom} {employee?.nom}
                </h1>
                <p className="text-white/90 text-xs sm:text-sm lg:text-base" dir="auto">
                  {employee?.job_title}
                </p>
              </div>
            </div>
            <div className="flex space-x-2 w-full sm:w-auto">
              {!isEditing ? (
                <Button
                  onClick={handleEdit}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 text-xs sm:text-sm flex-1 sm:flex-none"
                >
                  <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> {t("edit")}
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleSave}
                    className="bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm flex-1 sm:flex-none"
                  >
                    <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> {t("save")}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm flex-1 sm:flex-none"
                  >
                    <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> {t("cancel")}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Personal Info */}
        <Card className="glass-card backdrop-blur-futuristic border-0 shadow-2xl bg-gradient-to-br from-card to-card/80">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center text-base sm:text-lg">
              <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> <span dir="auto">{t("personal_info")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm font-medium text-muted-foreground" dir="auto">
                  {t("first_name", "Prénom")}
                </Label>
                {isEditing ? (
                  <Input
                    type="text"
                    value={editData.prenom || ""}
                    onChange={(e) => setEditData({ ...editData, prenom: e.target.value })}
                    className="text-sm h-8 sm:h-10"
                    placeholder={t("first_name", "Prénom")}
                  />
                ) : (
                  <div className="text-sm sm:text-base font-semibold text-foreground" dir="auto">
                    {employee.prenom}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-xs sm:text-sm font-medium text-muted-foreground" dir="auto">
                  {t("last_name", "Nom")}
                </Label>
                {isEditing ? (
                  <Input
                    type="text"
                    value={editData.nom || ""}
                    onChange={(e) => setEditData({ ...editData, nom: e.target.value })}
                    className="text-sm h-8 sm:h-10"
                    placeholder={t("last_name", "Nom")}
                  />
                ) : (
                  <div className="text-sm sm:text-base font-semibold text-foreground" dir="auto">
                    {employee.nom}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-xs sm:text-sm font-medium">Email</Label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={editData.email || ""}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    className="text-sm h-8 sm:h-10"
                    placeholder="Email"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm sm:text-base font-semibold text-foreground truncate">
                      {employee.email}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-xs sm:text-sm font-medium text-muted-foreground" dir="auto">
                  {t("Téléphone", "Téléphone")}
                </Label>
                {isEditing ? (
                  <Input
                    type="tel"
                    value={editData.telephone || ""}
                    onChange={(e) => setEditData({ ...editData, telephone: e.target.value })}
                    className="text-sm h-8 sm:h-10"
                    placeholder={t("Téléphone", "Téléphone")}
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm sm:text-base font-semibold text-foreground">{employee.telephone}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-xs sm:text-sm font-medium text-muted-foreground" dir="auto">
                  {t("job_title")}
                </Label>
                {isEditing ? (
                  <Input
                    type="text"
                    value={editData.job_title || ""}
                    onChange={(e) => setEditData({ ...editData, job_title: e.target.value })}
                    className="text-sm h-8 sm:h-10"
                    placeholder={t("job_title")}
                  />
                ) : (
                  <div className="text-sm sm:text-base font-semibold text-foreground" dir="auto">
                    {employee.job_title}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-xs sm:text-sm font-medium text-muted-foreground" dir="auto">
                  {t("status")}
                </Label>
                {isEditing ? (
                  <select
                    value={editData.status || "active"}
                    onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                    className="w-full text-sm h-8 sm:h-10 px-3 py-1 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  >
                    <option value="active">{t("active")}</option>
                    <option value="inactive">{t("inactive")}</option>
                  </select>
                ) : (
                  <Badge
                    variant={employee.status === "active" ? "default" : "secondary"}
                    className="text-xs sm:text-sm"
                    dir="auto"
                  >
                    {employee.status === "active" ? t("active") : t("inactive")}
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-xs sm:text-sm font-medium text-muted-foreground" dir="auto">
                  {t("hire_date")}
                </Label>
                {isEditing ? (
                  <Input
                    type="date"
                    value={editData.hire_date || ""}
                    onChange={(e) => setEditData({ ...editData, hire_date: e.target.value })}
                    className="text-sm h-8 sm:h-10"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm sm:text-base font-semibold text-foreground">
                      {(() => {
                        console.log("[v0] Employee created_at value:", employee.created_at)
                        return formatDate(employee.created_at)
                      })()}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-xs sm:text-sm font-medium text-muted-foreground" dir="auto">
                  {t("username", "Nom d'utilisateur")}
                </Label>
                {isEditing ? (
                  <Input
                    type="text"
                    value={editData.username || ""}
                    onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                    className="text-sm h-8 sm:h-10"
                    placeholder={t("username", "Nom d'utilisateur")}
                  />
                ) : (
                  <div className="text-sm sm:text-base font-semibold text-foreground">
                    {employee?.user?.username || "N/A"}
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm font-medium text-muted-foreground">
                    {t("new_password", "Nouveau mot de passe")}
                  </Label>
                  <Input
                    type="password"
                    value={editData.password || ""}
                    onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                    className="text-sm h-8 sm:h-10"
                    placeholder={t("leave_empty_to_keep", "Laisser vide pour conserver")}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-xs sm:text-sm font-medium text-muted-foreground" dir="auto">
                  Location
                </Label>
                {isEditing ? (
                  <div className="relative">
                    <select
                      value={editData.location_id || ""}
                      onChange={(e) => setEditData({ ...editData, location_id: e.target.value })}
                      className="w-full text-sm h-8 sm:h-10 px-3 py-1 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent appearance-none cursor-pointer hover:border-ring/50 transition-colors"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: "right 0.5rem center",
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "1.5em 1.5em",
                        paddingRight: "2.5rem",
                      }}
                    >
                      <option value="" disabled className="text-muted-foreground">
                        Sélectionner une location
                      </option>
                      {locationOptions.map((location) => (
                        <option key={location.id} value={location.id} className="text-foreground">
                          {location.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                    <span className="text-sm sm:text-base font-semibold text-foreground" dir="auto">
                      {(() => {
                        console.log("[v0] Employee location object:", employee.location)
                        console.log("[v0] Employee location ID:", employee.location?.id)
                        return employee.location?.name || getLocationName(employee.location?.id) || "Non assigné"
                      })()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Info */}
        <Card className="glass-card backdrop-blur-futuristic border-0 shadow-2xl bg-gradient-to-br from-card to-card/80">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center text-base sm:text-lg">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> <span dir="auto">{t("financial_info")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                { key: "salaire", label: t("salary"), icon: DollarSign, color: "text-primary" },
                { key: "prime", label: t("bonus"), icon: Award, color: "text-green-600" },
                { key: "avance", label: t("advance"), icon: DollarSign, color: "text-red-600" },
              ].map((item) => (
                <div key={item.key} className="space-y-2">
                  <Label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center" dir="auto">
                    <item.icon className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 ${item.color}`} />
                    {item.label}
                  </Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editData[item.key] ?? 0}
                      onChange={(e) => setEditData({ ...editData, [item.key]: Number.parseInt(e.target.value) || 0 })}
                      className="text-sm h-8 sm:h-10"
                    />
                  ) : (
                    <div className="text-lg sm:text-xl font-bold text-foreground">
                      {formatCurrency(employee[item.key] || 0)}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-accent/30 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-medium text-muted-foreground" dir="auto">
                  {t("net_salary_est")}
                </span>
                <span className="text-lg sm:text-xl font-bold text-foreground">
                  {formatCurrency((employee.salaire || 0) + (employee.prime || 0) - (employee.avance || 0))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance & Disciplinary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card className="glass-card backdrop-blur-futuristic border-0 shadow-2xl bg-gradient-to-br from-card to-card/80">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center text-base sm:text-lg">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> <span dir="auto">{t("performance_title")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-6">
              <div className="text-center">
                <div className="text-2xl sm:text-4xl font-bold text-foreground mb-2">
                  {formatNumber(performanceScore)}%
                </div>
                <Badge
                  variant={performanceScore >= 80 ? "default" : performanceScore >= 60 ? "secondary" : "destructive"}
                  className="text-xs sm:text-sm"
                  dir="auto"
                >
                  {performanceScore >= 80
                    ? t("excellent")
                    : performanceScore >= 60
                      ? t("good")
                      : t("needs_improvement")}
                </Badge>
              </div>

              <div>
                <div className="flex justify-between text-xs sm:text-sm mb-1">
                  <span dir="auto">{t("overall_performance")}</span>
                  <span>{formatNumber(performanceScore)}%</span>
                </div>
                <Progress value={performanceScore} className="h-2" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="text-center">
                  <div className="text-lg sm:text-xl font-bold text-foreground">
                    {formatNumber(Number(totalHours.toFixed(0)))}h
                  </div>
                  <div className="text-xs text-muted-foreground" dir="auto">
                    {t("worked_hours")}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl font-bold text-foreground">{formatNumber(schedules.length)}</div>
                  <div className="text-xs text-muted-foreground" dir="auto">
                    {t("sessions")}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card backdrop-blur-futuristic border-0 shadow-2xl bg-gradient-to-br from-card to-card/80">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center text-base sm:text-lg">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />{" "}
                <span dir="auto">{t("disciplinary_data")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="text-center py-4 text-muted-foreground">
                <p className="text-sm">Système disciplinaire détaillé disponible ci-dessous</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comprehensive Disciplinary Management System */}
        <Card className="glass-card backdrop-blur-futuristic border-0 shadow-2xl bg-gradient-to-br from-card to-card/80">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center text-base sm:text-lg">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span dir="auto">Données Disciplinaires</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Infractions Box */}
              <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-red-400 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Infractions
                  </h3>
                  <Button
                    size="sm"
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/30"
                    onClick={() => handleAddDisciplinaryItem("infraction")}
                    disabled={!disciplinaryForms.infraction.name.trim() || !disciplinaryForms.infraction.price}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Ajouter
                  </Button>
                </div>

                <div className="space-y-3">
                  {/* Add Infraction Form */}
                  <div className="bg-background/50 rounded-md p-3 space-y-2">
                    <Input
                      placeholder="Nom de l'infraction"
                      className="h-8 text-sm bg-background/80"
                      value={disciplinaryForms.infraction.name}
                      onChange={(e) => handleDisciplinaryFormChange("infraction", "name", e.target.value)}
                    />
                    <Input
                      placeholder="Prix (DT)"
                      type="number"
                      className="h-8 text-sm bg-background/80"
                      value={disciplinaryForms.infraction.price}
                      onChange={(e) => handleDisciplinaryFormChange("infraction", "price", e.target.value)}
                    />
                    <Input
                      placeholder="Description"
                      className="h-8 text-sm bg-background/80"
                      value={disciplinaryForms.infraction.description}
                      onChange={(e) => handleDisciplinaryFormChange("infraction", "description", e.target.value)}
                    />
                  </div>

                  {/* Existing Infractions List */}
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {infractions.length > 0 ? (
                      infractions.map((item: any) => (
                        <div key={item.id} className="bg-background/30 rounded-md p-2 text-sm">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-medium text-red-400">{item.name}</div>
                              {item.description && (
                                <div className="text-xs text-muted-foreground mt-1">{item.description}</div>
                              )}
                              <div className="text-xs text-muted-foreground mt-1">
                                {formatDisciplinaryDate(item.created_date)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-red-400">{formatCurrency(item.price)}</div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-muted-foreground text-center py-2">
                        Aucune infraction enregistrée
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Absences Box */}
              <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-orange-400 flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Absences
                  </h3>
                  <Button
                    size="sm"
                    className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border-orange-500/30"
                    onClick={() => handleAddDisciplinaryItem("absence")}
                    disabled={!disciplinaryForms.absence.name.trim() || !disciplinaryForms.absence.price}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Ajouter
                  </Button>
                </div>

                <div className="space-y-3">
                  {/* Add Absence Form */}
                  <div className="bg-background/50 rounded-md p-3 space-y-2">
                    <Input
                      placeholder="Nom de l'absence"
                      className="h-8 text-sm bg-background/80"
                      value={disciplinaryForms.absence.name}
                      onChange={(e) => handleDisciplinaryFormChange("absence", "name", e.target.value)}
                    />
                    <Input
                      placeholder="Prix (DT)"
                      type="number"
                      className="h-8 text-sm bg-background/80"
                      value={disciplinaryForms.absence.price}
                      onChange={(e) => handleDisciplinaryFormChange("absence", "price", e.target.value)}
                    />
                    <Input
                      placeholder="Description"
                      className="h-8 text-sm bg-background/80"
                      value={disciplinaryForms.absence.description}
                      onChange={(e) => handleDisciplinaryFormChange("absence", "description", e.target.value)}
                    />
                  </div>

                  {/* Existing Absences List */}
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {absences.length > 0 ? (
                      absences.map((item: any) => (
                        <div key={item.id} className="bg-background/30 rounded-md p-2 text-sm">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-medium text-orange-400">{item.name}</div>
                              {item.description && (
                                <div className="text-xs text-muted-foreground mt-1">{item.description}</div>
                              )}
                              <div className="text-xs text-muted-foreground mt-1">
                                {formatDisciplinaryDate(item.created_date)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-orange-400">{formatCurrency(item.price)}</div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-muted-foreground text-center py-2">Aucune absence enregistrée</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Retards Box */}
              <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-yellow-400 flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Retards
                  </h3>
                  <Button
                    size="sm"
                    className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border-yellow-500/30"
                    onClick={() => handleAddDisciplinaryItem("retard")}
                    disabled={!disciplinaryForms.retard.name.trim() || !disciplinaryForms.retard.price}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Ajouter
                  </Button>
                </div>

                <div className="space-y-3">
                  {/* Add Retard Form */}
                  <div className="bg-background/50 rounded-md p-3 space-y-2">
                    <Input
                      placeholder="Nom du retard"
                      className="h-8 text-sm bg-background/80"
                      value={disciplinaryForms.retard.name}
                      onChange={(e) => handleDisciplinaryFormChange("retard", "name", e.target.value)}
                    />
                    <Input
                      placeholder="Prix (DT)"
                      type="number"
                      className="h-8 text-sm bg-background/80"
                      value={disciplinaryForms.retard.price}
                      onChange={(e) => handleDisciplinaryFormChange("retard", "price", e.target.value)}
                    />
                    <Input
                      placeholder="Description"
                      className="h-8 text-sm bg-background/80"
                      value={disciplinaryForms.retard.description}
                      onChange={(e) => handleDisciplinaryFormChange("retard", "description", e.target.value)}
                    />
                  </div>

                  {/* Existing Retards List */}
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {retards.length > 0 ? (
                      retards.map((item: any) => (
                        <div key={item.id} className="bg-background/30 rounded-md p-2 text-sm">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-medium text-yellow-400">{item.name}</div>
                              {item.description && (
                                <div className="text-xs text-muted-foreground mt-1">{item.description}</div>
                              )}
                              <div className="text-xs text-muted-foreground mt-1">
                                {formatDisciplinaryDate(item.created_date)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-yellow-400">{formatCurrency(item.price)}</div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-muted-foreground text-center py-2">Aucun retard enregistré</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tenues de Travail Box */}
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-blue-400 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Tenues de Travail
                  </h3>
                  <Button
                    size="sm"
                    className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-500/30"
                    onClick={() => handleAddDisciplinaryItem("tenue")}
                    disabled={!disciplinaryForms.tenue.name.trim() || !disciplinaryForms.tenue.price}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Ajouter
                  </Button>
                </div>

                <div className="space-y-3">
                  {/* Add Tenue Form */}
                  <div className="bg-background/50 rounded-md p-3 space-y-2">
                    <Input
                      placeholder="Nom de la tenue"
                      className="h-8 text-sm bg-background/80"
                      value={disciplinaryForms.tenue.name}
                      onChange={(e) => handleDisciplinaryFormChange("tenue", "name", e.target.value)}
                    />
                    <Input
                      placeholder="Prix (DT)"
                      type="number"
                      className="h-8 text-sm bg-background/80"
                      value={disciplinaryForms.tenue.price}
                      onChange={(e) => handleDisciplinaryFormChange("tenue", "price", e.target.value)}
                    />
                    <Input
                      placeholder="Description"
                      className="h-8 text-sm bg-background/80"
                      value={disciplinaryForms.tenue.description}
                      onChange={(e) => handleDisciplinaryFormChange("tenue", "description", e.target.value)}
                    />
                  </div>

                  {/* Existing Tenues List */}
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {tenuesTravail.length > 0 ? (
                      tenuesTravail.map((item: any) => (
                        <div key={item.id} className="bg-background/30 rounded-md p-2 text-sm">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-medium text-blue-400">{item.name}</div>
                              {item.description && (
                                <div className="text-xs text-muted-foreground mt-1">{item.description}</div>
                              )}
                              <div className="text-xs text-muted-foreground mt-1">
                                {formatDisciplinaryDate(item.created_date)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-blue-400">{formatCurrency(item.price)}</div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-muted-foreground text-center py-2">Aucune tenue enregistrée</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity (Schedules) */}
        <Card className="glass-card backdrop-blur-futuristic border-0 shadow-2xl bg-gradient-to-br from-card to-card/80">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center text-base sm:text-lg">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> <span dir="auto">{t("recent_activity")}</span>
            </CardTitle>
            <CardDescription className="text-sm" dir="auto">
              {t("recent_sessions")}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            {schedules.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {schedules.slice(0, 5).map((schedule: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-medium">{formatDate(schedule.date)}</p>
                        <p className="text-xs text-muted-foreground" dir="auto">
                          {schedule.shift_type} - {schedule.job_position}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs sm:text-sm font-medium">
                        {schedule.start_time} - {schedule.end_time || t("in_progress")}
                      </p>
                      <Badge variant={schedule.is_working ? "default" : "secondary"} className="text-xs" dir="auto">
                        {schedule.is_working ? t("active") : t("done")}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8 text-muted-foreground">
                <Clock className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm" dir="auto">
                  {t("no_recent_activity")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contracts */}
        {contracts.length > 0 && (
          <Card className="glass-card backdrop-blur-futuristic border-0 shadow-2xl bg-gradient-to-br from-card to-card/80">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center text-base sm:text-lg">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> <span dir="auto">{t("contracts")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="space-y-3 sm:space-y-4">
                {contracts.map((contract: any, index: number) => (
                  <div key={index} className="border border-border rounded-lg p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-sm sm:text-base font-semibold" dir="auto">
                          {t("contract_prefix")} {contract.contract_type}
                        </h4>
                        <p className="text-xs sm:text-sm text-muted-foreground" dir="auto">
                          {t("from")} {formatDate(contract.start_date)}
                          {contract.end_date && ` ${t("to")} ${formatDate(contract.end_date)}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm sm:text-base font-semibold">{formatCurrency(contract.salary)}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatNumber(contract.tenu_count)} {t("uniforms_count")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
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
