import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

// ─────────────────────────────────────────────────────────────
//  Cookie-based auth storage on the parent domain `.tryzirva.com`.
//
//  Why: localStorage is per-origin, so a session stored on
//  tryzirva.com is invisible to app.tryzirva.com. Cookies with
//  `domain=.tryzirva.com` are shared across all subdomains, which
//  is exactly what we need for the marketing-site / app split.
//
//  On any other host (localhost, vercel preview), this falls back
//  to plain cookies without the domain attribute so it still works
//  in dev. We also keep a localStorage fallback for tabs that have
//  cookies disabled.
// ─────────────────────────────────────────────────────────────

const ZIRVA_COOKIE_DOMAIN = '.tryzirva.com'

function isZirvaHost() {
  if (typeof window === 'undefined') return false
  const h = window.location.hostname
  return h === 'tryzirva.com' || h.endsWith('.tryzirva.com')
}

function escapeForRegex(s) {
  return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
}

const cookieStorage = {
  getItem(key) {
    if (typeof document === 'undefined') return null
    const re = new RegExp('(?:^|; )' + escapeForRegex(key) + '=([^;]*)')
    const match = document.cookie.match(re)
    if (match) {
      try { return decodeURIComponent(match[1]) } catch { return match[1] }
    }
    // Fallback: legacy localStorage value (so existing logged-in users
    // don't get kicked out the moment we ship this change).
    if (typeof localStorage !== 'undefined') {
      try { return localStorage.getItem(key) } catch { return null }
    }
    return null
  },
  setItem(key, value) {
    if (typeof document === 'undefined') return
    const parts = [
      `${key}=${encodeURIComponent(value)}`,
      'path=/',
      'samesite=lax',
      `max-age=${60 * 60 * 24 * 30}`, // 30 days
    ]
    if (isZirvaHost()) parts.push(`domain=${ZIRVA_COOKIE_DOMAIN}`)
    if (typeof window !== 'undefined' && window.location.protocol === 'https:') parts.push('secure')
    document.cookie = parts.join('; ')
    // Mirror to localStorage as a belt-and-suspenders fallback.
    try { localStorage.setItem(key, value) } catch {}
  },
  removeItem(key) {
    if (typeof document === 'undefined') return
    const parts = [`${key}=`, 'path=/', 'max-age=0']
    if (isZirvaHost()) parts.push(`domain=${ZIRVA_COOKIE_DOMAIN}`)
    document.cookie = parts.join('; ')
    // Also wipe in case it was set without the domain attribute previously.
    document.cookie = `${key}=; path=/; max-age=0`
    try { localStorage.removeItem(key) } catch {}
  },
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: typeof window !== 'undefined' ? cookieStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
})
