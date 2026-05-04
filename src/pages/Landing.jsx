import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import {
  BookOpen, Sparkles, MessageSquare, FileText, GraduationCap,
  Users, BarChart2, ArrowRight, Check, Shield, Globe, Menu, X,
  Building2, Lock, Clock, Award, Bell, ClipboardList, ClipboardCheck,
  PenLine, TrendingUp, Calendar, HeartHandshake, LayoutDashboard,
  Mail, HelpCircle, Layers, Star, Zap, CheckCircle, Sliders, Phone,
  Server, ChevronRight
} from 'lucide-react'
import { useLang } from '../contexts/LanguageContext'
import LandingNav from '../components/layout/LandingNav'
import { useSEO } from '../hooks/useSEO'

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

/* ─── Styles ─── */
const globalStyles = `
  body, * { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }

  @keyframes floatY {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-10px); }
  }
  @keyframes floatY2 {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-8px); }
  }
  @keyframes popIn {
    0%   { opacity: 0; transform: scale(0.9) translateY(6px); }
    100% { opacity: 1; transform: scale(1) translateY(0); }
  }

  .float-a  { animation: floatY  6s ease-in-out infinite; }
  .float-b  { animation: floatY2 7.5s ease-in-out infinite 1.2s; }
  .float-c  { animation: floatY  5.5s ease-in-out infinite 0.5s; }
  .pop-in   { animation: popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }

  .nav-link-line { position: relative; }
  .nav-link-line::after {
    content: ''; position: absolute; left: 50%; bottom: -1px;
    width: 0; height: 2px;
    background: linear-gradient(90deg,#534AB7,#1D9E75);
    border-radius: 2px;
    transition: width .22s ease, left .22s ease;
  }
  .nav-link-line:hover::after { width: calc(100% - 16px); left: 8px; }

  .card-lift {
    transition: transform .24s cubic-bezier(.34,1,.64,1), box-shadow .24s ease;
  }
  .card-lift:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 56px rgba(0,0,0,.08), 0 4px 16px rgba(0,0,0,.04);
  }

  .hero-glow-l {
    position:absolute; top:-10%; left:-8%;
    width:52%; height:60%;
    background: radial-gradient(ellipse, rgba(83,74,183,.22) 0%, transparent 70%);
    pointer-events:none;
  }
  .hero-glow-r {
    position:absolute; top:10%; right:-6%;
    width:44%; height:52%;
    background: radial-gradient(ellipse, rgba(29,158,117,.12) 0%, transparent 70%);
    pointer-events:none;
  }
  .hero-glow-b {
    position:absolute; bottom:0; left:25%;
    width:50%; height:30%;
    background: radial-gradient(ellipse, rgba(99,102,241,.15) 0%, transparent 70%);
    pointer-events:none;
  }
  .hero-dots {
    background-image: radial-gradient(rgba(255,255,255,.07) 1px, transparent 1px);
    background-size: 28px 28px;
  }

  .purple-text {
    background: linear-gradient(135deg, #a78bfa 0%, #818cf8 45%, #93c5fd 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* ── Dropdown entry animation ── */
  @keyframes ddIn {
    from { opacity: 0; margin-top: -8px; }
    to   { opacity: 1; margin-top: 0; }
  }
  .dd-animated {
    animation: ddIn 0.17s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  /* ── Scroll-fade-up ── */
  .fade-up {
    opacity: 0;
    transform: translateY(28px);
    transition: opacity 0.55s cubic-bezier(.22,1,.36,1), transform 0.55s cubic-bezier(.22,1,.36,1);
  }
  .fade-up.visible {
    opacity: 1;
    transform: translateY(0);
  }

  /* ── Mobile overrides ── */
  html { overflow-x: hidden; }
  @media(max-width:639px){
    .hero-section { min-height: unset !important; padding-bottom: 80px !important; }
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

/* ══════════════════════════════════════ NAV — moved to LandingNav.jsx ══ */
function Nav({ s, lang, setLang }) {
  const [open, setOpen]             = useState(false)
  const [dropdown, setDropdown]     = useState(null)
  const [mobileOpen, setMobileOpen] = useState(null)
  const [scrolled, setScrolled]     = useState(false)
  const closeTimer = useRef(null)
  const L = s.lang

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 56)
    window.addEventListener('scroll', fn, { passive:true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const openDd  = (name) => { clearTimeout(closeTimer.current); setDropdown(name) }
  const closeDd = ()     => { closeTimer.current = setTimeout(() => setDropdown(null), 150) }
  const keepDd  = ()     => clearTimeout(closeTimer.current)

  const solItems = [
    { to:'/ib-pyp',             logo:'/pyp.png', accent:'#f59e0b', title:L==='az'?'IB İlk İllər (PYP)':L==='tr'?'IB İlk Yıllar (PYP)':'IB Primary Years (PYP)',   desc:L==='az'?'3–12 yaş · Kiçik şagirdlər':L==='tr'?'3–12 yaş · Küçük öğrenciler':'Ages 3–12 · Foundation learning' },
    { to:'/ib-myp',             logo:'/myp.png', accent:'#ef4444', title:L==='az'?'IB Orta İllər (MYP)':L==='tr'?'IB Orta Yıllar (MYP)':'IB Middle Years (MYP)',   desc:L==='az'?'11–16 yaş · Birgə planlaşdırma':L==='tr'?'11–16 yaş · Ortak planlama':'Ages 11–16 · Collaborative planning' },
    { to:'/ib-diploma',         logo:'/dp.png',  accent:'#3b82f6', title:L==='az'?'IB Diploma (DP)':L==='tr'?'IB Diploma (DP)':'IB Diploma (DP)',                  desc:L==='az'?'16–19 yaş · Tam DP dəstəyi':L==='tr'?'16–19 yaş · Tam DP desteği':'Ages 16–19 · Full DP support' },
    { to:'/ib-career',          logo:'/cp.png',  accent:'#a855f7', title:L==='az'?'IB Karyera (CP)':L==='tr'?'IB Kariyer (CP)':'IB Career-Related (CP)',           desc:L==='az'?'16–19 yaş · Karyera yönümlü':L==='tr'?'16–19 yaş · Kariyer odaklı':'Ages 16–19 · Career-focused' },
    { to:'/government-schools', icon:Building2,  accent:'#1D9E75', title:L==='az'?'Dövlət Məktəbləri':L==='tr'?'Devlet Okulları':'Government Schools',             desc:L==='az'?'Nazirlik inteqrasiyası':L==='tr'?'Bakanlık entegrasyonu':'Ministry integration' },
  ]
  const resItems = [
    { to:'/ceo-letter', icon:FileText,     accent:'#534AB7', title:L==='az'?'CEO Məktubu':L==='tr'?'CEO Mektubu':'CEO Letter',                  desc:L==='az'?'Zirva-nın vizyonu':L==='tr'?'Zirva\'nın vizyonu':'Our vision & mission' },
    { to:'/resources',  icon:BookOpen,     accent:'#534AB7', title:L==='az'?'Resurs Kitabxanası':L==='tr'?'Kaynak Kütüphanesi':'Resource Library',desc:L==='az'?'Bələdçilər & şablonlar':L==='tr'?'Rehberler & şablonlar':'Guides & templates' },
    { to:'/blog',       icon:PenLine,      accent:'#534AB7', title:'Blog',                                                                        desc:L==='az'?'Məqalələr & yeniliklər':L==='tr'?'Makaleler & haberler':'Articles & updates' },
    { to:'/contact',    icon:Star,         accent:'#534AB7', title:L==='az'?'Müştəri Rəyləri':L==='tr'?'Müşteri Görüşleri':'Customer Reviews',    desc:L==='az'?'Real istifadəçi hekayələri':L==='tr'?'Gerçek kullanıcı hikayeleri':'Real user stories' },
  ]
  const compItems = [
    { to:'/about',    icon:Users,          accent:'#1D9E75', title:L==='az'?'Haqqımızda':L==='tr'?'Hakkımızda':'About Us',  desc:L==='az'?'Komanda & missiya':L==='tr'?'Ekip & misyon':'Team & mission' },
    { to:'/careers',  icon:TrendingUp,     accent:'#1D9E75', title:L==='az'?'Karyera':L==='tr'?'Kariyer':'Careers',         desc:L==='az'?'Açıq vakansiyalar':L==='tr'?'Açık pozisyonlar':'Open positions' },
    { to:'/partners', icon:HeartHandshake, accent:'#1D9E75', title:L==='az'?'Tərəfdaşlar':L==='tr'?'Ortaklar':'Partners',   desc:L==='az'?'Əməkdaşlıq imkanları':L==='tr'?'Ortaklık fırsatları':'Partnership opportunities' },
    { to:'/contact',  icon:Mail,           accent:'#1D9E75', title:L==='az'?'Əlaqə':L==='tr'?'İletişim':'Contact',          desc:L==='az'?'Bizimlə əlaqə saxla':L==='tr'?'Bize ulaşın':'Get in touch' },
  ]
  const featItems = [
    { to:'/features/curriculum',    icon:BookOpen,       accent:'#7c3aed', title:L==='az'?'Kurikulum İdarəetməsi':L==='tr'?'Müfredat Yönetimi':'Curriculum Management',  desc:L==='az'?'Birgə planlaşdırma, 600+ standart':L==='tr'?'Ortak planlama, 600+ standart':'Collaborative planning, 600+ standards' },
    { to:'/features/assessment',    icon:ClipboardCheck, accent:'#2563eb', title:L==='az'?'Qiymətləndirmə & Jurnal':L==='tr'?'Değerlendirme & Not Defteri':'Assessment & Gradebook', desc:L==='az'?'IB + milli sistem dəstəyi':L==='tr'?'IB + ulusal sistem desteği':'IB + national system support' },
    { to:'/features/attendance',    icon:Calendar,       accent:'#059669', title:L==='az'?'Davamiyyət':L==='tr'?'Devam Takibi':'Attendance',             desc:L==='az'?'Bir toxunuşla qeydiyyat':L==='tr'?'Tek dokunuşla kayıt':'One-tap registration' },
    { to:'/features/reports',       icon:BarChart2,      accent:'#d97706', title:L==='az'?'Hesabatlar & Analitika':L==='tr'?'Raporlar & Analitik':'Reports & Analytics',   desc:L==='az'?'Nazirlik + IB hesabatları':L==='tr'?'Bakanlık + IB raporları':'Ministry + IB reporting' },
    { to:'/features/communication', icon:MessageSquare,  accent:'#0891b2', title:L==='az'?'Kommunikasiya':L==='tr'?'İletişim':'Communication',            desc:L==='az'?'Müəllim-valideyn mesajlaşma':L==='tr'?'Öğretmen-veli mesajlaşma':'Teacher-parent messaging' },
    { to:'/features/timetable',     icon:Clock,          accent:'#7c3aed', title:L==='az'?'Cədvəl İdarəetməsi':L==='tr'?'Program Yönetimi':'Timetable Management',       desc:L==='az'?'Avtomatik cədvəl generatoru':L==='tr'?'Otomatik program oluşturucu':'Auto timetable generator' },
    { to:'/features/student-staff', icon:Users,          accent:'#be185d', title:L==='az'?'Şagird & Heyət':L==='tr'?'Öğrenci & Personel':'Student & Staff',              desc:L==='az'?'Profillər, portfolio, intizam':L==='tr'?'Profiller, portfolyo, disiplin':'Profiles, portfolio, discipline' },
    { to:'/zeka-ai',                icon:Sparkles,       accent:'#6d28d9', title:L==='az'?'Zəka AI':L==='tr'?'Zeka AI':'Zeka AI',                           desc:L==='az'?'AI müəllim köməkçisi':L==='tr'?'AI öğretim asistanı':'AI teaching assistant' },
  ]

  const navItems = [
    { label: s.nav_solutions, key: 'solutions' },
    { label: s.nav_features,  key: 'features'  },
    { label: s.nav_resources, key: 'resources'  },
    { label: L==='az'?'Şirkət':L==='tr'?'Şirket':'Company', key: 'company' },
  ]

  const DdItem = ({ to, logo, icon: Icon, title, desc, accent = '#534AB7' }) => (
    <Link to={to} onClick={() => setDropdown(null)}
      style={{
        display:'flex', alignItems:'flex-start', gap:13, padding:'11px 12px',
        borderRadius:16, textDecoration:'none',
        transition:'background 0.15s ease',
        background:'transparent',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = `${accent}0d` }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
      {/* Icon with gradient tinted background */}
      <div style={{
        width:44, height:44, borderRadius:13, flexShrink:0,
        background:`linear-gradient(135deg, ${accent}28, ${accent}10)`,
        border:`1px solid ${accent}22`,
        display:'flex', alignItems:'center', justifyContent:'center',
        marginTop:1,
      }}>
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

  const ddStyle = {
    position:'absolute', top:'calc(100% + 12px)', zIndex:300,
    background:'#fff', borderRadius:22,
    border:'1px solid rgba(0,0,0,0.07)',
    boxShadow:'0 8px 10px -4px rgba(0,0,0,0.04), 0 24px 60px -8px rgba(0,0,0,0.16)',
    padding:'16px 10px 10px',
  }
  const caretBase = {
    position:'absolute', top:-7, width:13, height:13,
    background:'#fff', border:'1px solid rgba(0,0,0,0.07)',
    borderBottom:'none', borderRight:'none', transform:'rotate(45deg)',
  }

  return (
    <>
      <style>{globalStyles}</style>

      {/* ── Outer wrapper: fixed, always floats in air ── */}
      <header style={{
        position:'fixed', top:0, left:0, right:0, zIndex:50,
        padding: scrolled ? '8px 20px' : '10px 20px 0',
        background:'transparent',
        transition:'padding .3s ease',
      }}>

        {/* ── Inner pill — always pill-shaped, position:relative for mega menus ── */}
        <div style={{
          position:'relative',
          maxWidth:1260, margin:'0 auto',
          background:'rgba(255,255,255,0.94)',
          backdropFilter:'blur(20px)',
          WebkitBackdropFilter:'blur(20px)',
          borderRadius: 999,
          height: 62,
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'0 20px',
          boxShadow: scrolled
            ? '0 4px 24px rgba(0,0,0,0.13), 0 1px 4px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.05)'
            : '0 1px 3px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.12)',
          border: scrolled ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.55)',
          transition:'box-shadow .3s ease, border .3s ease',
        }}>

          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 flex-1">
            <ZirvaLogo size={27} />
            <span className="text-[18px] font-extrabold text-gray-900 tracking-tight">Zirva</span>
          </Link>

          {/* Center nav — triggers only, panels rendered separately below */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navItems.map(({ label, to, key }) => (
              <div key={label}
                onMouseEnter={() => key ? openDd(key) : setDropdown(null)}
                onMouseLeave={key ? closeDd : undefined}
              >
                {to ? (
                  <Link to={to}
                    className="flex items-center px-3.5 py-2 text-[13.5px] text-gray-600 hover:text-gray-900 font-semibold rounded-lg hover:bg-black/[0.05] transition-colors">
                    {label}
                  </Link>
                ) : (
                  <button
                    className="flex items-center gap-1 px-3.5 py-2 text-[13.5px] font-semibold rounded-lg hover:bg-black/[0.05] transition-colors"
                    style={{ color:dropdown===key?'#534AB7':'#4b5563', background:'transparent', border:'none', cursor:'pointer' }}>
                    {label}
                    <ChevronRight className="w-[11px] h-[11px] transition-transform duration-200"
                      style={{ transform:dropdown===key?'rotate(-90deg)':'rotate(90deg)', color:dropdown===key?'#534AB7':'#9ca3af' }}/>
                  </button>
                )}
              </div>
            ))}
          </nav>

          {/* Right actions */}
          <div className="hidden lg:flex items-center gap-1.5" style={{ flex:1, justifyContent:'flex-end' }}>
            <Link to="/daxil-ol"
              className="px-4 py-2 text-[13.5px] text-gray-500 hover:text-gray-900 font-semibold rounded-lg hover:bg-black/[0.05] transition-all">
              {s.nav_signin}
            </Link>
            <Link to="/contact"
              className="inline-flex items-center gap-1.5 text-white text-[13.5px] font-bold px-5 py-[10px] rounded-full transition-all hover:-translate-y-px"
              style={{ background:'#1a0a3e', boxShadow:'0 2px 12px rgba(26,10,62,0.45)' }}>
              {s.nav_demo}
            </Link>
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setOpen(v => !v)}
            className="lg:hidden p-2 text-gray-600 rounded-lg hover:bg-black/[0.06] transition-colors">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* ── Mega menu panels — full pill width, ManageBac style ── */}
          {dropdown && (
            <div style={{ position:'absolute', top:'calc(100% + 10px)', left:0, right:0, zIndex:300 }}
              onMouseEnter={keepDd} onMouseLeave={closeDd}>

              {/* Solutions */}
              {dropdown==='solutions' && (
                <div className="dd-animated" style={{
                  background:'#fff', borderRadius:20,
                  border:'1px solid rgba(0,0,0,0.07)',
                  boxShadow:'0 8px 48px -6px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.05)',
                  padding:'28px 20px 20px',
                }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:0 }}>
                    {/* Col 1 */}
                    <div style={{ paddingRight:20, borderRight:'1px solid rgba(0,0,0,0.06)' }}>
                      <p style={{ fontSize:13.5, fontWeight:700, color:'#111827', marginBottom:12, paddingLeft:12 }}>
                        {L==='az'?'IB Proqramları üçün':L==='tr'?'IB Programları için':'For IB Continuum'}
                      </p>
                      {solItems.slice(0,4).map(item => <DdItem key={item.to} {...item}/>)}
                    </div>
                    {/* Col 2 */}
                    <div style={{ paddingLeft:20 }}>
                      <p style={{ fontSize:13.5, fontWeight:700, color:'#111827', marginBottom:12, paddingLeft:12 }}>
                        {L==='az'?'Milli Kurikulum':L==='tr'?'Ulusal Müfredat':'National Curriculum'}
                      </p>
                      <DdItem {...solItems[4]}/>
                    </div>
                  </div>
                  <div style={{ height:1, background:'rgba(0,0,0,0.06)', margin:'16px 0 14px' }}/>
                  <Link to="/solutions" onClick={() => setDropdown(null)}
                    style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', borderRadius:12, background:'rgba(29,158,117,0.05)', border:'1px solid rgba(29,158,117,0.12)', textDecoration:'none' }}>
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

              {/* Resources */}
              {dropdown==='resources' && (
                <div className="dd-animated" style={{
                  background:'#fff', borderRadius:20,
                  border:'1px solid rgba(0,0,0,0.07)',
                  boxShadow:'0 8px 48px -6px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.05)',
                  padding:'24px 20px 18px',
                }}>
                  <p style={{ fontSize:13.5, fontWeight:700, color:'#111827', marginBottom:12, paddingLeft:12 }}>
                    {L==='az'?'Resurslar':L==='tr'?'Kaynaklar':'Resources'}
                  </p>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)' }}>
                    {resItems.map(item => <DdItem key={item.to} {...item}/>)}
                  </div>
                </div>
              )}

              {/* Features */}
              {dropdown==='features' && (
                <div className="dd-animated" style={{
                  background:'#fff', borderRadius:20,
                  border:'1px solid rgba(0,0,0,0.07)',
                  boxShadow:'0 8px 48px -6px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.05)',
                  padding:'24px 20px 18px',
                }}>
                  <p style={{ fontSize:13.5, fontWeight:700, color:'#111827', marginBottom:12, paddingLeft:12 }}>
                    {L==='az'?'Platform Xüsusiyyətləri':L==='tr'?'Platform Özellikleri':'Platform Features'}
                  </p>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)' }}>
                    {featItems.map(item => <DdItem key={item.to} {...item}/>)}
                  </div>
                  <div style={{ height:1, background:'rgba(0,0,0,0.06)', margin:'12px 0 10px' }}/>
                  <Link to="/features" onClick={() => setDropdown(null)}
                    style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', borderRadius:12, background:'rgba(124,58,237,0.05)', border:'1px solid rgba(124,58,237,0.1)', textDecoration:'none' }}>
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

              {/* Company */}
              {dropdown==='company' && (
                <div className="dd-animated" style={{
                  background:'#fff', borderRadius:20,
                  border:'1px solid rgba(0,0,0,0.07)',
                  boxShadow:'0 8px 48px -6px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.05)',
                  padding:'24px 20px 18px',
                }}>
                  <p style={{ fontSize:13.5, fontWeight:700, color:'#111827', marginBottom:12, paddingLeft:12 }}>
                    {L==='az'?'Şirkət':L==='tr'?'Şirket':'Company'}
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
                { label:s.nav_solutions, key:'solutions', items:solItems },
                { label:s.nav_features,  key:'features',  items:featItems },
                { label:s.nav_resources, key:'resources', items:resItems },
                { label:L==='az'?'Şirkət':L==='tr'?'Şirket':'Company', key:'company', items:compItems },
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
              <Link to="/contact" className="text-white text-sm font-bold px-4 py-2.5 rounded-full"
                style={{ background:'#1a0a3e' }}>{s.nav_demo}</Link>
            </div>
          </div>
        )}
      </header>
    </>
  )
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
  const stats = [
    { label:s.dash_students,   value:'342',  trend:'+12',   icon:Users,        color:'#534AB7', bg:'#ede9fe' },
    { label:s.dash_avg_grade,  value:'7.8',  trend:'↑0.4',  icon:TrendingUp,   color:'#1D9E75', bg:'#d1fae5' },
    { label:s.dash_attendance, value:'94%',  trend:'↑2.1%', icon:CheckCircle,  color:'#3b82f6', bg:'#dbeafe' },
    { label:s.dash_ai,         value:'1.2k', trend:'+180',  icon:Sparkles,     color:'#f59e0b', bg:'#fef3c7' },
  ]
  const timetable = [
    { time:'09:00', subj:s.dash_math,    rm:'301', color:'#534AB7' },
    { time:'10:30', subj:s.dash_physics, rm:'202', color:'#1D9E75' },
    { time:'12:00', subj:s.dash_english, rm:'105', color:'#f59e0b' },
  ]
  const activity = [
    { ev:s.dash_ev1, t:'2m',  color:'#1D9E75', bg:'#d1fae5' },
    { ev:s.dash_ev2, t:'15m', color:'#1D9E75', bg:'#d1fae5' },
    { ev:s.dash_ev3, t:'1h',  color:'#534AB7', bg:'#ede9fe' },
  ]

  const R = { borderRadius:999 }

  return (
    <div style={{ borderRadius:18, overflow:'hidden', border:'1px solid rgba(255,255,255,0.12)', boxShadow:'0 40px 90px -16px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)' }}>

      {/* ── Chrome bar ── */}
      <div style={{ background:'#161224', padding:'10px 16px', display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ display:'flex', gap:6 }}>
          {['#ff5f57','#ffbd2e','#28c840'].map(c => <div key={c} style={{ width:11, height:11, borderRadius:'50%', background:c }}/>)}
        </div>
        <div style={{ flex:1, background:'#221d33', borderRadius:7, padding:'5px 0', fontSize:11, color:'#6b7280', textAlign:'center', maxWidth:280, margin:'0 auto' }}>
          app.zirva.az/admin/dashboard
        </div>
      </div>

      {/* ── App shell ── */}
      <div style={{ display:'flex', height:450, background:'#f5f4fb' }}>

        {/* Sidebar */}
        <div style={{ width:186, background:'#0f0c1b', display:'flex', flexDirection:'column', flexShrink:0 }}>
          {/* Logo */}
          <div style={{ padding:'13px 14px 12px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', gap:9, flexShrink:0 }}>
            <div style={{ width:29, height:29, borderRadius:9, background:'linear-gradient(135deg,#534AB7,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <span style={{ color:'#fff', fontSize:13, fontWeight:800 }}>Z</span>
            </div>
            <div>
              <p style={{ margin:0, color:'#fff', fontSize:13, fontWeight:700, lineHeight:1, letterSpacing:'-0.01em' }}>Zirva</p>
              <p style={{ margin:'2px 0 0', color:'rgba(255,255,255,0.22)', fontSize:8, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase' }}>School Platform</p>
            </div>
          </div>

          {/* Nav */}
          <div style={{ flex:1, padding:'8px 8px 4px' }}>
            {/* Section: Main */}
            <p style={{ margin:'4px 0 5px', fontSize:7.5, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(255,255,255,0.18)', padding:'0 8px' }}>
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
                background: active ? 'rgba(83,74,183,0.22)' : 'transparent',
                border: active ? '1px solid rgba(83,74,183,0.18)' : '1px solid transparent',
              }}>
                {active && <div style={{ position:'absolute', left:0, top:0, bottom:0, width:3, background:'linear-gradient(to bottom,#a78bfa,#6d28d9)', borderRadius:'0 2px 2px 0' }}/>}
                <Icon style={{ width:13, height:13, color: active ? '#a78bfa' : 'rgba(255,255,255,0.28)', flexShrink:0, marginLeft: active ? 5 : 0 }}/>
                <span style={{ fontSize:11, fontWeight: active ? 600 : 400, color: active ? '#ddd6fe' : 'rgba(255,255,255,0.38)' }}>{label}</span>
              </div>
            ))}

            {/* Divider */}
            <div style={{ height:1, background:'rgba(255,255,255,0.05)', margin:'8px 2px' }}/>

            {/* Section: More */}
            <p style={{ margin:'4px 0 5px', fontSize:7.5, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(255,255,255,0.18)', padding:'0 8px' }}>
              {s.lang==='az'?'Əlaqə':s.lang==='tr'?'İletişim':s.lang==='ru'?'Связь':'Comms'}
            </p>
            {[
              { icon:MessageSquare, label:s.tab_comms },
              { icon:FileText, label:s.lang==='az'?'Hesabatlar':s.lang==='tr'?'Raporlar':s.lang==='ru'?'Отчёты':'Reports' },
            ].map(({ icon:Icon, label }) => (
              <div key={label} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 10px', borderRadius:8, marginBottom:1.5 }}>
                <Icon style={{ width:13, height:13, color:'rgba(255,255,255,0.25)', flexShrink:0 }}/>
                <span style={{ fontSize:11, fontWeight:400, color:'rgba(255,255,255,0.35)' }}>{label}</span>
              </div>
            ))}

            {/* Zeka AI pill */}
            <div style={{ margin:'8px 0 0', padding:'7px 10px', borderRadius:9, background:'linear-gradient(135deg,rgba(83,74,183,0.28),rgba(124,58,237,0.16))', border:'1px solid rgba(124,58,237,0.22)', display:'flex', alignItems:'center', gap:8 }}>
              <Sparkles style={{ width:12, height:12, color:'#a78bfa', flexShrink:0 }}/>
              <span style={{ fontSize:11, fontWeight:600, color:'#c4b5fd', flex:1 }}>{s.tab_zeka}</span>
              <span style={{ fontSize:7, fontWeight:800, color:'#a78bfa', letterSpacing:'0.05em', textTransform:'uppercase', background:'rgba(124,58,237,0.25)', padding:'2px 5px', borderRadius:4, flexShrink:0 }}>AI</span>
            </div>
          </div>

          {/* User profile */}
          <div style={{ padding:'10px', borderTop:'1px solid rgba(255,255,255,0.06)', flexShrink:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:9, padding:'7px 8px', borderRadius:9, background:'rgba(255,255,255,0.04)' }}>
              <div style={{ width:26, height:26, borderRadius:'50%', background:'linear-gradient(135deg,#534AB7,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <span style={{ color:'#fff', fontSize:11, fontWeight:800 }}>A</span>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ margin:0, fontSize:10, fontWeight:600, color:'rgba(255,255,255,0.75)', lineHeight:1.1 }}>Admin</p>
                <p style={{ margin:0, fontSize:8, color:'rgba(255,255,255,0.28)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>admin@zirva.az</p>
              </div>
              <ChevronRight style={{ width:10, height:10, color:'rgba(255,255,255,0.18)', flexShrink:0 }}/>
            </div>
          </div>
        </div>

        {/* Main */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>

          {/* Topbar */}
          <div style={{ background:'#fff', borderBottom:'1px solid #eeedf8', padding:'9px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
            <div>
              <p style={{ margin:0, fontSize:12, fontWeight:700, color:'#111827' }}>{s.dash_welcome}</p>
              <p style={{ margin:'2px 0 0', fontSize:10, color:'#9ca3af' }}>{s.dash_school}</p>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ display:'flex', alignItems:'center', gap:5, background:'#f0fdf4', borderRadius:20, padding:'3px 10px', border:'1px solid #bbf7d0' }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:'#22c55e' }}/>
                <span style={{ fontSize:9.5, color:'#16a34a', fontWeight:700 }}>Live</span>
              </div>
              <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,#534AB7,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <span style={{ color:'#fff', fontSize:11, fontWeight:800 }}>A</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, padding:'10px 12px 8px' }}>
            {stats.map(({ label, value, trend, icon: Icon, color, bg }) => (
              <div key={label} style={{ background:'#fff', borderRadius:11, padding:'10px 11px', border:'1px solid #eeedf8', boxShadow:'0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:7 }}>
                  <p style={{ margin:0, fontSize:9, color:'#9ca3af', fontWeight:500 }}>{label}</p>
                  <div style={{ width:22, height:22, borderRadius:7, background:bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Icon style={{ width:11, height:11, color }}/>
                  </div>
                </div>
                <p style={{ margin:0, fontSize:18, fontWeight:800, color:'#111827', lineHeight:1 }}>{value}</p>
                <p style={{ margin:'4px 0 0', fontSize:9, color, fontWeight:700 }}>{trend}</p>
              </div>
            ))}
          </div>

          {/* Panels */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, padding:'0 12px 10px', flex:1, minHeight:0 }}>
            {/* Timetable */}
            <div style={{ background:'#fff', borderRadius:11, padding:'11px 13px', border:'1px solid #eeedf8', overflow:'hidden' }}>
              <p style={{ margin:'0 0 9px', fontSize:10.5, fontWeight:700, color:'#374151' }}>{s.dash_timetable}</p>
              {timetable.map(({ time, subj, rm, color }) => (
                <div key={time} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 0', borderBottom:'1px solid #f5f4fb' }}>
                  <span style={{ fontSize:9, color:'#9ca3af', width:32, flexShrink:0, fontVariantNumeric:'tabular-nums' }}>{time}</span>
                  <div style={{ width:7, height:7, borderRadius:'50%', background:color, flexShrink:0 }}/>
                  <span style={{ fontSize:10.5, color:'#374151', flex:1, fontWeight:500 }}>{subj}</span>
                  <span style={{ fontSize:9, color:'#9ca3af', background:'#f5f4fb', borderRadius:5, padding:'2px 6px', fontWeight:600 }}>{rm}</span>
                </div>
              ))}
            </div>
            {/* Activity */}
            <div style={{ background:'#fff', borderRadius:11, padding:'11px 13px', border:'1px solid #eeedf8', overflow:'hidden' }}>
              <p style={{ margin:'0 0 9px', fontSize:10.5, fontWeight:700, color:'#374151' }}>{s.dash_activity}</p>
              {activity.map(({ ev, t, color, bg }) => (
                <div key={ev} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 0', borderBottom:'1px solid #f5f4fb' }}>
                  <div style={{ width:20, height:20, borderRadius:'50%', background:bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Check style={{ width:10, height:10, color }}/>
                  </div>
                  <span style={{ fontSize:10.5, color:'#374151', flex:1, fontWeight:500, lineHeight:1.3 }}>{ev}</span>
                  <span style={{ fontSize:9, color:'#9ca3af', flexShrink:0 }}>{t}</span>
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
        { label:'Unit 1 · Algebra',    tags:['MYP','DP'], pct:85, c:'teal'   },
        { label:'Unit 2 · Geometry',   tags:['MYP'],      pct:60, c:'purple' },
        { label:'Unit 3 · Statistics', tags:['National'], pct:40, c:'teal'   },
      ].map(({ label, tags, pct, c }) => (
        <div key={label} className="bg-surface rounded-xl p-3.5 border border-border-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-700 text-xs font-medium">{label}</span>
            <div className="flex gap-1">{tags.map(t => <span key={t} className="bg-purple-light text-purple text-[9px] px-1.5 py-0.5 rounded-md font-medium">{t}</span>)}</div>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full"><div className={`h-full rounded-full ${c==='teal'?'bg-teal':'bg-purple'}`} style={{ width:`${pct}%` }}/></div>
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
        { n:'Aytən M.',a:'7',b:'6',g:'7',c:'teal'   },
        { n:'Rauf A.', a:'5',b:'5',g:'5',c:'purple' },
        { n:'Günel H.',a:'8',b:'7',g:'8',c:'teal'   },
        { n:'Nigar Q.',a:'6',b:'6',g:'6',c:'purple' },
      ].map(({ n,a,b,g,c }) => (
        <div key={n} className="bg-white rounded-lg px-3 py-2 grid grid-cols-4 items-center border border-border-soft">
          <span className="text-gray-700 text-[10px] font-medium">{n}</span>
          <span className="text-gray-500 text-[10px]">{a}</span>
          <span className="text-gray-500 text-[10px]">{b}</span>
          <span className={`text-[10px] font-bold ${c==='teal'?'text-teal':'text-purple'}`}>{g}</span>
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
        { n:'Aytən M.',  st:'present',c:'teal'   },
        { n:'Rauf A.',   st:'late',   c:'yellow' },
        { n:'Günel H.',  st:'present',c:'teal'   },
        { n:'Nigar Q.',  st:'absent', c:'red'    },
        { n:'Kamran B.', st:'present',c:'teal'   },
      ].map(({ n,st,c }) => (
        <div key={n} className="bg-white rounded-lg px-3 py-2 flex items-center justify-between border border-border-soft">
          <span className="text-gray-700 text-[10px] font-medium">{n}</span>
          <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${c==='teal'?'bg-teal-light text-teal':c==='yellow'?'bg-yellow-50 text-yellow-600':'bg-red-50 text-red-500'}`}>{st}</span>
        </div>
      ))}
    </div>
  )
  if (idx === 5) return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 bg-purple-light rounded-xl px-3 py-2.5 border border-purple/10">
        <div className="w-7 h-7 bg-purple rounded-full flex items-center justify-center shrink-0"><Sparkles className="w-3.5 h-3.5 text-white"/></div>
        <div><p className="text-[9px] text-purple/60 font-medium">{s.tab_zeka}</p><p className="text-purple text-[10px] leading-snug font-medium">{s.lang==='az'?'Əlbəttə! Gəl addım-addım izah edək...':s.lang==='tr'?'Tabii! Adım adım açıklayalım...':'Of course! Let\'s go through this step by step...'}</p></div>
      </div>
      {[
        { label:'Quadratic equations',sub:'IB MYP · Mathematics',   pct:72 },
        { label:'Essay feedback',      sub:'English Language & Lit', pct:91 },
        { label:'DP Core reflection',  sub:'CAS / TOK',              pct:55 },
      ].map(({ label, sub, pct }) => (
        <div key={label} className="bg-white rounded-xl px-3 py-2.5 border border-border-soft">
          <div className="flex items-center justify-between mb-1.5">
            <div><p className="text-gray-700 text-[10px] font-medium">{label}</p><p className="text-gray-400 text-[9px]">{sub}</p></div>
            <span className="text-teal text-[9px] font-bold">{pct}%</span>
          </div>
          <div className="h-1 bg-gray-100 rounded-full"><div className="h-full bg-teal rounded-full" style={{ width:`${pct}%` }}/></div>
        </div>
      ))}
    </div>
  )
  if (idx === 1) return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-400 text-[10px] font-medium uppercase tracking-wide">{s.lang==='az'?'Tapşırıqlar':s.lang==='tr'?'Ödevler':'Assignments'}</span>
        <span className="bg-purple-light text-purple text-[9px] font-semibold px-2 py-0.5 rounded-full">{s.lang==='az'?'3 aktiv':s.lang==='tr'?'3 aktif':'3 active'}</span>
      </div>
      {[
        { title:'Quadratic Equations – HW',subj:s.dash_math,  due:'20 Apr',pct:68,c:'purple' },
        { title:'Essay: Romeo & Juliet',   subj:s.dash_english,due:'22 Apr',pct:42,c:'teal'   },
        { title:'Lab Report – Titration',  subj:s.lang==='az'?'Kimya':s.lang==='tr'?'Kimya':'Chemistry', due:'25 Apr',pct:85,c:'purple' },
      ].map(({ title, subj, due, pct, c }) => (
        <div key={title} className="bg-white rounded-xl border border-border-soft p-3.5">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div><p className="text-gray-800 text-[11px] font-semibold leading-snug">{title}</p><p className="text-gray-400 text-[9px] mt-0.5">{subj} · {s.lang==='az'?'Son tarix:':s.lang==='tr'?'Son tarih:':'Due:'} {due}</p></div>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${c==='teal'?'bg-teal-light text-teal':'bg-purple-light text-purple'}`}>{pct}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full"><div className={`h-full rounded-full ${c==='teal'?'bg-teal':'bg-purple'}`} style={{ width:`${pct}%` }}/></div>
          <p className="text-gray-400 text-[9px] mt-1">{pct}% {s.lang==='az'?'təhvil verildi':s.lang==='tr'?'teslim edildi':'submitted'}</p>
        </div>
      ))}
    </div>
  )
  if (idx === 3) return (
    <div className="space-y-2.5">
      <div className="bg-white rounded-xl border border-border-soft p-3.5">
        <div className="flex items-center justify-between mb-3">
          <div><p className="text-gray-800 text-[11px] font-semibold">{s.lang==='az'?'Şagird Qiymət Cədvəli':s.lang==='tr'?'Öğrenci Not Tablosu':'Student Grade Sheet'}</p><p className="text-gray-400 text-[9px]">9A · April 2025</p></div>
          <div className="flex gap-1">
            <span className="bg-surface border border-border-soft text-gray-500 text-[8px] font-semibold px-2 py-0.5 rounded-md">PDF</span>
            <span className="bg-surface border border-border-soft text-gray-500 text-[8px] font-semibold px-2 py-0.5 rounded-md">Excel</span>
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="grid grid-cols-4 text-[8px] text-gray-400 font-semibold uppercase tracking-wide pb-1 border-b border-gray-50">
            <span>{s.dash_students}</span><span>{s.dash_math}</span><span>{s.dash_physics}</span><span>{s.lang==='az'?'Ortalama':s.lang==='tr'?'Ortalama':'Average'}</span>
          </div>
          {[
            { n:'Aytən M.',m:'8',p:'7',avg:'7.5',c:'teal' },
            { n:'Rauf A.', m:'6',p:'5',avg:'5.5',c:'red'  },
            { n:'Günel H.',m:'9',p:'8',avg:'8.5',c:'teal' },
          ].map(({ n,m,p,avg,c }) => (
            <div key={n} className="grid grid-cols-4 items-center py-1 border-b border-gray-50 last:border-0">
              <span className="text-gray-700 text-[10px] font-medium">{n}</span>
              <span className="text-gray-500 text-[10px]">{m}</span>
              <span className="text-gray-500 text-[10px]">{p}</span>
              <span className={`text-[10px] font-bold ${c==='teal'?'text-teal':'text-red-500'}`}>{avg}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <div className="flex-1 bg-white rounded-xl border border-border-soft px-3 py-2.5 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-teal/10 flex items-center justify-center shrink-0"><CheckCircle className="w-3.5 h-3.5 text-teal"/></div>
          <div><p className="text-gray-700 text-[10px] font-medium">{s.lang==='az'?'E-Gov.az ixracı':s.lang==='tr'?'E-Gov.az dışa aktarma':'E-Gov.az export'}</p><p className="text-teal text-[9px]">{s.lang==='az'?'Hazır':s.lang==='tr'?'Hazır':'Ready'}</p></div>
        </div>
        <div className="flex-1 bg-white rounded-xl border border-border-soft px-3 py-2.5 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-purple/10 flex items-center justify-center shrink-0"><FileText className="w-3.5 h-3.5 text-purple"/></div>
          <div><p className="text-gray-700 text-[10px] font-medium">IB Audit</p><p className="text-purple text-[9px]">{s.lang==='az'?'Sənədlər hazır':s.lang==='tr'?'Belgeler hazır':'Docs ready'}</p></div>
        </div>
      </div>
    </div>
  )
  if (idx === 6) return (
    <div className="space-y-2">
      <div className="bg-purple-light border border-purple/20 rounded-xl px-3.5 py-2.5 flex items-start gap-2.5">
        <div className="w-6 h-6 rounded-lg bg-purple flex items-center justify-center shrink-0 mt-0.5"><Bell className="w-3 h-3 text-white"/></div>
        <div><p className="text-purple text-[10px] font-semibold">{s.lang==='az'?'Məktəb Elanı':s.lang==='tr'?'Okul Duyurusu':'School Notice'}</p><p className="text-purple/70 text-[9px] leading-snug mt-0.5">{s.lang==='az'?'Yarımillik imtahanlar 12 May tarixindən başlayır.':s.lang==='tr'?'Dönem sonu sınavları 12 Mayıs\'ta başlıyor.':'Mid-year exams start May 12.'}</p></div>
      </div>
      <div className="bg-white rounded-xl border border-border-soft p-3 space-y-2">
        <p className="text-[9px] text-gray-400 font-medium uppercase tracking-wide mb-2">{s.lang==='az'?'Müəllim → Valideyn':s.lang==='tr'?'Öğretmen → Veli':'Teacher → Parent'}</p>
        <div className="flex items-end gap-2">
          <div className="w-6 h-6 rounded-full bg-purple flex items-center justify-center text-white text-[8px] font-bold shrink-0">M</div>
          <div className="bg-surface rounded-xl rounded-bl-md px-3 py-2 max-w-[75%]">
            <p className="text-gray-700 text-[10px] leading-snug">{s.lang==='az'?'Aytənin riyaziyyat nəticəsi bu ay yaxşılaşıb. Təbriklər!':s.lang==='tr'?'Ayten\'in matematik notu bu ay yükseldi. Tebrikler!':'Ayten\'s math score improved this month. Congrats!'}</p>
            <p className="text-gray-400 text-[8px] mt-1">09:42</p>
          </div>
        </div>
        <div className="flex items-end gap-2 flex-row-reverse">
          <div className="w-6 h-6 rounded-full bg-teal flex items-center justify-center text-white text-[8px] font-bold shrink-0">V</div>
          <div className="bg-teal-light rounded-xl rounded-br-md px-3 py-2 max-w-[75%]">
            <p className="text-teal text-[10px] leading-snug">{s.lang==='az'?'Çox sağ olun! Evdə də çox çalışır.':s.lang==='tr'?'Teşekkürler! Evde de çok çalışıyor.':'Thank you! She studies hard at home too.'}</p>
            <p className="text-teal/60 text-[8px] mt-1">09:55</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-border-soft px-3 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500 shrink-0"/><p className="text-gray-700 text-[10px] font-medium">{s.lang==='az'?'3 oxunmamış mesaj':s.lang==='tr'?'3 okunmamış mesaj':'3 unread messages'}</p></div>
        <span className="text-purple text-[9px] font-semibold">{s.lang==='az'?'Hamısına bax →':s.lang==='tr'?'Tümünü gör →':'View all →'}</span>
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

      {/* Bottom fade into white sections below */}
      <div style={{
        position:'absolute', bottom:0, left:0, right:0, height:'22%', zIndex:1, pointerEvents:'none',
        background:'linear-gradient(to top, rgba(10,6,32,0.85) 0%, transparent 100%)',
      }}/>

      {/* ── Content ── */}
      <div className="max-w-5xl mx-auto px-5 sm:px-10 flex flex-col items-center"
        style={{ position:'relative', zIndex:10, paddingTop:'clamp(130px, 18vh, 200px)', paddingBottom:0 }}>

        {/* Headline */}
        <h1 style={{
          textAlign:'center', fontWeight:800,
          fontSize:'clamp(2.8rem, 6vw, 5.5rem)',
          lineHeight:1.08, letterSpacing:'-0.03em',
          color:'#ffffff', marginBottom:24, maxWidth:'20ch',
          textShadow:'0 2px 32px rgba(0,0,0,0.9), 0 1px 8px rgba(0,0,0,0.7)',
        }}>
          {s.hero_h1a}
          <br/>
          <span style={{
            background:'linear-gradient(128deg, #ede9fe 0%, #c4b5fd 35%, #a78bfa 65%, #f0e6ff 100%)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
          }}>
            {s.hero_h1b}
          </span>
        </h1>

        {/* Sub-copy */}
        <p style={{
          textAlign:'center', color:'rgba(255,255,255,0.82)',
          fontSize:'clamp(15px, 1.8vw, 18px)', lineHeight:1.7,
          maxWidth:520, fontWeight:400, marginBottom:44,
          textShadow:'0 1px 16px rgba(0,0,0,0.8)',
        }}>
          {s.hero_sub}
        </p>

        {/* CTAs — outlined first, solid dark second (ManageBac layout) */}
        <div style={{ display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center', marginBottom:72 }}>
          <Link to="/features"
            style={{
              display:'inline-flex', alignItems:'center', gap:8,
              padding:'14px 34px', borderRadius:999,
              border:'1.5px solid rgba(255,255,255,0.38)',
              color:'rgba(255,255,255,0.92)',
              fontWeight:600, fontSize:15.5,
              textDecoration:'none', whiteSpace:'nowrap',
              transition:'all .17s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.6)'; e.currentTarget.style.color='#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background=''; e.currentTarget.style.borderColor='rgba(255,255,255,0.38)'; e.currentTarget.style.color='rgba(255,255,255,0.92)' }}
          >
            {s.hero_cta1}
          </Link>
          <Link to="/contact"
            style={{
              display:'inline-flex', alignItems:'center', gap:8,
              padding:'14px 34px', borderRadius:999,
              background:'#160a36',
              color:'#fff',
              fontWeight:700, fontSize:15.5,
              textDecoration:'none', whiteSpace:'nowrap',
              boxShadow:'0 4px 20px rgba(10,5,30,0.5)',
              transition:'all .17s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 28px rgba(10,5,30,0.6)' }}
            onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 4px 20px rgba(10,5,30,0.5)' }}
          >
            {s.hero_cta2} <ArrowRight style={{ width:15, height:15, flexShrink:0 }}/>
          </Link>
        </div>


        {/* Dashboard area — hidden on small screens */}
        <div className="hidden sm:block" style={{ position:'relative', width:'100%', maxWidth:1000 }}>

          {/* Purple glow behind mockup */}
          <div style={{ position:'absolute', bottom:-20, left:'10%', right:'10%', height:100,
            background:'rgba(83,74,183,0.6)', filter:'blur(55px)', borderRadius:'50%' }}/>

          {/* Floating chip — left */}
          <div className="float-a" style={{
            position:'absolute', zIndex:20, left:-12, top:44,
            background:'rgba(255,255,255,0.92)', backdropFilter:'blur(24px)', WebkitBackdropFilter:'blur(24px)',
            borderRadius:16, padding:'12px 16px',
            boxShadow:'0 20px 56px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.1)',
            border:'1px solid rgba(255,255,255,0.6)',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:11 }}>
              <div style={{ width:38, height:38, borderRadius:10, background:'rgba(83,74,183,0.10)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Sparkles style={{ width:17, height:17, color:'#534AB7' }}/>
              </div>
              <div>
                <p style={{ fontSize:12.5, fontWeight:800, color:'#0d0d1a', lineHeight:1.2, margin:0 }}>Zəka AI</p>
                <p style={{ fontSize:11, fontWeight:600, color:'#1D9E75', display:'flex', alignItems:'center', gap:4, marginTop:3, margin:0 }}>
                  <span style={{ width:5, height:5, borderRadius:'50%', background:'#22c55e', boxShadow:'0 0 6px rgba(34,197,94,0.6)', flexShrink:0, display:'inline-block' }}/>
                  {L==='az'?'Aktiv · Hazır':L==='tr'?'Aktif · Hazır':'Active · Ready'}
                </p>
              </div>
            </div>
          </div>

          {/* Floating chip — right */}
          <div className="float-b" style={{
            position:'absolute', zIndex:20, right:-12, top:60,
            background:'rgba(255,255,255,0.92)', backdropFilter:'blur(24px)', WebkitBackdropFilter:'blur(24px)',
            borderRadius:16, padding:'12px 16px',
            boxShadow:'0 20px 56px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.1)',
            border:'1px solid rgba(255,255,255,0.6)',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:11 }}>
              <div style={{ width:38, height:38, borderRadius:10, background:'rgba(29,158,117,0.10)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <GraduationCap style={{ width:17, height:17, color:'#1D9E75' }}/>
              </div>
              <div>
                <p style={{ fontSize:12.5, fontWeight:800, color:'#0d0d1a', lineHeight:1.2, margin:0 }}>
                  {L==='az'?'IB + Milli Kurikulum':L==='tr'?'IB + Ulusal Müfredat':'IB + National Curriculum'}
                </p>
                <p style={{ fontSize:11, fontWeight:600, color:'#534AB7', display:'flex', alignItems:'center', gap:4, marginTop:3, margin:0 }}>
                  <Check style={{ width:10, height:10 }}/>
                  {L==='az'?'Tam dəstəklənir':L==='tr'?'Tam destekleniyor':'Fully supported'}
                </p>
              </div>
            </div>
          </div>

          {/* Dashboard — flat, ManageBac style */}
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
    <div style={{ background:'#fff', borderTop:'1px solid #f0f0f0', borderBottom:'1px solid #f0f0f0', padding:'28px 0 32px' }}>
      <p style={{ textAlign:'center', fontSize:10, color:'#aaa', fontWeight:700, letterSpacing:'0.22em', textTransform:'uppercase', marginBottom:24 }}>
        {s.trust_title}
      </p>
      <div style={{ position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', left:0, top:0, bottom:0, width:100, zIndex:2, background:'linear-gradient(to right, #fff, transparent)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', right:0, top:0, bottom:0, width:100, zIndex:2, background:'linear-gradient(to left, #fff, transparent)', pointerEvents:'none' }}/>
        <div style={{ display:'flex', alignItems:'center', gap:72, animation:'partnerScroll 28s linear infinite', width:'max-content' }}>
          {track.map(({ name, url, img }, i) => (
            <a key={i} href={url} target="_blank" rel="noopener noreferrer"
              style={{ flexShrink:0, textDecoration:'none', opacity:0.75, transition:'opacity .2s ease' }}
              onMouseEnter={e => e.currentTarget.style.opacity='1'}
              onMouseLeave={e => e.currentTarget.style.opacity='0.75'}>
              <img src={img} alt={name} style={{ height:80, width:'auto', objectFit:'contain', display:'block' }}/>
            </a>
          ))}
        </div>
      </div>
      <style>{`@keyframes partnerScroll { 0%{transform:translateX(0)} 100%{transform:translateX(-33.333%)} }`}</style>
    </div>
  )
}

/* ─── WHAT WE DO ─── */
function WhatWeDo({ s }) {
  const ref = useFadeUp()
  const L = s.lang
  const cols = [
    {
      icon: BookOpen, color: '#534AB7',
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
      icon: BarChart2, color: '#1D9E75',
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
      icon: MessageSquare, color: '#534AB7',
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

  return (
    <section ref={ref} className="fade-up py-28 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="max-w-2xl mb-16">
          <p className="text-purple text-xs font-bold uppercase tracking-widest mb-4">
            {L==='az' ? 'Platforma' : L==='tr' ? 'Platform' : 'Platform'}
          </p>
          <h2 className="font-extrabold text-gray-900 leading-tight mb-5"
            style={{ fontSize:'clamp(2rem,4.5vw,3.2rem)', letterSpacing:'-0.02em' }}>
            {L==='az' ? 'Bir platforma.' : L==='tr' ? 'Tek platform.' : 'One platform.'}<br/>
            <span style={{ color:'#534AB7' }}>{L==='az' ? 'Bütün məktəb əməliyyatları.' : L==='tr' ? 'Her okul operasyonu.' : 'Every school operation.'}</span>
          </h2>
          <p className="text-gray-500 text-base leading-relaxed font-medium">
            {L==='az'
              ? 'Zirva+ məktəb idarəetməsinin hər tərəfini — kurikulumdan kommunikasiyaya, qiymətləndirmədən AI köməkçisinə qədər — vahid platformada birləşdirir.'
              : L==='tr'
              ? 'Zirva+ okul yönetiminin her yönünü — müfredattan iletişime, değerlendirmeden AI asistanına kadar — tek sorunsuz platformda bir araya getirir.'
              : 'Zirva+ brings every aspect of school management — from curriculum to communication, assessment to AI — into one seamless platform.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {cols.map(({ icon: Icon, color, eyebrow, title, body, pts }) => (
            <div key={title} className="card-lift bg-gray-50 border border-gray-100 rounded-2xl p-8 group cursor-default">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-6" style={{ background:`${color}14` }}>
                <Icon className="w-5 h-5" style={{ color }}/>
              </div>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color }}>{eyebrow}</p>
              <h3 className="font-bold text-gray-900 text-xl mb-3 leading-tight" style={{ letterSpacing:'-0.01em' }}>{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6 font-medium">{body}</p>
              <ul className="space-y-2">
                {pts.map(p => (
                  <li key={p} className="flex items-center gap-2.5 text-sm text-gray-600 font-medium">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ background:`${color}18` }}>
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
    { logo:'/pyp.png', title:s.sol_pyp_t, desc:s.sol_pyp_d, age:'3–12',  accent:'#f59e0b', accent2:'#fbbf24', code:'PYP', to:'/ib-pyp' },
    { logo:'/myp.png', title:s.sol_myp_t, desc:s.sol_myp_d, age:'11–16', accent:'#ef4444', accent2:'#f87171', code:'MYP', to:'/ib-myp' },
    { logo:'/dp.png',  title:s.sol_dp_t,  desc:s.sol_dp_d,  age:'16–19', accent:'#3b82f6', accent2:'#60a5fa', code:'DP',  to:'/ib-diploma' },
    { logo:'/cp.png',  title:s.sol_cp_t,  desc:s.sol_cp_d,  age:'16–19', accent:'#a855f7', accent2:'#c084fc', code:'CP',  to:'/ib-career' },
    { logo:null, icon:Building2, title:s.sol_gov_t, desc:s.sol_gov_d, age:'6–18',  accent:'#1D9E75', accent2:'#34d399', code:'GOV', to:'/government-schools', isGov:true },
  ]

  const curriculumPills = [
    { logo:'/pyp.png',  alt:'IB Primary Years',  color:'#f59e0b', to:'/ib-pyp' },
    { logo:'/myp.png',  alt:'IB Middle Years',   color:'#ef4444', to:'/ib-myp' },
    { logo:'/dp.png',   alt:'IB Diploma',        color:'#3b82f6', to:'/ib-diploma' },
    { logo:'/cp.png',   alt:'IB Career-Related', color:'#a855f7', to:'/ib-career' },
    { logo:'/egov.png', alt:L==='az'?'Milli Kurikulum':L==='tr'?'Ulusal Müfredat':'National Curriculum', color:'#1D9E75', to:'/government-schools' },
  ]

  return (
    <section ref={ref} id="solutions" className="fade-up py-28 bg-white">
      {/* SVG filter: remove white background from images */}
      <svg width="0" height="0" style={{ position:'absolute' }} aria-hidden="true">
        <defs>
          <filter id="zirvaRemoveWhite" colorInterpolationFilters="sRGB">
            {/* alpha = 1 - min(R,G,B) — white → transparent, colors preserved */}
            <feColorMatrix type="matrix" values="
              1 0 0 0 0
              0 1 0 0 0
              0 0 1 0 0
              -1 0 0 0 1" result="stepA"/>
            <feColorMatrix in="SourceGraphic" type="matrix" values="
              1 0 0 0 0
              0 1 0 0 0
              0 0 1 0 0
              0 -1 0 0 1" result="stepB"/>
            <feColorMatrix in="SourceGraphic" type="matrix" values="
              1 0 0 0 0
              0 1 0 0 0
              0 0 1 0 0
              0 0 -1 0 1" result="stepC"/>
            {/* intersect the three channel-alphas by taking darkest (min) */}
            <feBlend in="stepA" in2="stepB" mode="darken" result="ab"/>
            <feBlend in="ab"    in2="stepC" mode="darken"/>
          </filter>
        </defs>
      </svg>
      <style>{`
        @keyframes solFloat { 0%,100% { transform:translate(0,0) } 50% { transform:translate(2%,-1%) } }
        @keyframes solPulse { 0%,100% { opacity:.25 } 50% { opacity:.5 } }
        @keyframes solShine {
          0% { transform: translateX(-120%) skewX(-20deg) }
          100% { transform: translateX(260%) skewX(-20deg) }
        }
        .sol-pill { transition: all .25s cubic-bezier(.22,1,.36,1); }
        .sol-pill:hover { transform: translateX(-4px); }
        .sol-cpill { transition: all .3s cubic-bezier(.22,1,.36,1); position: relative; overflow: hidden; }
        .sol-cpill:hover { transform: translateY(-3px); box-shadow: 0 14px 28px -12px var(--cpill-glow, rgba(255,255,255,0.15)); border-color: var(--cpill-border-hover, rgba(255,255,255,0.2)) !important; }
        .sol-cpill:hover .sol-cpill-glow { opacity: 1 !important; }
        .sol-cpill:hover .sol-cpill-shine { animation: solShine 1s cubic-bezier(.22,1,.36,1); }
        .sol-cpill:hover .sol-cpill-arrow { opacity: 1; transform: translateX(2px); }
        .sol-cpill-glow { transition: opacity .3s ease; }
        .sol-cpill-arrow { transition: all .3s ease; opacity: 0; }
        .sol-cpill-shine {
          position:absolute; top:-30%; left:0; width:35%; height:160%;
          background:linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          pointer-events:none;
        }
        .sol-ib-card { transition: all .35s cubic-bezier(.22,1,.36,1); position:relative; }
        .sol-ib-card:hover { transform: translateY(-4px); box-shadow: 0 20px 40px -20px var(--accent-shadow, rgba(15,15,26,0.2)) !important; }
        .sol-ib-card:hover .sol-ib-accent { opacity: 1 !important; transform: scale(1.04); }
        .sol-ib-card:hover .sol-ib-arrow { transform: translateX(3px); opacity:1 !important; }
        .sol-ib-card .sol-ib-accent { transition: all .35s cubic-bezier(.22,1,.36,1); }
        .sol-ib-card .sol-ib-arrow { transition: all .3s ease; }
        .sol-gov-card { transition: all .3s cubic-bezier(.22,1,.36,1); }
        .sol-gov-card:hover { transform: translateY(-2px); box-shadow: 0 15px 35px -15px rgba(29,158,117,0.25); }
      `}</style>
      <div className="max-w-7xl mx-auto px-5 sm:px-8">

        {/* ── Header ── */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
          <div>
            <span className="inline-block text-xs font-bold uppercase tracking-widest mb-5 text-teal">{s.sol_badge}</span>
            <h2 style={{ fontSize:'clamp(2rem,4.5vw,3.2rem)', fontWeight:800, letterSpacing:'-0.025em', lineHeight:1.1, color:'#0f0f1a' }}>
              {L==='az'
                ? <><span style={{ color:'#534AB7' }}>Hər kurikulum</span><br/>üçün hazırlanmış</>
                : L==='tr'
                ? <>Her müfredat için<br/><span style={{ color:'#534AB7' }}>hazırlanmış</span></>
                : <>Built for<br/><span style={{ color:'#534AB7' }}>every curriculum</span></>}
            </h2>
          </div>
          <p className="text-gray-500 text-base leading-relaxed font-medium max-w-sm">{s.sol_sub}</p>
        </div>

        {/* ── IB + Government programmes ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {ibCards.map(({ logo, icon:Icon, title, desc, age, accent, accent2, to, isGov }) => (
            <Link key={title} to={to} className="sol-ib-card rounded-2xl p-7 relative overflow-hidden flex no-underline"
              style={{
                background:'#fff',
                border:'1px solid rgba(15,15,26,0.06)',
                boxShadow:'0 1px 0 rgba(15,15,26,0.02)',
                '--accent-shadow': `${accent}40`,
                textDecoration:'none',
              }}>
              {/* Top accent bar */}
              <div className="sol-ib-accent" style={{ position:'absolute', top:0, left:0, right:0, height:3, background:`linear-gradient(90deg, ${accent}, ${accent2})`, opacity:.6 }}/>
              {/* Corner glow */}
              <div className="sol-ib-accent" style={{ position:'absolute', top:-40, right:-40, width:140, height:140, background:`radial-gradient(circle, ${accent}18 0%, transparent 65%)`, borderRadius:'50%', opacity:.4, pointerEvents:'none' }}/>

              <div className="relative flex flex-col h-full">
                {/* Top row: logo/icon */}
                <div className="mb-5">
                  {logo ? (
                    <div className="rounded-xl p-2 inline-flex" style={{ background:`${accent}08` }}>
                      <img src={logo} alt={title} className="h-10 w-auto object-contain" style={{ mixBlendMode:'multiply' }}/>
                    </div>
                  ) : (
                    <div className="rounded-xl flex items-center justify-center" style={{ width:52, height:52, background:`linear-gradient(135deg, ${accent}18, ${accent2}08)`, border:`1px solid ${accent}22` }}>
                      <Icon style={{ width:22, height:22, color:accent }}/>
                    </div>
                  )}
                </div>

                <h3 className="font-bold text-gray-900 text-base mb-2 leading-snug" style={{ letterSpacing:'-0.01em' }}>{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed font-medium mb-0 flex-1">{desc}</p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 mt-auto" style={{ borderTop:'1px solid rgba(15,15,26,0.05)' }}>
                  <span style={{ fontSize:10.5, fontWeight:700, color:accent, letterSpacing:'0.12em', textTransform:'uppercase' }}>
                    {isGov ? (L==='az' ? 'Dövlət' : L==='tr' ? 'Ulusal' : 'National') : (L==='az' ? 'Ətraflı' : L==='tr' ? 'Devamı' : 'Learn more')}
                  </span>
                  <ArrowRight className="sol-ib-arrow w-3.5 h-3.5" style={{ color:accent, opacity:.55 }}/>
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
  const isAz = s.isAz
  const grid = [
    { icon:BookOpen,      title:s.tab_curriculum, pts:[s.c1,s.c2,s.c3], color:'#534AB7' },
    { icon:PenLine,       title:s.tab_teaching,   pts:[s.t1,s.t2,s.t3], color:'#1D9E75' },
    { icon:BarChart2,     title:s.tab_assessment, pts:[s.a1,s.a2,s.a3], color:'#534AB7' },
    { icon:FileText,      title:s.tab_reports,    pts:[s.r1,s.r2,s.r3], color:'#1D9E75' },
    { icon:ClipboardList, title:s.tab_attendance, pts:[s.at1,s.at2,s.at3], color:'#534AB7' },
    { icon:MessageSquare, title:s.tab_comms,      pts:[s.co1,s.co2,s.co3], color:'#1D9E75' },
  ]

  return (
    <section ref={ref} id="features" className="fade-up py-28 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="text-center mb-14">
          <p className="text-purple text-xs font-bold uppercase tracking-widest mb-4">{s.feat_badge}</p>
          <h2 className="font-extrabold text-gray-900 mb-5"
            style={{ fontSize:'clamp(2rem,4.5vw,3.2rem)', letterSpacing:'-0.02em' }}>
            {s.feat_title} <span style={{ color:'#534AB7' }}>{s.feat_title_b}</span>
          </h2>
          <p className="text-gray-500 text-base max-w-xl mx-auto leading-relaxed font-medium">{s.feat_sub}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {grid.map(({ icon:Icon, title, pts, color }) => (
            <div key={title} className="card-lift bg-gray-50 rounded-2xl p-7 border border-gray-100 cursor-default group">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-200"
                style={{ background:`${color}12` }}>
                <Icon className="w-5 h-5" style={{ color }}/>
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-4 leading-snug" style={{ letterSpacing:'-0.01em' }}>{title}</h3>
              <ul className="space-y-2.5">
                {pts.map(p => (
                  <li key={p} className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background:`${color}16` }}>
                      <Check className="w-2.5 h-2.5" style={{ color }}/>
                    </div>
                    <span className="text-gray-500 text-sm leading-relaxed font-medium">{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link to="/contact"
            className="inline-flex items-center gap-2 bg-purple text-white font-bold text-sm px-7 py-3.5 rounded-xl shadow-lg shadow-purple/25 hover:shadow-xl hover:shadow-purple/35 hover:-translate-y-0.5 transition-all">
            {s.feat_cta} <ArrowRight className="w-4 h-4"/>
          </Link>
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
    <section ref={ref} className="fade-up py-24" style={{ background:'#F7F7FB' }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">

          {/* Left */}
          <div>
            <h2 className="font-extrabold text-gray-900 leading-none mb-5"
              style={{ fontSize:'clamp(2.2rem,4.5vw,3.2rem)', letterSpacing:'-0.03em' }}>
              {L==='az'
                ? <>Hər şey<br/>bir yerdə,<br/><span style={{ color:'#1D9E75' }}>real vaxtda.</span></>
                : L==='tr'
                ? <>Her şey<br/>bir arada,<br/><span style={{ color:'#1D9E75' }}>gerçek zamanlı.</span></>
                : <>Everything<br/>together,<br/><span style={{ color:'#1D9E75' }}>in real time.</span></>}
            </h2>
            <p className="text-gray-400 text-base leading-relaxed mb-10" style={{ maxWidth:380 }}>{s.feat_sub}</p>
            <ul className="space-y-4 mb-12">
              {bullets.map(({ icon:Icon, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <Check className="w-4 h-4 shrink-0" style={{ color:'#1D9E75' }}/>
                  <span className="text-gray-600 text-sm font-medium">{text}</span>
                </li>
              ))}
            </ul>
            <Link to="/contact"
              className="inline-flex items-center gap-2 font-bold text-sm px-6 py-3 rounded-lg text-white transition-all hover:opacity-90"
              style={{ background:'#1D9E75' }}>
              {s.feat_cta} <ArrowRight className="w-4 h-4"/>
            </Link>
          </div>

          {/* Right */}
          <div className="bg-white rounded-3xl overflow-hidden"
            style={{ border:'1px solid rgba(0,0,0,0.06)', boxShadow:'0 2px 40px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom:'1px solid rgba(0,0,0,0.05)' }}>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{s.tab_assessment}</span>
              <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background:'rgba(29,158,117,0.1)', color:'#1D9E75' }}>IB MYP · 9A</span>
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
  return (
    <section ref={ref} id="zeka" className="fade-up py-24 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">

          {/* Left */}
          <div>
            <h2 className="font-extrabold text-gray-900 leading-none mb-5"
              style={{ fontSize:'clamp(2.2rem,4.5vw,3.2rem)', letterSpacing:'-0.03em' }}>
              {L==='az'
                ? <>Müəllimin<br/><span style={{ color:'#534AB7' }}>ən güclü köməkçisi</span></>
                : L==='tr'
                ? <>Öğretmenin<br/><span style={{ color:'#534AB7' }}>en güçlü aracı</span></>
                : <>The teacher's<br/><span style={{ color:'#534AB7' }}>most powerful tool</span></>}
            </h2>

            <p className="text-gray-400 text-base leading-relaxed mb-10" style={{ maxWidth:380 }}>
              {L==='az'
                ? 'Claude AI ilə gücləndirilmiş Zəka AI hesabat yazır, qiymətlər analiz edir, valideyn xülasələri hazırlayır — Azərbaycan, ingilis və rus dillərində.'
                : L==='tr'
                ? 'Claude AI ile güçlendirilmiş Zeka AI raporlar yazar, notları analiz eder, veli özetleri hazırlar — Azerbaycanca, İngilizce ve Rusça.'
                : 'Powered by Claude AI, Zeka AI writes reports, analyses grades, and prepares parent summaries — in Azerbaijani, English, and Russian.'}
            </p>

            <ul className="space-y-4 mb-12">
              {[s.z3, s.z2, s.z4, s.z1].map(item => (
                <li key={item} className="flex items-center gap-3">
                  <Check className="w-4 h-4 shrink-0 text-purple"/>
                  <span className="text-gray-600 text-sm font-medium">{item}</span>
                </li>
              ))}
            </ul>

            <Link to="/contact"
              className="inline-flex items-center gap-2 font-bold text-sm px-6 py-3 rounded-lg text-white transition-all hover:opacity-90"
              style={{ background:'#534AB7' }}>
              {L==='az' ? 'Zəka AI ilə tanış ol' : L==='tr' ? 'Zeka AI ile tanış ol' : 'Meet Zeka AI'} <ArrowRight className="w-4 h-4"/>
            </Link>
          </div>

          {/* Right: chat card */}
          <div className="rounded-3xl overflow-hidden"
            style={{ background:'#F7F7FB', border:'1px solid rgba(83,74,183,0.10)', boxShadow:'0 2px 40px rgba(83,74,183,0.08)' }}>

            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 bg-white" style={{ borderBottom:'1px solid rgba(83,74,183,0.08)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-purple">
                <Sparkles className="w-4 h-4 text-white"/>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Zəka AI</p>
                <p className="text-[11px] font-medium flex items-center gap-1.5 text-teal">
                  <span className="w-1.5 h-1.5 rounded-full inline-block bg-teal"/>
                  Online
                </p>
              </div>
              <div className="ml-auto">
                <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                  style={{ background:'rgba(83,74,183,0.08)', color:'#534AB7' }}>
                  Claude AI
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="p-5 space-y-4" style={{ minHeight:300 }}>
              <div className="flex justify-end">
                <div className="text-white text-sm px-4 py-2.5 rounded-2xl rounded-tr-sm bg-purple" style={{ maxWidth:240 }}>
                  {L==='az' ? 'IB MYP kriteriyaları üzrə hesabat yaz' : L==='tr' ? 'IB MYP kriterleri için rapor yaz' : 'Write an IB MYP criteria report'}
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 bg-purple">
                  <Sparkles className="w-3.5 h-3.5 text-white"/>
                </div>
                <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3"
                  style={{ border:'1px solid rgba(83,74,183,0.10)', maxWidth:260 }}>
                  <p className="text-sm font-semibold text-gray-800 mb-2">
                    {L==='az' ? 'Hesabat hazırlanır...' : L==='tr' ? 'Rapor hazırlanıyor...' : 'Generating report...'}
                  </p>
                  <div className="space-y-1.5">
                    {[
                      { label: L==='az'?'A kriteriyas:':L==='tr'?'A kriteri:':'Criterion A:', val:'6/8', c:'#534AB7' },
                      { label: L==='az'?'B kriteriyas:':L==='tr'?'B kriteri:':'Criterion B:', val:'7/8', c:'#1D9E75' },
                      { label: L==='az'?'C kriteriyas:':L==='tr'?'C kriteri:':'Criterion C:', val:'5/8', c:'#534AB7' },
                    ].map(({ label, val, c }) => (
                      <div key={label} className="flex items-center gap-2">
                        <Check className="w-3 h-3 shrink-0" style={{ color:c }}/>
                        <span className="text-xs text-gray-500">{label} <strong style={{ color:c }}>{val}</strong></span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <div className="text-white text-sm px-4 py-2.5 rounded-2xl rounded-tr-sm bg-purple" style={{ maxWidth:240 }}>
                  {L==='az' ? 'Valideyn üçün qısa xülasə yaz' : L==='tr' ? 'Veli için kısa özet yaz' : 'Write a short summary for parents'}
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 bg-purple">
                  <Sparkles className="w-3.5 h-3.5 text-white"/>
                </div>
                <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3"
                  style={{ border:'1px solid rgba(83,74,183,0.10)', maxWidth:260 }}>
                  <p className="text-xs leading-relaxed text-gray-600">
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
            <div className="px-4 py-3 bg-white flex items-center gap-3" style={{ borderTop:'1px solid rgba(83,74,183,0.08)' }}>
              <div className="flex-1 rounded-lg px-4 py-2.5 text-xs" style={{ background:'rgba(83,74,183,0.05)', border:'1px solid rgba(83,74,183,0.12)', color:'rgba(0,0,0,0.3)' }}>
                {L==='az' ? 'Zəka AI ilə yazın...' : L==='tr' ? 'Zeka AI ile yazın...' : 'Ask Zeka AI...'}
              </div>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background:'#534AB7' }}>
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
    { icon:Server,    title:s.s1t, desc:s.s1d, label:L==='az'?'AZ Serverləri':L==='tr'?'AZ Sunucuları':'AZ Servers', color:'#534AB7' },
    { icon:Shield,    title:s.s2t, desc:s.s2d, label:'ISO/IEC 27001',                                                color:'#1D9E75' },
    { icon:Lock,      title:s.s3t, desc:s.s3d, label:L==='az'?'GDPR Uyğunluğu':L==='tr'?'GDPR Uyumlu':'GDPR Compliant', color:'#534AB7' },
    { icon:Users,     title:s.s4t, desc:s.s4d, label:'24/7',                                                         color:'#1D9E75' },
  ]

  return (
    <section ref={ref} className="fade-up py-28" style={{ background:'#F6F6FC' }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end mb-14">
          <div>
            <p className="text-teal text-xs font-bold uppercase tracking-widest mb-4">{s.sec_badge}</p>
            <h2 className="font-extrabold text-gray-900 leading-tight"
              style={{ fontSize:'clamp(2rem,4vw,3rem)', letterSpacing:'-0.02em' }}>
              {L==='az'
                ? <>Məlumatlarınız<br/><span style={{ color:'#1D9E75' }}>tam qorunur</span></>
                : L==='tr'
                ? <>Verileriniz<br/><span style={{ color:'#1D9E75' }}>tam korunuyor</span></>
                : <>Your data is<br/><span style={{ color:'#1D9E75' }}>fully protected</span></>}
            </h2>
          </div>
          <p className="text-gray-500 text-base leading-relaxed font-medium">{s.sec_sub}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map(({ icon:Icon, title, desc, label, color }) => (
            <div key={title} className="card-lift bg-white rounded-2xl p-7 border border-gray-100 cursor-default group">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200"
                style={{ background:`${color}12` }}>
                <Icon className="w-5 h-5" style={{ color }}/>
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-2.5" style={{ letterSpacing:'-0.01em' }}>{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed font-medium">{desc}</p>
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
    <section style={{ background:'#060614', position:'relative', overflow:'hidden' }} className="py-36">

      {/* ── Background (mirrors Hero) ── */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
        <div style={{ position:'absolute', top:'-30%', left:'-10%', width:'65%', height:'80%', background:'radial-gradient(ellipse at 40% 40%, rgba(99,75,215,0.20) 0%, transparent 65%)' }}/>
        <div style={{ position:'absolute', top:'-20%', right:'-15%', width:'55%', height:'70%', background:'radial-gradient(ellipse at 60% 35%, rgba(65,50,190,0.14) 0%, transparent 62%)' }}/>
        <div style={{ position:'absolute', bottom:'-10%', left:'20%', right:'20%', height:'50%', background:'radial-gradient(ellipse at 50% 80%, rgba(83,74,183,0.13) 0%, transparent 65%)' }}/>
        <div style={{
          position:'absolute', inset:0,
          backgroundImage:'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize:'44px 44px',
          WebkitMaskImage:'radial-gradient(ellipse 70% 60% at 50% 50%, black 0%, transparent 80%)',
          maskImage:'radial-gradient(ellipse 70% 60% at 50% 50%, black 0%, transparent 80%)',
        }}/>
        <div style={{
          position:'absolute', inset:0,
          backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize:'160px 160px', opacity:0.03, mixBlendMode:'overlay',
        }}/>
      </div>

      {/* ── Content ── */}
      <div className="max-w-5xl mx-auto px-5 sm:px-10 text-center" style={{ position:'relative', zIndex:10 }}>


        {/* Headline */}
        <h2 style={{ fontSize:'clamp(2.4rem,6vw,5rem)', fontWeight:800, color:'#fff', lineHeight:1.05, letterSpacing:'-0.03em', marginBottom:24 }}>
          {L==='az'
            ? <>Məktəbiniz<br/><span style={{ color:'#86efac' }}>gələcəyi formalaşdırsın</span></>
            : L==='tr'
            ? <>Okulunuz<br/><span style={{ color:'#86efac' }}>geleceği şekillendirsin</span></>
            : <>Your school could<br/><span style={{ color:'#86efac' }}>shape what's next</span></>}
        </h2>

        {/* Sub */}
        <p style={{ color:'rgba(255,255,255,0.5)', fontSize:15.5, lineHeight:1.7, maxWidth:420, margin:'0 auto 44px', fontWeight:400 }}>
          {L==='az'
            ? 'Azərbaycanda rəqəmsal məktəbin əsasını birlikdə quraq.'
            : L==='tr'
            ? "Azerbaycan'da dijital okul altyapısının temelini birlikte atalım."
            : 'Join our founding school cohort and help define the future of school management in Azerbaijan.'}
        </p>

        {/* CTA */}
        <Link
          to="/contact"
          style={{
            display:'inline-flex', alignItems:'center', gap:9,
            padding:'14px 30px', borderRadius:14,
            background:'linear-gradient(135deg,#7c3aed,#4f46e5)',
            color:'#fff',
            fontWeight:700, fontSize:14.5,
            textDecoration:'none',
            boxShadow:'0 8px 32px rgba(109,40,217,0.45)',
            transition:'transform .17s ease, box-shadow .17s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 14px 40px rgba(109,40,217,0.55)' }}
          onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 8px 32px rgba(109,40,217,0.45)' }}
        >
          {L==='az' ? 'Müraciət et' : L==='tr' ? 'Başvur' : 'Apply now'} <ArrowRight style={{ width:15, height:15 }}/>
        </Link>

        {/* Perks */}
        <div style={{ display:'flex', justifyContent:'center', flexWrap:'wrap', gap:'32px 48px', marginTop:56 }}>
          {perks.map(({ icon:Icon, label, desc }) => (
            <div key={label} style={{ display:'flex', alignItems:'flex-start', gap:14, maxWidth:220, textAlign:'left' }}>
              <div style={{ width:36, height:36, borderRadius:10, background:'rgba(124,58,237,0.22)', border:'1px solid rgba(124,58,237,0.3)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
                <Icon style={{ width:16, height:16, color:'#c4b5fd' }}/>
              </div>
              <div>
                <p style={{ fontWeight:700, color:'rgba(255,255,255,0.9)', fontSize:13.5, marginBottom:4 }}>{label}</p>
                <p style={{ color:'rgba(255,255,255,0.38)', fontSize:12.5, lineHeight:1.6, fontWeight:400 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

/* ─── BENEFITS ─── */
function Benefits({ s }) {
  const ref = useFadeUp()
  const cards = [
    { icon:Zap,            title:s.b1t, desc:s.b1d, color:'#534AB7' },
    { icon:Users,          title:s.b2t, desc:s.b2d, color:'#1D9E75' },
    { icon:GraduationCap,  title:s.b3t, desc:s.b3d, color:'#534AB7' },
    { icon:Sliders,        title:s.b4t, desc:s.b4d, color:'#1D9E75' },
    { icon:Layers,         title:s.b5t, desc:s.b5d, color:'#534AB7' },
    { icon:Award,          title:s.b6t, desc:s.b6d, color:'#1D9E75' },
    { icon:CheckCircle,    title:s.b7t, desc:s.b7d, color:'#534AB7' },
    { icon:Clock,          title:s.b8t, desc:s.b8d, color:'#1D9E75' },
  ]
  return (
    <section ref={ref} className="fade-up py-24" style={{ background:'#F7F7FB' }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="text-center mb-14">
          <p className="text-teal text-xs font-bold uppercase tracking-widest mb-4">{s.ben_badge}</p>
          <h2 className="font-extrabold text-gray-900 mb-4"
            style={{ fontSize:'clamp(1.9rem,4vw,3rem)', letterSpacing:'-0.025em' }}>
            {s.ben_title}
          </h2>
          <p className="text-gray-500 text-base font-medium max-w-md mx-auto">{s.ben_sub}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map(({ icon:Icon, title, desc, color }) => (
            <div key={title} className="card-lift bg-white rounded-2xl p-6 border border-gray-100 cursor-default">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background:`${color}12` }}>
                <Icon className="w-5 h-5" style={{ color }}/>
              </div>
              <h3 className="font-bold text-gray-900 text-sm mb-1.5" style={{ letterSpacing:'-0.01em' }}>{title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
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
    <footer style={{ background:'#09091E' }}>
      <div className="h-px" style={{ background:'linear-gradient(90deg,transparent,rgba(83,74,183,0.55),rgba(29,158,117,0.35),transparent)' }}/>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand — spans 2 on large screens */}
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <ZirvaLogo size={28} invert/>
              <span className="text-lg font-bold text-white">Zirva</span>
            </div>
            <p className="text-xs leading-relaxed mb-5" style={{ color:'rgba(255,255,255,0.35)', maxWidth:220 }}>{s.foot_tagline}</p>
            <a href="mailto:hello@tryzirva.com" className="flex items-center gap-2 text-xs mb-2 hover:text-white transition-colors" style={{ color:'rgba(255,255,255,0.45)' }}>
              <Mail className="w-3.5 h-3.5 text-teal shrink-0"/>hello@tryzirva.com
            </a>
            <a href="tel:+994991106600" className="flex items-center gap-2 text-xs hover:text-white transition-colors" style={{ color:'rgba(255,255,255,0.45)' }}>
              <Phone className="w-3.5 h-3.5 text-teal shrink-0"/>+994 99 110 66 00
            </a>
          </div>
          {/* Programmes */}
          <div>
            <h4 className="text-white font-bold text-xs tracking-widest uppercase mb-5">{s.foot_col1}</h4>
            <ul className="space-y-3">
              {[
                { label:s.fl1, to:'/ib-pyp' },
                { label:s.fl2, to:'/ib-myp' },
                { label:s.fl3, to:'/ib-diploma' },
                { label:s.fl4, to:'/ib-career' },
                { label:s.fl5, to:'/government-schools' },
              ].map(({ label, to }) => (
                <li key={label}><Link to={to} className="text-xs font-medium hover:text-white transition-colors" style={{ color:'rgba(255,255,255,0.45)' }}>{label}</Link></li>
              ))}
            </ul>
          </div>
          {/* Resources */}
          <div>
            <h4 className="text-white font-bold text-xs tracking-widest uppercase mb-5">{s.foot_col2}</h4>
            <ul className="space-y-3">
              {[
                { label:s.fr1, to:'/about'   },
                { label:s.fr4, to:'/blog'    },
                { label:s.fr6, to:'/contact' },
                { label:s.fr7, to:'/faq' },
              ].map(({ label, to }) => (
                <li key={label}><Link to={to} className="text-xs font-medium hover:text-white transition-colors" style={{ color:'rgba(255,255,255,0.45)' }}>{label}</Link></li>
              ))}
            </ul>
          </div>
          {/* Company */}
          <div>
            <h4 className="text-white font-bold text-xs tracking-widest uppercase mb-5">{s.foot_col4}</h4>
            <ul className="space-y-3">
              {[
                { label:s.fc1, to:'/about'   },
                { label:s.fc2, to:'/careers' },
                { label:s.fc3, to:'/partners'},
                { label:s.fc4, to:'/contact' },
              ].map(({ label, to }) => (
                <li key={label}><Link to={to} className="text-xs font-medium hover:text-white transition-colors" style={{ color:'rgba(255,255,255,0.45)' }}>{label}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderColor:'rgba(255,255,255,0.06)' }}>
          <span className="text-xs font-medium" style={{ color:'rgba(255,255,255,0.2)' }}>© 2026 Zirva LLC. {s.foot_rights}</span>
          <div className="flex gap-5">
            <Link to="/privacy" className="text-xs font-medium hover:text-white transition-colors" style={{ color:'rgba(255,255,255,0.35)' }}>{s.foot_privacy}</Link>
            <Link to="/terms"   className="text-xs font-medium hover:text-white transition-colors" style={{ color:'rgba(255,255,255,0.35)' }}>{s.foot_terms}</Link>
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
      {/* ── Fixed pill nav ── */}
      <LandingNav s={s} lang={lang} setLang={setLang} dark/>
      {/* ── Video hero wrapper ── */}
      <div style={{ position:'relative', overflow:'hidden' }}>
        {/* Background video */}
        <video
          autoPlay muted loop playsInline
          style={{
            position:'absolute', inset:0,
            width:'100%', height:'100%',
            objectFit:'cover',
            zIndex:0,
            filter:'saturate(1.4) brightness(1.05) contrast(1.05)',
            willChange:'transform',
          }}
        >
          <source src="/hero-bg.mp4" type="video/mp4"/>
        </video>
        {/* Dark overlay for text legibility */}
        <div style={{
          position:'absolute', inset:0, zIndex:1,
          background:'linear-gradient(to bottom, rgba(4,2,14,0.72) 0%, rgba(4,2,14,0.55) 60%, rgba(4,2,14,0.82) 100%)',
        }}/>
        <Hero s={s}/>
      </div>
      <PartnerBar s={s}/>
      <WhatWeDo s={s}/>
      <Solutions s={s}/>
      <Features s={s}/>
      <ProductShowcase s={s}/>
      <ZekaAI s={s}/>
      <Benefits s={s}/>
      <Compliance s={s}/>
      <PilotCTA s={s}/>
      <Footer s={s}/>
    </div>
  )
}
