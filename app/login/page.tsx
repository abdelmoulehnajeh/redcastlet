"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChefHat, Eye, EyeOff, Loader2, Shield, Star, Zap } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useMutation } from "@apollo/client"
import { LOGIN_MUTATION } from "@/lib/graphql-queries"
import { toast } from "sonner"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isHovered, setIsHovered] = useState(false)

  const { user, login, isLoading } = useAuth()
  const router = useRouter()
  const [loginMutation, { loading }] = useMutation(LOGIN_MUTATION, {
    errorPolicy: "all",
  })

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard")
    }
  }, [user, isLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      console.log("Attempting login with:", { username, password })

      const { data, errors } = await loginMutation({
        variables: { username, password },
      })

      console.log("Login response:", { data, errors })

      if (errors) {
        console.error("GraphQL errors:", errors)
        setError(errors[0]?.message || "Erreur de connexion")
        return
      }

      if (data?.login) {
        login({
          id: data.login.id,
          username: data.login.username,
          role: data.login.role,
          employee_id: data.login.employee_id,
        })

        toast.success(`Bienvenue ${data.login.username}!`)
        router.push("/dashboard")
      } else {
        setError("Nom d'utilisateur ou mot de passe incorrect")
      }
    } catch (error: any) {
      console.error("Login error:", error)
      setError(error.message || "Erreur de connexion. Veuillez réessayer.")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(120,119,198,0.3),transparent)] animate-pulse"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(236,72,153,0.3),transparent)] animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        
        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-30 animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 6}s`,
                animationDuration: `${4 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>

        {/* Loading spinner */}
        <div className="relative z-10 flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-500/30 rounded-full animate-spin border-t-blue-500"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-purple-500/30 rounded-full animate-spin border-t-purple-500" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
          </div>
          <div className="text-white/80 text-lg font-medium animate-pulse">Chargement...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      {/* Dynamic animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(120,119,198,0.3),transparent)] animate-pulse"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(236,72,153,0.3),transparent)] animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.2),transparent)] animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Floating geometric shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-32 h-32 border border-blue-500/20 rounded-full animate-float"></div>
        <div className="absolute top-40 right-32 w-24 h-24 border border-purple-500/20 rotate-45 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-32 left-40 w-20 h-20 border border-pink-500/20 rounded-full animate-float" style={{animationDelay: '4s'}}></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 border border-cyan-500/20 rotate-12 animate-float" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-40 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${6 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Main login card */}
      <div className="relative z-10 w-full max-w-md">
        <Card 
          className="glass-card backdrop-blur-futuristic border-0 shadow-2xl transform transition-all duration-500 hover:scale-105 animate-fade-in"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Glowing border effect */}
          <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-sm transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}></div>
          
          <CardHeader className="text-center space-y-6 relative z-10 pt-8">
            {/* Logo with enhanced effects */}
            <div className="relative mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-3xl flex items-center justify-center shadow-2xl transform transition-all duration-500 hover:rotate-12 hover:scale-110 animate-glow">
                <ChefHat className="w-10 h-10 text-white drop-shadow-lg" />
                
                {/* Floating icons around logo */}
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-float">
                  <Star className="w-3 h-3 text-white" />
                </div>
                <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center animate-float" style={{animationDelay: '1s'}}>
                  <Zap className="w-3 h-3 text-white" />
                </div>
                <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center animate-float" style={{animationDelay: '2s'}}>
                  <Shield className="w-3 h-3 text-white" />
                </div>
              </div>
              
              {/* Pulsing rings */}
              <div className="absolute inset-0 rounded-full border-2 border-red-500/30 animate-ping"></div>
              <div className="absolute inset-0 rounded-full border border-red-400/20 scale-125 animate-pulse"></div>
            </div>

            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                Red Castle
              </CardTitle>
              <CardDescription className="text-slate-300 text-lg font-medium">
                Système de Gestion Restaurant
              </CardDescription>
              <div className="text-slate-400 text-sm">
                Connexion sécurisée • Interface moderne
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 relative z-10 px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert className="bg-red-500/10 border-red-500/30 backdrop-blur-sm animate-fade-in">
                  <AlertDescription className="text-red-300">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                <Label htmlFor="username" className="text-slate-200 font-medium text-sm">
                  Nom d'utilisateur
                </Label>
                <div className="relative group">
                  <Input
                    id="username"
                    type="text"
                    placeholder="Entrez votre nom d'utilisateur"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={loading}
                    className="h-12 bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 rounded-xl"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-focus-within:from-blue-500/10 group-focus-within:via-purple-500/10 group-focus-within:to-pink-500/10 transition-all duration-500 pointer-events-none"></div>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="password" className="text-slate-200 font-medium text-sm">
                  Mot de passe
                </Label>
                <div className="relative group">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Entrez votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="h-12 bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 rounded-xl pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-slate-700/50 transition-all duration-300 rounded-r-xl"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-slate-400 hover:text-slate-200 transition-colors" />
                    ) : (
                      <Eye className="h-4 w-4 text-slate-400 hover:text-slate-200 transition-colors" />
                    )}
                  </Button>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-focus-within:from-blue-500/10 group-focus-within:via-purple-500/10 group-focus-within:to-pink-500/10 transition-all duration-500 pointer-events-none"></div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-14 bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-700 hover:via-red-800 hover:to-red-900 text-white font-semibold text-lg shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-red-500/25 rounded-xl border-0 relative overflow-hidden group"
                disabled={loading}
              >
                {/* Button background animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-400/20 to-red-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                
                <div className="relative z-10 flex items-center justify-center">
                  {loading ? (
                    <>
                      <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                      Connexion en cours...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-3 h-5 w-5" />
                      Se connecter
                    </>
                  )}
                </div>
              </Button>
            </form>

            {/* Enhanced demo credentials */}
            <div className="mt-8 p-6 bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <h3 className="text-sm font-semibold text-slate-200">Comptes de démonstration</h3>
              </div>
              
              <div className="grid gap-3">
                <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl border border-slate-600/30 hover:border-blue-500/30 transition-all duration-300 group">
                  <div>
                    <div className="text-sm font-medium text-blue-300 group-hover:text-blue-200">Admin</div>
                    <div className="text-xs text-slate-400">admin / admin123</div>
                  </div>
                  <Shield className="w-4 h-4 text-blue-400 opacity-50 group-hover:opacity-100 transition-all" />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl border border-slate-600/30 hover:border-purple-500/30 transition-all duration-300 group">
                  <div>
                    <div className="text-sm font-medium text-purple-300 group-hover:text-purple-200">Manager</div>
                    <div className="text-xs text-slate-400">manager1 / manager123</div>
                  </div>
                  <Star className="w-4 h-4 text-purple-400 opacity-50 group-hover:opacity-100 transition-all" />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl border border-slate-600/30 hover:border-green-500/30 transition-all duration-300 group">
                  <div>
                    <div className="text-sm font-medium text-green-300 group-hover:text-green-200">Employé</div>
                    <div className="text-xs text-slate-400">jean.dupont / employee123</div>
                  </div>
                  <Zap className="w-4 h-4 text-green-400 opacity-50 group-hover:opacity-100 transition-all" />
                </div>
              </div>
            </div>

            {/* Footer info */}
            <div className="text-center pt-4">
              <div className="text-xs text-slate-500">
                Sécurisé par Red Castle Technology
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional floating elements */}
      <div className="absolute top-10 right-10 w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-30 animate-float hidden md:block"></div>
      <div className="absolute bottom-10 left-10 w-4 h-4 bg-gradient-to-br from-pink-400 to-red-500 rounded-full opacity-30 animate-float hidden md:block" style={{animationDelay: '3s'}}></div>
    </div>
  )
}