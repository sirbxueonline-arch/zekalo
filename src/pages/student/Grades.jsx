import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Card from '../../components/ui/Card'
import { GradeBadge } from '../../components/ui/Badge'
import StatCard from '../../components/ui/StatCard'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import { BookOpen } from 'lucide-react'

export default function StudentGrades() {
  const { profile, t } = useAuth()
  const [loading, setLoading] = useState(true)
  const [grades, setGrades] = useState([])
  const [subjects, setSubjects] = useState([])
  const [selectedSubject, setSelectedSubject] = useState(null)

  useEffect(() => {
    if (!profile) return
    supabase
      .from('grades')
      .select('*, subject:subjects(id, name)')
      .eq('student_id', profile.id)
      .order('date', { ascending: false })
      .then(({ data }) => {
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
        setLoading(false)
      })
  }, [profile])

  if (loading) return <PageSpinner />
  if (grades.length === 0) return <EmptyState icon={BookOpen} title={t('no_grades')} description={t('grades_will_appear')} />

  const filtered = selectedSubject
    ? grades.filter(g => g.subject?.id === selectedSubject)
    : grades

  const isIb = profile?.edition === 'ib'

  function calcAverage(subjectId) {
    const subGrades = grades.filter(g => (!subjectId || g.subject?.id === subjectId) && g.score != null)
    if (!subGrades.length) return 0
    const avg = subGrades.reduce((s, g) => s + (g.max_score > 0 ? (g.score / g.max_score) * 10 : g.score), 0) / subGrades.length
    return Math.round(avg * 10) / 10
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label={t('overall_avg')} value={calcAverage(null).toString().replace('.', ',')} />
        {subjects.slice(0, 3).map(s => (
          <StatCard key={s.id} label={s.name} value={calcAverage(s.id).toString().replace('.', ',')} />
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedSubject(null)}
          className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${
            !selectedSubject ? 'border-purple bg-purple-light text-purple' : 'border-border-soft text-gray-500 hover:bg-surface'
          }`}
        >
          {t('all')}
        </button>
        {subjects.map(s => (
          <button
            key={s.id}
            onClick={() => setSelectedSubject(s.id)}
            className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${
              selectedSubject === s.id ? 'border-purple bg-purple-light text-purple' : 'border-border-soft text-gray-500 hover:bg-surface'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      <Card hover={false}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface">
                <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-left">{t('date')}</th>
                <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-left">{t('subject')}</th>
                <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-left">{t('assessment')}</th>
                {isIb ? (
                  <>
                    <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-center">A</th>
                    <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-center">B</th>
                    <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-center">C</th>
                    <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-center">D</th>
                  </>
                ) : (
                  <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-center">{t('score')}</th>
                )}
                <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-left">{t('note')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(g => (
                <tr key={g.id} className="border-b border-border-soft hover:bg-surface transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(g.date).toLocaleDateString('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{g.subject?.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{g.assessment_title}</td>
                  {isIb ? (
                    <>
                      <td className="px-6 py-4 text-center">{g.criterion_a != null && <GradeBadge score={g.criterion_a} />}</td>
                      <td className="px-6 py-4 text-center">{g.criterion_b != null && <GradeBadge score={g.criterion_b} />}</td>
                      <td className="px-6 py-4 text-center">{g.criterion_c != null && <GradeBadge score={g.criterion_c} />}</td>
                      <td className="px-6 py-4 text-center">{g.criterion_d != null && <GradeBadge score={g.criterion_d} />}</td>
                    </>
                  ) : (
                    <td className="px-6 py-4 text-center">
                      <GradeBadge score={g.max_score > 0 ? Math.round((g.score / g.max_score) * 10) : g.score} />
                    </td>
                  )}
                  <td className="px-6 py-4 text-sm text-gray-500">{g.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
