import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, GraduationCap, CalendarCheck, School,
  UserPlus, Megaphone, AlertTriangle, Clock,
  TrendingUp, TrendingDown, ChevronRight,
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

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60)   return `${diff} san. əvvəl`
  if (diff < 3600) return `${Math.floor(diff / 60)} dəq. əvvəl`
  if (diff < 86400) return `${Math.floor(diff / 3600)} saat əvvəl`
  return `${Math.floor(diff / 86400)} gün əvvəl`
}

function formatEventDate(dateStr) {
  const d = new Date(dateStr)
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`
}

// ── Activity dot ───────────────────────────────────────────────────────────

const activityDotColor = {
  grade:        'bg-purple',
  attendance:   'bg-teal',
  discipline:   'bg-red-500',
  announcement: 'bg-amber-400',
  message:      'bg-blue-400',
}

function ActivityDot({ type }) {
  const cls = activityDotColor[type] || 'bg-gray-300'
  return <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${cls}`} />
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

// ── Stat pill ──────────────────────────────────────────────────────────────

function StatPill({ icon: Icon, iconBg, iconColor, label, value, trend }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-surface rounded-xl">
      <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 truncate">{label}</p>
        <p className="text-lg font-bold text-gray-900 leading-tight">{value}</p>
      </div>
      {trend !== undefined && (
        trend >= 85
          ? <TrendingUp className="w-4 h-4 text-teal flex-shrink-0" />
          : <TrendingDown className="w-4 h-4 text-red-400 flex-shrink-0" />
      )}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { profile, t } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [stats, setStats]         = useState({ students: 0, teachers: 0, classes: 0, attendance: 0 })
  const [activities, setActivities] = useState([])
  const [events, setEvents]       = useState([])
  const [atRisk, setAtRisk]       = useState([])
  const [activeTab, setActiveTab] = useState('risk')

  useEffect(() => {
    if (profile?.school_id) fetchData()
  }, [profile?.school_id])

  async function fetchData() {
    try {
      setLoading(true)
      setError(null)

      const todayStr = new Date().toISOString().split('T')[0]

      // Class IDs for this school
      const { data: classData } = await supabase
        .from('classes').select('id').eq('school_id', profile.school_id)
      const classIds = (classData || []).map(c => c.id)

      const [studentsRes, teachersRes, attendanceRes, activitiesRes, eventsRes, atRiskRes] =
        await Promise.all([
          supabase.from('profiles')
            .select('id', { count: 'exact', head: true })
            .eq('school_id', profile.school_id).eq('role', 'student'),
          supabase.from('profiles')
            .select('id', { count: 'exact', head: true })
            .eq('school_id', profile.school_id).eq('role', 'teacher'),
          classIds.length
            ? supabase.from('attendance').select('status')
                .in('class_id', classIds).eq('date', todayStr)
            : Promise.resolve({ data: [] }),
          supabase.from('notifications').select('*')
            .or(`school_id.eq.${profile.school_id},user_id.eq.${profile.id}`)
            .order('created_at', { ascending: false }).limit(10),
          supabase.from('events').select('*')
            .eq('school_id', profile.school_id)
            .gte('start_date', todayStr)
            .order('start_date').limit(5),
          supabase.rpc('get_at_risk_students', { p_school_id: profile.school_id }),
        ])

      const totalAtt    = attendanceRes.data?.length || 0
      const presentCnt  = attendanceRes.data?.filter(a => a.status === 'present').length || 0
      const attPct      = totalAtt > 0 ? Math.round((presentCnt / totalAtt) * 100) : 0

      setStats({
        students:   studentsRes.count  || 0,
        teachers:   teachersRes.count  || 0,
        classes:    classIds.length,
        attendance: attPct,
      })
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
    <div className="space-y-8">

      {/* ── 1. Welcome header ─────────────────────────────────────────────── */}
      <div>
        <p className="text-sm text-gray-400 mb-1">{todayLabel()}</p>
        <h1 className="font-serif text-4xl text-gray-900 leading-tight">
          Xoş gəldiniz, {firstName}!
        </h1>
        <p className="text-gray-500 mt-1">{profile?.school?.name || 'Məktəb'}</p>
      </div>

      {/* ── 2. Two wide quick-action cards ────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <QuickAction
          icon={UserPlus}
          label="Şagird əlavə et"
          bg="bg-purple"
          onClick={() => navigate('/admin/shagirdler')}
        />
        <QuickAction
          icon={Megaphone}
          label="Elan göndər"
          bg="bg-teal"
          onClick={() => navigate('/admin/mesajlar')}
        />
      </div>

      {/* ── 3. Three-column widget grid ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT — Son Fəaliyyət */}
        <div className="bg-white rounded-2xl border border-border-soft shadow-sm flex flex-col">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-border-soft">
            <Clock className="w-4 h-4 text-purple flex-shrink-0" />
            <h2 className="font-semibold text-gray-900 text-sm">Son Fəaliyyət</h2>
          </div>
          {activities.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10 px-6">Fəaliyyət yoxdur</p>
          ) : (
            <ul className="divide-y divide-border-soft overflow-y-auto max-h-[340px]">
              {activities.map(a => (
                <li key={a.id} className="flex items-start gap-3 px-6 py-3 hover:bg-surface/50 transition-colors">
                  <ActivityDot type={a.type} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{a.title}</p>
                    {a.body && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{a.body}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0 mt-0.5">
                    {timeAgo(a.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* CENTER — Bu gün */}
        <div className="bg-white rounded-2xl border border-border-soft shadow-sm flex flex-col">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-border-soft">
            <CalendarCheck className="w-4 h-4 text-purple flex-shrink-0" />
            <h2 className="font-semibold text-gray-900 text-sm">Bu gün</h2>
          </div>
          <div className="px-6 py-5 flex flex-col gap-3 flex-1">
            {/* Date prominent */}
            <div className="text-center py-4 bg-purple-light rounded-xl mb-1">
              <p className="text-xs text-purple-dark/70 font-medium uppercase tracking-wider">
                {new Date().toLocaleDateString('az-AZ', { weekday: 'long' })}
              </p>
              <p className="text-5xl font-bold text-purple leading-tight mt-1">
                {new Date().getDate()}
              </p>
              <p className="text-sm text-purple-dark/70 mt-0.5">
                {new Date().toLocaleDateString('az-AZ', { month: 'long', year: 'numeric' })}
              </p>
            </div>

            {/* Stat pills */}
            <StatPill
              icon={Users}
              iconBg="bg-purple-light"
              iconColor="text-purple"
              label={t ? t('total_students') : 'Şagirdlər'}
              value={stats.students}
            />
            <StatPill
              icon={GraduationCap}
              iconBg="bg-teal-light"
              iconColor="text-teal"
              label={t ? t('total_teachers') : 'Müəllimlər'}
              value={stats.teachers}
            />
            <StatPill
              icon={School}
              iconBg="bg-blue-50"
              iconColor="text-blue-500"
              label={t ? t('active_classes') : 'Sinifler'}
              value={stats.classes}
            />
            <StatPill
              icon={CalendarCheck}
              iconBg="bg-amber-50"
              iconColor="text-amber-500"
              label="Bu günkü davamiyyət"
              value={`${stats.attendance}%`}
              trend={stats.attendance}
            />
          </div>
        </div>

        {/* RIGHT — Yaxın Tədbirlər */}
        <div className="bg-white rounded-2xl border border-border-soft shadow-sm flex flex-col">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-border-soft">
            <CalendarCheck className="w-4 h-4 text-teal flex-shrink-0" />
            <h2 className="font-semibold text-gray-900 text-sm">Yaxın Tədbirlər</h2>
          </div>
          {events.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10 px-6">Yaxın tədbir yoxdur</p>
          ) : (
            <ul className="divide-y divide-border-soft overflow-y-auto max-h-[340px]">
              {events.map(ev => (
                <li key={ev.id} className="flex items-start gap-3 px-6 py-3 hover:bg-surface/50 transition-colors">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-teal-light flex flex-col items-center justify-center">
                    <span className="text-xs font-bold text-teal leading-none">
                      {formatEventDate(ev.start_date)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{ev.title}</p>
                    {ev.type && (
                      <Badge className="mt-1" variant="default">{ev.type}</Badge>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ── 4. Bottom tabbed section — at-risk students ───────────────────── */}
      <div className="bg-white rounded-2xl border border-border-soft shadow-sm overflow-hidden">
        {/* Tab bar */}
        <div className="flex items-center border-b border-border-soft px-6">
          <button
            onClick={() => setActiveTab('risk')}
            className={`py-4 px-1 mr-6 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'risk'
                ? 'border-purple text-purple'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Risk altındakı şagirdlər
              {atRisk.length > 0 && (
                <Badge variant="absent">{atRisk.length}</Badge>
              )}
            </span>
          </button>
        </div>

        {/* Tab content */}
        {activeTab === 'risk' && (
          atRisk.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-12">
              Risk altında olan şagird yoxdur
            </p>
          ) : (
            <div className="divide-y divide-border-soft">
              {atRisk.map(student => (
                <div
                  key={student.id}
                  className="flex items-center justify-between px-6 py-4 border-l-4 border-l-red-400 hover:bg-red-50/40 transition-colors"
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
                      <p className="text-xs text-gray-400">Ortalama</p>
                      <p className={`text-sm font-semibold ${
                        (student.avg_grade ?? 10) < 5 ? 'text-red-600' : 'text-gray-700'
                      }`}>
                        {student.avg_grade ?? '—'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Davamiyyət</p>
                      <p className={`text-sm font-semibold ${
                        (student.attendance_pct ?? 100) < 75 ? 'text-red-600' : 'text-gray-700'
                      }`}>
                        {student.attendance_pct ?? '—'}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

    </div>
  )
}
