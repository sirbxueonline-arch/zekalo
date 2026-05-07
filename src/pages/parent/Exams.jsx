import { useState, useEffect } from 'react'
import { ClipboardList, Calendar, Clock, Award, Users, Sparkles } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import { fmtLong } from '../../lib/dateUtils'

const PASTEL_COLORS = ['#7c6ee0', '#5db8a3', '#e8a87c', '#6b9dde']
function pastelColor(name = '') {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return PASTEL_COLORS[Math.abs(h) % PASTEL_COLORS.length]
}

function childInitials(name = '') {
  return name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?'
}

function formatDate(d) {
  if (!d) return ''
  return fmtLong(d)
}

function getScoreMeta(pct) {
  if (pct >= 90) return { label: 'Əla', color: '#5db8a3', bg: 'rgba(93,184,163,0.12)', border: 'rgba(93,184,163,0.3)' }
  if (pct >= 70) return { label: 'Yaxşı', color: '#6b9dde', bg: 'rgba(107,157,222,0.12)', border: 'rgba(107,157,222,0.3)' }
  if (pct >= 50) return { label: 'Kafi', color: '#e8a87c', bg: 'rgba(232,168,124,0.15)', border: 'rgba(232,168,124,0.3)' }
  return { label: 'Zəif', color: '#ef4444', bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.25)' }
}

export default function ParentExams() {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [children, setChildren] = useState([])
  const [selectedChildId, setSelectedChildId] = useState('')
  const [upcoming, setUpcoming] = useState([])
  const [results, setResults] = useState([])
  const [examsLoading, setExamsLoading] = useState(false)

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
        icon={Users}
        title="Uşaq məlumatı yoxdur"
        description="Hesabınıza bağlı uşaq tapılmadı."
      />
    )
  }

  const selectedChild = children.find(c => c.id === selectedChildId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold" style={{ color: '#1a1a2e', letterSpacing: '-0.02em' }}>
            <span className="pastel-text">İmtahanlar</span>
          </h1>
          {selectedChild && (
            <p className="text-sm mt-1" style={{ color: '#64748b' }}>
              {selectedChild.full_name} üçün imtahan cədvəli
            </p>
          )}
        </div>
      </div>

      {/* Child glass switcher */}
      {children.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {children.map(child => {
            const active = selectedChildId === child.id
            const color = pastelColor(child.full_name)
            return (
              <button
                key={child.id}
                onClick={() => setSelectedChildId(child.id)}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0"
                style={
                  active
                    ? {
                        background: 'linear-gradient(135deg, #7c6ee0 0%, #5db8a3 100%)',
                        color: '#fff',
                        border: '1px solid rgba(124,110,224,0.3)',
                        boxShadow: '0 4px 12px rgba(124,110,224,0.25)',
                      }
                    : {
                        background: 'rgba(255,255,255,0.6)',
                        color: '#1a1a2e',
                        border: '1px solid rgba(124,110,224,0.2)',
                        backdropFilter: 'blur(12px)',
                      }
                }
              >
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
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
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(124,110,224,0.12)' }}
              >
                <Calendar className="w-4.5 h-4.5" style={{ color: '#7c6ee0' }} />
              </div>
              <h2 className="text-xl font-extrabold" style={{ color: '#1a1a2e' }}>Gələcək imtahanlar</h2>
            </div>

            {upcoming.length === 0 ? (
              <div className="liquid-card p-10 text-center">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: 'rgba(93,184,163,0.12)' }}
                >
                  <Sparkles className="w-7 h-7" style={{ color: '#5db8a3' }} />
                </div>
                <h3 className="text-base font-bold" style={{ color: '#1a1a2e' }}>Gələcək imtahan yoxdur</h3>
                <p className="text-sm mt-1" style={{ color: '#64748b' }}>Hələlik planlaşdırılmış imtahan tapılmadı</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {upcoming.map(exam => {
                  const examDate = new Date(exam.exam_date)
                  const today = new Date()
                  today.setHours(0, 0, 0, 0)
                  const daysLeft = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24))
                  const subjColor = pastelColor(exam.subject?.name || '')

                  let pillBg, pillColor, pillBorder, pillLabel
                  if (daysLeft <= 3) {
                    pillBg = 'rgba(232,168,124,0.18)'; pillColor = '#c47a4a'; pillBorder = 'rgba(232,168,124,0.35)'
                  } else if (daysLeft <= 7) {
                    pillBg = 'rgba(107,157,222,0.12)'; pillColor = '#6b9dde'; pillBorder = 'rgba(107,157,222,0.3)'
                  } else {
                    pillBg = 'rgba(93,184,163,0.12)';  pillColor = '#5db8a3'; pillBorder = 'rgba(93,184,163,0.3)'
                  }
                  pillLabel = daysLeft === 0 ? 'Bu gün' : daysLeft === 1 ? 'Sabah' : `${daysLeft} gün`

                  return (
                    <div key={exam.id} className="liquid-card p-5 flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ background: subjColor }}
                            />
                            <span className="text-xs font-semibold truncate" style={{ color: '#64748b' }}>
                              {exam.subject?.name}
                            </span>
                          </div>
                          <h3 className="text-base font-bold leading-tight" style={{ color: '#1a1a2e' }}>
                            {exam.title}
                          </h3>
                        </div>
                        <span
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap"
                          style={{ background: pillBg, color: pillColor, border: `1px solid ${pillBorder}` }}
                        >
                          {pillLabel}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2" style={{ color: '#64748b' }}>
                          <Calendar className="w-4 h-4" style={{ color: '#7c6ee0' }} />
                          <span className="font-medium" style={{ color: '#1a1a2e' }}>{formatDate(exam.exam_date)}</span>
                        </div>
                        <div className="flex items-center gap-2" style={{ color: '#64748b' }}>
                          <Clock className="w-4 h-4" style={{ color: '#5db8a3' }} />
                          <span>{exam.duration_minutes} dəqiqə</span>
                        </div>
                        <div className="flex items-center gap-2" style={{ color: '#64748b' }}>
                          <Award className="w-4 h-4" style={{ color: '#e8a87c' }} />
                          <span>Maksimum: {exam.max_score} bal</span>
                        </div>
                      </div>

                      <div className="pt-2" style={{ borderTop: '1px solid rgba(124,110,224,0.1)' }}>
                        <span className="text-xs font-medium" style={{ color: '#64748b' }}>{exam.class?.name}</span>
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
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(93,184,163,0.12)' }}
              >
                <ClipboardList className="w-4.5 h-4.5" style={{ color: '#5db8a3' }} />
              </div>
              <h2 className="text-xl font-extrabold" style={{ color: '#1a1a2e' }}>Nəticələr</h2>
            </div>

            {results.length === 0 ? (
              <div className="liquid-card p-10 text-center">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: 'rgba(124,110,224,0.10)' }}
                >
                  <ClipboardList className="w-7 h-7" style={{ color: '#7c6ee0' }} />
                </div>
                <h3 className="text-base font-bold" style={{ color: '#1a1a2e' }}>Nəticə yoxdur</h3>
                <p className="text-sm mt-1" style={{ color: '#64748b' }}>Uşağınızın hələ heç bir imtahan nəticəsi yoxdur</p>
              </div>
            ) : (
              <div className="liquid-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ background: 'rgba(248,247,251,0.8)', borderBottom: '1px solid rgba(124,110,224,0.1)' }}>
                        <th className="text-xs font-bold uppercase tracking-wider px-6 py-3 text-left" style={{ color: '#64748b' }}>İmtahan</th>
                        <th className="text-xs font-bold uppercase tracking-wider px-6 py-3 text-left" style={{ color: '#64748b' }}>Fənn</th>
                        <th className="text-xs font-bold uppercase tracking-wider px-6 py-3 text-left" style={{ color: '#64748b' }}>Tarix</th>
                        <th className="text-xs font-bold uppercase tracking-wider px-6 py-3 text-center" style={{ color: '#64748b' }}>Bal</th>
                        <th className="text-xs font-bold uppercase tracking-wider px-6 py-3 text-center" style={{ color: '#64748b' }}>Faiz</th>
                        <th className="text-xs font-bold uppercase tracking-wider px-6 py-3 text-center" style={{ color: '#64748b' }}>Qiymət</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((r, idx, arr) => {
                        const pct = r.exam.max_score > 0
                          ? Math.round((r.score / r.exam.max_score) * 100)
                          : 0
                        const meta = getScoreMeta(pct)
                        return (
                          <tr
                            key={r.id}
                            className="transition-colors hover:bg-white/40"
                            style={{
                              borderBottom: idx === arr.length - 1 ? 'none' : '1px solid rgba(124,110,224,0.08)',
                            }}
                          >
                            <td className="px-6 py-4 text-sm font-bold" style={{ color: '#1a1a2e' }}>{r.exam.title}</td>
                            <td className="px-6 py-4 text-sm" style={{ color: '#64748b' }}>{r.exam.subject?.name}</td>
                            <td className="px-6 py-4 text-sm" style={{ color: '#64748b' }}>{formatDate(r.exam.exam_date)}</td>
                            <td className="px-6 py-4 text-center text-sm font-bold" style={{ color: '#1a1a2e' }}>
                              {r.score} / {r.exam.max_score}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span
                                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold"
                                style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
                              >
                                {pct}%
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span
                                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold"
                                style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
                              >
                                {meta.label}
                              </span>
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
