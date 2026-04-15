import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useLang } from '../../contexts/LanguageContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { CheckCircle } from 'lucide-react'

export default function ForgotPassword() {
  const { t } = useLang()
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
      setError(t('error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="flex items-center gap-2 justify-center mb-6">
            <img src="/logo.png" alt="Zirva" width="28" height="28" className="object-contain" />
            <span className="font-serif text-2xl text-gray-900">Zirva</span>
          </div>
          <h1 className="font-serif text-3xl text-gray-900 mb-2">{t('reset_password')}</h1>
          <p className="text-sm text-gray-500">
            {t('forgot_subtitle')}
          </p>
        </div>

        <div className="bg-white border border-border-soft rounded-2xl p-8">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 bg-teal-light rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-7 h-7 text-teal" />
              </div>
              <div>
                <p className="font-medium text-gray-900 mb-1">{t('link_sent')}</p>
                <p className="text-sm text-gray-500">
                  <strong>{email}</strong> {t('link_sent_body')}
                </p>
              </div>
              <Link to="/daxil-ol" className="inline-block text-sm text-purple hover:text-purple-dark font-medium transition-colors mt-2">
                {t('back_to_login')}
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
                  label={t('email')}
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="ad@mekteb.az"
                  required
                />
                <Button type="submit" loading={loading} className="w-full">
                  {t('send_link')}
                </Button>
              </form>
              <p className="text-sm text-gray-500 text-center mt-6">
                <Link to="/daxil-ol" className="text-purple hover:text-purple-dark font-medium">
                  {t('back_to_login')}
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

