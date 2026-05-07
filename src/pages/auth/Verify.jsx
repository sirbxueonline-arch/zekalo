import { Link } from 'react-router-dom'
import { Mail, ArrowLeft } from 'lucide-react'

export default function Verify() {
  return (
    <div
      style={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
        background: 'linear-gradient(-45deg, #e8ecff, #f8f7fb, #c8e6e0, #f5e6d8, #b8c0ff, #f8f7fb)',
        backgroundSize: '400% 400%',
        animation: 'heroGradient 12s ease infinite',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <style>{`
        @keyframes heroGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes authFadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .auth-card-anim { animation: authFadeUp .55s cubic-bezier(.22,1,.36,1) both; position: relative; z-index: 5; }
        .auth-link { color: #7c6ee0; text-decoration: none; font-weight: 600; transition: color .15s; }
        .auth-link:hover { color: #5b4fcf; }
        .auth-link-muted { color: #64748b; text-decoration: none; font-size: 13px; font-weight: 600; transition: color .15s; }
        .auth-link-muted:hover { color: #1a1a2e; }
      `}</style>

      <div className="hb1" />
      <div className="hb2" />
      <div className="hb4" />
      <div className="hb6" />

      <div style={{ position: 'fixed', top: 24, left: 28, zIndex: 20 }}>
        <Link to="/" className="auth-link-muted" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ArrowLeft style={{ width: 14, height: 14 }} /> Zirva
        </Link>
      </div>

      <div
        className="auth-card-anim liquid-card"
        style={{ width: '100%', maxWidth: 420, padding: '40px 36px', textAlign: 'center' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 26 }}>
          <img src="/logo.png" alt="Zirva" style={{ height: 30 }} />
          <span style={{ fontWeight: 800, fontSize: 20, color: '#1a1a2e', letterSpacing: '-0.01em' }}>Zirva</span>
        </div>

        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(124,110,224,0.18), rgba(93,184,163,0.18))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 18px',
            border: '1px solid rgba(124,110,224,0.25)',
          }}
        >
          <Mail style={{ width: 30, height: 30, color: '#7c6ee0' }} />
        </div>

        <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 10, color: '#1a1a2e', lineHeight: 1.15 }}>
          <span className="pastel-text">E-poçtunuzu yoxlayın</span>
        </h1>
        <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24, lineHeight: 1.6 }}>
          Hesabınızı təsdiqləmək üçün e-poçt ünvanınıza link göndərdik. Linki kliklədikdən sonra daxil ola bilərsiniz.
        </p>

        <Link to="/daxil-ol" className="auth-link" style={{ fontSize: 13.5 }}>
          Daxil olmağa qayıt
        </Link>
      </div>
    </div>
  )
}
