import { Link } from 'react-router-dom'
import { GraduationCap, BookOpen, LayoutDashboard, Sparkles, ArrowRight, Check, Zap } from 'lucide-react'
import { useLang } from '../contexts/LanguageContext'
import LandingNav from '../components/layout/LandingNav'

const STR = {
  az: {
    nav_signin:'Daxil ol', nav_contact:'Bizimlə Əlaqə',
    hero_h1:'Zəka AI',
    hero_tag:'Şagirdlər öyrənir. Müəllimlər öyrədir.',
    hero_tag2:'Zəka hər ikisini gücləndirir.',
    hero_btn:'Zəka ilə tanış ol',
    chat_user:'Kvadrat tənlikləri necə həll etmək olar?',
    chat_zeka:'Kvadrat tənliklər ax²+bx+c=0 formasında yazılır. Üç əsas üsul var: çarpanlara ayırma, tam kvadrat metodu və diskriminant düsturu. Hansından başlayaq?',
    chat_hint:'Daha çox sual ver...',
    who_title:'Hər kəs üçün fərqli',
    who_sub:'Zəka AI rolunuza uyğun işləyir — şagird, müəllim ya da admin.',
    c1:'Şagirdlər üçün', c1_sub:'Dərs boyu köməkçi',
    c1f:['Ev tapşırıqlarında addım-addım köməklik','İmtahan hazırlığı üçün fərdi plan','İzah, xülasə, nümunə çıxarma','Dərsi qaçırdınsa? Zəka cəmləşdirər'],
    c2:'Müəllimlər üçün', c2_sub:'Hesabat və plan generatoru',
    c2f:['Avtomatik hesabat generasiyası','Dərs planı yaratma köməyi','Esse rəyi aləti','Şagird irəliləyiş xülasəsi'],
    c3:'Adminlər üçün', c3_sub:'Analitika və qərar dəstəyi',
    c3f:['Sinif performans xülasələri','Davamiyyət anomaliyaları','Müəllim yükü analizi','Valideyn məlumatlandırma mərkəzi'],
    stat1_v:'4 saat → 20 dəq', stat1_s:'həftəlik hesabat işi',
    stat2_v:'3×', stat2_s:'daha sürətli dərs planlaması',
    stat3_v:'98%', stat3_s:'şagird məmnuniyyəti',
    cta_h:'Zəkanı sinifinizə gətirin',
    cta_sub:'Zəka AI bütün Zirva planlarında daxildir.',
    cta_btn:'Başla',
    footer:'© 2026 Zirva LLC',
  },
  en: {
    nav_signin:'Sign In', nav_contact:'Contact Us',
    hero_h1:'Zeka AI',
    hero_tag:'Students learn. Teachers teach.',
    hero_tag2:'Zeka powers both.',
    hero_btn:'Meet Zeka',
    chat_user:'How do I solve quadratic equations?',
    chat_zeka:'Quadratic equations follow ax²+bx+c=0. There are three main methods: factoring, completing the square, and the quadratic formula. Which shall we start with?',
    chat_hint:'Ask anything...',
    who_title:'Different for everyone',
    who_sub:"Zeka AI adapts to your role — whether you're a student, teacher or admin.",
    c1:'For Students', c1_sub:'A companion for every lesson',
    c1f:['Step-by-step homework help','Personalised exam prep plan','Explanations, summaries, examples','Missed a lesson? Zeka catches you up'],
    c2:'For Teachers', c2_sub:'Report & lesson plan generator',
    c2f:['Automated report generation','Lesson plan creation support','Essay feedback tool','Student progress summaries'],
    c3:'For Administrators', c3_sub:'Analytics & decision support',
    c3f:['Class performance summaries','Attendance anomaly detection','Teacher workload analysis','Parent communication hub'],
    stat1_v:'4h → 20min', stat1_s:'weekly reporting time',
    stat2_v:'3×', stat2_s:'faster lesson planning',
    stat3_v:'98%', stat3_s:'student satisfaction',
    cta_h:'Bring Zeka to your classroom',
    cta_sub:'Zeka AI is included in all Zirva plans.',
    cta_btn:'Get Started',
    footer:'© 2026 Zirva LLC',
  },
  tr: {
    nav_signin:'Giriş yap', nav_contact:'Bize Ulaşın',
    hero_h1:'Zeka AI',
    hero_tag:'Öğrenciler öğrenir. Öğretmenler öğretir.',
    hero_tag2:'Zeka her ikisini güçlendirir.',
    hero_btn:'Zeka ile tanış ol',
    chat_user:'İkinci dereceden denklemler nasıl çözülür?',
    chat_zeka:'İkinci dereceden denklemler ax²+bx+c=0 biçimindedir. Üç temel yöntem vardır: çarpanlarına ayırma, tam kare ve diskriminant formülü. Hangisiyle başlayalım?',
    chat_hint:'Bir şeyler sor...',
    who_title:'Herkes için farklı',
    who_sub:"Zeka AI rolünüze göre uyum sağlar — öğrenci, öğretmen ya da yönetici.",
    c1:'Öğrenciler için', c1_sub:'Her ders için bir yardımcı',
    c1f:['Adım adım ödev yardımı','Kişiselleştirilmiş sınav hazırlık planı','Açıklamalar, özetler, örnekler','Derse mi giremediniz? Zeka sizi güncelliyor'],
    c2:'Öğretmenler için', c2_sub:'Rapor & ders planı oluşturucu',
    c2f:['Otomatik rapor oluşturma','Ders planı hazırlama desteği','Kompozisyon geri bildirim aracı','Öğrenci ilerleme özetleri'],
    c3:'Yöneticiler için', c3_sub:'Analitik & karar desteği',
    c3f:['Sınıf performans özetleri','Devam anomali tespiti','Öğretmen iş yükü analizi','Veli iletişim merkezi'],
    stat1_v:'4s → 20dk', stat1_s:'haftalık raporlama süresi',
    stat2_v:'3×', stat2_s:'daha hızlı ders planlaması',
    stat3_v:'98%', stat3_s:'öğrenci memnuniyeti',
    cta_h:'Zekayı sınıfınıza getirin',
    cta_sub:'Zeka AI tüm Zirva planlarına dahildir.',
    cta_btn:'Başla',
    footer:'© 2026 Zirva LLC',
  },
  ru: {
    nav_signin:'Войти', nav_contact:'Связаться',
    hero_h1:'Зека AI',
    hero_tag:'Ученики учатся. Учителя обучают.',
    hero_tag2:'Зека усиливает и то, и другое.',
    hero_btn:'Познакомиться с Зека',
    chat_user:'Как решать квадратные уравнения?',
    chat_zeka:'Квадратные уравнения имеют вид ax²+bx+c=0. Есть три основных метода: разложение на множители, выделение полного квадрата и формула дискриминанта. С чего начнём?',
    chat_hint:'Задайте любой вопрос...',
    who_title:'Для каждого по-разному',
    who_sub:'Зека AI адаптируется к вашей роли — будь то ученик, учитель или администратор.',
    c1:'Для учеников', c1_sub:'Помощник для каждого урока',
    c1f:['Пошаговая помощь с домашним заданием','Персональный план подготовки к экзаменам','Объяснения, конспекты, примеры','Пропустили урок? Зека поможет наверстать'],
    c2:'Для учителей', c2_sub:'Генератор отчётов и планов уроков',
    c2f:['Автоматическая генерация отчётов','Помощь в создании планов уроков','Инструмент обратной связи по эссе','Сводки прогресса учащихся'],
    c3:'Для администраторов', c3_sub:'Аналитика & поддержка решений',
    c3f:['Сводки успеваемости классов','Обнаружение аномалий посещаемости','Анализ нагрузки учителей','Центр коммуникации с родителями'],
    stat1_v:'4ч → 20мин', stat1_s:'еженедельное время на отчёты',
    stat2_v:'3×', stat2_s:'быстрее планирование уроков',
    stat3_v:'98%', stat3_s:'удовлетворённость учащихся',
    cta_h:'Приведите Зека в свой класс',
    cta_sub:'Зека AI включён во все планы Zirva.',
    cta_btn:'Начать',
    footer:'© 2026 Zirva LLC',
  },
}

export default function ZekaAIPage() {
  const { lang, setLang } = useLang()
  const s = STR[lang] || STR.az

  const cards = [
    { icon:GraduationCap, title:s.c1, sub:s.c1_sub, features:s.c1f, accent:'#534AB7', bg:'rgba(83,74,183,0.07)', border:'rgba(83,74,183,0.18)' },
    { icon:BookOpen,       title:s.c2, sub:s.c2_sub, features:s.c2f, accent:'#1D9E75', bg:'rgba(29,158,117,0.07)', border:'rgba(29,158,117,0.18)' },
    { icon:LayoutDashboard,title:s.c3, sub:s.c3_sub, features:s.c3f, accent:'#2563eb', bg:'rgba(37,99,235,0.07)',  border:'rgba(37,99,235,0.18)' },
  ]

  const stats = [
    { v:s.stat1_v, sub:s.stat1_s, accent:'#a78bfa', bg:'rgba(167,139,250,0.09)', border:'rgba(167,139,250,0.22)' },
    { v:s.stat2_v, sub:s.stat2_s, accent:'#34d399', bg:'rgba(52,211,153,0.09)',  border:'rgba(52,211,153,0.22)' },
    { v:s.stat3_v, sub:s.stat3_s, accent:'#60a5fa', bg:'rgba(96,165,250,0.09)',  border:'rgba(96,165,250,0.22)' },
  ]

  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif", background:'#fff' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        .zk-card { transition: transform .2s ease, box-shadow .2s ease; }
        .zk-card:hover { transform:translateY(-6px); box-shadow:0 20px 56px rgba(0,0,0,0.12) !important; }
        @media(max-width:1023px){
          .zeka-hero-grid { grid-template-columns: 1fr !important; }
          .zeka-chat-col { display: none !important; }
        }
      `}</style>

      <LandingNav s={s} lang={lang} setLang={setLang} />

      {/* ── Hero ── */}
      <section style={{ background:'#060614', position:'relative', overflow:'hidden', minHeight:600, display:'flex', alignItems:'center' }}>
        {/* bg effects */}
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize:'36px 36px', WebkitMaskImage:'radial-gradient(ellipse 90% 80% at 50% 50%, black, transparent)', maskImage:'radial-gradient(ellipse 90% 80% at 50% 50%, black, transparent)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', top:'-20%', left:'-10%', width:'60%', height:'80%', background:'radial-gradient(ellipse, rgba(83,74,183,.3) 0%, transparent 65%)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:'-10%', right:'-5%', width:'50%', height:'70%', background:'radial-gradient(ellipse, rgba(109,40,217,.2) 0%, transparent 65%)', pointerEvents:'none' }}/>

        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-20 w-full" style={{ position:'relative', zIndex:1 }}>
          <div className="zeka-hero-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'center' }}>

            {/* Left: text */}
            <div>
              <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'5px 14px', borderRadius:99, border:'1px solid rgba(167,139,250,0.25)', background:'rgba(167,139,250,0.08)', marginBottom:24 }}>
                <Sparkles style={{ width:13, height:13, color:'#a78bfa' }}/>
                <span style={{ fontSize:12, fontWeight:700, color:'#a78bfa', letterSpacing:'0.06em', textTransform:'uppercase' }}>AI Assistant</span>
              </div>

              <h1 style={{ fontSize:'clamp(3rem,7vw,5rem)', fontWeight:800, lineHeight:1.05, letterSpacing:'-0.04em', marginBottom:20, background:'linear-gradient(128deg,#c4b5fd 0%,#a78bfa 35%,#818cf8 70%,#93c5fd 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                {s.hero_h1}
              </h1>
              <p style={{ fontSize:'clamp(1.05rem,2vw,1.2rem)', color:'rgba(255,255,255,0.65)', lineHeight:1.7, marginBottom:6 }}>
                {s.hero_tag}
              </p>
              <p style={{ fontSize:'clamp(1.05rem,2vw,1.2rem)', color:'rgba(255,255,255,0.65)', lineHeight:1.7, marginBottom:36 }}>
                {s.hero_tag2}
              </p>
              <Link to="/daxil-ol"
                style={{ display:'inline-flex', alignItems:'center', gap:9, background:'linear-gradient(135deg,#7c3aed,#4f46e5)', color:'#fff', fontWeight:700, fontSize:14.5, padding:'13px 28px', borderRadius:14, textDecoration:'none', boxShadow:'0 8px 28px rgba(109,40,217,0.45)', transition:'transform .17s ease' }}
                onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
                onMouseLeave={e=>e.currentTarget.style.transform=''}>
                {s.hero_btn} <ArrowRight style={{ width:15, height:15 }}/>
              </Link>
            </div>

            {/* Right: chat card */}
            <div className="zeka-chat-col" style={{ animation:'float 4s ease-in-out infinite' }}>
              <div style={{ background:'rgba(255,255,255,0.05)', backdropFilter:'blur(24px)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:24, padding:28, boxShadow:'0 24px 64px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)' }}>
                {/* Chat header */}
                <div style={{ display:'flex', alignItems:'center', gap:10, paddingBottom:18, marginBottom:18, borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ width:38, height:38, borderRadius:11, background:'linear-gradient(135deg,#6056CC,#534AB7)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 12px rgba(83,74,183,0.5)' }}>
                    <Sparkles style={{ width:16, height:16, color:'#fff' }}/>
                  </div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:'#fff' }}>{lang==='az'?'Zəka':'Zeka'}</div>
                    <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                      <span style={{ width:6, height:6, borderRadius:'50%', background:'#34d399', display:'inline-block', animation:'pulse-dot 2s ease-in-out infinite' }}/>
                      <span style={{ fontSize:11, color:'#34d399', fontWeight:500 }}>{lang==='az'?'Aktiv':'Online'}</span>
                    </div>
                  </div>
                  <div style={{ marginLeft:'auto', fontSize:11, color:'rgba(255,255,255,0.3)', fontWeight:500 }}>Zirva+</div>
                </div>

                {/* User bubble */}
                <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:14 }}>
                  <div style={{ background:'linear-gradient(135deg,#534AB7,#6056CC)', color:'#fff', fontSize:13, fontWeight:500, padding:'11px 15px', borderRadius:'18px 18px 4px 18px', maxWidth:'82%', lineHeight:1.5, boxShadow:'0 4px 12px rgba(83,74,183,0.3)' }}>
                    {s.chat_user}
                  </div>
                </div>

                {/* Zeka reply */}
                <div style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:18 }}>
                  <div style={{ width:28, height:28, borderRadius:8, flexShrink:0, background:'rgba(167,139,250,0.2)', border:'1px solid rgba(167,139,250,0.3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Sparkles style={{ width:12, height:12, color:'#a78bfa' }}/>
                  </div>
                  <div style={{ background:'rgba(255,255,255,0.07)', color:'rgba(255,255,255,0.88)', fontSize:13, padding:'11px 14px', borderRadius:'4px 18px 18px 18px', lineHeight:1.6 }}>
                    {s.chat_zeka}
                  </div>
                </div>

                {/* Input hint */}
                <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:12, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{ fontSize:13, color:'rgba(255,255,255,0.25)', flex:1 }}>{s.chat_hint}</span>
                  <div style={{ width:28, height:28, borderRadius:8, background:'linear-gradient(135deg,#6056CC,#534AB7)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <ArrowRight style={{ width:12, height:12, color:'#fff' }}/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* ── Who it's for ── */}
      <section style={{ background:'#f9fafb', padding:'88px 24px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:60 }}>
            <h2 style={{ fontSize:'clamp(1.6rem,3vw,2.4rem)', fontWeight:800, color:'#0f0f1a', marginBottom:10, letterSpacing:'-0.025em' }}>{s.who_title}</h2>
            <p style={{ fontSize:15.5, color:'#6b7280', fontWeight:500, maxWidth:480, margin:'0 auto' }}>{s.who_sub}</p>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:22 }}>
            {cards.map(c => {
              const IC = c.icon
              return (
                <div key={c.title} className="zk-card" style={{ background:'#fff', borderRadius:20, border:`1px solid ${c.border}`, boxShadow:`0 2px 24px rgba(0,0,0,0.05), inset 0 1px 0 ${c.border}`, padding:'28px', overflow:'hidden', position:'relative' }}>
                  <div style={{ position:'absolute', top:-24, right:-24, width:96, height:96, borderRadius:'50%', background:c.bg, pointerEvents:'none' }}/>
                  <div style={{ width:46, height:46, borderRadius:13, background:c.bg, border:`1px solid ${c.border}`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16 }}>
                    <IC style={{ width:21, height:21, color:c.accent }}/>
                  </div>
                  <h3 style={{ fontSize:17, fontWeight:800, color:'#0f0f1a', marginBottom:3 }}>{c.title}</h3>
                  <p style={{ fontSize:12.5, color:'#9ca3af', fontWeight:500, marginBottom:20 }}>{c.sub}</p>
                  <ul style={{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:10 }}>
                    {c.features.map(f => (
                      <li key={f} style={{ display:'flex', alignItems:'flex-start', gap:9, fontSize:13.5, color:'#374151', fontWeight:500, lineHeight:1.45 }}>
                        <span style={{ width:18, height:18, borderRadius:'50%', background:c.bg, border:`1px solid ${c.border}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
                          <Check style={{ width:10, height:10, color:c.accent, strokeWidth:3 }}/>
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ background:'#0b0b1e', padding:'72px 24px' }}>
        <div style={{ maxWidth:960, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:20 }}>
          {stats.map((st,i) => (
            <div key={i} style={{ background:st.bg, border:`1px solid ${st.border}`, borderRadius:18, padding:'32px 28px', textAlign:'center' }}>
              <div style={{ fontSize:'clamp(1.8rem,4vw,2.6rem)', fontWeight:800, letterSpacing:'-0.03em', color:st.accent, lineHeight:1.1, marginBottom:8 }}>{st.v}</div>
              <div style={{ fontSize:13.5, color:'rgba(255,255,255,0.45)', fontWeight:500 }}>{st.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background:'#060614', position:'relative', overflow:'hidden', padding:'96px 24px', textAlign:'center' }}>
        <div style={{ position:'absolute', top:'-30%', left:'15%', width:'70%', height:'130%', background:'radial-gradient(ellipse, rgba(83,74,183,.22) 0%, transparent 65%)', pointerEvents:'none' }}/>
        <div style={{ position:'relative', zIndex:1, maxWidth:560, margin:'0 auto' }}>
          <div style={{ width:56, height:56, borderRadius:16, background:'linear-gradient(135deg,#7c3aed,#4f46e5)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px', boxShadow:'0 8px 24px rgba(109,40,217,0.4)' }}>
            <Zap style={{ width:24, height:24, color:'#fff' }}/>
          </div>
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
