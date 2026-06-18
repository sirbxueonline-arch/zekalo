import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import StatCard from '../../components/ui/StatCard'
import CountUp from '../../components/ui/CountUp'
import { Calendar, CheckCircle2, XCircle, Clock, ChevronLeft, ChevronRight, BarChart2 } from 'lucide-react'
import { fmtNumeric } from '../../lib/dateUtils'

const MONTH_NAMES = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun',
  'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr',
]
const DAY_HEADERS = ['B.e', 'Ç.a', 'Ç', 'C.a', 'C', 'Ş', 'B']

const AVATAR_COLORS = ['var(--brand-400)', 'var(--grape)', 'var(--mint)', 'var(--sky)']
function avatarColor(name = '') {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}

function childInitials(name = '') {
  return name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?'
}

// Friendly status pill using design-system pill tokens
function StatusPill({ status }) {
  const styles = {
    present: { className: 'pill-mint',   label: 'İştirak' },
    absent:  { className: 'pill-peach',  label: 'Qayıb' },
    late:    { className: 'pill-peach',  label: 'Gecikmə' },
  }
  const s = styles[status] || styles.absent
  return (
    <span className={`pill ${s.className}`}>
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
        pose="thinking"
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
    const base = 'aspect-square flex items-center justify-center text-xs font-bold transition-all rounded-tile select-none'
    if (!cell) return { className: `${base} text-ink-400 opacity-0`, style: {} }
    const isToday = cell.dateStr === todayStr

    if (cell.status === 'present') {
      return {
        className: `${base} text-white`,
        style: { background: 'var(--mint)' },
      }
    }
    if (cell.status === 'absent') {
      return {
        className: `${base} text-white`,
        style: { background: 'var(--ink-400)' },
      }
    }
    if (cell.status === 'late') {
      return {
        className: `${base} text-white`,
        style: { background: 'var(--sun)' },
      }
    }
    if (isToday) {
      return {
        className: `${base}`,
        style: { border: '2px solid var(--brand-500)', color: 'var(--brand-500)', background: 'var(--brand-50)' },
      }
    }
    return { className: `${base} text-ink-600`, style: {} }
  }

  const missedRecords = records.filter(r => r.status !== 'present')

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div className="flex items-start gap-3">
        <div
          className="icon-chip icon-chip-periwinkle flex-shrink-0"
          style={{ width: 48, height: 48 }}
        >
          <Calendar className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-display text-[30px] font-extrabold text-ink-900" style={{ letterSpacing: '-0.02em' }}>
            Davamiyyət
          </h1>
          <p className="text-[15px] text-ink-400 mt-0.5">Aylıq iştirak və qayıb tarixçəsi</p>
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
      ) : records.length === 0 ? (
        <EmptyState
          pose="sleeping"
          title={t('no_attendance')}
          description={t('attendance_will_appear')}
        />
      ) : (
        <>
          {/* Attendance hero banner */}
          <div className="liquid-card p-5 relative overflow-hidden">
            <div className="relative flex items-center gap-5">
              <div className="text-center flex-shrink-0">
                <p
                  className="font-display font-extrabold leading-none tabular-nums"
                  style={{
                    fontSize: 44,
                    color: pct >= 90 ? 'var(--mint)' : pct >= 70 ? 'var(--sky)' : 'var(--sun)',
                  }}
                >
                  <CountUp to={pct} duration={700} suffix="%" />
                </p>
                <p className="text-[12px] font-semibold uppercase tracking-[0.04em] mt-1" style={{ color: 'var(--ink-400)' }}>
                  Davamiyyət
                </p>
              </div>
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between text-[13px] font-medium text-ink-600 mb-1">
                  <span>İştirak nisbəti</span>
                  <span className="tabular-nums font-semibold text-ink-900">{present} / {records.length}</span>
                </div>
                <div className="h-3 rounded-pill overflow-hidden" style={{ background: 'var(--hairline)' }}>
                  <div
                    className="h-full rounded-pill transition-all duration-700"
                    style={{
                      width: `${pct}%`,
                      background: pct >= 90
                        ? 'var(--mint)'
                        : pct >= 70
                        ? 'var(--sky)'
                        : 'var(--sun)',
                    }}
                  />
                </div>
                <p className="text-[12px] text-ink-400">
                  {pct >= 95
                    ? 'Əla iştirak — davam edin!'
                    : pct >= 85
                    ? 'Yaxşı iştirak, bir az daha yaxşı olar!'
                    : pct >= 70
                    ? 'Orta iştirak — artırmağa çalışın'
                    : 'İştirakı artırmaq lazımdır'}
                </p>
              </div>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              label="Davamiyyət %"
              value={<><CountUp to={pct} duration={700} />%</>}
              icon={BarChart2}
              tone="periwinkle"
            />
            <StatCard
              label="İştirak"
              value={<CountUp to={present} duration={700} />}
              icon={CheckCircle2}
              tone="mint"
            />
            <StatCard
              label="Qayıb"
              value={<CountUp to={absent} duration={700} />}
              icon={XCircle}
              tone="peach"
            />
            <StatCard
              label="Gecikmə"
              value={<CountUp to={late} duration={700} />}
              icon={Clock}
              tone="sun"
            />
          </div>

          {/* Calendar */}
          <div className="liquid-card p-6">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setCurrentMonth(new Date(year, month - 1))}
                className="w-10 h-10 rounded-pill flex items-center justify-center transition-colors hover:bg-brand-50"
                style={{ background: 'var(--surface)', color: 'var(--brand-500)', border: '1px solid var(--hairline)' }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h3 className="text-[15px] font-semibold text-ink-900">
                {MONTH_NAMES[month]} {year}
              </h3>
              <button
                onClick={() => setCurrentMonth(new Date(year, month + 1))}
                className="w-10 h-10 rounded-pill flex items-center justify-center transition-colors hover:bg-brand-50"
                style={{ background: 'var(--surface)', color: 'var(--brand-500)', border: '1px solid var(--hairline)' }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1.5 mb-1">
              {DAY_HEADERS.map(d => (
                <div
                  key={d}
                  className="text-[11px] text-center py-1.5 font-semibold uppercase tracking-wider text-ink-400"
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
            <div className="flex flex-wrap items-center gap-4 mt-6 pt-4" style={{ borderTop: '1px solid var(--hairline)' }}>
              <span className="flex items-center gap-1.5 text-xs font-medium text-ink-600">
                <span className="w-3 h-3 rounded-ctl" style={{ background: 'var(--mint)' }} />
                İştirak
              </span>
              <span className="flex items-center gap-1.5 text-xs font-medium text-ink-600">
                <span className="w-3 h-3 rounded-ctl" style={{ background: 'var(--ink-400)' }} />
                Qayıb
              </span>
              <span className="flex items-center gap-1.5 text-xs font-medium text-ink-600">
                <span className="w-3 h-3 rounded-ctl" style={{ background: 'var(--sun)' }} />
                Gecikmə
              </span>
            </div>
          </div>

          {/* Missed log */}
          <div className="liquid-card overflow-hidden">
            <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--hairline)' }}>
              <h2 className="text-[17px] font-semibold text-ink-900">Buraxılmış dərslər</h2>
            </div>
            {missedRecords.length === 0 ? (
              <div className="px-6 py-12 flex flex-col items-center text-center">
                <div className="icon-chip icon-chip-mint mb-3">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <p className="text-[15px] font-semibold text-ink-900">Əla iş</p>
                <p className="text-[13px] text-ink-400 mt-1">Buraxılmış dərs yoxdur</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="pastel-table w-full">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left">Tarix</th>
                      <th className="px-6 py-3 text-left">Sinif</th>
                      <th className="px-6 py-3 text-left">Status</th>
                      <th className="px-6 py-3 text-left">Qeyd</th>
                    </tr>
                  </thead>
                  <tbody>
                    {missedRecords.map((r, idx, arr) => (
                      <tr
                        key={r.id}
                        style={{ borderBottom: idx === arr.length - 1 ? 'none' : '1px solid var(--hairline)' }}
                      >
                        <td className="px-6 py-4 text-[13px] whitespace-nowrap text-ink-600 tabular-nums">
                          {fmtNumeric(r.date)}
                        </td>
                        <td className="px-6 py-4 text-[13px] font-semibold text-ink-900">
                          {r.class?.name || '—'}
                        </td>
                        <td className="px-6 py-4">
                          <StatusPill status={r.status} />
                        </td>
                        <td className="px-6 py-4 text-[13px] text-ink-600">
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
