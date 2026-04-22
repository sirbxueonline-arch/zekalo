import { Link } from 'react-router-dom'
import {
  BookOpen, ClipboardCheck, Calendar, BarChart2,
  MessageSquare, Clock, Users, Sparkles, ArrowRight, Check,
} from 'lucide-react'
import { useLang } from '../contexts/LanguageContext'
import LandingNav from '../components/layout/LandingNav'

const STR = {
  az: {
    nav_signin:'Daxil ol', nav_contact:'Bizimlə Əlaqə',
    hero_eyebrow:'Xüsusiyyətlər',
    hero_h1:'Lazım olan hər şey.',
    hero_h2:'Lazım olmayan heç nə.',
    hero_body:'Kurikulumdan hesabata, qiymətləndirmədən AI müəlliminə — tam iş axını bir platformada.',
    section_title:'Platformanın imkanları',
    section_sub:'8 güclü modul, 60+ xüsusiyyət.',
    cta_h:'Canlı demo görmək istəyirsiniz?',
    cta_sub:'Hər şeyi sizin məktəb kontekstinizdə göstərəcəyik.',
    cta_btn:'Demo Sifariş Et',
    footer:'© 2026 Zirva LLC',
  },
  en: {
    nav_signin:'Sign In', nav_contact:'Contact Us',
    hero_eyebrow:'Features',
    hero_h1:'Everything you need.',
    hero_h2:"Nothing you don't.",
    hero_body:'From curriculum to reporting, assessment to AI teacher — complete workflow in one platform.',
    section_title:'Platform capabilities',
    section_sub:'8 powerful modules, 60+ features.',
    cta_h:'Want to see it live?',
    cta_sub:"We'll walk you through everything in your school's context.",
    cta_btn:'Book a Demo',
    footer:'© 2026 Zirva LLC',
  },
  tr: {
    nav_signin:'Giriş yap', nav_contact:'Bize Ulaşın',
    hero_eyebrow:'Özellikler',
    hero_h1:'İhtiyacınız olan her şey.',
    hero_h2:'İhtiyacınız olmayan hiçbir şey.',
    hero_body:'Müfredattan raporlamaya, değerlendirmeden AI öğretmenine — tam iş akışı tek platformda.',
    section_title:'Platform özellikleri',
    section_sub:'8 güçlü modül, 60+ özellik.',
    cta_h:'Canlı görmek ister misiniz?',
    cta_sub:'Her şeyi okulunuzun bağlamında size göstereceğiz.',
    cta_btn:'Demo Talep Et',
    footer:'© 2026 Zirva LLC',
  },
}

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
}

export default function Features() {
  const { lang, setLang } = useLang()
  const s = STR[lang] || STR.az
  const features = FEATURES[lang] || FEATURES.az

  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif", background:'#fff' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .feat-card { transition: transform .18s ease, box-shadow .18s ease; }
        .feat-card:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(0,0,0,0.1) !important; }
        @media(max-width:767px){
          .feat-bento { grid-template-columns: 1fr !important; }
          .feat-bento .feat-card { grid-column: span 1 !important; flex-direction: column !important; }
        }
        @media(min-width:768px) and (max-width:1023px){
          .feat-bento { grid-template-columns: repeat(2,1fr) !important; }
          .feat-bento .feat-card { grid-column: span 1 !important; flex-direction: column !important; }
        }
      `}</style>

      <LandingNav s={s} lang={lang} setLang={setLang} />

      {/* ── Hero ── */}
      <section style={{ background:'#060614', position:'relative', overflow:'hidden', padding:'100px 24px 80px', textAlign:'center' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize:'36px 36px', WebkitMaskImage:'radial-gradient(ellipse 80% 70% at 50% 50%, black, transparent)', maskImage:'radial-gradient(ellipse 80% 70% at 50% 50%, black, transparent)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', top:'-20%', left:'-10%', width:'60%', height:'80%', background:'radial-gradient(ellipse, rgba(83,74,183,.26) 0%, transparent 65%)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', top:'-10%', right:'-8%', width:'50%', height:'70%', background:'radial-gradient(ellipse, rgba(109,40,217,.18) 0%, transparent 65%)', pointerEvents:'none' }}/>

        <div style={{ position:'relative', zIndex:1, maxWidth:780, margin:'0 auto' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'5px 14px', borderRadius:99, border:'1px solid rgba(167,139,250,0.25)', background:'rgba(167,139,250,0.08)', marginBottom:28 }}>
            <span style={{ width:5, height:5, borderRadius:'50%', background:'#a78bfa', display:'inline-block' }}/>
            <span style={{ fontSize:12, fontWeight:700, color:'#a78bfa', letterSpacing:'0.06em', textTransform:'uppercase' }}>{s.hero_eyebrow}</span>
          </div>

          <h1 style={{ fontSize:'clamp(2.6rem,6.5vw,4.5rem)', fontWeight:800, color:'#fff', lineHeight:1.06, letterSpacing:'-0.035em', marginBottom:6 }}>
            {s.hero_h1}
          </h1>
          <h1 style={{ fontSize:'clamp(2.6rem,6.5vw,4.5rem)', fontWeight:800, lineHeight:1.06, letterSpacing:'-0.035em', marginBottom:28, background:'linear-gradient(128deg,#c4b5fd 0%,#a78bfa 40%,#818cf8 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
            {s.hero_h2}
          </h1>
          <p style={{ fontSize:'clamp(1rem,2.2vw,1.15rem)', color:'rgba(255,255,255,0.5)', lineHeight:1.75, maxWidth:520, margin:'0 auto 48px' }}>
            {s.hero_body}
          </p>

          {/* Quick stat chips */}
          <div style={{ display:'flex', justifyContent:'center', gap:12, flexWrap:'wrap' }}>
            {[
              { n:'8', label: lang==='az'?'Modul':'Modules' },
              { n:'60+', label: lang==='az'?'Xüsusiyyət':'Features' },
              { n:'2', label: lang==='az'?'Kurikulum':'Curricula' },
            ].map(({ n, label }) => (
              <div key={n} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 20px', borderRadius:99, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ fontSize:18, fontWeight:800, color:'#a78bfa' }}>{n}</span>
                <span style={{ fontSize:13, color:'rgba(255,255,255,0.5)', fontWeight:500 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature Bento Grid ── */}
      <section style={{ background:'#f9fafb', padding:'88px 24px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:60 }}>
            <h2 style={{ fontSize:'clamp(1.6rem,3vw,2.4rem)', fontWeight:800, color:'#0f0f1a', marginBottom:10, letterSpacing:'-0.025em' }}>{s.section_title}</h2>
            <p style={{ fontSize:16, color:'#6b7280', fontWeight:500 }}>{s.section_sub}</p>
          </div>

          <div className="feat-bento" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:18, gridAutoRows:'auto' }}>
            {features.map((f, i) => {
              const IC = f.icon
              const isWide = f.wide
              return (
                <div key={f.title} className="feat-card" style={{
                  gridColumn: isWide ? 'span 2' : 'span 1',
                  background:'#fff',
                  borderRadius:20,
                  border:`1px solid ${f.accent}20`,
                  boxShadow:`0 1px 0 0 ${f.accent}30, 0 2px 20px rgba(0,0,0,0.05)`,
                  padding:'28px',
                  display:'flex',
                  flexDirection: isWide ? 'row' : 'column',
                  gap: isWide ? 32 : 0,
                  alignItems: 'flex-start',
                  overflow:'hidden',
                  position:'relative',
                }}>
                  {/* Background accent blob */}
                  <div style={{ position:'absolute', top:-20, right:-20, width:120, height:120, borderRadius:'50%', background:`${f.accent}08`, pointerEvents:'none' }}/>

                  <div style={{ flexShrink:0, width: isWide ? 200 : 'auto' }}>
                    <div style={{ width:48, height:48, borderRadius:14, background:`${f.accent}14`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14 }}>
                      <IC style={{ width:22, height:22, color:f.accent }}/>
                    </div>
                    <h3 style={{ fontSize:16, fontWeight:800, color:'#0f0f1a', marginBottom:6, letterSpacing:'-0.01em' }}>{f.title}</h3>
                    <p style={{ fontSize:13, color:'#9ca3af', fontWeight:500, lineHeight:1.5, margin:0 }}>{f.desc}</p>
                  </div>

                  <ul style={{ listStyle:'none', padding:0, margin: isWide ? '4px 0 0' : '20px 0 0', display:'flex', flexDirection:'column', gap:9, flex:1 }}>
                    {f.items.map(item => (
                      <li key={item} style={{ display:'flex', alignItems:'center', gap:9, fontSize:13.5, color:'#374151', fontWeight:500 }}>
                        <span style={{ width:18, height:18, borderRadius:'50%', background:`${f.accent}15`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          <Check style={{ width:10, height:10, color:f.accent, strokeWidth:3 }}/>
                        </span>
                        {item}
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
      <section style={{ background:'#060614', position:'relative', overflow:'hidden', padding:'96px 24px', textAlign:'center' }}>
        <div style={{ position:'absolute', top:'-30%', left:'15%', width:'70%', height:'130%', background:'radial-gradient(ellipse, rgba(83,74,183,.22) 0%, transparent 65%)', pointerEvents:'none' }}/>
        <div style={{ position:'relative', zIndex:1, maxWidth:580, margin:'0 auto' }}>
          <h2 style={{ fontSize:'clamp(1.6rem,3.5vw,2.5rem)', fontWeight:800, color:'#fff', marginBottom:14, lineHeight:1.2, letterSpacing:'-0.025em' }}>{s.cta_h}</h2>
          <p style={{ fontSize:16, color:'rgba(255,255,255,0.5)', marginBottom:36, lineHeight:1.7 }}>{s.cta_sub}</p>
          <Link to="/contact"
            style={{ display:'inline-flex', alignItems:'center', gap:9, background:'linear-gradient(135deg,#7c3aed,#4f46e5)', color:'#fff', fontWeight:700, fontSize:14.5, padding:'14px 30px', borderRadius:14, textDecoration:'none', boxShadow:'0 8px 32px rgba(109,40,217,0.45)', transition:'transform .17s ease' }}
            onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)'}}
            onMouseLeave={e=>{e.currentTarget.style.transform=''}}>
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
