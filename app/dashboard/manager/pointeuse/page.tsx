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
    <div className="space-y-4 sm:space-y-6 animate-fade-in p-2 sm:p-4 lg:p-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-castle rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-elegant">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="w-8 h-8 sm:w-12 sm:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
            <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold mb-1">Pointeuse Équipe</h1>
            <p className="text-white/90 text-xs sm:text-sm lg:text-base">Gérez les temps de travail de votre équipe</p>
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
            color: "text-green-600",
          },
          {
            title: "Planifiés",
            value: schedules.length.toString(),
            description: "Aujourd'hui",
            icon: Calendar,
            color: "text-restaurant-green",
          },
          {
            title: "Heures Total",
            value: `${schedules.length * 8}h`,
            description: "Estimées",
            icon: Clock,
            color: "text-restaurant-red",
          },
        ].map((stat, index) => (
          <Card
            key={index}
            className="dashboard-card hover-scale shadow-elegant border-0 bg-gradient-to-br from-card to-card/80"
          >
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between space-x-2">
                <div className="min-w-0 flex-1">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs sm:text-sm font-medium text-muted-foreground leading-tight">{stat.title}</div>
                  <div className="text-xs text-muted-foreground mt-1 leading-tight hidden sm:block">
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
      <Card className="dashboard-card shadow-elegant border-0 bg-gradient-to-br from-card to-card/80">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Rechercher un employé..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-sm h-10 sm:h-12"
                />
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-[140px] text-sm h-10 sm:h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-sm">
                      Tous
                    </SelectItem>
                    <SelectItem value="active" className="text-sm">
                      Actifs
                    </SelectItem>
                    <SelectItem value="inactive" className="text-sm">
                      Inactifs
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-sm h-10 sm:h-12 w-full sm:w-auto"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee Time Tracking */}
      <Card className="dashboard-card shadow-elegant border-0 bg-gradient-to-br from-card to-card/80">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center text-base sm:text-lg">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Gestion Temps Équipe
          </CardTitle>
          <CardDescription className="text-sm">
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
                    className="border border-border rounded-xl p-4 sm:p-6 hover:bg-accent/30 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-castle rounded-lg flex items-center justify-center flex-shrink-0">
                          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <h3 className="text-sm sm:text-base font-semibold text-foreground truncate">
                              {employee.prenom} {employee.nom}
                            </h3>
                            <Badge variant={working ? "default" : "secondary"} className="text-xs w-fit">
                              {working ? "En Service" : "Hors Service"}
                            </Badge>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs sm:text-sm text-muted-foreground">
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
                            className="btn-restaurant text-xs sm:text-sm h-8 sm:h-10"
                          >
                            <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            Commencer
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleTimeAction(employee.id, "end")}
                            variant="destructive"
                            className="text-xs sm:text-sm h-8 sm:h-10"
                          >
                            <Square className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            Terminer
                          </Button>
                        )}
                        <Button variant="outline" size="sm" className="text-xs sm:text-sm h-8 sm:h-10 bg-transparent">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          Historique
                        </Button>
                      </div>
                    </div>

                    {/* Time Details */}
                    {schedule && (
                      <div className="mt-4 pt-4 border-t border-border/50">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                          <div className="text-center">
                            <div className="text-sm sm:text-base font-bold text-foreground">
                              {formatTime(schedule.start_time)}
                            </div>
                            <div className="text-xs text-muted-foreground">Début</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm sm:text-base font-bold text-foreground">
                              {formatTime(schedule.end_time)}
                            </div>
                            <div className="text-xs text-muted-foreground">Fin</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm sm:text-base font-bold text-foreground">{schedule.shift_type}</div>
                            <div className="text-xs text-muted-foreground">Service</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm sm:text-base font-bold text-foreground">
                              {employee.tenu_de_travail || 0}
                            </div>
                            <div className="text-xs text-muted-foreground">Tenues</div>
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
              <Users className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">Aucun employé trouvé</h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm || filterStatus !== "all"
                  ? "Aucun employé ne correspond à vos critères."
                  : "Aucun employé disponible."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
