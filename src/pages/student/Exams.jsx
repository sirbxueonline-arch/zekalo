import { useState, useEffect } from 'react'
import { ClipboardList, Calendar, Clock, Award } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import { fmtLong } from '../../lib/dateUtils'

function formatDate(d) {
  if (!d) return ''
  return fmtLong(d)
}

function getScoreVariant(pct) {
  if (pct >= 90) return 'excellent'
  if (pct >= 70) return 'good'
  if (pct >= 50) return 'late'
  return 'poor'
}

function getScoreLabel(pct) {
  if (pct >= 90) return 'Əla'
  if (pct >= 70) return 'Yaxşı'
  if (pct >= 50) return 'Kafi'
  return 'Zəif'
}

function SectionTitle({ icon: Icon, children, tone = 'periwinkle' }) {
  const palette = {
    periwinkle: { bg: 'rgba(124,110,224,0.14)', color: '#7c6ee0' },
    mint:       { bg: 'rgba(93,184,163,0.14)',  color: '#5db8a3' },
  }
  const p = palette[tone] || palette.periwinkle
  return (
    <div className="flex items-center gap-3 mb-4">
      <span
        className="flex items-center justify-center"
        style={{ width: 36, height: 36, borderRadius: 12, background: p.bg }}
      >
        <Icon className="w-4 h-4" style={{ color: p.color }} />
      </span>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e', letterSpacing: '-0.01em' }}>
        {children}
      </h2>
    </div>
  )
}

export default function StudentExams() {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [upcoming, setUpcoming] = useState([])
  const [results, setResults] = useState([])
  const [fetchError, setFetchError] = useState(null)

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
      const { data: upcomingData, error: upcomingErr } = await supabase
        .from('exams')
        .select('*, class:classes(id, name), subject:subjects(id, name)')
        .in('class_id', classIds)
        .eq('published', true)
        .gte('exam_date', today)
        .order('exam_date', { ascending: true })
        .limit(50)

      // Fetch past exam results for this student
      const { data: resultsData, error: resultsErr } = await supabase
        .from('exam_results')
        .select('*, exam:exams(*, class:classes(id, name), subject:subjects(id, name))')
        .eq('student_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(100)

      if (upcomingErr || resultsErr) {
        console.error('Exams fetch error:', upcomingErr || resultsErr)
        setFetchError('İmtahan məlumatları yüklənmədi. Səhifəni yeniləyin.')
      }

      setUpcoming(upcomingData || [])
      setResults((resultsData || []).filter(r => r.exam))
    } catch (err) {
      console.error(err)
      setFetchError('İmtahan məlumatları yüklənmədi. Səhifəni yeniləyin.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <PageSpinner />

  if (fetchError) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="Xəta baş verdi"
        description={fetchError}
      />
    )
  }

  return (
    <div className="space-y-8">
      <h1 style={{ fontSize: 36, fontWeight: 800, color: '#1a1a2e', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
        <span className="pastel-text">İmtahanlar</span>
      </h1>

      {/* Upcoming exams */}
      <section>
        <SectionTitle icon={Calendar} tone="periwinkle">
          Gələcək imtahanlar
        </SectionTitle>

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
              const urgency =
                daysLeft <= 3 ? 'poor' :
                daysLeft <= 7 ? 'late' :
                                'present'
              return (
                <Card key={exam.id} className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e', lineHeight: 1.25 }}>
                        {exam.title}
                      </h3>
                      <p className="text-sm mt-0.5" style={{ color: '#64748b' }}>
                        {exam.subject?.name}
                      </p>
                    </div>
                    <Badge variant={urgency}>
                      {daysLeft === 0 ? 'Bu gün' : daysLeft === 1 ? 'Sabah' : `${daysLeft} gün`}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm" style={{ color: '#475569' }}>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" style={{ color: '#7c6ee0' }} />
                      <span>{formatDate(exam.exam_date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" style={{ color: '#5db8a3' }} />
                      <span>{exam.duration_minutes} dəqiqə</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4" style={{ color: '#e8a87c' }} />
                      <span>Maksimum bal: {exam.max_score}</span>
                    </div>
                  </div>

                  <div className="pt-2" style={{ borderTop: '1px solid rgba(124,110,224,0.10)' }}>
                    <span className="text-xs" style={{ color: '#64748b' }}>{exam.class?.name}</span>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      {/* Past results */}
      <section>
        <SectionTitle icon={ClipboardList} tone="mint">
          Nəticələr
        </SectionTitle>

        {results.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Nəticə yoxdur"
            description="Hələ heç bir imtahan nəticəniz yoxdur."
          />
        ) : (
          <Card hover={false} className="overflow-hidden" style={{ padding: 0 }}>
            <div className="overflow-x-auto">
              <table className="pastel-table">
                <thead>
                  <tr>
                    <th>İmtahan</th>
                    <th>Fənn</th>
                    <th>Tarix</th>
                    <th style={{ textAlign: 'center' }}>Bal</th>
                    <th style={{ textAlign: 'center' }}>Faiz</th>
                    <th style={{ textAlign: 'center' }}>Qiymət</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map(r => {
                    const pct = r.score != null && r.exam.max_score > 0
                      ? Math.round((r.score / r.exam.max_score) * 100)
                      : 0
                    return (
                      <tr key={r.id}>
                        <td style={{ fontWeight: 600, color: '#1a1a2e' }}>{r.exam.title}</td>
                        <td style={{ color: '#475569' }}>{r.exam.subject?.name}</td>
                        <td style={{ color: '#475569' }}>{formatDate(r.exam.exam_date)}</td>
                        <td style={{ textAlign: 'center', fontWeight: 700 }}>
                          {r.score} / {r.exam.max_score}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <Badge variant={getScoreVariant(pct)}>
                            {pct}%
                          </Badge>
                        </td>
                        <td style={{ textAlign: 'center' }}>
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
