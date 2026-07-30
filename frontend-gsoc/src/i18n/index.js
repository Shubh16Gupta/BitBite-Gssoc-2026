/**
 * i18n setup — English + Hindi.
 *
 * Translations are bundled (not fetched) so switching is instant and works
 * offline. The chosen language is persisted to localStorage, so it survives a
 * reload. Add new strings to BOTH `en` and `hi` below; anything missing falls
 * back to English automatically.
 */
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import en from './locales/en.json'
import hi from './locales/hi.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'hi'],
    interpolation: { escapeValue: false }, // React already escapes
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'anndata.lang',
      caches: ['localStorage'],
    },
  })

export default i18n
