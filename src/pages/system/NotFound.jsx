import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'

export default function NotFound() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  function goHome() {
    if (!profile) return navigate('/daxil-ol')
    const paths = { student: '/dashboard', teacher: '/muellim/dashboard', parent: '/valideyn/dashboard', admin: '/admin/dashboard' }
    navigate(paths[profile.role] || '/daxil-ol')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface px-4">
      <span className="text-[120px] font-serif text-border-soft leading-none">404</span>
      <h1 className="font-serif text-3xl text-gray-900 mt-4 mb-2">Səhifə tapılmadı</h1>
      <p className="text-sm text-gray-500 mb-8">Axtardığınız səhifə mövcud deyil və ya silinib.</p>
      <Button onClick={goHome}>Ana səhifəyə qayıt</Button>
    </div>
  )
}
