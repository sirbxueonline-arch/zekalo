import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, CheckCircle, Building2, ArrowRight, ArrowUpRight } from 'lucide-react'
import { useLang } from '../contexts/LanguageContext'

const STR = {
  az: {
    nav_signin: 'Daxil ol', nav_contact: 'Bizimlə Əlaqə',
    hero_eyebrow: 'Həllər',
    hero_h1a: 'Hər məktəb üçün',
    hero_h1b: 'doğru həll',
    hero_sub: 'IB dünya məktəbləri və Azərbaycan dövlət məktəbləri üçün — hər kurikulum çərçivəsi dəstəklənir.',
    programmes_title: 'Dəstəklənən Proqramlar',
    programmes_sub: 'Kurikulumunuzu seçin, Zirva qalanını həll edir.',
    learn_more: 'Ətraflı bax',
    cta_h: 'Hansı proqram sizin üçündür?',
    cta_sub: 'Komandamız sizin məktəb növünüzə uyğun həll tapacaq.',
    cta_btn: 'Bizimlə Əlaqə',
    footer: '© 2026 Zirva LLC',
  },
  en: {
    nav_signin: 'Sign In', nav_contact: 'Contact Us',
    hero_eyebrow: 'Solutions',
    hero_h1a: 'The right fit',
    hero_h1b: 'for every school',
    hero_sub: 'Purpose-built modules for IB World Schools and Azerbaijani state schools — every curriculum framework supported.',
    programmes_title: 'Supported Programmes',
    programmes_sub: 'Pick your curriculum. Zirva handles the rest.',
    learn_more: 'Learn more',
    cta_h: 'Not sure which fits your school?',
    cta_sub: 'Our team will match you with the right solution.',
    cta_btn: 'Contact Us',
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
}

function MiniNav({ s, lang, setLang }) {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-2xl" style={{ boxShadow:'0 0 0 1px rgba(0,0,0,0.06), 0 2px 16px rgba(0,0,0,0.04)' }}>
      <div className="max-w-7xl mx-auto px-6 sm:px-10 flex items-center justify-between h-[68px]">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <img src="/logo.png" alt="Zirva" width={26} height={26} className="object-contain" />
          <span className="text-[18px] font-extrabold text-gray-900 tracking-tight">Zirva</span>
        </Link>
        <div className="hidden lg:flex items-center gap-1.5">
          <div className="flex items-center rounded-lg p-0.5 mr-2" style={{ background:'rgba(0,0,0,0.05)' }}>
            {['az','en'].map(l => (
              <button key={l} onClick={() => setLang(l)} className="px-2.5 py-1.5 rounded-md text-[11px] font-extrabold tracking-wide transition-all"
                style={lang===l ? {background:'#fff',color:'#534AB7',boxShadow:'0 1px 4px rgba(0,0,0,0.12)'} : {color:'#9ca3af'}}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <Link to="/daxil-ol" className="px-4 py-2 text-[13.5px] text-gray-500 hover:text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-all">{s.nav_signin}</Link>
          <Link to="/contact" className="inline-flex items-center text-white text-[13.5px] font-bold px-5 py-2.5 rounded-xl transition-all hover:-translate-y-px"
            style={{background:'linear-gradient(135deg,#6056CC,#534AB7)',boxShadow:'0 2px 10px rgba(83,74,183,0.4)'}}>
            {s.nav_contact}
          </Link>
        </div>
        <button onClick={() => setOpen(v=>!v)} className="lg:hidden p-2 text-gray-600 rounded-lg hover:bg-gray-100">
          {open ? <X className="w-5 h-5"/> : <Menu className="w-5 h-5"/>}
        </button>
      </div>
      {open && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex rounded-lg p-0.5" style={{background:'rgba(0,0,0,0.06)'}}>
            {['az','en'].map(l=>(
              <button key={l} onClick={()=>setLang(l)} className="px-3 py-1.5 rounded-md text-xs font-extrabold transition-all"
                style={lang===l?{background:'#fff',color:'#534AB7',boxShadow:'0 1px 4px rgba(0,0,0,0.12)'}:{color:'#9ca3af'}}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Link to="/daxil-ol" className="text-sm text-gray-500 font-semibold px-3 py-2">{s.nav_signin}</Link>
            <Link to="/contact" className="text-white text-sm font-bold px-4 py-2 rounded-xl"
              style={{background:'linear-gradient(135deg,#6056CC,#534AB7)'}}>{s.nav_contact}</Link>
          </div>
        </div>
      )}
    </header>
  )
}

export default function Solutions() {
  const { lang, setLang } = useLang()
  const s = STR[lang] || STR.az
  const cards = CARDS[lang] || CARDS.az

  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif", background:'#fff' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .sol-card { transition: transform .2s ease, box-shadow .2s ease; }
        .sol-card:hover { transform: translateY(-6px); }
        .sol-link { transition: gap .15s ease; }
        .sol-link:hover { gap: 8px !important; }
      `}</style>

      <MiniNav s={s} lang={lang} setLang={setLang} />

      {/* ── Hero ── */}
      <section style={{ background:'#060614', position:'relative', overflow:'hidden', padding:'100px 24px 90px', textAlign:'center' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize:'36px 36px', WebkitMaskImage:'radial-gradient(ellipse 80% 70% at 50% 50%, black, transparent)', maskImage:'radial-gradient(ellipse 80% 70% at 50% 50%, black, transparent)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', top:'-20%', left:'-10%', width:'60%', height:'80%', background:'radial-gradient(ellipse, rgba(83,74,183,.28) 0%, transparent 65%)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', top:'-10%', right:'-8%', width:'50%', height:'70%', background:'radial-gradient(ellipse, rgba(29,158,117,.14) 0%, transparent 65%)', pointerEvents:'none' }}/>

        <div style={{ position:'relative', zIndex:1, maxWidth:760, margin:'0 auto' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'5px 14px', borderRadius:99, border:'1px solid rgba(167,139,250,0.25)', background:'rgba(167,139,250,0.08)', marginBottom:24 }}>
            <span style={{ width:5, height:5, borderRadius:'50%', background:'#a78bfa', display:'inline-block' }}/>
            <span style={{ fontSize:12, fontWeight:700, color:'#a78bfa', letterSpacing:'0.06em', textTransform:'uppercase' }}>{s.hero_eyebrow}</span>
          </div>

          <h1 style={{ fontSize:'clamp(2.4rem,6vw,4.2rem)', fontWeight:800, lineHeight:1.08, letterSpacing:'-0.03em', marginBottom:20, color:'#fff' }}>
            {s.hero_h1a}{' '}
            <span style={{ background:'linear-gradient(128deg,#c4b5fd 0%,#a78bfa 40%,#818cf8 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
              {s.hero_h1b}
            </span>
          </h1>
          <p style={{ fontSize:'clamp(1rem,2.2vw,1.15rem)', color:'rgba(255,255,255,0.55)', lineHeight:1.75, maxWidth:520, margin:'0 auto 44px' }}>
            {s.hero_sub}
          </p>

          {/* Programme logo strip */}
          <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:16, flexWrap:'wrap' }}>
            {['/pyp.png','/myp.png','/dp.png','/cp.png'].map((src,i) => (
              <div key={i} style={{ width:52, height:52, borderRadius:14, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <img src={src} alt="" style={{ width:36, height:36, objectFit:'contain' }}/>
              </div>
            ))}
            <div style={{ width:52, height:52, borderRadius:14, background:'rgba(29,158,117,0.12)', border:'1px solid rgba(29,158,117,0.25)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Building2 style={{ width:22, height:22, color:'#34d399' }}/>
            </div>
          </div>
        </div>
      </section>

      {/* ── Programme Cards ── */}
      <section style={{ background:'#f9fafb', padding:'88px 24px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:60 }}>
            <h2 style={{ fontSize:'clamp(1.6rem,3vw,2.4rem)', fontWeight:800, color:'#0f0f1a', marginBottom:10, letterSpacing:'-0.025em' }}>{s.programmes_title}</h2>
            <p style={{ fontSize:16, color:'#6b7280', fontWeight:500 }}>{s.programmes_sub}</p>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))', gap:22 }}>
            {cards.map((card) => {
              const IC = card.icon
              return (
                <div key={card.name} className="sol-card" style={{
                  background:'#fff', borderRadius:20,
                  boxShadow:`0 2px 0 0 ${card.accent}40, 0 4px 24px rgba(0,0,0,0.06)`,
                  border:`1px solid ${card.accent}20`,
                  overflow:'hidden', display:'flex', flexDirection:'column',
                }}>
                  {/* Accent top bar */}
                  <div style={{ height:4, background:`linear-gradient(90deg,${card.accent},${card.accent}99)` }}/>

                  <div style={{ padding:'26px 26px 22px', flex:1, display:'flex', flexDirection:'column' }}>
                    {/* Header row */}
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                        {card.img
                          ? <img src={card.img} alt={card.name} style={{ width:42, height:42, objectFit:'contain' }}/>
                          : <div style={{ width:42, height:42, borderRadius:11, background:`${card.accent}18`, display:'flex', alignItems:'center', justifyContent:'center' }}><IC style={{ width:20, height:20, color:card.accent }}/></div>
                        }
                        <h3 style={{ fontSize:15.5, fontWeight:800, color:'#0f0f1a', lineHeight:1.3 }}>{card.name}</h3>
                      </div>
                      <span style={{ fontSize:11.5, fontWeight:700, color:card.accent, background:`${card.accent}12`, padding:'4px 10px', borderRadius:20, whiteSpace:'nowrap' }}>
                        {card.ages}
                      </span>
                    </div>

                    <p style={{ fontSize:13.5, color:'#6b7280', lineHeight:1.65, marginBottom:18 }}>{card.desc}</p>

                    <ul style={{ listStyle:'none', padding:0, margin:'0 0 22px', display:'flex', flexDirection:'column', gap:8 }}>
                      {card.features.map(f => (
                        <li key={f} style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'#374151', fontWeight:500 }}>
                          <span style={{ width:16, height:16, borderRadius:'50%', background:`${card.accent}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                            <CheckCircle style={{ width:10, height:10, color:card.accent }}/>
                          </span>
                          {f}
                        </li>
                      ))}
                    </ul>

                    <Link to={card.link} className="sol-link" style={{ marginTop:'auto', display:'inline-flex', alignItems:'center', gap:5, fontSize:13, fontWeight:700, color:card.accent, textDecoration:'none' }}>
                      {s.learn_more} <ArrowRight style={{ width:13, height:13 }}/>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background:'#060614', position:'relative', overflow:'hidden', padding:'96px 24px', textAlign:'center' }}>
        <div style={{ position:'absolute', top:'-30%', left:'15%', width:'70%', height:'130%', background:'radial-gradient(ellipse, rgba(83,74,183,.22) 0%, transparent 65%)', pointerEvents:'none' }}/>
        <div style={{ position:'relative', zIndex:1, maxWidth:580, margin:'0 auto' }}>
          <h2 style={{ fontSize:'clamp(1.6rem,3.5vw,2.5rem)', fontWeight:800, color:'#fff', marginBottom:14, lineHeight:1.2, letterSpacing:'-0.025em' }}>{s.cta_h}</h2>
          <p style={{ fontSize:16, color:'rgba(255,255,255,0.5)', marginBottom:36, lineHeight:1.7 }}>{s.cta_sub}</p>
          <Link to="/contact"
            style={{ display:'inline-flex', alignItems:'center', gap:9, background:'linear-gradient(135deg,#7c3aed,#4f46e5)', color:'#fff', fontWeight:700, fontSize:14.5, padding:'14px 30px', borderRadius:14, textDecoration:'none', boxShadow:'0 8px 32px rgba(109,40,217,0.45)' }}
            onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 14px 40px rgba(109,40,217,0.55)'}}
            onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 8px 32px rgba(109,40,217,0.45)'}}>
            {s.cta_btn} <ArrowRight style={{ width:15, height:15 }}/>
          </Link>
        </div>
      </section>

      <footer style={{ background:'#060614', borderTop:'1px solid rgba(255,255,255,0.06)', padding:'20px 24px', textAlign:'center' }}>
        <p style={{ color:'rgba(255,255,255,0.25)', fontSize:12.5 }}>{s.footer}</p>
      </footer>
    </div>
  )
}
