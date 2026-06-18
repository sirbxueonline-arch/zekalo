import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Mascot from '../../components/ui/Mascot'

export default function NotFound() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  function goHome() {
    if (!profile) return navigate('/daxil-ol')
    const paths = {
      student: '/dashboard',
      teacher: '/muellim/dashboard',
      parent: '/valideyn/dashboard',
      admin: '/admin/dashboard',
    }
    navigate(paths[profile.role] || '/daxil-ol')
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'var(--canvas)',
      }}
    >
      <div
        className="liquid-card"
        style={{
          padding: '48px 40px',
          textAlign: 'center',
          maxWidth: 440,
          width: '100%',
          borderRadius: 18,
        }}
      >
        {/* One contained mascot — thinking pose */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <Mascot pose="thinking" size={96} bob />
        </div>

        {/* 404 hero number */}
        <div
          className="font-display"
          style={{
            fontSize: 64,
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: '-0.03em',
            color: 'var(--brand-500)',
            marginBottom: 4,
          }}
        >
          404
        </div>

        <h1
          className="font-display"
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: 'var(--ink-900)',
            marginBottom: 8,
            letterSpacing: '-0.01em',
          }}
        >
          Səhifə tapılmadı
        </h1>

        <p
          style={{
            fontSize: 15,
            color: 'var(--ink-600)',
            lineHeight: 1.6,
            marginBottom: 28,
            maxWidth: 320,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          Axtardığınız səhifə mövcud deyil və ya silinib.
        </p>

        <Button variant="primary" size="lg" onClick={goHome}>
          Ana səhifəyə qayıt
        </Button>
      </div>
    </div>
  )
}
