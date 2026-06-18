import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarCheck, BookOpen, CheckCircle, Clock,
  Users, TrendingUp, TrendingDown, ChevronRight,
  Inbox, Bell, AlertCircle, Info,
  PenLine, ClipboardList, BarChart2,
} from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from 'recharts'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { DashboardSkeleton } from '../../components/ui/Skeleton'
import StatCard from '../../components/ui/StatCard'
import EmptyState from '../../components/ui/EmptyState'
import CountUp from '../../components/ui/CountUp'
import Button from '../../components/ui/Button'
import { todayFull } from '../../lib/dateUtils'

// ── Helpers ────────────────────────────────────────────────────────────────

function greeting(t) {
  const h = new Date().getHours()
  if (h < 12) return t('good_morning')
  if (h < 18) return t('good_afternoon')
  return t('good_evening')
}

function todayLabel() {
  return todayFull()
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`
}

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60)    return `${diff} san. əvvəl`
  if (diff < 3600)  return `${Math.floor(diff / 60)} dəq. əvvəl`
  if (diff < 86400) return `${Math.floor(diff / 3600)} saat əvvəl`
  return `${Math.floor(diff / 86400)} gün əvvəl`
}

function daysUntil(dateStr) {
  const due  = new Date(dateStr)
  const now  = new Date()
  due.setHours(0, 0, 0, 0)
  now.setHours(0, 0, 0, 0)
  return Math.round((due - now) / (1000 * 60 * 60 * 24))
}

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
  const [eh, em] = slot.end_time.split(':').map(Number)
  const endMin = eh * 60 + em
  const curMin = new Date().getHours() * 60 + new Date().getMinutes()
  return curMin > endMin
}

// ── Subject accent (V3 color restraint — one brand accent, no rainbow) ───────
// SUBJ_PALETTE's 5-hue rotation is collapsed to the single brand accent so
// categorical color stops competing with status; meaning lives in pills/dots.
// Concrete hex (not a CSS var) so it works in SVG fills (recharts Cell).

const BRAND_HEX = '#574FCF'
function subjectHex() { return BRAND_HEX }

// ── Notification icon ──────────────────────────────────────────────────────

function NotifIcon({ type }) {
  if (type === 'assignment') return <BookOpen className="w-3.5 h-3.5 text-brand-500" />
  if (type === 'attendance') return <CalendarCheck className="w-3.5 h-3.5 text-mint" />
  if (type === 'alert')      return <AlertCircle className="w-3.5 h-3.5 text-coral" />
  return <Info className="w-3.5 h-3.5 text-ink-400" />
}

function notifChipClass(type) {
  if (type === 'assignment') return 'icon-chip-periwinkle'
  if (type === 'attendance') return 'icon-chip-mint'
  if (type === 'alert')      return 'icon-chip-coral'
  return 'icon-chip-blue'
}

// ── Custom chart tooltip (§10 — always custom, white, soft shadow) ───────────

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const entry = payload[0]
  return (
    <div className="bg-surface rounded-card shadow-soft-lg px-3.5 py-3 text-sm min-w-[140px]">
      <p className="font-semibold text-ink-900 mb-1.5 truncate max-w-[180px]">{label}</p>
      <div className="flex items-center justify-between gap-4">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full inline-block shrink-0" style={{ backgroundColor: entry.color || entry.payload?.fill }} />
          <span className="text-ink-600">Təhvil</span>
        </span>
        <span className="font-bold tabular-nums" style={{ color: entry.color || entry.payload?.fill }}>{entry.value}%</span>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

export default function TeacherDashboard() {
  const { profile, t } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading]                 = useState(true)
  const [todaySlots, setTodaySlots]           = useState([])
  const [attendanceTaken, setAttendanceTaken] = useState({})
  const [assignments, setAssignments]         = useState([])
  const [submissions, setSubmissions]         = useState([])
  const [studentCount, setStudentCount]       = useState(0)
  const [weekAttendance, setWeekAttendance]   = useState(0)
  const [notifications, setNotifications]     = useState([])
  const [subCounts, setSubCounts]             = useState({})

  useEffect(() => {
    if (profile?.id) loadDashboard()
  }, [profile?.id])

  async function loadDashboard() {
    try {
      const today    = new Date()
      const dayOfWeek = today.getDay()
      const todayStr  = today.toISOString().split('T')[0]
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - today.getDay() + 1)
      const weekStartStr = weekStart.toISOString().split('T')[0]

      const [timetableRes, classesRes, assignmentsRes, notifsRes] = await Promise.all([
        supabase.from('timetable_slots')
          .select('*, subject:subjects(name), class:classes(name)')
          .eq('teacher_id', profile.id)
          .eq('day_of_week', dayOfWeek)
          .eq('published', true)
          .order('period'),
        supabase.from('teacher_classes').select('class_id').eq('teacher_id', profile.id),
        supabase.from('assignments')
          .select('*, subject:subjects(name), class:classes(name, id)')
          .eq('teacher_id', profile.id)
          .order('due_date')
          .limit(8),
        supabase.from('notifications')
          .select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(6),
      ])

      const classIds = (classesRes.data || []).map(c => c.class_id)

      // Fetch recent submissions — trust RLS to limit to this teacher's assignments
      const { data: rawSubs } = await supabase.from('submissions')
        .select('*, assignment:assignments(id, title, subject:subjects(name))')
        .eq('status', 'submitted')
        .order('submitted_at', { ascending: false })
        .limit(20)

      const subStudentIds = [...new Set((rawSubs || []).map(s => s.student_id).filter(Boolean))]
      const { data: subProfiles } = subStudentIds.length
        ? await supabase.from('profiles').select('id, full_name').in('id', subStudentIds)
        : { data: [] }
      const subProfileMap = {}
      ;(subProfiles || []).forEach(p => { subProfileMap[p.id] = p })
      const submissionsRes = {
        data: (rawSubs || [])
          .map(s => ({ ...s, student: subProfileMap[s.student_id] || { full_name: 'Naməlum' } }))
          .slice(0, 6)
      }

      const slotClassIds = [...new Set((timetableRes.data || []).map(s => s.class_id))]
      const attTodayRes = slotClassIds.length
        ? await supabase.from('attendance').select('class_id').in('class_id', slotClassIds).eq('date', todayStr)
        : { data: [] }

      const attendanceMap = {}
      ;(attTodayRes.data || []).forEach(r => { attendanceMap[r.class_id] = true })

      const assignmentIds = (assignmentsRes.data || []).map(a => a.id)
      let subCountMap = {}
      if (assignmentIds.length) {
        const [submittedRes, totalMembersRes] = await Promise.all([
          supabase.from('submissions').select('assignment_id').in('assignment_id', assignmentIds),
          supabase.from('class_members').select('class_id').in('class_id', classIds),
        ])
        const submitted = submittedRes.data || []
        submitted.forEach(s => { subCountMap[s.assignment_id] = (subCountMap[s.assignment_id] || 0) + 1 })
        const classMemberCounts = {}
        ;(totalMembersRes.data || []).forEach(m => {
          classMemberCounts[m.class_id] = (classMemberCounts[m.class_id] || 0) + 1
        })
        ;(assignmentsRes.data || []).forEach(a => {
          const cid = a.class?.id
          subCountMap[`${a.id}_total`] = classMemberCounts[cid] || 0
        })
      }

      let totalStudents = 0
      let weekAtt = 0
      if (classIds.length) {
        const [membersRes, weekAttRes] = await Promise.all([
          supabase.from('class_members').select('id', { count: 'exact', head: true }).in('class_id', classIds),
          supabase.from('attendance').select('status').in('class_id', classIds).gte('date', weekStartStr).lte('date', todayStr),
        ])
        totalStudents = membersRes.count || 0
        const attData = weekAttRes.data || []
        if (attData.length) {
          const present = attData.filter(a => a.status === 'present').length
          weekAtt = Math.round((present / attData.length) * 100)
        }
      }

      setTodaySlots(timetableRes.data || [])
      setAttendanceTaken(attendanceMap)
      setAssignments(assignmentsRes.data || [])
      setSubmissions(submissionsRes.data || [])
      setStudentCount(totalStudents)
      setWeekAttendance(weekAtt)
      setNotifications(notifsRes.data || [])
      setSubCounts(subCountMap)
    } catch (err) {
      console.error('Teacher dashboard error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <DashboardSkeleton />

  const firstName = profile?.full_name?.split(' ')[0] || ''

  // Class engagement: submission rate per assignment (reframed gamification → analytics)
  const engagementData = assignments
    .map(a => {
      const submitted = subCounts[a.id] || 0
      const total     = subCounts[`${a.id}_total`] || 0
      return {
        name: a.title,
        pct: total > 0 ? Math.round((submitted / total) * 100) : 0,
        total,
        fill: subjectHex(a.subject?.name || ''),
      }
    })
    .filter(d => d.total > 0)
    .slice(0, 6)

  return (
    <div className="space-y-5">

      {/* ── 1. Hero greeting card ─────────────────────────────────────────── */}
      <div className="liquid-card relative overflow-hidden p-6" style={{ background: 'var(--brand-50)' }}>
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-[12px] uppercase tracking-[0.04em] font-semibold text-ink-400">{todayLabel()}</p>
            <h1 className="font-display font-extrabold text-3xl md:text-4xl mt-1 text-ink-900 leading-[1.1]">
              {greeting(t)}, <span className="text-brand-500">{firstName}</span>
            </h1>
            {todaySlots.length > 0 && (
              <p className="text-sm mt-2 flex items-center gap-1.5 text-ink-600">
                <Clock className="w-3.5 h-3.5 text-brand-500" />
                Bu gün {todaySlots.length} dərs var
              </p>
            )}
          </div>

          {/* Quick action buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/muellim/davamiyyet')}
            >
              <CalendarCheck className="w-4 h-4" /> {t('attendance')}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/muellim/jurnal')}
            >
              <BookOpen className="w-4 h-4" /> {t('gradebook')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/muellim/tapshiriqlar')}
            >
              <PenLine className="w-4 h-4" /> Tapşırıq
            </Button>
          </div>
        </div>
      </div>

      {/* ── 2. Stats row ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Bu günki dərs"
          tone="periwinkle"
          icon={Clock}
          value={<CountUp to={todaySlots.length} />}
        />
        <StatCard
          label="Gözləyən"
          tone="periwinkle"
          icon={Inbox}
          value={<CountUp to={submissions.length} />}
        />
        <StatCard
          label="Cəmi Şagird"
          tone="periwinkle"
          icon={Users}
          value={<CountUp to={studentCount} />}
        />
        <StatCard
          label="Həftəlik dav."
          tone="periwinkle"
          icon={weekAttendance >= 85 ? TrendingUp : TrendingDown}
          value={<CountUp to={weekAttendance} suffix="%" />}
        />
      </div>

      {/* ── 3. Today's timetable strip ──────────────────────────────────── */}
      <div className="liquid-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-hairline">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-500" />
            <h2 className="font-semibold text-[15px] text-ink-900">{t('todays_lessons')}</h2>
          </div>
          <button
            onClick={() => navigate('/muellim/cedvel')}
            className="flex items-center gap-1 text-xs font-semibold text-brand-500 smooth-trans hover:text-brand-600"
          >
            {t('view_full_timetable')} <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="overflow-x-auto px-5 py-4">
          {todaySlots.length === 0 ? (
            <EmptyState
              tier={1}
              icon={Clock}
              className="!border-0 !shadow-none !p-6"
              title={t('no_lessons_today')}
            />
          ) : (
            <div className="flex gap-3" style={{ minWidth: 'max-content' }}>
              {todaySlots.map(slot => {
                const current = isCurrentPeriod(slot)
                const past    = !current && isPastPeriod(slot)
                const attDone = attendanceTaken[slot.class_id]
                return (
                  <div
                    key={slot.id}
                    onClick={() => navigate('/muellim/davamiyyet')}
                    className="relative flex flex-col gap-1.5 rounded-tile px-4 py-3 w-40 flex-shrink-0 cursor-pointer smooth-trans hover:-translate-y-0.5"
                    style={{
                      background: current ? 'var(--brand-50)' : 'var(--surface-2)',
                      border: current
                        ? '1.5px solid var(--brand-300)'
                        : '1px solid var(--hairline)',
                      opacity: past ? 0.6 : 1,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0 tabular-nums"
                        style={{ backgroundColor: past ? 'var(--ink-400)' : 'var(--brand-500)' }}
                      >
                        {slot.period}
                      </span>
                      {current && (
                        <span className="pill-peri" style={{ fontSize: 10 }}>İndi</span>
                      )}
                      {!current && attDone && (
                        <CheckCircle className="w-3.5 h-3.5 text-mint" />
                      )}
                    </div>
                    <p className="text-sm font-semibold truncate" style={{ color: past ? 'var(--ink-400)' : 'var(--ink-900)' }}>
                      {slot.subject?.name}
                    </p>
                    <p className="text-xs truncate" style={{ color: past ? 'var(--ink-400)' : 'var(--ink-600)' }}>
                      {slot.class?.name}
                    </p>
                    {slot.start_time && slot.end_time && (
                      <p className="text-[11px] tabular-nums text-ink-400">
                        {slot.start_time.slice(0, 5)}–{slot.end_time.slice(0, 5)}
                      </p>
                    )}
                    {slot.room && (
                      <p className="text-[11px] text-ink-400 truncate">{slot.room}</p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── 4. Main 2-column grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* LEFT (8 cols) */}
        <div className="lg:col-span-8 space-y-5">

          {/* Pending grading */}
          <div className="liquid-card overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-hairline">
              <Inbox className="w-4 h-4 text-brand-500" />
              <h2 className="font-semibold text-[15px] text-ink-900">{t('pending_grading')}</h2>
              {submissions.length > 0 && (
                <span className="pill-peri ml-1 tabular-nums">{submissions.length}</span>
              )}
              {submissions.length > 0 && (
                <button
                  onClick={() => navigate('/muellim/tapshiriqlar')}
                  className="ml-auto text-xs font-semibold text-brand-500 smooth-trans hover:text-brand-600"
                >
                  {t('view_all')} →
                </button>
              )}
            </div>
            {submissions.length === 0 ? (
              <EmptyState
                tier={1}
                icon={CheckCircle}
                className="!border-0 !shadow-none !py-10"
                title={t('all_graded')}
                description="Bütün cavablar qiymətləndirilib"
              />
            ) : (
              <ul>
                {submissions.map((sub, idx) => {
                  const initials = (sub.student?.full_name || '?')
                    .split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                  return (
                    <li
                      key={sub.id}
                      className="flex items-center gap-3 px-5 py-3.5 smooth-trans cursor-pointer group hover:bg-brand-50"
                      style={{
                        borderTop: idx === 0 ? 'none' : '1px solid var(--hairline)',
                      }}
                      onClick={() => navigate('/muellim/tapshiriqlar')}
                    >
                      <div className="icon-chip icon-chip-periwinkle" style={{ width: 36, height: 36, fontSize: 12, fontWeight: 700 }}>
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate text-ink-900">{sub.student?.full_name}</p>
                        <p className="text-xs mt-0.5 truncate text-ink-600">{sub.assignment?.title}</p>
                      </div>
                      {sub.assignment?.subject?.name && (
                        <span className="hidden sm:inline-flex pill-peri">
                          {sub.assignment.subject.name}
                        </span>
                      )}
                      <div className="flex-shrink-0 text-right">
                        <span className="text-[11px] whitespace-nowrap block text-ink-400">
                          {timeAgo(sub.submitted_at)}
                        </span>
                        <span className="text-[10px] font-semibold text-brand-500 opacity-0 group-hover:opacity-100 smooth-trans">
                          Qiymətləndir →
                        </span>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {/* Class engagement — submission rate per assignment (analytics, §10) */}
          {engagementData.length > 0 && (
            <div className="liquid-card overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-hairline">
                <BarChart2 className="w-4 h-4 text-brand-500" />
                <h2 className="font-semibold text-[15px] text-ink-900">Sinif iştirakı</h2>
                <span className="ml-auto text-xs text-ink-400">Təhvil faizi</span>
              </div>
              <div className="px-3 py-4">
                <ResponsiveContainer width="100%" height={Math.max(160, engagementData.length * 42)}>
                  <BarChart
                    layout="vertical"
                    data={engagementData}
                    margin={{ top: 4, right: 24, bottom: 4, left: 8 }}
                    barCategoryGap={14}
                  >
                    <CartesianGrid stroke="#ECEDF3" vertical={false} />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#9AA0B0' }}
                      tickFormatter={v => `${v}%`}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={120}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#5A6072' }}
                      tickFormatter={v => (v.length > 16 ? `${v.slice(0, 16)}…` : v)}
                    />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(20,22,40,0.04)' }} />
                    <Bar dataKey="pct" radius={[0, 4, 4, 0]} barSize={20}>
                      {engagementData.map((d, i) => (
                        <Cell key={i} fill={d.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Assignment deadlines */}
          <div className="liquid-card overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-hairline">
              <ClipboardList className="w-4 h-4 text-brand-500" />
              <h2 className="font-semibold text-[15px] text-ink-900">{t('assignment_deadlines')}</h2>
              {assignments.length > 0 && (
                <button
                  onClick={() => navigate('/muellim/tapshiriqlar')}
                  className="ml-auto text-xs font-semibold text-brand-500 smooth-trans hover:text-brand-600"
                >
                  Hamısını gör →
                </button>
              )}
            </div>
            {assignments.length === 0 ? (
              <EmptyState
                tier={1}
                icon={ClipboardList}
                className="!border-0 !shadow-none !py-10"
                title={t('no_assignments_set')}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="pastel-table">
                  <thead>
                    <tr>
                      <th>Tapşırıq</th>
                      <th className="hidden sm:table-cell">Sinif</th>
                      <th>Son Tarix</th>
                      <th className="hidden sm:table-cell">Təhvil</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map(a => {
                      const days      = daysUntil(a.due_date)
                      const overdue   = days < 0
                      const urgent    = days >= 0 && days <= 2
                      const submitted = subCounts[a.id] || 0
                      const total     = subCounts[`${a.id}_total`] || 0
                      const pct       = total > 0 ? Math.round((submitted / total) * 100) : 0
                      const hex       = subjectHex(a.subject?.name || '')
                      return (
                        <tr
                          key={a.id}
                          className="cursor-pointer"
                          onClick={() => navigate('/muellim/tapshiriqlar')}
                        >
                          <td>
                            <div className="flex items-center gap-2">
                              {a.subject?.name && (
                                <span
                                  className="w-1.5 h-8 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: hex }}
                                />
                              )}
                              <p className="font-medium truncate max-w-[160px] text-ink-900">{a.title}</p>
                            </div>
                          </td>
                          <td className="hidden sm:table-cell">
                            <span className="text-xs text-ink-600">{a.class?.name || '—'}</span>
                          </td>
                          <td>
                            <span className={overdue ? 'pill-rose' : urgent ? 'pill-peach' : 'pill-muted'}>
                              {overdue ? `${Math.abs(days)}g gecikib` : days === 0 ? 'Bu gün' : formatDate(a.due_date)}
                            </span>
                          </td>
                          <td className="hidden sm:table-cell">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium whitespace-nowrap text-ink-700 tabular-nums">{submitted}/{total}</span>
                              {total > 0 && (
                                <div className="w-14 rounded-full overflow-hidden" style={{ height: 6, background: 'var(--hairline)' }}>
                                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'var(--brand-500)' }} />
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT (4 cols) */}
        <div className="lg:col-span-4 space-y-5">

          {/* Week stats */}
          <div className="liquid-card p-5 space-y-4">
            <p className="text-[12px] font-semibold uppercase tracking-[0.04em] text-ink-400">{t('this_weeks_stats')}</p>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-ink-400">{t('total_students_stat')}</p>
                <p className="font-display font-extrabold text-3xl mt-0.5 text-ink-900 tabular-nums leading-none">
                  <CountUp to={studentCount} />
                </p>
              </div>
              <span className="icon-chip icon-chip-periwinkle">
                <Users className="w-5 h-5" />
              </span>
            </div>

            <div className="h-px bg-hairline" />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-ink-400">{t('weekly_attendance')}</p>
                <div className="flex items-end gap-2 mt-0.5">
                  <p className="font-display font-extrabold text-3xl text-ink-900 tabular-nums leading-none">
                    <CountUp to={weekAttendance} /><span className="text-xl font-semibold text-ink-400">%</span>
                  </p>
                  {weekAttendance >= 85
                    ? <span className="text-xs font-semibold mb-0.5 flex items-center gap-0.5" style={{ color: 'var(--mint)' }}><TrendingUp className="w-3 h-3" /> Yaxşı</span>
                    : weekAttendance > 0
                    ? <span className="text-xs font-semibold mb-0.5 flex items-center gap-0.5" style={{ color: '#B45309' }}><TrendingDown className="w-3 h-3" /> Aşağı</span>
                    : null
                  }
                </div>
              </div>
              <span className="icon-chip icon-chip-mint">
                <CalendarCheck className="w-5 h-5" />
              </span>
            </div>
            {weekAttendance > 0 && (
              <div className="rounded-full overflow-hidden" style={{ height: 6, background: 'var(--hairline)' }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${weekAttendance}%`,
                    background: weekAttendance >= 85 ? 'var(--mint)' : 'var(--warning)',
                  }}
                />
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="liquid-card overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-hairline">
              <Bell className="w-4 h-4 text-brand-500" />
              <h2 className="font-semibold text-[15px] text-ink-900">{t('teacher_notifications')}</h2>
              {notifications.length > 0 && (
                <span className="ml-auto text-xs text-ink-400 tabular-nums">{notifications.length}</span>
              )}
            </div>
            {notifications.length === 0 ? (
              <EmptyState
                tier={1}
                icon={Bell}
                className="!border-0 !shadow-none !py-8"
                title={t('no_notifications')}
              />
            ) : (
              <ul className="overflow-y-auto max-h-[260px] scrollbar-thin">
                {notifications.map((n, idx) => (
                  <li
                    key={n.id}
                    className="flex items-start gap-3 px-5 py-3 smooth-trans"
                    style={{ borderTop: idx === 0 ? 'none' : '1px solid var(--hairline)' }}
                  >
                    <span className={`icon-chip ${notifChipClass(n.type)}`} style={{ width: 30, height: 30, borderRadius: 10 }}>
                      <NotifIcon type={n.type} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium leading-snug line-clamp-2 text-ink-900">
                        {n.title || n.message || 'Bildiriş'}
                      </p>
                      <p className="text-[10px] mt-0.5 text-ink-400">{timeAgo(n.created_at)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>
      </div>

    </div>
  )
}
