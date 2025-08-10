"use client"

import { useEffect, useMemo, useState } from "react"
import { useQuery } from "@apollo/client"
import Link from "next/link"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, Phone, Plus, Search, Eye, Edit, Trash2 } from 'lucide-react'

import { GET_LOCATIONS } from "@/lib/graphql-queries"

type Lang = "fr" | "ar"

type Dict = {
  // header
  pageTitle: string
  pageSubtitle: string
  newLocation: string
  // search
  searchPlaceholder: string
  // stats
  statsTotal: string
  statsEmployees: string
  statsActive: string
  // card
  active: string
  inactive: string
  manager: string
  employees: string
  view: string
  // loading / error
  loadingTitle: string
  errorLoading: string
  retry: string
  // empty
  emptyTitle: string
  emptyDescSearch: string
  emptyDescNoSearch: string
  createLocation: string
}

const translations: Record<Lang, Dict> = {
  fr: {
    pageTitle: "Gestion des Restaurants",
    pageSubtitle: "Gérez les différents emplacements du restaurant",
    newLocation: "Nouvelle Location",
    searchPlaceholder: "Rechercher par nom ou adresse...",
    statsTotal: "Restaurants totaux",
    statsEmployees: "Employés totaux",
    statsActive: "Restaurants actifs",
    active: "Actif",
    inactive: "Inactif",
    manager: "Manager",
    employees: "Employés",
    view: "Voir",
    loadingTitle: "Chargement...",
    errorLoading: "Erreur lors du chargement des restaurants",
    retry: "Réessayer",
    emptyTitle: "Aucun restaurant trouvé",
    emptyDescSearch: "Aucun restaurant ne correspond à votre recherche.",
    emptyDescNoSearch: "Commencez par créer votre premier restaurant.",
    createLocation: "Créer un restaurant",
  },
  ar: {
    pageTitle: "إدارة الفروع",
    pageSubtitle: "إدارة مواقع/فروع المطعم",
    newLocation: "فرع جديد",
    searchPlaceholder: "ابحث بالاسم أو العنوان...",
    statsTotal: "إجمالي الفروع",
    statsEmployees: "إجمالي الموظفين",
    statsActive: "الفروع النشطة",
    active: "نشط",
    inactive: "غير نشط",
    manager: "المدير",
    employees: "الموظفون",
    view: "عرض",
    loadingTitle: "جارٍ التحميل...",
    errorLoading: "خطأ أثناء تحميل الفروع",
    retry: "إعادة المحاولة",
    emptyTitle: "لا توجد فروع",
    emptyDescSearch: "لا توجد نتائج مطابقة لبحثك.",
    emptyDescNoSearch: "ابدأ بإنشاء أول فرع لك.",
    createLocation: "إنشاء فرع",
  },
}

function useLang(): Lang {
  const [lang, setLang] = useState<Lang>("fr")
  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = localStorage.getItem("lang")
    if (stored === "ar" || stored === "fr") setLang(stored)
    else {
      localStorage.setItem("lang", "fr")
      setLang("fr")
    }
  }, [])
  useEffect(() => {
    if (typeof document === "undefined") return
    document.documentElement.setAttribute("lang", lang)
    document.documentElement.setAttribute("dir", "ltr")
  }, [lang])
  return lang
}

export default function LocationsPage() {
  const lang = useLang()
  const t = translations[lang]
  const locale = lang === "ar" ? "ar" : "fr-FR"

  const [searchTerm, setSearchTerm] = useState("")
  const { data, loading, error, refetch } = useQuery(GET_LOCATIONS)

  const locations = data?.locations || []

  const filteredLocations =
    locations.filter(
      (location: any) =>
        (location.name || "")
          .toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (location.address || "")
          .toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    ) || []

  // numbers localized
  const fmt = (n: number) => n.toLocaleString(locale)

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden" dir="ltr">
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
          <div className="glass-card backdrop-blur-futuristic p-4 sm:p-6 lg:p-8 text-white shadow-2xl animate-fade-in relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-700/30 to-blue-800/20 opacity-50"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] animate-[shimmer_3s_ease-in-out_infinite]"></div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 relative z-10">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent" dir="auto">
                  {t.pageTitle}
                </h1>
                <p className="text-slate-200" dir="auto">
                  {t.pageSubtitle}
                </p>
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900/80 via-purple-900/60 to-slate-900/80" dir="ltr">
        <div className="text-center glass-card backdrop-blur-futuristic p-8 rounded-2xl shadow-2xl">
          <p className="text-red-600 mb-4" dir="auto">
            {t.errorLoading}
          </p>
          <Button onClick={() => refetch()}>
            {t.retry}
          </Button>
        </div>
      </div>
    )
  }

  const totalEmployees =
    locations.reduce((total: number, loc: any) => total + (loc.employees?.length || 0), 0) || 0
  const activeLocations = locations.filter((loc: any) => (loc.employees?.length || 0) > 0).length || 0

  return (
    <div className="min-h-screen relative overflow-hidden" dir="ltr">
      {/* Floating particles background */}
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 relative z-10">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent" dir="auto">
                {t.pageTitle}
              </h1>
              <p className="text-slate-200" dir="auto">
                {t.pageSubtitle}
              </p>
            </div>
            <Button className="bg-red-600 hover:bg-red-700 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              <span dir="auto">{t.newLocation}</span>
            </Button>
          </div>
        </div>

        {/* Search */}
        <Card className="glass-card backdrop-blur-futuristic border-0 shadow-2xl">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={t.searchPlaceholder}
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
                  <p className="text-2xl font-bold">{fmt(locations.length)}</p>
                  <p className="text-sm text-slate-200" dir="auto">
                    {t.statsTotal}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card backdrop-blur-futuristic border-0 shadow-2xl">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{fmt(totalEmployees)}</p>
                  <p className="text-sm text-slate-200" dir="auto">
                    {t.statsEmployees}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card backdrop-blur-futuristic border-0 shadow-2xl">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{fmt(activeLocations)}</p>
                  <p className="text-sm text-slate-200" dir="auto">
                    {t.statsActive}
                  </p>
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
                    <CardTitle className="text-lg truncate" dir="auto">{location.name}</CardTitle>
                    <CardDescription className="flex items-center mt-1" dir="auto">
                      <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span className="truncate">{location.address}</span>
                    </CardDescription>
                  </div>
                  <Badge variant={(location.employees?.length || 0) > 0 ? "default" : "secondary"}>
                    {((location.employees?.length || 0) > 0) ? t.active : t.inactive}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Contact Info */}
                {location.phone && (
                  <div className="flex items-center text-sm text-slate-200">
                    <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span dir="auto">{location.phone}</span>
                  </div>
                )}

                {/* Manager Info */}
                {location.manager && (
                  <div className="p-3 bg-slate-800/60 rounded-lg">
                    <p className="text-sm font-medium text-white" dir="auto">{t.manager}</p>
                    <p className="text-sm text-slate-200" dir="auto">
                      {location.manager.profile?.first_name} {location.manager.profile?.last_name}
                    </p>
                    <p className="text-xs text-slate-300">@{location.manager.username}</p>
                  </div>
                )}

                {/* Employee Count */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-200" dir="auto">{t.employees}</span>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span className="font-medium">{fmt(location.employees?.length || 0)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Link href={`/dashboard/admin/location/${location.id}`}>
                      <Eye className="w-4 h-4 mr-1" />
                      <span dir="auto">{t.view}</span>
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

        {/* Empty state */}
        {filteredLocations.length === 0 && (
          <Card className="glass-card backdrop-blur-futuristic border-0 shadow-2xl">
            <CardContent className="text-center py-12">
              <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2 text-white" dir="auto">{t.emptyTitle}</h3>
              <p className="text-slate-200 mb-4" dir="auto">
                {searchTerm ? t.emptyDescSearch : t.emptyDescNoSearch}
              </p>
              <Button className="bg-red-600 hover:bg-red-700">
                <Plus className="w-4 h-4 mr-2" />
                <span dir="auto">{t.createLocation}</span>
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
