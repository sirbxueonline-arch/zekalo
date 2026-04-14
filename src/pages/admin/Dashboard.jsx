import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, GraduationCap, CalendarCheck, School, UserPlus, BookOpen, FileText, Bell, AlertTriangle, Clock } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import StatCard from '../../components/ui/StatCard'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { PageSpinner } from '../../components/ui/Spinner'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'

export default function Dashboard() {
  const { profile, t } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ students: 0, teachers: 0, attendance: 0, classes: 0 })
  const [atRisk, setAtRisk] = useState([])
  const [activities, setActivities] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    if (profile?.school_id) fetchData()
  }, [profile?.school_id])

  async function fetchData() {
    try {
      setLoading(true)
      setError(null)

      const todayStr = new Date().toISOString().split('T')[0]

      // Get class IDs first — attendance is filtered by class_id (school_id not stored on attendance)
      const { data: classData } = await supabase
        .from('classes').select('id').eq('school_id', profile.school_id)
      const classIds = (classData || []).map(c => c.id)

      const [studentsRes, teachersRes, attendanceRes, atRiskRes, activitiesRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('school_id', profile.school_id).eq('role', 'student'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('school_id', profile.school_id).eq('role', 'teacher'),
        classIds.length
          ? supabase.from('attendance').select('status').in('class_id', classIds).eq('date', todayStr)
          : Promise.resolve({ data: [] }),
        supabase.rpc('get_at_risk_students', { p_school_id: profile.school_id }),
        supabase.from('notifications').select('*')
          .or(`school_id.eq.${profile.school_id},user_id.eq.${profile.id}`)
          .order('created_at', { ascending: false }).limit(20),
      ])

      const totalAttendance = attendanceRes.data?.length || 0
      const presentCount = attendanceRes.data?.filter(a => a.status === 'present').length || 0
      const attendancePct = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0

      setStats({
        students: studentsRes.count || 0,
        teachers: teachersRes.count || 0,
        attendance: attendancePct,
        classes: classIds.length,
      })

      setAtRisk(atRiskRes.data || [])
      setActivities(activitiesRes.data || [])
    } catch {
      setError(t('error'))
    } finally {
      setLoading(false)
    }
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr)
    return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`
  }

  function formatTime(dateStr) {
    const d = new Date(dateStr)
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  if (loading) return <PageSpinner />

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600 text-sm mb-4">{error}</p>
        <Button onClick={fetchData}>Yenidən cəhd et</Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-4xl text-gray-900">{profile.school?.name || 'Məktəb'}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label={t('total_students')} value={stats.students} icon={Users} />
        <StatCard label={t('total_teachers')} value={stats.teachers} icon={GraduationCap} />
        <StatCard label={t('today_attendance')} value={`${stats.attendance}%`} icon={CalendarCheck} />
        <StatCard label={t('active_classes')} value={stats.classes} icon={School} />
      </div>

      {atRisk.length > 0 && (
        <Card hover={false}>
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h2 className="font-serif text-xl text-gray-900">{t('at_risk')}</h2>
            <Badge variant="absent">{atRisk.length}</Badge>
          </div>
          <div className="space-y-3">
            {atRisk.map((student) => (
              <div key={student.id} className="flex items-center justify-between py-3 border-b border-border-soft last:border-0">
                <div className="flex items-center gap-3">
                  <Avatar name={student.full_name} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{student.full_name}</p>
                    <p className="text-xs text-gray-500">{student.class_name}</p>
                    {student.risk_reason && <p className="text-xs text-red-500">{student.risk_reason}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-500">Davamiyyət: {student.attendance_pct ?? '—'}%</span>
                  <span className="text-xs text-gray-500">Ortalama: {student.avg_grade ?? '—'}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card hover={false}>
        <div className="flex items-center gap-3 mb-6">
          <Clock className="w-5 h-5 text-purple-mid" />
          <h2 className="font-serif text-xl text-gray-900">{t('recent_activity')}</h2>
        </div>
        {activities.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">{t('no_data')}</p>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start justify-between py-3 border-b border-border-soft last:border-0">
                <div>
                  <p className="text-sm text-gray-900">{activity.title}</p>
                  <p className="text-xs text-gray-500">{activity.body}</p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                  {formatDate(activity.created_at)} {formatTime(activity.created_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div>
        <p className="text-xs tracking-widest text-gray-400 uppercase mb-3">Sürətli keçidlər</p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => navigate('/admin/students')} variant="ghost">
            <span className="flex items-center gap-2"><UserPlus className="w-4 h-4" /> {t('add_student')}</span>
          </Button>
          <Button onClick={() => navigate('/admin/teachers')} variant="ghost">
            <span className="flex items-center gap-2"><BookOpen className="w-4 h-4" /> {t('add_teacher')}</span>
          </Button>
          <Button onClick={() => navigate('/admin/reports')} variant="ghost">
            <span className="flex items-center gap-2"><FileText className="w-4 h-4" /> {t('create_report')}</span>
          </Button>
          <Button onClick={() => navigate('/admin/messages')} variant="ghost">
            <span className="flex items-center gap-2"><Bell className="w-4 h-4" /> {t('send_announcement')}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
