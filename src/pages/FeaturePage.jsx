import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, BookOpen, ClipboardCheck, Calendar, BarChart2, MessageSquare, Clock, Users, Sparkles } from 'lucide-react'
import { useLang } from '../contexts/LanguageContext'
import LandingNav from '../components/layout/LandingNav'
import Mascot from '../components/ui/Mascot'

/* ─── Feature data ─── */
const FEATURES = {
  curriculum: {
    icon: BookOpen,
    accent: '#574FCF',
    chip: 'periwinkle',
    glow: 'rgba(87,79,207,0.08)',
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
    accent: '#1D7FB8',
    chip: 'blue',
    glow: 'rgba(59,168,230,0.10)',
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
    accent: '#15803D',
    chip: 'mint',
    glow: 'rgba(31,168,85,0.10)',
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
    accent: '#B45309',
    chip: 'peach',
    glow: 'rgba(234,179,8,0.10)',
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
    accent: '#1D7FB8',
    chip: 'blue',
    glow: 'rgba(59,168,230,0.10)',
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
    accent: '#6D28D9',
    chip: 'grape',
    glow: 'rgba(124,92,224,0.09)',
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
    accent: '#574FCF',
    chip: 'periwinkle',
    glow: 'rgba(87,79,207,0.08)',
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
      <div style={{ background:'var(--canvas)', minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'var(--ink-900)', padding:'24px', textAlign:'center' }}>
        <Mascot pose="thinking" size={88} />
        <p className="font-display" style={{ fontSize:22, fontWeight:800, margin:'18px 0 20px', color:'var(--ink-900)' }}>{L.back.replace('←','').trim()} not found</p>
        <Link to="/features" className="btn-ghost-pastel">{L.back}</Link>
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

  // Split title for pastel-text accent on the last word
  const titleWords = content.title.split(' ')
  const titleLead = titleWords.slice(0, -1).join(' ')
  const titleTail = titleWords[titleWords.length - 1]

  return (
    <div style={{ minHeight:'100vh', background:'var(--canvas)' }}>
      <style>{`
        .fp-hl-item { transition: transform .15s var(--ease-out-quint), box-shadow .15s ease, border-color .15s ease; }
        .fp-hl-item:hover { transform: translateY(-2px); }
        .fp-related-card { transition: transform .15s var(--ease-out-quint), box-shadow .15s ease, border-color .15s ease; }
        .fp-related-card:hover { transform: translateY(-2px); }
        .fp-back-link { transition: color .15s ease; }
        @media(max-width:767px){
          .fp-body-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .fp-hero { padding-top: 110px !important; padding-bottom: 70px !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .fp-hl-item, .fp-related-card { transition: none !important; }
        }
      `}</style>

      <LandingNav s={s} lang={lang} setLang={setLang} lightHero />

      {/* ── Hero ── */}
      <section className="fp-hero" style={{
        position:'relative',
        overflow:'hidden',
        padding:'140px 24px 110px',
        textAlign:'center',
        background: 'var(--canvas)',
      }}>
        {/* Single static brand wash */}
        <div className="hb1" />

        <div style={{ position:'relative', zIndex:1, maxWidth:760, margin:'0 auto' }}>
          {/* Back link — its own line, left-aligned */}
          <div style={{ textAlign:'left', marginBottom:28 }}>
            <Link to="/features" className="fp-back-link" style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:13, fontWeight:600, color:'var(--ink-600)', textDecoration:'none' }}
              onMouseEnter={e=>e.currentTarget.style.color='var(--ink-900)'}
              onMouseLeave={e=>e.currentTarget.style.color='var(--ink-600)'}>
              {L.back}
            </Link>
          </div>

          {/* Icon badge — shared token chip */}
          <div style={{ display:'flex', justifyContent:'center' }}>
            <div className={`icon-chip icon-chip-${feature.chip}`} style={{
              width:64, height:64, borderRadius:14, marginBottom:26,
            }}>
              <Icon style={{ width:30, height:30 }}/>
            </div>
          </div>

          <h1 className="font-display" style={{ fontSize:'clamp(2.4rem,5.5vw,3.8rem)', fontWeight:800, color:'var(--ink-900)', lineHeight:1.08, letterSpacing:'-0.02em', marginBottom:18 }}>
            {titleLead && <>{titleLead} </>}
            <span className="pastel-text">{titleTail}</span>
          </h1>
          <p style={{ fontSize:'clamp(1.05rem,2vw,1.2rem)', color:'var(--ink-600)', lineHeight:1.7, maxWidth:560, margin:'0 auto 38px' }}>
            {content.subtitle}
          </p>

          <Link to="/contact" className="btn-pastel">
            {L.cta_btn} <ArrowRight style={{ width:16, height:16 }}/>
          </Link>
        </div>
      </section>

      {/* ── Body ── */}
      <section style={{ position:'relative', padding:'100px 24px', background:'var(--canvas)', overflow:'hidden' }}>
        <div className="section-blob" style={{ width:520, height:520, top:'-10%', left:'-10%', background:`radial-gradient(circle, ${feature.glow} 0%, transparent 70%)` }}/>
        <div className="section-blob" style={{ width:460, height:460, bottom:'-15%', right:'-8%', background:'radial-gradient(circle, rgba(87,79,207,0.06) 0%, transparent 70%)' }}/>

        <div className="fp-body-grid" style={{ position:'relative', zIndex:1, maxWidth:1040, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:56, alignItems:'start' }}>
          {/* Description */}
          <div className="liquid-card" style={{ padding:'36px 36px' }}>
            <p style={{ fontSize:'1.08rem', color:'var(--ink-700)', lineHeight:1.85, margin:0 }}>{content.body}</p>
          </div>

          {/* Highlights — numbered benefit rows */}
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {content.highlights.map((hl, i) => (
              <div key={i} className="fp-hl-item liquid-card" style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 18px', borderRadius:12 }}>
                <span className="font-display" style={{
                  width:30, height:30, borderRadius:8, flexShrink:0,
                  background:`${accent}1f`, color:accent,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:14, fontWeight:800, fontVariantNumeric:'tabular-nums',
                }}>
                  {i + 1}
                </span>
                <span style={{ fontSize:14.5, fontWeight:600, color:'var(--ink-900)' }}>{hl}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA strip — brand gradient panel with mascot ── */}
      <section style={{ position:'relative', padding:'100px 24px', overflow:'hidden', background:'var(--canvas)' }}>
        <div className="section-blob" style={{ width:600, height:600, top:'-30%', left:'50%', transform:'translateX(-50%)', background:`radial-gradient(circle, ${feature.glow} 0%, transparent 70%)` }}/>

        <div style={{ position:'relative', zIndex:1, maxWidth:680, margin:'0 auto' }}>
          <div style={{
            position:'relative', overflow:'hidden', textAlign:'center',
            padding:'52px 40px', borderRadius:18,
            background:'linear-gradient(135deg, var(--brand-600) 0%, var(--brand-500) 100%)',
            boxShadow:'0 12px 28px -10px rgba(20,22,40,.14)',
          }}>
            <div style={{ position:'relative', zIndex:1 }}>
              <div style={{ display:'flex', justifyContent:'center', marginBottom:8 }}>
                <Mascot pose="pointing" size={80}/>
              </div>
              <h2 className="font-display" style={{ fontSize:'clamp(1.75rem,3.4vw,2.4rem)', fontWeight:800, color:'#fff', marginBottom:14, letterSpacing:'-0.02em' }}>
                {L.cta_h}
              </h2>
              <p style={{ fontSize:15.5, color:'rgba(255,255,255,0.88)', marginBottom:30, lineHeight:1.7, maxWidth:440, marginLeft:'auto', marginRight:'auto' }}>{L.cta_sub}</p>
              <div style={{ display:'inline-flex', gap:12, flexWrap:'wrap', justifyContent:'center' }}>
                <Link to="/contact" className="btn-pastel" style={{ background:'#fff', color:'var(--brand-600)', boxShadow:'0 1px 2px rgba(20,22,40,.10)' }}>
                  {L.cta_btn} <ArrowRight style={{ width:16, height:16 }}/>
                </Link>
                <Link to="/features" className="btn-ghost-pastel" style={{ background:'rgba(255,255,255,0.14)', borderColor:'rgba(255,255,255,0.3)', color:'#fff' }}>
                  {L.related}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Related features ── */}
      <section style={{ padding:'90px 24px 110px', background:'var(--canvas)' }}>
        <div style={{ maxWidth:1040, margin:'0 auto' }}>
          <h3 className="font-display" style={{ fontSize:'1.5rem', fontWeight:800, color:'var(--ink-900)', marginBottom:32, letterSpacing:'-0.02em', textAlign:'center' }}>
            {L.related}
          </h3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:18 }}>
            {otherFeatures.map(([slug, feat]) => {
              const FeatIcon = feat.icon
              return (
                <Link key={slug} to={`/features/${slug}`} className="fp-related-card liquid-card"
                  style={{ display:'flex', flexDirection:'column', gap:14, padding:'22px', textDecoration:'none' }}>
                  <div className={`icon-chip icon-chip-${feat.chip}`}>
                    <FeatIcon style={{ width:20, height:20 }}/>
                  </div>
                  <div>
                    <p style={{ fontSize:14, fontWeight:700, color:'var(--ink-900)', margin:'0 0 4px' }}>{names[slug] || slug}</p>
                    <p style={{ fontSize:12.5, color:feat.accent, margin:0, fontWeight:600, display:'inline-flex', alignItems:'center', gap:4 }}>
                      {L.view} <ArrowRight style={{ width:11, height:11 }}/>
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <footer style={{ background:'var(--canvas)', borderTop:'1px solid var(--hairline)', padding:'24px', textAlign:'center' }}>
        <p style={{ color:'var(--ink-400)', fontSize:13, margin:0 }}>© 2026 Zirva LLC</p>
      </footer>
    </div>
  )
}
