import { Link } from 'react-router-dom'
import {
  BookOpen, ClipboardCheck, Calendar, BarChart2,
  MessageSquare, Clock, Users, Sparkles, ArrowRight, Check,
} from 'lucide-react'
import { useLang } from '../contexts/LanguageContext'
import LandingNav from '../components/layout/LandingNav'
import Mascot from '../components/ui/Mascot'
import { useSEO } from '../hooks/useSEO'

const STR = {
  az: {
    nav_solutions:'Həllər', nav_features:'Xüsusiyyətlər', nav_signin:'Daxil ol', nav_contact:'Bizimlə Əlaqə',
    hero_eyebrow:'Xüsusiyyətlər',
    hero_h1:'Lazım olan hər şey.',
    hero_h2:'Lazım olmayan heç nə.',
    hero_body:'Kurikulumdan hesabata, qiymətləndirmədən AI müəlliminə — tam iş axını bir platformada.',
    section_title:'Platformanın imkanları',
    section_sub:'8 güclü modul, 60+ xüsusiyyət.',
    learn_more:'Ətraflı bax',
    cta_h:'Canlı demo görmək istəyirsiniz?',
    cta_sub:'Hər şeyi sizin məktəb kontekstinizdə göstərəcəyik.',
    cta_btn:'Demo Sifariş Et',
    footer:'© 2026 Zirva LLC',
  },
  en: {
    nav_solutions:'Solutions', nav_features:'Features', nav_signin:'Sign In', nav_contact:'Contact Us',
    hero_eyebrow:'Features',
    hero_h1:'Everything you need.',
    hero_h2:"Nothing you don't.",
    hero_body:'From curriculum to reporting, assessment to AI teacher — complete workflow in one platform.',
    section_title:'Platform capabilities',
    section_sub:'8 powerful modules, 60+ features.',
    learn_more:'Learn more',
    cta_h:'Want to see it live?',
    cta_sub:"We'll walk you through everything in your school's context.",
    cta_btn:'Book a Demo',
    footer:'© 2026 Zirva LLC',
  },
  tr: {
    nav_solutions:'Çözümler', nav_features:'Özellikler', nav_signin:'Giriş yap', nav_contact:'Bize Ulaşın',
    hero_eyebrow:'Özellikler',
    hero_h1:'İhtiyacınız olan her şey.',
    hero_h2:'İhtiyacınız olmayan hiçbir şey.',
    hero_body:'Müfredattan raporlamaya, değerlendirmeden AI öğretmenine — tam iş akışı tek platformda.',
    section_title:'Platform özellikleri',
    section_sub:'8 güçlü modül, 60+ özellik.',
    learn_more:'Daha fazla',
    cta_h:'Canlı görmek ister misiniz?',
    cta_sub:'Her şeyi okulunuzun bağlamında size göstereceğiz.',
    cta_btn:'Demo Talep Et',
    footer:'© 2026 Zirva LLC',
  },
  ru: {
    nav_solutions:'Решения', nav_features:'Возможности', nav_signin:'Войти', nav_contact:'Связаться',
    hero_eyebrow:'Возможности',
    hero_h1:'Всё, что нужно.',
    hero_h2:'Ничего лишнего.',
    hero_body:'От учебного плана до отчётов, от оценивания до AI-учителя — полный рабочий процесс на одной платформе.',
    section_title:'Возможности платформы',
    section_sub:'8 мощных модулей, 60+ функций.',
    learn_more:'Подробнее',
    cta_h:'Хотите увидеть вживую?',
    cta_sub:'Покажем всё в контексте вашей школы.',
    cta_btn:'Заказать демо',
    footer:'© 2026 Zirva LLC',
  },
}

// Feature slug → detail page path
const FEATURE_PATHS = [
  '/features/curriculum',
  '/features/assessment',
  '/features/attendance',
  '/features/reports',
  '/features/communication',
  '/features/timetable',
  '/features/student-staff',
  '/zeka-ai',
]

// Muted accents — V3 tokens. Rotated across the bento so no two adjacent cards
// share a hue. `chip` maps to the shared .icon-chip-* class.
const PASTEL_ACCENTS = [
  { color: '#574FCF', chip: 'periwinkle' }, // brand
  { color: '#15803D', chip: 'mint' },       // success / accuracy
  { color: '#B45309', chip: 'peach' },      // warmth / parent-facing
  { color: '#1D7FB8', chip: 'blue' },       // info / time
  { color: '#6D28D9', chip: 'grape' },      // achievements
  { color: '#B45309', chip: 'sun' },        // XP / points
  { color: '#1D7FB8', chip: 'blue' },       // info
  { color: '#574FCF', chip: 'periwinkle' }, // brand (Zəka AI)
]

const FEATURES = {
  az: [
    { icon:BookOpen,      title:'Kurikulum İdarəetməsi', desc:'Birgə planlaşdırma, 600+ standart', items:['Birgə kurikulum planlaması','600+ daxili standart','Kurikulum uyğunluq alətləri','IBIS inteqrasiyası'] },
    { icon:ClipboardCheck,title:'Qiymətləndirmə',        desc:'IB + milli sistem dəstəyi',         items:['IB kriteriyaları (A–D)','10 ballıq sistem','Real vaxt sinxronizasiya','Şagird analitikası'] },
    { icon:Calendar,      title:'Davamiyyət',            desc:'Bir toxunuşla qeydiyyat',           items:['Bir toxunuşla qeydiyyat','Valideyn bildirişi','Trend analitikası','E-Gov.az uyğun'] },
    { icon:BarChart2,     title:'Hesabatlar & Analitika',desc:'Nazirlik + IB hesabatları',         items:['Nazirlik hesabatları','E-Gov.az ixracı','PDF, Excel','IB Audit sənədləri'] },
    { icon:MessageSquare, title:'Kommunikasiya',          desc:'Müəllim-valideyn əlaqəsi',          items:['Müəllim-valideyn mesajları','Daxili elan sistemi','Tədbirlər & bildirişlər','Çoxdilli dəstək'] },
    { icon:Clock,         title:'Cədvəl İdarəetməsi',    desc:'Avtomatik cədvəl generatoru',       items:['Avtomatik generator','Konflikt aşkarlama','Müəllim əvəzetmə','Otaq rezervasiyası'] },
    { icon:Users,         title:'Şagird & Heyət',        desc:'Profillər, portfolio, intizam',     items:['Şagird profilləri','Müəllim iş yükü','İntizam idarəetməsi','Valideyn portalı'] },
    { icon:Sparkles,      title:'Zəka AI',                desc:'Süni intellekt müəllim köməkçisi',  items:['Şagird üçün AI köməkçi','Hesabat generatoru','Esse rəyi aləti','Şəxsiləşdirilmiş öyrənmə'] },
  ],
  en: [
    { icon:BookOpen,      title:'Curriculum Management',  desc:'Collaborative planning, 600+ standards', items:['Collaborative planning','600+ built-in standards','Alignment tools','IBIS integration'] },
    { icon:ClipboardCheck,title:'Assessment',              desc:'IB + national system support',           items:['IB criteria (A–D)','10-point system','Real-time sync','Student analytics'] },
    { icon:Calendar,      title:'Attendance',              desc:'One-tap registration',                   items:['One-tap registration','Parent alerts','Trend analytics','E-Gov.az compliant'] },
    { icon:BarChart2,     title:'Reports & Analytics',    desc:'Ministry + IB reporting',                items:['Ministry reports','E-Gov.az export','PDF, Excel','IB Audit docs'] },
    { icon:MessageSquare, title:'Communication',           desc:'Teacher-parent messaging',               items:['Teacher-parent messaging','Announcement system','Events & notifications','Multilingual support'] },
    { icon:Clock,         title:'Timetable Management',   desc:'Automatic timetable generator',          items:['Auto generator','Conflict detection','Substitution system','Room booking'] },
    { icon:Users,         title:'Student & Staff',        desc:'Profiles, portfolio, discipline',        items:['Student profiles','Teacher workload','Discipline management','Parent portal'] },
    { icon:Sparkles,      title:'Zeka AI',                 desc:'AI-powered teaching assistant',          items:['AI homework assistant','Report generator','Essay feedback','Personalised learning'] },
  ],
  tr: [
    { icon:BookOpen,      title:'Müfredat Yönetimi',   desc:'Ortak planlama, 600+ standart',         items:['Ortak müfredat planlaması','600+ yerleşik standart','Uyum araçları','IBIS entegrasyonu'] },
    { icon:ClipboardCheck,title:'Değerlendirme',        desc:'IB + ulusal sistem desteği',            items:['IB kriterleri (A–D)','10 puanlık sistem','Gerçek zamanlı senkronizasyon','Öğrenci analitiği'] },
    { icon:Calendar,      title:'Devam Takibi',         desc:'Tek dokunuşla kayıt',                   items:['Tek dokunuşla kayıt','Veli bildirimleri','Trend analitiği','E-Gov.az uyumlu'] },
    { icon:BarChart2,     title:'Raporlar & Analitik', desc:'Bakanlık + IB raporlaması',             items:['Bakanlık raporları','E-Gov.az dışa aktarma','PDF, Excel','IB Denetim belgeleri'] },
    { icon:MessageSquare, title:'İletişim',              desc:'Öğretmen-veli mesajlaşma',              items:['Öğretmen-veli mesajlaşma','Duyuru sistemi','Etkinlikler & bildirimler','Çok dilli destek'] },
    { icon:Clock,         title:'Program Yönetimi',     desc:'Otomatik program oluşturucu',           items:['Otomatik oluşturucu','Çakışma tespiti','Vekâlet sistemi','Oda rezervasyonu'] },
    { icon:Users,         title:'Öğrenci & Personel',  desc:'Profiller, portfolio, disiplin',        items:['Öğrenci profilleri','Öğretmen iş yükü','Disiplin yönetimi','Veli portalı'] },
    { icon:Sparkles,      title:'Zeka AI',               desc:'AI destekli öğretim asistanı',          items:['AI ödev asistanı','Rapor oluşturucu','Kompozisyon geri bildirimi','Kişiselleştirilmiş öğrenme'] },
  ],
  ru: [
    { icon:BookOpen,       title:'Управление учебной программой', desc:'Совместное планирование, 600+ стандартов', items:['Совместное планирование','600+ встроенных стандартов','Инструменты соответствия','Интеграция IBIS'] },
    { icon:ClipboardCheck, title:'Оценивание',                   desc:'Поддержка IB + национальной системы',     items:['Критерии IB (A–D)','10-балльная система','Синхронизация в реальном времени','Аналитика учащихся'] },
    { icon:Calendar,       title:'Посещаемость',                  desc:'Отметка в одно касание',                 items:['Отметка в одно касание','Уведомления родителям','Аналитика тенденций','Совместимость с E-Gov.az'] },
    { icon:BarChart2,      title:'Отчёты & Аналитика',           desc:'Отчётность для Министерства + IB',        items:['Отчёты для Министерства','Экспорт E-Gov.az','PDF, Excel','Документация IB Audit'] },
    { icon:MessageSquare,  title:'Коммуникация',                  desc:'Общение учитель–родитель',               items:['Сообщения учитель–родитель','Система объявлений','События & уведомления','Многоязычная поддержка'] },
    { icon:Clock,          title:'Управление расписанием',        desc:'Автоматический генератор расписания',    items:['Автогенератор','Обнаружение конфликтов','Система замен','Бронирование кабинетов'] },
    { icon:Users,          title:'Ученики & Персонал',           desc:'Профили, портфолио, дисциплина',         items:['Профили учащихся','Нагрузка учителей','Управление дисциплиной','Портал родителей'] },
    { icon:Sparkles,       title:'Зека AI',                       desc:'AI-ассистент для обучения',              items:['AI-помощник для домашних заданий','Генератор отчётов','Инструмент для эссе','Персонализированное обучение'] },
  ],
}

export default function Features() {
  const { lang, setLang } = useLang()
  const s = STR[lang] || STR.az
  const baseFeatures = FEATURES[lang] || FEATURES.az
  const features = baseFeatures.map((f, i) => {
    const a = PASTEL_ACCENTS[i % PASTEL_ACCENTS.length]
    return { ...f, accent: a.color, chip: a.chip }
  })
  useSEO({
    title: lang==='az' ? 'Xüsusiyyətlər — 8 Modul, 60+ Funksiya' : lang==='ru' ? 'Возможности — 8 модулей, 60+ функций' : lang==='tr' ? 'Özellikler — 8 Modül, 60+ Özellik' : 'Features — 8 Modules, 60+ Capabilities',
    description: lang==='az' ? 'Kurikulum idarəetməsi, qiymətləndirmə, davamiyyət, hesabatlar, kommunikasiya, cədvəl, Zəka AI — hamısı bir platformada.' : 'Curriculum management, assessment, attendance, reports, communication, timetable, Zeka AI — all in one platform.',
    canonical: '/features',
    keywords: 'school management features, kurikulum idarəetməsi, məktəb xüsusiyyətləri, IB assessment platform, school attendance software Azerbaijan',
  })
  return (
    <div style={{ background: 'var(--canvas)', fontFamily: 'inherit' }}>
      <style>{`
        .feat-learn { transition: gap .15s var(--ease-out-quint); }
        .feat-learn:hover { gap: 8px !important; }
        .feat-nav-pill {
          transition: color .15s ease, border-color .15s ease, transform .15s var(--ease-out-quint);
        }
        .feat-nav-pill:hover {
          border-color: var(--brand-300) !important;
          transform: translateY(-2px);
        }
        .feat-hero-chip {
          transition: transform .15s var(--ease-out-quint), border-color .15s ease;
        }
        .feat-hero-chip:hover { transform: translateY(-2px); border-color: var(--brand-300) !important; }
        @media (max-width: 767px) {
          .feat-row-inner { flex-direction: column !important; }
          .feat-row-inner.reverse { flex-direction: column !important; }
          .feat-row-left, .feat-row-right { width: 100% !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .feat-learn, .feat-nav-pill, .feat-hero-chip { transition: none !important; }
        }
      `}</style>

      <LandingNav s={s} lang={lang} setLang={setLang} lightHero />

      {/* ── Hero ── */}
      <section style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '160px 24px 96px',
        textAlign: 'center',
        background: 'var(--canvas)',
      }}>
        {/* Single static brand wash */}
        <div className="hb1" />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 880, margin: '0 auto' }}>
          {/* Eyebrow pill */}
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '6px 14px', borderRadius: 999, marginBottom: 22,
            background: '#fff', border: '1px solid var(--hairline-strong)',
            boxShadow: '0 1px 2px rgba(20,22,40,.05)',
            fontSize: 12.5, fontWeight: 600, color: 'var(--brand-700)',
            letterSpacing: '.01em',
          }}>
            <Sparkles style={{ width: 13, height: 13, color: 'var(--brand-500)' }} />
            {s.hero_eyebrow}
          </span>

          <h1 className="font-display" style={{ fontSize: 'clamp(2.6rem,6.5vw,4.6rem)', fontWeight: 800, color: 'var(--ink-900)', lineHeight: 1.06, letterSpacing: '-0.02em', marginBottom: 6 }}>
            {s.hero_h1}
          </h1>
          <h2 className="font-display pastel-text" style={{ fontSize: 'clamp(2.6rem,6.5vw,4.6rem)', fontWeight: 800, lineHeight: 1.06, letterSpacing: '-0.02em', marginBottom: 28 }}>
            {s.hero_h2}
          </h2>

          <p style={{ fontSize: 'clamp(1rem,2.2vw,1.18rem)', color: 'var(--ink-600)', lineHeight: 1.78, maxWidth: 560, margin: '0 auto 44px' }}>
            {s.hero_body}
          </p>

          {/* Stat band — KPI numbers in Bricolage, single brand accent */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 0, flexWrap: 'wrap',
            justifyContent: 'center', marginBottom: 48,
            background: '#fff', border: '1px solid var(--hairline)',
            borderRadius: 14, padding: '18px 8px',
            boxShadow: '0 1px 2px rgba(20,22,40,.05)',
          }}>
            {[
              { n: '8', l: s.section_title },
              { n: '60+', l: s.hero_eyebrow },
              { n: '600+', l: 'IB · E-Gov.az' },
            ].map((stat, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center' }}>
                {idx > 0 && <span style={{ width: 1, height: 38, background: 'var(--hairline)', margin: '0 4px' }} />}
                <div style={{ padding: '0 22px', textAlign: 'center' }}>
                  <div className="font-display" style={{ fontSize: 'clamp(1.7rem,4vw,2.3rem)', fontWeight: 800, color: 'var(--ink-900)', lineHeight: 1, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em' }}>{stat.n}</div>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--ink-400)', marginTop: 6, textTransform: 'uppercase', letterSpacing: '.04em' }}>{stat.l}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Feature icon chips — token-tinted, jump to row */}
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 10 }}>
            {features.map((f, i) => {
              const IC = f.icon
              return (
                <a
                  key={i}
                  href={`#feature-${i}`}
                  className="feat-hero-chip"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '9px 16px',
                    borderRadius: 999,
                    background: '#fff',
                    border: `1px solid ${f.accent}33`,
                    textDecoration: 'none',
                    color: 'var(--ink-900)',
                    fontSize: 13,
                    fontWeight: 600,
                    boxShadow: '0 1px 2px rgba(20,22,40,.05)',
                  }}
                >
                  <IC style={{ width: 14, height: 14, color: f.accent, flexShrink: 0 }} />
                  {f.title}
                </a>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Quick nav pill row — sticky token chips over canvas ── */}
      <div style={{ background: 'var(--surface)', position: 'sticky', top: 0, zIndex: 20, padding: '0 24px', borderBottom: '1px solid var(--hairline)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', overflowX: 'auto', display: 'flex', gap: 6, padding: '14px 0', scrollbarWidth: 'none' }}>
          {features.map((f, i) => {
            const IC = f.icon
            return (
              <a
                key={i}
                href={`#feature-${i}`}
                className="feat-nav-pill"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '8px 15px',
                  borderRadius: 999,
                  background: 'var(--surface-2)',
                  border: '1px solid var(--hairline)',
                  color: 'var(--ink-700)',
                  fontSize: 12.5,
                  fontWeight: 600,
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                <IC style={{ width: 13, height: 13, color: f.accent }} />
                {f.title}
              </a>
            )
          })}
        </div>
      </div>

      {/* ── Alternating Feature Rows — canvas bg, liquid cards ── */}
      <section style={{ background: 'var(--canvas)', position: 'relative', overflow: 'hidden' }}>
        {/* Single soft brand wash */}
        <div className="section-blob" style={{ width: '50vw', height: '50vw', top: '8%', left: '-15%', background: 'rgba(87,79,207,0.06)' }} />

        {/* Section heading */}
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '72px 24px 8px', maxWidth: 720, margin: '0 auto' }}>
          <h2 className="font-display" style={{ fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 800, color: 'var(--ink-900)', letterSpacing: '-0.02em', marginBottom: 12 }}>
            {s.section_title}
          </h2>
          <p style={{ fontSize: 16, color: 'var(--ink-600)', lineHeight: 1.7 }}>{s.section_sub}</p>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          {features.map((f, i) => {
            const IC = f.icon
            const isReverse = i % 2 === 1

            return (
              <div key={f.title} id={`feature-${i}`} style={{ scrollMarginTop: 80 }}>
                <div style={{ padding: '40px 24px' }}>
                  <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                    <div
                      className={`liquid-card feat-row-inner${isReverse ? ' reverse' : ''}`}
                      style={{
                        display: 'flex',
                        flexDirection: isReverse ? 'row-reverse' : 'row',
                        gap: 56,
                        alignItems: 'flex-start',
                        padding: '44px 44px',
                      }}
                    >
                      {/* Left col: icon + index + title + desc + link */}
                      <div
                        className="feat-row-left"
                        style={{ width: '38%', flexShrink: 0 }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                          {/* Icon chip — shared token class */}
                          <div className={`icon-chip icon-chip-${f.chip}`} style={{ width: 56, height: 56, borderRadius: 14 }}>
                            <IC style={{ width: 26, height: 26 }} />
                          </div>
                          <span className="font-display" style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink-400)', opacity: 0.55, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                            {String(i + 1).padStart(2, '0')}
                          </span>
                        </div>

                        <h3 style={{ fontSize: 'clamp(1.25rem,2.2vw,1.55rem)', fontWeight: 700, color: 'var(--ink-900)', lineHeight: 1.2, marginBottom: 12, letterSpacing: '-0.015em' }}>{f.title}</h3>
                        <p style={{ fontSize: 15, color: 'var(--ink-600)', lineHeight: 1.72, marginBottom: 24 }}>{f.desc}</p>

                        <Link
                          to={FEATURE_PATHS[i]}
                          className="feat-learn"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            fontSize: 14,
                            fontWeight: 700,
                            color: f.accent,
                            textDecoration: 'none',
                          }}
                        >
                          {s.learn_more} <ArrowRight style={{ width: 14, height: 14 }} />
                        </Link>
                      </div>

                      {/* Right col: bullet points */}
                      <div
                        className="feat-row-right"
                        style={{ flex: 1 }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 8 }}>
                          {f.items.map((item) => (
                            <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                              <span style={{
                                flexShrink: 0,
                                marginTop: 1,
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                background: `${f.accent}1f`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}>
                                <Check style={{ width: 12, height: 12, color: f.accent, strokeWidth: 3 }} />
                              </span>
                              <span style={{ fontSize: 15.5, color: 'var(--ink-900)', fontWeight: 600, lineHeight: 1.55 }}>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── CTA — brand panel with mascot ── */}
      <section style={{ background: 'var(--canvas)', position: 'relative', overflow: 'hidden', padding: '96px 24px' }}>
        <div className="section-blob" style={{ width: '60vw', height: '60vw', top: '-20%', left: '10%', background: 'rgba(87,79,207,0.08)' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 720, margin: '0 auto' }}>
          <div style={{
            position: 'relative', overflow: 'hidden',
            padding: '52px 40px', textAlign: 'center',
            borderRadius: 18,
            background: 'linear-gradient(135deg, var(--brand-600) 0%, var(--brand-500) 100%)',
            boxShadow: '0 12px 28px -10px rgba(20,22,40,.14)',
          }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                <Mascot pose="cheering" size={80} />
              </div>
              <h2 className="font-display" style={{ fontSize: 'clamp(1.7rem,3.5vw,2.5rem)', fontWeight: 800, color: '#fff', marginBottom: 14, lineHeight: 1.18, letterSpacing: '-0.02em' }}>{s.cta_h}</h2>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.88)', marginBottom: 32, lineHeight: 1.7, maxWidth: 460, marginLeft: 'auto', marginRight: 'auto' }}>{s.cta_sub}</p>
              <Link to="/contact" className="btn-pastel" style={{ background: '#fff', color: 'var(--brand-600)', boxShadow: '0 1px 2px rgba(20,22,40,.10)' }}>
                {s.cta_btn} <ArrowRight style={{ width: 16, height: 16 }} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer style={{ background: 'var(--canvas)', borderTop: '1px solid var(--hairline)', padding: '24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--ink-400)', fontSize: 12.5 }}>{s.footer}</p>
      </footer>
    </div>
  )
}
