import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen, Sparkles, MessageSquare, FileText,
  Users, BarChart2, Building2, Clock, ClipboardCheck,
  PenLine, TrendingUp, Calendar, HeartHandshake,
  Mail, Star, ChevronRight, Menu, X, ArrowRight
} from 'lucide-react'

function ZirvaLogo({ size = 27 }) {
  return <img src="/logo.png" alt="Zirva" width={size} height={size} className="object-contain" />
}

export default function LandingNav({ s, lang, setLang, dark = false, lightHero = false }) {
  const [open, setOpen]             = useState(false)
  const [dropdown, setDropdown]     = useState(null)
  const [mobileOpen, setMobileOpen] = useState(null)
  const [scrolled, setScrolled]     = useState(false)
  const closeTimer = useRef(null)
  const L = lang

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 56)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const openDd  = (name) => { clearTimeout(closeTimer.current); setDropdown(name) }
  const closeDd = ()     => { closeTimer.current = setTimeout(() => setDropdown(null), 150) }
  const keepDd  = ()     => clearTimeout(closeTimer.current)

  const solItems = [
    { to:'/ib-pyp',             logo:'/pyp.png', accent:'#F8A66B', title:L==='az'?'IB İlk İllər (PYP)':L==='tr'?'IB İlk Yıllar (PYP)':L==='ru'?'IB Начальные годы (PYP)':'IB Primary Years (PYP)',   desc:L==='az'?'3–12 yaş · Kiçik şagirdlər':L==='tr'?'3–12 yaş · Küçük öğrenciler':L==='ru'?'3–12 лет · Начальное обучение':'Ages 3–12 · Foundation learning' },
    { to:'/ib-myp',             logo:'/myp.png', accent:'#FB7185', title:L==='az'?'IB Orta İllər (MYP)':L==='tr'?'IB Orta Yıllar (MYP)':L==='ru'?'IB Средние годы (MYP)':'IB Middle Years (MYP)',   desc:L==='az'?'11–16 yaş · Birgə planlaşdırma':L==='tr'?'11–16 yaş · Ortak planlama':L==='ru'?'11–16 лет · Совместное планирование':'Ages 11–16 · Collaborative planning' },
    { to:'/ib-diploma',         logo:'/dp.png',  accent:'#38BDF8', title:L==='az'?'IB Diploma (DP)':L==='tr'?'IB Diploma (DP)':L==='ru'?'IB Diploma (DP)':'IB Diploma (DP)',                        desc:L==='az'?'16–19 yaş · Tam DP dəstəyi':L==='tr'?'16–19 yaş · Tam DP desteği':L==='ru'?'16–19 лет · Полная поддержка DP':'Ages 16–19 · Full DP support' },
    { to:'/ib-career',          logo:'/cp.png',  accent:'#8B5CF6', title:L==='az'?'IB Karyera (CP)':L==='tr'?'IB Kariyer (CP)':L==='ru'?'IB Career-Related (CP)':'IB Career-Related (CP)',           desc:L==='az'?'16–19 yaş · Karyera yönümlü':L==='tr'?'16–19 yaş · Kariyer odaklı':L==='ru'?'16–19 лет · Карьерно-ориентированный':'Ages 16–19 · Career-focused' },
    { to:'/government-schools', icon:Building2,  accent:'#14B8A6', title:L==='az'?'Dövlət Məktəbləri':L==='tr'?'Devlet Okulları':L==='ru'?'Государственные школы':'Government Schools',             desc:L==='az'?'Nazirlik inteqrasiyası':L==='tr'?'Bakanlık entegrasyonu':L==='ru'?'Интеграция с Министерством':'Ministry integration' },
  ]
  const resItems = [
    { to:'/ceo-letter', icon:FileText,     accent:'#574FCF', title:L==='az'?'CEO Məktubu':L==='tr'?'CEO Mektubu':L==='ru'?'Письмо CEO':'CEO Letter',                  desc:L==='az'?'Zirva-nın vizyonu':L==='tr'?"Zirva'nın vizyonu":L==='ru'?'Видение Zirva':'Our vision & mission' },
    { to:'/resources',  icon:BookOpen,     accent:'#574FCF', title:L==='az'?'Resurs Kitabxanası':L==='tr'?'Kaynak Kütüphanesi':L==='ru'?'Библиотека ресурсов':'Resource Library', desc:L==='az'?'Bələdçilər & şablonlar':L==='tr'?'Rehberler & şablonlar':L==='ru'?'Руководства & шаблоны':'Guides & templates' },
    { to:'/blog',       icon:PenLine,      accent:'#574FCF', title:'Blog',                                                                                              desc:L==='az'?'Məqalələr & yeniliklər':L==='tr'?'Makaleler & haberler':L==='ru'?'Статьи & новости':'Articles & updates' },
    { to:'/reviews',    icon:Star,         accent:'#574FCF', title:L==='az'?'Müştəri Rəyləri':L==='tr'?'Müşteri Görüşleri':L==='ru'?'Отзывы клиентов':'Customer Reviews', desc:L==='az'?'Real istifadəçi hekayələri':L==='tr'?'Gerçek kullanıcı hikayeleri':L==='ru'?'Реальные истории':'Real user stories' },
  ]
  const compItems = [
    { to:'/about',    icon:Users,          accent:'#14B8A6', title:L==='az'?'Haqqımızda':L==='tr'?'Hakkımızda':L==='ru'?'О нас':'About Us',   desc:L==='az'?'Komanda & missiya':L==='tr'?'Ekip & misyon':L==='ru'?'Команда & миссия':'Team & mission' },
    { to:'/careers',  icon:TrendingUp,     accent:'#14B8A6', title:L==='az'?'Karyera':L==='tr'?'Kariyer':L==='ru'?'Карьера':'Careers',          desc:L==='az'?'Açıq vakansiyalar':L==='tr'?'Açık pozisyonlar':L==='ru'?'Открытые вакансии':'Open positions' },
    { to:'/partners', icon:HeartHandshake, accent:'#14B8A6', title:L==='az'?'Tərəfdaşlar':L==='tr'?'Ortaklar':L==='ru'?'Партнёры':'Partners',   desc:L==='az'?'Əməkdaşlıq imkanları':L==='tr'?'Ortaklık fırsatları':L==='ru'?'Возможности сотрудничества':'Partnership opportunities' },
    { to:'/contact',  icon:Mail,           accent:'#14B8A6', title:L==='az'?'Əlaqə':L==='tr'?'İletişim':L==='ru'?'Контакты':'Contact',           desc:L==='az'?'Bizimlə əlaqə saxla':L==='tr'?'Bize ulaşın':L==='ru'?'Свяжитесь с нами':'Get in touch' },
  ]
  const featItems = [
    { to:'/features/curriculum',    icon:BookOpen,       accent:'#574FCF', title:L==='az'?'Kurikulum İdarəetməsi':L==='tr'?'Müfredat Yönetimi':L==='ru'?'Управление программой':'Curriculum Management',  desc:L==='az'?'Birgə planlaşdırma, 600+ standart':L==='tr'?'Ortak planlama, 600+ standart':L==='ru'?'Планирование, 600+ стандартов':'Collaborative planning, 600+ standards' },
    { to:'/features/assessment',    icon:ClipboardCheck, accent:'#16A34A', title:L==='az'?'Qiymətləndirmə & Jurnal':L==='tr'?'Değerlendirme & Not Defteri':L==='ru'?'Оценивание & Журнал':'Assessment & Gradebook', desc:L==='az'?'IB + milli sistem dəstəyi':L==='tr'?'IB + ulusal sistem desteği':L==='ru'?'IB + национальная система':'IB + national system support' },
    { to:'/features/attendance',    icon:Calendar,       accent:'#0EA5E9', title:L==='az'?'Davamiyyət':L==='tr'?'Devam Takibi':L==='ru'?'Посещаемость':'Attendance',             desc:L==='az'?'Bir toxunuşla qeydiyyat':L==='tr'?'Tek dokunuşla kayıt':L==='ru'?'Отметка в одно касание':'One-tap registration' },
    { to:'/features/reports',       icon:BarChart2,      accent:'#CA9A04', title:L==='az'?'Hesabatlar & Analitika':L==='tr'?'Raporlar & Analitik':L==='ru'?'Отчёты & Аналитика':'Reports & Analytics',   desc:L==='az'?'Nazirlik + IB hesabatları':L==='tr'?'Bakanlık + IB raporları':L==='ru'?'Министерство + IB отчёты':'Ministry + IB reporting' },
    { to:'/features/communication', icon:MessageSquare,  accent:'#FB7185', title:L==='az'?'Kommunikasiya':L==='tr'?'İletişim':L==='ru'?'Коммуникация':'Communication',            desc:L==='az'?'Müəllim-valideyn mesajlaşma':L==='tr'?'Öğretmen-veli mesajlaşma':L==='ru'?'Учитель–родитель сообщения':'Teacher-parent messaging' },
    { to:'/features/timetable',     icon:Clock,          accent:'#8B5CF6', title:L==='az'?'Cədvəl İdarəetməsi':L==='tr'?'Program Yönetimi':L==='ru'?'Управление расписанием':'Timetable Management',       desc:L==='az'?'Avtomatik cədvəl generatoru':L==='tr'?'Otomatik program oluşturucu':L==='ru'?'Автогенератор расписания':'Auto timetable generator' },
    { to:'/features/student-staff', icon:Users,          accent:'#0EA5E9', title:L==='az'?'Şagird & Heyət':L==='tr'?'Öğrenci & Personel':L==='ru'?'Ученики & Персонал':'Student & Staff',              desc:L==='az'?'Profillər, portfolio, intizam':L==='tr'?'Profiller, portfolyo, disiplin':L==='ru'?'Профили, портфолио, дисциплина':'Profiles, portfolio, discipline' },
    { to:'/zeka-ai',                icon:Sparkles,       accent:'#8B5CF6', title:L==='az'?'Zəka AI':L==='tr'?'Zeka AI':L==='ru'?'Зека AI':'Zeka AI',                           desc:L==='az'?'AI müəllim köməkçisi':L==='tr'?'AI öğretim asistanı':L==='ru'?'AI ассистент для обучения':'AI teaching assistant' },
  ]

  const navItems = [
    { label: s?.nav_solutions || (L==='az'?'Həllər':L==='tr'?'Çözümler':L==='ru'?'Решения':'Solutions'), key: 'solutions' },
    { label: s?.nav_features  || (L==='az'?'Xüsusiyyətlər':L==='tr'?'Özellikler':L==='ru'?'Возможности':'Features'),  key: 'features' },
    { label: s?.nav_resources || (L==='az'?'Resurslar':L==='tr'?'Kaynaklar':L==='ru'?'Ресурсы':'Resources'), key: 'resources' },
    { label: L==='az'?'Şirkət':L==='tr'?'Şirket':L==='ru'?'Компания':'Company', key: 'company' },
  ]

  const DdItem = ({ to, logo, icon: Icon, title, desc, accent = '#574FCF' }) => (
    <Link to={to} onClick={() => setDropdown(null)}
      style={{ display:'flex', alignItems:'flex-start', gap:13, padding:'11px 12px', borderRadius:12, textDecoration:'none', transition:'background 0.15s ease', background:'transparent' }}
      onMouseEnter={e => { e.currentTarget.style.background = `${accent}0d` }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
      <div style={{ width:44, height:44, borderRadius:12, flexShrink:0, background:`linear-gradient(135deg, ${accent}28, ${accent}10)`, border:`1px solid ${accent}22`, display:'flex', alignItems:'center', justifyContent:'center', marginTop:1 }}>
        {logo
          ? <img src={logo} alt={title} style={{ width:24, height:24, objectFit:'contain', mixBlendMode:'multiply' }}/>
          : <Icon style={{ width:19, height:19, color:accent }}/>
        }
      </div>
      <div>
        <p style={{ fontSize:14, fontWeight:700, color:'var(--ink-900)', lineHeight:1.3, marginBottom:3 }}>{title}</p>
        <p style={{ fontSize:12, color:'var(--ink-400)', lineHeight:1.45, fontWeight:400 }}>{desc}</p>
      </div>
    </Link>
  )

  const navSignin  = s?.nav_signin  || (L==='az'?'Daxil ol':L==='tr'?'Giriş yap':L==='ru'?'Войти':'Sign In')
  const navContact = s?.nav_contact || s?.nav_demo || (L==='az'?'Bizimlə Əlaqə':L==='tr'?'Bize Ulaşın':L==='ru'?'Связаться':'Contact Us')

  return (
    <>
      <style>{`
        @keyframes ddIn { from{opacity:0;margin-top:-8px} to{opacity:1;margin-top:0} }
        .dd-animated { animation: ddIn 0.17s cubic-bezier(0.22,1,0.36,1) both; }

        /* Refined glass dropdown panel — sibling of the pill, so backdrop-filter blurs the real page */
        .dd-glass {
          position: relative;
          background: linear-gradient(135deg, rgba(255,255,255,0.78) 0%, rgba(251,251,254,0.70) 100%);
          backdrop-filter: blur(40px) saturate(1.6);
          -webkit-backdrop-filter: blur(40px) saturate(1.6);
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.7);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.85),
            0 16px 48px -12px rgba(20,22,40,0.22),
            0 4px 12px -4px rgba(20,22,40,0.08);
          overflow: hidden;
        }
        /* Specular gleam strip — same as header */
        .dd-glass::before {
          content:'';
          position:absolute;
          inset:0;
          border-radius:18px;
          background: linear-gradient(to bottom, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 38%);
          pointer-events:none;
        }
        .dd-glass > * { position: relative; }

        /* Refined glass pill */
        .liq-glass {
          background: linear-gradient(135deg,rgba(255,255,255,0.55) 0%,rgba(255,255,255,0.38) 100%);
          backdrop-filter: blur(36px) saturate(1.5);
          -webkit-backdrop-filter: blur(36px) saturate(1.5);
          border: 1px solid rgba(255,255,255,0.55);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.75),
            0 1px 2px rgba(20,22,40,0.05),
            0 8px 24px -8px rgba(20,22,40,0.12);
        }
        .liq-glass-scrolled {
          background: linear-gradient(135deg,rgba(255,255,255,0.82) 0%,rgba(251,251,254,0.74) 100%);
          backdrop-filter: blur(36px) saturate(1.4);
          -webkit-backdrop-filter: blur(36px) saturate(1.4);
          border: 1px solid rgba(255,255,255,0.7);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.8),
            0 1px 2px rgba(20,22,40,0.05),
            0 8px 24px -8px rgba(20,22,40,0.14);
        }
        /* Specular gleam strip at top of pill */
        .liq-glass::before, .liq-glass-scrolled::before {
          content:'';
          position:absolute;
          inset:0;
          border-radius:999px;
          background: linear-gradient(to bottom,rgba(255,255,255,0.55) 0%,rgba(255,255,255,0) 40%);
          pointer-events:none;
        }
      `}</style>

      <header style={{ position:'fixed', top:0, left:0, right:0, zIndex:50, padding: scrolled ? '8px 20px' : '10px 20px 0', background:'transparent', transition:'padding .3s ease' }}>
        <div style={{ maxWidth:1260, margin:'0 auto', position:'relative' }}>
        <div className={lightHero ? (scrolled ? 'liq-glass-scrolled' : 'liq-glass') : ''}
          style={{ position:'relative',
          ...(!lightHero ? {
            background: dark
              ? (scrolled ? 'rgba(10,6,32,0.75)' : 'transparent')
              : 'rgba(255,255,255,0.94)',
            backdropFilter: dark ? (scrolled ? 'blur(20px)' : 'none') : 'blur(20px)',
            WebkitBackdropFilter: dark ? (scrolled ? 'blur(20px)' : 'none') : 'blur(20px)',
            boxShadow: dark
              ? (scrolled ? '0 4px 32px rgba(0,0,0,0.4)' : 'none')
              : (scrolled ? '0 8px 24px -8px rgba(20,22,40,0.14)' : '0 1px 2px rgba(20,22,40,0.05),0 8px 24px -8px rgba(20,22,40,0.12)'),
            border: dark
              ? (scrolled ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.18)')
              : (scrolled ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.55)'),
          } : {}),
          borderRadius:999, height:62,
          display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 20px',
          transition:'all .35s ease' }}>

          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 flex-1 font-display" style={{ textDecoration:'none' }}>
            <ZirvaLogo size={27} />
            <span style={{ fontSize:20, fontWeight:800, color: dark ? '#fff' : 'var(--ink-900)', letterSpacing:'-0.01em' }}>Zirva</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navItems.map(({ label, to, key }) => (
              <div key={key} onMouseEnter={() => key ? openDd(key) : setDropdown(null)} onMouseLeave={key ? closeDd : undefined}>
                {to ? (
                  <Link to={to} className={`flex items-center px-3.5 py-2 text-[13.5px] font-semibold rounded-lg transition-colors ${dark ? 'text-white/80 hover:text-white hover:bg-white/[0.08]' : 'text-ink-600 hover:text-ink-900 hover:bg-brand-50'}`} style={{ textDecoration:'none' }}>
                    {label}
                  </Link>
                ) : (
                  <button className={`flex items-center gap-1 px-3.5 py-2 text-[13.5px] font-semibold rounded-lg transition-colors ${dark ? 'hover:bg-white/[0.08]' : 'hover:bg-brand-50'}`}
                    style={{ color: dark ? (dropdown===key?'#c4b5fd':'rgba(255,255,255,0.8)') : (dropdown===key?'#4A3FB8':'#5A6072'), background:'transparent', border:'none', cursor:'pointer' }}>
                    {label}
                    <ChevronRight className="w-[11px] h-[11px] transition-transform duration-200"
                      style={{ transform:dropdown===key?'rotate(-90deg)':'rotate(90deg)', color: dark ? (dropdown===key?'#c4b5fd':'rgba(255,255,255,0.4)') : (dropdown===key?'#4A3FB8':'#9AA0B0') }}/>
                  </button>
                )}
              </div>
            ))}
          </nav>

          {/* Right actions */}
          <div className="hidden lg:flex items-center gap-1.5" style={{ flex:1, justifyContent:'flex-end' }}>
            <Link to="/daxil-ol" className={`px-4 py-2 text-[13.5px] font-semibold rounded-lg transition-all ${dark ? 'hover:bg-white/[0.08]' : 'hover:text-ink-900 hover:bg-brand-50'}`} style={{ textDecoration:'none', color: dark ? 'rgba(255,255,255,0.7)' : 'var(--ink-600)' }}>
              {navSignin}
            </Link>
            <Link to="/contact" className="inline-flex items-center gap-1.5 text-white text-[13.5px] font-semibold px-5 py-[10px] rounded-full transition-all active:translate-y-px"
              style={{ background:'var(--brand-500)', boxShadow:'0 1px 2px rgba(20,22,40,.08)', textDecoration:'none' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-600)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--brand-500)' }}>
              {navContact}
            </Link>
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setOpen(v => !v)} className={`lg:hidden p-2 rounded-lg transition-colors ${dark ? 'text-white/80 hover:bg-white/[0.08]' : 'text-ink-600 hover:bg-brand-50'}`}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mega menu panels — sibling of pill so backdrop-filter can blur the page underneath */}
          {dropdown && (
            <div style={{ position:'absolute', top:'calc(100% + 10px)', left:0, right:0, zIndex:300 }}
              onMouseEnter={keepDd} onMouseLeave={closeDd}>

              {/* Solutions */}
              {dropdown==='solutions' && (
                <div className="dd-animated dd-glass" style={{ padding:'28px 20px 20px' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:0 }}>
                    <div style={{ paddingRight:20, borderRight:'1px solid rgba(255,255,255,0.55)' }}>
                      <p style={{ fontSize:13.5, fontWeight:700, color:'var(--ink-900)', marginBottom:12, paddingLeft:12 }}>
                        {L==='az'?'IB Proqramları üçün':L==='tr'?'IB Programları için':L==='ru'?'IB Программы':'For IB Continuum'}
                      </p>
                      {solItems.slice(0,4).map(item => <DdItem key={item.to} {...item}/>)}
                    </div>
                    <div style={{ paddingLeft:20 }}>
                      <p style={{ fontSize:13.5, fontWeight:700, color:'var(--ink-900)', marginBottom:12, paddingLeft:12 }}>
                        {L==='az'?'Milli Kurikulum':L==='tr'?'Ulusal Müfredat':L==='ru'?'Национальная программа':'National Curriculum'}
                      </p>
                      <DdItem {...solItems[4]}/>
                    </div>
                  </div>
                  <div style={{ height:1, background:'rgba(255,255,255,0.55)', margin:'16px 0 14px' }}/>
                  <Link to="/solutions" onClick={() => setDropdown(null)}
                    style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', borderRadius:12, background:'rgba(20,184,166,0.05)', border:'1px solid rgba(20,184,166,0.12)', textDecoration:'none' }}
                    onMouseEnter={e=>e.currentTarget.style.background='rgba(20,184,166,0.12)'}
                    onMouseLeave={e=>e.currentTarget.style.background='rgba(20,184,166,0.05)'}>
                    <span style={{ fontSize:12.5, fontWeight:700, color:'#14B8A6' }}>
                      {L==='az'?'Bütün həllər':L==='tr'?'Tüm çözümler':L==='ru'?'Все решения':'All solutions'}
                    </span>
                    <div style={{ display:'flex', gap:4 }}>
                      {['#F8A66B','#FB7185','#38BDF8','#8B5CF6','#14B8A6'].map(c => (
                        <div key={c} style={{ width:7, height:7, borderRadius:'50%', background:c, opacity:0.7 }}/>
                      ))}
                    </div>
                  </Link>
                </div>
              )}

              {/* Features */}
              {dropdown==='features' && (
                <div className="dd-animated dd-glass" style={{ padding:'24px 20px 18px' }}>
                  <p style={{ fontSize:13.5, fontWeight:700, color:'var(--ink-900)', marginBottom:12, paddingLeft:12 }}>
                    {L==='az'?'Platform Xüsusiyyətləri':L==='tr'?'Platform Özellikleri':L==='ru'?'Возможности платформы':'Platform Features'}
                  </p>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)' }}>
                    {featItems.map(item => <DdItem key={item.to} {...item}/>)}
                  </div>
                  <div style={{ height:1, background:'rgba(255,255,255,0.55)', margin:'12px 0 10px' }}/>
                  <Link to="/features" onClick={() => setDropdown(null)}
                    style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', borderRadius:12, background:'rgba(87,79,207,0.05)', border:'1px solid rgba(87,79,207,0.1)', textDecoration:'none' }}
                    onMouseEnter={e=>e.currentTarget.style.background='rgba(87,79,207,0.1)'}
                    onMouseLeave={e=>e.currentTarget.style.background='rgba(87,79,207,0.05)'}>
                    <span style={{ fontSize:12.5, fontWeight:700, color:'#574FCF' }}>
                      {L==='az'?'Bütün xüsusiyyətlər':L==='tr'?'Tüm özellikler':L==='ru'?'Все возможности':'All features'}
                    </span>
                    <div style={{ display:'flex', gap:4 }}>
                      {['#574FCF','#16A34A','#0EA5E9','#CA9A04','#FB7185','#8B5CF6','#0EA5E9'].map(c => (
                        <div key={c} style={{ width:7, height:7, borderRadius:'50%', background:c, opacity:0.65 }}/>
                      ))}
                    </div>
                  </Link>
                </div>
              )}

              {/* Resources */}
              {dropdown==='resources' && (
                <div className="dd-animated dd-glass" style={{ padding:'24px 20px 18px' }}>
                  <p style={{ fontSize:13.5, fontWeight:700, color:'var(--ink-900)', marginBottom:12, paddingLeft:12 }}>
                    {L==='az'?'Resurslar':L==='tr'?'Kaynaklar':L==='ru'?'Ресурсы':'Resources'}
                  </p>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)' }}>
                    {resItems.map(item => <DdItem key={item.to} {...item}/>)}
                  </div>
                </div>
              )}

              {/* Company */}
              {dropdown==='company' && (
                <div className="dd-animated dd-glass" style={{ padding:'24px 20px 18px' }}>
                  <p style={{ fontSize:13.5, fontWeight:700, color:'var(--ink-900)', marginBottom:12, paddingLeft:12 }}>
                    {L==='az'?'Şirkət':L==='tr'?'Şirket':L==='ru'?'Компания':'Company'}
                  </p>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)' }}>
                    {compItems.map(item => <DdItem key={item.to+item.title} {...item}/>)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile drawer */}
        {open && (
          <div style={{ maxWidth:1260, margin:'0 auto', marginTop:6 }}
            className="lg:hidden bg-surface rounded-card shadow-soft-lg border border-hairline px-5 pt-3 pb-5">
            <div className="space-y-0.5 mb-4">
              {[
                { label: navItems[0].label, key:'solutions', items:solItems },
                { label: navItems[1].label, key:'features',  items:featItems },
                { label: navItems[2].label, key:'resources', items:resItems },
                { label: navItems[3].label, key:'company',   items:compItems },
              ].map(({ label, key, items }) => (
                <div key={key}>
                  <button onClick={() => setMobileOpen(mobileOpen===key?null:key)}
                    className="w-full flex items-center justify-between py-3 px-3 text-[15px] text-ink-700 font-semibold rounded-tile hover:bg-surface-2 transition-colors">
                    {label}
                    <ChevronRight className="w-4 h-4 text-ink-400 transition-transform duration-200"
                      style={{ transform:mobileOpen===key?'rotate(-90deg)':'rotate(90deg)' }}/>
                  </button>
                  {mobileOpen===key && (
                    <div className="pl-3 pb-2 space-y-0.5">
                      {items.map(item => (
                        <Link key={item.to+item.title} to={item.to}
                          onClick={() => { setOpen(false); setMobileOpen(null) }}
                          className="flex items-center gap-2.5 py-2 px-3 text-[14px] text-ink-600 font-medium rounded-md hover:bg-surface-2 transition-colors"
                          style={{ textDecoration:'none' }}>
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background:`${item.accent||'#574FCF'}12` }}>
                            {item.logo
                              ? <img src={item.logo} alt={item.title} className="w-4 h-4 object-contain" style={{ mixBlendMode:'multiply' }}/>
                              : item.icon && <item.icon className="w-3.5 h-3.5" style={{ color:item.accent||'#574FCF' }}/>
                            }
                          </div>
                          {item.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-hairline flex items-center justify-end gap-2">
              <Link to="/daxil-ol" className="text-sm text-ink-600 font-semibold px-3 py-2" style={{ textDecoration:'none' }}>{navSignin}</Link>
              <Link to="/contact" className="text-white text-sm font-semibold px-4 py-2.5 rounded-full"
                style={{ background:'var(--brand-500)', boxShadow:'0 1px 2px rgba(20,22,40,.08)', textDecoration:'none' }}>{navContact}</Link>
            </div>
          </div>
        )}
      </header>

      {/* Spacer so page content isn't hidden under fixed nav — skip on overlay pages */}
      {!dark && !lightHero && <div style={{ height:82 }} />}
    </>
  )
}
