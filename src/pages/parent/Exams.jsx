import { useState, useEffect } from 'react'
import { ClipboardList, Calendar, Clock, Award } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import CountUp from '../../components/ui/CountUp'
import { fmtLong } from '../../lib/dateUtils'

const AVATAR_COLORS = ['var(--brand-400)', 'var(--grape)', 'var(--mint)', 'var(--sky)']
function avatarColor(name = '') {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}

function childInitials(name = '') {
  return name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?'
}

function formatDate(d) {
  if (!d) return ''
  return fmtLong(d)
}

// Score → friendly pill class + label  (warm, reassuring — never alarming red)
function getScoreMeta(pct) {
  if (pct >= 90) return { label: 'Əla',  pillClass: 'pill pill-mint'  }
  if (pct >= 70) return { label: 'Yaxşı', pillClass: 'pill pill-blue'  }
  if (pct >= 50) return { label: 'Kafi',  pillClass: 'pill pill-peach' }
  return { label: 'Zəif', pillClass: 'pill pill-peach' }
}

export default function ParentExams() {
  const { profile } = useAuth()
  const [loading, setLoading]             = useState(true)
  const [children, setChildren]           = useState([])
  const [selectedChildId, setSelectedChildId] = useState('')
  const [upcoming, setUpcoming]           = useState([])
  const [results, setResults]             = useState([])
  const [examsLoading, setExamsLoading]   = useState(false)

  useEffect(() => {
    if (!profile) return
    loadChildren()
  }, [profile])

  useEffect(() => {
    if (selectedChildId) loadExamsForChild(selectedChildId)
  }, [selectedChildId])

  async function loadChildren() {
    try {
      const { data } = await supabase
        .from('parent_children')
        .select('child:profiles!child_id(id, full_name)')
        .eq('parent_id', profile.id)

      const kids = (data || []).map(d => d.child).filter(Boolean)
      setChildren(kids)
      if (kids.length > 0) setSelectedChildId(kids[0].id)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function loadExamsForChild(childId) {
    try {
      setExamsLoading(true)
      const today = new Date().toISOString().split('T')[0]

      const { data: membersData } = await supabase
        .from('class_members')
        .select('class_id')
        .eq('student_id', childId)

      const classIds = (membersData || []).map(m => m.class_id)

      if (!classIds.length) {
        setUpcoming([])
        setResults([])
        setExamsLoading(false)
        return
      }

      const [upcomingRes, resultsRes] = await Promise.all([
        supabase
          .from('exams')
          .select('*, class:classes(id, name), subject:subjects(id, name)')
          .in('class_id', classIds)
          .eq('published', true)
          .gte('exam_date', today)
          .order('exam_date', { ascending: true }),
        supabase
          .from('exam_results')
          .select('*, exam:exams(*, class:classes(id, name), subject:subjects(id, name))')
          .eq('student_id', childId)
          .order('created_at', { ascending: false }),
      ])

      setUpcoming(upcomingRes.data || [])
      setResults((resultsRes.data || []).filter(r => r.exam))
    } catch (err) {
      console.error(err)
    } finally {
      setExamsLoading(false)
    }
  }

  if (loading) return <PageSpinner />

  if (children.length === 0) {
    return (
      <EmptyState
        pose="thinking"
        title="Uşaq məlumatı yoxdur"
        description="Hesabınıza bağlı uşaq tapılmadı."
      />
    )
  }

  const selectedChild = children.find(c => c.id === selectedChildId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className="icon-chip icon-chip-periwinkle flex-shrink-0"
          style={{ width: 48, height: 48 }}
        >
          <Award className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-display text-[30px] font-extrabold text-ink-900" style={{ letterSpacing: '-0.02em' }}>
            İmtahanlar
          </h1>
          {selectedChild && (
            <p className="text-[15px] text-ink-400 mt-0.5">
              {selectedChild.full_name} üçün imtahan cədvəli
            </p>
          )}
        </div>
      </div>

      {/* Child pill switcher */}
      {children.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {children.map(child => {
            const active = selectedChildId === child.id
            const color = avatarColor(child.full_name)
            return (
              <button
                key={child.id}
                onClick={() => setSelectedChildId(child.id)}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-pill text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0"
                style={
                  active
                    ? { background: 'var(--brand-500)', color: '#fff' }
                    : { background: 'var(--surface)', color: 'var(--ink-700)', border: '1px solid var(--hairline)' }
                }
              >
                <span
                  className="w-7 h-7 rounded-pill flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: active ? 'rgba(255,255,255,0.25)' : color }}
                >
                  {childInitials(child.full_name)}
                </span>
                {child.full_name}
              </button>
            )
          })}
        </div>
      )}

      {examsLoading ? (
        <PageSpinner />
      ) : (
        <>
          {/* Upcoming exams */}
          <section>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="icon-chip icon-chip-periwinkle">
                <Calendar className="w-5 h-5" />
              </div>
              <h2 className="text-[20px] font-semibold text-ink-900">Gələcək imtahanlar</h2>
            </div>

            {upcoming.length === 0 ? (
              <EmptyState
                tier={1}
                icon={Calendar}
                title="Gələcək imtahan yoxdur"
                description="Hələlik planlaşdırılmış imtahan tapılmadı"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {upcoming.map(exam => {
                  const examDate = new Date(exam.exam_date)
                  const todayD = new Date()
                  todayD.setHours(0, 0, 0, 0)
                  const daysLeft = Math.ceil((examDate - todayD) / (1000 * 60 * 60 * 24))

                  return (
                    <div
                      key={exam.id}
                      className="liquid-card overflow-hidden flex flex-col gap-0 transition-transform hover:-translate-y-0.5"
                    >
                      {/* Top accent bar based on urgency (warm, never alarming red) */}
                      <div
                        className="h-1 w-full"
                        style={{
                          background: daysLeft <= 3
                            ? 'var(--sun)'
                            : daysLeft <= 7
                            ? 'var(--brand-400)'
                            : 'var(--mint)',
                        }}
                      />
                      <div className="p-5 flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="w-2 h-2 rounded-pill flex-shrink-0" style={{ background: 'var(--brand-400)' }} />
                              <span className="text-[13px] font-semibold text-ink-400 truncate">
                                {exam.subject?.name}
                              </span>
                            </div>
                            <h3 className="text-[15px] font-semibold text-ink-900 leading-tight">
                              {exam.title}
                            </h3>
                          </div>
                          <div className="flex-shrink-0 flex flex-col items-center rounded-tile px-3 py-2 text-center"
                            style={{
                              background: daysLeft <= 3
                                ? 'rgba(234,179,8,0.12)'
                                : daysLeft <= 7
                                ? 'var(--brand-50)'
                                : 'rgba(31,168,85,0.10)',
                              border: `1px solid ${daysLeft <= 3 ? 'rgba(234,179,8,0.28)' : daysLeft <= 7 ? 'var(--brand-100)' : 'rgba(31,168,85,0.22)'}`,
                            }}
                          >
                            <span
                              className="font-display font-extrabold leading-none tabular-nums"
                              style={{
                                fontSize: 22,
                                color: daysLeft <= 3
                                  ? 'var(--sun)'
                                  : daysLeft <= 7
                                  ? 'var(--brand-500)'
                                  : 'var(--mint)',
                              }}
                            >
                              {daysLeft === 0 ? '!' : daysLeft}
                            </span>
                            <span className="text-[10px] font-semibold uppercase tracking-wider mt-0.5"
                              style={{ color: 'var(--ink-400)' }}
                            >
                              {daysLeft === 0 ? 'bu gün' : daysLeft === 1 ? 'sabah' : 'gün'}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-[14px]">
                            <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--brand-500)' }} />
                            <span className="font-medium text-ink-900">{formatDate(exam.exam_date)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[14px] text-ink-600">
                            <Clock className="w-4 h-4 flex-shrink-0 text-ink-400" />
                            <span>{exam.duration_minutes} dəqiqə</span>
                          </div>
                          <div className="flex items-center gap-2 text-[14px] text-ink-600">
                            <Award className="w-4 h-4 flex-shrink-0 text-ink-400" />
                            <span>Maksimum: {exam.max_score} bal</span>
                          </div>
                        </div>

                        <div className="pt-2" style={{ borderTop: '1px solid var(--hairline)' }}>
                          <span className="text-[13px] text-ink-400">{exam.class?.name}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* Results */}
          <section>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="icon-chip icon-chip-periwinkle">
                <ClipboardList className="w-5 h-5" />
              </div>
              <h2 className="text-[20px] font-semibold text-ink-900">Nəticələr</h2>
            </div>

            {results.length === 0 ? (
              <EmptyState
                tier={1}
                icon={ClipboardList}
                title="Nəticə yoxdur"
                description="Uşağınızın hələ heç bir imtahan nəticəsi yoxdur"
              />
            ) : (
              <div className="liquid-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="pastel-table w-full">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left">İmtahan</th>
                        <th className="px-6 py-3 text-left">Fənn</th>
                        <th className="px-6 py-3 text-left">Tarix</th>
                        <th className="px-6 py-3 text-center">Bal</th>
                        <th className="px-6 py-3 text-left" style={{ minWidth: 120 }}>Nəticə</th>
                        <th className="px-6 py-3 text-center">Qiymət</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((r, idx, arr) => {
                        const pct = r.exam.max_score > 0
                          ? Math.round((r.score / r.exam.max_score) * 100)
                          : 0
                        const { label, pillClass } = getScoreMeta(pct)
                        const barColor = pct >= 90
                          ? 'var(--mint)'
                          : pct >= 70
                          ? 'var(--brand-500)'
                          : pct >= 50
                          ? 'var(--sun)'
                          : 'var(--ink-400)'
                        return (
                          <tr
                            key={r.id}
                            style={{ borderBottom: idx === arr.length - 1 ? 'none' : '1px solid var(--hairline)' }}
                          >
                            <td className="px-6 py-4 text-[13px] font-semibold text-ink-900">{r.exam.title}</td>
                            <td className="px-6 py-4 text-[13px] text-ink-600">{r.exam.subject?.name}</td>
                            <td className="px-6 py-4 text-[13px] text-ink-600 tabular-nums whitespace-nowrap">{formatDate(r.exam.exam_date)}</td>
                            <td className="px-6 py-4 text-center text-[13px] font-semibold text-ink-900 tabular-nums">
                              <CountUp to={r.score} duration={700} /> / {r.exam.max_score}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 rounded-pill overflow-hidden" style={{ background: 'var(--hairline)', minWidth: 60 }}>
                                  <div
                                    className="h-full rounded-pill transition-all duration-700"
                                    style={{ width: `${pct}%`, background: barColor }}
                                  />
                                </div>
                                <span className="text-[12px] font-semibold tabular-nums flex-shrink-0" style={{ color: barColor }}>
                                  <CountUp to={pct} duration={700} suffix="%" />
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={pillClass}>{label}</span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
