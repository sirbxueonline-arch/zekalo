import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import {
  BookOpen, Calendar, Sparkles, MessageSquare, FileText, Award,
  GraduationCap, Users, Heart, Settings, ArrowRight, Check,
  Shield, Globe, Zap, ChevronRight, Menu, X, Landmark, Quote,
  BarChart3, Building2, TrendingUp, Bell, Database, Download
} from 'lucide-react'
import { useLang } from '../contexts/LanguageContext'

/* ─── translations ─── */
const STR = {
  az: {
    announcement_badge: '★ Prezident Fərmanı №530',
    announcement_body: 'Azərbaycan Respublikasının 2025–2028 Süni İntellekt Strategiyasına uyğun platforma',
    nav_features: 'Xüsusiyyətlər',
    nav_ministry: 'Nazirlik Paneli',
    nav_zeka: 'Zəka',
    nav_about: 'Haqqımızda',
    nav_signin: 'Daxil ol',
    nav_signup: 'Pulsuz başla',

    hero_badge: 'Süni İntellekt Strategiyası 2025–2028 çərçivəsində',
    hero_title_1: 'Azərbaycanda',
    hero_title_2: 'Rəqəmsal Məktəb',
    hero_desc: '4,700+ dövlət məktəbini, 1.8 milyon şagirdi və 170,000+ müəllimi vahid rəqəmsal platformada birləşdirən infrastruktur.',
    hero_subdesc: 'Qiymətləndirmə · Davamiyyət · Süni İntellekt Müəllimi · Nazirlik Hesabatları',
    hero_cta_primary: 'Nazirlik Panelini gör',
    hero_cta_secondary: 'Zəkanı tanı',

    hero_panel_label: 'Nazirlik İdarəetmə Paneli',
    hero_panel_country: 'Azərbaycan Respublikası',
    hero_panel_updated: 'Son yenilənmə',
    hero_panel_today: 'Bugün, 09:42',
    hero_schools_active: '{n} məktəb aktiv',
    stat_connected_schools: 'Bağlı Məktəb',
    stat_active_students: 'Aktiv Şagird',
    stat_ai_sessions: 'S.İ. Sessiyası',
    stat_reports: 'Hesabat',
    trend_this_q: '+3 bu rübdə',
    trend_this_month: '+214 bu ay',
    trend_this_week: '+1.2k bu həftə',
    trend_sent: '12/12 göndərildi',
    national_trend: 'Milli Performans Meyli',
    recent_events: 'Son Hadisələr',
    event_1: 'Məktəb №47 hesabat göndərdi',
    event_2: 'Yeni məktəb qoşuldu',
    event_3: 'E-Gov ixracı tamamlandı',

    trust_strip: 'İnteqrasiya və Uyğunluq',

    national_badge: 'Milli İmkan',
    national_title: 'Azərbaycanda Rəqəmsal',
    national_title_2: 'Dönüşümün Miqyası',
    national_desc: 'Ölkəmizdəki bütün məktəbləri bir platformada birləşdirmək — bu bizim hədəfimizdir.',
    nat_card1_label: 'Dövlət Məktəbi',
    nat_card1_desc: 'Azərbaycanda rəqəmsal idarəetmə gözləyən məktəb',
    nat_card2_label: 'Şagird',
    nat_card2_desc: 'Fərdi süni intellekt müəlliminə çıxış əldə edə biləcək şagird',
    nat_card3_label: 'Müəllim',
    nat_card3_desc: 'Rəqəmsal alətlər ilə güclənəcək müəllim',

    features_badge: 'Xüsusiyyətlər',
    features_title: 'Hər şey. Bir yerdə.',
    features_desc: 'Qiymətləndirmədən hesabata, davamiyyətdən süni intellekt müəlliminə — hər ehtiyac bir platformada.',
    feat_demo: 'Demo →',

    feat_grades_t: 'Qiymətləndirmə',
    feat_grades_d: 'IB kriteriyaları (A–D) və milli 10 ballıq şkala. Real vaxt sinxronizasiya.',
    feat_att_t: 'Davamiyyət',
    feat_att_d: 'Bir toxunuşla qeyd. Valideynlər anında xəbərdar olur.',
    feat_zeka_t: 'Zəka',
    feat_zeka_d: 'Claude ilə işləyən şəxsi süni intellekt müəllimi. 3 dildə fərdi yanaşma.',
    feat_msg_t: 'Mesajlaşma',
    feat_msg_d: 'Müəllim-valideyn əlaqəsi real vaxtda. Elanlar və fərdi mesajlar.',
    feat_rep_t: 'Hesabatlar',
    feat_rep_d: 'Nazirlik hesabatları, E-Gov.az inteqrasiyası, PDF ixracı.',
    feat_ibs_t: 'IB & Dövlət',
    feat_ibs_d: 'MYP, DP və dövlət kurikulumu bir platformada.',

    ministry_badge: 'Nazirlik üçün',
    ministry_title_1: 'Tam nəzarət.',
    ministry_title_2: 'Real vaxt görüntü.',
    ministry_desc: 'Nazirlik səviyyəsində idarəetmə, hesabat və analitika — heç bir əlavə müdaxilə olmadan, avtomatik.',

    mt_np_t: 'Milli İzləmə Paneli',
    mt_np_d: 'Bütün bağlı məktəblərin real vaxt statistikası. Performans, davamiyyət, S.İ. istifadəsi — bir ekranda.',
    mt_ar_t: 'Avtomatik Hesabatlar',
    mt_ar_d: 'Bir kliklə tam uyğunluqlu hesabatlar. PDF, Excel, E-Gov.az formatında avtomatik ixrac.',
    mt_ds_t: 'Məlumat Suverenliyi',
    mt_ds_d: 'Bütün təhsil məlumatları Azərbaycan serverlərində saxlanılır. Tam nəzarət dövlət əlindədir.',
    mt_ta_t: 'Trend Analitikası',
    mt_ta_d: 'İllik, rüblük, aylıq müqayisələr. Ən yaxşı və ən zəif performanslı məktəblər — avtomatik aşkar.',
    mt_al_t: 'Ani Bildirişlər',
    mt_al_d: 'Kritik hadisələr baş verəndə nazirlik dərhal xəbərdar olur. Heç bir şey gizli qalmır.',
    mt_eg_t: 'E-Gov İnteqrasiyası',
    mt_eg_d: 'ASAN Xidmət və E-Gov.az ilə tam inteqrasiya. Mövcud dövlət infrastrukturu ilə işləyir.',

    ministry_dash_title: 'Azərbaycan Respublikası Təhsil Nazirliyi',
    ministry_dash_sub: 'Zirva Məktəb İdarəetmə Sistemi — v2.0',
    live: 'Canlı',
    kpi_total_schools: 'Ümumi Məktəb',
    kpi_avg_grade: 'Orta Qiymət',
    kpi_attendance: 'Davamiyyət',
    kpi_ai_usage: 'S.İ. İstifadəsi',
    kpi_trend_3: '+3 bu rübdə',
    kpi_trend_04: '↑ 0.4 artış',
    kpi_trend_21: '↑ 2.1% yaxşılaşma',
    kpi_sessions_this_month: 'sessiya bu ay',
    schools_ranking: 'Məktəb Reytinqi',
    this_quarter: 'Bu rübdə',
    reports_export: 'Hesabat İxracı',
    export_all: 'Hamısını ixrac et',
    report_ready: 'Hazır',
    report_egov_sent: 'E-Gov göndərildi',
    report_preparing: 'Hazırlanır',
    report_schools_12: '12/12 məktəb',
    report_q1: 'Q1 2025 — Rüblük Hesabat',
    report_jan: 'Yanvar — Davamiyyət',
    report_feb: 'Fevral — Davamiyyət',
    report_ib_audit: 'IB Audit 2025',
    report_curriculum: 'Milli Kurikulum Uyğunluğu',

    roles_badge: 'Kimlər üçün',
    roles_title: 'Hər kəs üçün hazır',
    roles_desc: 'Şagirddən administratora — hər istifadəçi öz interfeysi ilə.',
    role_students: 'Şagirdlər',
    role_teachers: 'Müəllimlər',
    role_parents: 'Valideynlər',
    role_admins: 'Adminlər',
    r_s_1: 'Qiymətlərini real vaxtda izləyir',
    r_s_2: 'Zəka ilə fərdi dərs alır',
    r_s_3: 'Tapşırıqları onlayn təhvil verir',
    r_t_1: 'IB kriteriyaları üzrə qiymətləndirir',
    r_t_2: 'Süni intellekt ilə hesabat yazır',
    r_t_3: 'Analitika ilə nəticələri izləyir',
    r_p_1: 'Övladının qiymətlərini görür',
    r_p_2: 'Buraxılmış dərslər barədə xəbərdar olur',
    r_p_3: 'Müəllimlə birbaşa yazışır',
    r_a_1: 'Bütün məktəbi idarə edir',
    r_a_2: 'Nazirlik hesabatları göndərir',
    r_a_3: 'IB və CEESA ixracı',

    zeka_badge: 'Claude ilə gücləndirilmiş',
    zeka_title_1: 'Zəka ilə',
    zeka_title_2: 'tanış olun',
    zeka_desc: 'Zəka — hər şagirdin şəxsi süni intellekt müəllimidir. Hər fənn üzrə izahat verir, IB kriteriyalarına əsasən rəy yazır, öyrənməni fərdiləşdirir.',
    zeka_f1: 'Azərbaycan, ingilis və rus dillərində',
    zeka_f2: 'IB MYP/DP və milli kurikulum üzrə',
    zeka_f3: 'Müəllimlər üçün hesabat və rəy',
    zeka_f4: 'Öyrənmə seriyası ilə motivasiya',
    zeka_f5: 'Süni İntellekt Strategiyası 2025–2028 ilə tam uyğun',
    zeka_cta: 'Zəkanı sına',
    zeka_chat_subject: 'Riyaziyyat · Azərbaycanca',
    zeka_active: 'Aktiv',
    zeka_q: 'Kvadrat tənlikləri sadə dildə izah edə bilərsən?',
    zeka_a_1: 'Əlbəttə! Gəl addım-addım izah edək:',
    zeka_a_2_1: 'Kvadrat tənlik',
    zeka_a_2_2: '— ax² + bx + c = 0 formasındadır.',
    zeka_a_3_1: 'Həll üçün',
    zeka_a_3_2: 'diskriminant',
    zeka_a_3_3: 'tapırıq:',
    zeka_chip_1: 'Davam et',
    zeka_chip_2: 'Nümunə ver',
    zeka_chip_3: 'Test sualları',

    decree_label: 'Rəsmi Sənəd',
    decree_author: 'Azərbaycan Respublikası Prezidenti İlham Əliyev',
    decree_title_1: '№530 saylı Fərman —',
    decree_title_2: 'Süni İntellekt Strategiyası 2025–2028',
    decree_desc: '2025-ci ilin mart ayında imzalanmış bu tarixi fərman, Azərbaycan Respublikasının rəqəmsal gələcəyini müəyyən edir. Zirva bu strategiyanın təhsil sahəsindəki həyata keçiricisidir.',
    decree_pt_1: 'Hər şagirdə fərdi süni intellekt müəllimi hüququ',
    decree_pt_2: 'Rəqəmsal məktəb infrastrukturunun qurulması',
    decree_pt_3: 'Dövlət-texnologiya tərəfdaşlığının genişləndirilməsi',
    decree_pt_4: 'Milli məlumat suverenliyinin qorunması',
    decree_quote: '"Zirva olaraq biz bu strategiyanı təhsil sahəsində həyata keçirmək üçün texnologiya, infrastruktur və hazırlıq baxımından tam hazırıq. Hər məktəb. Hər şagird. Hər bölgə."',
    founder_name: 'Kaan Guluzada',
    founder_role: 'Qurucusu, Zirva',

    impact_badge: 'Pilot Nəticələr',
    impact_title_1: 'Ölçülə bilən',
    impact_title_2: 'nəticələr',
    impact_desc: 'Pilot məktəblərdən toplanan real məlumatlar. Zirvanın tətbiqindən sonra qeydə alınan inkişaf.',

    perf_title: 'Orta Akademik Performans',
    perf_sub: '12 pilot məktəb · 2024–2025 tədris ili',
    perf_growth: 'il ərzindəki artım',
    perf_legend: 'Orta qiymət (10 üzərindən)',
    perf_jan24: 'Yanvar 2024',
    perf_dec24: 'Dekabr 2024',

    ba_title: 'Əvvəl / Sonra',
    ba_sub: 'Pilot məktəblərdə ölçülmüş dəyişim',
    ba_m1: 'Orta qiymət',
    ba_m2: 'Davamiyyət nisbəti',
    ba_m3: 'Müəllim iş yükü',
    ba_m4: 'Hesabat vaxtı',
    ba_m5: 'Valideyn məmnunluğu',
    ba_m3_before: '6 s/gün',
    ba_m3_after: '1.5 s/gün',
    ba_m4_before: '4 saat',
    ba_m4_after: '1 klik',

    sess_title: 'S.İ. Sessiya Artımı',
    sess_sub: 'Aylıq Zəka istifadə dinamikası · 2024',
    sess_trend: '↑ 29× artım',
    sess_jan: '2024 Yanvar: {v} sessiya',
    sess_dec: '2024 Dekabr: {v} sessiya',

    schooltype_title: 'Məktəb Növü',
    schooltype_sub: 'Pilot proqramda iştirak',
    schooltype_count: 'məktəb',
    schooltype_state: 'Dövlət məktəbi',
    schooltype_ib: 'IB Dünya Məktəbi',
    schooltype_private: 'Xüsusi məktəb',

    about_badge: 'Haqqımızda',
    about_title: 'Niyə Zirva yaradıldı?',
    about_card1_title: 'Dövlət məktəbləri geridə qalıb',
    about_card1_p1: 'Azərbaycanda xüsusi və beynəlxalq məktəblər müasir texnologiyalardan istifadə edərkən, dövlət məktəbləri hələ də köhnə üsullarla işləyir.',
    about_card1_p2_1: 'Zirvanın qurucusu',
    about_card1_p2_2: 'inanır ki, hər bir Azərbaycan şagirdi — istər IB məktəbində, istər dövlət məktəbində oxusun — eyni səviyyəli texnologiyaya layiqdir.',

    pillars_title: 'Misiya sütunlarımız',
    p01_t: 'Bərabər imkan',
    p01_d: 'Hər məktəb — dövlət və ya xüsusi — eyni güclü alətlərə çıxış əldə edir.',
    p02_t: 'Süni intellekt ilə təhsil',
    p02_d: 'Prezidentin S.İ. Strategiyası çərçivəsində hər şagirdə fərdi müəllim.',
    p03_t: 'Yerli həll',
    p03_d: 'Azərbaycan üçün, Azərbaycanda yaradılmış. ASAN və E-Gov inteqrasiyası.',

    founder_quote: '"Mən inanıram ki, texnologiya təhsildə bərabərlik yaradır. Bakının mərkəzindəki beynəlxalq məktəbin imkanları ilə rayondakı dövlət məktəbinin imkanları arasında uçurum olmamalıdır. Zirva bu uçurumu bağlamaq üçün yaradılıb."',

    why_badge: 'Fərqimiz',
    why_title: 'Niyə Zirva?',
    why_desc: 'Dünyada mövcud olan həllər yox, Azərbaycan üçün yaradılmış həll.',
    why_c1_t: 'Azərbaycana uyğun',
    why_c1_d: 'ASAN, E-Gov.az inteqrasiyası, Azərbaycan dili, milli kurikulum — yerli ehtiyaclara 100% uyğun.',
    why_c2_t: 'Təhlükəsiz',
    why_c2_d: 'Rol əsaslı giriş nəzarəti, məlumat şifrələməsi, Supabase infrastrukturu. Məlumatlarınız qorunur.',
    why_c3_t: 'Sürətli',
    why_c3_d: 'Real vaxt sinxronizasiya. Müəllim qiymət daxil edir — valideyn saniyələr ərzində görür.',

    cta_badge: 'Növbəti Addım',
    cta_title_1: 'Birlikdə',
    cta_title_2: 'quralım',
    cta_desc: 'Texnologiya hazırdır. Komanda hazırdır. Çatışmayan tək şey — miqyasdır. 4,700+ dövlət məktəbini rəqəmsallaşdırmaq üçün Nazirlik tərəfdaşlığına dəvət edirik.',
    cta_primary: 'Platformu sınayın',
    cta_secondary: 'Nazirlik panelini görün',

    footer_desc: 'Azərbaycanda rəqəmsal məktəbin infrastrukturu',
    footer_decree: 'S.İ. Strategiyası 2025–2028 uyğun',
    footer_col_platform: 'Platforma',
    footer_col_schools: 'Məktəblər',
    footer_col_contact: 'Əlaqə',
    footer_l1: 'Xüsusiyyətlər',
    footer_l2: 'Nazirlik Paneli',
    footer_l3: 'Davamiyyət',
    footer_l4: 'Zəka',
    footer_s1: 'IB məktəbləri',
    footer_s2: 'Dövlət məktəbləri',
    footer_s3: 'MYP proqramı',
    footer_s4: 'DP proqramı',
    footer_city: 'Bakı, Azərbaycan',
    footer_rights: 'Bütün hüquqlar qorunur.',
    footer_privacy: 'Məxfilik siyasəti',
    footer_terms: 'İstifadə şərtləri',

    m_month_jan: 'Yan', m_month_feb: 'Fev', m_month_mar: 'Mar', m_month_apr: 'Apr',
    m_month_may: 'May', m_month_jun: 'İyn', m_month_jul: 'İyl', m_month_aug: 'Avq',
    m_month_sep: 'Eyl', m_month_oct: 'Okt', m_month_nov: 'Noy', m_month_dec: 'Dek',

    marquee_1: 'IB World School', marquee_2: 'MYP', marquee_3: 'DP',
    marquee_4: 'Dövlət Kurikulumu', marquee_5: 'CEESA', marquee_6: 'ASAN Xidmət',
    marquee_7: 'E-Gov.az', marquee_8: 'Claude', marquee_9: 'Real Vaxt Sinxronizasiya',
    marquee_10: 'S.İ. Strategiyası 2025–2028', marquee_11: 'Rəqəmsal Məktəb',
    marquee_12: 'Nazirlik Hesabatları',
    trust_s1: 'S.İ. Strategiyası 2025',
  },

  en: {
    announcement_badge: '★ Presidential Decree No. 530',
    announcement_body: 'Platform aligned with the Republic of Azerbaijan\'s 2025–2028 AI Strategy',
    nav_features: 'Features',
    nav_ministry: 'Ministry Panel',
    nav_zeka: 'Zeka',
    nav_about: 'About',
    nav_signin: 'Sign in',
    nav_signup: 'Start free',

    hero_badge: 'Within the AI Strategy 2025–2028',
    hero_title_1: 'Azerbaijan\'s',
    hero_title_2: 'Digital School',
    hero_desc: 'The infrastructure uniting 4,700+ public schools, 1.8 million students and 170,000+ teachers on a single digital platform.',
    hero_subdesc: 'Grading · Attendance · AI Tutor · Ministry Reports',
    hero_cta_primary: 'See the Ministry Panel',
    hero_cta_secondary: 'Meet Zeka',

    hero_panel_label: 'Ministry Management Panel',
    hero_panel_country: 'Republic of Azerbaijan',
    hero_panel_updated: 'Last updated',
    hero_panel_today: 'Today, 09:42',
    hero_schools_active: '{n} schools active',
    stat_connected_schools: 'Connected Schools',
    stat_active_students: 'Active Students',
    stat_ai_sessions: 'AI Sessions',
    stat_reports: 'Reports',
    trend_this_q: '+3 this quarter',
    trend_this_month: '+214 this month',
    trend_this_week: '+1.2k this week',
    trend_sent: '12/12 sent',
    national_trend: 'National Performance Trend',
    recent_events: 'Recent Events',
    event_1: 'School №47 submitted a report',
    event_2: 'A new school joined',
    event_3: 'E-Gov export completed',

    trust_strip: 'Integrations & Compliance',

    national_badge: 'National Opportunity',
    national_title: 'The Scale of',
    national_title_2: 'Azerbaijan\'s Digital Shift',
    national_desc: 'Uniting every school in the country on one platform — that is our goal.',
    nat_card1_label: 'Public Schools',
    nat_card1_desc: 'Schools awaiting digital management across Azerbaijan',
    nat_card2_label: 'Students',
    nat_card2_desc: 'Students who will gain access to a personal AI tutor',
    nat_card3_label: 'Teachers',
    nat_card3_desc: 'Teachers empowered with digital tools',

    features_badge: 'Features',
    features_title: 'Everything. In one place.',
    features_desc: 'From grading to reporting, attendance to an AI tutor — every need on one platform.',
    feat_demo: 'Demo →',

    feat_grades_t: 'Grading',
    feat_grades_d: 'IB criteria (A–D) and the national 10-point scale. Real-time sync.',
    feat_att_t: 'Attendance',
    feat_att_d: 'One-tap recording. Parents notified instantly.',
    feat_zeka_t: 'Zeka',
    feat_zeka_d: 'A personal AI tutor powered by Claude. Individualized in 3 languages.',
    feat_msg_t: 'Messaging',
    feat_msg_d: 'Teacher–parent communication in real time. Announcements and private messages.',
    feat_rep_t: 'Reports',
    feat_rep_d: 'Ministry reports, E-Gov.az integration, PDF export.',
    feat_ibs_t: 'IB & State',
    feat_ibs_d: 'MYP, DP and the national curriculum on a single platform.',

    ministry_badge: 'For the Ministry',
    ministry_title_1: 'Total oversight.',
    ministry_title_2: 'Real-time visibility.',
    ministry_desc: 'Ministry-level management, reporting and analytics — fully automated, with no extra effort.',

    mt_np_t: 'National Monitoring Panel',
    mt_np_d: 'Real-time statistics from every connected school. Performance, attendance, AI usage — on one screen.',
    mt_ar_t: 'Automated Reports',
    mt_ar_d: 'Fully compliant reports with one click. Automatic export to PDF, Excel and E-Gov.az formats.',
    mt_ds_t: 'Data Sovereignty',
    mt_ds_d: 'All education data is stored on Azerbaijani servers. Full control stays with the state.',
    mt_ta_t: 'Trend Analytics',
    mt_ta_d: 'Yearly, quarterly and monthly comparisons. Top and weakest performing schools — detected automatically.',
    mt_al_t: 'Instant Alerts',
    mt_al_d: 'When critical events happen, the ministry is notified immediately. Nothing stays hidden.',
    mt_eg_t: 'E-Gov Integration',
    mt_eg_d: 'Full integration with ASAN and E-Gov.az. Works with existing state infrastructure.',

    ministry_dash_title: 'Ministry of Education of the Republic of Azerbaijan',
    ministry_dash_sub: 'Zirva School Management System — v2.0',
    live: 'Live',
    kpi_total_schools: 'Total Schools',
    kpi_avg_grade: 'Average Grade',
    kpi_attendance: 'Attendance',
    kpi_ai_usage: 'AI Usage',
    kpi_trend_3: '+3 this quarter',
    kpi_trend_04: '↑ 0.4 increase',
    kpi_trend_21: '↑ 2.1% improvement',
    kpi_sessions_this_month: 'sessions this month',
    schools_ranking: 'School Ranking',
    this_quarter: 'This quarter',
    reports_export: 'Report Export',
    export_all: 'Export all',
    report_ready: 'Ready',
    report_egov_sent: 'Sent to E-Gov',
    report_preparing: 'Preparing',
    report_schools_12: '12/12 schools',
    report_q1: 'Q1 2025 — Quarterly Report',
    report_jan: 'January — Attendance',
    report_feb: 'February — Attendance',
    report_ib_audit: 'IB Audit 2025',
    report_curriculum: 'National Curriculum Compliance',

    roles_badge: 'For whom',
    roles_title: 'Ready for everyone',
    roles_desc: 'From student to administrator — every user has their own interface.',
    role_students: 'Students',
    role_teachers: 'Teachers',
    role_parents: 'Parents',
    role_admins: 'Admins',
    r_s_1: 'Tracks grades in real time',
    r_s_2: 'Studies one-on-one with Zeka',
    r_s_3: 'Submits assignments online',
    r_t_1: 'Grades with IB criteria',
    r_t_2: 'Writes reports with AI',
    r_t_3: 'Tracks results with analytics',
    r_p_1: 'Sees their child\'s grades',
    r_p_2: 'Gets notified about missed classes',
    r_p_3: 'Messages teachers directly',
    r_a_1: 'Runs the whole school',
    r_a_2: 'Sends ministry reports',
    r_a_3: 'IB and CEESA export',

    zeka_badge: 'Powered by Claude',
    zeka_title_1: 'Meet',
    zeka_title_2: 'Zeka',
    zeka_desc: 'Zeka is every student\'s personal AI tutor. Explains each subject, writes feedback against IB criteria, personalizes learning.',
    zeka_f1: 'In Azerbaijani, English and Russian',
    zeka_f2: 'For IB MYP/DP and the national curriculum',
    zeka_f3: 'Reports and feedback for teachers',
    zeka_f4: 'Motivation through learning streaks',
    zeka_f5: 'Fully aligned with the AI Strategy 2025–2028',
    zeka_cta: 'Try Zeka',
    zeka_chat_subject: 'Mathematics · Azerbaijani',
    zeka_active: 'Active',
    zeka_q: 'Can you explain quadratic equations in simple terms?',
    zeka_a_1: 'Of course! Let\'s go step by step:',
    zeka_a_2_1: 'A quadratic equation',
    zeka_a_2_2: 'has the form ax² + bx + c = 0.',
    zeka_a_3_1: 'To solve it, we find the',
    zeka_a_3_2: 'discriminant',
    zeka_a_3_3: ':',
    zeka_chip_1: 'Continue',
    zeka_chip_2: 'Give an example',
    zeka_chip_3: 'Practice questions',

    decree_label: 'Official Document',
    decree_author: 'President of the Republic of Azerbaijan Ilham Aliyev',
    decree_title_1: 'Decree No. 530 —',
    decree_title_2: 'AI Strategy 2025–2028',
    decree_desc: 'Signed in March 2025, this historic decree defines the digital future of the Republic of Azerbaijan. Zirva is its executor in education.',
    decree_pt_1: 'The right to a personal AI tutor for every student',
    decree_pt_2: 'Building the digital school infrastructure',
    decree_pt_3: 'Expanding state–technology partnerships',
    decree_pt_4: 'Protecting national data sovereignty',
    decree_quote: '"At Zirva, we are fully ready — in technology, infrastructure and preparation — to bring this strategy to education. Every school. Every student. Every region."',
    founder_name: 'Kaan Guluzada',
    founder_role: 'Founder, Zirva',

    impact_badge: 'Pilot Results',
    impact_title_1: 'Measurable',
    impact_title_2: 'outcomes',
    impact_desc: 'Real data collected from pilot schools. The growth recorded after Zirva was rolled out.',

    perf_title: 'Average Academic Performance',
    perf_sub: '12 pilot schools · 2024–2025 academic year',
    perf_growth: 'year-over-year growth',
    perf_legend: 'Average grade (out of 10)',
    perf_jan24: 'January 2024',
    perf_dec24: 'December 2024',

    ba_title: 'Before / After',
    ba_sub: 'Change measured in pilot schools',
    ba_m1: 'Average grade',
    ba_m2: 'Attendance rate',
    ba_m3: 'Teacher workload',
    ba_m4: 'Report time',
    ba_m5: 'Parent satisfaction',
    ba_m3_before: '6 h/day',
    ba_m3_after: '1.5 h/day',
    ba_m4_before: '4 hours',
    ba_m4_after: '1 click',

    sess_title: 'AI Session Growth',
    sess_sub: 'Monthly Zeka usage · 2024',
    sess_trend: '↑ 29× growth',
    sess_jan: 'Jan 2024: {v} sessions',
    sess_dec: 'Dec 2024: {v} sessions',

    schooltype_title: 'School Type',
    schooltype_sub: 'Participation in the pilot program',
    schooltype_count: 'schools',
    schooltype_state: 'Public school',
    schooltype_ib: 'IB World School',
    schooltype_private: 'Private school',

    about_badge: 'About',
    about_title: 'Why was Zirva created?',
    about_card1_title: 'Public schools are falling behind',
    about_card1_p1: 'While private and international schools in Azerbaijan use modern technology, public schools still run on old methods.',
    about_card1_p2_1: 'Zirva\'s founder',
    about_card1_p2_2: 'believes every Azerbaijani student — whether at an IB school or a public school — deserves the same level of technology.',

    pillars_title: 'Our mission pillars',
    p01_t: 'Equal opportunity',
    p01_d: 'Every school — public or private — gains access to the same powerful tools.',
    p02_t: 'AI-powered education',
    p02_d: 'Within the President\'s AI Strategy, a personal tutor for every student.',
    p03_t: 'Local solution',
    p03_d: 'Built for Azerbaijan, in Azerbaijan. ASAN and E-Gov integration.',

    founder_quote: '"I believe technology creates equality in education. There should be no gap between the opportunities of an international school in central Baku and a public school in a district. Zirva was built to close that gap."',

    why_badge: 'What sets us apart',
    why_title: 'Why Zirva?',
    why_desc: 'Not an off-the-shelf global solution — one built for Azerbaijan.',
    why_c1_t: 'Tailored for Azerbaijan',
    why_c1_d: 'ASAN and E-Gov.az integration, Azerbaijani language, national curriculum — 100% aligned with local needs.',
    why_c2_t: 'Secure',
    why_c2_d: 'Role-based access control, data encryption, Supabase infrastructure. Your data is protected.',
    why_c3_t: 'Fast',
    why_c3_d: 'Real-time sync. A teacher enters a grade — parents see it in seconds.',

    cta_badge: 'Next Step',
    cta_title_1: 'Let\'s build',
    cta_title_2: 'this together',
    cta_desc: 'The technology is ready. The team is ready. All that is missing is scale. We invite the Ministry to partner with us to digitize 4,700+ public schools.',
    cta_primary: 'Try the platform',
    cta_secondary: 'See the Ministry panel',

    footer_desc: 'The infrastructure of Azerbaijan\'s digital school',
    footer_decree: 'Aligned with the AI Strategy 2025–2028',
    footer_col_platform: 'Platform',
    footer_col_schools: 'Schools',
    footer_col_contact: 'Contact',
    footer_l1: 'Features',
    footer_l2: 'Ministry Panel',
    footer_l3: 'Attendance',
    footer_l4: 'Zeka',
    footer_s1: 'IB schools',
    footer_s2: 'Public schools',
    footer_s3: 'MYP programme',
    footer_s4: 'DP programme',
    footer_city: 'Baku, Azerbaijan',
    footer_rights: 'All rights reserved.',
    footer_privacy: 'Privacy policy',
    footer_terms: 'Terms of use',

    m_month_jan: 'Jan', m_month_feb: 'Feb', m_month_mar: 'Mar', m_month_apr: 'Apr',
    m_month_may: 'May', m_month_jun: 'Jun', m_month_jul: 'Jul', m_month_aug: 'Aug',
    m_month_sep: 'Sep', m_month_oct: 'Oct', m_month_nov: 'Nov', m_month_dec: 'Dec',

    marquee_1: 'IB World School', marquee_2: 'MYP', marquee_3: 'DP',
    marquee_4: 'National Curriculum', marquee_5: 'CEESA', marquee_6: 'ASAN Service',
    marquee_7: 'E-Gov.az', marquee_8: 'Claude', marquee_9: 'Real-time Sync',
    marquee_10: 'AI Strategy 2025–2028', marquee_11: 'Digital School',
    marquee_12: 'Ministry Reports',
    trust_s1: 'AI Strategy 2025',
  },
}

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
function Counter({ end, suffix = '', duration = 2000, locale = 'az-AZ' }) {
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
  return <span ref={ref}>{count.toLocaleString(locale)}{suffix}</span>
}

function LangToggle({ lang, setLang }) {
  const cls = (active) =>
    `px-3 py-1.5 text-xs font-bold rounded-full transition-all ${
      active
        ? 'bg-purple text-white shadow-sm shadow-purple/30'
        : 'text-gray-600 hover:text-gray-900'
    }`
  return (
    <div className="inline-flex items-center gap-0.5 rounded-full border border-gray-300 bg-gray-100 p-0.5">
      <button onClick={() => setLang('az')} className={cls(lang === 'az')} aria-pressed={lang === 'az'}>AZ</button>
      <button onClick={() => setLang('en')} className={cls(lang === 'en')} aria-pressed={lang === 'en'}>EN</button>
    </div>
  )
}

export default function Landing() {
  const { lang, setLang } = useLang()
  const s = STR[lang] || STR.az
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

  const features = [
    { icon: BookOpen,      title: s.feat_grades_t, desc: s.feat_grades_d, color: 'purple', demo: '/demo/jurnal'      },
    { icon: Calendar,      title: s.feat_att_t,    desc: s.feat_att_d,    color: 'teal',   demo: '/demo/davamiyyat'  },
    { icon: Sparkles,      title: s.feat_zeka_t,   desc: s.feat_zeka_d,   color: 'purple', demo: '/demo/zeka'        },
    { icon: MessageSquare, title: s.feat_msg_t,    desc: s.feat_msg_d,    color: 'teal',   demo: '/demo/mesajlar'    },
    { icon: FileText,      title: s.feat_rep_t,    desc: s.feat_rep_d,    color: 'purple', demo: '/demo/hesabatlar'  },
    { icon: Award,         title: s.feat_ibs_t,    desc: s.feat_ibs_d,    color: 'teal',   demo: '/demo/ib-dovlet'   },
  ]

  const roles = [
    { icon: GraduationCap, title: s.role_students, items: [s.r_s_1, s.r_s_2, s.r_s_3] },
    { icon: Users,         title: s.role_teachers, items: [s.r_t_1, s.r_t_2, s.r_t_3] },
    { icon: Heart,         title: s.role_parents,  items: [s.r_p_1, s.r_p_2, s.r_p_3] },
    { icon: Settings,      title: s.role_admins,   items: [s.r_a_1, s.r_a_2, s.r_a_3] },
  ]

  const marqueeItems = [
    s.marquee_1, s.marquee_2, s.marquee_3, s.marquee_4, s.marquee_5,
    s.marquee_6, s.marquee_7, s.marquee_8, s.marquee_9, s.marquee_10,
    s.marquee_11, s.marquee_12,
  ]

  const ministryTools = [
    { icon: BarChart3,  title: s.mt_np_t, desc: s.mt_np_d, demo: '/demo/milli-panel'           },
    { icon: FileText,   title: s.mt_ar_t, desc: s.mt_ar_d, demo: '/demo/avtomatik-hesabatlar'  },
    { icon: Shield,     title: s.mt_ds_t, desc: s.mt_ds_d, demo: '/demo/melumat'               },
    { icon: TrendingUp, title: s.mt_ta_t, desc: s.mt_ta_d, demo: '/demo/analitika'             },
    { icon: Bell,       title: s.mt_al_t, desc: s.mt_al_d, demo: '/demo/bildirisler'           },
    { icon: Database,   title: s.mt_eg_t, desc: s.mt_eg_d, demo: '/demo/egov'                  },
  ]

  const monthsShort = [
    s.m_month_jan, s.m_month_feb, s.m_month_mar, s.m_month_apr,
    s.m_month_may, s.m_month_jun, s.m_month_jul, s.m_month_aug,
    s.m_month_sep, s.m_month_oct, s.m_month_nov, s.m_month_dec,
  ]
  const monthsHero = [s.m_month_jan, s.m_month_feb, s.m_month_mar, s.m_month_apr]
  const locale = lang === 'en' ? 'en-US' : 'az-AZ'

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ───── ANNOUNCEMENT BAR ───── */}
      <div className="bg-amber-50 border-b border-amber-200 py-2 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 flex-wrap">
          <span className="text-amber-700 text-xs font-semibold tracking-wide uppercase">{s.announcement_badge}</span>
          <span className="text-amber-300 hidden sm:block">·</span>
          <span className="text-amber-600 text-xs">{s.announcement_body}</span>
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
            <button onClick={() => scrollTo('features')} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">{s.nav_features}</button>
            <button onClick={() => scrollTo('ministry')} className="text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors">{s.nav_ministry}</button>
            <button onClick={() => scrollTo('zeka')}     className="text-sm text-gray-500 hover:text-gray-900 transition-colors">{s.nav_zeka}</button>
            <button onClick={() => scrollTo('about')}    className="text-sm text-gray-500 hover:text-gray-900 transition-colors">{s.nav_about}</button>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <LangToggle lang={lang} setLang={setLang} />
            <Link to="/daxil-ol"  className="text-sm text-gray-500 hover:text-gray-900 px-4 py-2 transition-colors">{s.nav_signin}</Link>
            <Link to="/qeydiyyat" className="bg-purple text-white rounded-full px-5 py-2 text-sm font-medium hover:bg-purple-dark transition-all shadow-sm shadow-purple/30">
              {s.nav_signup}
            </Link>
          </div>

          <div className="md:hidden flex items-center gap-3">
            <LangToggle lang={lang} setLang={setLang} compact />
            <button onClick={() => setMobileMenu(!mobileMenu)} className="text-gray-600">
              {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenu && (
          <div className="md:hidden bg-white border-b border-gray-100 px-6 py-4 space-y-3">
            <button onClick={() => scrollTo('features')} className="block text-sm text-gray-500">{s.nav_features}</button>
            <button onClick={() => scrollTo('ministry')} className="block text-sm text-amber-600 font-medium">{s.nav_ministry}</button>
            <button onClick={() => scrollTo('zeka')}     className="block text-sm text-gray-500">{s.nav_zeka}</button>
            <button onClick={() => scrollTo('about')}    className="block text-sm text-gray-500">{s.nav_about}</button>
            <div className="flex gap-3 pt-3 border-t border-gray-100">
              <Link to="/daxil-ol"  className="text-sm text-gray-500 px-4 py-2">{s.nav_signin}</Link>
              <Link to="/qeydiyyat" className="bg-purple text-white rounded-full px-5 py-2 text-sm font-medium">{s.nav_signup}</Link>
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
              <span className="text-xs font-medium text-amber-700 tracking-wide">{s.hero_badge}</span>
              <ChevronRight className="w-3 h-3 text-amber-400" />
            </div>

            <h1 className="font-serif font-bold text-[clamp(2.4rem,7vw,6rem)] text-gray-900 tracking-tight leading-[1.05] mb-7 animate-fade-in-up animation-delay-200">
              {s.hero_title_1}<br />
              <span className="gradient-text">{s.hero_title_2}</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto mb-3 animate-fade-in-up animation-delay-400">
              {s.hero_desc}
            </p>
            <p className="text-sm text-purple/70 mb-12 animate-fade-in-up animation-delay-400 tracking-wide">
              {s.hero_subdesc}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-600">
              <button
                onClick={() => scrollTo('ministry')}
                className="group bg-gray-900 text-white rounded-full px-8 py-4 text-sm font-semibold hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg shadow-gray-900/20"
              >
                {s.hero_cta_primary}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => scrollTo('zeka')}
                className="group bg-white border border-gray-200 rounded-full px-8 py-4 text-sm font-medium text-gray-700 hover:border-purple hover:text-purple transition-all flex items-center gap-2 shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-purple" />
                {s.hero_cta_secondary}
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
                  <span className="text-[10px] text-teal font-medium">{s.hero_schools_active.replace('{n}', '12')}</span>
                </div>
              </div>

              <div className="p-6 md:p-8 bg-gray-50/60">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-[10px] text-amber-600 uppercase tracking-widest font-semibold mb-0.5">{s.hero_panel_label}</p>
                    <p className="text-gray-900 font-semibold">{s.hero_panel_country}</p>
                  </div>
                  <div className="bg-white rounded-xl px-4 py-2 text-right border border-gray-200 shadow-sm">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">{s.hero_panel_updated}</p>
                    <p className="text-xs text-gray-700 font-medium">{s.hero_panel_today}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {[
                    { label: s.stat_connected_schools, value: '12',     trend: s.trend_this_q,      icon: '🏫' },
                    { label: s.stat_active_students,    value: '5,247',  trend: s.trend_this_month,  icon: '👤' },
                    { label: s.stat_ai_sessions,        value: '52,841', trend: s.trend_this_week,   icon: '✨' },
                    { label: s.stat_reports,             value: '47',     trend: s.trend_sent,         icon: '📊' },
                  ].map((x) => (
                    <div key={x.label} className="bg-white rounded-xl p-3 md:p-4 border border-gray-200 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] md:text-[10px] text-gray-400 uppercase tracking-wider">{x.label}</span>
                        <span className="text-base">{x.icon}</span>
                      </div>
                      <p className="text-xl md:text-2xl font-bold text-gray-900 mb-1">{x.value}</p>
                      <span className="text-[9px] text-teal bg-teal-light rounded-full px-2 py-0.5 inline-block font-medium">{x.trend}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-5 gap-3">
                  <div className="col-span-3 bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">{s.national_trend}</p>
                      <span className="text-[10px] text-teal bg-teal-light rounded-full px-2 py-0.5 font-medium">↑ 4.2%</span>
                    </div>
                    <div className="flex items-end gap-1.5 h-14">
                      {[52, 58, 55, 64, 61, 68, 65, 73, 70, 79, 76, 86].map((h, i) => (
                        <div key={i} className={`flex-1 rounded-sm ${i === 11 ? 'bg-purple' : i >= 8 ? 'bg-purple/50' : 'bg-purple/20'}`} style={{ height: `${h}%` }} />
                      ))}
                    </div>
                    <div className="flex justify-between mt-1.5 px-0.5">
                      {monthsHero.map(m => (
                        <span key={m} className="text-[9px] text-gray-400">{m}</span>
                      ))}
                    </div>
                  </div>

                  <div className="col-span-2 bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">{s.recent_events}</p>
                    <div className="space-y-3">
                      {[
                        { text: s.event_1, time: '09:12', color: 'bg-teal'       },
                        { text: s.event_2, time: '08:54', color: 'bg-purple'     },
                        { text: s.event_3, time: '08:30', color: 'bg-amber-400'  },
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
          <p className="text-center text-[10px] text-gray-400 uppercase tracking-[0.2em] mb-7">{s.trust_strip}</p>
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-5">
            {[
              { name: s.marquee_6,  cls: 'border-blue-200 text-blue-600 bg-blue-50'       },
              { name: s.marquee_7,  cls: 'border-teal/30 text-teal bg-teal-light'         },
              { name: s.marquee_1,  cls: 'border-red-200 text-red-600 bg-red-50'          },
              { name: s.marquee_5,  cls: 'border-indigo-200 text-indigo-600 bg-indigo-50' },
              { name: s.trust_s1,   cls: 'border-amber-200 text-amber-700 bg-amber-50'    },
              { name: s.marquee_8,  cls: 'border-purple/30 text-purple bg-purple-light'   },
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
              <span className="inline-block text-[10px] tracking-[0.2em] text-amber-700 uppercase font-semibold mb-4 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5">{s.national_badge}</span>
              <h2 className="font-serif text-4xl md:text-5xl text-gray-900 tracking-tight mb-4 leading-[1.1]">
                {s.national_title}<br />{s.national_title_2}
              </h2>
              <p className="text-gray-500 max-w-lg mx-auto">{s.national_desc}</p>
            </div>
          </RevealCard>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { num: '4,700+',   label: s.nat_card1_label, desc: s.nat_card1_desc, icon: Building2,     bg: 'bg-purple-light', border: 'border-purple/20', ic: 'text-purple',    nc: 'text-purple-dark' },
              { num: '1.8M',     label: s.nat_card2_label, desc: s.nat_card2_desc, icon: GraduationCap, bg: 'bg-teal-light',   border: 'border-teal/20',   ic: 'text-teal',      nc: 'text-teal'        },
              { num: '170,000+', label: s.nat_card3_label, desc: s.nat_card3_desc, icon: Users,         bg: 'bg-amber-50',     border: 'border-amber-200', ic: 'text-amber-600', nc: 'text-amber-700'   },
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
          <SectionHeader badge={s.features_badge} title={s.features_title} desc={s.features_desc} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => {
              const Icon = f.icon
              return (
                <RevealCard key={f.title} delay={i * 90}>
                  <Link to={f.demo} className="block bg-white rounded-2xl p-8 h-full hover:-translate-y-1 transition-all duration-300 border border-gray-200 shadow-sm hover:shadow-md hover:border-purple/30 group">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${f.color === 'purple' ? 'bg-purple-light' : 'bg-teal-light'}`}>
                      <Icon className={`w-6 h-6 ${f.color === 'purple' ? 'text-purple' : 'text-teal'}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed mb-4">{f.desc}</p>
                    <p className="text-xs text-purple font-medium group-hover:underline">{s.feat_demo}</p>
                  </Link>
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
              <span className="inline-block text-[10px] tracking-[0.2em] text-amber-700 uppercase font-semibold mb-4 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5">{s.ministry_badge}</span>
              <h2 className="font-serif text-4xl md:text-5xl text-gray-900 tracking-tight mb-5 leading-[1.05]">
                {s.ministry_title_1}<br />
                <span className="gradient-text">{s.ministry_title_2}</span>
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto text-lg">{s.ministry_desc}</p>
            </div>
          </RevealCard>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-20">
            {ministryTools.map((tool, i) => {
              const Icon = tool.icon
              return (
                <RevealCard key={tool.title} delay={i * 100}>
                  <Link to={tool.demo} className="block bg-white rounded-2xl p-7 h-full hover:-translate-y-1 transition-all duration-300 border border-gray-200 shadow-sm hover:shadow-md hover:border-amber-300 group">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-5 group-hover:bg-amber-100 transition-all">
                      <Icon className="w-6 h-6 text-amber-600" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 mb-2">{tool.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed mb-4">{tool.desc}</p>
                    <p className="text-xs text-amber-600 font-medium group-hover:underline">{s.feat_demo}</p>
                  </Link>
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
                    <p className="text-gray-900 font-semibold text-sm">{s.ministry_dash_title}</p>
                    <p className="text-amber-600 text-[11px]">{s.ministry_dash_sub}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-teal animate-pulse" />
                  <span className="text-[11px] text-teal font-medium">{s.live}</span>
                </div>
              </div>

              <div className="p-6 md:p-8 bg-gray-50/50">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                  {[
                    { label: s.kpi_total_schools, value: '12',     sub: s.kpi_trend_3,              vc: 'text-gray-900'  },
                    { label: s.kpi_avg_grade,     value: '7.8',    sub: s.kpi_trend_04,             vc: 'text-teal'      },
                    { label: s.kpi_attendance,    value: '94.2%',  sub: s.kpi_trend_21,             vc: 'text-purple'    },
                    { label: s.kpi_ai_usage,      value: '52,841', sub: s.kpi_sessions_this_month,  vc: 'text-amber-600' },
                  ].map((x) => (
                    <div key={x.label} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">{x.label}</p>
                      <p className={`text-2xl font-bold ${x.vc} mb-1`}>{x.value}</p>
                      <p className="text-[10px] text-gray-400">{x.sub}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">{s.schools_ranking}</p>
                      <span className="text-[10px] text-purple bg-purple-light rounded-full px-2.5 py-1 font-medium">{s.this_quarter}</span>
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
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">{s.reports_export}</p>
                      <button className="text-[10px] text-teal bg-teal-light rounded-full px-3 py-1 flex items-center gap-1.5 font-medium">
                        <Download className="w-3 h-3" />
                        {s.export_all}
                      </button>
                    </div>
                    <div className="space-y-0">
                      {[
                        { name: s.report_q1,         status: s.report_ready,       dot: 'bg-teal'                    },
                        { name: s.report_jan,        status: s.report_egov_sent,   dot: 'bg-teal'                    },
                        { name: s.report_feb,        status: s.report_egov_sent,   dot: 'bg-teal'                    },
                        { name: s.report_ib_audit,   status: s.report_preparing,   dot: 'bg-amber-400 animate-pulse' },
                        { name: s.report_curriculum, status: s.report_schools_12,  dot: 'bg-purple'                  },
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
          <SectionHeader badge={s.roles_badge} title={s.roles_title} desc={s.roles_desc} />
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
                  <span className="text-xs font-medium text-purple">{s.zeka_badge}</span>
                </div>
                <h2 className="font-serif text-5xl md:text-6xl text-gray-900 tracking-tight mb-6 leading-[1.05]">
                  {s.zeka_title_1}<br />
                  <span className="gradient-text">{s.zeka_title_2}</span>
                </h2>
                <p className="text-gray-500 leading-relaxed mb-8 text-lg">{s.zeka_desc}</p>
                <ul className="space-y-4 mb-10">
                  {[s.zeka_f1, s.zeka_f2, s.zeka_f3, s.zeka_f4, s.zeka_f5].map((item) => (
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
                  {s.zeka_cta}
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
                    <p className="text-sm font-semibold text-gray-900">{s.feat_zeka_t}</p>
                    <p className="text-[11px] text-gray-400">{s.zeka_chat_subject}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
                    <span className="text-[10px] text-teal font-medium">{s.zeka_active}</span>
                  </div>
                </div>
                <div className="p-6 space-y-4 min-h-[320px] bg-white">
                  <div className="flex justify-end">
                    <div className="bg-purple-light border border-purple/20 rounded-2xl rounded-br-sm px-4 py-3 text-sm text-purple max-w-[80%]">
                      {s.zeka_q}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-purple-light flex items-center justify-center flex-shrink-0 mt-1">
                      <Sparkles className="w-3.5 h-3.5 text-purple" />
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-gray-700 max-w-[85%]">
                      <p className="mb-2">{s.zeka_a_1}</p>
                      <p className="mb-2"><strong className="text-gray-900">{s.zeka_a_2_1}</strong> {s.zeka_a_2_2}</p>
                      <p className="mb-2">{s.zeka_a_3_1} <strong className="text-purple">{s.zeka_a_3_2}</strong> {s.zeka_a_3_3}</p>
                      <p className="bg-purple-light border border-purple/10 rounded-lg px-3 py-2 font-mono text-xs text-purple">D = b² - 4ac</p>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-10 flex-wrap">
                    {[s.zeka_chip_1, s.zeka_chip_2, s.zeka_chip_3].map((chip) => (
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
                <span className="text-[10px] tracking-[0.2em] text-amber-700 uppercase font-semibold">{s.decree_label}</span>
                <span className="text-amber-300 mx-2">·</span>
                <span className="text-[10px] text-amber-600">{s.decree_author}</span>
              </div>
              <div className="p-8 md:p-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                  <div>
                    <h3 className="font-serif text-3xl md:text-4xl text-gray-900 mb-5 leading-tight">
                      {s.decree_title_1}<br />
                      <span className="gradient-text">{s.decree_title_2}</span>
                    </h3>
                    <p className="text-gray-500 leading-relaxed mb-6">{s.decree_desc}</p>
                    <div className="space-y-3.5">
                      {[s.decree_pt_1, s.decree_pt_2, s.decree_pt_3, s.decree_pt_4].map((item) => (
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
                      {s.decree_quote}
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple to-purple-mid flex items-center justify-center flex-shrink-0">
                        <span className="text-base font-semibold text-white">KG</span>
                      </div>
                      <div>
                        <p className="text-gray-900 font-semibold text-sm">{s.founder_name}</p>
                        <p className="text-xs text-gray-400">{s.founder_role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </RevealCard>
        </div>
      </section>


      {/* ───── IMPACT DATA ───── */}
      <section className="py-32 px-6 bg-gray-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <RevealCard delay={0}>
            <div className="text-center mb-16">
              <span className="inline-block text-[10px] tracking-[0.2em] text-purple uppercase font-semibold mb-4 bg-purple-light rounded-full px-4 py-1.5">{s.impact_badge}</span>
              <h2 className="font-serif text-4xl md:text-5xl text-gray-900 tracking-tight mb-4 leading-[1.1]">
                {s.impact_title_1}<br />{s.impact_title_2}
              </h2>
              <p className="text-gray-500 max-w-lg mx-auto">{s.impact_desc}</p>
            </div>
          </RevealCard>

          {/* Row 1: Performance trend + Donut */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
            <div className="lg:col-span-2">
              <RevealCard delay={100}>
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm h-full">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{s.perf_title}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{s.perf_sub}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-teal">+20%</p>
                      <p className="text-[10px] text-gray-400">{s.perf_growth}</p>
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
                      {monthsShort.map(m => (
                        <span key={m} className="text-[9px] text-gray-400">{m}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-6 mt-5 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-purple" />
                      <span className="text-[10px] text-gray-500">{s.perf_legend}</span>
                    </div>
                    <div className="ml-auto flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-[10px] text-gray-400">{s.perf_jan24}</p>
                        <p className="text-sm font-bold text-gray-700">6.5</p>
                      </div>
                      <div className="text-gray-300 text-xs">→</div>
                      <div className="text-center">
                        <p className="text-[10px] text-gray-400">{s.perf_dec24}</p>
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
                  <p className="text-sm font-semibold text-gray-900 mb-1">{s.ba_title}</p>
                  <p className="text-[11px] text-gray-400 mb-5">{s.ba_sub}</p>
                  <div className="space-y-3.5">
                    {[
                      { metric: s.ba_m1, before: '6.5/10',       after: '7.8/10'       },
                      { metric: s.ba_m2, before: '91%',           after: '94.2%'        },
                      { metric: s.ba_m3, before: s.ba_m3_before,  after: s.ba_m3_after  },
                      { metric: s.ba_m4, before: s.ba_m4_before,  after: s.ba_m4_after  },
                      { metric: s.ba_m5, before: '67%',           after: '89%'          },
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
                      <p className="text-sm font-semibold text-gray-900">{s.sess_title}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{s.sess_sub}</p>
                    </div>
                    <span className="text-[10px] text-teal bg-teal-light border border-teal/20 rounded-full px-3 py-1 font-medium">{s.sess_trend}</span>
                  </div>
                  <div className="flex items-end gap-1.5 h-32 mb-2">
                    {[2000,4500,7000,11000,16000,22000,29000,35000,41000,47000,52000,58000].map((v, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full rounded-t-sm transition-all duration-500"
                          style={{
                            height: `${(v / 58000) * 100}%`,
                            background: i === 11
                              ? '#534AB7'
                              : i >= 8
                              ? 'rgba(83,74,183,0.55)'
                              : i >= 5
                              ? 'rgba(83,74,183,0.35)'
                              : 'rgba(83,74,183,0.18)',
                          }}
                        />
                        <span className="text-[8px] text-gray-400 leading-none">{monthsShort[i]}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between pt-3 border-t border-gray-100">
                    <span className="text-[10px] text-gray-400" dangerouslySetInnerHTML={{ __html: s.sess_jan.replace('{v}', `<strong class="text-gray-600">${(2000).toLocaleString(locale)}</strong>`) }} />
                    <span className="text-[10px] text-gray-400" dangerouslySetInnerHTML={{ __html: s.sess_dec.replace('{v}', `<strong class="text-purple">${(58000).toLocaleString(locale)}</strong>`) }} />
                  </div>
                </div>
              </RevealCard>
            </div>

            <div>
              <RevealCard delay={350}>
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm h-full flex flex-col">
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-900">{s.schooltype_title}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{s.schooltype_sub}</p>
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
                      <text x="80" y="91" textAnchor="middle" fill="#9ca3af" fontSize="10">{s.schooltype_count}</text>
                    </svg>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: s.schooltype_state,   pct: '53%', color: 'bg-teal'      },
                      { label: s.schooltype_ib,      pct: '35%', color: 'bg-purple'    },
                      { label: s.schooltype_private, pct: '12%', color: 'bg-amber-400' },
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
              <span className="inline-block text-[10px] tracking-[0.2em] text-purple uppercase font-semibold mb-4 bg-purple-light rounded-full px-4 py-1.5">{s.about_badge}</span>
              <h2 className="font-serif text-4xl md:text-5xl text-gray-900 tracking-tight mb-4 leading-[1.1]">{s.about_title}</h2>
            </div>
          </RevealCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <RevealCard delay={100}>
              <div className="bg-purple-light border border-purple/15 rounded-2xl p-10">
                <div className="w-14 h-14 rounded-2xl bg-purple flex items-center justify-center mb-6 shadow-md shadow-purple/30">
                  <Landmark className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-serif text-2xl text-gray-900 mb-4">{s.about_card1_title}</h3>
                <p className="text-gray-600 leading-relaxed mb-4">{s.about_card1_p1}</p>
                <p className="text-gray-600 leading-relaxed">
                  {s.about_card1_p2_1} <strong className="text-gray-900">{s.founder_name}</strong> {s.about_card1_p2_2}
                </p>
              </div>
            </RevealCard>

            <RevealCard delay={200}>
              <div className="bg-white border border-gray-200 rounded-2xl p-10">
                <h3 className="font-serif text-2xl text-gray-900 mb-7">{s.pillars_title}</h3>
                <div className="space-y-7">
                  {[
                    { num: '01', title: s.p01_t, desc: s.p01_d },
                    { num: '02', title: s.p02_t, desc: s.p02_d },
                    { num: '03', title: s.p03_t, desc: s.p03_d },
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
                {s.founder_quote}
              </p>
              <div className="flex items-center justify-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple to-purple-mid flex items-center justify-center shadow-md shadow-purple/30">
                  <span className="text-lg font-semibold text-white">KG</span>
                </div>
                <div className="text-left">
                  <p className="text-gray-900 font-semibold">{s.founder_name}</p>
                  <p className="text-sm text-gray-500">{s.founder_role}</p>
                </div>
              </div>
            </div>
          </RevealCard>
        </div>
      </section>

      {/* ───── WHY ───── */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <SectionHeader badge={s.why_badge} title={s.why_title} desc={s.why_desc} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Globe,  title: s.why_c1_t, desc: s.why_c1_d, bg: 'bg-purple-light', ic: 'text-purple'    },
              { icon: Shield, title: s.why_c2_t, desc: s.why_c2_d, bg: 'bg-teal-light',   ic: 'text-teal'      },
              { icon: Zap,    title: s.why_c3_t, desc: s.why_c3_d, bg: 'bg-amber-50',     ic: 'text-amber-600' },
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
            <span className="inline-block text-[10px] tracking-[0.2em] text-purple uppercase font-semibold mb-6 bg-purple-light rounded-full px-4 py-1.5">{s.cta_badge}</span>
            <h2 className="font-serif text-5xl md:text-7xl text-gray-900 tracking-tight mb-6 leading-[1.02]">
              {s.cta_title_1}<br />{s.cta_title_2}
            </h2>
            <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed">
              {s.cta_desc}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/qeydiyyat"
                className="group bg-gray-900 text-white rounded-full px-10 py-4 text-sm font-semibold hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg shadow-gray-900/20"
              >
                {s.cta_primary}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button
                onClick={() => scrollTo('ministry')}
                className="bg-white border border-gray-200 text-gray-700 rounded-full px-10 py-4 text-sm font-medium hover:border-purple hover:text-purple transition-all shadow-sm"
              >
                {s.cta_secondary}
              </button>
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
                {s.footer_desc}
              </p>
              <p className="text-[10px] text-gray-300 mt-3 tracking-wide">
                {s.footer_decree}
              </p>
            </div>
            <div>
              <p className="text-[10px] tracking-widest text-gray-400 uppercase mb-4">{s.footer_col_platform}</p>
              <ul className="space-y-2.5">
                {[
                  { label: s.footer_l1, target: 'features' },
                  { label: s.footer_l2, target: 'ministry' },
                  { label: s.footer_l3, target: 'features' },
                  { label: s.footer_l4, target: 'zeka' },
                ].map((l) => (
                  <li key={l.label}>
                    <button onClick={() => scrollTo(l.target)} className="text-sm text-gray-400 hover:text-gray-900 transition-colors">
                      {l.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] tracking-widest text-gray-400 uppercase mb-4">{s.footer_col_schools}</p>
              <ul className="space-y-2.5">
                {[s.footer_s1, s.footer_s2, s.footer_s3, s.footer_s4].map((l) => (
                  <li key={l}><span className="text-sm text-gray-400">{l}</span></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] tracking-widest text-gray-400 uppercase mb-4">{s.footer_col_contact}</p>
              <ul className="space-y-2.5">
                <li><a href="mailto:info@zekalo.az" className="text-sm text-gray-400 hover:text-gray-900 transition-colors">info@zekalo.az</a></li>
                <li><span className="text-sm text-gray-400">{s.footer_city}</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-300">&copy; {new Date().getFullYear()} Zirva. {s.footer_rights}</p>
            <div className="flex gap-6">
              <span className="text-xs text-gray-300 hover:text-gray-500 transition-colors cursor-pointer">{s.footer_privacy}</span>
              <span className="text-xs text-gray-300 hover:text-gray-500 transition-colors cursor-pointer">{s.footer_terms}</span>
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
