import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import StatCard from '../../components/ui/StatCard'
import Card from '../../components/ui/Card'
import Table from '../../components/ui/Table'
import { GradeBadge } from '../../components/ui/Badge'
import { PageSpinner } from '../../components/ui/Spinner'
import { Users, BarChart3, Mail, CalendarCheck, CheckCircle, Clock, ArrowRight } from 'lucide-react'

const dayNames = ['Bazar', 'Bazar ertəsi', 'Çərşənbə axşamı', 'Çərşənbə', 'Cümə axşamı', 'Cümə', 'Şənbə']

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

    // Check which today classes already have attendance recorded
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
    { key: 'full_name', label: t('full_name') },
    { key: 'class_name', label: t('class_name') },
    { key: 'avg_grade', label: t('avg_grade'), render: (v) => <GradeBadge score={Math.round(v * 10) / 10} /> },
    { key: 'attendance_pct', label: t('attendance_pct'), render: (v) => <span className={`text-sm ${v < 80 ? 'text-red-600' : 'text-gray-700'}`}>{v}%</span> },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-4xl text-gray-900 tracking-tight">
          {t('greeting')}, {profile?.full_name?.split(' ')[0]} {t('greeting_teacher')}!
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t('total_students')} value={studentCount} icon={Users} />
        <StatCard label={t('avg_grade')} value={String(classAvg).replace('.', ',')} icon={BarChart3} />
        <StatCard label={t('unread_messages')} value={unreadMessages} icon={Mail} />
        <StatCard label={t('this_week_attendance')} value={`${weekAttendance}%`} icon={CalendarCheck} />
      </div>

      <Card hover={false}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs tracking-widest text-gray-400 uppercase">{t('timetable')}</h2>
          <span className="text-xs text-gray-500">{dayNames[new Date().getDay()]}</span>
        </div>
        {todayClasses.length === 0 ? (
          <p className="text-sm text-gray-400">Bu gün dərs yoxdur</p>
        ) : (
          <div className="space-y-3">
            {todayClasses.map(slot => (
              <div key={slot.id} className="flex items-center justify-between py-3 border-b border-border-soft last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-6">{slot.period}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{slot.subject?.name}</p>
                    <p className="text-xs text-gray-500">{slot.class?.name}{slot.room ? ` \u2022 Otaq ${slot.room}` : ''}</p>
                  </div>
                </div>
                {attendanceTaken[slot.class_id] ? (
                  <div className="flex items-center gap-1.5 text-teal">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs font-medium">Qeyd olunub</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs">Gözləyir</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {atRiskStudents.length > 0 && (
        <Card hover={false}>
          <h2 className="text-xs tracking-widest text-gray-400 uppercase mb-4">{t('at_risk')}</h2>
          <Table columns={atRiskColumns} data={atRiskStudents} />
        </Card>
      )}

      <Card hover={false}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs tracking-widest text-gray-400 uppercase">{t('recent_activity')}</h2>
          <button onClick={() => navigate('/gradebook')} className="text-xs text-purple hover:text-purple-dark">
            {t('all')} <ArrowRight className="w-3 h-3 inline" />
          </button>
        </div>
        {recentGrades.length === 0 ? (
          <p className="text-sm text-gray-400">Hələ qiymət yoxdur</p>
        ) : (
          <div className="space-y-3">
            {recentGrades.map(g => (
              <div key={g.id} className="flex items-center justify-between py-2 border-b border-border-soft last:border-0">
                <div>
                  <p className="text-sm text-gray-900">{g.student?.full_name}</p>
                  <p className="text-xs text-gray-500">{g.subject?.name} &middot; {g.assessment_title}</p>
                </div>
                <div className="flex items-center gap-3">
                  <GradeBadge score={g.max_score > 0 ? Math.round((g.score / g.max_score) * 10) : g.score} />
                  <span className="text-xs text-gray-400">{formatDate(g.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
