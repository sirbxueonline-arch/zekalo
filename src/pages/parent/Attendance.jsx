import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Card from '../../components/ui/Card'
import StatCard from '../../components/ui/StatCard'
import { StatusBadge } from '../../components/ui/Badge'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import { Calendar, CheckCircle, XCircle, Clock, Users } from 'lucide-react'

const dayNames = ['B.e', 'Ç.a', 'Ç', 'C.a', 'C', 'Ş', 'B']
const monthNames = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun', 'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr']

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

  const calendarDays = []
  for (let i = 0; i < startDow; i++) calendarDays.push(null)
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    calendarDays.push({ day: d, status: recordMap[dateStr] })
  }

  const statusColors = {
    present: 'bg-teal-light text-[#085041]',
    absent: 'bg-red-50 text-red-700',
    late: 'bg-[#faeeda] text-[#633806]',
  }

  return (
    <div className="space-y-6">
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label={t('attendance')} value={`${pct}%`} icon={Calendar} />
            <StatCard label={t('present')} value={present} icon={CheckCircle} />
            <StatCard label={t('absent')} value={absent} icon={XCircle} />
            <StatCard label={t('late')} value={late} icon={Clock} />
          </div>

          <Card hover={false}>
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setCurrentMonth(new Date(year, month - 1))} className="text-sm text-purple hover:text-purple-dark">&larr;</button>
              <h3 className="text-sm font-medium text-gray-900">{monthNames[month]} {year}</h3>
              <button onClick={() => setCurrentMonth(new Date(year, month + 1))} className="text-sm text-purple hover:text-purple-dark">&rarr;</button>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {dayNames.map(d => (
                <div key={d} className="text-xs text-gray-400 text-center py-2 font-medium">{d}</div>
              ))}
              {calendarDays.map((cell, i) => (
                <div
                  key={i}
                  className={`aspect-square flex items-center justify-center rounded-lg text-xs font-medium ${
                    cell ? (cell.status ? statusColors[cell.status] : 'text-gray-400') : ''
                  }`}
                >
                  {cell?.day}
                </div>
              ))}
            </div>
          </Card>

          <Card hover={false}>
            <h3 className="text-xs tracking-widest text-gray-400 uppercase mb-4">{t('missed_lessons')}</h3>
            <div className="space-y-3">
              {records.filter(r => r.status !== 'present').map(r => (
                <div key={r.id} className="flex items-center justify-between py-2 border-b border-border-soft last:border-0">
                  <div>
                    <p className="text-sm text-gray-900">{r.class?.name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(r.date).toLocaleDateString('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {r.note && <span className="text-xs text-gray-400">{r.note}</span>}
                    <StatusBadge status={r.status} />
                  </div>
                </div>
              ))}
              {records.filter(r => r.status !== 'present').length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">{t('no_attendance')}</p>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
