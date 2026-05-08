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
    let mounted = true

    // Hard fallback: if Supabase's auth init hangs (orphaned cross-tab lock,
    // network stall on getSession, etc.) we force loading=false after 6s so
    // the app actually renders something instead of a forever-spinner.
    const failsafeId = setTimeout(() => {
      if (mounted) {
        console.warn('[auth] init timed out — forcing loaded state')
        setLoading(false)
      }
    }, 6000)

    // Single source of truth: onAuthStateChange always fires INITIAL_SESSION
    // immediately on subscribe with the current persisted session (or null).
    // We also kick off a getSession() in parallel as a belt-and-suspenders
    // path in case the listener doesn't fire for some reason.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      clearTimeout(failsafeId)

      if (event === 'SIGNED_OUT' || !session?.user) {
        setUser(null)
        setProfile(null)
        setLoading(false)
        return
      }

      setUser(session.user)
      // TOKEN_REFRESHED keeps the existing profile; everything else refetches.
      if (event === 'TOKEN_REFRESHED' && profile) {
        setLoading(false)
        return
      }
      try {
        await fetchProfile(session.user.id)
      } finally {
        if (mounted) setLoading(false)
      }
    })

    // Belt-and-suspenders: if the listener somehow doesn't fire INITIAL_SESSION
    // within 1s, try a direct read.
    const directReadId = setTimeout(async () => {
      if (!mounted || !loading) return
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!mounted) return
        if (session?.user) {
          setUser(session.user)
          await fetchProfile(session.user.id)
        }
      } catch (e) {
        console.error('[auth] direct getSession failed:', e)
      } finally {
        if (mounted) setLoading(false)
      }
    }, 1000)

    return () => {
      mounted = false
      clearTimeout(failsafeId)
      clearTimeout(directReadId)
      subscription.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
