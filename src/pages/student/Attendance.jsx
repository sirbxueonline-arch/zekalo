import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { StatusBadge } from '../../components/ui/Badge'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import LevelRing from '../../components/ui/LevelRing'
import CountUp from '../../components/ui/CountUp'
import StatCard from '../../components/ui/StatCard'
import { Calendar, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { fmtNumeric } from '../../lib/dateUtils'

const MONTH_NAMES = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun',
  'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr',
]

const DAY_HEADERS = ['B.e', 'Ç.a', 'Ç', 'C.a', 'C', 'Ş', 'B']

// ─── Attendance ring ──────────────────────────────────────────────────────────
function AttendanceRing({ pct }) {
  const ringColor =
    pct >= 85 ? 'var(--mint)'
    : pct >= 70 ? 'var(--brand-500)'
    : pct >= 50 ? 'var(--sun)'
    : 'var(--coral)'

  const label =
    pct >= 85 ? 'Mükəmməl'
    : pct >= 70 ? 'Yaxşı'
    : pct >= 50 ? 'Orta'
    : 'Aşağı'

  const labelBg =
    pct >= 85 ? 'rgba(31,168,85,0.10)'
    : pct >= 70 ? 'var(--brand-50)'
    : pct >= 50 ? 'rgba(234,179,8,0.12)'
    : 'rgba(244,103,126,0.10)'

  const labelBorder =
    pct >= 85 ? 'rgba(31,168,85,0.26)'
    : pct >= 70 ? 'var(--brand-200)'
    : pct >= 50 ? 'rgba(234,179,8,0.28)'
    : 'rgba(244,103,126,0.26)'

  return (
    <div className="flex flex-col items-center gap-3">
      <LevelRing
        value={pct}
        max={100}
        size={140}
        stroke={11}
        color={ringColor}
        center={
          <div className="flex flex-col items-center leading-none">
            <span
              className="font-display font-extrabold tabular-nums"
              style={{ fontSize: 34, color: ringColor }}
            >
              <CountUp to={pct} suffix="%" />
            </span>
            <span className="text-xs font-medium mt-1" style={{ color: 'var(--ink-400)' }}>
              iştirak
            </span>
          </div>
        }
      />
      <span
        className="font-semibold"
        style={{
          padding: '5px 18px', borderRadius: 9999,
          fontSize: 12, fontWeight: 700,
          background: labelBg, color: ringColor, border: `1px solid ${labelBorder}`,
        }}
      >
        {label}
      </span>
    </div>
  )
}

// ─── Calendar day cell style ──────────────────────────────────────────────────
function dayCellStyle(cell, todayStr) {
  if (!cell) return {}
  const isToday = cell.dateStr === todayStr
  const base = {
    borderRadius: 12,
    aspectRatio: '1 / 1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 600,
    transition: 'all .2s var(--ease-out-quint)',
    cursor: 'default',
    position: 'relative',
  }
  let extra = {}
  if (cell.status === 'present')
    extra = { background: 'var(--mint)', color: '#fff', fontWeight: 700 }
  else if (cell.status === 'absent')
    extra = { background: 'var(--coral)', color: '#fff', fontWeight: 700 }
  else if (cell.status === 'late')
    extra = { background: 'var(--sun)', color: '#fff', fontWeight: 700 }
  else
    extra = { color: 'var(--ink-400)' }

  if (isToday)
    extra = { ...extra, outline: '2.5px solid var(--brand-500)', outlineOffset: '2px' }

  return { ...base, ...extra }
}

export default function StudentAttendance() {
  const { profile } = useAuth()
  const [loading, setLoading]       = useState(true)
  const [records, setRecords]       = useState([])
  const [fetchError, setFetchError] = useState(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    if (!profile) return
    supabase
      .from('attendance')
      .select('*, class:classes(name)')
      .eq('student_id', profile.id)
      .order('date', { ascending: false })
      .limit(500)
      .then(({ data, error }) => {
        if (error) {
          console.error('Attendance fetch error:', error)
          setFetchError('Davamiyyət məlumatları yüklənmədi. Səhifəni yeniləyin.')
        }
        setRecords(data || [])
        setLoading(false)
      })
  }, [profile])

  if (loading) return <PageSpinner />

  if (fetchError)
    return (
      <EmptyState
        icon={Calendar}
        title="Xəta baş verdi"
        description={fetchError}
      />
    )

  if (records.length === 0)
    return (
      <div className="space-y-6">
        <h1
          className="font-display"
          style={{ fontSize: 32, fontWeight: 800, color: 'var(--ink-900)', letterSpacing: '-0.02em', lineHeight: 1.12 }}
        >
          Davamiyyət
        </h1>
        <EmptyState
          pose="sleeping"
          title="Davamiyyət yoxdur"
          description="Hələ heç bir davamiyyət qeydi tapılmadı. Müəlliminiz davamiyyət qeyd etdikdə burada görünəcək."
        />
      </div>
    )

  const present = records.filter(r => r.status === 'present').length
  const absent  = records.filter(r => r.status === 'absent').length
  const late    = records.filter(r => r.status === 'late').length
  const pct     = records.length ? Math.round((present / records.length) * 100) : 0

  // ── Calendar logic ────────────────────────────────────────────────────────
  const year     = currentMonth.getFullYear()
  const month    = currentMonth.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay  = new Date(year, month + 1, 0)
  const startDow = (firstDay.getDay() + 6) % 7   // Monday-based

  const recordMap = {}
  records.forEach(r => { recordMap[r.date] = r.status })

  const today    = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const calendarDays = []
  for (let i = 0; i < startDow; i++) calendarDays.push(null)
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    calendarDays.push({ day: d, dateStr, status: recordMap[dateStr] || null })
  }

  const missedRecords = records.filter(r => r.status !== 'present')

  return (
    <div className="space-y-8">

      {/* ── Page header ── */}
      <div className="flex items-center gap-3">
        <div className="icon-chip icon-chip-mint" style={{ width: 44, height: 44 }}>
          <Calendar className="w-5 h-5" />
        </div>
        <h1
          className="font-display"
          style={{ fontSize: 32, fontWeight: 800, color: 'var(--ink-900)', letterSpacing: '-0.02em', lineHeight: 1.12 }}
        >
          Davamiyyət
        </h1>
      </div>

      {/* ── Hero card: Ring + Stat cards ── */}
      <div className="liquid-card p-8">
        <div className="flex flex-col sm:flex-row items-center gap-8">
          <AttendanceRing pct={pct} />

          <div className="hidden sm:block w-px self-stretch" style={{ background: 'var(--hairline)' }} />

          <div className="flex-1 grid grid-cols-1 gap-3 w-full sm:w-auto">
            <StatCard
              label="İştirak"
              value={<CountUp to={present} />}
              icon={CheckCircle}
              tone="mint"
            />
            <StatCard
              label="Qayıb"
              value={<CountUp to={absent} />}
              icon={XCircle}
              tone="coral"
            />
            <StatCard
              label="Gecikmə"
              value={<CountUp to={late} />}
              icon={Clock}
              tone="peach"
            />
          </div>
        </div>
      </div>

      {/* ── Monthly calendar ── */}
      <div className="liquid-card p-6">

        {/* Month navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentMonth(new Date(year, month - 1))}
            aria-label="Əvvəlki ay"
            className="flex items-center justify-center transition-all"
            style={{
              width: 38, height: 38, borderRadius: 12,
              background: 'var(--brand-50)',
              color: 'var(--brand-500)',
              border: '1.5px solid var(--brand-200)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-100)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--brand-50)' }}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <h3
            className="font-semibold"
            style={{ fontSize: 16, color: 'var(--ink-900)' }}
          >
            {MONTH_NAMES[month]} {year}
          </h3>

          <button
            onClick={() => setCurrentMonth(new Date(year, month + 1))}
            aria-label="Növbəti ay"
            className="flex items-center justify-center transition-all"
            style={{
              width: 38, height: 38, borderRadius: 12,
              background: 'var(--brand-50)',
              color: 'var(--brand-500)',
              border: '1.5px solid var(--brand-200)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-100)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--brand-50)' }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAY_HEADERS.map(d => (
            <div
              key={d}
              className="text-xs text-center py-2 font-semibold uppercase tracking-wider"
              style={{ color: 'var(--ink-400)' }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {calendarDays.map((cell, i) => (
            <div key={i} style={dayCellStyle(cell, todayStr)}>
              {cell?.day}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div
          className="flex items-center gap-5 mt-5 pt-4 flex-wrap"
          style={{ borderTop: '1px solid var(--hairline)' }}
        >
          {[
            { color: 'var(--mint)',  label: 'İştirak' },
            { color: 'var(--coral)', label: 'Qayıb' },
            { color: 'var(--sun)',   label: 'Gecikmə' },
          ].map(({ color, label }) => (
            <span key={label} className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--ink-600)' }}>
              <span style={{ width: 14, height: 14, borderRadius: 999, background: color, display: 'inline-block' }} />
              {label}
            </span>
          ))}
          <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--ink-400)' }}>
            <span style={{ width: 14, height: 14, borderRadius: 999, outline: '2px solid var(--brand-500)', display: 'inline-block' }} />
            Bu gün
          </span>
        </div>
      </div>

      {/* ── Missed days log — calm data surface ── */}
      <div className="liquid-card overflow-hidden" style={{ padding: 0 }}>
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--hairline)' }}
        >
          <div className="flex items-center gap-2">
            <div className="icon-chip icon-chip-coral" style={{ width: 30, height: 30 }}>
              <XCircle className="w-3.5 h-3.5" />
            </div>
            <h2 className="font-semibold" style={{ fontSize: 15, color: 'var(--ink-900)' }}>
              Buraxılmış dərslər
            </h2>
          </div>
          {missedRecords.length > 0 && (
            <span className="text-xs" style={{ color: 'var(--ink-400)' }}>
              {missedRecords.length} qeyd
            </span>
          )}
        </div>

        {missedRecords.length === 0 ? (
          <div className="px-6 py-10 flex flex-col items-center gap-3 text-center">
            <div className="icon-chip icon-chip-mint" style={{ width: 48, height: 48 }}>
              <CheckCircle className="w-6 h-6" />
            </div>
            <p className="font-semibold" style={{ fontSize: 15, color: 'var(--ink-900)' }}>
              Buraxılmış dərs yoxdur
            </p>
            <p className="text-xs" style={{ color: 'var(--ink-400)' }}>
              Əla! Bütün dərslərə qatılmısınız.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="pastel-table">
              <thead>
                <tr>
                  <th>Tarix</th>
                  <th>Sinif</th>
                  <th>Status</th>
                  <th>Qeyd</th>
                </tr>
              </thead>
              <tbody>
                {missedRecords.map(r => (
                  <tr key={r.id}>
                    <td style={{ color: 'var(--ink-600)', whiteSpace: 'nowrap' }}>
                      {fmtNumeric(r.date)}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--ink-900)' }}>
                      {r.class?.name || '—'}
                    </td>
                    <td>
                      <StatusBadge status={r.status} />
                    </td>
                    <td style={{ color: 'var(--ink-600)' }}>{r.note || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
