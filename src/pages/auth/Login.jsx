import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, user, profile } = useAuth()
  const navigate = useNavigate()

  // When profile loads after login, redirect to dashboard
  useEffect(() => {
    if (user && profile) {
      const dashboards = { student: '/dashboard', teacher: '/muellim/dashboard', parent: '/valideyn/dashboard', admin: '/admin/dashboard' }
      navigate(dashboards[profile.role] || '/dashboard', { replace: true })
    }
  }, [user, profile, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      // onAuthStateChange will fetch profile, useEffect above will redirect
    } catch (err) {
      console.error('Login error:', err?.message || err)
      if (err?.message?.includes('Invalid login')) {
        setError('E-poçt və ya şifrə yanlışdır.')
      } else if (err?.message?.includes('Email not confirmed')) {
        setError('E-poçt təsdiqlənməyib. Supabase panelindən "Confirm email" söndürün.')
      } else {
        setError('Xəta baş verdi: ' + (err?.message || 'Yenidən cəhd edin.'))
      }
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="bg-white border border-border-soft rounded-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl mb-2">
            <span className="text-gray-900">Zeka</span>
            <span className="text-purple">lo</span>
          </h1>
          <p className="text-sm text-gray-500">Hesabınıza daxil olun</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md px-4 py-3 mb-6 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="E-poçt"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ad@mekteb.az"
            required
          />
          <div className="relative">
            <Input
              label="Şifrə"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <Button type="submit" loading={loading} className="w-full">
            Daxil ol
          </Button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <Link to="/sifremi-unutdum" className="text-sm text-purple hover:text-purple-dark transition-colors">
            Şifrəni unutmusunuz?
          </Link>
          <p className="text-sm text-gray-500">
            Hesabınız yoxdur?{' '}
            <Link to="/qeydiyyat" className="text-purple hover:text-purple-dark font-medium transition-colors">
              Qeydiyyat
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
