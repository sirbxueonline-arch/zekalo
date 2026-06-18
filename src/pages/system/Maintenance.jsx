import Mascot from '../../components/ui/Mascot'

export default function Maintenance() {
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
        {/* One contained mascot — reading pose */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <Mascot pose="reading" size={96} bob />
        </div>

        {/* Brand wordmark */}
        <h1
          className="font-display"
          style={{
            fontSize: 32,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            marginBottom: 14,
            lineHeight: 1.1,
          }}
        >
          <span style={{ color: 'var(--ink-900)' }}>Zir</span>
          <span style={{ color: 'var(--brand-500)' }}>va</span>
        </h1>

        <h2
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: 'var(--ink-900)',
            marginBottom: 10,
          }}
        >
          Texniki xidmət
        </h2>

        <p
          style={{
            fontSize: 15,
            color: 'var(--ink-600)',
            lineHeight: 1.6,
            maxWidth: 320,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          Zirva yenilənir. Tezliklə geri qayıdacağıq.
        </p>
      </div>
    </div>
  )
}
