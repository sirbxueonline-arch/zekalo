import * as m from '../lib.mjs';

const sweep = 'Sürüşdürün →';
const web = 'zirva.az';

export const carousels = [

/* ════════ 01 · Overview ════════ */
{
  title: 'Zirva+',
  footer: 'Zirva+',
  slides: [
    {
      type: 'cover', theme: 'gradient-hero',
      eyebrow: 'Zirva+ Platforması',
      headline: 'Məktəbinizi <em>növbəti pilləyə</em> qaldırın.',
      subhead: 'IB dünya məktəbləri və Azərbaycan dövlət məktəbləri üçün — bir platforma, hər şey.',
      preview: ['📚 Kurikulum', '✦ Zəka AI', '🎓 Qiymətləndirmə', '📊 Analitika', '+ 12'],
    },
    {
      type: 'features', theme: 'cream',
      eyebrow: 'Hər şey bir yerdə',
      headline: 'Lazım olan hər şey. Lazım olmayan heç nə.',
      subhead: 'Parçalanmış alətləri bir platformayla əvəz edin.',
      features: [
        { icon: 'book',     iconStyle: 'purple-ico', title: 'Kurikulum',     desc: 'IB + milli standartlar bir yerdə.' },
        { icon: 'sparkles', iconStyle: 'teal',       title: 'Zəka AI',       desc: 'Şagird, müəllim, admin üçün AI.' },
        { icon: 'award',    iconStyle: 'gold',       title: 'Qiymətləndirmə', desc: 'A–D şkalası və 10 ballıq sistem.' },
        { icon: 'file',     iconStyle: 'coral',      title: 'Hesabatlar',    desc: 'Avtomatik, nazirlik uyğun.' },
        { icon: 'calendar', iconStyle: 'mint',       title: 'Davamiyyət',    desc: 'Bir toxunuşla, ani bildirişlər.' },
        { icon: 'chart',    iconStyle: 'purple-ico', title: 'Analitika',     desc: 'Real vaxt dashboard və trendlər.' },
      ],
    },
    {
      type: 'list', theme: 'white',
      eyebrow: '5 kurikulum · 1 platforma',
      headline: 'Hər məktəb çərçivəsi<br>dəstəklənir.',
      items: [
        { icon: 'cap',  iconStyle: 'teal',  title: 'IB Dünya Məktəbləri', hint: 'PYP · MYP · DP · CP — tam dəstək' },
        { icon: 'building', iconStyle: 'gold',  title: 'Azərbaycan Milli Kurikulum', hint: 'Nazirlik inteqrasiyası, 10 ballıq sistem' },
        { icon: 'globe', iconStyle: 'coral', title: 'Beynəlxalq Bakalavr', hint: 'CIS, BSO standartları — tam uyğunluq' },
        { icon: 'lightbulb', title: 'Çox Kurikulumlu', hint: 'Bir məktəbdə bir neçə çərçivə — problem deyil' },
      ],
    },
    {
      type: 'stats', theme: 'dark',
      eyebrow: 'Rəqəmlər',
      headline: 'Məktəblərin seçimi.',
      stats: [
        { label: 'Kurikulum', value: '5+', note: 'IB + milli + beynəlxalq' },
        { label: 'Dil',       value: '3',  note: 'Az · En · Ru' },
        { label: 'Təcrübə',   value: '2+ il', note: 'Canlı məktəblərdə' },
      ],
    },
    {
      type: 'cta', theme: 'gradient-hero',
      eyebrow: 'Başlayaq',
      headline: 'Zirva+ ilə <em>tanış olun</em>.',
      subhead: 'Pulsuz demo — məktəbiniz üçün 30 dəqiqə.',
      cta: { label: 'Demo tələb et', style: 'gold' },
      footerRight: web,
    },
  ],
},

/* ════════ 02 · Zəka AI ════════ */
{
  title: 'Zəka AI',
  slides: [
    {
      type: 'cover', theme: 'gradient-hero',
      eyebrow: 'Zəka AI',
      headline: '<em>Zəka</em> ilə dərs<br>yeni səviyyəyə çıxır.',
      subhead: 'Şagirdlər öyrənir. Müəllimlər öyrədir. Zəka hər ikisini gücləndirir.',
      preview: ['Claude AI ilə', 'Az / En / Ru', 'Şagird · Müəllim · Admin'],
    },
    {
      type: 'mockup', theme: 'cream',
      eyebrow: 'Şagird rejimi',
      headline: 'Dərs boyu köməkçi.',
      subhead: 'Ev tapşırığından imtahan hazırlığına — fərdi köməklik.',
      mockup: m.chat([
        { role: 'user', text: 'Kvadrat tənlikləri necə həll edim?' },
        { role: 'zeka', text: 'ax²+bx+c=0 formasında. Üç əsas üsul var: çarpanlara ayırma, tam kvadrat və diskriminant. Hansından başlayaq?' },
        { role: 'user', text: 'Diskriminantdan başlayaq.' },
      ]),
    },
    {
      type: 'mockup', theme: 'white',
      eyebrow: 'Müəllim rejimi',
      headline: 'Həftəlik hesabat<br>20 dəqiqədə.',
      subhead: 'Avtomatik generasiya — sən yalnız təsdiq edirsən.',
      mockup: m.report(),
    },
    {
      type: 'stats', theme: 'dark-deep',
      eyebrow: 'Təsir',
      headline: 'Rəqəmlər özü danışır.',
      stats: [
        { label: 'Hesabat vaxtı', value: '4h → 20m', note: 'Həftəlik hesabat üçün' },
        { label: 'Planlama',     value: '3×',  note: 'Daha sürətli dərs planlaması' },
        { label: 'Məmnuniyyət',  value: '98%', note: 'Şagird məmnuniyyəti' },
      ],
    },
    {
      type: 'cta', theme: 'gradient-hero',
      eyebrow: 'Bu gün başla',
      headline: 'Zəkanı <em>sinifinizə</em> gətirin.',
      subhead: 'Zəka AI bütün Zirva+ planlarında daxildir.',
      cta: { label: 'Zəka ilə tanış ol', style: 'gold' },
      footerRight: web,
    },
  ],
},

/* ════════ 03 · Kurikulum ════════ */
{
  title: 'Kurikulum',
  slides: [
    {
      type: 'cover', theme: 'cream',
      eyebrow: 'Kurikulum Planlaması',
      headline: '<em>Hər kurikulum</em><br>üçün hazır.',
      subhead: 'IB dünya məktəblərindən milli məktəblərə — bir platforma.',
      preview: ['IB PYP', 'IB MYP', 'IB DP', 'IB CP', 'Milli'],
    },
    {
      type: 'mockup', theme: 'white',
      eyebrow: 'IB proqramları',
      headline: 'IB-nin hər mərhələsi.',
      mockup: m.ib(),
    },
    {
      type: 'features', theme: 'purple-wash',
      eyebrow: 'Planlama alətləri',
      headline: 'Birgə planla.<br>Daha az ziddiyyət.',
      features: [
        { icon: 'users',  iconStyle: 'purple-ico', title: 'Birgə planlama',     desc: 'Müəllimlər eyni vaxtda işləyir.' },
        { icon: 'target', iconStyle: 'teal',       title: '600+ standart',      desc: 'Daxili standart kataloqu.' },
        { icon: 'check',  iconStyle: 'gold',       title: 'Uyğunluq yoxlama',   desc: 'Plan avtomatik yoxlanır.' },
        { icon: 'link',   iconStyle: 'coral',      title: 'IBIS inteqrasiyası', desc: 'İmtahan qeydiyyatı, e-kurs.' },
      ],
    },
    {
      type: 'mockup', theme: 'mint',
      eyebrow: 'Milli kurikulum',
      headline: 'Dövlət məktəbləri üçün.',
      subhead: 'Təhsil Nazirliyi ilə tam inteqrasiya.',
      mockup: m.rows('Milli Kurikulum — 10-A', [
        { letter: '1', name: 'Azərbaycan tarixi — fəsil 4', tag: 'planlı' },
        { letter: '2', iconStyle: 'teal', name: 'Riyaziyyat — tənliklər', tag: 'planlı' },
        { letter: '3', iconStyle: 'gold', name: 'Fizika — mexanika', tag: 'planlı' },
        { letter: '4', iconStyle: 'coral', name: 'İngilis dili — esse', tag: 'hazırlıqda' },
      ]),
    },
    {
      type: 'cta', theme: 'dark',
      eyebrow: 'Hər kurikulum',
      headline: 'Bir platforma.<br><em>Bir yerdə.</em>',
      subhead: 'Məktəbinizə uyğun kurikulum ilə qurulub.',
      cta: { label: 'Demo tələb et', style: 'gold' },
      footerRight: web,
    },
  ],
},

/* ════════ 04 · Qiymətləndirmə ════════ */
{
  title: 'Qiymətləndirmə',
  slides: [
    {
      type: 'cover', theme: 'gradient-hero',
      eyebrow: 'Qiymətləndirmə',
      headline: '<em>Ədalətli,</em><br>şəffaf qiymətləndirmə.',
      subhead: 'IB A–D şkalası və milli 10 ballıq sistemi — real vaxtda sinxron.',
    },
    {
      type: 'mockup', theme: 'white',
      eyebrow: 'İki sistem — bir panel',
      headline: 'IB + Milli. Eyni anda.',
      subhead: 'Qiymət girilir, hər iki sistem avtomatik yenilənir.',
      mockup: m.grading(),
    },
    {
      type: 'features', theme: 'cream',
      eyebrow: 'Qiymətləndirmə alətləri',
      headline: 'Daha az iş. Daha çox təsir.',
      features: [
        { icon: 'edit',   iconStyle: 'purple-ico', title: 'Esse rəyi AI',     desc: 'Rubrikaya əsaslanan dəyərləndirmə.' },
        { icon: 'trend',  iconStyle: 'teal',       title: 'İrəliləyiş izləmə', desc: 'Şagird trayektoriyası real vaxtda.' },
        { icon: 'chart',  iconStyle: 'gold',       title: 'Sinif analitikası', desc: 'Zəif mövzular avtomatik görünür.' },
        { icon: 'award',  iconStyle: 'coral',      title: 'Obyektiv qiymət',  desc: 'Şəxsi qərəzdən azad sistem.' },
      ],
    },
    {
      type: 'list', theme: 'purple-wash',
      eyebrow: 'Nə dəstəklənir',
      headline: 'Hər standart dəstəklənir.',
      items: [
        { icon: 'check', iconStyle: 'teal',  title: 'IB kriteriyaları (A–D, 1–8)',     hint: 'PYP / MYP / DP / CP' },
        { icon: 'check', iconStyle: 'gold',  title: 'Azərbaycan 10 ballıq qiymət',    hint: 'Nazirlik standartı' },
        { icon: 'check', iconStyle: 'purple-ico', title: 'Formativ və summativ',      hint: 'İki növ qiymət — tam təhlil' },
        { icon: 'check', iconStyle: 'coral', title: 'Valideyn portalı',              hint: 'Şagird irəliləyişi real vaxtda' },
      ],
    },
    {
      type: 'cta', theme: 'dark-deep',
      eyebrow: 'Başlayaq',
      headline: '<em>Daha ağıllı</em><br>qiymətləndirmə.',
      subhead: 'Pulsuz demo — 30 dəqiqə.',
      cta: { label: 'Demo tələb et', style: 'gold' },
      footerRight: web,
    },
  ],
},

/* ════════ 05 · Hesabatlar ════════ */
{
  title: 'Hesabatlar',
  slides: [
    {
      type: 'cover', theme: 'gradient-hero',
      eyebrow: 'Avtomatik Hesabatlar',
      headline: '<em>4 saatlıq iş</em><br>20 dəqiqəyə.',
      subhead: 'Zəka AI hesabatı qurur. Sən təsdiq edirsən.',
    },
    {
      type: 'mockup', theme: 'cream',
      eyebrow: 'Tək kliklə',
      headline: 'Hesabat bir neçə saniyədə.',
      subhead: 'Qiymət, davamiyyət, qeyd — hamısı avtomatik birləşdirilir.',
      mockup: m.report(),
    },
    {
      type: 'features', theme: 'white',
      eyebrow: 'Formatlar və ixrac',
      headline: 'Hər formatda. Hər yerə.',
      features: [
        { icon: 'file',  iconStyle: 'coral',      title: 'PDF',           desc: 'Çap üçün hazır sənəd.' },
        { icon: 'chart', iconStyle: 'teal',       title: 'Excel',         desc: 'Analiz üçün cədvəl.' },
        { icon: 'building', iconStyle: 'gold',    title: 'Nazirlik formatı', desc: 'E-Gov.az avtomatik ixrac.' },
        { icon: 'award', iconStyle: 'purple-ico', title: 'IB Audit',       desc: 'Beynəlxalq auditə hazır.' },
      ],
    },
    {
      type: 'stats', theme: 'dark',
      eyebrow: 'Təsir',
      headline: 'Hesabat vaxtınızı geri al.',
      stats: [
        { label: 'Həftəlik',  value: '20 dəq', note: 'Əvvəl 4 saat idi' },
        { label: 'Semestrlik', value: '1 saat',  note: 'Əvvəl 2 gün çəkirdi' },
        { label: 'İllik',     value: '3 saat', note: 'Əvvəl 1 həftə' },
      ],
    },
    {
      type: 'cta', theme: 'gradient-hero',
      eyebrow: 'Bu gün başla',
      headline: 'Saatlarınızı <em>geri al</em>.',
      cta: { label: 'Demo tələb et', style: 'gold' },
      footerRight: web,
    },
  ],
},

/* ════════ 06 · Davamiyyət ════════ */
{
  title: 'Davamiyyət',
  slides: [
    {
      type: 'cover', theme: 'mint',
      eyebrow: 'Davamiyyət',
      headline: '<em>Bir toxunuşla</em><br>davamiyyət.',
      subhead: 'Sinifdə, mobil, real vaxtda — dərhal valideynə bildiriş.',
    },
    {
      type: 'mockup', theme: 'white',
      eyebrow: 'Sinif rejimi',
      headline: 'Sinif başlayan kimi hazır.',
      mockup: m.attendance(),
    },
    {
      type: 'features', theme: 'cream',
      eyebrow: 'Necə işləyir',
      headline: 'Sürətli. Şəffaf. Avtomatik.',
      features: [
        { icon: 'zap',    iconStyle: 'purple-ico', title: 'Tək toxunuş', desc: '10 saniyədən az vaxt.' },
        { icon: 'bell',   iconStyle: 'coral',      title: 'Ani bildiriş', desc: 'Valideynə dərhal çatır.' },
        { icon: 'trend',  iconStyle: 'teal',       title: 'Trend analitikası', desc: 'Problem görünən kimi.' },
        { icon: 'building', iconStyle: 'gold',     title: 'E-Gov ixrac', desc: 'Nazirlik hesabatı avtomatik.' },
      ],
    },
    {
      type: 'list', theme: 'purple-wash',
      eyebrow: 'Valideynlər üçün',
      headline: 'Valideyn həmişə<br>xəbərdar.',
      items: [
        { icon: 'bell', iconStyle: 'coral', title: 'Ani bildiriş SMS / push ilə', hint: 'Sinifdən 1 dəqiqə sonra' },
        { icon: 'calendar', iconStyle: 'purple-ico', title: 'Aylıq davamiyyət trendi', hint: 'Qrafik və analiz' },
        { icon: 'message', iconStyle: 'teal', title: 'Müəllimlə birbaşa əlaqə', hint: 'Bir kliklə görüş təyin edin' },
      ],
    },
    {
      type: 'cta', theme: 'dark',
      eyebrow: 'Başla',
      headline: '<em>Daha az qaçırılan dərs.</em>',
      subhead: 'Valideyn + müəllim + şagird — bir sistem.',
      cta: { label: 'Demo tələb et', style: 'gold' },
      footerRight: web,
    },
  ],
},

/* ════════ 07 · Kommunikasiya ════════ */
{
  title: 'Kommunikasiya',
  slides: [
    {
      type: 'cover', theme: 'gradient-hero',
      eyebrow: 'Kommunikasiya',
      headline: 'Valideyn. Müəllim.<br><em>Şagird.</em>',
      subhead: 'Bir zəncir. Hamısı bir yerdə. Real vaxtda.',
    },
    {
      type: 'mockup', theme: 'cream',
      eyebrow: 'Real vaxt mesajlaşma',
      headline: 'Müəllim–valideyn<br>sürətli əlaqə.',
      mockup: m.comms(),
    },
    {
      type: 'features', theme: 'white',
      eyebrow: 'Nələr edə bilərsiniz',
      headline: 'Hər şey bir platformada.',
      features: [
        { icon: 'message',  iconStyle: 'purple-ico', title: 'Birbaşa mesaj',    desc: 'Müəllim–valideyn real vaxt.' },
        { icon: 'bell',     iconStyle: 'coral',      title: 'Məktəb elanları',  desc: 'Bütün valideynlərə eyni anda.' },
        { icon: 'globe',    iconStyle: 'teal',       title: 'Çoxdilli',         desc: 'Az / En / Ru — avtomatik.' },
        { icon: 'calendar', iconStyle: 'gold',       title: 'Görüş planlaşdırma', desc: 'Valideyn görüşləri bir kliklə.' },
      ],
    },
    {
      type: 'list', theme: 'purple-wash',
      eyebrow: 'Niyə vacibdir',
      headline: 'Güclü əlaqə — güclü məktəb.',
      items: [
        { icon: 'users', iconStyle: 'purple-ico', title: 'Valideyn iştirakı artır', hint: '+34% daha aktiv valideyn' },
        { icon: 'target', iconStyle: 'teal',      title: 'Şagird problemi erkən görünür', hint: 'Problem böyüməzdən həll' },
        { icon: 'clock',  iconStyle: 'gold',      title: 'Müəllim vaxtı qorunur',     hint: 'Telefon deyil, platforma' },
      ],
    },
    {
      type: 'cta', theme: 'dark-deep',
      eyebrow: 'Bu gün',
      headline: 'İcmanı <em>birləşdirin</em>.',
      subhead: 'Valideyn, müəllim, şagird — bir platforma.',
      cta: { label: 'Demo tələb et', style: 'gold' },
      footerRight: web,
    },
  ],
},

/* ════════ 08 · Təhlükəsizlik ════════ */
{
  title: 'Təhlükəsizlik',
  slides: [
    {
      type: 'cover', theme: 'dark-deep',
      eyebrow: 'Təhlükəsizlik & Uyğunluq',
      headline: 'Məlumatlarınız<br><em>yerli qalır</em>.',
      subhead: 'ISO 27001, GDPR, Azərbaycan hosting. Təsdiqlənmiş.',
    },
    {
      type: 'mockup', theme: 'cream',
      eyebrow: 'Təhlükəsizlik paneli',
      headline: 'Sertifikatlı, yerli, qorunur.',
      mockup: m.security(),
    },
    {
      type: 'features', theme: 'white',
      eyebrow: 'Standartlar',
      headline: 'Beynəlxalq səviyyədə.',
      features: [
        { icon: 'shield',   iconStyle: 'teal',       title: 'ISO/IEC 27001',   desc: 'Məlumat təhlükəsizliyi sertifikatı.' },
        { icon: 'globe',    iconStyle: 'purple-ico', title: 'GDPR uyğun',      desc: 'Avropa məlumat qaydaları.' },
        { icon: 'building', iconStyle: 'gold',       title: 'AZ Məlumat Qanunu', desc: 'Yerli qanunlara tam uyğun.' },
        { icon: 'lock',     iconStyle: 'coral',      title: 'Şifrələnmiş',     desc: 'Hərəkətdə + saxlamada — AES-256.' },
      ],
    },
    {
      type: 'list', theme: 'purple-wash',
      eyebrow: 'Əlavə qoruyucular',
      headline: 'Təkrarlanan qoruma.',
      items: [
        { icon: 'clock',  iconStyle: 'purple-ico', title: '24/7 təhlükəsizlik izləməsi', hint: 'Təhdid tanıma real vaxtda' },
        { icon: 'shield', iconStyle: 'teal',       title: 'Fəlakət bərpa planları',     hint: '4 saat daxilində bərpa' },
        { icon: 'users',  iconStyle: 'gold',       title: 'Giriş nəzarəti',             hint: 'Rol əsaslı — hər kəs yalnız lazım olanı görür' },
        { icon: 'file',   iconStyle: 'coral',      title: 'Audit jurnalları',           hint: 'Hər əməliyyat qeydə alınır' },
      ],
    },
    {
      type: 'cta', theme: 'dark',
      eyebrow: 'Güvənli başla',
      headline: 'Məlumatlarınız <em>qorunur</em>.',
      subhead: 'Uyğunluq sənədləri satış görüşündə təqdim olunur.',
      cta: { label: 'Demo tələb et', style: 'gold' },
      footerRight: web,
    },
  ],
},

/* ════════ 09 · İnteqrasiyalar ════════ */
{
  title: 'İnteqrasiyalar',
  slides: [
    {
      type: 'cover', theme: 'gradient-hero',
      eyebrow: 'İnteqrasiyalar',
      headline: 'Sevdiyiniz<br>alətlərlə <em>birləşir</em>.',
      subhead: 'IBIS, E-Gov, ASAN, Claude — artmaqda.',
    },
    {
      type: 'mockup', theme: 'white',
      eyebrow: 'Partnyorlar',
      headline: 'Rəsmi inteqrasiyalar.',
      mockup: m.integrations(),
    },
    {
      type: 'features', theme: 'cream',
      eyebrow: 'Platforma',
      headline: 'Açıq ekosistem.',
      features: [
        { icon: 'link',   iconStyle: 'purple-ico', title: 'API ilə genişlənə bilir', desc: 'Özəl sistemlərlə birləşir.' },
        { icon: 'zap',    iconStyle: 'teal',       title: 'Avtomatik sinxron', desc: 'Real vaxt məlumat axını.' },
        { icon: 'shield', iconStyle: 'gold',       title: 'Təhlükəsiz OAuth', desc: 'Hər inteqrasiya sertifikatlı.' },
        { icon: 'globe',  iconStyle: 'coral',      title: 'Beynəlxalq və yerli', desc: 'IB + Azərbaycan eyni anda.' },
      ],
    },
    {
      type: 'list', theme: 'purple-wash',
      eyebrow: 'Hansı sistemlər',
      headline: 'Bu gün aktivdir.',
      items: [
        { icon: 'sparkles', iconStyle: 'purple-ico', title: 'Claude AI',       hint: 'Zəka AI motoru' },
        { icon: 'building', iconStyle: 'gold',       title: 'E-Gov.az',        hint: 'Avtomatik hesabat ixracı' },
        { icon: 'users',    iconStyle: 'teal',       title: 'ASAN xidmət',     hint: 'Vahid identifikasiya' },
        { icon: 'cap',      iconStyle: 'coral',      title: 'IBIS / IBO',      hint: 'IB imtahan, e-kurs, CAS' },
      ],
    },
    {
      type: 'cta', theme: 'dark-deep',
      eyebrow: 'Başlayaq',
      headline: '<em>Birlik</em> güclü məktəbdir.',
      subhead: 'Məktəbinizin alətləri ilə uyğunluğu birgə yoxlayaq.',
      cta: { label: 'Demo tələb et', style: 'gold' },
      footerRight: web,
    },
  ],
},

/* ════════ 10 · Analitika ════════ */
{
  title: 'Analitika',
  slides: [
    {
      type: 'cover', theme: 'gradient-hero',
      eyebrow: 'Analitika',
      headline: 'Məlumatla <em>idarə et</em>.',
      subhead: 'Sinif performansı, müəllim yükü, davamiyyət anomaliyaları — real vaxtda.',
    },
    {
      type: 'mockup', theme: 'cream',
      eyebrow: 'Sinif dashboard-u',
      headline: 'Hər sinif. Hər fənn.',
      mockup: m.progress('Sinif irəliləyişi — 10-A', [
        { name: 'Riyaziyyat', value: '82%', pct: '82%', color: '' },
        { name: 'Fizika',      value: '74%', pct: '74%', color: 'teal' },
        { name: 'İngilis dili', value: '91%', pct: '91%', color: 'gold' },
        { name: 'Biologiya',  value: '68%', pct: '68%', color: '' },
      ]),
    },
    {
      type: 'features', theme: 'white',
      eyebrow: 'Admin alətləri',
      headline: 'Məktəbi bir ekranda.',
      features: [
        { icon: 'chart', iconStyle: 'purple-ico', title: 'Sinif performansı',   desc: 'Fənn, müəllim, dövr üzrə.' },
        { icon: 'users', iconStyle: 'teal',       title: 'Müəllim iş yükü',     desc: 'Kim çox yüklənib — anında.' },
        { icon: 'bell',  iconStyle: 'coral',      title: 'Davamiyyət anomaliyaları', desc: 'AI problemi öncədən görür.' },
        { icon: 'trend', iconStyle: 'gold',       title: 'İllik trendlər',      desc: 'Məktəb tərəqqisi — uzun dövr.' },
      ],
    },
    {
      type: 'stats', theme: 'dark',
      eyebrow: 'Daha ağıllı qərarlar',
      headline: 'Data danışır.',
      stats: [
        { label: 'Real vaxt',   value: '100%', note: 'Gecikməsiz məlumat' },
        { label: 'Dashboardlar', value: '40+',  note: 'Hazır şablon' },
        { label: 'Rol',          value: '5',    note: 'Admin / müəllim / valideyn ...' },
      ],
    },
    {
      type: 'cta', theme: 'gradient-hero',
      eyebrow: 'Başla',
      headline: '<em>Daha ağıllı</em> məktəb.',
      subhead: 'Zirva+ analitikası — bütün planlarda daxildir.',
      cta: { label: 'Demo tələb et', style: 'gold' },
      footerRight: web,
    },
  ],
},

];
