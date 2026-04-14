import { useState, useEffect } from 'react'
import { ClipboardList, Calendar, Clock, Award } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('az-AZ', { day: '2-digit', month: 'long', year: 'numeric' })
}

function getScoreVariant(pct) {
  if (pct >= 90) return 'excellent'
  if (pct >= 70) return 'good'
  if (pct >= 50) return 'late'
  return 'absent'
}

function getScoreLabel(pct) {
  if (pct >= 90) return 'Əla'
  if (pct >= 70) return 'Yaxşı'
  if (pct >= 50) return 'Kafi'
  return 'Zəif'
}

export default function StudentExams() {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [upcoming, setUpcoming] = useState([])
  const [results, setResults] = useState([])

  useEffect(() => {
    if (!profile) return
    loadExams()
  }, [profile])

  async function loadExams() {
    try {
      setLoading(true)
      const today = new Date().toISOString().split('T')[0]

      // Get student's class memberships
      const { data: membersData } = await supabase
        .from('class_members')
        .select('class_id')
        .eq('student_id', profile.id)

      const classIds = (membersData || []).map(m => m.class_id)

      if (!classIds.length) {
        setLoading(false)
        return
      }

      // Fetch upcoming published exams
      const { data: upcomingData } = await supabase
        .from('exams')
        .select('*, class:classes(id, name), subject:subjects(id, name)')
        .in('class_id', classIds)
        .eq('published', true)
        .gte('exam_date', today)
        .order('exam_date', { ascending: true })

      // Fetch past exam results for this student
      const { data: resultsData } = await supabase
        .from('exam_results')
        .select('*, exam:exams(*, class:classes(id, name), subject:subjects(id, name))')
        .eq('student_id', profile.id)
        .order('created_at', { ascending: false })

      setUpcoming(upcomingData || [])
      setResults((resultsData || []).filter(r => r.exam))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <PageSpinner />

  return (
    <div className="space-y-8">
      {/* Upcoming exams */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-5 h-5 text-purple" />
          <h2 className="font-serif text-2xl text-gray-900">Gələcək imtahanlar</h2>
        </div>

        {upcoming.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="Gələcək imtahan yoxdur"
            description="Yaxın zamanda planlanmış imtahan tapılmadı."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {upcoming.map(exam => {
              const examDate = new Date(exam.exam_date)
              const today = new Date()
              today.setHours(0, 0, 0, 0)
              const daysLeft = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24))
              return (
                <Card key={exam.id} className="flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-serif text-lg text-gray-900">{exam.title}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{exam.subject?.name}</p>
                    </div>
                    <Badge variant={daysLeft <= 3 ? 'absent' : daysLeft <= 7 ? 'late' : 'present'}>
                      {daysLeft === 0 ? 'Bu gün' : daysLeft === 1 ? 'Sabah' : `${daysLeft} gün`}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-mid" />
                      <span>{formatDate(exam.exam_date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-mid" />
                      <span>{exam.duration_minutes} dəqiqə</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-purple-mid" />
                      <span>Maksimum bal: {exam.max_score}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border-soft">
                    <span className="text-xs text-gray-400">{exam.class?.name}</span>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      {/* Past results */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <ClipboardList className="w-5 h-5 text-purple" />
          <h2 className="font-serif text-2xl text-gray-900">Nəticələr</h2>
        </div>

        {results.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Nəticə yoxdur"
            description="Hələ heç bir imtahan nəticəniz yoxdur."
          />
        ) : (
          <Card hover={false}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface">
                    <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-left">İmtahan</th>
                    <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-left">Fənn</th>
                    <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-left">Tarix</th>
                    <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-center">Bal</th>
                    <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-center">Faiz</th>
                    <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-center">Qiymət</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-soft">
                  {results.map(r => {
                    const pct = r.exam.max_score > 0
                      ? Math.round((r.score / r.exam.max_score) * 100)
                      : 0
                    return (
                      <tr key={r.id} className="hover:bg-surface transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{r.exam.title}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{r.exam.subject?.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{formatDate(r.exam.exam_date)}</td>
                        <td className="px-6 py-4 text-center text-sm font-semibold text-gray-800">
                          {r.score} / {r.exam.max_score}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge variant={getScoreVariant(pct)}>
                            {pct}%
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge variant={getScoreVariant(pct)}>
                            {getScoreLabel(pct)}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </section>
    </div>
  )
}
