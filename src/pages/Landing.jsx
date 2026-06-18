import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import {
  BookOpen, Sparkles, MessageSquare, FileText, GraduationCap,
  Users, BarChart2, ArrowRight, Check, Shield, Globe, Menu, X,
  Building2, Lock, Clock, Award, Bell, ClipboardList, ClipboardCheck,
  PenLine, TrendingUp, Calendar, HeartHandshake, LayoutDashboard,
  Mail, HelpCircle, Layers, Zap, CheckCircle, Sliders, Phone,
  Server, ChevronRight
} from 'lucide-react'
import { useLang } from '../contexts/LanguageContext'
import LandingNav from '../components/layout/LandingNav'
import { useSEO } from '../hooks/useSEO'
import CountUp from '../components/ui/CountUp'
import Mascot from '../components/ui/Mascot'

/* ─── translations ─── */
const STR = {
  az: {
    isAz: true, lang: 'az',
    nav_solutions: 'Həllər', nav_features: 'Xüsusiyyətlər', nav_zeka: 'Zəka AI',
    nav_resources: 'Resurslar', nav_pricing: 'Paketlər', nav_signin: 'Daxil ol', nav_demo: 'Bizimlə Əlaqə',
    hero_h1a: 'Azərbaycan məktəblərini', hero_h1b: 'rəqəmsallaşdırırıq',
    hero_sub: 'Kurikulumdan hesabata, qiymətləndirmədən kommunikasiyaya. Hər şey bir platformada.',
    hero_cta1: 'Xüsusiyyətlərə bax', hero_cta2: 'Bizimlə Əlaqə',
    dash_school: 'Zirva Beynəlxalq Məktəbi', dash_welcome: 'Xoş gəlmisiniz, Admin',
    dash_students: 'Şagird', dash_avg_grade: 'Orta Qiymət', dash_attendance: 'Davamiyyət', dash_ai: 'AI Sessiya',
    dash_timetable: 'Bu günün cədvəli', dash_activity: 'Son fəaliyyət',
    dash_math: 'Riyaziyyat', dash_physics: 'Fizika', dash_english: 'İngilis dili',
    dash_ev1: 'Qiymət daxil edildi', dash_ev2: 'Davamiyyət qeyd edildi', dash_ev3: 'Yeni mesaj',
    trust_title: 'Maliyyəçilər & Tərəfdaşlar',
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
    feat_cta: 'Bizimlə Əlaqə',
    ben_badge: 'Üstünlüklər', ben_title: 'Daha Ağıllı Məktəb İdarəetməsi',
    ben_sub: 'Məktəb əməliyyatlarının hər tərəfini örtən vahid platforma.',
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
    t1q: '"Zirva bizim üçün yeganə platformadır — həm IB, həm dövlət kurikulumunu bir yerdə əhatə edir."',
    t1n: 'Rauf Əliyev', t1r: 'İT Sistemləri Rəhbəri, Bakı Beynəlxalq Məktəbi',
    t2q: '"Zəka AI müəllimlərimizin həftəlik hesabat vaxtını 4 saatdan 20 dəqiqəyə endirdi."',
    t2n: 'Günel Hüseynova', t2r: 'Tədris Texnologiyaları Rəhbəri, Xəzər Universiteti Məktəbi',
    t3q: '"DP koordinatoru olaraq Zirva olmadan işimi təsəvvür edə bilmirəm."',
    t3n: 'Nigar Qasımova', t3r: 'DP Koordinatoru, Dünya İB Məktəbi',
    int_badge: 'İnteqrasiyalar', int_title: 'Sevdiyiniz Alətlərlə İnteqrasiya Edin.',
    int_sub: '50+ inteqrasiya artmaqdadır.', int_hub: 'Zirva hər şeyi birləşdirir',
    sec_badge: 'Təhlükəsizlik & Uyğunluq', sec_title: 'Məlumatlarınızı Qorumağa Sadiqik.',
    sec_sub: 'Yerli hosting, ISO/IEC 27001 sertifikatı və möhkəm bərpa protokolları ilə məlumat gizliliyini təmin edirik.',
    sec_explore: 'Daha çox',
    s1t:'Yerli Hosting', s1d:'Bütün məlumatlar Azərbaycan serverlərində yerli qanunlara uyğun saxlanılır',
    s2t:'ISO/IEC 27001', s2d:'Beynəlxalq məlumat təhlükəsizliyi idarəetmə standartı',
    s3t:'Məlumat Qorunması', s3d:'GDPR və Azərbaycan Məlumatların Qorunması Qanunu ilə tam uyğunluq',
    s4t:'Uşaq Təhlükəsizliyi', s4d:'24/7 izləmə, ciddi giriş nəzarəti, fəlakəti bərpa planları',
    sup_badge: 'Dəstək', sup_title: 'Rəqibsiz Dəstək.',
    sup_sub: 'Hər gün, 24 saat, həftənin 7 günü.',
    su1t:'E-poçt Dəstəyi', su1d:'Sürətli, etibarlı cavablar.', su1cta: 'Sorğu göndər',
    su2t:'Yardım Mərkəzi', su2d:'Axtarıla bilən öz-özünə xidmət bilik bazası.', su2cta: 'Daxil ol',
    cta_title: 'Zirva+\'ı əməldə görməyə hazırsınızmı?',
    cta_sub: 'Pilot proqrama qoşulun — texnologiya hazırdır.',
    cta_btn1: 'Satış ilə əlaqə', cta_btn2: 'Bizimlə Əlaqə →',
    foot_tagline: 'Azərbaycanda rəqəmsal məktəbin infrastrukturu',
    foot_col1: 'Zirva+ öyrənmə', foot_col2: 'Resurslar', foot_col3: 'Dəstək Mərkəzi', foot_col4: 'Şirkət',
    foot_rights: 'Bütün hüquqlar qorunur.',
    foot_privacy: 'Məxfilik', foot_terms: 'Şərtlər',
    fl1:'IB İlk İllər (PYP)', fl2:'IB Orta İllər (MYP)', fl3:'IB Diploma (DP)', fl4:'IB Karyera (CP)', fl5:'Dövlət Məktəbləri', fl6:'Mobil Tətbiq', fl7:'Onlayn İmtahanlar',
    fr1:'CEO Məktubu', fr2:'Resurs Kitabxanası', fr3:'Tədbirlər & Vebinarlar', fr4:'Blog', fr5:'Məhsul Portalı', fr6:'Müştəri Rəyləri', fr7:'Tez-Tez Soruşulan Suallar',
    fs1:'Premium Dəstək', fs2:'Yardım & Dəstək',
    fc1:'Haqqımızda', fc2:'Karyera', fc3:'Partnyorlar', fc4:'Əlaqə',
  },
  en: {
    isAz: false, lang: 'en',
    nav_solutions: 'Solutions', nav_features: 'Features', nav_zeka: 'Zeka AI',
    nav_resources: 'Resources', nav_pricing: 'Explore Bundles', nav_signin: 'Sign In', nav_demo: 'Contact Us',
    hero_h1a: "Digitalizing", hero_h1b: "Azerbaijan's schools",
    hero_sub: 'Curriculum to reporting, assessment to communication. Everything your school needs, in one platform.',
    hero_cta1: 'Explore Features', hero_cta2: 'Contact Us',
    dash_school: 'Zirva International School', dash_welcome: 'Welcome back, Admin',
    dash_students: 'Students', dash_avg_grade: 'Avg Grade', dash_attendance: 'Attendance', dash_ai: 'AI Sessions',
    dash_timetable: "Today's Timetable", dash_activity: 'Recent Activity',
    dash_math: 'Mathematics', dash_physics: 'Physics', dash_english: 'English Language',
    dash_ev1: 'Grade submitted', dash_ev2: 'Attendance recorded', dash_ev3: 'New message',
    trust_title: 'Funders & Partners',
    sol_badge: 'Solutions', sol_title: 'Zirva+ for Your Curriculum',
    sol_sub: 'Discover a flexible multi-curricula platform where curriculum management, lesson planning, assessment, communication and reporting flow together effortlessly.',
    sol_multi_t: 'Multi-Curricula', sol_multi_d: 'General support for all major curriculum frameworks, inclusive assessment and reporting',
    sol_gov_t: 'National Curriculum', sol_gov_d: 'Dedicated mode for Azerbaijani public schools with Ministry integration',
    sol_dp_t: 'IB Diploma (DP)', sol_dp_d: 'Full IB Diploma Programme support including DP Core management',
    sol_cp_t: 'IB Career-Related (CP)', sol_cp_d: 'For schools running the Career-related Programme',
    sol_myp_t: 'IB Middle Years (MYP)', sol_myp_d: 'Collaborative Programme of Inquiry planning',
    sol_pyp_t: 'IB Primary Years (PYP)', sol_pyp_d: 'The same powerful support for younger students',
    sol_cta: 'Learn more',
    feat_badge: 'Features', feat_title: 'Everything You Need.', feat_title_b: "Nothing You Don't.",
    feat_sub: 'From curriculum to reporting, assessment to AI — complete workflow coverage on one platform.',
    tab_curriculum: 'Curriculum', tab_teaching: 'Teaching & Learning', tab_assessment: 'Assessment & Gradebook',
    tab_reports: 'Reports', tab_attendance: 'Attendance', tab_zeka: 'Zeka AI', tab_comms: 'Communications',
    c1:'Collaborative curriculum planning', c2:'600+ built-in standards', c3:'Curriculum alignment tools', c4:'IBIS integration: exam registration, e-coursework, CAS',
    t1:'Lesson plans and teaching materials', t2:'Homework and assignment management', t3:'Student progress tracking', t4:'Zeka AI teaching assistant',
    a1:'IB criteria grading (A–D scale)', a2:'National 10-point grading scale', a3:'Real-time grade synchronisation', a4:'Student progress analytics',
    r1:'Ministry-compliant reports', r2:'Automatic E-Gov.az export', r3:'PDF and Excel output', r4:'IB Audit documentation',
    at1:'One-tap attendance recording', at2:'Instant parent notifications', at3:'Attendance trend analytics', at4:'E-Gov.az compliant reports',
    z1:'Available in Azerbaijani, English and Russian', z2:'Covers IB MYP/DP and national curriculum', z3:'AI report-writing assistant for teachers', z4:'Powered by Claude AI',
    co1:'Real-time teacher–parent messaging', co2:'School-wide announcements', co3:'Notification management', co4:'Multi-language support',
    feat_cta: 'Contact Us',
    ben_badge: 'Benefits', ben_title: 'Smarter School Management',
    ben_sub: 'One platform covering every aspect of school operations.',
    b1t:'Efficiency', b1d:'Replace fragmented patchwork tools with one powerful platform',
    b2t:'Community Connection', b2d:'Announcements, progress tracking, keeping everyone in the loop',
    b3t:'Exceptional Education', b3d:'Manage the full teaching journey from curriculum planning to report cards',
    b4t:'Tailorable', b4d:"Flexible features to meet your school's specific needs",
    b5t:'Multi-Curricula Delivery', b5d:'The largest curriculum catalogue in Azerbaijan — IB + national',
    b6t:'World-Class Onboarding', b6d:'Our tailored implementation ensures your school sees value from day one.',
    b7t:'Educational Standards', b7d:'Our tools help you meet international standards like BSO and CIS.',
    b8t:'Expert Team', b8d:"Deep understanding of international and state school needs.",
    test_badge: 'Customer Stories', test_title: 'Real Stories From our Users',
    test_sub: 'Real feedback from schools in our pilot programme.',
    test_read: 'Read case study',
    t1q: '"Zirva is the only platform that gives us the full package — IB and national curriculum in one place."',
    t1n: 'Rauf Aliyev', t1r: 'IT Systems Leader, Baku International School',
    t2q: '"Zeka AI reduced our teachers\' weekly reporting time from 4 hours to 20 minutes."',
    t2n: 'Gunel Huseynova', t2r: 'Head of Ed Tech, Khazar University School',
    t3q: '"As a DP Coordinator, I can\'t imagine working without Zirva."',
    t3n: 'Nigar Gasimova', t3r: 'DP Coordinator, IB World School',
    int_badge: 'Integrations', int_title: 'Integrate With the Tools You Love.',
    int_sub: "Building the most integrated school technology ecosystem. 50+ integrations & counting.",
    int_hub: 'Zirva connects everything',
    sec_badge: 'Security & Compliance', sec_title: "We're Committed to Keeping Your Data Safe.",
    sec_sub: 'Local hosting, ISO/GDPR certification, and robust continuity protocols ensure your data is always protected.',
    sec_explore: 'Explore more',
    s1t:'Local Hosting', s1d:'All data stored on Azerbaijani servers in compliance with local privacy law.',
    s2t:'ISO/IEC 27001', s2d:'Organisation-wide commitment to robust information security practices.',
    s3t:'Data Protection', s3d:'Compliant with GDPR and Azerbaijani Data Protection Law.',
    s4t:'Safeguarding', s4d:'Strict access controls, malware scanning, 24/7 monitoring and disaster-ready plans.',
    sup_badge: 'Support', sup_title: "Unrivalled Support.",
    sup_sub: "We're at your side, 24 hours a day, 7 days a week.",
    su1t:'Email Support', su1d:'Fast, reliable answers.', su1cta: 'Submit Request',
    su2t:'Help Centre', su2d:'Searchable resources, anytime.', su2cta: 'Go In',
    cta_title: 'Ready to See Zirva+ in Action?',
    cta_sub: 'Empower your school with curriculum, teaching and reporting.',
    cta_btn1: 'Contact Sales', cta_btn2: 'Contact Us →',
    foot_tagline: 'The digital school infrastructure for Azerbaijan',
    foot_col1: 'Zirva+ for Learning', foot_col2: 'Resources', foot_col3: 'Support Centre', foot_col4: 'Company',
    foot_rights: 'All Rights Reserved.',
    foot_privacy: 'Privacy', foot_terms: 'Terms',
    fl1:'IB Primary Years (PYP)', fl2:'IB Middle Years (MYP)', fl3:'IB Diploma (DP)', fl4:'IB Career-Related (CP)', fl5:'Government Schools', fl6:'Mobile App', fl7:'Online Exams',
    fr1:'CEO Letter', fr2:'Resource Library', fr3:'Events & Webinars', fr4:'Blog', fr5:'Product Portal', fr6:'Customer Reviews', fr7:'FAQs',
    fs1:'Premium Support', fs2:'Help & Support',
    fc1:'About', fc2:'Careers', fc3:'Partners', fc4:'Contact',
  },
  tr: {
    isAz: false, lang: 'tr',
    nav_solutions: 'Çözümler', nav_features: 'Özellikler', nav_zeka: 'Zeka AI',
    nav_resources: 'Kaynaklar', nav_pricing: 'Paketler', nav_signin: 'Giriş yap', nav_demo: 'Bize Ulaşın',
    hero_h1a: "Azerbaycan okullarını", hero_h1b: 'dijitalleştiriyoruz',
    hero_sub: 'Müfredattan raporlamaya, değerlendirmeden iletişime. Okulunuzun ihtiyacı olan her şey tek platformda.',
    hero_cta1: 'Özelliklere bak', hero_cta2: 'Bize Ulaşın',
    dash_school: 'Zirva Uluslararası Okulu', dash_welcome: 'Hoş geldiniz, Yönetici',
    dash_students: 'Öğrenci', dash_avg_grade: 'Ort. Not', dash_attendance: 'Devam', dash_ai: 'AI Oturumu',
    dash_timetable: 'Bugünün Programı', dash_activity: 'Son Aktivite',
    dash_math: 'Matematik', dash_physics: 'Fizik', dash_english: 'İngilizce',
    dash_ev1: 'Not girildi', dash_ev2: 'Devam kaydedildi', dash_ev3: 'Yeni mesaj',
    trust_title: 'Finansörler & Ortaklar',
    sol_badge: 'Çözümler', sol_title: 'Her Müfredat İçin Zirva+',
    sol_sub: 'IB dünya okullarından Azerbaycan devlet okullarına — her müfredat çerçevesi desteklenmektedir.',
    sol_multi_t: 'Çok Müfredatlı', sol_multi_d: 'Tüm ana müfredat çerçeveleri için genel destek, kapsayıcı değerlendirme ve raporlama',
    sol_gov_t: 'Ulusal Müfredat', sol_gov_d: 'Bakanlık entegrasyonuyla Azerbaycan devlet okulları için özel mod',
    sol_dp_t: 'IB Diploma (DP)', sol_dp_d: 'DP Core yönetimi dahil IB Diploma Programı için tam destek',
    sol_cp_t: 'IB Kariyer (CP)', sol_cp_d: 'Kariyer odaklı programı yürüten okullar için',
    sol_myp_t: 'IB Orta Yıllar (MYP)', sol_myp_d: 'Araştırma programının ortak planlanması için tam destek',
    sol_pyp_t: 'IB İlk Yıllar (PYP)', sol_pyp_d: 'Küçük öğrenciler için aynı güçlü destek',
    sol_cta: 'Daha fazla',
    feat_badge: 'Özellikler', feat_title: 'İhtiyacınız olan her şey.', feat_title_b: 'İhtiyacınız olmayan hiçbir şey.',
    feat_sub: 'Müfredattan raporlamaya, değerlendirmeden AI öğretmenine — tam iş akışı tek platformda.',
    tab_curriculum: 'Müfredat', tab_teaching: 'Öğretim & Öğrenim', tab_assessment: 'Değerlendirme & Notlar',
    tab_reports: 'Raporlar', tab_attendance: 'Devam', tab_zeka: 'Zeka AI', tab_comms: 'İletişim',
    c1:'Ortak müfredat planlaması', c2:'600+ yerleşik standart', c3:'Müfredat uyum araçları', c4:'IBIS entegrasyonu: sınav kaydı, e-ödev, CAS',
    t1:'Ders planları ve öğretim materyalleri', t2:'Ödev yönetimi', t3:'Öğrenci ilerleme takibi', t4:'Zeka AI öğretim asistanı',
    a1:'IB kriter notlandırma (A–D ölçeği)', a2:'Ulusal 10 puanlık notlandırma', a3:'Gerçek zamanlı senkronizasyon', a4:'Öğrenci ilerleme analitiği',
    r1:'Bakanlık uyumlu raporlar', r2:'E-Gov.az otomatik dışa aktarma', r3:'PDF ve Excel çıktısı', r4:'IB Denetim belgelendirmesi',
    at1:'Tek dokunuşta devam kaydı', at2:'Ebeveynlere anında bildirim', at3:'Devam trend analitiği', at4:'E-Gov.az uyumlu raporlar',
    z1:'Azerbaycanca, İngilizce ve Rusça dillerinde', z2:'IB MYP/DP ve ulusal müfredat kapsamında', z3:'Öğretmenler için AI rapor asistanı', z4:'Claude AI ile güçlendirilmiş',
    co1:'Gerçek zamanlı öğretmen–veli mesajlaşma', co2:'Okul genelinde duyurular', co3:'Bildirim yönetimi', co4:'Çok dilli destek',
    feat_cta: 'Bize Ulaşın',
    ben_badge: 'Avantajlar', ben_title: 'Daha Akıllı Okul Yönetimi',
    ben_sub: 'Okul operasyonlarının her yönünü kapsayan tek platform.',
    b1t:'Verimlilik', b1d:'Dağınık araçları güçlü tek bir platformla değiştirin',
    b2t:'Topluluk Bağlantısı', b2d:'Duyurular ve ilerleme takibi — veli, öğrenci, öğretmen birbirine bağlı',
    b3t:'Mükemmel Eğitim', b3d:'Müfredat planlamasından diploma sertifikasına tam öğretim yolculuğu',
    b4t:'Özelleştirilebilir', b4d:'Okulunuzun özel ihtiyaçlarına uygun esnek işlevsellik',
    b5t:'Çok Müfredatlı', b5d:"Azerbaycan'da mevcut en geniş müfredat kataloğu — IB + ulusal",
    b6t:'Dünya Standartlarında Onboarding', b6d:'İlk günden itibaren uygulama desteği dahildir',
    b7t:'Standartlara Uygunluk', b7d:'IB, CIS, BSO standartlarına uygunluğu sağlayan araçlar',
    b8t:'2+ Yıllık Deneyim', b8d:'Uluslararası ve devlet okullarını derinden anlayan ekip',
    test_badge: 'Müşteri Görüşleri', test_title: 'Kullanıcılarımızın Gerçek Hikayeleri',
    test_sub: 'Pilot programımızdaki okulların gerçek görüşleri.',
    test_read: 'Vaka çalışmasını oku',
    t1q: '"Zirva bizim için tek platform — hem IB hem ulusal müfredat tek yerde."',
    t1n: 'Rauf Əliyev', t1r: 'BT Sistemleri Lideri, Bakü Uluslararası Okulu',
    t2q: '"Zeka AI öğretmenlerimizin haftalık raporlama süresini 4 saatten 20 dakikaya indirdi."',
    t2n: 'Günel Hüseynova', t2r: 'Eğitim Teknolojileri Başkanı, Hazar Üniversitesi Okulu',
    t3q: '"DP Koordinatörü olarak Zirva olmadan çalışmayı hayal edemiyorum."',
    t3n: 'Nigar Qasımova', t3r: 'DP Koordinatörü, IB Dünya Okulu',
    int_badge: 'Entegrasyonlar', int_title: 'Sevdiğiniz Araçlarla Entegrasyon.',
    int_sub: '50+ entegrasyon artmaya devam ediyor.', int_hub: 'Zirva her şeyi birleştiriyor',
    sec_badge: 'Güvenlik & Uyumluluk', sec_title: 'Verilerinizi Korumaya Kararlıyız.',
    sec_sub: 'Yerel barındırma, ISO/GDPR sertifikası ve sağlam süreklilik protokolleri verilerinizin korunmasını sağlar.',
    sec_explore: 'Daha fazla',
    s1t:'Yerel Barındırma', s1d:'Tüm veriler Azerbaycan sunucularında yerel gizlilik yasalarına uygun saklanır',
    s2t:'ISO/IEC 27001', s2d:'Güçlü bilgi güvenliği uygulamalarına kurum genelinde bağlılık',
    s3t:'Veri Koruma', s3d:'GDPR ve Azerbaycan Veri Koruma Kanunu ile tam uyumluluk',
    s4t:'Güvenlik', s4d:'Sıkı erişim kontrolleri, kötü amaçlı yazılım taraması, 7/24 izleme',
    sup_badge: 'Destek', sup_title: 'Rakipsiz Destek.',
    sup_sub: 'Haftanın 7 günü, günün 24 saati yanınızdayız.',
    su1t:'E-posta Desteği', su1d:'Hızlı, güvenilir yanıtlar.', su1cta: 'Talep Gönder',
    su2t:'Yardım Merkezi', su2d:'Aranabilir kaynaklar, her zaman.', su2cta: 'Gir',
    cta_title: "Zirva+'yı Uygulamada Görmeye Hazır Mısınız?",
    cta_sub: 'Pilot programa katılın — teknoloji hazır.',
    cta_btn1: 'Satışla İletişim', cta_btn2: 'Bize Ulaşın →',
    foot_tagline: "Azerbaycan'ın dijital okul altyapısı",
    foot_col1: 'Zirva+ Öğrenim', foot_col2: 'Kaynaklar', foot_col3: 'Destek Merkezi', foot_col4: 'Şirket',
    foot_rights: 'Tüm hakları saklıdır.',
    foot_privacy: 'Gizlilik', foot_terms: 'Şartlar',
    fl1:'IB İlk Yıllar (PYP)', fl2:'IB Orta Yıllar (MYP)', fl3:'IB Diploma (DP)', fl4:'IB Kariyer (CP)', fl5:'Devlet Okulları', fl6:'Mobil Uygulama', fl7:'Çevrimiçi Sınavlar',
    fr1:'CEO Mektubu', fr2:'Kaynak Kütüphanesi', fr3:'Etkinlikler & Webinarlar', fr4:'Blog', fr5:'Ürün Portalı', fr6:'Müşteri Görüşleri', fr7:'Sıkça Sorulan Sorular',
    fs1:'Premium Destek', fs2:'Yardım & Destek',
    fc1:'Hakkımızda', fc2:'Kariyer', fc3:'Ortaklar', fc4:'İletişim',
  },
  ru: {
    isAz: false, lang: 'ru',
    nav_solutions: 'Решения', nav_features: 'Возможности', nav_zeka: 'Зека AI',
    nav_resources: 'Ресурсы', nav_pricing: 'Тарифы', nav_signin: 'Войти', nav_demo: 'Связаться',
    hero_h1a: 'Мы цифровизируем', hero_h1b: 'школы Азербайджана',
    hero_sub: 'От учебного плана до отчётов, от оценивания до коммуникации. Всё необходимое в одной платформе.',
    hero_cta1: 'Возможности', hero_cta2: 'Связаться',
    dash_school: 'Международная школа Zirva', dash_welcome: 'Добро пожаловать, Администратор',
    dash_students: 'Ученик', dash_avg_grade: 'Ср. оценка', dash_attendance: 'Посещаемость', dash_ai: 'AI Сессия',
    dash_timetable: 'Расписание на сегодня', dash_activity: 'Последняя активность',
    dash_math: 'Математика', dash_physics: 'Физика', dash_english: 'Английский язык',
    dash_ev1: 'Оценка выставлена', dash_ev2: 'Посещаемость отмечена', dash_ev3: 'Новое сообщение',
    trust_title: 'Инвесторы и партнёры',
    sol_badge: 'Решения', sol_title: 'Zirva+ для вашей школы',
    sol_sub: 'От IB-школ до государственных школ Азербайджана — поддерживаются все учебные программы.',
    sol_multi_t: 'Мультикурикулум', sol_multi_d: 'Общая поддержка всех основных учебных программ, инклюзивное оценивание и отчётность',
    sol_gov_t: 'Национальный Учебный план', sol_gov_d: 'Специальный режим для государственных школ Азербайджана с интеграцией Министерства',
    sol_dp_t: 'IB Diploma (DP)', sol_dp_d: 'Полная поддержка программы IB Diploma, включая управление DP Core',
    sol_cp_t: 'IB Career-Related (CP)', sol_cp_d: 'Для школ, реализующих карьерно-ориентированную программу',
    sol_myp_t: 'IB Средние годы (MYP)', sol_myp_d: 'Совместное планирование программы исследования',
    sol_pyp_t: 'IB Начальные годы (PYP)', sol_pyp_d: 'Та же мощная поддержка для младших учащихся',
    sol_cta: 'Подробнее',
    feat_badge: 'Возможности', feat_title: 'Всё, что нужно.', feat_title_b: 'Ничего лишнего.',
    feat_sub: 'От учебного плана до отчётов, от оценивания до AI — полный рабочий процесс на одной платформе.',
    tab_curriculum: 'Учебная программа', tab_teaching: 'Обучение', tab_assessment: 'Оценивание',
    tab_reports: 'Отчёты', tab_attendance: 'Посещаемость', tab_zeka: 'Зека AI', tab_comms: 'Коммуникация',
    c1:'Совместное планирование учебной программы', c2:'600+ встроенных стандартов', c3:'Инструменты соответствия программе', c4:'Интеграция IBIS: регистрация на экзамены, e-coursework, CAS',
    t1:'Планы уроков и учебные материалы', t2:'Управление домашними заданиями', t3:'Отслеживание успеваемости учащихся', t4:'AI-ассистент Зека',
    a1:'Критериальное оценивание IB (шкала A–D)', a2:'Национальная 10-балльная шкала', a3:'Синхронизация в реальном времени', a4:'Аналитика успеваемости',
    r1:'Отчёты для Министерства', r2:'Автоматический экспорт E-Gov.az', r3:'Вывод PDF и Excel', r4:'Документация IB Audit',
    at1:'Отметка посещаемости в одно касание', at2:'Мгновенные уведомления родителям', at3:'Аналитика тенденций посещаемости', at4:'Отчёты E-Gov.az',
    z1:'На азербайджанском, английском и русском', z2:'Охватывает IB MYP/DP и национальный учебный план', z3:'AI-помощник для написания отчётов', z4:'На базе Claude AI',
    co1:'Общение учитель–родитель в реальном времени', co2:'Объявления для всей школы', co3:'Управление уведомлениями', co4:'Многоязычная поддержка',
    feat_cta: 'Связаться',
    ben_badge: 'Преимущества', ben_title: 'Умное управление школой',
    ben_sub: 'Единая платформа, охватывающая все аспекты школьной деятельности.',
    b1t:'Эффективность', b1d:'Замените разрозненные инструменты одной мощной платформой',
    b2t:'Связь с сообществом', b2d:'Объявления, отслеживание успеваемости — все в курсе событий',
    b3t:'Превосходное образование', b3d:'Управляйте полным учебным процессом от планирования до аттестатов',
    b4t:'Гибкость', b4d:'Настраиваемые функции под конкретные потребности вашей школы',
    b5t:'Мультикурикулум', b5d:'Крупнейший каталог учебных программ в Азербайджане — IB + национальная',
    b6t:'Онбординг мирового класса', b6d:'Индивидуальное сопровождение внедрения с первого дня',
    b7t:'Соответствие стандартам', b7d:'Инструменты для соответствия стандартам IB, CIS, BSO',
    b8t:'2+ года опыта', b8d:'Команда с глубоким пониманием международных и государственных школ',
    test_badge: 'Отзывы клиентов', test_title: 'Реальные истории наших пользователей',
    test_sub: 'Настоящие отзывы школ из пилотной программы.',
    test_read: 'Читать кейс',
    t1q: '"Zirva — единственная платформа, дающая нам полный пакет: IB и национальная программа в одном месте."',
    t1n: 'Рауф Алиев', t1r: 'Руководитель ИТ, Бакинская международная школа',
    t2q: '"Зека AI сократил еженедельное время на отчётность у наших учителей с 4 часов до 20 минут."',
    t2n: 'Гюнель Гусейнова', t2r: 'Руководитель EdTech, Школа университета Хазар',
    t3q: '"Как координатор DP, я не могу представить работу без Zirva."',
    t3n: 'Нигяр Касымова', t3r: 'Координатор DP, IB World School',
    int_badge: 'Интеграции', int_title: 'Интегрируйтесь с любимыми инструментами.',
    int_sub: '50+ интеграций и это только начало.', int_hub: 'Zirva объединяет всё',
    sec_badge: 'Безопасность & Соответствие', sec_title: 'Мы гарантируем защиту ваших данных.',
    sec_sub: 'Локальный хостинг, сертификация ISO/GDPR и надёжные протоколы непрерывности обеспечивают защиту данных.',
    sec_explore: 'Подробнее',
    s1t:'Локальный хостинг', s1d:'Все данные хранятся на серверах в Азербайджане в соответствии с местным законодательством.',
    s2t:'ISO/IEC 27001', s2d:'Обязательство всей организации к надёжной информационной безопасности.',
    s3t:'Защита данных', s3d:'Соответствие GDPR и законодательству Азербайджана о защите данных.',
    s4t:'Защита детей', s4d:'Строгий контроль доступа, сканирование угроз, мониторинг 24/7 и планы восстановления.',
    sup_badge: 'Поддержка', sup_title: 'Непревзойдённая поддержка.',
    sup_sub: 'Мы рядом 24 часа в сутки, 7 дней в неделю.',
    su1t:'Email-поддержка', su1d:'Быстрые, надёжные ответы.', su1cta: 'Отправить запрос',
    su2t:'Центр помощи', su2d:'Поисковая база знаний, доступная в любое время.', su2cta: 'Войти',
    cta_title: 'Готовы увидеть Zirva+ в действии?',
    cta_sub: 'Присоединяйтесь к пилотной программе — технология готова.',
    cta_btn1: 'Связаться с отделом продаж', cta_btn2: 'Связаться →',
    foot_tagline: 'Инфраструктура цифровой школы для Азербайджана',
    foot_col1: 'Zirva+ для обучения', foot_col2: 'Ресурсы', foot_col3: 'Центр поддержки', foot_col4: 'Компания',
    foot_rights: 'Все права защищены.',
    foot_privacy: 'Конфиденциальность', foot_terms: 'Условия',
    fl1:'IB Начальные годы (PYP)', fl2:'IB Средние годы (MYP)', fl3:'IB Diploma (DP)', fl4:'IB Career-Related (CP)', fl5:'Государственные школы', fl6:'Мобильное приложение', fl7:'Онлайн-экзамены',
    fr1:'Письмо CEO', fr2:'Библиотека ресурсов', fr3:'События & Вебинары', fr4:'Блог', fr5:'Портал продукта', fr6:'Отзывы клиентов', fr7:'Часто задаваемые вопросы',
    fs1:'Премиум-поддержка', fs2:'Помощь & Поддержка',
    fc1:'О нас', fc2:'Карьера', fc3:'Партнёры', fc4:'Контакты',
  },
}

/* ─── Logo ─── */
function ZirvaLogo({ size = 32, invert = false }) {
  return (
    <img src="/logo.png" alt="Zirva" width={size} height={size} className="object-contain"
      style={invert ? { filter: 'brightness(0) invert(1)' } : undefined} />
  )
}

/* ─── Landing motion + decoration styles (rendered live; tokenized) ─── */
const landingStyles = `
  @keyframes lPopIn   { 0% { opacity: 0; transform: translateY(6px); } 100% { opacity: 1; transform: translateY(0); } }

  .pop-in  { animation: lPopIn 0.4s cubic-bezier(.2,.8,.2,1) both; }

  /* ── Scroll-fade-up ── */
  .fade-up {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.5s cubic-bezier(.2,.8,.2,1), transform 0.5s cubic-bezier(.2,.8,.2,1);
  }
  .fade-up.visible { opacity: 1; transform: translateY(0); }

  /* ── Dotted journey connector (numbered steps) ── */
  .journey-line {
    background-image: linear-gradient(to right, var(--hairline-strong) 55%, transparent 0%);
    background-position: top;
    background-size: 14px 2px;
    background-repeat: repeat-x;
  }

  /* ── Mobile overrides ── */
  html { overflow-x: hidden; }
  @media(max-width:639px){
    .hero-section { min-height: unset !important; padding-bottom: 80px !important; }
  }

  @media (prefers-reduced-motion: reduce) {
    .pop-in { animation: none !important; }
    .fade-up { opacity: 1 !important; transform: none !important; transition: none !important; }
  }
`

/* ── Scroll fade-up hook ── */
function useFadeUp(threshold = 0.15) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { el.classList.add('visible'); obs.disconnect() }
    }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return ref
}

/* ══════════════════════════════════════ DASHBOARD MOCKUP ══ */
function DashboardMockup({ s }) {
  const sideItems = [
    { icon: LayoutDashboard, label: 'Dashboard',      active: true  },
    { icon: BookOpen,        label: s.tab_assessment, active: false },
    { icon: Calendar,        label: s.tab_attendance, active: false },
    { icon: ClipboardList,   label: s.tab_teaching,   active: false },
    { icon: MessageSquare,   label: s.tab_comms,      active: false },
    { icon: Sparkles,        label: s.tab_zeka,       active: false },
  ]
  // Calm data view: brand for identity, status colors carry meaning only. No rainbow rotation.
  const stats = [
    { label:s.dash_students,   value:'342',  trend:'+12',   icon:Users,        color:'#574FCF', bg:'#E8E6FB' },
    { label:s.dash_avg_grade,  value:'7.8',  trend:'+0.4',  icon:TrendingUp,   color:'#15803D', bg:'#E7F6EE' },
    { label:s.dash_attendance, value:'94%',  trend:'+2.1%', icon:CheckCircle,  color:'#15803D', bg:'#E7F6EE' },
    { label:s.dash_ai,         value:'1.2k', trend:'+180',  icon:Sparkles,     color:'#574FCF', bg:'#E8E6FB' },
  ]
  const timetable = [
    { time:'09:00', subj:s.dash_math,    rm:'301' },
    { time:'10:30', subj:s.dash_physics, rm:'202' },
    { time:'12:00', subj:s.dash_english, rm:'105' },
  ]
  const activity = [
    { ev:s.dash_ev1, t:'2m',  color:'#15803D', bg:'#E7F6EE' },
    { ev:s.dash_ev2, t:'15m', color:'#15803D', bg:'#E7F6EE' },
    { ev:s.dash_ev3, t:'1h',  color:'#574FCF', bg:'#E8E6FB' },
  ]

  return (
    <div style={{ borderRadius:14, overflow:'hidden', border:'1px solid var(--hairline-strong)', boxShadow:'0 24px 60px -20px rgba(20,22,40,0.20), 0 0 0 1px rgba(255,255,255,0.6)' }}>

      {/* ── Browser device chrome ── */}
      <div style={{ background:'#1E2233', padding:'10px 16px', display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ display:'flex', gap:6 }}>
          {['rgba(255,255,255,0.22)','rgba(255,255,255,0.22)','rgba(255,255,255,0.22)'].map((c,i) => <div key={i} style={{ width:11, height:11, borderRadius:'50%', background:c }}/>)}
        </div>
        <div style={{ flex:1, background:'rgba(255,255,255,0.08)', borderRadius:7, padding:'5px 0', fontSize:11, color:'rgba(255,255,255,0.5)', textAlign:'center', maxWidth:280, margin:'0 auto' }}>
          app.zirva.az/admin/dashboard
        </div>
      </div>

      {/* ── App shell — light, the real product ── */}
      <div style={{ display:'flex', height:450, background:'#F6F6FB' }}>

        {/* Sidebar — near-white with right hairline */}
        <div style={{ width:186, background:'#FBFBFE', borderRight:'1px solid #ECEDF3', display:'flex', flexDirection:'column', flexShrink:0 }}>
          {/* Logo */}
          <div style={{ padding:'13px 14px 12px', borderBottom:'1px solid #ECEDF3', display:'flex', alignItems:'center', gap:9, flexShrink:0 }}>
            <div style={{ width:29, height:29, borderRadius:8, background:'#574FCF', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <span className="font-display" style={{ color:'#fff', fontSize:13, fontWeight:800 }}>Z</span>
            </div>
            <div>
              <p className="font-display" style={{ margin:0, color:'#1E2233', fontSize:13, fontWeight:800, lineHeight:1, letterSpacing:'-0.01em' }}>Zirva</p>
              <p style={{ margin:'2px 0 0', color:'#9AA0B0', fontSize:8, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase' }}>School Platform</p>
            </div>
          </div>

          {/* Nav */}
          <div style={{ flex:1, padding:'8px 8px 4px' }}>
            {/* Section: Main */}
            <p style={{ margin:'4px 0 5px', fontSize:7.5, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'#9AA0B0', padding:'0 8px' }}>
              {s.lang==='az'?'Əsas':s.lang==='tr'?'Ana Menü':s.lang==='ru'?'Главное':'Main'}
            </p>
            {[
              { icon:LayoutDashboard, label:'Dashboard', active:true },
              { icon:BookOpen, label:s.tab_curriculum, active:false },
              { icon:ClipboardCheck, label:s.tab_assessment, active:false },
              { icon:Calendar, label:s.tab_attendance, active:false },
            ].map(({ icon:Icon, label, active }) => (
              <div key={label} style={{
                display:'flex', alignItems:'center', gap:8, padding:'7px 10px',
                borderRadius:8, marginBottom:1.5, position:'relative', overflow:'hidden',
                background: active ? '#F3F2FD' : 'transparent',
              }}>
                {active && <div style={{ position:'absolute', left:0, top:6, bottom:6, width:3, background:'#574FCF', borderRadius:'0 3px 3px 0' }}/>}
                <Icon style={{ width:13, height:13, color: active ? '#574FCF' : '#9AA0B0', flexShrink:0, marginLeft: active ? 5 : 0 }}/>
                <span style={{ fontSize:11, fontWeight: active ? 700 : 500, color: active ? '#3E37A6' : '#5A6072' }}>{label}</span>
              </div>
            ))}

            {/* Divider */}
            <div style={{ height:1, background:'#ECEDF3', margin:'8px 2px' }}/>

            {/* Section: More */}
            <p style={{ margin:'4px 0 5px', fontSize:7.5, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'#9AA0B0', padding:'0 8px' }}>
              {s.lang==='az'?'Əlaqə':s.lang==='tr'?'İletişim':s.lang==='ru'?'Связь':'Comms'}
            </p>
            {[
              { icon:MessageSquare, label:s.tab_comms },
              { icon:FileText, label:s.lang==='az'?'Hesabatlar':s.lang==='tr'?'Raporlar':s.lang==='ru'?'Отчёты':'Reports' },
            ].map(({ icon:Icon, label }) => (
              <div key={label} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 10px', borderRadius:8, marginBottom:1.5 }}>
                <Icon style={{ width:13, height:13, color:'#9AA0B0', flexShrink:0 }}/>
                <span style={{ fontSize:11, fontWeight:500, color:'#5A6072' }}>{label}</span>
              </div>
            ))}

            {/* Zeka AI pill */}
            <div style={{ margin:'8px 0 0', padding:'7px 10px', borderRadius:8, background:'#F3F2FD', border:'1px solid #D4CFF7', display:'flex', alignItems:'center', gap:8 }}>
              <Sparkles style={{ width:12, height:12, color:'#574FCF', flexShrink:0 }}/>
              <span style={{ fontSize:11, fontWeight:700, color:'#3E37A6', flex:1 }}>{s.tab_zeka}</span>
              <span style={{ fontSize:7, fontWeight:800, color:'#fff', letterSpacing:'0.05em', textTransform:'uppercase', background:'#574FCF', padding:'2px 5px', borderRadius:4, flexShrink:0 }}>AI</span>
            </div>
          </div>

          {/* User profile */}
          <div style={{ padding:'10px', borderTop:'1px solid #ECEDF3', flexShrink:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:9, padding:'7px 8px', borderRadius:8, background:'#fff', border:'1px solid #ECEDF3' }}>
              <div style={{ width:26, height:26, borderRadius:'50%', background:'#574FCF', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <span style={{ color:'#fff', fontSize:11, fontWeight:800 }}>A</span>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ margin:0, fontSize:10, fontWeight:700, color:'#3A3F52', lineHeight:1.1 }}>Admin</p>
                <p style={{ margin:0, fontSize:8, color:'#9AA0B0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>admin@zirva.az</p>
              </div>
              <ChevronRight style={{ width:10, height:10, color:'#9AA0B0', flexShrink:0 }}/>
            </div>
          </div>
        </div>

        {/* Main */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>

          {/* Topbar */}
          <div style={{ background:'#fff', borderBottom:'1px solid #ECEDF3', padding:'9px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
            <div>
              <p className="font-display" style={{ margin:0, fontSize:13, fontWeight:800, color:'#1E2233' }}>{s.dash_welcome}</p>
              <p style={{ margin:'2px 0 0', fontSize:10, color:'#9AA0B0' }}>{s.dash_school}</p>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ display:'flex', alignItems:'center', gap:5, background:'#E7F6EE', borderRadius:999, padding:'3px 10px' }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:'#1FA855' }}/>
                <span style={{ fontSize:9.5, color:'#15803D', fontWeight:700 }}>Live</span>
              </div>
              <div style={{ width:28, height:28, borderRadius:'50%', background:'#574FCF', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <span style={{ color:'#fff', fontSize:11, fontWeight:800 }}>A</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, padding:'10px 12px 8px' }}>
            {stats.map(({ label, value, trend, icon: Icon, color, bg }) => (
              <div key={label} style={{ background:'#fff', borderRadius:12, padding:'10px 11px', border:'1px solid #ECEDF3' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:7 }}>
                  <p style={{ margin:0, fontSize:9, color:'#9AA0B0', fontWeight:600 }}>{label}</p>
                  <div style={{ width:22, height:22, borderRadius:7, background:bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Icon style={{ width:11, height:11, color }}/>
                  </div>
                </div>
                <p className="font-display" style={{ margin:0, fontSize:20, fontWeight:700, color:'#1E2233', lineHeight:1, letterSpacing:'-0.01em', fontVariantNumeric:'tabular-nums' }}>{value}</p>
                <p style={{ margin:'4px 0 0', fontSize:9, color:'#15803D', fontWeight:700 }}>{trend}</p>
              </div>
            ))}
          </div>

          {/* Panels */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, padding:'0 12px 10px', flex:1, minHeight:0 }}>
            {/* Timetable */}
            <div style={{ background:'#fff', borderRadius:12, padding:'11px 13px', border:'1px solid #ECEDF3', overflow:'hidden' }}>
              <p style={{ margin:'0 0 9px', fontSize:10.5, fontWeight:700, color:'#3A3F52' }}>{s.dash_timetable}</p>
              {timetable.map(({ time, subj, rm }) => (
                <div key={time} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 0', borderBottom:'1px solid #F6F6FB' }}>
                  <span style={{ fontSize:9, color:'#9AA0B0', width:32, flexShrink:0, fontVariantNumeric:'tabular-nums' }}>{time}</span>
                  <div style={{ width:7, height:7, borderRadius:'50%', background:'#574FCF', flexShrink:0 }}/>
                  <span style={{ fontSize:10.5, color:'#3A3F52', flex:1, fontWeight:500 }}>{subj}</span>
                  <span style={{ fontSize:9, color:'#5A6072', background:'#F6F6FB', borderRadius:5, padding:'2px 6px', fontWeight:600 }}>{rm}</span>
                </div>
              ))}
            </div>
            {/* Activity */}
            <div style={{ background:'#fff', borderRadius:12, padding:'11px 13px', border:'1px solid #ECEDF3', overflow:'hidden' }}>
              <p style={{ margin:'0 0 9px', fontSize:10.5, fontWeight:700, color:'#3A3F52' }}>{s.dash_activity}</p>
              {activity.map(({ ev, t, color, bg }) => (
                <div key={ev} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 0', borderBottom:'1px solid #F6F6FB' }}>
                  <div style={{ width:20, height:20, borderRadius:'50%', background:bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Check style={{ width:10, height:10, color }}/>
                  </div>
                  <span style={{ fontSize:10.5, color:'#3A3F52', flex:1, fontWeight:500, lineHeight:1.3 }}>{ev}</span>
                  <span style={{ fontSize:9, color:'#9AA0B0', flexShrink:0 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════ FEATURE VISUAL (unchanged) ══ */
function FeatureVisual({ idx, s }) {
  if (idx === 0) return (
    <div className="space-y-2.5">
      {[
        { label:'Unit 1 · Algebra',    tags:['MYP','DP'], pct:85 },
        { label:'Unit 2 · Geometry',   tags:['MYP'],      pct:60 },
        { label:'Unit 3 · Statistics', tags:['National'], pct:40 },
      ].map(({ label, tags, pct }) => (
        <div key={label} className="rounded-tile p-3.5" style={{ background:'#fff', border:'1px solid var(--hairline)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium" style={{ color:'#3A3F52' }}>{label}</span>
            <div className="flex gap-1">{tags.map(t => <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-md font-semibold" style={{ background:'#E8E6FB', color:'#574FCF' }}>{t}</span>)}</div>
          </div>
          <div className="h-1.5 rounded-full" style={{ background:'var(--hairline)' }}><div className="h-full rounded-full" style={{ width:`${pct}%`, background:'#574FCF' }}/></div>
          <p className="text-[9px] mt-1" style={{ color:'#9AA0B0' }}>{pct}% coverage</p>
        </div>
      ))}
    </div>
  )
  if (idx === 2) return (
    <div className="space-y-1.5">
      <div className="rounded-lg px-3 py-2 grid grid-cols-4 text-[9px] font-semibold uppercase tracking-wide" style={{ background:'#FBFBFE', color:'#9AA0B0', border:'1px solid var(--hairline)' }}>
        <span>Student</span><span>Crit. A</span><span>Crit. B</span><span>Grade</span>
      </div>
      {[
        { n:'Aytən M.',a:'7',b:'6',g:'7' },
        { n:'Rauf A.', a:'5',b:'5',g:'5' },
        { n:'Günel H.',a:'8',b:'7',g:'8' },
        { n:'Nigar Q.',a:'6',b:'6',g:'6' },
      ].map(({ n,a,b,g }) => (
        <div key={n} className="rounded-lg px-3 py-2 grid grid-cols-4 items-center" style={{ background:'#fff', border:'1px solid var(--hairline)' }}>
          <span className="text-[10px] font-medium" style={{ color:'#3A3F52' }}>{n}</span>
          <span className="text-[10px] tabular-nums" style={{ color:'#5A6072' }}>{a}</span>
          <span className="text-[10px] tabular-nums" style={{ color:'#5A6072' }}>{b}</span>
          <span className="text-[10px] font-bold tabular-nums" style={{ color:'#574FCF' }}>{g}</span>
        </div>
      ))}
    </div>
  )
  if (idx === 4) return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px]" style={{ color:'#9AA0B0' }}>Today · 9A Mathematics</span>
        <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full tabular-nums" style={{ background:'#E7F6EE', color:'#15803D' }}>94%</span>
      </div>
      {[
        { n:'Aytən M.',  st:'present', dot:'#16A34A', bg:'#E7F6EE', fg:'#15803D' },
        { n:'Rauf A.',   st:'late',    dot:'#F59E0B', bg:'#FEF3C7', fg:'#B45309' },
        { n:'Günel H.',  st:'present', dot:'#16A34A', bg:'#E7F6EE', fg:'#15803D' },
        { n:'Nigar Q.',  st:'absent',  dot:'#EF4444', bg:'#FEE2E2', fg:'#B91C1C' },
        { n:'Kamran B.', st:'present', dot:'#16A34A', bg:'#E7F6EE', fg:'#15803D' },
      ].map(({ n,st,dot,bg,fg }) => (
        <div key={n} className="rounded-lg px-3 py-2 flex items-center justify-between" style={{ background:'#fff', border:'1px solid var(--hairline)' }}>
          <span className="text-[10px] font-medium" style={{ color:'#3A3F52' }}>{n}</span>
          <span className="inline-flex items-center gap-1.5 text-[9px] font-semibold px-2 py-0.5 rounded-full" style={{ background:bg, color:fg }}>
            <span style={{ width:5, height:5, borderRadius:'50%', background:dot, flexShrink:0 }}/>{st}
          </span>
        </div>
      ))}
    </div>
  )
  if (idx === 5) return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 rounded-tile px-3 py-2.5" style={{ background:'#F3F2FD', border:'1px solid #D4CFF7' }}>
        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background:'#574FCF' }}><Sparkles className="w-3.5 h-3.5 text-white"/></div>
        <div><p className="text-[9px] font-semibold" style={{ color:'#574FCF' }}>{s.tab_zeka}</p><p className="text-[10px] leading-snug font-medium" style={{ color:'#3E37A6' }}>{s.lang==='az'?'Əlbəttə! Gəl addım-addım izah edək...':s.lang==='tr'?'Tabii! Adım adım açıklayalım...':'Of course! Let\'s go through this step by step...'}</p></div>
      </div>
      {[
        { label:'Quadratic equations',sub:'IB MYP · Mathematics',   pct:72 },
        { label:'Essay feedback',      sub:'English Language & Lit', pct:91 },
        { label:'DP Core reflection',  sub:'CAS / TOK',              pct:55 },
      ].map(({ label, sub, pct }) => (
        <div key={label} className="rounded-tile px-3 py-2.5" style={{ background:'#fff', border:'1px solid var(--hairline)' }}>
          <div className="flex items-center justify-between mb-1.5">
            <div><p className="text-[10px] font-medium" style={{ color:'#3A3F52' }}>{label}</p><p className="text-[9px]" style={{ color:'#9AA0B0' }}>{sub}</p></div>
            <span className="text-[9px] font-bold tabular-nums" style={{ color:'#574FCF' }}>{pct}%</span>
          </div>
          <div className="h-1 rounded-full" style={{ background:'var(--hairline)' }}><div className="h-full rounded-full" style={{ width:`${pct}%`, background:'#574FCF' }}/></div>
        </div>
      ))}
    </div>
  )
  if (idx === 1) return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-medium uppercase tracking-wide" style={{ color:'#9AA0B0' }}>{s.lang==='az'?'Tapşırıqlar':s.lang==='tr'?'Ödevler':'Assignments'}</span>
        <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full" style={{ background:'#E8E6FB', color:'#574FCF' }}>{s.lang==='az'?'3 aktiv':s.lang==='tr'?'3 aktif':'3 active'}</span>
      </div>
      {[
        { title:'Quadratic Equations – HW',subj:s.dash_math,  due:'20 Apr',pct:68,c:'#574FCF',bg:'#E8E6FB' },
        { title:'Essay: Romeo & Juliet',   subj:s.dash_english,due:'22 Apr',pct:42,c:'#574FCF',bg:'#E8E6FB' },
        { title:'Lab Report – Titration',  subj:s.lang==='az'?'Kimya':s.lang==='tr'?'Kimya':'Chemistry', due:'25 Apr',pct:85,c:'#574FCF',bg:'#E8E6FB' },
      ].map(({ title, subj, due, pct, c, bg }) => (
        <div key={title} className="rounded-tile p-3.5" style={{ background:'#fff', border:'1px solid var(--hairline)' }}>
          <div className="flex items-start justify-between gap-2 mb-2">
            <div><p className="text-[11px] font-semibold leading-snug" style={{ color:'#1E2233' }}>{title}</p><p className="text-[9px] mt-0.5" style={{ color:'#9AA0B0' }}>{subj} · {s.lang==='az'?'Son tarix:':s.lang==='tr'?'Son tarih:':'Due:'} {due}</p></div>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 tabular-nums" style={{ background:bg, color:c }}>{pct}%</span>
          </div>
          <div className="h-1.5 rounded-full" style={{ background:'var(--hairline)' }}><div className="h-full rounded-full" style={{ width:`${pct}%`, background:c }}/></div>
          <p className="text-[9px] mt-1" style={{ color:'#9AA0B0' }}>{pct}% {s.lang==='az'?'təhvil verildi':s.lang==='tr'?'teslim edildi':'submitted'}</p>
        </div>
      ))}
    </div>
  )
  if (idx === 3) return (
    <div className="space-y-2.5">
      <div className="rounded-tile p-3.5" style={{ background:'#fff', border:'1px solid var(--hairline)' }}>
        <div className="flex items-center justify-between mb-3">
          <div><p className="text-[11px] font-semibold" style={{ color:'#1E2233' }}>{s.lang==='az'?'Şagird Qiymət Cədvəli':s.lang==='tr'?'Öğrenci Not Tablosu':'Student Grade Sheet'}</p><p className="text-[9px]" style={{ color:'#9AA0B0' }}>9A · April 2025</p></div>
          <div className="flex gap-1">
            <span className="text-[8px] font-semibold px-2 py-0.5 rounded-md" style={{ background:'#FBFBFE', border:'1px solid var(--hairline)', color:'#5A6072' }}>PDF</span>
            <span className="text-[8px] font-semibold px-2 py-0.5 rounded-md" style={{ background:'#FBFBFE', border:'1px solid var(--hairline)', color:'#5A6072' }}>Excel</span>
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="grid grid-cols-4 text-[8px] font-semibold uppercase tracking-wide pb-1" style={{ color:'#9AA0B0', borderBottom:'1px solid var(--hairline)' }}>
            <span>{s.dash_students}</span><span>{s.dash_math}</span><span>{s.dash_physics}</span><span>{s.lang==='az'?'Ortalama':s.lang==='tr'?'Ortalama':'Average'}</span>
          </div>
          {[
            { n:'Aytən M.',m:'8',p:'7',avg:'7.5',c:'#16A34A' },
            { n:'Rauf A.', m:'6',p:'5',avg:'5.5',c:'#EF4444' },
            { n:'Günel H.',m:'9',p:'8',avg:'8.5',c:'#16A34A' },
          ].map(({ n,m,p,avg,c }) => (
            <div key={n} className="grid grid-cols-4 items-center py-1 last:border-0" style={{ borderBottom:'1px solid var(--hairline)' }}>
              <span className="text-[10px] font-medium" style={{ color:'#3A3F52' }}>{n}</span>
              <span className="text-[10px] tabular-nums" style={{ color:'#5A6072' }}>{m}</span>
              <span className="text-[10px] tabular-nums" style={{ color:'#5A6072' }}>{p}</span>
              <span className="text-[10px] font-bold tabular-nums" style={{ color:c }}>{avg}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <div className="flex-1 rounded-tile px-3 py-2.5 flex items-center gap-2" style={{ background:'#fff', border:'1px solid var(--hairline)' }}>
          <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ background:'#E7F6EE' }}><CheckCircle className="w-3.5 h-3.5" style={{ color:'#16A34A' }}/></div>
          <div><p className="text-[10px] font-medium" style={{ color:'#3A3F52' }}>{s.lang==='az'?'E-Gov.az ixracı':s.lang==='tr'?'E-Gov.az dışa aktarma':'E-Gov.az export'}</p><p className="text-[9px]" style={{ color:'#15803D' }}>{s.lang==='az'?'Hazır':s.lang==='tr'?'Hazır':'Ready'}</p></div>
        </div>
        <div className="flex-1 rounded-tile px-3 py-2.5 flex items-center gap-2" style={{ background:'#fff', border:'1px solid var(--hairline)' }}>
          <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ background:'#E8E6FB' }}><FileText className="w-3.5 h-3.5" style={{ color:'#574FCF' }}/></div>
          <div><p className="text-[10px] font-medium" style={{ color:'#3A3F52' }}>IB Audit</p><p className="text-[9px]" style={{ color:'#574FCF' }}>{s.lang==='az'?'Sənədlər hazır':s.lang==='tr'?'Belgeler hazır':'Docs ready'}</p></div>
        </div>
      </div>
    </div>
  )
  if (idx === 6) return (
    <div className="space-y-2">
      <div className="rounded-tile px-3.5 py-2.5 flex items-start gap-2.5" style={{ background:'#E8E6FB', border:'1px solid #D4CFF7' }}>
        <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background:'#574FCF' }}><Bell className="w-3 h-3 text-white"/></div>
        <div><p className="text-[10px] font-semibold" style={{ color:'#3E37A6' }}>{s.lang==='az'?'Məktəb Elanı':s.lang==='tr'?'Okul Duyurusu':'School Notice'}</p><p className="text-[9px] leading-snug mt-0.5" style={{ color:'#574FCF' }}>{s.lang==='az'?'Yarımillik imtahanlar 12 May tarixindən başlayır.':s.lang==='tr'?'Dönem sonu sınavları 12 Mayıs\'ta başlıyor.':'Mid-year exams start May 12.'}</p></div>
      </div>
      <div className="rounded-tile p-3 space-y-2" style={{ background:'#fff', border:'1px solid var(--hairline)' }}>
        <p className="text-[9px] font-medium uppercase tracking-wide mb-2" style={{ color:'#9AA0B0' }}>{s.lang==='az'?'Müəllim → Valideyn':s.lang==='tr'?'Öğretmen → Veli':'Teacher → Parent'}</p>
        <div className="flex items-end gap-2">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[8px] font-bold shrink-0" style={{ background:'#574FCF' }}>M</div>
          <div className="rounded-xl rounded-bl-md px-3 py-2 max-w-[75%]" style={{ background:'#FBFBFE', border:'1px solid var(--hairline)' }}>
            <p className="text-[10px] leading-snug" style={{ color:'#3A3F52' }}>{s.lang==='az'?'Aytənin riyaziyyat nəticəsi bu ay yaxşılaşıb. Təbriklər!':s.lang==='tr'?'Ayten\'in matematik notu bu ay yükseldi. Tebrikler!':'Ayten\'s math score improved this month. Congrats!'}</p>
            <p className="text-[8px] mt-1" style={{ color:'#9AA0B0' }}>09:42</p>
          </div>
        </div>
        <div className="flex items-end gap-2 flex-row-reverse">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[8px] font-bold shrink-0" style={{ background:'#1FA855' }}>V</div>
          <div className="rounded-xl rounded-br-md px-3 py-2 max-w-[75%]" style={{ background:'#E7F6EE' }}>
            <p className="text-[10px] leading-snug" style={{ color:'#15803D' }}>{s.lang==='az'?'Çox sağ olun! Evdə də çox çalışır.':s.lang==='tr'?'Teşekkürler! Evde de çok çalışıyor.':'Thank you! She studies hard at home too.'}</p>
            <p className="text-[8px] mt-1" style={{ color:'#15803D' }}>09:55</p>
          </div>
        </div>
      </div>
      <div className="rounded-tile px-3 py-2.5 flex items-center justify-between" style={{ background:'#fff', border:'1px solid var(--hairline)' }}>
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full shrink-0" style={{ background:'#574FCF' }}/><p className="text-[10px] font-medium" style={{ color:'#3A3F52' }}>{s.lang==='az'?'3 oxunmamış mesaj':s.lang==='tr'?'3 okunmamış mesaj':'3 unread messages'}</p></div>
        <span className="text-[9px] font-semibold" style={{ color:'#574FCF' }}>{s.lang==='az'?'Hamısına bax →':s.lang==='tr'?'Tümünü gör →':'View all →'}</span>
      </div>
    </div>
  )
  return null
}

/* ══════════════════════════════════════════════════════════
   S E C T I O N S
══════════════════════════════════════════════════════════ */

/* ─── HERO ─── */
function Hero({ s }) {
  const L = s.lang

  return (
    <section className="hero-section" style={{
      minHeight:'100vh', position:'relative', overflow:'hidden',
    }}>

      {/* ── One subtle static brand wash (no perpetual motion) ── */}
      <div aria-hidden="true" style={{ position:'absolute', inset:0, zIndex:0, pointerEvents:'none' }}>
        <div style={{
          position:'absolute', top:'-12%', left:'50%', transform:'translateX(-50%)',
          width:'78vw', height:'62vh',
          background:'radial-gradient(ellipse at center, rgba(87,79,207,0.12) 0%, transparent 66%)',
          filter:'blur(80px)', borderRadius:'50%',
        }}/>
      </div>

      {/* Bottom fade — blends into the canvas PartnerBar */}
      <div style={{
        position:'absolute', bottom:0, left:0, right:0, height:'28%', zIndex:3, pointerEvents:'none',
        background:'linear-gradient(to top, rgba(246,246,251,0.95) 0%, transparent 100%)',
      }}/>

      {/* ── Content ── */}
      <div className="max-w-5xl mx-auto px-5 sm:px-10 flex flex-col items-center"
        style={{ position:'relative', zIndex:10, paddingTop:'clamp(140px, 20vh, 220px)', paddingBottom:0 }}>

        {/* Trust eyebrow */}
        <div className="pop-in" style={{
          display:'inline-flex', alignItems:'center', gap:8, marginBottom:24,
          padding:'7px 14px 7px 8px', borderRadius:999,
          background:'#FFFFFF',
          border:'1px solid var(--hairline-strong)', boxShadow:'0 1px 2px rgba(20,22,40,.05), 0 6px 16px -6px rgba(20,22,40,.10)',
        }}>
          <span style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:24, height:24, borderRadius:999, background:'#E8E6FB' }}>
            <Sparkles style={{ width:13, height:13, color:'#574FCF' }}/>
          </span>
          <span style={{ fontSize:12.5, fontWeight:700, color:'#3A3F52' }}>
            {L==='az'?'Azərbaycanın №1 məktəb platforması':L==='tr'?"Azerbaycan'ın №1 okul platformu":L==='ru'?'Платформа №1 для школ Азербайджана':"Azerbaijan's #1 school platform"}
          </span>
        </div>

        {/* Headline — Bricolage display, one static gradient accent word (no animation) */}
        <h1 className="font-display" style={{
          textAlign:'center', fontWeight:800,
          fontSize:'clamp(2.9rem, 6.2vw, 5.5rem)',
          lineHeight:1.06, letterSpacing:'-0.02em',
          color:'#1E2233', marginBottom:22, maxWidth:'18ch',
        }}>
          {s.hero_h1a}
          <br/>
          <span className="pastel-text">
            {s.hero_h1b}
          </span>
        </h1>

        {/* Sub-copy */}
        <p style={{
          textAlign:'center', color:'#5A6072',
          fontSize:'clamp(15px, 1.8vw, 19px)', lineHeight:1.7,
          maxWidth:540, fontWeight:400, marginBottom:40,
        }}>
          {s.hero_sub}
        </p>

        {/* CTA pair — ghost + flat brand */}
        <div style={{ display:'flex', gap:14, flexWrap:'wrap', justifyContent:'center', marginBottom:72 }}>
          <Link to="/features" className="btn-ghost-pastel" style={{ padding:'14px 28px', fontSize:15 }}>
            {s.hero_cta1}
          </Link>
          <Link to="/contact" className="btn-pastel" style={{ padding:'14px 30px', fontSize:15 }}>
            {s.hero_cta2} <ArrowRight style={{ width:16, height:16, flexShrink:0 }}/>
          </Link>
        </div>


        {/* Dashboard area — hidden on small screens */}
        <div className="hidden sm:block" style={{ position:'relative', width:'100%', maxWidth:1000 }}>

          {/* Soft neutral lift behind mockup */}
          <div style={{ position:'absolute', bottom:-20, left:'10%', right:'10%', height:100,
            background:'rgba(20,22,40,0.10)', filter:'blur(55px)', borderRadius:'50%' }}/>

          {/* Pinned chip — left */}
          <div style={{
            position:'absolute', zIndex:20, left:-12, top:44,
            background:'#FFFFFF',
            borderRadius:14, padding:'12px 16px',
            boxShadow:'0 8px 24px -8px rgba(20,22,40,.14)',
            border:'1px solid var(--hairline)',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:11 }}>
              <div style={{ width:38, height:38, borderRadius:12, background:'#E8E6FB', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Sparkles style={{ width:17, height:17, color:'#574FCF' }}/>
              </div>
              <div>
                <p style={{ fontSize:12.5, fontWeight:700, color:'#1E2233', lineHeight:1.2, margin:0 }}>Zəka AI</p>
                <p style={{ fontSize:11, fontWeight:600, color:'#15803D', display:'flex', alignItems:'center', gap:4, marginTop:3, margin:0 }}>
                  <span style={{ width:5, height:5, borderRadius:'50%', background:'#1FA855', flexShrink:0, display:'inline-block' }}/>
                  {L==='az'?'Aktiv · Hazır':L==='tr'?'Aktif · Hazır':'Active · Ready'}
                </p>
              </div>
            </div>
          </div>

          {/* Pinned chip — right */}
          <div style={{
            position:'absolute', zIndex:20, right:-12, top:60,
            background:'#FFFFFF',
            borderRadius:14, padding:'12px 16px',
            boxShadow:'0 8px 24px -8px rgba(20,22,40,.14)',
            border:'1px solid var(--hairline)',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:11 }}>
              <div style={{ width:38, height:38, borderRadius:12, background:'#E7F6EE', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <GraduationCap style={{ width:17, height:17, color:'#15803D' }}/>
              </div>
              <div>
                <p style={{ fontSize:12.5, fontWeight:700, color:'#1E2233', lineHeight:1.2, margin:0 }}>
                  {L==='az'?'IB + Milli Kurikulum':L==='tr'?'IB + Ulusal Müfredat':'IB + National Curriculum'}
                </p>
                <p style={{ fontSize:11, fontWeight:600, color:'#574FCF', display:'flex', alignItems:'center', gap:4, marginTop:3, margin:0 }}>
                  <Check style={{ width:10, height:10 }}/>
                  {L==='az'?'Tam dəstəklənir':L==='tr'?'Tam destekleniyor':'Fully supported'}
                </p>
              </div>
            </div>
          </div>

          {/* Dashboard — the real light product */}
          <DashboardMockup s={s}/>
        </div>

      </div>
    </section>
  )
}

/* ─── PARTNER BAR ─── */
function PartnerBar({ s }) {
  const items = [
    { name:'IBO Certified', url:'https://ibo.org',       img:'/IB.png'        },
    { name:'Microsoft',     url:'https://microsoft.com', img:'/MICROSOFT.png' },
    { name:'Google',        url:'https://google.com',    img:'/GOOGLE.png'    },
    { name:'Anthropic',     url:'https://anthropic.com', img:'/ANTHROPIC.png' },
  ]
  const track = [...items, ...items, ...items]
  return (
    <div style={{ position:'relative', padding:'40px 0 48px' }}>
      <p style={{ textAlign:'center', fontSize:10.5, color:'#9AA0B0', fontWeight:700, letterSpacing:'0.24em', textTransform:'uppercase', marginBottom:28 }}>
        {s.trust_title}
      </p>
      <div style={{ position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', left:0, top:0, bottom:0, width:140, zIndex:2, background:'linear-gradient(to right, #F6F6FB, transparent)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', right:0, top:0, bottom:0, width:140, zIndex:2, background:'linear-gradient(to left, #F6F6FB, transparent)', pointerEvents:'none' }}/>
        <div style={{ display:'flex', alignItems:'center', gap:84, animation:'partnerScroll 32s linear infinite', width:'max-content' }}>
          {track.map(({ name, url, img }, i) => (
            <a key={i} href={url} target="_blank" rel="noopener noreferrer"
              style={{ flexShrink:0, textDecoration:'none', opacity:0.65, transition:'opacity .25s ease, transform .25s ease', filter:'grayscale(0.3)' }}
              onMouseEnter={e => { e.currentTarget.style.opacity='1'; e.currentTarget.style.filter='grayscale(0)' }}
              onMouseLeave={e => { e.currentTarget.style.opacity='0.65'; e.currentTarget.style.filter='grayscale(0.3)' }}>
              <img src={img} alt={name} style={{ height:72, width:'auto', objectFit:'contain', display:'block' }}/>
            </a>
          ))}
        </div>
      </div>
      <style>{`@keyframes partnerScroll { 0%{transform:translateX(0)} 100%{transform:translateX(-33.333%)} }`}</style>
    </div>
  )
}

/* ─── STAT BAND ─── */
function StatBand({ s }) {
  const ref = useFadeUp()
  const L = s.lang
  // Flat lilac band, huge Bricolage numbers with count-up on scroll.
  const [seen, setSeen] = useState(false)
  const bandRef = useRef(null)
  useEffect(() => {
    const el = bandRef.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); obs.disconnect() } }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  const stats = [
    { to: 600, suffix: '+', label: L==='az'?'Daxili standart':L==='tr'?'Yerleşik standart':L==='ru'?'Встроенных стандартов':'Built-in standards' },
    { to: 5,   suffix: '',  label: L==='az'?'Kurikulum çərçivəsi':L==='tr'?'Müfredat çerçevesi':L==='ru'?'Учебных программ':'Curriculum frameworks' },
    { to: 3,   suffix: '',  label: L==='az'?'Dil dəstəyi':L==='tr'?'Dil desteği':L==='ru'?'Языка поддержки':'Languages supported' },
    { to: 24,  suffix: '/7',label: L==='az'?'Canlı dəstək':L==='tr'?'Canlı destek':L==='ru'?'Поддержка':'Live support' },
  ]
  return (
    <section ref={ref} className="fade-up" style={{ padding:'24px 0 88px' }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div ref={bandRef} style={{
          background:'linear-gradient(120deg, #F3F2FD 0%, #E8E6FB 100%)',
          borderRadius:18, padding:'clamp(32px,5vw,52px) clamp(20px,4vw,48px)',
          border:'1px solid var(--hairline)',
        }}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-6">
            {stats.map(({ to, suffix, label }) => (
              <div key={label} className="text-center">
                <div className="font-display tabular-nums" style={{ fontSize:'clamp(2.6rem,5vw,3.8rem)', fontWeight:800, lineHeight:1, color:'#574FCF', letterSpacing:'-0.02em' }}>
                  {seen ? <CountUp to={to} duration={1100} suffix={suffix} /> : <span className="tabular-nums">0{suffix}</span>}
                </div>
                <p style={{ marginTop:10, fontSize:13.5, fontWeight:600, color:'#5A6072' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── AUDIENCE SWITCHER ─── */
function AudienceSwitcher({ s }) {
  const ref = useFadeUp()
  const L = s.lang
  const [active, setActive] = useState(0)
  // One brand accent across all audiences (color restraint); each role keeps its own icon.
  const accent = '#574FCF'
  const tint = '#E8E6FB'
  const audiences = [
    {
      key: 'students', icon:GraduationCap,
      tab: L==='az'?'Şagirdlər':L==='tr'?'Öğrenciler':L==='ru'?'Ученики':'Students',
      title: L==='az'?'Şagirdlər üçün':L==='tr'?'Öğrenciler için':L==='ru'?'Для учеников':'For students',
      body: L==='az'?'Tapşırıqlar, qiymətlər və irəliləyiş — hamısı bir yerdə, aydın və motivasiyaedici.':L==='tr'?'Ödevler, notlar ve ilerleme — hepsi tek yerde, net ve motive edici.':L==='ru'?'Задания, оценки и прогресс — всё в одном месте, понятно и мотивирующе.':'Assignments, grades and progress — all in one place, clear and motivating.',
      pts: [s.t3, s.t2, s.co4],
    },
    {
      key: 'teachers', icon:PenLine,
      tab: L==='az'?'Müəllimlər':L==='tr'?'Öğretmenler':L==='ru'?'Учителя':'Teachers',
      title: L==='az'?'Müəllimlər üçün':L==='tr'?'Öğretmenler için':L==='ru'?'Для учителей':'For teachers',
      body: L==='az'?'Planlaşdırmadan qiymətləndirməyə — Zəka AI ilə həftələrlə vaxta qənaət.':L==='tr'?'Planlamadan değerlendirmeye — Zeka AI ile haftalarca zaman tasarrufu.':L==='ru'?'От планирования до оценивания — экономия недель времени с Зека AI.':'From planning to grading — save weeks of time with Zeka AI.',
      pts: [s.c1, s.a1, s.z3],
    },
    {
      key: 'parents', icon:HeartHandshake,
      tab: L==='az'?'Valideynlər':L==='tr'?'Veliler':L==='ru'?'Родители':'Parents',
      title: L==='az'?'Valideynlər üçün':L==='tr'?'Veliler için':L==='ru'?'Для родителей':'For parents',
      body: L==='az'?'Övladınızın irəliləyişini real vaxtda izləyin və müəllimlərlə birbaşa əlaqə saxlayın.':L==='tr'?"Çocuğunuzun ilerlemesini gerçek zamanlı takip edin ve öğretmenlerle doğrudan iletişim kurun.":L==='ru'?'Следите за успехами ребёнка в реальном времени и общайтесь с учителями напрямую.':"Track your child's progress in real time and message teachers directly.",
      pts: [s.at2, s.co1, s.co3],
    },
    {
      key: 'admins', icon:Building2,
      tab: L==='az'?'Adminlər':L==='tr'?'Yöneticiler':L==='ru'?'Администраторы':'Admins',
      title: L==='az'?'Rəhbərlik üçün':L==='tr'?'Yönetim için':L==='ru'?'Для руководства':'For administrators',
      body: L==='az'?'Bütün məktəbin əməliyyatları, hesabatları və uyğunluğu vahid idarə panelində.':L==='tr'?'Tüm okul operasyonları, raporları ve uyumluluğu tek panelde.':L==='ru'?'Все операции школы, отчёты и соответствие в едином дашборде.':'Every school operation, report and compliance check in one dashboard.',
      pts: [s.r1, s.r2, s.b5t],
    },
  ]
  const a = audiences[active]
  const Icon = a.icon
  return (
    <section ref={ref} className="fade-up py-28" style={{ position:'relative' }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8" style={{ position:'relative', zIndex:1 }}>
        <div className="text-center mb-12">
          <h2 className="font-display font-extrabold mb-4" style={{ fontSize:'clamp(2rem,4.5vw,3.2rem)', letterSpacing:'-0.02em', color:'#1E2233' }}>
            {L==='az'?'Hər kəs üçün düşünülüb':L==='tr'?'Herkes için tasarlandı':L==='ru'?'Создано для каждого':'Built for everyone'}
          </h2>
          <p className="text-base max-w-xl mx-auto leading-relaxed" style={{ color:'#5A6072' }}>
            {L==='az'?'Şagird, müəllim, valideyn və rəhbərlik — hər rol üçün uyğunlaşdırılmış təcrübə.':L==='tr'?'Öğrenci, öğretmen, veli ve yönetim — her rol için uyarlanmış deneyim.':L==='ru'?'Ученик, учитель, родитель и руководство — опыт под каждую роль.':'Students, teachers, parents and admins — an experience tailored to every role.'}
          </p>
        </div>

        {/* Segmented switcher */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {audiences.map((aud, i) => {
            const on = i === active
            const AudIcon = aud.icon
            return (
              <button key={aud.key} onClick={() => setActive(i)}
                className="inline-flex items-center gap-2 transition-all"
                style={{
                  padding:'10px 18px', borderRadius:999, fontSize:14, fontWeight:600, cursor:'pointer',
                  border: on ? `1px solid ${accent}` : '1px solid var(--hairline-strong)',
                  background: on ? tint : '#fff',
                  color: on ? accent : '#5A6072',
                }}>
                <AudIcon style={{ width:16, height:16 }}/>
                {aud.tab}
              </button>
            )
          })}
        </div>

        {/* Panel */}
        <div className="liquid-card overflow-hidden" style={{ borderRadius:18 }}>
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Copy */}
            <div className="p-8 sm:p-12 flex flex-col justify-center">
              <div className="icon-chip mb-6" style={{ background:tint, color:accent }}>
                <Icon style={{ width:22, height:22 }}/>
              </div>
              <h3 className="font-bold mb-3" style={{ fontSize:'clamp(1.25rem,2.4vw,1.6rem)', color:'#1E2233', letterSpacing:'-0.01em' }}>{a.title}</h3>
              <p className="text-base leading-relaxed mb-7" style={{ color:'#5A6072', maxWidth:440 }}>{a.body}</p>
              <ul className="space-y-3">
                {a.pts.map(p => (
                  <li key={p} className="flex items-start gap-3">
                    <span className="rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ width:20, height:20, background:tint }}>
                      <Check style={{ width:12, height:12, color:accent }}/>
                    </span>
                    <span className="text-sm font-medium" style={{ color:'#3A3F52' }}>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Accent visual panel */}
            <div className="relative flex items-center justify-center p-10" style={{ background:`linear-gradient(140deg, ${tint} 0%, #FFFFFF 100%)`, minHeight:280 }}>
              <div aria-hidden="true" style={{ position:'absolute', top:'14%', right:'12%', width:64, height:64, borderRadius:16, background:'#fff', boxShadow:'0 8px 24px -8px rgba(20,22,40,.14)', display:'flex', alignItems:'center', justifyContent:'center', transform:'rotate(8deg)' }}>
                <Icon style={{ width:28, height:28, color:accent }}/>
              </div>
              <div style={{
                width:'min(320px,82%)', background:'#fff', borderRadius:14, border:'1px solid var(--hairline)',
                boxShadow:'0 8px 24px -8px rgba(20,22,40,.14)', padding:'22px 24px',
              }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-full" style={{ width:36, height:36, background:accent }}/>
                  <div>
                    <div className="font-semibold" style={{ fontSize:14, color:'#1E2233' }}>{a.tab}</div>
                    <div style={{ fontSize:11, color:'#9AA0B0' }}>app.zirva.az</div>
                  </div>
                </div>
                {[78, 92, 64].map((w, i) => (
                  <div key={i} className="mb-2.5">
                    <div className="rounded-full" style={{ height:8, background:'var(--hairline)', overflow:'hidden' }}>
                      <div className="rounded-full" style={{ height:'100%', width:`${w}%`, background:accent, opacity: 0.85 - i*0.18 }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── WHAT WE DO ─── */
function WhatWeDo({ s }) {
  const ref = useFadeUp()
  const L = s.lang
  const cols = [
    {
      icon: BookOpen,
      eyebrow: L==='az' ? 'Kurikulum' : L==='tr' ? 'Müfredat' : 'Curriculum',
      title:   L==='az' ? 'Tədris & Kurikulum' : L==='tr' ? 'Öğretim & Müfredat' : 'Teaching & Curriculum',
      body:    L==='az'
        ? 'IB PYP, MYP, DP, CP və Azərbaycan milli kurikulumu — birgə planlaşdırma, 600+ standart, IBIS inteqrasiyası.'
        : L==='tr'
        ? 'IB PYP, MYP, DP, CP ve Azerbaycan ulusal müfredatı — ortak planlama, 600+ standart, IBIS entegrasyonu.'
        : 'IB PYP, MYP, DP, CP and national curriculum — collaborative planning, 600+ standards, IBIS integration.',
      pts: L==='az'
        ? ['Birgə kurikulum planlaması','600+ daxili standart','IBIS & E-Gov.az inteqrasiyası']
        : L==='tr'
        ? ['Ortak müfredat planlaması','600+ yerleşik standart','IBIS & E-Gov.az entegrasyonu']
        : ['Collaborative curriculum planning','600+ built-in standards','IBIS & E-Gov.az integration'],
    },
    {
      icon: BarChart2,
      eyebrow: L==='az' ? 'Qiymətləndirmə' : L==='tr' ? 'Değerlendirme' : 'Assessment',
      title:   L==='az' ? 'Qiymətləndirmə & Hesabat' : L==='tr' ? 'Değerlendirme & Raporlama' : 'Assessment & Reporting',
      body:    L==='az'
        ? 'IB kriteriyaları, milli 10-ballıq sistem, real vaxt sinxronizasiya, Nazirlik uyğunluqlu hesabatlar.'
        : L==='tr'
        ? 'IB kriter notlandırma, ulusal 10 puanlık sistem, gerçek zamanlı senkronizasyon, Bakanlık uyumlu raporlar.'
        : 'IB criteria grading, national 10-point scale, real-time sync, Ministry-compliant reports.',
      pts: L==='az'
        ? ['IB A–D kriteriya qiymətləndirməsi','Nazirlik uyğunluqlu hesabatlar','E-Gov.az avtomatik ixracı']
        : L==='tr'
        ? ['IB A–D kriter değerlendirmesi','Bakanlık uyumlu raporlar','Otomatik E-Gov.az dışa aktarma']
        : ['IB A–D criteria grading','Ministry-compliant reporting','Automatic E-Gov.az export'],
    },
    {
      icon: MessageSquare,
      eyebrow: L==='az' ? 'Kommunikasiya' : L==='tr' ? 'İletişim' : 'Communication',
      title:   L==='az' ? 'Kommunikasiya & AI' : L==='tr' ? 'İletişim & AI' : 'Communication & AI',
      body:    L==='az'
        ? 'Müəllim-valideyn real vaxt mesajlaşma, məktəb elanları, Zəka AI hesabat köməkçisi — üç dildə.'
        : L==='tr'
        ? 'Gerçek zamanlı öğretmen–veli mesajlaşma, okul duyuruları, Zeka AI rapor asistanı — üç dilde.'
        : 'Real-time teacher–parent messaging, school announcements, Zeka AI report assistant — in three languages.',
      pts: L==='az'
        ? ['Real vaxtda mesajlaşma','Məktəb miqyasında elanlar','Zəka AI — 3 dildə']
        : L==='tr'
        ? ['Gerçek zamanlı mesajlaşma','Okul genelinde duyurular','Zeka AI — 3 dil']
        : ['Real-time messaging','School-wide announcements','Zeka AI — 3 languages'],
    },
  ]

  // One brand accent across all cards (color restraint — saturation lives in avatars/status only).
  const pastelCols = cols.map((c) => ({ ...c, color: '#574FCF', tint: '#E8E6FB' }))

  return (
    <section ref={ref} className="fade-up py-28" style={{ position:'relative' }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8" style={{ position:'relative', zIndex:1 }}>
        <div className="max-w-2xl mb-16">
          <h2 className="font-display font-extrabold leading-tight mb-5"
            style={{ fontSize:'clamp(2rem,4.5vw,3.2rem)', letterSpacing:'-0.02em', color:'#1E2233' }}>
            {L==='az' ? 'Bir platforma.' : L==='tr' ? 'Tek platform.' : 'One platform.'}<br/>
            <span className="pastel-text">{L==='az' ? 'Bütün məktəb əməliyyatları.' : L==='tr' ? 'Her okul operasyonu.' : 'Every school operation.'}</span>
          </h2>
          <p className="text-base leading-relaxed font-normal" style={{ color:'#5A6072' }}>
            {L==='az'
              ? 'Zirva+ məktəb idarəetməsinin hər tərəfini — kurikulumdan kommunikasiyaya, qiymətləndirmədən AI köməkçisinə qədər — vahid platformada birləşdirir.'
              : L==='tr'
              ? 'Zirva+ okul yönetiminin her yönünü — müfredattan iletişime, değerlendirmeden AI asistanına kadar — tek sorunsuz platformda bir araya getirir.'
              : 'Zirva+ brings every aspect of school management — from curriculum to communication, assessment to AI — into one seamless platform.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pastelCols.map(({ icon: Icon, color, tint, title, body, pts }) => (
            <div key={title} className="liquid-card p-8 cursor-default">
              <div className="icon-chip mb-6" style={{ background:tint, color }}>
                <Icon className="w-5 h-5"/>
              </div>
              <h3 className="font-semibold text-lg mb-3 leading-tight" style={{ letterSpacing:'-0.01em', color:'#1E2233' }}>{title}</h3>
              <p className="text-sm leading-relaxed mb-6" style={{ color:'#5A6072' }}>{body}</p>
              <ul className="space-y-2.5">
                {pts.map(p => (
                  <li key={p} className="flex items-center gap-2.5 text-sm font-medium" style={{ color:'#3A3F52' }}>
                    <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ background:tint }}>
                      <Check className="w-2.5 h-2.5" style={{ color }}/>
                    </div>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── SOLUTIONS ─── */
function Solutions({ s }) {
  const ref = useFadeUp()
  const isAz = s.isAz
  const L = s.lang

  const ibCards = [
    { logo:'/pyp.png', title:s.sol_pyp_t, desc:s.sol_pyp_d, to:'/ib-pyp' },
    { logo:'/myp.png', title:s.sol_myp_t, desc:s.sol_myp_d, to:'/ib-myp' },
    { logo:'/dp.png',  title:s.sol_dp_t,  desc:s.sol_dp_d,  to:'/ib-diploma' },
    { logo:'/cp.png',  title:s.sol_cp_t,  desc:s.sol_cp_d,  to:'/ib-career' },
    { logo:null, icon:Building2, title:s.sol_gov_t, desc:s.sol_gov_d, to:'/government-schools', isGov:true },
  ]

  return (
    <section ref={ref} id="solutions" className="fade-up py-28" style={{ position:'relative' }}>
      {/* SVG filter: remove white background from images */}
      <svg width="0" height="0" style={{ position:'absolute' }} aria-hidden="true">
        <defs>
          <filter id="zirvaRemoveWhite" colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  -1 0 0 0 1" result="stepA"/>
            <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 -1 0 0 1" result="stepB"/>
            <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 -1 0 1" result="stepC"/>
            <feBlend in="stepA" in2="stepB" mode="darken" result="ab"/>
            <feBlend in="ab"    in2="stepC" mode="darken"/>
          </filter>
        </defs>
      </svg>

      {/* Pastel blob accents */}

      <div className="max-w-7xl mx-auto px-5 sm:px-8" style={{ position:'relative', zIndex:1 }}>

        {/* ── Header ── */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14">
          <div>
            <h2 className="font-display" style={{ fontSize:'clamp(2rem,4.5vw,3.2rem)', fontWeight:800, letterSpacing:'-0.02em', lineHeight:1.1, color:'#1E2233' }}>
              {L==='az'
                ? <><span className="pastel-text">Hər kurikulum</span><br/>üçün hazırlanmış</>
                : L==='tr'
                ? <>Her müfredat için<br/><span className="pastel-text">hazırlanmış</span></>
                : <>Built for<br/><span className="pastel-text">every curriculum</span></>}
            </h2>
          </div>
          <p className="text-base leading-relaxed font-normal max-w-sm" style={{ color:'#5A6072' }}>{s.sol_sub}</p>
        </div>

        {/* ── IB + Government programmes ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {ibCards.map(({ logo, icon:Icon, title, desc, to, isGov }) => (
            <Link key={title} to={to} className="liquid-card p-6 relative overflow-hidden flex flex-col no-underline"
              style={{ textDecoration:'none' }}>
              <div className="relative flex flex-col h-full">
                <div className="mb-5">
                  {logo ? (
                    <div className="rounded-tile p-2.5 inline-flex" style={{ background:'var(--surface-2)', border:'1px solid var(--hairline)' }}>
                      <img src={logo} alt={title} className="h-9 w-auto object-contain" style={{ mixBlendMode:'multiply' }}/>
                    </div>
                  ) : (
                    <div className="rounded-tile flex items-center justify-center" style={{ width:48, height:48, background:'#E8E6FB' }}>
                      <Icon style={{ width:22, height:22, color:'#574FCF' }}/>
                    </div>
                  )}
                </div>

                <h3 className="font-semibold text-base mb-2 leading-snug" style={{ letterSpacing:'-0.01em', color:'#1E2233' }}>{title}</h3>
                <p className="text-sm leading-relaxed mb-4 flex-1" style={{ color:'#5A6072' }}>{desc}</p>

                <div className="flex items-center justify-between pt-3 mt-auto" style={{ borderTop:'1px solid var(--hairline)' }}>
                  <span style={{ fontSize:10.5, fontWeight:700, color:'#574FCF', letterSpacing:'0.14em', textTransform:'uppercase' }}>
                    {isGov ? (L==='az' ? 'Dövlət' : L==='tr' ? 'Ulusal' : 'National') : (L==='az' ? 'Ətraflı' : L==='tr' ? 'Devamı' : 'Learn more')}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" style={{ color:'#574FCF' }}/>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  )
}

/* ─── FEATURES ─── */
function Features({ s }) {
  const ref = useFadeUp()
  // One brand accent across the grid (color restraint — no rainbow rotation).
  const brand = { c:'#574FCF', t:'#E8E6FB' }
  const grid = [
    { icon:BookOpen,      title:s.tab_curriculum, pts:[s.c1,s.c2,s.c3], ...brand },
    { icon:PenLine,       title:s.tab_teaching,   pts:[s.t1,s.t2,s.t3], ...brand },
    { icon:BarChart2,     title:s.tab_assessment, pts:[s.a1,s.a2,s.a3], ...brand },
    { icon:FileText,      title:s.tab_reports,    pts:[s.r1,s.r2,s.r3], ...brand },
    { icon:ClipboardList, title:s.tab_attendance, pts:[s.at1,s.at2,s.at3], ...brand },
    { icon:MessageSquare, title:s.tab_comms,      pts:[s.co1,s.co2,s.co3], ...brand },
  ]

  return (
    <section ref={ref} id="features" className="fade-up py-28" style={{ position:'relative' }}>

      <div className="max-w-7xl mx-auto px-5 sm:px-8" style={{ position:'relative', zIndex:1 }}>
        <div className="text-center mb-16">
          <h2 className="font-display font-extrabold mb-5"
            style={{ fontSize:'clamp(2rem,4.5vw,3.2rem)', letterSpacing:'-0.02em', color:'#1E2233' }}>
            {s.feat_title} <span className="pastel-text">{s.feat_title_b}</span>
          </h2>
          <p className="text-base max-w-xl mx-auto leading-relaxed" style={{ color:'#5A6072' }}>{s.feat_sub}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
          {grid.map(({ icon:Icon, title, pts, c, t }) => (
            <div key={title} className="liquid-card p-7 cursor-default group">
              <div className="icon-chip mb-5"
                style={{ background:t, color:c }}>
                <Icon className="w-5 h-5"/>
              </div>
              <h3 className="font-semibold text-lg mb-4 leading-snug" style={{ letterSpacing:'-0.01em', color:'#1E2233' }}>{title}</h3>
              <ul className="space-y-2.5">
                {pts.map(p => (
                  <li key={p} className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background:t }}>
                      <Check className="w-2.5 h-2.5" style={{ color:c }}/>
                    </div>
                    <span className="text-sm leading-relaxed" style={{ color:'#5A6072' }}>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link to="/contact" className="btn-pastel">
            {s.feat_cta} <ArrowRight className="w-4 h-4"/>
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ─── HOW IT WORKS (numbered journey) ─── */
function HowItWorks({ s }) {
  const ref = useFadeUp()
  const L = s.lang
  const color = '#574FCF'
  const steps = [
    {
      n: '1', icon: Sliders,
      title: L==='az'?'Qurun':L==='tr'?'Kurun':L==='ru'?'Настройте':'Set up',
      body:  L==='az'?'Məktəbinizi, kurikulumunuzu və sinifləri dəqiqələr içində konfiqurasiya edin.':L==='tr'?'Okulunuzu, müfredatınızı ve sınıfları dakikalar içinde yapılandırın.':L==='ru'?'Настройте школу, учебный план и классы за считанные минуты.':'Configure your school, curriculum and classes in minutes.',
    },
    {
      n: '2', icon: Users,
      title: L==='az'?'Dəvət edin':L==='tr'?'Davet edin':L==='ru'?'Пригласите':'Invite',
      body:  L==='az'?'Müəllimləri, şagirdləri və valideynləri bir kliklə platformaya əlavə edin.':L==='tr'?'Öğretmenleri, öğrencileri ve velileri tek tıkla platforma ekleyin.':L==='ru'?'Добавьте учителей, учеников и родителей одним кликом.':'Add teachers, students and parents with a single click.',
    },
    {
      n: '3', icon: TrendingUp,
      title: L==='az'?'İrəliləyin':L==='tr'?'İlerleyin':L==='ru'?'Развивайтесь':'Grow',
      body:  L==='az'?'Qiymətləndirin, ünsiyyət qurun və Zəka AI ilə hər gün vaxta qənaət edin.':L==='tr'?'Değerlendirin, iletişim kurun ve Zeka AI ile her gün zaman kazanın.':L==='ru'?'Оценивайте, общайтесь и экономьте время каждый день с Зека AI.':'Assess, communicate and save time every day with Zeka AI.',
    },
  ]
  return (
    <section ref={ref} className="fade-up py-28" style={{ position:'relative' }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8" style={{ position:'relative', zIndex:1 }}>
        <div className="text-center mb-16">
          <h2 className="font-display font-extrabold mb-4" style={{ fontSize:'clamp(2rem,4.5vw,3.2rem)', letterSpacing:'-0.02em', color:'#1E2233' }}>
            {L==='az'?'Üç sadə addım':L==='tr'?'Üç basit adım':L==='ru'?'Три простых шага':'Three simple steps'}
          </h2>
          <p className="text-base max-w-md mx-auto" style={{ color:'#5A6072' }}>
            {L==='az'?'Qurmaqdan irəliləməyə qədər — dəqiqələr, həftələr deyil.':L==='tr'?'Kurmaktan büyümeye — dakikalar, haftalar değil.':L==='ru'?'От настройки до роста — за минуты, а не недели.':'From setup to growth — minutes, not weeks.'}
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* journey line connecting the circles (desktop) */}
          <div aria-hidden="true" className="journey-line hidden md:block" style={{ position:'absolute', top:34, left:'16%', right:'16%', height:3, zIndex:0 }}/>
          {steps.map(({ n, icon:Icon, title, body }) => (
            <div key={n} className="relative text-center flex flex-col items-center" style={{ zIndex:1 }}>
              <div className="relative mb-6">
                <div className="rounded-full flex items-center justify-center" style={{ width:70, height:70, background:color, boxShadow:'0 8px 24px -8px rgba(20,22,40,.14)' }}>
                  <Icon style={{ width:28, height:28, color:'#fff' }}/>
                </div>
                <span className="font-display absolute -top-2 -right-2 rounded-full flex items-center justify-center" style={{ width:28, height:28, background:'#fff', border:`2px solid ${color}`, color, fontSize:14, fontWeight:800 }}>{n}</span>
              </div>
              <h3 className="font-semibold text-lg mb-2" style={{ color:'#1E2233' }}>{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color:'#5A6072', maxWidth:300 }}>{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── PRODUCT SHOWCASE ─── */
function ProductShowcase({ s }) {
  const ref = useFadeUp()
  const isAz = s.isAz
  const L = s.lang
  const bullets = [
    { icon:BookOpen,  text:s.c1  },
    { icon:BarChart2, text:s.a1  },
    { icon:FileText,  text:s.r1  },
    { icon:Clock,     text:s.at1 },
  ]
  return (
    <section ref={ref} className="fade-up py-28" style={{ position:'relative' }}>

      <div className="max-w-7xl mx-auto px-5 sm:px-8" style={{ position:'relative', zIndex:1 }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left */}
          <div>
            <h2 className="font-display font-extrabold leading-tight mb-6"
              style={{ fontSize:'clamp(2.2rem,4.5vw,3.2rem)', letterSpacing:'-0.02em', color:'#1E2233' }}>
              {L==='az'
                ? <>Hər şey<br/>bir yerdə,<br/><span className="pastel-text">real vaxtda.</span></>
                : L==='tr'
                ? <>Her şey<br/>bir arada,<br/><span className="pastel-text">gerçek zamanlı.</span></>
                : <>Everything<br/>together,<br/><span className="pastel-text">in real time.</span></>}
            </h2>
            <p className="text-base leading-relaxed mb-10" style={{ maxWidth:400, color:'#5A6072' }}>{s.feat_sub}</p>
            <ul className="space-y-3.5 mb-12">
              {bullets.map(({ icon:Icon, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background:'#DCFCE7' }}>
                    <Check className="w-3 h-3" style={{ color:'#16A34A' }}/>
                  </div>
                  <span className="text-sm font-medium" style={{ color:'#3A3F52' }}>{text}</span>
                </li>
              ))}
            </ul>
            <Link to="/contact" className="btn-pastel">
              {s.feat_cta} <ArrowRight className="w-4 h-4"/>
            </Link>
          </div>

          {/* Right */}
          <div className="liquid-card overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom:'1px solid var(--hairline)' }}>
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color:'#9AA0B0', letterSpacing:'0.18em' }}>{s.tab_assessment}</span>
              <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background:'#DCFCE7', color:'#15803D' }}>IB MYP · 9A</span>
            </div>
            <div className="p-6">
              <FeatureVisual idx={2} s={s}/>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

/* ─── ZEKA AI ─── */
function ZekaAI({ s }) {
  const ref = useFadeUp()
  const isAz = s.isAz
  const L = s.lang
  const periwinkle = '#574FCF'
  const mint = '#1FA855'
  return (
    <section ref={ref} id="zeka" className="fade-up py-28" style={{ position:'relative' }}>

      <div className="max-w-7xl mx-auto px-5 sm:px-8" style={{ position:'relative', zIndex:1 }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left */}
          <div>
            <h2 className="font-display font-extrabold leading-tight mb-6"
              style={{ fontSize:'clamp(2.2rem,4.5vw,3.2rem)', letterSpacing:'-0.02em', color:'#1E2233' }}>
              {L==='az'
                ? <>Müəllimin<br/><span className="pastel-text">ən güclü köməkçisi</span></>
                : L==='tr'
                ? <>Öğretmenin<br/><span className="pastel-text">en güçlü aracı</span></>
                : <>The teacher's<br/><span className="pastel-text">most powerful tool</span></>}
            </h2>

            <p className="text-base leading-relaxed mb-10" style={{ maxWidth:400, color:'#5A6072' }}>
              {L==='az'
                ? 'Claude AI ilə gücləndirilmiş Zəka AI hesabat yazır, qiymətlər analiz edir, valideyn xülasələri hazırlayır — Azərbaycan, ingilis və rus dillərində.'
                : L==='tr'
                ? 'Claude AI ile güçlendirilmiş Zeka AI raporlar yazar, notları analiz eder, veli özetleri hazırlar — Azerbaycanca, İngilizce ve Rusça.'
                : 'Powered by Claude AI, Zeka AI writes reports, analyses grades, and prepares parent summaries — in Azerbaijani, English, and Russian.'}
            </p>

            <ul className="space-y-3.5 mb-12">
              {[s.z3, s.z2, s.z4, s.z1].map(item => (
                <li key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background:`${periwinkle}25` }}>
                    <Check className="w-3 h-3" style={{ color:periwinkle }}/>
                  </div>
                  <span className="text-sm font-medium" style={{ color:'#3A3F52' }}>{item}</span>
                </li>
              ))}
            </ul>

            <Link to="/contact" className="btn-pastel">
              {L==='az' ? 'Zəka AI ilə tanış ol' : L==='tr' ? 'Zeka AI ile tanış ol' : 'Meet Zeka AI'} <ArrowRight className="w-4 h-4"/>
            </Link>
          </div>

          {/* Right: liquid glass chat card */}
          <div className="liquid-card overflow-hidden">

            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom:'1px solid var(--hairline)', background:'#FBFBFE' }}>
              <div className="w-10 h-10 rounded-tile flex items-center justify-center shrink-0" style={{ background:periwinkle }}>
                <Sparkles className="w-4 h-4 text-white"/>
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color:'#1E2233' }}>Zəka AI</p>
                <p className="text-[11px] font-medium flex items-center gap-1.5" style={{ color:mint }}>
                  <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background:mint, boxShadow:`0 0 6px ${mint}` }}/>
                  Online
                </p>
              </div>
              <div className="ml-auto">
                <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                  style={{ background:`${periwinkle}15`, color:periwinkle, border:`1px solid ${periwinkle}25` }}>
                  Claude AI
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="p-5 space-y-4" style={{ minHeight:300, background:'#fff' }}>
              <div className="flex justify-end">
                <div className="text-white text-sm px-4 py-2.5 rounded-2xl rounded-tr-sm" style={{ maxWidth:240, background:periwinkle }}>
                  {L==='az' ? 'IB MYP kriteriyaları üzrə hesabat yaz' : L==='tr' ? 'IB MYP kriterleri için rapor yaz' : 'Write an IB MYP criteria report'}
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background:periwinkle }}>
                  <Sparkles className="w-3.5 h-3.5 text-white"/>
                </div>
                <div className="rounded-2xl rounded-tl-sm px-4 py-3"
                  style={{ background:'#fff', border:'1px solid var(--hairline)', boxShadow:'0 1px 2px rgba(20,22,40,.05)', maxWidth:260 }}>
                  <p className="text-sm font-semibold mb-2" style={{ color:'#1E2233' }}>
                    {L==='az' ? 'Hesabat hazırlanır...' : L==='tr' ? 'Rapor hazırlanıyor...' : 'Generating report...'}
                  </p>
                  <div className="space-y-1.5">
                    {[
                      { label: L==='az'?'A kriteriyas:':L==='tr'?'A kriteri:':'Criterion A:', val:'6/8', c:periwinkle },
                      { label: L==='az'?'B kriteriyas:':L==='tr'?'B kriteri:':'Criterion B:', val:'7/8', c:periwinkle },
                      { label: L==='az'?'C kriteriyas:':L==='tr'?'C kriteri:':'Criterion C:', val:'5/8', c:periwinkle },
                    ].map(({ label, val, c }) => (
                      <div key={label} className="flex items-center gap-2">
                        <Check className="w-3 h-3 shrink-0" style={{ color:c }}/>
                        <span className="text-xs" style={{ color:'#5A6072' }}>{label} <strong style={{ color:c }}>{val}</strong></span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <div className="text-white text-sm px-4 py-2.5 rounded-2xl rounded-tr-sm" style={{ maxWidth:240, background:periwinkle }}>
                  {L==='az' ? 'Valideyn üçün qısa xülasə yaz' : L==='tr' ? 'Veli için kısa özet yaz' : 'Write a short summary for parents'}
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background:periwinkle }}>
                  <Sparkles className="w-3.5 h-3.5 text-white"/>
                </div>
                <div className="rounded-2xl rounded-tl-sm px-4 py-3"
                  style={{ background:'#fff', border:'1px solid var(--hairline)', boxShadow:'0 1px 2px rgba(20,22,40,.05)', maxWidth:260 }}>
                  <p className="text-xs leading-relaxed" style={{ color:'#3A3F52' }}>
                    {L==='az'
                      ? 'Şagirdiniz bu rüb əla nəticələr göstərdi. Xüsusilə B kriteriyasında yüksək bal aldı.'
                      : L==='tr'
                      ? 'Öğrenciniz bu çeyrekte mükemmel sonuçlar gösterdi. Özellikle B kriterinde yüksek puan aldı.'
                      : 'Your student showed excellent results this term. Especially strong in Criterion B.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Input */}
            <div className="px-4 py-3 flex items-center gap-3" style={{ borderTop:'1px solid var(--hairline)', background:'#FBFBFE' }}>
              <div className="flex-1 rounded-lg px-4 py-2.5 text-xs" style={{ background:'#fff', border:'1px solid var(--hairline)', color:'#9AA0B0' }}>
                {L==='az' ? 'Zəka AI ilə yazın...' : L==='tr' ? 'Zeka AI ile yazın...' : 'Ask Zeka AI...'}
              </div>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background:periwinkle }}>
                <ArrowRight className="w-4 h-4 text-white"/>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

/* ─── COMPLIANCE ─── */
function Compliance({ s }) {
  const ref = useFadeUp()
  const L = s.lang
  const cards = [
    { icon:Server,    title:s.s1t, desc:s.s1d, label:L==='az'?'AZ Serverləri':L==='tr'?'AZ Sunucuları':'AZ Servers' },
    { icon:Shield,    title:s.s2t, desc:s.s2d, label:'ISO/IEC 27001' },
    { icon:Lock,      title:s.s3t, desc:s.s3d, label:L==='az'?'GDPR Uyğunluğu':L==='tr'?'GDPR Uyumlu':'GDPR Compliant' },
    { icon:Users,     title:s.s4t, desc:s.s4d, label:'24/7' },
  ]

  // One brand accent across compliance cards (color restraint).
  const pastelCards = cards.map((c) => ({ ...c, color: '#574FCF', tint: '#E8E6FB' }))

  return (
    <section ref={ref} className="fade-up py-28" style={{ position:'relative' }}>

      <div className="max-w-7xl mx-auto px-5 sm:px-8" style={{ position:'relative', zIndex:1 }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end mb-16">
          <div>
            <h2 className="font-display font-extrabold leading-tight"
              style={{ fontSize:'clamp(2rem,4vw,3rem)', letterSpacing:'-0.02em', color:'#1E2233' }}>
              {L==='az'
                ? <>Məlumatlarınız<br/><span className="pastel-text">tam qorunur</span></>
                : L==='tr'
                ? <>Verileriniz<br/><span className="pastel-text">tam korunuyor</span></>
                : <>Your data is<br/><span className="pastel-text">fully protected</span></>}
            </h2>
          </div>
          <p className="text-base leading-relaxed" style={{ color:'#5A6072' }}>{s.sec_sub}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {pastelCards.map(({ icon:Icon, title, desc, label, color, tint }) => (
            <div key={title} className="liquid-card p-7 cursor-default group">
              <div className="icon-chip mb-5"
                style={{ background:tint, color }}>
                <Icon className="w-5 h-5"/>
              </div>
              <h3 className="font-semibold text-base mb-2.5 leading-snug" style={{ letterSpacing:'-0.01em', color:'#1E2233' }}>{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color:'#5A6072' }}>{desc}</p>
              <span className="inline-block mt-4 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full" style={{ background:tint, color, letterSpacing:'0.14em' }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── PILOT CTA ─── */
function PilotCTA({ s }) {
  const L = s.lang
  const perks = L==='az' ? [
    { icon:Zap,            label:'Tam giriş',       desc:'Bütün funksiyalar pilot mərhələsində açıqdır' },
    { icon:HeartHandshake, label:'Birgə inkişaf',   desc:'Rəyiniz platformanı birbaşa formalaşdırır'   },
    { icon:Award,          label:'Prioritet dəstək',desc:'Komandamızla birbaşa əlaqə imkanı'            },
  ] : L==='tr' ? [
    { icon:Zap,            label:'Tam erişim',       desc:'Pilot sürecinde tüm özellikler açık'             },
    { icon:HeartHandshake, label:'Ürünü şekillendir',desc:'Geri bildiriminiz geliştirmeyi doğrudan etkiler' },
    { icon:Award,          label:'Öncelikli destek', desc:'Pilot boyunca ekibimizle doğrudan iletişim'      },
  ] : [
    { icon:Zap,            label:'Full access',       desc:'All features open during the pilot phase'       },
    { icon:HeartHandshake, label:'Shape the product', desc:'Your feedback directly influences development'  },
    { icon:Award,          label:'Priority support',  desc:'Direct line to our team throughout the pilot'  },
  ]

  return (
    <section className="py-28" style={{ position:'relative' }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8" style={{ position:'relative', zIndex:10 }}>
        {/* ── Big rounded brand CTA band ── */}
        <div style={{
          position:'relative', overflow:'hidden',
          borderRadius:'clamp(18px,3vw,28px)',
          background:'linear-gradient(135deg, #3E37A6 0%, #4A41C0 45%, #574FCF 100%)',
          boxShadow:'0 24px 60px -20px rgba(20,22,40,0.30)',
          padding:'clamp(48px,7vw,88px) clamp(24px,5vw,64px)',
        }}>
          {/* static corner shapes — subtle, no perpetual motion */}
          <div aria-hidden="true" style={{ position:'absolute', top:-40, right:-30, width:200, height:200, borderRadius:'50%', background:'rgba(255,255,255,0.08)' }}/>
          <div aria-hidden="true" style={{ position:'absolute', bottom:-60, left:-40, width:240, height:240, borderRadius:'50%', background:'rgba(255,255,255,0.06)' }}/>

          <div className="relative text-center" style={{ zIndex:1 }}>
            {/* Headline */}
            <h2 className="font-display" style={{ fontSize:'clamp(2.2rem,5.5vw,4.4rem)', fontWeight:800, color:'#fff', lineHeight:1.06, letterSpacing:'-0.02em', marginBottom:20 }}>
              {L==='az'
                ? <>Məktəbiniz<br/>gələcəyi formalaşdırsın</>
                : L==='tr'
                ? <>Okulunuz<br/>geleceği şekillendirsin</>
                : <>Your school could<br/>shape what's next</>}
            </h2>

            {/* Sub */}
            <p style={{ color:'rgba(255,255,255,0.85)', fontSize:17, lineHeight:1.7, maxWidth:520, margin:'0 auto 36px', fontWeight:400 }}>
              {L==='az'
                ? 'Azərbaycanda rəqəmsal məktəbin əsasını birlikdə quraq.'
                : L==='tr'
                ? "Azerbaycan'da dijital okul altyapısının temelini birlikte atalım."
                : 'Join our founding school cohort and help define the future of school management in Azerbaijan.'}
            </p>

            {/* CTAs */}
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link to="/contact" className="inline-flex items-center gap-2 font-semibold transition-transform hover:-translate-y-0.5"
                style={{ background:'#fff', color:'#3E37A6', padding:'14px 30px', borderRadius:999, fontSize:15, textDecoration:'none', boxShadow:'0 8px 24px -8px rgba(20,22,40,0.30)' }}>
                {L==='az' ? 'Müraciət et' : L==='tr' ? 'Başvur' : 'Apply now'} <ArrowRight className="w-4 h-4"/>
              </Link>
              <Link to="/about" className="inline-flex items-center gap-2 font-semibold transition-colors"
                style={{ background:'rgba(255,255,255,0.14)', color:'#fff', padding:'14px 26px', borderRadius:999, fontSize:15, textDecoration:'none', border:'1px solid rgba(255,255,255,0.3)' }}>
                {L==='az' ? 'Daha çox' : L==='tr' ? 'Daha fazla' : 'Learn more'}
              </Link>
            </div>

            {/* Perks */}
            <div style={{ display:'flex', justifyContent:'center', flexWrap:'wrap', gap:'16px', marginTop:52 }}>
              {perks.map(({ icon:Icon, label, desc }) => (
                <div key={label} style={{ padding:'18px 20px', display:'flex', alignItems:'flex-start', gap:13, maxWidth:280, textAlign:'left', background:'rgba(255,255,255,0.10)', border:'1px solid rgba(255,255,255,0.18)', borderRadius:14 }}>
                  <div style={{ width:38, height:38, borderRadius:10, background:'rgba(255,255,255,0.16)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Icon style={{ width:18, height:18, color:'#fff' }}/>
                  </div>
                  <div>
                    <p style={{ fontWeight:700, color:'#fff', fontSize:14, marginBottom:4 }}>{label}</p>
                    <p style={{ color:'rgba(255,255,255,0.78)', fontSize:12.5, lineHeight:1.6, fontWeight:400 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── BENEFITS ─── */
function Benefits({ s }) {
  const ref = useFadeUp()
  const icons = [Zap, Users, GraduationCap, Sliders, Layers, Award, CheckCircle, Clock]
  const titles = [s.b1t, s.b2t, s.b3t, s.b4t, s.b5t, s.b6t, s.b7t, s.b8t]
  const descs = [s.b1d, s.b2d, s.b3d, s.b4d, s.b5d, s.b6d, s.b7d, s.b8d]
  const cards = icons.map((Icon, i) => ({
    icon: Icon, title: titles[i], desc: descs[i], color: '#574FCF', tint: '#E8E6FB',
  }))
  return (
    <section ref={ref} className="fade-up py-28" style={{ position:'relative' }}>

      <div className="max-w-7xl mx-auto px-5 sm:px-8" style={{ position:'relative', zIndex:1 }}>
        <div className="text-center mb-16">
          <h2 className="font-display font-extrabold mb-4"
            style={{ fontSize:'clamp(1.9rem,4vw,3rem)', letterSpacing:'-0.02em', color:'#1E2233' }}>
            {s.ben_title}
          </h2>
          <p className="text-base max-w-md mx-auto" style={{ color:'#5A6072' }}>{s.ben_sub}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map(({ icon:Icon, title, desc, color, tint }) => (
            <div key={title} className="liquid-card p-6 cursor-default">
              <div className="icon-chip mb-4" style={{ width:44, height:44, background:tint, color }}>
                <Icon className="w-5 h-5"/>
              </div>
              <h3 className="font-semibold text-sm mb-1.5 leading-snug" style={{ letterSpacing:'-0.01em', color:'#1E2233' }}>{title}</h3>
              <p className="text-xs leading-relaxed" style={{ color:'#5A6072' }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── FOOTER ─── */
function Footer({ s }) {
  return (
    <footer style={{ background:'#1E2233', position:'relative', overflow:'hidden' }}>
      {/* Soft brand gleam at top edge */}
      <div className="h-px" style={{ background:'linear-gradient(90deg, transparent, rgba(138,124,232,0.5), transparent)' }}/>
      {/* Subtle brand glow accent */}
      <div style={{ position:'absolute', top:'-30%', left:'-10%', width:'45%', height:'80%', background:'radial-gradient(ellipse at center, rgba(87,79,207,0.20) 0%, transparent 60%)', pointerEvents:'none' }}/>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-20" style={{ position:'relative', zIndex:1 }}>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand — spans 2 on large screens */}
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-5">
              <ZirvaLogo size={30} invert/>
              <span className="text-lg font-bold" style={{ color:'#fff', letterSpacing:'-0.02em' }}>Zirva</span>
            </div>
            <p className="text-sm leading-relaxed mb-6" style={{ color:'rgba(255,255,255,0.5)', maxWidth:280 }}>{s.foot_tagline}</p>
            <a href="mailto:hello@tryzirva.com" className="flex items-center gap-2.5 text-xs mb-2.5 transition-colors" style={{ color:'rgba(255,255,255,0.55)' }}
              onMouseEnter={e => e.currentTarget.style.color='#B3A9F0'}
              onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.55)'}>
              <Mail className="w-3.5 h-3.5 shrink-0" style={{ color:'#B3A9F0' }}/>hello@tryzirva.com
            </a>
            <a href="tel:+994991106600" className="flex items-center gap-2.5 text-xs transition-colors" style={{ color:'rgba(255,255,255,0.55)' }}
              onMouseEnter={e => e.currentTarget.style.color='#B3A9F0'}
              onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.55)'}>
              <Phone className="w-3.5 h-3.5 shrink-0" style={{ color:'#B3A9F0' }}/>+994 99 110 66 00
            </a>
          </div>
          {/* Programmes */}
          <div>
            <h4 className="font-bold text-[11px] tracking-widest uppercase mb-5" style={{ color:'#fff', letterSpacing:'0.18em' }}>{s.foot_col1}</h4>
            <ul className="space-y-3">
              {[
                { label:s.fl1, to:'/ib-pyp' },
                { label:s.fl2, to:'/ib-myp' },
                { label:s.fl3, to:'/ib-diploma' },
                { label:s.fl4, to:'/ib-career' },
                { label:s.fl5, to:'/government-schools' },
              ].map(({ label, to }) => (
                <li key={label}><Link to={to} className="text-xs font-medium transition-colors" style={{ color:'rgba(255,255,255,0.5)' }}
                  onMouseEnter={e => e.currentTarget.style.color='#B3A9F0'}
                  onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.5)'}>{label}</Link></li>
              ))}
            </ul>
          </div>
          {/* Resources */}
          <div>
            <h4 className="font-bold text-[11px] tracking-widest uppercase mb-5" style={{ color:'#fff', letterSpacing:'0.18em' }}>{s.foot_col2}</h4>
            <ul className="space-y-3">
              {[
                { label:s.fr1, to:'/about'   },
                { label:s.fr4, to:'/blog'    },
                { label:s.fr6, to:'/contact' },
                { label:s.fr7, to:'/faq' },
              ].map(({ label, to }) => (
                <li key={label}><Link to={to} className="text-xs font-medium transition-colors" style={{ color:'rgba(255,255,255,0.5)' }}
                  onMouseEnter={e => e.currentTarget.style.color='#B3A9F0'}
                  onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.5)'}>{label}</Link></li>
              ))}
            </ul>
          </div>
          {/* Company */}
          <div>
            <h4 className="font-bold text-[11px] tracking-widest uppercase mb-5" style={{ color:'#fff', letterSpacing:'0.18em' }}>{s.foot_col4}</h4>
            <ul className="space-y-3">
              {[
                { label:s.fc1, to:'/about'   },
                { label:s.fc2, to:'/careers' },
                { label:s.fc3, to:'/partners'},
                { label:s.fc4, to:'/contact' },
              ].map(({ label, to }) => (
                <li key={label}><Link to={to} className="text-xs font-medium transition-colors" style={{ color:'rgba(255,255,255,0.5)' }}
                  onMouseEnter={e => e.currentTarget.style.color='#B3A9F0'}
                  onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.5)'}>{label}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        {/* Oversized wordmark + waving mascot */}
        <div className="relative flex items-end justify-between gap-4 mb-6" style={{ overflow:'hidden' }}>
          <span className="font-display select-none" aria-hidden="true" style={{
            fontWeight:800, lineHeight:0.8, letterSpacing:'-0.04em',
            fontSize:'clamp(4rem, 16vw, 13rem)',
            background:'linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.02) 100%)',
            WebkitBackgroundClip:'text', backgroundClip:'text', WebkitTextFillColor:'transparent',
          }}>Zirva</span>
          <div className="hidden sm:block shrink-0" style={{ marginBottom:'1.2vw' }}>
            <Mascot pose="waving" size={96} />
          </div>
        </div>

        <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderColor:'rgba(255,255,255,0.1)' }}>
          <span className="text-xs font-medium" style={{ color:'rgba(255,255,255,0.4)' }}>© 2026 Zirva LLC. {s.foot_rights}</span>
          <div className="flex gap-5">
            <Link to="/privacy" className="text-xs font-medium transition-colors" style={{ color:'rgba(255,255,255,0.5)' }}
              onMouseEnter={e => e.currentTarget.style.color='#B3A9F0'}
              onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.5)'}>{s.foot_privacy}</Link>
            <Link to="/terms" className="text-xs font-medium transition-colors" style={{ color:'rgba(255,255,255,0.5)' }}
              onMouseEnter={e => e.currentTarget.style.color='#B3A9F0'}
              onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.5)'}>{s.foot_terms}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ─── EXPORT ─── */
export default function Landing() {
  const { lang, setLang } = useLang()
  const s = STR[lang] || STR.az
  useSEO({
    title: lang==='az' ? 'Azərbaycanın №1 Məktəb Platforması' : lang==='ru' ? 'Платформа №1 для школ Азербайджана' : lang==='tr' ? "Azerbaycan'ın №1 Okul Platforması" : "Azerbaijan's #1 School Platform",
    description: lang==='az' ? 'Zirva — IB dünya məktəbləri və Azərbaycan dövlət məktəbləri üçün tam rəqəmsal həll. Kurikulum, davamiyyət, Zəka AI və daha çox.' : 'Zirva — complete digital school platform for IB World Schools and Azerbaijani state schools. Curriculum, attendance, Zeka AI and more.',
    canonical: '/',
    keywords: 'məktəb idarəetmə sistemi, school management Azerbaijan, edtech Azerbaijan, IB school platform Azerbaijan, rəqəmsal məktəb',
  })
  return (
    <div className="min-h-screen antialiased" style={{ overflowX:'hidden' }}>
      {/* ── Landing motion + decoration styles (scroll-fade, floats, journey line) ── */}
      <style>{landingStyles}</style>
      {/* ── Fixed pill nav ── */}
      <LandingNav s={s} lang={lang} setLang={setLang} lightHero/>
      {/* ── Hero wrapper — one static brand wash on the warm canvas ── */}
      <div style={{
        position:'relative',
        background:'#F6F6FB',
      }}>
        <Hero s={s}/>
      </div>
      {/* ── Continuous content canvas — calm warm-white, one faint brand wash ── */}
      <div style={{ position:'relative', background:'#F6F6FB', overflow:'hidden' }}>
        {/* Single faint brand wash anchoring the upper content — static, neutral */}
        <div aria-hidden="true" style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:0 }}>
          <div style={{ position:'absolute', width:'80vw', height:'1100px', top:'4%', left:'50%', transform:'translateX(-50%)', background:'radial-gradient(ellipse at center, rgba(87,79,207,0.05) 0%, transparent 68%)', filter:'blur(90px)', borderRadius:'50%' }}/>
        </div>

        {/* Sections render on top of the shared canvas */}
        <div style={{ position:'relative', zIndex:1 }}>
          <PartnerBar s={s}/>
          <StatBand s={s}/>
          <WhatWeDo s={s}/>
          <AudienceSwitcher s={s}/>
          <Solutions s={s}/>
          <Features s={s}/>
          <HowItWorks s={s}/>
          <ProductShowcase s={s}/>
          <ZekaAI s={s}/>
          <Benefits s={s}/>
          <Compliance s={s}/>
          <PilotCTA s={s}/>
        </div>
        {/* Soft fade into dark footer */}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:160, zIndex:1, pointerEvents:'none', background:'linear-gradient(to bottom, transparent 0%, rgba(15,10,35,0.18) 100%)' }}/>
      </div>
      <Footer s={s}/>
    </div>
  )
}
