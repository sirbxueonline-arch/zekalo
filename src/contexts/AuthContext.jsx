import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { t as translate } from '../lib/i18n'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileError, setProfileError] = useState(false)

  async function fetchProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, school:schools(*)')
        .eq('id', userId)
        .single()
      if (error) {
        console.error('Profile fetch error:', error)
        setProfileError(true)
        return null
      }
      setProfile(data)
      setProfileError(false)
      return data
    } catch (err) {
      console.error('Profile fetch exception:', err)
      setProfileError(true)
      return null
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setLoading(false))
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
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
    return data
  }

  const lang = profile?.language || 'az'
  const t = useCallback((key) => translate(key, lang), [lang])

  return (
    <AuthContext.Provider value={{ user, profile, loading, profileError, lang, t, signIn, signUp, signOut, updateProfile, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
