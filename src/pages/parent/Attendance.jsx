import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import { StatusBadge } from '../../components/ui/Badge'
import { Calendar, CheckCircle2, XCircle, Clock, ChevronLeft, ChevronRight, BarChart2, Users } from 'lucide-react'

const MONTH_NAMES = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun',
  'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr',
]

const DAY_HEADERS = ['B.e', 'Ç.a', 'Ç', 'C.a', 'C', 'Ş', 'B']

export default function ParentAttendance() {
  const { profile, t } = useAuth()
  const [loading, setLoading] = useState(true)
  const [children, setChildren] = useState([])
  const [selectedChild, setSelectedChild] = useState(null)
  const [records, setRecords] = useState([])
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    if (!profile) return
    loadChildren()
  }, [profile])

  useEffect(() => {
    if (!selectedChild) return
    loadAttendance(selectedChild.id)
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

  async function loadAttendance(childId) {
    setLoading(true)
    const { data } = await supabase
      .from('attendance')
      .select('*, class:classes(name)')
      .eq('student_id', childId)
      .order('date', { ascending: false })

    setRecords(data || [])
    setLoading(false)
  }

  if (loading && !children.length) return <PageSpinner />

  if (children.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title={t('error')}
        description={t('error')}
      />
    )
  }

  const present = records.filter(r => r.status === 'present').length
  const absent = records.filter(r => r.status === 'absent').length
  const late = records.filter(r => r.status === 'late').length
  const pct = records.length ? Math.round((present / records.length) * 100) : 0

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDow = (firstDay.getDay() + 6) % 7

  const recordMap = {}
  records.forEach(r => { recordMap[r.date] = r.status })

  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const calendarDays = []
  for (let i = 0; i < startDow; i++) calendarDays.push(null)
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    calendarDays.push({ day: d, dateStr, status: recordMap[dateStr] || null })
  }

  function dayCellClass(cell) {
    if (!cell) return 'aspect-square flex items-center justify-center text-xs font-medium'
    const base = 'aspect-square flex items-center justify-center text-xs font-medium transition-colors'
    const isToday = cell.dateStr === todayStr
    if (cell.status === 'present') return `${base} bg-[#1D9E75] text-white rounded-lg font-bold`
    if (cell.status === 'absent') return `${base} bg-red-500 text-white rounded-lg font-bold`
    if (cell.status === 'late') return `${base} bg-amber-400 text-white rounded-lg font-bold`
    if (isToday) return `${base} ring-2 ring-purple rounded-lg text-purple font-bold`
    return `${base} text-gray-500`
  }

  const missedRecords = records.filter(r => r.status !== 'present')

  return (
    <div className="space-y-6">
      {/* Child selector pills */}
      {children.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {children.map(child => (
            <button
              key={child.id}
              onClick={() => setSelectedChild(child)}
              className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${
                selectedChild?.id === child.id
                  ? 'border-purple bg-purple-light text-purple'
                  : 'border-border-soft text-gray-500 hover:bg-surface'
              }`}
            >
              {child.full_name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <PageSpinner />
      ) : records.length === 0 ? (
        <EmptyState icon={Calendar} title={t('no_attendance')} description={t('attendance_will_appear')} />
      ) : (
        <>
          {/* 4 stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Davamiyyət % */}
            <div className="bg-white border border-border-soft rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-light flex-shrink-0">
                <BarChart2 className="w-5 h-5 text-purple" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 leading-none">{pct}%</p>
                <p className="text-xs text-gray-400 mt-1">Davamiyyət %</p>
              </div>
            </div>

            {/* İştirak */}
            <div className="bg-white border border-border-soft rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#e6f7f2] flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-[#1D9E75]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 leading-none">{present}</p>
                <p className="text-xs text-gray-400 mt-1">İştirak</p>
              </div>
            </div>

            {/* Qayıb */}
            <div className="bg-white border border-border-soft rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-red-50 flex-shrink-0">
                <XCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 leading-none">{absent}</p>
                <p className="text-xs text-gray-400 mt-1">Qayıb</p>
              </div>
            </div>

            {/* Gecikmə */}
            <div className="bg-white border border-border-soft rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-amber-50 flex-shrink-0">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 leading-none">{late}</p>
                <p className="text-xs text-gray-400 mt-1">Gecikmə</p>
              </div>
            </div>
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

          {/* Attendance log — only non-present records */}
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
                        r.status === 'absent' ? 'border-l-red-400' : 'border-l-amber-400'
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
        </>
      )}
    </div>
  )
}
