import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import {
  BookOpen, Calendar, Sparkles, MessageSquare, FileText, Award,
  GraduationCap, Users, Heart, Settings, ArrowRight, Check,
  Shield, Globe, Zap, ChevronRight, Menu, X, Landmark, Quote,
  BarChart3, Building2, TrendingUp, Bell, Database, Download
} from 'lucide-react'

/* ─── scroll reveal hook ─── */
function useReveal(threshold = 0.1) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold }
    )
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
  { icon: BookOpen,      title: 'Qiymətləndirmə', desc: 'IB kriteriyaları (A–D) və milli 10 ballıq şkala. Real vaxt sinxronizasiya.',                color: 'purple' },
  { icon: Calendar,      title: 'Davamiyyət',      desc: 'Bir toxunuşla qeyd. Valideynlər anında xəbərdar olur.',                                      color: 'teal'   },
  { icon: Sparkles,      title: 'Zəka',             desc: 'Claude ilə işləyən şəxsi süni intellekt müəllimi. 3 dildə fərdi yanaşma.',                  color: 'purple' },
  { icon: MessageSquare, title: 'Mesajlaşma',       desc: 'Müəllim-valideyn əlaqəsi real vaxtda. Elanlar və fərdi mesajlar.',                          color: 'teal'   },
  { icon: FileText,      title: 'Hesabatlar',       desc: 'Nazirlik hesabatları, E-Gov.az inteqrasiyası, PDF ixracı.',                                   color: 'purple' },
  { icon: Award,         title: 'IB & Dövlət',      desc: 'MYP, DP və dövlət kurikulumu bir platformada.',                                              color: 'teal'   },
]

const roles = [
  { icon: GraduationCap, title: 'Şagirdlər', items: ['Qiymətlərini real vaxtda izləyir', 'Zəka ilə fərdi dərs alır',                      'Tapşırıqları onlayn təhvil verir']  },
  { icon: Users,         title: 'Müəllimlər', items: ['IB kriteriyaları üzrə qiymətləndirir', 'Süni intellekt ilə hesabat yazır',           'Analitika ilə nəticələri izləyir']  },
  { icon: Heart,         title: 'Valideynlər', items: ['Övladının qiymətlərini görür',          'Buraxılmış dərslər barədə xəbərdar olur',  'Müəllimlə birbaşa yazışır']          },
  { icon: Settings,      title: 'Adminlər',    items: ['Bütün məktəbi idarə edir',              'Nazirlik hesabatları göndərir',            'IB və CEESA ixracı']                 },
]

const stats = [
  { value: '10',    suffix: '+',   label: 'Pilot Məktəb'         },
  { value: '5000',  suffix: '+',   label: 'Aktiv Şagird'         },
  { value: '50000', suffix: '+',   label: 'S.İ. Sessiyası'       },
  { value: '99',    suffix: '.9%', label: 'Uptime'               },
]

const marqueeItems = [
  'IB World School', 'MYP', 'DP', 'Dövlət Kurikulumu', 'CEESA',
  'ASAN Xidmət', 'E-Gov.az', 'Claude', 'Real Vaxt Sinxronizasiya',
  'S.İ. Strategiyası 2025–2028', 'Rəqəmsal Məktəb', 'Nazirlik Hesabatları',
]

const ministryTools = [
  { icon: BarChart3,  title: 'Milli İzləmə Paneli',     desc: 'Bütün bağlı məktəblərin real vaxt statistikası. Performans, davamiyyət, S.İ. istifadəsi — bir ekranda.'          },
  { icon: FileText,   title: 'Avtomatik Hesabatlar',     desc: 'Bir kliklə tam uyğunluqlu hesabatlar. PDF, Excel, E-Gov.az formatında avtomatik ixrac.'                         },
  { icon: Shield,     title: 'Məlumat Suverenliyi',      desc: 'Bütün təhsil məlumatları Azərbaycan serverlərində saxlanılır. Tam nəzarət dövlət əlindədir.'                     },
  { icon: TrendingUp, title: 'Trend Analitikası',        desc: 'İllik, rüblük, aylıq müqayisələr. Ən yaxşı və ən zəif performanslı məktəblər — avtomatik aşkar.'               },
  { icon: Bell,       title: 'Ani Bildirişlər',           desc: 'Kritik hadisələr baş verəndə nazirlik dərhal xəbərdar olur. Heç bir şey gizli qalmır.'                         },
  { icon: Database,   title: 'E-Gov İnteqrasiyası',       desc: 'ASAN Xidmət və E-Gov.az ilə tam inteqrasiya. Mövcud dövlət infrastrukturu ilə işləyir.'                        },
]

export default function Landing() {
  const [mobileMenu, setMobileMenu] = useState(false)
  const [scrolled, setScrolled]     = useState(false)

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
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ───── ANNOUNCEMENT BAR ───── */}
      <div className="bg-amber-50 border-b border-amber-200 py-2 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 flex-wrap">
          <span className="text-amber-700 text-xs font-semibold tracking-wide uppercase">★ Prezident Fərmanı №530</span>
          <span className="text-amber-300 hidden sm:block">·</span>
          <span className="text-amber-600 text-xs">
            Azərbaycan Respublikasının 2025–2028 Süni İntellekt Strategiyasına uyğun platforma
          </span>
        </div>
      </div>

      {/* ───── NAVBAR ───── */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm'
          : 'bg-white border-b border-gray-100'
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="font-serif text-2xl flex-shrink-0">
            <span className="text-gray-900">Zir</span>
            <span className="text-purple">va</span>
          </Link>

          <div className="hidden md:flex items-center gap-7">
            <button onClick={() => scrollTo('features')} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Xüsusiyyətlər</button>
            <button onClick={() => scrollTo('ministry')} className="text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors">Nazirlik Paneli</button>
            <button onClick={() => scrollTo('zeka')}     className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Zəka</button>
            <button onClick={() => scrollTo('about')}    className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Haqqımızda</button>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/daxil-ol"  className="text-sm text-gray-500 hover:text-gray-900 px-4 py-2 transition-colors">Daxil ol</Link>
            <Link to="/qeydiyyat" className="bg-purple text-white rounded-full px-5 py-2 text-sm font-medium hover:bg-purple-dark transition-all shadow-sm shadow-purple/30">
              Pulsuz başla
            </Link>
          </div>

          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden text-gray-600">
            {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenu && (
          <div className="md:hidden bg-white border-b border-gray-100 px-6 py-4 space-y-3">
            <button onClick={() => scrollTo('features')} className="block text-sm text-gray-500">Xüsusiyyətlər</button>
            <button onClick={() => scrollTo('ministry')} className="block text-sm text-amber-600 font-medium">Nazirlik Paneli</button>
            <button onClick={() => scrollTo('zeka')}     className="block text-sm text-gray-500">Zəka</button>
            <button onClick={() => scrollTo('about')}    className="block text-sm text-gray-500">Haqqımızda</button>
            <div className="flex gap-3 pt-3 border-t border-gray-100">
              <Link to="/daxil-ol"  className="text-sm text-gray-500 px-4 py-2">Daxil ol</Link>
              <Link to="/qeydiyyat" className="bg-purple text-white rounded-full px-5 py-2 text-sm font-medium">Pulsuz başla</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ───── HERO ───── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-purple-light/30 to-white px-6 pt-20 pb-24">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-purple-light/60 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-teal-light/60 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(83,74,183,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(83,74,183,0.03)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto z-10">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-5 py-2 mb-8 animate-fade-in-up">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-xs font-medium text-amber-700 tracking-wide">Süni İntellekt Strategiyası 2025–2028 çərçivəsində</span>
              <ChevronRight className="w-3 h-3 text-amber-400" />
            </div>

            <h1 className="font-serif text-[clamp(2.8rem,8vw,7rem)] text-gray-900 tracking-tight leading-[0.95] mb-7 animate-fade-in-up animation-delay-200">
              Azərbaycanda<br />
              <span className="gradient-text">Rəqəmsal Məktəb</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto mb-3 animate-fade-in-up animation-delay-400">
              4,700+ dövlət məktəbini, 1.8 milyon şagirdi və 170,000+ müəllimi
              vahid rəqəmsal platformada birləşdirən infrastruktur.
            </p>
            <p className="text-sm text-purple/70 mb-12 animate-fade-in-up animation-delay-400 tracking-wide">
              Qiymətləndirmə · Davamiyyət · Süni İntellekt Müəllimi · Nazirlik Hesabatları
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-600">
              <button
                onClick={() => scrollTo('ministry')}
                className="group bg-gray-900 text-white rounded-full px-8 py-4 text-sm font-semibold hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg shadow-gray-900/20"
              >
                Nazirlik Panelini gör
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => scrollTo('zeka')}
                className="group bg-white border border-gray-200 rounded-full px-8 py-4 text-sm font-medium text-gray-700 hover:border-purple hover:text-purple transition-all flex items-center gap-2 shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-purple" />
                Zəkanı tanı
              </button>
            </div>
          </div>

          {/* Hero Dashboard — Ministry View */}
          <div className="perspective-tilt animate-fade-in-up animation-delay-800">
            <div className="bg-white rounded-2xl overflow-hidden mx-auto max-w-5xl border border-gray-200 shadow-2xl shadow-gray-200/80">
              <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-100 bg-gray-50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
                  <div className="w-3 h-3 rounded-full bg-green-400/70" />
                </div>
                <div className="flex-1 bg-white rounded-full px-4 py-1.5 text-xs text-gray-400 text-center border border-gray-200">
                  zekalo.az/nazirlik/panel
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-teal animate-pulse" />
                  <span className="text-[10px] text-teal font-medium">12 məktəb aktiv</span>
                </div>
              </div>

              <div className="p-6 md:p-8 bg-gray-50/60">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-[10px] text-amber-600 uppercase tracking-widest font-semibold mb-0.5">Nazirlik İdarəetmə Paneli</p>
                    <p className="text-gray-900 font-semibold">Azərbaycan Respublikası</p>
                  </div>
                  <div className="bg-white rounded-xl px-4 py-2 text-right border border-gray-200 shadow-sm">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">Son yenilənmə</p>
                    <p className="text-xs text-gray-700 font-medium">Bugün, 09:42</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {[
                    { label: 'Bağlı Məktəb',   value: '12',     trend: '+3 bu rübdə',      icon: '🏫' },
                    { label: 'Aktiv Şagird',    value: '5,247',  trend: '+214 bu ay',        icon: '👤' },
                    { label: 'S.İ. Sessiyası',  value: '52,841', trend: '+1.2k bu həftə',    icon: '✨' },
                    { label: 'Hesabat',          value: '47',     trend: '12/12 göndərildi',  icon: '📊' },
                  ].map((s) => (
                    <div key={s.label} className="bg-white rounded-xl p-3 md:p-4 border border-gray-200 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] md:text-[10px] text-gray-400 uppercase tracking-wider">{s.label}</span>
                        <span className="text-base">{s.icon}</span>
                      </div>
                      <p className="text-xl md:text-2xl font-bold text-gray-900 mb-1">{s.value}</p>
                      <span className="text-[9px] text-teal bg-teal-light rounded-full px-2 py-0.5 inline-block font-medium">{s.trend}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-5 gap-3">
                  <div className="col-span-3 bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Milli Performans Meyli</p>
                      <span className="text-[10px] text-teal bg-teal-light rounded-full px-2 py-0.5 font-medium">↑ 4.2%</span>
                    </div>
                    <div className="flex items-end gap-1.5 h-14">
                      {[52, 58, 55, 64, 61, 68, 65, 73, 70, 79, 76, 86].map((h, i) => (
                        <div key={i} className={`flex-1 rounded-sm ${i === 11 ? 'bg-purple' : i >= 8 ? 'bg-purple/50' : 'bg-purple/20'}`} style={{ height: `${h}%` }} />
                      ))}
                    </div>
                    <div className="flex justify-between mt-1.5 px-0.5">
                      {['Yan', 'Fev', 'Mar', 'Apr'].map(m => (
                        <span key={m} className="text-[9px] text-gray-400">{m}</span>
                      ))}
                    </div>
                  </div>

                  <div className="col-span-2 bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">Son Hadisələr</p>
                    <div className="space-y-3">
                      {[
                        { text: 'Məktəb №47 hesabat göndərdi', time: '09:12', color: 'bg-teal'       },
                        { text: 'Yeni məktəb qoşuldu',         time: '08:54', color: 'bg-purple'     },
                        { text: 'E-Gov ixracı tamamlandı',      time: '08:30', color: 'bg-amber-400'  },
                      ].map((e, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${e.color} mt-1.5 flex-shrink-0`} />
                          <div>
                            <p className="text-[10px] text-gray-700 leading-snug">{e.text}</p>
                            <p className="text-[9px] text-gray-400 mt-0.5">{e.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── TRUST STRIP ───── */}
      <section className="py-10 px-6 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-[10px] text-gray-400 uppercase tracking-[0.2em] mb-7">İnteqrasiya və Uyğunluq</p>
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-5">
            {[
              { name: 'ASAN Xidmət',             cls: 'border-blue-200 text-blue-600 bg-blue-50'       },
              { name: 'E-Gov.az',                 cls: 'border-teal/30 text-teal bg-teal-light'         },
              { name: 'IB World School',           cls: 'border-red-200 text-red-600 bg-red-50'          },
              { name: 'CEESA',                     cls: 'border-indigo-200 text-indigo-600 bg-indigo-50' },
              { name: 'S.İ. Strategiyası 2025',   cls: 'border-amber-200 text-amber-700 bg-amber-50'    },
              { name: 'Claude',                    cls: 'border-purple/30 text-purple bg-purple-light'   },
            ].map((p) => (
              <div key={p.name} className={`border rounded-lg px-5 py-2.5 text-[11px] font-medium tracking-wide ${p.cls}`}>
                {p.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── MARQUEE ───── */}
      <section className="py-5 border-b border-gray-100 overflow-hidden bg-white">
        <div className="animate-marquee flex gap-10 whitespace-nowrap">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="text-sm text-gray-400 flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-purple/40" />
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* ───── NATIONAL SCALE ───── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <RevealCard delay={0}>
            <div className="text-center mb-12">
              <span className="inline-block text-[10px] tracking-[0.2em] text-amber-700 uppercase font-semibold mb-4 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5">Milli İmkan</span>
              <h2 className="font-serif text-4xl md:text-5xl text-gray-900 tracking-tight mb-4 leading-[1.1]">
                Azərbaycanda Rəqəmsal<br />Dönüşümün Miqyası
              </h2>
              <p className="text-gray-500 max-w-lg mx-auto">
                Ölkəmizdəki bütün məktəbləri bir platformada birləşdirmək — bu bizim hədəfimizdir.
              </p>
            </div>
          </RevealCard>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { num: '4,700+',   label: 'Dövlət Məktəbi', desc: 'Azərbaycanda rəqəmsal idarəetmə gözləyən məktəb',
                icon: Building2,    bg: 'bg-purple-light', border: 'border-purple/20', ic: 'text-purple',    nc: 'text-purple-dark' },
              { num: '1.8M',     label: 'Şagird',          desc: 'Fərdi süni intellekt müəlliminə çıxış əldə edə biləcək şagird',
                icon: GraduationCap, bg: 'bg-teal-light', border: 'border-teal/20',   ic: 'text-teal',      nc: 'text-teal'        },
              { num: '170,000+', label: 'Müəllim',         desc: 'Rəqəmsal alətlər ilə güclənəcək müəllim',
                icon: Users,        bg: 'bg-amber-50',    border: 'border-amber-200', ic: 'text-amber-600', nc: 'text-amber-700'   },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <RevealCard key={item.label} delay={i * 150}>
                  <div className={`${item.bg} ${item.border} border rounded-2xl p-8 text-center hover:-translate-y-1 transition-all duration-300`}>
                    <div className="w-14 h-14 rounded-2xl bg-white/70 flex items-center justify-center mx-auto mb-5 shadow-sm">
                      <Icon className={`w-7 h-7 ${item.ic}`} />
                    </div>
                    <p className={`font-serif text-5xl md:text-6xl ${item.nc} mb-2`}>{item.num}</p>
                    <p className="font-semibold text-gray-800 mb-3 text-lg">{item.label}</p>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                </RevealCard>
              )
            })}
          </div>
        </div>
      </section>

      {/* ───── FEATURES ───── */}
      <section id="features" className="py-32 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="Xüsusiyyətlər"
            title="Hər şey. Bir yerdə."
            desc="Qiymətləndirmədən hesabata, davamiyyətdən süni intellekt müəlliminə — hər ehtiyac bir platformada."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => {
              const Icon = f.icon
              return (
                <RevealCard key={f.title} delay={i * 90}>
                  <div className="bg-white rounded-2xl p-8 h-full hover:-translate-y-1 transition-all duration-300 border border-gray-200 shadow-sm hover:shadow-md hover:border-purple/30">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${f.color === 'purple' ? 'bg-purple-light' : 'bg-teal-light'}`}>
                      <Icon className={`w-6 h-6 ${f.color === 'purple' ? 'text-purple' : 'text-teal'}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                  </div>
                </RevealCard>
              )
            })}
          </div>
        </div>
      </section>

      {/* ───── MINISTRY PLATFORM ───── */}
      <section id="ministry" className="py-32 px-6 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-amber-50 rounded-full blur-[150px] -translate-y-1/2 pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <RevealCard delay={0}>
            <div className="text-center mb-16">
              <span className="inline-block text-[10px] tracking-[0.2em] text-amber-700 uppercase font-semibold mb-4 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5">Nazirlik üçün</span>
              <h2 className="font-serif text-4xl md:text-5xl text-gray-900 tracking-tight mb-5 leading-[1.05]">
                Tam nəzarət.<br />
                <span className="gradient-text">Real vaxt görüntü.</span>
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto text-lg">
                Nazirlik səviyyəsində idarəetmə, hesabat və analitika —
                heç bir əlavə müdaxilə olmadan, avtomatik.
              </p>
            </div>
          </RevealCard>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-20">
            {ministryTools.map((tool, i) => {
              const Icon = tool.icon
              return (
                <RevealCard key={tool.title} delay={i * 100}>
                  <div className="bg-white rounded-2xl p-7 h-full hover:-translate-y-1 transition-all duration-300 border border-gray-200 shadow-sm hover:shadow-md hover:border-amber-300 group">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-5 group-hover:bg-amber-100 transition-all">
                      <Icon className="w-6 h-6 text-amber-600" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 mb-2">{tool.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{tool.desc}</p>
                  </div>
                </RevealCard>
              )
            })}
          </div>

          {/* Full Ministry Dashboard */}
          <RevealCard delay={300}>
            <div className="bg-white rounded-2xl overflow-hidden border border-amber-200 shadow-xl shadow-amber-100/50">
              <div className="bg-gradient-to-r from-amber-50 to-amber-100/60 px-6 py-4 border-b border-amber-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center">
                    <Landmark className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-semibold text-sm">Azərbaycan Respublikası Təhsil Nazirliyi</p>
                    <p className="text-amber-600 text-[11px]">Zirva Məktəb İdarəetmə Sistemi — v2.0</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-teal animate-pulse" />
                  <span className="text-[11px] text-teal font-medium">Canlı</span>
                </div>
              </div>

              <div className="p-6 md:p-8 bg-gray-50/50">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                  {[
                    { label: 'Ümumi Məktəb',       value: '12',     sub: '+3 bu rübdə',        vc: 'text-gray-900'  },
                    { label: 'Orta Qiymət',         value: '7.8',    sub: '↑ 0.4 artış',         vc: 'text-teal'      },
                    { label: 'Davamiyyət',          value: '94.2%',  sub: '↑ 2.1% yaxşılaşma',   vc: 'text-purple'    },
                    { label: 'S.İ. İstifadəsi',     value: '52,841', sub: 'sessiya bu ay',        vc: 'text-amber-600' },
                  ].map((s) => (
                    <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">{s.label}</p>
                      <p className={`text-2xl font-bold ${s.vc} mb-1`}>{s.value}</p>
                      <p className="text-[10px] text-gray-400">{s.sub}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Məktəb Reytinqi</p>
                      <span className="text-[10px] text-purple bg-purple-light rounded-full px-2.5 py-1 font-medium">Bu rübdə</span>
                    </div>
                    <div className="space-y-4">
                      {[
                        { name: 'TISA (IB)',   score: '8.9', bar: 100 },
                        { name: 'Məktəb №132', score: '8.4', bar: 93  },
                        { name: 'Məktəb №6',   score: '8.1', bar: 90  },
                        { name: 'Məktəb №47',  score: '7.8', bar: 86  },
                      ].map((school, i) => (
                        <div key={school.name} className="flex items-center gap-3">
                          <span className="text-[10px] text-gray-400 w-4 font-medium">{i + 1}</span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs text-gray-700">{school.name}</span>
                              <span className="text-xs text-gray-900 font-bold">{school.score}</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-purple to-purple-mid rounded-full" style={{ width: `${school.bar}%` }} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Hesabat İxracı</p>
                      <button className="text-[10px] text-teal bg-teal-light rounded-full px-3 py-1 flex items-center gap-1.5 font-medium">
                        <Download className="w-3 h-3" />
                        Hamısını ixrac et
                      </button>
                    </div>
                    <div className="space-y-0">
                      {[
                        { name: 'Q1 2025 — Rüblük Hesabat',   status: 'Hazır',            dot: 'bg-teal'                    },
                        { name: 'Yanvar — Davamiyyət',          status: 'E-Gov göndərildi', dot: 'bg-teal'                    },
                        { name: 'Fevral — Davamiyyət',          status: 'E-Gov göndərildi', dot: 'bg-teal'                    },
                        { name: 'IB Audit 2025',                status: 'Hazırlanır',        dot: 'bg-amber-400 animate-pulse' },
                        { name: 'Milli Kurikulum Uyğunluğu',   status: '12/12 məktəb',      dot: 'bg-purple'                  },
                      ].map((r, i) => (
                        <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${r.dot} flex-shrink-0`} />
                            <span className="text-xs text-gray-600">{r.name}</span>
                          </div>
                          <span className="text-[10px] text-gray-400 ml-2 flex-shrink-0">{r.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </RevealCard>
        </div>
      </section>

      {/* ───── ROLES ───── */}
      <section id="roles" className="py-32 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="Kimlər üçün"
            title="Hər kəs üçün hazır"
            desc="Şagirddən administratora — hər istifadəçi öz interfeysi ilə."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {roles.map((r, i) => {
              const Icon = r.icon
              return (
                <RevealCard key={r.title} delay={i * 100}>
                  <div className="bg-white rounded-2xl p-8 h-full hover:-translate-y-1 transition-all duration-300 border border-gray-200 shadow-sm hover:shadow-md">
                    <div className="w-14 h-14 rounded-2xl bg-purple-light flex items-center justify-center mb-6">
                      <Icon className="w-7 h-7 text-purple" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-5">{r.title}</h3>
                    <ul className="space-y-3">
                      {r.items.map((item) => (
                        <li key={item} className="flex items-start gap-2.5">
                          <div className="w-5 h-5 rounded-full bg-teal-light flex items-center justify-center mt-0.5 flex-shrink-0">
                            <Check className="w-3 h-3 text-teal" />
                          </div>
                          <span className="text-sm text-gray-600 leading-snug">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </RevealCard>
              )
            })}
          </div>
        </div>
      </section>

      {/* ───── ZEKA ───── */}
      <section id="zeka" className="py-32 px-6 bg-white relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-purple-light/50 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-teal-light/60 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <RevealCard delay={0}>
              <div>
                <div className="inline-flex items-center gap-2 bg-purple-light border border-purple/20 rounded-full px-4 py-1.5 mb-6">
                  <Sparkles className="w-4 h-4 text-purple" />
                  <span className="text-xs font-medium text-purple">Claude ilə gücləndirilmiş</span>
                </div>
                <h2 className="font-serif text-5xl md:text-6xl text-gray-900 tracking-tight mb-6 leading-[1.05]">
                  Zəka ilə<br />
                  <span className="gradient-text">tanış olun</span>
                </h2>
                <p className="text-gray-500 leading-relaxed mb-8 text-lg">
                  Zəka — hər şagirdin şəxsi süni intellekt müəllimidir. Hər fənn üzrə
                  izahat verir, IB kriteriyalarına əsasən rəy yazır, öyrənməni fərdiləşdirir.
                </p>
                <ul className="space-y-4 mb-10">
                  {[
                    'Azərbaycan, ingilis və rus dillərində',
                    'IB MYP/DP və milli kurikulum üzrə',
                    'Müəllimlər üçün hesabat və rəy',
                    'Öyrənmə seriyası ilə motivasiya',
                    'Süni İntellekt Strategiyası 2025–2028 ilə tam uyğun',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-teal-light flex items-center justify-center flex-shrink-0">
                        <Check className="w-3.5 h-3.5 text-teal" />
                      </div>
                      <span className="text-sm text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/qeydiyyat"
                  className="group inline-flex items-center gap-2 bg-purple text-white rounded-full px-7 py-3.5 text-sm font-medium hover:bg-purple-dark transition-all shadow-md shadow-purple/30"
                >
                  Zəkanı sına
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </RevealCard>

            <RevealCard delay={200}>
              <div className="bg-white rounded-2xl overflow-hidden animate-float-slow border border-gray-200 shadow-xl shadow-purple/10">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple to-purple-mid flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Zəka</p>
                    <p className="text-[11px] text-gray-400">Riyaziyyat · Azərbaycanca</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
                    <span className="text-[10px] text-teal font-medium">Aktiv</span>
                  </div>
                </div>
                <div className="p-6 space-y-4 min-h-[320px] bg-white">
                  <div className="flex justify-end">
                    <div className="bg-purple-light border border-purple/20 rounded-2xl rounded-br-sm px-4 py-3 text-sm text-purple max-w-[80%]">
                      Kvadrat tənlikləri sadə dildə izah edə bilərsən?
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-purple-light flex items-center justify-center flex-shrink-0 mt-1">
                      <Sparkles className="w-3.5 h-3.5 text-purple" />
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-gray-700 max-w-[85%]">
                      <p className="mb-2">Əlbəttə! Gəl addım-addım izah edək:</p>
                      <p className="mb-2"><strong className="text-gray-900">Kvadrat tənlik</strong> — ax² + bx + c = 0 formasındadır.</p>
                      <p className="mb-2">Həll üçün <strong className="text-purple">diskriminant</strong> tapırıq:</p>
                      <p className="bg-purple-light border border-purple/10 rounded-lg px-3 py-2 font-mono text-xs text-purple">D = b² - 4ac</p>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-10 flex-wrap">
                    {['Davam et', 'Nümunə ver', 'Test sualları'].map((chip) => (
                      <span key={chip} className="bg-gray-100 border border-gray-200 rounded-full px-3 py-1.5 text-[11px] text-gray-500 cursor-pointer hover:text-purple hover:border-purple hover:bg-purple-light transition-colors">
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

      {/* ───── PRESIDENTIAL DECREE ───── */}
      <section className="py-24 px-6 bg-amber-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent" />

        <div className="max-w-5xl mx-auto relative z-10">
          <RevealCard delay={0}>
            <div className="bg-white rounded-2xl border border-amber-200 overflow-hidden shadow-lg shadow-amber-100/50">
              <div className="bg-gradient-to-r from-amber-100 to-amber-50 px-8 py-5 border-b border-amber-200 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-[10px] tracking-[0.2em] text-amber-700 uppercase font-semibold">Rəsmi Sənəd</span>
                <span className="text-amber-300 mx-2">·</span>
                <span className="text-[10px] text-amber-600">Azərbaycan Respublikası Prezidenti İlham Əliyev</span>
              </div>
              <div className="p-8 md:p-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                  <div>
                    <h3 className="font-serif text-3xl md:text-4xl text-gray-900 mb-5 leading-tight">
                      №530 saylı Fərman —<br />
                      <span className="gradient-text">Süni İntellekt Strategiyası 2025–2028</span>
                    </h3>
                    <p className="text-gray-500 leading-relaxed mb-6">
                      2025-ci ilin mart ayında imzalanmış bu tarixi fərman,
                      Azərbaycan Respublikasının rəqəmsal gələcəyini müəyyən edir.
                      Zirva bu strategiyanın təhsil sahəsindəki həyata keçiricisidir.
                    </p>
                    <div className="space-y-3.5">
                      {[
                        'Hər şagirdə fərdi süni intellekt müəllimi hüququ',
                        'Rəqəmsal məktəb infrastrukturunun qurulması',
                        'Dövlət-texnologiya tərəfdaşlığının genişləndirilməsi',
                        'Milli məlumat suverenliyinin qorunması',
                      ].map((item) => (
                        <div key={item} className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-amber-600" />
                          </div>
                          <span className="text-sm text-gray-700 leading-snug">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-8">
                    <Quote className="w-8 h-8 text-purple/20 mb-4" />
                    <p className="font-serif text-lg text-gray-700 leading-relaxed italic mb-6">
                      "Zirva olaraq biz bu strategiyanı təhsil sahəsində həyata keçirmək üçün
                      texnologiya, infrastruktur və hazırlıq baxımından tam hazırıq.
                      Hər məktəb. Hər şagird. Hər bölgə."
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple to-purple-mid flex items-center justify-center flex-shrink-0">
                        <span className="text-base font-semibold text-white">KG</span>
                      </div>
                      <div>
                        <p className="text-gray-900 font-semibold text-sm">Kaan Guluzada</p>
                        <p className="text-xs text-gray-400">Qurucusu, Zirva</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </RevealCard>
        </div>
      </section>

      {/* ───── STATS ───── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <RevealCard delay={0}>
            <p className="text-center text-[10px] text-gray-400 uppercase tracking-[0.2em] mb-14">Cari nəticələrimiz</p>
          </RevealCard>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { value: '12',    suffix: '',    label: 'Pilot Məktəb',   trend: '+3 bu rübdə',    icon: Building2, ic: 'text-purple',    bg: 'bg-purple-light'  },
              { value: '5247',  suffix: '+',   label: 'Aktiv Şagird',   trend: '+214 bu ay',     icon: GraduationCap, ic: 'text-teal',  bg: 'bg-teal-light'    },
              { value: '52841', suffix: '',    label: 'S.İ. Sessiyası', trend: '+8k bu həftə',   icon: Sparkles,  ic: 'text-purple',    bg: 'bg-purple-light'  },
              { value: '99',    suffix: '.9%', label: 'Uptime',         trend: 'Son 12 ay',      icon: Shield,    ic: 'text-amber-600', bg: 'bg-amber-50'      },
            ].map((s, i) => {
              const Icon = s.icon
              return (
                <RevealCard key={s.label} delay={i * 80}>
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center hover:-translate-y-1 transition-all duration-300">
                    <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center mx-auto mb-4`}>
                      <Icon className={`w-5 h-5 ${s.ic}`} />
                    </div>
                    <p className="font-serif text-4xl md:text-5xl text-gray-900 mb-1">
                      <Counter end={s.value} suffix={s.suffix} />
                    </p>
                    <p className="text-sm text-gray-500 mb-3">{s.label}</p>
                    <span className="text-[10px] text-teal bg-teal-light rounded-full px-2.5 py-1 font-medium">{s.trend}</span>
                  </div>
                </RevealCard>
              )
            })}
          </div>
        </div>
      </section>

      {/* ───── IMPACT DATA ───── */}
      <section className="py-32 px-6 bg-gray-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <RevealCard delay={0}>
            <div className="text-center mb-16">
              <span className="inline-block text-[10px] tracking-[0.2em] text-purple uppercase font-semibold mb-4 bg-purple-light rounded-full px-4 py-1.5">Pilot Nəticələr</span>
              <h2 className="font-serif text-4xl md:text-5xl text-gray-900 tracking-tight mb-4 leading-[1.1]">
                Ölçülə bilən<br />nəticələr
              </h2>
              <p className="text-gray-500 max-w-lg mx-auto">
                Pilot məktəblərdən toplanan real məlumatlar. Zirvanın tətbiqindən sonra qeydə alınan inkişaf.
              </p>
            </div>
          </RevealCard>

          {/* Row 1: Performance trend + Donut */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
            <div className="lg:col-span-2">
              <RevealCard delay={100}>
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm h-full">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Orta Akademik Performans</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">12 pilot məktəb · 2024–2025 tədris ili</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-teal">+20%</p>
                      <p className="text-[10px] text-gray-400">il ərzindəki artım</p>
                    </div>
                  </div>
                  <div className="relative">
                    <svg viewBox="0 0 480 160" className="w-full" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#534AB7" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#534AB7" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      {[40, 80, 120].map(y => (
                        <line key={y} x1="0" y1={y} x2="480" y2={y} stroke="#f3f4f6" strokeWidth="1" />
                      ))}
                      <path
                        d="M 0,107 L 44,97 L 88,96 L 132,83 L 176,78 L 220,67 L 264,72 L 308,56 L 352,50 L 396,60 L 440,44 L 480,37 L 480,160 L 0,160 Z"
                        fill="url(#perfGrad)"
                      />
                      <path
                        d="M 0,107 L 44,97 L 88,96 L 132,83 L 176,78 L 220,67 L 264,72 L 308,56 L 352,50 L 396,60 L 440,44 L 480,37"
                        fill="none" stroke="#534AB7" strokeWidth="2.5"
                        strokeLinejoin="round" strokeLinecap="round"
                      />
                      {[[0,107],[44,97],[88,96],[132,83],[176,78],[220,67],[264,72],[308,56],[352,50],[396,60],[440,44],[480,37]].map(([x,y],i) => (
                        <circle key={i} cx={x} cy={y} r="3.5" fill="#534AB7" />
                      ))}
                      <circle cx="480" cy="37" r="5" fill="#534AB7" />
                      <circle cx="480" cy="37" r="9" fill="#534AB7" fillOpacity="0.15" />
                    </svg>
                    <div className="flex justify-between mt-1 px-0.5">
                      {['Yan','Fev','Mar','Apr','May','İyn','İyl','Avq','Eyl','Okt','Noy','Dek'].map(m => (
                        <span key={m} className="text-[9px] text-gray-400">{m}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-6 mt-5 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-purple" />
                      <span className="text-[10px] text-gray-500">Orta qiymət (10 üzərindən)</span>
                    </div>
                    <div className="ml-auto flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-[10px] text-gray-400">Yanvar 2024</p>
                        <p className="text-sm font-bold text-gray-700">6.5</p>
                      </div>
                      <div className="text-gray-300 text-xs">→</div>
                      <div className="text-center">
                        <p className="text-[10px] text-gray-400">Dekabr 2024</p>
                        <p className="text-sm font-bold text-teal">7.8</p>
                      </div>
                    </div>
                  </div>
                </div>
              </RevealCard>
            </div>

            <div>
              <RevealCard delay={200}>
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm h-full">
                  <p className="text-sm font-semibold text-gray-900 mb-1">Əvvəl / Sonra</p>
                  <p className="text-[11px] text-gray-400 mb-5">Pilot məktəblərdə ölçülmüş dəyişim</p>
                  <div className="space-y-3.5">
                    {[
                      { metric: 'Orta qiymət',          before: '6.5/10', after: '7.8/10' },
                      { metric: 'Davamiyyət nisbəti',    before: '91%',    after: '94.2%'  },
                      { metric: 'Müəllim iş yükü',       before: '6 s/gün', after: '1.5 s/gün' },
                      { metric: 'Hesabat vaxtı',          before: '4 saat', after: '1 klik' },
                      { metric: 'Valideyn məmnunluğu',   before: '67%',    after: '89%'    },
                    ].map(row => (
                      <div key={row.metric}>
                        <p className="text-[9px] text-gray-400 uppercase tracking-wider mb-1">{row.metric}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-red-50 border border-red-100 rounded-lg px-2.5 py-1.5 text-center">
                            <span className="text-[11px] font-semibold text-red-400">{row.before}</span>
                          </div>
                          <span className="text-gray-300 text-xs flex-shrink-0">→</span>
                          <div className="flex-1 bg-teal-light border border-teal/20 rounded-lg px-2.5 py-1.5 text-center">
                            <span className="text-[11px] font-semibold text-teal">{row.after}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </RevealCard>
            </div>
          </div>

          {/* Row 2: Bar chart + Donut */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2">
              <RevealCard delay={250}>
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">S.İ. Sessiya Artımı</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">Aylıq Zəka istifadə dinamikası · 2024</p>
                    </div>
                    <span className="text-[10px] text-teal bg-teal-light border border-teal/20 rounded-full px-3 py-1 font-medium">↑ 29× artım</span>
                  </div>
                  <div className="flex items-end gap-1.5 h-32 mb-2">
                    {[
                      { m: 'Yan', v: 2000  },
                      { m: 'Fev', v: 4500  },
                      { m: 'Mar', v: 7000  },
                      { m: 'Apr', v: 11000 },
                      { m: 'May', v: 16000 },
                      { m: 'İyn', v: 22000 },
                      { m: 'İyl', v: 29000 },
                      { m: 'Avq', v: 35000 },
                      { m: 'Eyl', v: 41000 },
                      { m: 'Okt', v: 47000 },
                      { m: 'Noy', v: 52000 },
                      { m: 'Dek', v: 58000 },
                    ].map((d, i) => (
                      <div key={d.m} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full rounded-t-sm transition-all duration-500"
                          style={{
                            height: `${(d.v / 58000) * 100}%`,
                            background: i === 11
                              ? '#534AB7'
                              : i >= 8
                              ? 'rgba(83,74,183,0.55)'
                              : i >= 5
                              ? 'rgba(83,74,183,0.35)'
                              : 'rgba(83,74,183,0.18)',
                          }}
                        />
                        <span className="text-[8px] text-gray-400 leading-none">{d.m}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between pt-3 border-t border-gray-100">
                    <span className="text-[10px] text-gray-400">2024 Yanvar: <strong className="text-gray-600">2,000</strong> sessiya</span>
                    <span className="text-[10px] text-gray-400">2024 Dekabr: <strong className="text-purple">58,000</strong> sessiya</span>
                  </div>
                </div>
              </RevealCard>
            </div>

            <div>
              <RevealCard delay={350}>
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm h-full flex flex-col">
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-900">Məktəb Növü</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Pilot proqramda iştirak</p>
                  </div>
                  <div className="flex items-center justify-center flex-1 my-4">
                    <svg viewBox="0 0 160 160" className="w-36 h-36">
                      <circle cx="80" cy="80" r="60" fill="none" stroke="#f3f4f6" strokeWidth="24" />
                      <circle cx="80" cy="80" r="60" fill="none" stroke="#1D9E75" strokeWidth="24"
                        strokeDasharray="197 180" transform="rotate(-90 80 80)" strokeLinecap="butt" />
                      <circle cx="80" cy="80" r="60" fill="none" stroke="#534AB7" strokeWidth="24"
                        strokeDasharray="129 248" transform="rotate(101 80 80)" strokeLinecap="butt" />
                      <circle cx="80" cy="80" r="60" fill="none" stroke="#F59E0B" strokeWidth="24"
                        strokeDasharray="43 334" transform="rotate(227 80 80)" strokeLinecap="butt" />
                      <text x="80" y="74" textAnchor="middle" fill="#111827" fontSize="20" fontWeight="700">12</text>
                      <text x="80" y="91" textAnchor="middle" fill="#9ca3af" fontSize="10">məktəb</text>
                    </svg>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: 'Dövlət məktəbi',  pct: '53%', color: 'bg-teal'      },
                      { label: 'IB Dünya Məktəbi', pct: '35%', color: 'bg-purple'    },
                      { label: 'Xüsusi məktəb',    pct: '12%', color: 'bg-amber-400' },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${item.color}`} />
                          <span className="text-xs text-gray-600">{item.label}</span>
                        </div>
                        <span className="text-xs font-semibold text-gray-900">{item.pct}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </RevealCard>
            </div>
          </div>
        </div>
      </section>

      {/* ───── ABOUT ───── */}
      <section id="about" className="py-32 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <RevealCard delay={0}>
            <div className="text-center mb-16">
              <span className="inline-block text-[10px] tracking-[0.2em] text-purple uppercase font-semibold mb-4 bg-purple-light rounded-full px-4 py-1.5">Haqqımızda</span>
              <h2 className="font-serif text-4xl md:text-5xl text-gray-900 tracking-tight mb-4 leading-[1.1]">Niyə Zirva yaradıldı?</h2>
            </div>
          </RevealCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <RevealCard delay={100}>
              <div className="bg-purple-light border border-purple/15 rounded-2xl p-10">
                <div className="w-14 h-14 rounded-2xl bg-purple flex items-center justify-center mb-6 shadow-md shadow-purple/30">
                  <Landmark className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-serif text-2xl text-gray-900 mb-4">Dövlət məktəbləri geridə qalıb</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Azərbaycanda xüsusi və beynəlxalq məktəblər müasir texnologiyalardan istifadə edərkən,
                  dövlət məktəbləri hələ də köhnə üsullarla işləyir.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Zirvanın qurucusu <strong className="text-gray-900">Kaan Guluzada</strong> inanır ki,
                  hər bir Azərbaycan şagirdi — istər IB məktəbində, istər dövlət məktəbində oxusun —
                  eyni səviyyəli texnologiyaya layiqdir.
                </p>
              </div>
            </RevealCard>

            <RevealCard delay={200}>
              <div className="bg-white border border-gray-200 rounded-2xl p-10">
                <h3 className="font-serif text-2xl text-gray-900 mb-7">Misiya sütunlarımız</h3>
                <div className="space-y-7">
                  {[
                    { num: '01', title: 'Bərabər imkan',            desc: 'Hər məktəb — dövlət və ya xüsusi — eyni güclü alətlərə çıxış əldə edir.' },
                    { num: '02', title: 'Süni intellekt ilə təhsil', desc: 'Prezidentin S.İ. Strategiyası çərçivəsində hər şagirdə fərdi müəllim.'       },
                    { num: '03', title: 'Yerli həll',                desc: 'Azərbaycan üçün, Azərbaycanda yaradılmış. ASAN və E-Gov inteqrasiyası.'       },
                  ].map((item) => (
                    <div key={item.num} className="flex gap-5">
                      <span className="font-serif text-2xl text-purple/30 flex-shrink-0 w-8 pt-0.5">{item.num}</span>
                      <div>
                        <h4 className="text-gray-900 font-semibold mb-1">{item.title}</h4>
                        <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </RevealCard>
          </div>

          <RevealCard delay={300}>
            <div className="bg-purple-light border border-purple/15 rounded-2xl p-10 md:p-14 text-center max-w-3xl mx-auto">
              <Quote className="w-10 h-10 text-purple/30 mx-auto mb-6" />
              <p className="font-serif text-xl md:text-2xl text-gray-900 leading-relaxed mb-8">
                "Mən inanıram ki, texnologiya təhsildə bərabərlik yaradır. Bakının mərkəzindəki
                beynəlxalq məktəbin imkanları ilə rayondakı dövlət məktəbinin imkanları arasında
                uçurum olmamalıdır. Zirva bu uçurumu bağlamaq üçün yaradılıb."
              </p>
              <div className="flex items-center justify-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple to-purple-mid flex items-center justify-center shadow-md shadow-purple/30">
                  <span className="text-lg font-semibold text-white">KG</span>
                </div>
                <div className="text-left">
                  <p className="text-gray-900 font-semibold">Kaan Guluzada</p>
                  <p className="text-sm text-gray-500">Qurucusu, Zirva</p>
                </div>
              </div>
            </div>
          </RevealCard>
        </div>
      </section>

      {/* ───── WHY ───── */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="Fərqimiz"
            title="Niyə Zirva?"
            desc="Dünyada mövcud olan həllər yox, Azərbaycan üçün yaradılmış həll."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Globe,  title: 'Azərbaycana uyğun', desc: 'ASAN, E-Gov.az inteqrasiyası, Azərbaycan dili, milli kurikulum — yerli ehtiyaclara 100% uyğun.', bg: 'bg-purple-light', ic: 'text-purple'    },
              { icon: Shield, title: 'Təhlükəsiz',         desc: 'Rol əsaslı giriş nəzarəti, məlumat şifrələməsi, Supabase infrastrukturu. Məlumatlarınız qorunur.', bg: 'bg-teal-light',   ic: 'text-teal'      },
              { icon: Zap,    title: 'Sürətli',            desc: 'Real vaxt sinxronizasiya. Müəllim qiymət daxil edir — valideyn saniyələr ərzində görür.',            bg: 'bg-amber-50',    ic: 'text-amber-600' },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <RevealCard key={item.title} delay={i * 100}>
                  <div className="text-center p-8 bg-gray-50 rounded-2xl border border-gray-200 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                    <div className={`w-16 h-16 rounded-2xl ${item.bg} flex items-center justify-center mx-auto mb-6`}>
                      <Icon className={`w-8 h-8 ${item.ic}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">{item.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                </RevealCard>
              )
            })}
          </div>
        </div>
      </section>

      {/* ───── CTA ───── */}
      <section className="py-32 px-6 bg-gray-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-light/40 via-white to-teal-light/30 pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(83,74,183,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(83,74,183,0.04)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <RevealCard delay={0}>
            <span className="inline-block text-[10px] tracking-[0.2em] text-purple uppercase font-semibold mb-6 bg-purple-light rounded-full px-4 py-1.5">Növbəti Addım</span>
            <h2 className="font-serif text-5xl md:text-7xl text-gray-900 tracking-tight mb-6 leading-[1.02]">
              Birlikdə<br />quralım
            </h2>
            <p className="text-lg text-gray-500 mb-3 max-w-xl mx-auto leading-relaxed">
              Azərbaycanda rəqəmsal təhsilin gələcəyini birgə inşa etmək üçün
              Zirva komandası ilə əlaqə saxlayın.
            </p>
            <p className="text-sm text-purple/60 mb-12 tracking-wide">
              info@zekalo.az  ·  Bakı, Azərbaycan
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/qeydiyyat"
                className="group bg-gray-900 text-white rounded-full px-10 py-4 text-sm font-semibold hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg shadow-gray-900/20"
              >
                Platformu sına
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="mailto:info@zekalo.az"
                className="bg-white border border-gray-200 text-gray-700 rounded-full px-10 py-4 text-sm font-medium hover:border-purple hover:text-purple transition-all shadow-sm"
              >
                Yazın bizə
              </a>
            </div>
          </RevealCard>
        </div>
      </section>

      {/* ───── FOOTER ───── */}
      <footer className="border-t border-gray-200 py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div>
              <span className="font-serif text-2xl">
                <span className="text-gray-900">Zir</span>
                <span className="text-purple">va</span>
              </span>
              <p className="text-sm text-gray-400 mt-3 leading-relaxed">
                Azərbaycanda rəqəmsal məktəbin infrastrukturu
              </p>
              <p className="text-[10px] text-gray-300 mt-3 tracking-wide">
                S.İ. Strategiyası 2025–2028 uyğun
              </p>
            </div>
            <div>
              <p className="text-[10px] tracking-widest text-gray-400 uppercase mb-4">Platforma</p>
              <ul className="space-y-2.5">
                {['Xüsusiyyətlər', 'Nazirlik Paneli', 'Davamiyyət', 'Zəka'].map((l) => (
                  <li key={l}>
                    <button
                      onClick={() => scrollTo(l === 'Nazirlik Paneli' ? 'ministry' : l === 'Zəka' ? 'zeka' : 'features')}
                      className="text-sm text-gray-400 hover:text-gray-900 transition-colors"
                    >
                      {l}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] tracking-widest text-gray-400 uppercase mb-4">Məktəblər</p>
              <ul className="space-y-2.5">
                {['IB məktəbləri', 'Dövlət məktəbləri', 'MYP proqramı', 'DP proqramı'].map((l) => (
                  <li key={l}><span className="text-sm text-gray-400">{l}</span></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] tracking-widest text-gray-400 uppercase mb-4">Əlaqə</p>
              <ul className="space-y-2.5">
                <li><a href="mailto:info@zekalo.az" className="text-sm text-gray-400 hover:text-gray-900 transition-colors">info@zekalo.az</a></li>
                <li><span className="text-sm text-gray-400">Bakı, Azərbaycan</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-300">&copy; {new Date().getFullYear()} Zirva. Bütün hüquqlar qorunur.</p>
            <div className="flex gap-6">
              <span className="text-xs text-gray-300 hover:text-gray-500 transition-colors cursor-pointer">Məxfilik siyasəti</span>
              <span className="text-xs text-gray-300 hover:text-gray-500 transition-colors cursor-pointer">İstifadə şərtləri</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

/* ─── helpers ─── */

function SectionHeader({ badge, title, desc }) {
  const [ref, visible] = useReveal()
  return (
    <div
      ref={ref}
      className={`text-center mb-16 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      <span className="inline-block text-[10px] tracking-[0.2em] text-purple uppercase font-semibold mb-4 bg-purple-light rounded-full px-4 py-1.5">
        {badge}
      </span>
      <h2 className="font-serif text-4xl md:text-6xl text-gray-900 tracking-tight mb-4 leading-[1.1]">{title}</h2>
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
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}
