import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, GraduationCap, CalendarCheck, School,
  UserPlus, Megaphone, AlertTriangle, Clock,
  TrendingUp, TrendingDown, ChevronRight,
  Activity, BookOpen,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { PageSpinner } from '../../components/ui/Spinner'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'

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

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60)    return `${diff} san. əvvəl`
  if (diff < 3600)  return `${Math.floor(diff / 60)} dəq. əvvəl`
  if (diff < 86400) return `${Math.floor(diff / 3600)} saat əvvəl`
  return `${Math.floor(diff / 86400)} gün əvvəl`
}

function formatEventDate(dateStr) {
  const d = new Date(dateStr)
  return {
    dd: String(d.getDate()).padStart(2, '0'),
    mm: String(d.getMonth() + 1).padStart(2, '0'),
    month: d.toLocaleDateString('az-AZ', { month: 'short' }),
  }
}

// ── Activity dot color map ─────────────────────────────────────────────────

const activityDotColor = {
  grade:        'bg-purple',
  attendance:   'bg-teal',
  discipline:   'bg-red-500',
  announcement: 'bg-amber-400',
  message:      'bg-blue-400',
}

function ActivityDot({ type }) {
  const cls = activityDotColor[type] || 'bg-gray-300'
  return <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${cls}`} />
}

// ── Event type badge color ─────────────────────────────────────────────────

const eventTypeBg = {
  exam:     'bg-red-50 text-red-700',
  meeting:  'bg-purple-light text-purple-dark',
  holiday:  'bg-teal-light text-teal',
  sport:    'bg-amber-50 text-amber-700',
  art:      'bg-pink-50 text-pink-700',
}

// ── Main component ─────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [stats, setStats]               = useState({ students: 0, teachers: 0, classes: 0, attendance: 0, activeEvents: 0 })
  const [activities, setActivities]     = useState([])
  const [events, setEvents]             = useState([])
  const [atRisk, setAtRisk]             = useState([])
  const [classAttendance, setClassAttendance] = useState([])

  useEffect(() => {
    if (profile?.school_id) fetchData()
  }, [profile?.school_id])

  async function fetchData() {
    try {
      setLoading(true)
      setError(null)

      const todayStr = new Date().toISOString().split('T')[0]

      // Class IDs + names for this school
      const { data: classData } = await supabase
        .from('classes').select('id, name').eq('school_id', profile.school_id)
      const classIds = (classData || []).map(c => c.id)

      const [
        studentsRes,
        teachersRes,
        attendanceRes,
        attByClassRes,
        activitiesRes,
        eventsRes,
        activeEventsRes,
        atRiskRes,
      ] = await Promise.all([
        // total students
        supabase.from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('school_id', profile.school_id).eq('role', 'student'),
        // total teachers
        supabase.from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('school_id', profile.school_id).eq('role', 'teacher'),
        // today's overall attendance
        classIds.length
          ? supabase.from('attendance').select('status')
              .in('class_id', classIds).eq('date', todayStr)
          : Promise.resolve({ data: [] }),
        // per-class attendance today
        classIds.length
          ? supabase.from('attendance').select('class_id, status')
              .in('class_id', classIds).eq('date', todayStr)
          : Promise.resolve({ data: [] }),
        // recent notifications
        supabase.from('notifications').select('*')
          .or(`school_id.eq.${profile.school_id},user_id.eq.${profile.id}`)
          .order('created_at', { ascending: false }).limit(8),
        // upcoming events
        supabase.from('events').select('*')
          .eq('school_id', profile.school_id)
          .gte('start_date', todayStr)
          .order('start_date').limit(6),
        // active events count
        supabase.from('events')
          .select('id', { count: 'exact', head: true })
          .eq('school_id', profile.school_id)
          .gte('start_date', todayStr),
        // at-risk students
        supabase.rpc('get_at_risk_students', { p_school_id: profile.school_id }),
      ])

      // Overall attendance %
      const totalAtt   = attendanceRes.data?.length || 0
      const presentCnt = attendanceRes.data?.filter(a => a.status === 'present').length || 0
      const attPct     = totalAtt > 0 ? Math.round((presentCnt / totalAtt) * 100) : 0

      setStats({
        students:     studentsRes.count  || 0,
        teachers:     teachersRes.count  || 0,
        classes:      classIds.length,
        attendance:   attPct,
        activeEvents: activeEventsRes.count || 0,
      })

      // Per-class attendance breakdown
      const attRows = attByClassRes.data || []
      const classMap = {}
      ;(classData || []).forEach(c => {
        classMap[c.id] = { class_id: c.id, name: c.name, present: 0, absent: 0, late: 0, total: 0 }
      })
      attRows.forEach(row => {
        if (!classMap[row.class_id]) return
        classMap[row.class_id].total++
        if (row.status === 'present') classMap[row.class_id].present++
        else if (row.status === 'absent') classMap[row.class_id].absent++
        else if (row.status === 'late')   classMap[row.class_id].late++
      })
      const classAttList = Object.values(classMap)
        .filter(c => c.total > 0)
        .map(c => ({ ...c, pct: Math.round((c.present / c.total) * 100) }))
        .sort((a, b) => a.pct - b.pct)

      setClassAttendance(classAttList)
      setActivities(activitiesRes.data || [])
      setEvents(eventsRes.data || [])
      setAtRisk(atRiskRes.data || [])
    } catch {
      setError('Məlumatlar yüklənərkən xəta baş verdi.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <PageSpinner />

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600 text-sm mb-4">{error}</p>
        <button
          onClick={fetchData}
          className="text-sm text-purple underline underline-offset-2"
        >
          Yenidən cəhd et
        </button>
      </div>
    )
  }

  const firstName = profile?.full_name?.split(' ')[0] || ''

  return (
    <div className="space-y-5">

      {/* ── Section 1: Compact welcome header ─────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">
            {todayLabel()}
          </p>
          <h1 className="font-serif text-3xl text-gray-900 mt-0.5 leading-tight">
            {greeting()}, {firstName}
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* School badge */}
          <div className="hidden sm:flex items-center gap-2 bg-purple-light text-purple px-3 py-2 rounded-xl mr-1">
            <School className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs font-semibold truncate max-w-[160px]">
              {profile?.school?.name || 'Məktəb'}
            </span>
          </div>

          {/* Quick action buttons */}
          <Button
            onClick={() => navigate('/admin/shagirdler')}
            variant="secondary"
            className="!px-3 !py-2 flex items-center gap-1.5 text-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Şagird</span>
          </Button>
          <Button
            onClick={() => navigate('/admin/mesajlar')}
            className="!px-3 !py-2 flex items-center gap-1.5 text-xs"
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Elan</span>
          </Button>
        </div>
      </div>

      {/* ── Section 2: 5 stat pills in one compact row ────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">

        {/* Şagirdlər */}
        <div className="bg-white rounded-xl border border-border-soft shadow-sm px-4 py-3 flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-purple-light flex items-center justify-center flex-shrink-0">
            <Users className="w-4 h-4 text-purple" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] text-gray-400 leading-none">Şagirdlər</p>
            <p className="text-xl font-bold text-gray-900 leading-tight mt-0.5">{stats.students}</p>
          </div>
        </div>

        {/* Müəllimlər */}
        <div className="bg-white rounded-xl border border-border-soft shadow-sm px-4 py-3 flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-teal-light flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-4 h-4 text-teal" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] text-gray-400 leading-none">Müəllimlər</p>
            <p className="text-xl font-bold text-gray-900 leading-tight mt-0.5">{stats.teachers}</p>
          </div>
        </div>

        {/* Siniflər */}
        <div className="bg-white rounded-xl border border-border-soft shadow-sm px-4 py-3 flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-4 h-4 text-blue-500" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] text-gray-400 leading-none">Siniflər</p>
            <p className="text-xl font-bold text-gray-900 leading-tight mt-0.5">{stats.classes}</p>
          </div>
        </div>

        {/* Bugünkü İştirak% */}
        <div className="bg-white rounded-xl border border-border-soft shadow-sm px-4 py-3 flex items-center gap-3">
          <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
            stats.attendance >= 85 ? 'bg-teal-light' : 'bg-red-50'
          }`}>
            <CalendarCheck className={`w-4 h-4 ${stats.attendance >= 85 ? 'text-teal' : 'text-red-500'}`} />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] text-gray-400 leading-none">Bugünkü İştirak</p>
            <p className={`text-xl font-bold leading-tight mt-0.5 ${
              stats.attendance >= 85 ? 'text-gray-900' : 'text-red-600'
            }`}>
              {stats.attendance}%
            </p>
          </div>
          <div className="ml-auto flex-shrink-0">
            {stats.attendance >= 85
              ? <TrendingUp className="w-4 h-4 text-teal" />
              : <TrendingDown className="w-4 h-4 text-red-400" />
            }
          </div>
        </div>

        {/* Aktiv Tədbirlər */}
        <div className="bg-white rounded-xl border border-border-soft shadow-sm px-4 py-3 flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
            <Activity className="w-4 h-4 text-amber-500" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] text-gray-400 leading-none">Aktiv Tədbirlər</p>
            <p className="text-xl font-bold text-gray-900 leading-tight mt-0.5">{stats.activeEvents}</p>
          </div>
        </div>

      </div>

      {/* ── Section 3: Main 2-column grid (8 + 4) ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* ── LEFT column (lg:col-span-8) ─────────────────────────────────── */}
        <div className="lg:col-span-8 space-y-5">

          {/* Card: Bugünkü Davamiyyət (per-class table) */}
          <div className="bg-white rounded-xl border border-border-soft shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border-soft">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-purple flex-shrink-0" />
                <h2 className="font-semibold text-gray-900 text-sm">Bugünkü Davamiyyət</h2>
              </div>
              <span className="text-xs text-gray-400">
                {new Date().toLocaleDateString('az-AZ', { day: 'numeric', month: 'short' })}
              </span>
            </div>

            {classAttendance.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <CalendarCheck className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Bu gün üçün davamiyyət məlumatı yoxdur</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-surface border-b border-border-soft">
                      <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sinif</th>
                      <th className="text-center px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">İştirak</th>
                      <th className="text-center px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Qayıb</th>
                      <th className="text-center px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Gecikən</th>
                      <th className="text-right px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">%</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-soft">
                    {classAttendance.map(cls => (
                      <tr key={cls.class_id} className="hover:bg-surface/60 transition-colors">
                        <td className="px-5 py-3 font-medium text-gray-900">{cls.name}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-6 rounded bg-teal-light text-teal text-xs font-semibold">
                            {cls.present}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-6 rounded bg-red-50 text-red-600 text-xs font-semibold">
                            {cls.absent}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-6 rounded bg-amber-50 text-amber-600 text-xs font-semibold">
                            {cls.late}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                            cls.pct >= 85
                              ? 'bg-teal-light text-teal'
                              : cls.pct >= 70
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-red-50 text-red-700'
                          }`}>
                            {cls.pct}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Card: Risk Altındakı Şagirdlər */}
          <div className="bg-white rounded-xl border border-border-soft shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border-soft">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <h2 className="font-semibold text-gray-900 text-sm">Risk Altındakı Şagirdlər</h2>
                {atRisk.length > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                    {atRisk.length}
                  </span>
                )}
              </div>
              {atRisk.length > 0 && (
                <button
                  onClick={() => navigate('/admin/shagirdler')}
                  className="text-xs text-purple hover:text-purple-dark flex items-center gap-1 transition-colors"
                >
                  Hamısı <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {atRisk.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <div className="w-10 h-10 rounded-full bg-teal-light flex items-center justify-center mx-auto mb-3">
                  <Users className="w-5 h-5 text-teal" />
                </div>
                <p className="text-sm text-gray-500 font-medium">Risk altında olan şagird yoxdur</p>
                <p className="text-xs text-gray-400 mt-1">Bütün şagirdlər yaxşı vəziyyətdədir</p>
              </div>
            ) : (
              <div className="divide-y divide-border-soft">
                {atRisk.map(student => (
                  <div
                    key={student.id}
                    className="flex items-center gap-3 px-5 py-3 border-l-4 border-l-red-400 hover:bg-red-50/30 transition-colors"
                  >
                    <Avatar name={student.full_name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{student.full_name}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {student.class_name}
                        {student.risk_reason && (
                          <span className="ml-2 text-red-400">· {student.risk_reason}</span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      {student.avg_grade !== undefined && student.avg_grade !== null && (
                        <div className="text-right">
                          <p className="text-[10px] text-gray-400 leading-none">Ortalama</p>
                          <p className={`text-sm font-bold mt-0.5 ${
                            student.avg_grade < 5 ? 'text-red-600' : 'text-gray-700'
                          }`}>
                            {student.avg_grade}
                          </p>
                        </div>
                      )}
                      {student.attendance_pct !== undefined && student.attendance_pct !== null && (
                        <div className="text-right">
                          <p className="text-[10px] text-gray-400 leading-none">Davamiyyət</p>
                          <p className={`text-sm font-bold mt-0.5 ${
                            student.attendance_pct < 75 ? 'text-red-600' : 'text-gray-700'
                          }`}>
                            {student.attendance_pct}%
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* ── RIGHT column (lg:col-span-4) ────────────────────────────────── */}
        <div className="lg:col-span-4 space-y-5">

          {/* Card: Bildirişlər (activity feed) */}
          <div className="bg-white rounded-xl border border-border-soft shadow-sm overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border-soft flex-shrink-0">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple flex-shrink-0" />
                <h2 className="font-semibold text-gray-900 text-sm">Bildirişlər</h2>
              </div>
              <button
                onClick={() => navigate('/admin/mesajlar')}
                className="text-xs text-purple hover:text-purple-dark flex items-center gap-1 transition-colors"
              >
                Hamısı <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {activities.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <Clock className="w-7 h-7 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Bildiriş yoxdur</p>
              </div>
            ) : (
              <ul className="overflow-y-auto max-h-[280px] divide-y divide-border-soft scrollbar-thin">
                {activities.map(a => (
                  <li
                    key={a.id}
                    className="flex items-start gap-2.5 px-5 py-3 hover:bg-surface/50 transition-colors"
                  >
                    <ActivityDot type={a.type} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate leading-snug">{a.title}</p>
                      {a.body && (
                        <p className="text-[11px] text-gray-400 mt-0.5 truncate">{a.body}</p>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap flex-shrink-0 mt-0.5">
                      {timeAgo(a.created_at)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Card: Yaxın Tədbirlər */}
          <div className="bg-white rounded-xl border border-border-soft shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border-soft">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal flex-shrink-0" />
                <h2 className="font-semibold text-gray-900 text-sm">Yaxın Tədbirlər</h2>
              </div>
              <button
                onClick={() => navigate('/admin/tədbirlər')}
                className="text-xs text-purple hover:text-purple-dark flex items-center gap-1 transition-colors"
              >
                Hamısı <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {events.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <Activity className="w-7 h-7 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Yaxın tədbir yoxdur</p>
              </div>
            ) : (
              <ul className="divide-y divide-border-soft">
                {events.map(ev => {
                  const dt = formatEventDate(ev.start_date)
                  const typeCls = eventTypeBg[ev.type] || 'bg-surface text-gray-600'
                  return (
                    <li
                      key={ev.id}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-surface/50 transition-colors"
                    >
                      {/* Date box */}
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-light flex flex-col items-center justify-center">
                        <span className="text-xs font-bold text-purple leading-none">{dt.dd}</span>
                        <span className="text-[10px] text-purple/70 leading-none mt-0.5">{dt.month}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate leading-snug">{ev.title}</p>
                        {ev.type && (
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded mt-1 inline-block ${typeCls}`}>
                            {ev.type}
                          </span>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

        </div>
      </div>

    </div>
  )
}
