import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { GradeBadge } from '../../components/ui/Badge'
import { BarChart3, AlertTriangle } from 'lucide-react'
import EmptyState from '../../components/ui/EmptyState'

const months = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avq', 'Sen', 'Okt', 'Noy', 'Dek']

// Design-system chart palette (§10) — V3: brand carries the chrome; the rest are
// reserved for meaning-bearing status (low→high grade, attendance bands) only.
const CHART = {
  brand:  '#574FCF', // brand-500
  mint:   '#1FA855', // success / "good"
  amber:  '#EAB308', // warning
  sky:    '#3BA8E6', // info
  coral:  '#F4677E', // danger warmth
  grape:  '#7C5CE0', // achievements
}

// Grade bucket colours: a muted danger → warning → brand → success diverging scale
// (meaning-bearing: low score → high score). Mid bucket anchors on the brand accent.
const BUCKET_COLORS = [CHART.coral, '#E8924A', CHART.amber, CHART.brand, CHART.mint]

export default function TeacherAnalytics() {
  const { profile, t } = useAuth()
  const [loading, setLoading] = useState(true)
  const [teacherClasses, setTeacherClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [atRiskStudents, setAtRiskStudents] = useState([])
  const [gradeDistribution, setGradeDistribution] = useState([])
  const [attendanceHeatmap, setAttendanceHeatmap] = useState([])
  const [averageTrend, setAverageTrend] = useState([])

  useEffect(() => {
    if (!profile) return
    loadInitial()
  }, [profile])

  useEffect(() => {
    if (selectedClass) loadClassAnalytics()
  }, [selectedClass])

  async function loadInitial() {
    const tcRes = await supabase
      .from('teacher_classes')
      .select('*, class:classes(id, name), subject:subjects(id, name)')
      .eq('teacher_id', profile.id)

    const unique = [...new Map((tcRes.data || []).map(tc => [tc.class_id, tc.class])).values()]
    setTeacherClasses(unique)
    if (unique.length) setSelectedClass(unique[0].id)

    try {
      const { data } = await supabase.rpc('get_at_risk_students', { p_school_id: profile.school_id })
      setAtRiskStudents(data || [])
    } catch { /* RPC not deployed — ignore */ }

    setLoading(false)
  }

  async function loadClassAnalytics() {
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

    const [gradesRes, attRes] = await Promise.all([
      supabase.from('grades').select('*, subject:subjects(name)').eq('class_id', selectedClass).gte('date', threeMonthsAgo.toISOString().split('T')[0]),
      supabase.from('attendance').select('date, status').eq('class_id', selectedClass).gte('date', threeMonthsAgo.toISOString().split('T')[0]).order('date'),
    ])

    const grades = gradesRes.data || []
    const attendance = attRes.data || []

    const subjectMap = {}
    grades.forEach(g => {
      const name = g.subject?.name || 'Digər'
      if (!subjectMap[name]) subjectMap[name] = { scores: [], name }
      const normalized = g.max_score > 0 ? (g.score / g.max_score) * 10 : g.score
      subjectMap[name].scores.push(normalized)
    })

    const distribution = Object.values(subjectMap).map(s => {
      const buckets = [0, 0, 0, 0, 0]
      s.scores.forEach(score => {
        const idx = Math.min(Math.floor(score / 2), 4)
        buckets[idx]++
      })
      const avg = s.scores.length ? Math.round((s.scores.reduce((a, b) => a + b, 0) / s.scores.length) * 10) / 10 : 0
      return { name: s.name, buckets, avg, total: s.scores.length }
    })
    setGradeDistribution(distribution)

    const dailyMap = {}
    attendance.forEach(a => {
      if (!dailyMap[a.date]) dailyMap[a.date] = { present: 0, total: 0 }
      dailyMap[a.date].total++
      if (a.status === 'present') dailyMap[a.date].present++
    })

    const heatmapData = Object.entries(dailyMap).map(([date, d]) => ({
      date,
      rate: d.total > 0 ? Math.round((d.present / d.total) * 100) : 0,
    })).sort((a, b) => a.date.localeCompare(b.date))
    setAttendanceHeatmap(heatmapData)

    const monthlyMap = {}
    grades.forEach(g => {
      const month = g.date?.slice(0, 7)
      if (!month) return
      if (!monthlyMap[month]) monthlyMap[month] = []
      const normalized = g.max_score > 0 ? (g.score / g.max_score) * 10 : g.score
      monthlyMap[month].push(normalized)
    })

    const trend = Object.entries(monthlyMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, scores]) => ({
        month,
        label: months[parseInt(month.split('-')[1]) - 1],
        avg: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10,
      }))
    setAverageTrend(trend)
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="pastel-skeleton h-12 w-72" />
        <div className="pastel-skeleton h-48" />
        <div className="pastel-skeleton h-64" />
      </div>
    )
  }

  const maxBucket = Math.max(...gradeDistribution.flatMap(d => d.buckets), 1)
  const bucketLabels = ['0–2', '2–4', '4–6', '6–8', '8–10']

  const lineW = 600
  const lineH = 200
  const linePadX = 40
  const linePadY = 20
  const cellSize = 14
  const cellGap = 2

  const noData = gradeDistribution.length === 0 && attendanceHeatmap.length === 0

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="icon-chip icon-chip-periwinkle">
            <BarChart3 className="w-5 h-5" />
          </div>
          <h1 className="font-display font-bold text-[26px] text-ink-900 tracking-[-0.01em]">
            {t('analytics')}
          </h1>
        </div>
        <div className="w-56">
          <select
            className="pastel-input"
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
          >
            {teacherClasses.length === 0 && <option>—</option>}
            {teacherClasses.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* At-risk students */}
      {atRiskStudents.length > 0 && (
        <div className="liquid-card overflow-hidden">
          <div
            className="flex items-center gap-2 px-5 py-4"
            style={{ borderBottom: '1px solid var(--hairline)' }}
          >
            <span className="icon-chip icon-chip-peach" style={{ width: 32, height: 32, borderRadius: 10 }}>
              <AlertTriangle className="w-4 h-4" />
            </span>
            <h2 className="font-semibold text-sm text-ink-900">{t('at_risk')}</h2>
            <span className="pill-rose ml-1">{atRiskStudents.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="pastel-table">
              <thead>
                <tr>
                  <th>{t('full_name')}</th>
                  <th>{t('class_name')}</th>
                  <th>{t('avg_grade')}</th>
                  <th>{t('attendance_pct')}</th>
                </tr>
              </thead>
              <tbody>
                {atRiskStudents.map((s, i) => (
                  <tr key={i}>
                    <td className="font-semibold text-ink-900">{s.full_name}</td>
                    <td className="text-ink-600">{s.class_name}</td>
                    <td><GradeBadge score={Math.round(s.avg_grade * 10) / 10} /></td>
                    <td>
                      <span
                        className="tabular-nums font-semibold"
                        style={{ color: s.attendance_pct < 80 ? '#B91C1C' : 'var(--ink-600)' }}
                      >
                        {s.attendance_pct}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Grade distribution per subject */}
      {gradeDistribution.length > 0 && (
        <div className="liquid-card p-6">
          <h2 className="text-[13px] tracking-[0.04em] uppercase font-semibold text-ink-400 mb-5">
            {t('grades')}
          </h2>
          <div className="space-y-7">
            {gradeDistribution.map(subject => (
              <div key={subject.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-ink-900">{subject.name}</span>
                  <span className="text-xs text-ink-400 tabular-nums">
                    Orta:{' '}
                    <span className="text-brand-500 font-semibold">
                      {String(subject.avg).replace('.', ',')}
                    </span>
                    {' · '}{subject.total} qiymət
                  </span>
                </div>
                {/* Custom inline bar chart (no Recharts dep needed for simple bars) */}
                <svg
                  width="100%"
                  height="52"
                  viewBox="0 0 400 52"
                  preserveAspectRatio="xMinYMid meet"
                  aria-hidden="true"
                >
                  {subject.buckets.map((count, i) => {
                    const barW = 68
                    const gap = 12
                    const x = i * (barW + gap)
                    const barH = maxBucket > 0 ? (count / maxBucket) * 34 : 0
                    return (
                      <g key={i}>
                        {/* background track */}
                        <rect x={x} y={0} width={barW} height={34} rx={6} fill="var(--hairline)" opacity="0.6" />
                        {/* filled bar */}
                        <rect
                          x={x}
                          y={34 - barH}
                          width={barW}
                          height={barH}
                          rx={6}
                          fill={BUCKET_COLORS[i]}
                          opacity={0.9}
                        />
                        <text
                          x={x + barW / 2}
                          y={48}
                          textAnchor="middle"
                          fontSize="9"
                          fill="var(--ink-400)"
                          fontFamily="Plus Jakarta Sans, sans-serif"
                        >
                          {bucketLabels[i]}
                        </text>
                        {count > 0 && (
                          <text
                            x={x + barW / 2}
                            y={Math.max(28 - barH, 11)}
                            textAnchor="middle"
                            fontSize="10"
                            fill="var(--ink-700)"
                            fontWeight="600"
                            fontFamily="Plus Jakarta Sans, sans-serif"
                          >
                            {count}
                          </text>
                        )}
                      </g>
                    )
                  })}
                </svg>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attendance heatmap */}
      {attendanceHeatmap.length > 0 && (
        <div className="liquid-card p-6">
          <h2 className="text-[13px] tracking-[0.04em] uppercase font-semibold text-ink-400 mb-5">
            {t('attendance')}
          </h2>
          <div className="overflow-x-auto pb-1">
            <svg
              width={attendanceHeatmap.length * (cellSize + cellGap) + 20}
              height={cellSize + 36}
              aria-hidden="true"
            >
              {attendanceHeatmap.map((day, i) => {
                const x = i * (cellSize + cellGap)
                const fill =
                  day.rate >= 90
                    ? CHART.mint
                    : day.rate >= 70
                    ? '#7FD0A4'
                    : day.rate >= 50
                    ? CHART.amber
                    : CHART.coral
                return (
                  <g key={day.date}>
                    <rect x={x} y={0} width={cellSize} height={cellSize} rx={3} fill={fill} opacity={0.88}>
                      <title>{day.date}: {day.rate}%</title>
                    </rect>
                  </g>
                )
              })}
              {/* Legend */}
              <g fontFamily="Plus Jakarta Sans, sans-serif" fontSize="9" fill="var(--ink-400)">
                <rect x={0} y={cellSize + 12} width={cellSize} height={cellSize} rx={3} fill={CHART.mint} />
                <text x={cellSize + 4} y={cellSize + 23}>90%+</text>
                <rect x={52} y={cellSize + 12} width={cellSize} height={cellSize} rx={3} fill="#7FD0A4" />
                <text x={66 + 4} y={cellSize + 23}>70–90%</text>
                <rect x={120} y={cellSize + 12} width={cellSize} height={cellSize} rx={3} fill={CHART.amber} />
                <text x={134 + 4} y={cellSize + 23}>50–70%</text>
                <rect x={192} y={cellSize + 12} width={cellSize} height={cellSize} rx={3} fill={CHART.coral} />
                <text x={206 + 4} y={cellSize + 23}>&lt;50%</text>
              </g>
            </svg>
          </div>
        </div>
      )}

      {/* Average trend line */}
      {averageTrend.length > 1 && (
        <div className="liquid-card p-6">
          <h2 className="text-[13px] tracking-[0.04em] uppercase font-semibold text-ink-400 mb-5">
            {t('avg_grade')}
          </h2>
          <svg
            width="100%"
            height={lineH + linePadY * 2}
            viewBox={`0 0 ${lineW} ${lineH + linePadY * 2}`}
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="analyticsLineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART.brand} stopOpacity="0.22" />
                <stop offset="100%" stopColor={CHART.brand} stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {[0, 2.5, 5, 7.5, 10].map(v => {
              const y = linePadY + lineH - (v / 10) * lineH
              return (
                <g key={v}>
                  <line
                    x1={linePadX}
                    y1={y}
                    x2={lineW - 10}
                    y2={y}
                    stroke="var(--hairline)"
                    strokeWidth={1}
                  />
                  <text
                    x={linePadX - 8}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="10"
                    fill="var(--ink-400)"
                    fontFamily="Plus Jakarta Sans, sans-serif"
                  >
                    {v}
                  </text>
                </g>
              )
            })}

            {/* Area fill */}
            <polygon
              fill="url(#analyticsLineGrad)"
              points={[
                `${linePadX},${linePadY + lineH}`,
                ...averageTrend.map((d, i) => {
                  const x = linePadX + (i / (averageTrend.length - 1)) * (lineW - linePadX - 10)
                  const y = linePadY + lineH - (d.avg / 10) * lineH
                  return `${x},${y}`
                }),
                `${linePadX + (lineW - linePadX - 10)},${linePadY + lineH}`,
              ].join(' ')}
            />

            {/* Line */}
            <polyline
              fill="none"
              stroke={CHART.brand}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              points={averageTrend.map((d, i) => {
                const x = linePadX + (i / (averageTrend.length - 1)) * (lineW - linePadX - 10)
                const y = linePadY + lineH - (d.avg / 10) * lineH
                return `${x},${y}`
              }).join(' ')}
            />

            {/* Data points */}
            {averageTrend.map((d, i) => {
              const x = linePadX + (i / (averageTrend.length - 1)) * (lineW - linePadX - 10)
              const y = linePadY + lineH - (d.avg / 10) * lineH
              return (
                <g key={d.month}>
                  <circle cx={x} cy={y} r={5} fill={CHART.brand} />
                  <circle cx={x} cy={y} r={2.5} fill="white" />
                  <text
                    x={x}
                    y={y - 12}
                    textAnchor="middle"
                    fontSize="10"
                    fill={CHART.brand}
                    fontWeight="700"
                    fontFamily="Plus Jakarta Sans, sans-serif"
                    className="tabular-nums"
                  >
                    {String(d.avg).replace('.', ',')}
                  </text>
                  <text
                    x={x}
                    y={linePadY + lineH + 15}
                    textAnchor="middle"
                    fontSize="9"
                    fill="var(--ink-400)"
                    fontFamily="Plus Jakarta Sans, sans-serif"
                  >
                    {d.label}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
      )}

      {/* Empty state */}
      {noData && (
        <EmptyState
          tier={1}
          icon={BarChart3}
          title={t('no_data')}
          description="Sinif seçildikdə statistika burada görünəcək."
        />
      )}
    </div>
  )
}
