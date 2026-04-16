import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import StatCard from '../../components/ui/StatCard'
import Card from '../../components/ui/Card'
import Table from '../../components/ui/Table'
import { GradeBadge } from '../../components/ui/Badge'
import { PageSpinner } from '../../components/ui/Spinner'
import {
  Users, BarChart3, Mail, CalendarCheck,
  CheckCircle, Clock, ArrowRight, TrendingDown, TrendingUp,
} from 'lucide-react'

const dayNames = ['Bazar', 'Bazar ertəsi', 'Çərşənbə axşamı', 'Çərşənbə', 'Cümə axşamı', 'Cümə', 'Şənbə']

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

export default function TeacherDashboard() {
  const { profile, t } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [todayClasses, setTodayClasses] = useState([])
  const [studentCount, setStudentCount] = useState(0)
  const [classAvg, setClassAvg] = useState(0)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [weekAttendance, setWeekAttendance] = useState(0)
  const [atRiskStudents, setAtRiskStudents] = useState([])
  const [recentGrades, setRecentGrades] = useState([])
  const [attendanceTaken, setAttendanceTaken] = useState({})

  useEffect(() => {
    if (!profile) return
    loadDashboard()
  }, [profile])

  async function loadDashboard() {
    try {
      const today = new Date()
      const dayOfWeek = today.getDay()
      const todayStr = today.toISOString().split('T')[0]

      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - today.getDay() + 1)
      const weekStartStr = weekStart.toISOString().split('T')[0]

      const [
        timetableRes,
        classesRes,
        messagesRes,
        atRiskRes,
        recentGradesRes,
      ] = await Promise.all([
        supabase.from('timetable_slots').select('*, subject:subjects(name), class:classes(name)').eq('teacher_id', profile.id).eq('day_of_week', dayOfWeek).eq('published', true).order('period'),
        supabase.from('teacher_classes').select('class_id').eq('teacher_id', profile.id),
        supabase.from('messages').select('id', { count: 'exact', head: true }).eq('recipient_id', profile.id).eq('read', false),
        supabase.rpc('get_at_risk_students', { p_school_id: profile.school_id }),
        supabase.from('grades').select('*, student:profiles(full_name), subject:subjects(name)').eq('teacher_id', profile.id).order('created_at', { ascending: false }).limit(10),
      ])

      const classIds = (classesRes.data || []).map(c => c.class_id)

      let totalStudents = 0
      let avgScore = 0
      let weekAtt = 0

      if (classIds.length) {
        const [membersRes, gradesAvgRes, weekAttRes] = await Promise.all([
          supabase.from('class_members').select('id', { count: 'exact', head: true }).in('class_id', classIds),
          supabase.from('grades').select('score, max_score').in('class_id', classIds),
          supabase.from('attendance').select('status').in('class_id', classIds).gte('date', weekStartStr).lte('date', todayStr),
        ])

        totalStudents = membersRes.count || 0

        const scores = gradesAvgRes.data || []
        if (scores.length) {
          const sum = scores.reduce((acc, g) => acc + (g.max_score > 0 ? (g.score / g.max_score) * 10 : g.score), 0)
          avgScore = Math.round((sum / scores.length) * 10) / 10
        }

        const attData = weekAttRes.data || []
        if (attData.length) {
          const present = attData.filter(a => a.status === 'present').length
          weekAtt = Math.round((present / attData.length) * 100)
        }
      }

      const attendanceMap = {}
      if (timetableRes.data?.length) {
        const slotClassIds = [...new Set(timetableRes.data.map(s => s.class_id))]
        const { data: attRecords } = await supabase
          .from('attendance')
          .select('class_id')
          .in('class_id', slotClassIds)
          .eq('date', todayStr)
        ;(attRecords || []).forEach(r => { attendanceMap[r.class_id] = true })
      }

      setTodayClasses(timetableRes.data || [])
      setAttendanceTaken(attendanceMap)
      setStudentCount(totalStudents)
      setClassAvg(avgScore)
      setUnreadMessages(messagesRes.count || 0)
      setWeekAttendance(weekAtt)
      setAtRiskStudents(atRiskRes.data || [])
      setRecentGrades(recentGradesRes.data || [])
    } catch (err) {
      console.error('Teacher dashboard load error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <PageSpinner />

  const formatDate = (d) => {
    const dt = new Date(d)
    return `${String(dt.getDate()).padStart(2, '0')}.${String(dt.getMonth() + 1).padStart(2, '0')}.${dt.getFullYear()}`
  }

  const atRiskColumns = [
    { key: 'full_name',      label: t('full_name') },
    { key: 'class_name',     label: t('class_name') },
    { key: 'avg_grade',      label: t('avg_grade'),      render: (v) => <GradeBadge score={Math.round(v * 10) / 10} /> },
    { key: 'attendance_pct', label: t('attendance_pct'), render: (v) => (
      <span className={`text-sm font-medium ${v < 80 ? 'text-red-600' : 'text-gray-700'}`}>{v}%</span>
    )},
  ]

  return (
    <div className="space-y-10">

      {/* ── Welcome header ───────────────────────────────────────────────── */}
      <div>
        <p className="text-sm text-gray-400 mb-1">{todayLabel()}</p>
        <h1 className="font-serif text-4xl text-gray-900 tracking-tight leading-tight">
          {greeting()}, {profile?.full_name?.split(' ')[0]} {t('greeting_teacher')}!
        </h1>
      </div>

      {/* ── Stat cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-7 border border-border-soft shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs tracking-widest text-gray-400 uppercase font-medium">{t('total_students')}</span>
            <span className="w-9 h-9 rounded-xl bg-purple-light flex items-center justify-center">
              <Users className="w-4 h-4 text-purple" />
            </span>
          </div>
          <p className="text-4xl font-bold text-gray-900">{studentCount}</p>
        </div>

        <div className="bg-white rounded-2xl p-7 border border-border-soft shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs tracking-widest text-gray-400 uppercase font-medium">{t('avg_grade')}</span>
            <span className="w-9 h-9 rounded-xl bg-teal-light flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-teal" />
            </span>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-bold text-gray-900">{String(classAvg).replace('.', ',')}</p>
            {classAvg >= 7 ? (
              <span className="flex items-center gap-0.5 text-xs text-teal mb-1"><TrendingUp className="w-3.5 h-3.5" /></span>
            ) : (
              <span className="flex items-center gap-0.5 text-xs text-red-500 mb-1"><TrendingDown className="w-3.5 h-3.5" /></span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-7 border border-border-soft shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs tracking-widest text-gray-400 uppercase font-medium">{t('unread_messages')}</span>
            <span className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <Mail className="w-4 h-4 text-blue-500" />
            </span>
          </div>
          <p className="text-4xl font-bold text-gray-900">{unreadMessages}</p>
        </div>

        <div className="bg-white rounded-2xl p-7 border border-border-soft shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs tracking-widest text-gray-400 uppercase font-medium">{t('this_week_attendance')}</span>
            <span className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4 text-amber-500" />
            </span>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-bold text-gray-900">{weekAttendance}%</p>
            {weekAttendance >= 85 ? (
              <span className="flex items-center gap-0.5 text-xs text-teal mb-1"><TrendingUp className="w-3.5 h-3.5" /></span>
            ) : (
              <span className="flex items-center gap-0.5 text-xs text-red-500 mb-1"><TrendingDown className="w-3.5 h-3.5" /></span>
            )}
          </div>
        </div>
      </div>

      {/* ── Today's timetable ────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-border-soft shadow-sm">
        <div className="flex items-center justify-between px-8 py-5 border-b border-border-soft">
          <h2 className="font-semibold text-gray-900">{t('timetable')}</h2>
          <span className="text-sm text-gray-400">{dayNames[new Date().getDay()]}</span>
        </div>
        {todayClasses.length === 0 ? (
          <p className="text-sm text-gray-400 px-8 py-10">Bu gün dərs yoxdur</p>
        ) : (
          <div className="divide-y divide-border-soft">
            {todayClasses.map(slot => (
              <div key={slot.id} className="flex items-center justify-between px-8 py-4 hover:bg-surface/50 transition-colors">
                <div className="flex items-center gap-5">
                  <span className="w-7 h-7 rounded-lg bg-purple-light text-purple text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {slot.period}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{slot.subject?.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {slot.class?.name}{slot.room ? ` · Otaq ${slot.room}` : ''}
                    </p>
                  </div>
                </div>
                {attendanceTaken[slot.class_id] ? (
                  <div className="flex items-center gap-1.5 text-teal bg-teal-light px-3 py-1 rounded-full">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">Qeyd olunub</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-xs">Gözləyir</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── At-risk students ─────────────────────────────────────────────── */}
      {atRiskStudents.length > 0 && (
        <div className="bg-white rounded-2xl border border-border-soft shadow-sm overflow-hidden">
          <div className="px-8 py-5 border-b border-border-soft">
            <h2 className="font-semibold text-gray-900">{t('at_risk')}</h2>
          </div>
          <div className="px-8 py-6">
            <Table columns={atRiskColumns} data={atRiskStudents} />
          </div>
        </div>
      )}

      {/* ── Recent grades ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-border-soft shadow-sm">
        <div className="flex items-center justify-between px-8 py-5 border-b border-border-soft">
          <h2 className="font-semibold text-gray-900">{t('recent_activity')}</h2>
          <button
            onClick={() => navigate('/gradebook')}
            className="flex items-center gap-1 text-xs text-purple hover:text-purple-dark font-medium transition-colors"
          >
            {t('all')} <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        {recentGrades.length === 0 ? (
          <p className="text-sm text-gray-400 px-8 py-10">Hələ qiymət yoxdur</p>
        ) : (
          <div className="divide-y divide-border-soft">
            {recentGrades.map(g => (
              <div key={g.id} className="flex items-center justify-between px-8 py-4 hover:bg-surface/50 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{g.student?.full_name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{g.subject?.name} · {g.assessment_title}</p>
                </div>
                <div className="flex items-center gap-4">
                  <GradeBadge score={g.max_score > 0 ? Math.round((g.score / g.max_score) * 10) : g.score} />
                  <span className="text-xs text-gray-400 min-w-[60px] text-right">{formatDate(g.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
