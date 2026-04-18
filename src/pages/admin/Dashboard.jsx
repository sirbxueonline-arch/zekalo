import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, GraduationCap, CalendarCheck, School,
  UserPlus, Megaphone, AlertTriangle,
  ChevronRight, Activity, Bell, CheckCircle,
  TrendingUp, TrendingDown,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { PageSpinner } from '../../components/ui/Spinner'
import Avatar from '../../components/ui/Avatar'

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
  if (diff < 60)    return `${diff} san.`
  if (diff < 3600)  return `${Math.floor(diff / 60)} dəq.`
  if (diff < 86400) return `${Math.floor(diff / 3600)} saat`
  return `${Math.floor(diff / 86400)} gün`
}

function formatEventDate(dateStr) {
  const d = new Date(dateStr)
  return {
    dd:      String(d.getDate()).padStart(2, '0'),
    month:   d.toLocaleDateString('az-AZ', { month: 'short' }),
    weekday: d.toLocaleDateString('az-AZ', { weekday: 'short' }),
  }
}

// ── Attendance bar ──────────────────────────────────────────────────────────

function AttBar({ pct }) {
  const [color, text] =
    pct >= 85 ? ['bg-teal',     'text-teal']
  : pct >= 70 ? ['bg-amber-400','text-amber-500']
  :             ['bg-red-400',  'text-red-500']
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs font-bold w-8 text-right tabular-nums ${text}`}>{pct}%</span>
    </div>
  )
}

// ── Activity dot ────────────────────────────────────────────────────────────

const DOT_COLORS = {
  grade: 'bg-purple', attendance: 'bg-teal',
  discipline: 'bg-red-500', announcement: 'bg-amber-400', message: 'bg-blue-400',
}

// ── Event type meta ─────────────────────────────────────────────────────────

const EVENT_META = {
  exam:    { bg: 'bg-red-100',     text: 'text-red-700',    dot: 'bg-red-400' },
  meeting: { bg: 'bg-purple-light',text: 'text-purple',     dot: 'bg-purple' },
  holiday: { bg: 'bg-teal-light',  text: 'text-teal',       dot: 'bg-teal' },
  sport:   { bg: 'bg-amber-50',    text: 'text-amber-700',  dot: 'bg-amber-400' },
  art:     { bg: 'bg-pink-50',     text: 'text-pink-700',   dot: 'bg-pink-400' },
}

// ── Section header ──────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, iconBg, iconColor, title, sub, action, onAction }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-border-soft">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-gray-900 leading-none">{title}</h2>
          {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
        </div>
      </div>
      {action && (
        <button
          onClick={onAction}
          className="text-xs text-purple hover:text-purple-dark font-semibold flex items-center gap-0.5 transition-colors"
        >
          {action} <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
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
        studentsRes, teachersRes, parentsRes,
        attendanceRes, attByClassRes,
        activitiesRes, eventsRes, activeEventsRes,
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('school_id', profile.school_id).eq('role', 'student'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('school_id', profile.school_id).eq('role', 'teacher'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('school_id', profile.school_id).eq('role', 'parent'),
        classIds.length ? supabase.from('attendance').select('status').in('class_id', classIds).eq('date', todayStr) : Promise.resolve({ data: [] }),
        classIds.length ? supabase.from('attendance').select('class_id, status').in('class_id', classIds).eq('date', todayStr) : Promise.resolve({ data: [] }),
        supabase.from('notifications').select('*').or(`school_id.eq.${profile.school_id},user_id.eq.${profile.id}`).order('created_at', { ascending: false }).limit(12),
        supabase.from('events').select('*').eq('school_id', profile.school_id).gte('start_date', todayStr).order('start_date').limit(6),
        supabase.from('events').select('id', { count: 'exact', head: true }).eq('school_id', profile.school_id).gte('start_date', todayStr),
      ])

      let atRiskData = []
      try {
        const { data } = await supabase.rpc('get_at_risk_students', { p_school_id: profile.school_id })
        atRiskData = data || []
      } catch { /* optional RPC */ }

      const totalAtt   = attendanceRes.data?.length || 0
      const presentCnt = attendanceRes.data?.filter(a => a.status === 'present').length || 0
      const attPct     = totalAtt > 0 ? Math.round((presentCnt / totalAtt) * 100) : 0

      setStats({
        students: studentsRes.count || 0, teachers: teachersRes.count || 0,
        parents: parentsRes.count || 0, classes: classIds.length,
        attendance: attPct, activeEvents: activeEventsRes.count || 0,
      })

      const classMap = {}
      ;(classData || []).forEach(c => { classMap[c.id] = { class_id: c.id, name: c.name, present: 0, absent: 0, late: 0, total: 0 } })
      ;(attByClassRes.data || []).forEach(row => {
        if (!classMap[row.class_id]) return
        classMap[row.class_id].total++
        if (row.status === 'present') classMap[row.class_id].present++
        else if (row.status === 'absent') classMap[row.class_id].absent++
        else if (row.status === 'late') classMap[row.class_id].late++
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
        <button onClick={fetchData} className="text-sm text-purple underline underline-offset-2">Yenidən cəhd et</button>
      </div>
    )
  }

  const firstName = profile?.full_name?.split(' ')[0] || ''

  // Attendance totals for snapshot
  const att = classAttendance.reduce(
    (a, c) => ({ present: a.present + c.present, absent: a.absent + c.absent, late: a.late + c.late, total: a.total + c.total }),
    { present: 0, absent: 0, late: 0, total: 0 },
  )
  const pPct = att.total > 0 ? Math.round((att.present / att.total) * 100) : 0
  const aPct = att.total > 0 ? Math.round((att.absent  / att.total) * 100) : 0
  const lPct = att.total > 0 ? Math.round((att.late    / att.total) * 100) : 0

  return (
    <div className="space-y-5">

      {/* ── HERO BANNER ──────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl overflow-hidden shadow-lg"
        style={{ background: 'linear-gradient(135deg, #534AB7 0%, #3D37A4 50%, #2D279F 100%)' }}
      >
        {/* Top row */}
        <div className="px-7 pt-6 pb-5 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[11px] font-bold text-white/50 uppercase tracking-widest">{todayLabel()}</p>
            <h1 className="text-white text-2xl font-extrabold mt-1.5 leading-tight tracking-tight">
              {greeting(t)}, {firstName} 👋
            </h1>
            {profile?.school?.name && (
              <p className="text-white/60 text-xs mt-1.5 flex items-center gap-1.5 font-medium">
                <School className="w-3.5 h-3.5" />
                {profile.school.name}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 mt-1">
            <button
              onClick={() => navigate('/admin/shagirdler')}
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/20 text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Şagird Əlavə Et</span>
            </button>
            <button
              onClick={() => navigate('/admin/mesajlar')}
              className="flex items-center gap-2 bg-white text-purple hover:bg-purple-50 rounded-xl px-4 py-2.5 text-sm font-bold transition-all shadow-sm"
            >
              <Megaphone className="w-4 h-4" />
              <span className="hidden sm:inline">Elan Yayımla</span>
            </button>
          </div>
        </div>

        {/* Stat tiles inside banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/10 border-t border-white/10">
          {[
            { label: 'Şagirdlər',   value: stats.students,     sub: `${stats.classes} sinif`,       icon: Users },
            { label: 'Müəllimlər',  value: stats.teachers,     sub: `${stats.parents} valideyn`,    icon: GraduationCap },
            { label: 'Davamiyyət',  value: `${stats.attendance}%`, sub: 'bu günkü faiz',           icon: CalendarCheck },
            { label: 'Tədbirlər',   value: stats.activeEvents, sub: 'yaxınlaşan',                  icon: Activity },
          ].map(s => (
            <div key={s.label} className="bg-white/5 hover:bg-white/10 transition-colors px-5 py-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <s.icon className="w-4.5 h-4.5 text-white/80" />
              </div>
              <div className="min-w-0">
                <p className="text-white/50 text-[10px] font-bold uppercase tracking-wider">{s.label}</p>
                <p className="text-white text-2xl font-black leading-none mt-0.5 tabular-nums">{s.value}</p>
                <p className="text-white/40 text-[10px] mt-0.5 font-medium truncate">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── ATTENDANCE OVERVIEW ───────────────────────────────────────────── */}
      {att.total > 0 && (
        <div className="bg-white rounded-2xl border border-border-soft shadow-sm overflow-hidden">
          <SectionHeader
            icon={CalendarCheck}
            iconBg="bg-purple-light"
            iconColor="text-purple"
            title="Bugünkü Davamiyyət Baxışı"
            sub={`${att.total} şagird qeydə alınıb · ${new Date().toLocaleDateString('az-AZ', { day: 'numeric', month: 'long' })}`}
            action="Ətraflı"
            onAction={() => navigate('/admin/cedvel')}
          />

          {/* Big numbers */}
          <div className="grid grid-cols-3 divide-x divide-border-soft">
            <div className="px-6 py-6 text-center">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">İştirak edir</p>
              <p className="text-5xl font-black text-teal tabular-nums leading-none">{att.present}</p>
              <span className="inline-flex items-center gap-1 mt-3 text-xs font-bold text-teal bg-teal-light px-3 py-1 rounded-full">
                <TrendingUp className="w-3 h-3" />{pPct}%
              </span>
            </div>
            <div className="px-6 py-6 text-center">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Gecikən</p>
              <p className="text-5xl font-black text-amber-500 tabular-nums leading-none">{att.late}</p>
              <span className="inline-flex items-center mt-3 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                {lPct}%
              </span>
            </div>
            <div className="px-6 py-6 text-center">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Qayıb</p>
              <p className="text-5xl font-black text-red-500 tabular-nums leading-none">{att.absent}</p>
              <span className="inline-flex items-center gap-1 mt-3 text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">
                <TrendingDown className="w-3 h-3" />{aPct}%
              </span>
            </div>
          </div>

          {/* Stacked bar */}
          <div className="px-6 pb-5">
            <div className="h-3 rounded-full overflow-hidden bg-gray-100 flex">
              {pPct > 0 && <div className="bg-teal   h-full transition-all" style={{ width: `${pPct}%` }} />}
              {lPct > 0 && <div className="bg-amber-400 h-full transition-all ml-0.5" style={{ width: `${lPct}%` }} />}
              {aPct > 0 && <div className="bg-red-400 h-full transition-all ml-0.5" style={{ width: `${aPct}%` }} />}
            </div>
            <div className="flex items-center gap-5 mt-2.5">
              {[
                { color: 'bg-teal',      label: `${pPct}% iştirak` },
                { color: 'bg-amber-400', label: `${lPct}% gecikən` },
                { color: 'bg-red-400',   label: `${aPct}% qayıb` },
              ].map(item => (
                <span key={item.label} className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                  <span className={`w-2.5 h-2.5 rounded-full ${item.color} flex-shrink-0`} />
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN GRID ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* ── LEFT col (7 cols) ─────────────────────────────────────────── */}
        <div className="lg:col-span-7 space-y-5">

          {/* Class-by-class attendance */}
          <div className="bg-white rounded-2xl border border-border-soft shadow-sm overflow-hidden">
            <SectionHeader
              icon={CalendarCheck}
              iconBg="bg-purple-light"
              iconColor="text-purple"
              title={t('todays_attendance_table')}
              action={t('view_all')}
              onAction={() => navigate('/admin/cedvel')}
            />

            {classAttendance.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 bg-surface rounded-2xl flex items-center justify-center mb-4">
                  <CalendarCheck className="w-7 h-7 text-gray-300" />
                </div>
                <p className="text-sm font-semibold text-gray-500">Bu gün üçün davamiyyət qeydə alınmayıb</p>
                <p className="text-xs text-gray-400 mt-1">Müəllimlər dərs zamanı qeyd etdikdə görünəcək</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-border-soft">
                      <th className="text-left px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Sinif</th>
                      <th className="text-center px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-teal">İştirak</th>
                      <th className="text-center px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-amber-500">Gecikən</th>
                      <th className="text-center px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-red-400">Qayıb</th>
                      <th className="px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider min-w-[140px]">Faiz</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-soft">
                    {classAttendance.map(cls => (
                      <tr key={cls.class_id} className="hover:bg-purple-light/10 transition-colors group">
                        <td className="px-5 py-3.5">
                          <span className="font-bold text-gray-900 text-sm group-hover:text-purple transition-colors">{cls.name}</span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="inline-flex items-center justify-center min-w-[36px] h-7 rounded-lg bg-teal-light text-teal text-sm font-black px-2">
                            {cls.present}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="inline-flex items-center justify-center min-w-[36px] h-7 rounded-lg bg-amber-50 text-amber-600 text-sm font-black px-2">
                            {cls.late}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="inline-flex items-center justify-center min-w-[36px] h-7 rounded-lg bg-red-50 text-red-500 text-sm font-black px-2">
                            {cls.absent}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <AttBar pct={cls.pct} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* At-risk students */}
          <div className="bg-white rounded-2xl border border-border-soft shadow-sm overflow-hidden">
            {atRisk.length > 0 ? (
              <>
                <SectionHeader
                  icon={AlertTriangle}
                  iconBg="bg-red-50"
                  iconColor="text-red-400"
                  title={t('at_risk_students')}
                  sub={`${atRisk.length} şagird diqqət tələb edir`}
                  action={t('view_all')}
                  onAction={() => navigate('/admin/shagirdler')}
                />
                <div className="divide-y divide-border-soft">
                  {atRisk.map(s => (
                    <div
                      key={s.id}
                      className="flex items-center gap-3 pl-0 pr-5 py-3.5 hover:bg-red-50/30 transition-colors"
                      style={{ borderLeft: '4px solid #FCA5A5' }}
                    >
                      <div className="pl-4">
                        <Avatar name={s.full_name} size="sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{s.full_name}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {s.class_name}
                          {s.risk_reason && <span className="ml-2 text-red-400 font-semibold">· {s.risk_reason}</span>}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        {s.avg_grade != null && (
                          <div className="text-right">
                            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Ort.</p>
                            <p className={`text-base font-black mt-0.5 ${s.avg_grade < 5 ? 'text-red-600' : 'text-gray-700'}`}>{s.avg_grade}</p>
                          </div>
                        )}
                        {s.attendance_pct != null && (
                          <div className="text-right">
                            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Dev.</p>
                            <p className={`text-base font-black mt-0.5 ${s.attendance_pct < 75 ? 'text-red-600' : 'text-gray-700'}`}>{s.attendance_pct}%</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4 px-5 py-5">
                <div className="w-10 h-10 rounded-xl bg-teal-light flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-teal" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{t('at_risk_students')}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Risk altında olan şagird yoxdur · Bütün şagirdlər yaxşı vəziyyətdədir</p>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* ── RIGHT col (5 cols) ────────────────────────────────────────── */}
        <div className="lg:col-span-5 space-y-5">

          {/* Upcoming events */}
          <div className="bg-white rounded-2xl border border-border-soft shadow-sm overflow-hidden">
            <SectionHeader
              icon={Activity}
              iconBg="bg-amber-50"
              iconColor="text-amber-500"
              title={t('upcoming_events')}
              action={t('view_all')}
              onAction={() => navigate('/admin/tedbirler')}
            />

            {events.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Activity className="w-8 h-8 text-gray-200 mb-2" />
                <p className="text-sm text-gray-400">{t('no_upcoming_events')}</p>
              </div>
            ) : (
              <ul className="divide-y divide-border-soft">
                {events.map(ev => {
                  const dt   = formatEventDate(ev.start_date)
                  const meta = EVENT_META[ev.type] || { bg: 'bg-surface', text: 'text-gray-600', dot: 'bg-gray-300' }
                  return (
                    <li key={ev.id} className="flex items-center gap-4 px-5 py-4 hover:bg-surface/60 transition-colors">
                      {/* Date badge */}
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-purple-light flex flex-col items-center justify-center">
                        <span className="text-lg font-black text-purple leading-none tabular-nums">{dt.dd}</span>
                        <span className="text-[9px] font-bold text-purple/60 uppercase tracking-wider mt-0.5">{dt.month}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{ev.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] text-gray-400 font-medium capitalize">{dt.weekday}</span>
                          {ev.type && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.bg} ${meta.text}`}>
                              {ev.type}
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {/* Activity / notifications feed */}
          <div className="bg-white rounded-2xl border border-border-soft shadow-sm overflow-hidden">
            <SectionHeader
              icon={Bell}
              iconBg="bg-purple-light"
              iconColor="text-purple"
              title={t('all_notifications')}
              action={t('view_all')}
              onAction={() => navigate('/admin/mesajlar')}
            />

            {activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="w-8 h-8 text-gray-200 mb-2" />
                <p className="text-sm text-gray-400">{t('no_notifications')}</p>
              </div>
            ) : (
              <ul className="overflow-y-auto max-h-[340px] divide-y divide-border-soft">
                {activities.map(a => (
                  <li key={a.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-surface/50 transition-colors">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${DOT_COLORS[a.type] || 'bg-gray-300'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 leading-snug">{a.title}</p>
                      {a.body && <p className="text-[11px] text-gray-400 mt-0.5 truncate">{a.body}</p>}
                    </div>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap flex-shrink-0 mt-0.5 font-medium">
                      {timeAgo(a.created_at)} əvvəl
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
