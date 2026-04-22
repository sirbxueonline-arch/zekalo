import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, BookOpen, ClipboardCheck, Calendar, BarChart2, MessageSquare, Clock, Users, Sparkles } from 'lucide-react'
import { useLang } from '../contexts/LanguageContext'
import LandingNav from '../components/layout/LandingNav'

/* ─── Feature data ─── */
const FEATURES = {
  curriculum: {
    icon: BookOpen,
    accent: '#7c3aed',
    glow: 'rgba(124,58,237,0.35)',
    en: {
      title: 'Curriculum Management',
      subtitle: 'Collaborative planning built for IB and national schools',
      body: 'Zirva gives every teacher a shared workspace for curriculum planning. Map lessons to 600+ built-in IB and national curriculum standards, collaborate on unit plans in real time, and track alignment across your entire school. IBIS integration handles exam registration, e-coursework, and CAS — all in one place.',
      highlights: ['Collaborative unit & lesson planning','600+ IB and national curriculum standards','Alignment audit tools','IBIS: exam registration, e-coursework, CAS','Interdisciplinary mapping','Curriculum calendar view'],
    },
    az: {
      title: 'Kurikulum İdarəetməsi',
      subtitle: 'IB və dövlət məktəbləri üçün birgə planlaşdırma',
      body: 'Zirva hər müəllimə kurikulum planlaması üçün ortaq iş sahəsi təqdim edir. Dərsləri 600+ daxili IB və milli standartlarla əlaqələndirin, vahid planlar üzərində real vaxtda birlikdə işləyin və bütün məktəb üzrə uyğunluğu izləyin. IBIS inteqrasiyası imtahan qeydiyyatı, e-coursework və CAS-ı bir yerdə həll edir.',
      highlights: ['Birgə vahid və dərs planlaması','600+ IB və milli kurikulum standartları','Uyğunluq audit alətləri','IBIS: imtahan qeydiyyatı, e-coursework, CAS','Fənlərarası xəritələmə','Kurikulum təqvimi görünüşü'],
    },
    tr: {
      title: 'Müfredat Yönetimi',
      subtitle: 'IB ve devlet okulları için ortak planlama',
      body: "Zirva her öğretmene müfredat planlaması için ortak bir çalışma alanı sunar. 600'den fazla yerleşik IB ve ulusal müfredat standardına ders haritası oluşturun, birim planları üzerinde gerçek zamanlı işbirliği yapın ve tüm okul genelinde uyumu takip edin. IBIS entegrasyonu sınav kaydı, e-ödev ve CAS'ı tek bir yerde yönetir.",
      highlights: ['Ortak birim ve ders planlaması','600+ IB ve ulusal müfredat standardı','Uyum denetim araçları','IBIS: sınav kaydı, e-ödev, CAS','Disiplinlerarası haritalama','Müfredat takvim görünümü'],
    },
    ru: {
      title: 'Управление учебной программой',
      subtitle: 'Совместное планирование для IB и государственных школ',
      body: 'Zirva предоставляет каждому учителю общее пространство для планирования учебной программы. Привязывайте уроки к 600+ встроенным стандартам IB и национальной программы, сотрудничайте в планах модулей в реальном времени, отслеживайте соответствие по всей школе. Интеграция с IBIS берёт на себя регистрацию на экзамены, e-coursework и CAS.',
      highlights: ['Совместное планирование модулей и уроков','600+ стандартов IB и национальной программы','Инструменты аудита соответствия','IBIS: регистрация на экзамены, e-coursework, CAS','Межпредметное картирование','Календарный вид учебной программы'],
    },
  },
  assessment: {
    icon: ClipboardCheck,
    accent: '#2563eb',
    glow: 'rgba(37,99,235,0.35)',
    en: {
      title: 'Assessment & Gradebook',
      subtitle: 'IB criteria and national 10-point grading, unified',
      body: "Zirva's gradebook handles both IB criterion-referenced grading (A–D scale) and the Azerbaijani national 10-point system simultaneously. Enter grades once, sync across student, teacher, parent and admin views in real time. Analytics surface performance trends, at-risk students, and class-wide insights automatically.",
      highlights: ['IB criterion grading (A–D scale)','National 10-point grading system','Real-time grade synchronisation across all roles','Student progress analytics & trends','At-risk student detection','Parent grade notifications'],
    },
    az: {
      title: 'Qiymətləndirmə & Jurnal',
      subtitle: 'IB kriteriyaları və milli 10 ballıq sistem, birləşdirilmiş',
      body: 'Zirva-nın jurnalı həm IB meyar əsaslı qiymətləndirməni (A–D şkalası), həm də Azərbaycan milli 10 ballıq sistemini eyni anda idarə edir. Qiymətləri bir dəfə daxil edin, şagird, müəllim, valideyn və admin görünüşlərində real vaxtda sinxronizasiya edin. Analitika performans meyllərini, risk qrupundakı şagirdləri avtomatik üzə çıxarır.',
      highlights: ['IB meyar qiymətləndirməsi (A–D şkalası)','Milli 10 ballıq qiymətləndirmə sistemi','Bütün rollarda real vaxtda sinxronizasiya','Şagird irəliləyiş analitikası','Risk qrupundakı şagirdlər','Valideyn qiymət bildirişləri'],
    },
    tr: {
      title: 'Değerlendirme & Not Defteri',
      subtitle: 'IB kriterleri ve ulusal 10 puanlık notlandırma, birleştirilmiş',
      body: "Zirva'nın not defteri, hem IB kriter referanslı notlandırmayı (A–D ölçeği) hem de Azerbaycan ulusal 10 puanlık sistemini aynı anda yönetir. Notları bir kez girin, öğrenci, öğretmen, veli ve yönetici görünümlerinde gerçek zamanlı senkronize edin. Analitik, performans eğilimlerini ve risk altındaki öğrencileri otomatik olarak ortaya çıkarır.",
      highlights: ['IB kriter notlandırması (A–D ölçeği)','Ulusal 10 puanlık notlandırma sistemi','Tüm rollarda gerçek zamanlı senkronizasyon','Öğrenci ilerleme analitiği','Risk altındaki öğrenci tespiti','Veli not bildirimleri'],
    },
    ru: {
      title: 'Оценивание & Журнал',
      subtitle: 'Критериальное IB и национальная 10-балльная система, объединённые',
      body: 'Журнал Zirva одновременно поддерживает критериальное оценивание IB (шкала A–D) и национальную 10-балльную систему Азербайджана. Введите оценки один раз — они синхронизируются в реальном времени для учеников, учителей, родителей и администраторов. Аналитика автоматически выявляет тренды успеваемости и учеников в группе риска.',
      highlights: ['Критериальное оценивание IB (шкала A–D)','Национальная 10-балльная система','Синхронизация в реальном времени для всех ролей','Аналитика успеваемости учащихся','Выявление учеников в группе риска','Уведомления родителей об оценках'],
    },
  },
  attendance: {
    icon: Calendar,
    accent: '#059669',
    glow: 'rgba(5,150,105,0.35)',
    en: {
      title: 'Attendance',
      subtitle: 'One-tap recording with instant parent notifications',
      body: "Take attendance for an entire class in seconds with Zirva's one-tap interface. Absent students trigger instant SMS or in-app notifications to parents. Trend analytics track patterns across weeks and terms, flag students approaching absence thresholds, and generate E-Gov.az compliant reports automatically.",
      highlights: ['One-tap attendance for full class','Instant parent SMS & in-app alerts','Attendance trend analytics','Absence threshold warnings','E-Gov.az compliant reporting','Late arrival tracking'],
    },
    az: {
      title: 'Davamiyyət',
      subtitle: 'Bir toxunuşla qeydiyyat, ani valideyn bildirişi',
      body: "Zirva-nın bir toxunuş interfeysi ilə bütün sinif üçün davamiyyəti saniyələr içində qeyd edin. Buraxılmış şagirdlər valideynlərə ani SMS və ya tətbiq içi bildiriş göndərir. Trend analitikası həftələr və rüblər üzrə nümunələri izləyir, davamiyyət həddini keçmək üzrə olan şagirdləri işarələyir və E-Gov.az uyğun hesabatları avtomatik yaradır.",
      highlights: ['Bütün sinif üçün bir toxunuşla qeydiyyat','Ani valideyn SMS & tətbiq bildirişi','Davamiyyət trend analitikası','Buraxılış hədd xəbərdarlıqları','E-Gov.az uyğun hesabat','Gecikən şagird izlənməsi'],
    },
    tr: {
      title: 'Devam Takibi',
      subtitle: 'Tek dokunuşla kayıt ve anlık veli bildirimleri',
      body: "Zirva'nın tek dokunuş arayüzüyle tüm sınıfın devamını saniyeler içinde kaydedin. Gelmemiş öğrenciler velilere anlık SMS veya uygulama içi bildirim gönderir. Trend analitiği haftalık ve dönemlik örüntüleri izler, devamsızlık eşiğine yaklaşan öğrencileri işaretler ve E-Gov.az uyumlu raporları otomatik oluşturur.",
      highlights: ['Tüm sınıf için tek dokunuşla kayıt','Anlık veli SMS & uygulama bildirimi','Devam trend analitiği','Devamsızlık eşiği uyarıları','E-Gov.az uyumlu raporlama','Geç gelen öğrenci takibi'],
    },
    ru: {
      title: 'Посещаемость',
      subtitle: 'Отметка в одно касание с мгновенными уведомлениями',
      body: 'Отмечайте посещаемость всего класса за секунды с помощью интерфейса Zirva. Отсутствующие ученики автоматически запускают SMS или уведомления в приложении для родителей. Аналитика трендов отслеживает закономерности по неделям и четвертям, предупреждает о приближении к порогу пропусков и автоматически создаёт отчёты E-Gov.az.',
      highlights: ['Отметка всего класса в одно касание','Мгновенные SMS & уведомления для родителей','Аналитика трендов посещаемости','Предупреждения о пороге пропусков','Отчёты, совместимые с E-Gov.az','Отслеживание опозданий'],
    },
  },
  reports: {
    icon: BarChart2,
    accent: '#d97706',
    glow: 'rgba(217,119,6,0.35)',
    en: {
      title: 'Reports & Analytics',
      subtitle: 'Ministry-ready reports and IB audit docs in one click',
      body: "Generate quarterly academic reports, attendance summaries, IB audit documentation and Ministry compliance packages in PDF, Excel or directly to E-Gov.az — all with one click. School-wide analytics dashboards surface grade distributions, teacher workload, subject performance, and attendance trends in real time.",
      highlights: ['Ministry-compliant quarterly reports','Automatic E-Gov.az export','PDF and Excel output','IB Audit documentation','Grade distribution analytics','Teacher workload insights','Attendance trend dashboards'],
    },
    az: {
      title: 'Hesabatlar & Analitika',
      subtitle: 'Nazirlik hesabatları və IB audit sənədləri bir klikdə',
      body: 'Rüblük akademik hesabatlar, davamiyyət xülasələri, IB audit sənədləri və Nazirlik uyğunluq paketlərini PDF, Excel formatında və ya birbaşa E-Gov.az-a bir klikdə yaradın. Məktəb miqyasında analitika panelləri qiymət paylanmasını, müəllim iş yükünü, fənn performansını real vaxtda üzə çıxarır.',
      highlights: ['Nazirlik uyğunluqlu rüblük hesabatlar','Avtomatik E-Gov.az ixracı','PDF və Excel çıxışı','IB Audit sənədləşməsi','Qiymət paylanma analitikası','Müəllim iş yükü məlumatları','Davamiyyət trend paneli'],
    },
    tr: {
      title: 'Raporlar & Analitik',
      subtitle: 'Bakanlık raporları ve IB denetim belgeleri tek tıklamayla',
      body: "Dönemlik akademik raporlar, devam özetleri, IB denetim belgeleri ve Bakanlık uyumluluk paketlerini PDF, Excel formatında veya doğrudan E-Gov.az'a tek tıklamayla oluşturun. Okul genelindeki analitik panolar not dağılımını, öğretmen iş yükünü ve devam eğilimlerini gerçek zamanlı olarak gösterir.",
      highlights: ['Bakanlık uyumlu dönemlik raporlar','Otomatik E-Gov.az dışa aktarma','PDF ve Excel çıktısı','IB Denetim belgelemesi','Not dağılımı analitiği','Öğretmen iş yükü içgörüleri','Devam trend panoları'],
    },
    ru: {
      title: 'Отчёты & Аналитика',
      subtitle: 'Отчёты для Министерства и IB Audit в один клик',
      body: 'Создавайте квартальные академические отчёты, сводки посещаемости, документацию IB Audit и пакеты соответствия для Министерства в PDF, Excel или напрямую в E-Gov.az — одним нажатием. Аналитические панели показывают распределение оценок, нагрузку учителей и тренды посещаемости в реальном времени.',
      highlights: ['Квартальные отчёты для Министерства','Автоэкспорт в E-Gov.az','PDF и Excel','Документация IB Audit','Аналитика распределения оценок','Данные о нагрузке учителей','Панели трендов посещаемости'],
    },
  },
  communication: {
    icon: MessageSquare,
    accent: '#0891b2',
    glow: 'rgba(8,145,178,0.35)',
    en: {
      title: 'Communication',
      subtitle: 'Real-time messaging between teachers, parents and students',
      body: "Zirva's messaging system connects the whole school community in one place. Teachers send messages to individual parents or broadcast announcements to whole classes. Admins publish school-wide notices. All messages are threaded, searchable and available in four languages — Azerbaijani, English, Russian and Turkish.",
      highlights: ['Teacher–parent direct messaging','Class-wide announcements','School-wide broadcast system','Event & calendar notifications','Four-language interface','Message history & search'],
    },
    az: {
      title: 'Kommunikasiya',
      subtitle: 'Müəllimlər, valideynlər və şagirdlər arasında real vaxtda mesajlaşma',
      body: 'Zirva-nın mesajlaşma sistemi bütün məktəb icmasını bir yerdə birləşdirir. Müəllimlər fərdi valideynlərə mesaj göndərir və ya bütün sinifə elanlar yayır. Adminlər məktəb miqyasında bildirişlər nəşr edir. Bütün mesajlar mövzu ilə bağlıdır, axtarıla bilir və dörd dildə mövcuddur.',
      highlights: ['Müəllim-valideyn birbaşa mesajlaşma','Sinif miqyasında elanlar','Məktəb miqyasında yayım sistemi','Tədbir & təqvim bildirişləri','Dörd dillik interfeys','Mesaj tarixi & axtarış'],
    },
    tr: {
      title: 'İletişim',
      subtitle: 'Öğretmenler, veliler ve öğrenciler arasında gerçek zamanlı mesajlaşma',
      body: "Zirva'nın mesajlaşma sistemi tüm okul topluluğunu tek bir yerde birleştirir. Öğretmenler bireysel velilere mesaj gönderir veya tüm sınıfa duyuru yapar. Yöneticiler okul genelinde bildirimler yayınlar. Tüm mesajlar konuya göre düzenlenir, aranabilir ve dört dilde mevcuttur.",
      highlights: ['Öğretmen-veli doğrudan mesajlaşma','Sınıf genelinde duyurular','Okul genelinde yayın sistemi','Etkinlik & takvim bildirimleri','Dört dilli arayüz','Mesaj geçmişi & arama'],
    },
    ru: {
      title: 'Коммуникация',
      subtitle: 'Обмен сообщениями в реальном времени между учителями, родителями и учениками',
      body: 'Система сообщений Zirva объединяет всё школьное сообщество в одном месте. Учителя отправляют сообщения отдельным родителям или транслируют объявления для целых классов. Администраторы публикуют общешкольные уведомления. Все сообщения структурированы по темам, доступны для поиска и работают на четырёх языках.',
      highlights: ['Прямые сообщения учитель–родитель','Объявления для всего класса','Общешкольная система трансляций','Уведомления о событиях и календаре','Четырёхязычный интерфейс','История сообщений и поиск'],
    },
  },
  timetable: {
    icon: Clock,
    accent: '#7c3aed',
    glow: 'rgba(124,58,237,0.35)',
    en: {
      title: 'Timetable Management',
      subtitle: 'Automatic timetable generation with conflict detection',
      body: "Stop building timetables in spreadsheets. Zirva's automatic timetable generator produces a full school schedule in minutes, detects teacher and room conflicts before they happen, and lets admins publish the final timetable to all students and teachers instantly. Substitution management handles last-minute teacher absences automatically.",
      highlights: ['Automatic timetable generation','Conflict detection (teacher & room)','One-click publish to all users','Substitute teacher management','Room booking integration','Mobile timetable view'],
    },
    az: {
      title: 'Cədvəl İdarəetməsi',
      subtitle: 'Konflikt aşkarlama ilə avtomatik cədvəl generasiyası',
      body: 'Cədvəl qurmağı cədvəllərdə dayandırın. Zirva-nın avtomatik cədvəl generatoru dəqiqələr içində tam məktəb cədvəli hazırlayır, müəllim və otaq konfliktlərini əvvəlcədən aşkarlayır, admina son cədvəli bütün şagird və müəllimlərə bir anda nəşr etməyə imkan verir. Əvəzetmə idarəetməsi son dəqiqə müəllim qayıblarını avtomatik həll edir.',
      highlights: ['Avtomatik cədvəl generasiyası','Konflikt aşkarlama (müəllim & otaq)','Bütün istifadəçilərə bir klik nəşr','Əvəzedici müəllim idarəetməsi','Otaq rezervasiyası inteqrasiyası','Mobil cədvəl görünüşü'],
    },
    tr: {
      title: 'Program Yönetimi',
      subtitle: 'Çakışma tespiti ile otomatik program oluşturma',
      body: "Program oluşturmayı tablolarda bırakın. Zirva'nın otomatik program oluşturucusu dakikalar içinde tam okul programı hazırlar, öğretmen ve oda çakışmalarını önceden tespit eder ve yöneticilerin nihai programı tüm öğrenci ve öğretmenlere anında yayınlamasına olanak tanır. Vekâlet yönetimi son dakika öğretmen yokluklarını otomatik olarak halleder.",
      highlights: ['Otomatik program oluşturma','Çakışma tespiti (öğretmen & oda)','Tüm kullanıcılara tek tıklamayla yayın','Vekil öğretmen yönetimi','Oda rezervasyonu entegrasyonu','Mobil program görünümü'],
    },
    ru: {
      title: 'Управление расписанием',
      subtitle: 'Автоматическое составление расписания с обнаружением конфликтов',
      body: 'Перестаньте составлять расписание в таблицах. Автоматический генератор расписания Zirva создаёт полное школьное расписание за минуты, обнаруживает конфликты учителей и кабинетов до их возникновения и позволяет администраторам мгновенно публиковать финальное расписание для всех учеников и учителей. Управление заменами автоматически решает вопрос внезапного отсутствия учителей.',
      highlights: ['Автоматическое составление расписания','Обнаружение конфликтов (учителя и кабинеты)','Публикация в один клик для всех пользователей','Управление учителями-заменителями','Интеграция с бронированием кабинетов','Мобильный вид расписания'],
    },
  },
  'student-staff': {
    icon: Users,
    accent: '#be185d',
    glow: 'rgba(190,24,93,0.35)',
    en: {
      title: 'Student & Staff Management',
      subtitle: 'Profiles, portfolios, workload and discipline in one place',
      body: "Every student and teacher in Zirva has a rich profile: academic history, attendance record, portfolio, and progress data. Admins track teacher workload and class sizes. Discipline incidents are logged and reviewed in a structured workflow. Student portfolios capture growth across the full learning journey — from PYP to Diploma.",
      highlights: ['Student academic profiles & history','Digital portfolios (PYP to DP)','Teacher workload tracking','Discipline incident management','Staff performance insights','Parent portal access'],
    },
    az: {
      title: 'Şagird & Heyət İdarəetməsi',
      subtitle: 'Profillər, portfoliolar, iş yükü və intizam bir yerdə',
      body: 'Zirva-da hər şagird və müəllimin zəngin profili var: akademik tarix, davamiyyət qeydi, portfolio və irəliləyiş məlumatları. Adminlər müəllim iş yükünü və sinif həcmini izləyir. İntizam hadisələri strukturlaşdırılmış iş axınında qeyd edilir və nəzərdən keçirilir. Şagird portfolioları PYP-dən Diploma-ya qədər bütün tədris yolu boyunca inkişafı əks etdirir.',
      highlights: ['Şagird akademik profillər & tarix','Rəqəmsal portfoliolar (PYP-dən DP-yə)','Müəllim iş yükü izlənməsi','İntizam hadisəsi idarəetməsi','Heyət performans məlumatları','Valideyn portal giriş'],
    },
    tr: {
      title: 'Öğrenci & Personel Yönetimi',
      subtitle: 'Profiller, portfolyolar, iş yükü ve disiplin tek yerde',
      body: "Zirva'daki her öğrenci ve öğretmenin zengin bir profili vardır: akademik geçmiş, devam kaydı, portfolyo ve ilerleme verileri. Yöneticiler öğretmen iş yükünü ve sınıf büyüklüklerini takip eder. Disiplin olayları yapılandırılmış bir iş akışında kaydedilir ve incelenir. Öğrenci portfolyoları PYP'den Diploma'ya kadar tüm öğrenme yolculuğundaki gelişimi yakalar.",
      highlights: ['Öğrenci akademik profilleri & geçmişi','Dijital portfolyolar (PYP\'den DP\'ye)','Öğretmen iş yükü takibi','Disiplin olayı yönetimi','Personel performans içgörüleri','Veli portal erişimi'],
    },
    ru: {
      title: 'Управление учениками и персоналом',
      subtitle: 'Профили, портфолио, нагрузка и дисциплина в одном месте',
      body: 'Каждый ученик и учитель в Zirva имеет богатый профиль: академическая история, записи посещаемости, портфолио и данные прогресса. Администраторы отслеживают нагрузку учителей и наполненность классов. Дисциплинарные инциденты фиксируются и рассматриваются в структурированном рабочем процессе. Портфолио учащихся фиксируют рост на всём пути обучения — от PYP до Diploma.',
      highlights: ['Академические профили учащихся','Цифровые портфолио (от PYP до DP)','Отслеживание нагрузки учителей','Управление дисциплинарными инцидентами','Аналитика эффективности персонала','Доступ к порталу родителей'],
    },
  },
}

const LABELS = {
  en: { back: '← Back to Features', cta_h: 'See it in action', cta_sub: 'Book a personalised demo for your school.', cta_btn: 'Contact Us', related: 'Other features', view: 'Learn more' },
  az: { back: '← Xüsusiyyətlərə qayıt', cta_h: 'Əməldə görün', cta_sub: 'Məktəbiniz üçün fərdi demo sifarişi verin.', cta_btn: 'Bizimlə Əlaqə', related: 'Digər xüsusiyyətlər', view: 'Ətraflı bax' },
  tr: { back: '← Özelliklere dön', cta_h: 'Canlı görün', cta_sub: 'Okulunuz için kişiselleştirilmiş demo talep edin.', cta_btn: 'Bize Ulaşın', related: 'Diğer özellikler', view: 'Daha fazla' },
  ru: { back: '← К возможностям', cta_h: 'Посмотрите вживую', cta_sub: 'Закажите персонализированное демо для вашей школы.', cta_btn: 'Связаться', related: 'Другие возможности', view: 'Подробнее' },
}

export default function FeaturePage({ type }) {
  const { lang, setLang } = useLang()
  const navigate = useNavigate()
  const feature = FEATURES[type]
  const L = LABELS[lang] || LABELS.en

  if (!feature) {
    return (
      <div style={{ fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif", background:'#060614', minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'#fff' }}>
        <p style={{ fontSize:20, fontWeight:700, marginBottom:20 }}>{L.back.replace('←','').trim()} not found</p>
        <Link to="/features" style={{ color:'#a78bfa', fontWeight:600, fontSize:14 }}>{L.back}</Link>
      </div>
    )
  }

  const content = feature[lang] || feature.en
  const Icon = feature.icon
  const accent = feature.accent

  // Nav strings — minimal, just need nav_signin and nav_contact
  const navS = {
    az: { nav_solutions:'Həllər', nav_features:'Xüsusiyyətlər', nav_zeka:'Zəka AI', nav_signin:'Daxil ol', nav_contact:'Bizimlə Əlaqə' },
    en: { nav_solutions:'Solutions', nav_features:'Features', nav_zeka:'Zeka AI', nav_signin:'Sign In', nav_contact:'Contact Us' },
    tr: { nav_solutions:'Çözümler', nav_features:'Özellikler', nav_zeka:'Zeka AI', nav_signin:'Giriş yap', nav_contact:'Bize Ulaşın' },
    ru: { nav_solutions:'Решения', nav_features:'Возможности', nav_zeka:'Зека AI', nav_signin:'Войти', nav_contact:'Связаться' },
  }
  const s = navS[lang] || navS.en

  const otherFeatures = Object.entries(FEATURES)
    .filter(([slug]) => slug !== type)
    .slice(0, 4)

  const featureNames = {
    en: { curriculum:'Curriculum', assessment:'Assessment', attendance:'Attendance', reports:'Reports & Analytics', communication:'Communication', timetable:'Timetable', 'student-staff':'Student & Staff' },
    az: { curriculum:'Kurikulum', assessment:'Qiymətləndirmə', attendance:'Davamiyyət', reports:'Hesabatlar', communication:'Kommunikasiya', timetable:'Cədvəl', 'student-staff':'Şagird & Heyət' },
    tr: { curriculum:'Müfredat', assessment:'Değerlendirme', attendance:'Devam', reports:'Raporlar', communication:'İletişim', timetable:'Program', 'student-staff':'Öğrenci & Personel' },
    ru: { curriculum:'Программа', assessment:'Оценивание', attendance:'Посещаемость', reports:'Отчёты', communication:'Коммуникация', timetable:'Расписание', 'student-staff':'Ученики & Персонал' },
  }
  const names = featureNames[lang] || featureNames.en

  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif", minHeight:'100vh', background:'#fff' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .fp-hl-item { transition: transform .15s ease, box-shadow .15s ease; }
        .fp-hl-item:hover { transform: translateY(-2px); }
        .fp-related-card { transition: transform .18s ease, box-shadow .18s ease; }
        .fp-related-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.1) !important; }
      `}</style>

      <LandingNav s={s} lang={lang} setLang={setLang} />

      {/* ── Hero ── */}
      <section style={{ position:'relative', overflow:'hidden', padding:'110px 24px 80px', textAlign:'center',
        background:`radial-gradient(ellipse 80% 70% at 50% -10%, ${feature.glow} 0%, transparent 65%), #060614` }}>
        {/* Dot grid */}
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize:'32px 32px', WebkitMaskImage:'radial-gradient(ellipse 80% 60% at 50% 40%, black, transparent)', maskImage:'radial-gradient(ellipse 80% 60% at 50% 40%, black, transparent)', pointerEvents:'none' }}/>

        <div style={{ position:'relative', zIndex:1, maxWidth:700, margin:'0 auto' }}>
          {/* Back link */}
          <Link to="/features" style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:12.5, fontWeight:600, color:'rgba(255,255,255,0.45)', marginBottom:28, textDecoration:'none', transition:'color .15s' }}
            onMouseEnter={e=>e.currentTarget.style.color='rgba(255,255,255,0.8)'}
            onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.45)'}>
            {L.back}
          </Link>

          {/* Icon badge */}
          <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:64, height:64, borderRadius:18, background:`${accent}20`, border:`1px solid ${accent}40`, marginBottom:24 }}>
            <Icon style={{ width:28, height:28, color:accent }}/>
          </div>

          <h1 style={{ fontSize:'clamp(2.2rem,5vw,3.6rem)', fontWeight:800, color:'#fff', lineHeight:1.1, letterSpacing:'-0.03em', marginBottom:16 }}>
            {content.title}
          </h1>
          <p style={{ fontSize:'clamp(1rem,2vw,1.15rem)', color:'rgba(255,255,255,0.55)', lineHeight:1.75, maxWidth:520, margin:'0 auto 36px' }}>
            {content.subtitle}
          </p>

          <Link to="/contact"
            style={{ display:'inline-flex', alignItems:'center', gap:8, background:`linear-gradient(135deg,${accent},${accent}cc)`, color:'#fff', fontWeight:700, fontSize:14, padding:'12px 26px', borderRadius:12, textDecoration:'none', boxShadow:`0 6px 24px ${accent}55`, transition:'transform .15s ease' }}
            onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
            onMouseLeave={e=>e.currentTarget.style.transform=''}>
            {L.cta_btn} <ArrowRight style={{ width:14, height:14 }}/>
          </Link>
        </div>
      </section>

      {/* ── Body ── */}
      <section style={{ padding:'80px 24px', background:'#f9fafb' }}>
        <div style={{ maxWidth:900, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, alignItems:'start' }}>
          {/* Description */}
          <div>
            <p style={{ fontSize:'1.08rem', color:'#374151', lineHeight:1.8, margin:0 }}>{content.body}</p>
          </div>

          {/* Highlights */}
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {content.highlights.map((hl, i) => (
              <div key={i} className="fp-hl-item" style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', background:'#fff', borderRadius:12, border:'1px solid #f0f0f5', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
                <span style={{ width:22, height:22, borderRadius:'50%', background:`${accent}15`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Check style={{ width:11, height:11, color:accent, strokeWidth:3 }}/>
                </span>
                <span style={{ fontSize:13.5, fontWeight:600, color:'#1f2937' }}>{hl}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA strip ── */}
      <section style={{ background:'#060614', padding:'80px 24px', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-40%', left:'20%', width:'60%', height:'130%', background:`radial-gradient(ellipse, ${feature.glow} 0%, transparent 65%)`, pointerEvents:'none' }}/>
        <div style={{ position:'relative', zIndex:1, maxWidth:520, margin:'0 auto' }}>
          <h2 style={{ fontSize:'clamp(1.5rem,3vw,2.2rem)', fontWeight:800, color:'#fff', marginBottom:12, letterSpacing:'-0.02em' }}>{L.cta_h}</h2>
          <p style={{ fontSize:15, color:'rgba(255,255,255,0.45)', marginBottom:32, lineHeight:1.7 }}>{L.cta_sub}</p>
          <Link to="/contact"
            style={{ display:'inline-flex', alignItems:'center', gap:8, background:`linear-gradient(135deg,${accent},${accent}cc)`, color:'#fff', fontWeight:700, fontSize:14, padding:'13px 28px', borderRadius:13, textDecoration:'none', boxShadow:`0 6px 24px ${accent}55`, transition:'transform .15s ease' }}
            onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
            onMouseLeave={e=>e.currentTarget.style.transform=''}>
            {L.cta_btn} <ArrowRight style={{ width:14, height:14 }}/>
          </Link>
        </div>
      </section>

      {/* ── Related features ── */}
      <section style={{ padding:'72px 24px 80px', background:'#fff' }}>
        <div style={{ maxWidth:960, margin:'0 auto' }}>
          <h3 style={{ fontSize:'1.3rem', fontWeight:800, color:'#0f0f1a', marginBottom:32, letterSpacing:'-0.015em' }}>{L.related}</h3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:16 }}>
            {otherFeatures.map(([slug, feat]) => {
              const FeatIcon = feat.icon
              return (
                <Link key={slug} to={`/features/${slug}`} className="fp-related-card"
                  style={{ display:'flex', flexDirection:'column', gap:12, padding:'20px', borderRadius:16, border:'1px solid #f0f0f5', background:'#fafafa', textDecoration:'none', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}>
                  <div style={{ width:40, height:40, borderRadius:12, background:`${feat.accent}14`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <FeatIcon style={{ width:18, height:18, color:feat.accent }}/>
                  </div>
                  <div>
                    <p style={{ fontSize:13.5, fontWeight:700, color:'#1f2937', margin:'0 0 4px' }}>{names[slug] || slug}</p>
                    <p style={{ fontSize:12, color:'#9ca3af', margin:0, fontWeight:500 }}>{L.view} →</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <footer style={{ background:'#060614', borderTop:'1px solid rgba(255,255,255,0.06)', padding:'20px 24px', textAlign:'center' }}>
        <p style={{ color:'rgba(255,255,255,0.25)', fontSize:12.5 }}>© 2026 Zirva LLC</p>
      </footer>
    </div>
  )
}
