import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { StatusBadge } from '../../components/ui/Badge'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import { Calendar, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { fmtNumeric } from '../../lib/dateUtils'

const MONTH_NAMES = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun',
  'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr',
]

const DAY_HEADERS = ['B.e', 'Ç.a', 'Ç', 'C.a', 'C', 'Ş', 'B']

// Pastel palette
const COLOR_MINT  = '#5db8a3'
const COLOR_PERI  = '#7c6ee0'
const COLOR_PEACH = '#e8a87c'
const COLOR_ROSE  = '#ef6c6c'

// ─── SVG Ring percentage display ─────────────────────────────────────────────
function AttendanceRing({ pct }) {
  const radius = 70
  const stroke = 10
  const normalizedRadius = radius - stroke / 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (pct / 100) * circumference

  const ringColor = pct >= 85 ? COLOR_MINT : pct >= 70 ? COLOR_PERI : pct >= 50 ? COLOR_PEACH : COLOR_ROSE
  const label    = pct >= 85 ? 'Mükəmməl' : pct >= 70 ? 'Yaxşı' : pct >= 50 ? 'Orta' : 'Aşağı'

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative inline-flex items-center justify-center">
        <svg width={radius * 2} height={radius * 2} className="-rotate-90">
          {/* Background track */}
          <circle
            cx={radius}
            cy={radius}
            r={normalizedRadius}
            fill="none"
            stroke="rgba(124,110,224,0.12)"
            strokeWidth={stroke}
          />
          {/* Progress arc */}
          <circle
            cx={radius}
            cy={radius}
            r={normalizedRadius}
            fill="none"
            stroke={ringColor}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span style={{ fontSize: 36, fontWeight: 800, color: ringColor, lineHeight: 1, letterSpacing: '-0.02em' }}>
            {pct}%
          </span>
          <span className="text-xs mt-0.5" style={{ color: '#64748b', fontWeight: 500 }}>iştirak</span>
        </div>
      </div>
      <span
        style={{
          padding: '5px 14px',
          borderRadius: 999,
          fontSize: 12,
          fontWeight: 700,
          background: `${ringColor}22`,
          color: ringColor,
          border: `1px solid ${ringColor}55`,
        }}
      >
        {label}
      </span>
    </div>
  )
}

export default function StudentAttendance() {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [records, setRecords] = useState([])
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
        <h1 style={{ fontSize: 36, fontWeight: 800, color: '#1a1a2e', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          <span className="pastel-text">Davamiyyət</span>
        </h1>
        <EmptyState
          icon={Calendar}
          title="Davamiyyət yoxdur"
          description="Hələ heç bir davamiyyət qeydi tapılmadı. Müəlliminiz davamiyyət qeyd etdikdə burada görünəcək."
        />
      </div>
    )

  const present = records.filter(r => r.status === 'present').length
  const absent  = records.filter(r => r.status === 'absent').length
  const late    = records.filter(r => r.status === 'late').length
  const pct     = records.length ? Math.round((present / records.length) * 100) : 0

  // Calendar logic
  const year     = currentMonth.getFullYear()
  const month    = currentMonth.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay  = new Date(year, month + 1, 0)
  // Monday-based week (0=Mon … 6=Sun)
  const startDow = (firstDay.getDay() + 6) % 7

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

  function dayCellStyle(cell) {
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
      transition: 'all .25s cubic-bezier(.22,1,.36,1)',
      cursor: 'default',
      position: 'relative',
    }
    let extra = {}
    if (cell.status === 'present')      extra = { background: COLOR_MINT,  color: '#fff', fontWeight: 700, boxShadow: '0 2px 6px rgba(93,184,163,0.25)' }
    else if (cell.status === 'absent')  extra = { background: COLOR_ROSE,  color: '#fff', fontWeight: 700, boxShadow: '0 2px 6px rgba(239,108,108,0.25)' }
    else if (cell.status === 'late')    extra = { background: COLOR_PEACH, color: '#fff', fontWeight: 700, boxShadow: '0 2px 6px rgba(232,168,124,0.25)' }
    else                                 extra = { color: '#94a3b8' }
    if (isToday) extra = { ...extra, boxShadow: `0 0 0 2px ${COLOR_PERI}, 0 0 0 4px #fff, ${extra.boxShadow || ''}` }
    return { ...base, ...extra }
  }

  // Non-present records for the log, sorted by date desc
  const missedRecords = records.filter(r => r.status !== 'present')

  const StatPill = ({ icon: Icon, color, count, label }) => (
    <div
      className="flex items-center justify-between"
      style={{
        padding: '14px 18px',
        borderRadius: 16,
        background: `${color}14`,
        border: `1px solid ${color}33`,
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{ width: 36, height: 36, borderRadius: 12, background: color }}
        >
          <Icon className="w-4 h-4 text-white" />
        </div>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e' }}>{label}</span>
      </div>
      <span style={{ fontSize: 22, fontWeight: 800, color, letterSpacing: '-0.01em' }}>
        {count} <span style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}>gün</span>
      </span>
    </div>
  )

  return (
    <div className="space-y-8">

      {/* Page header */}
      <h1 style={{ fontSize: 36, fontWeight: 800, color: '#1a1a2e', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
        <span className="pastel-text">Davamiyyət</span>
      </h1>

      {/* Hero: Ring + Stats side-by-side */}
      <div className="liquid-card p-8">
        <div className="flex flex-col sm:flex-row items-center gap-8">
          <AttendanceRing pct={pct} />

          <div className="hidden sm:block w-px h-32" style={{ background: 'rgba(124,110,224,0.15)' }} />

          <div className="flex-1 grid grid-cols-1 gap-3 w-full sm:w-auto">
            <StatPill icon={CheckCircle} color={COLOR_MINT}  count={present} label="İştirak" />
            <StatPill icon={XCircle}     color={COLOR_ROSE}  count={absent}  label="Qayıb" />
            <StatPill icon={Clock}       color={COLOR_PEACH} count={late}    label="Gecikmə" />
          </div>
        </div>
      </div>

      {/* Monthly calendar */}
      <div className="liquid-card p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentMonth(new Date(year, month - 1))}
            className="flex items-center justify-center transition-all"
            style={{
              width: 36, height: 36, borderRadius: 999,
              background: 'rgba(124,110,224,0.08)',
              color: '#7c6ee0',
              border: '1px solid rgba(124,110,224,0.18)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,110,224,0.15)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(124,110,224,0.08)' }}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e' }}>
            {MONTH_NAMES[month]} {year}
          </h3>
          <button
            onClick={() => setCurrentMonth(new Date(year, month + 1))}
            className="flex items-center justify-center transition-all"
            style={{
              width: 36, height: 36, borderRadius: 999,
              background: 'rgba(124,110,224,0.08)',
              color: '#7c6ee0',
              border: '1px solid rgba(124,110,224,0.18)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,110,224,0.15)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(124,110,224,0.08)' }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAY_HEADERS.map(d => (
            <div
              key={d}
              className="text-xs text-center py-2 font-semibold"
              style={{ color: '#64748b', letterSpacing: '0.04em' }}
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {calendarDays.map((cell, i) => (
            <div key={i} style={dayCellStyle(cell)}>
              {cell?.day}
            </div>
          ))}
        </div>

        <div
          className="flex items-center gap-5 mt-5 pt-4 flex-wrap"
          style={{ borderTop: '1px solid rgba(124,110,224,0.10)' }}
        >
          <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: '#475569' }}>
            <span style={{ width: 14, height: 14, borderRadius: 999, background: COLOR_MINT, display: 'inline-block' }} />
            İştirak
          </span>
          <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: '#475569' }}>
            <span style={{ width: 14, height: 14, borderRadius: 999, background: COLOR_ROSE, display: 'inline-block' }} />
            Qayıb
          </span>
          <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: '#475569' }}>
            <span style={{ width: 14, height: 14, borderRadius: 999, background: COLOR_PEACH, display: 'inline-block' }} />
            Gecikmə
          </span>
          <span className="flex items-center gap-1.5 text-xs" style={{ color: '#64748b' }}>
            <span style={{ width: 14, height: 14, borderRadius: 999, border: `2px solid ${COLOR_PERI}`, display: 'inline-block' }} />
            Bu gün
          </span>
        </div>
      </div>

      {/* Attendance log — only non-present days */}
      <div className="liquid-card overflow-hidden" style={{ padding: 0 }}>
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid rgba(124,110,224,0.10)' }}
        >
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1a1a2e' }}>Buraxılmış dərslər</h2>
          {missedRecords.length > 0 && (
            <span className="text-xs" style={{ color: '#64748b' }}>{missedRecords.length} qeyd</span>
          )}
        </div>

        {missedRecords.length === 0 ? (
          <div className="px-6 py-12 flex flex-col items-center gap-3 text-center">
            <div
              className="flex items-center justify-center"
              style={{
                width: 56, height: 56, borderRadius: 18,
                background: 'rgba(93,184,163,0.16)',
                border: '1px solid rgba(93,184,163,0.30)',
              }}
            >
              <CheckCircle className="w-6 h-6" style={{ color: COLOR_MINT }} />
            </div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#1a1a2e' }}>Buraxılmış dərs yoxdur</p>
            <p className="text-xs" style={{ color: '#64748b' }}>Əla! Bütün dərslərə qatılmısınız.</p>
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
                {missedRecords.map((r) => (
                  <tr key={r.id}>
                    <td style={{ color: '#475569', whiteSpace: 'nowrap' }}>{fmtNumeric(r.date)}</td>
                    <td style={{ fontWeight: 600, color: '#1a1a2e' }}>{r.class?.name || '—'}</td>
                    <td>
                      <StatusBadge status={r.status} />
                    </td>
                    <td style={{ color: '#64748b' }}>{r.note || '—'}</td>
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
