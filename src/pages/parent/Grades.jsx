import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { GradeBadge } from '../../components/ui/Badge'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import { BookOpen, Users, TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react'
import { fmtNumeric } from '../../lib/dateUtils'

const PASTEL_COLORS = ['#7c6ee0', '#5db8a3', '#e8a87c', '#6b9dde']
function pastelColor(name = '') {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return PASTEL_COLORS[Math.abs(h) % PASTEL_COLORS.length]
}

function childInitials(name = '') {
  return name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?'
}

function gradeColor(score) {
  if (score == null) return '#64748b'
  if (score >= 8) return '#5db8a3'    // mint - A
  if (score >= 6) return '#6b9dde'    // blue - B
  if (score >= 4) return '#e8a87c'    // peach - C
  return '#ef4444'
}

function gradeBg(score) {
  if (score == null) return 'rgba(124,110,224,0.08)'
  if (score >= 8) return 'rgba(93,184,163,0.12)'
  if (score >= 6) return 'rgba(107,157,222,0.12)'
  if (score >= 4) return 'rgba(232,168,124,0.15)'
  return 'rgba(239,68,68,0.10)'
}

function TrendArrow({ current, prev }) {
  if (prev == null || current == null) return <Minus className="w-4 h-4" style={{ color: '#64748b' }} />
  if (current > prev) return <TrendingUp className="w-4 h-4" style={{ color: '#5db8a3' }} />
  if (current < prev) return <TrendingDown className="w-4 h-4" style={{ color: '#e8a87c' }} />
  return <Minus className="w-4 h-4" style={{ color: '#64748b' }} />
}

// Pastel SVG line chart of grades over time (chronological)
function GradesTrendChart({ grades }) {
  const points = (grades || [])
    .filter(g => g.score != null)
    .slice(0, 12)
    .reverse()
    .map(g => g.max_score > 0 ? Math.round((g.score / g.max_score) * 10 * 10) / 10 : g.score)

  if (points.length < 2) return null

  const W = 720
  const H = 180
  const PAD_X = 24
  const PAD_TOP = 16
  const PAD_BOT = 24
  const innerW = W - PAD_X * 2
  const innerH = H - PAD_TOP - PAD_BOT
  const stepX = points.length > 1 ? innerW / (points.length - 1) : 0
  const yOf = v => PAD_TOP + innerH - (v / 10) * innerH
  const xOf = i => PAD_X + i * stepX

  const path = points.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xOf(i).toFixed(1)} ${yOf(v).toFixed(1)}`).join(' ')
  const area = `${path} L ${xOf(points.length - 1).toFixed(1)} ${(PAD_TOP + innerH).toFixed(1)} L ${xOf(0).toFixed(1)} ${(PAD_TOP + innerH).toFixed(1)} Z`

  return (
    <div className="liquid-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold" style={{ color: '#1a1a2e' }}>Qiymət dinamikası</h3>
          <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>Son {points.length} qiymət</p>
        </div>
        <Sparkles className="w-4 h-4" style={{ color: '#7c6ee0' }} />
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        preserveAspectRatio="none"
        style={{ display: 'block' }}
      >
        <defs>
          <linearGradient id="gradesArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7c6ee0" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#5db8a3" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="gradesLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7c6ee0" />
            <stop offset="100%" stopColor="#5db8a3" />
          </linearGradient>
        </defs>

        {/* Subtle grid lines */}
        {[0, 5, 10].map(v => (
          <line
            key={v}
            x1={PAD_X}
            x2={W - PAD_X}
            y1={yOf(v)}
            y2={yOf(v)}
            stroke="rgba(124,110,224,0.15)"
            strokeDasharray={v === 0 || v === 10 ? '0' : '3 4'}
            strokeWidth="1"
          />
        ))}

        <path d={area} fill="url(#gradesArea)" />
        <path d={path} fill="none" stroke="url(#gradesLine)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

        {points.map((v, i) => (
          <circle
            key={i}
            cx={xOf(i)}
            cy={yOf(v)}
            r="4"
            fill="#fff"
            stroke={gradeColor(v)}
            strokeWidth="2"
          />
        ))}
      </svg>
    </div>
  )
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
  const childInits = childInitials(selectedChild?.full_name)

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold" style={{ color: '#1a1a2e', letterSpacing: '-0.02em' }}>
          <span className="pastel-text">Qiymətlər</span>
        </h1>
        <p className="text-sm mt-1" style={{ color: '#64748b' }}>Ortalama, dinamika və qiymət tarixçəsi</p>
      </div>

      {/* Child glass switcher */}
      {children.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {children.map(child => {
            const active = selectedChild?.id === child.id
            const color = pastelColor(child.full_name)
            return (
              <button
                key={child.id}
                onClick={() => setSelectedChild(child)}
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

      {loading ? (
        <PageSpinner />
      ) : grades.length === 0 ? (
        <div className="liquid-card p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(124,110,224,0.12)' }}
            >
              <BookOpen className="w-8 h-8" style={{ color: '#7c6ee0' }} />
            </div>
            <h3 className="text-lg font-bold" style={{ color: '#1a1a2e' }}>Qiymət yoxdur</h3>
            <p className="text-sm mt-1" style={{ color: '#64748b' }}>Bu uşaq üçün hələ qiymət daxil edilməyib</p>
          </div>
        </div>
      ) : (
        <>
          {/* Report card hero */}
          <div className="liquid-card p-6 relative overflow-hidden">
            <div
              aria-hidden
              className="section-blob"
              style={{
                top: '-50%',
                right: '-10%',
                width: '40%',
                height: '200%',
                background: 'radial-gradient(ellipse at center, rgba(93,184,163,0.18) 0%, transparent 65%)',
              }}
            />
            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${pastelColor(selectedChild?.full_name || '')} 0%, ${pastelColor((selectedChild?.full_name || '') + 'x')} 100%)`,
                    boxShadow: '0 8px 20px rgba(124,110,224,0.25)',
                  }}
                >
                  {childInits}
                </div>
                <div>
                  <p className="text-xl font-extrabold leading-tight" style={{ color: '#1a1a2e' }}>
                    {selectedChild?.full_name}
                  </p>
                  <p className="text-sm mt-0.5" style={{ color: '#64748b' }}>
                    {selectedChild?.class_name || selectedChild?.grade || '—'}
                    {selectedChild?.school?.name ? ` · ${selectedChild.school.name}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#64748b' }}>
                    Ümumi ortalama
                  </p>
                  <p className="text-4xl font-extrabold leading-none" style={{ color: '#1a1a2e' }}>
                    {overallAvg != null ? overallAvg.toString().replace('.', ',') : '—'}
                  </p>
                </div>
                {overallAvg != null && (
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white font-extrabold text-lg"
                    style={{
                      background: `linear-gradient(135deg, ${gradeColor(overallAvg)} 0%, ${gradeColor(overallAvg)}cc 100%)`,
                      boxShadow: `0 8px 20px ${gradeColor(overallAvg)}40`,
                    }}
                  >
                    {overallAvg.toString().replace('.', ',')}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Trend chart */}
          <GradesTrendChart grades={grades} />

          {/* Subject summary cards */}
          {subjects.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map(s => {
                const avg = calcAverage(s.id)
                const count = grades.filter(g => g.subject?.id === s.id).length
                const { current, prev } = calcSubjectTrend(s.id)
                const barPct = avg != null ? Math.min((avg / 10) * 100, 100) : 0
                const color = avg == null ? '#64748b' : gradeColor(avg)
                return (
                  <div key={s.id} className="liquid-card p-5 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-bold leading-tight" style={{ color: '#1a1a2e' }}>{s.name}</p>
                      <TrendArrow current={current} prev={prev} />
                    </div>
                    <div className="flex items-center gap-3">
                      {avg != null ? (
                        <GradeBadge score={avg} />
                      ) : (
                        <span className="text-xs" style={{ color: '#64748b' }}>—</span>
                      )}
                      <span className="text-xs" style={{ color: '#64748b' }}>{count} qiymət</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="flex-1 h-2 rounded-full overflow-hidden"
                        style={{ background: 'rgba(124,110,224,0.08)' }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${barPct}%`, background: color }}
                        />
                      </div>
                      <span
                        className="text-xs font-bold w-9 text-right flex-shrink-0"
                        style={{ color }}
                      >
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
              className="px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all"
              style={
                !selectedSubject
                  ? {
                      background: 'linear-gradient(135deg, #7c6ee0 0%, #5db8a3 100%)',
                      color: '#fff',
                      border: '1px solid rgba(124,110,224,0.3)',
                      boxShadow: '0 4px 12px rgba(124,110,224,0.2)',
                    }
                  : {
                      background: 'rgba(255,255,255,0.6)',
                      color: '#64748b',
                      border: '1px solid rgba(124,110,224,0.2)',
                      backdropFilter: 'blur(12px)',
                    }
              }
            >
              Hamısı
            </button>
            {subjects.map(s => {
              const active = selectedSubject === s.id
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedSubject(s.id)}
                  className="px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all"
                  style={
                    active
                      ? {
                          background: 'linear-gradient(135deg, #7c6ee0 0%, #5db8a3 100%)',
                          color: '#fff',
                          border: '1px solid rgba(124,110,224,0.3)',
                          boxShadow: '0 4px 12px rgba(124,110,224,0.2)',
                        }
                      : {
                          background: 'rgba(255,255,255,0.6)',
                          color: '#64748b',
                          border: '1px solid rgba(124,110,224,0.2)',
                          backdropFilter: 'blur(12px)',
                        }
                  }
                >
                  {s.name}
                </button>
              )
            })}
          </div>

          {/* History table */}
          <div className="liquid-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'rgba(248,247,251,0.8)', borderBottom: '1px solid rgba(124,110,224,0.1)' }}>
                    <th className="text-xs font-bold uppercase tracking-wider px-6 py-3 text-left" style={{ color: '#64748b' }}>Tarix</th>
                    <th className="text-xs font-bold uppercase tracking-wider px-6 py-3 text-left" style={{ color: '#64748b' }}>Fənn</th>
                    <th className="text-xs font-bold uppercase tracking-wider px-6 py-3 text-left" style={{ color: '#64748b' }}>Qiymətləndirmə</th>
                    {isIb ? (
                      <>
                        <th className="text-xs font-bold uppercase tracking-wider px-4 py-3 text-center" style={{ color: '#64748b' }}>A</th>
                        <th className="text-xs font-bold uppercase tracking-wider px-4 py-3 text-center" style={{ color: '#64748b' }}>B</th>
                        <th className="text-xs font-bold uppercase tracking-wider px-4 py-3 text-center" style={{ color: '#64748b' }}>C</th>
                        <th className="text-xs font-bold uppercase tracking-wider px-4 py-3 text-center" style={{ color: '#64748b' }}>D</th>
                      </>
                    ) : (
                      <th className="text-xs font-bold uppercase tracking-wider px-6 py-3 text-center" style={{ color: '#64748b' }}>Bal</th>
                    )}
                    <th className="text-xs font-bold uppercase tracking-wider px-6 py-3 text-left" style={{ color: '#64748b' }}>Qeyd</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((g, idx, arr) => {
                    const normScore =
                      g.score == null ? null :
                      g.max_score > 0 ? Math.round((g.score / g.max_score) * 10) : g.score
                    return (
                      <tr
                        key={g.id}
                        className="transition-colors hover:bg-white/40"
                        style={{
                          borderBottom: idx === arr.length - 1 ? 'none' : '1px solid rgba(124,110,224,0.08)',
                          borderLeft: `3px solid ${gradeColor(normScore)}`,
                        }}
                      >
                        <td className="px-6 py-3.5 text-sm whitespace-nowrap" style={{ color: '#64748b' }}>
                          {fmtNumeric(g.date)}
                        </td>
                        <td className="px-6 py-3.5 text-sm font-bold" style={{ color: '#1a1a2e' }}>
                          {g.subject?.name}
                        </td>
                        <td className="px-6 py-3.5 text-sm" style={{ color: '#64748b' }}>
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
                        <td className="px-6 py-3.5 text-sm" style={{ color: '#64748b' }}>
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
