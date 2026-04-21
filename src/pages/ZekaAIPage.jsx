import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, GraduationCap, BookOpen, LayoutDashboard, Sparkles, CheckCircle } from 'lucide-react'
import { useLang } from '../contexts/LanguageContext'

/* ─── Translations ─── */
const STR = {
  az: {
    nav_signin: 'Daxil ol',
    nav_contact: 'Bizimlə Əlaqə',
    hero_eyebrow: 'Süni İntellekt',
    hero_headline: 'Zəka AI',
    hero_tagline: 'Şagirdlər öyrənir. Müəllimlər öyrədir. Zəka hər ikisini gücləndirir.',
    hero_btn: 'Zəka ilə tanış ol',
    chat_user: 'Kvadrat tənlikləri necə həll etmək olar?',
    chat_zeka: 'Kvadrat tənliklər ax²+bx+c=0 formasında yazılır. Üç əsas üsul var: çarpanlara ayırma, tam kvadrat metodu və diskriminant düsturu. Hansından başlayaq?',
    audience_title: 'Hər kəs üçün fərqli, hamı üçün güclü',
    card1_title: 'Şagirdlər üçün',
    card1_features: [
      'Ev tapşırıqlarında addım-addım köməklik',
      'İmtahan hazırlığı üçün fərdi plan',
      'İzah, xülasə, nümunə çıxarma',
      'Dərsi qaçırdınsa? Zəka cəmləşdirər',
    ],
    card2_title: 'Müəllimlər üçün',
    card2_features: [
      'Avtomatik hesabat generasiyası',
      'Dərs planı yaratma köməyi',
      'Esse rəyi aləti',
      'Şagird irəliləyiş xülasəsi',
    ],
    card3_title: 'Adminlər üçün',
    card3_features: [
      'Sinif performans xülasələri',
      'Davamiyyət anomaliyaları',
      'Müəllim yükü analizi',
      'Valideyn məlumatlandırma mərkəzi',
    ],
    stat1_val: '4 saatdan 20 dəqiqəyə',
    stat1_sub: 'həftəlik hesabat işi',
    stat2_val: '3× daha sürətli',
    stat2_sub: 'dərs planlaması',
    stat3_val: '98%',
    stat3_sub: 'şagird məmnuniyyəti',
    cta_headline: 'Zəkanı sinifinizə gətirin',
    cta_sub: 'Zəka AI bütün Zirva planlarında daxildir. Hesab yaratmaq üçün bizimlə əlaqə saxlayın.',
    cta_btn: 'Başla',
    footer: '© 2026 Zirva LLC',
  },
  en: {
    nav_signin: 'Sign In',
    nav_contact: 'Contact Us',
    hero_eyebrow: 'Artificial Intelligence',
    hero_headline: 'Zeka AI',
    hero_tagline: 'Students learn. Teachers teach. Zeka powers both.',
    hero_btn: 'Meet Zeka',
    chat_user: 'How do I solve quadratic equations?',
    chat_zeka: 'Quadratic equations follow ax²+bx+c=0. There are three main methods: factoring, completing the square, and the quadratic formula. Which shall we start with?',
    audience_title: 'Different for everyone, powerful for all',
    card1_title: 'For Students',
    card1_features: [
      'Step-by-step homework help',
      'Personalised exam prep plan',
      'Explanations, summaries, examples',
      'Missed a lesson? Zeka will catch you up',
    ],
    card2_title: 'For Teachers',
    card2_features: [
      'Automated report generation',
      'Lesson plan creation support',
      'Essay feedback tool',
      'Student progress summaries',
    ],
    card3_title: 'For Administrators',
    card3_features: [
      'Class performance summaries',
      'Attendance anomaly detection',
      'Teacher workload analysis',
      'Parent communication hub',
    ],
    stat1_val: '4 hours to 20 minutes',
    stat1_sub: 'weekly reporting work',
    stat2_val: '3× faster',
    stat2_sub: 'lesson planning',
    stat3_val: '98%',
    stat3_sub: 'student satisfaction',
    cta_headline: 'Bring Zeka to your classroom',
    cta_sub: 'Zeka AI is included in all Zirva plans. Get in touch to get started.',
    cta_btn: 'Get Started',
    footer: '© 2026 Zirva LLC',
  },
}

/* ─── MiniNav ─── */
function MiniNav({ s, lang, setLang }) {
  const [open, setOpen] = useState(false)
  return (
    <header
      className="sticky top-0 z-50 bg-white/95 backdrop-blur-2xl"
      style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.055), 0 4px 24px rgba(0,0,0,0.05)' }}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10 flex items-center justify-between h-[72px]">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <img src="/logo.png" alt="Zirva" width={28} height={28} className="object-contain" />
          <span className="text-[19px] font-extrabold text-gray-900 tracking-tight">Zirva</span>
        </Link>

        {/* Right actions — desktop */}
        <div className="hidden lg:flex items-center gap-1.5">
          <div className="flex items-center rounded-lg p-0.5 mr-1" style={{ background: 'rgba(0,0,0,0.05)' }}>
            {['az', 'en'].map(l => (
              <button
                key={l} onClick={() => setLang(l)}
                className="px-2.5 py-1.5 rounded-md text-[11px] font-extrabold tracking-wide transition-all duration-200"
                style={lang === l
                  ? { background: '#fff', color: '#534AB7', boxShadow: '0 1px 4px rgba(0,0,0,0.12)' }
                  : { color: '#9ca3af' }}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <Link
            to="/daxil-ol"
            className="px-4 py-2 text-[14px] text-gray-500 hover:text-gray-900 font-semibold rounded-lg hover:bg-gray-100/80 transition-all"
          >
            {s.nav_signin}
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center gap-1.5 text-white text-[14px] font-bold px-5 py-[10px] rounded-xl transition-all hover:-translate-y-px active:translate-y-0"
            style={{
              background: 'linear-gradient(135deg,#6056CC 0%,#534AB7 55%,#4A41A8 100%)',
              boxShadow: '0 2px 10px rgba(83,74,183,0.45), 0 1px 2px rgba(0,0,0,0.1)',
            }}
          >
            {s.nav_contact}
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(v => !v)}
          className="lg:hidden p-2 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden bg-white/98 border-t border-gray-100 px-6 pt-4 pb-6">
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
            <div className="flex items-center rounded-lg p-0.5" style={{ background: 'rgba(0,0,0,0.06)' }}>
              {['az', 'en'].map(l => (
                <button
                  key={l} onClick={() => setLang(l)}
                  className="px-3 py-1.5 rounded-md text-xs font-extrabold transition-all"
                  style={lang === l
                    ? { background: '#fff', color: '#534AB7', boxShadow: '0 1px 4px rgba(0,0,0,0.12)' }
                    : { color: '#9ca3af' }}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Link to="/daxil-ol" className="text-sm text-gray-500 font-semibold px-3 py-2">
                {s.nav_signin}
              </Link>
              <Link
                to="/contact"
                className="text-white text-sm font-bold px-5 py-2.5 rounded-xl"
                style={{ background: 'linear-gradient(135deg,#6056CC,#534AB7)', boxShadow: '0 2px 8px rgba(83,74,183,0.4)' }}
              >
                {s.nav_contact}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

/* ─── Main Page ─── */
export default function ZekaAIPage() {
  const { lang, setLang } = useLang()
  const s = STR[lang] || STR.az

  const audienceCards = [
    {
      icon: GraduationCap,
      title: s.card1_title,
      features: s.card1_features,
      accent: '#534AB7',
    },
    {
      icon: BookOpen,
      title: s.card2_title,
      features: s.card2_features,
      accent: '#1D9E75',
    },
    {
      icon: LayoutDashboard,
      title: s.card3_title,
      features: s.card3_features,
      accent: '#2563eb',
    },
  ]

  const stats = [
    { val: s.stat1_val, sub: s.stat1_sub },
    { val: s.stat2_val, sub: s.stat2_sub },
    { val: s.stat3_val, sub: s.stat3_sub },
  ]

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        body, * { font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; }
        @keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>

      <MiniNav s={s} lang={lang} setLang={setLang} />

      {/* ── Hero ── */}
      <section
        style={{
          background: '#060614',
          position: 'relative',
          overflow: 'hidden',
          padding: '96px 24px 80px',
          textAlign: 'center',
        }}
      >
        {/* Glow orbs */}
        <div style={{
          position: 'absolute', top: '-10%', left: '-8%',
          width: '52%', height: '60%',
          background: 'radial-gradient(ellipse, rgba(83,74,183,.25) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: '20%', right: '-5%',
          width: '44%', height: '50%',
          background: 'radial-gradient(ellipse, rgba(109,40,217,.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 760, margin: '0 auto' }}>
          {/* Eyebrow */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            marginBottom: 24,
            padding: '6px 16px',
            borderRadius: 99,
            border: '1px solid rgba(167,139,250,0.3)',
            background: 'rgba(167,139,250,0.08)',
          }}>
            <Sparkles style={{ width: 14, height: 14, color: '#a78bfa' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#a78bfa', letterSpacing: '0.04em' }}>
              {s.hero_eyebrow}
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(3rem, 8vw, 5.5rem)',
            fontWeight: 800,
            lineHeight: 1.05,
            marginBottom: 20,
            letterSpacing: '-0.04em',
            background: 'linear-gradient(135deg, #a78bfa 0%, #818cf8 45%, #93c5fd 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            {s.hero_headline}
          </h1>

          <p style={{
            fontSize: 'clamp(1.05rem, 2.5vw, 1.3rem)',
            color: 'rgba(255,255,255,0.7)',
            lineHeight: 1.65,
            maxWidth: 560,
            margin: '0 auto 36px',
          }}>
            {s.hero_tagline}
          </p>

          <Link
            to="/daxil-ol"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'linear-gradient(135deg,#6056CC 0%,#534AB7 55%,#4A41A8 100%)',
              color: '#fff',
              fontWeight: 700,
              fontSize: 15,
              padding: '14px 32px',
              borderRadius: 14,
              textDecoration: 'none',
              boxShadow: '0 4px 24px rgba(83,74,183,0.55)',
              marginBottom: 56,
            }}
          >
            {s.hero_btn}
          </Link>

          {/* Chat mock card */}
          <div style={{
            maxWidth: 480,
            margin: '0 auto',
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 20,
            padding: '24px',
            textAlign: 'left',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'linear-gradient(135deg,#6056CC,#534AB7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Sparkles style={{ width: 16, height: 16, color: '#fff' }} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
                  {lang === 'az' ? 'Zəka' : 'Zeka'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%', background: '#1D9E75',
                    animation: 'pulse-dot 2s ease-in-out infinite',
                  }} />
                  <span style={{ fontSize: 11, color: '#1D9E75', fontWeight: 500 }}>
                    {lang === 'az' ? 'Aktiv' : 'Online'}
                  </span>
                </div>
              </div>
            </div>

            {/* User message */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
              <div style={{
                background: 'linear-gradient(135deg,#534AB7,#6056CC)',
                color: '#fff',
                fontSize: 13,
                fontWeight: 500,
                padding: '10px 14px',
                borderRadius: '16px 16px 4px 16px',
                maxWidth: '80%',
                lineHeight: 1.5,
              }}>
                {s.chat_user}
              </div>
            </div>

            {/* Zeka reply */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                background: 'linear-gradient(135deg,#6056CC,#534AB7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Sparkles style={{ width: 12, height: 12, color: '#fff' }} />
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.07)',
                color: 'rgba(255,255,255,0.88)',
                fontSize: 13,
                fontWeight: 400,
                padding: '10px 14px',
                borderRadius: '4px 16px 16px 16px',
                lineHeight: 1.6,
              }}>
                {s.chat_zeka}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Audience Cards ── */}
      <section style={{ background: '#f8f9fa', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{
            textAlign: 'center',
            fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
            fontWeight: 800,
            color: '#0f0f1a',
            marginBottom: 48,
            letterSpacing: '-0.02em',
          }}>
            {s.audience_title}
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
          }}>
            {audienceCards.map((card) => {
              const IconComp = card.icon
              return (
                <div
                  key={card.title}
                  style={{
                    background: '#fff',
                    borderRadius: 16,
                    boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
                    border: '1px solid #f0f0f0',
                    padding: '28px',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.1)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.06)'
                  }}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: `${card.accent}14`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 16,
                  }}>
                    <IconComp style={{ width: 22, height: 22, color: card.accent }} />
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f0f1a', marginBottom: 16 }}>
                    {card.title}
                  </h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {card.features.map(f => (
                      <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#374151', fontWeight: 500, lineHeight: 1.5 }}>
                        <CheckCircle style={{ width: 15, height: 15, color: card.accent, flexShrink: 0, marginTop: 1 }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Stats Strip ── */}
      <section
        style={{
          background: '#060614',
          padding: '64px 24px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{
          maxWidth: 900,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 32,
          textAlign: 'center',
        }}>
          {stats.map((stat, i) => (
            <div key={i}>
              <div style={{
                fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
                fontWeight: 800,
                color: '#fff',
                marginBottom: 6,
                background: 'linear-gradient(135deg, #a78bfa 0%, #818cf8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                {stat.val}
              </div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
                {stat.sub}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        style={{
          background: '#060614',
          position: 'relative',
          overflow: 'hidden',
          padding: '88px 24px',
          textAlign: 'center',
        }}
      >
        <div style={{
          position: 'absolute', top: '-20%', left: '20%',
          width: '60%', height: '100%',
          background: 'radial-gradient(ellipse, rgba(83,74,183,.2) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
            fontWeight: 800,
            color: '#fff',
            marginBottom: 16,
            lineHeight: 1.25,
            letterSpacing: '-0.02em',
          }}>
            {s.cta_headline}
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', marginBottom: 36, lineHeight: 1.7 }}>
            {s.cta_sub}
          </p>
          <Link
            to="/contact"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'linear-gradient(135deg,#6056CC 0%,#534AB7 55%,#4A41A8 100%)',
              color: '#fff',
              fontWeight: 700,
              fontSize: 15,
              padding: '14px 32px',
              borderRadius: 14,
              textDecoration: 'none',
              boxShadow: '0 4px 20px rgba(83,74,183,0.5)',
            }}
          >
            {s.cta_btn}
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: '#060614', borderTop: '1px solid rgba(255,255,255,0.07)', padding: '24px', textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>{s.footer}</p>
      </footer>
    </div>
  )
}
