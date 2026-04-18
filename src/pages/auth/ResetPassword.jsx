import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useLang } from '../../contexts/LanguageContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function ResetPassword() {
  const { t } = useLang()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    if (password !== confirm) { setError('Şifrələr uyğun gəlmir'); return }
    if (password.length < 6) { setError('Şifrə ən az 6 simvol olmalıdır'); return }
    setError('')
    setLoading(true)
    const { error: err } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (err) { setError(err.message); return }
    navigate('/daxil-ol?reset=1')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="flex items-center gap-2 justify-center mb-6">
            <img src="/logo.png" alt="Zirva" width="28" height="28" className="object-contain" />
            <span className="font-serif text-2xl text-gray-900">Zirva</span>
          </div>
          <h1 className="font-serif text-3xl text-gray-900 mb-2">{t('new_password_set')}</h1>
          <p className="text-sm text-gray-500">{t('new_password_subtitle')}</p>
        </div>

        <div className="bg-white border border-border-soft rounded-2xl p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={t('new_password')}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={t('new_password_placeholder')}
              required
            />
            <Input
              label={t('confirm_password')}
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder={t('confirm_password_placeholder')}
              error={confirm && password !== confirm ? t('passwords_dont_match') : ''}
              required
            />
            <Button type="submit" loading={loading} className="w-full">
              {t('update_password_btn')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

