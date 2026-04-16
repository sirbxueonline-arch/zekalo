import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { GradeBadge } from '../../components/ui/Badge'
import { PageSpinner } from '../../components/ui/Spinner'
import {
  Flame, Upload, FolderOpen, BookOpen, Calendar,
  ChevronRight, Clock, CheckSquare,
  ArrowRight, Bell,
} from 'lucide-react'

// ── Helpers ────────────────────────────────────────────────────────────────

function todayLabel() {
  return new Date().toLocaleDateString('az-AZ', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function todayWeekday() {
  return new Date().toLocaleDateString('az-AZ', { weekday: 'long' })
}

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`
}

function daysUntil(iso) {
  if (!iso) return null
  const now  = new Date()
  now.setHours(0, 0, 0, 0)
  const due  = new Date(iso)
  due.setHours(0, 0, 0, 0)
  return Math.round((due - now) / 86400000)
}

function timeAgo(iso) {
  if (!iso) return ''
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (diff < 60)    return `${diff} san. əvvəl`
  if (diff < 3600)  return `${Math.floor(diff / 60)} dəq. əvvəl`
  if (diff < 86400) return `${Math.floor(diff / 3600)} saat əvvəl`
  return `${Math.floor(diff / 86400)} gün əvvəl`
}

// ── Subject color palette (hex for inline styles) ──────────────────────────

const SUBJ_HEX = [
  '#534AB7', // purple
  '#1D9E75', // teal
  '#D97706', // amber
  '#2563EB', // blue
  '#DB2777', // pink
  '#EA580C', // orange
]

const SUBJ_LIGHT_HEX = [
  '#EEEDFE',
  '#E1F5EE',
  '#FEF3C7',
  '#DBEAFE',
  '#FCE7F3',
  '#FFEDD5',
]

function subjectHash(name = '') {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return Math.abs(h)
}

function subjectHexColor(name = '') {
  return SUBJ_HEX[subjectHash(name) % SUBJ_HEX.length]
}

function subjectLightHex(name = '') {
  return SUBJ_LIGHT_HEX[subjectHash(name) % SUBJ_LIGHT_HEX.length]
}

// ── DueDateChip ─────────────────────────────────────────────────────────────

function DueDateChip({ dueDate }) {
  const days = daysUntil(dueDate)
  if (days === null) return null

  if (days < 0) {
    return (
      <span className="flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-200 whitespace-nowrap">
        Gecikmiş
      </span>
    )
  }
  if (days === 0) {
    return (
      <span className="flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
        Bu gün!
      </span>
    )
  }
  if (days === 1) {
    return (
      <span className="flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-200 whitespace-nowrap">
        Sabah
      </span>
    )
  }
  return (
    <span className="flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full bg-surface text-gray-500 border border-border-soft whitespace-nowrap">
      {days} gün qaldı
    </span>
  )
}

// ── Notification dot color ───────────────────────────────────────────────────

function notifDotColor(type) {
  const map = {
    grade:      'bg-teal',
    assignment: 'bg-purple',
    attendance: 'bg-amber-400',
    message:    'bg-blue-400',
    system:     'bg-gray-400',
  }
  return map[type] || 'bg-gray-400'
}

// ── Current period detection ─────────────────────────────────────────────────

function isCurrentPeriod(slot) {
  if (!slot.start_time || !slot.end_time) return false
  const now = new Date()
  const [sh, sm] = slot.start_time.split(':').map(Number)
  const [eh, em] = slot.end_time.split(':').map(Number)
  const startMin = sh * 60 + sm
  const endMin   = eh * 60 + em
  const curMin   = now.getHours() * 60 + now.getMinutes()
  return curMin >= startMin && curMin <= endMin
}

function isPastPeriod(slot) {
  if (!slot.end_time) return false
  const now = new Date()
  const [eh, em] = slot.end_time.split(':').map(Number)
  const endMin = eh * 60 + em
  const curMin = now.getHours() * 60 + now.getMinutes()
  return curMin > endMin
}

// ── Color maps for quick actions ────────────────────────────────────────────

const colorBg = {
  purple: 'bg-purple-light',
  teal:   'bg-teal-light',
  blue:   'bg-blue-50',
  amber:  'bg-amber-50',
}

const colorIcon = {
  purple: 'text-purple',
  teal:   'text-teal',
  blue:   'text-blue-600',
  amber:  'text-amber-600',
}

// ── Assignment tab config ────────────────────────────────────────────────────

const ASSIGN_TABS = [
  { key: 'pending',   label: 'Gözləyən'  },
  { key: 'thisweek',  label: 'Bu həftə'  },
  { key: 'overdue',   label: 'Gecikmiş'  },
]

// ── Main component ───────────────────────────────────────────────────────────

export default function StudentDashboard() {
  const { profile } = useAuth()
  const navigate    = useNavigate()

  const [loading,       setLoading]       = useState(true)
  const [timetable,     setTimetable]     = useState([])
  const [allAssignments,setAllAssignments] = useState([])
  const [grades,        setGrades]        = useState([])
  const [notifications, setNotifications] = useState([])
  const [attPct,        setAttPct]        = useState(null)
  const [assignTab,     setAssignTab]     = useState('pending')

  useEffect(() => {
    if (!profile) return
    loadAll()
  }, [profile])

  async function loadAll() {
    try {
      // ── 1. Class IDs ─────────────────────────────────────────────────────
      const { data: memberData } = await supabase
        .from('class_members')
        .select('class_id')
        .eq('student_id', profile.id)
      const classIds = (memberData || []).map(c => c.class_id)

      const today    = new Date()
      const dayNum   = today.getDay()           // 0=Sun
      const todayStr = today.toISOString().split('T')[0]
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      const queries = [
        // Timetable for today
        classIds.length
          ? supabase
              .from('timetable_slots')
              .select('*, subject:subjects(name)')
              .in('class_id', classIds)
              .eq('day_of_week', dayNum)
              .eq('published', true)
              .order('period')
          : Promise.resolve({ data: [] }),

        // All upcoming + overdue assignments (broad window)
        classIds.length
          ? supabase
              .from('assignments')
              .select('*, subject:subjects(name)')
              .in('class_id', classIds)
              .order('due_date')
              .limit(50)
          : Promise.resolve({ data: [] }),

        // Last 4 grades
        supabase
          .from('grades')
          .select('*, subject:subjects(name), assessment:assessments(title)')
          .eq('student_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(4),

        // Last 4 notifications
        supabase
          .from('notifications')
          .select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(4),

        // Attendance summary (last 30 days)
        classIds.length
          ? supabase
              .from('attendance')
              .select('status')
              .in('class_id', classIds)
              .eq('student_id', profile.id)
              .gte('date', thirtyDaysAgo)
              .lte('date', todayStr)
          : Promise.resolve({ data: [] }),
      ]

      const [ttRes, assignRes, gradesRes, notifRes, attRes] = await Promise.all(queries)

      setTimetable(ttRes.data || [])
      setAllAssignments(assignRes.data || [])
      setGrades(gradesRes.data || [])
      setNotifications(notifRes.data || [])

      const attData = attRes.data || []
      if (attData.length) {
        const present = attData.filter(r => r.status === 'present').length
        setAttPct(Math.round((present / attData.length) * 100))
      }
    } catch (err) {
      console.error('Student dashboard error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <PageSpinner />

  const firstName = profile?.full_name?.split(' ')[0] || 'Şagird'

  // ── Computed values ────────────────────────────────────────────────────────

  const pendingAssignments = allAssignments.filter(a => {
    const days = daysUntil(a.due_date)
    return days !== null && days >= 0
  })

  const thisWeekAssignments = allAssignments.filter(a => {
    const days = daysUntil(a.due_date)
    return days !== null && days >= 0 && days <= 7
  })

  const overdueAssignments = allAssignments.filter(a => {
    const days = daysUntil(a.due_date)
    return days !== null && days < 0
  })

  const tabData = {
    pending:  pendingAssignments,
    thisweek: thisWeekAssignments,
    overdue:  overdueAssignments,
  }

  const pendingCount = pendingAssignments.length

  const avgStr = (() => {
    if (!grades.length) return '—'
    const nums = grades.map(g => Number(g.score)).filter(n => !isNaN(n))
    if (!nums.length) return '—'
    return (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1).replace('.', ',')
  })()

  const attStr = attPct !== null ? `${attPct}%` : '—'

  const quickActions = [
    { icon: Upload,    label: 'Tapşırıq Təhvil Ver', sub: `${pendingCount} gözləyir`,   path: '/tapshiriqlar', color: 'purple' },
    { icon: BookOpen,  label: 'Qiymətlərim',          sub: `Ortalama: ${avgStr}`,         path: '/qiymetler',    color: 'teal'   },
    { icon: Calendar,  label: 'Davamiyyət',            sub: `${attStr} iştirak`,           path: '/davamiyyet',   color: 'blue'   },
    { icon: FolderOpen,label: 'Portfelim',             sub: 'İşlərimi gör',                path: '/portfolio',    color: 'amber'  },
  ]

  return (
    <div className="space-y-6">

      {/* ── 1. Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-widest">{todayLabel()}</p>
          <h1 className="font-serif text-3xl text-gray-900 mt-0.5">Salam, {firstName}! 👋</h1>
        </div>
        {profile?.streak_count > 0 && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-xl">
            <Flame className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-semibold">{profile.streak_count} günlük zolaq!</span>
          </div>
        )}
      </div>

      {/* ── 2. Today's timetable strip ─────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-border-soft shadow-sm">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border-soft">
          <h2 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple" />
            Bugünkü Dərslər
          </h2>
          <span className="text-xs text-gray-400 capitalize">{todayWeekday()}</span>
        </div>

        {timetable.length === 0 ? (
          <div className="flex items-center justify-center py-8 gap-2 text-gray-400">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">Bu gün dərs yoxdur</span>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin px-5 py-4">
            <div className="flex gap-3" style={{ minWidth: 'max-content' }}>
              {timetable.map(slot => {
                const current = isCurrentPeriod(slot)
                const past    = !current && isPastPeriod(slot)
                const accent  = subjectHexColor(slot.subject?.name || '')
                const light   = subjectLightHex(slot.subject?.name || '')

                return (
                  <div
                    key={slot.id}
                    className={`
                      relative flex flex-col gap-1.5 rounded-xl px-4 py-3 w-36 flex-shrink-0 transition-all
                      ${current
                        ? 'ring-2 ring-purple shadow-md bg-white'
                        : past
                          ? 'bg-gray-50 opacity-60'
                          : 'bg-surface border border-border-soft'
                      }
                    `}
                  >
                    {/* Period badge */}
                    <div className="flex items-center justify-between">
                      <span
                        className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: accent }}
                      >
                        {slot.period}
                      </span>
                      {current && (
                        <span className="text-[10px] font-semibold text-purple bg-purple-light px-1.5 py-0.5 rounded-full">
                          İndi
                        </span>
                      )}
                    </div>

                    {/* Subject name */}
                    <p className={`text-sm font-semibold leading-tight truncate ${past ? 'text-gray-400' : 'text-gray-900'}`}>
                      {slot.subject?.name || 'Fənn'}
                    </p>

                    {/* Time + Room */}
                    <div className="flex flex-col gap-0.5">
                      {slot.start_time && slot.end_time && (
                        <p className="text-xs text-gray-400">
                          {slot.start_time.slice(0, 5)}–{slot.end_time.slice(0, 5)}
                        </p>
                      )}
                      {slot.room && (
                        <p className="text-xs text-gray-400">Otaq {slot.room}</p>
                      )}
                    </div>

                    {/* Bottom accent bar */}
                    <div
                      className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full"
                      style={{ backgroundColor: past ? '#e5e7eb' : accent, opacity: past ? 0.4 : 0.6 }}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── 3. Main 2-column layout ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── LEFT (8 cols) ───────────────────────────────────────────────── */}
        <div className="lg:col-span-8 space-y-6">

          {/* ─ Tapşırıqlar card ─────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-border-soft shadow-sm flex flex-col">
            {/* Card header + tabs */}
            <div className="px-5 pt-4 pb-0 border-b border-border-soft">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-purple" />
                  Tapşırıqlar
                </h2>
                <button
                  onClick={() => navigate('/tapshiriqlar')}
                  className="flex items-center gap-1 text-xs text-purple font-medium hover:opacity-75 transition-opacity"
                >
                  Hamısı <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1">
                {ASSIGN_TABS.map(tab => {
                  const count = tabData[tab.key]?.length || 0
                  const isOverdueTab = tab.key === 'overdue'
                  const active = assignTab === tab.key
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setAssignTab(tab.key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg text-xs font-medium transition-colors border-b-2 ${
                        active
                          ? 'text-purple border-purple bg-purple-light/40'
                          : 'text-gray-500 border-transparent hover:text-gray-700'
                      }`}
                    >
                      {tab.label}
                      {count > 0 && (
                        <span
                          className={`inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-[10px] font-bold px-1 ${
                            isOverdueTab
                              ? 'bg-red-500 text-white'
                              : 'bg-purple text-white'
                          }`}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Tab content */}
            {tabData[assignTab].length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center mb-3">
                  <CheckSquare className="w-5 h-5 text-gray-300" />
                </div>
                <p className="text-sm text-gray-400">
                  {assignTab === 'pending'  && 'Gözləyən tapşırıq yoxdur'}
                  {assignTab === 'thisweek' && 'Bu həftə tapşırıq yoxdur'}
                  {assignTab === 'overdue'  && 'Gecikmiş tapşırıq yoxdur'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border-soft">
                {tabData[assignTab].slice(0, 5).map(a => (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-surface/50 transition-colors border-l-4"
                    style={{ borderLeftColor: subjectHexColor(a.subject?.name || '') }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{
                            background: subjectLightHex(a.subject?.name || ''),
                            color:      subjectHexColor(a.subject?.name || ''),
                          }}
                        >
                          {a.subject?.name || 'Fənn'}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 truncate">{a.title}</p>
                    </div>
                    <DueDateChip dueDate={a.due_date} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ─ Son Qiymətlər card ────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-border-soft shadow-sm flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-soft">
              <h2 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-teal" />
                Son Qiymətlər
              </h2>
              <button
                onClick={() => navigate('/qiymetler')}
                className="flex items-center gap-1 text-xs text-purple font-medium hover:opacity-75 transition-opacity"
              >
                Hamısı <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {grades.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center mb-3">
                  <BookOpen className="w-5 h-5 text-gray-300" />
                </div>
                <p className="text-sm text-gray-400">Hələ qiymət yoxdur</p>
              </div>
            ) : (
              <div className="divide-y divide-border-soft">
                {grades.map((g, i) => (
                  <div
                    key={g.id || i}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-surface/50 transition-colors"
                  >
                    {/* Subject color dot */}
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: subjectHexColor(g.subject?.name || '') }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {g.subject?.name || 'Fənn'}
                      </p>
                      {g.assessment?.title && (
                        <p className="text-xs text-gray-400 truncate">{g.assessment.title}</p>
                      )}
                    </div>
                    <GradeBadge score={Number(g.score)} />
                    <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                      {formatDate(g.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT (4 cols) ──────────────────────────────────────────────── */}
        <div className="lg:col-span-4 space-y-5">

          {/* ─ Quick Actions ─────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-border-soft shadow-sm">
            <div className="px-5 py-4 border-b border-border-soft">
              <h2 className="font-semibold text-gray-900 text-sm">Sürətli Keçid</h2>
            </div>
            <div className="p-3 space-y-2">
              {quickActions.map(a => (
                <button
                  key={a.path}
                  onClick={() => navigate(a.path)}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border-soft bg-white hover:shadow-sm hover:border-purple/20 transition-all text-left w-full"
                >
                  <span className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colorBg[a.color]}`}>
                    <a.icon className={`w-4 h-4 ${colorIcon[a.color]}`} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900">{a.label}</p>
                    <p className="text-xs text-gray-400 truncate">{a.sub}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 ml-auto flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* ─ Bildirişlər ───────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-border-soft shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-soft">
              <h2 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                <Bell className="w-4 h-4 text-purple" />
                Bildirişlər
              </h2>
              {notifications.some(n => !n.read) && (
                <span className="w-2 h-2 rounded-full bg-red-500" />
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center px-5">
                <Bell className="w-6 h-6 text-gray-200 mb-2" />
                <p className="text-xs text-gray-400">Yeni bildiriş yoxdur</p>
              </div>
            ) : (
              <div className="divide-y divide-border-soft">
                {notifications.map((n, i) => (
                  <div
                    key={n.id || i}
                    className={`flex items-start gap-3 px-5 py-3 transition-colors ${n.read ? '' : 'bg-purple-light/20'}`}
                  >
                    <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${notifDotColor(n.type)}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 leading-snug line-clamp-2">
                        {n.message || n.title || 'Bildiriş'}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{timeAgo(n.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
