import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarCheck, BookOpen, CheckCircle, Clock,
  Users, TrendingUp, TrendingDown, ChevronRight,
  Inbox, Bell, AlertCircle, Info,
  PenLine, ClipboardList,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { DashboardSkeleton } from '../../components/ui/Skeleton'
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

// ── Pastel subject palette ─────────────────────────────────────────────────

const SUBJ_HEX = ['#7c6ee0', '#5db8a3', '#e8a87c', '#6b9dde', '#c89ed4', '#d68a5a']
function subjectHash(name = '') {
  let h = 0; for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return Math.abs(h)
}
function subjectHex(name = '') { return SUBJ_HEX[subjectHash(name) % SUBJ_HEX.length] }

// Rotating chip colors for stat cards
const CHIP_COLORS = ['icon-chip-periwinkle', 'icon-chip-mint', 'icon-chip-peach', 'icon-chip-blue']

// ── Notification icon ──────────────────────────────────────────────────────

function NotifIcon({ type }) {
  if (type === 'assignment') return <BookOpen className="w-3.5 h-3.5" style={{ color: '#7c6ee0' }} />
  if (type === 'attendance') return <CalendarCheck className="w-3.5 h-3.5" style={{ color: '#5db8a3' }} />
  if (type === 'alert')      return <AlertCircle className="w-3.5 h-3.5" style={{ color: '#e56b7f' }} />
  return <Info className="w-3.5 h-3.5" style={{ color: '#94a3b8' }} />
}

function notifChipClass(type) {
  if (type === 'assignment') return 'icon-chip-periwinkle'
  if (type === 'attendance') return 'icon-chip-mint'
  if (type === 'alert')      return 'icon-chip-peach'
  return ''
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

  return (
    <div className="space-y-5">

      {/* ── 1. Hero greeting card (liquid-glass) ─────────────────────────── */}
      <div className="liquid-card relative overflow-hidden p-6">
        {/* Decorative pastel blobs inside the card */}
        <div className="section-blob" style={{ top: '-30%', right: '-10%', width: '40%', height: '180%', background: 'radial-gradient(ellipse at center, rgba(124,110,224,0.18) 0%, transparent 65%)' }} />
        <div className="section-blob" style={{ bottom: '-50%', left: '20%', width: '40%', height: '180%', background: 'radial-gradient(ellipse at center, rgba(93,184,163,0.16) 0%, transparent 65%)' }} />

        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: '#64748b' }}>{todayLabel()}</p>
            <h1 className="text-3xl md:text-4xl font-bold mt-1" style={{ color: '#1a1a2e' }}>
              {greeting(t)}, <span className="pastel-text">{firstName}</span>
            </h1>
            {todaySlots.length > 0 && (
              <p className="text-sm mt-2 flex items-center gap-1.5" style={{ color: '#64748b' }}>
                <Clock className="w-3.5 h-3.5" />
                Bu gün {todaySlots.length} dərs var
              </p>
            )}
          </div>

          {/* Quick action buttons */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => navigate('/muellim/davamiyyet')}
              className="btn-ghost-pastel"
              style={{ padding: '10px 18px', fontSize: '13px' }}
            >
              <CalendarCheck className="w-4 h-4" /> {t('attendance')}
            </button>
            <button
              onClick={() => navigate('/muellim/jurnal')}
              className="btn-ghost-pastel"
              style={{ padding: '10px 18px', fontSize: '13px' }}
            >
              <BookOpen className="w-4 h-4" /> {t('gradebook')}
            </button>
            <button
              onClick={() => navigate('/muellim/tapshiriqlar')}
              className="btn-pastel"
              style={{ padding: '10px 18px', fontSize: '13px' }}
            >
              <PenLine className="w-4 h-4" /> Tapşırıq
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. Stats row ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Bu günki dərs', value: todaySlots.length, icon: Clock, chip: 'icon-chip-periwinkle' },
          { label: 'Gözləyən', value: submissions.length, icon: Inbox, chip: submissions.length > 0 ? 'icon-chip-peach' : 'icon-chip-mint', alert: submissions.length > 0 },
          { label: 'Cəmi Şagird', value: studentCount, icon: Users, chip: 'icon-chip-mint' },
          {
            label: 'Həftəlik dav.',
            value: weekAttendance,
            suffix: '%',
            icon: weekAttendance >= 85 ? TrendingUp : TrendingDown,
            chip: weekAttendance >= 85 ? 'icon-chip-blue' : 'icon-chip-peach',
          },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <div key={i} className="liquid-card p-4 flex items-start gap-3">
              <span className={`icon-chip ${stat.chip}`}>
                <Icon className="w-5 h-5" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider truncate" style={{ color: '#64748b' }}>{stat.label}</p>
                <p className="text-2xl font-bold mt-0.5 leading-none" style={{ color: stat.alert ? '#b83b54' : '#1a1a2e' }}>
                  {stat.value}{stat.suffix && <span className="text-sm font-semibold" style={{ color: '#94a3b8' }}>{stat.suffix}</span>}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── 3. Today's timetable strip ──────────────────────────────────── */}
      <div className="liquid-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'rgba(124,110,224,0.12)' }}>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" style={{ color: '#7c6ee0' }} />
            <h2 className="font-semibold text-sm" style={{ color: '#1a1a2e' }}>{t('todays_lessons')}</h2>
          </div>
          <button
            onClick={() => navigate('/muellim/cedvel')}
            className="flex items-center gap-1 text-xs font-semibold smooth-trans hover:opacity-70"
            style={{ color: '#7c6ee0' }}
          >
            {t('view_full_timetable')} <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="overflow-x-auto px-5 py-4">
          <div className="flex gap-3" style={{ minWidth: 'max-content' }}>
            {todaySlots.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 w-full py-8">
                <div className="icon-chip icon-chip-periwinkle" style={{ width: 56, height: 56 }}>
                  <CalendarCheck className="w-7 h-7" />
                </div>
                <p className="text-sm" style={{ color: '#64748b' }}>{t('no_lessons_today')}</p>
              </div>
            ) : todaySlots.map(slot => {
              const current = isCurrentPeriod(slot)
              const past    = !current && isPastPeriod(slot)
              const hex     = subjectHex(slot.subject?.name || '')
              const attDone = attendanceTaken[slot.class_id]
              return (
                <div
                  key={slot.id}
                  onClick={() => navigate('/muellim/davamiyyet')}
                  className="relative flex flex-col gap-1.5 rounded-2xl px-4 py-3 w-40 flex-shrink-0 cursor-pointer smooth-trans"
                  style={{
                    background: current
                      ? 'linear-gradient(135deg, rgba(124,110,224,0.12), rgba(93,184,163,0.10))'
                      : past
                      ? 'rgba(248,247,251,0.4)'
                      : attDone
                      ? 'rgba(93,184,163,0.10)'
                      : 'rgba(255,255,255,0.55)',
                    border: current
                      ? '1.5px solid rgba(124,110,224,0.45)'
                      : '1px solid rgba(124,110,224,0.12)',
                    backdropFilter: 'blur(12px)',
                    boxShadow: current ? '0 4px 16px rgba(124,110,224,0.18)' : 'none',
                    opacity: past ? 0.55 : 1,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: past ? '#cbd5e1' : hex }}
                    >
                      {slot.period}
                    </span>
                    {current && (
                      <span className="pastel-badge pastel-badge-periwinkle" style={{ fontSize: 10 }}>İndi</span>
                    )}
                    {!current && attDone && (
                      <CheckCircle className="w-3.5 h-3.5" style={{ color: '#5db8a3' }} />
                    )}
                  </div>
                  <p className="text-sm font-bold truncate" style={{ color: past ? '#94a3b8' : '#1a1a2e' }}>
                    {slot.subject?.name}
                  </p>
                  <p className="text-xs truncate" style={{ color: past ? '#cbd5e1' : '#64748b' }}>
                    {slot.class?.name}
                  </p>
                  {slot.start_time && slot.end_time && (
                    <p className="text-[11px]" style={{ color: '#94a3b8' }}>
                      {slot.start_time.slice(0, 5)}–{slot.end_time.slice(0, 5)}
                    </p>
                  )}
                  {slot.room && (
                    <p className="text-[11px]" style={{ color: '#94a3b8' }}>🏫 {slot.room}</p>
                  )}
                  {!past && (
                    <div className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full" style={{ backgroundColor: hex, opacity: 0.5 }} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── 4. Main 2-column grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* LEFT (8 cols) */}
        <div className="lg:col-span-8 space-y-5">

          {/* Pending grading */}
          <div className="liquid-card overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b" style={{ borderColor: 'rgba(124,110,224,0.12)' }}>
              <Inbox className="w-4 h-4" style={{ color: '#7c6ee0' }} />
              <h2 className="font-semibold text-sm" style={{ color: '#1a1a2e' }}>{t('pending_grading')}</h2>
              {submissions.length > 0 && (
                <span className="pastel-badge pastel-badge-rose ml-1">{submissions.length}</span>
              )}
              {submissions.length > 0 && (
                <button
                  onClick={() => navigate('/muellim/tapshiriqlar')}
                  className="ml-auto text-xs font-semibold smooth-trans hover:opacity-70"
                  style={{ color: '#7c6ee0' }}
                >
                  {t('view_all')} →
                </button>
              )}
            </div>
            {submissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                <div className="icon-chip icon-chip-mint" style={{ width: 56, height: 56 }}>
                  <CheckCircle className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#1a1a2e' }}>{t('all_graded')}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>Bütün cavablar qiymətləndirilib</p>
                </div>
              </div>
            ) : (
              <ul>
                {submissions.map((sub, idx) => {
                  const initials = (sub.student?.full_name || '?')
                    .split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                  return (
                    <li
                      key={sub.id}
                      className="flex items-center gap-3 px-5 py-3.5 smooth-trans cursor-pointer group"
                      style={{
                        borderTop: idx === 0 ? 'none' : '1px solid rgba(124,110,224,0.08)',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,110,224,0.04)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      onClick={() => navigate('/muellim/tapshiriqlar')}
                    >
                      <div className="icon-chip icon-chip-periwinkle" style={{ width: 36, height: 36, fontSize: 12, fontWeight: 700 }}>
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: '#1a1a2e' }}>{sub.student?.full_name}</p>
                        <p className="text-xs mt-0.5 truncate" style={{ color: '#64748b' }}>{sub.assignment?.title}</p>
                      </div>
                      {sub.assignment?.subject?.name && (
                        <span className="hidden sm:inline-flex pastel-badge pastel-badge-periwinkle">
                          {sub.assignment.subject.name}
                        </span>
                      )}
                      <div className="flex-shrink-0 text-right">
                        <span className="text-[11px] whitespace-nowrap block" style={{ color: '#94a3b8' }}>
                          {timeAgo(sub.submitted_at)}
                        </span>
                        <span className="text-[10px] font-semibold opacity-0 group-hover:opacity-100 smooth-trans" style={{ color: '#7c6ee0' }}>
                          Qiymətləndir →
                        </span>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {/* Assignment deadlines */}
          <div className="liquid-card overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b" style={{ borderColor: 'rgba(124,110,224,0.12)' }}>
              <ClipboardList className="w-4 h-4" style={{ color: '#5db8a3' }} />
              <h2 className="font-semibold text-sm" style={{ color: '#1a1a2e' }}>{t('assignment_deadlines')}</h2>
              {assignments.length > 0 && (
                <button
                  onClick={() => navigate('/muellim/tapshiriqlar')}
                  className="ml-auto text-xs font-semibold smooth-trans hover:opacity-70"
                  style={{ color: '#7c6ee0' }}
                >
                  Hamısını gör →
                </button>
              )}
            </div>
            {assignments.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                <div className="icon-chip icon-chip-blue" style={{ width: 56, height: 56 }}>
                  <ClipboardList className="w-7 h-7" />
                </div>
                <p className="text-sm" style={{ color: '#64748b' }}>{t('no_assignments_set')}</p>
              </div>
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
                              <p className="font-medium truncate max-w-[160px]" style={{ color: '#1a1a2e' }}>{a.title}</p>
                            </div>
                          </td>
                          <td className="hidden sm:table-cell">
                            <span className="text-xs" style={{ color: '#64748b' }}>{a.class?.name || '—'}</span>
                          </td>
                          <td>
                            <span className={overdue ? 'pastel-badge pastel-badge-rose' : urgent ? 'pastel-badge pastel-badge-peach' : 'pastel-badge pastel-badge-slate'}>
                              {overdue ? `${Math.abs(days)}g gecikib` : days === 0 ? 'Bu gün' : formatDate(a.due_date)}
                            </span>
                          </td>
                          <td className="hidden sm:table-cell">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium whitespace-nowrap" style={{ color: '#475569' }}>{submitted}/{total}</span>
                              {total > 0 && (
                                <div className="w-14 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(124,110,224,0.10)' }}>
                                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #7c6ee0, #5db8a3)' }} />
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
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#64748b' }}>{t('this_weeks_stats')}</p>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium" style={{ color: '#94a3b8' }}>{t('total_students_stat')}</p>
                <p className="text-3xl font-bold mt-0.5" style={{ color: '#1a1a2e' }}>{studentCount}</p>
              </div>
              <span className="icon-chip icon-chip-periwinkle">
                <Users className="w-5 h-5" />
              </span>
            </div>

            <div className="h-px" style={{ background: 'rgba(124,110,224,0.12)' }} />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium" style={{ color: '#94a3b8' }}>{t('weekly_attendance')}</p>
                <div className="flex items-end gap-2 mt-0.5">
                  <p className="text-3xl font-bold" style={{ color: '#1a1a2e' }}>{weekAttendance}<span className="text-xl font-semibold" style={{ color: '#94a3b8' }}>%</span></p>
                  {weekAttendance >= 85
                    ? <span className="text-xs font-medium mb-0.5 flex items-center gap-0.5" style={{ color: '#3d8a73' }}><TrendingUp className="w-3 h-3" /> Yaxşı</span>
                    : weekAttendance > 0
                    ? <span className="text-xs font-medium mb-0.5 flex items-center gap-0.5" style={{ color: '#b83b54' }}><TrendingDown className="w-3 h-3" /> Aşağı</span>
                    : null
                  }
                </div>
              </div>
              <span className="icon-chip icon-chip-mint">
                <CalendarCheck className="w-5 h-5" />
              </span>
            </div>
            {weekAttendance > 0 && (
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(124,110,224,0.10)' }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${weekAttendance}%`,
                    background: weekAttendance >= 85
                      ? 'linear-gradient(90deg, #5db8a3, #6b9dde)'
                      : 'linear-gradient(90deg, #e8a87c, #e56b7f)',
                  }}
                />
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="liquid-card overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b" style={{ borderColor: 'rgba(124,110,224,0.12)' }}>
              <Bell className="w-4 h-4" style={{ color: '#7c6ee0' }} />
              <h2 className="font-semibold text-sm" style={{ color: '#1a1a2e' }}>{t('teacher_notifications')}</h2>
              {notifications.length > 0 && (
                <span className="ml-auto text-xs" style={{ color: '#94a3b8' }}>{notifications.length}</span>
              )}
            </div>
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-10 text-center px-5">
                <div className="icon-chip icon-chip-periwinkle" style={{ width: 48, height: 48 }}>
                  <Bell className="w-5 h-5" />
                </div>
                <p className="text-xs" style={{ color: '#94a3b8' }}>{t('no_notifications')}</p>
              </div>
            ) : (
              <ul className="overflow-y-auto max-h-[260px] scrollbar-thin">
                {notifications.map((n, idx) => (
                  <li
                    key={n.id}
                    className="flex items-start gap-3 px-5 py-3 smooth-trans"
                    style={{ borderTop: idx === 0 ? 'none' : '1px solid rgba(124,110,224,0.08)' }}
                  >
                    <span className={`icon-chip ${notifChipClass(n.type)}`} style={{ width: 30, height: 30, borderRadius: 10 }}>
                      <NotifIcon type={n.type} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium leading-snug line-clamp-2" style={{ color: '#1a1a2e' }}>
                        {n.title || n.message || 'Bildiriş'}
                      </p>
                      <p className="text-[10px] mt-0.5" style={{ color: '#94a3b8' }}>{timeAgo(n.created_at)}</p>
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
