"use client"

import { useState } from "react"
import { useQuery } from "@apollo/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, Phone, Plus, Search, Eye, Edit, Trash2 } from "lucide-react"
import { GET_LOCATIONS } from "@/lib/graphql-queries"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function LocationsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  const { data, loading, error, refetch } = useQuery(GET_LOCATIONS)

  const filteredLocations =
    data?.locations?.filter(
      (location: any) =>
        location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.address.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || []

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Gestion des Locations</h1>
            <p className="text-muted-foreground">Gérez les différents emplacements du restaurant</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erreur lors du chargement des locations</p>
          <Button onClick={() => refetch()}>Réessayer</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Gestion des Locations</h1>
          <p className="text-muted-foreground">Gérez les différents emplacements du restaurant</p>
        </div>

        <Button className="bg-red-600 hover:bg-red-700 w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Location
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher par nom ou adresse..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{data?.locations?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Locations totales</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">
                  {data?.locations?.reduce((total: number, loc: any) => total + (loc.employees?.length || 0), 0) || 0}
                </p>
                <p className="text-sm text-muted-foreground">Employés totaux</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {data?.locations?.filter((loc: any) => loc.employees?.length > 0).length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Locations actives</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLocations.map((location: any) => (
          <Card key={location.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate">{location.name}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span className="truncate">{location.address}</span>
                  </CardDescription>
                </div>
                <Badge variant={location.employees?.length > 0 ? "default" : "secondary"}>
                  {location.employees?.length > 0 ? "Actif" : "Inactif"}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Contact Info */}
              {location.phone && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>{location.phone}</span>
                </div>
              )}

              {/* Manager Info */}
              {location.manager && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm font-medium">Manager</p>
                  <p className="text-sm text-muted-foreground">
                    {location.manager.profile?.first_name} {location.manager.profile?.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground">@{location.manager.username}</p>
                </div>
              )}

              {/* Employee Count */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Employés</span>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span className="font-medium">{location.employees?.length || 0}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 pt-2">
                <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                  <Link href={`/dashboard/admin/location/${location.id}`}>
                    <Eye className="w-4 h-4 mr-1" />
                    Voir
                  </Link>
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 bg-transparent">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLocations.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucune location trouvée</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? "Aucune location ne correspond à votre recherche."
                : "Commencez par créer votre première location."}
            </p>
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="w-4 h-4 mr-2" />
              Créer une location
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
