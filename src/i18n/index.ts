import dayjs from 'dayjs'
import 'dayjs/locale/en'
import 'dayjs/locale/ru'
import 'dayjs/locale/uk'
import { createI18n } from 'vue-i18n'
import { messages } from './messages'

export const supportedLocales = ['uk', 'en', 'ru'] as const
export type AppLocale = (typeof supportedLocales)[number]

const STORAGE_KEY = 'crm-locale'
export const defaultLocale: AppLocale = 'uk'

export const intlLocaleMap: Record<AppLocale, string> = {
  uk: 'uk-UA',
  en: 'en-US',
  ru: 'ru-RU',
}

const isLocaleSupported = (value: string): value is AppLocale => {
  return supportedLocales.includes(value as AppLocale)
}

const getSavedLocale = (): AppLocale => {
  if (typeof window === 'undefined') {
    return defaultLocale
  }

  const savedLocale = window.localStorage.getItem(STORAGE_KEY)
  return savedLocale && isLocaleSupported(savedLocale) ? savedLocale : defaultLocale
}

const syncDayjsLocale = (locale: AppLocale) => {
  dayjs.locale(locale)
}

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: getSavedLocale(),
  fallbackLocale: defaultLocale,
  messages,
})

syncDayjsLocale(i18n.global.locale.value as AppLocale)

export const setAppLocale = (locale: AppLocale) => {
  i18n.global.locale.value = locale
  syncDayjsLocale(locale)

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, locale)
  }
}
