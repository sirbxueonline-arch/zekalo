import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Minus, BookOpen, Award, BarChart2 } from 'lucide-react'
import { GradeBadge } from '../../components/ui/Badge'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { fmtNumeric } from '../../lib/dateUtils'

// ─── Subject accent color ────────────────────────────────────────────────────
const SUBJ_COLORS = [
  'border-purple',
  'border-teal',
  'border-amber-400',
  'border-blue-400',
  'border-pink-400',
  'border-orange-400',
]
function subjBorderColor(name = '') {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return SUBJ_COLORS[Math.abs(h) % SUBJ_COLORS.length]
}

// Same palette but as bg for the thin top bar (border-* → bg-*)
const SUBJ_BG = [
  'bg-purple',
  'bg-teal',
  'bg-amber-400',
  'bg-blue-400',
  'bg-pink-400',
  'bg-orange-400',
]
function subjBgColor(name = '') {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return SUBJ_BG[Math.abs(h) % SUBJ_BG.length]
}

// ─── GPA progress bar color ──────────────────────────────────────────────────
function gpaBarColor(avg) {
  if (avg >= 8.5) return 'bg-teal'
  if (avg >= 7)   return 'bg-blue-400'
  if (avg >= 5)   return 'bg-amber-400'
  return 'bg-red-500'
}

function gpaTextColor(avg) {
  if (avg >= 8.5) return 'text-teal-700'
  if (avg >= 7)   return 'text-blue-600'
  if (avg >= 5)   return 'text-amber-600'
  return 'text-red-600'
}

// ─── Row left-border color ───────────────────────────────────────────────────
function rowBorderColor(norm) {
  if (norm >= 8.5) return 'border-l-teal-500'
  if (norm >= 7)   return 'border-l-blue-400'
  if (norm >= 5)   return 'border-l-amber-400'
  return 'border-l-red-400'
}

// ─── Normalize score to /10 ──────────────────────────────────────────────────
function normalize(score, maxScore) {
  if (score == null) return null
  if (maxScore > 0) return (score / maxScore) * 10
  return score
}

// ─── Compute per-subject averages and trends ─────────────────────────────────
function computeSubjectStats(grades) {
  const map = {}
  grades.forEach(g => {
    if (!g.subject) return
    const id = g.subject.id
    if (!map[id]) map[id] = { subject: g.subject, normed: [] }
    if (g.score != null) {
      const n = normalize(g.score, g.max_score)
      if (n != null) map[id].normed.push(n)
    }
  })

  return Object.values(map).map(({ subject, normed }) => {
    const avg =
      normed.length > 0
        ? Math.round((normed.reduce((a, b) => a + b, 0) / normed.length) * 10) / 10
        : 0
    // normed is already in date-desc order (matching query order)
    // last grade is normed[0], second-to-last is normed[1]
    let trend = 'flat'
    if (normed.length >= 2) {
      if (normed[0] > normed[1]) trend = 'up'
      else if (normed[0] < normed[1]) trend = 'down'
    }
    return { subject, avg, count: normed.length, trend }
  })
}

// ─── Trend icon component ────────────────────────────────────────────────────
function TrendIcon({ trend }) {
  if (trend === 'up')
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-teal-600">
        <TrendingUp className="w-3.5 h-3.5" /> Yüksəlir
      </span>
    )
  if (trend === 'down')
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-red-500">
        <TrendingDown className="w-3.5 h-3.5" /> Enir
      </span>
    )
  return (
    <span className="inline-flex items-center gap-0.5 text-xs font-medium text-gray-400">
      <Minus className="w-3.5 h-3.5" /> Sabit
    </span>
  )
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function StudentGrades() {
  const { profile } = useAuth()
  const [loading, setLoading]               = useState(true)
  const [grades, setGrades]                 = useState([])
  const [error, setError]                   = useState(null)
  const [selectedSubject, setSelectedSubject] = useState(null)

  useEffect(() => {
    if (!profile) return
    supabase
      .from('grades')
      .select('*, subject:subjects(id, name)')
      .eq('student_id', profile.id)
      .order('date', { ascending: false })
      .limit(500)
      .then(({ data, error: err }) => {
        if (err) {
          console.error('Grades fetch error:', err)
          setError('Qiymətlər yüklənmədi. Səhifəni yeniləyin.')
        }
        setGrades(data || [])
        setLoading(false)
      })
  }, [profile])

  if (loading) return <PageSpinner />

  if (error) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Xəta baş verdi"
        description={error}
      />
    )
  }

  if (grades.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Hələ qiymət yoxdur"
        description="Hələ qiymət yoxdur. Müəlliminiz ilk qiyməti daxil etdikdə burada görünəcək."
      />
    )
  }

  // ── Derived data ────────────────────────────────────────────────────────────
  const subjectStats = computeSubjectStats(grades)

  const allNormed = grades
    .filter(g => g.score != null)
    .map(g => normalize(g.score, g.max_score))
    .filter(n => n != null)
  const overallAvg =
    allNormed.length > 0
      ? Math.round((allNormed.reduce((a, b) => a + b, 0) / allNormed.length) * 10) / 10
      : 0

  const filtered = selectedSubject
    ? grades.filter(g => g.subject?.id === selectedSubject)
    : grades

  // Unique subjects for the filter pills
  const uniqueSubjects = []
  const seen = new Set()
  grades.forEach(g => {
    if (g.subject && !seen.has(g.subject.id)) {
      seen.add(g.subject.id)
      uniqueSubjects.push(g.subject)
    }
  })

  return (
    <div className="space-y-8">
      {/* ── Page heading ── */}
      <h1 className="font-serif text-4xl text-gray-900 tracking-tight">Qiymətlərim</h1>

      {/* ── GPA Hero Card ── */}
      <div className="bg-white border border-border-soft rounded-2xl p-8 flex flex-col items-center gap-4 shadow-sm">
        <div className="flex items-end gap-3">
          <span className={`font-serif text-7xl font-bold leading-none ${gpaTextColor(overallAvg)}`}>
            {overallAvg.toString().replace('.', ',')}
          </span>
          <span className="text-gray-400 text-xl mb-2 font-medium">/ 10</span>
        </div>

        {/* Full-width colored progress bar */}
        <div className="w-full max-w-md bg-gray-100 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-700 ${gpaBarColor(overallAvg)}`}
            style={{ width: `${Math.min((overallAvg / 10) * 100, 100)}%` }}
          />
        </div>

        <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
          <Award className="w-4 h-4" />
          Ümumi Ortalama
        </div>
      </div>

      {/* ── Subject cards grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjectStats.map(({ subject, avg, count, trend }) => {
          const isActive = selectedSubject === subject.id
          const accentBg = subjBgColor(subject.name)
          return (
            <button
              key={subject.id}
              onClick={() =>
                setSelectedSubject(isActive ? null : subject.id)
              }
              className={`text-left bg-white border rounded-xl overflow-hidden transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300 ${
                isActive
                  ? 'border-purple ring-2 ring-purple-200 -translate-y-0.5'
                  : 'border-border-soft hover:border-purple-mid hover:-translate-y-0.5'
              }`}
            >
              {/* 3px colored top accent bar */}
              <div className={`h-[3px] w-full ${accentBg}`} />

              <div className="p-5 space-y-3">
                {/* Subject name */}
                <p className="font-semibold text-gray-900 text-sm leading-tight">
                  {subject.name}
                </p>

                {/* Average badge */}
                <div className="flex items-center justify-between">
                  <GradeBadge score={Math.round(avg * 10) / 10} />
                  <TrendIcon trend={trend} />
                </div>

                {/* Mini progress bar */}
                <div className="bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full ${gpaBarColor(avg)}`}
                    style={{ width: `${Math.min((avg / 10) * 100, 100)}%` }}
                  />
                </div>

                {/* Count */}
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <BarChart2 className="w-3 h-3" />
                  {count} qiymətləndirmə
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {/* ── Subject filter pills ── */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        <button
          onClick={() => setSelectedSubject(null)}
          className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap flex-shrink-0 ${
            !selectedSubject
              ? 'border-purple bg-purple-light text-purple'
              : 'border-border-soft text-gray-500 hover:bg-surface'
          }`}
        >
          Hamısı
        </button>
        {uniqueSubjects.map(s => (
          <button
            key={s.id}
            onClick={() =>
              setSelectedSubject(selectedSubject === s.id ? null : s.id)
            }
            className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap flex-shrink-0 ${
              selectedSubject === s.id
                ? 'border-purple bg-purple-light text-purple'
                : 'border-border-soft text-gray-500 hover:bg-surface'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* ── Grade history table ── */}
      <div className="bg-white border border-border-soft rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-border-soft flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-gray-400" />
          <span className="font-semibold text-gray-700 text-sm">
            Qiymət Tarixi
            {selectedSubject && (
              <span className="ml-2 font-normal text-gray-400">
                — {uniqueSubjects.find(s => s.id === selectedSubject)?.name}
              </span>
            )}
          </span>
          <span className="ml-auto text-xs text-gray-400">{filtered.length} qeyd</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface">
                <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-left">
                  Tarix
                </th>
                <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-left">
                  Fənn
                </th>
                <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-left">
                  Qiymətləndirmə
                </th>
                <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-center">
                  Bal
                </th>
                <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-left">
                  Qeyd
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(g => {
                const _n = g.score != null ? normalize(g.score, g.max_score) : null
                const norm = _n != null ? Math.round(_n * 10) / 10 : null
                const borderClass =
                  norm != null ? rowBorderColor(norm) : 'border-l-gray-200'
                return (
                  <tr
                    key={g.id}
                    className={`border-b border-border-soft border-l-4 ${borderClass} hover:bg-surface transition-colors`}
                  >
                    {/* Tarix */}
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {fmtNumeric(g.date)}
                    </td>

                    {/* Fənn */}
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {g.subject?.name}
                    </td>

                    {/* Qiymətləndirmə */}
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {g.assessment_title || '—'}
                    </td>

                    {/* Bal */}
                    <td className="px-6 py-4 text-center">
                      {norm != null ? (
                        <div className="flex flex-col items-center gap-1.5">
                          <GradeBadge score={norm} />
                          {/* Inline mini score bar */}
                          <div className="w-16 bg-gray-100 rounded-full h-1 overflow-hidden">
                            <div
                              className={`h-1 rounded-full ${gpaBarColor(norm)}`}
                              style={{ width: `${Math.min((norm / 10) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>

                    {/* Qeyd */}
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {g.notes || '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-12 flex flex-col items-center gap-2 text-gray-400">
            <BookOpen className="w-8 h-8" />
            <p className="text-sm">Bu fənn üçün qiymət tapılmadı.</p>
          </div>
        )}
      </div>
    </div>
  )
}
