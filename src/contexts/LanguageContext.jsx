import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { t as translate } from '../lib/i18n'

const LanguageContext = createContext({})
const STORAGE_KEY = 'zirva:lang'
const VALID = ['az', 'en', 'ru', 'tr']

function readStored() {
  try {
    const v = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null
    if (VALID.includes(v)) return v
  } catch {}
  return 'az'
}

export function LanguageProvider({ children }) {
  const [storedLang, setStoredLang] = useState(readStored)
  // `forcedLang` lets a route subtree pin the active language without
  // touching localStorage. Public marketing/auth pages use it to lock the
  // UI to Azerbaijani while logged-in users keep their profile preference.
  const [forcedLang, setForcedLangState] = useState(null)

  const setLang = useCallback((next) => {
    if (!VALID.includes(next)) return
    setStoredLang(next)
    try { window.localStorage.setItem(STORAGE_KEY, next) } catch {}
  }, [])

  // Pass null to release a previous force.
  const setForcedLang = useCallback((next) => {
    if (next === null || VALID.includes(next)) setForcedLangState(next)
  }, [])

  const lang = forcedLang || storedLang

  useEffect(() => {
    try { document.documentElement.lang = lang } catch {}
  }, [lang])

  const t = useCallback((key) => translate(key, lang), [lang])

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, setForcedLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  return useContext(LanguageContext)
}
