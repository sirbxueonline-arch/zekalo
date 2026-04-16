import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarCheck, BookOpen, CheckCircle, Clock,
  Users, TrendingUp, TrendingDown, ChevronRight, Inbox,
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

// ── Quick-action card ──────────────────────────────────────────────────────

function QuickAction({ icon: Icon, label, bg, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-4 p-5 rounded-2xl text-white shadow-sm hover:opacity-90 active:scale-[.98] transition-all ${bg}`}
    >
      <span className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5" />
      </span>
      <span className="text-sm font-semibold leading-snug text-left">{label}</span>
      <ChevronRight className="w-4 h-4 ml-auto opacity-70" />
    </button>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

export default function TeacherDashboard() {
  const { profile, t } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading]           = useState(true)
  const [todaySlots, setTodaySlots]     = useState([])
  const [attendanceTaken, setAttendanceTaken] = useState({})
  const [assignments, setAssignments]   = useState([])
  const [submissions, setSubmissions]   = useState([])
  const [studentCount, setStudentCount] = useState(0)
  const [weekAttendance, setWeekAttendance] = useState(0)

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

      // Fetch timetable, class IDs, assignments, submissions in parallel
      const [timetableRes, classesRes, assignmentsRes] = await Promise.all([
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
          .select('*, subject:subjects(name)')
          .eq('teacher_id', profile.id)
          .gte('due_date', new Date().toISOString())
          .order('due_date')
          .limit(5),
      ])

      const classIds = (classesRes.data || []).map(c => c.class_id)

      // Submissions needing grading — scoped to teacher's assignments
      const submissionsRes = await supabase.from('submissions')
        .select('*, assignment:assignments(title, teacher_id, subject:subjects(name)), student:profiles(full_name)')
        .eq('status', 'submitted')
        .eq('assignments.teacher_id', profile.id)
        .order('submitted_at', { ascending: false })
        .limit(5)

      // Attendance check for today's timetable classes
      const slotClassIds = [...new Set((timetableRes.data || []).map(s => s.class_id))]
      const attTodayRes = slotClassIds.length
        ? await supabase.from('attendance').select('class_id').in('class_id', slotClassIds).eq('date', todayStr)
        : { data: [] }

      const attendanceMap = {}
      ;(attTodayRes.data || []).forEach(r => { attendanceMap[r.class_id] = true })

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
    } catch (err) {
      console.error('Teacher dashboard error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <PageSpinner />

  const firstName = profile?.full_name?.split(' ')[0] || ''

  return (
    <div className="space-y-8">

      {/* ── 1. Welcome header ─────────────────────────────────────────────── */}
      <div>
        <p className="text-sm text-gray-400 mb-1">{todayLabel()}</p>
        <h1 className="font-serif text-4xl text-gray-900 leading-tight">
          Xoş gəldiniz, {firstName} müəllim!
        </h1>
      </div>

      {/* ── 2. Two wide quick-action cards ────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <QuickAction
          icon={CalendarCheck}
          label="Davamiyyət qeyd et"
          bg="bg-purple"
          onClick={() => navigate('/muellim/davamiyyet')}
        />
        <QuickAction
          icon={BookOpen}
          label="Qiymət daxil et"
          bg="bg-teal"
          onClick={() => navigate('/muellim/jurnal')}
        />
      </div>

      {/* ── 3. Three-column widget grid ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT — Gözləyən Təhviller */}
        <div className="bg-white rounded-2xl border border-border-soft shadow-sm flex flex-col">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-border-soft">
            <Inbox className="w-4 h-4 text-purple flex-shrink-0" />
            <h2 className="font-semibold text-gray-900 text-sm">Gözləyən Təhviller</h2>
            {submissions.length > 0 && (
              <Badge variant="absent" className="ml-auto">{submissions.length}</Badge>
            )}
          </div>
          {submissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 px-6 text-center">
              <CheckCircle className="w-8 h-8 text-teal opacity-60" />
              <p className="text-sm text-gray-400">Bütün təhvillər yoxlanılıb</p>
            </div>
          ) : (
            <ul className="divide-y divide-border-soft overflow-y-auto max-h-[340px]">
              {submissions.map(sub => (
                <li
                  key={sub.id}
                  className="flex items-start gap-3 px-6 py-3 hover:bg-surface/50 transition-colors cursor-pointer"
                  onClick={() => navigate('/muellim/tapshiriqlar')}
                >
                  <Avatar name={sub.student?.full_name || '?'} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {sub.student?.full_name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {sub.assignment?.title}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0 mt-0.5">
                    {timeAgo(sub.submitted_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* CENTER — Günün Cədvəli */}
        <div className="bg-white rounded-2xl border border-border-soft shadow-sm flex flex-col">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-border-soft">
            <CalendarCheck className="w-4 h-4 text-purple flex-shrink-0" />
            <h2 className="font-semibold text-gray-900 text-sm">Günün Cədvəli</h2>
            <span className="ml-auto text-xs text-gray-400">
              {new Date().toLocaleDateString('az-AZ', { weekday: 'short' })}
            </span>
          </div>
          {todaySlots.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-12 px-6">
              Bu gün dərs yoxdur
            </p>
          ) : (
            <ul className="divide-y divide-border-soft overflow-y-auto max-h-[400px]">
              {todaySlots.map(slot => (
                <li
                  key={slot.id}
                  className="flex items-center justify-between px-6 py-3 hover:bg-surface/50 transition-colors cursor-pointer"
                  onClick={() => navigate('/muellim/davamiyyet')}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-purple text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {slot.period}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{slot.subject?.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {slot.class?.name}
                        {slot.room ? ` · Otaq ${slot.room}` : ''}
                      </p>
                    </div>
                  </div>
                  {attendanceTaken[slot.class_id] ? (
                    <div className="flex items-center gap-1.5 bg-teal-light text-teal px-3 py-1 rounded-full flex-shrink-0">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">Qeyd olunub</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 bg-gray-50 text-gray-400 px-3 py-1 rounded-full flex-shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-xs">Gözləyir</span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* RIGHT — Yaxın Son Tarixlər */}
        <div className="bg-white rounded-2xl border border-border-soft shadow-sm flex flex-col">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-border-soft">
            <BookOpen className="w-4 h-4 text-teal flex-shrink-0" />
            <h2 className="font-semibold text-gray-900 text-sm">Yaxın Son Tarixlər</h2>
          </div>
          {assignments.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-12 px-6">
              Yaxın tapşırıq yoxdur
            </p>
          ) : (
            <ul className="divide-y divide-border-soft overflow-y-auto max-h-[340px]">
              {assignments.map(a => (
                <li
                  key={a.id}
                  className="flex items-start gap-3 px-6 py-3 hover:bg-surface/50 transition-colors cursor-pointer"
                  onClick={() => navigate('/muellim/tapshiriqlar')}
                >
                  <div className="flex-1 min-w-0">
                    {a.subject?.name && (
                      <Badge variant="default" className="mb-1">{a.subject.name}</Badge>
                    )}
                    <p className="text-sm font-medium text-gray-900 truncate">{a.title}</p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0 mt-0.5 font-medium">
                    {formatDate(a.due_date)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ── 4. Bottom — Bu həftənin statistikası ─────────────────────────── */}
      <div>
        <h2 className="text-xs tracking-widest text-gray-400 uppercase font-semibold mb-4">
          Bu həftənin statistikası
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Total students */}
          <div className="bg-white rounded-2xl p-6 border border-border-soft shadow-sm flex items-center gap-5">
            <span className="w-12 h-12 rounded-xl bg-purple-light flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-purple" />
            </span>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">
                {t ? t('total_students') : 'Ümumi Şagird'}
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-0.5">{studentCount}</p>
            </div>
          </div>

          {/* Week attendance */}
          <div className="bg-white rounded-2xl p-6 border border-border-soft shadow-sm flex items-center gap-5">
            <span className="w-12 h-12 rounded-xl bg-teal-light flex items-center justify-center flex-shrink-0">
              <CalendarCheck className="w-5 h-5 text-teal" />
            </span>
            <div className="flex-1">
              <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">
                Həftəlik Davamiyyət
              </p>
              <div className="flex items-end gap-2 mt-0.5">
                <p className="text-3xl font-bold text-gray-900">{weekAttendance}%</p>
                {weekAttendance >= 85 ? (
                  <span className="flex items-center gap-0.5 text-xs text-teal mb-1">
                    <TrendingUp className="w-3.5 h-3.5" /> Yaxşı
                  </span>
                ) : (
                  <span className="flex items-center gap-0.5 text-xs text-red-500 mb-1">
                    <TrendingDown className="w-3.5 h-3.5" /> Aşağı
                  </span>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}
