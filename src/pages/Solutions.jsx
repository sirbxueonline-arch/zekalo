import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, CheckCircle, Building2 } from 'lucide-react'
import { useLang } from '../contexts/LanguageContext'

/* ─── Translations ─── */
const STR = {
  az: {
    nav_signin: 'Daxil ol',
    nav_contact: 'Bizimlə Əlaqə',
    hero_headline: 'Hər kurikulum üçün doğru həll',
    hero_sub: 'IB dünya məktəbləri və Azərbaycan dövlət məktəbləri üçün xüsusi hazırlanmış modul sistem.',
    programmes_title: 'Dəstəklənən Proqramlar',
    learn_more: 'Ətraflı',
    cta_headline: 'Məktəbiniz üçün doğru proqramı seçmək istəyirsiniz?',
    cta_sub: 'Komandamızla əlaqə saxlayın — hansı həllin sizə uyğun olduğunu birlikdə müəyyənləşdirək.',
    cta_btn: 'Bizimlə Əlaqə',
    footer: '© 2026 Zirva LLC',
  },
  en: {
    nav_signin: 'Sign In',
    nav_contact: 'Contact Us',
    hero_headline: 'The right solution for every school',
    hero_sub: 'Purpose-built modules for IB World Schools and Azerbaijani state schools.',
    programmes_title: 'Supported Programmes',
    learn_more: 'Learn more',
    cta_headline: 'Not sure which programme fits your school?',
    cta_sub: "Get in touch with our team and we'll help you find the right solution.",
    cta_btn: 'Contact Us',
    footer: '© 2026 Zirva LLC',
  },
}

const CARDS = {
  az: [
    {
      img: '/pyp.png',
      name: 'IB İlk İllər (PYP)',
      ages: '3–12',
      desc: 'Erkən yaş qrupları üçün güclü dəstək — qiymətləndirmə, irəliləyiş izləmə və valideyn məlumatlandırma.',
      features: ['Portfoliyo idarəetməsi', 'Unit of Inquiry planlaması', 'Şagird irəliləyiş hesabatı', 'Valideyn xəbərdarlıqları'],
      link: '/ib-pyp',
      accent: '#f59e0b',
    },
    {
      img: '/myp.png',
      name: 'IB Orta İllər (MYP)',
      ages: '11–16',
      desc: 'Tədqiqat əsaslı tədrisin planlaşdırılması və IB kriteriyaları ilə tam uyğunlaşdırılmış qiymətləndirmə.',
      features: ['Unit Planner aləti', 'Kriteriya qiymətləndirməsi (A–D)', 'Şagird irəliləyiş analitikası', 'e-Portfoliyo dəstəyi'],
      link: '/ib-myp',
      accent: '#ef4444',
    },
    {
      img: '/dp.png',
      name: 'IB Diploma (DP)',
      ages: '16–19',
      desc: 'Diploma Proqramının bütün komponentlərini — imtahan qeydiyyatından CAS-a qədər — bir yerdə idarə edin.',
      features: ['IBIS imtahan qeydiyyatı', 'CAS fəaliyyət izlənməsi', 'DP predmet qiymətlər cədvəli', 'Kollec məsləhətçisi modulü'],
      link: '/ib-diploma',
      accent: '#3b82f6',
    },
    {
      img: '/cp.png',
      name: 'IB Karyera (CP)',
      ages: '16–19',
      desc: 'Karyera əlaqəli tədris və şəxsi inkişaf üçün tam dəstək.',
      features: ['Karyera inkişaf planı', 'Reflective Project izlənməsi', 'Şəxsi-peşə bacarıqları', 'IBIS inteqrasiyası'],
      link: '/ib-career',
      accent: '#a855f7',
    },
    {
      img: null,
      icon: Building2,
      name: 'Milli Kurikulum',
      ages: '6–18',
      desc: 'Nazirlik uyğunluqlu hesabatlar, E-Gov.az inteqrasiyası və dövlət məktəblərinin tələblərinə tam cavab verir.',
      features: ['10 ballıq qiymətləndirmə sistemi', 'Nazirlik hesabatları', 'E-Gov.az avtomatik ixrac', 'Davamiyyət + qiymət sinxronizasiyası'],
      link: '/government-schools',
      accent: '#1D9E75',
    },
  ],
  en: [
    {
      img: '/pyp.png',
      name: 'IB Primary Years (PYP)',
      ages: '3–12',
      desc: 'Full support for early years — assessment, progress tracking and parent communication.',
      features: ['Portfolio management', 'Unit of Inquiry planning', 'Student progress reports', 'Parent alerts'],
      link: '/ib-pyp',
      accent: '#f59e0b',
    },
    {
      img: '/myp.png',
      name: 'IB Middle Years (MYP)',
      ages: '11–16',
      desc: 'Inquiry-based planning and full IB criteria-aligned assessment.',
      features: ['Unit Planner tool', 'Criteria assessment (A–D)', 'Student analytics', 'e-Portfolio support'],
      link: '/ib-myp',
      accent: '#ef4444',
    },
    {
      img: '/dp.png',
      name: 'IB Diploma (DP)',
      ages: '16–19',
      desc: 'Manage every DP component — from exam registration to CAS — in one place.',
      features: ['IBIS exam registration', 'CAS activity tracking', 'DP subject grade tracker', 'College counselling module'],
      link: '/ib-diploma',
      accent: '#3b82f6',
    },
    {
      img: '/cp.png',
      name: 'IB Career-Related (CP)',
      ages: '16–19',
      desc: 'Complete support for career-related learning and personal development.',
      features: ['Career development plan', 'Reflective Project tracking', 'Personal-professional skills', 'IBIS integration'],
      link: '/ib-career',
      accent: '#a855f7',
    },
    {
      img: null,
      icon: Building2,
      name: 'National Curriculum',
      ages: '6–18',
      desc: 'Ministry-compliant reports, E-Gov.az integration and full alignment with state school requirements.',
      features: ['10-point grading system', 'Ministry reports', 'E-Gov.az auto-export', 'Attendance + grade sync'],
      link: '/government-schools',
      accent: '#1D9E75',
    },
  ],
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
export default function Solutions() {
  const { lang, setLang } = useLang()
  const s = STR[lang] || STR.az
  const cards = CARDS[lang] || CARDS.az

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        body, * { font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; }
      `}</style>

      <MiniNav s={s} lang={lang} setLang={setLang} />

      {/* ── Hero ── */}
      <section
        style={{
          background: '#060614',
          position: 'relative',
          overflow: 'hidden',
          padding: '96px 24px 96px',
          textAlign: 'center',
        }}
      >
        {/* Glow orbs */}
        <div style={{
          position: 'absolute', top: '-10%', left: '-8%',
          width: '52%', height: '60%',
          background: 'radial-gradient(ellipse, rgba(83,74,183,.22) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: '10%', right: '-6%',
          width: '44%', height: '52%',
          background: 'radial-gradient(ellipse, rgba(29,158,117,.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 720, margin: '0 auto' }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.25rem)',
            fontWeight: 800,
            color: '#fff',
            lineHeight: 1.15,
            marginBottom: 20,
            letterSpacing: '-0.02em',
          }}>
            {s.hero_headline}
          </h1>
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            color: 'rgba(255,255,255,0.65)',
            lineHeight: 1.7,
            maxWidth: 560,
            margin: '0 auto',
          }}>
            {s.hero_sub}
          </p>
        </div>
      </section>

      {/* ── Programme Cards ── */}
      <section style={{ background: '#f8f9fa', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{
            textAlign: 'center',
            fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
            fontWeight: 800,
            color: '#0f0f1a',
            marginBottom: 48,
            letterSpacing: '-0.02em',
          }}>
            {s.programmes_title}
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 24,
          }}>
            {cards.map((card) => {
              const IconComp = card.icon
              return (
                <div
                  key={card.name}
                  style={{
                    background: '#fff',
                    borderRadius: 16,
                    boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
                    border: '1px solid #f0f0f0',
                    padding: '28px 28px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0,
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
                  {/* Logo / Icon */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    {card.img ? (
                      <img src={card.img} alt={card.name} style={{ width: 48, height: 48, objectFit: 'contain' }} />
                    ) : (
                      <div style={{
                        width: 48, height: 48, borderRadius: 12,
                        background: `${card.accent}18`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <IconComp style={{ width: 24, height: 24, color: card.accent }} />
                      </div>
                    )}
                    <span style={{
                      fontSize: 12, fontWeight: 700, color: card.accent,
                      background: `${card.accent}14`,
                      padding: '4px 10px', borderRadius: 20,
                    }}>
                      {card.ages}
                    </span>
                  </div>

                  {/* Name */}
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f0f1a', marginBottom: 8, lineHeight: 1.3 }}>
                    {card.name}
                  </h3>

                  {/* Description */}
                  <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.65, marginBottom: 18 }}>
                    {card.desc}
                  </p>

                  {/* Features */}
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {card.features.map(f => (
                      <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151', fontWeight: 500 }}>
                        <CheckCircle style={{ width: 15, height: 15, color: card.accent, flexShrink: 0 }} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* Link */}
                  <Link
                    to={card.link}
                    style={{
                      marginTop: 'auto',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 13,
                      fontWeight: 700,
                      color: card.accent,
                      textDecoration: 'none',
                    }}
                  >
                    {s.learn_more} →
                  </Link>
                </div>
              )
            })}
          </div>
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
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 640, margin: '0 auto' }}>
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
