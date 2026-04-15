import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Avatar from '../ui/Avatar'
import {
  LayoutDashboard, Sparkles, BookOpen, Calendar, CalendarDays, ClipboardList,
  ClipboardCheck, MessageSquare, MessagesSquare, User, FileText, BarChart2,
  Clock, Users, GraduationCap, School, Megaphone, Award, Building, Settings,
  Bell, LogOut, X, HeartHandshake, ShieldCheck, FileBarChart, AlertTriangle,
  ArrowLeftRight, PenLine, TrendingUp
} from 'lucide-react'

const studentNav = [
  { icon: LayoutDashboard, path: '/dashboard', key: 'dashboard' },
  { icon: Sparkles, path: '/zeka', key: 'zeka_ai' },
  { icon: BookOpen, path: '/qiymetler', key: 'grades' },
  { icon: Calendar, path: '/davamiyyet', key: 'attendance' },
  { icon: ClipboardList, path: '/tapshiriqlar', key: 'assignments' },
  { icon: PenLine, path: '/ev-tapshiriqlari', label: 'Ev Tapşırıqları' },
  { icon: ClipboardCheck, path: '/imtahanlar', label: 'İmtahanlar' },
  { icon: TrendingUp, path: '/teraqqi', label: 'Tərəqqim' },
  { icon: CalendarDays, path: '/tedbirler', label: 'Tədbirlər' },
  { icon: MessageSquare, path: '/mesajlar', key: 'messages' },
  { icon: User, path: '/profil', key: 'profile' },
]

const teacherNav = [
  { icon: LayoutDashboard, path: '/muellim/dashboard', key: 'dashboard' },
  { icon: BookOpen, path: '/muellim/jurnal', key: 'gradebook' },
  { icon: Calendar, path: '/muellim/davamiyyet', key: 'attendance' },
  { icon: ClipboardCheck, path: '/muellim/imtahanlar', label: 'İmtahanlar' },
  { icon: AlertTriangle, path: '/muellim/intizam', label: 'İntizam' },
  { icon: Sparkles, path: '/muellim/zeka', key: 'zeka_ai' },
  { icon: ClipboardList, path: '/muellim/tapshiriqlar', key: 'assignments' },
  { icon: MessagesSquare, path: '/muellim/yazismalar', label: 'Yazışmalar' },
  { icon: MessageSquare, path: '/muellim/mesajlar', key: 'messages' },
  { icon: FileText, path: '/muellim/hesabatlar', key: 'reports' },
  { icon: BarChart2, path: '/muellim/analitika', key: 'analytics' },
  { icon: Clock, path: '/muellim/cedvel', key: 'timetable' },
  { icon: CalendarDays, path: '/muellim/tedbirler', label: 'Tədbirlər' },
  { icon: User, path: '/muellim/profil', key: 'profile' },
]

const parentNav = [
  { icon: LayoutDashboard, path: '/valideyn/dashboard', key: 'dashboard' },
  { icon: BookOpen, path: '/valideyn/qiymetler', key: 'grades' },
  { icon: Calendar, path: '/valideyn/davamiyyet', key: 'attendance' },
  { icon: ClipboardList, path: '/valideyn/tapshiriqlar', key: 'assignments' },
  { icon: ClipboardCheck, path: '/valideyn/imtahanlar', label: 'İmtahanlar' },
  { icon: TrendingUp, path: '/valideyn/teraqqi', label: 'Tərəqqi' },
  { icon: MessagesSquare, path: '/valideyn/yazismalar', label: 'Yazışmalar' },
  { icon: MessageSquare, path: '/valideyn/mesajlar', key: 'messages' },
  { icon: Bell, path: '/valideyn/bildirisler', key: 'notifications' },
  { icon: CalendarDays, path: '/valideyn/tedbirler', label: 'Tədbirlər' },
  { icon: User, path: '/valideyn/profil', key: 'profile' },
]

function getAdminNav(profile, t) {
  const nav = [
    { icon: LayoutDashboard, path: '/admin/dashboard', label: t('dashboard') },
    { icon: Users, path: '/admin/shagirdler', label: t('students') },
    { icon: GraduationCap, path: '/admin/muelimler', label: t('teachers') },
    { icon: HeartHandshake, path: '/admin/valideyinler', label: t('parents') },
    { icon: School, path: '/admin/sinifler', label: t('classes') },
    { icon: Clock, path: '/admin/cedvel', label: t('timetable') },
    { icon: ClipboardCheck, path: '/admin/imtahanlar', label: 'İmtahanlar' },
    { icon: AlertTriangle, path: '/admin/intizam', label: 'İntizam' },
    { icon: ArrowLeftRight, path: '/admin/evezetme', label: 'Əvəzetmə' },
    { icon: FileBarChart, path: '/admin/sehadetname', label: 'Şəhadətnamə' },
    { icon: TrendingUp, path: '/admin/teraqqi', label: 'Tərəqqi' },
    { icon: FileText, path: '/admin/hesabatlar', label: t('reports') },
    { icon: BarChart2, path: '/admin/analitika', label: t('analytics') },
    { icon: Megaphone, path: '/admin/mesajlar', label: t('announcements') },
    { icon: CalendarDays, path: '/admin/tedbirler', label: 'Tədbirlər' },
  ]
  if (profile?.school?.edition === 'ib') {
    nav.push({ icon: Award, path: '/admin/ib', label: t('ib_panel') })
  }
  if (profile?.school?.edition === 'government') {
    nav.push({ icon: Building, path: '/admin/nazirlik', label: t('ministry') })
  }
  nav.push({ icon: Settings, path: '/admin/parametrler', label: t('settings') })
  return nav
}

const superAdminNav = [
  { icon: LayoutDashboard, path: '/superadmin/dashboard', label: 'İdarəetmə' },
  { icon: School, path: '/superadmin/mektebler', label: 'Məktəblər' },
]

export default function Sidebar({ open, onClose }) {
  const { profile, signOut, t } = useAuth()
  const navigate = useNavigate()

  const rawNav = profile?.role === 'student' ? studentNav
    : profile?.role === 'teacher' ? teacherNav
    : profile?.role === 'parent' ? parentNav
    : profile?.role === 'admin' ? getAdminNav(profile, t)
    : profile?.role === 'super_admin' ? superAdminNav
    : []

  const navItems = rawNav.map(item => ({
    ...item,
    label: item.label || t(item.key),
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
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-border-soft z-50 flex flex-col transition-transform duration-200 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-soft">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Zirva" width="24" height="24" className="object-contain" />
            <span className="font-serif text-xl text-gray-900 tracking-tight">Zirva</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-gray-600 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {navItems.map((item) => (
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
                  {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-purple rounded-r" />}
                  <item.icon className={`w-5 h-5 shrink-0 ${isActive ? '' : 'text-gray-400'}`} />
                  <span className="truncate">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="border-t border-border-soft px-4 py-3">
          <div className="flex items-center gap-3 mb-2.5">
            <Avatar name={profile?.full_name} color={profile?.avatar_color} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate leading-tight">{profile?.full_name}</p>
              <p className="text-xs text-gray-400 capitalize">{t(profile?.role)}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-red-500 transition-colors w-full px-1 py-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            {t('sign_out')}
          </button>
        </div>
      </aside>
    </>
  )
}

