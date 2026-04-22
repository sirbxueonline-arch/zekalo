import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft, Check, Download, Send, Bell, Shield, BarChart3,
  MessageSquare, FileText, BookOpen, Calendar, Sparkles,
  TrendingUp, Globe, Database, ChevronRight
} from 'lucide-react'
import { useLang } from '../contexts/LanguageContext'

/* ─── translations ─── */
const D = {
  az: {
    demo: 'Demo',
    signup: 'Qeydiyyat',
    back_home: 'Ana səhifəyə qayıt',
    not_found: 'Demo tapılmadı',

    meta: {
      jurnal:                 { title: 'Qiymətləndirmə Jurnalı', subtitle: 'Gradebook' },
      davamiyyat:             { title: 'Davamiyyət Reyestri',     subtitle: 'Attendance' },
      zeka:                   { title: 'Zəka — AI Müəllim',       subtitle: 'AI Tutor' },
      mesajlar:               { title: 'Mesajlaşma',               subtitle: 'Messaging' },
      hesabatlar:             { title: 'Hesabatlar',               subtitle: 'Reports' },
      'ib-dovlet':            { title: 'IB & Dövlət',              subtitle: 'IB & State' },
      'milli-panel':          { title: 'Milli İzləmə Paneli',      subtitle: 'National Panel' },
      'avtomatik-hesabatlar': { title: 'Avtomatik Hesabatlar',     subtitle: 'Auto Reports' },
      melumat:                { title: 'Məlumat Suverenliyi',      subtitle: 'Data Sovereignty' },
      analitika:              { title: 'Trend Analitikası',        subtitle: 'Analytics' },
      bildirisler:            { title: 'Ani Bildirişlər',          subtitle: 'Notifications' },
      egov:                   { title: 'E-Gov İnteqrasiyası',      subtitle: 'E-Gov Integration' },
    },

    // Common
    classes: 'Siniflər', class_suffix: 'Sinifi',
    subject_math: 'Riyaziyyat', subject_eng: 'İngilis dili', subject_bio: 'Biologiya',
    subject_hist: 'Tarix', subject_phys: 'Fizika', subject_chem: 'Kimya',
    student: 'Şagird', average: 'Orta', save: 'Saxla',
    state_1_10: 'Dövlət (1–10)', sync_ok: 'Sinxronizasiya edildi',

    // Gradebook
    j_header: '9A Sinifi — Riyaziyyat Jurnalı',
    j_term: '2024–2025 · II Rüb',

    // Attendance
    att_date_label: 'Tarix',
    att_today: '14 Aprel 2026, Çərşənbə',
    att_class: 'Sinif',
    att_class_val: '9A — 30 şagird',
    att_sms: '2 valideyn SMS ilə xəbərdar edildi',
    att_came: 'Gəldi', att_missed: 'Gəlmədi', att_absent: 'Yoxdur',
    att_came_n: '{n} gəldi', att_missed_n: '{n} gəlmədi',

    // Zeka
    z_pick_subject: 'Fənn seçin',
    z_recent: 'Son sessiyalar',
    z_rec_1: 'Kvadrat tənliklər', z_rec_2: 'İntegral — giriş',
    z_rec_3: 'Loqarifm funksiyası', z_rec_4: 'Triqonometriya',
    z_powered: 'Claude ilə gücləndirilmiş',
    z_online: 'Onlayn · Riyaziyyat sessiyası',
    z_q1: 'Kvadrat tənliyi nə vaxt istifadə edirik?',
    z_a1_p1: 'Kvadrat tənlik — ax² + bx + c = 0 formasında yazılan tənlikdir.',
    z_a1_p2: 'Real həyatda istifadə nümunələri:',
    z_a1_l1: 'Fizikada mərmi hərəkəti hesablanması',
    z_a1_l2: 'Mühəndislikdə sahə hesablamaları',
    z_a1_l3: 'Maliyyədə gəlir-xərc modelləri',
    z_q2: 'Məsələ verə bilərsən?',
    z_a2_p1: 'Əlbəttə! Budur bir praktik məsələ:',
    z_a2_problem: 'x² − 5x + 6 = 0 tənliyini həll edin.',
    z_a2_hint: 'İpucu: a=1, b=−5, c=6. Diskriminantı tapıb kökləri hesablayın.',
    z_placeholder: 'Sual yazın...',

    // Messaging
    search: 'Axtar...',
    m_teacher: 'Müəllim Əliyev',
    m_parent: 'Valideyn Həsənova',
    m_class_announce: 'Sinif Elanı',
    m_admin: 'Admin',
    m_prev_1: 'İmtahan nəticəsi barədə...',
    m_prev_2: 'Övladımın davamiyyəti...',
    m_prev_3: '📢 Riyaziyyat imtahanı...',
    m_prev_4: 'Hesabat hazırlamaq üçün...',
    m_time_y: 'Dün',
    m_you: 'Siz',
    m_msg_1: 'Salam! Növbəti həftə riyaziyyat imtahanı keçiriləcək. Şagirdlər hazırlaşsın.',
    m_msg_2: 'Salam, müəllim. Hansı mövzular daxil olacaq?',
    m_msg_3: 'Kvadrat tənliklər, loqarifmlər və triqonometriya. Material paylaşacağam.',
    m_msg_4: 'Çox sağ olun! Zəka ilə hazırlaşacağam.',
    m_msg_5: 'Əla! İmtahan saat 10:00-da başlayır. Uğurlar 👍',
    m_online: 'Onlayn',
    m_input: 'Mesaj yazın...',

    // Reports
    r_title: 'Hesabatlar',
    r_year: '2024–2025 tədris ili',
    r_new: '+ Yeni hesabat yarat',
    r_1: 'Q1 2025 Rüblük Hesabat',
    r_2: 'Yanvar Davamiyyət',
    r_3: 'IB Audit 2025',
    r_4: 'Milli Kurikulum Uyğunluğu',
    r_5: 'Fevral Davamiyyət',
    r_6: 'Şagird İnkişaf Hesabatı',
    r_ready: 'Hazır',
    r_egov: 'E-Gov ✓',
    r_preparing: 'Hazırlanır...',
    r_done: 'Tamamlandı',
    r_draft: 'Qaralama',

    // IB & State
    ib_title: 'IB & Dövlət Uyğunluğu',
    ib_sub: 'MYP Kriteriyaları ↔ Milli 10 ballıq şkala — Avtomatik çevrilmə',
    ib_confirmed: 'IB uyğunluğu təsdiqləndi',
    ib_formula: 'Avtomatik çevrilmə düsturu',
    ib_myp: 'IB MYP',
    ib_max: 'Maks: 32',
    ib_state_scale: 'Dövlət şkalası',
    ib_curr: 'Milli kurikulum',
    ib_example: 'Nümunə:',
    ib_ex1: 'IB cəmi 24/32 = Dövlət',
    ib_ex2: 'IB cəmi 29/32 = Dövlət',
    ib_total: 'IB Cəm',
    ib_state: 'Dövlət',

    // National panel
    np_label: 'Nazirlik İdarəetmə Paneli',
    np_country: 'Azərbaycan Respublikası Təhsil Nazirliyi',
    np_live: 'Canlı · Son yenilənmə: 09:42',
    np_k_schools: 'Məktəb', np_k_students: 'Şagird',
    np_k_ai: 'S.İ. Sessiya', np_k_avg: 'Orta Qiymət',
    np_t1: '+3 bu rübdə', np_t2: '+214 bu ay',
    np_t3: '+1.2k bu həftə', np_t4: '↑ 0.4 artış',
    np_monthly: 'Aylıq Performans Meyli',
    np_events: 'Son Hadisələr',
    np_e1: 'Məktəb №47 aylıq hesabat göndərdi',
    np_e2: 'Yeni məktəb qoşuldu: №89',
    np_e3: 'E-Gov ixracı avtomatik tamamlandı',
    np_e4: 'TISA davamiyyət hesabatı alındı',
    np_e5: 'Sistem yedəkləməsi tamamlandı',
    np_yesterday: 'Dün',
    np_ranking: 'Məktəb Reytinqi',
    np_q_year: 'Bu rübdə · 2025',

    // Auto Reports
    ar_title: 'Avtomatik Hesabat Generatoru',
    ar_sub: 'PDF, Excel, E-Gov.az formatında bir kliklə ixrac',
    ar_params: 'Hesabat parametrləri',
    ar_type: 'Hesabat növü',
    ar_type_1: 'Rüblük Akademik Hesabat',
    ar_type_2: 'Davamiyyət Hesabatı',
    ar_type_3: 'IB MYP Audit',
    ar_type_4: 'Nazirlik İcmalı',
    ar_range: 'Tarix aralığı',
    ar_range_1: 'Q1 2025 (Yan – Mar)',
    ar_range_2: 'Q2 2025 (Apr – İyn)',
    ar_range_3: '2024–2025 Tədris İli',
    ar_range_4: 'Yanvar 2025',
    ar_school: 'Məktəb',
    ar_all_schools: 'Bütün məktəblər',
    ar_auto: 'Avtomatik göndər',
    ar_auto_sub: 'Hər ayın 1-i — Nazirlik e-poçtu',
    ar_preview: 'Önizləmə',
    ar_q1: 'Q1 2025',
    ar_rep_title: 'Q1 2025 Rüblük Akademik Hesabat',
    ar_rep_period: 'Bütün məktəblər · 01 Yanvar – 31 Mart 2025',
    ar_row1: 'Ümumi Məktəb', ar_row2: 'Aktiv Şagird',
    ar_row3: 'Orta Qiymət',  ar_row4: 'Davamiyyət',
    ar_row5: 'S.İ. Sessiyaları',
    ar_footer: 'Zirva MIS · zirva.az · Gizli sənəd',

    // Data Sovereignty
    ds_title: 'Məlumat Suverenliyi Paneli',
    ds_sub: 'Azərbaycan qanunvericiliyinə tam uyğun infrastruktur',
    ds_c1: 'Server Yeri', ds_c1_v: 'Bakı, AZ 🇦🇿',
    ds_c2: 'Şifrələmə',   ds_c2_v: 'AES-256',
    ds_c3: 'Dövlət Nəzarəti', ds_c3_v: 'Tam Nəzarət',
    ds_c4: 'GDPR Uyğunluğu', ds_c4_v: 'Sertifikatlaşdırılmış',
    ds_active: 'Aktiv',
    ds_certs: 'Sertifikatlar & Uyğunluq',
    ds_b1: 'Azərbaycan "Elektron İmza" Qanunu',
    ds_b2: 'ISO 27001 Məlumat Təhlükəsizliyi',
    ds_b3: 'GDPR Uyğunluğu',
    ds_b4: 'Dövlət Şifrələmə Standartı',
    ds_b5: 'AES-256 Şifrələmə',
    ds_log: 'Giriş Jurnalı',
    ds_last_5: 'Son 5 hadisə',
    ds_u1: 'Nazirlik Portalı',    ds_a1: 'Q1 hesabatı oxundu',
    ds_u2: 'E-Gov.az Sistemi',     ds_a2: 'Davamiyyət ixrac edildi',
    ds_u3: 'Audit Xidməti',        ds_a3: 'IB audit sənədi oxundu',
    ds_u4: 'ASAN Xidmət Gateway',  ds_a4: 'Şagird kimlik doğrulama',
    ds_u5: 'Sistem Yedəkləməsi',   ds_a5: 'Avtomatik yedəkləmə',
    ds_today: 'Bugün', ds_yday: 'Dünən',
    ds_allowed: 'İcazəli', ds_system: 'Sistem',

    // Analytics
    an_title: 'Trend Analitikası',
    an_sub: '2024–2025 tədris ili · Milli izləmə',
    an_m_avg: 'Orta qiymət', an_m_att: 'Davamiyyət', an_m_ai: 'S.İ. İstifadəsi',
    an_line: 'Orta Qiymət Meyli — 12 aylıq',
    an_yoy: '↑ 18.8% illik artım',
    an_cmp: 'Məktəb Müqayisəsi',
    an_tb: 'Ən Yaxşı & Ən Zəif',
    an_top: 'Top 3', an_att: 'Diqqət',

    // Notifications
    bn_title: 'Bildirişlər',
    bn_unread: '2 oxunmamış bildiriş',
    bn_mark_all: 'Hamısını oxunmuş say',
    bn_tab1: 'Hamısı', bn_tab2: 'Kritik', bn_tab3: 'Hesabat', bn_tab4: 'Sistem',
    bn_n1: 'Məktəb №47 aylıq hesabat göndərdi',
    bn_n2: 'Məktəb №6 davamiyyət faizi aşağı düşdü (88%)',
    bn_n3: 'E-Gov.az ixracı avtomatik tamamlandı',
    bn_n4: 'Yeni məktəb qoşuldu: Məktəb №89',
    bn_n5: 'TISA Q1 hesabatı hazırlandı — PDF hazırdır',
    bn_n6: 'Sistem yedəkləməsi uğurla tamamlandı',
    bn_n7: 'Məktəb №132 IB audit sənədini təqdim etmədi',
    bn_t_report: 'hesabat', bn_t_critical: 'kritik', bn_t_system: 'sistem',
    bn_time_2d: '2 gün',

    // E-Gov
    eg_title: 'E-Gov İnteqrasiya Paneli',
    eg_sub: 'ASAN Xidmət, E-Gov.az, Dövlət Reyestri ilə tam inteqrasiya',
    eg_push: 'E-Gov-a Göndər',
    eg_s1: 'ASAN Xidmət', eg_s2: 'E-Gov.az',
    eg_s3: 'Dövlət Reyestri', eg_s4: 'MİM',
    eg_connected: 'Bağlı',
    eg_sync_1: '09:42 · Bugün', eg_sync_2: '09:30 · Bugün',
    eg_sync_3: '08:00 · Bugün', eg_sync_4: 'Dünən, 23:00',
    eg_export: 'Məlumat İxracı',
    eg_auto: 'Avtomatik: hər gün 08:00',
    eg_att: 'Davamiyyət', eg_grades: 'Qiymətlər', eg_reports: 'Hesabatlar',
    eg_att_c: '5,247 qeyd', eg_grades_c: '31,482 qeyd', eg_reports_c: '47 sənəd',
    eg_log: 'Son İxrac Jurnalı',
    eg_l1: 'Davamiyyət İxracı', eg_l2: 'Hesabat Paketi Q1',
    eg_l3: 'Şagird Siyahısı', eg_l4: 'IB Audit Sənədləri',
    eg_d1: 'E-Gov.az', eg_d2: 'Nazirlik Portalı',
    eg_d3: 'Dövlət Reyestri', eg_d4: 'ASAN Xidmət',
    eg_st_ok: 'Uğurlu', eg_st_wait: 'Gözlənir',
    eg_yday: 'Dünən',

    // Month names
    mon: ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'İyn', 'İyl', 'Avq', 'Snt', 'Okt', 'Noy', 'Dek'],

    // IB criteria
    ib_crit_a: 'A — Bilik və anlama',
    ib_crit_b: 'B — Araşdırma',
    ib_crit_c: 'C — Ünsiyyət',
    ib_crit_d: 'D — Düşünmə bacarığı',
  },

  en: {
    demo: 'Demo',
    signup: 'Sign up',
    back_home: 'Back to home',
    not_found: 'Demo not found',

    meta: {
      jurnal:                 { title: 'Grading Ledger',          subtitle: 'Gradebook' },
      davamiyyat:             { title: 'Attendance Register',     subtitle: 'Attendance' },
      zeka:                   { title: 'Zeka — AI Tutor',         subtitle: 'AI Tutor' },
      mesajlar:               { title: 'Messaging',               subtitle: 'Messaging' },
      hesabatlar:             { title: 'Reports',                 subtitle: 'Reports' },
      'ib-dovlet':            { title: 'IB & State',              subtitle: 'IB & State' },
      'milli-panel':          { title: 'National Monitoring',     subtitle: 'National Panel' },
      'avtomatik-hesabatlar': { title: 'Automated Reports',       subtitle: 'Auto Reports' },
      melumat:                { title: 'Data Sovereignty',        subtitle: 'Data Sovereignty' },
      analitika:              { title: 'Trend Analytics',         subtitle: 'Analytics' },
      bildirisler:            { title: 'Instant Alerts',          subtitle: 'Notifications' },
      egov:                   { title: 'E-Gov Integration',       subtitle: 'E-Gov Integration' },
    },

    classes: 'Classes', class_suffix: 'Class',
    subject_math: 'Mathematics', subject_eng: 'English', subject_bio: 'Biology',
    subject_hist: 'History', subject_phys: 'Physics', subject_chem: 'Chemistry',
    student: 'Student', average: 'Avg', save: 'Save',
    state_1_10: 'State (1–10)', sync_ok: 'Synced',

    j_header: 'Grade 9A — Mathematics Ledger',
    j_term: '2024–2025 · Q2',

    att_date_label: 'Date',
    att_today: 'Wednesday, 14 April 2026',
    att_class: 'Class',
    att_class_val: '9A — 30 students',
    att_sms: '2 parents notified by SMS',
    att_came: 'Present', att_missed: 'Absent', att_absent: 'Missing',
    att_came_n: '{n} present', att_missed_n: '{n} absent',

    z_pick_subject: 'Pick a subject',
    z_recent: 'Recent sessions',
    z_rec_1: 'Quadratic equations', z_rec_2: 'Integrals — intro',
    z_rec_3: 'Logarithms', z_rec_4: 'Trigonometry',
    z_powered: 'Powered by Claude',
    z_online: 'Online · Mathematics session',
    z_q1: 'When do we use quadratic equations?',
    z_a1_p1: 'A quadratic equation has the form ax² + bx + c = 0.',
    z_a1_p2: 'Real-world uses:',
    z_a1_l1: 'Projectile motion in physics',
    z_a1_l2: 'Area calculations in engineering',
    z_a1_l3: 'Income–cost models in finance',
    z_q2: 'Can you give me a problem?',
    z_a2_p1: 'Of course! Here is a practical problem:',
    z_a2_problem: 'Solve x² − 5x + 6 = 0.',
    z_a2_hint: 'Hint: a=1, b=−5, c=6. Find the discriminant, then the roots.',
    z_placeholder: 'Type a question...',

    search: 'Search...',
    m_teacher: 'Teacher Aliyev',
    m_parent: 'Parent Hasanova',
    m_class_announce: 'Class Announcement',
    m_admin: 'Admin',
    m_prev_1: 'About the exam result...',
    m_prev_2: 'My child\'s attendance...',
    m_prev_3: '📢 Math exam...',
    m_prev_4: 'For preparing the report...',
    m_time_y: 'Yday',
    m_you: 'You',
    m_msg_1: 'Hello! There will be a math exam next week. Students should prepare.',
    m_msg_2: 'Hello, teacher. Which topics will be included?',
    m_msg_3: 'Quadratic equations, logarithms and trigonometry. I\'ll share the material.',
    m_msg_4: 'Thank you! I\'ll prepare with Zeka.',
    m_msg_5: 'Great! The exam starts at 10:00. Good luck 👍',
    m_online: 'Online',
    m_input: 'Type a message...',

    r_title: 'Reports',
    r_year: '2024–2025 academic year',
    r_new: '+ Create new report',
    r_1: 'Q1 2025 Quarterly Report',
    r_2: 'January Attendance',
    r_3: 'IB Audit 2025',
    r_4: 'National Curriculum Compliance',
    r_5: 'February Attendance',
    r_6: 'Student Progress Report',
    r_ready: 'Ready',
    r_egov: 'E-Gov ✓',
    r_preparing: 'Preparing...',
    r_done: 'Done',
    r_draft: 'Draft',

    ib_title: 'IB & State Compliance',
    ib_sub: 'MYP criteria ↔ National 10-point scale — Automatic conversion',
    ib_confirmed: 'IB compliance confirmed',
    ib_formula: 'Automatic conversion formula',
    ib_myp: 'IB MYP',
    ib_max: 'Max: 32',
    ib_state_scale: 'State scale',
    ib_curr: 'National curriculum',
    ib_example: 'Example:',
    ib_ex1: 'IB total 24/32 = State',
    ib_ex2: 'IB total 29/32 = State',
    ib_total: 'IB Total',
    ib_state: 'State',

    np_label: 'Ministry Management Panel',
    np_country: 'Ministry of Education of the Republic of Azerbaijan',
    np_live: 'Live · Last update: 09:42',
    np_k_schools: 'Schools', np_k_students: 'Students',
    np_k_ai: 'AI Sessions', np_k_avg: 'Average Grade',
    np_t1: '+3 this quarter', np_t2: '+214 this month',
    np_t3: '+1.2k this week', np_t4: '↑ 0.4 increase',
    np_monthly: 'Monthly Performance Trend',
    np_events: 'Recent Events',
    np_e1: 'School №47 submitted its monthly report',
    np_e2: 'A new school joined: №89',
    np_e3: 'E-Gov export completed automatically',
    np_e4: 'TISA attendance report received',
    np_e5: 'System backup completed',
    np_yesterday: 'Yday',
    np_ranking: 'School Ranking',
    np_q_year: 'This quarter · 2025',

    ar_title: 'Automated Report Generator',
    ar_sub: 'One-click export to PDF, Excel and E-Gov.az formats',
    ar_params: 'Report parameters',
    ar_type: 'Report type',
    ar_type_1: 'Quarterly Academic Report',
    ar_type_2: 'Attendance Report',
    ar_type_3: 'IB MYP Audit',
    ar_type_4: 'Ministry Overview',
    ar_range: 'Date range',
    ar_range_1: 'Q1 2025 (Jan – Mar)',
    ar_range_2: 'Q2 2025 (Apr – Jun)',
    ar_range_3: '2024–2025 Academic Year',
    ar_range_4: 'January 2025',
    ar_school: 'School',
    ar_all_schools: 'All schools',
    ar_auto: 'Send automatically',
    ar_auto_sub: 'On the 1st of every month — Ministry email',
    ar_preview: 'Preview',
    ar_q1: 'Q1 2025',
    ar_rep_title: 'Q1 2025 Quarterly Academic Report',
    ar_rep_period: 'All schools · 01 January – 31 March 2025',
    ar_row1: 'Total Schools', ar_row2: 'Active Students',
    ar_row3: 'Average Grade', ar_row4: 'Attendance',
    ar_row5: 'AI Sessions',
    ar_footer: 'Zirva MIS · zirva.az · Confidential document',

    ds_title: 'Data Sovereignty Panel',
    ds_sub: 'Infrastructure fully compliant with Azerbaijani law',
    ds_c1: 'Server Location', ds_c1_v: 'Baku, AZ 🇦🇿',
    ds_c2: 'Encryption',       ds_c2_v: 'AES-256',
    ds_c3: 'State Control',    ds_c3_v: 'Full Control',
    ds_c4: 'GDPR Compliance',  ds_c4_v: 'Certified',
    ds_active: 'Active',
    ds_certs: 'Certifications & Compliance',
    ds_b1: 'Azerbaijani "Electronic Signature" Law',
    ds_b2: 'ISO 27001 Information Security',
    ds_b3: 'GDPR Compliance',
    ds_b4: 'State Encryption Standard',
    ds_b5: 'AES-256 Encryption',
    ds_log: 'Access Log',
    ds_last_5: 'Last 5 events',
    ds_u1: 'Ministry Portal',       ds_a1: 'Read Q1 report',
    ds_u2: 'E-Gov.az System',       ds_a2: 'Exported attendance',
    ds_u3: 'Audit Service',          ds_a3: 'Read IB audit document',
    ds_u4: 'ASAN Service Gateway',   ds_a4: 'Student identity check',
    ds_u5: 'System Backup',           ds_a5: 'Automatic backup',
    ds_today: 'Today', ds_yday: 'Yesterday',
    ds_allowed: 'Allowed', ds_system: 'System',

    an_title: 'Trend Analytics',
    an_sub: '2024–2025 academic year · National monitoring',
    an_m_avg: 'Avg grade', an_m_att: 'Attendance', an_m_ai: 'AI Usage',
    an_line: 'Average Grade Trend — 12 months',
    an_yoy: '↑ 18.8% year-over-year',
    an_cmp: 'School Comparison',
    an_tb: 'Top & Bottom',
    an_top: 'Top 3', an_att: 'Attention',

    bn_title: 'Notifications',
    bn_unread: '2 unread notifications',
    bn_mark_all: 'Mark all as read',
    bn_tab1: 'All', bn_tab2: 'Critical', bn_tab3: 'Report', bn_tab4: 'System',
    bn_n1: 'School №47 submitted its monthly report',
    bn_n2: 'School №6 attendance dropped (88%)',
    bn_n3: 'E-Gov.az export completed automatically',
    bn_n4: 'A new school joined: School №89',
    bn_n5: 'TISA Q1 report generated — PDF ready',
    bn_n6: 'System backup completed successfully',
    bn_n7: 'School №132 did not submit the IB audit document',
    bn_t_report: 'report', bn_t_critical: 'critical', bn_t_system: 'system',
    bn_time_2d: '2 days',

    eg_title: 'E-Gov Integration Panel',
    eg_sub: 'Full integration with ASAN, E-Gov.az and the State Register',
    eg_push: 'Send to E-Gov',
    eg_s1: 'ASAN Service', eg_s2: 'E-Gov.az',
    eg_s3: 'State Register', eg_s4: 'MEI',
    eg_connected: 'Connected',
    eg_sync_1: '09:42 · Today', eg_sync_2: '09:30 · Today',
    eg_sync_3: '08:00 · Today', eg_sync_4: 'Yesterday, 23:00',
    eg_export: 'Data Export',
    eg_auto: 'Auto: every day at 08:00',
    eg_att: 'Attendance', eg_grades: 'Grades', eg_reports: 'Reports',
    eg_att_c: '5,247 records', eg_grades_c: '31,482 records', eg_reports_c: '47 documents',
    eg_log: 'Recent Export Log',
    eg_l1: 'Attendance Export', eg_l2: 'Q1 Report Bundle',
    eg_l3: 'Student List', eg_l4: 'IB Audit Documents',
    eg_d1: 'E-Gov.az', eg_d2: 'Ministry Portal',
    eg_d3: 'State Register', eg_d4: 'ASAN Service',
    eg_st_ok: 'Successful', eg_st_wait: 'Pending',
    eg_yday: 'Yesterday',

    mon: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],

    ib_crit_a: 'A — Knowledge & Understanding',
    ib_crit_b: 'B — Investigating',
    ib_crit_c: 'C — Communicating',
    ib_crit_d: 'D — Thinking skills',
  },

  ru: {
    demo: 'Демо',
    signup: 'Регистрация',
    back_home: 'На главную',
    not_found: 'Демо не найдено',

    meta: {
      jurnal:                 { title: 'Журнал оценок',             subtitle: 'Gradebook' },
      davamiyyat:             { title: 'Журнал посещаемости',       subtitle: 'Attendance' },
      zeka:                   { title: 'Зека — AI-репетитор',       subtitle: 'AI Tutor' },
      mesajlar:               { title: 'Сообщения',                 subtitle: 'Messaging' },
      hesabatlar:             { title: 'Отчёты',                    subtitle: 'Reports' },
      'ib-dovlet':            { title: 'IB & Государство',          subtitle: 'IB & State' },
      'milli-panel':          { title: 'Нацмониторинг',             subtitle: 'National Panel' },
      'avtomatik-hesabatlar': { title: 'Автоматические отчёты',     subtitle: 'Auto Reports' },
      melumat:                { title: 'Суверенитет данных',        subtitle: 'Data Sovereignty' },
      analitika:              { title: 'Аналитика трендов',         subtitle: 'Analytics' },
      bildirisler:            { title: 'Мгновенные уведомления',    subtitle: 'Notifications' },
      egov:                   { title: 'Интеграция E-Gov',          subtitle: 'E-Gov Integration' },
    },

    classes: 'Классы', class_suffix: 'Класс',
    subject_math: 'Математика', subject_eng: 'Английский', subject_bio: 'Биология',
    subject_hist: 'История', subject_phys: 'Физика', subject_chem: 'Химия',
    student: 'Ученик', average: 'Ср.', save: 'Сохранить',
    state_1_10: 'Гос. (1–10)', sync_ok: 'Синхронизировано',

    j_header: '9А — Журнал математики',
    j_term: '2024–2025 · II кв.',

    att_date_label: 'Дата',
    att_today: 'Среда, 14 апреля 2026',
    att_class: 'Класс',
    att_class_val: '9А — 30 учеников',
    att_sms: '2 родителям отправлено SMS',
    att_came: 'Пришёл', att_missed: 'Не пришёл', att_absent: 'Нет',
    att_came_n: '{n} пришли', att_missed_n: '{n} не пришли',

    z_pick_subject: 'Выберите предмет',
    z_recent: 'Последние сессии',
    z_rec_1: 'Квадратные уравнения', z_rec_2: 'Интегралы — введение',
    z_rec_3: 'Логарифмическая функция', z_rec_4: 'Тригонометрия',
    z_powered: 'На базе Claude',
    z_online: 'В сети · Сессия математики',
    z_q1: 'Когда используют квадратные уравнения?',
    z_a1_p1: 'Квадратное уравнение — уравнение вида ax² + bx + c = 0.',
    z_a1_p2: 'Примеры применения в реальной жизни:',
    z_a1_l1: 'Расчёт траектории снаряда в физике',
    z_a1_l2: 'Расчёт площадей в инженерии',
    z_a1_l3: 'Модели доходов и расходов в финансах',
    z_q2: 'Можешь дать задачу?',
    z_a2_p1: 'Конечно! Вот практическая задача:',
    z_a2_problem: 'Решите уравнение x² − 5x + 6 = 0.',
    z_a2_hint: 'Подсказка: a=1, b=−5, c=6. Найдите дискриминант и вычислите корни.',
    z_placeholder: 'Задайте вопрос...',

    search: 'Поиск...',
    m_teacher: 'Учитель Алиев',
    m_parent: 'Родитель Гасанова',
    m_class_announce: 'Объявление классу',
    m_admin: 'Администратор',
    m_prev_1: 'Об итогах экзамена...',
    m_prev_2: 'Посещаемость ребёнка...',
    m_prev_3: '📢 Экзамен по математике...',
    m_prev_4: 'Для подготовки отчёта...',
    m_time_y: 'Вчера',
    m_you: 'Вы',
    m_msg_1: 'Здравствуйте! На следующей неделе состоится экзамен по математике. Просьба подготовиться.',
    m_msg_2: 'Здравствуйте. Какие темы будут включены?',
    m_msg_3: 'Квадратные уравнения, логарифмы и тригонометрия. Поделюсь материалами.',
    m_msg_4: 'Большое спасибо! Буду готовиться с Зека.',
    m_msg_5: 'Отлично! Экзамен начинается в 10:00. Удачи 👍',
    m_online: 'В сети',
    m_input: 'Написать сообщение...',

    r_title: 'Отчёты',
    r_year: 'Учебный год 2024–2025',
    r_new: '+ Создать новый отчёт',
    r_1: 'Квартальный отчёт Q1 2025',
    r_2: 'Посещаемость за январь',
    r_3: 'IB Audit 2025',
    r_4: 'Соответствие национальному плану',
    r_5: 'Посещаемость за февраль',
    r_6: 'Отчёт о прогрессе учащихся',
    r_ready: 'Готов',
    r_egov: 'E-Gov ✓',
    r_preparing: 'Готовится...',
    r_done: 'Завершено',
    r_draft: 'Черновик',

    ib_title: 'Соответствие IB & Государству',
    ib_sub: 'Критерии MYP ↔ Национальная 10-балльная шкала — Автоматическое преобразование',
    ib_confirmed: 'Соответствие IB подтверждено',
    ib_formula: 'Формула автоматического преобразования',
    ib_myp: 'IB MYP',
    ib_max: 'Макс: 32',
    ib_state_scale: 'Государственная шкала',
    ib_curr: 'Нац. программа',
    ib_example: 'Пример:',
    ib_ex1: 'Сумма IB 24/32 = Государственная',
    ib_ex2: 'Сумма IB 29/32 = Государственная',
    ib_total: 'Сумма IB',
    ib_state: 'Государственная',

    np_label: 'Панель управления Министерства',
    np_country: 'Министерство образования Азербайджанской Республики',
    np_live: 'В реальном времени · Обновлено: 09:42',
    np_k_schools: 'Школа', np_k_students: 'Ученик',
    np_k_ai: 'AI Сессия', np_k_avg: 'Ср. оценка',
    np_t1: '+3 в этом квартале', np_t2: '+214 в этом месяце',
    np_t3: '+1.2k на этой неделе', np_t4: '↑ 0.4 рост',
    np_monthly: 'Ежемесячный тренд успеваемости',
    np_events: 'Последние события',
    np_e1: 'Школа №47 отправила ежемесячный отчёт',
    np_e2: 'Новая школа подключена: №89',
    np_e3: 'Экспорт E-Gov завершён автоматически',
    np_e4: 'Получен отчёт TISA о посещаемости',
    np_e5: 'Резервное копирование системы завершено',
    np_yesterday: 'Вчера',
    np_ranking: 'Рейтинг школ',
    np_q_year: 'Этот квартал · 2025',

    ar_title: 'Автоматический генератор отчётов',
    ar_sub: 'Экспорт в PDF, Excel, E-Gov.az в один клик',
    ar_params: 'Параметры отчёта',
    ar_type: 'Тип отчёта',
    ar_type_1: 'Квартальный академический отчёт',
    ar_type_2: 'Отчёт о посещаемости',
    ar_type_3: 'IB MYP Audit',
    ar_type_4: 'Сводка для Министерства',
    ar_range: 'Период',
    ar_range_1: 'Q1 2025 (Янв – Мар)',
    ar_range_2: 'Q2 2025 (Апр – Июн)',
    ar_range_3: 'Учебный год 2024–2025',
    ar_range_4: 'Январь 2025',
    ar_school: 'Школа',
    ar_all_schools: 'Все школы',
    ar_auto: 'Автоотправка',
    ar_auto_sub: '1-го числа каждого месяца — на почту Министерства',
    ar_preview: 'Предпросмотр',
    ar_q1: 'Q1 2025',
    ar_rep_title: 'Квартальный академический отчёт Q1 2025',
    ar_rep_period: 'Все школы · 01 января – 31 марта 2025',
    ar_row1: 'Всего школ', ar_row2: 'Активных учеников',
    ar_row3: 'Средняя оценка', ar_row4: 'Посещаемость',
    ar_row5: 'AI Сессии',
    ar_footer: 'Zirva MIS · zirva.az · Конфиденциальный документ',

    ds_title: 'Панель суверенитета данных',
    ds_sub: 'Инфраструктура, полностью соответствующая законодательству Азербайджана',
    ds_c1: 'Расположение серверов', ds_c1_v: 'Баку, AZ 🇦🇿',
    ds_c2: 'Шифрование',            ds_c2_v: 'AES-256',
    ds_c3: 'Государственный контроль', ds_c3_v: 'Полный контроль',
    ds_c4: 'Соответствие GDPR',     ds_c4_v: 'Сертифицировано',
    ds_active: 'Активно',
    ds_certs: 'Сертификаты & Соответствие',
    ds_b1: 'Закон Азербайджана об электронной подписи',
    ds_b2: 'ISO 27001 Информационная безопасность',
    ds_b3: 'Соответствие GDPR',
    ds_b4: 'Государственный стандарт шифрования',
    ds_b5: 'Шифрование AES-256',
    ds_log: 'Журнал доступа',
    ds_last_5: 'Последние 5 событий',
    ds_u1: 'Портал Министерства',      ds_a1: 'Отчёт Q1 прочитан',
    ds_u2: 'Система E-Gov.az',         ds_a2: 'Посещаемость экспортирована',
    ds_u3: 'Служба аудита',            ds_a3: 'Документ IB Audit прочитан',
    ds_u4: 'ASAN Xidmət Gateway',      ds_a4: 'Идентификация учащегося',
    ds_u5: 'Резервное копирование',    ds_a5: 'Автоматическое резервирование',
    ds_today: 'Сегодня', ds_yday: 'Вчера',
    ds_allowed: 'Разрешено', ds_system: 'Система',

    an_title: 'Аналитика трендов',
    an_sub: 'Учебный год 2024–2025 · Национальный мониторинг',
    an_m_avg: 'Средняя оценка', an_m_att: 'Посещаемость', an_m_ai: 'Использование AI',
    an_line: 'Тренд средней оценки — 12 месяцев',
    an_yoy: '↑ 18.8% прирост год к году',
    an_cmp: 'Сравнение школ',
    an_tb: 'Лучшие & Слабейшие',
    an_top: 'Топ 3', an_att: 'Требуют внимания',

    bn_title: 'Уведомления',
    bn_unread: '2 непрочитанных уведомления',
    bn_mark_all: 'Отметить всё как прочитанное',
    bn_tab1: 'Все', bn_tab2: 'Критичные', bn_tab3: 'Отчёты', bn_tab4: 'Система',
    bn_n1: 'Школа №47 отправила ежемесячный отчёт',
    bn_n2: 'Процент посещаемости в школе №6 снизился (88%)',
    bn_n3: 'Экспорт E-Gov.az завершён автоматически',
    bn_n4: 'Подключена новая школа: №89',
    bn_n5: 'Отчёт TISA Q1 готов — PDF доступен',
    bn_n6: 'Резервное копирование системы выполнено успешно',
    bn_n7: 'Школа №132 не предоставила документы IB Audit',
    bn_t_report: 'отчёт', bn_t_critical: 'критично', bn_t_system: 'система',
    bn_time_2d: '2 дня',

    eg_title: 'Панель интеграции E-Gov',
    eg_sub: 'Полная интеграция с ASAN Xidmət, E-Gov.az, Государственным реестром',
    eg_push: 'Отправить в E-Gov',
    eg_s1: 'ASAN Xidmət', eg_s2: 'E-Gov.az',
    eg_s3: 'Государственный реестр', eg_s4: 'МИМ',
    eg_connected: 'Подключено',
    eg_sync_1: '09:42 · Сегодня', eg_sync_2: '09:30 · Сегодня',
    eg_sync_3: '08:00 · Сегодня', eg_sync_4: 'Вчера, 23:00',
    eg_export: 'Экспорт данных',
    eg_auto: 'Автоматически: каждый день 08:00',
    eg_att: 'Посещаемость', eg_grades: 'Оценки', eg_reports: 'Отчёты',
    eg_att_c: '5,247 записей', eg_grades_c: '31,482 записей', eg_reports_c: '47 документов',
    eg_log: 'Журнал экспортов',
    eg_l1: 'Экспорт посещаемости', eg_l2: 'Пакет отчётов Q1',
    eg_l3: 'Список учеников', eg_l4: 'Документы IB Audit',
    eg_d1: 'E-Gov.az', eg_d2: 'Портал Министерства',
    eg_d3: 'Государственный реестр', eg_d4: 'ASAN Xidmət',
    eg_st_ok: 'Успешно', eg_st_wait: 'Ожидает',
    eg_yday: 'Вчера',

    mon: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],

    ib_crit_a: 'A — Знания и понимание',
    ib_crit_b: 'B — Исследование',
    ib_crit_c: 'C — Коммуникация',
    ib_crit_d: 'D — Мышление',
  },

  tr: {
    demo: 'Demo',
    signup: 'Kayıt ol',
    back_home: 'Ana sayfaya dön',
    not_found: 'Demo bulunamadı',

    meta: {
      jurnal:                 { title: 'Not Defteri',               subtitle: 'Gradebook' },
      davamiyyat:             { title: 'Devam Kaydı',               subtitle: 'Attendance' },
      zeka:                   { title: 'Zeka — AI Öğretmen',        subtitle: 'AI Tutor' },
      mesajlar:               { title: 'Mesajlaşma',                subtitle: 'Messaging' },
      hesabatlar:             { title: 'Raporlar',                  subtitle: 'Reports' },
      'ib-dovlet':            { title: 'IB & Devlet',               subtitle: 'IB & State' },
      'milli-panel':          { title: 'Ulusal İzleme Paneli',      subtitle: 'National Panel' },
      'avtomatik-hesabatlar': { title: 'Otomatik Raporlar',         subtitle: 'Auto Reports' },
      melumat:                { title: 'Veri Egemenliği',           subtitle: 'Data Sovereignty' },
      analitika:              { title: 'Trend Analitiği',           subtitle: 'Analytics' },
      bildirisler:            { title: 'Anlık Bildirimler',         subtitle: 'Notifications' },
      egov:                   { title: 'E-Gov Entegrasyonu',        subtitle: 'E-Gov Integration' },
    },

    classes: 'Sınıflar', class_suffix: 'Sınıfı',
    subject_math: 'Matematik', subject_eng: 'İngilizce', subject_bio: 'Biyoloji',
    subject_hist: 'Tarih', subject_phys: 'Fizik', subject_chem: 'Kimya',
    student: 'Öğrenci', average: 'Ort.', save: 'Kaydet',
    state_1_10: 'Devlet (1–10)', sync_ok: 'Senkronize edildi',

    j_header: '9A Sınıfı — Matematik Not Defteri',
    j_term: '2024–2025 · II. Dönem',

    att_date_label: 'Tarih',
    att_today: '14 Nisan 2026, Çarşamba',
    att_class: 'Sınıf',
    att_class_val: '9A — 30 öğrenci',
    att_sms: '2 veliye SMS gönderildi',
    att_came: 'Geldi', att_missed: 'Gelmedi', att_absent: 'Yok',
    att_came_n: '{n} geldi', att_missed_n: '{n} gelmedi',

    z_pick_subject: 'Ders seçin',
    z_recent: 'Son oturumlar',
    z_rec_1: 'İkinci derece denklemler', z_rec_2: 'İntegral — giriş',
    z_rec_3: 'Logaritma fonksiyonu', z_rec_4: 'Trigonometri',
    z_powered: 'Claude ile desteklenmektedir',
    z_online: 'Çevrimiçi · Matematik oturumu',
    z_q1: 'İkinci derece denklemler ne zaman kullanılır?',
    z_a1_p1: 'İkinci derece denklem, ax² + bx + c = 0 biçiminde yazılan bir denklemdir.',
    z_a1_p2: 'Gerçek hayattan kullanım örnekleri:',
    z_a1_l1: 'Fizikte mermi hareketi hesaplaması',
    z_a1_l2: 'Mühendislikte alan hesaplamaları',
    z_a1_l3: 'Finansta gelir-gider modelleri',
    z_q2: 'Bir soru verebilir misin?',
    z_a2_p1: 'Elbette! İşte pratik bir soru:',
    z_a2_problem: 'x² − 5x + 6 = 0 denklemini çözün.',
    z_a2_hint: 'İpucu: a=1, b=−5, c=6. Diskriminantı bulup kökleri hesaplayın.',
    z_placeholder: 'Soru yazın...',

    search: 'Ara...',
    m_teacher: 'Öğretmen Aliyev',
    m_parent: 'Veli Hasanova',
    m_class_announce: 'Sınıf Duyurusu',
    m_admin: 'Yönetici',
    m_prev_1: 'Sınav sonucu hakkında...',
    m_prev_2: 'Çocuğumun devamı...',
    m_prev_3: '📢 Matematik sınavı...',
    m_prev_4: 'Rapor hazırlamak için...',
    m_time_y: 'Dün',
    m_you: 'Siz',
    m_msg_1: 'Merhaba! Gelecek hafta matematik sınavı yapılacak. Öğrenciler hazırlansın.',
    m_msg_2: 'Merhaba öğretmenim. Hangi konular dahil olacak?',
    m_msg_3: 'İkinci derece denklemler, logaritmalar ve trigonometri. Materyal paylaşacağım.',
    m_msg_4: 'Çok teşekkürler! Zeka ile hazırlanacağım.',
    m_msg_5: 'Harika! Sınav saat 10:00\'da başlıyor. Başarılar 👍',
    m_online: 'Çevrimiçi',
    m_input: 'Mesaj yazın...',

    r_title: 'Raporlar',
    r_year: '2024–2025 öğretim yılı',
    r_new: '+ Yeni rapor oluştur',
    r_1: 'Q1 2025 Dönemlik Rapor',
    r_2: 'Ocak Devam Raporu',
    r_3: 'IB Audit 2025',
    r_4: 'Ulusal Müfredat Uyumluluğu',
    r_5: 'Şubat Devam Raporu',
    r_6: 'Öğrenci Gelişim Raporu',
    r_ready: 'Hazır',
    r_egov: 'E-Gov ✓',
    r_preparing: 'Hazırlanıyor...',
    r_done: 'Tamamlandı',
    r_draft: 'Taslak',

    ib_title: 'IB & Devlet Uyumluluğu',
    ib_sub: 'MYP Kriterleri ↔ Ulusal 10 puanlık ölçek — Otomatik dönüştürme',
    ib_confirmed: 'IB uyumluluğu onaylandı',
    ib_formula: 'Otomatik dönüştürme formülü',
    ib_myp: 'IB MYP',
    ib_max: 'Maks: 32',
    ib_state_scale: 'Devlet ölçeği',
    ib_curr: 'Ulusal müfredat',
    ib_example: 'Örnek:',
    ib_ex1: 'IB toplamı 24/32 = Devlet',
    ib_ex2: 'IB toplamı 29/32 = Devlet',
    ib_total: 'IB Toplam',
    ib_state: 'Devlet',

    np_label: 'Bakanlık Yönetim Paneli',
    np_country: 'Azerbaycan Cumhuriyeti Milli Eğitim Bakanlığı',
    np_live: 'Canlı · Son güncelleme: 09:42',
    np_k_schools: 'Okul', np_k_students: 'Öğrenci',
    np_k_ai: 'AI Oturumu', np_k_avg: 'Ort. Not',
    np_t1: 'Bu dönemde +3', np_t2: 'Bu ay +214',
    np_t3: 'Bu hafta +1.2k', np_t4: '↑ 0.4 artış',
    np_monthly: 'Aylık Başarı Trendi',
    np_events: 'Son Olaylar',
    np_e1: 'Okul №47 aylık rapor gönderdi',
    np_e2: 'Yeni okul bağlandı: №89',
    np_e3: 'E-Gov dışa aktarma otomatik tamamlandı',
    np_e4: 'TISA devam raporu alındı',
    np_e5: 'Sistem yedeklemesi tamamlandı',
    np_yesterday: 'Dün',
    np_ranking: 'Okul Sıralaması',
    np_q_year: 'Bu dönemde · 2025',

    ar_title: 'Otomatik Rapor Üreticisi',
    ar_sub: 'PDF, Excel, E-Gov.az formatında tek tıkla dışa aktar',
    ar_params: 'Rapor parametreleri',
    ar_type: 'Rapor türü',
    ar_type_1: 'Dönemlik Akademik Rapor',
    ar_type_2: 'Devam Raporu',
    ar_type_3: 'IB MYP Audit',
    ar_type_4: 'Bakanlık Özeti',
    ar_range: 'Tarih aralığı',
    ar_range_1: 'Q1 2025 (Oca – Mar)',
    ar_range_2: 'Q2 2025 (Nis – Haz)',
    ar_range_3: '2024–2025 Öğretim Yılı',
    ar_range_4: 'Ocak 2025',
    ar_school: 'Okul',
    ar_all_schools: 'Tüm okullar',
    ar_auto: 'Otomatik gönder',
    ar_auto_sub: 'Her ayın 1\'i — Bakanlık e-postası',
    ar_preview: 'Önizleme',
    ar_q1: 'Q1 2025',
    ar_rep_title: 'Q1 2025 Dönemlik Akademik Rapor',
    ar_rep_period: 'Tüm okullar · 01 Ocak – 31 Mart 2025',
    ar_row1: 'Toplam Okul', ar_row2: 'Aktif Öğrenci',
    ar_row3: 'Ortalama Not', ar_row4: 'Devam',
    ar_row5: 'AI Oturumları',
    ar_footer: 'Zirva MIS · zirva.az · Gizli belge',

    ds_title: 'Veri Egemenliği Paneli',
    ds_sub: 'Azerbaycan mevzuatına tam uyumlu altyapı',
    ds_c1: 'Sunucu Konumu', ds_c1_v: 'Bakü, AZ 🇦🇿',
    ds_c2: 'Şifreleme',     ds_c2_v: 'AES-256',
    ds_c3: 'Devlet Denetimi', ds_c3_v: 'Tam Denetim',
    ds_c4: 'GDPR Uyumluluğu', ds_c4_v: 'Sertifikalı',
    ds_active: 'Aktif',
    ds_certs: 'Sertifikalar & Uyumluluk',
    ds_b1: 'Azerbaycan "Elektronik İmza" Kanunu',
    ds_b2: 'ISO 27001 Bilgi Güvenliği',
    ds_b3: 'GDPR Uyumluluğu',
    ds_b4: 'Devlet Şifreleme Standardı',
    ds_b5: 'AES-256 Şifreleme',
    ds_log: 'Erişim Kaydı',
    ds_last_5: 'Son 5 olay',
    ds_u1: 'Bakanlık Portalı',       ds_a1: 'Q1 raporu okundu',
    ds_u2: 'E-Gov.az Sistemi',       ds_a2: 'Devam dışa aktarıldı',
    ds_u3: 'Denetim Servisi',        ds_a3: 'IB audit belgesi okundu',
    ds_u4: 'ASAN Xidmət Gateway',   ds_a4: 'Öğrenci kimlik doğrulama',
    ds_u5: 'Sistem Yedeklemesi',     ds_a5: 'Otomatik yedekleme',
    ds_today: 'Bugün', ds_yday: 'Dün',
    ds_allowed: 'İzinli', ds_system: 'Sistem',

    an_title: 'Trend Analitiği',
    an_sub: '2024–2025 öğretim yılı · Ulusal izleme',
    an_m_avg: 'Ortalama not', an_m_att: 'Devam', an_m_ai: 'AI Kullanımı',
    an_line: 'Ortalama Not Trendi — 12 aylık',
    an_yoy: '↑ %18.8 yıllık artış',
    an_cmp: 'Okul Karşılaştırması',
    an_tb: 'En İyi & En Zayıf',
    an_top: 'İlk 3', an_att: 'Dikkat',

    bn_title: 'Bildirimler',
    bn_unread: '2 okunmamış bildirim',
    bn_mark_all: 'Hepsini okundu say',
    bn_tab1: 'Tümü', bn_tab2: 'Kritik', bn_tab3: 'Rapor', bn_tab4: 'Sistem',
    bn_n1: 'Okul №47 aylık rapor gönderdi',
    bn_n2: 'Okul №6 devam yüzdesi düştü (%88)',
    bn_n3: 'E-Gov.az dışa aktarma otomatik tamamlandı',
    bn_n4: 'Yeni okul bağlandı: Okul №89',
    bn_n5: 'TISA Q1 raporu hazırlandı — PDF hazır',
    bn_n6: 'Sistem yedeklemesi başarıyla tamamlandı',
    bn_n7: 'Okul №132 IB audit belgesini sunmadı',
    bn_t_report: 'rapor', bn_t_critical: 'kritik', bn_t_system: 'sistem',
    bn_time_2d: '2 gün',

    eg_title: 'E-Gov Entegrasyon Paneli',
    eg_sub: 'ASAN Xidmət, E-Gov.az, Devlet Sicili ile tam entegrasyon',
    eg_push: "E-Gov'a Gönder",
    eg_s1: 'ASAN Xidmət', eg_s2: 'E-Gov.az',
    eg_s3: 'Devlet Sicili', eg_s4: 'MİM',
    eg_connected: 'Bağlı',
    eg_sync_1: '09:42 · Bugün', eg_sync_2: '09:30 · Bugün',
    eg_sync_3: '08:00 · Bugün', eg_sync_4: 'Dün, 23:00',
    eg_export: 'Veri Dışa Aktarma',
    eg_auto: 'Otomatik: her gün 08:00',
    eg_att: 'Devam', eg_grades: 'Notlar', eg_reports: 'Raporlar',
    eg_att_c: '5.247 kayıt', eg_grades_c: '31.482 kayıt', eg_reports_c: '47 belge',
    eg_log: 'Son Dışa Aktarma Kaydı',
    eg_l1: 'Devam Dışa Aktarma', eg_l2: 'Rapor Paketi Q1',
    eg_l3: 'Öğrenci Listesi', eg_l4: 'IB Audit Belgeleri',
    eg_d1: 'E-Gov.az', eg_d2: 'Bakanlık Portalı',
    eg_d3: 'Devlet Sicili', eg_d4: 'ASAN Xidmət',
    eg_st_ok: 'Başarılı', eg_st_wait: 'Bekliyor',
    eg_yday: 'Dün',

    mon: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],

    ib_crit_a: 'A — Bilgi ve anlama',
    ib_crit_b: 'B — Araştırma',
    ib_crit_c: 'C — İletişim',
    ib_crit_d: 'D — Düşünme becerileri',
  },
}

function useD() {
  const { lang } = useLang()
  return D[lang] || D.az
}

/* ─── Gradebook Demo ─── */
function JurnalDemo() {
  const d = useD()
  const students = [
    { name: 'Əli Həsənov',      grades: [8, 7, 9, 8, 7], avg: 7.8 },
    { name: 'Leyla Məmmədova',  grades: [9, 9, 8, 9, 10], avg: 9.0 },
    { name: 'Nicat Rəsuli',     grades: [6, 7, 6, 7, 6], avg: 6.4 },
    { name: 'Aytən Əliyeva',    grades: [10, 9, 10, 9, 9], avg: 9.4 },
    { name: 'Rauf Quliyev',     grades: [7, 6, 7, 8, 7], avg: 7.0 },
    { name: 'Sevinc Hüseynova', grades: [8, 8, 9, 7, 8], avg: 8.0 },
  ]
  const subjects = [d.subject_math, d.subject_eng, d.subject_bio, d.subject_hist, d.subject_phys]

  function gradeColor(g) {
    if (g >= 9) return 'bg-teal-light text-teal font-semibold'
    if (g >= 7) return 'bg-purple-light text-purple font-semibold'
    return 'bg-red-50 text-red-500 font-semibold'
  }

  return (
    <div className="flex min-h-[600px]">
      <div className="w-48 bg-gray-50 border-r border-gray-200 flex flex-col">
        <div className="px-4 py-4 border-b border-gray-200">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">{d.classes}</p>
        </div>
        {['9A', '9B', '10A', '10B', '11A'].map((cls, i) => (
          <button
            key={cls}
            className={`w-full text-left px-4 py-3 text-sm border-b border-gray-100 transition-colors ${i === 0 ? 'bg-purple-light text-purple font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            {cls} {d.class_suffix}
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="font-semibold text-gray-900 text-sm">{d.j_header}</h2>
            <p className="text-[11px] text-gray-400">{d.j_term}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {['KR.A', 'KR.B', 'KR.C', 'KR.D'].map((k, i) => (
                <button key={k} className={`px-3 py-1 text-[11px] rounded-full border ${i === 0 ? 'bg-purple text-white border-purple' : 'border-gray-200 text-gray-500 hover:border-purple hover:text-purple'}`}>{k}</button>
              ))}
              <button className="px-3 py-1 text-[11px] rounded-full border border-teal/30 text-teal bg-teal-light ml-1">{d.state_1_10}</button>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-teal bg-teal-light rounded-full px-3 py-1">
              <Check className="w-3 h-3" />
              {d.sync_ok}
            </div>
            <button className="bg-purple text-white text-xs px-4 py-1.5 rounded-full hover:bg-purple/90 transition-colors">{d.save}</button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-[11px] text-gray-500 uppercase tracking-wider font-medium w-48">{d.student}</th>
                  {subjects.map(s => (
                    <th key={s} className="px-4 py-3 text-[11px] text-gray-500 uppercase tracking-wider font-medium text-center">{s}</th>
                  ))}
                  <th className="px-4 py-3 text-[11px] text-gray-500 uppercase tracking-wider font-medium text-center">{d.average}</th>
                </tr>
              </thead>
              <tbody>
                {students.map((st, i) => (
                  <tr key={st.name} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-light flex items-center justify-center text-purple text-[11px] font-semibold flex-shrink-0">
                          {st.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-gray-800 text-sm font-medium">{st.name}</span>
                      </div>
                    </td>
                    {st.grades.map((g, j) => (
                      <td key={j} className="px-4 py-3 text-center">
                        <span className={`inline-block w-9 h-9 rounded-lg flex items-center justify-center text-sm ${gradeColor(g)}`}>{g}</span>
                      </td>
                    ))}
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block bg-gray-900 text-white text-xs font-bold px-3 py-1 rounded-full">{st.avg.toFixed(1)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Attendance Demo ─── */
function DavamiyyatDemo() {
  const d = useD()
  const students = [
    { name: 'Əli Həsənov',      initials: 'ƏH', present: true,  time: '08:05' },
    { name: 'Leyla Məmmədova',  initials: 'LM', present: true,  time: '08:02' },
    { name: 'Nicat Rəsuli',     initials: 'NR', present: false, time: '—'     },
    { name: 'Aytən Əliyeva',    initials: 'AƏ', present: true,  time: '07:58' },
    { name: 'Rauf Quliyev',     initials: 'RQ', present: true,  time: '08:11' },
    { name: 'Sevinc Hüseynova', initials: 'SH', present: true,  time: '08:03' },
    { name: 'Tural İsmayılov',  initials: 'Tİ', present: true,  time: '08:09' },
    { name: 'Günel Babayeva',   initials: 'GB', present: false, time: '—'     },
    { name: 'Orxan Nəsirov',    initials: 'ON', present: true,  time: '08:00' },
    { name: 'Nərmin Əsgərova',  initials: 'NƏ', present: true,  time: '08:07' },
  ]

  return (
    <div className="flex flex-col min-h-[600px]">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-purple-light rounded-xl px-4 py-2 border border-purple/20">
            <p className="text-[10px] text-purple uppercase tracking-wider font-medium">{d.att_date_label}</p>
            <p className="text-sm font-semibold text-gray-900">{d.att_today}</p>
          </div>
          <div className="bg-teal-light rounded-xl px-4 py-2 border border-teal/20">
            <p className="text-[10px] text-teal uppercase tracking-wider font-medium">{d.att_class}</p>
            <p className="text-sm font-semibold text-gray-900">{d.att_class_val}</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2 text-[11px] text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5">
          <Bell className="w-3 h-3" />
          {d.att_sms}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto space-y-2">
          {students.map((st) => (
            <div key={st.name} className="bg-white rounded-xl border border-gray-200 px-5 py-3 flex items-center gap-4 hover:border-purple/30 transition-colors shadow-sm">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${st.present ? 'bg-teal-light text-teal' : 'bg-red-50 text-red-400'}`}>
                {st.initials}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{st.name}</p>
                <p className="text-[11px] text-gray-400">{st.present ? `${d.att_came} · ${st.time}` : d.att_missed}</p>
              </div>
              <div className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full ${st.present ? 'bg-teal-light text-teal' : 'bg-red-50 text-red-400'}`}>
                {st.present ? <><Check className="w-3 h-3" /> {d.att_came}</> : <><span className="text-base leading-none">✕</span> {d.att_absent}</>}
              </div>
              <p className="text-sm font-mono text-gray-400 w-12 text-right">{st.time}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1.5 text-teal font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-teal" />
            {d.att_came_n.replace('{n}', '28')}
          </span>
          <span className="text-gray-300">·</span>
          <span className="flex items-center gap-1.5 text-red-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
            {d.att_missed_n.replace('{n}', '2')}
          </span>
        </div>
        <button className="bg-purple text-white text-sm px-6 py-2 rounded-full hover:bg-purple/90 transition-colors font-medium">{d.save}</button>
      </div>
    </div>
  )
}

/* ─── AI Tutor Demo ─── */
function ZekaDemo() {
  const d = useD()
  const messages = [
    { role: 'student', text: d.z_q1 },
    {
      role: 'ai',
      blocks: [
        { type: 'p', content: d.z_a1_p1 },
        { type: 'p', content: d.z_a1_p2 },
        { type: 'list', items: [d.z_a1_l1, d.z_a1_l2, d.z_a1_l3] },
        { type: 'formula', content: 'x = (−b ± √(b²−4ac)) / 2a' },
      ]
    },
    { role: 'student', text: d.z_q2 },
    {
      role: 'ai',
      blocks: [
        { type: 'p', content: d.z_a2_p1 },
        { type: 'problem', content: d.z_a2_problem },
        { type: 'p', content: d.z_a2_hint },
      ]
    },
  ]

  return (
    <div className="flex min-h-[600px]">
      <div className="w-56 bg-gray-50 border-r border-gray-200 flex flex-col">
        <div className="px-4 py-4 border-b border-gray-200">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">{d.z_pick_subject}</p>
          <div className="space-y-1">
            {[d.subject_math, d.subject_bio, d.subject_eng, d.subject_hist, d.subject_chem].map((s, i) => (
              <button key={s} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${i === 0 ? 'bg-purple text-white' : 'text-gray-600 hover:bg-gray-100'}`}>{s}</button>
            ))}
          </div>
        </div>
        <div className="px-4 py-4 flex-1 overflow-auto">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">{d.z_recent}</p>
          <div className="space-y-2">
            {[d.z_rec_1, d.z_rec_2, d.z_rec_3, d.z_rec_4].map((s, i) => (
              <button key={s} className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${i === 0 ? 'bg-purple-light text-purple border border-purple/20' : 'text-gray-500 hover:bg-gray-100'}`}>{s}</button>
            ))}
          </div>
        </div>
        <div className="px-4 py-3 border-t border-gray-200">
          <div className="flex items-center gap-1.5 text-[10px] text-purple bg-purple-light rounded-full px-3 py-1.5 border border-purple/20 justify-center">
            <Sparkles className="w-3 h-3" />
            {d.z_powered}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        <div className="border-b border-gray-100 px-6 py-3 flex items-center gap-3 bg-white flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple to-purple/60 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Zəka</p>
            <p className="text-[11px] text-teal">{d.z_online}</p>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-5">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'student' ? 'justify-end' : 'gap-3'}`}>
              {msg.role === 'ai' && (
                <div className="w-7 h-7 rounded-full bg-purple-light flex items-center justify-center flex-shrink-0 mt-1">
                  <Sparkles className="w-3.5 h-3.5 text-purple" />
                </div>
              )}
              <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${msg.role === 'student' ? 'bg-purple-light border border-purple/20 text-purple rounded-br-sm' : 'bg-gray-50 border border-gray-100 text-gray-700 rounded-bl-sm'}`}>
                {msg.text && <p>{msg.text}</p>}
                {msg.blocks && msg.blocks.map((b, j) => (
                  <div key={j} className="mb-2 last:mb-0">
                    {b.type === 'p' && <p className="leading-relaxed">{b.content}</p>}
                    {b.type === 'formula' && <div className="bg-purple-light border border-purple/20 rounded-lg px-3 py-2 font-mono text-xs text-purple my-2">{b.content}</div>}
                    {b.type === 'problem' && <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-amber-700 text-xs font-medium my-2">{b.content}</div>}
                    {b.type === 'list' && <ul className="space-y-1 mt-1">{b.items.map((it, k) => <li key={k} className="flex items-start gap-2"><span className="text-purple mt-0.5">•</span>{it}</li>)}</ul>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 p-4 bg-white flex-shrink-0">
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
            <input className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400" placeholder={d.z_placeholder} defaultValue="" readOnly />
            <button className="w-8 h-8 rounded-lg bg-purple flex items-center justify-center hover:bg-purple/90 transition-colors flex-shrink-0">
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Messaging Demo ─── */
function MesajlarDemo() {
  const d = useD()
  const conversations = [
    { name: d.m_teacher,       preview: d.m_prev_1, time: '09:15',   unread: 2, active: true  },
    { name: d.m_parent,        preview: d.m_prev_2, time: '08:47',   unread: 0, active: false },
    { name: d.m_class_announce, preview: d.m_prev_3, time: '08:20',   unread: 1, active: false },
    { name: d.m_admin,          preview: d.m_prev_4, time: d.m_time_y, unread: 0, active: false },
  ]

  const chatMessages = [
    { from: d.m_teacher, text: d.m_msg_1, time: '08:30', mine: false },
    { from: d.m_you,     text: d.m_msg_2, time: '08:32', mine: true },
    { from: d.m_teacher, text: d.m_msg_3, time: '08:35', mine: false },
    { from: d.m_you,     text: d.m_msg_4, time: '08:40', mine: true },
    { from: d.m_teacher, text: d.m_msg_5, time: '09:15', mine: false },
  ]

  return (
    <div className="flex min-h-[600px]">
      <div className="w-72 border-r border-gray-200 flex flex-col bg-white">
        <div className="px-4 py-4 border-b border-gray-200">
          <div className="bg-gray-100 rounded-xl px-3 py-2 flex items-center gap-2">
            <span className="text-gray-400 text-sm">🔍</span>
            <span className="text-sm text-gray-400">{d.search}</span>
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          {conversations.map((c) => (
            <div key={c.name} className={`px-4 py-3.5 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${c.active ? 'bg-purple-light/50 border-l-2 border-l-purple' : ''}`}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-purple-light flex items-center justify-center text-purple text-xs font-semibold flex-shrink-0">
                  {c.name.split(' ')[0][0]}{c.name.split(' ')[1]?.[0] || ''}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-sm font-medium text-gray-900 truncate">{c.name}</p>
                    <span className="text-[10px] text-gray-400 flex-shrink-0 ml-1">{c.time}</span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">{c.preview}</p>
                </div>
                {c.unread > 0 && <span className="w-4 h-4 rounded-full bg-purple text-white text-[10px] flex items-center justify-center flex-shrink-0">{c.unread}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        <div className="border-b border-gray-200 px-6 py-3 flex items-center gap-3 bg-white flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-teal-light flex items-center justify-center text-teal text-sm font-semibold">MƏ</div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{d.m_teacher}</p>
            <p className="text-[11px] text-teal">{d.m_online}</p>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-4 bg-gray-50/30">
          {chatMessages.map((m, i) => (
            <div key={i} className={`flex ${m.mine ? 'justify-end' : 'gap-3'}`}>
              {!m.mine && (
                <div className="w-7 h-7 rounded-full bg-teal-light flex items-center justify-center text-teal text-[10px] font-semibold flex-shrink-0 mt-1">MƏ</div>
              )}
              <div className={`max-w-[65%] rounded-2xl px-4 py-2.5 text-sm ${m.mine ? 'bg-purple text-white rounded-br-sm' : 'bg-white border border-gray-200 text-gray-700 rounded-bl-sm shadow-sm'}`}>
                <p>{m.text}</p>
                <p className={`text-[10px] mt-1 ${m.mine ? 'text-white/60' : 'text-gray-400'}`}>{m.time}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 p-4 bg-white flex-shrink-0">
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
            <input className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400" placeholder={d.m_input} readOnly />
            <button className="w-8 h-8 rounded-lg bg-purple flex items-center justify-center hover:bg-purple/90 transition-colors flex-shrink-0">
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Reports Demo ─── */
function HesabatlarDemo() {
  const d = useD()
  const reports = [
    { name: d.r_1, date: '01 Apr 2025', status: d.r_ready,     statusColor: 'text-teal bg-teal-light',     dot: 'bg-teal'          },
    { name: d.r_2, date: '01 Feb 2025', status: d.r_egov,      statusColor: 'text-teal bg-teal-light',     dot: 'bg-teal'          },
    { name: d.r_3, date: '15 Mar 2025', status: d.r_preparing, statusColor: 'text-amber-600 bg-amber-50',  dot: 'bg-amber-400'     },
    { name: d.r_4, date: '20 Mar 2025', status: d.r_done,      statusColor: 'text-purple bg-purple-light', dot: 'bg-purple'        },
    { name: d.r_5, date: '01 Mar 2025', status: d.r_egov,      statusColor: 'text-teal bg-teal-light',     dot: 'bg-teal'          },
    { name: d.r_6, date: '10 Apr 2025', status: d.r_draft,     statusColor: 'text-gray-500 bg-gray-100',   dot: 'bg-gray-400'      },
  ]

  return (
    <div className="flex flex-col min-h-[600px] bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="font-semibold text-gray-900">{d.r_title}</h2>
          <p className="text-[11px] text-gray-400">{d.r_year}</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 bg-white focus:outline-none">
            <option>PDF</option>
            <option>Excel</option>
            <option>E-Gov.az</option>
          </select>
          <button className="bg-purple text-white text-sm px-4 py-2 rounded-full hover:bg-purple/90 transition-colors font-medium">{d.r_new}</button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-3">
          {reports.map((r) => (
            <div key={r.name} className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center gap-4 hover:border-purple/30 transition-colors shadow-sm">
              <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${r.dot}`} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{r.name}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{r.date}</p>
              </div>
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${r.statusColor}`}>{r.status}</span>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:border-purple hover:text-purple transition-colors">
                  <Download className="w-3 h-3" />PDF
                </button>
                <button className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:border-teal hover:text-teal transition-colors">
                  <Download className="w-3 h-3" />Excel
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── IB & State Demo ─── */
function IbDovletDemo() {
  const d = useD()
  const students = [
    { name: 'Əli Həsənov',      ib: { A: 6, B: 7, C: 5, D: 6 }, total: 24, gov: 8 },
    { name: 'Leyla Məmmədova',  ib: { A: 7, B: 8, C: 7, D: 7 }, total: 29, gov: 9 },
    { name: 'Nicat Rəsuli',     ib: { A: 5, B: 5, C: 4, D: 5 }, total: 19, gov: 6 },
    { name: 'Aytən Əliyeva',    ib: { A: 8, B: 8, C: 7, D: 8 }, total: 31, gov: 10 },
  ]

  return (
    <div className="flex flex-col min-h-[600px] bg-gray-50 overflow-auto">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="font-semibold text-gray-900">{d.ib_title}</h2>
          <p className="text-[11px] text-gray-400">{d.ib_sub}</p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-teal bg-teal-light rounded-full px-3 py-1.5 border border-teal/20">
          <Check className="w-3 h-3" />
          {d.ib_confirmed}
        </div>
      </div>

      <div className="p-6 max-w-5xl mx-auto w-full">
        <div className="bg-white rounded-xl border border-purple/20 p-5 mb-5 shadow-sm">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-3">{d.ib_formula}</p>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="bg-purple-light rounded-xl px-5 py-3 text-center border border-purple/20">
              <p className="text-[10px] text-purple uppercase mb-1">{d.ib_myp}</p>
              <p className="text-2xl font-bold text-purple">A+B+C+D</p>
              <p className="text-[11px] text-purple/60">{d.ib_max}</p>
            </div>
            <div className="text-2xl text-gray-300 font-light">→</div>
            <div className="bg-teal-light rounded-xl px-5 py-3 text-center border border-teal/20">
              <p className="text-[10px] text-teal uppercase mb-1">{d.ib_state_scale}</p>
              <p className="text-2xl font-bold text-teal">1–10</p>
              <p className="text-[11px] text-teal/60">{d.ib_curr}</p>
            </div>
            <div className="flex-1 bg-amber-50 rounded-xl px-4 py-3 border border-amber-200">
              <p className="text-[11px] text-amber-700 font-medium mb-1">{d.ib_example}</p>
              <p className="text-xs text-amber-600">{d.ib_ex1} <strong>8/10</strong></p>
              <p className="text-xs text-amber-600">{d.ib_ex2} <strong>9/10</strong></p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-[11px] text-gray-500 uppercase tracking-wider font-medium">{d.student}</th>
                <th className="px-4 py-3 text-[11px] text-purple uppercase tracking-wider font-medium text-center">KR.A</th>
                <th className="px-4 py-3 text-[11px] text-purple uppercase tracking-wider font-medium text-center">KR.B</th>
                <th className="px-4 py-3 text-[11px] text-purple uppercase tracking-wider font-medium text-center">KR.C</th>
                <th className="px-4 py-3 text-[11px] text-purple uppercase tracking-wider font-medium text-center">KR.D</th>
                <th className="px-4 py-3 text-[11px] text-gray-500 uppercase tracking-wider font-medium text-center">{d.ib_total}</th>
                <th className="px-4 py-3 text-[11px] text-teal uppercase tracking-wider font-medium text-center">{d.ib_state}</th>
              </tr>
            </thead>
            <tbody>
              {students.map((st) => (
                <tr key={st.name} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-purple-light flex items-center justify-center text-purple text-[10px] font-semibold">
                        {st.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-medium text-gray-800">{st.name}</span>
                    </div>
                  </td>
                  {Object.values(st.ib).map((score, j) => (
                    <td key={j} className="px-4 py-3 text-center">
                      <span className="inline-block w-8 h-8 rounded-lg bg-purple-light text-purple font-semibold text-sm flex items-center justify-center">{score}</span>
                    </td>
                  ))}
                  <td className="px-4 py-3 text-center">
                    <span className="bg-gray-100 text-gray-700 font-bold text-sm px-2.5 py-1 rounded-lg">{st.total}/32</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${st.gov >= 9 ? 'bg-teal text-white' : st.gov >= 7 ? 'bg-teal-light text-teal' : 'bg-amber-50 text-amber-600'}`}>{st.gov}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ─── National Panel Demo ─── */
function MilliPanelDemo() {
  const d = useD()
  const kpis = [
    { label: d.np_k_schools,  value: '12',     icon: '🏫', sub: d.np_t1, color: 'text-gray-900'  },
    { label: d.np_k_students, value: '5,247',  icon: '👤', sub: d.np_t2, color: 'text-purple'    },
    { label: d.np_k_ai,       value: '52,841', icon: '✨', sub: d.np_t3, color: 'text-teal'      },
    { label: d.np_k_avg,      value: '7.8',    icon: '📊', sub: d.np_t4, color: 'text-amber-600' },
  ]
  const schools = [
    { name: 'TISA (IB)',   score: 8.9, bar: 100, trend: '+0.3' },
    { name: 'Məktəb №132', score: 8.4, bar: 93,  trend: '+0.2' },
    { name: 'Məktəb №6',   score: 8.1, bar: 90,  trend: '+0.1' },
    { name: 'Məktəb №47',  score: 7.8, bar: 86,  trend: '-0.1' },
    { name: 'Məktəb №89',  score: 7.4, bar: 81,  trend: '+0.4' },
  ]
  const vals = [62, 65, 61, 68, 70, 74, 73, 78, 77, 82, 80, 87]

  return (
    <div className="flex flex-col min-h-[600px] bg-gray-50 overflow-auto">
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div>
          <p className="text-[10px] text-amber-600 uppercase tracking-wider font-semibold">{d.np_label}</p>
          <h2 className="font-semibold text-gray-900">{d.np_country}</h2>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-teal">
          <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
          {d.np_live}
        </div>
      </div>

      <div className="p-6 space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.map(k => (
            <div key={k.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">{k.label}</p>
                <span className="text-xl">{k.icon}</span>
              </div>
              <p className={`text-2xl font-bold mb-1 ${k.color}`}>{k.value}</p>
              <p className="text-[11px] text-gray-400">{k.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-gray-900">{d.np_monthly}</p>
              <span className="text-[11px] text-teal bg-teal-light rounded-full px-3 py-1">↑ 4.2%</span>
            </div>
            <div className="flex items-end gap-1.5 h-28 mb-2">
              {vals.map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-full rounded-t-sm transition-all ${i === vals.length - 1 ? 'bg-purple' : i >= 8 ? 'bg-purple/50' : 'bg-purple/20'}`}
                    style={{ height: `${h}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between px-0.5">
              {d.mon.map(m => <span key={m} className="text-[9px] text-gray-400">{m}</span>)}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-900 mb-4">{d.np_events}</p>
            <div className="space-y-4">
              {[
                { text: d.np_e1, time: '09:12',         color: 'bg-teal'       },
                { text: d.np_e2, time: '08:54',         color: 'bg-purple'     },
                { text: d.np_e3, time: '08:30',         color: 'bg-amber-400'  },
                { text: d.np_e4, time: '08:01',         color: 'bg-teal'       },
                { text: d.np_e5, time: d.np_yesterday,  color: 'bg-gray-400'   },
              ].map((e, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className={`w-2 h-2 rounded-full ${e.color} mt-1.5 flex-shrink-0`} />
                  <div>
                    <p className="text-xs text-gray-700 leading-snug">{e.text}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{e.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-900">{d.np_ranking}</p>
            <span className="text-[11px] text-purple bg-purple-light rounded-full px-3 py-1">{d.np_q_year}</span>
          </div>
          <div className="space-y-3">
            {schools.map((sc, i) => (
              <div key={sc.name} className="flex items-center gap-4">
                <span className="text-[11px] text-gray-400 font-medium w-4">{i + 1}</span>
                <p className="text-sm text-gray-800 w-36 font-medium">{sc.name}</p>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple to-purple/60 rounded-full transition-all" style={{ width: `${sc.bar}%` }} />
                </div>
                <span className="text-sm font-bold text-gray-900 w-8 text-right">{sc.score}</span>
                <span className={`text-[11px] font-medium w-10 text-right ${sc.trend.startsWith('+') ? 'text-teal' : 'text-red-400'}`}>{sc.trend}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Auto Reports Demo ─── */
function AvtomatikHesabatlarDemo() {
  const d = useD()

  return (
    <div className="flex flex-col min-h-[600px] bg-gray-50 overflow-auto">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <h2 className="font-semibold text-gray-900">{d.ar_title}</h2>
        <p className="text-[11px] text-gray-400">{d.ar_sub}</p>
      </div>

      <div className="p-6 max-w-4xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-900 mb-5">{d.ar_params}</p>
            <div className="space-y-4">
              <div>
                <label className="text-[11px] text-gray-500 font-medium uppercase tracking-wider block mb-1.5">{d.ar_type}</label>
                <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 text-gray-700 focus:outline-none focus:border-purple bg-white">
                  <option>{d.ar_type_1}</option>
                  <option>{d.ar_type_2}</option>
                  <option>{d.ar_type_3}</option>
                  <option>{d.ar_type_4}</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-gray-500 font-medium uppercase tracking-wider block mb-1.5">{d.ar_range}</label>
                <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 text-gray-700 focus:outline-none focus:border-purple bg-white">
                  <option>{d.ar_range_1}</option>
                  <option>{d.ar_range_2}</option>
                  <option>{d.ar_range_3}</option>
                  <option>{d.ar_range_4}</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-gray-500 font-medium uppercase tracking-wider block mb-1.5">{d.ar_school}</label>
                <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 text-gray-700 focus:outline-none focus:border-purple bg-white">
                  <option>{d.ar_all_schools}</option>
                  <option>TISA</option>
                  <option>Məktəb №132</option>
                  <option>Məktəb №6</option>
                  <option>Məktəb №47</option>
                </select>
              </div>
              <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                <div>
                  <p className="text-sm font-medium text-gray-800">{d.ar_auto}</p>
                  <p className="text-[11px] text-gray-400">{d.ar_auto_sub}</p>
                </div>
                <div className="w-11 h-6 rounded-full bg-teal relative cursor-pointer">
                  <div className="w-5 h-5 rounded-full bg-white shadow absolute top-0.5 right-0.5 transition-transform" />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button className="flex-1 flex items-center justify-center gap-2 bg-purple text-white text-sm py-2.5 rounded-lg hover:bg-purple/90 transition-colors font-medium">
                  <Download className="w-4 h-4" />PDF
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 border border-teal text-teal text-sm py-2.5 rounded-lg hover:bg-teal-light transition-colors font-medium">
                  <Download className="w-4 h-4" />Excel
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 border border-amber-300 text-amber-600 text-sm py-2.5 rounded-lg hover:bg-amber-50 transition-colors font-medium">
                  <Globe className="w-4 h-4" />E-Gov
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-gray-900">{d.ar_preview}</p>
              <span className="text-[11px] text-teal bg-teal-light rounded-full px-2.5 py-1">{d.ar_q1}</span>
            </div>
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-3">
              <div className="text-center border-b border-gray-200 pb-3">
                <p className="text-xs font-bold text-gray-900">{d.np_country}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{d.ar_rep_title}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{d.ar_rep_period}</p>
              </div>
              <div className="space-y-2">
                {[
                  { label: d.ar_row1, value: '12' },
                  { label: d.ar_row2, value: '5,247' },
                  { label: d.ar_row3, value: '7.8 / 10' },
                  { label: d.ar_row4, value: '94.2%' },
                  { label: d.ar_row5, value: '52,841' },
                ].map(row => (
                  <div key={row.label} className="flex justify-between text-xs">
                    <span className="text-gray-500">{row.label}</span>
                    <span className="font-semibold text-gray-900">{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-3">
                <p className="text-[10px] text-gray-400 text-center">{d.ar_footer}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Data Sovereignty Demo ─── */
function MelumatDemo() {
  const d = useD()
  const accessLog = [
    { user: d.ds_u1, action: d.ds_a1, time: `09:12 · ${d.ds_today}`, status: d.ds_allowed },
    { user: d.ds_u2, action: d.ds_a2, time: `08:30 · ${d.ds_today}`, status: d.ds_allowed },
    { user: d.ds_u3, action: d.ds_a3, time: `14:22 · ${d.ds_yday}`,  status: d.ds_allowed },
    { user: d.ds_u4, action: d.ds_a4, time: `11:05 · ${d.ds_yday}`,  status: d.ds_allowed },
    { user: d.ds_u5, action: d.ds_a5, time: `03:00 · ${d.ds_yday}`,  status: d.ds_system },
  ]

  return (
    <div className="flex flex-col min-h-[600px] bg-gray-50 overflow-auto">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <h2 className="font-semibold text-gray-900">{d.ds_title}</h2>
        <p className="text-[11px] text-gray-400">{d.ds_sub}</p>
      </div>

      <div className="p-6 max-w-4xl mx-auto w-full space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: d.ds_c1, value: d.ds_c1_v, status: d.ds_active, color: 'text-teal' },
            { label: d.ds_c2, value: d.ds_c2_v, status: d.ds_active, color: 'text-teal' },
            { label: d.ds_c3, value: d.ds_c3_v, status: d.ds_active, color: 'text-teal' },
            { label: d.ds_c4, value: d.ds_c4_v, status: '2025',     color: 'text-purple' },
          ].map(c => (
            <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">{c.label}</p>
              <p className={`text-sm font-bold ${c.color} mb-1`}>{c.value}</p>
              <div className="flex items-center gap-1">
                <Check className="w-3 h-3 text-teal" />
                <span className="text-[10px] text-teal">{c.status}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <p className="text-sm font-semibold text-gray-900 mb-4">{d.ds_certs}</p>
          <div className="flex flex-wrap gap-3">
            {[
              { label: d.ds_b1, color: 'bg-blue-50 border-blue-200 text-blue-600' },
              { label: d.ds_b2, color: 'bg-purple-light border-purple/20 text-purple' },
              { label: d.ds_b3, color: 'bg-teal-light border-teal/20 text-teal' },
              { label: d.ds_b4, color: 'bg-amber-50 border-amber-200 text-amber-700' },
              { label: d.ds_b5, color: 'bg-gray-100 border-gray-200 text-gray-700' },
            ].map(b => (
              <span key={b.label} className={`text-xs font-medium px-3 py-1.5 rounded-full border ${b.color} flex items-center gap-1.5`}>
                <Check className="w-3 h-3" />
                {b.label}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">{d.ds_log}</p>
            <span className="text-[11px] text-gray-400">{d.ds_last_5}</span>
          </div>
          <div className="divide-y divide-gray-100">
            {accessLog.map((log, i) => (
              <div key={i} className="px-5 py-3 flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-gray-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{log.user}</p>
                  <p className="text-[11px] text-gray-400">{log.action}</p>
                </div>
                <p className="text-[11px] text-gray-400">{log.time}</p>
                <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${log.status === d.ds_allowed ? 'bg-teal-light text-teal' : 'bg-gray-100 text-gray-500'}`}>{log.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Analytics Demo ─── */
function AnalItikaDemo() {
  const d = useD()
  const lineData = [6.8, 7.0, 6.9, 7.2, 7.4, 7.3, 7.6, 7.5, 7.8, 7.7, 8.0, 8.1]
  const maxVal = 10
  const svgH = 120, svgW = 600
  const padL = 30, padR = 10, padT = 10, padB = 20
  const drawW = svgW - padL - padR
  const drawH = svgH - padT - padB

  const pts = lineData.map((v, i) => {
    const x = padL + (i / (lineData.length - 1)) * drawW
    const y = padT + drawH - ((v - 5) / (maxVal - 5)) * drawH
    return `${x},${y}`
  })
  const polyline = pts.join(' ')

  const schools = [
    { name: 'TISA',        score: 8.9, color: 'bg-purple' },
    { name: 'Məktəb №132', score: 8.4, color: 'bg-purple/70' },
    { name: 'Məktəb №6',   score: 8.1, color: 'bg-teal' },
    { name: 'Məktəb №47',  score: 7.8, color: 'bg-teal/70' },
    { name: 'Məktəb №89',  score: 7.4, color: 'bg-gray-300' },
  ]

  return (
    <div className="flex flex-col min-h-[600px] bg-gray-50 overflow-auto">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="font-semibold text-gray-900">{d.an_title}</h2>
          <p className="text-[11px] text-gray-400">{d.an_sub}</p>
        </div>
        <div className="flex gap-1.5">
          {[d.an_m_avg, d.an_m_att, d.an_m_ai].map((m, i) => (
            <button key={m} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${i === 0 ? 'bg-purple text-white border-purple' : 'border-gray-200 text-gray-500 hover:border-purple hover:text-purple'}`}>{m}</button>
          ))}
        </div>
      </div>

      <div className="p-6 max-w-5xl mx-auto w-full space-y-5">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-900">{d.an_line}</p>
            <span className="text-[11px] text-teal bg-teal-light rounded-full px-3 py-1">{d.an_yoy}</span>
          </div>
          <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ height: svgH }}>
            {[6, 7, 8, 9].map(v => {
              const y = padT + drawH - ((v - 5) / (maxVal - 5)) * drawH
              return <line key={v} x1={padL} y1={y} x2={svgW - padR} y2={y} stroke="#f0eeff" strokeWidth="1" />
            })}
            <polygon
              points={`${padL},${padT + drawH} ${pts.join(' ')} ${svgW - padR},${padT + drawH}`}
              fill="rgba(83,74,183,0.07)"
            />
            <polyline points={polyline} fill="none" stroke="#534AB7" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
            {pts.map((pt, i) => {
              const [x, y] = pt.split(',')
              return <circle key={i} cx={x} cy={y} r="3.5" fill="white" stroke="#534AB7" strokeWidth="2" />
            })}
            {d.mon.map((m, i) => {
              const x = padL + (i / (d.mon.length - 1)) * drawW
              return <text key={m} x={x} y={svgH - 4} textAnchor="middle" fontSize="8" fill="#9ca3af">{m}</text>
            })}
          </svg>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-900 mb-4">{d.an_cmp}</p>
            <div className="space-y-3">
              {schools.map(sc => (
                <div key={sc.name} className="flex items-center gap-3">
                  <p className="text-xs text-gray-700 w-28">{sc.name}</p>
                  <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${sc.color} rounded-full flex items-center justify-end pr-2`} style={{ width: `${(sc.score / 10) * 100}%` }}>
                      <span className="text-[9px] text-white font-bold">{sc.score}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-900 mb-4">{d.an_tb}</p>
            <div className="space-y-2">
              <p className="text-[10px] text-teal uppercase tracking-wider font-medium">{d.an_top}</p>
              {schools.slice(0, 3).map((sc, i) => (
                <div key={sc.name} className="flex items-center justify-between py-1.5 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 w-4">{i + 1}</span>
                    <span className="text-xs text-gray-700">{sc.name}</span>
                  </div>
                  <span className="text-xs font-bold text-teal">{sc.score}</span>
                </div>
              ))}
              <p className="text-[10px] text-red-400 uppercase tracking-wider font-medium pt-2">{d.an_att}</p>
              {schools.slice(3).map((sc, i) => (
                <div key={sc.name} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 w-4">{schools.length - schools.slice(3).length + i + 1}</span>
                    <span className="text-xs text-gray-700">{sc.name}</span>
                  </div>
                  <span className="text-xs font-bold text-red-400">{sc.score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Notifications Demo ─── */
function BildirislerDemo() {
  const d = useD()
  const notifications = [
    { emoji: '🏫', text: d.bn_n1, time: '09:12',           type: d.bn_t_report,   read: false },
    { emoji: '⚠️', text: d.bn_n2, time: '08:54',           type: d.bn_t_critical, read: false },
    { emoji: '✅', text: d.bn_n3, time: '08:30',           type: d.bn_t_system,   read: true  },
    { emoji: '🎓', text: d.bn_n4, time: d.np_yesterday,    type: d.bn_t_system,   read: true  },
    { emoji: '📊', text: d.bn_n5, time: d.np_yesterday,    type: d.bn_t_report,   read: true  },
    { emoji: '🔒', text: d.bn_n6, time: d.np_yesterday,    type: d.bn_t_system,   read: true  },
    { emoji: '⚠️', text: d.bn_n7, time: d.bn_time_2d,      type: d.bn_t_critical, read: true  },
  ]
  const tabs = [d.bn_tab1, d.bn_tab2, d.bn_tab3, d.bn_tab4]

  return (
    <div className="flex flex-col min-h-[600px] bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="font-semibold text-gray-900">{d.bn_title}</h2>
          <p className="text-[11px] text-gray-400">{d.bn_unread}</p>
        </div>
        <button className="text-sm text-purple hover:text-purple/70 transition-colors font-medium">{d.bn_mark_all}</button>
      </div>

      <div className="bg-white border-b border-gray-200 px-6 flex-shrink-0">
        <div className="flex gap-0">
          {tabs.map((t, i) => (
            <button key={t} className={`px-4 py-3 text-sm border-b-2 transition-colors ${i === 0 ? 'border-purple text-purple font-medium' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{t}</button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto space-y-2">
          {notifications.map((n, i) => (
            <div key={i} className={`bg-white rounded-xl border px-5 py-4 flex items-start gap-4 transition-colors ${!n.read ? 'border-purple/30 shadow-sm' : 'border-gray-200'}`}>
              <span className="text-xl flex-shrink-0 mt-0.5">{n.emoji}</span>
              <div className="flex-1">
                <p className={`text-sm ${!n.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>{n.text}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-gray-400">{n.time}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    n.type === d.bn_t_critical ? 'bg-red-50 text-red-400' :
                    n.type === d.bn_t_report ? 'bg-purple-light text-purple' :
                    'bg-gray-100 text-gray-500'
                  }`}>{n.type}</span>
                </div>
              </div>
              {!n.read && <div className="w-2 h-2 rounded-full bg-purple flex-shrink-0 mt-2" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── E-Gov Integration Demo ─── */
function EgovDemo() {
  const d = useD()
  const services = [
    { name: d.eg_s1, icon: '🏛️', status: d.eg_connected, lastSync: d.eg_sync_1, color: 'text-teal bg-teal-light border-teal/20' },
    { name: d.eg_s2, icon: '🌐', status: d.eg_connected, lastSync: d.eg_sync_2, color: 'text-teal bg-teal-light border-teal/20' },
    { name: d.eg_s3, icon: '📋', status: d.eg_connected, lastSync: d.eg_sync_3, color: 'text-teal bg-teal-light border-teal/20' },
    { name: d.eg_s4, icon: '🎓', status: d.eg_connected, lastSync: d.eg_sync_4, color: 'text-teal bg-teal-light border-teal/20' },
  ]
  const exportLog = [
    { type: d.eg_l1, dest: d.eg_d1, time: '09:30',       status: d.eg_st_ok },
    { type: d.eg_l2, dest: d.eg_d2, time: '08:15',       status: d.eg_st_ok },
    { type: d.eg_l3, dest: d.eg_d3, time: '07:00',       status: d.eg_st_ok },
    { type: d.eg_l4, dest: d.eg_d4, time: d.eg_yday,     status: d.eg_st_wait },
  ]

  return (
    <div className="flex flex-col min-h-[600px] bg-gray-50 overflow-auto">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="font-semibold text-gray-900">{d.eg_title}</h2>
          <p className="text-[11px] text-gray-400">{d.eg_sub}</p>
        </div>
        <button className="flex items-center gap-2 bg-teal text-white text-sm px-5 py-2 rounded-full hover:bg-teal/90 transition-colors font-medium">
          <Send className="w-4 h-4" />
          {d.eg_push}
        </button>
      </div>

      <div className="p-6 max-w-4xl mx-auto w-full space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {services.map(sv => (
            <div key={sv.name} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm text-center">
              <div className="text-3xl mb-2">{sv.icon}</div>
              <p className="text-sm font-semibold text-gray-900 mb-1">{sv.name}</p>
              <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${sv.color} flex items-center gap-1 justify-center`}>
                <Check className="w-3 h-3" />{sv.status}
              </span>
              <p className="text-[10px] text-gray-400 mt-2">{sv.lastSync}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-900">{d.eg_export}</p>
            <span className="text-[11px] text-gray-400">{d.eg_auto}</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: d.eg_att,     count: d.eg_att_c,     color: 'border-teal/20 bg-teal-light text-teal' },
              { label: d.eg_grades,  count: d.eg_grades_c,  color: 'border-purple/20 bg-purple-light text-purple' },
              { label: d.eg_reports, count: d.eg_reports_c, color: 'border-amber-200 bg-amber-50 text-amber-600' },
            ].map(item => (
              <div key={item.label} className={`rounded-lg border px-4 py-3 text-center ${item.color}`}>
                <p className="text-base font-bold">{item.count}</p>
                <p className="text-[11px] font-medium mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-200">
            <p className="text-sm font-semibold text-gray-900">{d.eg_log}</p>
          </div>
          <div className="divide-y divide-gray-100">
            {exportLog.map((log, i) => (
              <div key={i} className="px-5 py-3 flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-4 h-4 text-gray-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{log.type}</p>
                  <p className="text-[11px] text-gray-400">→ {log.dest}</p>
                </div>
                <p className="text-[11px] text-gray-400">{log.time}</p>
                <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${log.status === d.eg_st_ok ? 'bg-teal-light text-teal' : 'bg-amber-50 text-amber-600'}`}>{log.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Demo router ─── */
const demoComponents = {
  jurnal:                  JurnalDemo,
  davamiyyat:              DavamiyyatDemo,
  zeka:                    ZekaDemo,
  mesajlar:                MesajlarDemo,
  hesabatlar:              HesabatlarDemo,
  'ib-dovlet':             IbDovletDemo,
  'milli-panel':           MilliPanelDemo,
  'avtomatik-hesabatlar':  AvtomatikHesabatlarDemo,
  melumat:                 MelumatDemo,
  analitika:               AnalItikaDemo,
  bildirisler:             BildirislerDemo,
  egov:                    EgovDemo,
}

export default function Demo() {
  const { id } = useParams()
  const d = useD()
  const meta = d.meta[id] || { title: d.demo, subtitle: '' }
  const DemoContent = demoComponents[id]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col font-sans">
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-gray-200/80 shadow-sm">
        <div className="h-14 px-5 flex items-center justify-between max-w-5xl mx-auto">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="font-serif text-base tracking-tight">
              <span className="text-gray-900">Zir</span>
              <span className="text-purple">va</span>
            </span>
          </Link>

          <div className="flex flex-col items-center">
            <p className="text-sm font-semibold text-gray-900 leading-none">{meta.title}</p>
            <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wider">{meta.subtitle} · {d.demo}</p>
          </div>

          <Link
            to="/qeydiyyat"
            className="bg-gradient-to-br from-purple to-purple-dark text-white text-sm px-5 py-2 rounded-full hover:shadow-md hover:shadow-purple/40 hover:-translate-y-0.5 transition-all duration-300 font-semibold shadow-sm shadow-purple/30"
          >
            {d.signup}
          </Link>
        </div>
      </header>

      <main className="flex-1 py-6 px-4">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200">
          {DemoContent ? (
            <DemoContent />
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
              <p className="text-lg font-medium mb-2">{d.not_found}</p>
              <Link to="/" className="text-sm text-purple hover:underline">{d.back_home}</Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
