import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Minus, BookOpen, Award, BarChart2, Check, Star } from 'lucide-react'
import { GradeBadge } from '../../components/ui/Badge'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import LevelRing from '../../components/ui/LevelRing'
import CountUp from '../../components/ui/CountUp'
import StatCard from '../../components/ui/StatCard'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { fmtNumeric } from '../../lib/dateUtils'

// ─── GPA semantic color + tone (color = meaning-bearing status only) ─────────
function gpaColor(avg) {
  if (avg >= 8.5) return 'var(--mint)'
  if (avg >= 7)   return 'var(--brand-500)'
  if (avg >= 5)   return 'var(--sun)'
  return 'var(--coral)'
}

function gpaTone(avg) {
  if (avg >= 8.5) return { bg: 'rgba(31,168,85,0.10)',   border: 'rgba(31,168,85,0.26)',   color: '#15803D' }
  if (avg >= 7)   return { bg: 'var(--brand-50)',        border: 'var(--brand-200)',       color: 'var(--brand-600)' }
  if (avg >= 5)   return { bg: 'rgba(234,179,8,0.12)',   border: 'rgba(234,179,8,0.30)',   color: '#B45309' }
  return           { bg: 'rgba(244,103,126,0.10)', border: 'rgba(244,103,126,0.26)', color: '#B91C1C' }
}

// ─── Normalize score → /10 ───────────────────────────────────────────────────
function normalize(score, maxScore) {
  if (score == null) return null
  if (maxScore > 0) return (score / maxScore) * 10
  return score
}

// ─── Compute per-subject stats ───────────────────────────────────────────────
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
    let trend = 'flat'
    if (normed.length >= 2) {
      if (normed[0] > normed[1]) trend = 'up'
      else if (normed[0] < normed[1]) trend = 'down'
    }
    return { subject, avg, count: normed.length, trend }
  })
}

// ─── Trend pill ──────────────────────────────────────────────────────────────
function TrendIcon({ trend }) {
  if (trend === 'up')
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: '#15803D' }}>
        <TrendingUp className="w-3.5 h-3.5" /> Yüksəlir
      </span>
    )
  if (trend === 'down')
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: '#B91C1C' }}>
        <TrendingDown className="w-3.5 h-3.5" /> Enir
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--ink-400)' }}>
      <Minus className="w-3.5 h-3.5" /> Sabit
    </span>
  )
}

// ─── Filter pill ─────────────────────────────────────────────────────────────
function FilterPill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center transition-all whitespace-nowrap flex-shrink-0"
      style={{
        padding: '7px 16px',
        borderRadius: 9999,
        fontSize: 13,
        fontWeight: 600,
        background: active ? 'var(--brand-100)' : 'var(--surface)',
        border: active ? '1.5px solid var(--brand-400)' : '1px solid var(--hairline-strong)',
        color: active ? 'var(--brand-600)' : 'var(--ink-600)',
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  )
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function StudentGrades() {
  const { profile } = useAuth()
  const [loading, setLoading]                 = useState(true)
  const [grades, setGrades]                   = useState([])
  const [error, setError]                     = useState(null)
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
      <div className="space-y-6">
        <h1
          className="font-display"
          style={{ fontSize: 32, fontWeight: 800, color: 'var(--ink-900)', letterSpacing: '-0.02em', lineHeight: 1.12 }}
        >
          Qiymətlərim
        </h1>
        <EmptyState
          pose="reading"
          title="Hələ qiymət yoxdur"
          description="Müəlliminiz ilk qiyməti daxil etdikdə burada görünəcək. Səbirli olun!"
        />
      </div>
    )
  }

  // ── Derived data ─────────────────────────────────────────────────────────
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

  const uniqueSubjects = []
  const seen = new Set()
  grades.forEach(g => {
    if (g.subject && !seen.has(g.subject.id)) {
      seen.add(g.subject.id)
      uniqueSubjects.push(g.subject)
    }
  })

  const overallTone = gpaTone(overallAvg)
  // Top subject by avg
  const topSubject = subjectStats.length > 0
    ? subjectStats.reduce((a, b) => (b.avg > a.avg ? b : a))
    : null

  return (
    <div className="space-y-8">

      {/* ── Page header ── */}
      <div className="flex items-center gap-3">
        <div
          className="icon-chip icon-chip-periwinkle"
          style={{ width: 44, height: 44 }}
        >
          <BarChart2 className="w-5 h-5" />
        </div>
        <h1
          className="font-display"
          style={{ fontSize: 32, fontWeight: 800, color: 'var(--ink-900)', letterSpacing: '-0.02em', lineHeight: 1.12 }}
        >
          Qiymətlərim
        </h1>
      </div>

      {/* ── GPA hero card — playful chrome ring, calm data KPIs ── */}
      <div className="liquid-card p-8">
        <div className="flex flex-col sm:flex-row items-center gap-8">

          {/* LevelRing GPA display */}
          <div className="flex flex-col items-center gap-3 flex-shrink-0">
            <LevelRing
              value={overallAvg}
              max={10}
              size={130}
              stroke={11}
              color={gpaColor(overallAvg)}
              center={
                <div className="flex flex-col items-center leading-none">
                  <span
                    className="font-display font-extrabold tabular-nums"
                    style={{ fontSize: 34, color: gpaColor(overallAvg) }}
                  >
                    <CountUp to={overallAvg} decimals={1} />
                  </span>
                  <span className="text-xs font-medium mt-0.5" style={{ color: 'var(--ink-400)' }}>
                    / 10
                  </span>
                </div>
              }
            />
            <div
              className="flex items-center gap-1.5"
              style={{
                padding: '5px 14px',
                borderRadius: 9999,
                background: overallTone.bg,
                border: `1px solid ${overallTone.border}`,
              }}
            >
              <Award className="w-3.5 h-3.5" style={{ color: overallTone.color }} />
              <span className="text-xs font-bold" style={{ color: overallTone.color }}>
                Ümumi Ortalama
              </span>
            </div>
          </div>

          {/* Vertical divider */}
          <div className="hidden sm:block w-px self-stretch" style={{ background: 'var(--hairline)' }} />

          {/* KPI column */}
          <div className="flex-1 w-full space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                label="Fənn sayı"
                value={subjectStats.length}
                icon={BarChart2}
                tone="periwinkle"
              />
              <StatCard
                label="Qiymət sayı"
                value={grades.length}
                icon={BookOpen}
                tone="mint"
              />
            </div>

            {/* Best subject chip */}
            {topSubject && (
              <div
                className="flex items-center gap-2 px-4 py-3"
                style={{
                  background: 'rgba(234,179,8,0.10)',
                  border: '1px solid rgba(234,179,8,0.28)',
                  borderRadius: 12,
                }}
              >
                <Star className="w-4 h-4" style={{ color: 'var(--sun)' }} />
                <span className="text-xs font-semibold" style={{ color: '#B45309' }}>
                  Ən yaxşı fənn:
                </span>
                <span className="text-xs font-medium" style={{ color: 'var(--ink-900)' }}>
                  {topSubject.subject.name}
                </span>
                <span
                  className="ml-auto font-display font-extrabold tabular-nums"
                  style={{ fontSize: 18, color: 'var(--sun)' }}
                >
                  {topSubject.avg}
                </span>
              </div>
            )}

            {/* Overall GPA track bar */}
            <div>
              <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--ink-400)' }}>
                <span>0</span>
                <span>5</span>
                <span>10</span>
              </div>
              <div className="xp-track" style={{ height: 12 }}>
                <div
                  className="xp-fill transition-all duration-700"
                  style={{
                    width: `${Math.min((overallAvg / 10) * 100, 100)}%`,
                    background: `linear-gradient(90deg, ${gpaColor(overallAvg)}, ${gpaColor(overallAvg)}bb)`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Subject cards grid — colored top bar + mini bar ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjectStats.map(({ subject, avg, count, trend }) => {
          const isActive = selectedSubject === subject.id
          const statusColor = gpaColor(avg)
          const tone = gpaTone(avg)
          return (
            <button
              key={subject.id}
              onClick={() => setSelectedSubject(isActive ? null : subject.id)}
              className="liquid-card text-left transition-all"
              style={{
                padding: 0,
                overflow: 'hidden',
                cursor: 'pointer',
                outline: 'none',
                border: isActive ? '1.5px solid var(--brand-500)' : undefined,
                transform: isActive ? 'translateY(-2px)' : undefined,
                boxShadow: isActive ? 'var(--shadow-soft-lg)' : undefined,
              }}
            >
              {/* Performance status top stripe (green/brand/amber/coral) */}
              <div style={{ height: 4, width: '100%', background: statusColor }} />

              <div className="p-5 space-y-3">
                <p className="font-semibold" style={{ fontSize: 14, color: 'var(--ink-900)', lineHeight: 1.3 }}>
                  {subject.name}
                </p>

                <div className="flex items-end justify-between">
                  <span
                    className="font-display font-extrabold tabular-nums"
                    style={{ fontSize: 38, color: gpaColor(avg), lineHeight: 1, letterSpacing: '-0.02em' }}
                  >
                    <CountUp to={avg} decimals={1} />
                  </span>
                  <TrendIcon trend={trend} />
                </div>

                {/* Mini progress bar */}
                <div className="xp-track" style={{ height: 8 }}>
                  <div
                    className="transition-all duration-500"
                    style={{
                      height: '100%',
                      borderRadius: 9999,
                      width: `${Math.min((avg / 10) * 100, 100)}%`,
                      background: gpaColor(avg),
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '3px 10px', borderRadius: 9999,
                      fontSize: 11, fontWeight: 700,
                      background: tone.bg, color: tone.color, border: `1px solid ${tone.border}`,
                    }}
                  >
                    <BarChart2 className="w-3 h-3" />
                    {count} qiymət
                  </span>
                  {isActive && (
                    <span
                      style={{
                        fontSize: 10, fontWeight: 700, color: 'var(--brand-600)',
                        background: 'var(--brand-100)', padding: '3px 10px', borderRadius: 9999,
                      }}
                    >
                      Seçildi
                    </span>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* ── Subject filter pills ── */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        <FilterPill active={!selectedSubject} onClick={() => setSelectedSubject(null)}>
          {!selectedSubject && <Check className="w-3 h-3 mr-1" />}
          Hamısı
        </FilterPill>
        {uniqueSubjects.map(s => (
          <FilterPill
            key={s.id}
            active={selectedSubject === s.id}
            onClick={() => setSelectedSubject(selectedSubject === s.id ? null : s.id)}
          >
            {selectedSubject === s.id && <Check className="w-3 h-3 mr-1" />}
            {s.name}
          </FilterPill>
        ))}
      </div>

      {/* ── Grade history table — calm data surface ── */}
      <div className="liquid-card overflow-hidden" style={{ padding: 0 }}>
        <div
          className="px-6 py-4 flex items-center gap-2"
          style={{ borderBottom: '1px solid var(--hairline)' }}
        >
          <div className="icon-chip icon-chip-periwinkle" style={{ width: 32, height: 32 }}>
            <BarChart2 className="w-4 h-4" />
          </div>
          <span className="font-semibold" style={{ fontSize: 14, color: 'var(--ink-900)' }}>
            Qiymət Tarixi
            {selectedSubject && (
              <span className="ml-2 font-normal" style={{ color: 'var(--ink-400)' }}>
                — {uniqueSubjects.find(s => s.id === selectedSubject)?.name}
              </span>
            )}
          </span>
          <span className="ml-auto text-xs" style={{ color: 'var(--ink-400)' }}>
            {filtered.length} qeyd
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="pastel-table">
            <thead>
              <tr>
                <th>Tarix</th>
                <th>Fənn</th>
                <th>Qiymətləndirmə</th>
                <th style={{ textAlign: 'center' }}>Bal</th>
                <th>Qeyd</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(g => {
                const _n = g.score != null ? normalize(g.score, g.max_score) : null
                const norm = _n != null ? Math.round(_n * 10) / 10 : null
                return (
                  <tr key={g.id}>
                    <td style={{ color: 'var(--ink-600)', whiteSpace: 'nowrap' }}>
                      {fmtNumeric(g.date)}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--ink-900)', whiteSpace: 'nowrap' }}>
                      {g.subject?.name}
                    </td>
                    <td style={{ color: 'var(--ink-600)' }}>{g.assessment_title || '—'}</td>
                    <td style={{ textAlign: 'center' }}>
                      {norm != null ? (
                        <div className="flex flex-col items-center gap-1.5">
                          <GradeBadge score={norm} />
                          <div
                            style={{
                              width: 64, height: 6, borderRadius: 9999,
                              background: 'var(--hairline)', overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                height: '100%', borderRadius: 9999,
                                width: `${Math.min((norm / 10) * 100, 100)}%`,
                                background: gpaColor(norm),
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--ink-400)', fontSize: 12 }}>—</span>
                      )}
                    </td>
                    <td style={{ color: 'var(--ink-600)' }}>{g.notes || '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-10 flex flex-col items-center gap-2" style={{ color: 'var(--ink-400)' }}>
            <div className="icon-chip icon-chip-periwinkle" style={{ width: 44, height: 44 }}>
              <BookOpen className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--ink-400)' }}>
              Bu fənn üçün qiymət tapılmadı.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
