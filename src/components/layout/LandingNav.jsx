import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, ChevronRight, BookOpen, FileText, PenLine, Star, Users, TrendingUp, HeartHandshake, Mail, Building2, ClipboardCheck, Calendar, BarChart2, MessageSquare, Clock, Sparkles } from 'lucide-react'

export default function LandingNav({ s, lang, setLang }) {
  const [open, setOpen]             = useState(false)
  const [dropdown, setDropdown]     = useState(null)
  const [mobileOpen, setMobileOpen] = useState(null)
  const closeTimer = useRef(null)
  const L = lang

  const openDd  = (name) => { clearTimeout(closeTimer.current); setDropdown(name) }
  const closeDd = ()     => { closeTimer.current = setTimeout(() => setDropdown(null), 150) }
  const keepDd  = ()     => clearTimeout(closeTimer.current)

  const solItems = [
    { to:'/ib-pyp',             logo:'/pyp.png', accent:'#f59e0b', title:L==='az'?'IB İlk İllər (PYP)':L==='tr'?'IB İlk Yıllar (PYP)':'IB Primary Years (PYP)',   desc:L==='az'?'3–12 yaş · Kiçik şagirdlər':L==='tr'?'3–12 yaş · Küçük öğrenciler':L==='ru'?'3–12 лет · Начальное обучение':'Ages 3–12 · Foundation learning' },
    { to:'/ib-myp',             logo:'/myp.png', accent:'#ef4444', title:L==='az'?'IB Orta İllər (MYP)':L==='tr'?'IB Orta Yıllar (MYP)':'IB Middle Years (MYP)',   desc:L==='az'?'11–16 yaş · Birgə planlaşdırma':L==='tr'?'11–16 yaş · Ortak planlama':L==='ru'?'11–16 лет · Совместное планирование':'Ages 11–16 · Collaborative planning' },
    { to:'/ib-diploma',         logo:'/dp.png',  accent:'#3b82f6', title:L==='az'?'IB Diploma (DP)':L==='tr'?'IB Diploma (DP)':'IB Diploma (DP)',                  desc:L==='az'?'16–19 yaş · Tam DP dəstəyi':L==='tr'?'16–19 yaş · Tam DP desteği':L==='ru'?'16–19 лет · Полная поддержка DP':'Ages 16–19 · Full DP support' },
    { to:'/ib-career',          logo:'/cp.png',  accent:'#a855f7', title:L==='az'?'IB Karyera (CP)':L==='tr'?'IB Kariyer (CP)':L==='ru'?'IB Career-Related (CP)':'IB Career-Related (CP)',           desc:L==='az'?'16–19 yaş · Karyera yönümlü':L==='tr'?'16–19 yaş · Kariyer odaklı':L==='ru'?'16–19 лет · Карьерно-ориентированный':'Ages 16–19 · Career-focused' },
    { to:'/government-schools', icon:Building2,  accent:'#1D9E75', title:L==='az'?'Dövlət Məktəbləri':L==='tr'?'Devlet Okulları':L==='ru'?'Государственные школы':'Government Schools',             desc:L==='az'?'Nazirlik inteqrasiyası':L==='tr'?'Bakanlık entegrasyonu':L==='ru'?'Интеграция с Министерством':'Ministry integration' },
  ]
  const resItems = [
    { to:'/ceo-letter', icon:FileText,     accent:'#534AB7', title:L==='az'?'CEO Məktubu':L==='tr'?'CEO Mektubu':L==='ru'?'Письмо CEO':'CEO Letter',                  desc:L==='az'?'Zirva-nın vizyonu':L==='tr'?"Zirva'nın vizyonu":L==='ru'?'Видение Zirva':'Our vision & mission' },
    { to:'/resources',  icon:BookOpen,     accent:'#534AB7', title:L==='az'?'Resurs Kitabxanası':L==='tr'?'Kaynak Kütüphanesi':L==='ru'?'Библиотека ресурсов':'Resource Library',desc:L==='az'?'Bələdçilər & şablonlar':L==='tr'?'Rehberler & şablonlar':L==='ru'?'Руководства & шаблоны':'Guides & templates' },
    { to:'/blog',       icon:PenLine,      accent:'#534AB7', title:'Blog',                                                                        desc:L==='az'?'Məqalələr & yeniliklər':L==='tr'?'Makaleler & haberler':L==='ru'?'Статьи & новости':'Articles & updates' },
    { to:'/contact',    icon:Star,         accent:'#534AB7', title:L==='az'?'Müştəri Rəyləri':L==='tr'?'Müşteri Görüşleri':L==='ru'?'Отзывы клиентов':'Customer Reviews',    desc:L==='az'?'Real istifadəçi hekayələri':L==='tr'?'Gerçek kullanıcı hikayeleri':L==='ru'?'Реальные истории пользователей':'Real user stories' },
  ]
  const compItems = [
    { to:'/about',    icon:Users,          accent:'#1D9E75', title:L==='az'?'Haqqımızda':L==='tr'?'Hakkımızda':L==='ru'?'О нас':'About Us',  desc:L==='az'?'Komanda & missiya':L==='tr'?'Ekip & misyon':L==='ru'?'Команда & миссия':'Team & mission' },
    { to:'/careers',  icon:TrendingUp,     accent:'#1D9E75', title:L==='az'?'Karyera':L==='tr'?'Kariyer':L==='ru'?'Карьера':'Careers',         desc:L==='az'?'Açıq vakansiyalar':L==='tr'?'Açık pozisyonlar':L==='ru'?'Открытые вакансии':'Open positions' },
    { to:'/partners', icon:HeartHandshake, accent:'#1D9E75', title:L==='az'?'Tərəfdaşlar':L==='tr'?'Ortaklar':L==='ru'?'Партнёры':'Partners',   desc:L==='az'?'Əməkdaşlıq imkanları':L==='tr'?'Ortaklık fırsatları':L==='ru'?'Возможности сотрудничества':'Partnership opportunities' },
    { to:'/contact',  icon:Mail,           accent:'#1D9E75', title:L==='az'?'Əlaqə':L==='tr'?'İletişim':L==='ru'?'Контакты':'Contact',          desc:L==='az'?'Bizimlə əlaqə saxla':L==='tr'?'Bize ulaşın':L==='ru'?'Свяжитесь с нами':'Get in touch' },
  ]

  const featItems = [
    { to:'/features/curriculum',    icon:BookOpen,      accent:'#7c3aed', title:L==='az'?'Kurikulum İdarəetməsi':L==='tr'?'Müfredat Yönetimi':L==='ru'?'Управление программой':'Curriculum Management',  desc:L==='az'?'Birgə planlaşdırma, 600+ standart':L==='tr'?'Ortak planlama, 600+ standart':L==='ru'?'Планирование, 600+ стандартов':'Collaborative planning, 600+ standards' },
    { to:'/features/assessment',    icon:ClipboardCheck,accent:'#2563eb', title:L==='az'?'Qiymətləndirmə & Jurnal':L==='tr'?'Değerlendirme & Not Defteri':L==='ru'?'Оценивание & Журнал':'Assessment & Gradebook',          desc:L==='az'?'IB + milli sistem dəstəyi':L==='tr'?'IB + ulusal sistem desteği':L==='ru'?'IB + национальная система':'IB + national system support' },
    { to:'/features/attendance',    icon:Calendar,       accent:'#059669', title:L==='az'?'Davamiyyət':L==='tr'?'Devam Takibi':L==='ru'?'Посещаемость':'Attendance',                  desc:L==='az'?'Bir toxunuşla qeydiyyat':L==='tr'?'Tek dokunuşla kayıt':L==='ru'?'Отметка в одно касание':'One-tap registration' },
    { to:'/features/reports',       icon:BarChart2,      accent:'#d97706', title:L==='az'?'Hesabatlar & Analitika':L==='tr'?'Raporlar & Analitik':L==='ru'?'Отчёты & Аналитика':'Reports & Analytics',          desc:L==='az'?'Nazirlik + IB hesabatları':L==='tr'?'Bakanlık + IB raporları':L==='ru'?'Министерство + IB отчёты':'Ministry + IB reporting' },
    { to:'/features/communication', icon:MessageSquare,  accent:'#0891b2', title:L==='az'?'Kommunikasiya':L==='tr'?'İletişim':L==='ru'?'Коммуникация':'Communication',                 desc:L==='az'?'Müəllim-valideyn mesajlaşma':L==='tr'?'Öğretmen-veli mesajlaşma':L==='ru'?'Учитель–родитель сообщения':'Teacher-parent messaging' },
    { to:'/features/timetable',     icon:Clock,          accent:'#7c3aed', title:L==='az'?'Cədvəl İdarəetməsi':L==='tr'?'Program Yönetimi':L==='ru'?'Управление расписанием':'Timetable Management',          desc:L==='az'?'Avtomatik cədvəl generatoru':L==='tr'?'Otomatik program oluşturucu':L==='ru'?'Автогенератор расписания':'Auto timetable generator' },
    { to:'/features/student-staff', icon:Users,          accent:'#be185d', title:L==='az'?'Şagird & Heyət':L==='tr'?'Öğrenci & Personel':L==='ru'?'Ученики & Персонал':'Student & Staff',                   desc:L==='az'?'Profillər, portfolio, intizam':L==='tr'?'Profiller, portfolyo, disiplin':L==='ru'?'Профили, портфолио, дисциплина':'Profiles, portfolio, discipline' },
    { to:'/zeka-ai',                icon:Sparkles,       accent:'#6d28d9', title:L==='az'?'Zəka AI':L==='tr'?'Zeka AI':L==='ru'?'Зека AI':'Zeka AI',                                  desc:L==='az'?'AI müəllim köməkçisi':L==='tr'?'AI öğretim asistanı':L==='ru'?'AI ассистент для обучения':'AI teaching assistant' },
  ]

  const navItems = [
    { label: L==='az'?'Resurslar':L==='tr'?'Kaynaklar':L==='ru'?'Ресурсы':'Resources', key: 'resources' },
    { label: L==='az'?'Şirkət':L==='tr'?'Şirket':L==='ru'?'Kompaniya':'Company', key: 'company' },
  ]

  const DdItem = ({ to, logo, icon: Icon, title, desc, accent = '#534AB7' }) => (
    <Link to={to} onClick={() => setDropdown(null)}
      style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'10px', borderRadius:12, textDecoration:'none', transition:'background .15s' }}
      onMouseEnter={e => e.currentTarget.style.background='#f9f9fb'}
      onMouseLeave={e => e.currentTarget.style.background='transparent'}>
      <div style={{ width:36, height:36, borderRadius:10, background:`${accent}13`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
        {logo
          ? <img src={logo} alt={title} style={{ width:18, height:18, objectFit:'contain', mixBlendMode:'multiply' }}/>
          : <Icon style={{ width:15, height:15, color:accent }}/>
        }
      </div>
      <div>
        <p style={{ fontSize:13, fontWeight:600, color:'#1a1a2e', lineHeight:1.3, margin:0 }}>{title}</p>
        <p style={{ fontSize:11.5, color:'#9ca3af', marginTop:2, lineHeight:1.4, fontWeight:400 }}>{desc}</p>
      </div>
    </Link>
  )

  const ddStyle = {
    position:'absolute', top:'calc(100% + 10px)', zIndex:300,
    background:'#fff', borderRadius:18,
    border:'1px solid rgba(0,0,0,0.08)',
    boxShadow:'0 4px 6px -2px rgba(0,0,0,0.05), 0 20px 60px -10px rgba(0,0,0,0.18)',
    padding:'14px 14px 10px',
  }
  const caretStyle = {
    position:'absolute', top:-7, left:'50%', marginLeft:-6,
    width:12, height:12, background:'#fff',
    border:'1px solid rgba(0,0,0,0.08)', borderBottom:'none', borderRight:'none',
    transform:'rotate(45deg)',
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-2xl"
      style={{ boxShadow:'0 0 0 1px rgba(0,0,0,0.06), 0 2px 16px rgba(0,0,0,0.04)' }}>
      <div className="max-w-7xl mx-auto px-6 sm:px-10 flex items-center justify-between h-[68px]">

        {/* Brand */}
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none', flex:1 }}>
          <img src="/logo.png" alt="Zirva" width={26} height={26} style={{ objectFit:'contain' }}/>
          <span style={{ fontSize:18, fontWeight:800, color:'#111827', letterSpacing:'-0.02em' }}>Zirva</span>
        </Link>

        {/* Desktop nav */}
        <nav style={{ display:'flex', alignItems:'center', gap:2 }} className="hidden lg:flex">
          {navItems.map(({ label, to, key }) => (
            <div key={label} style={{ position:'relative' }}
              onMouseEnter={() => key ? openDd(key) : setDropdown(null)}
              onMouseLeave={key ? closeDd : undefined}
            >
              {to ? (
                <Link to={to}
                  style={{ display:'flex', alignItems:'center', padding:'8px 14px', fontSize:13.5, color:'#6b7280', fontWeight:600, borderRadius:8, textDecoration:'none', transition:'all .15s' }}
                  onMouseEnter={e => { e.currentTarget.style.color='#111827'; e.currentTarget.style.background='rgba(0,0,0,0.04)' }}
                  onMouseLeave={e => { e.currentTarget.style.color='#6b7280'; e.currentTarget.style.background='' }}>
                  {label}
                </Link>
              ) : (
                <button
                  style={{ display:'flex', alignItems:'center', gap:3, padding:'8px 14px', fontSize:13.5, fontWeight:600, borderRadius:8, border:'none', background:'transparent', cursor:'pointer', transition:'all .15s', color:dropdown===key?'#534AB7':'#6b7280' }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(0,0,0,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  {label}
                  <ChevronRight style={{ width:11, height:11, transition:'transform .2s', transform:dropdown===key?'rotate(-90deg)':'rotate(90deg)', color:dropdown===key?'#534AB7':'#9ca3af' }}/>
                </button>
              )}

              {/* Solutions panel */}
              {key==='solutions' && dropdown==='solutions' && (
                <div style={{ ...ddStyle, left:'50%', transform:'translateX(-50%)', width:580 }}
                  onMouseEnter={keepDd} onMouseLeave={closeDd}>
                  <div style={caretStyle}/>
                  <p style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em', color:'#9ca3af', marginBottom:8, paddingLeft:4 }}>
                    {L==='az'?'IB Proqramları':L==='tr'?'IB Programları':L==='ru'?'IB Программы':'IB Programmes'}
                  </p>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:2 }}>
                    {solItems.slice(0,4).map(item => <DdItem key={item.to} {...item}/>)}
                  </div>
                  <div style={{ height:1, background:'rgba(0,0,0,0.06)', margin:'8px 0' }}/>
                  <p style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em', color:'#9ca3af', marginBottom:6, paddingLeft:4 }}>
                    {L==='az'?'Milli Kurikulum':L==='tr'?'Ulusal Müfredat':L==='ru'?'Национальная программа':'National Curriculum'}
                  </p>
                  <DdItem {...solItems[4]}/>
                </div>
              )}

              {/* Features panel */}
              {key==='features' && dropdown==='features' && (
                <div style={{ ...ddStyle, left:'50%', transform:'translateX(-50%)', width:560 }}
                  onMouseEnter={keepDd} onMouseLeave={closeDd}>
                  <div style={caretStyle}/>
                  <p style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em', color:'#9ca3af', marginBottom:8, paddingLeft:4 }}>
                    {L==='az'?'Platform Xüsusiyyətləri':L==='tr'?'Platform Özellikleri':L==='ru'?'Возможности платформы':'Platform Features'}
                  </p>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:2 }}>
                    {featItems.map(item => <DdItem key={item.to} {...item}/>)}
                  </div>
                </div>
              )}

              {/* Resources panel */}
              {key==='resources' && dropdown==='resources' && (
                <div style={{ ...ddStyle, left:'50%', transform:'translateX(-50%)', width:500 }}
                  onMouseEnter={keepDd} onMouseLeave={closeDd}>
                  <div style={caretStyle}/>
                  <p style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em', color:'#9ca3af', marginBottom:8, paddingLeft:4 }}>
                    {L==='az'?'Resurslar':L==='tr'?'Kaynaklar':L==='ru'?'Ресурсы':'Resources'}
                  </p>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:2 }}>
                    {resItems.map(item => <DdItem key={item.to} {...item}/>)}
                  </div>
                </div>
              )}

              {/* Company panel */}
              {key==='company' && dropdown==='company' && (
                <div style={{ ...ddStyle, left:'50%', transform:'translateX(-50%)', width:460 }}
                  onMouseEnter={keepDd} onMouseLeave={closeDd}>
                  <div style={caretStyle}/>
                  <p style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em', color:'#9ca3af', marginBottom:8, paddingLeft:4 }}>
                    {L==='az'?'Şirkət':L==='tr'?'Şirket':L==='ru'?'Компания':'Company'}
                  </p>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:2 }}>
                    {compItems.map(item => <DdItem key={item.to+item.title} {...item}/>)}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Right actions */}
        <div className="hidden lg:flex items-center gap-1.5" style={{ flex:1, justifyContent:'flex-end' }}>
          <Link to="/daxil-ol" className="px-4 py-2 text-[13.5px] text-gray-500 hover:text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-all">{s.nav_signin}</Link>
          <Link to="/contact" className="inline-flex items-center text-white text-[13.5px] font-bold px-5 py-2.5 rounded-xl transition-all hover:-translate-y-px"
            style={{ background:'linear-gradient(135deg,#6056CC,#534AB7)', boxShadow:'0 2px 10px rgba(83,74,183,0.4)' }}>
            {s.nav_contact}
          </Link>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(v=>!v)} className="lg:hidden p-2 text-gray-600 rounded-lg hover:bg-gray-100">
          {open ? <X className="w-5 h-5"/> : <Menu className="w-5 h-5"/>}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-5 pt-3 pb-5">
          <div className="space-y-0.5 mb-4">
            {[
              { label:s.nav_solutions, key:'solutions', items:solItems },
              { label:s.nav_features, key:'features', items:featItems },
              { label:L==='az'?'Resurslar':L==='tr'?'Kaynaklar':L==='ru'?'Ресурсы':'Resources', key:'resources', items:resItems },
              { label:L==='az'?'Şirkət':L==='tr'?'Şirket':L==='ru'?'Компания':'Company', key:'company', items:compItems },
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
                        className="flex items-center gap-2.5 py-2 px-3 text-[14px] text-gray-600 font-medium rounded-lg hover:bg-gray-50 transition-colors">
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
            <Link to="/daxil-ol" className="text-sm text-gray-500 font-semibold px-3 py-2">{s.nav_signin}</Link>
            <Link to="/contact" className="text-white text-sm font-bold px-4 py-2 rounded-xl"
              style={{ background:'linear-gradient(135deg,#6056CC,#534AB7)' }}>{s.nav_contact}</Link>
          </div>
        </div>
      )}
    </header>
  )
}
