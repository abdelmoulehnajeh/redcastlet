"use client"

import { useState, useMemo } from "react"
import { useQuery, useMutation } from "@apollo/client"
import { DollarSign, Users, Search, Edit, Save, X } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { GET_EMPLOYEES, UPDATE_EMPLOYEE } from "@/lib/graphql-queries"
import { toast } from "sonner"
import { useLang, type Lang } from "@/lib/i18n"

type Dict = {
  headerTitle: string
  headerSubtitle: string

  sectionTitle: string
  sectionSubtitle: string

  searchPlaceholder: string

  salary: string
  bonus: string
  advance: string
  infractions: string
  absences: string
  lates: string

  save: string
  cancel: string
  edit: string

  performance: string

  emptyTitle: string
  emptyDescFiltered: string
  emptyDescAll: string

  toastSaved: string
  toastError: string

  currency: string
}

const translations: Record<Lang, Dict> = {
  fr: {
    headerTitle: "Finance Équipe",
    headerSubtitle: "Gérez les finances de votre équipe",

    sectionTitle: "Gestion Financière Employés",
    sectionSubtitle: "Modifiez les salaires, primes et sanctions",

    searchPlaceholder: "Rechercher un employé...",

    salary: "Salaire",
    bonus: "Prime",
    advance: "Avance",
    infractions: "Infractions",
    absences: "Absences",
    lates: "Retards",

    save: "Sauver",
    cancel: "Annuler",
    edit: "Modifier",

    performance: "Performance",

    emptyTitle: "Aucun employé trouvé",
    emptyDescFiltered: "Aucun employé ne correspond à votre recherche.",
    emptyDescAll: "Aucun employé disponible.",

    toastSaved: "Employé mis à jour avec succès",
    toastError: "Erreur lors de la mise à jour",

    currency: "DT",
  },
  ar: {
    headerTitle: "مالية الفريق",
    headerSubtitle: "إدارة الشؤون المالية لفريقك",

    sectionTitle: "الإدارة المالية للموظفين",
    sectionSubtitle: "تعديل الرواتب والمنح والعقوبات",

    searchPlaceholder: "ابحث عن موظف...",

    salary: "الراتب",
    bonus: "المنحة",
    advance: "السلفة",
    infractions: "المخالفات",
    absences: "الغيابات",
    lates: "التأخيرات",

    save: "حفظ",
    cancel: "إلغاء",
    edit: "تعديل",

    performance: "الأداء",

    emptyTitle: "لا يوجد موظفون",
    emptyDescFiltered: "لا يوجد موظفون يطابقون بحثك.",
    emptyDescAll: "لا يوجد موظفون متاحون.",

    toastSaved: "تم تحديث الموظف بنجاح",
    toastError: "حدث خطأ أثناء التحديث",

    currency: "د.ت",
  },
}

export default function ManagerFinancePage() {
  const { lang } = useLang()
  const t = translations[lang]
  const align = lang === "ar" ? "text-right" : "text-left"
  const nf = useMemo(() => new Intl.NumberFormat(lang === "ar" ? "ar-TN" : "fr-TN"), [lang])

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
      (emp.job_title || "").toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleEdit = (employee: any) => {
    setEditData({
      salaire: employee.salaire || 0,
      prime: employee.prime || 0,
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
      toast.success(t.toastSaved)
      setEditingEmployee(null)
      refetch()
    } catch (error) {
      toast.error(t.toastError)
      console.error("Error updating employee:", error)
    }
  }

  const handleCancel = () => {
    setEditingEmployee(null)
    setEditData({})
  }

  const Money = ({ amount }: { amount: number }) => (
    <span dir="ltr" className="tabular-nums">
      {nf.format(amount)} {t.currency}
    </span>
  )

  return (
    <div className="min-h-screen relative overflow-hidden animate-fade-in">
      {/* Floating particles background (absolute, so sidebar stays visible) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-blue-900/60 to-slate-900/80 backdrop-blur-[6px]" />
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-blue-400 to-green-400 rounded-full opacity-30 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${6 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6 relative z-20 max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="glass-card backdrop-blur-futuristic p-4 sm:p-6 lg:p-8 text-white shadow-2xl animate-fade-in relative overflow-hidden border border-white/10">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 via-green-900/40 to-blue-900/30 opacity-70 rounded-2xl" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-[shimmer_3s_ease-in-out_infinite] rounded-2xl" />
          <div className="flex items-center space-x-4 relative z-10">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-700/40 to-green-700/40 rounded-xl flex items-center justify-center border border-white/10">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1
                className="text-2xl md:text-3xl font-bold mb-1 bg-gradient-to-r from-white via-blue-200 to-green-200 bg-clip-text text-transparent"
                dir="auto"
              >
                {t.headerTitle}
              </h1>
              <p className="text-slate-200 text-xs sm:text-sm lg:text-base" dir="auto">
                {t.headerSubtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Employee Finance Management */}
        <Card className="glass-card backdrop-blur-futuristic border border-white/10 shadow-2xl bg-gradient-to-br from-slate-900/70 via-blue-900/60 to-slate-900/70">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center text-base sm:text-lg text-white" dir="auto">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              {t.sectionTitle}
            </CardTitle>
            <CardDescription className="text-blue-200" dir="auto">
              {t.sectionSubtitle}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 pt-0">
            {/* Search */}
            <div className="relative mb-4 sm:mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-200 w-4 h-4" />
              <Input
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm h-10 sm:h-12 glass-card bg-gradient-to-br from-blue-900/40 to-green-900/40 border border-white/10 text-white placeholder:text-blue-200"
              />
            </div>

            {/* Employee List */}
            <div className="space-y-3 sm:space-y-4">
              {filteredEmployees.map((employee: any) => (
                <div
                  key={employee.id}
                  className="border border-white/10 rounded-xl p-4 sm:p-6 glass-card bg-gradient-to-br from-blue-900/40 to-green-900/40 hover:bg-blue-900/60 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-700/40 to-green-700/40 rounded-lg flex items-center justify-center flex-shrink-0 border border-white/10">
                        <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm sm:text-base font-semibold text-white mb-1 truncate" dir="auto">
                          {employee.prenom} {employee.nom}
                        </h3>
                        <p className="text-xs sm:text-sm text-blue-200" dir="auto">
                          {employee.job_title}
                        </p>
                      </div>
                    </div>

                    {editingEmployee?.id === employee.id ? (
                      <div className="space-y-3 sm:space-y-4 w-full lg:w-auto lg:min-w-[400px]">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs font-medium text-white" dir="auto">
                              {t.salary}
                            </Label>
                            <Input
                              type="number"
                              value={editData.salaire}
                              onChange={(e) =>
                                setEditData({ ...editData, salaire: Number.parseInt(e.target.value) || 0 })
                              }
                              className="text-xs h-8 glass-card bg-gradient-to-br from-blue-900/40 to-green-900/40 border border-white/10 text-white"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs font-medium text-white" dir="auto">
                              {t.bonus}
                            </Label>
                            <Input
                              type="number"
                              value={editData.prime}
                              onChange={(e) =>
                                setEditData({ ...editData, prime: Number.parseInt(e.target.value) || 0 })
                              }
                              className="text-xs h-8 glass-card bg-gradient-to-br from-blue-900/40 to-green-900/40 border border-white/10 text-white"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs font-medium text-white" dir="auto">
                              {t.advance}
                            </Label>
                            <Input
                              type="number"
                              value={editData.avance}
                              onChange={(e) =>
                                setEditData({ ...editData, avance: Number.parseInt(e.target.value) || 0 })
                              }
                              className="text-xs h-8 glass-card bg-gradient-to-br from-blue-900/40 to-green-900/40 border border-white/10 text-white"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 sm:gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs font-medium text-white" dir="auto">
                              {t.infractions}
                            </Label>
                            <Input
                              type="number"
                              value={editData.infractions}
                              onChange={(e) =>
                                setEditData({ ...editData, infractions: Number.parseInt(e.target.value) || 0 })
                              }
                              className="text-xs h-8 glass-card bg-gradient-to-br from-blue-900/40 to-green-900/40 border border-white/10 text-white"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs font-medium text-white" dir="auto">
                              {t.absences}
                            </Label>
                            <Input
                              type="number"
                              value={editData.absence}
                              onChange={(e) =>
                                setEditData({ ...editData, absence: Number.parseInt(e.target.value) || 0 })
                              }
                              className="text-xs h-8 glass-card bg-gradient-to-br from-blue-900/40 to-green-900/40 border border-white/10 text-white"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs font-medium text-white" dir="auto">
                              {t.lates}
                            </Label>
                            <Input
                              type="number"
                              value={editData.retard}
                              onChange={(e) =>
                                setEditData({ ...editData, retard: Number.parseInt(e.target.value) || 0 })
                              }
                              className="text-xs h-8 glass-card bg-gradient-to-br from-blue-900/40 to-green-900/40 border border-white/10 text-white"
                            />
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            onClick={handleSave}
                            size="sm"
                            className="glass-card bg-gradient-to-br from-green-700/40 to-blue-700/40 text-white border border-white/10 text-xs"
                          >
                            <Save className="w-3 h-3 mr-1" />
                            {t.save}
                          </Button>
                          <Button
                            onClick={handleCancel}
                            variant="outline"
                            size="sm"
                            className="glass-card bg-gradient-to-br from-blue-900/40 to-green-900/40 border border-white/10 text-white text-xs"
                          >
                            <X className="w-3 h-3 mr-1" />
                            {t.cancel}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 w-full lg:w-auto">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                          <div className="text-center">
                            <div className="text-sm sm:text-base font-bold text-white">
                              <Money amount={employee.salaire || 0} />
                            </div>
                            <div className="text-xs text-blue-200" dir="auto">
                              {t.salary}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm sm:text-base font-bold text-green-400">
                              <Money amount={employee.prime || 0} />
                            </div>
                            <div className="text-xs text-blue-200" dir="auto">
                              {t.bonus}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm sm:text-base font-bold text-cyan-400">
                              <Money amount={employee.avance || 0} />
                            </div>
                            <div className="text-xs text-blue-200" dir="auto">
                              {t.advance}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 sm:gap-4">
                          <div className="text-center">
                            <div className="text-sm sm:text-base font-bold text-red-400">
                              {employee.infractions || 0}
                            </div>
                            <div className="text-xs text-blue-200" dir="auto">
                              {t.infractions}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm sm:text-base font-bold text-orange-400">
                              {employee.absence || 0}
                            </div>
                            <div className="text-xs text-blue-200" dir="auto">
                              {t.absences}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm sm:text-base font-bold text-yellow-400">{employee.retard || 0}</div>
                            <div className="text-xs text-blue-200" dir="auto">
                              {t.lates}
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-center">
                          <Button
                            onClick={() => handleEdit(employee)}
                            variant="outline"
                            size="sm"
                            className="glass-card bg-gradient-to-br from-blue-900/40 to-green-900/40 border border-white/10 text-white text-xs sm:text-sm h-8 sm:h-10"
                          >
                            <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            {t.edit}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Performance indicator */}
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs sm:text-sm font-medium text-blue-200" dir="auto">
                        {t.performance}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-white">
                        {Math.max(
                          0,
                          100 -
                            ((employee.infractions || 0) * 5 +
                              (employee.absence || 0) * 3 +
                              (employee.retard || 0) * 2),
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
                      className="h-2 bg-gradient-to-r from-green-400 via-blue-400 to-cyan-400"
                    />
                  </div>
                </div>
              ))}
            </div>

            {filteredEmployees.length === 0 && (
              <div className="text-center py-8 sm:py-12">
                <Users className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-blue-200/50 mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2" dir="auto">
                  {t.emptyTitle}
                </h3>
                <p className="text-sm text-blue-200" dir="auto">
                  {searchTerm ? t.emptyDescFiltered : t.emptyDescAll}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
