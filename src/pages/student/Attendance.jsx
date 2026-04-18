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

// ─── SVG Ring percentage display ─────────────────────────────────────────────
function AttendanceRing({ pct }) {
  const radius = 70
  const stroke = 10
  const normalizedRadius = radius - stroke / 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (pct / 100) * circumference

  const ringColor = pct >= 85 ? '#1D9E75' : pct >= 70 ? '#534AB7' : pct >= 50 ? '#D97706' : '#EF4444'
  const textColor = pct >= 85 ? 'text-teal-700' : pct >= 70 ? 'text-purple' : pct >= 50 ? 'text-amber-600' : 'text-red-600'
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
            stroke="#f3f4f6"
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
          <span className={`font-serif text-4xl font-bold leading-none ${textColor}`}>{pct}%</span>
          <span className="text-gray-400 text-xs font-medium mt-0.5">iştirak</span>
        </div>
      </div>
      <span
        className="text-xs font-semibold px-3 py-1 rounded-full"
        style={{
          backgroundColor: ringColor + '20',
          color: ringColor,
          border: `1px solid ${ringColor}40`,
        }}
      >
        {label}
      </span>
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, value, label, iconBg, iconColor, cardBg, pillBg, pillText }) {
  return (
    <div className={`rounded-2xl border border-border-soft shadow-sm hover:shadow-md transition-shadow px-5 py-5 flex items-center gap-4 ${cardBg || 'bg-white'}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div>
        <p className={`font-serif text-3xl font-bold leading-none ${pillText || 'text-gray-900'}`}>{value}</p>
        <p className="text-xs text-gray-400 mt-1 leading-tight">{label}</p>
      </div>
    </div>
  )
}

export default function StudentAttendance() {
  const { profile, t } = useAuth()
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
      <EmptyState
        icon={Calendar}
        title="Davamiyyət yoxdur"
        description="Hələ heç bir davamiyyət qeydi tapılmadı."
      />
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

  function dayCellClass(cell) {
    if (!cell) return ''
    const base = 'rounded-xl aspect-square flex items-center justify-center text-sm font-medium transition-all relative cursor-default'
    const isToday = cell.dateStr === todayStr
    let color = ''
    if      (cell.status === 'present') color = 'bg-[#1D9E75] text-white font-bold shadow-sm'
    else if (cell.status === 'absent')  color = 'bg-red-500 text-white font-bold shadow-sm'
    else if (cell.status === 'late')    color = 'bg-amber-400 text-white font-bold shadow-sm'
    else color = 'text-gray-400 hover:bg-surface'
    const ring = isToday ? ' ring-2 ring-purple ring-offset-1' : ''
    return `${base} ${color}${ring}`
  }

  // Non-present records for the log, sorted by date desc
  const missedRecords = records.filter(r => r.status !== 'present')

  return (
    <div className="space-y-8">

      {/* ── Page header ── */}
      <h1 className="font-serif text-4xl text-gray-900">Davamiyyət</h1>

      {/* ── Hero: Ring + Stats side-by-side ── */}
      <div className="bg-white rounded-2xl border border-border-soft shadow-sm hover:shadow-md transition-shadow p-6">
        <div className="flex flex-col sm:flex-row items-center gap-8">

          {/* Attendance ring */}
          <AttendanceRing pct={pct} />

          {/* Divider */}
          <div className="hidden sm:block w-px h-32 bg-border-soft" />

          {/* Stats pills */}
          <div className="flex-1 grid grid-cols-1 gap-3 w-full sm:w-auto">
            <div className="flex items-center justify-between bg-teal-light rounded-xl px-4 py-3 border border-teal/20">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-teal flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-teal-800">İştirak</span>
              </div>
              <span className="font-serif text-2xl font-bold text-teal-700">{present} <span className="text-sm font-normal text-teal-600">gün</span></span>
            </div>

            <div className="flex items-center justify-between bg-red-50 rounded-xl px-4 py-3 border border-red-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-red-500 flex items-center justify-center flex-shrink-0">
                  <XCircle className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-red-800">Qayıb</span>
              </div>
              <span className="font-serif text-2xl font-bold text-red-600">{absent} <span className="text-sm font-normal text-red-500">gün</span></span>
            </div>

            <div className="flex items-center justify-between bg-amber-50 rounded-xl px-4 py-3 border border-amber-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-400 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-amber-800">Gecikmə</span>
              </div>
              <span className="font-serif text-2xl font-bold text-amber-600">{late} <span className="text-sm font-normal text-amber-500">gün</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Monthly calendar ── */}
      <div className="bg-white rounded-2xl border border-border-soft shadow-sm hover:shadow-md transition-shadow px-6 py-6">
        {/* Navigation header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentMonth(new Date(year, month - 1))}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface text-gray-500 hover:text-purple transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h3 className="text-base font-semibold text-gray-900">
            {MONTH_NAMES[month]} {year}
          </h3>
          <button
            onClick={() => setCurrentMonth(new Date(year, month + 1))}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface text-gray-500 hover:text-purple transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAY_HEADERS.map(d => (
            <div key={d} className="text-xs text-gray-400 text-center py-2 font-medium">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid — colored day chips */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((cell, i) => (
            <div key={i} className={dayCellClass(cell)}>
              {cell?.day}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-5 mt-5 pt-4 border-t border-border-soft flex-wrap">
          <span className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
            <span className="w-3.5 h-3.5 rounded-full bg-[#1D9E75] inline-block" />
            İştirak
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
            <span className="w-3.5 h-3.5 rounded-full bg-red-500 inline-block" />
            Qayıb
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
            <span className="w-3.5 h-3.5 rounded-full bg-amber-400 inline-block" />
            Gecikmə
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className="w-3.5 h-3.5 rounded-full border-2 border-purple inline-block" />
            Bu gün
          </span>
        </div>
      </div>

      {/* ── Attendance log — only non-present days ── */}
      <div className="bg-white rounded-2xl border border-border-soft shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-border-soft flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 text-sm">Buraxılmış dərslər</h2>
          {missedRecords.length > 0 && (
            <span className="text-xs text-gray-400">{missedRecords.length} qeyd</span>
          )}
        </div>

        {missedRecords.length === 0 ? (
          <div className="px-6 py-12 flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 bg-teal-light rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-teal" />
            </div>
            <p className="text-sm font-semibold text-gray-700">Buraxılmış dərs yoxdur</p>
            <p className="text-xs text-gray-400">Əla! Bütün dərslərə qatılmısınız.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface border-b border-border-soft">
                  <th className="text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3 text-left">
                    Tarix
                  </th>
                  <th className="text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3 text-left">
                    Sinif
                  </th>
                  <th className="text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3 text-left">
                    Status
                  </th>
                  <th className="text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3 text-left">
                    Qeyd
                  </th>
                </tr>
              </thead>
              <tbody>
                {missedRecords.map((r, idx) => {
                  const isAbsent = r.status === 'absent'
                  const borderColor = isAbsent ? 'border-l-red-400' : 'border-l-amber-400'
                  const rowBg = isAbsent
                    ? (idx % 2 === 1 ? 'bg-red-50/40' : 'bg-white')
                    : (idx % 2 === 1 ? 'bg-amber-50/40' : 'bg-white')
                  return (
                    <tr
                      key={r.id}
                      className={`border-b border-border-soft last:border-0 hover:bg-surface transition-colors border-l-4 ${borderColor} ${rowBg}`}
                    >
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {fmtNumeric(r.date)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {r.class?.name || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {r.note || '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
