import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Badge, { GradeBadge } from '../../components/ui/Badge'
import { PageSpinner } from '../../components/ui/Spinner'
import Avatar from '../../components/ui/Avatar'
import EmptyState from '../../components/ui/EmptyState'
import {
  Users, BookOpen, Calendar, Bell, MessageSquare,
  Clock, ClipboardList, GraduationCap, ChevronRight,
} from 'lucide-react'
import { todayFull } from '../../lib/dateUtils'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayLabel() {
  return todayFull()
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('az-AZ', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

function formatRelativeTime(iso) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'İndi'
  if (mins < 60) return `${mins} dəq əvvəl`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} saat əvvəl`
  const days = Math.floor(hrs / 24)
  return `${days} gün əvvəl`
}

// Avatar background colour — derived from name
const AVATAR_COLORS = ['#534AB7', '#1D9E75', '#D97706', '#2563EB', '#DB2777', '#EA580C']
function avatarColor(name = '') {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}

// Subject badge hex colour
const HEX_COLORS = ['#534AB7', '#1D9E75', '#D97706', '#2563EB', '#DB2777', '#EA580C']
function subjectHex(n = '') {
  let h = 0
  for (let i = 0; i < n.length; i++) h = n.charCodeAt(i) + ((h << 5) - h)
  return HEX_COLORS[Math.abs(h) % HEX_COLORS.length]
}

// Notification icon meta
function notifIcon(type) {
  switch (type) {
    case 'grade':      return { icon: GraduationCap, cls: 'bg-purple-light text-purple' }
    case 'absence':    return { icon: Calendar,      cls: 'bg-red-50 text-red-500' }
    case 'message':    return { icon: MessageSquare, cls: 'bg-blue-50 text-blue-500' }
    case 'assignment': return { icon: ClipboardList, cls: 'bg-teal-light text-teal' }
    default:           return { icon: Bell,          cls: 'bg-surface text-gray-400' }
  }
}

// Due-date countdown chip (inline, no separate component)
function DueDateChip({ dueDateIso }) {
  if (!dueDateIso) return null
  const due = new Date(dueDateIso)
  due.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffDays = Math.round((due - today) / 86400000)

  if (diffDays < 0) {
    return (
      <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 whitespace-nowrap">
        gecikmiş
      </span>
    )
  }
  if (diffDays === 0) {
    return (
      <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
        bu gün
      </span>
    )
  }
  if (diffDays <= 3) {
    return (
      <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
        {diffDays} gün
      </span>
    )
  }
  return (
    <span className="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full bg-surface text-gray-500 border border-border-soft whitespace-nowrap">
      {diffDays} gün
    </span>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ParentDashboard() {
  const { profile, t } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [children, setChildren] = useState([])
  const [selectedChild, setSelectedChild] = useState(null)
  const [childData, setChildData] = useState({})
  const [notifications, setNotifications] = useState([])

  // ── Data fetching (unchanged queries) ──────────────────────────────────────

  useEffect(() => {
    if (!profile) return
    loadChildren()
  }, [profile])

  useEffect(() => {
    if (!selectedChild) return
    loadChildData(selectedChild)
  }, [selectedChild])

  async function loadChildren() {
    const { data } = await supabase
      .from('parent_children')
      .select('child:profiles!child_id(*, school:schools(*))')
      .eq('parent_id', profile.id)

    const kids = (data || []).map(d => d.child).filter(Boolean)
    setChildren(kids)
    if (kids.length > 0) setSelectedChild(kids[0])

    const { data: notifData } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(10)

    setNotifications(notifData || [])
    if (!kids.length) setLoading(false)
  }

  async function loadChildData(child) {
    setLoading(true)
    const today = new Date().getDay()
    const now = new Date().toISOString()

    // Class memberships
    const { data: memberData } = await supabase
      .from('class_members')
      .select('class:classes(id, name)')
      .eq('student_id', child.id)

    const classes = (memberData || []).map(m => m.class).filter(Boolean)
    const classIds = classes.map(c => c.id)
    const className = classes[0]?.name || null

    // This-week bounds for attendance
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1)
    weekStart.setHours(0, 0, 0, 0)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999)

    const [gradesRes, attRes, weekAttRes, timetableRes, upcomingRes] = await Promise.all([
      supabase
        .from('grades')
        .select('*, subject:subjects(name)')
        .eq('student_id', child.id)
        .order('date', { ascending: false })
        .limit(6),

      supabase
        .from('attendance')
        .select('status')
        .eq('student_id', child.id),

      supabase
        .from('attendance')
        .select('status')
        .eq('student_id', child.id)
        .gte('date', weekStart.toISOString().split('T')[0])
        .lte('date', weekEnd.toISOString().split('T')[0]),

      classIds.length
        ? supabase
            .from('timetable_slots')
            .select('*, subject:subjects(name)')
            .in('class_id', classIds)
            .eq('day_of_week', today)
            .eq('published', true)
            .order('period')
        : { data: [] },

      classIds.length
        ? supabase
            .from('assignments')
            .select('*, subject:subjects(name)')
            .in('class_id', classIds)
            .gte('due_date', now)
            .order('due_date')
            .limit(5)
        : { data: [] },
    ])

    const grades = gradesRes.data || []
    const att = attRes.data || []
    const present = att.filter(a => a.status === 'present').length
    const attendancePct = att.length ? Math.round((present / att.length) * 100) : 0
    const daysPresent = (weekAttRes.data || []).filter(a => a.status === 'present').length
    const lastGrade = grades[0] || null

    setChildData({
      className,
      grades,
      attendancePct,
      daysPresent,
      lastGrade,
      timetable: timetableRes.data || [],
      upcomingAssignments: upcomingRes.data || [],
    })
    setLoading(false)
  }

  // ── Guard states ───────────────────────────────────────────────────────────

  if (loading && !children.length) return <PageSpinner />

  if (children.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Uşaq tapılmadı"
        description="Hesabınıza bağlı uşaq məlumatı yoxdur."
      />
    )
  }

  // ── Derived values ─────────────────────────────────────────────────────────

  const firstName = profile?.full_name?.split(' ')[0] || ''

  const lastGradeScore = childData.lastGrade
    ? (childData.lastGrade.max_score > 0
        ? Math.round((childData.lastGrade.score / childData.lastGrade.max_score) * 10)
        : childData.lastGrade.score)
    : null

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Compact header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-widest">{todayLabel()}</p>
          <h1 className="font-serif text-3xl text-gray-900 mt-0.5">{t('welcome_back')}, {firstName}!</h1>
        </div>
      </div>

      {/* ── Child selector pill tabs (only when >1 child) ──────────────────── */}
      {children.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {children.map(child => (
            <button
              key={child.id}
              onClick={() => setSelectedChild(child)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-colors whitespace-nowrap ${
                selectedChild?.id === child.id
                  ? 'border-purple bg-purple-light text-purple'
                  : 'border-border-soft text-gray-500 hover:bg-surface bg-white'
              }`}
            >
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                style={{ backgroundColor: avatarColor(child.full_name) }}
              >
                {child.full_name?.charAt(0)}
              </span>
              {child.full_name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <PageSpinner />
      ) : (
        <>
          {/* ── Child summary card ────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-border-soft shadow-sm p-5">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
                style={{ backgroundColor: avatarColor(selectedChild?.full_name || '') }}
              >
                {selectedChild?.full_name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-gray-900">{selectedChild?.full_name}</h2>
                <p className="text-sm text-gray-500">
                  {[childData.className, selectedChild?.school?.name].filter(Boolean).join(' · ')}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {/* Attendance percentage chip */}
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${
                      childData.attendancePct >= 90
                        ? 'bg-teal-light text-teal border-teal/20'
                        : childData.attendancePct >= 75
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-red-50 text-red-600 border-red-200'
                    }`}
                  >
                    <Calendar className="w-3 h-3" />
                    {childData.attendancePct}% iştirak
                  </span>
                  {/* Days present this week */}
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-surface text-gray-600 border border-border-soft">
                    Bu həftə: {childData.daysPresent} gün
                  </span>
                  {/* Last grade */}
                  {lastGradeScore !== null && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-surface text-gray-600 border border-border-soft">
                      Son qiymət: <GradeBadge score={lastGradeScore} />
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Quick actions ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/valideyn/yazismalar')}
              className="flex items-center gap-3 bg-purple text-white px-5 py-3.5 rounded-xl hover:opacity-90 transition-opacity"
            >
              <MessageSquare className="w-5 h-5 flex-shrink-0" />
              <div className="text-left min-w-0">
                <p className="text-sm font-semibold">Müəllimlə Əlaqə</p>
                <p className="text-xs opacity-70">Mesaj göndər</p>
              </div>
            </button>
            <button
              onClick={() => navigate('/valideyn/qiymetler')}
              className="flex items-center gap-3 bg-teal text-white px-5 py-3.5 rounded-xl hover:opacity-90 transition-opacity"
            >
              <GraduationCap className="w-5 h-5 flex-shrink-0" />
              <div className="text-left min-w-0">
                <p className="text-sm font-semibold">Qiymətlər</p>
                <p className="text-xs opacity-70">Bütün qiymətlər</p>
              </div>
            </button>
          </div>

          {/* ── Main 2-column grid ────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* ── LEFT (7 cols) ──────────────────────────────────────────── */}
            <div className="lg:col-span-7 flex flex-col gap-6">

              {/* Son Qiymətlər */}
              <div className="bg-white rounded-2xl border border-border-soft shadow-sm flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border-soft">
                  <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-purple" />
                    {t('recent_grades')}
                  </h2>
                  <button
                    onClick={() => navigate('/valideyn/qiymetler')}
                    className="flex items-center gap-0.5 text-xs text-purple font-medium hover:opacity-75 transition-opacity"
                  >
                    {t('view_all')} <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {(childData.grades || []).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 text-center px-6">
                    <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center mb-3">
                      <BookOpen className="w-5 h-5 text-gray-300" />
                    </div>
                    <p className="text-sm text-gray-400">{t('no_grades')}</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border-soft">
                    {(childData.grades || []).map(g => {
                      const score = g.max_score > 0
                        ? Math.round((g.score / g.max_score) * 10)
                        : g.score
                      return (
                        <div
                          key={g.id}
                          className="flex items-center gap-3 px-5 py-3 hover:bg-surface/50 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">
                              {g.subject?.name}
                            </p>
                            {g.assessment_title && (
                              <p className="text-xs text-gray-400 mt-0.5 truncate">
                                {g.assessment_title}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <GradeBadge score={score} />
                            {g.date && (
                              <span className="text-xs text-gray-300">{formatDate(g.date)}</span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Yaxın Tapşırıqlar */}
              <div className="bg-white rounded-2xl border border-border-soft shadow-sm flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border-soft">
                  <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-purple" />
                    {t('upcoming_assignments_title')}
                  </h2>
                  <button
                    onClick={() => navigate('/valideyn/tapshiriqlar')}
                    className="flex items-center gap-0.5 text-xs text-purple font-medium hover:opacity-75 transition-opacity"
                  >
                    {t('view_all')} <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {(childData.upcomingAssignments || []).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 text-center px-6">
                    <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center mb-3">
                      <ClipboardList className="w-5 h-5 text-gray-300" />
                    </div>
                    <p className="text-sm text-gray-400">{t('no_assignments')}</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border-soft">
                    {(childData.upcomingAssignments || []).map(a => {
                      const hex = subjectHex(a.subject?.name || '')
                      return (
                        <div
                          key={a.id}
                          className="flex items-center gap-3 px-5 py-3 hover:bg-surface/50 transition-colors"
                        >
                          <span
                            className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-md text-white flex-shrink-0"
                            style={{ backgroundColor: hex }}
                          >
                            {a.subject?.name || 'Fənn'}
                          </span>
                          <p className="flex-1 text-sm font-medium text-gray-900 truncate min-w-0">
                            {a.title}
                          </p>
                          <div className="flex-shrink-0">
                            <DueDateChip dueDateIso={a.due_date} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* ── RIGHT (5 cols) ─────────────────────────────────────────── */}
            <div className="lg:col-span-5 flex flex-col gap-6">

              {/* Uşağın Bu Günü — today's timetable */}
              <div className="bg-white rounded-2xl border border-border-soft shadow-sm flex flex-col overflow-hidden">
                <div className="flex items-center px-5 py-4 border-b border-border-soft">
                  <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple" />
                    {t('childs_today')}
                  </h2>
                </div>

                {(childData.timetable || []).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                    <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center mb-3">
                      <Calendar className="w-5 h-5 text-gray-300" />
                    </div>
                    <p className="text-sm text-gray-400">{t('no_lessons_today')}</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border-soft">
                    {(childData.timetable || []).map(slot => (
                      <div
                        key={slot.id}
                        className="flex items-center gap-3 px-5 py-3 hover:bg-surface/50 transition-colors last:border-0"
                      >
                        <span className="w-7 h-7 rounded-full bg-purple text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {slot.period}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {slot.subject?.name}
                          </p>
                          {(slot.room || slot.start_time) && (
                            <p className="text-xs text-gray-400">
                              {[slot.start_time, slot.room].filter(Boolean).join(' · ')}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bildirişlər — notification feed */}
              <div className="bg-white rounded-2xl border border-border-soft shadow-sm flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border-soft">
                  <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-purple" />
                    {t('all_notifications')}
                  </h2>
                  <button
                    onClick={() => navigate('/valideyn/bildirisler')}
                    className="flex items-center gap-0.5 text-xs text-purple font-medium hover:opacity-75 transition-opacity"
                  >
                    {t('view_all')} <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                    <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center mb-3">
                      <Bell className="w-5 h-5 text-gray-300" />
                    </div>
                    <p className="text-sm text-gray-400">{t('no_notifications')}</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border-soft">
                    {notifications.slice(0, 5).map(n => {
                      const { icon: Icon, cls } = notifIcon(n.type)
                      return (
                        <div
                          key={n.id}
                          className={`flex items-start gap-3 px-5 py-3.5 hover:bg-surface/50 transition-colors ${
                            !n.read ? 'bg-purple-light/10' : ''
                          }`}
                        >
                          <span
                            className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${cls}`}
                          >
                            <Icon className="w-4 h-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p
                              className={`text-sm leading-snug ${
                                n.read ? 'text-gray-600' : 'text-gray-900 font-semibold'
                              }`}
                            >
                              {n.title}
                            </p>
                            {n.body && (
                              <p className="text-xs text-gray-400 mt-0.5 truncate">{n.body}</p>
                            )}
                            <p className="text-xs text-gray-300 mt-1">
                              {formatRelativeTime(n.created_at)}
                            </p>
                          </div>
                          {!n.read && (
                            <span className="flex-shrink-0 w-2 h-2 rounded-full bg-purple mt-2" />
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
