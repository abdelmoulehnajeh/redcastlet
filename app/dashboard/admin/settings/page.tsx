"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { useQuery } from "@apollo/client"
import { GET_LOCATIONS, GET_EMPLOYEES } from "@/lib/graphql-queries"
import { MapPin, Users, Building2, Clock, Eye, ChefHat, UserCircle } from "lucide-react"

export default function AdminDashboard() {
  const router = useRouter()

  const { data: locationsData, loading: locationsLoading } = useQuery(GET_LOCATIONS)
  const { data: employeesData, loading: employeesLoading } = useQuery(GET_EMPLOYEES)

  const locations = locationsData?.locations || []
  const employees = employeesData?.employees || []
  const activeEmployees = employees.filter((emp: any) => emp.status === "active").length

  const handleLocationClick = (locationId: string) => {
    router.push(`/dashboard/admin/location/${locationId}`)
  }

  if (locationsLoading || employeesLoading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="bg-gradient-castle rounded-2xl p-6 text-white shadow-elegant">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1">Administration Red Castle</h1>
              <p className="text-white/90 text-sm md:text-base">Gérez vos restaurants et vos équipes</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="dashboard-card">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-12 w-12 bg-gray-200 rounded-xl mb-4"></div>
                  <div className="h-8 w-16 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-castle rounded-2xl p-6 text-white shadow-elegant">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">Administration Red Castle</h1>
            <p className="text-white/90 text-sm md:text-base">Gérez vos restaurants et vos équipes</p>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{locations.length}</p>
                <p className="text-sm text-muted-foreground">Restaurants</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-restaurant-green/10 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-restaurant-green" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{employees.length}</p>
                <p className="text-sm text-muted-foreground">Employés Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-restaurant-red/10 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-restaurant-red" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{activeEmployees}</p>
                <p className="text-sm text-muted-foreground">En Service</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Locations */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Restaurants & Équipes
          </CardTitle>
          <CardDescription>Cliquez sur un restaurant pour voir ses employés</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {locations.map((location: any) => {
              const locationEmployees = employees.filter((emp: any) => emp.location?.id === location.id)
              const activeLocationEmployees = locationEmployees.filter((emp: any) => emp.status === "active")

              return (
                <div
                  key={location.id}
                  className="border border-border rounded-xl p-6 hover:bg-accent/50 transition-colors cursor-pointer group"
                  onClick={() => handleLocationClick(location.id)}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-gradient-castle rounded-xl flex items-center justify-center">
                        <ChefHat className="w-6 h-6 text-white" />
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {locationEmployees.length} employés
                      </Badge>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
                        {location.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {activeLocationEmployees.length} actifs •{" "}
                        {locationEmployees.length - activeLocationEmployees.length} inactifs
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3 mr-1" />
                        {location.address}
                      </div>
                      {location.manager && (
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <UserCircle className="w-3 h-3 mr-1" />
                          Manager: {location.manager.profile?.first_name} {location.manager.profile?.last_name}
                        </div>
                      )}
                    </div>

                    <Button
                      className="w-full btn-restaurant group-hover:shadow-soft transition-all"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleLocationClick(location.id)
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Voir les Employés
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>

          {locations.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">Aucun restaurant trouvé</h3>
              <p className="text-sm text-muted-foreground">Ajoutez votre premier restaurant pour commencer</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Activité Récente
          </CardTitle>
          <CardDescription>Dernières actions dans le système</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {employees.slice(0, 5).map((employee: any, index: number) => (
              <div
                key={employee.id}
                className="flex items-center space-x-4 p-3 rounded-lg hover:bg-accent/50 transition-colors"
              >
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-gradient-castle text-white text-sm">
                    {employee.nom?.charAt(0)}
                    {employee.prenom?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {employee.nom} {employee.prenom}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {employee.job_title} • {employee.location?.name}
                  </p>
                </div>
                <Badge variant={employee.status === "active" ? "default" : "secondary"} className="text-xs">
                  {employee.status === "active" ? "Actif" : "Inactif"}
                </Badge>
              </div>
            ))}

            {employees.length === 0 && (
              <div className="text-center py-8">
                <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Aucune activité récente</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
