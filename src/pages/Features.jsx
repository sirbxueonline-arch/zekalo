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

const FEATURES = {
  az: [
    { icon:BookOpen,      title:'Kurikulum İdarəetməsi', desc:'Birgə planlaşdırma, 600+ standart', items:['Birgə kurikulum planlaması','600+ daxili standart','Kurikulum uyğunluq alətləri','IBIS inteqrasiyası'], accent:'#7c3aed', wide:true },
    { icon:ClipboardCheck,title:'Qiymətləndirmə',        desc:'IB + milli sistem dəstəyi',         items:['IB kriteriyaları (A–D)','10 ballıq sistem','Real vaxt sinxronizasiya','Şagird analitikası'], accent:'#2563eb' },
    { icon:Calendar,      title:'Davamiyyət',            desc:'Bir toxunuşla qeydiyyat',           items:['Bir toxunuşla qeydiyyat','Valideyn bildirişi','Trend analitikası','E-Gov.az uyğun'], accent:'#059669' },
    { icon:BarChart2,     title:'Hesabatlar & Analitika',desc:'Nazirlik + IB hesabatları',         items:['Nazirlik hesabatları','E-Gov.az ixracı','PDF, Excel','IB Audit sənədləri'], accent:'#d97706', wide:true },
    { icon:MessageSquare, title:'Kommunikasiya',          desc:'Müəllim-valideyn əlaqəsi',          items:['Müəllim-valideyn mesajları','Daxili elan sistemi','Tədbirlər & bildirişlər','Çoxdilli dəstək'], accent:'#0891b2' },
    { icon:Clock,         title:'Cədvəl İdarəetməsi',    desc:'Avtomatik cədvəl generatoru',       items:['Avtomatik generator','Konflikt aşkarlama','Müəllim əvəzetmə','Otaq rezervasiyası'], accent:'#7c3aed' },
    { icon:Users,         title:'Şagird & Heyət',        desc:'Profillər, portfolio, intizam',     items:['Şagird profilləri','Müəllim iş yükü','İntizam idarəetməsi','Valideyn portalı'], accent:'#be185d' },
    { icon:Sparkles,      title:'Zəka AI',                desc:'Süni intellekt müəllim köməkçisi',  items:['Şagird üçün AI köməkçi','Hesabat generatoru','Esse rəyi aləti','Şəxsiləşdirilmiş öyrənmə'], accent:'#6d28d9', wide:true },
  ],
  en: [
    { icon:BookOpen,      title:'Curriculum Management',  desc:'Collaborative planning, 600+ standards', items:['Collaborative planning','600+ built-in standards','Alignment tools','IBIS integration'], accent:'#7c3aed', wide:true },
    { icon:ClipboardCheck,title:'Assessment',              desc:'IB + national system support',           items:['IB criteria (A–D)','10-point system','Real-time sync','Student analytics'], accent:'#2563eb' },
    { icon:Calendar,      title:'Attendance',              desc:'One-tap registration',                   items:['One-tap registration','Parent alerts','Trend analytics','E-Gov.az compliant'], accent:'#059669' },
    { icon:BarChart2,     title:'Reports & Analytics',    desc:'Ministry + IB reporting',                items:['Ministry reports','E-Gov.az export','PDF, Excel','IB Audit docs'], accent:'#d97706', wide:true },
    { icon:MessageSquare, title:'Communication',           desc:'Teacher-parent messaging',               items:['Teacher-parent messaging','Announcement system','Events & notifications','Multilingual support'], accent:'#0891b2' },
    { icon:Clock,         title:'Timetable Management',   desc:'Automatic timetable generator',          items:['Auto generator','Conflict detection','Substitution system','Room booking'], accent:'#7c3aed' },
    { icon:Users,         title:'Student & Staff',        desc:'Profiles, portfolio, discipline',        items:['Student profiles','Teacher workload','Discipline management','Parent portal'], accent:'#be185d' },
    { icon:Sparkles,      title:'Zeka AI',                 desc:'AI-powered teaching assistant',          items:['AI homework assistant','Report generator','Essay feedback','Personalised learning'], accent:'#6d28d9', wide:true },
  ],
  tr: [
    { icon:BookOpen,      title:'Müfredat Yönetimi',   desc:'Ortak planlama, 600+ standart',         items:['Ortak müfredat planlaması','600+ yerleşik standart','Uyum araçları','IBIS entegrasyonu'], accent:'#7c3aed', wide:true },
    { icon:ClipboardCheck,title:'Değerlendirme',        desc:'IB + ulusal sistem desteği',            items:['IB kriterleri (A–D)','10 puanlık sistem','Gerçek zamanlı senkronizasyon','Öğrenci analitiği'], accent:'#2563eb' },
    { icon:Calendar,      title:'Devam Takibi',         desc:'Tek dokunuşla kayıt',                   items:['Tek dokunuşla kayıt','Veli bildirimleri','Trend analitiği','E-Gov.az uyumlu'], accent:'#059669' },
    { icon:BarChart2,     title:'Raporlar & Analitik', desc:'Bakanlık + IB raporlaması',             items:['Bakanlık raporları','E-Gov.az dışa aktarma','PDF, Excel','IB Denetim belgeleri'], accent:'#d97706', wide:true },
    { icon:MessageSquare, title:'İletişim',              desc:'Öğretmen-veli mesajlaşma',              items:['Öğretmen-veli mesajlaşma','Duyuru sistemi','Etkinlikler & bildirimler','Çok dilli destek'], accent:'#0891b2' },
    { icon:Clock,         title:'Program Yönetimi',     desc:'Otomatik program oluşturucu',           items:['Otomatik oluşturucu','Çakışma tespiti','Vekâlet sistemi','Oda rezervasyonu'], accent:'#7c3aed' },
    { icon:Users,         title:'Öğrenci & Personel',  desc:'Profiller, portfolio, disiplin',        items:['Öğrenci profilleri','Öğretmen iş yükü','Disiplin yönetimi','Veli portalı'], accent:'#be185d' },
    { icon:Sparkles,      title:'Zeka AI',               desc:'AI destekli öğretim asistanı',          items:['AI ödev asistanı','Rapor oluşturucu','Kompozisyon geri bildirimi','Kişiselleştirilmiş öğrenme'], accent:'#6d28d9', wide:true },
  ],
  ru: [
    { icon:BookOpen,       title:'Управление учебной программой', desc:'Совместное планирование, 600+ стандартов', items:['Совместное планирование','600+ встроенных стандартов','Инструменты соответствия','Интеграция IBIS'], accent:'#7c3aed', wide:true },
    { icon:ClipboardCheck, title:'Оценивание',                   desc:'Поддержка IB + национальной системы',     items:['Критерии IB (A–D)','10-балльная система','Синхронизация в реальном времени','Аналитика учащихся'], accent:'#2563eb' },
    { icon:Calendar,       title:'Посещаемость',                  desc:'Отметка в одно касание',                 items:['Отметка в одно касание','Уведомления родителям','Аналитика тенденций','Совместимость с E-Gov.az'], accent:'#059669' },
    { icon:BarChart2,      title:'Отчёты & Аналитика',           desc:'Отчётность для Министерства + IB',        items:['Отчёты для Министерства','Экспорт E-Gov.az','PDF, Excel','Документация IB Audit'], accent:'#d97706', wide:true },
    { icon:MessageSquare,  title:'Коммуникация',                  desc:'Общение учитель–родитель',               items:['Сообщения учитель–родитель','Система объявлений','События & уведомления','Многоязычная поддержка'], accent:'#0891b2' },
    { icon:Clock,          title:'Управление расписанием',        desc:'Автоматический генератор расписания',    items:['Автогенератор','Обнаружение конфликтов','Система замен','Бронирование кабинетов'], accent:'#7c3aed' },
    { icon:Users,          title:'Ученики & Персонал',           desc:'Профили, портфолио, дисциплина',         items:['Профили учащихся','Нагрузка учителей','Управление дисциплиной','Портал родителей'], accent:'#be185d' },
    { icon:Sparkles,       title:'Зека AI',                       desc:'AI-ассистент для обучения',              items:['AI-помощник для домашних заданий','Генератор отчётов','Инструмент для эссе','Персонализированное обучение'], accent:'#6d28d9', wide:true },
  ],
}

export default function Features() {
  const { lang, setLang } = useLang()
  const s = STR[lang] || STR.az
  const features = FEATURES[lang] || FEATURES.az
  useSEO({
    title: lang==='az' ? 'Xüsusiyyətlər — 8 Modul, 60+ Funksiya' : lang==='ru' ? 'Возможности — 8 модулей, 60+ функций' : lang==='tr' ? 'Özellikler — 8 Modül, 60+ Özellik' : 'Features — 8 Modules, 60+ Capabilities',
    description: lang==='az' ? 'Kurikulum idarəetməsi, qiymətləndirmə, davamiyyət, hesabatlar, kommunikasiya, cədvəl, Zəka AI — hamısı bir platformada.' : 'Curriculum management, assessment, attendance, reports, communication, timetable, Zeka AI — all in one platform.',
    canonical: '/features',
    keywords: 'school management features, kurikulum idarəetməsi, məktəb xüsusiyyətləri, IB assessment platform, school attendance software Azerbaijan',
  })
  return (
    <div style={{ background: '#fff', fontFamily: 'inherit' }}>
      <style>{`
        .feat-cta-btn { transition: transform .17s ease, box-shadow .17s ease; }
        .feat-cta-btn:hover { transform: translateY(-2px); box-shadow: 0 14px 40px rgba(109,40,217,0.55) !important; }
        .feat-learn { transition: gap .15s ease; }
        .feat-learn:hover { gap: 8px !important; }
        .feat-nav-pill { transition: background .15s ease, color .15s ease, border-color .15s ease; }
        .feat-nav-pill:hover { background: rgba(124,58,237,0.1) !important; color: #7c3aed !important; border-color: rgba(124,58,237,0.3) !important; }
        @media (max-width: 767px) {
          .feat-row-inner { flex-direction: column !important; }
          .feat-row-inner.reverse { flex-direction: column !important; }
          .feat-row-left, .feat-row-right { width: 100% !important; }
        }
      `}</style>

      <LandingNav s={s} lang={lang} setLang={setLang} />

      {/* ── Hero ── */}
      <section style={{ background: '#060614', position: 'relative', overflow: 'hidden', padding: '112px 24px 96px', textAlign: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.045) 1px, transparent 1px)', backgroundSize: '36px 36px', WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black, transparent)', maskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black, transparent)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '60%', height: '80%', background: 'radial-gradient(ellipse, rgba(83,74,183,.30) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '-10%', right: '-8%', width: '50%', height: '70%', background: 'radial-gradient(ellipse, rgba(109,40,217,.20) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 820, margin: '0 auto' }}>
          {/* Eyebrow */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 16px', borderRadius: 99, border: '1px solid rgba(167,139,250,0.28)', background: 'rgba(167,139,250,0.09)', marginBottom: 28 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#a78bfa', display: 'inline-block' }} />
            <span style={{ fontSize: 11.5, fontWeight: 700, color: '#a78bfa', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{s.hero_eyebrow}</span>
          </div>

          <h1 style={{ fontSize: 'clamp(2.6rem,6.5vw,4.6rem)', fontWeight: 900, color: '#fff', lineHeight: 1.06, letterSpacing: '-0.035em', marginBottom: 8 }}>
            {s.hero_h1}
          </h1>
          <h2 style={{ fontSize: 'clamp(2.6rem,6.5vw,4.6rem)', fontWeight: 900, lineHeight: 1.06, letterSpacing: '-0.035em', marginBottom: 28, background: 'linear-gradient(128deg,#c4b5fd 0%,#a78bfa 40%,#818cf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            {s.hero_h2}
          </h2>

          <p style={{ fontSize: 'clamp(1rem,2.2vw,1.18rem)', color: 'rgba(255,255,255,0.52)', lineHeight: 1.78, maxWidth: 540, margin: '0 auto 52px' }}>
            {s.hero_body}
          </p>

          {/* Feature icon grid pills */}
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 10 }}>
            {features.map((f, i) => {
              const IC = f.icon
              return (
                <a
                  key={i}
                  href={`#feature-${i}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 16px',
                    borderRadius: 99,
                    background: `${f.accent}14`,
                    border: `1px solid ${f.accent}28`,
                    textDecoration: 'none',
                    color: 'rgba(255,255,255,0.85)',
                    fontSize: 13,
                    fontWeight: 600,
                    transition: 'background .15s ease, transform .15s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${f.accent}28`; e.currentTarget.style.transform = 'translateY(-1px)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = `${f.accent}14`; e.currentTarget.style.transform = '' }}
                >
                  <IC style={{ width: 14, height: 14, color: f.accent, flexShrink: 0 }} />
                  {f.title}
                </a>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Quick nav pill row ── */}
      <div style={{ background: '#0d0d1f', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', overflowX: 'auto', display: 'flex', gap: 4, padding: '14px 0', scrollbarWidth: 'none' }}>
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
                  padding: '7px 16px',
                  borderRadius: 99,
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.5)',
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

      {/* ── Alternating Feature Rows ── */}
      <section>
        {features.map((f, i) => {
          const IC = f.icon
          const isReverse = i % 2 === 1
          const rowBg = isReverse ? '#f9fafb' : '#fff'

          return (
            <div key={f.title} id={`feature-${i}`}>
              {/* Divider (skip first) */}
              {i > 0 && <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.06) 20%, rgba(0,0,0,0.06) 80%, transparent)' }} />}

              <div style={{ background: rowBg, padding: '80px 24px' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                  <div
                    className={`feat-row-inner${isReverse ? ' reverse' : ''}`}
                    style={{
                      display: 'flex',
                      flexDirection: isReverse ? 'row-reverse' : 'row',
                      gap: 64,
                      alignItems: 'flex-start',
                    }}
                  >
                    {/* Left col: icon + title + desc + link */}
                    <div
                      className="feat-row-left"
                      style={{ width: '38%', flexShrink: 0 }}
                    >
                      {/* Icon pill */}
                      <div style={{
                        width: 64,
                        height: 64,
                        borderRadius: 18,
                        background: `${f.accent}14`,
                        border: `1px solid ${f.accent}28`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 20,
                      }}>
                        <IC style={{ width: 28, height: 28, color: f.accent }} />
                      </div>

                      <h3 style={{ fontSize: 'clamp(1.3rem,2.2vw,1.65rem)', fontWeight: 900, color: '#0f0f1a', lineHeight: 1.2, marginBottom: 12, letterSpacing: '-0.025em' }}>{f.title}</h3>
                      <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.72, marginBottom: 24 }}>{f.desc}</p>

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
                              background: `${f.accent}14`,
                              border: `1px solid ${f.accent}28`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              <Check style={{ width: 12, height: 12, color: f.accent, strokeWidth: 3 }} />
                            </span>
                            <span style={{ fontSize: 15.5, color: '#374151', fontWeight: 600, lineHeight: 1.55 }}>{item}</span>
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
      </section>

      {/* ── CTA ── */}
      <section style={{ background: '#060614', position: 'relative', overflow: 'hidden', padding: '104px 24px', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: '-40%', left: '10%', width: '80%', height: '160%', background: 'radial-gradient(ellipse, rgba(109,40,217,.28) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px', WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, black, transparent)', maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, black, transparent)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 580, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.7rem,3.5vw,2.6rem)', fontWeight: 900, color: '#fff', marginBottom: 16, lineHeight: 1.18, letterSpacing: '-0.03em' }}>{s.cta_h}</h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.48)', marginBottom: 40, lineHeight: 1.75 }}>{s.cta_sub}</p>
          <Link
            to="/contact"
            className="feat-cta-btn"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', fontWeight: 700, fontSize: 15, padding: '15px 32px', borderRadius: 14, textDecoration: 'none', boxShadow: '0 8px 32px rgba(109,40,217,0.45)' }}
          >
            {s.cta_btn} <ArrowRight style={{ width: 16, height: 16 }} />
          </Link>
        </div>
      </section>

      <footer style={{ background: '#060614', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '22px 24px', textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.22)', fontSize: 12.5 }}>{s.footer}</p>
      </footer>
    </div>
  )
}
