"use client"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useQuery } from "@apollo/client"
import { GET_WORK_SCHEDULES } from "@/lib/graphql-queries"

export default function JournalPage() {
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())

  const { data: scheduleData } = useQuery(GET_WORK_SCHEDULES, {
    variables: { employee_id: user?.employee_id },
    skip: !user?.employee_id,
  })

  const schedules = scheduleData?.workSchedules || []

  // Sort schedules to start from Monday (1) to Sunday (0)
  const sortedSchedules = [...schedules].sort((a, b) => {
    const getDateFromTimestamp = (timestamp: string | number) => {
      if (typeof timestamp === 'string' && /^\d+$/.test(timestamp)) {
        return new Date(parseInt(timestamp));
      }
      return new Date(timestamp);
    };

    const dateA = getDateFromTimestamp(a.date);
    const dateB = getDateFromTimestamp(b.date);
    
    // Convert Sunday (0) to 7 to make Monday (1) the first day
    const dayA = dateA.getDay() === 0 ? 7 : dateA.getDay();
    const dayB = dateB.getDay() === 0 ? 7 : dateB.getDay();
    
    // First sort by day of week (Monday first)
    if (dayA !== dayB) {
      return dayA - dayB;
    }
    
    // Then sort by actual date
    return dateA.getTime() - dateB.getTime();
  });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
  }

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }

  const getScheduleForDate = (day: number) => {
    if (!day) return null
    const dateString = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split("T")[0]
    return schedules.find((schedule: any) => schedule.date === dateString)
  }

  const getScheduleStats = () => {
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()

    const monthSchedules = schedules.filter((schedule: any) => {
      const scheduleDate = new Date(schedule.date)
      return scheduleDate.getMonth() === currentMonth && scheduleDate.getFullYear() === currentYear
    })

    const workingDays = monthSchedules.filter((s: any) => s.is_working).length
    const totalHours = monthSchedules.reduce((sum: number, schedule: any) => {
      if (schedule.start_time && schedule.end_time) {
        const start = new Date(`2024-01-01 ${schedule.start_time}`)
        const end = new Date(`2024-01-01 ${schedule.end_time}`)
        const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
        return sum + diff
      }
      return sum
    }, 0)

    return { workingDays, totalHours: Math.round(totalHours) }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-castle rounded-2xl p-6 text-white shadow-elegant">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">Journal de Travail</h1>
            <p className="text-white/90">Consultez votre planning et historique</p>
          </div>
        </div>
      </div>

      {/* Tableau des horaires de travail */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Mes horaires de travail</CardTitle>
          <CardDescription>Liste de vos sessions de travail</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Jour</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Type</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Début</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Fin</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sortedSchedules.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-4 text-center text-muted-foreground">Aucune session trouvée.</td>
                  </tr>
                ) : (
                  sortedSchedules.map((schedule: any, idx: number) => (
                    <tr key={idx} className="hover:bg-accent/50 transition-colors">
                      <td className="px-4 py-2 whitespace-nowrap">
                        {(() => {
                          let dateValue = schedule.date;
                          
                          if (!dateValue) return "-";
                          
                          let d: Date | null = null;
                          
                          // Handle timestamp (string of numbers) or regular date
                          if (typeof dateValue === 'string') {
                            // Check if it's a timestamp (all digits)
                            if (/^\d+$/.test(dateValue)) {
                              // Convert timestamp string to number and create date
                              const timestamp = parseInt(dateValue);
                              d = new Date(timestamp);
                            } else {
                              // Handle regular date string formats
                              const cleanDateStr = dateValue.replace(/['"\s]/g, '');
                              const parts = cleanDateStr.split('-');
                              if (parts.length === 3 && parts[0].length === 4) {
                                const year = parseInt(parts[0]);
                                const month = parseInt(parts[1]) - 1; // Month is 0-indexed
                                const day = parseInt(parts[2]);
                                d = new Date(year, month, day);
                              } else {
                                d = new Date(cleanDateStr);
                              }
                            }
                          } else if (typeof dateValue === 'number') {
                            // Handle numeric timestamp
                            d = new Date(dateValue);
                          } else {
                            // Fallback
                            d = new Date(dateValue);
                          }
                          
                          if (!d || isNaN(d.getTime())) {
                            return "-";
                          }
                          
                          // French day names with first letter capitalized
                          const frenchDays = [
                            "Dimanche",
                            "Lundi", 
                            "Mardi",
                            "Mercredi",
                            "Jeudi",
                            "Vendredi",
                            "Samedi"
                          ];
                          
                          const dayName = frenchDays[d.getDay()];
                          
                          // Format the date as YYYY-MM-DD
                          const year = d.getFullYear();
                          const month = String(d.getMonth() + 1).padStart(2, '0');
                          const day = String(d.getDate()).padStart(2, '0');
                          const formattedDate = `${year}-${month}-${day}`;
                          
                          // Return in the exact format requested: Lundi2025-07-21
                          return `${dayName} ${formattedDate}`;
                        })()}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <Badge variant={schedule.is_working ? "default" : "secondary"} className="text-xs px-1 py-0">
                          {schedule.shift_type}
                        </Badge>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">{schedule.start_time ? schedule.start_time.slice(0,5) : "-"}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{schedule.end_time ? schedule.end_time.slice(0,5) : "-"}</td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {schedule.is_working ? (
                          <span className="text-green-600 font-semibold">Travaillé</span>
                        ) : (
                          <span className="text-gray-400">Repos</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}