import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, GraduationCap, CalendarCheck, School,
  UserPlus, BookOpen, FileText, Bell, AlertTriangle, Clock,
  TrendingUp, TrendingDown, ArrowRight,
  MessageSquare, BarChart2,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import StatCard from '../../components/ui/StatCard'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { PageSpinner } from '../../components/ui/Spinner'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'

// Activity type → colored dot
const activityDotColor = {
  grade:       'bg-purple',
  attendance:  'bg-teal',
  discipline:  'bg-red-500',
  announcement:'bg-amber-400',
  message:     'bg-blue-400',
}

function activityDot(type) {
  const cls = activityDotColor[type] || 'bg-gray-300'
  return <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5 ${cls}`} />
}

// Quick action card
function QuickActionCard({ icon: Icon, label, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-3 p-5 bg-white border border-border-soft rounded-xl hover:border-purple/40 hover:shadow-sm transition-all group"
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-xs font-medium text-gray-700 group-hover:text-purple transition-colors text-center leading-snug">
        {label}
      </span>
    </button>
  )
}

// Greeting helper
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
      <div className="text-center py-20">
        <p className="text-red-600 text-sm mb-4">{error}</p>
        <Button onClick={fetchData}>Yenidən cəhd et</Button>
      </div>
    )
  }

  return (
    <div className="space-y-10">

      {/* ── Welcome header ───────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray-400 mb-1">{todayLabel()}</p>
          <h1 className="font-serif text-4xl text-gray-900 leading-tight">
            {greeting()}, {profile?.full_name?.split(' ')[0]}
          </h1>
          <p className="text-gray-500 mt-1">{profile.school?.name || 'Məktəb'}</p>
        </div>
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
          <p className="text-4xl font-bold text-gray-900">{stats.students}</p>
        </div>

        <div className="bg-white rounded-2xl p-7 border border-border-soft shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs tracking-widest text-gray-400 uppercase font-medium">{t('total_teachers')}</span>
            <span className="w-9 h-9 rounded-xl bg-teal-light flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-teal" />
            </span>
          </div>
          <p className="text-4xl font-bold text-gray-900">{stats.teachers}</p>
        </div>

        <div className="bg-white rounded-2xl p-7 border border-border-soft shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs tracking-widest text-gray-400 uppercase font-medium">{t('today_attendance')}</span>
            <span className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4 text-amber-500" />
            </span>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-bold text-gray-900">{stats.attendance}%</p>
            {stats.attendance >= 85 ? (
              <span className="flex items-center gap-0.5 text-xs text-teal mb-1"><TrendingUp className="w-3.5 h-3.5" /> Yaxşı</span>
            ) : (
              <span className="flex items-center gap-0.5 text-xs text-red-500 mb-1"><TrendingDown className="w-3.5 h-3.5" /> Aşağı</span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-7 border border-border-soft shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs tracking-widest text-gray-400 uppercase font-medium">{t('active_classes')}</span>
            <span className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <School className="w-4 h-4 text-blue-500" />
            </span>
          </div>
          <p className="text-4xl font-bold text-gray-900">{stats.classes}</p>
        </div>
      </div>

      {/* ── Quick Actions ────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-xs tracking-widest text-gray-400 uppercase font-semibold mb-4">Sürətli əməliyyatlar</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <QuickActionCard
            icon={UserPlus}
            label={t('add_student')}
            color="bg-purple-light text-purple"
            onClick={() => navigate('/admin/shagirdler')}
          />
          <QuickActionCard
            icon={GraduationCap}
            label={t('add_teacher')}
            color="bg-teal-light text-teal"
            onClick={() => navigate('/admin/muelimler')}
          />
          <QuickActionCard
            icon={FileText}
            label={t('create_report')}
            color="bg-amber-50 text-amber-600"
            onClick={() => navigate('/admin/hesabatlar')}
          />
          <QuickActionCard
            icon={Bell}
            label={t('send_announcement')}
            color="bg-blue-50 text-blue-600"
            onClick={() => navigate('/admin/mesajlar')}
          />
          <QuickActionCard
            icon={BarChart2}
            label={t('analytics')}
            color="bg-indigo-50 text-indigo-600"
            onClick={() => navigate('/admin/analitika')}
          />
          <QuickActionCard
            icon={School}
            label={t('classes')}
            color="bg-pink-50 text-pink-500"
            onClick={() => navigate('/admin/sinifler')}
          />
        </div>
      </div>

      {/* ── At-risk students ─────────────────────────────────────────────── */}
      {atRisk.length > 0 && (
        <div className="bg-white rounded-2xl border border-border-soft shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-8 py-5 border-b border-border-soft">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <h2 className="font-semibold text-gray-900">{t('at_risk')}</h2>
            <Badge variant="absent">{atRisk.length}</Badge>
          </div>
          <div className="divide-y divide-border-soft">
            {atRisk.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between px-8 py-4 border-l-4 border-l-red-400 hover:bg-red-50/40 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Avatar name={student.full_name} size="sm" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{student.full_name}</p>
                    <p className="text-xs text-gray-500">{student.class_name}</p>
                    {student.risk_reason && (
                      <p className="text-xs text-red-500 mt-0.5">{student.risk_reason}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Davamiyyət</p>
                    <p className={`text-sm font-semibold ${(student.attendance_pct ?? 100) < 75 ? 'text-red-600' : 'text-gray-700'}`}>
                      {student.attendance_pct ?? '—'}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Ortalama</p>
                    <p className={`text-sm font-semibold ${(student.avg_grade ?? 10) < 5 ? 'text-red-600' : 'text-gray-700'}`}>
                      {student.avg_grade ?? '—'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Activity feed ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-border-soft shadow-sm">
        <div className="flex items-center justify-between px-8 py-5 border-b border-border-soft">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-purple-mid flex-shrink-0" />
            <h2 className="font-semibold text-gray-900">{t('recent_activity')}</h2>
          </div>
        </div>
        {activities.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-12">{t('no_data')}</p>
        ) : (
          <div className="divide-y divide-border-soft">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 px-8 py-4 hover:bg-surface/50 transition-colors">
                {activityDot(activity.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  {activity.body && <p className="text-xs text-gray-500 mt-0.5 truncate">{activity.body}</p>}
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0 mt-0.5">
                  {formatDate(activity.created_at)} · {formatTime(activity.created_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
