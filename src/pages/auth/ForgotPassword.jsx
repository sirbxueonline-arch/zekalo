import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

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
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="bg-white border border-border-soft rounded-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl mb-2">
            <span className="text-gray-900">Zeka</span>
            <span className="text-purple">lo</span>
          </h1>
          <p className="text-sm text-gray-500">Şifrəni sıfırla</p>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="bg-teal-light border border-teal-mid rounded-md px-4 py-3 mb-6 text-sm text-[#085041]">
              E-poçt ünvanınıza şifrə sıfırlama linki göndərildi.
            </div>
            <Link to="/daxil-ol" className="text-sm text-purple hover:text-purple-dark font-medium">
              Daxil olmağa qayıt
            </Link>
          </div>
        ) : (
          <>
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
                Daxil olmağa qayıt
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
