import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { GradeBadge } from '../../components/ui/Badge'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import LevelRing from '../../components/ui/LevelRing'
import XPBar from '../../components/ui/XPBar'
import CountUp from '../../components/ui/CountUp'
import { TrendingUp, TrendingDown, Minus, Sparkles, Star } from 'lucide-react'
import { fmtNumeric } from '../../lib/dateUtils'

// Adult monogram avatar colors — avatars are the one place saturated hue lives (§5.2)
const AVATAR_COLORS = ['var(--brand-400)', 'var(--grape)', 'var(--mint)', 'var(--sky)']
function avatarColor(name = '') {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}

function childInitials(name = '') {
  return name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?'
}

// Grade → token color mapping (warm, reassuring data color — never alarming red)
function gradeColor(score) {
  if (score == null) return 'var(--ink-400)'
  if (score >= 8) return 'var(--mint)'
  if (score >= 6) return 'var(--brand-500)'
  if (score >= 4) return 'var(--sun)'
  return 'var(--ink-400)'
}

function gradeTrackColor(score) {
  if (score == null) return 'var(--hairline)'
  if (score >= 8) return 'rgba(31,168,85,0.16)'
  if (score >= 6) return 'rgba(87,79,207,0.14)'
  if (score >= 4) return 'rgba(234,179,8,0.20)'
  return 'var(--hairline)'
}

function TrendArrow({ current, prev }) {
  if (prev == null || current == null) return <Minus className="w-4 h-4 text-ink-400" />
  if (current > prev) return <TrendingUp className="w-4 h-4" style={{ color: 'var(--mint)' }} />
  if (current < prev) return <TrendingDown className="w-4 h-4" style={{ color: 'var(--ink-400)' }} />
  return <Minus className="w-4 h-4 text-ink-400" />
}

// Inline SVG trend chart — calm data surface
function GradesTrendChart({ grades }) {
  const points = (grades || [])
    .filter(g => g.score != null)
    .slice(0, 12)
    .reverse()
    .map(g => g.max_score > 0 ? Math.round((g.score / g.max_score) * 10 * 10) / 10 : g.score)

  if (points.length < 2) return null

  const W = 720, H = 180, PAD_X = 24, PAD_TOP = 16, PAD_BOT = 24
  const innerW = W - PAD_X * 2, innerH = H - PAD_TOP - PAD_BOT
  const stepX = points.length > 1 ? innerW / (points.length - 1) : 0
  const yOf = v => PAD_TOP + innerH - (v / 10) * innerH
  const xOf = i => PAD_X + i * stepX
  const path = points.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xOf(i).toFixed(1)} ${yOf(v).toFixed(1)}`).join(' ')
  const area = `${path} L ${xOf(points.length - 1).toFixed(1)} ${(PAD_TOP + innerH).toFixed(1)} L ${xOf(0).toFixed(1)} ${(PAD_TOP + innerH).toFixed(1)} Z`

  return (
    <div className="liquid-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-[15px] font-semibold text-ink-900">Qiymət dinamikası</h3>
          <p className="text-[13px] text-ink-400 mt-0.5">Son {points.length} qiymət</p>
        </div>
        <Sparkles className="w-4 h-4" style={{ color: 'var(--brand-400)' }} />
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="none" style={{ display: 'block' }}>
        <defs>
          <linearGradient id="gradesAreaDs" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--brand-400)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--brand-400)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="gradesLineDs" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--brand-500)" />
            <stop offset="100%" stopColor="var(--brand-500)" />
          </linearGradient>
        </defs>
        {[0, 5, 10].map(v => (
          <line
            key={v}
            x1={PAD_X} x2={W - PAD_X}
            y1={yOf(v)} y2={yOf(v)}
            stroke="var(--hairline)"
            strokeDasharray={v === 0 || v === 10 ? '0' : '3 4'}
            strokeWidth="1"
          />
        ))}
        <path d={area} fill="url(#gradesAreaDs)" />
        <path d={path} fill="none" stroke="url(#gradesLineDs)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((v, i) => (
          <circle key={i} cx={xOf(i)} cy={yOf(v)} r="4" fill="var(--surface)" stroke={gradeColor(v)} strokeWidth="2" />
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
        pose="thinking"
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
  const filtered = selectedSubject ? grades.filter(g => g.subject?.id === selectedSubject) : grades
  const overallAvg = calcAverage(null)
  const childInits = childInitials(selectedChild?.full_name)

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start gap-3">
        <div
          className="icon-chip icon-chip-periwinkle flex-shrink-0"
          style={{ width: 48, height: 48 }}
        >
          <Star className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-display text-[30px] font-extrabold text-ink-900" style={{ letterSpacing: '-0.02em' }}>
            Qiymətlər
          </h1>
          <p className="text-[15px] text-ink-400 mt-0.5">Ortalama, dinamika və qiymət tarixçəsi</p>
        </div>
      </div>

      {/* Child pill switcher */}
      {children.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {children.map(child => {
            const active = selectedChild?.id === child.id
            const color = avatarColor(child.full_name)
            return (
              <button
                key={child.id}
                onClick={() => setSelectedChild(child)}
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

      {loading ? (
        <PageSpinner />
      ) : grades.length === 0 ? (
        <EmptyState
          tier={1}
          icon={Star}
          title="Qiymət yoxdur"
          description="Bu uşaq üçün hələ qiymət daxil edilməyib"
        />
      ) : (
        <>
          {/* Report card hero */}
          <div className="liquid-card p-6 relative overflow-hidden">
            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
              <div className="flex items-center gap-4">
                <span
                  className="w-16 h-16 rounded-pill flex items-center justify-center text-white font-display font-extrabold text-xl flex-shrink-0"
                  style={{ background: avatarColor(selectedChild?.full_name || '') }}
                >
                  {childInits}
                </span>
                <div>
                  <p className="text-[20px] font-bold text-ink-900 leading-tight">
                    {selectedChild?.full_name}
                  </p>
                  <p className="text-[13px] text-ink-400 mt-0.5">
                    {selectedChild?.class_name || selectedChild?.grade || '—'}
                    {selectedChild?.school?.name ? ` · ${selectedChild.school.name}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-3">
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[13px] font-semibold text-ink-400 uppercase tracking-[0.04em] mb-1">
                      Ümumi ortalama
                    </p>
                    <p className="font-display text-[40px] font-extrabold text-ink-900 leading-none tabular-nums">
                      {overallAvg != null ? (
                        <CountUp to={overallAvg} decimals={1} duration={700} />
                      ) : '—'}
                    </p>
                  </div>
                  {overallAvg != null && (
                    <LevelRing
                      value={Math.round(overallAvg * 10)}
                      max={100}
                      size={72}
                      stroke={7}
                      label="/ 10"
                      color={gradeColor(overallAvg)}
                      trackColor={gradeTrackColor(overallAvg)}
                      center={
                        <span className="font-display font-extrabold text-ink-900 tabular-nums" style={{ fontSize: 20 }}>
                          <CountUp to={overallAvg} decimals={1} duration={700} />
                        </span>
                      }
                    />
                  )}
                </div>
                {overallAvg != null && (
                  <div className="w-48">
                    <XPBar
                      value={Math.round(overallAvg * 10)}
                      target={100}
                      labelText={`${Math.round(overallAvg * 10)} / 100 bal`}
                    />
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
                const color = gradeColor(avg)
                return (
                  <div key={s.id} className="liquid-card p-5 flex flex-col gap-3 transition-transform hover:-translate-y-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[15px] font-semibold text-ink-900 leading-tight">{s.name}</p>
                      <TrendArrow current={current} prev={prev} />
                    </div>
                    <div className="flex items-center gap-3">
                      {avg != null ? (
                        <GradeBadge score={avg} />
                      ) : (
                        <span className="text-xs text-ink-400">—</span>
                      )}
                      <span className="text-[13px] text-ink-400">{count} qiymət</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-pill overflow-hidden" style={{ background: 'var(--hairline)' }}>
                        <div
                          className="h-full rounded-pill transition-all duration-500"
                          style={{ width: `${barPct}%`, background: color }}
                        />
                      </div>
                      <span className="text-[13px] font-bold w-9 text-right flex-shrink-0 tabular-nums" style={{ color }}>
                        {avg != null ? (
                          <><CountUp to={Math.round(barPct)} duration={600} />%</>
                        ) : '—'}
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
              className="px-4 py-2 rounded-pill text-xs font-semibold whitespace-nowrap transition-all"
              style={
                !selectedSubject
                  ? { background: 'var(--brand-500)', color: '#fff' }
                  : { background: 'var(--surface)', color: 'var(--ink-600)', border: '1px solid var(--hairline)' }
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
                  className="px-4 py-2 rounded-pill text-xs font-semibold whitespace-nowrap transition-all"
                  style={
                    active
                      ? { background: 'var(--brand-500)', color: '#fff' }
                      : { background: 'var(--surface)', color: 'var(--ink-600)', border: '1px solid var(--hairline)' }
                  }
                >
                  {s.name}
                </button>
              )
            })}
          </div>

          {/* History table — calm data surface */}
          <div className="liquid-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="pastel-table w-full">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left">Tarix</th>
                    <th className="px-6 py-3 text-left">Fənn</th>
                    <th className="px-6 py-3 text-left">Qiymətləndirmə</th>
                    {isIb ? (
                      <>
                        <th className="px-4 py-3 text-center">A</th>
                        <th className="px-4 py-3 text-center">B</th>
                        <th className="px-4 py-3 text-center">C</th>
                        <th className="px-4 py-3 text-center">D</th>
                      </>
                    ) : (
                      <th className="px-6 py-3 text-center">Bal</th>
                    )}
                    <th className="px-6 py-3 text-left">Qeyd</th>
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
                        style={{
                          borderBottom: idx === arr.length - 1 ? 'none' : '1px solid var(--hairline)',
                          borderLeft: `3px solid ${gradeColor(normScore)}`,
                        }}
                      >
                        <td className="px-6 py-3.5 text-[13px] whitespace-nowrap text-ink-600 tabular-nums">
                          {fmtNumeric(g.date)}
                        </td>
                        <td className="px-6 py-3.5 text-[13px] font-semibold text-ink-900">
                          {g.subject?.name}
                        </td>
                        <td className="px-6 py-3.5 text-[13px] text-ink-600">
                          {g.assessment_title || '—'}
                        </td>
                        {isIb ? (
                          <>
                            <td className="px-4 py-3.5 text-center">{g.criterion_a != null && <GradeBadge score={g.criterion_a} />}</td>
                            <td className="px-4 py-3.5 text-center">{g.criterion_b != null && <GradeBadge score={g.criterion_b} />}</td>
                            <td className="px-4 py-3.5 text-center">{g.criterion_c != null && <GradeBadge score={g.criterion_c} />}</td>
                            <td className="px-4 py-3.5 text-center">{g.criterion_d != null && <GradeBadge score={g.criterion_d} />}</td>
                          </>
                        ) : (
                          <td className="px-6 py-3.5 text-center">
                            <GradeBadge score={normScore} />
                          </td>
                        )}
                        <td className="px-6 py-3.5 text-[13px] text-ink-600">{g.notes || '—'}</td>
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
