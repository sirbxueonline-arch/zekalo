import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { GradeBadge } from '../../components/ui/Badge'
import { BarChart3, AlertTriangle } from 'lucide-react'

const months = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avq', 'Sen', 'Okt', 'Noy', 'Dek']

// Pastel chart palette
const PASTEL = {
  periwinkle: '#7c6ee0',
  mint:       '#5db8a3',
  peach:      '#e8a87c',
  blue:       '#6b9dde',
  rose:       '#e56b7f',
  amber:      '#f0b870',
  green:      '#5db8a3',
}

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
  const bucketLabels = ['0-2', '2-4', '4-6', '6-8', '8-10']
  const barColors = [PASTEL.rose, PASTEL.peach, PASTEL.amber, PASTEL.periwinkle, PASTEL.mint]

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
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: '#1a1a2e' }}>
          <span className="pastel-text">{t('analytics')}</span>
        </h1>
        <div className="w-56">
          <select className="pastel-input" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
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
          <div className="flex items-center gap-2 px-5 py-4 border-b" style={{ borderColor: 'rgba(124,110,224,0.12)' }}>
            <span className="icon-chip icon-chip-peach" style={{ width: 32, height: 32, borderRadius: 10 }}>
              <AlertTriangle className="w-4 h-4" />
            </span>
            <h2 className="font-semibold text-sm" style={{ color: '#1a1a2e' }}>{t('at_risk')}</h2>
            <span className="pastel-badge pastel-badge-rose ml-1">{atRiskStudents.length}</span>
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
                    <td style={{ fontWeight: 600 }}>{s.full_name}</td>
                    <td>{s.class_name}</td>
                    <td><GradeBadge score={Math.round(s.avg_grade * 10) / 10} /></td>
                    <td>
                      <span style={{ color: s.attendance_pct < 80 ? '#b83b54' : '#475569', fontWeight: 600 }}>
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

      {/* Grade distribution */}
      {gradeDistribution.length > 0 && (
        <div className="liquid-card p-6">
          <h2 className="text-xs tracking-widest uppercase mb-5 font-semibold" style={{ color: '#64748b' }}>{t('grades')}</h2>
          <div className="space-y-6">
            {gradeDistribution.map(subject => (
              <div key={subject.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold" style={{ color: '#1a1a2e' }}>{subject.name}</span>
                  <span className="text-xs" style={{ color: '#64748b' }}>
                    Orta: <span style={{ color: '#7c6ee0', fontWeight: 600 }}>{String(subject.avg).replace('.', ',')}</span>
                    {' · '}{subject.total} qiymət
                  </span>
                </div>
                <svg width="100%" height="48" viewBox={`0 0 400 48`} preserveAspectRatio="xMinYMid meet">
                  {subject.buckets.map((count, i) => {
                    const barWidth = 70
                    const gap = 10
                    const x = i * (barWidth + gap)
                    const barHeight = maxBucket > 0 ? (count / maxBucket) * 32 : 0
                    return (
                      <g key={i}>
                        <rect x={x} y={32 - barHeight} width={barWidth} height={barHeight} rx={4} fill={barColors[i]} opacity={0.85} />
                        <text x={x + barWidth / 2} y={46} textAnchor="middle" className="text-[9px]" fill="#94a3b8">{bucketLabels[i]}</text>
                        {count > 0 && (
                          <text x={x + barWidth / 2} y={28 - barHeight} textAnchor="middle" className="text-[10px]" fill="#475569" fontWeight="600">{count}</text>
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
          <h2 className="text-xs tracking-widest uppercase mb-5 font-semibold" style={{ color: '#64748b' }}>{t('attendance')}</h2>
          <div className="overflow-x-auto">
            <svg width={attendanceHeatmap.length * (cellSize + cellGap) + 20} height={cellSize + 30}>
              {attendanceHeatmap.map((day, i) => {
                const x = i * (cellSize + cellGap)
                const fill = day.rate >= 90 ? PASTEL.mint : day.rate >= 70 ? '#8fcebd' : day.rate >= 50 ? PASTEL.peach : PASTEL.rose
                return (
                  <g key={day.date}>
                    <rect x={x} y={0} width={cellSize} height={cellSize} rx={3} fill={fill} opacity={0.9}>
                      <title>{day.date}: {day.rate}%</title>
                    </rect>
                  </g>
                )
              })}
              <g>
                <rect x={0} y={cellSize + 10} width={cellSize} height={cellSize} rx={3} fill={PASTEL.mint} />
                <text x={cellSize + 4} y={cellSize + 21} className="text-[9px]" fill="#64748b">90%+</text>
                <rect x={50} y={cellSize + 10} width={cellSize} height={cellSize} rx={3} fill="#8fcebd" />
                <text x={64 + 4} y={cellSize + 21} className="text-[9px]" fill="#64748b">70-90%</text>
                <rect x={120} y={cellSize + 10} width={cellSize} height={cellSize} rx={3} fill={PASTEL.peach} />
                <text x={134 + 4} y={cellSize + 21} className="text-[9px]" fill="#64748b">50-70%</text>
                <rect x={190} y={cellSize + 10} width={cellSize} height={cellSize} rx={3} fill={PASTEL.rose} />
                <text x={204 + 4} y={cellSize + 21} className="text-[9px]" fill="#64748b">&lt;50%</text>
              </g>
            </svg>
          </div>
        </div>
      )}

      {/* Average trend line chart */}
      {averageTrend.length > 1 && (
        <div className="liquid-card p-6">
          <h2 className="text-xs tracking-widest uppercase mb-5 font-semibold" style={{ color: '#64748b' }}>{t('avg_grade')}</h2>
          <svg width="100%" height={lineH + linePadY * 2} viewBox={`0 0 ${lineW} ${lineH + linePadY * 2}`} preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={PASTEL.periwinkle} stopOpacity="0.25" />
                <stop offset="100%" stopColor={PASTEL.periwinkle} stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0, 2.5, 5, 7.5, 10].map(v => {
              const y = linePadY + lineH - (v / 10) * lineH
              return (
                <g key={v}>
                  <line x1={linePadX} y1={y} x2={lineW - 10} y2={y} stroke="rgba(124,110,224,0.12)" strokeWidth={0.5} />
                  <text x={linePadX - 8} y={y + 3} textAnchor="end" className="text-[9px]" fill="#94a3b8">{v}</text>
                </g>
              )
            })}
            <polygon
              fill="url(#lineGrad)"
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
            <polyline
              fill="none"
              stroke={PASTEL.periwinkle}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              points={averageTrend.map((d, i) => {
                const x = linePadX + (i / (averageTrend.length - 1)) * (lineW - linePadX - 10)
                const y = linePadY + lineH - (d.avg / 10) * lineH
                return `${x},${y}`
              }).join(' ')}
            />
            {averageTrend.map((d, i) => {
              const x = linePadX + (i / (averageTrend.length - 1)) * (lineW - linePadX - 10)
              const y = linePadY + lineH - (d.avg / 10) * lineH
              return (
                <g key={d.month}>
                  <circle cx={x} cy={y} r={5} fill={PASTEL.periwinkle} />
                  <circle cx={x} cy={y} r={2.5} fill="white" />
                  <text x={x} y={y - 12} textAnchor="middle" className="text-[10px]" fill={PASTEL.periwinkle} fontWeight="700">
                    {String(d.avg).replace('.', ',')}
                  </text>
                  <text x={x} y={linePadY + lineH + 14} textAnchor="middle" className="text-[9px]" fill="#94a3b8">{d.label}</text>
                </g>
              )
            })}
          </svg>
        </div>
      )}

      {/* Empty state */}
      {noData && (
        <div className="liquid-card p-12">
          <div className="text-center">
            <div className="icon-chip icon-chip-periwinkle mx-auto mb-3" style={{ width: 64, height: 64 }}>
              <BarChart3 className="w-8 h-8" />
            </div>
            <p className="text-sm font-semibold" style={{ color: '#1a1a2e' }}>{t('no_data')}</p>
            <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>Sinif seçildikdə statistika burada görünəcək</p>
          </div>
        </div>
      )}
    </div>
  )
}
