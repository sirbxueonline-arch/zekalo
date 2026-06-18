import { Link } from 'react-router-dom'
import { CheckCircle, Building2, ArrowRight, ArrowUpRight } from 'lucide-react'
import { useLang } from '../contexts/LanguageContext'
import LandingNav from '../components/layout/LandingNav'
import Mascot from '../components/ui/Mascot'
import { useSEO } from '../hooks/useSEO'

const STR = {
  az: {
    nav_solutions:'Həllər', nav_features:'Xüsusiyyətlər', nav_signin: 'Daxil ol', nav_contact: 'Bizimlə Əlaqə',
    hero_eyebrow: 'Həllər',
    hero_h1a: 'Hər məktəb üçün',
    hero_h1b: 'doğru həll',
    hero_sub: 'IB dünya məktəbləri və Azərbaycan dövlət məktəbləri üçün — hər kurikulum çərçivəsi dəstəklənir.',
    hero_cta_demo: 'Demo Sifariş Et',
    hero_cta_features: 'Bütün Xüsusiyyətlər',
    stat1_n: '5', stat1_l: 'Proqram',
    stat2_n: '600+', stat2_l: 'Standart',
    stat3_n: 'E-Gov.az', stat3_l: 'İnteqrasiya',
    stat4_n: 'IBIS', stat4_l: 'Sinxronizasiya',
    programmes_title: 'Dəstəklənən Proqramlar',
    programmes_sub: 'Kurikulumunuzu seçin, Zirva qalanını həll edir.',
    learn_more: 'Ətraflı bax',
    cta_h: 'Hansı proqram sizin üçündür?',
    cta_sub: 'Komandamız sizin məktəb növünüzə uyğun həll tapacaq.',
    cta_btn: 'Bizimlə Əlaqə',
    footer: '© 2026 Zirva LLC',
  },
  en: {
    nav_solutions:'Solutions', nav_features:'Features', nav_signin: 'Sign In', nav_contact: 'Contact Us',
    hero_eyebrow: 'Solutions',
    hero_h1a: 'The right fit',
    hero_h1b: 'for every school',
    hero_sub: 'Purpose-built modules for IB World Schools and Azerbaijani state schools — every curriculum framework supported.',
    hero_cta_demo: 'Book a Demo',
    hero_cta_features: 'All Features',
    stat1_n: '5', stat1_l: 'Programmes',
    stat2_n: '600+', stat2_l: 'Standards',
    stat3_n: 'E-Gov.az', stat3_l: 'Integration',
    stat4_n: 'IBIS', stat4_l: 'Sync',
    programmes_title: 'Supported Programmes',
    programmes_sub: 'Pick your curriculum. Zirva handles the rest.',
    learn_more: 'Learn more',
    cta_h: 'Not sure which fits your school?',
    cta_sub: 'Our team will match you with the right solution.',
    cta_btn: 'Contact Us',
    footer: '© 2026 Zirva LLC',
  },
  tr: {
    nav_solutions:'Çözümler', nav_features:'Özellikler', nav_signin: 'Giriş yap', nav_contact: 'Bize Ulaşın',
    hero_eyebrow: 'Çözümler',
    hero_h1a: 'Her okul için',
    hero_h1b: 'doğru çözüm',
    hero_sub: 'IB dünya okulları ve Azerbaycan devlet okulları için — her müfredat çerçevesi desteklenmektedir.',
    hero_cta_demo: 'Demo Talep Et',
    hero_cta_features: 'Tüm Özellikler',
    stat1_n: '5', stat1_l: 'Program',
    stat2_n: '600+', stat2_l: 'Standart',
    stat3_n: 'E-Gov.az', stat3_l: 'Entegrasyon',
    stat4_n: 'IBIS', stat4_l: 'Senkronizasyon',
    programmes_title: 'Desteklenen Programlar',
    programmes_sub: 'Müfredatınızı seçin, gerisini Zirva halleder.',
    learn_more: 'Daha fazla',
    cta_h: 'Okulunuza hangisinin uygun olduğundan emin değil misiniz?',
    cta_sub: 'Ekibimiz sizin için doğru çözümü bulacak.',
    cta_btn: 'Bize Ulaşın',
    footer: '© 2026 Zirva LLC',
  },
  ru: {
    nav_solutions:'Решения', nav_features:'Возможности', nav_signin: 'Войти', nav_contact: 'Связаться',
    hero_eyebrow: 'Решения',
    hero_h1a: 'Правильное решение',
    hero_h1b: 'для каждой школы',
    hero_sub: 'Специализированные модули для IB World Schools и государственных школ Азербайджана — поддерживаются все учебные программы.',
    hero_cta_demo: 'Заказать демо',
    hero_cta_features: 'Все функции',
    stat1_n: '5', stat1_l: 'Программ',
    stat2_n: '600+', stat2_l: 'Стандартов',
    stat3_n: 'E-Gov.az', stat3_l: 'Интеграция',
    stat4_n: 'IBIS', stat4_l: 'Синхронизация',
    programmes_title: 'Поддерживаемые программы',
    programmes_sub: 'Выберите программу. Zirva позаботится об остальном.',
    learn_more: 'Подробнее',
    cta_h: 'Не уверены, что подходит вашей школе?',
    cta_sub: 'Наша команда подберёт для вас правильное решение.',
    cta_btn: 'Связаться',
    footer: '© 2026 Zirva LLC',
  },
}

// Audience-accent mapping — each programme (audience) owns ONE muted hue (V3 §2.2).
// Keys preserved so card `tone` data stays unchanged; values mapped to V3 tokens.
const TONES = {
  peach:      { accent: '#B45309', soft: 'rgba(234,179,8,0.10)',   chip: 'icon-chip-peach' },
  periwinkle: { accent: '#574FCF', soft: 'rgba(87,79,207,0.08)',   chip: 'icon-chip-periwinkle' },
  blue:       { accent: '#1D7FB8', soft: 'rgba(59,168,230,0.10)',  chip: 'icon-chip-blue' },
  lavender:   { accent: '#6D28D9', soft: 'rgba(124,92,224,0.09)',  chip: 'icon-chip-grape' },
  mint:       { accent: '#15803D', soft: 'rgba(31,168,85,0.09)',   chip: 'icon-chip-mint' },
}

const CARDS = {
  az: [
    { img:'/pyp.png', name:'IB İlk İllər (PYP)', ages:'3–12', desc:'Erkən yaş qrupları üçün güclü dəstək — portfolio, Unit of Inquiry planlaması və valideyn bildirişləri.', features:['Portfolio idarəetməsi','Unit of Inquiry planlaması','Şagird irəliləyiş hesabatı','Valideyn bildiriş sistemi'], link:'/ib-pyp', tone:'peach' },
    { img:'/myp.png', name:'IB Orta İllər (MYP)', ages:'11–16', desc:'Tədqiqat əsaslı planlaşdırma və IB A–D kriteriyaları üzrə tam qiymətləndirmə dəstəyi.', features:['Unit Planner aləti','Kriteriya qiymətləndirməsi (A–D)','Şagird irəliləyiş analitikası','e-Portfolio dəstəyi'], link:'/ib-myp', tone:'periwinkle' },
    { img:'/dp.png',  name:'IB Diploma (DP)',      ages:'16–19', desc:'DP-nin bütün komponentlərini — imtahan qeydiyyatından CAS-a qədər — bir platformada idarə edin.', features:['IBIS imtahan qeydiyyatı','CAS fəaliyyət izlənməsi','DP qiymət cədvəli','Kollec məsləhəti modulü'], link:'/ib-diploma', tone:'blue' },
    { img:'/cp.png',  name:'IB Karyera (CP)',       ages:'16–19', desc:'Karyera əlaqəli tədris, şəxsi inkişaf və Reflective Project izlənməsi üçün tam dəstək.', features:['Karyera inkişaf planı','Reflective Project izlənməsi','Şəxsi-peşə bacarıqları','IBIS inteqrasiyası'], link:'/ib-career', tone:'lavender' },
    { img:null, icon:Building2, name:'Milli Kurikulum', ages:'6–18', desc:'Nazirlik hesabatları, E-Gov.az inteqrasiyası və 10 ballıq qiymətləndirmə sistemi ilə dövlət məktəbləri üçün tam həll.', features:['10 ballıq qiymətləndirmə','Nazirlik hesabatları','E-Gov.az avtomatik ixrac','Davamiyyət + qiymət sinxronizasiyası'], link:'/government-schools', tone:'mint' },
  ],
  en: [
    { img:'/pyp.png', name:'IB Primary Years (PYP)', ages:'3–12', desc:'Full support for early years — portfolio management, Unit of Inquiry planning and parent communication.', features:['Portfolio management','Unit of Inquiry planning','Student progress reports','Parent notification system'], link:'/ib-pyp', tone:'peach' },
    { img:'/myp.png', name:'IB Middle Years (MYP)',   ages:'11–16', desc:'Inquiry-based planning and full IB A–D criteria-aligned assessment support.', features:['Unit Planner tool','Criteria assessment (A–D)','Student analytics','e-Portfolio support'], link:'/ib-myp', tone:'periwinkle' },
    { img:'/dp.png',  name:'IB Diploma (DP)',           ages:'16–19', desc:'Manage every DP component — from exam registration to CAS — all in one platform.', features:['IBIS exam registration','CAS activity tracking','DP subject grade tracker','College counselling module'], link:'/ib-diploma', tone:'blue' },
    { img:'/cp.png',  name:'IB Career-Related (CP)',    ages:'16–19', desc:'Full support for career-related learning, personal development and Reflective Project tracking.', features:['Career development plan','Reflective Project tracking','Personal-professional skills','IBIS integration'], link:'/ib-career', tone:'lavender' },
    { img:null, icon:Building2, name:'National Curriculum', ages:'6–18', desc:'Ministry reports, E-Gov.az integration and a 10-point grading system — purpose-built for state schools.', features:['10-point grading system','Ministry reports','E-Gov.az auto-export','Attendance + grade sync'], link:'/government-schools', tone:'mint' },
  ],
  tr: [
    { img:'/pyp.png', name:'IB İlk Yıllar (PYP)', ages:'3–12', desc:'Erken yıllar için güçlü destek — portfolio yönetimi, Araştırma Birimi planlaması ve veli bildirimleri.', features:['Portfolio yönetimi','Araştırma Birimi planlaması','Öğrenci ilerleme raporu','Veli bildirim sistemi'], link:'/ib-pyp', tone:'peach' },
    { img:'/myp.png', name:'IB Orta Yıllar (MYP)', ages:'11–16', desc:'Araştırma tabanlı planlama ve IB A–D kriterlerine göre tam değerlendirme desteği.', features:['Birim Planlayıcı aracı','Kriter değerlendirmesi (A–D)','Öğrenci ilerleme analitiği','e-Portfolio desteği'], link:'/ib-myp', tone:'periwinkle' },
    { img:'/dp.png',  name:'IB Diploma (DP)', ages:'16–19', desc:"DP'nin tüm bileşenlerini — sınav kaydından CAS'a kadar — tek platformda yönetin.", features:['IBIS sınav kaydı','CAS faaliyet takibi','DP not çizelgesi','Üniversite danışmanlığı modülü'], link:'/ib-diploma', tone:'blue' },
    { img:'/cp.png',  name:'IB Kariyer (CP)', ages:'16–19', desc:'Kariyer odaklı eğitim, kişisel gelişim ve Düşünce Projesi takibi için tam destek.', features:['Kariyer gelişim planı','Yansıma Projesi takibi','Kişisel-mesleki beceriler','IBIS entegrasyonu'], link:'/ib-career', tone:'lavender' },
    { img:null, icon:Building2, name:'Ulusal Müfredat', ages:'6–18', desc:'Bakanlık raporları, E-Gov.az entegrasyonu ve 10 puanlık notlandırma sistemi ile devlet okulları için tam çözüm.', features:['10 puanlık notlandırma','Bakanlık raporları','E-Gov.az otomatik dışa aktarma','Devam + not senkronizasyonu'], link:'/government-schools', tone:'mint' },
  ],
  ru: [
    { img:'/pyp.png', name:'IB Начальные годы (PYP)', ages:'3–12', desc:'Полная поддержка для младшего возраста — управление портфолио, планирование Unit of Inquiry и уведомления родителям.', features:['Управление портфолио','Планирование Unit of Inquiry','Отчёт о прогрессе учащихся','Система уведомлений родителей'], link:'/ib-pyp', tone:'peach' },
    { img:'/myp.png', name:'IB Средние годы (MYP)', ages:'11–16', desc:'Планирование на основе исследования и поддержка оценивания по критериям IB A–D.', features:['Инструмент Unit Planner','Критериальное оценивание (A–D)','Аналитика учащихся','Поддержка e-Portfolio'], link:'/ib-myp', tone:'periwinkle' },
    { img:'/dp.png',  name:'IB Diploma (DP)', ages:'16–19', desc:'Управляйте всеми компонентами DP — от регистрации на экзамены до CAS — в одной платформе.', features:['Регистрация на экзамены IBIS','Отслеживание активности CAS','Трекер оценок DP','Модуль консультирования по университетам'], link:'/ib-diploma', tone:'blue' },
    { img:'/cp.png',  name:'IB Career-Related (CP)', ages:'16–19', desc:'Полная поддержка карьерно-ориентированного обучения, личностного развития и отслеживания Reflective Project.', features:['План карьерного развития','Отслеживание Reflective Project','Личностно-профессиональные навыки','Интеграция IBIS'], link:'/ib-career', tone:'lavender' },
    { img:null, icon:Building2, name:'Национальная программа', ages:'6–18', desc:'Отчёты для Министерства, интеграция E-Gov.az и 10-балльная система — специально для государственных школ.', features:['10-балльная система','Отчёты для Министерства','Автоэкспорт E-Gov.az','Синхронизация посещаемости + оценок'], link:'/government-schools', tone:'mint' },
  ],
}

export default function Solutions() {
  const { lang, setLang } = useLang()
  const s = STR[lang] || STR.az
  const cards = CARDS[lang] || CARDS.az
  useSEO({
    title: lang==='az' ? 'Həllər — IB və Milli Kurikulum Dəstəyi' : lang==='ru' ? 'Решения — IB и национальная программа' : lang==='tr' ? 'Çözümler — IB ve Ulusal Müfredat' : 'Solutions — IB & National Curriculum',
    description: lang==='az' ? 'Zirva IB PYP, MYP, DP, CP və Azərbaycan milli kurikulumu dəstəkləyir. Hər məktəb üçün doğru həll.' : 'Zirva supports IB PYP, MYP, DP, CP and the Azerbaijani national curriculum. The right fit for every school.',
    canonical: '/solutions',
    keywords: 'IB school Azerbaijan, IB PYP MYP DP CP Azerbaijan, məktəb həlləri, school solutions Azerbaijan, dövlət məktəbi idarəetmə',
  })
  return (
    <div style={{ background: 'var(--canvas)', fontFamily: 'inherit', color: 'var(--ink-900)' }}>
      <style>{`
        .sol-learn { transition: gap .15s ease; }
        .sol-learn:hover { gap: 8px !important; }
        .sol-logo-card { transition: transform .15s var(--ease-out-quint), box-shadow .15s ease; }
        .sol-logo-card:hover { transform: translateY(-2px); }
        @media (max-width: 767px) {
          .sol-row-inner { flex-direction: column !important; }
          .sol-row-inner.reverse { flex-direction: column !important; }
          .sol-row-left, .sol-row-right { width: 100% !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .sol-logo-card { transition: none !important; }
        }
      `}</style>

      <LandingNav s={s} lang={lang} setLang={setLang} lightHero />

      {/* ── Hero ── */}
      <section style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '160px 24px 110px',
        textAlign: 'center',
        background: 'var(--canvas)',
      }}>
        {/* Single static brand wash (shared class from index.css) */}
        <div className="hb1" />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 820, margin: '0 auto' }}>
          {/* Eyebrow pill */}
          <div style={{ display:'flex', justifyContent:'center', marginBottom:22 }}>
            <span className="pill-peri" style={{ fontSize:12.5, padding:'6px 14px' }}>{s.hero_eyebrow}</span>
          </div>

          {/* Headline */}
          <h1 className="font-display" style={{
            fontSize: 'clamp(2.7rem,6.6vw,4.7rem)',
            fontWeight: 800,
            lineHeight: 1.06,
            letterSpacing: '-0.03em',
            marginBottom: 24,
            color: 'var(--ink-900)',
          }}>
            {s.hero_h1a}{' '}
            <span className="pastel-text">{s.hero_h1b}</span>
          </h1>

          <p style={{
            fontSize: 'clamp(1rem,2.2vw,1.18rem)',
            color: 'var(--ink-600)',
            lineHeight: 1.78,
            maxWidth: 560,
            margin: '0 auto 40px',
          }}>
            {s.hero_sub}
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 56 }}>
            <Link to="/contact" className="btn-pastel">
              {s.hero_cta_demo} <ArrowRight style={{ width: 15, height: 15 }} />
            </Link>
            <Link to="/features" className="btn-ghost-pastel">
              {s.hero_cta_features} <ArrowUpRight style={{ width: 15, height: 15 }} />
            </Link>
          </div>

          {/* Programme logo strip */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            {['/pyp.png', '/myp.png', '/dp.png', '/cp.png'].map((src, i) => (
              <div key={i} className="liquid-card sol-logo-card" style={{
                width: 60, height: 60,
                borderRadius: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 0,
              }}>
                <img src={src} alt="" style={{ width: 38, height: 38, objectFit: 'contain' }} />
              </div>
            ))}
            <div className="liquid-card sol-logo-card" style={{
              width: 60, height: 60,
              borderRadius: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 0,
            }}>
              <Building2 style={{ width: 26, height: 26, color: 'var(--ink-400)' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section style={{ background: 'var(--canvas)', padding: '0 24px', position: 'relative' }}>
        <div className="liquid-card" style={{
          maxWidth: 1100,
          margin: '-40px auto 0',
          display: 'grid',
          gridTemplateColumns: 'repeat(4,1fr)',
          padding: '8px 0',
          position: 'relative',
          zIndex: 2,
        }}>
          {[
            { n: s.stat1_n, l: s.stat1_l },
            { n: s.stat2_n, l: s.stat2_l },
            { n: s.stat3_n, l: s.stat3_l },
            { n: s.stat4_n, l: s.stat4_l },
          ].map((stat, i) => (
            <div key={i} style={{
              padding: '24px 16px',
              textAlign: 'center',
              borderRight: i < 3 ? '1px solid var(--hairline)' : 'none',
            }}>
              <div className="font-display" style={{
                fontSize: 'clamp(1.3rem,2.6vw,1.8rem)',
                fontWeight: 800,
                color: 'var(--ink-900)',
                letterSpacing: '-0.02em',
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
              }}>{stat.n}</div>
              <div style={{
                fontSize: 12,
                color: 'var(--ink-400)',
                fontWeight: 600,
                marginTop: 8,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}>{stat.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Programme Stacked Rows ── */}
      <section style={{ background: 'var(--canvas)', padding: '96px 24px 120px', position: 'relative', overflow: 'hidden' }}>
        {/* Single soft brand wash */}
        <div className="section-blob" style={{ width: 480, height: 480, top: '8%', left: '-12%', background: 'rgba(87,79,207,0.07)' }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Section heading */}
          <div style={{ textAlign: 'center', marginBottom: 72 }}>
            <h2 className="font-display" style={{
              fontSize: 'clamp(1.8rem,3.2vw,2.6rem)',
              fontWeight: 800,
              color: 'var(--ink-900)',
              marginBottom: 14,
              letterSpacing: '-0.025em',
            }}>{s.programmes_title}</h2>
            <p style={{ fontSize: 16.5, color: 'var(--ink-600)', fontWeight: 500 }}>{s.programmes_sub}</p>
          </div>

          {/* Rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {cards.map((card, idx) => {
              const IC = card.icon
              const isReverse = idx % 2 === 1
              const tone = TONES[card.tone] || TONES.periwinkle
              return (
                <div
                  key={card.name}
                  className="liquid-card"
                  style={{
                    overflow: 'hidden',
                    padding: 0,
                  }}
                >
                  <div
                    className={`sol-row-inner${isReverse ? ' reverse' : ''}`}
                    style={{
                      display: 'flex',
                      flexDirection: isReverse ? 'row-reverse' : 'row',
                      alignItems: 'stretch',
                    }}
                  >
                    {/* Left panel: identity */}
                    <div
                      className="sol-row-left"
                      style={{
                        width: '38%',
                        padding: '44px 40px',
                        background: `linear-gradient(145deg, ${tone.soft} 0%, rgba(255,255,255,0) 100%)`,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        borderRight: isReverse ? 'none' : '1px solid var(--hairline)',
                        borderLeft: isReverse ? '1px solid var(--hairline)' : 'none',
                      }}
                    >
                      {/* Icon */}
                      <div style={{ marginBottom: 20 }}>
                        {card.img ? (
                          <div className={`icon-chip ${tone.chip}`} style={{
                            width: 72, height: 72, borderRadius: 14,
                          }}>
                            <img src={card.img} alt={card.name} style={{ width: 48, height: 48, objectFit: 'contain' }} />
                          </div>
                        ) : (
                          <div className={`icon-chip ${tone.chip}`} style={{
                            width: 72, height: 72, borderRadius: 14,
                          }}>
                            <IC style={{ width: 32, height: 32, color: tone.accent }} />
                          </div>
                        )}
                      </div>

                      {/* Name + age badge */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
                        <h3 style={{
                          fontSize: 'clamp(1.05rem,1.8vw,1.25rem)',
                          fontWeight: 700,
                          color: 'var(--ink-900)',
                          lineHeight: 1.25,
                          margin: 0,
                          letterSpacing: '-0.01em',
                        }}>{card.name}</h3>
                        <span style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: tone.accent,
                          background: `${tone.accent}1a`,
                          padding: '4px 11px',
                          borderRadius: 999,
                          whiteSpace: 'nowrap',
                          alignSelf: 'flex-start',
                          marginTop: 3,
                          letterSpacing: '0.01em',
                        }}>
                          {card.ages}
                        </span>
                      </div>

                      <p style={{ fontSize: 14, color: 'var(--ink-600)', lineHeight: 1.7, margin: '0 0 24px' }}>{card.desc}</p>

                      <Link
                        to={card.link}
                        className="sol-learn"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          fontSize: 13.5,
                          fontWeight: 700,
                          color: tone.accent,
                          textDecoration: 'none',
                        }}
                      >
                        {s.learn_more} <ArrowRight style={{ width: 14, height: 14 }} />
                      </Link>
                    </div>

                    {/* Right panel: features */}
                    <div
                      className="sol-row-right"
                      style={{
                        flex: 1,
                        padding: '44px 40px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                      }}
                    >
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '16px 24px' }}>
                        {card.features.map((f) => (
                          <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                            <span style={{
                              flexShrink: 0,
                              marginTop: 2,
                              width: 22,
                              height: 22,
                              borderRadius: '50%',
                              background: `${tone.accent}1f`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              <CheckCircle style={{ width: 12, height: 12, color: tone.accent }} />
                            </span>
                            <span style={{ fontSize: 14, color: 'var(--ink-900)', fontWeight: 600, lineHeight: 1.5 }}>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── CTA band ── */}
      <section style={{
        background: 'var(--canvas)',
        position: 'relative',
        padding: '40px 24px 110px',
        textAlign: 'center',
      }}>
        <div style={{
          position: 'relative',
          overflow: 'hidden',
          maxWidth: 1000,
          margin: '0 auto',
          borderRadius: 18,
          padding: '80px 32px',
          background: 'linear-gradient(135deg, var(--brand-600) 0%, var(--brand-500) 100%)',
          boxShadow: '0 12px 28px -10px rgba(20,22,40,.14)',
        }}>
          <div style={{ position: 'relative', zIndex: 1, maxWidth: 620, margin: '0 auto' }}>
            <h2 className="font-display" style={{
              fontSize: 'clamp(1.8rem,3.5vw,2.7rem)',
              fontWeight: 800,
              color: '#ffffff',
              marginBottom: 16,
              lineHeight: 1.18,
              letterSpacing: '-0.025em',
            }}>{s.cta_h}</h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.88)', marginBottom: 40, lineHeight: 1.75 }}>{s.cta_sub}</p>
            <Link to="/contact" className="btn-pastel" style={{
              background: '#ffffff',
              color: 'var(--brand-600)',
              boxShadow: '0 1px 2px rgba(20,22,40,.10)',
            }}>
              {s.cta_btn} <ArrowRight style={{ width: 16, height: 16 }} />
            </Link>
          </div>
        </div>
      </section>

      <footer style={{
        background: 'var(--canvas)',
        borderTop: '1px solid var(--hairline)',
        padding: '28px 24px',
        textAlign: 'center',
      }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
          <Mascot pose="waving" size={36} title="Zirva" />
          <p style={{ color: 'var(--ink-400)', fontSize: 12.5, fontWeight: 500, margin: 0 }}>{s.footer}</p>
        </div>
      </footer>
    </div>
  )
}
