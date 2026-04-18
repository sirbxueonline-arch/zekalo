import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { GradeBadge } from '../../components/ui/Badge'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import { BookOpen, Users, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { fmtNumeric } from '../../lib/dateUtils'

function getRowBorderColor(score) {
  if (score >= 8) return 'border-l-[#1D9E75]'
  if (score >= 6) return 'border-l-[#534AB7]'
  return 'border-l-red-400'
}

function TrendArrow({ current, prev }) {
  if (prev == null || current == null) return <Minus className="w-4 h-4 text-gray-300" />
  if (current > prev) return <TrendingUp className="w-4 h-4 text-[#1D9E75]" />
  if (current < prev) return <TrendingDown className="w-4 h-4 text-red-400" />
  return <Minus className="w-4 h-4 text-gray-400" />
}

export default function ParentGrades() {
  const { profile, t } = useAuth()
  const [loading, setLoading] = useState(true)
  const [children, setChildren] = useState([])
  const [selectedChild, setSelectedChild] = useState(null)
  const [grades, setGrades] = useState([])
  const [subjects, setSubjects] = useState([])
  const [selectedSubject, setSelectedSubject] = useState(null)

  useEffect(() => {
    if (!profile) return
    loadChildren()
  }, [profile])

  useEffect(() => {
    if (!selectedChild) return
    loadGrades(selectedChild.id)
  }, [selectedChild])

  async function loadChildren() {
    const { data } = await supabase
      .from('parent_children')
      .select('child:profiles!child_id(*, school:schools(*))')
      .eq('parent_id', profile.id)

    const kids = (data || []).map(d => d.child).filter(Boolean)
    setChildren(kids)
    if (kids.length > 0) setSelectedChild(kids[0])
    if (!kids.length) setLoading(false)
  }

  async function loadGrades(childId) {
    setLoading(true)
    const { data } = await supabase
      .from('grades')
      .select('*, subject:subjects(id, name)')
      .eq('student_id', childId)
      .order('date', { ascending: false })

    setGrades(data || [])
    const uniqueSubjects = []
    const seen = new Set()
    ;(data || []).forEach(g => {
      if (g.subject && !seen.has(g.subject.id)) {
        seen.add(g.subject.id)
        uniqueSubjects.push(g.subject)
      }
    })
    setSubjects(uniqueSubjects)
    setSelectedSubject(null)
    setLoading(false)
  }

  if (loading && !children.length) return <PageSpinner />

  if (children.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Uşaq tapılmadı"
        description="Hesabınıza bağlı uşaq profili yoxdur."
      />
    )
  }

  function calcAverage(subjectId) {
    const subGrades = grades.filter(
      g => (!subjectId || g.subject?.id === subjectId) && g.score != null
    )
    if (!subGrades.length) return null
    const avg =
      subGrades.reduce(
        (s, g) => s + (g.max_score > 0 ? (g.score / g.max_score) * 10 : g.score),
        0
      ) / subGrades.length
    return Math.round(avg * 10) / 10
  }

  function calcSubjectTrend(subjectId) {
    const subGrades = grades
      .filter(g => g.subject?.id === subjectId && g.score != null)
      .slice(0, 4)
    if (subGrades.length < 2) return { current: null, prev: null }
    const toNorm = g => (g.max_score > 0 ? (g.score / g.max_score) * 10 : g.score)
    const half = Math.floor(subGrades.length / 2)
    const recent = subGrades.slice(0, half).reduce((s, g) => s + toNorm(g), 0) / half
    const older = subGrades.slice(half).reduce((s, g) => s + toNorm(g), 0) / (subGrades.length - half)
    return { current: recent, prev: older }
  }

  const isIb = selectedChild?.edition === 'ib'

  const filtered = selectedSubject
    ? grades.filter(g => g.subject?.id === selectedSubject)
    : grades

  const overallAvg = calcAverage(null)

  const childInitials = selectedChild?.full_name
    ? selectedChild.full_name
        .split(' ')
        .map(w => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?'

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="font-serif text-4xl text-gray-900">Qiymətlər</h1>
      </div>

      {/* Child selector tabs */}
      {children.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {children.map(child => {
            const initials = child.full_name
              ? child.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
              : '?'
            const active = selectedChild?.id === child.id
            return (
              <button
                key={child.id}
                onClick={() => setSelectedChild(child)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-colors whitespace-nowrap ${
                  active
                    ? 'border-purple bg-purple-light text-purple'
                    : 'border-border-soft text-gray-500 hover:bg-surface'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                    active ? 'bg-purple text-white' : 'bg-border-soft text-gray-500'
                  }`}
                >
                  {initials}
                </span>
                {child.full_name}
              </button>
            )
          })}
        </div>
      )}

      {loading ? (
        <PageSpinner />
      ) : grades.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Qiymət yoxdur"
          description="Bu uşaq üçün hələ qiymət daxil edilməyib."
        />
      ) : (
        <>
          {/* Report card header */}
          <div className="bg-white rounded-2xl border border-border-soft shadow-sm px-6 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div className="flex items-center gap-4">
              {/* School logo placeholder */}
              <div className="w-10 h-10 rounded-xl bg-purple-light flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-purple" />
              </div>
              <div className="w-px h-10 bg-border-soft flex-shrink-0" />
              <div className="w-14 h-14 rounded-full bg-purple-light flex items-center justify-center text-purple font-bold text-xl flex-shrink-0 shadow-sm">
                {childInitials}
              </div>
              <div>
                <p className="font-serif font-semibold text-gray-900 text-xl leading-tight">
                  {selectedChild?.full_name}
                </p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {selectedChild?.class_name || selectedChild?.grade || '—'}
                  {selectedChild?.school?.name ? ` · ${selectedChild.school.name}` : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Ümumi ortalama</p>
                <p className="font-serif text-4xl text-gray-900 leading-none">
                  {overallAvg != null ? overallAvg.toString().replace('.', ',') : '—'}
                </p>
              </div>
              {overallAvg != null && (
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md ${
                    overallAvg >= 8
                      ? 'bg-[#1D9E75]'
                      : overallAvg >= 6
                      ? 'bg-purple'
                      : 'bg-red-400'
                  }`}
                >
                  {overallAvg.toString().replace('.', ',')}
                </div>
              )}
            </div>
          </div>

          {/* Subject summary cards */}
          {subjects.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map(s => {
                const avg = calcAverage(s.id)
                const count = grades.filter(g => g.subject?.id === s.id).length
                const { current, prev } = calcSubjectTrend(s.id)
                const barPct = avg != null ? Math.min((avg / 10) * 100, 100) : 0
                const barColor =
                  avg == null
                    ? 'bg-gray-200'
                    : avg >= 8
                    ? 'bg-[#1D9E75]'
                    : avg >= 6
                    ? 'bg-purple'
                    : 'bg-red-400'
                return (
                  <div
                    key={s.id}
                    className="bg-white rounded-2xl border border-border-soft shadow-sm px-5 py-4 flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-gray-800 leading-tight">{s.name}</p>
                      <TrendArrow current={current} prev={prev} />
                    </div>
                    <div className="flex items-center gap-3">
                      {avg != null ? (
                        <GradeBadge score={avg} />
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                      <span className="text-xs text-gray-400">{count} qiymət</span>
                    </div>
                    {/* Progress bar with percentage label */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${barColor}`}
                          style={{ width: `${barPct}%` }}
                        />
                      </div>
                      <span className={`text-xs font-semibold w-8 text-right flex-shrink-0 ${
                        avg == null ? 'text-gray-300' : avg >= 8 ? 'text-teal' : avg >= 6 ? 'text-purple' : 'text-red-400'
                      }`}>
                        {avg != null ? `${Math.round(barPct)}%` : '—'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Subject filter pills */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedSubject(null)}
              className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${
                !selectedSubject
                  ? 'border-purple bg-purple-light text-purple'
                  : 'border-border-soft text-gray-500 hover:bg-surface'
              }`}
            >
              Hamısı
            </button>
            {subjects.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedSubject(s.id)}
                className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${
                  selectedSubject === s.id
                    ? 'border-purple bg-purple-light text-purple'
                    : 'border-border-soft text-gray-500 hover:bg-surface'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>

          {/* Grade history table */}
          <div className="bg-white rounded-2xl border border-border-soft shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface border-b border-border-soft">
                    <th className="text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3 text-left">
                      Tarix
                    </th>
                    <th className="text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3 text-left">
                      Fənn
                    </th>
                    <th className="text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3 text-left">
                      Qiymətləndirmə
                    </th>
                    {isIb ? (
                      <>
                        <th className="text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3 text-center">A</th>
                        <th className="text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3 text-center">B</th>
                        <th className="text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3 text-center">C</th>
                        <th className="text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3 text-center">D</th>
                      </>
                    ) : (
                      <th className="text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3 text-center">
                        Bal
                      </th>
                    )}
                    <th className="text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3 text-left">
                      Qeyd
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((g, idx) => {
                    const normScore =
                      g.score == null ? null :
                      g.max_score > 0 ? Math.round((g.score / g.max_score) * 10) : g.score
                    const borderColor = getRowBorderColor(normScore)
                    const isEven = idx % 2 === 0
                    return (
                      <tr
                        key={g.id}
                        className={`border-b border-border-soft last:border-0 hover:bg-purple-light/20 transition-colors duration-100 border-l-4 ${borderColor} ${
                          isEven ? 'bg-white' : 'bg-surface/40'
                        }`}
                      >
                        <td className="px-6 py-3.5 text-sm text-gray-500 whitespace-nowrap">
                          {fmtNumeric(g.date)}
                        </td>
                        <td className="px-6 py-3.5 text-sm font-semibold text-gray-900">
                          {g.subject?.name}
                        </td>
                        <td className="px-6 py-3.5 text-sm text-gray-600">
                          {g.assessment_title || '—'}
                        </td>
                        {isIb ? (
                          <>
                            <td className="px-4 py-3.5 text-center">
                              {g.criterion_a != null && <GradeBadge score={g.criterion_a} />}
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              {g.criterion_b != null && <GradeBadge score={g.criterion_b} />}
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              {g.criterion_c != null && <GradeBadge score={g.criterion_c} />}
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              {g.criterion_d != null && <GradeBadge score={g.criterion_d} />}
                            </td>
                          </>
                        ) : (
                          <td className="px-6 py-3.5 text-center">
                            <GradeBadge score={normScore} />
                          </td>
                        )}
                        <td className="px-6 py-3.5 text-sm text-gray-400">
                          {g.notes || '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
