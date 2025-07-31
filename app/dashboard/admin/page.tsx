"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line } from "recharts"
import { Users, MapPin, DollarSign, TrendingUp, Clock, CheckSquare, Building2, UserCheck, Calendar, Star, Zap, Shield, Activity } from "lucide-react"
import Link from "next/link"

const revenueData = [
  { month: "Jan", revenue: 125000, employees: 45 },
  { month: "Fév", revenue: 132000, employees: 47 },
  { month: "Mar", revenue: 128000, employees: 46 },
  { month: "Avr", revenue: 145000, employees: 48 },
  { month: "Mai", revenue: 138000, employees: 49 },
  { month: "Jun", revenue: 152000, employees: 52 },
]

const locationData = [
  { name: "Red Castle Cuisine Centrale", employees: 18, revenue: 65000, status: "active" },
  { name: "Red Castle El Manzah", employees: 15, revenue: 48000, status: "active" },
  { name: "Red Castle Lauina", employees: 19, revenue: 39000, status: "active" },
]

const recentActivities = [
  {
    title: "Nouvelle demande de congé",
    description: "Marie Martin - Congé maladie",
    time: "Il y a 2h",
    type: "leave",
    urgent: true,
  },
  {
    title: "Salaire approuvé",
    description: "Jean Dupont - 2,850€",
    time: "Il y a 4h",
    type: "finance",
    urgent: false,
  },
  {
    title: "Nouvel employé ajouté",
    description: "Sophie Bernard - Red Castle Lauina",
    time: "Il y a 6h",
    type: "employee",
    urgent: false,
  },
  {
    title: "Planning modifié",
    description: "Équipe du soir - Red Castle El Manzah",
    time: "Il y a 8h",
    type: "schedule",
    urgent: false,
  },
]

export default function AdminDashboard() {
  const totalEmployees = locationData.reduce((sum, loc) => sum + loc.employees, 0)
  const totalRevenue = locationData.reduce((sum, loc) => sum + loc.revenue, 0)
  const pendingApprovals = 8
  const activeLocations = locationData.filter((loc) => loc.status === "active").length

  const stats = [
    {
      title: "Total Employés",
      value: totalEmployees.toString(),
      description: "Tous restaurants",
      icon: Users,
      color: "text-blue-400",
      bgColor: "from-blue-500/20 to-cyan-500/20",
      trend: "+12%",
      link: "/dashboard/admin/employees",
    },
    {
      title: "Restaurants Actifs",
      value: activeLocations.toString(),
      description: "Locations ouvertes",
      icon: MapPin,
      color: "text-green-400",
      bgColor: "from-green-500/20 to-emerald-500/20",
      trend: "100%",
      link: "/dashboard/admin/locations",
    },
    {
      title: "Chiffre d'Affaires",
      value: `${(totalRevenue / 1000).toFixed(0)}K€`,
      description: "Ce mois",
      icon: DollarSign,
      color: "text-yellow-400",
      bgColor: "from-yellow-500/20 to-orange-500/20",
      trend: "+8.2%",
      link: "/dashboard/admin/finance",
    },
    {
      title: "Approbations",
      value: pendingApprovals.toString(),
      description: "En attente",
      icon: CheckSquare,
      color: "text-red-400",
      bgColor: "from-red-500/20 to-pink-500/20",
      trend: "Urgent",
      link: "/dashboard/admin/approvals",
    },
  ]

  return (
    <div className="min-h-screen relative overflow-hidden">
   
      <div>
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

      <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-3 sm:p-4 lg:p-6 relative z-10">
        {/* Enhanced Header */}
        <div className="glass-card backdrop-blur-futuristic p-4 sm:p-6 lg:p-8 text-white shadow-2xl transform hover:scale-[1.01] transition-all duration-500 animate-fade-in relative overflow-hidden">
          {/* Header background animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-red-700/30 to-red-800/20 opacity-50"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] animate-[shimmer_3s_ease-in-out_infinite]"></div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 lg:space-x-6 relative z-10">
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-2xl animate-glow">
                <Building2 className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white drop-shadow-lg" />
              </div>
              
              {/* Floating status indicators */}
              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center animate-float">
                <Activity className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
              </div>
              <div className="absolute -bottom-1 -left-1 sm:-bottom-2 sm:-left-2 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center animate-float" style={{animationDelay: '1s'}}>
                <Shield className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent leading-tight">
                Administration Red Castle
              </h1>
              <p className="text-slate-200 text-sm sm:text-base lg:text-lg font-medium">
                Tableau de bord administrateur - Vue d'ensemble
              </p>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs sm:text-sm text-slate-300">Système actif</span>
                </div>
                <div className="text-xs sm:text-sm text-slate-400 hidden sm:block">•</div>
                <div className="text-xs sm:text-sm text-slate-300">Dernière mise à jour: maintenant</div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {stats.map((stat, index) => (
            <Link key={index} href={stat.link}>
              <Card className="glass-card backdrop-blur-futuristic border-0 shadow-2xl transform transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer group relative overflow-hidden">
                {/* Card background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} opacity-50 group-hover:opacity-70 transition-opacity duration-500`}></div>
                
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                
                <CardContent className="p-4 sm:p-5 lg:p-6 relative z-10">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div className="relative">
                      <div className={`w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-lg lg:rounded-xl flex items-center justify-center bg-gradient-to-br from-slate-700/50 to-slate-800/50 backdrop-blur-sm border border-white/10 group-hover:scale-110 transition-transform duration-300`}>
                        <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color} drop-shadow-lg`} />
                      </div>
                      
                      {/* Pulsing ring */}
                      <div className="absolute inset-0 rounded-lg lg:rounded-xl border-2 border-current opacity-20 animate-ping" style={{color: stat.color.replace('text-', '')}}></div>
                    </div>
                    
                    <Badge 
                      variant={stat.trend === "Urgent" ? "destructive" : "default"}
                      className={`${stat.trend === "Urgent" ? 'bg-red-500/20 text-red-300 border-red-500/30' : 'bg-green-500/20 text-green-300 border-green-500/30'} backdrop-blur-sm font-semibold text-xs sm:text-sm px-2 py-1`}
                    >
                      {stat.trend}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 sm:space-y-2">
                    <div className="text-2xl sm:text-3xl font-bold text-white mb-1 group-hover:scale-105 transition-transform duration-300">
                      {stat.value}
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-slate-200">{stat.title}</div>
                    <div className="text-xs text-slate-400">{stat.description}</div>
                  </div>
                  
                  {/* Hover indicator */}
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Enhanced Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          <Card className="glass-card backdrop-blur-futuristic border-0 shadow-2xl transform hover:scale-[1.02] transition-all duration-500 relative overflow-hidden">
            {/* Chart background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-transparent"></div>
            
            <CardHeader className="relative z-10 p-4 sm:p-5 lg:p-6">
              <CardTitle className="flex items-center text-white text-lg sm:text-xl">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <span className="truncate">Performance Globale</span>
              </CardTitle>
              <CardDescription className="text-slate-300 text-xs sm:text-sm">
                Évolution du chiffre d'affaires et des effectifs
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 p-4 sm:p-5 lg:p-6 pt-0">
              <ChartContainer
                config={{
                  revenue: {
                    label: "Chiffre d'affaires",
                    color: "#3b82f6",
                  },
                  employees: {
                    label: "Employés",
                    color: "#8b5cf6",
                  },
                }}
                className="h-[250px] sm:h-[300px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      contentStyle={{
                        backgroundColor: 'rgba(30, 41, 59, 0.95)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        backdropFilter: 'blur(16px)',
                        color: '#ffffff',
                        fontSize: '12px'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: "#3b82f6", strokeWidth: 2, stroke: "#ffffff" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="employees"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5, fill: "#8b5cf6", strokeWidth: 2, stroke: "#ffffff" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="glass-card backdrop-blur-futuristic border-0 shadow-2xl transform hover:scale-[1.02] transition-all duration-500 relative overflow-hidden">
            {/* Chart background */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-transparent"></div>
            
            <CardHeader className="relative z-10 p-4 sm:p-5 lg:p-6">
              <CardTitle className="flex items-center text-white text-lg sm:text-xl">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <span className="truncate">Performance par Restaurant</span>
              </CardTitle>
              <CardDescription className="text-slate-300 text-xs sm:text-sm">
                Chiffre d'affaires mensuel par location
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 p-4 sm:p-5 lg:p-6 pt-0">
              <ChartContainer
                config={{
                  revenue: {
                    label: "Revenue",
                    color: "#10b981",
                  },
                }}
                className="h-[250px] sm:h-[300px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={locationData} layout="horizontal" margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                    <YAxis dataKey="name" type="category" width={100} stroke="#94a3b8" fontSize={10} />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      contentStyle={{
                        backgroundColor: 'rgba(30, 41, 59, 0.95)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        backdropFilter: 'blur(16px)',
                        color: '#ffffff',
                        fontSize: '12px'
                      }}
                    />
                    <Bar 
                      dataKey="revenue" 
                      fill="#10b981" 
                      radius={[0, 6, 6, 0]}
                      className="hover:opacity-80 transition-opacity duration-300"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Restaurants Overview */}
        <Card className="glass-card backdrop-blur-futuristic border-0 shadow-2xl transform hover:scale-[1.01] transition-all duration-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-transparent"></div>
          
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center text-white text-2xl">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-4">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              Gestion des Restaurants
            </CardTitle>
            <CardDescription className="text-slate-300 text-base">
              Vue d'ensemble de tous les restaurants Red Castle
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {locationData.map((location, index) => (
                <Link key={index} href={`/dashboard/admin/location/${index + 1}`}>
                  <div className="glass-card backdrop-blur-futuristic p-6 hover:scale-105 transition-all duration-500 cursor-pointer group relative overflow-hidden border-0">
                    {/* Location card background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-700/30 to-slate-800/30 group-hover:from-slate-600/40 group-hover:to-slate-700/40 transition-all duration-500"></div>
                    
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-6">
                        <div className="relative">
                          <div className="w-14 h-14 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <Building2 className="w-7 h-7 text-white drop-shadow-lg" />
                          </div>
                          
                          {/* Status indicator */}
                          <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                        </div>
                        
                        <Badge className="bg-green-500/20 text-green-300 border-green-500/30 backdrop-blur-sm font-semibold text-xs sm:text-sm">
                          Actif
                        </Badge>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 group-hover:text-blue-300 transition-colors duration-300 line-clamp-2">
                        {location.name}
                      </h3>

                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center justify-between p-2 sm:p-3 bg-slate-700/30 rounded-lg backdrop-blur-sm">
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                              <Users className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                            </div>
                            <span className="text-xs sm:text-sm text-slate-300 font-medium">Employés</span>
                          </div>
                          <span className="font-bold text-white text-sm sm:text-lg">{location.employees}</span>
                        </div>

                        <div className="flex items-center justify-between p-2 sm:p-3 bg-slate-700/30 rounded-lg backdrop-blur-sm">
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                              <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                            </div>
                            <span className="text-xs sm:text-sm text-slate-300 font-medium">CA Mensuel</span>
                          </div>
                          <span className="font-bold text-white text-sm sm:text-lg">{(location.revenue / 1000).toFixed(0)}K€</span>
                        </div>

                        <div className="pt-2">
                          <div className="flex justify-between text-xs sm:text-sm mb-2">
                            <span className="text-slate-300 font-medium">Performance</span>
                            <span className="text-white font-bold">{Math.round((location.revenue / 65000) * 100)}%</span>
                          </div>
                          <div className="relative">
                            <Progress 
                              value={(location.revenue / 65000) * 100} 
                              className="h-2 sm:h-3 bg-slate-700/50"
                            />
                            <div 
                              className="absolute top-0 left-0 h-2 sm:h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-1000 animate-pulse"
                              style={{width: `${(location.revenue / 65000) * 100}%`}}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Recent Activities */}
        <Card className="glass-card backdrop-blur-futuristic border-0 shadow-2xl transform hover:scale-[1.01] transition-all duration-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-red-500/10 to-transparent"></div>
          
          <CardHeader className="relative z-10 p-4 sm:p-5 lg:p-6">
            <CardTitle className="flex items-center text-white text-lg sm:text-xl lg:text-2xl">
              <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg lg:rounded-xl flex items-center justify-center mr-3 lg:mr-4">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="truncate">Activités Récentes</span>
            </CardTitle>
            <CardDescription className="text-slate-300 text-sm sm:text-base">
              Dernières actions nécessitant votre attention
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10 p-4 sm:p-5 lg:p-6 pt-0">
            <div className="space-y-3 sm:space-y-4">
              {recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="glass-card backdrop-blur-sm p-3 sm:p-4 hover:scale-[1.02] transition-all duration-300 group cursor-pointer border-0 relative overflow-hidden"
                >
                  {/* Activity background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-700/20 to-slate-800/20 group-hover:from-slate-600/30 group-hover:to-slate-700/30 transition-all duration-300"></div>
                  
                  <div className="flex items-start space-x-3 sm:space-x-4 relative z-10">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg lg:rounded-xl flex items-center justify-center backdrop-blur-sm border transition-all duration-300 group-hover:scale-110 flex-shrink-0 ${
                        activity.type === "leave"
                          ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                          : activity.type === "finance"
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : activity.type === "employee"
                              ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                              : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                      }`}
                    >
                      {activity.type === "leave" && <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />}
                      {activity.type === "finance" && <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />}
                      {activity.type === "employee" && <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" />}
                      {activity.type === "schedule" && <Clock className="w-4 h-4 sm:w-5 sm:h-5" />}
                      
                      {/* Icon glow effect */}
                      <div className="absolute inset-0 rounded-lg lg:rounded-xl animate-pulse opacity-20 bg-current"></div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3 mb-1">
                        <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-blue-300 transition-colors duration-300 line-clamp-1">
                          {activity.title}
                        </h4>
                        {activity.urgent && (
                          <Badge className="bg-red-500/20 text-red-300 border-red-500/30 backdrop-blur-sm text-xs font-bold animate-pulse self-start sm:self-center">
                            Urgent
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-xs sm:text-sm text-slate-300 font-medium mb-1 line-clamp-2">{activity.description}</p>
                      <p className="text-xs text-slate-400">{activity.time}</p>
                    </div>
                    
                    {/* Activity status indicator */}
                    <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0 self-center ${activity.urgent ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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