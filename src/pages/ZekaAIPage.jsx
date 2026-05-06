import { Link } from 'react-router-dom'
import { GraduationCap, BookOpen, LayoutDashboard, Sparkles, ArrowRight, Check, Zap } from 'lucide-react'
import { useLang } from '../contexts/LanguageContext'
import LandingNav from '../components/layout/LandingNav'
import { useSEO } from '../hooks/useSEO'

const STR = {
  az: {
    nav_solutions:'Həllər', nav_features:'Xüsusiyyətlər', nav_signin:'Daxil ol', nav_contact:'Bizimlə Əlaqə',
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
    nav_solutions:'Solutions', nav_features:'Features', nav_signin:'Sign In', nav_contact:'Contact Us',
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
    nav_solutions:'Çözümler', nav_features:'Özellikler', nav_signin:'Giriş yap', nav_contact:'Bize Ulaşın',
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
    nav_solutions:'Решения', nav_features:'Возможности', nav_signin:'Войти', nav_contact:'Связаться',
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
  useSEO({
    title: lang==='az' ? 'Zəka AI — Süni İntellekt Müəllim Köməkçisi' : lang==='ru' ? 'Зека AI — ИИ-ассистент для учителей' : lang==='tr' ? 'Zeka AI — Yapay Zeka Öğretim Asistanı' : 'Zeka AI — AI Teaching Assistant',
    description: lang==='az' ? 'Zəka AI şagirdlərə, müəllimlərə və adminlərə kömək edir. Hesabat generatoru, ev tapşırığı köməkçisi, şəxsiləşdirilmiş öyrənmə.' : 'Zeka AI helps students, teachers and admins. Report generator, homework assistant, personalised learning — powered by Claude AI.',
    canonical: '/zeka-ai',
    keywords: 'AI school assistant Azerbaijan, edtech AI, Zeka AI, məktəb süni intellekt, AI müəllim köməkçisi, school AI platform',
  })

  const cards = [
    { icon:GraduationCap,    title:s.c1, sub:s.c1_sub, features:s.c1f, accent:'#7c6ee0', bg:'rgba(184,192,255,0.35)' },
    { icon:BookOpen,         title:s.c2, sub:s.c2_sub, features:s.c2f, accent:'#5db8a3', bg:'rgba(200,230,224,0.45)' },
    { icon:LayoutDashboard,  title:s.c3, sub:s.c3_sub, features:s.c3f, accent:'#6b9dde', bg:'rgba(232,236,255,0.55)' },
  ]

  const stats = [
    { v:s.stat1_v, sub:s.stat1_s, accent:'#7c6ee0' },
    { v:s.stat2_v, sub:s.stat2_s, accent:'#5db8a3' },
    { v:s.stat3_v, sub:s.stat3_s, accent:'#6b9dde' },
  ]

  return (
    <div style={{ background:'#f8f7fb' }}>
      <style>{`
        @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes float-chat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes heroGradient {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @media(max-width:1023px){
          .zeka-hero-grid { grid-template-columns: 1fr !important; }
          .zeka-chat-col { display: none !important; }
        }
      `}</style>

      <LandingNav s={s} lang={lang} setLang={setLang} lightHero />

      {/* ── Hero ── */}
      <section style={{
        position:'relative',
        overflow:'hidden',
        minHeight:660,
        display:'flex',
        alignItems:'center',
        background:'linear-gradient(-45deg, #e8ecff, #f8f7fb, #c8e6e0, #f5e6d8, #b8c0ff, #f8f7fb)',
        backgroundSize:'400% 400%',
        animation:'heroGradient 12s ease infinite',
      }}>
        {/* Drifting pastel blobs */}
        <div className="hb1"/>
        <div className="hb2"/>
        <div className="hb4"/>
        <div className="hb6"/>

        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-24 w-full" style={{ position:'relative', zIndex:1 }}>
          <div className="zeka-hero-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'center' }}>

            {/* Left: text */}
            <div>
              <h1 style={{
                fontSize:'clamp(3rem,7vw,5.25rem)',
                fontWeight:800,
                lineHeight:1.04,
                letterSpacing:'-0.04em',
                marginBottom:22,
                color:'#1a1a2e',
              }}>
                <span className="pastel-text">{s.hero_h1}</span>
              </h1>
              <p style={{ fontSize:'clamp(1.05rem,2vw,1.25rem)', color:'#1a1a2e', lineHeight:1.6, marginBottom:6, fontWeight:500 }}>
                {s.hero_tag}
              </p>
              <p style={{ fontSize:'clamp(1.05rem,2vw,1.25rem)', color:'#64748b', lineHeight:1.6, marginBottom:38, fontWeight:500 }}>
                {s.hero_tag2}
              </p>
              <Link to="/daxil-ol" className="btn-pastel">
                {s.hero_btn} <ArrowRight style={{ width:15, height:15 }}/>
              </Link>
            </div>

            {/* Right: chat card */}
            <div className="zeka-chat-col" style={{ animation:'float-chat 5s ease-in-out infinite' }}>
              <div className="liquid-card" style={{ padding:28 }}>
                {/* Chat header */}
                <div style={{ display:'flex', alignItems:'center', gap:10, paddingBottom:18, marginBottom:18, borderBottom:'1px solid rgba(124,110,224,0.12)' }}>
                  <div style={{ width:38, height:38, borderRadius:12, background:'linear-gradient(135deg,#7c6ee0,#5db8a3)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 14px rgba(124,110,224,0.4)' }}>
                    <Sparkles style={{ width:16, height:16, color:'#fff' }}/>
                  </div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:'#1a1a2e' }}>{lang==='az'?'Zəka':'Zeka'}</div>
                    <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                      <span style={{ width:6, height:6, borderRadius:'50%', background:'#5db8a3', display:'inline-block', animation:'pulse-dot 2s ease-in-out infinite' }}/>
                      <span style={{ fontSize:11, color:'#5db8a3', fontWeight:600 }}>{lang==='az'?'Aktiv':'Online'}</span>
                    </div>
                  </div>
                  <div style={{ marginLeft:'auto', fontSize:11, color:'#64748b', fontWeight:500 }}>Zirva+</div>
                </div>

                {/* User bubble */}
                <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:14 }}>
                  <div style={{
                    background:'linear-gradient(135deg,#7c6ee0,#5db8a3)',
                    color:'#fff',
                    fontSize:13,
                    fontWeight:500,
                    padding:'11px 15px',
                    borderRadius:'18px 18px 4px 18px',
                    maxWidth:'82%',
                    lineHeight:1.5,
                    boxShadow:'0 6px 18px rgba(124,110,224,0.28)',
                  }}>
                    {s.chat_user}
                  </div>
                </div>

                {/* Zeka reply */}
                <div style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:18 }}>
                  <div style={{ width:28, height:28, borderRadius:9, flexShrink:0, background:'rgba(184,192,255,0.45)', border:'1px solid rgba(124,110,224,0.25)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Sparkles style={{ width:12, height:12, color:'#7c6ee0' }}/>
                  </div>
                  <div style={{
                    background:'rgba(255,255,255,0.7)',
                    border:'1px solid rgba(124,110,224,0.12)',
                    color:'#1a1a2e',
                    fontSize:13,
                    padding:'11px 14px',
                    borderRadius:'4px 18px 18px 18px',
                    lineHeight:1.6,
                  }}>
                    {s.chat_zeka}
                  </div>
                </div>

                {/* Input hint */}
                <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:14, background:'rgba(255,255,255,0.55)', border:'1px solid rgba(124,110,224,0.14)' }}>
                  <span style={{ fontSize:13, color:'#64748b', flex:1 }}>{s.chat_hint}</span>
                  <div style={{ width:28, height:28, borderRadius:9, background:'linear-gradient(135deg,#7c6ee0,#5db8a3)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 10px rgba(124,110,224,0.35)' }}>
                    <ArrowRight style={{ width:12, height:12, color:'#fff' }}/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Who it's for ── */}
      <section style={{ background:'#f8f7fb', padding:'104px 24px', position:'relative', overflow:'hidden' }}>
        <div className="section-blob" style={{ width:520, height:520, top:-180, left:-160, background:'radial-gradient(circle, rgba(184,192,255,0.55), transparent 70%)' }}/>
        <div className="section-blob" style={{ width:480, height:480, bottom:-180, right:-140, background:'radial-gradient(circle, rgba(200,230,224,0.55), transparent 70%)' }}/>

        <div style={{ maxWidth:1140, margin:'0 auto', position:'relative', zIndex:1 }}>
          <div style={{ textAlign:'center', marginBottom:64 }}>
            <h2 style={{ fontSize:'clamp(1.8rem,3.4vw,2.6rem)', fontWeight:800, color:'#1a1a2e', marginBottom:12, letterSpacing:'-0.025em' }}>
              <span className="pastel-text">{s.who_title}</span>
            </h2>
            <p style={{ fontSize:16, color:'#64748b', fontWeight:500, maxWidth:520, margin:'0 auto', lineHeight:1.6 }}>{s.who_sub}</p>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:24 }}>
            {cards.map(c => {
              const IC = c.icon
              return (
                <div key={c.title} className="liquid-card" style={{ padding:30, position:'relative', overflow:'hidden' }}>
                  <div style={{ position:'absolute', top:-30, right:-30, width:120, height:120, borderRadius:'50%', background:c.bg, filter:'blur(12px)', pointerEvents:'none' }}/>
                  <div style={{ width:50, height:50, borderRadius:14, background:c.bg, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:18, position:'relative', zIndex:1 }}>
                    <IC style={{ width:22, height:22, color:c.accent }}/>
                  </div>
                  <h3 style={{ fontSize:18, fontWeight:800, color:'#1a1a2e', marginBottom:4, position:'relative', zIndex:1 }}>{c.title}</h3>
                  <p style={{ fontSize:13, color:'#64748b', fontWeight:500, marginBottom:22, position:'relative', zIndex:1 }}>{c.sub}</p>
                  <ul style={{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:11, position:'relative', zIndex:1 }}>
                    {c.features.map(f => (
                      <li key={f} style={{ display:'flex', alignItems:'flex-start', gap:10, fontSize:13.5, color:'#1a1a2e', fontWeight:500, lineHeight:1.5 }}>
                        <span style={{ width:20, height:20, borderRadius:'50%', background:c.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
                          <Check style={{ width:11, height:11, color:c.accent, strokeWidth:3 }}/>
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
      <section style={{ background:'#f8f7fb', padding:'88px 24px', position:'relative', overflow:'hidden' }}>
        <div className="section-blob" style={{ width:600, height:400, top:'50%', left:'50%', transform:'translate(-50%,-50%)', background:'radial-gradient(ellipse, rgba(245,230,216,0.5), transparent 70%)' }}/>
        <div style={{ maxWidth:1000, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:22, position:'relative', zIndex:1 }}>
          {stats.map((st,i) => (
            <div key={i} className="liquid-card" style={{ padding:'34px 28px', textAlign:'center' }}>
              <div style={{
                fontSize:'clamp(1.9rem,4vw,2.7rem)',
                fontWeight:800,
                letterSpacing:'-0.03em',
                color:st.accent,
                lineHeight:1.1,
                marginBottom:10,
              }}>{st.v}</div>
              <div style={{ fontSize:14, color:'#64748b', fontWeight:500 }}>{st.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        position:'relative',
        overflow:'hidden',
        padding:'112px 24px',
        textAlign:'center',
        background:'linear-gradient(-45deg, #e8ecff, #f8f7fb, #c8e6e0, #f5e6d8, #b8c0ff, #f8f7fb)',
        backgroundSize:'400% 400%',
        animation:'heroGradient 14s ease infinite',
      }}>
        <div className="section-blob" style={{ width:560, height:480, top:-120, left:'10%', background:'radial-gradient(ellipse, rgba(184,192,255,0.5), transparent 70%)' }}/>
        <div className="section-blob" style={{ width:520, height:440, bottom:-140, right:'8%', background:'radial-gradient(ellipse, rgba(200,230,224,0.5), transparent 70%)' }}/>

        <div style={{ position:'relative', zIndex:1, maxWidth:600, margin:'0 auto' }}>
          <div style={{ width:60, height:60, borderRadius:18, background:'linear-gradient(135deg,#7c6ee0,#5db8a3)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 26px', boxShadow:'0 12px 32px rgba(124,110,224,0.4)' }}>
            <Zap style={{ width:26, height:26, color:'#fff' }}/>
          </div>
          <h2 style={{ fontSize:'clamp(1.8rem,3.6vw,2.6rem)', fontWeight:800, color:'#1a1a2e', marginBottom:14, lineHeight:1.2, letterSpacing:'-0.025em' }}>
            <span className="pastel-text">{s.cta_h}</span>
          </h2>
          <p style={{ fontSize:16.5, color:'#64748b', marginBottom:38, lineHeight:1.65, fontWeight:500 }}>{s.cta_sub}</p>
          <Link to="/contact" className="btn-pastel">
            {s.cta_btn} <ArrowRight style={{ width:15, height:15 }}/>
          </Link>
        </div>
      </section>

      <footer style={{ background:'#f8f7fb', borderTop:'1px solid rgba(124,110,224,0.12)', padding:'24px', textAlign:'center' }}>
        <p style={{ color:'#64748b', fontSize:13 }}>{s.footer}</p>
      </footer>
    </div>
  )
}
