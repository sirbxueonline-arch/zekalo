import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Menu, X, BookOpen, ClipboardCheck, Calendar, BarChart2,
  MessageSquare, Clock, Users, Sparkles, CheckCircle,
} from 'lucide-react'
import { useLang } from '../contexts/LanguageContext'

/* ─── Translations ─── */
const STR = {
  az: {
    nav_signin: 'Daxil ol',
    nav_contact: 'Bizimlə Əlaqə',
    hero_h1: 'Lazım olan hər şey.',
    hero_h2: 'Lazım olmayan heç nə.',
    hero_body: 'Kurikulumdan hesabata, qiymətləndirmədən AI müəlliminə — tam iş axını bir platformada.',
    features_title: 'Bütün Xüsusiyyətlər',
    features_sub: '8 əsas modul, 60+ xüsusiyyət, sonsuz imkan.',
    cta_headline: 'Bütün xüsusiyyətləri canlı görmək istəyirsiniz?',
    cta_sub: 'Demo zamanı hər şeyi sizin məktəb kontekstinizdə göstərəcəyik.',
    cta_btn: 'Demo Sifariş Et',
    footer: '© 2026 Zirva LLC',
  },
  en: {
    nav_signin: 'Sign In',
    nav_contact: 'Contact Us',
    hero_h1: 'Everything you need.',
    hero_h2: "Nothing you don't.",
    hero_body: 'From curriculum to reporting, assessment to AI teacher — complete workflow in one platform.',
    features_title: 'All Features',
    features_sub: '8 core modules, 60+ features, endless possibilities.',
    cta_headline: 'Want to see all features live?',
    cta_sub: "We'll walk you through everything in the context of your school.",
    cta_btn: 'Book a Demo',
    footer: '© 2026 Zirva LLC',
  },
}

const FEATURE_CARDS = {
  az: [
    {
      icon: BookOpen,
      title: 'Kurikulum İdarəetməsi',
      features: ['Birgə kurikulum planlaması', '600+ daxili standart', 'Kurikulum uyğunluq alətləri', 'IBIS inteqrasiyası'],
      accent: '#7c3aed',
    },
    {
      icon: ClipboardCheck,
      title: 'Qiymətləndirmə',
      features: ['IB kriteriyaları (A–D şkalası)', 'Milli 10 ballıq sistem', 'Real vaxt sinxronizasiya', 'Şagird analitikası'],
      accent: '#2563eb',
    },
    {
      icon: Calendar,
      title: 'Davamiyyət',
      features: ['Bir toxunuşla qeydiyyat', 'Valideynlərə ani bildiriş', 'Davamiyyət trend analitikası', 'E-Gov.az uyğun hesabatlar'],
      accent: '#059669',
    },
    {
      icon: BarChart2,
      title: 'Hesabatlar & Analitika',
      features: ['Nazirlik uyğunluqlu hesabatlar', 'E-Gov.az avtomatik ixrac', 'PDF, Excel formatı', 'IB Audit sənədləşməsi'],
      accent: '#d97706',
    },
    {
      icon: MessageSquare,
      title: 'Kommunikasiya',
      features: ['Müəllim-valideyn mesajlaşması', 'Daxili elan sistemi', 'Tədbirlər və bildirişlər', 'Çoxdilli dəstək'],
      accent: '#0891b2',
    },
    {
      icon: Clock,
      title: 'Cədvəl İdarəetməsi',
      features: ['Avtomatik cədvəl generatoru', 'Konflikt aşkarlama', 'Müəllim əvəzetmə sistemi', 'Otaq rezervasiyası'],
      accent: '#7c3aed',
    },
    {
      icon: Users,
      title: 'Şagird & Heyət İdarəetməsi',
      features: ['Şagird profilləri və portfoliyo', 'Müəllim iş yükü izlənməsi', 'İntizam idarəetməsi', 'Valideyn portalı'],
      accent: '#be185d',
    },
    {
      icon: Sparkles,
      title: 'Zəka AI',
      features: ['Şagird üçün AI dərs köməkçisi', 'Müəllim üçün hesabat generatoru', 'Esse rəyi aləti', 'Şəxsiləşdirilmiş öyrənmə'],
      accent: '#6d28d9',
    },
  ],
  en: [
    {
      icon: BookOpen,
      title: 'Curriculum Management',
      features: ['Collaborative curriculum planning', '600+ built-in standards', 'Curriculum alignment tools', 'IBIS integration'],
      accent: '#7c3aed',
    },
    {
      icon: ClipboardCheck,
      title: 'Assessment',
      features: ['IB criteria (A–D scale)', 'National 10-point system', 'Real-time sync', 'Student analytics'],
      accent: '#2563eb',
    },
    {
      icon: Calendar,
      title: 'Attendance',
      features: ['One-tap registration', 'Instant parent notifications', 'Attendance trend analytics', 'E-Gov.az compliant reports'],
      accent: '#059669',
    },
    {
      icon: BarChart2,
      title: 'Reports & Analytics',
      features: ['Ministry-compliant reports', 'E-Gov.az auto-export', 'PDF, Excel format', 'IB Audit documentation'],
      accent: '#d97706',
    },
    {
      icon: MessageSquare,
      title: 'Communication',
      features: ['Teacher-parent messaging', 'Internal announcement system', 'Events and notifications', 'Multilingual support'],
      accent: '#0891b2',
    },
    {
      icon: Clock,
      title: 'Timetable Management',
      features: ['Automatic timetable generator', 'Conflict detection', 'Teacher substitution system', 'Room booking'],
      accent: '#7c3aed',
    },
    {
      icon: Users,
      title: 'Student & Staff Management',
      features: ['Student profiles & portfolio', 'Teacher workload tracking', 'Discipline management', 'Parent portal'],
      accent: '#be185d',
    },
    {
      icon: Sparkles,
      title: 'Zeka AI',
      features: ['AI homework assistant for students', 'Report generator for teachers', 'Essay feedback tool', 'Personalized learning'],
      accent: '#6d28d9',
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
export default function Features() {
  const { lang, setLang } = useLang()
  const s = STR[lang] || STR.az
  const cards = FEATURE_CARDS[lang] || FEATURE_CARDS.az

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
          padding: '96px 24px',
          textAlign: 'center',
        }}
      >
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
            fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
            fontWeight: 800,
            color: '#fff',
            lineHeight: 1.1,
            marginBottom: 8,
            letterSpacing: '-0.03em',
          }}>
            {s.hero_h1}
          </h1>
          <h2 style={{
            fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: 24,
            letterSpacing: '-0.03em',
            background: 'linear-gradient(135deg, #a78bfa 0%, #818cf8 45%, #93c5fd 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            {s.hero_h2}
          </h2>
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            color: 'rgba(255,255,255,0.65)',
            lineHeight: 1.7,
            maxWidth: 560,
            margin: '0 auto',
          }}>
            {s.hero_body}
          </p>
        </div>
      </section>

      {/* ── Feature Grid ── */}
      <section style={{ background: '#f8f9fa', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{
              fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
              fontWeight: 800,
              color: '#0f0f1a',
              marginBottom: 12,
              letterSpacing: '-0.02em',
            }}>
              {s.features_title}
            </h2>
            <p style={{ fontSize: 16, color: '#64748b' }}>{s.features_sub}</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
          }}>
            {cards.map((card) => {
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
                  {/* Icon */}
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: `${card.accent}14`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 16,
                  }}>
                    <IconComp style={{ width: 22, height: 22, color: card.accent }} />
                  </div>

                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f0f1a', marginBottom: 16, lineHeight: 1.3 }}>
                    {card.title}
                  </h3>

                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {card.features.map(f => (
                      <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151', fontWeight: 500 }}>
                        <CheckCircle style={{ width: 14, height: 14, color: card.accent, flexShrink: 0 }} />
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
