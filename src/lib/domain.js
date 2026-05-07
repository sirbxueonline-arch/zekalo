// ─────────────────────────────────────────────────────────────
//  Domain split:
//    tryzirva.com       → marketing site (landing, info, login, etc.)
//    app.tryzirva.com   → authenticated app (dashboards)
//
//  This file is the single source of truth for which paths
//  belong on which host.
// ─────────────────────────────────────────────────────────────

export const PUBLIC_HOST = 'tryzirva.com'
export const APP_HOST    = 'app.tryzirva.com'

// Path prefixes that belong to the public marketing site.
// Anything not in this list is considered an app/dashboard path.
const PUBLIC_PREFIXES = [
  '/',                // landing handled separately (exact match)
  '/solutions',
  '/features',
  '/zeka-ai',
  '/ib-pyp',
  '/ib-myp',
  '/ib-diploma',
  '/ib-career',
  '/government-schools',
  '/mobile',
  '/online-exams',
  '/ceo-letter',
  '/resources',
  '/events',
  '/blog',
  '/product-portal',
  '/reviews',
  '/faq',
  '/premium-support',
  '/help',
  '/about',
  '/careers',
  '/partners',
  '/contact',
  '/privacy',
  '/terms',
  '/demo',
  // auth flow (entry points into the app)
  '/daxil-ol',
  '/qeydiyyat',
  '/sifremi-unutdum',
  '/sifre-yenile',
  '/sifre-sifirla',
  '/dogrulama',
  // system pages
  '/texniki-xidmet',
  '/500',
]

export function isPublicPath(pathname) {
  if (pathname === '/') return true
  return PUBLIC_PREFIXES.some(prefix => prefix !== '/' && (pathname === prefix || pathname.startsWith(prefix + '/')))
}

// Are we running on a real Zirva production host?
// Returns false on localhost, vercel preview URLs, etc.
export function isProductionHost() {
  if (typeof window === 'undefined') return false
  const h = window.location.hostname
  return h === PUBLIC_HOST || h === APP_HOST || h === 'www.' + PUBLIC_HOST
}

export function getCurrentHost() {
  if (typeof window === 'undefined') return ''
  return window.location.hostname
}

// Build a URL on the target host with the same path/query/hash.
export function buildHostUrl(targetHost, pathname, search = '', hash = '') {
  return `https://${targetHost}${pathname}${search}${hash}`
}

// Where to send the user given the role on the app host.
export function rolePath(role) {
  const map = {
    student:     '/dashboard',
    teacher:     '/muellim/dashboard',
    parent:      '/valideyn/dashboard',
    admin:       '/admin/dashboard',
    super_admin: '/superadmin/dashboard',
    class_rep:   '/dashboard',
  }
  return map[role] || '/dashboard'
}

// Full URL for the app dashboard (used after login redirect).
export function appUrl(pathname) {
  return buildHostUrl(APP_HOST, pathname)
}

// Full URL for the public site (used after sign-out).
export function publicUrl(pathname = '/') {
  return buildHostUrl(PUBLIC_HOST, pathname)
}
