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

// Tone → design-system token classes
const SECTION_TONES = {
  periwinkle: { chip: 'icon-chip-periwinkle', text: 'text-brand-500' },
  mint:       { chip: 'icon-chip-mint',       text: 'text-mint'      },
}

function SectionTitle({ icon: Icon, children, tone = 'periwinkle' }) {
  const t = SECTION_TONES[tone] || SECTION_TONES.periwinkle
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className={`icon-chip ${t.chip}`} style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0 }}>
        <Icon className="w-5 h-5" />
      </span>
      <h2 className="text-ink-900" style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>
        {children}
      </h2>
    </div>
  )
}

// Urgency → leading-dot status pill class (meaning-bearing color only).
function daysLeftPill(d) {
  if (d <= 3)  return 'pill-rose'
  if (d <= 7)  return 'pill-peach'
  return 'pill-mint'
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
        pose="thinking"
        title="Xəta baş verdi"
        description={fetchError}
      />
    )
  }

  return (
    <div className="space-y-10">
      {/* Page hero */}
      <div className="flex items-center gap-4">
        <div
          className="icon-chip icon-chip-periwinkle"
          style={{ width: 56, height: 56, borderRadius: 16, flexShrink: 0 }}
        >
          <ClipboardList className="w-7 h-7" />
        </div>
        <div>
          <h1 className="font-display text-ink-900" style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.12 }}>
            İmtahanlar
          </h1>
          <p className="text-sm text-ink-400 mt-0.5">
            {upcoming.length} gələcək · {results.length} nəticə
          </p>
        </div>
      </div>

      {/* Upcoming exams */}
      <section>
        <SectionTitle icon={Calendar} tone="periwinkle">
          Gələcək imtahanlar
        </SectionTitle>

        {upcoming.length === 0 ? (
          <EmptyState
            pose="sleeping"
            title="Gələcək imtahan yoxdur"
            description="Yaxın zamanda planlanmış imtahan tapılmadı. Rahatlayın!"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {upcoming.map(exam => {
              const examDate = new Date(exam.exam_date)
              const today = new Date()
              today.setHours(0, 0, 0, 0)
              const daysLeft = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24))
              return (
                <Card key={exam.id} className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3
                        className="text-ink-900"
                        style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.3 }}
                      >
                        {exam.title}
                      </h3>
                      <p className="text-sm mt-0.5 text-ink-400">{exam.subject?.name}</p>
                    </div>
                    {/* Countdown status pill — leading dot, meaning-bearing color */}
                    <span className={`${daysLeftPill(daysLeft)} tabular-nums flex-shrink-0`}>
                      {daysLeft === 0 ? 'Bu gün' : daysLeft === 1 ? 'Sabah' : `${daysLeft} gün`}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2.5 text-sm text-ink-600">
                      <Calendar className="w-4 h-4 text-ink-400 flex-shrink-0" />
                      {formatDate(exam.exam_date)}
                    </div>
                    <div className="flex items-center gap-2.5 text-sm text-ink-600">
                      <Clock className="w-4 h-4 text-ink-400 flex-shrink-0" />
                      {exam.duration_minutes} dəqiqə
                    </div>
                    <div className="flex items-center gap-2.5 text-sm text-ink-600">
                      <Award className="w-4 h-4 text-ink-400 flex-shrink-0" />
                      Maks. bal: <strong className="text-ink-900 tabular-nums">{exam.max_score}</strong>
                    </div>
                  </div>

                  <div
                    className="pt-3 text-xs text-ink-400 font-semibold"
                    style={{ borderTop: '1px solid var(--hairline)' }}
                  >
                    {exam.class?.name}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      {/* Past results */}
      <section>
        <SectionTitle icon={ClipboardList} tone="periwinkle">
          Nəticələr
        </SectionTitle>

        {results.length === 0 ? (
          <EmptyState
            tier={1}
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
                        <td className="font-semibold text-ink-900">{r.exam.title}</td>
                        <td className="text-ink-600">{r.exam.subject?.name}</td>
                        <td className="text-ink-600">{formatDate(r.exam.exam_date)}</td>
                        <td style={{ textAlign: 'center', fontWeight: 700 }} className="tabular-nums text-ink-900">
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
