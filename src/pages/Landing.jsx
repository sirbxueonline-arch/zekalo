import { Link } from 'react-router-dom'
import { useState, useEffect, useRef, useCallback } from 'react'
import {
  BookOpen, Calendar, Sparkles, MessageSquare, FileText, Award,
  GraduationCap, Users, Heart, Settings, ArrowRight, Check,
  Shield, Globe, Zap, ChevronRight, Menu, X, Play, Star, Landmark, Quote
} from 'lucide-react'

/* ─── scroll reveal hook ─── */
function useReveal() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold: 0.15 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return [ref, visible]
}

/* ─── animated counter ─── */
function Counter({ end, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0)
  const [ref, visible] = useReveal()
  useEffect(() => {
    if (!visible) return
    const num = parseInt(end.replace(/\D/g, ''))
    const step = Math.ceil(num / (duration / 16))
    let current = 0
    const timer = setInterval(() => {
      current += step
      if (current >= num) { setCount(num); clearInterval(timer) }
      else setCount(current)
    }, 16)
    return () => clearInterval(timer)
  }, [visible, end, duration])
  return <span ref={ref}>{count.toLocaleString('az-AZ')}{suffix}</span>
}

/* ─── data ─── */
const features = [
  { icon: BookOpen, title: 'Qiymətləndirmə', desc: 'IB kriteriyaları (A–D) və milli 10 ballıq şkala. Real vaxt sinxronizasiya.', color: 'purple' },
  { icon: Calendar, title: 'Davamiyyət', desc: 'Bir toxunuşla qeyd. Valideynlər anında xəbərdar olur.', color: 'teal' },
  { icon: Sparkles, title: 'Zəka AI', desc: 'Claude ilə işləyən şəxsi AI müəllim. 3 dildə fərdi yanaşma.', color: 'purple' },
  { icon: MessageSquare, title: 'Mesajlaşma', desc: 'Müəllim-valideyn əlaqəsi real vaxtda. Elanlar və fərdi mesajlar.', color: 'teal' },
  { icon: FileText, title: 'Hesabatlar', desc: 'Nazirlik hesabatları, E-Gov.az inteqrasiyası, PDF ixracı.', color: 'purple' },
  { icon: Award, title: 'IB & Dövlət', desc: 'MYP, DP və dövlət kurikulumu bir platformada.', color: 'teal' },
]

const roles = [
  { icon: GraduationCap, title: 'Şagirdlər', items: ['Qiymətlərini real vaxtda izləyir', 'Zəka AI ilə fərdi dərs alır', 'Tapşırıqları onlayn təhvil verir'] },
  { icon: Users, title: 'Müəllimlər', items: ['IB kriteriyaları üzrə qiymətləndirir', 'AI ilə hesabat yazır', 'Analitika ilə nəticələri izləyir'] },
  { icon: Heart, title: 'Valideynlər', items: ['Övladının qiymətlərini görür', 'Buraxılmış dərslər barədə xəbərdar', 'Müəllimlə birbaşa yazışır'] },
  { icon: Settings, title: 'Adminlər', items: ['Bütün məktəbi idarə edir', 'Nazirlik hesabatları göndərir', 'IB və CEESA ixracı'] },
]

const stats = [
  { value: '10', suffix: '+', label: 'Məktəb' },
  { value: '5000', suffix: '+', label: 'Şagird' },
  { value: '50000', suffix: '+', label: 'AI sessiya' },
  { value: '99', suffix: ',9%', label: 'Uptime' },
]

const testimonials = [
  { name: 'Leyla Həsənova', role: 'IB koordinatoru, TISA', text: 'Zirva IB qiymətləndirməni tamamilə dəyişdi. Artıq kriteriyaları ayrıca izləmirik.' },
  { name: 'Rəşad Quliyev', role: 'Müəllim, Məktəb №6', text: 'Davamiyyət bir toxunuşla. Valideynlər birbaşa xəbərdar olur. Çox vaxt qazanırıq.' },
  { name: 'Nərmin Əliyeva', role: 'Valideyn', text: 'Oğlumun qiymətlərini real vaxtda görürəm. Zəka AI ilə ev tapşırıqlarında da kömək alır.' },
]

const marqueeItems = ['IB World School', 'MYP', 'DP', 'Dövlət Kurikulumu', 'CEESA', 'ASAN', 'E-Gov.az', 'Claude AI', 'Supabase', 'Real vaxt']

export default function Landing() {
  const [mobileMenu, setMobileMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMobileMenu(false)
  }

  return (
    <div className="min-h-screen bg-[#08080F] overflow-x-hidden">

      {/* ───── NAVBAR ───── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#08080F]/80 backdrop-blur-xl border-b border-white/5' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="font-serif text-2xl">
            <span className="text-white">Zir</span>
            <span className="text-purple-mid">va</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollTo('features')} className="text-sm text-gray-400 hover:text-white transition-colors">Xüsusiyyətlər</button>
            <button onClick={() => scrollTo('roles')} className="text-sm text-gray-400 hover:text-white transition-colors">Kimlər üçün</button>
            <button onClick={() => scrollTo('zeka')} className="text-sm text-gray-400 hover:text-white transition-colors">Zəka AI</button>
            <button onClick={() => scrollTo('about')} className="text-sm text-gray-400 hover:text-white transition-colors">Haqqımızda</button>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/daxil-ol" className="text-sm text-gray-300 hover:text-white px-4 py-2 transition-colors">
              Daxil ol
            </Link>
            <Link to="/qeydiyyat" className="bg-purple text-white rounded-full px-5 py-2 text-sm font-medium hover:bg-purple-mid transition-all animate-glow-pulse">
              Pulsuz başla
            </Link>
          </div>

          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden text-gray-300">
            {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenu && (
          <div className="md:hidden bg-[#08080F]/95 backdrop-blur-xl border-b border-white/5 px-6 py-4 space-y-3">
            <button onClick={() => scrollTo('features')} className="block text-sm text-gray-400">Xüsusiyyətlər</button>
            <button onClick={() => scrollTo('roles')} className="block text-sm text-gray-400">Kimlər üçün</button>
            <button onClick={() => scrollTo('zeka')} className="block text-sm text-gray-400">Zəka AI</button>
            <div className="flex gap-3 pt-3">
              <Link to="/daxil-ol" className="text-sm text-gray-300 px-4 py-2">Daxil ol</Link>
              <Link to="/qeydiyyat" className="bg-purple text-white rounded-full px-5 py-2 text-sm font-medium">Pulsuz başla</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ───── HERO ───── */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-16">
        {/* Animated background orbs */}
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-purple/20 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-teal/15 rounded-full blur-[100px] animate-blob animation-delay-400" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-dark/10 rounded-full blur-[150px] animate-blob animation-delay-800" />

        {/* Subtle grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(83,74,183,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(83,74,183,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

        <div className="relative max-w-5xl mx-auto text-center z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass rounded-full px-5 py-2 mb-8 animate-fade-in-up">
            <Sparkles className="w-4 h-4 text-purple-mid" />
            <span className="text-xs font-medium text-gray-300">Claude AI ilə gücləndirilmiş platforma</span>
            <ChevronRight className="w-3 h-3 text-gray-500" />
          </div>

          {/* Headline */}
          <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl tracking-tight leading-[0.95] mb-6 animate-fade-in-up animation-delay-200">
            <span className="text-white">Məktəb</span>
            <br />
            <span className="gradient-text">idarəetməsi</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto mb-10 animate-fade-in-up animation-delay-400">
            Qiymətləndirmə, davamiyyət, mesajlaşma və AI müəllim — hamısı bir yerdə.
            IB və milli kurikulum üçün Azərbaycanda ilk.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up animation-delay-600">
            <Link
              to="/qeydiyyat"
              className="group bg-white text-gray-900 rounded-full px-8 py-4 text-sm font-semibold hover:bg-gray-100 transition-all flex items-center gap-2"
            >
              Pulsuz başla
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button
              onClick={() => scrollTo('zeka')}
              className="group glass rounded-full px-8 py-4 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Zəkanı tanı
            </button>
          </div>

          {/* Floating Browser Mockup */}
          <div className="perspective-tilt animate-fade-in-up animation-delay-800">
            <div className="glass rounded-2xl overflow-hidden mx-auto max-w-4xl">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-white/10" />
                  <div className="w-3 h-3 rounded-full bg-white/10" />
                  <div className="w-3 h-3 rounded-full bg-white/10" />
                </div>
                <div className="flex-1 bg-white/5 rounded-full px-4 py-1 text-xs text-gray-500 text-center">
                  zekalo.az/dashboard
                </div>
              </div>
              <div className="p-6 md:p-8 bg-gradient-to-br from-[#0c0c18] to-[#12121f]">
                {/* Mock dashboard */}
                <div className="grid grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
                  {[
                    { label: 'Orta qiymət', value: '8,4', icon: '📊' },
                    { label: 'Davamiyyət', value: '96%', icon: '📅' },
                    { label: 'Tapşırıqlar', value: '3', icon: '📋' },
                    { label: 'Zəka seriyası', value: '12', icon: '🔥' },
                  ].map((s) => (
                    <div key={s.label} className="glass rounded-xl p-3 md:p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] md:text-[10px] text-gray-500 uppercase tracking-wider">{s.label}</span>
                        <span className="text-sm">{s.icon}</span>
                      </div>
                      <p className="text-xl md:text-2xl font-semibold text-white">{s.value}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3 md:gap-4">
                  <div className="col-span-2 glass rounded-xl p-3 md:p-4">
                    <p className="text-[9px] md:text-[10px] text-gray-500 uppercase tracking-wider mb-3">Son qiymətlər</p>
                    {['Riyaziyyat  —  A:7 B:6 C:7 D:8', 'Fizika  —  A:8 B:7 C:6 D:7', 'Ədəbiyyat  —  A:6 B:8 C:7 D:6'].map((g) => (
                      <div key={g} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                        <span className="text-xs text-gray-400">{g.split('  —  ')[0]}</span>
                        <span className="text-[10px] text-purple-mid bg-purple/20 rounded-full px-2 py-0.5">{g.split('  —  ')[1]}</span>
                      </div>
                    ))}
                  </div>
                  <div className="glass rounded-xl p-3 md:p-4">
                    <p className="text-[9px] md:text-[10px] text-gray-500 uppercase tracking-wider mb-3">Zəka AI</p>
                    <div className="space-y-2">
                      <div className="bg-purple/30 rounded-lg rounded-br-none px-3 py-2 text-[10px] text-purple-light">Kvadrat tənlikləri izah et</div>
                      <div className="bg-white/5 rounded-lg rounded-bl-none px-3 py-2 text-[10px] text-gray-400">ax² + bx + c = 0 formasında...</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── MARQUEE ───── */}
      <section className="py-8 border-y border-white/5 overflow-hidden">
        <div className="animate-marquee flex gap-8 whitespace-nowrap">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="text-sm text-gray-600 flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-mid/50" />
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* ───── FEATURES ───── */}
      <section id="features" className="py-32 px-6 relative">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple/10 rounded-full blur-[120px]" />
        <div className="max-w-7xl mx-auto relative z-10">
          <SectionHeader
            badge="Xüsusiyyətlər"
            title="Hər şey. Bir yerdə."
            desc="Qiymətləndirmədən hesabata, davamiyyətdən AI müəllimə — hər ehtiyac bir platformada."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <RevealCard key={f.title} delay={i * 100}>
                <div className="glass-light glow-border rounded-2xl p-8 h-full group hover:-translate-y-1 transition-all duration-300 bg-white">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${
                    f.color === 'purple' ? 'bg-purple-light' : 'bg-teal-light'
                  }`}>
                    <f.icon className={`w-6 h-6 ${f.color === 'purple' ? 'text-purple' : 'text-teal'}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              </RevealCard>
            ))}
          </div>
        </div>
      </section>

      {/* ───── ROLES ───── */}
      <section id="roles" className="py-32 px-6 bg-[#FAFAFE]">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="Kimlər üçün"
            title="Hər kəs üçün hazır"
            desc="Şagirddən administratora — hər istifadəçi öz interfeysi ilə."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {roles.map((r, i) => (
              <RevealCard key={r.title} delay={i * 100}>
                <div className="bg-white glow-border rounded-2xl p-8 h-full hover:-translate-y-1 transition-all duration-300 border border-border-soft">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-light to-purple/10 flex items-center justify-center mb-6">
                    <r.icon className="w-7 h-7 text-purple" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-5">{r.title}</h3>
                  <ul className="space-y-3">
                    {r.items.map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-teal-light flex items-center justify-center mt-0.5 flex-shrink-0">
                          <Check className="w-3 h-3 text-teal" />
                        </div>
                        <span className="text-sm text-gray-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </RevealCard>
            ))}
          </div>
        </div>
      </section>

      {/* ───── ZEKA AI SHOWCASE ───── */}
      <section id="zeka" className="py-32 px-6 bg-[#08080F] relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-purple/15 rounded-full blur-[150px] -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-teal/10 rounded-full blur-[100px]" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <RevealCard delay={0}>
              <div>
                <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-6">
                  <Sparkles className="w-4 h-4 text-purple-mid" />
                  <span className="text-xs font-medium text-gray-400">Claude AI ilə gücləndirilmiş</span>
                </div>
                <h2 className="font-serif text-5xl md:text-6xl text-white tracking-tight mb-6 leading-[1.05]">
                  Zəka ilə
                  <br />
                  <span className="gradient-text">tanış olun</span>
                </h2>
                <p className="text-gray-400 leading-relaxed mb-8 text-lg">
                  Zəka — şəxsi AI müəlliminizdir. Hər fənn üzrə izahat verir,
                  IB kriteriyalarına əsasən rəy yazır, və öyrənməni fərdiləşdirir.
                </p>
                <ul className="space-y-4 mb-10">
                  {[
                    'Azərbaycan, ingilis və rus dillərində',
                    'IB MYP/DP və milli kurikulum üzrə',
                    'Müəllimlər üçün hesabat və rəy',
                    'Öyrənmə seriyası ilə motivasiya',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-teal/20 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3.5 h-3.5 text-teal-mid" />
                      </div>
                      <span className="text-sm text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/qeydiyyat"
                  className="group inline-flex items-center gap-2 bg-purple text-white rounded-full px-7 py-3.5 text-sm font-medium hover:bg-purple-mid transition-all animate-glow-pulse"
                >
                  Zəkanı sına
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </RevealCard>

            <RevealCard delay={200}>
              <div className="glass rounded-2xl overflow-hidden animate-float-slow">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple to-purple-mid flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Zəka AI</p>
                    <p className="text-[11px] text-gray-500">Riyaziyyat · Azərbaycanca</p>
                  </div>
                  <div className="ml-auto flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
                    <span className="text-[10px] text-teal-mid">Aktiv</span>
                  </div>
                </div>
                <div className="p-6 space-y-4 min-h-[320px]">
                  <div className="flex justify-end">
                    <div className="bg-purple/30 rounded-2xl rounded-br-sm px-4 py-3 text-sm text-purple-light max-w-[80%]">
                      Kvadrat tənlikləri sadə dildə izah edə bilərsən?
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-purple/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <Sparkles className="w-3.5 h-3.5 text-purple-mid" />
                    </div>
                    <div className="bg-white/5 rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-gray-300 max-w-[85%]">
                      <p className="mb-2">Əlbəttə! Gəl addım-addım izah edək:</p>
                      <p className="mb-2"><strong className="text-white">Kvadrat tənlik</strong> — ax² + bx + c = 0 formasındadır.</p>
                      <p className="mb-2">Həll üçün <strong className="text-purple-mid">diskriminant</strong> tapırıq:</p>
                      <p className="bg-white/5 rounded-lg px-3 py-2 font-mono text-xs text-teal-mid">D = b² - 4ac</p>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-10">
                    {['Davam et', 'Nümunə ver', 'Test sualları'].map((chip) => (
                      <span key={chip} className="glass rounded-full px-3 py-1.5 text-[11px] text-gray-400 cursor-pointer hover:text-white hover:bg-white/10 transition-colors">
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </RevealCard>
          </div>
        </div>
      </section>

      {/* ───── STATS ───── */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#08080F] to-[#0c0c18] relative">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(83,74,183,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(83,74,183,0.05)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-serif text-5xl md:text-6xl text-white mb-2">
                  <Counter end={s.value} suffix={s.suffix} />
                </p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── TESTIMONIALS ───── */}
      <section id="testimonials" className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="Rəylər"
            title="Müəllim və valideynlər nə deyir"
            desc="Azərbaycanın müxtəlif məktəblərindən real rəylər."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <RevealCard key={t.name} delay={i * 150}>
                <div className="bg-surface glow-border rounded-2xl p-8 h-full border border-border-soft hover:-translate-y-1 transition-all duration-300">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-6">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-light flex items-center justify-center">
                      <span className="text-sm font-medium text-purple">{t.name.split(' ').map(w => w[0]).join('')}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.role}</p>
                    </div>
                  </div>
                </div>
              </RevealCard>
            ))}
          </div>
        </div>
      </section>

      {/* ───── ABOUT ───── */}
      <section id="about" className="py-32 px-6 bg-[#08080F] relative overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-purple/10 rounded-full blur-[180px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-teal/8 rounded-full blur-[120px]" />

        <div className="max-w-5xl mx-auto relative z-10">
          <RevealCard delay={0}>
            <div className="text-center mb-16">
              <span className="inline-block text-xs tracking-widest text-purple-mid uppercase font-medium mb-3 glass rounded-full px-4 py-1">Haqqımızda</span>
              <h2 className="font-serif text-4xl md:text-6xl text-white tracking-tight mb-4">
                Niyə Zirva yaradıldı?
              </h2>
            </div>
          </RevealCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-20">
            <RevealCard delay={100}>
              <div className="glass rounded-2xl p-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple to-purple-mid flex items-center justify-center mb-6">
                  <Landmark className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-serif text-2xl text-white mb-4">Dövlət məktəbləri geridə qalıb</h3>
                <p className="text-gray-400 leading-relaxed mb-4">
                  Azərbaycanda xüsusi və beynəlxalq məktəblər müasir texnologiyalardan istifadə edərkən,
                  dövlət məktəbləri hələ də köhnə üsullarla işləyir. Qiymətlər kağızda yazılır,
                  davamiyyət əl ilə qeyd olunur, valideynlər övladlarının vəziyyətindən xəbərsiz qalır.
                </p>
                <p className="text-gray-400 leading-relaxed">
                  Zirvanın qurucusu <strong className="text-white">Kaan Guluzada</strong> inanır ki,
                  hər bir Azərbaycan şagirdi — istər IB məktəbində, istər dövlət məktəbində oxusun —
                  eyni səviyyəli texnologiyaya layiqdir. Bu bərabərsizlik aradan qaldırılmalıdır.
                </p>
              </div>
            </RevealCard>

            <RevealCard delay={200}>
              <div className="glass rounded-2xl p-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-teal animate-pulse" />
                  <span className="text-xs tracking-widest text-teal-mid uppercase font-medium">Prezident Fərmanı</span>
                </div>
                <div className="border-l-2 border-purple-mid pl-6 mb-6">
                  <p className="text-lg text-gray-300 leading-relaxed italic font-serif">
                    Prezident İlham Əliyevin 2025-ci ilin mart ayında imzaladığı
                    <strong className="text-white not-italic"> №530 saylı Fərman</strong> —
                    Azərbaycan Respublikasının 2025–2028-ci illər üçün Süni İntellekt Strategiyasını
                    rəsmi olaraq təsdiq etdi.
                  </p>
                </div>
                <p className="text-gray-400 leading-relaxed mb-4">
                  Bu tarixi qərar Azərbaycanda süni intellektin inkişafı üçün yol xəritəsi müəyyən edir.
                  Zirva olaraq biz bu strategiyanı təhsil sahəsində həyata keçirmək üçün hazırıq.
                </p>
                <p className="text-gray-400 leading-relaxed">
                  AI artıq Azərbaycanın gələcəyinin bir hissəsidir — və biz bu gələcəyi
                  hər bir sinifdə gerçəkliyə çevirmək istəyirik.
                </p>
              </div>
            </RevealCard>
          </div>

          {/* Founder quote */}
          <RevealCard delay={300}>
            <div className="glass rounded-2xl p-10 md:p-14 text-center max-w-3xl mx-auto">
              <Quote className="w-10 h-10 text-purple-mid/30 mx-auto mb-6" />
              <p className="font-serif text-xl md:text-2xl text-white leading-relaxed mb-8">
                "Mən inanıram ki, texnologiya təhsildə bərabərlik yaradır. Bakının mərkəzindəki
                beynəlxalq məktəbin imkanları ilə rayondakı dövlət məktəbinin imkanları arasında
                uçurum olmamalıdır. Zirva bu uçurumu bağlamaq üçün yaradılıb."
              </p>
              <div className="flex items-center justify-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple to-purple-mid flex items-center justify-center">
                  <span className="text-lg font-semibold text-white">KG</span>
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">Kaan Guluzada</p>
                  <p className="text-sm text-gray-500">Qurucusu, Zirva</p>
                </div>
              </div>
            </div>
          </RevealCard>

          {/* Mission pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            {[
              { num: '01', title: 'Bərabər imkan', desc: 'Hər məktəb — dövlət və ya xüsusi — eyni güclü alətlərə çıxış əldə edir.' },
              { num: '02', title: 'AI ilə təhsil', desc: 'Prezidentin AI Strategiyası çərçivəsində hər şagirdə fərdi AI müəllim.' },
              { num: '03', title: 'Yerli həll', desc: 'Azərbaycan üçün, Azərbaycanda yaradılmış. ASAN və E-Gov inteqrasiyası.' },
            ].map((item, i) => (
              <RevealCard key={item.num} delay={400 + i * 100}>
                <div className="glass rounded-2xl p-8 hover:-translate-y-1 transition-all duration-300">
                  <span className="text-3xl font-serif text-purple-mid/30 mb-4 block">{item.num}</span>
                  <h4 className="text-lg font-semibold text-white mb-2">{item.title}</h4>
                  <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </RevealCard>
            ))}
          </div>
        </div>
      </section>

      {/* ───── WHY ───── */}
      <section className="py-32 px-6 bg-[#FAFAFE]">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="Fərqimiz"
            title="Niyə Zirva?"
            desc=""
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Globe, title: 'Azərbaycana uyğun', desc: 'ASAN, E-Gov.az inteqrasiyası, Azərbaycan dili, milli kurikulum — yerli ehtiyaclara 100% uyğun.' },
              { icon: Shield, title: 'Təhlükəsiz', desc: 'Rol əsaslı giriş nəzarəti, məlumat şifrələməsi, Supabase infrastrukturu. Məlumatlarınız qorunur.' },
              { icon: Zap, title: 'Sürətli', desc: 'Real vaxt sinxronizasiya. Müəllim qiymət daxil edir — valideyn saniyələr ərzində görür.' },
            ].map((item, i) => (
              <RevealCard key={item.title} delay={i * 100}>
                <div className="text-center p-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-light to-purple/10 flex items-center justify-center mx-auto mb-6">
                    <item.icon className="w-8 h-8 text-purple" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </RevealCard>
            ))}
          </div>
        </div>
      </section>

      {/* ───── CTA ───── */}
      <section className="py-32 px-6 bg-[#08080F] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-purple/20 rounded-full blur-[200px]" />
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-teal/10 rounded-full blur-[100px]" />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <RevealCard delay={0}>
            <h2 className="font-serif text-5xl md:text-7xl text-white tracking-tight mb-6 leading-[1.05]">
              Hazırsınız?
            </h2>
            <p className="text-lg text-gray-400 mb-10 max-w-xl mx-auto">
              Pulsuz qeydiyyatdan keçin və platformanı sınayın. Kredit kartı tələb olunmur.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/qeydiyyat"
                className="group bg-white text-gray-900 rounded-full px-10 py-4 text-sm font-semibold hover:bg-gray-100 transition-all flex items-center gap-2"
              >
                Pulsuz başla
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/daxil-ol"
                className="glass text-gray-300 rounded-full px-10 py-4 text-sm font-medium hover:text-white hover:bg-white/10 transition-all"
              >
                Daxil ol
              </Link>
            </div>
          </RevealCard>
        </div>
      </section>

      {/* ───── FOOTER ───── */}
      <footer className="border-t border-white/5 py-16 px-6 bg-[#08080F]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div>
              <span className="font-serif text-2xl">
                <span className="text-white">Zir</span>
                <span className="text-purple-mid">va</span>
              </span>
              <p className="text-sm text-gray-500 mt-3 leading-relaxed">
                Azərbaycanın məktəb idarəetmə platforması
              </p>
            </div>
            <div>
              <p className="text-xs tracking-widest text-gray-500 uppercase mb-4">Platforma</p>
              <ul className="space-y-2.5">
                {['Xüsusiyyətlər', 'Qiymətləndirmə', 'Davamiyyət', 'Zəka AI'].map((l) => (
                  <li key={l}><button onClick={() => scrollTo('features')} className="text-sm text-gray-400 hover:text-white transition-colors">{l}</button></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs tracking-widest text-gray-500 uppercase mb-4">Məktəblər</p>
              <ul className="space-y-2.5">
                {['IB məktəbləri', 'Dövlət məktəbləri', 'MYP proqramı', 'DP proqramı'].map((l) => (
                  <li key={l}><span className="text-sm text-gray-400">{l}</span></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs tracking-widest text-gray-500 uppercase mb-4">Əlaqə</p>
              <ul className="space-y-2.5">
                <li><span className="text-sm text-gray-400">info@zekalo.az</span></li>
                <li><span className="text-sm text-gray-400">Bakı, Azərbaycan</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-600">&copy; {new Date().getFullYear()} Zirva. Bütün hüquqlar qorunur.</p>
            <div className="flex gap-6">
              <span className="text-xs text-gray-600 hover:text-gray-400 transition-colors cursor-pointer">Məxfilik siyasəti</span>
              <span className="text-xs text-gray-600 hover:text-gray-400 transition-colors cursor-pointer">İstifadə şərtləri</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

/* ─── helper components ─── */

function SectionHeader({ badge, title, desc }) {
  const [ref, visible] = useReveal()
  return (
    <div ref={ref} className={`text-center mb-16 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <span className="inline-block text-xs tracking-widest text-purple uppercase font-medium mb-3 bg-purple-light rounded-full px-4 py-1">{badge}</span>
      <h2 className="font-serif text-4xl md:text-6xl text-gray-900 tracking-tight mb-4">{title}</h2>
      {desc && <p className="text-gray-500 max-w-xl mx-auto text-lg">{desc}</p>}
    </div>
  )
}

function RevealCard({ children, delay = 0 }) {
  const [ref, visible] = useReveal()
  return (
    <div
      ref={ref}
      className="transition-all duration-700"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(30px)',
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}
