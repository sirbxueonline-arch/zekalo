import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { t as translate } from '../lib/i18n'

const LanguageContext = createContext({})
const STORAGE_KEY = 'zirva:lang'

function readStored() {
  try {
    const v = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null
    if (v === 'az' || v === 'en' || v === 'ru') return v
  } catch {}
  return 'az'
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(readStored)

  const setLang = useCallback((next) => {
    if (next !== 'az' && next !== 'en' && next !== 'ru') return
    setLangState(next)
    try { window.localStorage.setItem(STORAGE_KEY, next) } catch {}
  }, [])

  useEffect(() => {
    try { document.documentElement.lang = lang } catch {}
  }, [lang])

  const t = useCallback((key) => translate(key, lang), [lang])

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  return useContext(LanguageContext)
}
