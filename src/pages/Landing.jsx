import { Link } from 'react-router-dom'
import { useState } from 'react'
import {
  BookOpen, Sparkles, MessageSquare, FileText, GraduationCap,
  Users, BarChart2, ArrowRight, Check, Shield, Globe, Menu, X,
  Building2, Lock, Clock, Award, ChevronDown, Bell, ClipboardList,
  PenLine, TrendingUp, Calendar, HeartHandshake, LayoutDashboard,
  Mail, HelpCircle, Layers, Star, Zap, CheckCircle, Sliders
} from 'lucide-react'
import { useLang } from '../contexts/LanguageContext'

/* ─── translations ─── */
const STR = {
  az: {
    nav_solutions: 'Həllər', nav_features: 'Xüsusiyyətlər', nav_zeka: 'Zəka AI',
    nav_resources: 'Resurslar', nav_pricing: 'Paketlər', nav_signin: 'Daxil ol', nav_demo: 'Demo al',

    hero_h1a: 'Məktəbinizi',
    hero_h1b: 'növbəti pilləyə qaldırın',
    hero_sub: 'IB dünya məktəbləri və Azərbaycan dövlət məktəbləri üçün — kurikulumdan kommunikasiyaya, qiymətləndirmədən hesabata hər şey bir platformada.',
    hero_cta1: 'Xüsusiyyətlərə bax', hero_cta2: 'Demo al',

    dash_school: 'Zirva Beynəlxalq Məktəbi', dash_welcome: 'Xoş gəlmisiniz, Admin',
    dash_students: 'Şagird', dash_avg_grade: 'Orta Qiymət', dash_attendance: 'Davamiyyət', dash_ai: 'AI Sessiya',
    dash_timetable: 'Bu günün cədvəli', dash_activity: 'Son fəaliyyət',
    dash_math: 'Riyaziyyat', dash_physics: 'Fizika', dash_english: 'İngilis dili',
    dash_ev1: 'Qiymət daxil edildi', dash_ev2: 'Davamiyyət qeyd edildi', dash_ev3: 'Yeni mesaj',

    trust_title: 'Aparıcı beynəlxalq məktəblərin etibarı',

    sol_badge: 'Həllər', sol_title: 'Hər Kurikulum Üçün Zirva+',
    sol_sub: 'IB dünya məktəblərindən Azərbaycan dövlət məktəblərinə — hər kurikulum çərçivəsi dəstəklənir.',
    sol_multi_t: 'Çox Kurikulumlu', sol_multi_d: 'Bütün əsas kurikulum çərçivələri üçün ümumi dəstək, inklüziv qiymətləndirmə və hesabat',
    sol_gov_t: 'Milli Kurikulum', sol_gov_d: 'Azərbaycan dövlət məktəbləri üçün xüsusi rejim, Nazirlik inteqrasiyası ilə',
    sol_dp_t: 'IB Diploma (DP)', sol_dp_d: 'DP Core idarəetməsi daxil olmaqla IB Diploma Proqramı üçün tam dəstək',
    sol_cp_t: 'IB Karyera (CP)', sol_cp_d: 'Karyerayla əlaqədar proqramı aparan məktəblər üçün',
    sol_myp_t: 'IB Orta İllər (MYP)', sol_myp_d: 'Tədqiqat proqramının birgə planlanması üçün tam dəstək',
    sol_pyp_t: 'IB İlk İllər (PYP)', sol_pyp_d: 'Kiçik yaşlı şagirdlər üçün eyni güclü dəstək',
    sol_cta: 'Daha çox',

    feat_badge: 'Xüsusiyyətlər', feat_title: 'Lazım olan hər şey.', feat_title_b: 'Lazım olmayan heç nə.',
    feat_sub: 'Kurikulumdan hesabata, qiymətləndirmədən AI müəlliminə — tam iş axını bir platformada.',
    tab_curriculum: 'Kurikulum', tab_teaching: 'Tədris', tab_assessment: 'Qiymətləndirmə',
    tab_reports: 'Hesabatlar', tab_attendance: 'Davamiyyət', tab_zeka: 'Zəka AI', tab_comms: 'Kommunikasiya',
    c1:'Birgə kurikulum planlaması', c2:'600+ daxili standart', c3:'Kurikulum uyğunluğu alətləri', c4:'IBIS inteqrasiyası: imtahan qeydiyyatı, e-kurs işi, CAS',
    t1:'Dərs planları və materiallar', t2:'Ev tapşırıqları idarəetməsi', t3:'Şagird irəliləyişinin izlənməsi', t4:'Zəka AI tədris köməkçisi',
    a1:'IB kriteriyaları (A–D şkalası)', a2:'Milli 10 ballıq qiymətləndirmə', a3:'Real vaxt sinxronizasiya', a4:'Şagird irəliləyiş analitikası',
    r1:'Nazirlik uyğunluqlu hesabatlar', r2:'E-Gov.az avtomatik ixracı', r3:'PDF, Excel formatında çıxış', r4:'IB Audit sənədləşməsi',
    at1:'Bir toxunuşla davamiyyət qeydiyyatı', at2:'Valideynlərə ani bildiriş', at3:'Davamiyyət trend analitikası', at4:'E-Gov.az uyğun hesabatlar',
    z1:'Azərbaycan, ingilis, rus dillərində', z2:'IB MYP/DP və milli kurikulum üzrə', z3:'Müəllimlər üçün AI hesabat köməkçisi', z4:'Claude AI ilə gücləndirilmiş',
    co1:'Müəllim-valideyn real vaxtda mesajlaşma', co2:'Məktəb miqyasında elanlar', co3:'Bildiriş idarəetməsi', co4:'Çoxdilli dəstək',
    feat_cta: 'Demo al',

    ben_badge: 'Üstünlüklər', ben_title: 'Daha Ağıllı Məktəb İdarəetməsi üçün Sadələşdirilmiş Həllər',
    ben_sub: 'Məktəb əməliyyatlarının hər tərəfini örtən vahid platforma. Fərdi dəstəqdən tutmuş sertifikasiyaya qədər hər aspekt sizin sürətlə inkişafınız üçün hazırlanmışdır.',
    b1t:'Səmərəlilik', b1d:'Parçalanmış alətləri bir güclü platformayla əvəz edin',
    b2t:'İcma Əlaqəsi', b2d:'Elanlar, irəliləyiş izləmə — valideyn, şagird, müəllim bir-biri ilə bağlı',
    b3t:'Mükəmməl Təhsil', b3d:'Kurikulum planlamasından şəhadətnaməyə qədər tam tədris yolunu',
    b4t:'Fərdiləşdirilə bilən', b4d:'Hər məktəbin xüsusi ehtiyaclarına uyğun elastik funksionallıq',
    b5t:'Çox Kurikulumlu', b5d:'Azərbaycanda mövcud ən geniş kurikulum kataloqu — IB + milli',
    b6t:'Dünya Standartlı Onboarding', b6d:'Birinci gündən tətbiq dəstəyi daxildir',
    b7t:'Standartlara Uyğunluq', b7d:'IB, CIS, BSO standartlarına uyğunluğu təmin edən alətlər',
    b8t:'2+ İllik Təcrübə', b8d:'Beynəlxalq və dövlət məktəblərini dərindən anlayan komanda',

    test_badge: 'Müştəri Rəyləri', test_title: 'Dünya Üzrə İstifadəçilərimizin Həqiqi Hekayələri',
    test_sub: 'Pilot proqramında iştirak edən məktəblərin həqiqi rəyləri.',
    test_read: 'Tam rəyi oxu',
    t1q: '"Zirva bizim üçün yeganə platformadır — həm IB, həm dövlət kurikulumunu bir yerdə əhatə edir. Tam paket."',
    t1n: 'Rauf Əliyev', t1r: 'İT Sistemləri Rəhbəri, Bakı Beynəlxalq Məktəbi',
    t2q: '"Zəka AI müəllimlərimizin həftəlik hesabat vaxtını 4 saatdan 20 dəqiqəyə endirdi. İnanılmaz nəticə."',
    t2n: 'Günel Hüseynova', t2r: 'Tədris Texnologiyaları Rəhbəri, Xəzər Universiteti Məktəbi',
    t3q: '"Proqramımızı irəli aparan vasitədir. DP koordinatoru olaraq Zirva olmadan işimi təsəvvür edə bilmirəm."',
    t3n: 'Nigar Qasımova', t3r: 'DP Koordinatoru, Dünya İB Məktəbi',

    int_badge: 'İnteqrasiyalar', int_title: 'Sevdiyiniz Alətlərlə İnteqrasiya Edin.',
    int_sub: 'Ən inteqrasiyalı məktəb texnologiya ekosistemini qururuq — tam vəziyyətdə işləyin. 50+ inteqrasiya artmaqdadır.',
    int_hub: 'Zirva hər şeyi birləşdirir',

    sec_badge: 'Təhlükəsizlik & Uyğunluq', sec_title: 'Məlumatlarınızı Qorumağa Sadiqik.',
    sec_sub: 'Beynəlxalq gizlilik qanunlarına uyğun yerli hosting, ISO/IEC 27001 sertifikatı və möhkəm fəlakəti bərpa protokolları vasitəsilə məlumat gizliliyini və etibarlılığını təmin edirik.',
    sec_explore: 'Daha çox',
    s1t:'Yerli Hosting', s1d:'Bütün məlumatlar Azərbaycan serverlərində yerli qanunlara uyğun saxlanılır',
    s2t:'ISO/IEC 27001', s2d:'Beynəlxalq məlumat təhlükəsizliyi idarəetmə standartı',
    s3t:'Məlumat Qorunması', s3d:'GDPR və Azərbaycan Məlumatların Qorunması Qanunu ilə tam uyğunluq',
    s4t:'Uşaq Təhlükəsizliyi', s4d:'24/7 izləmə, zərərli proqram skanı, ciddi giriş nəzarəti, fəlakəti bərpa planları',

    sup_badge: 'Dəstək', sup_title: 'Rəqibsiz Dəstək. Yanınızdayıq.',
    sup_sub: 'Hər gün, 24 saat, həftənin 7 günü. Suallarınız cavabsız qalmaz.',
    su1t:'E-poçt Dəstəyi', su1d:'Sürətli, etibarlı cavablar.', su1cta: 'Sorğu göndər',
    su2t:'Yardım Mərkəzi', su2d:'Axtarıla bilən öz-özünə xidmət bilik bazası.', su2cta: 'Daxil ol',

    cta_title: 'Zirva+\'ı əməldə görməyə hazırsınızmı?',
    cta_sub: 'Pilot proqrama qoşulun — texnologiya hazırdır.',
    cta_btn1: 'Satış ilə əlaqə', cta_btn2: 'Demo al →',

    foot_tagline: 'Azərbaycanda rəqəmsal məktəbin infrastrukturu',
    foot_col1: 'Zirva+ öyrənmə', foot_col2: 'Resurslar', foot_col3: 'Dəstək Mərkəzi', foot_col4: 'Şirkət',
    foot_rights: 'Bütün hüquqlar qorunur.',
    foot_privacy: 'Məxfilik', foot_terms: 'Şərtlər',
    fl1:'IB Diploma', fl2:'IB Karyera (CP)', fl3:'IB Orta İllər (MYP)', fl4:'IB İlk İllər (PYP)', fl5:'Dövlət Məktəbləri', fl6:'Mobil Tətbiq', fl7:'Onlayn İmtahanlar',
    fr1:'CEO Məktubu', fr2:'Resurs Kitabxanası', fr3:'Tədbirlər & Vebinarlar', fr4:'Blog', fr5:'Məhsul Portalı', fr6:'Müştəri Rəyləri', fr7:'Tez-Tez Soruşulan Suallar',
    fs1:'Premium Dəstək', fs2:'Yardım & Dəstək',
    fc1:'Haqqımızda', fc2:'Karyera', fc3:'Partnyorlar', fc4:'Əlaqə',
  },
  en: {
    nav_solutions: 'Solutions', nav_features: 'Features', nav_zeka: 'Zeka AI',
    nav_resources: 'Resources', nav_pricing: 'Explore Bundles', nav_signin: 'Sign In', nav_demo: 'Get a Demo',

    hero_h1a: 'Run Your School',
    hero_h1b: 'Smarter with Zirva',
    hero_sub: 'From curriculum to communication, assessment to reporting — everything your school needs in one powerful platform built for IB World Schools and Azerbaijani state schools.',
    hero_cta1: 'Explore Features', hero_cta2: 'Get a Demo',

    dash_school: 'Zirva International School', dash_welcome: 'Welcome back, Admin',
    dash_students: 'Students', dash_avg_grade: 'Avg Grade', dash_attendance: 'Attendance', dash_ai: 'AI Sessions',
    dash_timetable: "Today's Timetable", dash_activity: 'Recent Activity',
    dash_math: 'Mathematics', dash_physics: 'Physics', dash_english: 'English Language',
    dash_ev1: 'Grade submitted', dash_ev2: 'Attendance recorded', dash_ev3: 'New message',

    trust_title: 'Trusted by leading international schools',

    sol_badge: 'Solutions', sol_title: 'Zirva+ for Your Curriculum',
    sol_sub: 'Discover a flexible multi-curricula teaching and learning platform where curriculum management, lesson planning, assessment, communication, reporting and much more flow together effortlessly.',
    sol_multi_t: 'Multi-Curricula', sol_multi_d: 'General support for all major curriculum frameworks, inclusive assessment and reporting',
    sol_gov_t: 'National Curriculum', sol_gov_d: 'Dedicated mode for Azerbaijani public schools with Ministry integration',
    sol_dp_t: 'IB Diploma (DP)', sol_dp_d: 'Full IB Diploma Programme support including DP Core management',
    sol_cp_t: 'IB Career-Related (CP)', sol_cp_d: 'For schools running the Career-related Programme',
    sol_myp_t: 'IB Middle Years (MYP)', sol_myp_d: 'Collaborative Programme of Inquiry planning',
    sol_pyp_t: 'IB Primary Years (PYP)', sol_pyp_d: 'The same powerful support for younger students',
    sol_cta: 'Learn more',

    feat_badge: 'Features', feat_title: 'Everything You Need.', feat_title_b: "Nothing You Don't.",
    feat_sub: 'From curriculum to reporting, assessment to AI tutoring — complete workflow coverage on one platform.',
    tab_curriculum: 'Curriculum', tab_teaching: 'Teaching & Learning', tab_assessment: 'Assessment & Gradebook',
    tab_reports: 'Reports', tab_attendance: 'Attendance', tab_zeka: 'Zeka AI', tab_comms: 'Communications',
    c1:'Collaborative curriculum planning', c2:'600+ built-in standards to choose from', c3:'Curriculum alignment and coverage tools', c4:'IBIS integration: exam registration, e-coursework, CAS moderation',
    t1:'Lesson plans and teaching materials', t2:'Homework and assignment management', t3:'Student progress tracking', t4:'Zeka AI teaching assistant',
    a1:'IB criteria grading (A–D scale)', a2:'National 10-point grading scale', a3:'Real-time grade synchronisation', a4:'Student progress analytics',
    r1:'Ministry-compliant reports', r2:'Automatic E-Gov.az export', r3:'PDF and Excel output', r4:'IB Audit documentation',
    at1:'One-tap attendance recording', at2:'Instant parent notifications', at3:'Attendance trend analytics', at4:'E-Gov.az compliant reports',
    z1:'Available in Azerbaijani, English and Russian', z2:'Covers IB MYP/DP and national curriculum', z3:'AI report-writing assistant for teachers', z4:'Powered by Claude AI',
    co1:'Real-time teacher–parent messaging', co2:'School-wide announcements', co3:'Notification management', co4:'Multi-language support',
    feat_cta: 'Get a Demo',

    ben_badge: 'Benefits', ben_title: 'Streamlined Solutions for Smarter Learning and School Management',
    ben_sub: 'Unlock a world of opportunities with a learning platform that prioritises your success. From personalised support to industry-recognised certifications, every aspect is crafted to help you achieve your goals faster and more effectively.',
    b1t:'Efficiency', b1d:'Replace fragmented patchwork tools with one powerful platform',
    b2t:'Community Connection', b2d:'Announcements, progress tracking, keeping everyone in the loop',
    b3t:'Exceptional Education', b3d:'Manage the full teaching journey from curriculum planning to report cards',
    b4t:'Tailorable', b4d:"Flexible features to meet your school's specific student needs",
    b5t:'Multi-Curricula Delivery', b5d:'The largest curriculum catalogue in Azerbaijan — IB + national',
    b6t:'World-Class Onboarding & Ongoing Support Included', b6d:'Our tailored implementation ensures your school is ready and sees value from day one.',
    b7t:'Achieve and Demonstrate Educational Standards', b7d:'Our tools, guidance, and experts help you meet international standards like BSO and CIS.',
    b8t:'19+ Years of Experience', b8d:"We've an unrivalled understanding of the needs and expectations of international schools.",

    test_badge: 'Customer Stories', test_title: 'Real Stories From our Users Worldwide',
    test_sub: 'Real feedback from schools in our pilot programme.',
    test_read: 'Read case study',
    t1q: '"Zirva is the only platform that gives us the full package — IB and national curriculum covered in one place. Nothing else comes close."',
    t1n: 'Rauf Aliyev', t1r: 'IT Systems Leader, Baku International School',
    t2q: '"Zeka AI reduced our teachers\' weekly reporting time from 4 hours to 20 minutes. The results have been extraordinary."',
    t2n: 'Gunel Huseynova', t2r: 'Head of Ed Tech, Khazar University School',
    t3q: '"It\'s the vehicle that drives our programme. As a DP Coordinator, I can\'t imagine working without Zirva."',
    t3n: 'Nigar Gasimova', t3r: 'DP Coordinator, IB World School',

    int_badge: 'Integrations', int_title: 'Integrate With the Tools You Love, All in One Place.',
    int_sub: "We're building the most integrated school technology ecosystem so you can work in a state of flow. 50+ integrations & counting.",
    int_hub: 'Zirva connects everything',

    sec_badge: 'Security & Compliance', sec_title: "We're Committed to Keeping Your Data Safe and Secure.",
    sec_sub: 'Ensure data privacy and reliability through global hosting, ISO/GDPR certification, and robust continuity and disaster recovery protocols.',
    sec_explore: 'Explore more',
    s1t:'Global Hosting', s1d:'All data stored on Azerbaijani servers in compliance with local privacy law for all international operations.',
    s2t:'ISO/IEC 27001:2013 Compliance', s2d:'Organisation-wide commitment to robust information security and risk management practices.',
    s3t:'Data Protection', s3d:'Compliant with GDPR, Chinese Cybersecurity Law, and global data privacy regulations to safeguard all schools and over 30M.',
    s4t:'Safeguarding', s4d:'Strict access controls, malware scanning, 24/7 monitoring and disaster-ready plans ensure secure resilient operations anywhere, anytime.',

    sup_badge: 'Support', sup_title: "Unrivalled Support. We've Got You Covered.",
    sup_sub: "We're at your side, 24 hours a day, 7 days a week.",
    su1t:'Email Support', su1d:'Fast, reliable answers.', su1cta: 'Submit Request',
    su2t:'Help Centre', su2d:'Searchable resources, anytime.', su2cta: 'Go In',

    cta_title: 'Ready to See Zirva+ in Action?',
    cta_sub: 'Empower your school with curriculum, teaching and reporting.',
    cta_btn1: 'Contact Sales', cta_btn2: 'Get a Demo →',

    foot_tagline: 'The digital school infrastructure for Azerbaijan',
    foot_col1: 'Zirva+ for Learning', foot_col2: 'Resources', foot_col3: 'Support Centre', foot_col4: 'Company',
    foot_rights: 'All Rights Reserved.',
    foot_privacy: 'Privacy', foot_terms: 'Terms',
    fl1:'IB Diploma', fl2:'IB Career-Related', fl3:'IB Middle Years', fl4:'IB Primary Years', fl5:'Government Schools', fl6:'Mobile App', fl7:'Online Exams',
    fr1:'CEO Letter', fr2:'Resource Library', fr3:'Events & Webinars', fr4:'Blog', fr5:'Product Portal', fr6:'Customer Reviews', fr7:'FAQs',
    fs1:'Premium Support', fs2:'Help & Support',
    fc1:'About', fc2:'Careers', fc3:'Partners', fc4:'Contact',
  },
}

/* ─── Logo ─── */
function ZirvaLogo({ size = 32, invert = false }) {
  return (
    <img
      src="/logo.png"
      alt="Zirva"
      width={size}
      height={size}
      className="object-contain"
      style={invert ? { filter: 'brightness(0) invert(1)' } : undefined}
    />
  )
}

/* ─── Nav ─── */
function Nav({ s, lang, setLang }) {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <ZirvaLogo size={32} />
          <span className="font-serif text-xl text-gray-900 tracking-tight">Zirva</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-0.5">
          {[
            { label: s.nav_solutions, href: '#solutions' },
            { label: s.nav_features,  href: '#features' },
            { label: s.nav_zeka,      href: '#features' },
            { label: s.nav_resources, href: '#integrations' },
          ].map(({ label, href }) => (
            <a key={label} href={href} className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium rounded-lg hover:bg-gray-50 transition-colors">
              {label}
            </a>
          ))}
          <a href="#solutions" className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium rounded-lg hover:bg-gray-50 transition-colors">{s.nav_pricing}</a>
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <div className="flex items-center bg-gray-100 rounded-lg p-1 mr-1">
            {['az', 'en'].map(l => (
              <button key={l} onClick={() => setLang(l)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${lang === l ? 'bg-white text-purple shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <Link to="/daxil-ol" className="text-sm text-gray-600 hover:text-gray-900 font-medium px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">{s.nav_signin}</Link>
          <Link to="/qeydiyyat" className="bg-purple text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-purple-dark transition-colors shadow-sm">{s.nav_demo}</Link>
        </div>

        <button onClick={() => setOpen(v => !v)} className="lg:hidden p-2 text-gray-600 hover:text-gray-900">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-4">
          <div className="space-y-0.5 mb-4">
            {[
              { label: s.nav_solutions, href: '#solutions' },
              { label: s.nav_features,  href: '#features' },
              { label: s.nav_zeka,      href: '#features' },
              { label: s.nav_resources, href: '#integrations' },
              { label: s.nav_pricing,   href: '#solutions' },
            ].map(({ label, href }) => (
              <a key={label} href={href} onClick={() => setOpen(false)} className="block py-2.5 text-sm text-gray-700 font-medium px-2">{label}</a>
            ))}
          </div>
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-1">
              {['az', 'en'].map(l => (
                <button key={l} onClick={() => setLang(l)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${lang === l ? 'bg-purple text-white' : 'text-gray-400 border border-gray-200'}`}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Link to="/daxil-ol" className="text-sm text-gray-600 font-medium px-3 py-2">{s.nav_signin}</Link>
              <Link to="/qeydiyyat" className="bg-purple text-white text-sm font-semibold px-4 py-2 rounded-lg">{s.nav_demo}</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

/* ─── Hero ─── */
function DashboardMockup({ s, dark = false }) {
  const sideItems = [
    { icon: LayoutDashboard, label: 'Dashboard', active: true },
    { icon: BookOpen, label: s.tab_assessment, active: false },
    { icon: Calendar, label: s.tab_attendance, active: false },
    { icon: ClipboardList, label: s.tab_teaching, active: false },
    { icon: MessageSquare, label: s.tab_comms, active: false },
    { icon: Sparkles, label: s.tab_zeka, active: false },
  ]
  return (
    <div className="rounded-t-2xl overflow-hidden shadow-2xl" style={{ border: dark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #e5e7eb' }}>
      {/* Browser chrome */}
      <div className="bg-gray-100 px-4 py-2.5 flex items-center gap-3">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 bg-white rounded px-3 py-1 text-[11px] text-gray-400 text-center max-w-xs mx-auto">
          app.zirva.az/admin/dashboard
        </div>
      </div>

      {/* App layout */}
      <div className="flex bg-white" style={{ height: 420 }}>
        {/* Sidebar */}
        <div className="w-48 bg-white border-r border-gray-100 shrink-0 py-3 hidden sm:block">
          <div className="flex items-center gap-2 px-4 mb-5">
            <img src="/logo.png" alt="Zirva" width="20" height="20" className="object-contain" />
            <span className="font-serif text-sm font-bold text-gray-900">Zirva</span>
          </div>
          {sideItems.map(({ icon: Icon, label, active }) => (
            <div key={label} className={`flex items-center gap-2.5 mx-2 px-3 py-2 rounded-lg text-[11px] font-medium mb-0.5 ${active ? 'bg-purple-light text-purple' : 'text-gray-400'}`}>
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{label}</span>
            </div>
          ))}
        </div>

        {/* Main */}
        <div className="flex-1 bg-surface overflow-hidden flex flex-col">
          {/* Top bar */}
          <div className="bg-white border-b border-gray-100 px-4 py-2.5 flex items-center justify-between shrink-0">
            <div>
              <p className="text-[11px] font-semibold text-gray-900">{s.dash_welcome}</p>
              <p className="text-[10px] text-gray-400">{s.dash_school}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-teal animate-pulse" />
              <span className="text-[10px] text-teal font-medium">Live</span>
              <div className="w-7 h-7 bg-purple rounded-full flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">A</span>
              </div>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-4 gap-2.5 p-3">
            {[
              { label: s.dash_students, value: '342', trend: '+12', c: 'purple' },
              { label: s.dash_avg_grade, value: '7.8', trend: '↑0.4', c: 'teal' },
              { label: s.dash_attendance, value: '94%', trend: '↑2.1%', c: 'purple' },
              { label: s.dash_ai, value: '1.2k', trend: '+180', c: 'teal' },
            ].map(({ label, value, trend, c }) => (
              <div key={label} className="bg-white rounded-lg p-2.5 border border-border-soft">
                <p className="text-[9px] text-gray-400 truncate mb-0.5">{label}</p>
                <p className="text-base font-bold text-gray-900 leading-tight">{value}</p>
                <p className={`text-[9px] font-medium ${c === 'teal' ? 'text-teal' : 'text-purple'}`}>{trend}</p>
              </div>
            ))}
          </div>

          {/* Two panels */}
          <div className="grid grid-cols-2 gap-2.5 px-3 pb-3 flex-1 min-h-0">
            <div className="bg-white rounded-lg p-2.5 border border-border-soft overflow-hidden">
              <p className="text-[10px] font-semibold text-gray-600 mb-2">{s.dash_timetable}</p>
              {[
                { time: '09:00', subj: s.dash_math, rm: '301' },
                { time: '10:30', subj: s.dash_physics, rm: '202' },
                { time: '12:00', subj: s.dash_english, rm: '105' },
              ].map(({ time, subj, rm }) => (
                <div key={time} className="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-[9px] text-gray-400 w-8 shrink-0">{time}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-purple shrink-0" />
                  <span className="text-[10px] text-gray-700 flex-1 truncate">{subj}</span>
                  <span className="text-[9px] text-gray-400">{rm}</span>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-lg p-2.5 border border-border-soft overflow-hidden">
              <p className="text-[10px] font-semibold text-gray-600 mb-2">{s.dash_activity}</p>
              {[
                { ev: s.dash_ev1, t: '2m', ok: true },
                { ev: s.dash_ev2, t: '15m', ok: true },
                { ev: s.dash_ev3, t: '1h', ok: false },
              ].map(({ ev, t, ok }) => (
                <div key={ev} className="flex items-start gap-2 py-1.5 border-b border-gray-50 last:border-0">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${ok ? 'bg-teal-light' : 'bg-purple-light'}`}>
                    <span className={`text-[8px] font-bold ${ok ? 'text-teal' : 'text-purple'}`}>{ok ? '✓' : '✉'}</span>
                  </div>
                  <span className="text-[10px] text-gray-700 flex-1 truncate leading-tight pt-0.5">{ev}</span>
                  <span className="text-[9px] text-gray-400 shrink-0">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Hero({ s }) {
  return (
    <section
      className="relative overflow-hidden px-6 pt-20 pb-0"
      style={{ background: 'linear-gradient(160deg, #c7c2f5 0%, #a095ec 25%, #7b6fe0 55%, #534AB7 80%, #3730a3 100%)' }}
    >
      <div className="relative max-w-6xl mx-auto z-10">
        <div className="text-center mb-14">
          <h1
            className="font-serif font-bold text-[#1a0f3d] tracking-tight leading-[1.05] mb-7"
            style={{ fontSize: 'clamp(2.6rem, 7vw, 5.5rem)' }}
          >
            {s.hero_h1a}
            {s.hero_h1b && (
              <>
                <br />
                {s.hero_h1b}
              </>
            )}
          </h1>

          <p className="text-lg md:text-xl text-[#1a0f3d]/70 leading-relaxed max-w-2xl mx-auto mb-12">
            {s.hero_sub}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#features"
              className="border-2 border-[#1a0f3d]/40 text-[#1a0f3d] font-semibold rounded-full px-8 py-3.5 text-sm hover:bg-white/20 transition-colors"
            >
              {s.hero_cta1}
            </a>
            <Link
              to="/qeydiyyat"
              className="bg-[#1a0f3d] text-white font-semibold rounded-full px-8 py-3.5 text-sm hover:bg-[#0f0a26] transition-colors flex items-center gap-2 shadow-lg"
            >
              {s.hero_cta2}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Dashboard mockup — flush to section bottom */}
        <div style={{ perspective: '1200px' }}>
          <div style={{ transform: 'rotateX(6deg)', transformOrigin: 'top center' }} className="max-w-5xl mx-auto">
            <DashboardMockup s={s} />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Trust strip ─── */
function TrustStrip({ s }) {
  const items = ['IBO Certified', 'E-Gov.az', 'ASAN Xidmət', 'Google Workspace', 'Microsoft 365', 'Claude AI', 'Turnitin', 'ISO 27001']
  return (
    <div className="bg-white py-4 overflow-hidden relative">
      <style>{`@keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
      <div style={{ display:'flex', gap:'3rem', animation:'marquee 28s linear infinite', width:'max-content' }}>
        {[...items,...items].map((item,i)=>(
          <span key={i} className="flex items-center gap-2 text-gray-400 text-sm font-medium whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-purple/30 shrink-0" />{item}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ─── Solutions ─── */
function Solutions({ s }) {
  const items = [
    { icon: Layers,        t: s.sol_multi_t, d: s.sol_multi_d, c: 'purple' },
    { icon: Building2,     t: s.sol_gov_t,   d: s.sol_gov_d,   c: 'teal'   },
    { icon: GraduationCap, t: s.sol_dp_t,    d: s.sol_dp_d,    c: 'purple' },
    { icon: Award,         t: s.sol_cp_t,    d: s.sol_cp_d,    c: 'teal'   },
    { icon: BookOpen,      t: s.sol_myp_t,   d: s.sol_myp_d,   c: 'purple' },
    { icon: Users,         t: s.sol_pyp_t,   d: s.sol_pyp_d,   c: 'teal'   },
  ]
  return (
    <section id="solutions" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14">
          <div className="max-w-xl">
            <h2 className="font-serif text-gray-900 mb-3" style={{ fontSize:'clamp(1.75rem,3.5vw,2.75rem)' }}>{s.sol_title}</h2>
            <p className="text-gray-500 text-base leading-relaxed">{s.sol_sub}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(({ icon:Icon, t, d, c }) => (
            <a href="#features" key={t} className="group relative p-6 rounded-2xl bg-white border border-border-soft hover:border-purple/20 hover:shadow-2xl hover:shadow-purple/8 hover:-translate-y-1 transition-all duration-300 overflow-hidden block">
              <div className={`absolute top-0 left-5 right-5 h-0.5 rounded-b-full ${c==='teal' ? 'bg-teal' : 'bg-purple'}`} />
              <div className="mb-5">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${c==='teal' ? 'bg-teal-light' : 'bg-purple-light'}`}>
                  <Icon className={`w-5 h-5 ${c==='teal' ? 'text-teal' : 'text-purple'}`} />
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm leading-snug">{t}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{d}</p>
              <div className={`mt-4 flex items-center gap-1 text-xs font-semibold translate-y-1 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 ${c==='teal' ? 'text-teal' : 'text-purple'}`}>
                {s.sol_cta} <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Features ─── */
function FeatureVisual({ idx, s }) {
  if (idx === 0) return (
    <div className="space-y-2.5">
      {[
        { label: 'Unit 1 · Algebra', tags: ['MYP', 'DP'], pct: 85, c: 'teal' },
        { label: 'Unit 2 · Geometry', tags: ['MYP'], pct: 60, c: 'purple' },
        { label: 'Unit 3 · Statistics', tags: ['National'], pct: 40, c: 'teal' },
      ].map(({ label, tags, pct, c }) => (
        <div key={label} className="bg-surface rounded-xl p-3.5 border border-border-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-700 text-xs font-medium">{label}</span>
            <div className="flex gap-1">
              {tags.map(t => <span key={t} className="bg-purple-light text-purple text-[9px] px-1.5 py-0.5 rounded-md font-medium">{t}</span>)}
            </div>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full">
            <div className={`h-full rounded-full ${c === 'teal' ? 'bg-teal' : 'bg-purple'}`} style={{ width: `${pct}%` }} />
          </div>
          <p className="text-gray-400 text-[9px] mt-1">{pct}% coverage</p>
        </div>
      ))}
    </div>
  )
  if (idx === 2) return (
    <div className="space-y-1.5">
      <div className="bg-surface rounded-lg px-3 py-2 grid grid-cols-4 text-[9px] text-gray-400 font-semibold uppercase tracking-wide border border-border-soft">
        <span>Student</span><span>Crit. A</span><span>Crit. B</span><span>Grade</span>
      </div>
      {[
        { n: 'Aytən M.', a: '7', b: '6', g: '7', c: 'teal' },
        { n: 'Rauf A.', a: '5', b: '5', g: '5', c: 'purple' },
        { n: 'Günel H.', a: '8', b: '7', g: '8', c: 'teal' },
        { n: 'Nigar Q.', a: '6', b: '6', g: '6', c: 'purple' },
      ].map(({ n, a, b, g, c }) => (
        <div key={n} className="bg-white rounded-lg px-3 py-2 grid grid-cols-4 items-center border border-border-soft">
          <span className="text-gray-700 text-[10px] font-medium">{n}</span>
          <span className="text-gray-500 text-[10px]">{a}</span>
          <span className="text-gray-500 text-[10px]">{b}</span>
          <span className={`text-[10px] font-bold ${c === 'teal' ? 'text-teal' : 'text-purple'}`}>{g}</span>
        </div>
      ))}
    </div>
  )
  if (idx === 4) return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-400 text-[10px]">Today · 9A Mathematics</span>
        <span className="bg-teal-light text-teal text-[9px] font-semibold px-2 py-0.5 rounded-full">94%</span>
      </div>
      {[
        { n: 'Aytən M.', st: 'present', c: 'teal' },
        { n: 'Rauf A.', st: 'late', c: 'yellow' },
        { n: 'Günel H.', st: 'present', c: 'teal' },
        { n: 'Nigar Q.', st: 'absent', c: 'red' },
        { n: 'Kamran B.', st: 'present', c: 'teal' },
      ].map(({ n, st, c }) => (
        <div key={n} className="bg-white rounded-lg px-3 py-2 flex items-center justify-between border border-border-soft">
          <span className="text-gray-700 text-[10px] font-medium">{n}</span>
          <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
            c === 'teal' ? 'bg-teal-light text-teal'
            : c === 'yellow' ? 'bg-yellow-50 text-yellow-600'
            : 'bg-red-50 text-red-500'
          }`}>{st}</span>
        </div>
      ))}
    </div>
  )
  if (idx === 5) return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 bg-purple-light rounded-xl px-3 py-2.5 border border-purple/10">
        <div className="w-7 h-7 bg-purple rounded-full flex items-center justify-center shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
        <div>
          <p className="text-[9px] text-purple/60 font-medium">{s.tab_zeka}</p>
          <p className="text-purple text-[10px] leading-snug font-medium">Əlbəttə! Gəl addım-addım izah edək...</p>
        </div>
      </div>
      {[
        { label: 'Quadratic equations', sub: 'IB MYP · Mathematics', pct: 72 },
        { label: 'Essay feedback', sub: 'English Language & Lit', pct: 91 },
        { label: 'DP Core reflection', sub: 'CAS / TOK', pct: 55 },
      ].map(({ label, sub, pct }) => (
        <div key={label} className="bg-white rounded-xl px-3 py-2.5 border border-border-soft">
          <div className="flex items-center justify-between mb-1.5">
            <div>
              <p className="text-gray-700 text-[10px] font-medium">{label}</p>
              <p className="text-gray-400 text-[9px]">{sub}</p>
            </div>
            <span className="text-teal text-[9px] font-bold">{pct}%</span>
          </div>
          <div className="h-1 bg-gray-100 rounded-full">
            <div className="h-full bg-teal rounded-full" style={{ width: `${pct}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
  const icons = [BookOpen, PenLine, BarChart2, FileText, Clock, Sparkles, MessageSquare]
  const Icon = icons[idx] || BookOpen
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 py-8">
      <div className="w-20 h-20 rounded-2xl bg-purple-light flex items-center justify-center">
        <Icon className="w-10 h-10 text-purple/30" />
      </div>
      <div className="space-y-2 w-full">
        {[80, 60, 45, 70].map((w, i) => (
          <div key={i} className="h-2 bg-gray-100 rounded-full" style={{ width: `${w}%` }} />
        ))}
      </div>
    </div>
  )
}

function Features({ s }) {
  const [active, setActive] = useState(0)
  const tabs = [
    { label: s.tab_curriculum, icon: BookOpen, bullets: [s.c1, s.c2, s.c3, s.c4] },
    { label: s.tab_teaching, icon: PenLine, bullets: [s.t1, s.t2, s.t3, s.t4] },
    { label: s.tab_assessment, icon: BarChart2, bullets: [s.a1, s.a2, s.a3, s.a4] },
    { label: s.tab_reports, icon: FileText, bullets: [s.r1, s.r2, s.r3, s.r4] },
    { label: s.tab_attendance, icon: Clock, bullets: [s.at1, s.at2, s.at3, s.at4] },
    { label: s.tab_zeka, icon: Sparkles, bullets: [s.z1, s.z2, s.z3, s.z4] },
    { label: s.tab_comms, icon: MessageSquare, bullets: [s.co1, s.co2, s.co3, s.co4] },
  ]
  const cur = tabs[active]

  return (
    <section id="features" className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-serif text-gray-900 mb-4" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
            {s.feat_title} <span className="text-teal">{s.feat_title_b}</span>
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">{s.feat_sub}</p>
        </div>

        {/* Layout: sidebar nav + content card */}
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4 max-w-6xl mx-auto">
          {/* Left nav */}
          <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {tabs.map(({ label, icon: Icon }, i) => (
              <button
                key={label}
                onClick={() => setActive(i)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left whitespace-nowrap lg:whitespace-normal transition-all duration-150 shrink-0 w-full ${
                  active === i
                    ? 'bg-purple text-white shadow-lg shadow-purple/20'
                    : 'bg-white text-gray-500 hover:text-gray-900 border border-border-soft hover:border-purple/30'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active === i ? 'text-white' : 'text-purple'}`} />
                {label}
              </button>
            ))}
          </div>

          {/* Right card */}
          <div className="bg-white rounded-2xl border border-border-soft overflow-hidden shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Bullets */}
              <div className="p-8 lg:p-10">
                <div className="w-11 h-11 rounded-xl bg-purple-light flex items-center justify-center mb-6">
                  <cur.icon className="w-5 h-5 text-purple" />
                </div>
                <h3 className="font-serif text-2xl text-gray-900 mb-6">{cur.label}</h3>
                <ul className="space-y-3.5">
                  {cur.bullets.map(b => (
                    <li key={b} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-teal-light flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-teal" />
                      </div>
                      <span className="text-gray-600 text-sm leading-relaxed">{b}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/qeydiyyat" className="inline-flex items-center gap-2 mt-8 text-purple text-sm font-semibold hover:gap-3 transition-all group">
                  {s.feat_cta} <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
              {/* Visual */}
              <div className="bg-surface border-t lg:border-t-0 lg:border-l border-border-soft p-8 lg:p-10 flex flex-col justify-center">
                <FeatureVisual idx={active} s={s} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Benefits ─── */
function Benefits({ s }) {
  const items = [
    { icon: Zap,           t: s.b1t, d: s.b1d },
    { icon: HeartHandshake,t: s.b2t, d: s.b2d },
    { icon: GraduationCap, t: s.b3t, d: s.b3d },
    { icon: Sliders,       t: s.b4t, d: s.b4d },
    { icon: Layers,        t: s.b5t, d: s.b5d },
    { icon: CheckCircle,   t: s.b6t, d: s.b6d },
    { icon: Shield,        t: s.b7t, d: s.b7d },
    { icon: TrendingUp,    t: s.b8t, d: s.b8d },
  ]
  return (
    <section id="benefits" className="py-24 bg-[#0f0e2a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-16 items-start">
          <div className="lg:sticky lg:top-28">
            <h2 className="font-serif text-white mb-5 leading-tight" style={{ fontSize:'clamp(1.75rem,3vw,2.5rem)' }}>{s.ben_title}</h2>
            <p className="text-white/40 text-sm leading-relaxed mb-8">{s.ben_sub}</p>
            <Link to="/qeydiyyat" className="inline-flex items-center gap-2 bg-purple text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-purple-dark transition-colors shadow-lg shadow-purple/30">
              {s.feat_cta} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {items.map(({ icon:Icon, t, d }) => (
              <div key={t} className="group p-5 rounded-2xl bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.07] hover:border-white/[0.12] transition-all duration-200">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-purple/20 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-purple/30 transition-colors">
                    <Icon className="w-4 h-4 text-teal-mid" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm mb-1 leading-snug">{t}</h3>
                    <p className="text-white/40 text-xs leading-relaxed">{d}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}


/* ─── Integration logos ─── */
/* Microsoft — official 4-color squares (no separate PNG provided) */
function MicrosoftLogo() {
  return (
    <svg viewBox="0 0 21 21" width="42" height="42">
      <rect x="0" y="0" width="10" height="10" fill="#F35325"/>
      <rect x="11" y="0" width="10" height="10" fill="#81BC06"/>
      <rect x="0" y="11" width="10" height="10" fill="#05A6F0"/>
      <rect x="11" y="11" width="10" height="10" fill="#FFBA08"/>
    </svg>
  )
}

const INT_ITEMS = [
  { name: 'Microsoft',       Logo: () => <MicrosoftLogo /> },
  { name: 'Microsoft Excel', Logo: () => <img src="/excel.png"      alt="Excel"       width="44" height="44" className="object-contain" /> },
  { name: 'Claude AI',       Logo: () => <img src="/claude.png"     alt="Claude AI"   width="44" height="44" className="object-contain rounded-xl" /> },
  { name: 'E-Gov.az',        Logo: () => <img src="/egov.png"       alt="E-Gov.az"    width="44" height="44" className="object-contain" /> },
  { name: 'ASAN Xidmət',    Logo: () => <img src="/asanxidmet.png" alt="ASAN Xidmət" width="44" height="44" className="object-contain" /> },
  { name: 'Zoom',            Logo: () => <img src="/zoom.png"       alt="Zoom"        width="44" height="44" className="object-contain rounded-xl" /> },
]

function IntCard({ item: { name, Logo } }) {
  return (
    <div className="group flex flex-col items-center gap-3 bg-white rounded-2xl py-8 px-4 cursor-pointer transition-all duration-200 hover:-translate-y-1"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)' }}
      onMouseEnter={e => e.currentTarget.style.boxShadow='0 12px 32px rgba(83,74,183,0.15)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)'}>
      <div className="h-12 flex items-center justify-center"><Logo /></div>
      <span className="text-xs text-gray-500 font-medium text-center leading-tight group-hover:text-gray-800 transition-colors">{name}</span>
    </div>
  )
}

function Integrations({ s }) {
  return (
    <section id="integrations" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-serif text-gray-900 mb-4" style={{ fontSize:'clamp(1.75rem,3.5vw,2.75rem)' }}>{s.int_title}</h2>
          <p className="text-gray-500 text-base max-w-xl mx-auto leading-relaxed">{s.int_sub}</p>
        </div>
        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-3 bg-purple-light border border-purple/15 rounded-2xl px-6 py-3">
            <div className="w-8 h-8 bg-purple rounded-xl flex items-center justify-center shadow">
              <img src="/logo.png" alt="Zirva" width="18" height="18" className="object-contain" style={{ filter:'brightness(0) invert(1)' }} />
            </div>
            <span className="text-purple font-semibold text-sm">{s.int_hub}</span>
            <div className="w-2 h-2 rounded-full bg-teal animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {INT_ITEMS.map(item => <IntCard key={item.name} item={item} />)}
        </div>
      </div>
    </section>
  )
}

/* ─── Security ─── */
function Security({ s }) {
  const items = [
    { icon: Globe,  t: s.s1t, d: s.s1d },
    { icon: Shield, t: s.s2t, d: s.s2d },
    { icon: Lock,   t: s.s3t, d: s.s3d },
    { icon: Bell,   t: s.s4t, d: s.s4d },
  ]
  return (
    <section id="security" className="py-24 overflow-hidden" style={{ background:'linear-gradient(135deg,#0f0e2a 0%,#1a1350 55%,#0f0e2a 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-serif text-white mb-5 leading-tight" style={{ fontSize:'clamp(1.75rem,3vw,2.75rem)', lineHeight:1.2 }}>{s.sec_title}</h2>
            <p className="text-white/50 text-sm leading-relaxed mb-8 max-w-md">{s.sec_sub}</p>
            <div className="flex flex-wrap gap-2">
              {['ISO 27001','GDPR','E-Gov.az','SOC 2'].map(b=>(
                <span key={b} className="flex items-center gap-1.5 bg-white/5 border border-white/10 text-white/60 text-xs font-medium px-3 py-1.5 rounded-full">
                  <Check className="w-3 h-3 text-teal shrink-0" />{b}
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {items.map(({ icon:Icon, t, d }) => (
              <div key={t} className="group p-5 rounded-2xl bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.15] transition-all">
                <div className="w-10 h-10 rounded-xl bg-teal/15 flex items-center justify-center mb-4 group-hover:bg-teal/25 transition-colors">
                  <Icon className="w-5 h-5 text-teal" />
                </div>
                <h3 className="font-semibold text-white mb-1.5 text-sm leading-snug">{t}</h3>
                <p className="text-xs text-white/40 leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Support ─── */
function Support({ s }) {
  return (
    <section id="support" className="py-24 bg-surface">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="font-serif text-gray-900 mb-3" style={{ fontSize:'clamp(1.75rem,3.5vw,2.75rem)' }}>{s.sup_title}</h2>
          <p className="text-gray-500 text-base">{s.sup_sub}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            { icon:Mail,       t:s.su1t, d:s.su1d, cta:s.su1cta, href:'mailto:hello@birclick.az', accent:'purple' },
            { icon:HelpCircle, t:s.su2t, d:s.su2d, cta:s.su2cta, href:'https://zirva.az/help',   accent:'teal'   },
          ].map(({ icon:Icon, t, d, cta, href, accent }) => (
            <div key={t} className="group relative overflow-hidden p-8 rounded-2xl bg-white border border-border-soft hover:shadow-2xl hover:shadow-purple/8 hover:-translate-y-1 transition-all duration-300">
              <div className={`absolute top-0 left-0 right-0 h-1 ${accent==='teal' ? 'bg-gradient-to-r from-teal to-teal/30' : 'bg-gradient-to-r from-purple to-purple/30'}`} />
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${accent==='teal' ? 'bg-teal-light' : 'bg-purple-light'}`}>
                <Icon className={`w-7 h-7 ${accent==='teal' ? 'text-teal' : 'text-purple'}`} />
              </div>
              <h3 className="font-serif text-xl text-gray-900 mb-2">{t}</h3>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">{d}</p>
              <a href={href} className={`inline-flex items-center gap-2 text-sm font-semibold group/btn ${accent==='teal' ? 'text-teal' : 'text-purple'}`}>
                {cta} <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Closing CTA ─── */
function ClosingCTA({ s }) {
  return (
    <section style={{ background:'linear-gradient(135deg,#534AB7 0%,#3730a3 50%,#1a1040 100%)' }} className="py-28 overflow-hidden relative">
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-teal/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-serif text-white mb-6 leading-tight" style={{ fontSize:'clamp(2.5rem,5vw,4.5rem)', lineHeight:1.1 }}>
          {s.cta_title}
        </h2>
        <p className="text-white/60 text-xl mb-12 leading-relaxed max-w-2xl mx-auto">{s.cta_sub}</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="mailto:hello@birclick.az" className="border-2 border-white/30 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-colors text-sm">
            {s.cta_btn1}
          </a>
          <Link to="/qeydiyyat" className="bg-white text-purple font-semibold px-8 py-4 rounded-xl hover:bg-purple-light transition-colors text-sm shadow-2xl shadow-black/20">
            {s.cta_btn2}
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ─── Footer ─── */
function Footer({ s }) {
  return (
    <footer className="bg-[#0f0e2a] text-white/60 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <ZirvaLogo size={32} invert />
              <span className="font-serif text-xl text-white">Zirva</span>
            </div>
            <p className="text-xs text-white/40 leading-relaxed mb-3">{s.foot_tagline}</p>
            <a href="tel:+994502411442" className="flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors mb-3">
              <span className="text-teal">📞</span> +994 50 241 14 42
            </a>
            <a href="mailto:hello@birclick.az" className="flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors mb-4">
              <span className="text-teal">✉</span> hello@birclick.az
            </a>
            <p className="text-[10px] text-white/30">© 2026 Zirva LLC. {s.foot_rights}</p>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs tracking-wide uppercase mb-4">{s.foot_col1}</h4>
            <ul className="space-y-2.5">
              {[
                { label: s.fl1, to: '/ib-diploma' },
                { label: s.fl2, to: '/ib-career' },
                { label: s.fl3, to: '/ib-myp' },
                { label: s.fl4, to: '/ib-pyp' },
                { label: s.fl5, to: '/government-schools' },
                { label: s.fl6, to: '/mobile' },
                { label: s.fl7, to: '/online-exams' },
              ].map(({ label, to }) => (
                <li key={label}><Link to={to} className="hover:text-white transition-colors text-xs">{label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs tracking-wide uppercase mb-4">{s.foot_col2}</h4>
            <ul className="space-y-2.5">
              {[
                { label: s.fr1, to: '/ceo-letter' },
                { label: s.fr2, to: '/resources' },
                { label: s.fr3, to: '/events' },
                { label: s.fr4, to: '/blog' },
                { label: s.fr5, to: '/product-portal' },
                { label: s.fr6, to: '/reviews' },
                { label: s.fr7, to: '/faq' },
              ].map(({ label, to }) => (
                <li key={label}><Link to={to} className="hover:text-white transition-colors text-xs">{label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs tracking-wide uppercase mb-4">{s.foot_col3}</h4>
            <ul className="space-y-2.5">
              {[
                { label: s.fs1, to: '/premium-support' },
                { label: s.fs2, to: '/help' },
              ].map(({ label, to }) => (
                <li key={label}><Link to={to} className="hover:text-white transition-colors text-xs">{label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs tracking-wide uppercase mb-4">{s.foot_col4}</h4>
            <ul className="space-y-2.5">
              {[
                { label: s.fc1, to: '/about' },
                { label: s.fc2, to: '/careers' },
                { label: s.fc3, to: '/partners' },
                { label: s.fc4, to: '/contact' },
              ].map(({ label, to }) => (
                <li key={label}><Link to={to} className="hover:text-white transition-colors text-xs">{label}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="text-xs hover:text-white transition-colors">{s.foot_privacy}</Link>
            <Link to="/terms" className="text-xs hover:text-white transition-colors">{s.foot_terms}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ─── Main export ─── */
export default function Landing() {
  const { lang, setLang } = useLang()
  const s = STR[lang] || STR.az

  return (
    <div className="min-h-screen font-sans antialiased">
      <Nav s={s} lang={lang} setLang={setLang} />
      <Hero s={s} />
      <TrustStrip s={s} />
      <Solutions s={s} />
      <Features s={s} />
      <Benefits s={s} />
      <Integrations s={s} />
      <Security s={s} />
      <Support s={s} />
      <ClosingCTA s={s} />
      <Footer s={s} />
    </div>
  )
}
