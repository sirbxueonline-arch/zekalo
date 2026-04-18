import { useState, useEffect } from 'react'
import { AlertTriangle, BarChart3, TrendingUp, Users } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Card from '../../components/ui/Card'
import Table from '../../components/ui/Table'
import { PageSpinner } from '../../components/ui/Spinner'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import { GradeBadge } from '../../components/ui/Badge'
import Button from '../../components/ui/Button'

function BarChart({ data, labelKey, valueKey, maxValue, color = '#534AB7', height = 200 }) {
  if (!data || data.length === 0) return <p className="text-sm text-gray-400 text-center py-8">—</p>
  const max = maxValue || Math.max(...data.map(d => d[valueKey] || 0), 1)
  const barWidth = Math.max(20, Math.min(60, 600 / data.length))
  const svgWidth = data.length * (barWidth + 8) + 40

  return (
    <svg viewBox={`0 0 ${svgWidth} ${height + 40}`} className="w-full" style={{ maxHeight: height + 40 }}>
      {data.map((d, i) => {
        const barHeight = ((d[valueKey] || 0) / max) * height
        const x = i * (barWidth + 8) + 30
        const y = height - barHeight + 10
        return (
          <g key={i}>
            <rect x={x} y={y} width={barWidth} height={barHeight} rx={4} fill={color} opacity={0.85} />
            <text x={x + barWidth / 2} y={height + 28} textAnchor="middle" className="text-[10px] fill-gray-500">
              {d[labelKey]?.length > 8 ? d[labelKey].slice(0, 8) + '...' : d[labelKey]}
            </text>
            <text x={x + barWidth / 2} y={y - 4} textAnchor="middle" className="text-[10px] fill-gray-600 font-medium">
              {d[valueKey]}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function LineChart({ data, labelKey, valueKey, color = '#0D9488', height = 200 }) {
  if (!data || data.length < 2) return <p className="text-sm text-gray-400 text-center py-8">—</p>
  const max = Math.max(...data.map(d => d[valueKey] || 0), 1)
  const padding = 40
  const width = 600
  const plotWidth = width - padding * 2
  const plotHeight = height - padding

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * plotWidth
    const y = padding + plotHeight - ((d[valueKey] || 0) / max) * plotHeight
    return { x, y, label: d[labelKey], value: d[valueKey] }
  })

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  return (
    <svg viewBox={`0 0 ${width} ${height + 20}`} className="w-full" style={{ maxHeight: height + 20 }}>
      <path d={pathD} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={4} fill={color} />
          <text x={p.x} y={height + 10} textAnchor="middle" className="text-[10px] fill-gray-500">
            {p.label}
          </text>
          <text x={p.x} y={p.y - 10} textAnchor="middle" className="text-[10px] fill-gray-600 font-medium">
            {p.value}%
          </text>
        </g>
      ))}
    </svg>
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

      // Get school class IDs — grades/attendance use class_id (school_id not always stored)
      const { data: schoolClasses } = await supabase
        .from('classes').select('id').eq('school_id', profile.school_id)
      const classIds = (schoolClasses || []).map(c => c.id)

      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

      // get_at_risk_students is an optional RPC — fall back gracefully if it doesn't exist
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

      // Grade distribution by class
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

      // Attendance trend by week
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

      // Teacher workload
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
          <span className="font-medium text-gray-900">{val}</span>
        </div>
      ),
    },
    { key: 'class_name', label: t('class_name') },
    { key: 'attendance_pct', label: t('present'), render: (val) => val != null ? `${val}%` : '—' },
    { key: 'avg_grade', label: t('score'), render: (val) => val != null ? <GradeBadge score={val} /> : '—' },
    { key: 'risk_reason', label: t('note'), render: (val) => val || '—' },
  ]

  if (loading) return <PageSpinner />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl text-gray-900">{t('analytics')}</h1>
        <Button variant="ghost" onClick={fetchData}>{t('filter')}</Button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Card hover={false}>
        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <h2 className="font-serif text-xl text-gray-900">{t('at_risk')}</h2>
          <Badge variant="absent">{atRisk.length}</Badge>
        </div>
        <Table columns={atRiskColumns} data={atRisk} emptyMessage={t('no_data')} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card hover={false}>
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-5 h-5 text-purple-mid" />
            <h2 className="font-serif text-xl text-gray-900">{t('score')}</h2>
          </div>
          <BarChart data={gradeDistribution} labelKey="name" valueKey="avg" maxValue={10} />
        </Card>

        <Card hover={false}>
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-5 h-5 text-teal" />
            <h2 className="font-serif text-xl text-gray-900">{t('today_attendance')}</h2>
          </div>
          <LineChart data={attendanceTrend} labelKey="label" valueKey="pct" />
        </Card>
      </div>

      <Card hover={false}>
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-5 h-5 text-purple-mid" />
          <h2 className="font-serif text-xl text-gray-900">{t('teachers')}</h2>
        </div>
        <BarChart data={teacherWorkload} labelKey="name" valueKey="count" color="#0D9488" />
      </Card>
    </div>
  )
}
