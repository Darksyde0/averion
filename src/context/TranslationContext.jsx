import { createContext, useContext, useState } from 'react'
import en from '../i18n/en'
import pt from '../i18n/pt'
import es from '../i18n/es'

const LANG_KEY = 'averion_language'
const languages = { en, pt, es }

const TranslationContext = createContext(null)

export function TranslationProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem(LANG_KEY) || 'en'
  })

  function changeLang(newLang) {
    if (languages[newLang]) {
      localStorage.setItem(LANG_KEY, newLang)
      setLang(newLang)
    }
  }

  function t(path) {
    const keys = path.split('.')
    let value = languages[lang]
    for (const key of keys) {
      value = value?.[key]
    }
    if (value === undefined) {
      let fallback = languages['en']
      for (const key of keys) {
        fallback = fallback?.[key]
      }
      return fallback ?? path
    }
    return value
  }

  return (
    <TranslationContext.Provider value={{ t, lang, changeLang }}>
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslation() {
  return useContext(TranslationContext)
}
