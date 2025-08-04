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
      <div className="min-h-screen relative overflow-hidden">
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
                animationDuration: `${6 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>
        <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-3 sm:p-4 lg:p-6 relative z-20 max-w-screen-xl mx-auto">
          <div className="glass-card backdrop-blur-futuristic p-4 sm:p-6 lg:p-8 text-white shadow-2xl animate-fade-in relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-700/30 to-blue-800/20 opacity-50"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] animate-[shimmer_3s_ease-in-out_infinite]"></div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 relative z-10">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">Gestion des Locations</h1>
                <p className="text-slate-200">Gérez les différents emplacements du restaurant</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="glass-card backdrop-blur-futuristic border-0 shadow-2xl animate-pulse">
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
        <style jsx>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900/80 via-purple-900/60 to-slate-900/80">
        <div className="text-center glass-card backdrop-blur-futuristic p-8 rounded-2xl shadow-2xl">
          <p className="text-red-600 mb-4">Erreur lors du chargement des locations</p>
          <Button onClick={() => refetch()}>Réessayer</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Floating particles background (absolute, so sidebar stays visible) */}
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
              animationDuration: `${6 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>
      <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-3 sm:p-4 lg:p-6 relative z-20 max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="glass-card backdrop-blur-futuristic p-4 sm:p-6 lg:p-8 text-white shadow-2xl animate-fade-in relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-700/30 to-blue-800/20 opacity-50"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] animate-[shimmer_3s_ease-in-out_infinite]"></div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 relative z-10">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">Gestion des Locations</h1>
              <p className="text-slate-200">Gérez les différents emplacements du restaurant</p>
            </div>
            <Button className="bg-red-600 hover:bg-red-700 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Location
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="glass-card backdrop-blur-futuristic border-0 shadow-2xl">
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
          <Card className="glass-card backdrop-blur-futuristic border-0 shadow-2xl">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">{data?.locations?.length || 0}</p>
                  <p className="text-sm text-slate-200">Locations totales</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card backdrop-blur-futuristic border-0 shadow-2xl">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {data?.locations?.reduce((total: number, loc: any) => total + (loc.employees?.length || 0), 0) || 0}
                  </p>
                  <p className="text-sm text-slate-200">Employés totaux</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card backdrop-blur-futuristic border-0 shadow-2xl">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {data?.locations?.filter((loc: any) => loc.employees?.length > 0).length || 0}
                  </p>
                  <p className="text-sm text-slate-200">Locations actives</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Locations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLocations.map((location: any) => (
            <Card key={location.id} className="glass-card backdrop-blur-futuristic border-0 shadow-2xl hover:shadow-lg transition-shadow">
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
                  <div className="flex items-center text-sm text-slate-200">
                    <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{location.phone}</span>
                  </div>
                )}

                {/* Manager Info */}
                {location.manager && (
                  <div className="p-3 bg-slate-800/60 rounded-lg">
                    <p className="text-sm font-medium text-white">Manager</p>
                    <p className="text-sm text-slate-200">
                      {location.manager.profile?.first_name} {location.manager.profile?.last_name}
                    </p>
                    <p className="text-xs text-slate-300">@{location.manager.username}</p>
                  </div>
                )}

                {/* Employee Count */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-200">Employés</span>
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
                    <Edit className="w-4 h-4 text-blue-400" />
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
          <Card className="glass-card backdrop-blur-futuristic border-0 shadow-2xl">
            <CardContent className="text-center py-12">
              <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2 text-white">Aucune location trouvée</h3>
              <p className="text-slate-200 mb-4">
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
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}
