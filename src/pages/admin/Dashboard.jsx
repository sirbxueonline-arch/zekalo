import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, GraduationCap, CalendarCheck, School,
  UserPlus, Megaphone, AlertTriangle, Clock,
  TrendingUp, TrendingDown, ChevronRight,
  Activity, BookOpen, BarChart2, Bell,
  CheckCircle, XCircle, MinusCircle,
  FileText, MessageSquare, Star,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { PageSpinner } from '../../components/ui/Spinner'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'

// ── Helpers ────────────────────────────────────────────────────────────────

function greeting(t) {
  const h = new Date().getHours()
  if (h < 12) return t('good_morning')
  if (h < 18) return t('good_afternoon')
  return t('good_evening')
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
    month: d.toLocaleDateString('az-AZ', { month: 'short' }),
  }
}

// ── Mini stat card ──────────────────────────────────────────────────────────

function StatPill({ icon: Icon, label, value, iconBg, iconColor, trend, trendDir }) {
  return (
    <div className="bg-white rounded-xl border border-border-soft shadow-sm px-4 py-3.5 flex items-center gap-3">
      <span className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-gray-400 leading-none font-medium">{label}</p>
        <p className="text-xl font-bold text-gray-900 leading-tight mt-0.5">{value}</p>
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-0.5 flex-shrink-0 ${trendDir === 'up' ? 'text-teal' : trendDir === 'down' ? 'text-red-400' : 'text-gray-400'}`}>
          {trendDir === 'up' && <TrendingUp className="w-3.5 h-3.5" />}
          {trendDir === 'down' && <TrendingDown className="w-3.5 h-3.5" />}
        </div>
      )}
    </div>
  )
}

// ── Attendance bar ──────────────────────────────────────────────────────────

function AttBar({ pct }) {
  const color = pct >= 85 ? 'bg-teal' : pct >= 70 ? 'bg-amber-400' : 'bg-red-400'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs font-bold w-9 text-right ${
        pct >= 85 ? 'text-teal' : pct >= 70 ? 'text-amber-600' : 'text-red-600'
      }`}>{pct}%</span>
    </div>
  )
}

// ── Attendance status icon ──────────────────────────────────────────────────

function AttStatusIcon({ status }) {
  if (status === 'present') return <CheckCircle className="w-3.5 h-3.5 text-teal" />
  if (status === 'absent')  return <XCircle className="w-3.5 h-3.5 text-red-400" />
  return <MinusCircle className="w-3.5 h-3.5 text-amber-400" />
}

// ── Activity dot ────────────────────────────────────────────────────────────

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

// ── Event type badge ────────────────────────────────────────────────────────

const eventTypeBg = {
  exam:     'bg-red-50 text-red-700 border-red-100',
  meeting:  'bg-purple-light text-purple border-purple/10',
  holiday:  'bg-teal-light text-teal border-teal/10',
  sport:    'bg-amber-50 text-amber-700 border-amber-100',
  art:      'bg-pink-50 text-pink-700 border-pink-100',
}

// ── Quick action button ─────────────────────────────────────────────────────

function QuickAction({ icon: Icon, label, sub, onClick, color = 'purple' }) {
  const bg   = color === 'teal' ? 'bg-teal-light'  : color === 'amber' ? 'bg-amber-50'   : 'bg-purple-light'
  const ic   = color === 'teal' ? 'text-teal'       : color === 'amber' ? 'text-amber-600' : 'text-purple'
  const ring = color === 'teal' ? 'hover:ring-teal/20' : color === 'amber' ? 'hover:ring-amber-200' : 'hover:ring-purple/20'
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border border-border-soft bg-white hover:shadow-sm hover:ring-1 ${ring} transition-all text-left w-full`}
    >
      <span className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${bg}`}>
        <Icon className={`w-4 h-4 ${ic}`} />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900 leading-tight">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      <ChevronRight className="w-4 h-4 text-gray-300 ml-auto flex-shrink-0" />
    </button>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { profile, t } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading]                 = useState(true)
  const [error, setError]                     = useState(null)
  const [stats, setStats]                     = useState({ students: 0, teachers: 0, classes: 0, attendance: 0, activeEvents: 0, parents: 0 })
  const [activities, setActivities]           = useState([])
  const [events, setEvents]                   = useState([])
  const [atRisk, setAtRisk]                   = useState([])
  const [classAttendance, setClassAttendance] = useState([])

  useEffect(() => {
    if (profile?.school_id) fetchData()
  }, [profile?.school_id])

  async function fetchData() {
    try {
      setLoading(true)
      setError(null)

      const todayStr = new Date().toISOString().split('T')[0]

      const { data: classData } = await supabase
        .from('classes').select('id, name').eq('school_id', profile.school_id)
      const classIds = (classData || []).map(c => c.id)

      const [
        studentsRes,
        teachersRes,
        parentsRes,
        attendanceRes,
        attByClassRes,
        activitiesRes,
        eventsRes,
        activeEventsRes,
      ] = await Promise.all([
        supabase.from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('school_id', profile.school_id).eq('role', 'student'),
        supabase.from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('school_id', profile.school_id).eq('role', 'teacher'),
        supabase.from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('school_id', profile.school_id).eq('role', 'parent'),
        classIds.length
          ? supabase.from('attendance').select('status')
              .in('class_id', classIds).eq('date', todayStr)
          : Promise.resolve({ data: [] }),
        classIds.length
          ? supabase.from('attendance').select('class_id, status')
              .in('class_id', classIds).eq('date', todayStr)
          : Promise.resolve({ data: [] }),
        supabase.from('notifications').select('*')
          .or(`school_id.eq.${profile.school_id},user_id.eq.${profile.id}`)
          .order('created_at', { ascending: false }).limit(10),
        supabase.from('events').select('*')
          .eq('school_id', profile.school_id)
          .gte('start_date', todayStr)
          .order('start_date').limit(5),
        supabase.from('events')
          .select('id', { count: 'exact', head: true })
          .eq('school_id', profile.school_id)
          .gte('start_date', todayStr),
      ])

      // get_at_risk_students is an optional RPC — isolated so it can't crash the dashboard
      let atRiskData = []
      try {
        const { data } = await supabase.rpc('get_at_risk_students', { p_school_id: profile.school_id })
        atRiskData = data || []
      } catch { /* RPC not deployed — skip */ }

      const totalAtt   = attendanceRes.data?.length || 0
      const presentCnt = attendanceRes.data?.filter(a => a.status === 'present').length || 0
      const attPct     = totalAtt > 0 ? Math.round((presentCnt / totalAtt) * 100) : 0

      setStats({
        students:     studentsRes.count  || 0,
        teachers:     teachersRes.count  || 0,
        parents:      parentsRes.count   || 0,
        classes:      classIds.length,
        attendance:   attPct,
        activeEvents: activeEventsRes.count || 0,
      })

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
      setAtRisk(atRiskData)
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
        <button onClick={fetchData} className="text-sm text-purple underline underline-offset-2">
          Yenidən cəhd et
        </button>
      </div>
    )
  }

  const firstName = profile?.full_name?.split(' ')[0] || ''

  return (
    <div className="space-y-5">

      {/* ── 1. Welcome header ─────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">{todayLabel()}</p>
          <h1 className="font-serif text-3xl text-gray-900 mt-0.5 leading-tight">
            {greeting(t)}, {firstName}
          </h1>
          {profile?.school?.name && (
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
              <School className="w-3.5 h-3.5 flex-shrink-0" />
              {profile.school.name}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            onClick={() => navigate('/admin/shagirdler')}
            variant="secondary"
            className="!px-3 !py-2 flex items-center gap-1.5 text-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Şagird Əlavə Et</span>
          </Button>
          <Button
            onClick={() => navigate('/admin/mesajlar')}
            className="!px-3 !py-2 flex items-center gap-1.5 text-xs"
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Elan Yayımla</span>
          </Button>
        </div>
      </div>

      {/* ── 2. Stats row ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatPill icon={Users}        label={t('students')}        value={stats.students}   iconBg="bg-purple-light" iconColor="text-purple" />
        <StatPill icon={GraduationCap} label={t('teachers')}       value={stats.teachers}   iconBg="bg-teal-light"   iconColor="text-teal" />
        <StatPill icon={Users}        label={t('parents')}         value={stats.parents}    iconBg="bg-blue-50"      iconColor="text-blue-500" />
        <StatPill icon={BookOpen}     label={t('classes')}         value={stats.classes}    iconBg="bg-indigo-50"    iconColor="text-indigo-500" />
        <StatPill
          icon={CalendarCheck}
          label={t('today_attendance')}
          value={`${stats.attendance}%`}
          iconBg={stats.attendance >= 85 ? 'bg-teal-light' : 'bg-red-50'}
          iconColor={stats.attendance >= 85 ? 'text-teal' : 'text-red-500'}
          trendDir={stats.attendance >= 85 ? 'up' : 'down'}
        />
        <StatPill icon={Activity}     label="Aktiv Tədbirlər"      value={stats.activeEvents} iconBg="bg-amber-50"  iconColor="text-amber-500" />
      </div>

      {/* ── 3. Quick actions ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <QuickAction icon={Users}        label="Şagirdlər"    sub={`${stats.students} aktiv`}  onClick={() => navigate('/admin/shagirdler')} color="purple" />
        <QuickAction icon={BookOpen}     label="Jurnal"       sub="Qiymət daxil et"           onClick={() => navigate('/admin/jurnal')} color="teal" />
        <QuickAction icon={CalendarCheck} label="Davamiyyət"  sub="Bugünkü hesabat"           onClick={() => navigate('/admin/cedvel')} color="amber" />
        <QuickAction icon={FileText}     label="Hesabatlar"   sub="Yüklə & paylaş"            onClick={() => navigate('/admin/hesabatlar')} color="purple" />
      </div>

      {/* ── 4. Main 2-col grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* LEFT (8 cols) */}
        <div className="lg:col-span-8 space-y-5">

          {/* Bugünkü Davamiyyət — per-class table */}
          <div className="bg-white rounded-xl border border-border-soft shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border-soft">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-purple" />
                <h2 className="font-semibold text-gray-900 text-sm">{t('todays_attendance_table')}</h2>
              </div>
              <span className="text-xs text-gray-400 font-medium">
                {new Date().toLocaleDateString('az-AZ', { day: 'numeric', month: 'short' })}
              </span>
            </div>

            {classAttendance.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center mx-auto mb-3">
                  <CalendarCheck className="w-5 h-5 text-gray-300" />
                </div>
                <p className="text-sm text-gray-400">Bu gün üçün davamiyyət məlumatı yoxdur</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-surface border-b border-border-soft">
                      <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sinif</th>
                      <th className="text-center px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">İştirak</th>
                      <th className="text-center px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Qayıb</th>
                      <th className="text-center px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Gecikən</th>
                      <th className="px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[120px]">Faiz</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-soft">
                    {classAttendance.map(cls => (
                      <tr key={cls.class_id} className="hover:bg-surface/60 transition-colors">
                        <td className="px-5 py-3 font-semibold text-gray-900">{cls.name}</td>
                        <td className="px-3 py-3 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-6 rounded-md bg-teal-light text-teal text-xs font-bold">
                            {cls.present}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-6 rounded-md bg-red-50 text-red-600 text-xs font-bold">
                            {cls.absent}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-6 rounded-md bg-amber-50 text-amber-600 text-xs font-bold">
                            {cls.late}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <AttBar pct={cls.pct} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Risk Altındakı Şagirdlər */}
          <div className="bg-white rounded-xl border border-border-soft shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border-soft">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <h2 className="font-semibold text-gray-900 text-sm">{t('at_risk_students')}</h2>
                {atRisk.length > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                    {atRisk.length}
                  </span>
                )}
              </div>
              {atRisk.length > 0 && (
                <button
                  onClick={() => navigate('/admin/shagirdler')}
                  className="text-xs text-purple hover:text-purple-dark flex items-center gap-1 transition-colors"
                >
                  {t('view_all')} <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {atRisk.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <div className="w-10 h-10 rounded-full bg-teal-light flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-5 h-5 text-teal" />
                </div>
                <p className="text-sm font-medium text-gray-700">Risk altında olan şagird yoxdur</p>
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
                          <p className={`text-sm font-bold mt-0.5 ${student.avg_grade < 5 ? 'text-red-600' : 'text-gray-700'}`}>
                            {student.avg_grade}
                          </p>
                        </div>
                      )}
                      {student.attendance_pct !== undefined && student.attendance_pct !== null && (
                        <div className="text-right">
                          <p className="text-[10px] text-gray-400 leading-none">Davamiyyət</p>
                          <p className={`text-sm font-bold mt-0.5 ${student.attendance_pct < 75 ? 'text-red-600' : 'text-gray-700'}`}>
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

        {/* RIGHT (4 cols) */}
        <div className="lg:col-span-4 space-y-5">

          {/* Yaxın Tədbirlər */}
          <div className="bg-white rounded-xl border border-border-soft shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border-soft">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal" />
                <h2 className="font-semibold text-gray-900 text-sm">{t('upcoming_events')}</h2>
              </div>
              <button
                onClick={() => navigate('/admin/tedbirler')}
                className="text-xs text-purple hover:text-purple-dark flex items-center gap-1 transition-colors"
              >
                {t('view_all')} <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {events.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <Activity className="w-7 h-7 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">{t('no_upcoming_events')}</p>
              </div>
            ) : (
              <ul className="divide-y divide-border-soft">
                {events.map(ev => {
                  const dt = formatEventDate(ev.start_date)
                  const typeCls = eventTypeBg[ev.type] || 'bg-surface text-gray-600 border-border-soft'
                  return (
                    <li key={ev.id} className="flex items-center gap-3 px-5 py-3 hover:bg-surface/50 transition-colors">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-light flex flex-col items-center justify-center">
                        <span className="text-xs font-bold text-purple leading-none">{dt.dd}</span>
                        <span className="text-[10px] text-purple/70 leading-none mt-0.5">{dt.month}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">{ev.title}</p>
                        {ev.type && (
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border mt-1 inline-block ${typeCls}`}>
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

          {/* Bildirişlər / Activity feed */}
          <div className="bg-white rounded-xl border border-border-soft shadow-sm overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border-soft flex-shrink-0">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-purple" />
                <h2 className="font-semibold text-gray-900 text-sm">{t('all_notifications')}</h2>
              </div>
              <button
                onClick={() => navigate('/admin/mesajlar')}
                className="text-xs text-purple hover:text-purple-dark flex items-center gap-1 transition-colors"
              >
                {t('view_all')} <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {activities.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <Bell className="w-7 h-7 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">{t('no_notifications')}</p>
              </div>
            ) : (
              <ul className="overflow-y-auto max-h-[300px] divide-y divide-border-soft scrollbar-thin">
                {activities.map(a => (
                  <li key={a.id} className="flex items-start gap-2.5 px-5 py-3 hover:bg-surface/50 transition-colors">
                    <ActivityDot type={a.type} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate leading-snug">{a.title}</p>
                      {a.body && <p className="text-[11px] text-gray-400 mt-0.5 truncate">{a.body}</p>}
                    </div>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap flex-shrink-0 mt-0.5">
                      {timeAgo(a.created_at)}
                    </span>
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
