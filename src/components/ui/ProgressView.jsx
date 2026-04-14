import { useState, useEffect } from 'react'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, AreaChart, Area,
} from 'recharts'
import { TrendingUp, TrendingDown, Minus, Award, BookOpen, BarChart2, ClipboardCheck } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import Card from './Card'
import StatCard from './StatCard'
import { PageSpinner } from './Spinner'
import EmptyState from './EmptyState'

// 10 distinct colors for subject lines
const COLORS = [
  '#534AB7', '#14B8A6', '#F59E0B', '#EF4444',
  '#8B5CF6', '#10B981', '#F97316', '#3B82F6', '#EC4899', '#06B6D4',
]

const PERIODS = [
  { key: '1m', label: 'Bu ay', days: 30 },
  { key: '3m', label: '3 ay', days: 90 },
  { key: '6m', label: '6 ay', days: 180 },
  { key: 'all', label: 'Hamısı', days: null },
]

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}`
}

function formatDateFull(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`
}

function avg(arr) {
  if (!arr.length) return null
  return arr.reduce((s, v) => s + v, 0) / arr.length
}

function trend(current, previous) {
  if (previous == null || current == null) return null
  return Math.round((current - previous) * 10) / 10
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-border-soft rounded-lg shadow-lg px-4 py-3 text-sm min-w-[140px]">
      <p className="font-medium text-gray-700 mb-2">{label}</p>
      {payload.map(entry => (
        <div key={entry.name} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-600 truncate max-w-[100px]">{entry.name}</span>
          </span>
          <span className="font-semibold" style={{ color: entry.color }}>{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function ProgressView({ studentId, studentName }) {
  const [loading, setLoading] = useState(true)
  const [grades, setGrades] = useState([])
  const [examResults, setExamResults] = useState([])
  const [period, setPeriod] = useState('3m')
  const [hiddenSubjects, setHiddenSubjects] = useState(new Set())

  useEffect(() => {
    if (studentId) load()
  }, [studentId])

  async function load() {
    setLoading(true)
    try {
      const [gradesRes, examsRes] = await Promise.all([
        supabase
          .from('grades')
          .select('id, score, date, subject:subjects(id, name), max_score')
          .eq('student_id', studentId)
          .order('date'),
        supabase
          .from('exam_results')
          .select('id, score, exam:exams(title, max_score, exam_date, subject:subjects(id, name))')
          .eq('student_id', studentId)
          .not('score', 'is', null),
      ])
      setGrades(gradesRes.data || [])
      setExamResults(examsRes.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // Merge grades + exam results into a unified list
  const allEntries = [
    ...grades.map(g => ({
      id: g.id,
      date: g.date,
      score: g.score,
      maxScore: g.max_score || 10,
      subjectId: g.subject?.id,
      subjectName: g.subject?.name || 'Digər',
      source: 'grade',
    })),
    ...(examResults || []).map(er => ({
      id: er.id,
      date: er.exam?.exam_date,
      score: er.score,
      maxScore: er.exam?.max_score || 100,
      subjectId: er.exam?.subject?.id,
      subjectName: er.exam?.subject?.name || 'Digər',
      source: 'exam',
    })),
  ]
    .filter(e => e.date && e.score != null)
    .map(e => ({
      ...e,
      // Normalize to 0–10 scale
      normalized: Math.round((e.score / (e.maxScore || 10)) * 10 * 10) / 10,
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  // Period filter
  const cutoff = PERIODS.find(p => p.key === period)
  const filtered = cutoff?.days
    ? allEntries.filter(e => {
        const d = new Date(e.date)
        const limit = new Date()
        limit.setDate(limit.getDate() - cutoff.days)
        return d >= limit
      })
    : allEntries

  // Unique subjects
  const subjectMap = {}
  filtered.forEach(e => { subjectMap[e.subjectId || e.subjectName] = e.subjectName })
  const subjects = Object.entries(subjectMap).map(([id, name]) => ({ id, name }))

  // Build chart data: one point per date, columns per subject
  const dateSet = [...new Set(filtered.map(e => e.date))].sort()
  const chartData = dateSet.map(date => {
    const point = { date: formatDate(date), fullDate: formatDateFull(date) }
    subjects.forEach(sub => {
      const entry = filtered.find(e => e.date === date && (e.subjectId || e.subjectName) === sub.id)
      if (entry) point[sub.name] = entry.normalized
    })
    return point
  })

  // Stats
  const allScores = filtered.map(e => e.normalized)
  const overallAvg = allScores.length ? Math.round(avg(allScores) * 10) / 10 : null

  // Per-subject averages
  const subjectStats = subjects.map((sub, i) => {
    const entries = filtered.filter(e => (e.subjectId || e.subjectName) === sub.id)
    const scores = entries.map(e => e.normalized)
    const subAvg = scores.length ? Math.round(avg(scores) * 10) / 10 : null

    // Trend: first half vs second half
    const mid = Math.floor(scores.length / 2)
    const firstHalfAvg = mid > 0 ? avg(scores.slice(0, mid)) : null
    const secondHalfAvg = mid > 0 ? avg(scores.slice(mid)) : null
    const trendVal = trend(secondHalfAvg, firstHalfAvg)

    return {
      ...sub,
      avg: subAvg,
      highest: scores.length ? Math.max(...scores) : null,
      lowest: scores.length ? Math.min(...scores) : null,
      trend: trendVal,
      count: entries.length,
      color: COLORS[i % COLORS.length],
      // Sparkline data (last 8 points)
      sparkData: entries.slice(-8).map(e => ({ v: e.normalized })),
    }
  }).sort((a, b) => (b.avg ?? 0) - (a.avg ?? 0))

  const bestSubject = subjectStats[0]

  function toggleSubject(name) {
    setHiddenSubjects(prev => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  if (loading) return <PageSpinner />

  if (allEntries.length === 0) {
    return (
      <EmptyState
        icon={BarChart2}
        title="Hələ məlumat yoxdur"
        description="Qiymətlər daxil edildikcə qrafiklər burada görünəcək"
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Period filter */}
      <div className="flex items-center gap-2 bg-surface border border-border-soft rounded-lg p-1 w-fit">
        {PERIODS.map(p => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              period === p.key
                ? 'bg-white text-purple shadow-sm border border-border-soft'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Ümumi orta"
          value={overallAvg != null ? overallAvg : '—'}
          icon={BarChart2}
        />
        <StatCard
          label="Ən yaxşı fənn"
          value={bestSubject?.name || '—'}
          icon={Award}
        />
        <StatCard
          label="Ən yüksək qiymət"
          value={allScores.length ? Math.max(...allScores) : '—'}
          icon={TrendingUp}
        />
        <StatCard
          label="Qiymətləndirmə sayı"
          value={filtered.length}
          icon={ClipboardCheck}
        />
      </div>

      {/* Main combined chart */}
      {filtered.length > 0 && (
        <Card hover={false} className="p-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h2 className="font-serif text-xl text-gray-900">Qiymət dinamikası</h2>
              <p className="text-sm text-gray-500 mt-0.5">Fənlər üzrə dinamika (10-luq sistem)</p>
            </div>
            {/* Subject toggles */}
            <div className="flex flex-wrap gap-2">
              {subjectStats.map(sub => (
                <button
                  key={sub.id}
                  onClick={() => toggleSubject(sub.name)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                    hiddenSubjects.has(sub.name)
                      ? 'border-border-soft text-gray-400 bg-white'
                      : 'border-transparent text-white'
                  }`}
                  style={hiddenSubjects.has(sub.name) ? {} : { backgroundColor: sub.color }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {sub.name}
                </button>
              ))}
            </div>
          </div>

          {chartData.length < 2 ? (
            <p className="text-sm text-gray-400 text-center py-8">Qrafik üçün ən azı 2 qiymət lazımdır</p>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F0FB" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: '#9CA3AF' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 10]}
                  ticks={[0, 2, 4, 6, 8, 10]}
                  tick={{ fontSize: 12, fill: '#9CA3AF' }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <Tooltip content={<CustomTooltip />} />
                {subjectStats.map(sub => (
                  <Line
                    key={sub.id}
                    type="monotone"
                    dataKey={sub.name}
                    stroke={sub.color}
                    strokeWidth={hiddenSubjects.has(sub.name) ? 0 : 2.5}
                    dot={{ r: 4, fill: sub.color, strokeWidth: 0 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    connectNulls
                    hide={hiddenSubjects.has(sub.name)}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>
      )}

      {/* Per-subject cards */}
      <div>
        <h2 className="font-serif text-xl text-gray-900 mb-4">Fənlər üzrə təhlil</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {subjectStats.map(sub => (
            <SubjectCard key={sub.id} sub={sub} />
          ))}
        </div>
      </div>
    </div>
  )
}

function SubjectCard({ sub }) {
  const trendDir = sub.trend == null ? null : sub.trend > 0.5 ? 'up' : sub.trend < -0.5 ? 'down' : 'flat'

  return (
    <Card hover={false} className="p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: sub.color }}
          />
          <h3 className="font-medium text-gray-900 truncate">{sub.name}</h3>
        </div>
        <TrendBadge dir={trendDir} val={sub.trend} />
      </div>

      {/* Big average */}
      <div className="mb-3">
        <span
          className="text-4xl font-bold"
          style={{ color: sub.color }}
        >
          {sub.avg ?? '—'}
        </span>
        <span className="text-sm text-gray-400 ml-1">/ 10</span>
      </div>

      {/* Mini sparkline */}
      {sub.sparkData.length >= 2 && (
        <div className="mb-3 -mx-1">
          <ResponsiveContainer width="100%" height={48}>
            <AreaChart data={sub.sparkData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
              <defs>
                <linearGradient id={`grad-${sub.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={sub.color} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={sub.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={sub.color}
                strokeWidth={2}
                fill={`url(#grad-${sub.id})`}
                dot={false}
                connectNulls
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* High / low / count */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="bg-surface rounded-lg py-1.5">
          <div className="text-gray-400 mb-0.5">Ən yüksək</div>
          <div className="font-semibold text-gray-700">{sub.highest ?? '—'}</div>
        </div>
        <div className="bg-surface rounded-lg py-1.5">
          <div className="text-gray-400 mb-0.5">Ən aşağı</div>
          <div className="font-semibold text-gray-700">{sub.lowest ?? '—'}</div>
        </div>
        <div className="bg-surface rounded-lg py-1.5">
          <div className="text-gray-400 mb-0.5">Qiymət</div>
          <div className="font-semibold text-gray-700">{sub.count}</div>
        </div>
      </div>
    </Card>
  )
}

function TrendBadge({ dir, val }) {
  if (dir == null) return null
  if (dir === 'up') return (
    <span className="flex items-center gap-0.5 text-xs font-medium text-teal bg-teal-light px-2 py-0.5 rounded-full">
      <TrendingUp className="w-3 h-3" /> +{val}
    </span>
  )
  if (dir === 'down') return (
    <span className="flex items-center gap-0.5 text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
      <TrendingDown className="w-3 h-3" /> {val}
    </span>
  )
  return (
    <span className="flex items-center gap-0.5 text-xs font-medium text-gray-500 bg-surface px-2 py-0.5 rounded-full">
      <Minus className="w-3 h-3" /> Sabit
    </span>
  )
}
