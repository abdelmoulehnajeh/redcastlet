"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation } from "@apollo/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin, Calendar, Play, Square, AlertCircle, Timer } from "lucide-react"
import { GET_TIME_ENTRIES, CLOCK_IN_MUTATION, CLOCK_OUT_MUTATION } from "@/lib/graphql-queries"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"

export default function PointeusePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isClocked, setIsClocked] = useState(false)
  const [currentEntry, setCurrentEntry] = useState<any>(null)
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null)

  const { data: timeEntriesData, refetch } = useQuery(GET_TIME_ENTRIES, {
    variables: {
      employeeId: user?.employee_id,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
    },
    skip: !user?.employee_id,
  })

  const [clockIn] = useMutation(CLOCK_IN_MUTATION)
  const [clockOut] = useMutation(CLOCK_OUT_MUTATION)

  const todayEntries = timeEntriesData?.timeEntries || []
  const activeEntry = todayEntries.find((entry: any) => entry.status === "active")

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (activeEntry) {
      setIsClocked(true)
      setCurrentEntry(activeEntry)
    } else {
      setIsClocked(false)
      setCurrentEntry(null)
    }
  }, [activeEntry])

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
        },
        (error) => {
          console.error("Error getting location:", error)
        },
      )
    }
  }, [])

  const handleClockIn = async () => {
    try {
      const result = await clockIn({
        variables: {
          employeeId: user?.employee_id,
          locationId: "loc1", // Default location - should be dynamic
        },
      })

      setIsClocked(true)
      setCurrentEntry(result.data.clockIn)

      toast({
        title: "Pointage d'arrivée",
        description: "Vous avez pointé votre arrivée avec succès",
      })

      refetch()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors du pointage d'arrivée",
        variant: "destructive",
      })
    }
  }

  const handleClockOut = async () => {
    if (!currentEntry) return

    try {
      await clockOut({
        variables: {
          timeEntryId: currentEntry.id,
        },
      })

      setIsClocked(false)
      setCurrentEntry(null)

      toast({
        title: "Pointage de départ",
        description: "Vous avez pointé votre départ avec succès",
      })

      refetch()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors du pointage de départ",
        variant: "destructive",
      })
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const calculateWorkingTime = () => {
    if (!currentEntry || !currentEntry.clock_in) return "00:00:00"

    const clockInTime = new Date(currentEntry.clock_in)
    const now = new Date()
    const diff = now.getTime() - clockInTime.getTime()

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  const getTotalHoursToday = () => {
    return todayEntries.reduce((total: number, entry: any) => {
      return total + (entry.total_hours || 0)
    }, 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold">Pointeuse</h1>
        <p className="text-muted-foreground">Gérez vos heures de travail</p>
      </div>

      {/* Current Time Display */}
      <Card className="text-center">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="text-4xl sm:text-6xl font-mono font-bold text-red-600">{formatTime(currentTime)}</div>
            <div className="text-lg text-muted-foreground">{formatDate(currentTime)}</div>
          </div>
        </CardContent>
      </Card>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="w-5 h-5" />
            Statut Actuel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isClocked ? "bg-green-500" : "bg-gray-400"}`}></div>
              <span className="font-medium">{isClocked ? "En service" : "Hors service"}</span>
            </div>
            <Badge variant={isClocked ? "default" : "secondary"}>{isClocked ? "Actif" : "Inactif"}</Badge>
          </div>

          {isClocked && currentEntry && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Arrivée:</span>
                <span className="font-medium">
                  {new Date(currentEntry.clock_in).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Temps de travail:</span>
                <span className="font-mono font-bold text-red-600">{calculateWorkingTime()}</span>
              </div>
            </div>
          )}

          {location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>
                Position: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Clock In/Out Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Button
          onClick={handleClockIn}
          disabled={isClocked}
          size="lg"
          className="h-16 bg-green-600 hover:bg-green-700 disabled:opacity-50"
        >
          <Play className="w-6 h-6 mr-2" />
          Pointer l'arrivée
        </Button>

        <Button
          onClick={handleClockOut}
          disabled={!isClocked}
          size="lg"
          variant="destructive"
          className="h-16 disabled:opacity-50"
        >
          <Square className="w-6 h-6 mr-2" />
          Pointer le départ
        </Button>
      </div>

      {/* Today's Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Résumé du jour
          </CardTitle>
          <CardDescription>{formatDate(new Date())}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{getTotalHoursToday().toFixed(1)}h</div>
              <div className="text-sm text-muted-foreground">Heures travaillées</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {todayEntries.filter((entry: any) => entry.status === "completed").length}
              </div>
              <div className="text-sm text-muted-foreground">Sessions terminées</div>
            </div>
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{isClocked ? "1" : "0"}</div>
              <div className="text-sm text-muted-foreground">Session active</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Entries */}
      {todayEntries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historique du jour</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayEntries.map((entry: any) => (
                <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        entry.status === "active"
                          ? "bg-green-500"
                          : entry.status === "completed"
                            ? "bg-blue-500"
                            : "bg-gray-400"
                      }`}
                    ></div>
                    <div>
                      <div className="font-medium">
                        {new Date(entry.clock_in).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {entry.clock_out && (
                          <>
                            {" "}
                            -{" "}
                            {new Date(entry.clock_out).toLocaleTimeString("fr-FR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {entry.status === "active"
                          ? "En cours"
                          : entry.status === "completed"
                            ? "Terminé"
                            : "Statut inconnu"}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {entry.total_hours
                        ? `${entry.total_hours.toFixed(1)}h`
                        : entry.status === "active"
                          ? calculateWorkingTime()
                          : "-"}
                    </div>
                    <Badge
                      variant={
                        entry.status === "active" ? "default" : entry.status === "completed" ? "secondary" : "outline"
                      }
                    >
                      {entry.status === "active" ? "Actif" : entry.status === "completed" ? "Terminé" : entry.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Location Warning */}
      {!location && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            La géolocalisation n'est pas disponible. Certaines fonctionnalités peuvent être limitées.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
