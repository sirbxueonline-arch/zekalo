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
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="bg-white border border-border-soft rounded-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl mb-2">
            <span className="text-gray-900">Zeka</span>
            <span className="text-purple">lo</span>
          </h1>
          <p className="text-sm text-gray-500">Yeni şifrə təyin edin</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md px-4 py-3 mb-6 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Yeni şifrə" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          <Input
            label="Şifrəni təsdiqləyin"
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            error={confirm && password !== confirm ? 'Şifrələr uyğun gəlmir' : ''}
            required
          />
          <Button type="submit" loading={loading} className="w-full">
            Şifrəni yenilə
          </Button>
        </form>
      </div>
    </div>
  )
}
