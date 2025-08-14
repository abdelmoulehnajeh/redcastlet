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
import ElegantLanguageSelect from "@/components/BeautifulLanguageSelect"

// Define types for particles
interface Particle {
  id: number
  left: string
  top: string
  animationDelay: string
  animationDuration: string
}

export default function LoginPage() {
  // Translations for French and Arabic
  // Language selection state
  const [lang, setLang] = useState<"fr" | "ar">("fr")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")

  // Translations for French and Arabic
  const translations: Record<"fr" | "ar", {
    appName: string;
    system: string;
    secureModern: string;
    username: string;
    usernamePlaceholder: string;
    password: string;
    passwordPlaceholder: string;
    login: string;
    loggingIn: string;
    demoAccounts: string;
    admin: string;
    manager: string;
    employee: string;
    adminCreds: string;
    managerCreds: string;
    employeeCreds: string;
    securedBy: string;
    errorWrong: string;
    errorLogin: string;
    french: string;
    arabic: string;
  }> = {
    fr: {
      appName: "Red Castle",
      system: "Système de Gestion Restaurant",
      secureModern: "Connexion sécurisée • Interface moderne",
      username: "Nom d'utilisateur",
      usernamePlaceholder: "Entrez votre nom d'utilisateur",
      password: "Mot de passe",
      passwordPlaceholder: "Entrez votre mot de passe",
      login: "Se connecter",
      loggingIn: "Connexion en cours...",
      demoAccounts: "Comptes de démonstration",
      admin: "Admin",
      manager: "Manager",
      employee: "Employé",
      adminCreds: "admin / admin123",
      managerCreds: "manager1 / manager123",
      employeeCreds: "jean.dupont / employee123",
      securedBy: "Sécurisé par Red Castle Technology",
      errorWrong: "Nom d'utilisateur ou mot de passe incorrect",
      errorLogin: "Erreur de connexion. Veuillez réessayer.",
      french: "Français",
      arabic: "العربية"
    },
    ar: {
      appName: "Red Castle",
      system: "نظام إدارة المطعم",
      secureModern: "اتصال آمن • واجهة حديثة",
      username: "اسم المستخدم",
      usernamePlaceholder: "أدخل اسم المستخدم",
      password: "كلمة المرور",
      passwordPlaceholder: "أدخل كلمة المرور",
      login: "تسجيل الدخول",
      loggingIn: "جاري تسجيل الدخول...",
      demoAccounts: "حسابات تجريبية",
      admin: "مدير النظام",
      manager: "مدير",
      employee: "موظف",
      adminCreds: "admin / admin123",
      managerCreds: "manager1 / manager123",
      employeeCreds: "jean.dupont / employee123",
      securedBy: "محمي بواسطة تقنية ريد كاستل",
      errorWrong: "اسم المستخدم أو كلمة ��لمرور غير صحيحة",
      errorLogin: "حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.",
      french: "فرنسي",
      arabic: "العربية"
    }
  }

  const t = translations[lang]
  const [isHovered, setIsHovered] = useState(false)

  // State for particles to avoid hydration mismatch
  const [particles, setParticles] = useState<Particle[]>([])
  const [floatingParticles, setFloatingParticles] = useState<Particle[]>([])
  const [isMounted, setIsMounted] = useState(false)

  const { user, login, isLoading } = useAuth()
  const router = useRouter()
  const [loginMutation, { loading }] = useMutation(LOGIN_MUTATION, {
    errorPolicy: "all",
  })

  // Load language from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedLang = localStorage.getItem("lang")
      if (storedLang === "ar" || storedLang === "fr") {
        setLang(storedLang)
      } else {
        localStorage.setItem("lang", "fr")
        setLang("fr")
      }
    }
  }, [])

  // Handle language change
  const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLang = e.target.value as "fr" | "ar"
    setLang(selectedLang)
    if (typeof window !== "undefined") {
      localStorage.setItem("lang", selectedLang)
    }
  }

  // Generate particles only on client side
  useEffect(() => {
    setIsMounted(true)

    // Generate loading screen particles
    const loadingParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 6}s`,
      animationDuration: `${4 + Math.random() * 4}s`
    }))

    // Generate main screen floating particles
    const mainParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 6}s`,
      animationDuration: `${6 + Math.random() * 4}s`
    }))

    setParticles(loadingParticles)
    setFloatingParticles(mainParticles)
  }, [])

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard")
    }
  }, [user, isLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      const { data, errors } = await loginMutation({
        variables: { username, password },
      })

      if (errors) {
        setError(errors[0]?.message || t.errorLogin)
        return
      }

      if (data?.login) {
        login({
          id: data.login.id,
          username: data.login.username,
          role: data.login.role,
          employee_id: data.login.employee_id,
          location_id: data.login.location_id, 
        })

        toast.success(`${lang === "ar" ? "مرحباً" : "Bienvenue"} ${data.login.username}!`)
        router.push("/dashboard")
      } else {
        setError(t.errorWrong)
      }
    } catch (error: any) {
      setError(error.message || t.errorLogin)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(120,119,198,0.3),transparent)] animate-pulse"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(236,72,153,0.3),transparent)] animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Floating particles - only render when mounted */}
        {isMounted && (
          <div className="absolute inset-0">
            {particles.map((particle) => (
              <div
                key={particle.id}
                className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-30 animate-float"
                style={{
                  left: particle.left,
                  top: particle.top,
                  animationDelay: particle.animationDelay,
                  animationDuration: particle.animationDuration
                }}
              />
            ))}
          </div>
        )}

        {/* Loading spinner */}
        <div className="relative z-10 flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-500/30 rounded-full animate-spin border-t-blue-500"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-purple-500/30 rounded-full animate-spin border-t-purple-500" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <div className="text-white/80 text-lg font-medium animate-pulse">{t.loggingIn}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4" dir={lang === "ar" ? "rtl" : "ltr"}>
      {/* Dynamic animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(120,119,198,0.3),transparent)] animate-pulse"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(236,72,153,0.3),transparent)] animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.2),transparent)] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Floating geometric shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-32 h-32 border border-blue-500/20 rounded-full animate-float"></div>
        <div className="absolute top-40 right-32 w-24 h-24 border border-purple-500/20 rotate-45 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-32 left-40 w-20 h-20 border border-pink-500/20 rounded-full animate-float" style={{ animationDelay: '4s' }}></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 border border-cyan-500/20 rotate-12 animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Floating particles - only render when mounted */}
      {isMounted && (
        <div className="absolute inset-0">
          {floatingParticles.map((particle) => (
            <div
              key={particle.id}
              className="absolute w-1 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-40 animate-float"
              style={{
                left: particle.left,
                top: particle.top,
                animationDelay: particle.animationDelay,
                animationDuration: particle.animationDuration
              }}
            />
          ))}
        </div>
      )}

      {/* Main login card */}
      <div className="relative z-10 w-full max-w-md">
        {/* Language select dropdown */}
        <div className="mb-6 flex justify-end">

          <ElegantLanguageSelect
            lang={lang}
            onLangChange={handleLangChange}
            translations={t}
          />
        </div>
        <Card
          className="glass-card backdrop-blur-futuristic border-0 shadow-2xl transform transition-all duration-500 hover:scale-105 animate-fade-in"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Glowing border effect */}
          <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-sm transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}></div>

          <CardHeader className="text-center space-y-6 relative z-10 pt-8">
            {/* Enhanced Logo Container */}
            <div className="relative mx-auto">
              {/* Main logo container - bright and clean */}
              <div className="relative w-36 h-36 mx-auto group">
                {/* Bright glowing background */}
                <div className="absolute inset-0 bg-gradient-to-br from-white via-red-50 to-white rounded-3xl blur-2xl transition-all duration-500 group-hover:blur-3xl group-hover:scale-110"></div>

                {/* Solid bright logo background - NO OPACITY */}
                <div className="relative w-full h-full bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl border border-gray-200 shadow-2xl flex items-center justify-center overflow-hidden group-hover:border-red-300 transition-all duration-500">

                  {/* Logo image - large and bright */}
                  <img
                    src="/REDCASTELpg.png"
                    alt="Red Castel Logo"
                    className="relative z-10 w-28 h-28 object-contain transition-all duration-500 group-hover:scale-110"
                    style={{
                      filter: 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.6)) drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15)) brightness(1.3) contrast(1.2) saturate(1.3)'
                    }}
                  />

                  {/* Subtle inner glow - solid colors only */}
                  <div className="absolute inset-4 bg-gradient-to-br from-red-50 via-white to-red-50 rounded-2xl"></div>
                </div>

                {/* Floating icons around logo - brighter and more visible */}
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center animate-float shadow-xl border-2 border-white">
                  <Star className="w-4 h-4 text-white drop-shadow-lg" />
                </div>
                <div className="absolute -bottom-3 -left-3 w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center animate-float shadow-xl border-2 border-white" style={{ animationDelay: '1s' }}>
                  <Zap className="w-4 h-4 text-white drop-shadow-lg" />
                </div>
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center animate-float shadow-xl border-2 border-white" style={{ animationDelay: '2s' }}>
                  <Shield className="w-4 h-4 text-white drop-shadow-lg" />
                </div>
              </div>

              {/* Animated rings around logo - solid colors */}
              <div className="absolute inset-0 rounded-3xl border-2 border-red-400 animate-ping opacity-30"></div>
              <div className="absolute inset-0 rounded-3xl border border-red-300 scale-125 animate-pulse opacity-20"></div>
              <div className="absolute inset-0 rounded-3xl border border-red-200 scale-150 animate-pulse opacity-10" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                {t.appName}
              </CardTitle>
              <CardDescription className="text-slate-300 text-lg font-medium">
                {t.system}
              </CardDescription>
              <div className="text-slate-400 text-sm">
                {t.secureModern}
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
                  {t.username}
                </Label>
                <div className="relative group">
                  <Input
                    id="username"
                    type="text"
                    placeholder={t.usernamePlaceholder}
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
                  {t.password}
                </Label>
                <div className="relative group">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t.passwordPlaceholder}
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
                      {t.loggingIn}
                    </>
                  ) : (
                    <>
                      <Shield className="mr-3 h-5 w-5" />
                      {t.login}
                    </>
                  )}
                </div>
              </Button>
            </form>

            {/* Enhanced demo credentials */}
            <div className="mt-8 p-6 bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <h3 className="text-sm font-semibold text-slate-200">{t.demoAccounts}</h3>
              </div>

              <div className="grid gap-3">
                <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl border border-slate-600/30 hover:border-blue-500/30 transition-all duration-300 group">
                  <div>
                    <div className="text-sm font-medium text-blue-300 group-hover:text-blue-200">{t.admin}</div>
                    <div className="text-xs text-slate-400">{t.adminCreds}</div>
                  </div>
                  <Shield className="w-4 h-4 text-blue-400 opacity-50 group-hover:opacity-100 transition-all" />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl border border-slate-600/30 hover:border-purple-500/30 transition-all duration-300 group">
                  <div>
                    <div className="text-sm font-medium text-purple-300 group-hover:text-purple-200">{t.manager}</div>
                    <div className="text-xs text-slate-400">{t.managerCreds}</div>
                  </div>
                  <Star className="w-4 h-4 text-purple-400 opacity-50 group-hover:opacity-100 transition-all" />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl border border-slate-600/30 hover:border-green-500/30 transition-all duration-300 group">
                  <div>
                    <div className="text-sm font-medium text-green-300 group-hover:text-green-200">{t.employee}</div>
                    <div className="text-xs text-slate-400">{t.employeeCreds}</div>
                  </div>
                  <Zap className="w-4 h-4 text-green-400 opacity-50 group-hover:opacity-100 transition-all" />
                </div>
              </div>
            </div>

            {/* Footer info */}
            <div className="text-center pt-4">
              <div className="text-xs text-slate-500">
                {t.securedBy}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional floating elements - only render when mounted */}
      {isMounted && (
        <>
          <div className="absolute top-10 right-10 w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-30 animate-float hidden md:block"></div>
          <div className="absolute bottom-10 left-10 w-4 h-4 bg-gradient-to-br from-pink-400 to-red-500 rounded-full opacity-30 animate-float hidden md:block" style={{ animationDelay: '3s' }}></div>
        </>
      )}
    </div>
  )
}
