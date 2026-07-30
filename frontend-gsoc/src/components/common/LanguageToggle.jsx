/** EN / हिं switch. The choice persists to localStorage via i18next-browser-languagedetector. */
import { useTranslation } from 'react-i18next'

export default function LanguageToggle({ className = '' }) {
  const { i18n } = useTranslation()
  const lang = i18n.resolvedLanguage || i18n.language || 'en'

  const set = (lng) => i18n.changeLanguage(lng)

  return (
    <div
      className={`inline-flex shrink-0 items-center rounded-full border border-slate-200 bg-white/70 p-0.5 ${className}`}
      title="Language / भाषा"
    >
      <button
        type="button"
        onClick={() => set('en')}
        aria-label="Switch to English"
        className={`px-2 py-0.5 rounded-full text-[11px] font-semibold leading-5 transition ${
          lang.startsWith('en') ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => set('hi')}
        aria-label="हिंदी में बदलें"
        className={`px-2 py-0.5 rounded-full text-[11px] font-semibold leading-5 transition ${
          lang.startsWith('hi') ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        हिं
      </button>
    </div>
  )
}
