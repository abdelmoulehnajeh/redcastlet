"use client"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Users, Search, Filter, Play, Square, Calendar, TrendingUp } from "lucide-react"
import { useQuery, useMutation } from "@apollo/client"
import { GET_EMPLOYEES, GET_WORK_SCHEDULES, CREATE_WORK_SCHEDULE } from "@/lib/graphql-queries"
import { toast } from "sonner"

export default function ManagerPointeusePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])

  const { data: employeesData } = useQuery(GET_EMPLOYEES)
  const { data: schedulesData, refetch } = useQuery(GET_WORK_SCHEDULES, {
    variables: { date: selectedDate },
  })

  const [createSchedule] = useMutation(CREATE_WORK_SCHEDULE)

  const employees = employeesData?.employees || []
  const schedules = schedulesData?.workSchedules || []

  const filteredEmployees = employees.filter((emp: any) => {
    const matchesSearch =
      emp.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.job_title.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === "all" || emp.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const handleTimeAction = async (employeeId: string, action: "start" | "end") => {
    const now = new Date()
    const timeString = now.toTimeString().split(" ")[0]

    try {
      if (action === "start") {
        await createSchedule({
          variables: {
            employee_id: employeeId,
            date: selectedDate,
            start_time: timeString,
            shift_type: "morning",
            job_position: "employee",
            is_working: true,
          },
        })
        toast.success("Travail commencé")
      } else {
        await createSchedule({
          variables: {
            employee_id: employeeId,
            date: selectedDate,
            end_time: timeString,
            shift_type: "morning",
            job_position: "employee",
            is_working: false,
          },
        })
        toast.success("Travail terminé")
      }
      refetch()
    } catch (error) {
      toast.error("Erreur lors de l'action")
      console.error("Error with time action:", error)
    }
  }

  const getEmployeeSchedule = (employeeId: string) => {
    return schedules.find((schedule: any) => schedule.employee_id === employeeId && schedule.date === selectedDate)
  }

  const isWorking = (employeeId: string) => {
    const schedule = getEmployeeSchedule(employeeId)
    return schedule?.is_working && schedule?.start_time && !schedule?.end_time
  }

  const formatTime = (timeString: string) => {
    return timeString ? timeString.slice(0, 5) : "--:--"
  }

  const activeEmployees = filteredEmployees.filter((emp: any) =>
    schedules.some((s: any) => s.employee_id === emp.id && s.is_working),
  ).length

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
              animationDuration: `${6 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>
      <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-3 sm:p-4 lg:p-6 relative z-20 max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="glass-card backdrop-blur-futuristic p-4 sm:p-6 lg:p-8 text-white shadow-2xl animate-fade-in relative overflow-hidden border border-white/10">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 via-green-900/40 to-blue-900/30 opacity-70 rounded-2xl" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-[shimmer_3s_ease-in-out_infinite] rounded-2xl" />
          <div className="flex items-center space-x-4 relative z-10">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-700/40 to-green-700/40 rounded-xl flex items-center justify-center border border-white/10">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl md:text-3xl font-bold mb-1 bg-gradient-to-r from-white via-blue-200 to-green-200 bg-clip-text text-transparent">Pointeuse Équipe</h1>
              <p className="text-slate-200 text-sm md:text-base">Gérez les temps de travail de votre équipe</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {[
            {
              title: "Équipe Totale",
              value: filteredEmployees.length.toString(),
              description: "Employés",
              icon: Users,
              color: "text-primary",
            },
            {
              title: "En Service",
              value: activeEmployees.toString(),
              description: "Actuellement",
              icon: TrendingUp,
              color: "text-green-400",
            },
            {
              title: "Planifiés",
              value: schedules.length.toString(),
              description: "Aujourd'hui",
              icon: Calendar,
              color: "text-blue-400",
            },
            {
              title: "Heures Total",
              value: `${schedules.length * 8}h`,
              description: "Estimées",
              icon: Clock,
              color: "text-cyan-400",
            },
          ].map((stat, index) => (
            <Card
              key={index}
              className="glass-card backdrop-blur-futuristic border border-white/10 shadow-2xl bg-gradient-to-br from-slate-900/70 via-blue-900/60 to-slate-900/70"
            >
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between space-x-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs sm:text-sm font-medium text-blue-200 leading-tight">{stat.title}</div>
                    <div className="text-xs text-green-200 mt-1 leading-tight hidden sm:block">
                      {stat.description}
                    </div>
                  </div>
                  <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${stat.color} flex-shrink-0`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Date and Filters */}
        <Card className="glass-card backdrop-blur-futuristic border border-white/10 shadow-2xl bg-gradient-to-br from-slate-900/70 via-blue-900/60 to-slate-900/70">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-200 w-4 h-4" />
                  <Input
                    placeholder="Rechercher un employé..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 text-sm h-10 sm:h-12 glass-card bg-gradient-to-br from-blue-900/40 to-green-900/40 border border-white/10 text-white placeholder:text-blue-200"
                  />
                </div>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Filter className="w-4 h-4 text-blue-200 flex-shrink-0" />
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-[140px] text-sm h-10 sm:h-12 glass-card bg-gradient-to-br from-blue-900/40 to-green-900/40 border border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-card bg-gradient-to-br from-blue-900/80 to-green-900/80 border border-white/10 text-white">
                      <SelectItem value="all" className="text-sm">Tous</SelectItem>
                      <SelectItem value="active" className="text-sm">Actifs</SelectItem>
                      <SelectItem value="inactive" className="text-sm">Inactifs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Calendar className="w-4 h-4 text-blue-200 flex-shrink-0" />
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="text-sm h-10 sm:h-12 w-full sm:w-auto glass-card bg-gradient-to-br from-blue-900/40 to-green-900/40 border border-white/10 text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employee Time Tracking */}
        <Card className="glass-card backdrop-blur-futuristic border border-white/10 shadow-2xl bg-gradient-to-br from-slate-900/70 via-blue-900/60 to-slate-900/70">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center text-base sm:text-lg text-white">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Gestion Temps Équipe
            </CardTitle>
            <CardDescription className="text-sm text-blue-200">
              Gérez les heures de travail pour le {new Date(selectedDate).toLocaleDateString("fr-FR")}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            {filteredEmployees.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {filteredEmployees.map((employee: any) => {
                  const schedule = getEmployeeSchedule(employee.id)
                  const working = isWorking(employee.id)

                  return (
                    <div
                      key={employee.id}
                      className="border border-white/10 rounded-xl p-4 sm:p-6 glass-card bg-gradient-to-br from-blue-900/40 to-green-900/40 hover:bg-blue-900/60 transition-colors"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-700/40 to-green-700/40 rounded-lg flex items-center justify-center flex-shrink-0 border border-white/10">
                            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                              <h3 className="text-sm sm:text-base font-semibold text-white truncate">
                                {employee.prenom} {employee.nom}
                              </h3>
                              <Badge
                                className={`text-xs w-fit glass-card border border-white/10 ${working ? 'bg-green-600/80 text-white' : 'bg-blue-900/60 text-blue-200'}`}
                              >
                                {working ? "En Service" : "Hors Service"}
                              </Badge>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs sm:text-sm text-blue-200">
                              <span>{employee.job_title}</span>
                              {schedule && <span className="hidden sm:inline">•</span>}
                              {schedule && (
                                <span>
                                  {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:flex-shrink-0">
                          {!working ? (
                            <Button
                              onClick={() => handleTimeAction(employee.id, "start")}
                              className="glass-card bg-gradient-to-br from-green-700/40 to-blue-700/40 text-white border border-white/10 text-xs sm:text-sm h-8 sm:h-10 shadow"
                            >
                              <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                              Commencer
                            </Button>
                          ) : (
                            <Button
                              onClick={() => handleTimeAction(employee.id, "end")}
                              className="glass-card bg-gradient-to-br from-blue-700/40 to-green-700/40 text-white border border-white/10 text-xs sm:text-sm h-8 sm:h-10 shadow"
                            >
                              <Square className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                              Terminer
                            </Button>
                          )}
                          <Button variant="outline" size="sm" className="glass-card bg-gradient-to-br from-blue-900/40 to-green-900/40 border border-white/10 text-white text-xs sm:text-sm h-8 sm:h-10 shadow">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            Historique
                          </Button>
                        </div>
                      </div>

                      {/* Time Details */}
                      {schedule && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                            <div className="text-center">
                              <div className="text-sm sm:text-base font-bold text-white">
                                {formatTime(schedule.start_time)}
                              </div>
                              <div className="text-xs text-blue-200">Début</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm sm:text-base font-bold text-white">
                                {formatTime(schedule.end_time)}
                              </div>
                              <div className="text-xs text-blue-200">Fin</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm sm:text-base font-bold text-white">{schedule.shift_type}</div>
                              <div className="text-xs text-blue-200">Service</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm sm:text-base font-bold text-white">
                                {employee.tenu_de_travail || 0}
                              </div>
                              <div className="text-xs text-blue-200">Tenues</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <Users className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-blue-200/50 mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Aucun employé trouvé</h3>
                <p className="text-sm text-blue-200">
                  {searchTerm || filterStatus !== "all"
                    ? "Aucun employé ne correspond à vos critères."
                    : "Aucun employé disponible."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
