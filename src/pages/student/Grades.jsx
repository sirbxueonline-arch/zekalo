import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Minus, BookOpen, Award, BarChart2, Check } from 'lucide-react'
import { GradeBadge } from '../../components/ui/Badge'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { fmtNumeric } from '../../lib/dateUtils'

// ─── Pastel palette ──────────────────────────────────────────────────────────
const COLOR_PERI  = '#7c6ee0'
const COLOR_MINT  = '#5db8a3'
const COLOR_PEACH = '#e8a87c'
const COLOR_BLUE  = '#6b9dde'
const COLOR_ROSE  = '#ef6c6c'

// Subject accent rotation
const SUBJ_PALETTE = [
  { color: COLOR_PERI,  bg: 'rgba(124,110,224,0.16)', border: 'rgba(124,110,224,0.30)' },
  { color: COLOR_MINT,  bg: 'rgba(93,184,163,0.16)',  border: 'rgba(93,184,163,0.30)' },
  { color: COLOR_PEACH, bg: 'rgba(232,168,124,0.20)', border: 'rgba(232,168,124,0.35)' },
  { color: COLOR_BLUE,  bg: 'rgba(107,157,222,0.16)', border: 'rgba(107,157,222,0.30)' },
]

function subjectPalette(name = '') {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return SUBJ_PALETTE[Math.abs(h) % SUBJ_PALETTE.length]
}

// ─── GPA color helpers ──────────────────────────────────────────────────────
function gpaColor(avg) {
  if (avg >= 8.5) return COLOR_MINT
  if (avg >= 7)   return COLOR_BLUE
  if (avg >= 5)   return COLOR_PEACH
  return COLOR_ROSE
}

function gpaTone(avg) {
  if (avg >= 8.5) return { bg: 'rgba(93,184,163,0.16)',  border: 'rgba(93,184,163,0.32)',  color: '#2f7a64' }
  if (avg >= 7)   return { bg: 'rgba(107,157,222,0.16)', border: 'rgba(107,157,222,0.30)', color: '#2f5a8c' }
  if (avg >= 5)   return { bg: 'rgba(232,168,124,0.18)', border: 'rgba(232,168,124,0.32)', color: '#a25e2c' }
  return            { bg: 'rgba(239,108,108,0.14)', border: 'rgba(239,108,108,0.28)', color: '#b13838' }
}

// ─── Normalize score to /10 ──────────────────────────────────────────────────
function normalize(score, maxScore) {
  if (score == null) return null
  if (maxScore > 0) return (score / maxScore) * 10
  return score
}

// ─── Compute per-subject averages and trends ─────────────────────────────────
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
      <span className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: '#2f7a64' }}>
        <TrendingUp className="w-3.5 h-3.5" /> Yüksəlir
      </span>
    )
  if (trend === 'down')
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: '#b13838' }}>
        <TrendingDown className="w-3.5 h-3.5" /> Enir
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: '#94a3b8' }}>
      <Minus className="w-3.5 h-3.5" /> Sabit
    </span>
  )
}

// ─── Circular GPA badge ──────────────────────────────────────────────────────
function CircularGPA({ avg }) {
  const radius = 54
  const stroke = 8
  const normalizedRadius = radius - stroke / 2
  const circumference = normalizedRadius * 2 * Math.PI
  const pct = Math.min((avg / 10) * 100, 100)
  const strokeDashoffset = circumference - (pct / 100) * circumference
  const strokeColor = gpaColor(avg)

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={radius * 2} height={radius * 2} className="-rotate-90">
        <circle
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          fill="none"
          stroke="rgba(124,110,224,0.12)"
          strokeWidth={stroke}
        />
        <circle
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span style={{ fontSize: 28, fontWeight: 800, color: strokeColor, lineHeight: 1, letterSpacing: '-0.02em' }}>
          {avg.toString().replace('.', ',')}
        </span>
        <span className="text-xs" style={{ color: '#64748b', fontWeight: 500 }}>/ 10</span>
      </div>
    </div>
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
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 600,
        background: active
          ? 'linear-gradient(135deg, rgba(124,110,224,0.18) 0%, rgba(93,184,163,0.18) 100%)'
          : 'rgba(255,255,255,0.55)',
        border: active ? '1px solid rgba(124,110,224,0.5)' : '1px solid rgba(124,110,224,0.18)',
        color: active ? '#5448a8' : '#475569',
        backdropFilter: 'blur(12px)',
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
  const [loading, setLoading]               = useState(true)
  const [grades, setGrades]                 = useState([])
  const [error, setError]                   = useState(null)
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
        <h1 style={{ fontSize: 36, fontWeight: 800, color: '#1a1a2e', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          <span className="pastel-text">Qiymətlərim</span>
        </h1>
        <EmptyState
          icon={BookOpen}
          title="Hələ qiymət yoxdur"
          description="Müəlliminiz ilk qiyməti daxil etdikdə burada görünəcək. Səbirli olun!"
        />
      </div>
    )
  }

  // Derived data
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

  // Unique subjects
  const uniqueSubjects = []
  const seen = new Set()
  grades.forEach(g => {
    if (g.subject && !seen.has(g.subject.id)) {
      seen.add(g.subject.id)
      uniqueSubjects.push(g.subject)
    }
  })

  const overallTone = gpaTone(overallAvg)

  return (
    <div className="space-y-8">
      <h1 style={{ fontSize: 36, fontWeight: 800, color: '#1a1a2e', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
        <span className="pastel-text">Qiymətlərim</span>
      </h1>

      {/* GPA Hero Card */}
      <div className="liquid-card p-8">
        <div className="flex flex-col sm:flex-row items-center gap-8">
          <div className="flex flex-col items-center gap-3">
            <CircularGPA avg={overallAvg} />
            <div
              className="flex items-center gap-2"
              style={{
                padding: '5px 14px',
                borderRadius: 999,
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

          <div className="flex-1 w-full space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div
                style={{
                  padding: 16,
                  borderRadius: 16,
                  background: 'rgba(124,110,224,0.08)',
                  border: '1px solid rgba(124,110,224,0.16)',
                }}
              >
                <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Fənn sayı
                </p>
                <p style={{ fontSize: 28, fontWeight: 800, color: '#1a1a2e', marginTop: 4, lineHeight: 1.1 }}>
                  {subjectStats.length}
                </p>
              </div>
              <div
                style={{
                  padding: 16,
                  borderRadius: 16,
                  background: 'rgba(93,184,163,0.08)',
                  border: '1px solid rgba(93,184,163,0.16)',
                }}
              >
                <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Qiymət sayı
                </p>
                <p style={{ fontSize: 28, fontWeight: 800, color: '#1a1a2e', marginTop: 4, lineHeight: 1.1 }}>
                  {grades.length}
                </p>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5" style={{ color: '#64748b' }}>
                <span>0</span>
                <span>5</span>
                <span>10</span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: 12,
                  borderRadius: 999,
                  background: 'rgba(124,110,224,0.10)',
                  overflow: 'hidden',
                }}
              >
                <div
                  className="transition-all duration-700"
                  style={{
                    height: '100%',
                    borderRadius: 999,
                    width: `${Math.min((overallAvg / 10) * 100, 100)}%`,
                    background: `linear-gradient(90deg, ${gpaColor(overallAvg)} 0%, ${gpaColor(overallAvg)}cc 100%)`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subject cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjectStats.map(({ subject, avg, count, trend }) => {
          const isActive = selectedSubject === subject.id
          const subjPal = subjectPalette(subject.name)
          const tone = gpaTone(avg)
          return (
            <button
              key={subject.id}
              onClick={() => setSelectedSubject(isActive ? null : subject.id)}
              className="liquid-card pastel-hover text-left transition-all"
              style={{
                padding: 0,
                overflow: 'hidden',
                cursor: 'pointer',
                outline: 'none',
                border: isActive ? '1px solid rgba(124,110,224,0.55)' : undefined,
              }}
            >
              <div style={{ height: 4, width: '100%', background: subjPal.color }} />

              <div className="p-5 space-y-3">
                <p style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e', lineHeight: 1.3 }}>
                  {subject.name}
                </p>

                <div className="flex items-end justify-between">
                  <span style={{ fontSize: 36, fontWeight: 800, color: gpaColor(avg), lineHeight: 1, letterSpacing: '-0.02em' }}>
                    {avg.toString().replace('.', ',')}
                  </span>
                  <TrendIcon trend={trend} />
                </div>

                <div
                  style={{
                    height: 8,
                    borderRadius: 999,
                    background: 'rgba(124,110,224,0.08)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    className="transition-all duration-500"
                    style={{
                      height: '100%',
                      borderRadius: 999,
                      width: `${Math.min((avg / 10) * 100, 100)}%`,
                      background: gpaColor(avg),
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '3px 10px',
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 700,
                      background: tone.bg,
                      color: tone.color,
                      border: `1px solid ${tone.border}`,
                    }}
                  >
                    <BarChart2 className="w-3 h-3" />
                    {count} qiymət
                  </span>
                  {isActive && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: '#5448a8',
                        background: 'rgba(124,110,224,0.16)',
                        padding: '3px 10px',
                        borderRadius: 999,
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

      {/* Subject filter pills */}
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

      {/* Grade history table */}
      <div className="liquid-card overflow-hidden" style={{ padding: 0 }}>
        <div
          className="px-6 py-4 flex items-center gap-2"
          style={{ borderBottom: '1px solid rgba(124,110,224,0.10)' }}
        >
          <BarChart2 className="w-4 h-4" style={{ color: COLOR_PERI }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e' }}>
            Qiymət Tarixi
            {selectedSubject && (
              <span className="ml-2" style={{ fontWeight: 400, color: '#64748b' }}>
                — {uniqueSubjects.find(s => s.id === selectedSubject)?.name}
              </span>
            )}
          </span>
          <span className="ml-auto text-xs" style={{ color: '#64748b' }}>{filtered.length} qeyd</span>
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
                    <td style={{ color: '#475569', whiteSpace: 'nowrap' }}>{fmtNumeric(g.date)}</td>
                    <td style={{ fontWeight: 600, color: '#1a1a2e', whiteSpace: 'nowrap' }}>
                      {g.subject?.name}
                    </td>
                    <td style={{ color: '#475569' }}>{g.assessment_title || '—'}</td>
                    <td style={{ textAlign: 'center' }}>
                      {norm != null ? (
                        <div className="flex flex-col items-center gap-1.5">
                          <GradeBadge score={norm} />
                          <div
                            style={{
                              width: 64,
                              height: 6,
                              borderRadius: 999,
                              background: 'rgba(124,110,224,0.10)',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                height: '100%',
                                borderRadius: 999,
                                width: `${Math.min((norm / 10) * 100, 100)}%`,
                                background: gpaColor(norm),
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: '#cbd5e1', fontSize: 12 }}>—</span>
                      )}
                    </td>
                    <td style={{ color: '#64748b' }}>{g.notes || '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-12 flex flex-col items-center gap-2" style={{ color: '#64748b' }}>
            <BookOpen className="w-8 h-8" style={{ color: '#7c6ee0' }} />
            <p className="text-sm">Bu fənn üçün qiymət tapılmadı.</p>
          </div>
        )}
      </div>
    </div>
  )
}
