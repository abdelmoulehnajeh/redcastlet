"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useMutation } from "@apollo/client"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Settings, Lock, Bell, User, Shield, Volume2, VolumeX, Eye, EyeOff } from "lucide-react"
import { UPDATE_USER_PASSWORD } from "@/lib/graphql-queries"
import { toast } from "sonner"

type Lang = "fr" | "ar"

type Dict = {
  settingsTitle: string
  settingsSubtitle: string
  accountSecurity: string
  notifications: string
  preferences: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
  changePassword: string
  soundNotifications: string
  soundNotificationsDesc: string
  emailNotifications: string
  emailNotificationsDesc: string
  pushNotifications: string
  pushNotificationsDesc: string
  language: string
  theme: string
  timezone: string
  autoLogout: string
  autoLogoutDesc: string
  twoFactor: string
  twoFactorDesc: string
  sessionManagement: string
  activeDevices: string
  loginHistory: string
  dataExport: string
  dataExportDesc: string
  deleteAccount: string
  deleteAccountDesc: string
  save: string
  cancel: string
  updateSuccess: string
  updateError: string
  passwordMismatch: string
  passwordTooShort: string
  currentPasswordRequired: string
  enabled: string
  disabled: string
  french: string
  arabic: string
  light: string
  dark: string
  auto: string
  never: string
  minutes15: string
  minutes30: string
  hour1: string
  hours2: string
  showPassword: string
  hidePassword: string
  passwordUpdated: string
  settingsUpdated: string
}

const translations: Record<Lang, Dict> = {
  fr: {
    settingsTitle: "Paramètres",
    settingsSubtitle: "Gérez vos préférences et paramètres de compte",
    accountSecurity: "Compte et Sécurité",
    notifications: "Notifications",
    preferences: "Préférences",
    currentPassword: "Mot de passe actuel",
    newPassword: "Nouveau mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    changePassword: "Changer le mot de passe",
    soundNotifications: "Notifications sonores",
    soundNotificationsDesc: "Jouer un son lors de nouvelles notifications",
    emailNotifications: "Notifications par email",
    emailNotificationsDesc: "Recevoir des notifications par email",
    pushNotifications: "Notifications push",
    pushNotificationsDesc: "Recevoir des notifications push sur votre appareil",
    language: "Langue",
    theme: "Thème",
    timezone: "Fuseau horaire",
    autoLogout: "Déconnexion automatique",
    autoLogoutDesc: "Se déconnecter automatiquement après une période d'inactivité",
    twoFactor: "Authentification à deux facteurs",
    twoFactorDesc: "Ajouter une couche de sécurité supplémentaire",
    sessionManagement: "Gestion des sessions",
    activeDevices: "Appareils actifs",
    loginHistory: "Historique de connexion",
    dataExport: "Exporter les données",
    dataExportDesc: "Télécharger une copie de vos données",
    deleteAccount: "Supprimer le compte",
    deleteAccountDesc: "Supprimer définitivement votre compte",
    save: "Enregistrer",
    cancel: "Annuler",
    updateSuccess: "Paramètres mis à jour avec succès",
    updateError: "Erreur lors de la mise à jour",
    passwordMismatch: "Les mots de passe ne correspondent pas",
    passwordTooShort: "Le mot de passe doit contenir au moins 6 caractères",
    currentPasswordRequired: "Le mot de passe actuel est requis",
    enabled: "Activé",
    disabled: "Désactivé",
    french: "Français",
    arabic: "العربية",
    light: "Clair",
    dark: "Sombre",
    auto: "Automatique",
    never: "Jamais",
    minutes15: "15 minutes",
    minutes30: "30 minutes",
    hour1: "1 heure",
    hours2: "2 heures",
    showPassword: "Afficher le mot de passe",
    hidePassword: "Masquer le mot de passe",
    passwordUpdated: "Mot de passe mis à jour avec succès",
    settingsUpdated: "Paramètres mis à jour avec succès",
  },
  ar: {
    settingsTitle: "الإعدادات",
    settingsSubtitle: "إدارة تفضيلاتك وإعدادات الحساب",
    accountSecurity: "الحساب والأمان",
    notifications: "الإشعارات",
    preferences: "التفضيلات",
    currentPassword: "كلمة المرور الحالية",
    newPassword: "كلمة المرور الجديدة",
    confirmPassword: "تأكيد كلمة المرور",
    changePassword: "تغيير كلمة المرور",
    soundNotifications: "الإشعارات الصوتية",
    soundNotificationsDesc: "تشغيل صوت عند وصول إشعارات جديدة",
    emailNotifications: "إشعارات البريد الإلكتروني",
    emailNotificationsDesc: "تلقي الإشعارات عبر البريد الإلكتروني",
    pushNotifications: "الإشعارات الفورية",
    pushNotificationsDesc: "تلقي الإشعارات الفورية على جهازك",
    language: "اللغة",
    theme: "المظهر",
    timezone: "المنطقة الزمنية",
    autoLogout: "تسجيل الخروج التلقائي",
    autoLogoutDesc: "تسجيل الخروج تلقائياً بعد فترة عدم نشاط",
    twoFactor: "المصادقة الثنائية",
    twoFactorDesc: "إضافة طبقة أمان إضافية",
    sessionManagement: "إدارة الجلسات",
    activeDevices: "الأجهزة النشطة",
    loginHistory: "تاريخ تسجيل الدخول",
    dataExport: "تصدير البيانات",
    dataExportDesc: "تحميل نسخة من بياناتك",
    deleteAccount: "حذف الحساب",
    deleteAccountDesc: "حذف حسابك نهائياً",
    save: "حفظ",
    cancel: "إلغاء",
    updateSuccess: "تم تحديث الإعدادات بنجاح",
    updateError: "خطأ في التحديث",
    passwordMismatch: "كلمات المرور غير متطابقة",
    passwordTooShort: "يجب أن تحتوي كلمة المرور على 6 أحرف على الأقل",
    currentPasswordRequired: "كلمة المرور الحالية مطلوبة",
    enabled: "مفعل",
    disabled: "معطل",
    french: "Français",
    arabic: "العربية",
    light: "فاتح",
    dark: "داكن",
    auto: "تلقائي",
    never: "أبداً",
    minutes15: "15 دقيقة",
    minutes30: "30 دقيقة",
    hour1: "ساعة واحدة",
    hours2: "ساعتان",
    showPassword: "إظهار كلمة المرور",
    hidePassword: "إخفاء كلمة المرور",
    passwordUpdated: "تم تحديث كلمة المرور بنجاح",
    settingsUpdated: "تم تحديث الإعدادات بنجاح",
  },
}

export default function SettingsPage() {
  const { user } = useAuth()

  // Language from localStorage
  const [lang, setLang] = useState<Lang>("fr")
  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = localStorage.getItem("lang")
    if (stored === "ar" || stored === "fr") {
      setLang(stored)
    } else {
      localStorage.setItem("lang", "fr")
      setLang("fr")
    }
  }, [])

  // Keep layout LTR but set lang for a11y
  useEffect(() => {
    if (typeof document === "undefined") return
    document.documentElement.setAttribute("lang", lang)
    document.documentElement.setAttribute("dir", "ltr")
  }, [lang])

  const t = translations[lang]

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Settings state
  const [settings, setSettings] = useState({
    soundNotifications: true,
    emailNotifications: true,
    pushNotifications: false,
    language: lang,
    theme: "auto",
    autoLogout: "never",
    twoFactor: false,
  })

  // Load settings from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return

    const soundEnabled = localStorage.getItem("alert")
    const savedLang = localStorage.getItem("lang")
    const savedTheme = localStorage.getItem("theme")
    const savedAutoLogout = localStorage.getItem("autoLogout")

    setSettings((prev) => ({
      ...prev,
      soundNotifications: soundEnabled ? soundEnabled === "on" : true,
      language: (savedLang as Lang) || "fr",
      theme: savedTheme || "auto",
      autoLogout: savedAutoLogout || "never",
    }))
  }, [])

  const [updatePassword] = useMutation(UPDATE_USER_PASSWORD, {
    onCompleted: () => {
      toast.success(t.passwordUpdated)
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      setIsChangingPassword(false)
    },
    onError: (error) => {
      toast.error(t.updateError)
      console.error("Password update error:", error)
    },
  })

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!passwordForm.currentPassword) {
      toast.error(t.currentPasswordRequired)
      return
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error(t.passwordTooShort)
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error(t.passwordMismatch)
      return
    }

    setIsChangingPassword(true)

    try {
      await updatePassword({
        variables: {
          employee_id: user?.employee_id,
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        },
      })
    } catch (error) {
      setIsChangingPassword(false)
    }
  }

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))

    // Save to localStorage immediately
    if (key === "soundNotifications") {
      localStorage.setItem("alert", value ? "on" : "off")
      // Broadcast change to other tabs
      try {
        const bc = new BroadcastChannel("rc-notifications")
        bc.postMessage({ type: "alert-toggle", payload: { enabled: value } })
        bc.close()
      } catch (e) {
        // ignore
      }
    } else if (key === "language") {
      localStorage.setItem("lang", value)
      setLang(value)
    } else if (key === "theme") {
      localStorage.setItem("theme", value)
    } else if (key === "autoLogout") {
      localStorage.setItem("autoLogout", value)
    }

    toast.success(t.settingsUpdated)
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "🔥 Administrateur"
      case "manager":
        return "⚡ Manager"
      case "employee":
        return "✨ Employé"
      default:
        return role
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-300 border border-red-400/30 backdrop-blur-sm"
      case "manager":
        return "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border border-blue-400/30 backdrop-blur-sm"
      case "employee":
        return "bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border border-green-400/30 backdrop-blur-sm"
      default:
        return "bg-gradient-to-r from-gray-500/20 to-slate-500/20 text-gray-300 border border-gray-400/30 backdrop-blur-sm"
    }
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden"
      dir="ltr"
    >
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(120,219,255,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,119,198,0.1),transparent_50%)]"></div>
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 p-4 md:p-6 space-y-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header Card */}
          <Card3D>
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <Avatar className="w-20 h-20 md:w-24 md:h-24 border-4 border-white/30 shadow-2xl">
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white text-2xl md:text-3xl font-bold shadow-inner">
                    <Settings className="w-8 h-8 md:w-10 md:h-10" />
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 text-center md:text-left">
                  <CardTitle
                    className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent mb-2"
                    dir="auto"
                  >
                    {t.settingsTitle}
                  </CardTitle>
                  <p className="text-gray-300 text-base md:text-lg mb-4" dir="auto">
                    {t.settingsSubtitle}
                  </p>

                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    <Badge className={`px-3 py-1 ${getRoleColor(user?.role || "")}`} dir="auto">
                      {getRoleLabel(user?.role || "")}
                    </Badge>
                    <Badge
                      className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-300 border border-purple-400/30 backdrop-blur-sm px-3 py-1"
                      dir="auto"
                    >
                      {user?.username}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card3D>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Account & Security */}
            <Card3D>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                  <Shield className="h-6 w-6 text-red-400" />
                  <span dir="auto">{t.accountSecurity}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <Label
                      htmlFor="currentPassword"
                      className="text-gray-300 text-sm font-medium mb-2 block"
                      dir="auto"
                    >
                      {t.currentPassword}
                    </Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className="bg-slate-700/50 border-slate-600 text-white rounded-xl focus:border-red-400 focus:ring-2 focus:ring-red-400/20 pr-10"
                        placeholder="••••••••"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-gray-400 hover:text-white"
                        onClick={() => setShowPasswords((prev) => ({ ...prev, current: !prev.current }))}
                      >
                        {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="newPassword" className="text-gray-300 text-sm font-medium mb-2 block" dir="auto">
                      {t.newPassword}
                    </Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="bg-slate-700/50 border-slate-600 text-white rounded-xl focus:border-red-400 focus:ring-2 focus:ring-red-400/20 pr-10"
                        placeholder="••••••••"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-gray-400 hover:text-white"
                        onClick={() => setShowPasswords((prev) => ({ ...prev, new: !prev.new }))}
                      >
                        {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="confirmPassword"
                      className="text-gray-300 text-sm font-medium mb-2 block"
                      dir="auto"
                    >
                      {t.confirmPassword}
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="bg-slate-700/50 border-slate-600 text-white rounded-xl focus:border-red-400 focus:ring-2 focus:ring-red-400/20 pr-10"
                        placeholder="••••••••"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-gray-400 hover:text-white"
                        onClick={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
                      >
                        {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isChangingPassword}
                    className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold py-2 rounded-xl transition-all duration-300 shadow-lg"
                  >
                    {isChangingPassword ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span dir="auto">{t.changePassword}...</span>
                      </div>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        <span dir="auto">{t.changePassword}</span>
                      </>
                    )}
                  </Button>
                </form>

                <Separator className="bg-slate-600/50" />

             
              </CardContent>
            </Card3D>

            {/* Notifications */}
            <Card3D>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  <Bell className="h-6 w-6 text-blue-400" />
                  <span dir="auto">{t.notifications}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {settings.soundNotifications ? (
                        <Volume2 className="h-5 w-5 text-green-400" />
                      ) : (
                        <VolumeX className="h-5 w-5 text-gray-400" />
                      )}
                      <div>
                        <Label className="text-gray-300 font-medium" dir="auto">
                          {t.soundNotifications}
                        </Label>
                        <p className="text-sm text-gray-400" dir="auto">
                          {t.soundNotificationsDesc}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.soundNotifications}
                      onCheckedChange={(checked) => handleSettingChange("soundNotifications", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-gray-300 font-medium" dir="auto">
                        {t.emailNotifications}
                      </Label>
                      <p className="text-sm text-gray-400" dir="auto">
                        {t.emailNotificationsDesc}
                      </p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-gray-300 font-medium" dir="auto">
                        {t.pushNotifications}
                      </Label>
                      <p className="text-sm text-gray-400" dir="auto">
                        {t.pushNotificationsDesc}
                      </p>
                    </div>
                    <Switch
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) => handleSettingChange("pushNotifications", checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card3D>

            {/* Preferences - Full Width */}
            <div className="lg:col-span-2">
              <Card3D>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    <User className="h-6 w-6 text-purple-400" />
                    <span dir="auto">{t.preferences}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <Label className="text-gray-300 text-sm font-medium mb-2 block" dir="auto">
                        {t.language}
                      </Label>
                      <select
                        value={settings.language}
                        onChange={(e) => handleSettingChange("language", e.target.value)}
                        className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-xl px-4 py-3 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
                      >
                        <option value="fr">{t.french}</option>
                        <option value="ar">{t.arabic}</option>
                      </select>
                    </div>

                    <div>
                      <Label className="text-gray-300 text-sm font-medium mb-2 block" dir="auto">
                        {t.theme}
                      </Label>
                      <select
                        value={settings.theme}
                        onChange={(e) => handleSettingChange("theme", e.target.value)}
                        className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-xl px-4 py-3 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
                      >
                        <option value="light">{t.light}</option>
                        <option value="dark">{t.dark}</option>
                        <option value="auto">{t.auto}</option>
                      </select>
                    </div>

                    <div>
                      <Label className="text-gray-300 text-sm font-medium mb-2 block" dir="auto">
                        {t.autoLogout}
                      </Label>
                      <select
                        value={settings.autoLogout}
                        onChange={(e) => handleSettingChange("autoLogout", e.target.value)}
                        className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-xl px-4 py-3 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
                      >
                        <option value="never">{t.never}</option>
                        <option value="15">{t.minutes15}</option>
                        <option value="30">{t.minutes30}</option>
                        <option value="60">{t.hour1}</option>
                        <option value="120">{t.hours2}</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card3D>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(1deg); }
          66% { transform: translateY(5px) rotate(-1deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

// 3D Card Wrapper Component
function Card3D({ children, className = "" }: any) {
  return (
    <div className="group relative transform-gpu perspective-1000">
      <div
        className={`relative bg-slate-800/40 backdrop-blur-xl border border-slate-600/50 rounded-3xl text-white transform hover:rotateX-2 hover:rotateY-1 transition-all duration-500 ${className}`}
        style={{
          transform: "perspective(1000px) rotateX(2deg)",
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        }}
      >
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-400/20 via-cyan-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  )
}
