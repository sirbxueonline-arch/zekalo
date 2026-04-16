import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Avatar from '../ui/Avatar'
import {
  LayoutDashboard, Sparkles, BookOpen, Calendar, CalendarDays, ClipboardList,
  ClipboardCheck, MessageSquare, MessagesSquare, User, FileText, BarChart2,
  Clock, Users, GraduationCap, School, Megaphone, Award, Building, Settings,
  Bell, LogOut, X, HeartHandshake, ShieldCheck, FileBarChart, AlertTriangle,
  ArrowLeftRight, PenLine, TrendingUp, UserPlus, CalendarOff, DoorOpen,
  Library, CalendarCheck, BookMarked, FolderOpen
} from 'lucide-react'

// ── Admin nav sections ───────────────────────────────────────────────────────
function getAdminGroups(profile, t) {
  const groups = [
    {
      label: 'Genel',
      items: [
        { icon: LayoutDashboard, path: '/admin/dashboard', label: t('dashboard') },
      ],
    },
    {
      label: 'Akademik',
      items: [
        { icon: Users,          path: '/admin/shagirdler', label: t('students') },
        { icon: GraduationCap,  path: '/admin/muelimler',  label: t('teachers') },
        { icon: HeartHandshake, path: '/admin/valideyinler', label: t('parents') },
        { icon: School,         path: '/admin/sinifler',   label: t('classes') },
        { icon: BookOpen,       path: '/admin/jurnal',     label: t('gradebook') },
        { icon: Clock,          path: '/admin/cedvel',     label: t('timetable') },
        { icon: ClipboardCheck, path: '/admin/imtahanlar', label: 'İmtahanlar' },
      ],
    },
    {
      label: 'Davranış',
      items: [
        { icon: AlertTriangle,  path: '/admin/intizam',    label: 'İntizam' },
        { icon: ArrowLeftRight, path: '/admin/evezetme',   label: 'Əvəzetmə' },
      ],
    },
    {
      label: 'İdarəetmə',
      items: [
        { icon: UserPlus,       path: '/admin/kabul',      label: 'Qəbul' },
        { icon: CalendarOff,    path: '/admin/izin',       label: 'İzin Sorğuları' },
        { icon: DoorOpen,       path: '/admin/oda-rezerv', label: 'Otaq Rezervi' },
        { icon: Library,        path: '/admin/kitabxana',  label: 'Kitabxana' },
        { icon: ClipboardList,  path: '/admin/anket',      label: 'Anketlər' },
        { icon: CalendarCheck,  path: '/admin/ptc',        label: 'Valideyn Görüşü' },
      ],
    },
    {
      label: 'İletişim',
      items: [
        { icon: Megaphone,      path: '/admin/mesajlar',   label: t('announcements') },
        { icon: CalendarDays,   path: '/admin/tedbirler',  label: 'Tədbirlər' },
      ],
    },
    {
      label: 'Raporlar',
      items: [
        { icon: FileText,       path: '/admin/hesabatlar', label: t('reports') },
        { icon: BarChart2,      path: '/admin/analitika',  label: t('analytics') },
        { icon: FileBarChart,   path: '/admin/sehadetname', label: 'Şəhadətnamə' },
        { icon: TrendingUp,     path: '/admin/teraqqi',    label: 'Tərəqqi' },
      ],
    },
  ]

  if (profile?.school?.edition === 'ib') {
    groups.push({
      label: 'IB',
      items: [
        { icon: Award,          path: '/admin/ib',         label: t('ib_panel') },
        { icon: Award,          path: '/admin/cas',        label: 'CAS' },
        { icon: GraduationCap,  path: '/admin/kollec',     label: 'Kollec Məsləhəti' },
      ],
    })
  }
  if (profile?.school?.edition === 'government') {
    groups.push({
      label: 'Nazirlik',
      items: [
        { icon: Building, path: '/admin/nazirlik', label: t('ministry') },
      ],
    })
  }

  groups.push({
    label: 'Sistem',
    items: [
      { icon: Settings, path: '/admin/parametrler', label: t('settings') },
    ],
  })

  return groups
}

// ── Role nav lists (flat) ────────────────────────────────────────────────────
const studentGroups = [
  {
    label: 'Genel',
    items: [
      { icon: LayoutDashboard, path: '/dashboard',          key: 'dashboard' },
      { icon: Sparkles,        path: '/zeka',               key: 'zeka_ai' },
    ],
  },
  {
    label: 'Akademik',
    items: [
      { icon: BookOpen,        path: '/qiymetler',          key: 'grades' },
      { icon: Calendar,        path: '/davamiyyet',         key: 'attendance' },
      { icon: ClipboardList,   path: '/tapshiriqlar',       key: 'assignments' },
      { icon: PenLine,         path: '/ev-tapshiriqlari',   label: 'Ev Tapşırıqları' },
      { icon: ClipboardCheck,  path: '/imtahanlar',         label: 'İmtahanlar' },
      { icon: TrendingUp,      path: '/teraqqi',            label: 'Tərəqqim' },
      { icon: FolderOpen,      path: '/portfolio',          label: 'Portfoliom' },
    ],
  },
  {
    label: 'İletişim',
    items: [
      { icon: CalendarDays,    path: '/tedbirler',          label: 'Tədbirlər' },
      { icon: MessageSquare,   path: '/mesajlar',           key: 'messages' },
      { icon: User,            path: '/profil',             key: 'profile' },
    ],
  },
]

const teacherGroups = [
  {
    label: 'Genel',
    items: [
      { icon: LayoutDashboard, path: '/muellim/dashboard',   key: 'dashboard' },
    ],
  },
  {
    label: 'Akademik',
    items: [
      { icon: BookOpen,        path: '/muellim/jurnal',      key: 'gradebook' },
      { icon: Calendar,        path: '/muellim/davamiyyet',  key: 'attendance' },
      { icon: ClipboardCheck,  path: '/muellim/imtahanlar',  label: 'İmtahanlar' },
      { icon: ClipboardList,   path: '/muellim/tapshiriqlar',key: 'assignments' },
      { icon: Clock,           path: '/muellim/cedvel',      key: 'timetable' },
    ],
  },
  {
    label: 'Davranış',
    items: [
      { icon: AlertTriangle,   path: '/muellim/intizam',     label: 'İntizam' },
    ],
  },
  {
    label: 'İletişim',
    items: [
      { icon: MessagesSquare,  path: '/muellim/yazismalar',  label: 'Yazışmalar' },
      { icon: MessageSquare,   path: '/muellim/mesajlar',    key: 'messages' },
      { icon: CalendarDays,    path: '/muellim/tedbirler',   label: 'Tədbirlər' },
    ],
  },
  {
    label: 'Planlaşdırma',
    items: [
      { icon: BookMarked,      path: '/muellim/vahid-plan',  label: 'Vahid Planı' },
    ],
  },
  {
    label: 'Raporlar',
    items: [
      { icon: FileText,        path: '/muellim/hesabatlar',  key: 'reports' },
      { icon: BarChart2,       path: '/muellim/analitika',   key: 'analytics' },
    ],
  },
  {
    label: 'Sistem',
    items: [
      { icon: Sparkles,        path: '/muellim/zeka',        key: 'zeka_ai' },
      { icon: User,            path: '/muellim/profil',      key: 'profile' },
    ],
  },
]

const parentGroups = [
  {
    label: 'Genel',
    items: [
      { icon: LayoutDashboard, path: '/valideyn/dashboard',    key: 'dashboard' },
    ],
  },
  {
    label: 'Akademik',
    items: [
      { icon: BookOpen,        path: '/valideyn/qiymetler',    key: 'grades' },
      { icon: Calendar,        path: '/valideyn/davamiyyet',   key: 'attendance' },
      { icon: ClipboardList,   path: '/valideyn/tapshiriqlar', key: 'assignments' },
      { icon: ClipboardCheck,  path: '/valideyn/imtahanlar',   label: 'İmtahanlar' },
      { icon: TrendingUp,      path: '/valideyn/teraqqi',      label: 'Tərəqqi' },
    ],
  },
  {
    label: 'İletişim',
    items: [
      { icon: MessagesSquare,  path: '/valideyn/yazismalar',   label: 'Yazışmalar' },
      { icon: MessageSquare,   path: '/valideyn/mesajlar',     key: 'messages' },
      { icon: Bell,            path: '/valideyn/bildirisler',  key: 'notifications' },
      { icon: CalendarDays,    path: '/valideyn/tedbirler',    label: 'Tədbirlər' },
      { icon: User,            path: '/valideyn/profil',       key: 'profile' },
    ],
  },
]

const superAdminGroups = [
  {
    label: 'Genel',
    items: [
      { icon: LayoutDashboard, path: '/superadmin/dashboard', label: 'İdarəetmə' },
      { icon: School,          path: '/superadmin/mektebler', label: 'Məktəblər' },
    ],
  },
]

// ── Component ────────────────────────────────────────────────────────────────
export default function Sidebar({ open, onClose }) {
  const { profile, signOut, t } = useAuth()
  const navigate = useNavigate()

  const groups =
    profile?.role === 'student'     ? studentGroups
    : profile?.role === 'teacher'   ? teacherGroups
    : profile?.role === 'parent'    ? parentGroups
    : profile?.role === 'admin'     ? getAdminGroups(profile, t)
    : profile?.role === 'super_admin' ? superAdminGroups
    : []

  // Resolve labels: each item may have a `label` string or a `key` to translate
  const resolvedGroups = groups.map(g => ({
    ...g,
    items: g.items.map(item => ({
      ...item,
      label: item.label || t(item.key),
    })),
  }))

  async function handleSignOut() {
    await signOut()
    navigate('/daxil-ol')
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed top-0 left-0 h-full bg-white border-r border-border-soft z-50 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ width: 260 }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-soft flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Zirva" width="26" height="26" className="object-contain" />
            <span className="font-serif text-xl text-gray-900 tracking-tight">Zirva</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-surface transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {resolvedGroups.map((group, gi) => (
            <div key={gi}>
              {/* Section label */}
              <p className="px-3 mb-1.5 text-[10px] font-semibold tracking-widest text-gray-400 uppercase select-none">
                {group.label}
              </p>
              {/* Items */}
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                        isActive
                          ? 'bg-purple-light text-purple font-semibold'
                          : 'text-gray-600 hover:bg-surface hover:text-gray-900'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-purple rounded-r-full" />
                        )}
                        <item.icon
                          className={`w-[18px] h-[18px] shrink-0 ${
                            isActive ? 'text-purple' : 'text-gray-400'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
              {/* Divider between groups (skip last) */}
              {gi < resolvedGroups.length - 1 && (
                <div className="mt-4 border-t border-border-soft/60" />
              )}
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="border-t border-border-soft px-4 py-4 flex-shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <Avatar name={profile?.full_name} color={profile?.avatar_color} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate leading-tight">
                {profile?.full_name}
              </p>
              <p className="text-xs text-gray-400 capitalize">{t(profile?.role)}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-red-500 transition-colors w-full px-1 py-1 rounded-md hover:bg-red-50"
          >
            <LogOut className="w-3.5 h-3.5" />
            {t('sign_out')}
          </button>
        </div>
      </aside>
    </>
  )
}
