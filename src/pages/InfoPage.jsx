import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Phone, ArrowRight, MapPin, Clock, Sparkles, Calendar, Rocket, Tag, Users, Shield, Database, Building2 } from 'lucide-react'
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import emailjs from '@emailjs/browser'
import { useLang } from '../contexts/LanguageContext'

/* ─── Translations for programme pages and UI labels ─── */
const T = {
  en: {
    // UI labels
    ui_contact_us:       'Contact us',
    ui_whats_included:   "What's included",
    ui_quick_facts:      'Quick facts',
    ui_programme:        'Programme',
    ui_age_range:        'Age range',
    ui_ib_code:          'IB Code',
    ui_related:          'Related programmes',
    ui_questions:        'Questions?',
    ui_questions_body:   'Talk to a human. We usually reply within the hour.',
    ui_book_demo:        'Book a demo',
    ui_learn_more:       'Learn more',
    ui_ages:             'Ages',
    ui_years:            'years',
    ui_ib_programme:     'IB Programme',
    ui_state_schools:    'State Schools',
    ui_page_not_found:   'Page not found',
    ui_back_home:        '← Back to home',
    // Programme titles & subtitles & bodies
    'ib-diploma_title':  'IB Diploma (DP)',
    'ib-diploma_subtitle': 'Full support for the IB Diploma Programme',
    'ib-diploma_body':   `The IB Diploma Programme (DP) is a rigorous pre-university course for students aged 16–19. Zirva provides complete DP management including subject selection, assessment criteria tracking (A–D scale), CAS management, Theory of Knowledge documentation, and Extended Essay workflow. Our platform integrates directly with IBIS for exam registration and e-coursework submission.`,
    'ib-career_title':   'IB Career-Related (CP)',
    'ib-career_subtitle':'Dedicated tools for the IB Career-related Programme',
    'ib-career_body':    `The IB Career-related Programme (CP) combines the rigour of the IB with a career-related study. Zirva supports CP schools with personalised learning records, reflective project management, service learning tracking, and language development documentation — all within a single platform.`,
    'ib-myp_title':      'IB Middle Years (MYP)',
    'ib-myp_subtitle':   'Collaborative Programme of Inquiry planning',
    'ib-myp_body':       `The IB Middle Years Programme (MYP) provides a framework of academic challenge for students aged 11–16. Zirva's MYP tools include unit planner collaboration, interdisciplinary learning tracking, criterion-referenced assessment (A–D), MYP eAssessment preparation, and personal project management.`,
    'ib-pyp_title':      'IB Primary Years (PYP)',
    'ib-pyp_subtitle':   'The same powerful support for younger students',
    'ib-pyp_body':       `The IB Primary Years Programme (PYP) nurtures and develops young students as caring, active participants in a lifelong journey of learning. Zirva supports PYP schools with exhibition planning, transdisciplinary theme tracking, portfolio management, and learner profile documentation.`,
    'government-schools_title':    'Government Schools',
    'government-schools_subtitle': 'Dedicated mode for Azerbaijani public schools',
    'government-schools_body':     `Zirva's Government School edition is built specifically for Azerbaijani state schools. It includes full integration with the Ministry of Education reporting system, E-Gov.az export, ASAN Xidmət compatibility, national 10-point grading, and automatic compliance reports. All data is hosted on Azerbaijani servers in full compliance with local legislation.`,
    // Highlights
    'ib-pyp_hl':     ['Transdisciplinary themes','Exhibition planning','Portfolio management','Learner profile tracking'],
    'ib-myp_hl':     ['Unit planner collaboration','Interdisciplinary tracking','A–D criterion assessment','Personal project management'],
    'ib-diploma_hl': ['Subject selection & scheduling','A–D assessment tracking','CAS & TOK management','Extended Essay workflow','IBIS integration'],
    'ib-career_hl':  ['Personalised learning records','Reflective project tracking','Service learning documentation','Language development'],
    'government-schools_hl': ['Ministry of Education integration','E-Gov.az & ASAN Xidmət export','National 10-point grading','Automated compliance reports','Local Azerbaijani data hosting'],
    // Contact page
    ct_eyebrow:      'Contact',
    ct_heading:      "Let's talk.",
    ct_sub:          'Real humans read every message. We typically reply within the hour.',
    ct_name:         'Name',
    ct_email:        'Email',
    ct_school:       'School',
    ct_phone:        'Phone',
    ct_message:      'Message',
    ct_ph_name:      'Rauf Aliyev',
    ct_ph_school:    'Baku International School',
    ct_ph_message:   'Tell us about your school and what you need…',
    ct_send:         'Send message',
    ct_sending:      'Sending…',
    ct_privacy:      'Your details stay private. No marketing, no spam.',
    ct_success_title:'Got it — thanks!',
    ct_success_body: 'within the hour.',
    ct_back:         'Back home',
    // Related full names
    rel_pyp: 'IB Primary Years',
    rel_myp: 'IB Middle Years',
    rel_dp:  'IB Diploma',
    rel_cp:  'IB Career-Related',
  },
  az: {
    ui_contact_us:       'Bizimlə Əlaqə',
    ui_whats_included:   'Daxildir',
    ui_quick_facts:      'Qısa məlumat',
    ui_programme:        'Proqram',
    ui_age_range:        'Yaş aralığı',
    ui_ib_code:          'IB Kodu',
    ui_related:          'Əlaqəli proqramlar',
    ui_questions:        'Sualınız var?',
    ui_questions_body:   'Real insanla danışın. Adətən bir saat içində cavab veririk.',
    ui_book_demo:        'Demo təyin et',
    ui_learn_more:       'Ətraflı',
    ui_ages:             'Yaş',
    ui_years:            'yaş',
    ui_ib_programme:     'IB Proqramı',
    ui_state_schools:    'Dövlət Məktəbləri',
    ui_page_not_found:   'Səhifə tapılmadı',
    ui_back_home:        '← Ana səhifəyə qayıt',
    'ib-diploma_title':  'IB Diploma (DP)',
    'ib-diploma_subtitle': 'IB Diploma Proqramı üçün tam dəstək',
    'ib-diploma_body':   `IB Diploma Proqramı (DP) 16–19 yaş arası şagirdlər üçün ali təhsilə hazırlıq mərhələsini əhatə edən ciddi bir kursdur. Zirva DP-nin bütün idarəetməsini təmin edir — fənn seçimi, qiymətləndirmə meyarlarının izlənməsi (A–D şkalası), CAS idarəetməsi, Theory of Knowledge sənədləşdirilməsi və Extended Essay iş axını daxil olmaqla. Platformamız imtahan qeydiyyatı və e-coursework təqdimatı üçün IBIS ilə birbaşa inteqrasiya edir.`,
    'ib-career_title':   'IB Karyera (CP)',
    'ib-career_subtitle':'IB Karyera əlaqədar proqramı üçün xüsusi alətlər',
    'ib-career_body':    `IB Karyera əlaqədar proqramı (CP) IB-nin ciddiliyini karyera əlaqəli tədqiqatla birləşdirir. Zirva CP məktəblərini fərdiləşdirilmiş tədris qeydləri, refleksiv layihə idarəetməsi, xidmət öyrənmənin izlənməsi və dil inkişafı sənədləşdirilməsi ilə dəstəkləyir — hamısı vahid platformada.`,
    'ib-myp_title':      'IB Orta İllər (MYP)',
    'ib-myp_subtitle':   'Tədqiqat proqramının birgə planlaşdırılması',
    'ib-myp_body':       `IB Orta İllər Proqramı (MYP) 11–16 yaş arası şagirdlər üçün akademik çağırış çərçivəsini təqdim edir. Zirva-nın MYP alətləri birgə vahid planlama, fənlərarası öyrənmə izləməsi, meyar əsaslı qiymətləndirmə (A–D), MYP eAssessment hazırlığı və şəxsi layihə idarəetməsini əhatə edir.`,
    'ib-pyp_title':      'IB İlk İllər (PYP)',
    'ib-pyp_subtitle':   'Kiçik yaşlı şagirdlər üçün eyni güclü dəstək',
    'ib-pyp_body':       `IB İlk İllər Proqramı (PYP) kiçik yaşlı şagirdləri ömürlük öyrənmə yolunda qayğıkeş və fəal iştirakçılar kimi inkişaf etdirir. Zirva PYP məktəblərini sərgi planlaması, transdisiplinar mövzu izləməsi, portfel idarəetməsi və öyrənmə profili sənədləşdirməsi ilə dəstəkləyir.`,
    'government-schools_title':    'Dövlət Məktəbləri',
    'government-schools_subtitle': 'Azərbaycan dövlət məktəbləri üçün xüsusi rejim',
    'government-schools_body':     `Zirva-nın Dövlət Məktəbi nəşri xüsusilə Azərbaycan dövlət məktəbləri üçün qurulub. Təhsil Nazirliyi hesabat sistemi ilə tam inteqrasiya, E-Gov.az ixracı, ASAN Xidmət uyğunluğu, milli 10 ballıq qiymətləndirmə və avtomatik uyğunluq hesabatlarını əhatə edir. Bütün məlumatlar yerli qanunvericiliyə tam uyğun şəkildə Azərbaycan serverlərində saxlanılır.`,
    'ib-pyp_hl':     ['Transdisiplinar mövzular','Sərgi planlaması','Portfel idarəetməsi','Öyrənmə profili izləməsi'],
    'ib-myp_hl':     ['Vahid planın birgə hazırlanması','Fənlərarası izləmə','A–D meyar qiymətləndirməsi','Şəxsi layihə idarəetməsi'],
    'ib-diploma_hl': ['Fənn seçimi və cədvəl','A–D qiymətləndirmə izləməsi','CAS və TOK idarəetməsi','Extended Essay iş axını','IBIS inteqrasiyası'],
    'ib-career_hl':  ['Fərdiləşdirilmiş tədris qeydləri','Refleksiv layihə izləməsi','Xidmət öyrənmə sənədləşdirməsi','Dil inkişafı'],
    'government-schools_hl': ['Təhsil Nazirliyi inteqrasiyası','E-Gov.az və ASAN Xidmət ixracı','Milli 10 ballıq qiymətləndirmə','Avtomatik uyğunluq hesabatları','Yerli Azərbaycan serverlərində saxlama'],
    // Contact page
    ct_eyebrow:      'Əlaqə',
    ct_heading:      'Danışaq.',
    ct_sub:          'Hər mesajı real insanlar oxuyur. Adətən bir saat ərzində cavab veririk.',
    ct_name:         'Ad',
    ct_email:        'E-poçt',
    ct_school:       'Məktəb',
    ct_phone:        'Telefon',
    ct_message:      'Mesaj',
    ct_ph_name:      'Rauf Əliyev',
    ct_ph_school:    'Bakı Beynəlxalq Məktəbi',
    ct_ph_message:   'Məktəbiniz və ehtiyaclarınız haqqında yazın…',
    ct_send:         'Mesaj göndər',
    ct_sending:      'Göndərilir…',
    ct_privacy:      'Məlumatlarınız gizli qalır. Spam yoxdur.',
    ct_success_title:'Aldıq — sağ olun!',
    ct_success_body: 'bir saat ərzində cavab veririk.',
    ct_back:         'Ana səhifəyə qayıt',
    rel_pyp: 'IB İlk İllər',
    rel_myp: 'IB Orta İllər',
    rel_dp:  'IB Diploma',
    rel_cp:  'IB Karyera',
  },
  ru: {
    ui_contact_us:       'Связаться',
    ui_whats_included:   'Что входит',
    ui_quick_facts:      'Кратко',
    ui_programme:        'Программа',
    ui_age_range:        'Возраст',
    ui_ib_code:          'Код IB',
    ui_related:          'Похожие программы',
    ui_questions:        'Вопросы?',
    ui_questions_body:   'Напишите нам — отвечаем в течение часа.',
    ui_book_demo:        'Заказать демо',
    ui_learn_more:       'Подробнее',
    ui_ages:             'Возраст',
    ui_years:            'лет',
    ui_ib_programme:     'Программа IB',
    ui_state_schools:    'Государственные школы',
    ui_page_not_found:   'Страница не найдена',
    ui_back_home:        '← На главную',
    'ib-diploma_title':  'IB Diploma (DP)',
    'ib-diploma_subtitle': 'Полная поддержка программы IB Diploma',
    'ib-diploma_body':   `Программа IB Diploma (DP) — это строгий предуниверситетский курс для учащихся 16–19 лет. Zirva обеспечивает полное управление DP: выбор предметов, отслеживание критериев оценивания (шкала A–D), управление CAS, документацию Theory of Knowledge и рабочий процесс Extended Essay. Платформа напрямую интегрируется с IBIS для регистрации на экзамены и электронной подачи работ.`,
    'ib-career_title':   'IB Career-Related (CP)',
    'ib-career_subtitle':'Инструменты для программы, связанной с карьерой',
    'ib-career_body':    `Программа IB Career-related (CP) сочетает строгость IB с профориентационным обучением. Zirva поддерживает школы CP персонализированными учебными записями, управлением рефлексивными проектами, документацией сервисного обучения и развитием языковых навыков — всё в одной платформе.`,
    'ib-myp_title':      'IB Middle Years (MYP)',
    'ib-myp_subtitle':   'Совместное планирование программы исследования',
    'ib-myp_body':       `Программа IB Middle Years (MYP) предоставляет рамки академического вызова для учащихся 11–16 лет. Инструменты Zirva для MYP включают совместное планирование модулей, междисциплинарное обучение, критериальное оценивание (A–D), подготовку к MYP eAssessment и управление персональными проектами.`,
    'ib-pyp_title':      'IB Primary Years (PYP)',
    'ib-pyp_subtitle':   'Та же мощная поддержка для младших учащихся',
    'ib-pyp_body':       `Программа IB Primary Years (PYP) воспитывает и развивает младших учащихся как заботливых и активных участников пожизненного обучения. Zirva поддерживает школы PYP планированием выставок, отслеживанием трансдисциплинарных тем, управлением портфолио и документацией профиля учащегося.`,
    'government-schools_title':    'Государственные школы',
    'government-schools_subtitle': 'Режим для государственных школ Азербайджана',
    'government-schools_body':     `Редакция Zirva для государственных школ создана специально для школ Азербайджана. Она включает интеграцию с системой отчетности Министерства образования, экспорт E-Gov.az, совместимость с ASAN Xidmət, национальную 10-балльную систему оценивания и автоматические отчеты. Все данные хранятся на серверах в Азербайджане в полном соответствии с местным законодательством.`,
    'ib-pyp_hl':     ['Трансдисциплинарные темы','Планирование выставок','Управление портфолио','Отслеживание профиля учащегося'],
    'ib-myp_hl':     ['Совместное планирование модулей','Междисциплинарное отслеживание','Критериальное оценивание A–D','Управление персональным проектом'],
    'ib-diploma_hl': ['Выбор предметов и расписание','Отслеживание оценок A–D','Управление CAS и TOK','Рабочий процесс Extended Essay','Интеграция с IBIS'],
    'ib-career_hl':  ['Персонализированные учебные записи','Отслеживание рефлексивных проектов','Документация сервисного обучения','Развитие языковых навыков'],
    'government-schools_hl': ['Интеграция с Министерством образования','Экспорт E-Gov.az и ASAN Xidmət','Национальная 10-балльная шкала','Автоматические отчёты','Хранение данных в Азербайджане'],
    // Contact page
    ct_eyebrow:      'Контакты',
    ct_heading:      'Свяжитесь с нами.',
    ct_sub:          'Каждое сообщение читают живые люди. Обычно отвечаем в течение часа.',
    ct_name:         'Имя',
    ct_email:        'Email',
    ct_school:       'Школа',
    ct_phone:        'Телефон',
    ct_message:      'Сообщение',
    ct_ph_name:      'Рауф Алиев',
    ct_ph_school:    'Бакинская международная школа',
    ct_ph_message:   'Расскажите о вашей школе и ваших потребностях…',
    ct_send:         'Отправить сообщение',
    ct_sending:      'Отправка…',
    ct_privacy:      'Ваши данные останутся конфиденциальными. Никакого спама.',
    ct_success_title:'Получили — спасибо!',
    ct_success_body: 'в течение часа.',
    ct_back:         'На главную',
    rel_pyp: 'IB Primary Years',
    rel_myp: 'IB Middle Years',
    rel_dp:  'IB Diploma',
    rel_cp:  'IB Career-Related',
  },
}

const PAGES = {
  'ib-diploma': {
    title: 'IB Diploma (DP)',
    subtitle: 'Full support for the IB Diploma Programme',
    body: `The IB Diploma Programme (DP) is a rigorous pre-university course for students aged 16–19. Zirva provides complete DP management including subject selection, assessment criteria tracking (A–D scale), CAS management, Theory of Knowledge documentation, and Extended Essay workflow. Our platform integrates directly with IBIS for exam registration and e-coursework submission.`,
    color: 'purple',
  },
  'ib-career': {
    title: 'IB Career-Related (CP)',
    subtitle: 'Dedicated tools for the IB Career-related Programme',
    body: `The IB Career-related Programme (CP) combines the rigour of the IB with a career-related study. Zirva supports CP schools with personalised learning records, reflective project management, service learning tracking, and language development documentation — all within a single platform.`,
    color: 'teal',
  },
  'ib-myp': {
    title: 'IB Middle Years (MYP)',
    subtitle: 'Collaborative Programme of Inquiry planning',
    body: `The IB Middle Years Programme (MYP) provides a framework of academic challenge for students aged 11–16. Zirva's MYP tools include unit planner collaboration, interdisciplinary learning tracking, criterion-referenced assessment (A–D), MYP eAssessment preparation, and personal project management.`,
    color: 'purple',
  },
  'ib-pyp': {
    title: 'IB Primary Years (PYP)',
    subtitle: 'The same powerful support for younger students',
    body: `The IB Primary Years Programme (PYP) nurtures and develops young students as caring, active participants in a lifelong journey of learning. Zirva supports PYP schools with exhibition planning, transdisciplinary theme tracking, portfolio management, and learner profile documentation.`,
    color: 'teal',
  },
  'government-schools': {
    title: 'Government Schools',
    subtitle: 'Dedicated mode for Azerbaijani public schools',
    body: `Zirva's Government School edition is built specifically for Azerbaijani state schools. It includes full integration with the Ministry of Education reporting system, E-Gov.az export, ASAN Xidmət compatibility, national 10-point grading, and automatic compliance reports. All data is hosted on Azerbaijani servers in full compliance with local legislation.`,
    color: 'teal',
  },
  'mobile': {
    title: 'Mobile App',
    subtitle: 'Zirva on the go — iOS & Android',
    body: `The Zirva mobile app gives students, parents, and teachers full access to the platform from their phones. Check grades, record attendance, send messages, view timetables, and receive real-time notifications — all from a native mobile experience. Available on iOS and Android. Coming soon.`,
    color: 'purple',
  },
  'online-exams': {
    title: 'Online Exams',
    subtitle: 'Secure digital assessment at scale',
    body: `Zirva's online exam module supports both IB and national curriculum assessments. Create, distribute, and automatically mark exams. Built-in anti-plagiarism tools, time limits, randomised question banks, and instant result reporting make digital assessment seamless for teachers and students alike.`,
    color: 'teal',
  },
  'ceo-letter': {
    title: 'CEO Letter',
    subtitle: 'A message from our founder',
    body: `Zirva was founded with a single belief: that every student in Azerbaijan — whether in an IB World School or a state school — deserves world-class education technology. We built this platform to eliminate the administrative burden on teachers and give every student a personal AI tutor in their pocket.\n\nWe are just getting started. If you share this vision, we'd love to hear from you.\n\n— Zirva Founding Team`,
    color: 'purple',
  },
  'resources': {
    title: 'Resource Library',
    subtitle: 'Guides, templates, and best practices',
    body: `Our resource library contains implementation guides, curriculum planning templates, assessment rubrics, and best practice articles for IB and government school educators. New resources are added regularly. Get in touch to request specific resources for your school.`,
    color: 'teal',
  },
  'events': {
    title: 'Events & Webinars',
    subtitle: 'Learn, connect, and grow with Zirva',
    body: `Join our webinars, workshops, and school visits to learn how leading schools are using Zirva to transform their operations. Events are held online and in Baku. Subscribe to our newsletter or contact us to be notified of upcoming sessions.`,
    color: 'purple',
  },
  'blog': {
    title: 'Blog',
    subtitle: 'Insights on education, technology, and school leadership',
    body: `The Zirva blog covers topics including AI in education, IB programme management, Azerbaijani education policy, school leadership, and ed-tech trends. Written by our team and guest contributors from the international school community.`,
    color: 'teal',
  },
  'product-portal': {
    title: 'Product Portal',
    subtitle: 'Track what we\'re building',
    body: `The Zirva product portal is where you can see our public roadmap, vote on features, and submit your own ideas. We build Zirva in close collaboration with the schools that use it — your feedback directly shapes every release.`,
    color: 'purple',
  },
  'reviews': {
    title: 'Customer Reviews',
    subtitle: 'Stories from schools using Zirva',
    body: `Hear from IB Coordinators, IT leaders, and school administrators who have deployed Zirva. Our pilot schools have reported significant reductions in administrative time, improved parent communication, and measurable gains in data quality. Get in touch to speak with a reference school.`,
    color: 'teal',
  },
  'faq': {
    title: 'Frequently Asked Questions',
    subtitle: 'Everything you need to know about Zirva',
    body: `**How long does implementation take?** Most schools are fully onboarded within 2–4 weeks.\n\n**Is my data safe?** All data is hosted on Azerbaijani servers and is fully compliant with local data protection law and GDPR.\n\n**Does Zirva support both IB and national curriculum?** Yes — Zirva is the only platform in Azerbaijan that natively supports both IB programmes and the national curriculum in a single system.\n\n**How does pricing work?** Pricing is per school, based on student enrolment. Contact us for a quote.`,
    color: 'purple',
  },
  'premium-support': {
    title: 'Premium Support',
    subtitle: '24/7 dedicated support for your school',
    body: `Premium Support includes a dedicated account manager, priority response times (under 2 hours), on-site implementation assistance, staff training sessions, and quarterly review calls. Available as an add-on to any Zirva subscription. Contact us to learn more.`,
    color: 'purple',
  },
  'support': {
    title: 'Help & Support',
    subtitle: 'We\'re here whenever you need us',
    body: `Our support team is available 24/7 by email and during business hours by phone. For self-service, our knowledge base contains step-by-step guides for every feature in Zirva. For urgent issues, Premium Support customers have access to a dedicated hotline.`,
    color: 'teal',
  },
  'about': {
    title: 'About Zirva',
    subtitle: 'The digital school infrastructure for Azerbaijan',
    body: `Zirva is an Azerbaijani ed-tech company building the next generation of school management software. We serve both IB World Schools and government schools with a single, unified platform covering curriculum planning, assessment, attendance, communications, AI tutoring, and ministry reporting.\n\nOur team combines deep experience in international education, enterprise software, and artificial intelligence. We are headquartered in Baku, Azerbaijan.`,
    color: 'purple',
  },
  'careers': {
    title: 'Careers at Zirva',
    subtitle: 'Help us build the future of education in Azerbaijan',
    body: `We're looking for engineers, designers, and education specialists who are passionate about transforming schools. We offer competitive salaries, flexible working, and the chance to build technology used by thousands of students every day.\n\nTo apply or enquire about open roles, send your CV to hello@tryzirva.com with the subject line "Careers".`,
    color: 'teal',
  },
  'partners': {
    title: 'Partners',
    subtitle: 'Work with us to reach more schools',
    body: `Zirva partners with education consultancies, IB authorisation advisors, government bodies, and technology resellers across Azerbaijan and the region. If your organisation works with schools and you see value in introducing Zirva, we'd love to explore a partnership.\n\nGet in touch at hello@tryzirva.com.`,
    color: 'purple',
  },
  'contact': {
    title: 'Contact Us',
    subtitle: 'Let\'s talk about your school',
    body: `Whether you're ready to start a pilot, want a product demo, or just have a question — we'd love to hear from you. Our team typically responds within a few hours.`,
    color: 'teal',
    isContact: true,
  },
  'privacy': {
    title: 'Privacy Policy',
    subtitle: 'How Zirva collects, uses, and protects your data',
    body: `Last updated: 16 April 2026

Zirva ("we", "us", or "our") is committed to protecting the privacy of students, parents, teachers, and school administrators who use our platform. This Privacy Policy explains what personal data we collect, how we use it, and your rights regarding that data.

1. Data We Collect

We collect the following categories of personal data: account information (name, email address, role); school and class information; academic records (grades, attendance, assignments, exam results); communications sent through the platform; device and usage data (IP address, browser type, pages visited); and, where applicable, government identification numbers required for Ministry of Education reporting.

2. How We Use Your Data

We use your data to provide and improve the Zirva platform; to generate academic reports and comply with Ministry of Education requirements; to facilitate communication between students, parents, and teachers; to provide AI-powered tutoring and analytics features; and to send important notifications about your account and your school.

3. Data Storage and Security

All data is stored on servers located within the Republic of Azerbaijan, in full compliance with Azerbaijani data protection legislation and the General Data Protection Regulation (GDPR). We use industry-standard encryption (TLS 1.3 in transit, AES-256 at rest), role-based access controls, and regular independent security audits to protect your information.

4. Data Sharing

We do not sell your personal data. We share data only with: your school administration and authorised staff; the Ministry of Education of Azerbaijan, where required by law; trusted sub-processors (cloud infrastructure, email delivery) under strict data processing agreements; and law enforcement or regulatory bodies when legally required.

5. Data Retention

Student and staff records are retained for the duration of the school's subscription plus a 7-year period required by Azerbaijani educational legislation. You may request deletion of your personal account data at any time, subject to legal retention obligations.

6. Your Rights

You have the right to access, correct, and request deletion of your personal data. You also have the right to data portability and to object to certain processing activities. To exercise these rights, contact us at privacy@tryzirva.com. We will respond within 30 days.

7. Cookies

Zirva uses strictly necessary cookies to maintain your session and preferences. We do not use advertising or tracking cookies.

8. Children's Privacy

Zirva is used by students of all ages, including children under 18. Schools are responsible for obtaining appropriate parental consent before enrolling students on the platform. We do not knowingly collect data from children without school authorisation.

9. Changes to This Policy

We may update this policy periodically. Schools will be notified of material changes by email at least 30 days before they take effect.

10. Contact

For any privacy-related questions or requests, contact our Data Protection Officer at privacy@tryzirva.com or write to Zirva, Baku, Azerbaijan.`,
    color: 'purple',
  },
  'terms': {
    title: 'Terms of Service',
    subtitle: 'The rules governing use of the Zirva platform',
    body: `Last updated: 16 April 2026

These Terms of Service ("Terms") govern access to and use of the Zirva school management platform operated by Birclick LLC ("Zirva", "we", "us"). By accessing or using Zirva, you agree to be bound by these Terms.

1. Eligibility

Zirva is a B2B platform licensed to schools and educational institutions. Individual access is granted by a school administrator. You must be at least 13 years old (or have parental consent if younger) and authorised by your school to use the platform.

2. Licence

Subject to payment of applicable fees and compliance with these Terms, we grant your school a non-exclusive, non-transferable licence to access and use Zirva for the school's internal educational management purposes during the subscription term.

3. Acceptable Use

You agree not to: share your login credentials with unauthorised persons; attempt to access accounts or data that do not belong to you; upload harmful, offensive, or illegal content; use the platform to harass, bully, or discriminate against any person; reverse-engineer, decompile, or create derivative works of the platform; or use the platform in any way that violates Azerbaijani law or applicable international regulations.

4. Subscription and Payment

Access to Zirva requires a paid school subscription. Fees are billed annually per the agreed quote. Subscriptions renew automatically unless cancelled at least 30 days before the renewal date. All fees are non-refundable except as required by law.

5. Data Ownership

Your school retains full ownership of all data uploaded to or generated within Zirva. We act as a data processor on behalf of your school. Upon termination, you may export all school data in standard formats within 90 days. After that period, data may be deleted.

6. Availability and Support

We target 99.5% monthly uptime, excluding scheduled maintenance. Support is provided by email and, for Premium Support subscribers, by phone. We do not guarantee specific response times on the standard plan.

7. Intellectual Property

The Zirva platform, including its design, code, and AI models, is the intellectual property of Birclick LLC. Nothing in these Terms transfers ownership of any intellectual property to you.

8. Limitation of Liability

To the maximum extent permitted by law, Zirva's liability for any claim arising out of or relating to these Terms is limited to the fees paid by your school in the 12 months preceding the claim. We are not liable for indirect, incidental, or consequential damages.

9. Termination

Either party may terminate the subscription at the end of any subscription term. We may suspend or terminate access immediately if you materially breach these Terms and fail to remedy the breach within 14 days of written notice.

10. Governing Law

These Terms are governed by the laws of the Republic of Azerbaijan. Any disputes shall be resolved by the courts of Baku, Azerbaijan.

11. Changes to These Terms

We may update these Terms from time to time. Schools will be notified of material changes by email at least 30 days before they take effect. Continued use after that date constitutes acceptance of the updated Terms.

12. Contact

For questions about these Terms, contact us at hello@tryzirva.com or write to Zirva, Baku, Azerbaijan.`,
    color: 'teal',
  },
}

/* ─── CONTACT PAGE ─── */
function ContactPage() {
  const { lang } = useLang()
  const ct = T[lang] || T.en
  const [form, setForm] = useState({ name:'', school:'', email:'', phone:'', message:'' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    await supabase.from('contact_submissions').insert([{
      name: form.name, email: form.email,
      school: form.school, phone: form.phone, message: form.message,
    }])

    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          from_name:  form.name,
          from_email: form.email,
          name:       form.name,
          message:    `Email: ${form.email}\nPhone: ${form.phone}\nSchool: ${form.school}\n\n${form.message}`,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
      )
    } catch (err) {
      console.error('EmailJS error:', err)
    }

    setLoading(false)
    setSent(true)
  }

  const focus = e => { e.target.style.borderColor='#8B5CF6'; e.target.style.boxShadow='0 0 0 3px rgba(139,92,246,0.12)' }
  const blur  = e => { e.target.style.borderColor='#E8E8F0'; e.target.style.boxShadow='none' }

  const inp = {
    width:'100%', padding:'12px 14px', borderRadius:10,
    background:'#F7F7FB', border:'1.5px solid #E8E8F0',
    color:'#111', fontSize:14, fontWeight:500,
    outline:'none', transition:'all .18s ease', fontFamily:'inherit', boxSizing:'border-box',
  }
  const lbl = { display:'block', fontSize:11, fontWeight:700, color:'#6B7280', letterSpacing:'0.07em', textTransform:'uppercase', marginBottom:7 }

  return (
    <div style={{ minHeight:'100vh', background:'#F5F4FF', fontFamily:'Plus Jakarta Sans, system-ui, sans-serif' }}>
      <style>{`
        @keyframes ctFadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ctCheckPop{ 0%{transform:scale(0);opacity:0} 60%{transform:scale(1.15);opacity:1} 100%{transform:scale(1);opacity:1} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .ct-card   { animation: ctFadeUp .55s cubic-bezier(.22,1,.36,1) both .1s; }
        .ct-submit { transition: transform .2s ease, box-shadow .2s ease; }
        .ct-submit:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 14px 30px -10px rgba(124,58,237,0.45) !important; }
        .ct-submit:active:not(:disabled) { transform:translateY(0); }
        .ct-foot-link { color:#9CA3AF; text-decoration:none; font-size:12.5px; font-weight:600; display:flex; align-items:center; gap:8px; justify-content:center; transition:color .15s; }
        .ct-foot-link:hover { color:#7C3AED; }
        input::placeholder, textarea::placeholder { color:#C4C4D0; }
        textarea { resize:vertical; scrollbar-width:thin; }
      `}</style>

      {/* Nav */}
      <nav style={{ padding:'20px 36px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid rgba(83,74,183,0.07)', background:'#fff' }}>
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:7, textDecoration:'none', color:'#9CA3AF', fontSize:13.5, fontWeight:600, transition:'color .15s' }}
          onMouseOver={e=>e.currentTarget.style.color='#111'} onMouseOut={e=>e.currentTarget.style.color='#9CA3AF'}>
          <ArrowLeft style={{ width:14, height:14 }}/> Zirva
        </Link>
        <img src="/logo.png" alt="Zirva" style={{ height:26 }}/>
      </nav>

      {/* Main */}
      <div style={{ maxWidth:560, margin:'0 auto', padding:'60px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom:36, textAlign:'center' }}>
          <p style={{ fontSize:11, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'#7C3AED', marginBottom:14 }}>{ct.ct_eyebrow}</p>
          <h1 style={{ fontSize:'clamp(2.2rem,5vw,3.2rem)', fontWeight:800, letterSpacing:'-0.03em', lineHeight:1.05, marginBottom:14, color:'#111' }}>
            {ct.ct_heading}
          </h1>
          <p style={{ color:'#9CA3AF', fontSize:15.5, lineHeight:1.65, margin:'0 auto', maxWidth:400 }}>
            {ct.ct_sub}
          </p>
        </div>

        {/* Card */}
        <div className="ct-card" style={{ background:'#fff', borderRadius:20, padding:'36px 32px', boxShadow:'0 4px 24px rgba(83,74,183,0.08), 0 1px 4px rgba(0,0,0,0.04)', border:'1px solid rgba(83,74,183,0.08)' }}>
          {sent ? (
            <div style={{ textAlign:'center', padding:'24px 0' }}>
              <div style={{ position:'relative', width:68, height:68, margin:'0 auto 20px' }}>
                <div style={{ width:68, height:68, borderRadius:'50%', background:'#F0FDF4', border:'1.5px solid #BBF7D0', display:'flex', alignItems:'center', justifyContent:'center', animation:'ctCheckPop .5s cubic-bezier(.34,1.56,.64,1)' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              </div>
              <p style={{ color:'#111', fontWeight:800, fontSize:22, marginBottom:10, letterSpacing:'-0.015em' }}>{ct.ct_success_title}</p>
              <p style={{ color:'#9CA3AF', fontSize:14, lineHeight:1.6, maxWidth:320, margin:'0 auto 24px' }}>
                <strong style={{ color:'#7C3AED' }}>{form.email}</strong> — {ct.ct_success_body}
              </p>
              <Link to="/" style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'10px 22px', borderRadius:999, background:'#F5F4FF', border:'1px solid rgba(124,58,237,0.15)', color:'#7C3AED', textDecoration:'none', fontSize:13, fontWeight:600, transition:'all .2s' }}>
                <ArrowLeft style={{ width:13, height:13 }}/> {ct.ct_back}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={lbl}>{ct.ct_name}</label>
                  <input required style={inp} placeholder={ct.ct_ph_name} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} onFocus={focus} onBlur={blur}/>
                </div>
                <div>
                  <label style={lbl}>{ct.ct_email}</label>
                  <input required type="email" style={inp} placeholder="you@school.az" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} onFocus={focus} onBlur={blur}/>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={lbl}>{ct.ct_school}</label>
                  <input required style={inp} placeholder={ct.ct_ph_school} value={form.school} onChange={e=>setForm(f=>({...f,school:e.target.value}))} onFocus={focus} onBlur={blur}/>
                </div>
                <div>
                  <label style={lbl}>{ct.ct_phone}</label>
                  <input type="tel" style={inp} placeholder="+994 50 123 45 67" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} onFocus={focus} onBlur={blur}/>
                </div>
              </div>
              <div>
                <label style={lbl}>{ct.ct_message}</label>
                <textarea required rows={4} style={{ ...inp, lineHeight:1.65, minHeight:112 }} placeholder={ct.ct_ph_message} value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))} onFocus={focus} onBlur={blur}/>
              </div>
              <button type="submit" disabled={loading} className="ct-submit"
                style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'13px', borderRadius:10, background:'#7C3AED', color:'#fff', fontWeight:700, fontSize:14, border:'none', cursor:loading?'not-allowed':'pointer', fontFamily:'inherit', boxShadow:'0 8px 20px -8px rgba(124,58,237,0.4)', opacity:loading?.75:1, marginTop:4 }}>
                {loading ? (
                  <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation:'spin .8s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>{ct.ct_sending}</>
                ) : (
                  <>{ct.ct_send} <ArrowRight style={{ width:15, height:15 }}/></>
                )}
              </button>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, color:'#C4C4D0', fontSize:11.5, fontWeight:500 }}>
                <Shield style={{ width:11, height:11 }}/><span>{ct.ct_privacy}</span>
              </div>
            </form>
          )}
        </div>

        {/* Footer strip */}
        <div style={{ marginTop:24, display:'grid', gridTemplateColumns:'1fr auto 1fr auto 1fr', alignItems:'center', background:'#fff', border:'1px solid rgba(83,74,183,0.08)', borderRadius:14, padding:'13px 16px' }}>
          <a href="mailto:hello@tryzirva.com" className="ct-foot-link">
            <Mail style={{ width:13, height:13 }}/><span>hello@tryzirva.com</span>
          </a>
          <span style={{ width:1, height:16, background:'#E8E8F0' }}/>
          <a href="tel:+994502411442" className="ct-foot-link">
            <Phone style={{ width:13, height:13 }}/><span>+994 50 241 14 42</span>
          </a>
          <span style={{ width:1, height:16, background:'#E8E8F0' }}/>
          <span className="ct-foot-link" style={{ cursor:'default' }}>
            <MapPin style={{ width:13, height:13 }}/><span>Baku, Azerbaijan</span>
          </span>
        </div>
      </div>
    </div>
  )
}

/* ─── IB / Programme Page Template ─── */
const PROGRAMME_META = {
  'ib-pyp':            { code:'PYP', age:'3–12',  accent:'#f59e0b', accent2:'#fbbf24', logo:'/pyp.png', typeKey:'ui_ib_programme',  hlKey:'ib-pyp_hl' },
  'ib-myp':            { code:'MYP', age:'11–16', accent:'#ef4444', accent2:'#f87171', logo:'/myp.png', typeKey:'ui_ib_programme',  hlKey:'ib-myp_hl' },
  'ib-diploma':        { code:'DP',  age:'16–19', accent:'#3b82f6', accent2:'#60a5fa', logo:'/dp.png',  typeKey:'ui_ib_programme',  hlKey:'ib-diploma_hl' },
  'ib-career':         { code:'CP',  age:'16–19', accent:'#a855f7', accent2:'#c084fc', logo:'/cp.png',  typeKey:'ui_ib_programme',  hlKey:'ib-career_hl' },
  'government-schools':{ code:'GOV', age:'6–18',  accent:'#1D9E75', accent2:'#34d399', logo:null,       typeKey:'ui_state_schools', hlKey:'government-schools_hl' },
}

const RELATED_IB_BASE = [
  { key:'ib-pyp',    label:'PYP', relKey:'rel_pyp', age:'3–12',  accent:'#f59e0b' },
  { key:'ib-myp',    label:'MYP', relKey:'rel_myp', age:'11–16', accent:'#ef4444' },
  { key:'ib-diploma',label:'DP',  relKey:'rel_dp',  age:'16–19', accent:'#3b82f6' },
  { key:'ib-career', label:'CP',  relKey:'rel_cp',  age:'16–19', accent:'#a855f7' },
]

function ProgrammePage({ type }) {
  const { lang } = useLang()
  const t = T[lang] || T.en
  const meta = PROGRAMME_META[type]
  const accent = meta.accent
  const accent2 = meta.accent2
  const related = RELATED_IB_BASE.filter(r => r.key !== type)
  const isIB = type.startsWith('ib-')

  const page = {
    title:    t[`${type}_title`],
    subtitle: t[`${type}_subtitle`],
    body:     t[`${type}_body`],
  }
  const highlights = t[meta.hlKey] || []
  const typeLabel  = t[meta.typeKey]

  return (
    <div style={{ minHeight:'100vh', background:'#fafafa', fontFamily:'Plus Jakarta Sans, system-ui, sans-serif' }}>
      <style>{`
        .pp-related-card { transition: all .3s cubic-bezier(.22,1,.36,1); }
        .pp-related-card:hover { transform: translateY(-3px); box-shadow: 0 14px 30px -16px rgba(15,15,26,0.18); }
        .pp-related-card:hover .pp-related-arrow { transform: translateX(3px); }
        .pp-related-arrow { transition: transform .3s ease; }
        .pp-cta-btn { transition: all .22s ease; }
        .pp-cta-btn:hover { transform: translateY(-2px); box-shadow: 0 14px 28px -10px var(--accent-shadow); }
        .pp-check-item { transition: all .2s ease; }
        .pp-check-item:hover { background: rgba(0,0,0,0.02); }
      `}</style>

      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" />
            Zirva
          </Link>
          <Link to="/contact" className="text-xs font-bold px-4 py-2 rounded-lg transition-all pp-cta-btn"
            style={{ background:`linear-gradient(135deg, ${accent}, ${accent2})`, color:'#fff', '--accent-shadow': `${accent}55` }}>
            {t.ui_contact_us}
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative overflow-hidden" style={{ background:`linear-gradient(135deg, ${accent} 0%, ${accent2} 100%)` }}>
        {/* Grid pattern */}
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)', backgroundSize:'42px 42px', WebkitMaskImage:'radial-gradient(ellipse 80% 90% at 50% 50%, black 0%, transparent 90%)', maskImage:'radial-gradient(ellipse 80% 90% at 50% 50%, black 0%, transparent 90%)', pointerEvents:'none' }}/>
        {/* Orbs */}
        <div style={{ position:'absolute', top:'-40%', right:'-10%', width:500, height:500, background:'radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 65%)', borderRadius:'50%', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:'-50%', left:'-10%', width:400, height:400, background:'radial-gradient(circle, rgba(0,0,0,0.10) 0%, transparent 65%)', borderRadius:'50%', pointerEvents:'none' }}/>

        <div className="relative max-w-5xl mx-auto px-6 py-20">
          {/* Meta strip */}
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background:'rgba(255,255,255,0.18)', border:'1px solid rgba(255,255,255,0.22)', backdropFilter:'blur(12px)' }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:'#fff' }}/>
              <span style={{ fontSize:11, fontWeight:700, color:'#fff', letterSpacing:'0.08em', textTransform:'uppercase' }}>{typeLabel}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ background:'rgba(255,255,255,0.14)', border:'1px solid rgba(255,255,255,0.2)', backdropFilter:'blur(12px)' }}>
              <Users style={{ width:12, height:12, color:'#fff' }}/>
              <span style={{ fontSize:11, fontWeight:700, color:'#fff', letterSpacing:'0.04em' }}>{t.ui_ages} {meta.age}</span>
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 sm:gap-10">
            {meta.logo && (
              <div className="rounded-2xl p-4 shrink-0" style={{ background:'rgba(255,255,255,0.94)', boxShadow:'0 20px 40px -16px rgba(0,0,0,0.25)' }}>
                <img src={meta.logo} alt={meta.code} className="h-20 w-auto object-contain"/>
              </div>
            )}
            <div className="flex-1">
              <h1 style={{ fontSize:'clamp(2.4rem,5vw,3.8rem)', fontWeight:800, color:'#fff', letterSpacing:'-0.035em', lineHeight:1.05, marginBottom:12 }}>
                {page.title}
              </h1>
              <p style={{ color:'rgba(255,255,255,0.85)', fontSize:18, fontWeight:500, lineHeight:1.5, maxWidth:620 }}>
                {page.subtitle}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-20 -mt-12 relative">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-8 md:p-12 relative overflow-hidden"
              style={{ border:'1px solid rgba(15,15,26,0.05)', boxShadow:'0 10px 40px -20px rgba(15,15,26,0.08)' }}>
              {/* Accent bar */}
              <div style={{ position:'absolute', top:0, left:0, right:0, height:4, background:`linear-gradient(90deg, ${accent}, ${accent2})` }}/>

              <div className="space-y-5">
                {page.body.split('\n\n').map((para, i) => (
                  <p key={i} style={{ color:'#4b5563', fontSize:15.5, lineHeight:1.75, fontWeight:500 }}>{para}</p>
                ))}
              </div>

              {/* What's included */}
              <div className="mt-12 pt-8" style={{ borderTop:'1px solid rgba(15,15,26,0.06)' }}>
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles style={{ width:16, height:16, color:accent }}/>
                  <span style={{ fontSize:11, fontWeight:800, color:accent, letterSpacing:'0.14em', textTransform:'uppercase' }}>
                    {t.ui_whats_included}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {highlights.map((h, i) => (
                    <div key={i} className="pp-check-item flex items-start gap-3 p-3 rounded-xl">
                      <div className="shrink-0 w-6 h-6 rounded-lg flex items-center justify-center mt-0.5"
                        style={{ background:`${accent}14`, border:`1px solid ${accent}22` }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </div>
                      <span style={{ color:'#1f2937', fontSize:14, fontWeight:600, lineHeight:1.5 }}>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="mt-10 pt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4" style={{ borderTop:'1px solid rgba(15,15,26,0.06)' }}>
                <Link to="/contact" className="pp-cta-btn inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white"
                  style={{ background:`linear-gradient(135deg, ${accent}, ${accent2})`, '--accent-shadow': `${accent}50`, boxShadow:`0 8px 24px -10px ${accent}88` }}>
                  {t.ui_book_demo} <ArrowRight className="w-4 h-4"/>
                </Link>
                <a href="mailto:hello@tryzirva.com" className="text-sm font-semibold hover:underline" style={{ color:accent }}>
                  hello@tryzirva.com
                </a>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Quick facts card */}
            <div className="bg-white rounded-2xl p-6" style={{ border:'1px solid rgba(15,15,26,0.05)', boxShadow:'0 4px 20px -10px rgba(15,15,26,0.05)' }}>
              <p style={{ fontSize:11, fontWeight:800, color:'rgba(15,15,26,0.45)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:16 }}>{t.ui_quick_facts}</p>

              <div className="space-y-4">
                <div>
                  <div style={{ fontSize:11, fontWeight:700, color:'rgba(15,15,26,0.45)', letterSpacing:'0.04em', marginBottom:4 }}>{t.ui_programme}</div>
                  <div style={{ fontSize:15, fontWeight:700, color:'#0f0f1a' }}>{typeLabel}</div>
                </div>
                <div style={{ height:1, background:'rgba(15,15,26,0.05)' }}/>
                <div>
                  <div style={{ fontSize:11, fontWeight:700, color:'rgba(15,15,26,0.45)', letterSpacing:'0.04em', marginBottom:4 }}>{t.ui_age_range}</div>
                  <div style={{ fontSize:15, fontWeight:700, color:'#0f0f1a' }}>{meta.age} {t.ui_years}</div>
                </div>
                {isIB && (
                  <>
                    <div style={{ height:1, background:'rgba(15,15,26,0.05)' }}/>
                    <div>
                      <div style={{ fontSize:11, fontWeight:700, color:'rgba(15,15,26,0.45)', letterSpacing:'0.04em', marginBottom:4 }}>{t.ui_ib_code}</div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                        style={{ background:`${accent}14`, border:`1px solid ${accent}22` }}>
                        <span style={{ width:6, height:6, borderRadius:'50%', background:accent }}/>
                        <span style={{ fontSize:12, fontWeight:800, color:accent, letterSpacing:'0.04em' }}>IB {meta.code}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Related programmes */}
            {isIB && (
              <div className="bg-white rounded-2xl p-6" style={{ border:'1px solid rgba(15,15,26,0.05)', boxShadow:'0 4px 20px -10px rgba(15,15,26,0.05)' }}>
                <p style={{ fontSize:11, fontWeight:800, color:'rgba(15,15,26,0.45)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:14 }}>{t.ui_related}</p>
                <div className="space-y-2">
                  {related.map(r => (
                    <Link key={r.key} to={`/${r.key}`} className="pp-related-card flex items-center gap-3 p-3 rounded-xl no-underline"
                      style={{ border:'1px solid rgba(15,15,26,0.05)', background:'#fff' }}>
                      <span className="inline-flex items-center justify-center rounded-lg shrink-0"
                        style={{ width:36, height:36, background:`${r.accent}14`, border:`1px solid ${r.accent}22`, color:r.accent, fontSize:11, fontWeight:800, letterSpacing:'0.04em' }}>
                        {r.label}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div style={{ fontSize:13, fontWeight:700, color:'#0f0f1a', lineHeight:1.3 }}>{t[r.relKey]}</div>
                        <div style={{ fontSize:11, fontWeight:600, color:'rgba(15,15,26,0.45)', marginTop:1 }}>{t.ui_ages} {r.age}</div>
                      </div>
                      <ArrowRight className="pp-related-arrow w-3.5 h-3.5 shrink-0" style={{ color:r.accent, opacity:.6 }}/>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Direct contact */}
            <div className="rounded-2xl p-6 relative overflow-hidden"
              style={{ background:`linear-gradient(135deg, ${accent}0f, ${accent2}08)`, border:`1px solid ${accent}22` }}>
              <p style={{ fontSize:11, fontWeight:800, color:accent, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:10 }}>{t.ui_questions}</p>
              <p style={{ fontSize:13.5, fontWeight:500, color:'#4b5563', lineHeight:1.6, marginBottom:14 }}>
                {t.ui_questions_body}
              </p>
              <div className="flex flex-col gap-2">
                <a href="mailto:hello@tryzirva.com" className="flex items-center gap-2 text-sm font-semibold hover:underline" style={{ color:accent }}>
                  <Mail style={{ width:13, height:13 }}/> hello@tryzirva.com
                </a>
                <a href="tel:+994502411442" className="flex items-center gap-2 text-sm font-semibold hover:underline" style={{ color:accent }}>
                  <Phone style={{ width:13, height:13 }}/> +994 50 241 14 42
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function InfoPage({ type: typeProp }) {
  const { type: typeParam } = useParams()
  const type = typeProp || typeParam

  if (type === 'contact') return <ContactPage />

  const page = PAGES[type]

  if (!page) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Page not found</p>
          <Link to="/" className="text-purple font-medium hover:underline">← Back to home</Link>
        </div>
      </div>
    )
  }

  // Premium layout for IB programme pages + government schools
  if (PROGRAMME_META[type]) return <ProgrammePage type={type} page={page} />

  const accentBg   = page.color === 'teal' ? 'bg-teal'   : 'bg-purple'
  const accentText = page.color === 'teal' ? 'text-teal'  : 'text-purple'
  const accentLight = page.color === 'teal' ? 'bg-teal-light' : 'bg-purple-light'

  return (
    <div className="min-h-screen bg-surface">
      {/* Nav strip */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" />
            Zirva
          </Link>
          <Link to="/contact" className="bg-purple text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-purple-dark transition-colors">
            Bizimlə Əlaqə
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div className={`${accentBg} px-6 py-16`}>
        <div className="max-w-3xl mx-auto">
          <h1 className="font-serif text-white text-4xl md:text-5xl mb-3 leading-tight">{page.title}</h1>
          <p className="text-white/70 text-lg">{page.subtitle}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="bg-white rounded-2xl border border-border-soft p-8 md:p-12 shadow-sm">
          {page.body.split('\n\n').map((para, i) => (
            <p key={i} className="text-gray-600 leading-relaxed mb-5 last:mb-0">{para}</p>
          ))}

          {page.isContact ? (
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a href="mailto:hello@tryzirva.com"
                className="flex items-center gap-3 p-4 rounded-xl bg-purple-light border border-purple/10 hover:border-purple/30 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-purple flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Email</p>
                  <p className="text-sm font-semibold text-purple">hello@tryzirva.com</p>
                </div>
              </a>
              <a href="tel:+994502411442"
                className="flex items-center gap-3 p-4 rounded-xl bg-teal-light border border-teal/10 hover:border-teal/30 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-teal flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Telefon</p>
                  <p className="text-sm font-semibold text-teal">+994 50 241 14 42</p>
                </div>
              </a>
            </div>
          ) : (
            <div className="mt-10 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link to="/contact"
                className="bg-purple text-white font-semibold px-6 py-3 rounded-xl hover:bg-purple-dark transition-colors text-sm shadow-lg shadow-purple/20">
                Bizimlə Əlaqə
              </Link>
              <a href="mailto:hello@tryzirva.com"
                className={`${accentText} text-sm font-semibold hover:underline`}>
                hello@tryzirva.com
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
