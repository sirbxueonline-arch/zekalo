import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Badge, { GradeBadge } from '../../components/ui/Badge'
import { DashboardSkeleton } from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import Avatar from '../../components/ui/Avatar'
import Mascot from '../../components/ui/Mascot'
import LevelRing from '../../components/ui/LevelRing'
import XPBar from '../../components/ui/XPBar'
import CountUp from '../../components/ui/CountUp'
import {
  Users, BookOpen, Calendar, Bell, MessageSquare,
  Clock, ClipboardList, GraduationCap, ChevronRight,
} from 'lucide-react'
import { todayFull, fmtNumeric } from '../../lib/dateUtils'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayLabel() {
  return todayFull()
}

function formatDate(iso) {
  if (!iso) return ''
  return fmtNumeric(iso)
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

// Notification icon meta — calm neutral icon-chip; one brand chip does the work,
// reserving color for the unread dot / status, per the color-restraint law.
function notifIcon(type) {
  switch (type) {
    case 'grade':      return { icon: GraduationCap, chip: 'icon-chip-periwinkle' }
    case 'absence':    return { icon: Calendar,      chip: 'icon-chip-periwinkle' }
    case 'message':    return { icon: MessageSquare, chip: 'icon-chip-periwinkle' }
    case 'assignment': return { icon: ClipboardList, chip: 'icon-chip-periwinkle' }
    default:           return { icon: Bell,          chip: 'icon-chip-periwinkle' }
  }
}

// Due-date countdown — functional status pill (amber = warning/urgent, calm
// brand-tint otherwise). Color carries meaning, not decoration.
function DueDateChip({ dueDateIso }) {
  if (!dueDateIso) return null
  const due = new Date(dueDateIso)
  due.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffDays = Math.round((due - today) / 86400000)

  if (diffDays < 0) return <Badge variant="warning">gecikmiş</Badge>
  if (diffDays === 0) return <Badge variant="warning">bu gün</Badge>
  if (diffDays <= 3) return <Badge variant="peach">{diffDays} gün</Badge>
  return <Badge variant="peri">{diffDays} gün</Badge>
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

    const { data: memberData } = await supabase
      .from('class_members')
      .select('class:classes(id, name)')
      .eq('student_id', child.id)

    const classes = (memberData || []).map(m => m.class).filter(Boolean)
    const classIds = classes.map(c => c.id)
    const className = classes[0]?.name || null

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

  if (loading && !children.length) return <DashboardSkeleton />

  if (children.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Uşaq tapılmadı"
        description="Hesabınıza bağlı uşaq məlumatı yoxdur."
      />
    )
  }

  const firstName = profile?.full_name?.split(' ')[0] || ''

  const lastGradeScore = childData.lastGrade
    ? (childData.lastGrade.max_score > 0
        ? Math.round((childData.lastGrade.score / childData.lastGrade.max_score) * 10)
        : childData.lastGrade.score)
    : null

  // "This week" progress reframed as a friendly 5-school-day goal.
  const weekGoal = 5
  const daysPresent = childData.daysPresent || 0

  return (
    <div className="space-y-7">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold uppercase tracking-[0.04em] text-ink-400">
            {todayLabel()}
          </p>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl mt-1.5 text-ink-900 leading-[1.1]">
            {t('welcome_back')}, <span className="pastel-text">{firstName}</span>
          </h1>
        </div>
        <Mascot pose="waving" size={84} className="hidden sm:inline-flex flex-shrink-0" />
      </div>

      {/* ── Multi-child switcher (segmented pill group) ────────────────────── */}
      {children.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {children.map(child => {
            const active = selectedChild?.id === child.id
            return (
              <button
                key={child.id}
                onClick={() => setSelectedChild(child)}
                className="flex items-center gap-2.5 px-4 py-2 rounded-pill text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0"
                style={
                  active
                    ? {
                        background: 'var(--brand-500)',
                        color: '#fff',
                        boxShadow: '0 1px 2px rgba(20,22,40,.10)',
                      }
                    : {
                        background: 'var(--surface)',
                        color: 'var(--ink-700)',
                        border: '1px solid var(--hairline-strong)',
                      }
                }
              >
                <Avatar
                  name={child.full_name}
                  color={child.avatar_color}
                  size={26}
                  ring={false}
                  style={active ? { background: 'rgba(255,255,255,0.22)', color: '#fff' } : undefined}
                />
                {child.full_name}
              </button>
            )
          })}
        </div>
      )}

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          {/* ── Child hero card — friendly summary + progress reframing ──────── */}
          <div className="liquid-card p-6 relative overflow-hidden">
            {/* flat brand wash (chrome warmth — static, single hue) */}
            <div
              aria-hidden
              className="absolute pointer-events-none"
              style={{
                top: 0,
                right: 0,
                width: '38%',
                height: '100%',
                background: 'var(--brand-50)',
                opacity: 0.6,
              }}
            />

            <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
              {/* Big friendly avatar */}
              <Avatar
                name={selectedChild?.full_name}
                color={selectedChild?.avatar_color}
                size={80}
              />

              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold uppercase tracking-[0.04em] mb-1 text-brand-500">
                  Bu gün
                </p>
                <h2 className="font-display font-extrabold text-2xl text-ink-900 leading-tight">
                  {selectedChild?.full_name}
                </h2>
                <p className="text-sm mt-1 text-ink-600">
                  {[childData.className, selectedChild?.school?.name].filter(Boolean).join(' · ') || 'Sinif məlumatı yoxdur'}
                </p>
              </div>

              {/* Attendance reframed as an engagement ring (calm, positive) */}
              <div className="flex-shrink-0 self-center sm:self-auto">
                <LevelRing
                  value={childData.attendancePct || 0}
                  max={100}
                  size={104}
                  stroke={10}
                  color="var(--mint)"
                  center={
                    <>
                      <span className="font-display font-extrabold text-ink-900 tabular-nums" style={{ fontSize: 26 }}>
                        <CountUp to={childData.attendancePct || 0} suffix="%" />
                      </span>
                      <span className="text-[11px] font-semibold text-ink-400 mt-0.5">İştirak</span>
                    </>
                  }
                />
              </div>
            </div>

            {/* This-week goal bar (positive engagement framing) */}
            <div className="relative mt-6">
              <XPBar
                value={daysPresent}
                target={weekGoal}
                showCap={false}
                labelText={`${daysPresent} / ${weekGoal} gün`}
              />
              <p className="text-xs text-ink-400 mt-1.5">Bu həftə məktəbdə</p>
            </div>

            {/* Stat tiles row — calm, single brand accent + neutral surface */}
            <div className="relative grid grid-cols-3 gap-3 mt-5">
              {/* Last grade (calm — never stress-red) */}
              <div
                className="rounded-tile p-4 flex flex-col gap-1"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--hairline)' }}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <GraduationCap className="w-3.5 h-3.5 flex-shrink-0 text-brand-500" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.04em] text-ink-400">Son qiymət</span>
                </div>
                <p className="font-display font-extrabold text-2xl leading-none text-ink-900 tabular-nums">
                  {lastGradeScore != null ? lastGradeScore : '—'}
                </p>
                <p className="text-xs truncate text-ink-600">
                  {childData.lastGrade?.subject?.name || 'Fənn yoxdur'}
                </p>
              </div>

              {/* Days present this week */}
              <div
                className="rounded-tile p-4 flex flex-col gap-1"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--hairline)' }}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-brand-500" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.04em] text-ink-400">Bu həftə</span>
                </div>
                <p className="font-display font-extrabold text-2xl leading-none text-ink-900 tabular-nums">
                  <CountUp to={daysPresent} />
                </p>
                <p className="text-xs text-ink-600">gün məktəbdə</p>
              </div>

              {/* Upcoming assignments */}
              <div
                className="rounded-tile p-4 flex flex-col gap-1"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--hairline)' }}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <ClipboardList className="w-3.5 h-3.5 flex-shrink-0 text-brand-500" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.04em] text-ink-400">Tapşırıqlar</span>
                </div>
                <p className="font-display font-extrabold text-2xl leading-none text-ink-900 tabular-nums">
                  <CountUp to={(childData.upcomingAssignments || []).length} />
                </p>
                <p className="text-xs text-ink-600">gözləyən tapşırıq</p>
              </div>
            </div>
          </div>

          {/* ── Quick actions ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/valideyn/yazismalar')}
              className="flex items-center gap-2.5 justify-start rounded-pill text-white transition-colors"
              style={{ padding: '16px 24px', background: 'var(--brand-500)', boxShadow: '0 1px 2px rgba(20,22,40,.10)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--brand-600)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--brand-500)')}
            >
              <MessageSquare className="w-5 h-5 flex-shrink-0" />
              <div className="text-left min-w-0">
                <p className="text-sm font-bold">Müəllimlə Əlaqə</p>
                <p className="text-xs opacity-80 font-medium">Mesaj göndər</p>
              </div>
            </button>
            <button
              onClick={() => navigate('/valideyn/qiymetler')}
              className="btn-ghost-pastel justify-start"
              style={{ padding: '16px 24px' }}
            >
              <GraduationCap className="w-5 h-5 flex-shrink-0 text-brand-500" />
              <div className="text-left min-w-0">
                <p className="text-sm font-bold text-ink-900">Qiymətlər</p>
                <p className="text-xs font-medium text-ink-600">Bütün qiymətlər</p>
              </div>
            </button>
          </div>

          {/* ── Main 2-column grid ────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* ── LEFT (7 cols) ─────────────────────────────────────────── */}
            <div className="lg:col-span-7 flex flex-col gap-6">

              {/* Recent grades */}
              <div className="liquid-card overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--hairline)' }}>
                  <h2 className="text-[15px] font-semibold flex items-center gap-2 text-ink-900">
                    <GraduationCap className="w-4 h-4 text-brand-500" />
                    {t('recent_grades')}
                  </h2>
                  <button
                    onClick={() => navigate('/valideyn/qiymetler')}
                    className="flex items-center gap-0.5 text-xs font-semibold text-brand-500 transition-opacity hover:opacity-70"
                  >
                    {t('view_all')} <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {(childData.grades || []).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                    <GraduationCap className="w-12 h-12 text-ink-400" strokeWidth={1.5} />
                    <p className="text-sm font-semibold mt-3 text-ink-900">{t('no_grades')}</p>
                    <p className="text-xs mt-1 text-ink-400">İlk qiymət gələn kimi burada görünəcək</p>
                  </div>
                ) : (
                  <div>
                    {(childData.grades || []).map((g, idx, arr) => {
                      if (g.score == null) return null
                      const score = g.max_score > 0
                        ? Math.round((g.score / g.max_score) * 10)
                        : g.score
                      const barPct = Math.min((score / 10) * 100, 100)
                      // Calm, no stress-red: high=mint, mid=brand, low=soft amber.
                      const barColor =
                        score >= 8 ? 'var(--mint)' : score >= 6 ? 'var(--brand-500)' : 'var(--sun)'
                      return (
                        <div
                          key={g.id}
                          className="px-5 py-3.5 transition-colors hover:bg-brand-50"
                          style={{ borderBottom: idx === arr.length - 1 ? 'none' : '1px solid var(--hairline)' }}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold truncate leading-tight text-ink-900">
                                {g.subject?.name}
                              </p>
                              {g.assessment_title && (
                                <p className="text-xs mt-0.5 truncate text-ink-400">
                                  {g.assessment_title}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <GradeBadge score={score} />
                              {g.date && (
                                <span className="text-xs text-ink-400 tabular-nums">{formatDate(g.date)}</span>
                              )}
                            </div>
                          </div>
                          {/* Mini grade bar */}
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-pill overflow-hidden" style={{ background: 'var(--hairline)' }}>
                              <div
                                className="h-full rounded-pill transition-all duration-500"
                                style={{ width: `${barPct}%`, background: barColor }}
                              />
                            </div>
                            <span className="text-[10px] w-6 text-right flex-shrink-0 text-ink-400 tabular-nums">
                              {score}/10
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Upcoming assignments */}
              <div className="liquid-card overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--hairline)' }}>
                  <h2 className="text-[15px] font-semibold flex items-center gap-2 text-ink-900">
                    <ClipboardList className="w-4 h-4 text-brand-500" />
                    {t('upcoming_assignments_title')}
                  </h2>
                  <button
                    onClick={() => navigate('/valideyn/tapshiriqlar')}
                    className="flex items-center gap-0.5 text-xs font-semibold text-brand-500 transition-opacity hover:opacity-70"
                  >
                    {t('view_all')} <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {(childData.upcomingAssignments || []).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                    <ClipboardList className="w-12 h-12 text-ink-400" strokeWidth={1.5} />
                    <p className="text-sm font-semibold mt-3 text-ink-900">{t('no_assignments')}</p>
                    <p className="text-xs mt-1 text-ink-400">Hər şey tamam — yeni tapşırıq yoxdur</p>
                  </div>
                ) : (
                  <div>
                    {(childData.upcomingAssignments || []).map((a, idx, arr) => (
                      <div
                        key={a.id}
                        className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-brand-50"
                        style={{ borderBottom: idx === arr.length - 1 ? 'none' : '1px solid var(--hairline)' }}
                      >
                        <span
                          className="mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: 'var(--brand-300)' }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate leading-tight text-ink-900">
                            {a.title}
                          </p>
                          <p className="text-xs mt-0.5 truncate text-ink-400">
                            {a.subject?.name || 'Fənn'}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <DueDateChip dueDateIso={a.due_date} />
                          {a.due_date && (
                            <span className="text-[10px] text-ink-400 tabular-nums">
                              {formatDate(a.due_date)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── RIGHT (5 cols) ────────────────────────────────────────── */}
            <div className="lg:col-span-5 flex flex-col gap-6">

              {/* Today's timetable */}
              <div className="liquid-card overflow-hidden">
                <div className="flex items-center px-5 py-4" style={{ borderBottom: '1px solid var(--hairline)' }}>
                  <h2 className="text-[15px] font-semibold flex items-center gap-2 text-ink-900">
                    <Clock className="w-4 h-4 text-brand-500" />
                    {t('childs_today')}
                  </h2>
                </div>

                {(childData.timetable || []).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center px-6">
                    <Clock className="w-12 h-12 text-ink-400" strokeWidth={1.5} />
                    <p className="text-sm font-semibold mt-3 text-ink-900">{t('no_lessons_today')}</p>
                    <p className="text-xs mt-1 text-ink-400">İstirahət günü</p>
                  </div>
                ) : (
                  <div>
                    {(childData.timetable || []).map((slot, idx, arr) => (
                      <div
                        key={slot.id}
                        className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-brand-50"
                        style={{ borderBottom: idx === arr.length - 1 ? 'none' : '1px solid var(--hairline)' }}
                      >
                        <span
                          className="w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0 tabular-nums"
                          style={{ background: 'var(--brand-500)' }}
                        >
                          {slot.period}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate text-ink-900">
                            {slot.subject?.name}
                          </p>
                          {(slot.room || slot.start_time) && (
                            <p className="text-xs text-ink-400">
                              {[slot.start_time, slot.room].filter(Boolean).join(' · ')}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notifications */}
              <div className="liquid-card overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--hairline)' }}>
                  <h2 className="text-[15px] font-semibold flex items-center gap-2 text-ink-900">
                    <Bell className="w-4 h-4 text-brand-500" />
                    {t('all_notifications')}
                  </h2>
                  <button
                    onClick={() => navigate('/valideyn/bildirisler')}
                    className="flex items-center gap-0.5 text-xs font-semibold text-brand-500 transition-opacity hover:opacity-70"
                  >
                    {t('view_all')} <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center px-6">
                    <Bell className="w-12 h-12 text-ink-400" strokeWidth={1.5} />
                    <p className="text-sm font-semibold mt-3 text-ink-900">{t('no_notifications')}</p>
                    <p className="text-xs mt-1 text-ink-400">Hər şey sakitdir</p>
                  </div>
                ) : (
                  <div>
                    {notifications.slice(0, 5).map((n, idx, arr) => {
                      const meta = notifIcon(n.type)
                      const Icon = meta.icon
                      return (
                        <div
                          key={n.id}
                          className="flex items-start gap-3 px-5 py-3.5 transition-colors"
                          style={{
                            background: !n.read ? 'var(--brand-50)' : 'transparent',
                            borderBottom: idx === Math.min(arr.length - 1, 4) ? 'none' : '1px solid var(--hairline)',
                          }}
                        >
                          <span className={`icon-chip ${meta.chip} mt-0.5`} style={{ width: 36, height: 36 }}>
                            <Icon className="w-4 h-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p
                              className="text-sm leading-snug"
                              style={{
                                color: n.read ? 'var(--ink-600)' : 'var(--ink-900)',
                                fontWeight: n.read ? 500 : 700,
                              }}
                            >
                              {n.title}
                            </p>
                            {n.body && (
                              <p className="text-xs mt-0.5 truncate text-ink-400">{n.body}</p>
                            )}
                            <p className="text-[10px] mt-1 text-ink-400">
                              {formatRelativeTime(n.created_at)}
                            </p>
                          </div>
                          {!n.read && (
                            <span
                              className="flex-shrink-0 w-2 h-2 rounded-full mt-2"
                              style={{ background: 'var(--brand-500)' }}
                            />
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
