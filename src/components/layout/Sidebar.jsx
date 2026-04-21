import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Avatar from '../ui/Avatar'
import {
  LayoutDashboard, Sparkles, BookOpen, Calendar, CalendarDays, ClipboardList,
  ClipboardCheck, MessageSquare, MessagesSquare, User, FileText, BarChart2,
  Clock, Users, GraduationCap, School, Megaphone, Award, Building, Settings,
  Bell, LogOut, X, HeartHandshake, ShieldCheck, FileBarChart, AlertTriangle,
  ArrowLeftRight, PenLine, TrendingUp, UserPlus, CalendarOff, DoorOpen,
  Library, CalendarCheck, BookMarked, FolderOpen, ChevronRight
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
        { icon: BookOpen,       path: '/admin/fenler',     label: t('subjects') },
        { icon: Clock,          path: '/admin/cedvel',     label: t('timetable') },
        { icon: ClipboardCheck, path: '/admin/imtahanlar', label: t('exams') },
      ],
    },
    {
      label: 'Davranış',
      items: [
        { icon: AlertTriangle,  path: '/admin/intizam',    label: t('discipline') },
        { icon: ArrowLeftRight, path: '/admin/evezetme',   label: t('substitutions') },
      ],
    },
    {
      label: 'İdarəetmə',
      items: [
        { icon: UserPlus,       path: '/admin/kabul',      label: t('admissions') },
        { icon: CalendarOff,    path: '/admin/izin',       label: t('leave_requests') },
        { icon: DoorOpen,       path: '/admin/oda-rezerv', label: t('room_booking') },
        { icon: Library,        path: '/admin/kitabxana',  label: t('library') },
        { icon: ClipboardList,  path: '/admin/anket',      label: t('surveys') },
        { icon: CalendarCheck,  path: '/admin/ptc',        label: t('pt_conferences') },
      ],
    },
    {
      label: 'İletişim',
      items: [
        { icon: Megaphone,      path: '/admin/mesajlar',   label: t('announcements') },
        { icon: CalendarDays,   path: '/admin/tedbirler',  label: t('events') },
      ],
    },
    {
      label: 'Raporlar',
      items: [
        { icon: FileText,       path: '/admin/hesabatlar', label: t('reports') },
        { icon: BarChart2,      path: '/admin/analitika',  label: t('analytics') },
        { icon: FileBarChart,   path: '/admin/sehadetname', label: t('report_cards') },
        { icon: TrendingUp,     path: '/admin/teraqqi',    label: t('progress') },
      ],
    },
  ]

  if (profile?.school?.edition === 'ib') {
    groups.push({
      label: 'IB',
      items: [
        { icon: Award,          path: '/admin/ib',         label: t('ib_panel') },
        { icon: Award,          path: '/admin/cas',        label: 'CAS' },
        { icon: GraduationCap,  path: '/admin/kollec',     label: t('college_counseling') },
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

// ── Role nav lists ────────────────────────────────────────────────────────────
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
      { icon: PenLine,         path: '/ev-tapshiriqlari',   key: 'homework' },
      { icon: ClipboardCheck,  path: '/imtahanlar',         key: 'exams' },
      { icon: TrendingUp,      path: '/teraqqi',            key: 'my_progress' },
      { icon: FolderOpen,      path: '/portfolio',          key: 'portfolio' },
    ],
  },
  {
    label: 'İletişim',
    items: [
      { icon: CalendarDays,    path: '/tedbirler',          key: 'events' },
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
      { icon: School,          path: '/muellim/sinifler',    key: 'my_classes' },
      { icon: BookOpen,        path: '/muellim/jurnal',      key: 'gradebook' },
      { icon: Calendar,        path: '/muellim/davamiyyet',  key: 'attendance' },
      { icon: ClipboardCheck,  path: '/muellim/imtahanlar',  key: 'exams' },
      { icon: ClipboardList,   path: '/muellim/tapshiriqlar',key: 'assignments' },
      { icon: Clock,           path: '/muellim/cedvel',      key: 'timetable' },
    ],
  },
  {
    label: 'Davranış',
    items: [
      { icon: AlertTriangle,   path: '/muellim/intizam',     key: 'discipline' },
    ],
  },
  {
    label: 'İletişim',
    items: [
      { icon: MessagesSquare,  path: '/muellim/yazismalar',  key: 'conversations' },
      { icon: MessageSquare,   path: '/muellim/mesajlar',    key: 'messages' },
      { icon: CalendarDays,    path: '/muellim/tedbirler',   key: 'events' },
    ],
  },
  {
    label: 'Planlaşdırma',
    items: [
      { icon: BookMarked,      path: '/muellim/vahid-plan',  key: 'unit_plan' },
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
      { icon: ClipboardCheck,  path: '/valideyn/imtahanlar',   key: 'exams' },
      { icon: TrendingUp,      path: '/valideyn/teraqqi',      key: 'progress' },
    ],
  },
  {
    label: 'İletişim',
    items: [
      { icon: MessagesSquare,  path: '/valideyn/yazismalar',   key: 'conversations' },
      { icon: MessageSquare,   path: '/valideyn/mesajlar',     key: 'messages' },
      { icon: Bell,            path: '/valideyn/bildirisler',  key: 'notifications' },
      { icon: CalendarDays,    path: '/valideyn/tedbirler',    key: 'events' },
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
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm" onClick={onClose} />
      )}
      <aside
        className={`fixed top-0 left-0 h-full z-50 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          width: 256,
          background: '#111827',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Logo / brand */}
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg,#6d28d9,#4f46e5)' }}>
              <img src="/logo.png" alt="Zirva" width="18" height="18" className="object-contain brightness-0 invert" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-base text-white tracking-tight leading-tight block">Zirva</span>
              {profile?.school?.name && (
                <span className="text-[10px] truncate block leading-tight max-w-[140px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {profile.school.name}
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg transition-colors flex-shrink-0" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4" style={{ scrollbarWidth: 'none' }}>
          <style>{`aside nav::-webkit-scrollbar { display: none; }`}</style>
          {resolvedGroups.map((group, gi) => (
            <div key={gi} className={gi > 0 ? 'mt-5' : ''}>
              <p className="px-3 mb-1.5 text-[10px] font-bold tracking-widest uppercase select-none" style={{ color: 'rgba(255,255,255,0.25)' }}>
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `relative flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 group ${
                        isActive ? 'active-nav-item' : 'inactive-nav-item'
                      }`
                    }
                    style={({ isActive }) => isActive
                      ? { background: 'rgba(109,40,217,0.25)', color: '#c4b5fd' }
                      : { color: 'rgba(255,255,255,0.55)' }
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full" style={{ background: '#a78bfa' }} />
                        )}
                        <item.icon
                          className="shrink-0"
                          style={{
                            width: 16, height: 16,
                            color: isActive ? '#a78bfa' : 'rgba(255,255,255,0.35)',
                          }}
                        />
                        <span className="truncate">{item.label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="px-3 py-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg mb-1" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ backgroundColor: profile?.avatar_color || '#6d28d9' }}
            >
              {profile?.full_name
                ? profile.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
                : '?'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold truncate leading-tight" style={{ color: 'rgba(255,255,255,0.9)' }}>
                {profile?.full_name}
              </p>
              <p className="text-[10px] capitalize leading-tight mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{t(profile?.role)}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-150"
            style={{ color: 'rgba(255,255,255,0.4)' }}
            onMouseEnter={e => { e.currentTarget.style.color='#f87171'; e.currentTarget.style.background='rgba(239,68,68,0.08)' }}
            onMouseLeave={e => { e.currentTarget.style.color='rgba(255,255,255,0.4)'; e.currentTarget.style.background='transparent' }}
          >
            <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
            {t('sign_out')}
          </button>
        </div>
      </aside>
    </>
  )
}
