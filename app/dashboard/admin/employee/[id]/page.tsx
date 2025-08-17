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
} from "lucide-react"
import { useQuery, useMutation } from "@apollo/client"
import { GET_EMPLOYEE_DETAILS, UPDATE_EMPLOYEE, UPDATE_EMPLOYEE_PROFILE } from "@/lib/graphql-queries"
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

  // Single GraphQL query to get all employee data
  const { data, loading, refetch } = useQuery(GET_EMPLOYEE_DETAILS, {
    variables: { id: employeeId },
    fetchPolicy: "cache-first",
    nextFetchPolicy: "cache-first",
    notifyOnNetworkStatusChange: false,
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
          },
        })
      }
    },
  })

  const employee = data?.employee
  const schedules = data?.workSchedules || []
  const contracts = data?.contracts || []

  const handleEdit = () => {
    setEditData({
      prenom: employee?.prenom || "",
      nom: employee?.nom || "",
      email: employee?.email || "",
      telephone: employee?.telephone || "",
      job_title: employee?.job_title || "",
      status: employee?.status || "active",
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

      await updateEmployeeProfile({
        variables: { id: employeeId, ...personalData },
      })

      await updateEmployee({
        variables: { id: employeeId, ...financialData },
      })

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
      const d = new Date(dateString)
      if (isNaN(d.getTime())) return t("invalid_date")
      return format(d, "PPPP", { locale: lang === "ar" ? arLocale : fr })
    } catch {
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
                <Label className="text-xs sm:text-sm font-medium text-muted-foreground">Email</Label>
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
                <div className="flex items-center space-x-2">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm sm:text-base font-semibold text-foreground">
                    {formatDate(employee.created_at)}
                  </span>
                </div>
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
            <CardContent className="p-4 sm:p-6 pt-0 space-y-3 sm:space-y-4">
              {[
                { key: "infractions", label: t("infractions"), max: 10, color: "text-red-500" },
                { key: "absence", label: t("absences"), max: 15, color: "text-orange-500" },
                { key: "retard", label: t("delays"), max: 20, color: "text-yellow-500" },
              ].map((item) => (
                <div key={item.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-medium" dir="auto">
                      {item.label}
                    </span>
                    <div className="text-right">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editData[item.key] ?? 0}
                          onChange={(e) =>
                            setEditData({ ...editData, [item.key]: Number.parseInt(e.target.value) || 0 })
                          }
                          className="w-16 sm:w-20 h-6 sm:h-8 text-xs sm:text-sm"
                        />
                      ) : (
                        <>
                          <span className="text-sm sm:text-lg font-bold text-foreground">
                            {formatNumber(employee[item.key] || 0)}
                          </span>
                          <span className="text-xs text-muted-foreground">/{item.max}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {!isEditing && <Progress value={((employee[item.key] || 0) / item.max) * 100} className="h-2" />}
                </div>
              ))}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-medium" dir="auto">
                    {t("uniforms")}
                  </span>
                  <div className="text-right">
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editData.tenu_de_travail ?? 0}
                        onChange={(e) =>
                          setEditData({ ...editData, tenu_de_travail: Number.parseInt(e.target.value) || 0 })
                        }
                        className="w-16 sm:w-20 h-6 sm:h-8 text-xs sm:text-sm"
                      />
                    ) : (
                      <span className="text-sm sm:text-lg font-bold text-foreground">
                        {formatNumber(employee.tenu_de_travail || 0)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
