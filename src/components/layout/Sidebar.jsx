import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Avatar from '../ui/Avatar'
import {
  LayoutDashboard, Sparkles, BookOpen, Calendar, CalendarDays, ClipboardList,
  ClipboardCheck, MessageSquare, MessagesSquare, User, FileText, BarChart2,
  Clock, Users, GraduationCap, School, Megaphone, Award, Building, Settings,
  Bell, LogOut, X, HeartHandshake, ShieldCheck, FileBarChart, AlertTriangle,
  ArrowLeftRight, PenLine, TrendingUp, UserPlus, CalendarOff, DoorOpen,
  Library, CalendarCheck, BookMarked, FolderOpen, ChevronRight, Flame
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
      { icon: ShieldCheck,     path: '/superadmin/adminler',  label: 'Adminlər' },
    ],
  },
]

// ── Component ────────────────────────────────────────────────────────────────
export default function Sidebar({ open, onClose }) {
  const { profile, signOut, t } = useAuth()
  const navigate = useNavigate()

  const role = profile?.role
  const groups =
    role === 'student'     ? studentGroups
    : role === 'teacher'   ? teacherGroups
    : role === 'parent'    ? parentGroups
    : role === 'admin'     ? getAdminGroups(profile, t)
    : role === 'super_admin' ? superAdminGroups
    : []

  // Role dial: student/parent read HIGH (a touch airier + sanctioned warmth chip);
  // teacher/admin read MEDIUM→LOW (denser, no playful chip).
  const playful = role === 'student' || role === 'parent'

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
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(30,34,51,0.30)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed top-0 left-0 h-full z-50 flex flex-col bg-surface transition-transform duration-200 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          width: 248,
          borderRight: '1px solid var(--hairline)',
        }}
      >
        <style>{`
          aside nav::-webkit-scrollbar { width: 6px; }
          aside nav::-webkit-scrollbar-track { background: transparent; }
          aside nav::-webkit-scrollbar-thumb { background: var(--hairline-strong); border-radius: 999px; }
          .nav-item {
            transition: background .12s ease, color .12s ease;
          }
          .nav-item:not(.is-active):hover {
            background: rgba(20,22,40,.04);
            color: var(--ink-900);
          }
          .nav-item:not(.is-active):hover .nav-icon { color: var(--ink-900); }
        `}</style>

        {/* Logo / brand */}
        <div
          className="flex items-center justify-between px-5 flex-shrink-0"
          style={{ height: 60, borderBottom: '1px solid var(--hairline)' }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-9 h-9 rounded-input flex items-center justify-center flex-shrink-0"
              style={{
                background: 'var(--brand-500)',
                boxShadow: '0 1px 2px rgba(20,22,40,.08)',
              }}
            >
              <img src="/logo.png" alt="Zirva" width="18" height="18" className="object-contain brightness-0 invert" />
            </div>
            <div className="min-w-0">
              <span
                className="font-display block leading-tight"
                style={{ color: 'var(--ink-900)', fontWeight: 800, fontSize: 18, letterSpacing: '-0.01em' }}
              >
                Zirva
              </span>
              {profile?.school?.name && (
                <span
                  className="text-[10.5px] truncate block leading-tight max-w-[150px]"
                  style={{ color: 'var(--ink-400)' }}
                >
                  {profile.school.name}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-chip transition-colors flex-shrink-0"
            style={{ color: 'var(--ink-600)' }}
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 overflow-y-auto px-3 ${playful ? 'py-4' : 'py-3'}`}>
          {resolvedGroups.map((group, gi) => (
            <div key={gi} className={gi > 0 ? (playful ? 'mt-5' : 'mt-4') : ''}>
              <p
                className="px-3 mb-1.5 select-none"
                style={{
                  fontSize: '11px',
                  letterSpacing: '0.04em',
                  color: 'var(--ink-400)',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}
              >
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `nav-item relative flex items-center gap-3 px-3 rounded-chip ${
                        isActive ? 'is-active' : ''
                      }`
                    }
                    style={({ isActive }) => ({
                      height: 34,
                      fontSize: 13.5,
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? 'var(--brand-700)' : 'var(--ink-600)',
                      background: isActive ? 'var(--brand-50)' : 'transparent',
                    })}
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon
                          className="nav-icon shrink-0"
                          style={{
                            width: 18,
                            height: 18,
                            color: isActive ? 'var(--brand-700)' : 'var(--ink-400)',
                          }}
                        />
                        <span className="truncate flex-1">{item.label}</span>
                        {item.badge != null && item.badge > 0 && (
                          <span
                            className="ml-auto inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full text-[11px] font-semibold"
                            style={{
                              background: isActive ? 'var(--brand-100)' : 'var(--surface-2)',
                              color: isActive ? 'var(--brand-700)' : 'var(--ink-600)',
                              fontVariantNumeric: 'tabular-nums',
                            }}
                          >
                            {item.badge > 99 ? '99+' : item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="px-3 py-3 flex-shrink-0" style={{ borderTop: '1px solid var(--hairline)' }}>
          {/* Streak / onboarding chip — sanctioned warmth for student & parent only */}
          {playful && (
            <div
              className="flex items-center gap-2.5 px-3 py-2 rounded-tile mb-2"
              style={{ background: 'rgba(255,90,31,0.07)' }}
            >
              <span
                className="w-7 h-7 rounded-pill flex items-center justify-center flex-shrink-0 flame-grad"
                style={{ boxShadow: '0 1px 3px -1px rgba(255,90,31,0.40)' }}
              >
                <Flame className="w-3.5 h-3.5 text-white" />
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className="font-display leading-tight"
                  style={{ color: '#C2410C', fontWeight: 700, fontSize: 13, fontVariantNumeric: 'tabular-nums' }}
                >
                  {profile?.streak_count ?? 0} {t('day_streak') || 'gün'}
                </p>
                <p className="text-[10.5px] leading-tight" style={{ color: '#9A3412' }}>
                  {t('keep_it_up') || 'Davam et!'}
                </p>
              </div>
            </div>
          )}

          <div
            className="flex items-center gap-3 px-2 py-2 rounded-tile mb-1"
            style={{ background: 'var(--surface-2)' }}
          >
            <Avatar
              name={profile?.full_name}
              color={profile?.avatar_color}
              size={36}
              ring={false}
            />
            <div className="min-w-0 flex-1">
              <p
                className="text-[13px] font-semibold truncate leading-tight"
                style={{ color: 'var(--ink-900)' }}
              >
                {profile?.full_name}
              </p>
              <p
                className="text-[11px] capitalize leading-tight mt-0.5"
                style={{ color: 'var(--ink-400)' }}
              >
                {t(profile?.role)}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-chip text-[13px] font-medium transition-colors"
            style={{ color: 'var(--ink-600)' }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--danger)'
              e.currentTarget.style.background = 'var(--danger-tint, #FEE2E2)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--ink-600)'
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {t('sign_out')}
          </button>
        </div>
      </aside>
    </>
  )
}
