import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useLang } from './LanguageContext'
import { Sentry } from '../lib/sentry'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const { lang, setLang, t } = useLang()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileError, setProfileError] = useState(false)
  const fetchingRef = useRef(false)

  async function fetchProfile(userId) {
    if (fetchingRef.current) return
    fetchingRef.current = true
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, school:schools(*)')
        .eq('id', userId)
        .single()
      if (error) {
        if (error.code !== 'PGRST116') {
          console.error('Profile fetch failed:', error)
        }
        setProfileError(true)
        return null
      }
      setProfile(data)
      setProfileError(false)
      if (data && Sentry?.setUser) {
        Sentry.setUser({
          id: data.id,
          role: data.role,
          school_id: data.school_id,
          // NO email or name — privacy
        })
      }
      return data
    } catch (err) {
      console.error('Profile fetch exception:', err)
      setProfileError(true)
      return null
    } finally {
      fetchingRef.current = false
    }
  }

  useEffect(() => {
    // ── Cross-domain auth handoff ────────────────────────────
    // Login happens on tryzirva.com, dashboard lives on app.tryzirva.com.
    // localStorage is per-origin so the session doesn't transfer automatically.
    // Login.jsx redirects with `#zauth=<base64-json>` containing the tokens;
    // we read them here and call setSession() so the user lands authed.
    async function consumeHandoff() {
      if (typeof window === 'undefined') return null
      const hash = window.location.hash || ''
      if (!hash.startsWith('#zauth=')) return null
      try {
        const payload = JSON.parse(atob(decodeURIComponent(hash.slice(7))))
        if (payload?.at && payload?.rt) {
          const { data, error } = await supabase.auth.setSession({
            access_token:  payload.at,
            refresh_token: payload.rt,
          })
          // Strip the hash without reloading the page
          const cleanUrl = window.location.pathname + window.location.search
          window.history.replaceState({}, '', cleanUrl)
          if (error) {
            console.error('[auth-handoff] setSession failed:', error)
            return null
          }
          return data?.session || null
        }
      } catch (e) {
        console.error('[auth-handoff] could not decode hash:', e)
      }
      return null
    }

    let active = true
    consumeHandoff().then(handoffSession => {
      if (!active) return
      const finish = (session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          fetchProfile(session.user.id).finally(() => setLoading(false))
        } else {
          setLoading(false)
        }
      }
      if (handoffSession) {
        finish(handoffSession)
      } else {
        supabase.auth.getSession().then(({ data: { session } }) => finish(session))
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || (!session && event !== 'INITIAL_SESSION')) {
        setUser(null)
        setProfile(null)
        setLoading(false)
      } else if (event === 'TOKEN_REFRESHED') {
        setUser(session.user)
      } else if (session?.user) {
        setUser(session.user)
        await fetchProfile(session.user.id)
        setLoading(false)
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  // Check session validity whenever the tab regains focus so that an expired
  // token is caught quickly without waiting for the next API call.
  useEffect(() => {
    async function handleFocus() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setUser(null)
        setProfile(null)
      }
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function signUp(email, password, profileData) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: profileData.full_name,
          role: profileData.role,
        },
      },
    })
    if (error) throw error

    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      full_name: profileData.full_name,
      email,
      role: profileData.role,
      school_id: profileData.school_id,
      edition: profileData.edition,
      language: profileData.language || 'az',
      ib_programme: profileData.ib_programme || null,
    })
    if (profileError) throw profileError

    // Fetch profile immediately so redirects work
    await fetchProfile(data.user.id)

    return data
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUser(null)
    setProfile(null)
    if (Sentry?.setUser) Sentry.setUser(null)
    // On production, hop back to the marketing host. Sidebar/Topbar can rely
    // on this to send users to tryzirva.com after logout.
    if (typeof window !== 'undefined') {
      const h = window.location.hostname
      if (h === 'app.tryzirva.com') {
        window.location.replace('https://tryzirva.com/daxil-ol')
      }
    }
  }

  async function updateProfile(updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select('*, school:schools(*)')
      .single()
    if (error) throw error
    setProfile(data)
    if (updates.language) setLang(updates.language)
    return data
  }

  // Sync profile.language → LanguageContext only if the user has no explicit
  // browser-level preference stored (i.e. they haven't picked a language on the
  // landing page or in profile settings in this browser).
  useEffect(() => {
    if (!profile?.language) return
    const stored = localStorage.getItem('zirva:lang')
    if (!stored) setLang(profile.language)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.language])

  return (
    <AuthContext.Provider value={{ user, profile, loading, profileError, lang, t, setLang, signIn, signUp, signOut, updateProfile, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
