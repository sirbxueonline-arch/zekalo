import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarCheck, BookOpen, CheckCircle, Clock,
  Users, TrendingUp, TrendingDown, ChevronRight,
  Inbox, Activity, Bell, AlertCircle, Info,
  PenLine, ClipboardList, BarChart2,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { PageSpinner } from '../../components/ui/Spinner'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
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

// ── Subject color palette ──────────────────────────────────────────────────

const SUBJ_HEX = ['#534AB7','#1D9E75','#D97706','#2563EB','#DB2777','#EA580C']
function subjectHash(name = '') {
  let h = 0; for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return Math.abs(h)
}
function subjectHex(name = '') { return SUBJ_HEX[subjectHash(name) % SUBJ_HEX.length] }

// ── Notification icon ──────────────────────────────────────────────────────

function NotifIcon({ type }) {
  if (type === 'assignment') return <BookOpen className="w-3.5 h-3.5 text-purple" />
  if (type === 'attendance') return <CalendarCheck className="w-3.5 h-3.5 text-teal" />
  if (type === 'alert')      return <AlertCircle className="w-3.5 h-3.5 text-red-500" />
  return <Info className="w-3.5 h-3.5 text-gray-400" />
}

function notifBg(type) {
  if (type === 'assignment') return 'bg-purple-light'
  if (type === 'attendance') return 'bg-teal-light'
  if (type === 'alert')      return 'bg-red-50'
  return 'bg-gray-100'
}

// ── Quick action ────────────────────────────────────────────────────────────

function QuickBtn({ icon: Icon, label, onClick, color }) {
  const bg   = color === 'teal'   ? 'bg-teal text-white hover:bg-teal/90'
             : color === 'purple' ? 'bg-purple text-white hover:bg-purple/90'
             : color === 'amber'  ? 'bg-amber-500 text-white hover:bg-amber-500/90'
             : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${bg}`}
    >
      <Icon className="w-4 h-4" /> {label}
    </button>
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

      const submissionsRes = await supabase.from('submissions')
        .select('*, assignment:assignments(title, teacher_id, subject:subjects(name)), student:profiles(full_name)')
        .eq('status', 'submitted')
        .eq('assignments.teacher_id', profile.id)
        .order('submitted_at', { ascending: false })
        .limit(6)

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
      setSubmissions((submissionsRes.data || []).filter(s => s.assignment?.teacher_id === profile.id))
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

  if (loading) return <PageSpinner />

  const firstName = profile?.full_name?.split(' ')[0] || ''

  return (
    <div className="space-y-5">

      {/* ── 1. Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">{todayLabel()}</p>
          <h1 className="font-serif text-3xl text-gray-900 mt-0.5">
            {greeting(t)}, {firstName}
          </h1>
        </div>
        <div className="flex gap-2 flex-wrap">
          <QuickBtn icon={CalendarCheck} label={t('attendance')} onClick={() => navigate('/muellim/davamiyyet')} color="purple" />
          <QuickBtn icon={BookOpen}      label={t('gradebook')}  onClick={() => navigate('/muellim/jurnal')}     color="teal"   />
          <QuickBtn icon={PenLine}       label="Tapşırıq"        onClick={() => navigate('/muellim/tapshiriqlar')} color="amber" />
        </div>
      </div>

      {/* ── 2. Mini stats ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-border-soft shadow-sm px-4 py-3.5">
          <p className="text-[11px] text-gray-400 font-medium">Cəmi Şagird</p>
          <p className="text-2xl font-bold text-gray-900 mt-0.5">{studentCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-border-soft shadow-sm px-4 py-3.5">
          <p className="text-[11px] text-gray-400 font-medium">Həftəlik Davamiyyət</p>
          <div className="flex items-end gap-1.5 mt-0.5">
            <p className={`text-2xl font-bold ${weekAttendance >= 85 ? 'text-gray-900' : 'text-red-600'}`}>{weekAttendance}<span className="text-base">%</span></p>
            {weekAttendance >= 85
              ? <TrendingUp className="w-3.5 h-3.5 text-teal mb-1" />
              : <TrendingDown className="w-3.5 h-3.5 text-red-400 mb-1" />
            }
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border-soft shadow-sm px-4 py-3.5">
          <p className="text-[11px] text-gray-400 font-medium">Qiymətləndirilməyən</p>
          <p className={`text-2xl font-bold mt-0.5 ${submissions.length > 0 ? 'text-red-600' : 'text-gray-900'}`}>{submissions.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-border-soft shadow-sm px-4 py-3.5">
          <p className="text-[11px] text-gray-400 font-medium">Aktiv Tapşırıq</p>
          <p className="text-2xl font-bold text-gray-900 mt-0.5">{assignments.length}</p>
        </div>
      </div>

      {/* ── 3. Today's timetable strip ──────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-border-soft shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border-soft">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple" />
            <h2 className="font-semibold text-gray-900 text-sm">{t('todays_lessons')}</h2>
          </div>
          <button
            onClick={() => navigate('/muellim/cedvel')}
            className="flex items-center gap-1 text-xs text-purple font-medium hover:opacity-70 transition-opacity"
          >
            {t('view_full_timetable')} <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="overflow-x-auto px-5 py-4">
          <div className="flex gap-3" style={{ minWidth: 'max-content' }}>
            {todaySlots.length === 0 ? (
              <div className="flex items-center gap-3 px-4 py-3 bg-surface rounded-xl text-sm text-gray-400">
                <CalendarCheck className="w-5 h-5" /> {t('no_lessons_today')}
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
                  className={`relative flex flex-col gap-1.5 rounded-xl px-4 py-3 w-40 flex-shrink-0 cursor-pointer transition-all border-2 ${
                    current
                      ? 'border-purple shadow-md bg-white'
                      : past
                      ? 'border-border-soft bg-gray-50 opacity-60'
                      : attDone
                      ? 'border-teal bg-teal-light/30'
                      : 'border-border-soft bg-white hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: past ? '#d1d5db' : hex }}
                    >
                      {slot.period}
                    </span>
                    {current && (
                      <span className="text-[10px] font-semibold text-purple bg-purple-light px-1.5 py-0.5 rounded-full">İndi</span>
                    )}
                    {!current && attDone && (
                      <CheckCircle className="w-3.5 h-3.5 text-teal" />
                    )}
                  </div>
                  <p className={`text-sm font-bold truncate ${past ? 'text-gray-400' : 'text-gray-900'}`}>
                    {slot.subject?.name}
                  </p>
                  <p className={`text-xs truncate ${past ? 'text-gray-300' : 'text-gray-500'}`}>
                    {slot.class?.name}
                  </p>
                  {slot.start_time && slot.end_time && (
                    <p className="text-[11px] text-gray-400">
                      {slot.start_time.slice(0, 5)}–{slot.end_time.slice(0, 5)}
                    </p>
                  )}
                  {slot.room && (
                    <p className="text-[11px] text-gray-400">🏫 {slot.room}</p>
                  )}
                  {/* Bottom accent */}
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

          {/* Gözləyən Qiymətləndirmə */}
          <div className="bg-white rounded-xl border border-border-soft shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border-soft">
              <Inbox className="w-4 h-4 text-purple" />
              <h2 className="font-semibold text-gray-900 text-sm">{t('pending_grading')}</h2>
              {submissions.length > 0 && (
                <span className="ml-1 min-w-[20px] h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1.5">
                  {submissions.length}
                </span>
              )}
              {submissions.length > 0 && (
                <button
                  onClick={() => navigate('/muellim/tapshiriqlar')}
                  className="ml-auto text-xs text-purple font-medium hover:opacity-70 transition-opacity"
                >
                  {t('view_all')} →
                </button>
              )}
            </div>
            {submissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                <CheckCircle className="w-8 h-8 text-teal opacity-60" />
                <p className="text-sm text-gray-400">{t('all_graded')}</p>
              </div>
            ) : (
              <ul className="divide-y divide-border-soft">
                {submissions.map(sub => (
                  <li
                    key={sub.id}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-surface/50 transition-colors cursor-pointer"
                    onClick={() => navigate('/muellim/tapshiriqlar')}
                  >
                    <Avatar name={sub.student?.full_name || '?'} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{sub.student?.full_name}</p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{sub.assignment?.title}</p>
                    </div>
                    {sub.assignment?.subject?.name && (
                      <Badge variant="default" className="flex-shrink-0 hidden sm:inline-flex">
                        {sub.assignment.subject.name}
                      </Badge>
                    )}
                    <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                      {timeAgo(sub.submitted_at)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Tapşırıq Son Tarixləri */}
          <div className="bg-white rounded-xl border border-border-soft shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border-soft">
              <ClipboardList className="w-4 h-4 text-teal" />
              <h2 className="font-semibold text-gray-900 text-sm">{t('assignment_deadlines')}</h2>
              {assignments.length > 0 && (
                <button
                  onClick={() => navigate('/muellim/tapshiriqlar')}
                  className="ml-auto text-xs text-purple font-medium hover:opacity-70 transition-opacity"
                >
                  Hamısını gör →
                </button>
              )}
            </div>
            {assignments.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                <ClipboardList className="w-8 h-8 text-gray-200" />
                <p className="text-sm text-gray-400">{t('no_assignments_set')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-surface border-b border-border-soft">
                      <th className="text-left text-xs text-gray-400 font-semibold px-5 py-2.5 uppercase tracking-wider">Tapşırıq</th>
                      <th className="text-left text-xs text-gray-400 font-semibold px-3 py-2.5 uppercase tracking-wider hidden sm:table-cell">Sinif</th>
                      <th className="text-left text-xs text-gray-400 font-semibold px-3 py-2.5 uppercase tracking-wider">Son Tarix</th>
                      <th className="text-left text-xs text-gray-400 font-semibold px-3 py-2.5 uppercase tracking-wider hidden sm:table-cell">Təhvil</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-soft">
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
                          className="hover:bg-surface/50 transition-colors cursor-pointer"
                          onClick={() => navigate('/muellim/tapshiriqlar')}
                        >
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              {a.subject?.name && (
                                <span
                                  className="w-1.5 h-8 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: hex }}
                                />
                              )}
                              <p className="font-medium text-gray-900 truncate max-w-[160px]">{a.title}</p>
                            </div>
                          </td>
                          <td className="px-3 py-3 hidden sm:table-cell">
                            <span className="text-xs text-gray-600">{a.class?.name || '—'}</span>
                          </td>
                          <td className="px-3 py-3">
                            <span className={`text-xs font-semibold whitespace-nowrap px-2 py-1 rounded-md ${
                              overdue  ? 'bg-red-50 text-red-700' :
                              urgent   ? 'bg-amber-50 text-amber-700' :
                                         'bg-surface text-gray-600'
                            }`}>
                              {overdue ? `${Math.abs(days)}g gecikib` : days === 0 ? 'Bu gün' : formatDate(a.due_date)}
                            </span>
                          </td>
                          <td className="px-3 py-3 hidden sm:table-cell">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-600 font-medium whitespace-nowrap">{submitted}/{total}</span>
                              {total > 0 && (
                                <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-teal rounded-full" style={{ width: `${pct}%` }} />
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
          <div className="bg-white rounded-xl border border-border-soft shadow-sm p-5 space-y-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{t('this_weeks_stats')}</p>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 font-medium">{t('total_students_stat')}</p>
                <p className="text-3xl font-bold text-gray-900 mt-0.5">{studentCount}</p>
              </div>
              <span className="w-11 h-11 rounded-xl bg-purple-light flex items-center justify-center">
                <Users className="w-5 h-5 text-purple" />
              </span>
            </div>

            <div className="h-px bg-border-soft" />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 font-medium">{t('weekly_attendance')}</p>
                <div className="flex items-end gap-2 mt-0.5">
                  <p className="text-3xl font-bold text-gray-900">{weekAttendance}<span className="text-xl font-semibold text-gray-400">%</span></p>
                  {weekAttendance >= 85
                    ? <span className="text-xs text-teal font-medium mb-0.5 flex items-center gap-0.5"><TrendingUp className="w-3 h-3" /> Yaxşı</span>
                    : weekAttendance > 0
                    ? <span className="text-xs text-red-500 font-medium mb-0.5 flex items-center gap-0.5"><TrendingDown className="w-3 h-3" /> Aşağı</span>
                    : null
                  }
                </div>
              </div>
              <span className="w-11 h-11 rounded-xl bg-teal-light flex items-center justify-center">
                <CalendarCheck className="w-5 h-5 text-teal" />
              </span>
            </div>
            {weekAttendance > 0 && (
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${weekAttendance >= 85 ? 'bg-teal' : 'bg-red-400'}`}
                  style={{ width: `${weekAttendance}%` }}
                />
              </div>
            )}
          </div>

          {/* Bildirişlər */}
          <div className="bg-white rounded-xl border border-border-soft shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border-soft">
              <Bell className="w-4 h-4 text-purple" />
              <h2 className="font-semibold text-gray-900 text-sm">{t('teacher_notifications')}</h2>
              {notifications.length > 0 && (
                <span className="ml-auto text-xs text-gray-400">{notifications.length}</span>
              )}
            </div>
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-10 text-center px-5">
                <Bell className="w-7 h-7 text-gray-200" />
                <p className="text-xs text-gray-400">{t('no_notifications')}</p>
              </div>
            ) : (
              <ul className="divide-y divide-border-soft overflow-y-auto max-h-[220px] scrollbar-thin">
                {notifications.map(n => (
                  <li key={n.id} className="flex items-start gap-3 px-5 py-3">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${notifBg(n.type)}`}>
                      <NotifIcon type={n.type} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 leading-snug line-clamp-2">
                        {n.title || n.message || 'Bildiriş'}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{timeAgo(n.created_at)}</p>
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
