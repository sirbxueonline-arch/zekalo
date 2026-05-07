import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import { Calendar, CheckCircle2, XCircle, Clock, ChevronLeft, ChevronRight, BarChart2, Users } from 'lucide-react'
import { fmtNumeric } from '../../lib/dateUtils'

const MONTH_NAMES = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun',
  'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr',
]

const DAY_HEADERS = ['B.e', 'Ç.a', 'Ç', 'C.a', 'C', 'Ş', 'B']

const PASTEL_COLORS = ['#7c6ee0', '#5db8a3', '#e8a87c', '#6b9dde']
function pastelColor(name = '') {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return PASTEL_COLORS[Math.abs(h) % PASTEL_COLORS.length]
}

function childInitials(name = '') {
  return name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?'
}

function StatusPill({ status }) {
  const styles = {
    present: { bg: 'rgba(93,184,163,0.12)',  color: '#5db8a3', border: 'rgba(93,184,163,0.3)',  label: 'İştirak' },
    absent:  { bg: 'rgba(232,168,124,0.18)', color: '#c47a4a', border: 'rgba(232,168,124,0.35)', label: 'Qayıb' },
    late:    { bg: 'rgba(232,168,124,0.12)', color: '#c47a4a', border: 'rgba(232,168,124,0.3)',  label: 'Gecikmə' },
  }
  const s = styles[status] || styles.absent
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      {s.label}
    </span>
  )
}

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
        title="Uşaq tapılmadı"
        description="Hesabınıza bağlı uşaq profili yoxdur."
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

  function dayCellStyle(cell) {
    if (!cell) return { className: 'aspect-square flex items-center justify-center text-xs font-medium', style: {} }
    const baseClass = 'aspect-square flex items-center justify-center text-xs font-bold transition-all'
    const isToday = cell.dateStr === todayStr

    if (cell.status === 'present') {
      return {
        className: `${baseClass} rounded-xl text-white`,
        style: { background: 'linear-gradient(135deg, #5db8a3 0%, #4ea08c 100%)', boxShadow: '0 2px 8px rgba(93,184,163,0.3)' },
      }
    }
    if (cell.status === 'absent') {
      return {
        className: `${baseClass} rounded-xl text-white`,
        style: { background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', boxShadow: '0 2px 8px rgba(239,68,68,0.25)' },
      }
    }
    if (cell.status === 'late') {
      return {
        className: `${baseClass} rounded-xl text-white`,
        style: { background: 'linear-gradient(135deg, #e8a87c 0%, #d4915f 100%)', boxShadow: '0 2px 8px rgba(232,168,124,0.3)' },
      }
    }
    if (isToday) {
      return {
        className: `${baseClass} rounded-xl`,
        style: { border: '2px solid #7c6ee0', color: '#7c6ee0', background: 'rgba(124,110,224,0.05)' },
      }
    }
    return {
      className: `${baseClass} rounded-xl`,
      style: { color: '#64748b' },
    }
  }

  const missedRecords = records.filter(r => r.status !== 'present')

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold" style={{ color: '#1a1a2e', letterSpacing: '-0.02em' }}>
          <span className="pastel-text">Davamiyyət</span>
        </h1>
        <p className="text-sm mt-1" style={{ color: '#64748b' }}>Aylıq iştirak və qayıb tarixçəsi</p>
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
      ) : records.length === 0 ? (
        <div className="liquid-card p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(124,110,224,0.12)' }}
            >
              <Calendar className="w-8 h-8" style={{ color: '#7c6ee0' }} />
            </div>
            <h3 className="text-lg font-bold" style={{ color: '#1a1a2e' }}>{t('no_attendance')}</h3>
            <p className="text-sm mt-1" style={{ color: '#64748b' }}>{t('attendance_will_appear')}</p>
          </div>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="liquid-card p-4 flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(124,110,224,0.12)' }}
              >
                <BarChart2 className="w-5 h-5" style={{ color: '#7c6ee0' }} />
              </div>
              <div>
                <p className="text-2xl font-extrabold leading-none" style={{ color: '#7c6ee0' }}>{pct}%</p>
                <p className="text-xs mt-1" style={{ color: '#64748b' }}>Davamiyyət %</p>
              </div>
            </div>

            <div className="liquid-card p-4 flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(93,184,163,0.15)' }}
              >
                <CheckCircle2 className="w-5 h-5" style={{ color: '#5db8a3' }} />
              </div>
              <div>
                <p className="text-2xl font-extrabold leading-none" style={{ color: '#5db8a3' }}>{present}</p>
                <p className="text-xs mt-1" style={{ color: '#64748b' }}>İştirak</p>
              </div>
            </div>

            <div className="liquid-card p-4 flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(239,68,68,0.10)' }}
              >
                <XCircle className="w-5 h-5" style={{ color: '#ef4444' }} />
              </div>
              <div>
                <p className="text-2xl font-extrabold leading-none" style={{ color: '#ef4444' }}>{absent}</p>
                <p className="text-xs mt-1" style={{ color: '#64748b' }}>Qayıb</p>
              </div>
            </div>

            <div className="liquid-card p-4 flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(232,168,124,0.15)' }}
              >
                <Clock className="w-5 h-5" style={{ color: '#e8a87c' }} />
              </div>
              <div>
                <p className="text-2xl font-extrabold leading-none" style={{ color: '#e8a87c' }}>{late}</p>
                <p className="text-xs mt-1" style={{ color: '#64748b' }}>Gecikmə</p>
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="liquid-card p-6">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setCurrentMonth(new Date(year, month - 1))}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105"
                style={{
                  background: 'rgba(255,255,255,0.6)',
                  color: '#7c6ee0',
                  border: '1px solid rgba(124,110,224,0.2)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h3 className="text-lg font-bold" style={{ color: '#1a1a2e' }}>
                {MONTH_NAMES[month]} {year}
              </h3>
              <button
                onClick={() => setCurrentMonth(new Date(year, month + 1))}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105"
                style={{
                  background: 'rgba(255,255,255,0.6)',
                  color: '#7c6ee0',
                  border: '1px solid rgba(124,110,224,0.2)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1.5 mb-1">
              {DAY_HEADERS.map(d => (
                <div
                  key={d}
                  className="text-xs text-center py-2 font-semibold uppercase tracking-wider"
                  style={{ color: '#64748b' }}
                >
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {calendarDays.map((cell, i) => {
                const { className, style } = dayCellStyle(cell)
                return (
                  <div key={i} className={className} style={style}>
                    {cell?.day}
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div
              className="flex flex-wrap items-center gap-4 mt-6 pt-4"
              style={{ borderTop: '1px solid rgba(124,110,224,0.1)' }}
            >
              <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: '#64748b' }}>
                <span className="w-3 h-3 rounded-md" style={{ background: '#5db8a3' }} />
                İştirak
              </span>
              <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: '#64748b' }}>
                <span className="w-3 h-3 rounded-md" style={{ background: '#ef4444' }} />
                Qayıb
              </span>
              <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: '#64748b' }}>
                <span className="w-3 h-3 rounded-md" style={{ background: '#e8a87c' }} />
                Gecikmə
              </span>
            </div>
          </div>

          {/* Missed log */}
          <div className="liquid-card overflow-hidden">
            <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(124,110,224,0.12)' }}>
              <h2 className="text-base font-bold" style={{ color: '#1a1a2e' }}>Buraxılmış dərslər</h2>
            </div>
            {missedRecords.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: 'rgba(93,184,163,0.12)' }}
                >
                  <CheckCircle2 className="w-7 h-7" style={{ color: '#5db8a3' }} />
                </div>
                <p className="text-base font-bold" style={{ color: '#1a1a2e' }}>Əla iş!</p>
                <p className="text-sm mt-1" style={{ color: '#64748b' }}>Buraxılmış dərs yoxdur</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ background: 'rgba(248,247,251,0.8)', borderBottom: '1px solid rgba(124,110,224,0.1)' }}>
                      <th className="text-xs font-bold uppercase tracking-wider px-6 py-3 text-left" style={{ color: '#64748b' }}>
                        Tarix
                      </th>
                      <th className="text-xs font-bold uppercase tracking-wider px-6 py-3 text-left" style={{ color: '#64748b' }}>
                        Sinif
                      </th>
                      <th className="text-xs font-bold uppercase tracking-wider px-6 py-3 text-left" style={{ color: '#64748b' }}>
                        Status
                      </th>
                      <th className="text-xs font-bold uppercase tracking-wider px-6 py-3 text-left" style={{ color: '#64748b' }}>
                        Qeyd
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {missedRecords.map((r, idx, arr) => (
                      <tr
                        key={r.id}
                        className="transition-colors hover:bg-white/40"
                        style={{
                          borderBottom: idx === arr.length - 1 ? 'none' : '1px solid rgba(124,110,224,0.08)',
                        }}
                      >
                        <td className="px-6 py-4 text-sm whitespace-nowrap" style={{ color: '#64748b' }}>
                          {fmtNumeric(r.date)}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold" style={{ color: '#1a1a2e' }}>
                          {r.class?.name || '—'}
                        </td>
                        <td className="px-6 py-4">
                          <StatusPill status={r.status} />
                        </td>
                        <td className="px-6 py-4 text-sm" style={{ color: '#64748b' }}>
                          {r.note || '—'}
                        </td>
                      </tr>
                    ))}
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
