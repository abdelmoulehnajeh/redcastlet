'use client'

import { useCallback, useEffect, useState } from 'react'

export type Lang = 'fr' | 'ar'

// Tunisia time zone constant
export const TN_TIMEZONE = 'Africa/Tunis'

// Basic dictionary type
type Dict = Record<string, string>

/**
 * French dictionary
 * Merged: Common, Admin Dashboard, Employee Details, Pointeuse, Months, Toasts.
 */
const fr: Dict = {
  // Common
  active: 'Actif',
  inactive: 'Inactif',
  unknown_date: 'Date inconnue',
  invalid_date: 'Date invalide',
  loading: 'Chargement...',
  cancel: 'Annuler',
  save: 'Sauver',
  edit: 'Modifier',
  urgent: 'Urgent',

  // Roles/labels
  space: 'Espace',
  role_admin: 'Admin',
  role_manager: 'Manager',
  role_employee: 'Employé',
  nav: 'Navigation',

  // Header (optional variants if you want role-specific titles)
  header_title_admin: 'Administration',
  header_title_manager: 'Management',
  header_title_employee: 'Espace Employé',
  header_subtitle: 'Tableau de bord Red Castle',
  notifications: 'Notifications',
  profile: 'Profil',
  settings: 'Paramètres',
  logout: 'Déconnexion',
  notif_title: '🔔 Approbations en attente',
  no_notifications: '✨ Aucune notification',
  schedule_change: '📅 Changement de planning',
  date_unknown: 'Date inconnue',
  received_at_prefix: 'Reçu le',

  // Admin Dashboard
  admin_title: 'Administration Red Castle',
  admin_subtitle: "Tableau de bord administrateur - Vue d'ensemble",
  system_active: 'Système actif',
  last_update_now: 'Dernière mise à jour: maintenant',
  stat_total_employees: 'Total Employés',
  stat_all_restaurants: 'Tous restaurants',
  stat_active_locations: 'Restaurants Actifs',
  stat_locations_open: 'Locations ouvertes',
  stat_revenue: "Chiffre d'Affaires",
  stat_this_month: 'Ce mois',
  stat_approvals: 'Approbations',
  stat_pending: 'En attente',
  chart_global_perf: 'Performance Globale',
  chart_global_perf_desc: "Évolution du chiffre d'affaires et des effectifs",
  chart_perf_by_location: 'Performance par Restaurant',
  chart_perf_by_location_desc: "Chiffre d'affaires mensuel par location",
  restaurants_manage: 'Gestion des Restaurants',
  restaurants_overview: "Vue d'ensemble de tous les restaurants Red Castle",
  employees: 'Employés',
  monthly_revenue: 'CA Mensuel',
  performance: 'Performance',
  recent_activities: 'Activités Récentes',
  recent_activities_desc: 'Dernières actions nécessitant votre attention',
  loading_activities: 'Chargement des activités...',
  error_loading_activities: 'Erreur lors du chargement des activités',
  no_recent_activity: 'Aucune activité récente',

  // Months short (used for charts)
  m_jan: 'Jan',
  m_feb: 'Fév',
  m_mar: 'Mar',
  m_apr: 'Avr',
  m_may: 'Mai',
  m_jun: 'Jun',

  // Employee Details
  personal_info: 'Informations Personnelles',
  full_name: 'Nom Complet',
  job_title: 'Poste',
  status: 'Statut',
  hire_date: "Date d'embauche",
  financial_info: 'Informations Financières',
  salary: 'Salaire',
  bonus: 'Prime',
  advance: 'Avance',
  net_salary_est: 'Salaire Net Estimé',
  performance_title: 'Performance',
  overall_performance: 'Performance globale',
  excellent: 'Excellent',
  good: 'Bon',
  needs_improvement: 'À améliorer',
  worked_hours: 'Heures travaillées',
  sessions: 'Sessions',
  disciplinary_data: 'Données Disciplinaires',
  infractions: 'Infractions',
  absences: 'Absences',
  delays: 'Retards',
  uniforms: 'Tenues de travail',
  recent_activity: 'Activité Récente',
  recent_sessions: 'Dernières sessions de travail',
  in_progress: 'En cours',
  done: 'Terminé',
  contracts: 'Contrats',
  contract_prefix: 'Contrat',
  from: 'Du',
  to: 'au',
  uniforms_count: 'tenues',
  active_session: 'Session active',
  sessions_done: 'Sessions terminées',

  // Pointeuse
  punch_title: 'Pointeuse',
  punch_subtitle: 'Gérez vos heures de travail',
  current_status: 'Statut Actuel',
  on_duty: 'En service',
  off_duty: 'Hors service',
  check_in: "Pointage d’arrivée",
  check_out: 'Pointage de départ',
  arrived_at: 'Arrivée',
  working_time: 'Temps de travail',
  position: 'Position',
  punch_in_btn: "Pointer l'arrivée",
  punch_out_btn: 'Pointer le départ',
  today_summary: 'Résumé du jour',
  today_history: 'Historique du jour',
  unknown_status: 'Statut inconnu',
  geo_warning:
    "La géolocalisation n'est pas disponible. Certaines fonctionnalités peuvent être limitées.",

  // Toasts (Pointeuse)
  toast_checkin_success: "Vous avez pointé votre arrivée avec succès",
  toast_checkout_success: 'Vous avez pointé votre départ avec succès',
  toast_error: 'Erreur',
  toast_checkin_error: "Erreur lors du pointage d'arrivée",
  toast_checkout_error: 'Erreur lors du pointage de départ',

  // Toasts (Employee updates)
  toast_update_success: 'Employé mis à jour avec succès',
  toast_update_error: 'Erreur lors de la mise à jour',
}

/**
 * Arabic dictionary
 * Merged: Common, Admin Dashboard, Employee Details, Pointeuse, Months, Toasts.
 */
const ar: Dict = {
  // Common
  active: 'نشط',
  inactive: 'غير نشط',
  unknown_date: 'تاريخ غير معروف',
  invalid_date: 'تاريخ غير صالح',
  loading: 'جاري التحميل...',
  cancel: 'إلغاء',
  save: 'حفظ',
  edit: 'تعديل',
  urgent: 'عاجل',

  // Roles/labels
  space: 'مساحة',
  role_admin: 'مدير',
  role_manager: 'مشرف',
  role_employee: 'موظف',
  nav: 'التنقل',

  // Header (optional variants if you want role-specific titles)
  header_title_admin: 'الإدارة',
  header_title_manager: 'الإشراف',
  header_title_employee: 'مساحة الموظف',
  header_subtitle: 'لوحة تحكم ريد كاسل',
  notifications: 'الإشعارات',
  profile: 'الملف الشخصي',
  settings: 'الإعدادات',
  logout: 'تسجيل الخروج',
  notif_title: '🔔 موافقات قيد الانتظار',
  no_notifications: '✨ لا توجد إشعارات',
  schedule_change: '📅 تغيير الجدول',
  date_unknown: 'تاريخ غير معروف',
  received_at_prefix: 'تم الاستلام في',

  // Admin Dashboard
  admin_title: 'إدارة ريد كاسل',
  admin_subtitle: 'لوحة تحكم المدير - نظرة عامة',
  system_active: 'النظام نشط',
  last_update_now: 'آخر تحديث: الآن',
  stat_total_employees: 'إجمالي الموظفين',
  stat_all_restaurants: 'جميع المطاعم',
  stat_active_locations: 'المطاعم النشطة',
  stat_locations_open: 'الفروع المفتوحة',
  stat_revenue: 'رقم المعاملات',
  stat_this_month: 'هذا الشهر',
  stat_approvals: 'الموافقات',
  stat_pending: 'قيد الانتظار',
  chart_global_perf: 'الأداء العام',
  chart_global_perf_desc: 'تطور رقم المعاملات وعدد الموظفين',
  chart_perf_by_location: 'الأداء حسب المطعم',
  chart_perf_by_location_desc: 'رقم المعاملات الشهري لكل موقع',
  restaurants_manage: 'إدارة المطاعم',
  restaurants_overview: 'نظرة عامة على جميع مطاعم ريد كاسل',
  employees: 'الموظفون',
  monthly_revenue: 'المعاملات الشهرية',
  performance: 'الأداء',
  recent_activities: 'الأنشطة الأخيرة',
  recent_activities_desc: 'أحدث الإجراءات التي تتطلب اهتمامك',
  loading_activities: 'جاري تحميل الأنشطة...',
  error_loading_activities: 'حدث خطأ أثناء تحميل الأنشطة',
  no_recent_activity: 'لا توجد أنشطة حديثة',

  // Months short (used for charts)
  m_jan: 'جان',
  m_feb: 'فيف',
  m_mar: 'مار',
  m_apr: 'أف',
  m_may: 'ماي',
  m_jun: 'جون',

  // Employee Details
  personal_info: 'المعلومات الشخصية',
  full_name: 'الاسم الكامل',
  job_title: 'المنصب',
  status: 'الحالة',
  hire_date: 'تاريخ التوظيف',
  financial_info: 'المعلومات المالية',
  salary: 'الراتب',
  bonus: 'منحة',
  advance: 'سلفة',
  net_salary_est: 'صافي الراتب التقديري',
  performance_title: 'الأداء',
  overall_performance: 'الأداء العام',
  excellent: 'ممتاز',
  good: 'جيد',
  needs_improvement: 'بحاجة لتحسين',
  worked_hours: 'ساعات العمل',
  sessions: 'الجلسات',
  disciplinary_data: 'البيانات التأديبية',
  infractions: 'مخالفات',
  absences: 'غيابات',
  delays: 'تأخيرات',
  uniforms: 'أزياء العمل',
  recent_activity: 'النشاط الأخير',
  recent_sessions: 'آخر جلسات العمل',
  in_progress: 'قيد العمل',
  done: 'منتهي',
  contracts: 'العقود',
  contract_prefix: 'عقد',
  from: 'من',
  to: 'إلى',
  uniforms_count: 'أزياء',
  active_session: 'جلسة نشطة',
  sessions_done: 'الجلسات المكتملة',

  // Pointeuse
  punch_title: 'آلة تسجيل الوقت',
  punch_subtitle: 'إدارة ساعات عملك',
  current_status: 'الحالة الحالية',
  on_duty: 'على رأس العمل',
  off_duty: 'خارج العمل',
  check_in: 'تسجيل الوصول',
  check_out: 'تسجيل الانصراف',
  arrived_at: 'وقت الوصول',
  working_time: 'وقت العمل',
  position: 'الموقع',
  punch_in_btn: 'تسجيل الوصول',
  punch_out_btn: 'تسجيل الانصراف',
  today_summary: 'ملخص اليوم',
  today_history: 'سجل اليوم',
  unknown_status: 'حالة غير معروفة',
  geo_warning: 'خدمة تحديد الموقع غير متاحة. قد تكون بعض الميزات محدودة.',

  // Toasts (Pointeuse)
  toast_checkin_success: 'تم تسجيل وصولك بنجاح',
  toast_checkout_success: 'تم تسجيل انصرافك بنجاح',
  toast_error: 'خطأ',
  toast_checkin_error: 'حدث خطأ أثناء تسجيل الوصول',
  toast_checkout_error: 'حدث خطأ أثناء تسجيل الانصراف',

  // Toasts (Employee updates)
  toast_update_success: 'تم تحديث الموظف بنجاح',
  toast_update_error: 'حدث خطأ أثناء التحديث',
}

const dicts: Record<Lang, Dict> = { fr, ar }

function getLocaleFromLang(lang: Lang): string {
  // Use Tunisia regional locales by default
  return lang === 'ar' ? 'ar-TN' : 'fr-TN'
}

function toDate(date: Date | string | number): Date {
  return date instanceof Date ? date : new Date(date)
}

function normalizeLang(value: any): Lang {
  return value === 'ar' ? 'ar' : 'fr'
}

function updateDocumentLangAndDir(lang: Lang) {
  if (typeof document === 'undefined') return
  const el = document.documentElement
  el.lang = lang
  // Keep overall layout LTR; use dir="auto" on text containers where needed.
  el.dir = 'ltr'
}

function getStoredLang(): Lang {
  if (typeof window === 'undefined') return 'fr'
  const stored = window.localStorage.getItem('lang')
  return normalizeLang(stored)
}

function withTZ(
  options?: Intl.DateTimeFormatOptions,
  timeZone?: string
): Intl.DateTimeFormatOptions {
  return {
    ...(options ?? {}),
    timeZone: options?.timeZone ?? timeZone ?? TN_TIMEZONE,
  }
}

// Named helpers (can be used stand-alone)
export function formatDate(
  date: Date | string | number,
  lang: Lang,
  options?: Intl.DateTimeFormatOptions,
  timeZone?: string
): string {
  const d = toDate(date)
  if (isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat(getLocaleFromLang(lang), withTZ(options, timeZone)).format(d)
}

export function formatTime(
  date: Date | string | number,
  lang: Lang,
  options?: Intl.DateTimeFormatOptions,
  timeZone?: string
): string {
  const d = toDate(date)
  if (isNaN(d.getTime())) return ''
  const defaultOpts: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit' }
  return new Intl.DateTimeFormat(
    getLocaleFromLang(lang),
    withTZ({ ...defaultOpts, ...(options ?? {}) }, timeZone)
  ).format(d)
}

export function formatNumber(
  value: number,
  lang: Lang,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(getLocaleFromLang(lang), options).format(
    Number.isFinite(value) ? value : 0
  )
}

export function formatCurrency(
  value: number,
  lang: Lang,
  currency: string = 'TND',
  maximumFractionDigits = 0
): string {
  return new Intl.NumberFormat(getLocaleFromLang(lang), {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits,
  }).format(Number.isFinite(value) ? value : 0)
}

/**
 * Get YYYY-MM-DD string in a specific IANA time zone (default Africa/Tunis).
 * Useful for GraphQL date variables that should reflect Tunis local day.
 */
export function getISODateInTZ(
  date: Date | string | number = new Date(),
  timeZone: string = TN_TIMEZONE
): string {
  const d = toDate(date)
  // en-CA gives "YYYY-MM-DD"
  return new Intl.DateTimeFormat(
    'en-CA',
    withTZ({ year: 'numeric', month: '2-digit', day: '2-digit' }, timeZone)
  ).format(d)
}

/**
 * React hook for language and localized formatters.
 * - Initializes from localStorage ("lang"), defaults to 'fr'.
 * - Sets document.lang and keeps document.dir="ltr".
 * - Returns t(), locale, timeZone and bound formatters.
 */
export function useLang(defaultLang: Lang = 'fr') {
  const [lang, setLangState] = useState<Lang>(defaultLang)

  // Initialize from localStorage on mount
  useEffect(() => {
    const initial = getStoredLang()
    setLangState(initial)
    updateDocumentLangAndDir(initial)
  }, [])

  // Expose a setter that persists
  const setLang = useCallback((next: Lang) => {
    const normalized = normalizeLang(next)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('lang', normalized)
    }
    setLangState(normalized)
    updateDocumentLangAndDir(normalized)
  }, [])

  // Translator
  const t = useCallback(
    (key: string, fallback?: string) => {
      const d = dicts[lang]
      return (d && d[key]) || fallback || key
    },
    [lang]
  )

  const locale = getLocaleFromLang(lang)
  const timeZone = TN_TIMEZONE

  // Hook-bound helpers (default to Africa/Tunis unless overridden)
  const formatDateLocal = useCallback(
    (date: Date | string | number, options?: Intl.DateTimeFormatOptions) =>
      formatDate(date, lang, options, timeZone),
    [lang, timeZone]
  )

  const formatTimeLocal = useCallback(
    (date: Date | string | number, options?: Intl.DateTimeFormatOptions) =>
      formatTime(date, lang, options, timeZone),
    [lang, timeZone]
  )

  const formatNumberLocal = useCallback(
    (value: number, options?: Intl.NumberFormatOptions) => formatNumber(value, lang, options),
    [lang]
  )

  const formatCurrencyLocal = useCallback(
    (value: number, currency: string = 'TND', maximumFractionDigits = 0) =>
      formatCurrency(value, lang, currency, maximumFractionDigits),
    [lang]
  )

  return {
    lang,
    t,
    locale,
    timeZone,
    setLang,
    formatDate: formatDateLocal,
    formatTime: formatTimeLocal,
    formatNumber: formatNumberLocal,
    formatCurrency: formatCurrencyLocal,
  }
}
