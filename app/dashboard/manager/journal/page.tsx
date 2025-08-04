"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Users, Clock, Save, User, MapPin } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useQuery, useMutation } from "@apollo/client"
import { GET_EMPLOYEES, GET_WORK_SCHEDULES, CREATE_MANAGER_WORK_SCHEDULE, SEND_APPROVAL_REQUEST } from "@/lib/graphql-queries"

export default function ManagerJournalPage() {
  // Assume manager's restaurant is known (replace with actual logic if needed)
  const managerRestaurant = "Red Castle lauina";
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [schedule, setSchedule] = useState<Record<string, string>>({});
  const [jobPosition, setJobPosition] = useState("");
  const { toast } = useToast();

  // GraphQL queries
  const { data: employeesData, error: employeesError, loading: employeesLoading } = useQuery(GET_EMPLOYEES)
  // Fetch all schedules for the manager's restaurant (like admin)
  const { data: schedulesData, error: schedulesError, loading: schedulesLoading, refetch } = useQuery(GET_WORK_SCHEDULES);
  const [createManagerSchedule] = useMutation(CREATE_MANAGER_WORK_SCHEDULE)
  const [sendApprovalRequest] = useMutation(SEND_APPROVAL_REQUEST)

  // Error handling for API responses
  if (employeesError || schedulesError) {
    return (
      <div className="p-8 text-center text-red-600">
        <h2>Erreur de chargement des données</h2>
        <p>{employeesError?.message || schedulesError?.message}</p>
      </div>
    )
  }
  if (employeesLoading || schedulesLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <h2>Chargement des données...</h2>
      </div>
    )
  }

  // Defensive: If API returns undefined/null, show error
  if (!employeesData?.employees) {
    return (
      <div className="p-8 text-center text-red-600">
        <h2>Erreur: Données manquantes du serveur</h2>
        <p>Vérifiez la connexion à la base de données ou contactez l'administrateur.</p>
      </div>
    )
  }

  // Use DB-driven employees, filter by manager's restaurant
  const employees = employeesData.employees.map((emp: any) => ({
    id: emp.id,
    name: `${emp.prenom} ${emp.nom}`,
    position: emp.job_title,
    job_title: emp.job_title,
    prenom: emp.prenom,
    nom: emp.nom,
    location: emp.location?.name || "",
  }));
  const filteredEmployees = employees.filter((emp: any) => emp.location === managerRestaurant);

  // Helper: get the shift for an employee and day from schedulesData (manager_work_schedules)
  function getEmployeeSchedule(employeeId: string, dayKey: string) {
    if (!schedulesData?.workSchedules) return null;
    // Find the date for this day in the current week
    const today = new Date();
    const dayIndex = daysOfWeek.findIndex((d) => d.key === dayKey);
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    const date = new Date(monday);
    date.setDate(monday.getDate() + dayIndex);
    date.setHours(0, 0, 0, 0);
    // Find the schedule for this employee and date (date in DB is ms timestamp as string or ISO string)
    const sched = schedulesData.workSchedules.find((s: any) => {
      if (s.employee_id !== employeeId) return false;
      let schedDate: Date;
      if (/^\d+$/.test(s.date)) {
        schedDate = new Date(Number(s.date));
      } else {
        schedDate = new Date(s.date);
      }
      schedDate.setHours(0, 0, 0, 0);
      return schedDate.getTime() === date.getTime();
    });
    return sched ? { shift: sched.shift_type, job: sched.job_position } : null;
  }

  // Days and shifts (French)
  const daysOfWeek = [
    { key: "monday", label: "Lundi" },
    { key: "tuesday", label: "Mardi" },
    { key: "wednesday", label: "Mercredi" },
    { key: "thursday", label: "Jeudi" },
    { key: "friday", label: "Vendredi" },
    { key: "saturday", label: "Samedi" },
    { key: "sunday", label: "Dimanche" },
  ]
  const shifts = [
    { value: "Matin", label: "Matin (09:00 - 18:00)" },
    { value: "Soirée", label: "Soirée (18:00 - 03:00)" },
    { value: "Doublage", label: "Doublage (09:00 - 03:00)" },
    { value: "Repos", label: "Repos" },
  ];

  // Collect all unique job positions from employees
  const allJobPositions = Array.from(new Set(employees.map((emp: any) => emp.job_title).filter(Boolean)));

  const handleScheduleChange = (day: string, shift: string) => {
    setSchedule((prev) => ({ ...prev, [day]: shift }))
  }
  const handleSelectChange = (day: string) => (value: string) => {
    handleScheduleChange(day, value)
  }

  const handleSaveSchedule = async () => {
    if (!selectedEmployee) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un employé",
        variant: "destructive",
      })
      return
    }
    try {
      // Save each day's schedule to manager_work_schedules and collect IDs
      const createdSchedules = await Promise.all(
        daysOfWeek.map(async (day) => {
          const shift = schedule[day.key]
          if (!shift) return null
          // Compose date for this week (use current week)
          const today = new Date()
          const dayIndex = daysOfWeek.findIndex((d) => d.key === day.key)
          const monday = new Date(today)
          monday.setDate(today.getDate() - today.getDay() + 1)
          const date = new Date(monday)
          date.setDate(monday.getDate() + dayIndex)
          const dateString = date.toISOString().split("T")[0]

          // Set default start/end times for each shift
          let start_time = "00:00"
          let end_time = "00:00"
          if (shift === "Matin") {
            start_time = "08:00"
            end_time = "16:00"
          } else if (shift === "Soirée") {
            start_time = "14:00"
            end_time = "22:00"
          } else if (shift === "Doublage") {
            start_time = "09:00"
            end_time = "23:00"
          } // For 'Repos', keep '00:00'

          const result = await createManagerSchedule({
            variables: {
              employee_id: selectedEmployee,
              date: dateString,
              shift_type: shift,
              job_position: filteredEmployees.find((e: any) => e.id === selectedEmployee)?.job_title || "",
              is_working: shift !== "Repos",
              start_time,
              end_time,
            },
          })
          // Apollo returns { data: { createManagerWorkSchedule: { id: ... } } }
          return result?.data?.createManagerWorkSchedule?.id || null
        })
      )
      // Use the first created schedule's ID as reference_id
      const reference_id = createdSchedules.find((id) => id !== null)
      // Save the whole week's schedule as JSON in admin_approvals
      await sendApprovalRequest({
        variables: {
          type: "schedule_change",
          reference_id,
          manager_id: selectedEmployee,
          data: JSON.stringify(schedule),
        },
      })
      toast({
        title: "Planning envoyé à l'admin pour approbation",
        description: `Le planning a été proposé avec succès`,
      })
      setSchedule({})
      refetch()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le planning",
        variant: "destructive",
      })
    }
  }

  const selectedEmployeeData = filteredEmployees.find((emp: any) => emp.id === selectedEmployee)

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
      <div className="space-y-8 p-3 sm:p-4 lg:p-6 relative z-20 max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="glass-card backdrop-blur-futuristic p-4 sm:p-6 lg:p-8 text-white shadow-2xl animate-fade-in relative overflow-hidden border border-white/10">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 via-green-900/40 to-blue-900/30 opacity-70 rounded-2xl" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-[shimmer_3s_ease-in-out_infinite] rounded-2xl" />
          <div className="flex items-center space-x-4 relative z-10">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-700/40 to-green-700/40 rounded-xl flex items-center justify-center border border-white/10">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1 bg-gradient-to-r from-white via-blue-200 to-green-200 bg-clip-text text-transparent">Journal Manager</h1>
              <p className="text-slate-200 text-sm md:text-base">
                Proposez les plannings de votre équipe à l'administrateur
              </p>
            </div>
          </div>
        </div>

        {/* Weekly Schedule Table */}
        <Card className="glass-card backdrop-blur-futuristic border border-white/10 shadow-2xl bg-gradient-to-br from-slate-900/70 via-blue-900/60 to-slate-900/70">
          <CardHeader>
            <CardTitle className="text-white">Planning Hebdomadaire</CardTitle>
            <CardDescription className="text-blue-200">Horaires de travail par employé et par jour</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-3 font-semibold text-white">Employé</th>
                    {daysOfWeek.map((day) => (
                      <th key={day.key} className="text-center p-3 font-semibold text-white">{day.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee: any) => (
                    <tr key={employee.id} className="border-b border-white/10 hover:bg-blue-900/30">
                      <td className="p-3">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs bg-gradient-to-br from-blue-700/40 to-green-700/40 text-white">
                              {employee.name.split(' ').map((n: string) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm text-white">{employee.name}</p>
                            <p className="text-xs text-blue-200">{employee.position}</p>
                          </div>
                        </div>
                      </td>
                      {daysOfWeek.map((day) => {
                        const sched = getEmployeeSchedule(employee.id, day.key);
                        return (
                          <td key={day.key} className="p-3 text-center">
                            {sched ? (
                              <div className="flex flex-col items-center gap-1">
                                <Badge
                                  className={`text-xs glass-card border border-white/10 ${
                                    sched.shift === 'Matin' ? 'bg-blue-600/80 text-white' :
                                    sched.shift === 'Soirée' ? 'bg-purple-600/80 text-white' :
                                    sched.shift === 'Doublage' ? 'bg-orange-600/80 text-white' :
                                    'bg-slate-700/80 text-blue-200'
                                  }`}
                                >
                                  {sched.shift}
                                </Badge>
                                <span className="text-xs text-blue-200">{sched.job}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-blue-200">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Employee Selection Grid */}
        <Card className="glass-card backdrop-blur-futuristic border border-white/10 shadow-2xl bg-gradient-to-br from-slate-900/70 via-blue-900/60 to-slate-900/70">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Users className="w-5 h-5 mr-2" />
              Employés
            </CardTitle>
            <CardDescription className="text-blue-200">
              Cliquez sur un employé pour proposer son planning
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEmployees.map((employee: any) => (
                <div
                  key={employee.id}
                  className={`border border-white/10 rounded-xl p-4 cursor-pointer transition-colors glass-card bg-gradient-to-br from-blue-900/40 to-green-900/40 ${
                    selectedEmployee === employee.id
                      ? "ring-2 ring-primary border-primary"
                      : "hover:bg-blue-900/60"
                  }`}
                  onClick={() => setSelectedEmployee(employee.id)}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-gradient-to-br from-blue-700/40 to-green-700/40 text-white">
                        {employee.prenom[0]}{employee.nom[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate text-white">{employee.prenom} {employee.nom}</h4>
                      <p className="text-sm text-blue-200 truncate">{employee.job_title}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Schedule Editor */}
        {selectedEmployeeData && (
          <Card className="glass-card backdrop-blur-futuristic border border-white/10 shadow-2xl bg-gradient-to-br from-slate-900/70 via-blue-900/60 to-slate-900/70">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Clock className="w-5 h-5 mr-2" />
                Planning de {selectedEmployeeData.prenom} {selectedEmployeeData.nom}
              </CardTitle>
              <CardDescription className="text-blue-200">
                Définissez les horaires de travail pour la semaine et le poste
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Job Position Selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-white">Poste pour cette semaine</label>
                <Select value={jobPosition || selectedEmployeeData.job_title} onValueChange={setJobPosition}>
                  <SelectTrigger className="glass-card bg-gradient-to-br from-blue-900/40 to-green-900/40 border border-white/10 text-white">
                    <SelectValue placeholder="Sélectionner un poste" />
                  </SelectTrigger>
                  <SelectContent className="glass-card bg-gradient-to-br from-blue-900/80 to-green-900/80 border border-white/10 text-white">
                    {allJobPositions.map((pos) => (
                      <SelectItem key={String(pos)} value={String(pos)}>{String(pos)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {daysOfWeek.map((day) => (
                  <div key={day.key} className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4 p-4 border border-white/10 rounded-lg glass-card bg-gradient-to-br from-blue-900/40 to-green-900/40">
                    <div className="md:w-32">
                      <span className="font-medium text-white">{day.label}</span>
                      <span className="ml-2 text-xs text-blue-200">
                        {/* Show the date for this day */}
                        {(() => {
                          const today = new Date();
                          const dayIndex = daysOfWeek.findIndex((d) => d.key === day.key);
                          const monday = new Date(today);
                          monday.setDate(today.getDate() - today.getDay() + 1);
                          const date = new Date(monday);
                          date.setDate(monday.getDate() + dayIndex);
                          return date.toISOString().split("T")[0];
                        })()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <Select
                        value={schedule[day.key] || ""}
                        onValueChange={handleSelectChange(day.key)}
                      >
                        <SelectTrigger className="glass-card bg-gradient-to-br from-blue-900/40 to-green-900/40 border border-white/10 text-white">
                          <SelectValue placeholder="Sélectionner un créneau" />
                        </SelectTrigger>
                        <SelectContent className="glass-card bg-gradient-to-br from-blue-900/80 to-green-900/80 border border-white/10 text-white">
                          {shifts.map((shift) => (
                            <SelectItem key={shift.value} value={shift.value}>
                              {shift.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {schedule[day.key] && (
                      <Badge className={`glass-card border border-white/10 text-xs ${schedule[day.key] === "Repos" ? 'bg-slate-700/80 text-blue-200' : 'bg-green-600/80 text-white'}`}>
                        {shifts.find((s) => s.value === schedule[day.key])?.label.split(" ")[0]}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <Button onClick={async () => {
                  if (!selectedEmployee) {
                    toast({
                      title: "Erreur",
                      description: "Veuillez sélectionner un employé",
                      variant: "destructive",
                    });
                    return;
                  }
                  try {
                    const createdSchedules = await Promise.all(
                      daysOfWeek.map(async (day) => {
                        const shift = schedule[day.key];
                        if (!shift) return null;
                        const today = new Date();
                        const dayIndex = daysOfWeek.findIndex((d) => d.key === day.key);
                        const monday = new Date(today);
                        monday.setDate(today.getDate() - today.getDay() + 1);
                        const date = new Date(monday);
                        date.setDate(monday.getDate() + dayIndex);
                        const dateString = date.toISOString().split("T")[0];
                        let start_time = null;
                        let end_time = null;
                        if (shift === "Matin") {
                          start_time = "09:00";
                          end_time = "18:00";
                        } else if (shift === "Soirée") {
                          start_time = "18:00";
                          end_time = "03:00";
                        } else if (shift === "Doublage") {
                          start_time = "09:00";
                          end_time = "03:00";
                        }
                        const result = await createManagerSchedule({
                          variables: {
                            employee_id: selectedEmployee,
                            date: dateString,
                            shift_type: shift,
                            job_position: jobPosition || selectedEmployeeData.job_title,
                            is_working: shift !== "Repos",
                            start_time,
                            end_time,
                          },
                        });
                        return result?.data?.createManagerWorkSchedule?.id || null;
                      })
                    );
                    const reference_id = createdSchedules.find((id) => id !== null);
                    await sendApprovalRequest({
                      variables: {
                        type: "schedule_change",
                        reference_id,
                        manager_id: selectedEmployee,
                        data: JSON.stringify(schedule),
                      },
                    });
                    toast({
                      title: "Planning envoyé à l'admin pour approbation",
                      description: `Le planning a été proposé avec succès`,
                    });
                    setSchedule({});
                    setJobPosition("");
                    refetch();
                  } catch (error) {
                    toast({
                      title: "Erreur",
                      description: "Impossible d'envoyer le planning",
                      variant: "destructive",
                    });
                  }
                }} className="glass-card bg-gradient-to-br from-green-700/40 to-blue-700/40 text-white border border-white/10 shadow">
                  <Save className="w-4 h-4 mr-2" />
                  Proposer le Planning
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
