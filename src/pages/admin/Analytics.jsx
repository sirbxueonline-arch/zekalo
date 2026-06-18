import { useState, useEffect } from 'react'
import { AlertTriangle, BarChart3, TrendingUp, Users } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Table from '../../components/ui/Table'
import { PageSpinner } from '../../components/ui/Spinner'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import { GradeBadge } from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import StatCard from '../../components/ui/StatCard'

// ─── Shared HTML tooltip (custom, per §10 chart recipe) ──────────────────────
// Floating dark pill with label + value; neutral ink, follows cursor.
function ChartTooltip({ tip }) {
  if (!tip) return null
  return (
    <div
      className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-ctl px-2.5 py-1.5 shadow-pop"
      style={{ left: tip.x, top: tip.y - 8, background: 'var(--ink-900)' }}
    >
      <div className="text-[11px] font-semibold leading-tight text-white whitespace-nowrap">{tip.label}</div>
      <div className="text-[12px] font-bold leading-tight tabular-nums text-white whitespace-nowrap">{tip.value}</div>
    </div>
  )
}

// ─── Inline SVG bar chart (admin LOW dial) ───────────────────────────────────
// Rounded tops, faint horizontal grid, single brand accent, custom tooltip.
function BarChart({ data, labelKey, valueKey, maxValue, suffix = '', height = 180 }) {
  const [tip, setTip] = useState(null)
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center py-10 text-[13px] text-ink-400">—</div>
    )
  }
  const color = 'var(--brand-500)'
  const max = maxValue || Math.max(...data.map(d => d[valueKey] || 0), 1)
  const barWidth = Math.max(20, Math.min(56, 560 / data.length))
  const svgWidth = data.length * (barWidth + 10) + 40
  const gridLines = [0.25, 0.5, 0.75, 1]

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${svgWidth} ${height + 44}`} className="w-full" style={{ maxHeight: height + 44 }}>
        {/* faint horizontal grid */}
        {gridLines.map((frac) => {
          const y = height - frac * height + 10
          return (
            <line
              key={frac}
              x1={30} y1={y}
              x2={svgWidth - 4} y2={y}
              stroke="var(--hairline)"
              strokeWidth={1}
            />
          )
        })}
        {data.map((d, i) => {
          const val = d[valueKey] || 0
          const barHeight = Math.max(2, (val / max) * height)
          const x = i * (barWidth + 10) + 30
          const y = height - barHeight + 10
          const active = tip?.i === i
          return (
            <g
              key={i}
              onMouseEnter={() => setTip({ i, x: ((x + barWidth / 2) / svgWidth) * 100 + '%', y: (y / (height + 44)) * 100 + '%', label: d[labelKey], value: `${val}${suffix}` })}
              onMouseLeave={() => setTip(null)}
              style={{ cursor: 'default' }}
            >
              {/* full-height hover target */}
              <rect x={x} y={10} width={barWidth} height={height} fill="transparent" />
              <rect x={x} y={y} width={barWidth} height={barHeight} rx={6} ry={6} fill={color} opacity={active ? 1 : 0.85} />
              <text
                x={x + barWidth / 2} y={height + 26}
                textAnchor="middle"
                style={{ fontSize: 10, fill: 'var(--ink-400)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                {d[labelKey]?.length > 8 ? d[labelKey].slice(0, 8) + '…' : d[labelKey]}
              </text>
              <text
                x={x + barWidth / 2} y={y - 5}
                textAnchor="middle"
                style={{ fontSize: 10, fill: 'var(--ink-600)', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 600 }}
              >
                {val}
              </text>
            </g>
          )
        })}
      </svg>
      <ChartTooltip tip={tip} />
    </div>
  )
}

// ─── Inline SVG line / area chart ────────────────────────────────────────────
// Single brand accent, faint grid, custom tooltip on hover.
function LineChart({ data, labelKey, valueKey, height = 180 }) {
  const [tip, setTip] = useState(null)
  if (!data || data.length < 2) {
    return (
      <div className="flex items-center justify-center py-10 text-[13px] text-ink-400">—</div>
    )
  }
  const color = 'var(--brand-500)'
  const max = Math.max(...data.map(d => d[valueKey] || 0), 1)
  const padding = 36
  const width = 580
  const plotWidth = width - padding * 2
  const plotHeight = height - padding
  const vbH = height + 24

  const points = data.map((d, i) => ({
    x: padding + (i / (data.length - 1)) * plotWidth,
    y: padding + plotHeight - ((d[valueKey] || 0) / max) * plotHeight,
    label: d[labelKey],
    value: d[valueKey],
  }))

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = [
    `M ${points[0].x} ${padding + plotHeight}`,
    ...points.map(p => `L ${p.x} ${p.y}`),
    `L ${points[points.length - 1].x} ${padding + plotHeight}`,
    'Z',
  ].join(' ')

  const gradId = `area-grad-${Math.random().toString(36).slice(2, 7)}`
  const gridLines = [0.25, 0.5, 0.75, 1]

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${vbH}`} className="w-full" style={{ maxHeight: vbH }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* faint horizontal grid */}
        {gridLines.map((frac) => {
          const y = padding + plotHeight - frac * plotHeight
          return (
            <line key={frac} x1={padding} y1={y} x2={padding + plotWidth} y2={y}
              stroke="var(--hairline)" strokeWidth={1} />
          )
        })}
        {/* area fill */}
        <path d={areaPath} fill={`url(#${gradId})`} />
        {/* line */}
        <path d={linePath} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {/* dots + labels + hover targets */}
        {points.map((p, i) => {
          const active = tip?.i === i
          return (
            <g
              key={i}
              onMouseEnter={() => setTip({ i, x: (p.x / width) * 100 + '%', y: (p.y / vbH) * 100 + '%', label: p.label, value: `${p.value}%` })}
              onMouseLeave={() => setTip(null)}
              style={{ cursor: 'default' }}
            >
              <rect x={p.x - plotWidth / (data.length * 2)} y={0} width={plotWidth / data.length} height={vbH} fill="transparent" />
              <circle cx={p.x} cy={p.y} r={active ? 5.5 : 4} fill={color} />
              <text x={p.x} y={height + 14} textAnchor="middle"
                style={{ fontSize: 10, fill: 'var(--ink-400)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {p.label}
              </text>
              <text x={p.x} y={p.y - 8} textAnchor="middle"
                style={{ fontSize: 10, fill: 'var(--ink-600)', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 600 }}>
                {p.value}%
              </text>
            </g>
          )
        })}
      </svg>
      <ChartTooltip tip={tip} />
    </div>
  )
}

// ─── Donut chart with center total (per §10) ─────────────────────────────────
// Single brand accent at full opacity for the leading slice, neutral-grey for the
// remainder ring; the grand total sits in the center. Custom tooltip per arc.
function DonutChart({ data, labelKey, valueKey, total, centerLabel }) {
  const [tip, setTip] = useState(null)
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center py-10 text-[13px] text-ink-400">—</div>
    )
  }
  const size = 180
  const cx = size / 2
  const cy = size / 2
  const r = 66
  const stroke = 18
  const circ = 2 * Math.PI * r
  const sum = data.reduce((s, d) => s + (d[valueKey] || 0), 0) || 1
  const grand = total != null ? total : sum

  // Brand at full strength, stepping down through brand tints for additional slices.
  const shades = ['var(--brand-500)', 'var(--brand-400)', 'var(--brand-300)', 'var(--brand-200)', 'var(--hairline-strong)']
  let offset = 0
  const arcs = data.map((d, i) => {
    const frac = (d[valueKey] || 0) / sum
    const dash = frac * circ
    const arc = {
      i,
      color: shades[Math.min(i, shades.length - 1)],
      dasharray: `${dash} ${circ - dash}`,
      dashoffset: -offset,
      label: d[labelKey],
      value: d[valueKey],
    }
    offset += dash
    return arc
  })

  return (
    <div className="relative flex items-center justify-center">
      <svg viewBox={`0 0 ${size} ${size}`} style={{ width: size, height: size }}>
        {/* track */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--hairline)" strokeWidth={stroke} />
        {arcs.map((a) => (
          <circle
            key={a.i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={a.color}
            strokeWidth={tip?.i === a.i ? stroke + 2 : stroke}
            strokeDasharray={a.dasharray}
            strokeDashoffset={a.dashoffset}
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ cursor: 'default' }}
            onMouseEnter={() => setTip({ i: a.i, x: '50%', y: '36%', label: a.label, value: a.value })}
            onMouseLeave={() => setTip(null)}
          />
        ))}
        {/* center total */}
        <text x={cx} y={cy - 4} textAnchor="middle"
          style={{ fontSize: 26, fontWeight: 700, fill: 'var(--ink-900)', fontFamily: '"Bricolage Grotesque", sans-serif' }}>
          {grand}
        </text>
        <text x={cx} y={cy + 16} textAnchor="middle"
          style={{ fontSize: 10, fill: 'var(--ink-400)', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          {centerLabel}
        </text>
      </svg>
      <ChartTooltip tip={tip} />
    </div>
  )
}

export default function Analytics() {
  const { profile, t } = useAuth()
  const [loading, setLoading] = useState(true)
  const [atRisk, setAtRisk] = useState([])
  const [gradeDistribution, setGradeDistribution] = useState([])
  const [attendanceTrend, setAttendanceTrend] = useState([])
  const [teacherWorkload, setTeacherWorkload] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    if (profile?.school_id) fetchData()
  }, [profile?.school_id])

  async function fetchData() {
    try {
      setLoading(true)
      setError(null)

      const { data: schoolClasses } = await supabase
        .from('classes').select('id').eq('school_id', profile.school_id)
      const classIds = (schoolClasses || []).map(c => c.id)

      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

      let atRiskData = []
      try {
        const { data } = await supabase.rpc('get_at_risk_students', { p_school_id: profile.school_id })
        atRiskData = data || []
      } catch { /* RPC not deployed — ignore */ }

      const [gradesRes, attendanceRes, workloadRes] = await Promise.all([
        classIds.length
          ? supabase.from('grades').select('score, class:classes(name)').in('class_id', classIds)
          : Promise.resolve({ data: [] }),
        classIds.length
          ? supabase.from('attendance').select('date, status').in('class_id', classIds).order('date')
          : Promise.resolve({ data: [] }),
        classIds.length
          ? supabase.from('grades').select('teacher_id:profiles(full_name), id').in('class_id', classIds).gte('created_at', monthStart)
          : Promise.resolve({ data: [] }),
      ])

      setAtRisk(atRiskData)

      const gradesByClass = {}
      ;(gradesRes.data || []).forEach(g => {
        const className = g.class?.name || 'Naməlum'
        if (!gradesByClass[className]) gradesByClass[className] = { name: className, total: 0, sum: 0 }
        gradesByClass[className].total++
        gradesByClass[className].sum += g.score || 0
      })
      setGradeDistribution(Object.values(gradesByClass).map(c => ({
        name: c.name,
        avg: c.total > 0 ? Math.round((c.sum / c.total) * 10) / 10 : 0,
      })))

      const byWeek = {}
      ;(attendanceRes.data || []).forEach(a => {
        const d = new Date(a.date)
        const weekStart = new Date(d)
        weekStart.setDate(d.getDate() - d.getDay() + 1)
        const key = `${String(weekStart.getDate()).padStart(2, '0')}.${String(weekStart.getMonth() + 1).padStart(2, '0')}`
        if (!byWeek[key]) byWeek[key] = { label: key, total: 0, present: 0 }
        byWeek[key].total++
        if (a.status === 'present') byWeek[key].present++
      })
      setAttendanceTrend(Object.values(byWeek).slice(-12).map(w => ({
        label: w.label,
        pct: w.total > 0 ? Math.round((w.present / w.total) * 100) : 0,
      })))

      const byTeacher = {}
      ;(workloadRes.data || []).forEach(g => {
        const name = g.teacher_id?.full_name || 'Naməlum'
        if (!byTeacher[name]) byTeacher[name] = { name, count: 0 }
        byTeacher[name].count++
      })
      setTeacherWorkload(Object.values(byTeacher).sort((a, b) => b.count - a.count))
    } catch {
      setError(t('error'))
    } finally {
      setLoading(false)
    }
  }

  const atRiskColumns = [
    {
      key: 'full_name',
      label: t('full_name'),
      render: (val) => (
        <div className="flex items-center gap-3">
          <Avatar name={val} size="sm" />
          <span className="font-semibold text-ink-900 text-[14px]">{val}</span>
        </div>
      ),
    },
    { key: 'class_name', label: t('class_name') },
    {
      key: 'attendance_pct',
      label: t('present'),
      render: (val) => val != null
        ? <span className="tabular-nums font-semibold text-ink-700">{val}%</span>
        : '—',
    },
    { key: 'avg_grade', label: t('score'), render: (val) => val != null ? <GradeBadge score={val} /> : '—' },
    { key: 'risk_reason', label: t('note'), render: (val) => val || '—' },
  ]

  if (loading) return <PageSpinner />

  return (
    <div className="space-y-6">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-[22px] text-ink-900 leading-snug">
            {t('analytics')}
          </h1>
          <p className="text-[13px] text-ink-400 mt-0.5">
            {t('at_risk')} · {atRisk.length} {t('students')}
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={fetchData}>
          {t('filter')}
        </Button>
      </div>

      {error && (
        <div className="rounded-tile border border-danger/30 bg-danger/5 px-4 py-3 text-[13px] text-danger font-medium">
          {error}
        </div>
      )}

      {/* ── KPI row (hairline, admin LOW; coral reserved for the meaning-bearing risk metric) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label={t('at_risk')}
          value={atRisk.length}
          icon={AlertTriangle}
          tone="coral"
        />
        <StatCard
          label={t('score')}
          value={gradeDistribution.length > 0
            ? `${(gradeDistribution.reduce((s, c) => s + c.avg, 0) / gradeDistribution.length).toFixed(1)}`
            : '—'}
          icon={BarChart3}
          tone="periwinkle"
        />
        <StatCard
          label={t('today_attendance')}
          value={attendanceTrend.length > 0
            ? `${attendanceTrend[attendanceTrend.length - 1]?.pct ?? '—'}%`
            : '—'}
          icon={TrendingUp}
          tone="periwinkle"
        />
      </div>

      {/* ── At-risk table ── */}
      <div className="liquid-card overflow-hidden p-0">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-hairline">
          <div className="icon-chip icon-chip-coral" style={{ width: 36, height: 36 }}>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <h2 className="font-semibold text-[16px] text-ink-900 leading-none">{t('at_risk')}</h2>
          <Badge variant="absent">{atRisk.length}</Badge>
        </div>
        {atRisk.length === 0 ? (
          <EmptyState
            tier={1}
            title={t('no_data')}
            description="Hazırda risk altında olan şagird yoxdur."
            className="border-none shadow-none"
          />
        ) : (
          <Table columns={atRiskColumns} data={atRisk} emptyMessage={t('no_data')} />
        )}
      </div>

      {/* ── Charts row (single brand accent; neutral chips, admin LOW) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="liquid-card p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="icon-chip icon-chip-periwinkle" style={{ width: 36, height: 36 }}>
              <BarChart3 className="w-4 h-4" />
            </div>
            <h2 className="font-semibold text-[15px] text-ink-900">{t('score')}</h2>
          </div>
          {gradeDistribution.length === 0 ? (
            <EmptyState
              tier={1}
              title={t('no_data')}
              className="border-none shadow-none py-8"
            />
          ) : (
            <BarChart
              data={gradeDistribution}
              labelKey="name"
              valueKey="avg"
              maxValue={10}
            />
          )}
        </div>

        <div className="liquid-card p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="icon-chip icon-chip-periwinkle" style={{ width: 36, height: 36 }}>
              <TrendingUp className="w-4 h-4" />
            </div>
            <h2 className="font-semibold text-[15px] text-ink-900">{t('today_attendance')}</h2>
          </div>
          {attendanceTrend.length < 2 ? (
            <EmptyState
              tier={1}
              title={t('no_data')}
              className="border-none shadow-none py-8"
            />
          ) : (
            <LineChart
              data={attendanceTrend}
              labelKey="label"
              valueKey="pct"
            />
          )}
        </div>
      </div>

      {/* ── Teacher workload (donut + center total, per §10) ── */}
      <div className="liquid-card p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="icon-chip icon-chip-periwinkle" style={{ width: 36, height: 36 }}>
            <Users className="w-4 h-4" />
          </div>
          <h2 className="font-semibold text-[15px] text-ink-900">{t('teachers')}</h2>
        </div>
        {teacherWorkload.length === 0 ? (
          <EmptyState
            tier={1}
            title={t('no_data')}
            className="border-none shadow-none py-8"
          />
        ) : (
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <DonutChart
              data={teacherWorkload}
              labelKey="name"
              valueKey="count"
              total={teacherWorkload.reduce((s, w) => s + (w.count || 0), 0)}
              centerLabel={t('score')}
            />
            <ul className="flex-1 space-y-2 min-w-0">
              {teacherWorkload.slice(0, 6).map((w, i) => {
                const shades = ['var(--brand-500)', 'var(--brand-400)', 'var(--brand-300)', 'var(--brand-200)', 'var(--hairline-strong)', 'var(--hairline-strong)']
                return (
                  <li key={i} className="flex items-center gap-2.5 text-[13px]">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: shades[Math.min(i, shades.length - 1)] }} />
                    <span className="text-ink-700 truncate flex-1">{w.name}</span>
                    <span className="text-ink-900 font-semibold tabular-nums">{w.count}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
