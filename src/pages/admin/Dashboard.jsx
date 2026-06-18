import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, GraduationCap, CalendarCheck, School,
  UserPlus, Megaphone, AlertTriangle,
  ChevronRight, Activity, Bell, CheckCircle,
  TrendingUp, TrendingDown, Link2, Search, Download,
} from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell,
} from 'recharts'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { DashboardSkeleton } from '../../components/ui/Skeleton'
import Avatar from '../../components/ui/Avatar'
import StatCard from '../../components/ui/StatCard'
import CountUp from '../../components/ui/CountUp'
import EmptyState from '../../components/ui/EmptyState'
import Button from '../../components/ui/Button'
import { fmtDate } from '../../lib/dateUtils'

// ── Helpers ────────────────────────────────────────────────────────────────

function greeting(t) {
  const h = new Date().getHours()
  if (h < 12) return t('good_morning')
  if (h < 18) return t('good_afternoon')
  return t('good_evening')
}

// Hardcoded because az-AZ locale isn't supported in all environments
const AZ_MONTHS_LONG  = ['Yanvar','Fevral','Mart','Aprel','May','İyun','İyul','Avqust','Sentyabr','Oktyabr','Noyabr','Dekabr']
const AZ_MONTHS_SHORT = ['Yan','Fev','Mar','Apr','May','İyn','İyl','Avq','Sen','Okt','Noy','Dek']
const AZ_DAYS_LONG    = ['Bazar','Bazar ertəsi','Çərşənbə axşamı','Çərşənbə','Cümə axşamı','Cümə','Şənbə']
const AZ_DAYS_SHORT   = ['Baz','B.er','Çər.ax','Çər','C.ax','Cüm','Şən']

function todayLabel() {
  const d = new Date()
  return `${AZ_DAYS_LONG[d.getDay()]}, ${d.getDate()} ${AZ_MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`
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
    month:   AZ_MONTHS_SHORT[d.getMonth()],
    weekday: AZ_DAYS_SHORT[d.getDay()],
  }
}

// ── Attendance % cell — calm threshold colors, no decoration ────────────────

function attTone(pct) {
  if (pct >= 85) return { bar: 'var(--mint)',    text: 'var(--mint-dark, #15803D)' }
  if (pct >= 70) return { bar: 'var(--warning, #F59E0B)', text: 'var(--warning-text, #B45309)' }
  return         { bar: 'var(--danger, #EF4444)', text: 'var(--danger-text, #B91C1C)' }
}

function AttBar({ pct }) {
  const tone = attTone(pct)
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--hairline)' }}>
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, background: tone.bar }}
        />
      </div>
      <span
        className="text-xs font-semibold w-9 text-right tabular-nums"
        style={{ color: tone.text }}
      >
        {pct}%
      </span>
    </div>
  )
}

// ── Activity feed dot — tinted tile + accent dot (calm, meaning-encoding) ────

const ACTIVITY_DOT = {
  grade:        { chip: 'icon-chip-periwinkle', dot: '#574FCF' },
  attendance:   { chip: 'icon-chip-mint',       dot: '#16A34A' },
  discipline:   { chip: 'icon-chip-coral',      dot: '#E11D48' },
  announcement: { chip: 'icon-chip-sun',        dot: '#CA9A04' },
  message:      { chip: 'icon-chip-blue',       dot: '#0EA5E9' },
}

// ── Event type → leading-dot status pill ────────────────────────────────────

const EVENT_PILL = {
  exam:    'pill-rose',
  meeting: 'pill-peri',
  holiday: 'pill-mint',
  sport:   'pill-sun',
  art:     'pill-grape',
}

// ── Recharts custom tooltip (§10: white, rounded, soft shadow, no border) ────

function ChartTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null
  const d = payload[0].payload
  return (
    <div
      className="rounded-tile bg-surface shadow-soft-lg px-3 py-2.5"
      style={{ minWidth: 140 }}
    >
      <p className="text-[13px] font-semibold text-ink-900 mb-1.5">{d.name}</p>
      <p className="text-xs text-ink-600 flex items-center gap-1.5 tabular-nums">
        <span className="w-2 h-2 rounded-full inline-block" style={{ background: 'var(--brand-500)' }} />
        İştirak: <span className="font-semibold text-ink-900">{d.pct}%</span>
      </p>
      <p className="text-[11px] text-ink-400 mt-1 tabular-nums">
        {d.present}/{d.total} şagird
      </p>
    </div>
  )
}

// ── Section header — calm: hairline divider, one brand accent, tight radius ──

function SectionHeader({ icon: Icon, tone = 'periwinkle', title, sub, action, onAction }) {
  return (
    <div
      className="flex items-center justify-between px-5 py-4"
      style={{ borderBottom: '1px solid var(--hairline)' }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`icon-chip icon-chip-${tone}`}
          style={{ width: 36, height: 36, borderRadius: 12 }}
        >
          <Icon className="w-[18px] h-[18px]" />
        </div>
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold leading-tight text-ink-900 truncate">{title}</h2>
          {sub && <p className="text-xs mt-0.5 text-ink-400 truncate">{sub}</p>}
        </div>
      </div>
      {action && (
        <button
          onClick={onAction}
          className="text-xs font-semibold flex items-center gap-0.5 text-brand-500 transition-colors hover:text-brand-700 flex-shrink-0"
        >
          {action} <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}

// ── Family-connection progress ring — signature admin KPI (§4.4) ────────────
// Single-accent SVG completion ring: "X of N families connected". Calm, no
// gradient, brand stroke on a hairline track. Bricolage percentage in centre.

function FamilyRing({ connected, total }) {
  const pct = total > 0 ? Math.round((connected / total) * 100) : 0
  const R = 34
  const C = 2 * Math.PI * R
  const dash = (Math.min(pct, 100) / 100) * C
  return (
    <div className="bg-surface border border-hairline rounded-card p-5 flex items-center gap-5">
      <div className="relative flex-shrink-0" style={{ width: 84, height: 84 }}>
        <svg width="84" height="84" viewBox="0 0 84 84" className="-rotate-90">
          <circle cx="42" cy="42" r={R} fill="none" stroke="var(--hairline-strong)" strokeWidth="8" />
          <circle
            cx="42" cy="42" r={R} fill="none"
            stroke="var(--brand-500)" strokeWidth="8" strokeLinecap="round"
            strokeDasharray={`${dash} ${C}`}
            className="transition-all duration-700 ease-out motion-reduce:transition-none"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-display font-bold text-[20px] text-ink-900 tabular-nums tracking-[-0.01em]">
          {pct}%
        </span>
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="icon-chip icon-chip-periwinkle" style={{ width: 28, height: 28, borderRadius: 12 }}>
            <Link2 className="w-3.5 h-3.5" />
          </span>
          <p className="text-[12px] font-semibold text-ink-400 uppercase tracking-[0.04em]">Ailə əlaqəsi</p>
        </div>
        <p className="text-[13px] text-ink-600 mt-2 leading-snug tabular-nums">
          <span className="font-semibold text-ink-900">{connected}</span> / {total} ailə qoşulub
        </p>
        {total > connected && (
          <p className="text-[11px] text-ink-400 mt-1 tabular-nums">{total - connected} ailə hələ qoşulmayıb</p>
        )}
      </div>
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
  const [classFilter, setClassFilter]         = useState('')

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

  if (loading) return <DashboardSkeleton />
  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title={error}
        action={<Button onClick={fetchData} variant="secondary">Yenidən cəhd et</Button>}
      />
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

  // Top 8 lowest-attendance classes for the chart (already sorted ascending)
  const chartData = classAttendance.slice(0, 8)

  // Family-connection ring (signature KPI): connected families vs student goal.
  // Derived from already-fetched counts — no extra query.
  const familiesConnected = stats.parents
  const familiesGoal      = Math.max(stats.students, stats.parents)

  // Classes table: filter + CSV export over the real attendance rows.
  const filteredClasses = useMemo(() => {
    const q = classFilter.trim().toLowerCase()
    if (!q) return classAttendance
    return classAttendance.filter(c => c.name.toLowerCase().includes(q))
  }, [classAttendance, classFilter])

  function exportClassesCsv() {
    const header = ['Sinif', 'İştirak', 'Gecikən', 'Qayıb', 'Faiz']
    const rows = filteredClasses.map(c => [c.name, c.present, c.late, c.absent, `${c.pct}%`])
    const csv = [header, ...rows]
      .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `davamiyyet-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">

      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-400">{todayLabel()}</p>
          <h1 className="font-display text-2xl font-extrabold mt-1 leading-tight text-ink-900">
            {greeting(t)}, {firstName}
          </h1>
          {profile?.school?.name && (
            <p className="text-xs mt-1.5 flex items-center gap-1.5 font-medium text-ink-600">
              <School className="w-3.5 h-3.5" />
              {profile.school.name}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            onClick={() => navigate('/admin/shagirdler')}
            variant="secondary"
            size="sm"
            style={{ padding: '9px 16px', fontSize: 13 }}
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Şagird Əlavə Et</span>
          </Button>
          <Button
            onClick={() => navigate('/admin/mesajlar')}
            variant="primary"
            size="sm"
            style={{ padding: '9px 16px', fontSize: 13 }}
          >
            <Megaphone className="w-4 h-4" />
            <span className="hidden sm:inline">Elan Yayımla</span>
          </Button>
        </div>
      </div>

      {/* ── KPI ROW — calm, single brand accent, big tabular numbers (§4.4) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Şagirdlər"
          tone="periwinkle"
          icon={Users}
          value={<CountUp to={stats.students} separator=" " />}
        />
        <StatCard
          label="Müəllimlər"
          tone="periwinkle"
          icon={GraduationCap}
          value={<CountUp to={stats.teachers} separator=" " />}
        />
        <StatCard
          label="Davamiyyət"
          tone="periwinkle"
          icon={CalendarCheck}
          value={<CountUp to={stats.attendance} suffix="%" />}
        />
        <StatCard
          label="Tədbirlər"
          tone="periwinkle"
          icon={Activity}
          value={<CountUp to={stats.activeEvents} />}
        />
      </div>

      {/* ── SIGNATURE KPI — family-connection progress ring (§4.4) ─────────── */}
      <FamilyRing connected={familiesConnected} total={familiesGoal} />

      {/* ── ATTENDANCE OVERVIEW (snapshot) ────────────────────────────────── */}
      {att.total > 0 && (
        <div className="liquid-card overflow-hidden rounded-card">
          <SectionHeader
            icon={CalendarCheck}
            tone="periwinkle"
            title="Bugünkü Davamiyyət Baxışı"
            sub={`${att.total} şagird qeydə alınıb · ${fmtDate(new Date(), { day: 'numeric', month: 'long' })}`}
            action="Ətraflı"
            onAction={() => navigate('/admin/cedvel')}
          />

          {/* Big numbers — calm, threshold-colored, tabular */}
          <div className="grid grid-cols-3" style={{ borderColor: 'var(--hairline)' }}>
            <div className="px-6 py-6 text-center" style={{ borderRight: '1px solid var(--hairline)' }}>
              <p className="text-[11px] font-semibold text-ink-400 uppercase tracking-[0.06em] mb-2">İştirak edir</p>
              <p className="font-display text-[32px] font-bold tabular-nums leading-none tracking-[-0.01em]" style={{ color: 'var(--mint-dark, #15803D)' }}>
                <CountUp to={att.present} />
              </p>
              <span className="inline-flex items-center gap-1 mt-3 text-xs font-semibold px-2.5 py-1 rounded-pill tabular-nums" style={{ background: '#DCFCE7', color: '#15803D' }}>
                <TrendingUp className="w-3 h-3" />{pPct}%
              </span>
            </div>
            <div className="px-6 py-6 text-center" style={{ borderRight: '1px solid var(--hairline)' }}>
              <p className="text-[11px] font-semibold text-ink-400 uppercase tracking-[0.06em] mb-2">Gecikən</p>
              <p className="font-display text-[32px] font-bold tabular-nums leading-none tracking-[-0.01em]" style={{ color: '#B45309' }}>
                <CountUp to={att.late} />
              </p>
              <span className="inline-flex items-center mt-3 text-xs font-semibold px-2.5 py-1 rounded-pill tabular-nums" style={{ background: '#FEF3C7', color: '#B45309' }}>
                {lPct}%
              </span>
            </div>
            <div className="px-6 py-6 text-center">
              <p className="text-[11px] font-semibold text-ink-400 uppercase tracking-[0.06em] mb-2">Qayıb</p>
              <p className="font-display text-[32px] font-bold tabular-nums leading-none tracking-[-0.01em]" style={{ color: '#B91C1C' }}>
                <CountUp to={att.absent} />
              </p>
              <span className="inline-flex items-center gap-1 mt-3 text-xs font-semibold px-2.5 py-1 rounded-pill tabular-nums" style={{ background: '#FEE2E2', color: '#B91C1C' }}>
                <TrendingDown className="w-3 h-3" />{aPct}%
              </span>
            </div>
          </div>

          {/* Stacked bar */}
          <div className="px-6 pb-5">
            <div className="h-2.5 rounded-full overflow-hidden flex" style={{ background: 'var(--hairline)' }}>
              {pPct > 0 && <div className="h-full transition-all duration-700 ease-out" style={{ width: `${pPct}%`, background: 'var(--mint)' }} />}
              {lPct > 0 && <div className="h-full transition-all duration-700 ease-out ml-0.5" style={{ width: `${lPct}%`, background: 'var(--warning, #F59E0B)' }} />}
              {aPct > 0 && <div className="h-full transition-all duration-700 ease-out ml-0.5" style={{ width: `${aPct}%`, background: 'var(--danger, #EF4444)' }} />}
            </div>
            <div className="flex items-center gap-5 mt-2.5 flex-wrap">
              {[
                { color: 'var(--mint)',            label: `${pPct}% iştirak` },
                { color: 'var(--warning, #F59E0B)', label: `${lPct}% gecikən` },
                { color: 'var(--danger, #EF4444)',  label: `${aPct}% qayıb` },
              ].map(item => (
                <span key={item.label} className="flex items-center gap-1.5 text-[11px] text-ink-600 font-medium tabular-nums">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN GRID ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── LEFT col (7 cols) ─────────────────────────────────────────── */}
        <div className="lg:col-span-7 space-y-6">

          {/* Class-by-class attendance — chart + filterable / exportable table */}
          <div className="liquid-card overflow-hidden rounded-card">
            <SectionHeader
              icon={CalendarCheck}
              tone="periwinkle"
              title={t('todays_attendance_table')}
              action={t('view_all')}
              onAction={() => navigate('/admin/cedvel')}
            />

            {classAttendance.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center px-6 py-14">
                <div className="icon-chip icon-chip-periwinkle" style={{ width: 52, height: 52, borderRadius: 12 }}>
                  <CalendarCheck className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-ink-700 mt-3">Bu gün üçün davamiyyət qeydə alınmayıb</p>
                <p className="text-xs text-ink-400 mt-1">Müəllimlər dərs zamanı qeyd etdikdə burada görünəcək</p>
              </div>
            ) : (
              <>
                {/* Rounded-bar attendance chart (§10) */}
                {chartData.length > 1 && (
                  <div className="px-4 pt-5 pb-1" style={{ height: 220 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                        <CartesianGrid stroke="#F1F2F4" vertical={false} />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#9AA0B0' }}
                        />
                        <YAxis
                          domain={[0, 100]}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#9AA0B0' }}
                          tickFormatter={(v) => `${v}%`}
                        />
                        <Tooltip cursor={{ fill: 'rgba(87,79,207,0.06)' }} content={<ChartTooltip />} />
                        <Bar dataKey="pct" radius={[6, 6, 0, 0]} barSize={32}>
                          {chartData.map((c) => (
                            <Cell
                              key={c.class_id}
                              fill={c.pct >= 85 ? '#22C55E' : c.pct >= 70 ? '#F59E0B' : '#EF4444'}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Toolbar — filter + export (§4.4) */}
                <div
                  className="flex items-center gap-2 px-4 py-2.5"
                  style={{ borderTop: '1px solid var(--hairline)' }}
                >
                  <div className="relative flex-1 min-w-0 max-w-[240px]">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
                    <input
                      type="text"
                      value={classFilter}
                      onChange={(e) => setClassFilter(e.target.value)}
                      placeholder={t('filter')}
                      className="pastel-input w-full text-[13px]"
                      style={{ height: 34, paddingLeft: 32, borderRadius: 10 }}
                      aria-label={t('filter')}
                    />
                  </div>
                  <button
                    onClick={exportClassesCsv}
                    className="ml-auto inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-600 hover:text-brand-500 transition-colors px-2 py-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{t('export_csv')}</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="pastel-table">
                    <thead>
                      <tr>
                        <th className="text-left">Sinif</th>
                        <th className="text-center">İştirak</th>
                        <th className="text-center">Gecikən</th>
                        <th className="text-center">Qayıb</th>
                        <th className="text-left" style={{ minWidth: 140 }}>Faiz</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredClasses.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center text-[13px] text-ink-400 py-8">
                            {t('filter')} — nəticə tapılmadı
                          </td>
                        </tr>
                      ) : filteredClasses.map(cls => (
                        <tr key={cls.class_id}>
                          <td>
                            <span className="font-semibold text-ink-900 text-[13px]">{cls.name}</span>
                          </td>
                          <td className="text-center tabular-nums">
                            <span className="font-semibold" style={{ color: 'var(--mint-dark, #15803D)' }}>{cls.present}</span>
                          </td>
                          <td className="text-center tabular-nums">
                            <span className="font-semibold" style={{ color: '#B45309' }}>{cls.late}</span>
                          </td>
                          <td className="text-center tabular-nums">
                            <span className="font-semibold" style={{ color: '#B91C1C' }}>{cls.absent}</span>
                          </td>
                          <td>
                            <AttBar pct={cls.pct} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          {/* At-risk students */}
          <div className="liquid-card overflow-hidden rounded-card">
            {atRisk.length > 0 ? (
              <>
                <SectionHeader
                  icon={AlertTriangle}
                  tone="coral"
                  title={t('at_risk_students')}
                  sub={`${atRisk.length} şagird diqqət tələb edir`}
                  action={t('view_all')}
                  onAction={() => navigate('/admin/shagirdler')}
                />
                <div>
                  {atRisk.map(s => (
                    <div
                      key={s.id}
                      className="flex items-center gap-3 pr-5 py-3.5 transition-colors hover:bg-brand-50/50"
                      style={{ borderLeft: '3px solid var(--danger, #EF4444)', borderBottom: '1px solid var(--hairline)' }}
                    >
                      <div className="pl-4">
                        <Avatar name={s.full_name} size="sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-ink-900 truncate">{s.full_name}</p>
                        <p className="text-xs text-ink-600 truncate">
                          {s.class_name}
                          {s.risk_reason && <span className="ml-2 font-semibold" style={{ color: '#B91C1C' }}>· {s.risk_reason}</span>}
                        </p>
                      </div>
                      <div className="flex items-center gap-5 flex-shrink-0">
                        {s.avg_grade != null && (
                          <div className="text-right">
                            <p className="text-[10px] text-ink-400 font-semibold uppercase tracking-[0.04em]">Ort.</p>
                            <p className="text-base font-bold mt-0.5 tabular-nums" style={{ color: s.avg_grade < 5 ? '#B91C1C' : 'var(--ink-700)' }}>{s.avg_grade}</p>
                          </div>
                        )}
                        {s.attendance_pct != null && (
                          <div className="text-right">
                            <p className="text-[10px] text-ink-400 font-semibold uppercase tracking-[0.04em]">Dev.</p>
                            <p className="text-base font-bold mt-0.5 tabular-nums" style={{ color: s.attendance_pct < 75 ? '#B91C1C' : 'var(--ink-700)' }}>{s.attendance_pct}%</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4 px-5 py-5">
                <div className="icon-chip icon-chip-mint" style={{ width: 38, height: 38, borderRadius: 12 }}>
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-ink-900">{t('at_risk_students')}</p>
                  <p className="text-xs text-ink-400 mt-0.5">Risk altında olan şagird yoxdur · Bütün şagirdlər yaxşı vəziyyətdədir</p>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* ── RIGHT col (5 cols) ────────────────────────────────────────── */}
        <div className="lg:col-span-5 space-y-6">

          {/* Upcoming events */}
          <div className="liquid-card overflow-hidden rounded-card">
            <SectionHeader
              icon={Activity}
              tone="periwinkle"
              title={t('upcoming_events')}
              action={t('view_all')}
              onAction={() => navigate('/admin/tedbirler')}
            />

            {events.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center px-6 py-12">
                <div className="icon-chip icon-chip-periwinkle" style={{ width: 48, height: 48, borderRadius: 12 }}>
                  <Activity className="w-5 h-5" />
                </div>
                <p className="text-sm text-ink-400 mt-3">{t('no_upcoming_events')}</p>
              </div>
            ) : (
              <ul>
                {events.map(ev => {
                  const dt   = formatEventDate(ev.start_date)
                  const pill = EVENT_PILL[ev.type] || 'pill-muted'
                  return (
                    <li
                      key={ev.id}
                      className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-brand-50/50"
                      style={{ borderBottom: '1px solid var(--hairline)' }}
                    >
                      {/* Date badge */}
                      <div
                        className="flex-shrink-0 w-12 h-12 flex flex-col items-center justify-center"
                        style={{ borderRadius: 12, background: 'var(--brand-50)' }}
                      >
                        <span className="text-lg font-bold text-brand-700 leading-none tabular-nums">{dt.dd}</span>
                        <span className="text-[9px] font-semibold uppercase tracking-[0.04em] mt-0.5 text-brand-500">{dt.month}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-ink-900 truncate">{ev.title}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[11px] text-ink-400 font-medium capitalize">{dt.weekday}</span>
                          {ev.type && (
                            <span className={pill}>{ev.type}</span>
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
          <div className="liquid-card overflow-hidden rounded-card">
            <SectionHeader
              icon={Bell}
              tone="periwinkle"
              title={t('all_notifications')}
              action={t('view_all')}
              onAction={() => navigate('/admin/mesajlar')}
            />

            {activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center px-6 py-12">
                <div className="icon-chip icon-chip-periwinkle" style={{ width: 48, height: 48, borderRadius: 12 }}>
                  <Bell className="w-5 h-5" />
                </div>
                <p className="text-sm text-ink-400 mt-3">{t('no_notifications')}</p>
              </div>
            ) : (
              <ul className="overflow-y-auto max-h-[340px]">
                {activities.map((a) => {
                  const meta = ACTIVITY_DOT[a.type] || { chip: 'icon-chip-periwinkle', dot: '#9AA0B0' }
                  return (
                    <li
                      key={a.id}
                      className="flex items-start gap-3 px-5 py-4 transition-colors hover:bg-brand-50/50"
                      style={{ borderBottom: '1px solid var(--hairline)' }}
                    >
                      <div
                        className={`icon-chip ${meta.chip} mt-0.5 flex-shrink-0`}
                        style={{ width: 30, height: 30, borderRadius: 10 }}
                        aria-hidden="true"
                      >
                        <span className="w-2 h-2 rounded-full" style={{ background: meta.dot }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-ink-900 leading-snug">{a.title}</p>
                        {a.body && <p className="text-xs text-ink-400 mt-0.5 truncate">{a.body}</p>}
                        <p className="text-[11px] text-ink-400 font-medium mt-1">{timeAgo(a.created_at)} əvvəl</p>
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
