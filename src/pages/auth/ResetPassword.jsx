import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    if (password !== confirm) {
      setError('Şifrələr uyğun gəlmir')
      return
    }
    setError('')
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      navigate('/daxil-ol')
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
          <h1 className="font-serif text-3xl text-gray-900 mb-2">Yeni şifrə</h1>
          <p className="text-sm text-gray-500">Hesabınız üçün yeni şifrə təyin edin</p>
        </div>

        <div className="bg-white border border-border-soft rounded-2xl p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Yeni şifrə"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Minimum 6 simvol"
              required
            />
            <Input
              label="Şifrəni təsdiqləyin"
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Şifrəni yenidən daxil edin"
              error={confirm && password !== confirm ? 'Şifrələr uyğun gəlmir' : ''}
              required
            />
            <Button type="submit" loading={loading} className="w-full">
              Şifrəni yenilə
            </Button>
          </form>
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
