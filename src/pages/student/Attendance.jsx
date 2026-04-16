import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { StatusBadge } from '../../components/ui/Badge'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import { Calendar, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react'

const MONTH_NAMES = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun',
  'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr',
]

const DAY_HEADERS = ['B.e', 'Ç.a', 'Ç', 'C.a', 'C', 'Ş', 'B']

function StatCard({ icon: Icon, value, label, iconBg, iconColor }) {
  return (
    <div className="bg-white rounded-2xl border border-border-soft shadow-sm px-5 py-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
        <p className="text-xs text-gray-400 mt-1 leading-tight">{label}</p>
      </div>
    </div>
  )
}

export default function StudentAttendance() {
  const { profile, t } = useAuth()
  const [loading, setLoading] = useState(true)
  const [records, setRecords] = useState([])
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    if (!profile) return
    supabase
      .from('attendance')
      .select('*, class:classes(name)')
      .eq('student_id', profile.id)
      .order('date', { ascending: false })
      .then(({ data }) => {
        setRecords(data || [])
        setLoading(false)
      })
  }, [profile])

  if (loading) return <PageSpinner />
  if (records.length === 0)
    return (
      <EmptyState
        icon={Calendar}
        title="Davamiyyət yoxdur"
        description="Hələ heç bir davamiyyət qeydi tapılmadı."
      />
    )

  const present = records.filter(r => r.status === 'present').length
  const absent = records.filter(r => r.status === 'absent').length
  const late = records.filter(r => r.status === 'late').length
  const pct = records.length ? Math.round((present / records.length) * 100) : 0

  // Calendar logic
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  // Monday-based week (0=Mon … 6=Sun)
  const startDow = (firstDay.getDay() + 6) % 7

  const recordMap = {}
  records.forEach(r => {
    recordMap[r.date] = r.status
  })

  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const calendarDays = []
  for (let i = 0; i < startDow; i++) calendarDays.push(null)
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    calendarDays.push({ day: d, dateStr, status: recordMap[dateStr] || null })
  }

  function dayCellClass(cell) {
    if (!cell) return ''
    const base = 'rounded-xl aspect-square flex items-center justify-center text-sm font-medium transition-colors relative'
    const today = cell.dateStr === todayStr
    let color = ''
    if (cell.status === 'present') color = 'bg-[#1D9E75] text-white font-bold'
    else if (cell.status === 'absent') color = 'bg-red-500 text-white font-bold'
    else if (cell.status === 'late') color = 'bg-amber-400 text-white font-bold'
    else color = 'text-gray-400'
    const ring = today ? ' ring-2 ring-purple ring-offset-1' : ''
    return `${base} ${color}${ring}`
  }

  // Non-present records for the log, sorted by date desc
  const missedRecords = records.filter(r => r.status !== 'present')

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="font-serif text-4xl text-gray-900">Davamiyyət</h1>
      </div>

      {/* 4 Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Calendar}
          value={`${pct}%`}
          label="İştirak %"
          iconBg="bg-purple-light"
          iconColor="text-purple"
        />
        <StatCard
          icon={CheckCircle}
          value={present}
          label="İştirak günü"
          iconBg="bg-[#E1F5EE]"
          iconColor="text-[#1D9E75]"
        />
        <StatCard
          icon={XCircle}
          value={absent}
          label="Qayıb"
          iconBg="bg-red-50"
          iconColor="text-red-500"
        />
        <StatCard
          icon={Clock}
          value={late}
          label="Gecikmə"
          iconBg="bg-[#faeeda]"
          iconColor="text-[#633806]"
        />
      </div>

      {/* Monthly calendar */}
      <div className="bg-white rounded-2xl border border-border-soft shadow-sm px-6 py-6">
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

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((cell, i) => (
            <div key={i} className={dayCellClass(cell)}>
              {cell?.day}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-5 pt-4 border-t border-border-soft">
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-3 h-3 rounded-full bg-[#1D9E75] inline-block" />
            İştirak
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
            Qayıb
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
            Gecikmə
          </span>
        </div>
      </div>

      {/* Attendance log — only non-present days */}
      <div className="bg-white rounded-2xl border border-border-soft shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border-soft">
          <h2 className="text-sm font-semibold text-gray-700">Buraxılmış dərslər</h2>
        </div>
        {missedRecords.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-gray-400">
            Buraxılmış dərs yoxdur. Əla!
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
                {missedRecords.map(r => {
                  const borderColor =
                    r.status === 'absent'
                      ? 'border-l-red-400'
                      : 'border-l-amber-400'
                  return (
                    <tr
                      key={r.id}
                      className={`border-b border-border-soft last:border-0 hover:bg-surface transition-colors border-l-4 ${borderColor}`}
                    >
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {new Date(r.date).toLocaleDateString('az-AZ', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
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
