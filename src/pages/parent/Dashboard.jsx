import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Badge, { GradeBadge } from '../../components/ui/Badge'
import { DashboardSkeleton } from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import {
  Users, BookOpen, Calendar, Bell, MessageSquare,
  Clock, ClipboardList, GraduationCap, ChevronRight, Sparkles,
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

// Pastel palette for avatars / subjects
const PASTEL_COLORS = ['#7c6ee0', '#5db8a3', '#e8a87c', '#6b9dde']
function pastelColor(name = '') {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return PASTEL_COLORS[Math.abs(h) % PASTEL_COLORS.length]
}

// Notification icon meta
function notifIcon(type) {
  switch (type) {
    case 'grade':      return { icon: GraduationCap, bg: 'rgba(124,110,224,0.12)', color: '#7c6ee0' }
    case 'absence':    return { icon: Calendar,      bg: 'rgba(232,168,124,0.18)', color: '#e8a87c' }
    case 'message':    return { icon: MessageSquare, bg: 'rgba(107,157,222,0.15)', color: '#6b9dde' }
    case 'assignment': return { icon: ClipboardList, bg: 'rgba(93,184,163,0.15)',  color: '#5db8a3' }
    default:           return { icon: Bell,          bg: 'rgba(124,110,224,0.10)', color: '#7c6ee0' }
  }
}

// Due-date countdown chip — soft pastel
function DueDateChip({ dueDateIso }) {
  if (!dueDateIso) return null
  const due = new Date(dueDateIso)
  due.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffDays = Math.round((due - today) / 86400000)

  const base = 'inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap'

  if (diffDays < 0) {
    return <span className={base} style={{ background: 'rgba(232,168,124,0.18)', color: '#c47a4a', border: '1px solid rgba(232,168,124,0.3)' }}>gecikmiş</span>
  }
  if (diffDays === 0) {
    return <span className={base} style={{ background: 'rgba(232,168,124,0.18)', color: '#c47a4a', border: '1px solid rgba(232,168,124,0.3)' }}>bu gün</span>
  }
  if (diffDays <= 3) {
    return <span className={base} style={{ background: 'rgba(232,168,124,0.15)', color: '#c47a4a', border: '1px solid rgba(232,168,124,0.25)' }}>{diffDays} gün</span>
  }
  return <span className={base} style={{ background: 'rgba(124,110,224,0.08)', color: '#64748b', border: '1px solid rgba(124,110,224,0.15)' }}>{diffDays} gün</span>
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

  const childInitials = (name = '') =>
    name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?'

  return (
    <div className="space-y-7">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#64748b' }}>
            {todayLabel()}
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold mt-1.5" style={{ color: '#1a1a2e', letterSpacing: '-0.02em' }}>
            {t('welcome_back')}, <span className="pastel-text">{firstName}</span>
          </h1>
        </div>
      </div>

      {/* ── Multi-child glass switcher ─────────────────────────────────────── */}
      {children.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {children.map(child => {
            const active = selectedChild?.id === child.id
            const color = pastelColor(child.full_name)
            return (
              <button
                key={child.id}
                onClick={() => setSelectedChild(child)}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0"
                style={
                  active
                    ? {
                        background: 'linear-gradient(135deg, #7c6ee0 0%, #5db8a3 100%)',
                        color: '#fff',
                        border: '1px solid rgba(124,110,224,0.3)',
                        boxShadow: '0 4px 12px rgba(124,110,224,0.25)',
                      }
                    : {
                        background: 'rgba(255,255,255,0.6)',
                        color: '#1a1a2e',
                        border: '1px solid rgba(124,110,224,0.2)',
                        backdropFilter: 'blur(12px)',
                      }
                }
              >
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: active ? 'rgba(255,255,255,0.25)' : color }}
                >
                  {childInitials(child.full_name)}
                </span>
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
          {/* ── "Today" hero card with friendly avatar + stats ──────────────── */}
          <div className="liquid-card p-6 relative overflow-hidden">
            {/* decorative blob */}
            <div
              aria-hidden
              className="section-blob"
              style={{
                top: '-30%',
                right: '-10%',
                width: '40%',
                height: '160%',
                background: 'radial-gradient(ellipse at center, rgba(124,110,224,0.18) 0%, transparent 65%)',
              }}
            />

            <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
              {/* Big friendly avatar */}
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${pastelColor(selectedChild?.full_name || '')} 0%, ${pastelColor((selectedChild?.full_name || '') + 'x')} 100%)`,
                  boxShadow: '0 8px 24px rgba(124,110,224,0.25), inset 0 1px 0 rgba(255,255,255,0.4)',
                }}
              >
                {childInitials(selectedChild?.full_name)}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#7c6ee0' }}>
                  Bu gün
                </p>
                <h2 className="text-xl font-bold" style={{ color: '#1a1a2e' }}>
                  {selectedChild?.full_name}
                </h2>
                <p className="text-sm mt-0.5" style={{ color: '#64748b' }}>
                  {[childData.className, selectedChild?.school?.name].filter(Boolean).join(' · ') || 'Sinif məlumatı yoxdur'}
                </p>
              </div>
            </div>

            {/* Stat cards row */}
            <div className="relative grid grid-cols-3 gap-3 mt-6">
              {/* Attendance */}
              <div
                className="rounded-2xl p-4 flex flex-col gap-1 backdrop-blur-md"
                style={{
                  background: 'rgba(93,184,163,0.10)',
                  border: '1px solid rgba(93,184,163,0.25)',
                }}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Calendar className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#5db8a3' }} />
                  <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#64748b' }}>İştirak</span>
                </div>
                <p className="text-2xl font-extrabold leading-none" style={{ color: '#5db8a3' }}>
                  {childData.attendancePct}%
                </p>
                <p className="text-xs" style={{ color: '#64748b' }}>bu həftə: {childData.daysPresent} gün</p>
              </div>

              {/* Last grade */}
              <div
                className="rounded-2xl p-4 flex flex-col gap-1 backdrop-blur-md"
                style={{
                  background: 'rgba(124,110,224,0.10)',
                  border: '1px solid rgba(124,110,224,0.25)',
                }}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <GraduationCap className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#7c6ee0' }} />
                  <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#64748b' }}>Son qiymət</span>
                </div>
                <p className="text-2xl font-extrabold leading-none" style={{ color: '#7c6ee0' }}>
                  {lastGradeScore != null ? lastGradeScore : '—'}
                </p>
                <p className="text-xs truncate" style={{ color: '#64748b' }}>
                  {childData.lastGrade?.subject?.name || 'Fənn yoxdur'}
                </p>
              </div>

              {/* Upcoming assignments */}
              <div
                className="rounded-2xl p-4 flex flex-col gap-1 backdrop-blur-md"
                style={{
                  background: 'rgba(232,168,124,0.10)',
                  border: '1px solid rgba(232,168,124,0.25)',
                }}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <ClipboardList className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#e8a87c' }} />
                  <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#64748b' }}>Tapşırıqlar</span>
                </div>
                <p className="text-2xl font-extrabold leading-none" style={{ color: '#e8a87c' }}>
                  {(childData.upcomingAssignments || []).length}
                </p>
                <p className="text-xs" style={{ color: '#64748b' }}>gözləyən tapşırıq</p>
              </div>
            </div>
          </div>

          {/* ── Quick actions ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/valideyn/yazismalar')}
              className="btn-pastel justify-start"
              style={{ padding: '16px 24px' }}
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
              <GraduationCap className="w-5 h-5 flex-shrink-0" style={{ color: '#7c6ee0' }} />
              <div className="text-left min-w-0">
                <p className="text-sm font-bold" style={{ color: '#1a1a2e' }}>Qiymətlər</p>
                <p className="text-xs font-medium" style={{ color: '#64748b' }}>Bütün qiymətlər</p>
              </div>
            </button>
          </div>

          {/* ── Main 2-column grid ────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* ── LEFT (7 cols) ─────────────────────────────────────────── */}
            <div className="lg:col-span-7 flex flex-col gap-6">

              {/* Recent grades */}
              <div className="liquid-card overflow-hidden">
                <div
                  className="flex items-center justify-between px-5 py-4"
                  style={{ borderBottom: '1px solid rgba(124,110,224,0.12)' }}
                >
                  <h2 className="font-bold flex items-center gap-2" style={{ color: '#1a1a2e' }}>
                    <GraduationCap className="w-4 h-4" style={{ color: '#7c6ee0' }} />
                    {t('recent_grades')}
                  </h2>
                  <button
                    onClick={() => navigate('/valideyn/qiymetler')}
                    className="flex items-center gap-0.5 text-xs font-semibold transition-opacity hover:opacity-70"
                    style={{ color: '#7c6ee0' }}
                  >
                    {t('view_all')} <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {(childData.grades || []).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 text-center px-6">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                      style={{ background: 'rgba(124,110,224,0.10)' }}
                    >
                      <BookOpen className="w-6 h-6" style={{ color: '#7c6ee0' }} />
                    </div>
                    <p className="text-sm font-medium" style={{ color: '#1a1a2e' }}>{t('no_grades')}</p>
                    <p className="text-xs mt-1" style={{ color: '#64748b' }}>İlk qiymət gələn kimi burada görünəcək</p>
                  </div>
                ) : (
                  <div>
                    {(childData.grades || []).map((g, idx, arr) => {
                      if (g.score == null) return null
                      const score = g.max_score > 0
                        ? Math.round((g.score / g.max_score) * 10)
                        : g.score
                      const barPct = Math.min((score / 10) * 100, 100)
                      const barColor =
                        score >= 8 ? '#5db8a3' : score >= 6 ? '#7c6ee0' : '#e8a87c'
                      return (
                        <div
                          key={g.id}
                          className="px-5 py-3.5 transition-colors hover:bg-white/40"
                          style={{
                            borderBottom: idx === arr.length - 1 ? 'none' : '1px solid rgba(124,110,224,0.08)',
                          }}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold truncate leading-tight" style={{ color: '#1a1a2e' }}>
                                {g.subject?.name}
                              </p>
                              {g.assessment_title && (
                                <p className="text-xs mt-0.5 truncate" style={{ color: '#64748b' }}>
                                  {g.assessment_title}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <GradeBadge score={score} />
                              {g.date && (
                                <span className="text-xs" style={{ color: '#64748b' }}>{formatDate(g.date)}</span>
                              )}
                            </div>
                          </div>
                          {/* Mini grade bar */}
                          <div className="flex items-center gap-2">
                            <div
                              className="flex-1 h-1.5 rounded-full overflow-hidden"
                              style={{ background: 'rgba(124,110,224,0.10)' }}
                            >
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${barPct}%`, background: barColor }}
                              />
                            </div>
                            <span className="text-[10px] w-6 text-right flex-shrink-0" style={{ color: '#64748b' }}>
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
                <div
                  className="flex items-center justify-between px-5 py-4"
                  style={{ borderBottom: '1px solid rgba(124,110,224,0.12)' }}
                >
                  <h2 className="font-bold flex items-center gap-2" style={{ color: '#1a1a2e' }}>
                    <ClipboardList className="w-4 h-4" style={{ color: '#7c6ee0' }} />
                    {t('upcoming_assignments_title')}
                  </h2>
                  <button
                    onClick={() => navigate('/valideyn/tapshiriqlar')}
                    className="flex items-center gap-0.5 text-xs font-semibold transition-opacity hover:opacity-70"
                    style={{ color: '#7c6ee0' }}
                  >
                    {t('view_all')} <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {(childData.upcomingAssignments || []).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 text-center px-6">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                      style={{ background: 'rgba(93,184,163,0.12)' }}
                    >
                      <Sparkles className="w-6 h-6" style={{ color: '#5db8a3' }} />
                    </div>
                    <p className="text-sm font-medium" style={{ color: '#1a1a2e' }}>{t('no_assignments')}</p>
                    <p className="text-xs mt-1" style={{ color: '#64748b' }}>Hər şey tamam — yeni tapşırıq yoxdur</p>
                  </div>
                ) : (
                  <div>
                    {(childData.upcomingAssignments || []).map((a, idx, arr) => {
                      const hex = pastelColor(a.subject?.name || '')
                      return (
                        <div
                          key={a.id}
                          className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-white/40"
                          style={{
                            borderBottom: idx === arr.length - 1 ? 'none' : '1px solid rgba(124,110,224,0.08)',
                          }}
                        >
                          <span
                            className="mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: hex }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate leading-tight" style={{ color: '#1a1a2e' }}>
                              {a.title}
                            </p>
                            <p className="text-xs mt-0.5 truncate" style={{ color: '#64748b' }}>
                              {a.subject?.name || 'Fənn'}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <DueDateChip dueDateIso={a.due_date} />
                            {a.due_date && (
                              <span className="text-[10px]" style={{ color: '#64748b' }}>
                                {formatDate(a.due_date)}
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* ── RIGHT (5 cols) ────────────────────────────────────────── */}
            <div className="lg:col-span-5 flex flex-col gap-6">

              {/* Today's timetable */}
              <div className="liquid-card overflow-hidden">
                <div
                  className="flex items-center px-5 py-4"
                  style={{ borderBottom: '1px solid rgba(124,110,224,0.12)' }}
                >
                  <h2 className="font-bold flex items-center gap-2" style={{ color: '#1a1a2e' }}>
                    <Clock className="w-4 h-4" style={{ color: '#7c6ee0' }} />
                    {t('childs_today')}
                  </h2>
                </div>

                {(childData.timetable || []).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                      style={{ background: 'rgba(232,168,124,0.12)' }}
                    >
                      <Calendar className="w-6 h-6" style={{ color: '#e8a87c' }} />
                    </div>
                    <p className="text-sm font-medium" style={{ color: '#1a1a2e' }}>{t('no_lessons_today')}</p>
                    <p className="text-xs mt-1" style={{ color: '#64748b' }}>İstirahət günü</p>
                  </div>
                ) : (
                  <div>
                    {(childData.timetable || []).map((slot, idx, arr) => (
                      <div
                        key={slot.id}
                        className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-white/40"
                        style={{
                          borderBottom: idx === arr.length - 1 ? 'none' : '1px solid rgba(124,110,224,0.08)',
                        }}
                      >
                        <span
                          className="w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg, #7c6ee0 0%, #5db8a3 100%)' }}
                        >
                          {slot.period}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: '#1a1a2e' }}>
                            {slot.subject?.name}
                          </p>
                          {(slot.room || slot.start_time) && (
                            <p className="text-xs" style={{ color: '#64748b' }}>
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
                <div
                  className="flex items-center justify-between px-5 py-4"
                  style={{ borderBottom: '1px solid rgba(124,110,224,0.12)' }}
                >
                  <h2 className="font-bold flex items-center gap-2" style={{ color: '#1a1a2e' }}>
                    <Bell className="w-4 h-4" style={{ color: '#7c6ee0' }} />
                    {t('all_notifications')}
                  </h2>
                  <button
                    onClick={() => navigate('/valideyn/bildirisler')}
                    className="flex items-center gap-0.5 text-xs font-semibold transition-opacity hover:opacity-70"
                    style={{ color: '#7c6ee0' }}
                  >
                    {t('view_all')} <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                      style={{ background: 'rgba(124,110,224,0.10)' }}
                    >
                      <Bell className="w-6 h-6" style={{ color: '#7c6ee0' }} />
                    </div>
                    <p className="text-sm font-medium" style={{ color: '#1a1a2e' }}>{t('no_notifications')}</p>
                    <p className="text-xs mt-1" style={{ color: '#64748b' }}>Hər şey sakitdir</p>
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
                            background: !n.read ? 'rgba(124,110,224,0.05)' : 'transparent',
                            borderBottom: idx === Math.min(arr.length - 1, 4) ? 'none' : '1px solid rgba(124,110,224,0.08)',
                          }}
                        >
                          <span
                            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{ background: meta.bg, color: meta.color }}
                          >
                            <Icon className="w-4 h-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p
                              className="text-sm leading-snug"
                              style={{
                                color: n.read ? '#64748b' : '#1a1a2e',
                                fontWeight: n.read ? 500 : 700,
                              }}
                            >
                              {n.title}
                            </p>
                            {n.body && (
                              <p className="text-xs mt-0.5 truncate" style={{ color: '#64748b' }}>{n.body}</p>
                            )}
                            <p className="text-[10px] mt-1" style={{ color: '#64748b' }}>
                              {formatRelativeTime(n.created_at)}
                            </p>
                          </div>
                          {!n.read && (
                            <span
                              className="flex-shrink-0 w-2 h-2 rounded-full mt-2"
                              style={{ background: '#7c6ee0' }}
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
