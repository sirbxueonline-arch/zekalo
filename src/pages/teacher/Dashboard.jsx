import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarCheck, BookOpen, CheckCircle, Clock,
  Users, TrendingUp, TrendingDown, ChevronRight,
  Inbox, Activity, Bell, AlertCircle, Info,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { PageSpinner } from '../../components/ui/Spinner'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'

// ── Helpers ────────────────────────────────────────────────────────────────

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Sabahınız xeyir'
  if (h < 18) return 'Günortanız xeyir'
  return 'Axşamınız xeyir'
}

function todayLabel() {
  return new Date().toLocaleDateString('az-AZ', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
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

// ── Notification icon ──────────────────────────────────────────────────────

function NotifIcon({ type }) {
  if (type === 'assignment') return <BookOpen className="w-4 h-4 text-purple" />
  if (type === 'attendance') return <CalendarCheck className="w-4 h-4 text-teal" />
  if (type === 'alert')      return <AlertCircle className="w-4 h-4 text-red-500" />
  return <Info className="w-4 h-4 text-gray-400" />
}

function notifBg(type) {
  if (type === 'assignment') return 'bg-purple-light'
  if (type === 'attendance') return 'bg-teal-light'
  if (type === 'alert')      return 'bg-red-50'
  return 'bg-gray-100'
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
  const [subCounts, setSubCounts]             = useState({}) // { [assignment_id]: { submitted, total } }

  useEffect(() => {
    if (profile?.id) loadDashboard()
  }, [profile?.id])

  async function loadDashboard() {
    try {
      const today      = new Date()
      const dayOfWeek  = today.getDay()
      const todayStr   = today.toISOString().split('T')[0]

      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - today.getDay() + 1)
      const weekStartStr = weekStart.toISOString().split('T')[0]

      // Fetch timetable, class IDs, assignments, notifications in parallel
      const [timetableRes, classesRes, assignmentsRes, notifsRes] = await Promise.all([
        supabase.from('timetable_slots')
          .select('*, subject:subjects(name), class:classes(name)')
          .eq('teacher_id', profile.id)
          .eq('day_of_week', dayOfWeek)
          .eq('published', true)
          .order('period'),
        supabase.from('teacher_classes')
          .select('class_id')
          .eq('teacher_id', profile.id),
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

      // Submissions needing grading
      const submissionsRes = await supabase.from('submissions')
        .select('*, assignment:assignments(title, teacher_id, subject:subjects(name)), student:profiles(full_name)')
        .eq('status', 'submitted')
        .eq('assignments.teacher_id', profile.id)
        .order('submitted_at', { ascending: false })
        .limit(5)

      // Attendance check for today
      const slotClassIds = [...new Set((timetableRes.data || []).map(s => s.class_id))]
      const attTodayRes = slotClassIds.length
        ? await supabase.from('attendance').select('class_id').in('class_id', slotClassIds).eq('date', todayStr)
        : { data: [] }

      const attendanceMap = {}
      ;(attTodayRes.data || []).forEach(r => { attendanceMap[r.class_id] = true })

      // Submission counts per assignment for the deadlines table
      const assignmentIds = (assignmentsRes.data || []).map(a => a.id)
      let subCountMap = {}
      if (assignmentIds.length) {
        const [submittedRes, totalMembersRes] = await Promise.all([
          supabase.from('submissions')
            .select('assignment_id')
            .in('assignment_id', assignmentIds),
          supabase.from('class_members')
            .select('class_id')
            .in('class_id', classIds),
        ])

        const submitted = submittedRes.data || []
        submitted.forEach(s => {
          subCountMap[s.assignment_id] = (subCountMap[s.assignment_id] || 0) + 1
        })

        // Count total students per class for assignment totals
        const classMemberCounts = {}
        ;(totalMembersRes.data || []).forEach(m => {
          classMemberCounts[m.class_id] = (classMemberCounts[m.class_id] || 0) + 1
        })

        // Attach total to each assignment's class
        ;(assignmentsRes.data || []).forEach(a => {
          const cid = a.class?.id
          subCountMap[`${a.id}_total`] = classMemberCounts[cid] || 0
        })
      }

      // Class-level stats
      let totalStudents = 0
      let weekAtt = 0

      if (classIds.length) {
        const [membersRes, weekAttRes] = await Promise.all([
          supabase.from('class_members')
            .select('id', { count: 'exact', head: true })
            .in('class_id', classIds),
          supabase.from('attendance')
            .select('status')
            .in('class_id', classIds)
            .gte('date', weekStartStr)
            .lte('date', todayStr),
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
    <div className="space-y-6">

      {/* ── 1. Compact header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">
            {todayLabel()}
          </p>
          <h1 className="font-serif text-3xl text-gray-900 mt-0.5">
            {greeting()}, {firstName} müəllim
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/muellim/davamiyyet')}
            className="flex items-center gap-2 bg-purple text-white px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <CalendarCheck className="w-4 h-4" /> Davamiyyət
          </button>
          <button
            onClick={() => navigate('/muellim/jurnal')}
            className="flex items-center gap-2 bg-teal text-white px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <BookOpen className="w-4 h-4" /> Jurnal
          </button>
        </div>
      </div>

      {/* ── 2. Today's schedule strip ──────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-border-soft shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-purple" />
            <h2 className="font-semibold text-gray-900 text-sm">Bugünkü Dərslər</h2>
          </div>
          <button
            onClick={() => navigate('/muellim/cedvel')}
            className="flex items-center gap-1 text-xs text-purple font-medium hover:opacity-70 transition-opacity"
          >
            Tam cədvəl <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <div className="flex gap-3 pb-2 min-w-max">
            {todaySlots.map(slot => (
              <div
                key={slot.id}
                className={`flex-shrink-0 w-36 p-3 rounded-xl border-2 cursor-pointer hover:shadow-sm transition-all ${
                  attendanceTaken[slot.class_id]
                    ? 'border-teal bg-teal-light'
                    : 'border-border-soft bg-white'
                }`}
                onClick={() => navigate('/muellim/davamiyyet')}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="w-6 h-6 bg-purple text-white text-xs font-bold rounded-lg flex items-center justify-center">
                    {slot.period}
                  </span>
                  {attendanceTaken[slot.class_id]
                    ? <CheckCircle className="w-4 h-4 text-teal" />
                    : <Clock className="w-4 h-4 text-gray-300" />
                  }
                </div>
                <p className="text-xs font-bold text-gray-900 truncate">{slot.subject?.name}</p>
                <p className="text-xs text-gray-500 truncate">{slot.class?.name}</p>
                {slot.room && (
                  <p className="text-[10px] text-gray-400 mt-0.5">🏫 {slot.room}</p>
                )}
              </div>
            ))}
            {todaySlots.length === 0 && (
              <div className="flex items-center gap-3 px-4 py-3 bg-surface rounded-xl text-sm text-gray-400">
                <CalendarCheck className="w-5 h-5" /> Bu gün dərs yoxdur
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 3. Main 2-column grid ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT (8 cols) ─────────────────────────────────────────────────── */}
        <div className="lg:col-span-8 space-y-6">

          {/* Gözləyən Qiymətləndirmə */}
          <div className="bg-white rounded-2xl border border-border-soft shadow-sm flex flex-col">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-border-soft">
              <Inbox className="w-4 h-4 text-purple flex-shrink-0" />
              <h2 className="font-semibold text-gray-900 text-sm">Gözləyən Qiymətləndirmə</h2>
              {submissions.length > 0 && (
                <span className="ml-1.5 flex-shrink-0 min-w-[20px] h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1.5">
                  {submissions.length}
                </span>
              )}
              {submissions.length > 0 && (
                <button
                  onClick={() => navigate('/muellim/tapshiriqlar')}
                  className="ml-auto text-xs text-purple font-medium hover:opacity-70 transition-opacity whitespace-nowrap"
                >
                  Hamısına bax →
                </button>
              )}
            </div>

            {submissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-12 px-6 text-center">
                <CheckCircle className="w-8 h-8 text-teal opacity-60" />
                <p className="text-sm text-gray-400">Bütün qiymətləndirmələr tamamlanıb</p>
              </div>
            ) : (
              <ul className="divide-y divide-border-soft">
                {submissions.map(sub => (
                  <li
                    key={sub.id}
                    className="flex items-center gap-3 px-6 py-3 hover:bg-surface/50 transition-colors cursor-pointer"
                    onClick={() => navigate('/muellim/tapshiriqlar')}
                  >
                    <Avatar name={sub.student?.full_name || '?'} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {sub.student?.full_name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {sub.assignment?.title}
                      </p>
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
          <div className="bg-white rounded-2xl border border-border-soft shadow-sm flex flex-col">
            <div className="flex items-center gap-2 px-6 py-4 border-b border-border-soft">
              <Activity className="w-4 h-4 text-teal flex-shrink-0" />
              <h2 className="font-semibold text-gray-900 text-sm">Tapşırıq Son Tarixləri</h2>
            </div>

            {assignments.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-12 px-6 text-center">
                <CheckCircle className="w-8 h-8 text-gray-200" />
                <p className="text-sm text-gray-400">Tapşırıq yoxdur</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border-soft">
                      <th className="text-left text-xs text-gray-400 font-medium px-6 py-3 uppercase tracking-wider">Tapşırıq</th>
                      <th className="text-left text-xs text-gray-400 font-medium px-4 py-3 uppercase tracking-wider hidden sm:table-cell">Sinif</th>
                      <th className="text-left text-xs text-gray-400 font-medium px-4 py-3 uppercase tracking-wider hidden md:table-cell">Fənn</th>
                      <th className="text-left text-xs text-gray-400 font-medium px-4 py-3 uppercase tracking-wider">Son Tarix</th>
                      <th className="text-left text-xs text-gray-400 font-medium px-4 py-3 uppercase tracking-wider hidden sm:table-cell">Təhvil</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-soft">
                    {assignments.map(a => {
                      const days     = daysUntil(a.due_date)
                      const overdue  = days < 0
                      const urgent   = days >= 0 && days <= 2
                      const submitted = subCounts[a.id] || 0
                      const total     = subCounts[`${a.id}_total`] || 0
                      const pct       = total > 0 ? Math.round((submitted / total) * 100) : 0

                      return (
                        <tr
                          key={a.id}
                          className="hover:bg-surface/50 transition-colors cursor-pointer"
                          onClick={() => navigate('/muellim/tapshiriqlar')}
                        >
                          <td className="px-6 py-3">
                            <p className="font-medium text-gray-900 truncate max-w-[180px]">{a.title}</p>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <span className="text-xs text-gray-600">{a.class?.name || '—'}</span>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            {a.subject?.name ? (
                              <Badge variant="default">{a.subject.name}</Badge>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-semibold whitespace-nowrap ${
                              overdue  ? 'text-red-600' :
                              urgent   ? 'text-amber-600' :
                                         'text-gray-600'
                            }`}>
                              {overdue
                                ? `${Math.abs(days)} gün gecikib`
                                : days === 0
                                  ? 'Bu gün'
                                  : formatDate(a.due_date)
                              }
                            </span>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-600 font-medium whitespace-nowrap">
                                {submitted}/{total}
                              </span>
                              {total > 0 && (
                                <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-teal rounded-full transition-all"
                                    style={{ width: `${pct}%` }}
                                  />
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

        {/* RIGHT (4 cols) ─────────────────────────────────────────────────── */}
        <div className="lg:col-span-4 space-y-6">

          {/* Bu həftənin statistikası — 2 stacked stat cards */}
          <div className="space-y-4">
            <h2 className="text-xs tracking-widest text-gray-400 uppercase font-semibold px-1">
              Bu həftənin statistikası
            </h2>

            {/* Total students */}
            <div className="bg-white rounded-2xl border border-border-soft shadow-sm p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">
                    Ümumi şagird
                  </p>
                  <p className="text-4xl font-bold text-gray-900 leading-none">{studentCount}</p>
                </div>
                <span className="w-12 h-12 rounded-xl bg-purple-light flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-purple" />
                </span>
              </div>
            </div>

            {/* Week attendance */}
            <div className="bg-white rounded-2xl border border-border-soft shadow-sm p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">
                    Həftəlik davamiyyət
                  </p>
                  <div className="flex items-end gap-2">
                    <p className="text-4xl font-bold text-gray-900 leading-none">
                      {weekAttendance}<span className="text-2xl font-semibold text-gray-500">%</span>
                    </p>
                    {weekAttendance >= 85 ? (
                      <span className="flex items-center gap-0.5 text-xs text-teal mb-0.5 font-medium">
                        <TrendingUp className="w-3.5 h-3.5" /> Yaxşı
                      </span>
                    ) : weekAttendance > 0 ? (
                      <span className="flex items-center gap-0.5 text-xs text-red-500 mb-0.5 font-medium">
                        <TrendingDown className="w-3.5 h-3.5" /> Aşağı
                      </span>
                    ) : null}
                  </div>
                </div>
                <span className="w-12 h-12 rounded-xl bg-teal-light flex items-center justify-center flex-shrink-0">
                  <CalendarCheck className="w-5 h-5 text-teal" />
                </span>
              </div>
              {weekAttendance > 0 && (
                <div className="mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${weekAttendance >= 85 ? 'bg-teal' : 'bg-red-400'}`}
                    style={{ width: `${weekAttendance}%` }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Müəllim Bildirişləri */}
          <div className="bg-white rounded-2xl border border-border-soft shadow-sm flex flex-col">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-border-soft">
              <Bell className="w-4 h-4 text-purple flex-shrink-0" />
              <h2 className="font-semibold text-gray-900 text-sm">Müəllim Bildirişləri</h2>
              {notifications.length > 0 && (
                <span className="ml-auto text-xs text-gray-400">{notifications.length}</span>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-10 px-5 text-center">
                <Bell className="w-7 h-7 text-gray-200" />
                <p className="text-xs text-gray-400">Bildiriş yoxdur</p>
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
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {timeAgo(n.created_at)}
                      </p>
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
