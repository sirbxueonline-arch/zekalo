import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Card from '../../components/ui/Card'
import { Select } from '../../components/ui/Input'
import Table from '../../components/ui/Table'
import { PageSpinner } from '../../components/ui/Spinner'
import { GradeBadge } from '../../components/ui/Badge'
import { BarChart3 } from 'lucide-react'

const months = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avq', 'Sen', 'Okt', 'Noy', 'Dek']

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

    // get_at_risk_students is an optional RPC — fall back gracefully if it doesn't exist
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

    // Grade distribution per subject
    const subjectMap = {}
    grades.forEach(g => {
      const name = g.subject?.name || 'Digər'
      if (!subjectMap[name]) subjectMap[name] = { scores: [], name }
      const normalized = g.max_score > 0 ? (g.score / g.max_score) * 10 : g.score
      subjectMap[name].scores.push(normalized)
    })

    const distribution = Object.values(subjectMap).map(s => {
      const buckets = [0, 0, 0, 0, 0] // 0-2, 2-4, 4-6, 6-8, 8-10
      s.scores.forEach(score => {
        const idx = Math.min(Math.floor(score / 2), 4)
        buckets[idx]++
      })
      const avg = s.scores.length ? Math.round((s.scores.reduce((a, b) => a + b, 0) / s.scores.length) * 10) / 10 : 0
      return { name: s.name, buckets, avg, total: s.scores.length }
    })
    setGradeDistribution(distribution)

    // Attendance heatmap - daily rates for last 3 months
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

    // Average trend per month
    const monthlyMap = {}
    grades.forEach(g => {
      const month = g.date?.slice(0, 7) // YYYY-MM
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

  const atRiskColumns = [
    { key: 'full_name', label: t('full_name') },
    { key: 'class_name', label: t('class_name') },
    { key: 'avg_grade', label: t('avg_grade'), render: (v) => <GradeBadge score={Math.round(v * 10) / 10} /> },
    { key: 'attendance_pct', label: t('attendance_pct'), render: (v) => <span className={`text-sm ${v < 80 ? 'text-red-600' : 'text-gray-700'}`}>{v}%</span> },
  ]

  if (loading) return <PageSpinner />

  const maxBucket = Math.max(...gradeDistribution.flatMap(d => d.buckets), 1)
  const bucketLabels = ['0-2', '2-4', '4-6', '6-8', '8-10']
  const barColors = ['#E74C3C', '#EF9F27', '#EF9F27', '#534AB7', '#1D9E75']

  // Line chart dimensions
  const lineW = 600
  const lineH = 200
  const linePadX = 40
  const linePadY = 20

  // Heatmap config
  const cellSize = 14
  const cellGap = 2

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-4xl text-gray-900 tracking-tight">{t('analytics')}</h1>
        <div className="w-48">
          <Select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
            {teacherClasses.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </div>
      </div>

      {atRiskStudents.length > 0 && (
        <Card hover={false}>
          <h2 className="text-xs tracking-widest text-gray-400 uppercase mb-4">{t('at_risk')}</h2>
          <Table columns={atRiskColumns} data={atRiskStudents} />
        </Card>
      )}

      {gradeDistribution.length > 0 && (
        <Card hover={false}>
          <h2 className="text-xs tracking-widest text-gray-400 uppercase mb-4">{t('grades')}</h2>
          <div className="space-y-6">
            {gradeDistribution.map(subject => (
              <div key={subject.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">{subject.name}</span>
                  <span className="text-xs text-gray-500">Orta: {String(subject.avg).replace('.', ',')} &middot; {subject.total} qiymət</span>
                </div>
                <svg width="100%" height="48" viewBox={`0 0 400 48`} preserveAspectRatio="xMinYMid meet">
                  {subject.buckets.map((count, i) => {
                    const barWidth = 70
                    const gap = 10
                    const x = i * (barWidth + gap)
                    const barHeight = maxBucket > 0 ? (count / maxBucket) * 32 : 0
                    return (
                      <g key={i}>
                        <rect x={x} y={32 - barHeight} width={barWidth} height={barHeight} rx={3} fill={barColors[i]} opacity={0.8} />
                        <text x={x + barWidth / 2} y={46} textAnchor="middle" className="text-[9px]" fill="#9CA3AF">{bucketLabels[i]}</text>
                        {count > 0 && (
                          <text x={x + barWidth / 2} y={28 - barHeight} textAnchor="middle" className="text-[9px]" fill="#6B7280">{count}</text>
                        )}
                      </g>
                    )
                  })}
                </svg>
              </div>
            ))}
          </div>
        </Card>
      )}

      {attendanceHeatmap.length > 0 && (
        <Card hover={false}>
          <h2 className="text-xs tracking-widest text-gray-400 uppercase mb-4">{t('attendance')}</h2>
          <div className="overflow-x-auto">
            <svg width={attendanceHeatmap.length * (cellSize + cellGap) + 20} height={cellSize + 30}>
              {attendanceHeatmap.map((day, i) => {
                const x = i * (cellSize + cellGap)
                const green = Math.round((day.rate / 100) * 200)
                const fill = day.rate >= 90 ? '#1D9E75' : day.rate >= 70 ? '#6DD4A8' : day.rate >= 50 ? '#EF9F27' : '#E74C3C'
                return (
                  <g key={day.date}>
                    <rect
                      x={x}
                      y={0}
                      width={cellSize}
                      height={cellSize}
                      rx={2}
                      fill={fill}
                      opacity={0.85}
                    >
                      <title>{day.date}: {day.rate}%</title>
                    </rect>
                  </g>
                )
              })}
              <g>
                <rect x={0} y={cellSize + 10} width={cellSize} height={cellSize} rx={2} fill="#1D9E75" />
                <text x={cellSize + 4} y={cellSize + 21} className="text-[9px]" fill="#9CA3AF">90%+</text>
                <rect x={50} y={cellSize + 10} width={cellSize} height={cellSize} rx={2} fill="#6DD4A8" />
                <text x={64 + 4} y={cellSize + 21} className="text-[9px]" fill="#9CA3AF">70-90%</text>
                <rect x={120} y={cellSize + 10} width={cellSize} height={cellSize} rx={2} fill="#EF9F27" />
                <text x={134 + 4} y={cellSize + 21} className="text-[9px]" fill="#9CA3AF">50-70%</text>
                <rect x={190} y={cellSize + 10} width={cellSize} height={cellSize} rx={2} fill="#E74C3C" />
                <text x={204 + 4} y={cellSize + 21} className="text-[9px]" fill="#9CA3AF">&lt;50%</text>
              </g>
            </svg>
          </div>
        </Card>
      )}

      {averageTrend.length > 1 && (
        <Card hover={false}>
          <h2 className="text-xs tracking-widest text-gray-400 uppercase mb-4">{t('avg_grade')}</h2>
          <svg width="100%" height={lineH + linePadY * 2} viewBox={`0 0 ${lineW} ${lineH + linePadY * 2}`} preserveAspectRatio="xMidYMid meet">
            {/* Y-axis labels */}
            {[0, 2.5, 5, 7.5, 10].map(v => {
              const y = linePadY + lineH - (v / 10) * lineH
              return (
                <g key={v}>
                  <line x1={linePadX} y1={y} x2={lineW - 10} y2={y} stroke="#E5E7EB" strokeWidth={0.5} />
                  <text x={linePadX - 8} y={y + 3} textAnchor="end" className="text-[9px]" fill="#9CA3AF">{v}</text>
                </g>
              )
            })}

            {/* Line */}
            <polyline
              fill="none"
              stroke="#534AB7"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              points={averageTrend.map((d, i) => {
                const x = linePadX + (i / (averageTrend.length - 1)) * (lineW - linePadX - 10)
                const y = linePadY + lineH - (d.avg / 10) * lineH
                return `${x},${y}`
              }).join(' ')}
            />

            {/* Area fill */}
            <polygon
              fill="#534AB7"
              opacity={0.08}
              points={[
                `${linePadX},${linePadY + lineH}`,
                ...averageTrend.map((d, i) => {
                  const x = linePadX + (i / (averageTrend.length - 1)) * (lineW - linePadX - 10)
                  const y = linePadY + lineH - (d.avg / 10) * lineH
                  return `${x},${y}`
                }),
                `${linePadX + ((averageTrend.length - 1) / (averageTrend.length - 1)) * (lineW - linePadX - 10)},${linePadY + lineH}`,
              ].join(' ')}
            />

            {/* Points and labels */}
            {averageTrend.map((d, i) => {
              const x = linePadX + (i / (averageTrend.length - 1)) * (lineW - linePadX - 10)
              const y = linePadY + lineH - (d.avg / 10) * lineH
              return (
                <g key={d.month}>
                  <circle cx={x} cy={y} r={4} fill="#534AB7" />
                  <circle cx={x} cy={y} r={2} fill="white" />
                  <text x={x} y={y - 10} textAnchor="middle" className="text-[10px]" fill="#534AB7" fontWeight="600">
                    {String(d.avg).replace('.', ',')}
                  </text>
                  <text x={x} y={linePadY + lineH + 14} textAnchor="middle" className="text-[9px]" fill="#9CA3AF">{d.label}</text>
                </g>
              )
            })}
          </svg>
        </Card>
      )}

      {gradeDistribution.length === 0 && attendanceHeatmap.length === 0 && (
        <Card hover={false}>
          <div className="text-center py-12 text-gray-400">
            <BarChart3 className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">{t('no_data')}</p>
          </div>
        </Card>
      )}
    </div>
  )
}
