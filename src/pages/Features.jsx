import { Link } from 'react-router-dom'
import {
  BookOpen, ClipboardCheck, Calendar, BarChart2,
  MessageSquare, Clock, Users, Sparkles, ArrowRight, Check,
} from 'lucide-react'
import { useLang } from '../contexts/LanguageContext'
import LandingNav from '../components/layout/LandingNav'
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

// Pastel palette accents — rotated across modules
const PASTEL_ACCENTS = [
  '#7c6ee0', // periwinkle
  '#5db8a3', // mint
  '#e8a87c', // peach
  '#6b9dde', // soft blue
  '#7c6ee0',
  '#5db8a3',
  '#e8a87c',
  '#6b9dde',
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
  const features = baseFeatures.map((f, i) => ({ ...f, accent: PASTEL_ACCENTS[i % PASTEL_ACCENTS.length] }))
  useSEO({
    title: lang==='az' ? 'Xüsusiyyətlər — 8 Modul, 60+ Funksiya' : lang==='ru' ? 'Возможности — 8 модулей, 60+ функций' : lang==='tr' ? 'Özellikler — 8 Modül, 60+ Özellik' : 'Features — 8 Modules, 60+ Capabilities',
    description: lang==='az' ? 'Kurikulum idarəetməsi, qiymətləndirmə, davamiyyət, hesabatlar, kommunikasiya, cədvəl, Zəka AI — hamısı bir platformada.' : 'Curriculum management, assessment, attendance, reports, communication, timetable, Zeka AI — all in one platform.',
    canonical: '/features',
    keywords: 'school management features, kurikulum idarəetməsi, məktəb xüsusiyyətləri, IB assessment platform, school attendance software Azerbaijan',
  })
  return (
    <div style={{ background: '#f8f7fb', fontFamily: 'inherit' }}>
      <style>{`
        @keyframes heroGradient {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .feat-learn { transition: gap .15s ease; }
        .feat-learn:hover { gap: 8px !important; }
        .feat-nav-pill { transition: background .2s ease, color .2s ease, border-color .2s ease, transform .2s ease; }
        .feat-nav-pill:hover { background: rgba(255,255,255,0.85) !important; border-color: rgba(124,110,224,0.45) !important; transform: translateY(-1px); }
        .feat-hero-pill { transition: transform .2s ease, background .2s ease, border-color .2s ease; }
        .feat-hero-pill:hover { transform: translateY(-2px); }
        @media (max-width: 767px) {
          .feat-row-inner { flex-direction: column !important; }
          .feat-row-inner.reverse { flex-direction: column !important; }
          .feat-row-left, .feat-row-right { width: 100% !important; }
        }
      `}</style>

      <LandingNav s={s} lang={lang} setLang={setLang} lightHero />

      {/* ── Hero ── */}
      <section style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '160px 24px 96px',
        textAlign: 'center',
        background: 'linear-gradient(-45deg, #e8ecff, #f8f7fb, #c8e6e0, #f5e6d8, #b8c0ff, #f8f7fb)',
        backgroundSize: '400% 400%',
        animation: 'heroGradient 12s ease infinite',
      }}>
        {/* Drifting pastel blobs */}
        <div className="hb1" />
        <div className="hb2" />
        <div className="hb3" />
        <div className="hb4" />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 860, margin: '0 auto' }}>
          <h1 style={{ fontSize: 'clamp(2.6rem,6.5vw,4.6rem)', fontWeight: 900, color: '#1a1a2e', lineHeight: 1.06, letterSpacing: '-0.035em', marginBottom: 8 }}>
            {s.hero_h1}
          </h1>
          <h2 className="pastel-text" style={{ fontSize: 'clamp(2.6rem,6.5vw,4.6rem)', fontWeight: 900, lineHeight: 1.06, letterSpacing: '-0.035em', marginBottom: 28 }}>
            {s.hero_h2}
          </h2>

          <p style={{ fontSize: 'clamp(1rem,2.2vw,1.18rem)', color: '#64748b', lineHeight: 1.78, maxWidth: 560, margin: '0 auto 52px' }}>
            {s.hero_body}
          </p>

          {/* Feature icon grid pills — liquid glass */}
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 10 }}>
            {features.map((f, i) => {
              const IC = f.icon
              return (
                <a
                  key={i}
                  href={`#feature-${i}`}
                  className="feat-hero-pill"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '9px 16px',
                    borderRadius: 99,
                    background: 'rgba(255,255,255,0.6)',
                    backdropFilter: 'blur(16px) saturate(1.4)',
                    WebkitBackdropFilter: 'blur(16px) saturate(1.4)',
                    border: `1px solid ${f.accent}40`,
                    textDecoration: 'none',
                    color: '#1a1a2e',
                    fontSize: 13,
                    fontWeight: 600,
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7), 0 2px 8px rgba(140,120,200,0.06)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.85)'; e.currentTarget.style.borderColor = `${f.accent}80` }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.6)'; e.currentTarget.style.borderColor = `${f.accent}40` }}
                >
                  <IC style={{ width: 14, height: 14, color: f.accent, flexShrink: 0 }} />
                  {f.title}
                </a>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Quick nav pill row — liquid glass over pastel bg ── */}
      <div style={{ background: '#f8f7fb', position: 'relative', padding: '0 24px', borderBottom: '1px solid rgba(124,110,224,0.08)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', overflowX: 'auto', display: 'flex', gap: 6, padding: '16px 0', scrollbarWidth: 'none' }}>
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
                  padding: '8px 16px',
                  borderRadius: 99,
                  background: 'rgba(255,255,255,0.55)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(124,110,224,0.18)',
                  color: '#1a1a2e',
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

      {/* ── Alternating Feature Rows — single off-white bg, liquid cards ── */}
      <section style={{ background: '#f8f7fb', position: 'relative', overflow: 'hidden' }}>
        {/* Soft drifting accents in the background */}
        <div className="section-blob" style={{ width: '50vw', height: '50vw', top: '5%', left: '-15%', background: 'rgba(184,192,255,0.35)' }} />
        <div className="section-blob" style={{ width: '45vw', height: '45vw', top: '40%', right: '-12%', background: 'rgba(200,230,224,0.35)' }} />
        <div className="section-blob" style={{ width: '40vw', height: '40vw', bottom: '5%', left: '10%', background: 'rgba(245,230,216,0.3)' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {features.map((f, i) => {
            const IC = f.icon
            const isReverse = i % 2 === 1

            return (
              <div key={f.title} id={`feature-${i}`}>
                <div style={{ padding: '64px 24px' }}>
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
                      {/* Left col: icon + title + desc + link */}
                      <div
                        className="feat-row-left"
                        style={{ width: '38%', flexShrink: 0 }}
                      >
                        {/* Icon pill — pastel tinted glass */}
                        <div style={{
                          width: 64,
                          height: 64,
                          borderRadius: 18,
                          background: `linear-gradient(135deg, ${f.accent}28 0%, ${f.accent}10 100%)`,
                          border: `1px solid ${f.accent}40`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: 20,
                          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.6), 0 4px 14px ${f.accent}20`,
                        }}>
                          <IC style={{ width: 28, height: 28, color: f.accent }} />
                        </div>

                        <h3 style={{ fontSize: 'clamp(1.3rem,2.2vw,1.65rem)', fontWeight: 900, color: '#1a1a2e', lineHeight: 1.2, marginBottom: 12, letterSpacing: '-0.025em' }}>{f.title}</h3>
                        <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.72, marginBottom: 24 }}>{f.desc}</p>

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
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
                          {f.items.map((item) => (
                            <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                              <span style={{
                                flexShrink: 0,
                                marginTop: 2,
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                background: `linear-gradient(135deg, ${f.accent}28 0%, ${f.accent}10 100%)`,
                                border: `1px solid ${f.accent}40`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}>
                                <Check style={{ width: 12, height: 12, color: f.accent, strokeWidth: 3 }} />
                              </span>
                              <span style={{ fontSize: 15.5, color: '#1a1a2e', fontWeight: 600, lineHeight: 1.55 }}>{item}</span>
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

      {/* ── CTA — liquid card on pastel bg ── */}
      <section style={{ background: '#f8f7fb', position: 'relative', overflow: 'hidden', padding: '96px 24px' }}>
        <div className="section-blob" style={{ width: '60vw', height: '60vw', top: '-20%', left: '10%', background: 'rgba(184,192,255,0.4)' }} />
        <div className="section-blob" style={{ width: '50vw', height: '50vw', bottom: '-25%', right: '5%', background: 'rgba(200,230,224,0.4)' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 640, margin: '0 auto' }}>
          <div className="liquid-card" style={{ padding: '56px 40px', textAlign: 'center' }}>
            <h2 style={{ fontSize: 'clamp(1.7rem,3.5vw,2.6rem)', fontWeight: 900, color: '#1a1a2e', marginBottom: 16, lineHeight: 1.18, letterSpacing: '-0.03em' }}>{s.cta_h}</h2>
            <p style={{ fontSize: 16, color: '#64748b', marginBottom: 36, lineHeight: 1.75 }}>{s.cta_sub}</p>
            <Link to="/contact" className="btn-pastel">
              {s.cta_btn} <ArrowRight style={{ width: 16, height: 16 }} />
            </Link>
          </div>
        </div>
      </section>

      <footer style={{ background: '#f8f7fb', borderTop: '1px solid rgba(124,110,224,0.1)', padding: '24px', textAlign: 'center' }}>
        <p style={{ color: '#64748b', fontSize: 12.5 }}>{s.footer}</p>
      </footer>
    </div>
  )
}
