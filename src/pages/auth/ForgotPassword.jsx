import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { CheckCircle } from 'lucide-react'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/sifre-yenile`,
      })
      if (error) throw error
      setSent(true)
    } catch {
      setError('Xəta baş verdi. Yenidən cəhd edin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="flex items-center gap-2 justify-center mb-6">
            <ZirvaIconDark />
            <span className="font-serif text-2xl text-gray-900">Zirva</span>
          </div>
          <h1 className="font-serif text-3xl text-gray-900 mb-2">Şifrəni sıfırla</h1>
          <p className="text-sm text-gray-500">
            E-poçt ünvanınızı daxil edin — şifrə sıfırlama linki göndərəcəyik
          </p>
        </div>

        <div className="bg-white border border-border-soft rounded-2xl p-8">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 bg-teal-light rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-7 h-7 text-teal" />
              </div>
              <div>
                <p className="font-medium text-gray-900 mb-1">Link göndərildi</p>
                <p className="text-sm text-gray-500">
                  <strong>{email}</strong> ünvanına şifrə sıfırlama linki göndərildi. E-poçt qutunuzu yoxlayın.
                </p>
              </div>
              <Link to="/daxil-ol" className="inline-block text-sm text-purple hover:text-purple-dark font-medium transition-colors mt-2">
                Daxil olmağa qayıt
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6 text-sm text-red-700">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="E-poçt"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="ad@mekteb.az"
                  required
                />
                <Button type="submit" loading={loading} className="w-full">
                  Link göndər
                </Button>
              </form>
              <p className="text-sm text-gray-500 text-center mt-6">
                <Link to="/daxil-ol" className="text-purple hover:text-purple-dark font-medium">
                  Geri qayıt
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function ZirvaIconDark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 3L26 23H2L14 3Z" fill="#534AB7" fillOpacity="0.15" stroke="#534AB7" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M14 3L20 15H8L14 3Z" fill="#534AB7" strokeWidth="0"/>
    </svg>
  )
}
