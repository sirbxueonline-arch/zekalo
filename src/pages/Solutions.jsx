import { Link } from 'react-router-dom'
import { CheckCircle, Building2, ArrowRight, ArrowUpRight, LayoutGrid } from 'lucide-react'
import { useLang } from '../contexts/LanguageContext'
import LandingNav from '../components/layout/LandingNav'

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

const CARDS = {
  az: [
    { img:'/pyp.png', name:'IB İlk İllər (PYP)', ages:'3–12', desc:'Erkən yaş qrupları üçün güclü dəstək — portfolio, Unit of Inquiry planlaması və valideyn bildirişləri.', features:['Portfolio idarəetməsi','Unit of Inquiry planlaması','Şagird irəliləyiş hesabatı','Valideyn bildiriş sistemi'], link:'/ib-pyp', accent:'#f59e0b', glow:'rgba(245,158,11,0.15)' },
    { img:'/myp.png', name:'IB Orta İllər (MYP)', ages:'11–16', desc:'Tədqiqat əsaslı planlaşdırma və IB A–D kriteriyaları üzrə tam qiymətləndirmə dəstəyi.', features:['Unit Planner aləti','Kriteriya qiymətləndirməsi (A–D)','Şagird irəliləyiş analitikası','e-Portfolio dəstəyi'], link:'/ib-myp', accent:'#ef4444', glow:'rgba(239,68,68,0.15)' },
    { img:'/dp.png',  name:'IB Diploma (DP)',      ages:'16–19', desc:'DP-nin bütün komponentlərini — imtahan qeydiyyatından CAS-a qədər — bir platformada idarə edin.', features:['IBIS imtahan qeydiyyatı','CAS fəaliyyət izlənməsi','DP qiymət cədvəli','Kollec məsləhəti modulü'], link:'/ib-diploma', accent:'#3b82f6', glow:'rgba(59,130,246,0.15)' },
    { img:'/cp.png',  name:'IB Karyera (CP)',       ages:'16–19', desc:'Karyera əlaqəli tədris, şəxsi inkişaf və Reflective Project izlənməsi üçün tam dəstək.', features:['Karyera inkişaf planı','Reflective Project izlənməsi','Şəxsi-peşə bacarıqları','IBIS inteqrasiyası'], link:'/ib-career', accent:'#a855f7', glow:'rgba(168,85,247,0.15)' },
    { img:null, icon:Building2, name:'Milli Kurikulum', ages:'6–18', desc:'Nazirlik hesabatları, E-Gov.az inteqrasiyası və 10 ballıq qiymətləndirmə sistemi ilə dövlət məktəbləri üçün tam həll.', features:['10 ballıq qiymətləndirmə','Nazirlik hesabatları','E-Gov.az avtomatik ixrac','Davamiyyət + qiymət sinxronizasiyası'], link:'/government-schools', accent:'#1D9E75', glow:'rgba(29,158,117,0.15)' },
  ],
  en: [
    { img:'/pyp.png', name:'IB Primary Years (PYP)', ages:'3–12', desc:'Full support for early years — portfolio management, Unit of Inquiry planning and parent communication.', features:['Portfolio management','Unit of Inquiry planning','Student progress reports','Parent notification system'], link:'/ib-pyp', accent:'#f59e0b', glow:'rgba(245,158,11,0.15)' },
    { img:'/myp.png', name:'IB Middle Years (MYP)',   ages:'11–16', desc:'Inquiry-based planning and full IB A–D criteria-aligned assessment support.', features:['Unit Planner tool','Criteria assessment (A–D)','Student analytics','e-Portfolio support'], link:'/ib-myp', accent:'#ef4444', glow:'rgba(239,68,68,0.15)' },
    { img:'/dp.png',  name:'IB Diploma (DP)',           ages:'16–19', desc:'Manage every DP component — from exam registration to CAS — all in one platform.', features:['IBIS exam registration','CAS activity tracking','DP subject grade tracker','College counselling module'], link:'/ib-diploma', accent:'#3b82f6', glow:'rgba(59,130,246,0.15)' },
    { img:'/cp.png',  name:'IB Career-Related (CP)',    ages:'16–19', desc:'Full support for career-related learning, personal development and Reflective Project tracking.', features:['Career development plan','Reflective Project tracking','Personal-professional skills','IBIS integration'], link:'/ib-career', accent:'#a855f7', glow:'rgba(168,85,247,0.15)' },
    { img:null, icon:Building2, name:'National Curriculum', ages:'6–18', desc:'Ministry reports, E-Gov.az integration and a 10-point grading system — purpose-built for state schools.', features:['10-point grading system','Ministry reports','E-Gov.az auto-export','Attendance + grade sync'], link:'/government-schools', accent:'#1D9E75', glow:'rgba(29,158,117,0.15)' },
  ],
  tr: [
    { img:'/pyp.png', name:'IB İlk Yıllar (PYP)', ages:'3–12', desc:'Erken yıllar için güçlü destek — portfolio yönetimi, Araştırma Birimi planlaması ve veli bildirimleri.', features:['Portfolio yönetimi','Araştırma Birimi planlaması','Öğrenci ilerleme raporu','Veli bildirim sistemi'], link:'/ib-pyp', accent:'#f59e0b', glow:'rgba(245,158,11,0.15)' },
    { img:'/myp.png', name:'IB Orta Yıllar (MYP)', ages:'11–16', desc:'Araştırma tabanlı planlama ve IB A–D kriterlerine göre tam değerlendirme desteği.', features:['Birim Planlayıcı aracı','Kriter değerlendirmesi (A–D)','Öğrenci ilerleme analitiği','e-Portfolio desteği'], link:'/ib-myp', accent:'#ef4444', glow:'rgba(239,68,68,0.15)' },
    { img:'/dp.png',  name:'IB Diploma (DP)', ages:'16–19', desc:"DP'nin tüm bileşenlerini — sınav kaydından CAS'a kadar — tek platformda yönetin.", features:['IBIS sınav kaydı','CAS faaliyet takibi','DP not çizelgesi','Üniversite danışmanlığı modülü'], link:'/ib-diploma', accent:'#3b82f6', glow:'rgba(59,130,246,0.15)' },
    { img:'/cp.png',  name:'IB Kariyer (CP)', ages:'16–19', desc:'Kariyer odaklı eğitim, kişisel gelişim ve Düşünce Projesi takibi için tam destek.', features:['Kariyer gelişim planı','Yansıma Projesi takibi','Kişisel-mesleki beceriler','IBIS entegrasyonu'], link:'/ib-career', accent:'#a855f7', glow:'rgba(168,85,247,0.15)' },
    { img:null, icon:Building2, name:'Ulusal Müfredat', ages:'6–18', desc:'Bakanlık raporları, E-Gov.az entegrasyonu ve 10 puanlık notlandırma sistemi ile devlet okulları için tam çözüm.', features:['10 puanlık notlandırma','Bakanlık raporları','E-Gov.az otomatik dışa aktarma','Devam + not senkronizasyonu'], link:'/government-schools', accent:'#1D9E75', glow:'rgba(29,158,117,0.15)' },
  ],
  ru: [
    { img:'/pyp.png', name:'IB Начальные годы (PYP)', ages:'3–12', desc:'Полная поддержка для младшего возраста — управление портфолио, планирование Unit of Inquiry и уведомления родителям.', features:['Управление портфолио','Планирование Unit of Inquiry','Отчёт о прогрессе учащихся','Система уведомлений родителей'], link:'/ib-pyp', accent:'#f59e0b', glow:'rgba(245,158,11,0.15)' },
    { img:'/myp.png', name:'IB Средние годы (MYP)', ages:'11–16', desc:'Планирование на основе исследования и поддержка оценивания по критериям IB A–D.', features:['Инструмент Unit Planner','Критериальное оценивание (A–D)','Аналитика учащихся','Поддержка e-Portfolio'], link:'/ib-myp', accent:'#ef4444', glow:'rgba(239,68,68,0.15)' },
    { img:'/dp.png',  name:'IB Diploma (DP)', ages:'16–19', desc:'Управляйте всеми компонентами DP — от регистрации на экзамены до CAS — в одной платформе.', features:['Регистрация на экзамены IBIS','Отслеживание активности CAS','Трекер оценок DP','Модуль консультирования по университетам'], link:'/ib-diploma', accent:'#3b82f6', glow:'rgba(59,130,246,0.15)' },
    { img:'/cp.png',  name:'IB Career-Related (CP)', ages:'16–19', desc:'Полная поддержка карьерно-ориентированного обучения, личностного развития и отслеживания Reflective Project.', features:['План карьерного развития','Отслеживание Reflective Project','Личностно-профессиональные навыки','Интеграция IBIS'], link:'/ib-career', accent:'#a855f7', glow:'rgba(168,85,247,0.15)' },
    { img:null, icon:Building2, name:'Национальная программа', ages:'6–18', desc:'Отчёты для Министерства, интеграция E-Gov.az и 10-балльная система — специально для государственных школ.', features:['10-балльная система','Отчёты для Министерства','Автоэкспорт E-Gov.az','Синхронизация посещаемости + оценок'], link:'/government-schools', accent:'#1D9E75', glow:'rgba(29,158,117,0.15)' },
  ],
}

export default function Solutions() {
  const { lang, setLang } = useLang()
  const s = STR[lang] || STR.az
  const cards = CARDS[lang] || CARDS.az

  return (
    <div style={{ background: '#fff', fontFamily: 'inherit' }}>
      <style>{`
        .sol-row { transition: box-shadow .22s ease; }
        .sol-row:hover { box-shadow: 0 8px 48px rgba(0,0,0,0.10) !important; }
        .sol-cta-primary { transition: transform .17s ease, box-shadow .17s ease; }
        .sol-cta-primary:hover { transform: translateY(-2px); box-shadow: 0 14px 40px rgba(109,40,217,0.55) !important; }
        .sol-cta-ghost { transition: background .17s ease, color .17s ease; }
        .sol-cta-ghost:hover { background: rgba(255,255,255,0.12) !important; }
        .sol-learn { transition: gap .15s ease, opacity .15s ease; }
        .sol-learn:hover { gap: 8px !important; }
        @media (max-width: 767px) {
          .sol-row-inner { flex-direction: column !important; }
          .sol-row-inner.reverse { flex-direction: column !important; }
          .sol-row-left, .sol-row-right { width: 100% !important; }
        }
      `}</style>

      <LandingNav s={s} lang={lang} setLang={setLang} />

      {/* ── Hero ── */}
      <section style={{ background: '#060614', position: 'relative', overflow: 'hidden', padding: '112px 24px 100px', textAlign: 'center' }}>
        {/* Dot grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.045) 1px, transparent 1px)', backgroundSize: '36px 36px', WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black, transparent)', maskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black, transparent)', pointerEvents: 'none' }} />
        {/* Glow blobs */}
        <div style={{ position: 'absolute', top: '-25%', left: '-12%', width: '65%', height: '90%', background: 'radial-gradient(ellipse, rgba(83,74,183,.32) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '-15%', right: '-10%', width: '55%', height: '80%', background: 'radial-gradient(ellipse, rgba(29,158,117,.18) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 800, margin: '0 auto' }}>
          {/* Eyebrow */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 16px', borderRadius: 99, border: '1px solid rgba(167,139,250,0.28)', background: 'rgba(167,139,250,0.09)', marginBottom: 28 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#a78bfa', display: 'inline-block' }} />
            <span style={{ fontSize: 11.5, fontWeight: 700, color: '#a78bfa', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{s.hero_eyebrow}</span>
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: 'clamp(2.6rem,6.5vw,4.6rem)', fontWeight: 900, lineHeight: 1.06, letterSpacing: '-0.035em', marginBottom: 24, color: '#fff' }}>
            {s.hero_h1a}{' '}
            <span style={{ background: 'linear-gradient(128deg,#c4b5fd 0%,#a78bfa 40%,#818cf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {s.hero_h1b}
            </span>
          </h1>

          <p style={{ fontSize: 'clamp(1rem,2.2vw,1.18rem)', color: 'rgba(255,255,255,0.52)', lineHeight: 1.78, maxWidth: 540, margin: '0 auto 40px' }}>
            {s.hero_sub}
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 52 }}>
            <Link to="/contact" className="sol-cta-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', fontWeight: 700, fontSize: 14.5, padding: '13px 28px', borderRadius: 12, textDecoration: 'none', boxShadow: '0 8px 32px rgba(109,40,217,0.42)' }}>
              {s.hero_cta_demo} <ArrowRight style={{ width: 15, height: 15 }} />
            </Link>
            <Link to="/features" className="sol-cta-ghost"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.85)', fontWeight: 600, fontSize: 14.5, padding: '13px 28px', borderRadius: 12, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.14)' }}>
              {s.hero_cta_features} <ArrowUpRight style={{ width: 15, height: 15 }} />
            </Link>
          </div>

          {/* Programme logo strip */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            {['/pyp.png', '/myp.png', '/dp.png', '/cp.png'].map((src, i) => (
              <div key={i} style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.11)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
                <img src={src} alt="" style={{ width: 38, height: 38, objectFit: 'contain' }} />
              </div>
            ))}
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(29,158,117,0.14)', border: '1px solid rgba(29,158,117,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 style={{ width: 24, height: 24, color: '#34d399' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <div style={{ background: '#0d0d1f', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', padding: '0 24px' }}>
          {[
            { n: s.stat1_n, l: s.stat1_l },
            { n: s.stat2_n, l: s.stat2_l },
            { n: s.stat3_n, l: s.stat3_l },
            { n: s.stat4_n, l: s.stat4_l },
          ].map((stat, i) => (
            <div key={i} style={{ padding: '28px 16px', textAlign: 'center', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
              <div style={{ fontSize: 'clamp(1.2rem,2.5vw,1.7rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1 }}>{stat.n}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', fontWeight: 500, marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stat.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Programme Stacked Rows ── */}
      <section style={{ background: '#f9fafb', padding: '96px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {/* Section heading */}
          <div style={{ textAlign: 'center', marginBottom: 72 }}>
            <h2 style={{ fontSize: 'clamp(1.7rem,3vw,2.5rem)', fontWeight: 900, color: '#0f0f1a', marginBottom: 12, letterSpacing: '-0.03em' }}>{s.programmes_title}</h2>
            <p style={{ fontSize: 16.5, color: '#6b7280', fontWeight: 500 }}>{s.programmes_sub}</p>
          </div>

          {/* Rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {cards.map((card, idx) => {
              const IC = card.icon
              const isReverse = idx % 2 === 1
              return (
                <div
                  key={card.name}
                  className="sol-row"
                  style={{
                    background: '#fff',
                    borderRadius: 20,
                    overflow: 'hidden',
                    boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
                    border: '1px solid rgba(0,0,0,0.06)',
                    borderLeft: `4px solid ${card.accent}`,
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
                        background: `linear-gradient(145deg, ${card.accent}08 0%, #fff 100%)`,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        borderRight: isReverse ? 'none' : '1px solid rgba(0,0,0,0.05)',
                        borderLeft: isReverse ? '1px solid rgba(0,0,0,0.05)' : 'none',
                      }}
                    >
                      {/* Icon */}
                      <div style={{ marginBottom: 20 }}>
                        {card.img ? (
                          <div style={{ width: 80, height: 80, borderRadius: 20, background: `${card.accent}12`, border: `1px solid ${card.accent}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img src={card.img} alt={card.name} style={{ width: 54, height: 54, objectFit: 'contain' }} />
                          </div>
                        ) : (
                          <div style={{ width: 80, height: 80, borderRadius: 20, background: `${card.accent}14`, border: `1px solid ${card.accent}28`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <IC style={{ width: 34, height: 34, color: card.accent }} />
                          </div>
                        )}
                      </div>

                      {/* Name + age badge */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
                        <h3 style={{ fontSize: 'clamp(1.05rem,1.8vw,1.25rem)', fontWeight: 800, color: '#0f0f1a', lineHeight: 1.25, margin: 0 }}>{card.name}</h3>
                        <span style={{ fontSize: 12, fontWeight: 700, color: card.accent, background: `${card.accent}14`, padding: '3px 10px', borderRadius: 20, whiteSpace: 'nowrap', alignSelf: 'flex-start', marginTop: 3 }}>
                          {card.ages}
                        </span>
                      </div>

                      <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7, margin: '0 0 24px' }}>{card.desc}</p>

                      <Link
                        to={card.link}
                        className="sol-learn"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13.5, fontWeight: 700, color: card.accent, textDecoration: 'none' }}
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
                              background: `${card.accent}16`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              <CheckCircle style={{ width: 12, height: 12, color: card.accent }} />
                            </span>
                            <span style={{ fontSize: 14, color: '#374151', fontWeight: 600, lineHeight: 1.5 }}>{f}</span>
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

      {/* ── CTA ── */}
      <section style={{ background: '#060614', position: 'relative', overflow: 'hidden', padding: '104px 24px', textAlign: 'center' }}>
        {/* Purple glow */}
        <div style={{ position: 'absolute', top: '-40%', left: '10%', width: '80%', height: '160%', background: 'radial-gradient(ellipse, rgba(109,40,217,.28) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px', WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, black, transparent)', maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, black, transparent)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 580, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.7rem,3.5vw,2.6rem)', fontWeight: 900, color: '#fff', marginBottom: 16, lineHeight: 1.18, letterSpacing: '-0.03em' }}>{s.cta_h}</h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.48)', marginBottom: 40, lineHeight: 1.75 }}>{s.cta_sub}</p>
          <Link to="/contact" className="sol-cta-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', fontWeight: 700, fontSize: 15, padding: '15px 32px', borderRadius: 14, textDecoration: 'none', boxShadow: '0 8px 32px rgba(109,40,217,0.45)' }}>
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
