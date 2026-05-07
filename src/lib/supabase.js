import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

// ─────────────────────────────────────────────────────────────
//  Cookie-based auth storage on the parent domain `.tryzirva.com`.
//
//  Why: localStorage is per-origin, so a session stored on tryzirva.com
//  is invisible to app.tryzirva.com. Cookies with `domain=.tryzirva.com`
//  are shared across all subdomains.
//
//  Encoding: we base64-encode the JSON before writing because
//  Supabase sessions can hit ~1.5–2 KB and `encodeURIComponent` would
//  inflate that 2–3× past the 4 KB cookie size limit, causing the
//  browser to silently drop the cookie. Base64 is only +33%.
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

// utf-8-safe base64 (handles emoji etc.)
function b64encode(s) {
  return btoa(unescape(encodeURIComponent(s)))
}
function b64decode(s) {
  try { return decodeURIComponent(escape(atob(s))) } catch { return null }
}

const COOKIE_PREFIX = 'b64.'   // marker so we know a cookie is base64-encoded

const cookieStorage = {
  getItem(key) {
    if (typeof document === 'undefined') return null
    const re = new RegExp('(?:^|; )' + escapeForRegex(key) + '=([^;]*)')
    const match = document.cookie.match(re)
    if (match) {
      const raw = match[1]
      if (raw.startsWith(COOKIE_PREFIX)) {
        const decoded = b64decode(raw.slice(COOKIE_PREFIX.length))
        if (decoded != null) return decoded
      }
      // Legacy un-prefixed cookie (probably URL-encoded) — try that too.
      try { return decodeURIComponent(raw) } catch { return raw }
    }
    // localStorage fallback for browsers/sessions that pre-date this change.
    if (typeof localStorage !== 'undefined') {
      try { return localStorage.getItem(key) } catch { return null }
    }
    return null
  },
  setItem(key, value) {
    if (typeof document === 'undefined') return
    const encoded = COOKIE_PREFIX + b64encode(value)
    const parts = [
      `${key}=${encoded}`,
      'path=/',
      'samesite=lax',
      `max-age=${60 * 60 * 24 * 30}`, // 30 days
    ]
    if (isZirvaHost()) parts.push(`domain=${ZIRVA_COOKIE_DOMAIN}`)
    if (typeof window !== 'undefined' && window.location.protocol === 'https:') parts.push('secure')
    document.cookie = parts.join('; ')
    // Mirror to localStorage as a fallback (e.g. if cookies disabled).
    try { localStorage.setItem(key, value) } catch {}
  },
  removeItem(key) {
    if (typeof document === 'undefined') return
    // Wipe with domain attribute (production)
    {
      const parts = [`${key}=`, 'path=/', 'max-age=0']
      if (isZirvaHost()) parts.push(`domain=${ZIRVA_COOKIE_DOMAIN}`)
      document.cookie = parts.join('; ')
    }
    // And without (in case it was set the old way)
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
