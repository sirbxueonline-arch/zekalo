import { Link } from 'react-router-dom'
import { ArrowLeft, Mail } from 'lucide-react'

export default function Verify() {
  return (
    <div
      style={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
        background: 'var(--canvas)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <style>{`
        @keyframes authFadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .auth-card-anim { animation: authFadeUp .5s cubic-bezier(.22,1,.36,1) both; position: relative; z-index: 5; }
        .auth-link {
          color: var(--brand-500); text-decoration: none; font-weight: 600; transition: color .15s;
          display: inline-flex; align-items: center; gap: 5px;
        }
        .auth-link:hover { color: var(--brand-700); }
        .auth-link-muted {
          color: var(--ink-600); text-decoration: none; font-size: 13px; font-weight: 600; transition: color .15s;
        }
        .auth-link-muted:hover { color: var(--ink-900); }
        @media (prefers-reduced-motion: reduce) {
          .auth-card-anim { animation: none; }
        }
      `}</style>

      {/* Single calm hero wash */}
      <div className="hb1" />

      {/* Back to home */}
      <div style={{ position: 'fixed', top: 24, left: 28, zIndex: 20 }}>
        <Link to="/" className="auth-link-muted" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ArrowLeft style={{ width: 14, height: 14 }} /> Zirva
        </Link>
      </div>

      {/* Card */}
      <div
        className="auth-card-anim liquid-card"
        style={{ width: '100%', maxWidth: 420, padding: '44px 36px', textAlign: 'center', borderRadius: 16 }}
      >
        {/* Logo row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 28 }}>
          <span className="font-display" style={{ fontWeight: 800, fontSize: 21, color: 'var(--ink-900)', letterSpacing: '-0.02em' }}>Zirva</span>
        </div>

        {/* Mail icon chip */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
          <div
            style={{
              width: 60, height: 60, borderRadius: 16,
              background: 'var(--brand-50)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--brand-500)',
            }}
          >
            <Mail style={{ width: 28, height: 28 }} />
          </div>
        </div>

        {/* Heading */}
        <h1 className="font-display" style={{
          fontSize: 'clamp(1.4rem,3vw,1.65rem)', fontWeight: 700,
          letterSpacing: '-0.02em', marginBottom: 10,
          color: 'var(--ink-900)', lineHeight: 1.18,
        }}>
          E-poçtunuzu yoxlayın
        </h1>

        <p style={{ fontSize: 14, color: 'var(--ink-600)', marginBottom: 28, lineHeight: 1.65, maxWidth: 320, margin: '0 auto 28px' }}>
          Hesabınızı təsdiqləmək üçün e-poçt ünvanınıza link göndərdik. Linki kliklədikdən sonra daxil ola bilərsiniz.
        </p>

        {/* Decorative progress dots */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 28 }}>
          {['var(--brand-500)', 'var(--brand-300)', 'var(--hairline-strong)'].map((color, i) => (
            <div key={i} style={{
              width: i === 0 ? 20 : 8, height: 8, borderRadius: 999,
              background: color, transition: 'all .3s ease',
            }} />
          ))}
        </div>

        <Link to="/daxil-ol" className="auth-link" style={{ fontSize: 13.5, justifyContent: 'center' }}>
          <ArrowLeft style={{ width: 13, height: 13 }} />
          Daxil olmağa qayıt
        </Link>
      </div>
    </div>
  )
}
