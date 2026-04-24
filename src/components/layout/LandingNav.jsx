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

export default function LandingNav({ s, lang, setLang, dark = false }) {
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
    { to:'/ib-pyp',             logo:'/pyp.png', accent:'#f59e0b', title:L==='az'?'IB İlk İllər (PYP)':L==='tr'?'IB İlk Yıllar (PYP)':L==='ru'?'IB Начальные годы (PYP)':'IB Primary Years (PYP)',   desc:L==='az'?'3–12 yaş · Kiçik şagirdlər':L==='tr'?'3–12 yaş · Küçük öğrenciler':L==='ru'?'3–12 лет · Начальное обучение':'Ages 3–12 · Foundation learning' },
    { to:'/ib-myp',             logo:'/myp.png', accent:'#ef4444', title:L==='az'?'IB Orta İllər (MYP)':L==='tr'?'IB Orta Yıllar (MYP)':L==='ru'?'IB Средние годы (MYP)':'IB Middle Years (MYP)',   desc:L==='az'?'11–16 yaş · Birgə planlaşdırma':L==='tr'?'11–16 yaş · Ortak planlama':L==='ru'?'11–16 лет · Совместное планирование':'Ages 11–16 · Collaborative planning' },
    { to:'/ib-diploma',         logo:'/dp.png',  accent:'#3b82f6', title:L==='az'?'IB Diploma (DP)':L==='tr'?'IB Diploma (DP)':L==='ru'?'IB Diploma (DP)':'IB Diploma (DP)',                        desc:L==='az'?'16–19 yaş · Tam DP dəstəyi':L==='tr'?'16–19 yaş · Tam DP desteği':L==='ru'?'16–19 лет · Полная поддержка DP':'Ages 16–19 · Full DP support' },
    { to:'/ib-career',          logo:'/cp.png',  accent:'#a855f7', title:L==='az'?'IB Karyera (CP)':L==='tr'?'IB Kariyer (CP)':L==='ru'?'IB Career-Related (CP)':'IB Career-Related (CP)',           desc:L==='az'?'16–19 yaş · Karyera yönümlü':L==='tr'?'16–19 yaş · Kariyer odaklı':L==='ru'?'16–19 лет · Карьерно-ориентированный':'Ages 16–19 · Career-focused' },
    { to:'/government-schools', icon:Building2,  accent:'#1D9E75', title:L==='az'?'Dövlət Məktəbləri':L==='tr'?'Devlet Okulları':L==='ru'?'Государственные школы':'Government Schools',             desc:L==='az'?'Nazirlik inteqrasiyası':L==='tr'?'Bakanlık entegrasyonu':L==='ru'?'Интеграция с Министерством':'Ministry integration' },
  ]
  const resItems = [
    { to:'/ceo-letter', icon:FileText,     accent:'#534AB7', title:L==='az'?'CEO Məktubu':L==='tr'?'CEO Mektubu':L==='ru'?'Письмо CEO':'CEO Letter',                  desc:L==='az'?'Zirva-nın vizyonu':L==='tr'?"Zirva'nın vizyonu":L==='ru'?'Видение Zirva':'Our vision & mission' },
    { to:'/resources',  icon:BookOpen,     accent:'#534AB7', title:L==='az'?'Resurs Kitabxanası':L==='tr'?'Kaynak Kütüphanesi':L==='ru'?'Библиотека ресурсов':'Resource Library', desc:L==='az'?'Bələdçilər & şablonlar':L==='tr'?'Rehberler & şablonlar':L==='ru'?'Руководства & шаблоны':'Guides & templates' },
    { to:'/blog',       icon:PenLine,      accent:'#534AB7', title:'Blog',                                                                                              desc:L==='az'?'Məqalələr & yeniliklər':L==='tr'?'Makaleler & haberler':L==='ru'?'Статьи & новости':'Articles & updates' },
    { to:'/reviews',    icon:Star,         accent:'#534AB7', title:L==='az'?'Müştəri Rəyləri':L==='tr'?'Müşteri Görüşleri':L==='ru'?'Отзывы клиентов':'Customer Reviews', desc:L==='az'?'Real istifadəçi hekayələri':L==='tr'?'Gerçek kullanıcı hikayeleri':L==='ru'?'Реальные истории':'Real user stories' },
  ]
  const compItems = [
    { to:'/about',    icon:Users,          accent:'#1D9E75', title:L==='az'?'Haqqımızda':L==='tr'?'Hakkımızda':L==='ru'?'О нас':'About Us',   desc:L==='az'?'Komanda & missiya':L==='tr'?'Ekip & misyon':L==='ru'?'Команда & миссия':'Team & mission' },
    { to:'/careers',  icon:TrendingUp,     accent:'#1D9E75', title:L==='az'?'Karyera':L==='tr'?'Kariyer':L==='ru'?'Карьера':'Careers',          desc:L==='az'?'Açıq vakansiyalar':L==='tr'?'Açık pozisyonlar':L==='ru'?'Открытые вакансии':'Open positions' },
    { to:'/partners', icon:HeartHandshake, accent:'#1D9E75', title:L==='az'?'Tərəfdaşlar':L==='tr'?'Ortaklar':L==='ru'?'Партнёры':'Partners',   desc:L==='az'?'Əməkdaşlıq imkanları':L==='tr'?'Ortaklık fırsatları':L==='ru'?'Возможности сотрудничества':'Partnership opportunities' },
    { to:'/contact',  icon:Mail,           accent:'#1D9E75', title:L==='az'?'Əlaqə':L==='tr'?'İletişim':L==='ru'?'Контакты':'Contact',           desc:L==='az'?'Bizimlə əlaqə saxla':L==='tr'?'Bize ulaşın':L==='ru'?'Свяжитесь с нами':'Get in touch' },
  ]
  const featItems = [
    { to:'/features/curriculum',    icon:BookOpen,       accent:'#7c3aed', title:L==='az'?'Kurikulum İdarəetməsi':L==='tr'?'Müfredat Yönetimi':L==='ru'?'Управление программой':'Curriculum Management',  desc:L==='az'?'Birgə planlaşdırma, 600+ standart':L==='tr'?'Ortak planlama, 600+ standart':L==='ru'?'Планирование, 600+ стандартов':'Collaborative planning, 600+ standards' },
    { to:'/features/assessment',    icon:ClipboardCheck, accent:'#2563eb', title:L==='az'?'Qiymətləndirmə & Jurnal':L==='tr'?'Değerlendirme & Not Defteri':L==='ru'?'Оценивание & Журнал':'Assessment & Gradebook', desc:L==='az'?'IB + milli sistem dəstəyi':L==='tr'?'IB + ulusal sistem desteği':L==='ru'?'IB + национальная система':'IB + national system support' },
    { to:'/features/attendance',    icon:Calendar,       accent:'#059669', title:L==='az'?'Davamiyyət':L==='tr'?'Devam Takibi':L==='ru'?'Посещаемость':'Attendance',             desc:L==='az'?'Bir toxunuşla qeydiyyat':L==='tr'?'Tek dokunuşla kayıt':L==='ru'?'Отметка в одно касание':'One-tap registration' },
    { to:'/features/reports',       icon:BarChart2,      accent:'#d97706', title:L==='az'?'Hesabatlar & Analitika':L==='tr'?'Raporlar & Analitik':L==='ru'?'Отчёты & Аналитика':'Reports & Analytics',   desc:L==='az'?'Nazirlik + IB hesabatları':L==='tr'?'Bakanlık + IB raporları':L==='ru'?'Министерство + IB отчёты':'Ministry + IB reporting' },
    { to:'/features/communication', icon:MessageSquare,  accent:'#0891b2', title:L==='az'?'Kommunikasiya':L==='tr'?'İletişim':L==='ru'?'Коммуникация':'Communication',            desc:L==='az'?'Müəllim-valideyn mesajlaşma':L==='tr'?'Öğretmen-veli mesajlaşma':L==='ru'?'Учитель–родитель сообщения':'Teacher-parent messaging' },
    { to:'/features/timetable',     icon:Clock,          accent:'#7c3aed', title:L==='az'?'Cədvəl İdarəetməsi':L==='tr'?'Program Yönetimi':L==='ru'?'Управление расписанием':'Timetable Management',       desc:L==='az'?'Avtomatik cədvəl generatoru':L==='tr'?'Otomatik program oluşturucu':L==='ru'?'Автогенератор расписания':'Auto timetable generator' },
    { to:'/features/student-staff', icon:Users,          accent:'#be185d', title:L==='az'?'Şagird & Heyət':L==='tr'?'Öğrenci & Personel':L==='ru'?'Ученики & Персонал':'Student & Staff',              desc:L==='az'?'Profillər, portfolio, intizam':L==='tr'?'Profiller, portfolyo, disiplin':L==='ru'?'Профили, портфолио, дисциплина':'Profiles, portfolio, discipline' },
    { to:'/zeka-ai',                icon:Sparkles,       accent:'#6d28d9', title:L==='az'?'Zəka AI':L==='tr'?'Zeka AI':L==='ru'?'Зека AI':'Zeka AI',                           desc:L==='az'?'AI müəllim köməkçisi':L==='tr'?'AI öğretim asistanı':L==='ru'?'AI ассистент для обучения':'AI teaching assistant' },
  ]

  const navItems = [
    { label: s?.nav_solutions || (L==='az'?'Həllər':L==='tr'?'Çözümler':L==='ru'?'Решения':'Solutions'), key: 'solutions' },
    { label: s?.nav_features  || (L==='az'?'Xüsusiyyətlər':L==='tr'?'Özellikler':L==='ru'?'Возможности':'Features'),  key: 'features' },
    { label: s?.nav_resources || (L==='az'?'Resurslar':L==='tr'?'Kaynaklar':L==='ru'?'Ресурсы':'Resources'), key: 'resources' },
    { label: L==='az'?'Şirkət':L==='tr'?'Şirket':L==='ru'?'Компания':'Company', key: 'company' },
  ]

  const DdItem = ({ to, logo, icon: Icon, title, desc, accent = '#534AB7' }) => (
    <Link to={to} onClick={() => setDropdown(null)}
      style={{ display:'flex', alignItems:'flex-start', gap:13, padding:'11px 12px', borderRadius:16, textDecoration:'none', transition:'background 0.15s ease', background:'transparent' }}
      onMouseEnter={e => { e.currentTarget.style.background = `${accent}0d` }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
      <div style={{ width:44, height:44, borderRadius:13, flexShrink:0, background:`linear-gradient(135deg, ${accent}28, ${accent}10)`, border:`1px solid ${accent}22`, display:'flex', alignItems:'center', justifyContent:'center', marginTop:1 }}>
        {logo
          ? <img src={logo} alt={title} style={{ width:24, height:24, objectFit:'contain', mixBlendMode:'multiply' }}/>
          : <Icon style={{ width:19, height:19, color:accent }}/>
        }
      </div>
      <div>
        <p style={{ fontSize:14, fontWeight:700, color:'#111827', lineHeight:1.3, marginBottom:3 }}>{title}</p>
        <p style={{ fontSize:12, color:'#9ca3af', lineHeight:1.45, fontWeight:400 }}>{desc}</p>
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
      `}</style>

      <header style={{ position:'fixed', top:0, left:0, right:0, zIndex:50, padding: scrolled ? '8px 20px' : '10px 20px 0', background:'transparent', transition:'padding .3s ease' }}>
        <div style={{ position:'relative', maxWidth:1260, margin:'0 auto',
          background: dark
            ? (scrolled ? 'rgba(10,6,32,0.75)' : 'transparent')
            : 'rgba(255,255,255,0.94)',
          backdropFilter: dark ? (scrolled ? 'blur(20px)' : 'none') : 'blur(20px)',
          WebkitBackdropFilter: dark ? (scrolled ? 'blur(20px)' : 'none') : 'blur(20px)',
          borderRadius:999, height:62,
          display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 20px',
          boxShadow: dark
            ? (scrolled ? '0 4px 32px rgba(0,0,0,0.4)' : 'none')
            : (scrolled ? '0 4px 24px rgba(0,0,0,0.13), 0 1px 4px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.12)'),
          border: dark
            ? (scrolled ? '1px solid rgba(255,255,255,0.1)' : 'none')
            : (scrolled ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.55)'),
          transition:'background .3s ease, box-shadow .3s ease, border .3s ease, backdrop-filter .3s ease' }}>

          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 flex-1" style={{ textDecoration:'none' }}>
            <ZirvaLogo size={27} />
            <span style={{ fontSize:18, fontWeight:800, color: dark ? '#fff' : '#111827', letterSpacing:'-0.02em' }}>Zirva</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navItems.map(({ label, to, key }) => (
              <div key={key} onMouseEnter={() => key ? openDd(key) : setDropdown(null)} onMouseLeave={key ? closeDd : undefined}>
                {to ? (
                  <Link to={to} className="flex items-center px-3.5 py-2 text-[13.5px] text-gray-600 hover:text-gray-900 font-semibold rounded-lg hover:bg-black/[0.05] transition-colors" style={{ textDecoration:'none' }}>
                    {label}
                  </Link>
                ) : (
                  <button className={`flex items-center gap-1 px-3.5 py-2 text-[13.5px] font-semibold rounded-lg transition-colors ${dark ? 'hover:bg-white/[0.08]' : 'hover:bg-black/[0.05]'}`}
                    style={{ color: dark ? (dropdown===key?'#c4b5fd':'rgba(255,255,255,0.8)') : (dropdown===key?'#534AB7':'#4b5563'), background:'transparent', border:'none', cursor:'pointer' }}>
                    {label}
                    <ChevronRight className="w-[11px] h-[11px] transition-transform duration-200"
                      style={{ transform:dropdown===key?'rotate(-90deg)':'rotate(90deg)', color: dark ? (dropdown===key?'#c4b5fd':'rgba(255,255,255,0.4)') : (dropdown===key?'#534AB7':'#9ca3af') }}/>
                  </button>
                )}
              </div>
            ))}
          </nav>

          {/* Right actions */}
          <div className="hidden lg:flex items-center gap-1.5" style={{ flex:1, justifyContent:'flex-end' }}>
            <Link to="/daxil-ol" className={`px-4 py-2 text-[13.5px] font-semibold rounded-lg transition-all ${dark ? 'hover:bg-white/[0.08]' : 'hover:text-gray-900 hover:bg-black/[0.05]'}`} style={{ textDecoration:'none', color: dark ? 'rgba(255,255,255,0.7)' : '#6b7280' }}>
              {navSignin}
            </Link>
            <Link to="/contact" className="inline-flex items-center gap-1.5 text-white text-[13.5px] font-bold px-5 py-[10px] rounded-full transition-all hover:-translate-y-px"
              style={{ background:'#1a0a3e', boxShadow:'0 2px 12px rgba(26,10,62,0.45)', textDecoration:'none' }}>
              {navContact}
            </Link>
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setOpen(v => !v)} className="lg:hidden p-2 text-gray-600 rounded-lg hover:bg-black/[0.06] transition-colors">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Mega menu panels */}
          {dropdown && (
            <div style={{ position:'absolute', top:'calc(100% + 10px)', left:0, right:0, zIndex:300 }}
              onMouseEnter={keepDd} onMouseLeave={closeDd}>

              {/* Solutions */}
              {dropdown==='solutions' && (
                <div className="dd-animated" style={{ background:'#fff', borderRadius:20, border:'1px solid rgba(0,0,0,0.07)', boxShadow:'0 8px 48px -6px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.05)', padding:'28px 20px 20px' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:0 }}>
                    <div style={{ paddingRight:20, borderRight:'1px solid rgba(0,0,0,0.06)' }}>
                      <p style={{ fontSize:13.5, fontWeight:700, color:'#111827', marginBottom:12, paddingLeft:12 }}>
                        {L==='az'?'IB Proqramları üçün':L==='tr'?'IB Programları için':L==='ru'?'IB Программы':'For IB Continuum'}
                      </p>
                      {solItems.slice(0,4).map(item => <DdItem key={item.to} {...item}/>)}
                    </div>
                    <div style={{ paddingLeft:20 }}>
                      <p style={{ fontSize:13.5, fontWeight:700, color:'#111827', marginBottom:12, paddingLeft:12 }}>
                        {L==='az'?'Milli Kurikulum':L==='tr'?'Ulusal Müfredat':L==='ru'?'Национальная программа':'National Curriculum'}
                      </p>
                      <DdItem {...solItems[4]}/>
                    </div>
                  </div>
                  <div style={{ height:1, background:'rgba(0,0,0,0.06)', margin:'16px 0 14px' }}/>
                  <Link to="/solutions" onClick={() => setDropdown(null)}
                    style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', borderRadius:12, background:'rgba(29,158,117,0.05)', border:'1px solid rgba(29,158,117,0.12)', textDecoration:'none' }}
                    onMouseEnter={e=>e.currentTarget.style.background='rgba(29,158,117,0.12)'}
                    onMouseLeave={e=>e.currentTarget.style.background='rgba(29,158,117,0.05)'}>
                    <span style={{ fontSize:12.5, fontWeight:700, color:'#1D9E75' }}>
                      {L==='az'?'Bütün həllər':L==='tr'?'Tüm çözümler':L==='ru'?'Все решения':'All solutions'}
                    </span>
                    <div style={{ display:'flex', gap:4 }}>
                      {['#f59e0b','#ef4444','#3b82f6','#a855f7','#1D9E75'].map(c => (
                        <div key={c} style={{ width:7, height:7, borderRadius:'50%', background:c, opacity:0.7 }}/>
                      ))}
                    </div>
                  </Link>
                </div>
              )}

              {/* Features */}
              {dropdown==='features' && (
                <div className="dd-animated" style={{ background:'#fff', borderRadius:20, border:'1px solid rgba(0,0,0,0.07)', boxShadow:'0 8px 48px -6px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.05)', padding:'24px 20px 18px' }}>
                  <p style={{ fontSize:13.5, fontWeight:700, color:'#111827', marginBottom:12, paddingLeft:12 }}>
                    {L==='az'?'Platform Xüsusiyyətləri':L==='tr'?'Platform Özellikleri':L==='ru'?'Возможности платформы':'Platform Features'}
                  </p>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)' }}>
                    {featItems.map(item => <DdItem key={item.to} {...item}/>)}
                  </div>
                  <div style={{ height:1, background:'rgba(0,0,0,0.06)', margin:'12px 0 10px' }}/>
                  <Link to="/features" onClick={() => setDropdown(null)}
                    style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', borderRadius:12, background:'rgba(124,58,237,0.05)', border:'1px solid rgba(124,58,237,0.1)', textDecoration:'none' }}
                    onMouseEnter={e=>e.currentTarget.style.background='rgba(124,58,237,0.1)'}
                    onMouseLeave={e=>e.currentTarget.style.background='rgba(124,58,237,0.05)'}>
                    <span style={{ fontSize:12.5, fontWeight:700, color:'#7c3aed' }}>
                      {L==='az'?'Bütün xüsusiyyətlər':L==='tr'?'Tüm özellikler':L==='ru'?'Все возможности':'All features'}
                    </span>
                    <div style={{ display:'flex', gap:4 }}>
                      {['#7c3aed','#2563eb','#059669','#d97706','#0891b2','#be185d','#6d28d9'].map(c => (
                        <div key={c} style={{ width:7, height:7, borderRadius:'50%', background:c, opacity:0.65 }}/>
                      ))}
                    </div>
                  </Link>
                </div>
              )}

              {/* Resources */}
              {dropdown==='resources' && (
                <div className="dd-animated" style={{ background:'#fff', borderRadius:20, border:'1px solid rgba(0,0,0,0.07)', boxShadow:'0 8px 48px -6px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.05)', padding:'24px 20px 18px' }}>
                  <p style={{ fontSize:13.5, fontWeight:700, color:'#111827', marginBottom:12, paddingLeft:12 }}>
                    {L==='az'?'Resurslar':L==='tr'?'Kaynaklar':L==='ru'?'Ресурсы':'Resources'}
                  </p>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)' }}>
                    {resItems.map(item => <DdItem key={item.to} {...item}/>)}
                  </div>
                </div>
              )}

              {/* Company */}
              {dropdown==='company' && (
                <div className="dd-animated" style={{ background:'#fff', borderRadius:20, border:'1px solid rgba(0,0,0,0.07)', boxShadow:'0 8px 48px -6px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.05)', padding:'24px 20px 18px' }}>
                  <p style={{ fontSize:13.5, fontWeight:700, color:'#111827', marginBottom:12, paddingLeft:12 }}>
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
            className="lg:hidden bg-white rounded-2xl shadow-xl border border-gray-100 px-5 pt-3 pb-5">
            <div className="space-y-0.5 mb-4">
              {[
                { label: navItems[0].label, key:'solutions', items:solItems },
                { label: navItems[1].label, key:'features',  items:featItems },
                { label: navItems[2].label, key:'resources', items:resItems },
                { label: navItems[3].label, key:'company',   items:compItems },
              ].map(({ label, key, items }) => (
                <div key={key}>
                  <button onClick={() => setMobileOpen(mobileOpen===key?null:key)}
                    className="w-full flex items-center justify-between py-3 px-3 text-[15px] text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-colors">
                    {label}
                    <ChevronRight className="w-4 h-4 text-gray-400 transition-transform duration-200"
                      style={{ transform:mobileOpen===key?'rotate(-90deg)':'rotate(90deg)' }}/>
                  </button>
                  {mobileOpen===key && (
                    <div className="pl-3 pb-2 space-y-0.5">
                      {items.map(item => (
                        <Link key={item.to+item.title} to={item.to}
                          onClick={() => { setOpen(false); setMobileOpen(null) }}
                          className="flex items-center gap-2.5 py-2 px-3 text-[14px] text-gray-600 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                          style={{ textDecoration:'none' }}>
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background:`${item.accent||'#534AB7'}12` }}>
                            {item.logo
                              ? <img src={item.logo} alt={item.title} className="w-4 h-4 object-contain" style={{ mixBlendMode:'multiply' }}/>
                              : item.icon && <item.icon className="w-3.5 h-3.5" style={{ color:item.accent||'#534AB7' }}/>
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
            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
              <Link to="/daxil-ol" className="text-sm text-gray-500 font-semibold px-3 py-2" style={{ textDecoration:'none' }}>{navSignin}</Link>
              <Link to="/contact" className="text-white text-sm font-bold px-4 py-2.5 rounded-full"
                style={{ background:'#1a0a3e', textDecoration:'none' }}>{navContact}</Link>
            </div>
          </div>
        )}
      </header>

      {/* Spacer so page content isn't hidden under fixed nav */}
      <div style={{ height:82 }} />
    </>
  )
}
