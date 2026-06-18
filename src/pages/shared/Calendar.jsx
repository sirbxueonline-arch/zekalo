import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays, List, Clock } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Card from '../../components/ui/Card'
import { Select } from '../../components/ui/Input'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_LABELS = {
  holiday: 'Tətil',
  exam: 'İmtahan',
  meeting: 'Görüş',
  event: 'Tədbir',
  other: 'Digər',
}

// Pastel pill palette — each type owns a consistent hue
const TYPE_PILL_CLASS = {
  holiday: 'pill-rose',
  exam:    'pill-grape',
  meeting: 'pill-blue',
  event:   'pill-mint',
  other:   'pill-muted',
}

// §4.7 Amie model — muted event blocks: ~12–15% tint fill + solid accent
// left-bar + dark-tint text. Low saturation reads premium; bright fills are
// the childish tell. The meaning-bearing hue survives in the left bar only.
const TYPE_CELL_STYLE = {
  holiday: { bg: 'rgba(244,103,126,0.10)', text: '#B91C1C', bar: 'var(--coral)' },
  exam:    { bg: 'rgba(124,92,224,0.10)',  text: '#5B3FB0', bar: 'var(--grape)' },
  meeting: { bg: 'rgba(59,168,230,0.10)',  text: '#1D4ED8', bar: 'var(--sky)' },
  event:   { bg: 'rgba(31,168,85,0.10)',   text: '#15803D', bar: 'var(--mint)' },
  other:   { bg: 'rgba(20,22,40,0.05)',    text: '#5A6072', bar: 'var(--ink-400)' },
}

// Left-bar accent colors for the upcoming / detail panels
const TYPE_ACCENT = {
  holiday: 'var(--coral)',
  exam:    'var(--grape)',
  meeting: 'var(--sky)',
  event:   'var(--mint)',
  other:   'var(--ink-400)',
}

const AZ_MONTHS = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun',
  'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr',
]

const AZ_WEEKDAYS = ['B.e', 'Ç.a', 'Çər', 'C.a', 'Cüm', 'Şən', 'Baz']

// Maps profile.role to visible_to column values
const ROLE_MAP = {
  student: 'students',
  teacher: 'teachers',
  parent: 'parents',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startOffset = (firstDay.getDay() + 6) % 7
  const days = []
  for (let i = 0; i < startOffset; i++) days.push(null)
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(d)
  while (days.length % 7 !== 0) days.push(null)
  return days
}

function toDateStr(year, month, day) {
  const mm = String(month + 1).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  return `${year}-${mm}-${dd}`
}

function eventFallsOnDay(event, dateStr) {
  return event.start_date <= dateStr && event.end_date >= dateStr
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  return `${d} ${AZ_MONTHS[parseInt(m, 10) - 1]} ${y}`
}

// ─── Type Badge (pill variant) ────────────────────────────────────────────────

function TypeBadge({ type }) {
  const cls = TYPE_PILL_CLASS[type] || 'pill-muted'
  return (
    <span className={cls} style={{ fontSize: 11, padding: '2px 9px' }}>
      {TYPE_LABELS[type] || type}
    </span>
  )
}

// ─── Upcoming Event Item ───────────────────────────────────────────────────────

function UpcomingEventItem({ event }) {
  const sameDay = event.start_date === event.end_date
  const dateLabel = sameDay
    ? formatDate(event.start_date)
    : `${formatDate(event.start_date)} – ${formatDate(event.end_date)}`
  const accent = TYPE_ACCENT[event.type] || 'var(--brand-500)'

  return (
    <div className="flex items-start gap-3 py-3 last:pb-0" style={{ borderBottom: '1px solid var(--hairline)' }}>
      {/* Colored left bar */}
      <div
        className="flex-shrink-0 rounded-full self-stretch"
        style={{ width: 3, minHeight: 40, background: accent }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: 'var(--ink-900)' }}>
          {event.title}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <Clock className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--ink-400)' }} />
          <p className="text-xs" style={{ color: 'var(--ink-600)' }}>{dateLabel}</p>
        </div>
        {event.description && (
          <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--ink-400)' }}>
            {event.description}
          </p>
        )}
      </div>
      <TypeBadge type={event.type} />
    </div>
  )
}

// ─── Legend Item ──────────────────────────────────────────────────────────────

function LegendItem({ type }) {
  return (
    <div className="flex items-center gap-2">
      <TypeBadge type={type} />
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Calendar() {
  const { profile } = useAuth()

  const today = new Date()
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [view, setView] = useState('calendar') // 'calendar' | 'list'
  const [typeFilter, setTypeFilter] = useState('all')

  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDayEvents, setSelectedDayEvents] = useState(null) // { dateStr, events }

  // ── Data fetching ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (profile?.school_id) fetchEvents()
  }, [profile?.school_id])

  async function fetchEvents() {
    try {
      setLoading(true)
      const roleValue = ROLE_MAP[profile.role]

      let query = supabase
        .from('events')
        .select('*')
        .eq('school_id', profile.school_id)
        .order('start_date')

      if (roleValue) {
        query = query.or(`visible_to.eq.all,visible_to.eq.${roleValue}`)
      } else {
        query = query.eq('visible_to', 'all')
      }

      const { data, error: err } = await query
      if (err) throw err
      setEvents(data || [])
    } catch (err) {
      console.error('fetchEvents error:', err)
    } finally {
      setLoading(false)
    }
  }

  // ── Month navigation ───────────────────────────────────────────────────────

  function prevMonth() {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) }
    else setCurrentMonth(m => m - 1)
  }

  function nextMonth() {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) }
    else setCurrentMonth(m => m + 1)
  }

  // ── Filtered events ────────────────────────────────────────────────────────

  const filteredEvents = typeFilter === 'all'
    ? events
    : events.filter(e => e.type === typeFilter)

  function eventsOnDay(day) {
    if (!day) return []
    const dateStr = toDateStr(currentYear, currentMonth, day)
    return filteredEvents.filter(e => eventFallsOnDay(e, dateStr))
  }

  // ── Upcoming events ────────────────────────────────────────────────────────

  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate())
  const upcomingEvents = events
    .filter(e => e.end_date >= todayStr)
    .slice(0, 5)

  const calendarDays = buildCalendarDays(currentYear, currentMonth)

  // ── Day click ──────────────────────────────────────────────────────────────

  function handleDayClick(day) {
    if (!day) return
    const dateStr = toDateStr(currentYear, currentMonth, day)
    const dayEvts = eventsOnDay(day)
    if (dayEvts.length > 0) {
      setSelectedDayEvents({ dateStr, events: dayEvts })
    } else {
      setSelectedDayEvents(null)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) return <PageSpinner />

  return (
    <div className="space-y-6">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {/* Icon chip */}
          <div className="icon-chip icon-chip-periwinkle">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h1
              className="font-display"
              style={{ fontSize: 24, fontWeight: 700, color: 'var(--ink-900)', lineHeight: 1.2 }}
            >
              Təqvim
            </h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--ink-400)' }}>
              {AZ_MONTHS[currentMonth]} {currentYear}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Type filter */}
          <div className="w-44">
            <Select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
            >
              <option value="all">Bütün növlər</option>
              {Object.entries(TYPE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </Select>
          </div>

          {/* Segmented view toggle */}
          <div className="pastel-tabs">
            <button
              onClick={() => setView('calendar')}
              className={`pastel-tab flex items-center gap-1.5${view === 'calendar' ? ' active' : ''}`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              Təqvim
            </button>
            <button
              onClick={() => setView('list')}
              className={`pastel-tab flex items-center gap-1.5${view === 'list' ? ' active' : ''}`}
            >
              <List className="w-3.5 h-3.5" />
              Siyahı
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* ── Main Content ── */}
        <div className="lg:col-span-3">

          {/* ── Calendar View ── */}
          {view === 'calendar' && (
            <Card hover={false} className="p-0 overflow-hidden">

              {/* Month navigation bar */}
              <div
                className="flex items-center justify-between px-6 py-4"
                style={{ borderBottom: '1px solid var(--hairline)' }}
              >
                <button
                  onClick={prevMonth}
                  className="w-9 h-9 flex items-center justify-center rounded-tile transition-colors"
                  style={{ color: 'var(--ink-600)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--brand-50)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  aria-label="Əvvəlki ay"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <h2
                  style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink-900)' }}
                >
                  {AZ_MONTHS[currentMonth]} {currentYear}
                </h2>

                <button
                  onClick={nextMonth}
                  className="w-9 h-9 flex items-center justify-center rounded-tile transition-colors"
                  style={{ color: 'var(--ink-600)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--brand-50)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  aria-label="Növbəti ay"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Weekday headers */}
              <div
                className="grid grid-cols-7"
                style={{ borderBottom: '1px solid var(--hairline)', background: 'var(--surface-2)' }}
              >
                {AZ_WEEKDAYS.map(d => (
                  <div
                    key={d}
                    className="py-2 text-center"
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      color: 'var(--ink-400)',
                    }}
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Days grid */}
              <div className="grid grid-cols-7">
                {calendarDays.map((day, idx) => {
                  const dateStr = day ? toDateStr(currentYear, currentMonth, day) : null
                  const dayEvents = day ? eventsOnDay(day) : []
                  const isToday = dateStr === todayStr
                  const isSelected = selectedDayEvents?.dateStr === dateStr
                  const isLastCol = idx % 7 === 6
                  const hasEvents = dayEvents.length > 0

                  return (
                    <div
                      key={idx}
                      onClick={() => handleDayClick(day)}
                      className="min-h-[96px] p-2 relative transition-colors duration-150"
                      style={{
                        borderBottom: '1px solid var(--hairline)',
                        borderRight: isLastCol ? 'none' : '1px solid var(--hairline)',
                        background: !day
                          ? 'var(--surface-2)'
                          : isSelected
                          ? 'var(--brand-50)'
                          : 'var(--surface)',
                        cursor: day && hasEvents ? 'pointer' : day ? 'default' : 'default',
                      }}
                      onMouseEnter={e => {
                        if (day && hasEvents) e.currentTarget.style.background = isSelected ? 'var(--brand-50)' : 'rgba(20,22,40,0.025)'
                      }}
                      onMouseLeave={e => {
                        if (day) e.currentTarget.style.background = isSelected ? 'var(--brand-50)' : day ? 'var(--surface)' : 'var(--surface-2)'
                      }}
                    >
                      {day && (
                        <>
                          {/* Day number — today gets a solid brand chip (no glow) */}
                          <span
                            className={`inline-flex w-7 h-7 items-center justify-center mb-1${isToday ? ' font-display' : ''}`}
                            style={{
                              fontSize: 13,
                              fontWeight: isToday ? 700 : 500,
                              borderRadius: '999px',
                              background: isToday ? 'var(--brand-500)' : 'transparent',
                              color: isToday ? '#fff' : isSelected ? 'var(--brand-700)' : 'var(--ink-700)',
                            }}
                          >
                            {day}
                          </span>

                          {/* Event pills */}
                          <div className="space-y-0.5">
                            {dayEvents.slice(0, 3).map(event => {
                              const style = TYPE_CELL_STYLE[event.type] || TYPE_CELL_STYLE.other
                              return (
                                <div
                                  key={event.id}
                                  className="w-full text-left truncate font-semibold"
                                  style={{
                                    background: style.bg,
                                    color: style.text,
                                    borderLeft: `2px solid ${style.bar}`,
                                    borderRadius: 6,
                                    padding: '1px 6px',
                                    fontSize: 10,
                                    lineHeight: 1.5,
                                  }}
                                  title={event.title}
                                >
                                  {event.title}
                                </div>
                              )
                            })}
                            {dayEvents.length > 3 && (
                              <p
                                className="text-xs px-1"
                                style={{ color: 'var(--ink-400)', fontSize: 10 }}
                              >
                                +{dayEvents.length - 3} daha
                              </p>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* ── Selected Day Detail Panel ── */}
              {selectedDayEvents && (
                <div
                  className="animate-fade-in-up"
                  style={{
                    borderTop: '1px solid var(--hairline)',
                    padding: '20px 24px',
                    background: 'var(--brand-50)',
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: 'var(--brand-500)' }}
                      />
                      <h3
                        style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-900)' }}
                      >
                        {formatDate(selectedDayEvents.dateStr)}
                      </h3>
                      <span
                        className="pill-peri"
                        style={{ fontSize: 10, padding: '1px 8px' }}
                      >
                        {selectedDayEvents.events.length} tədbir
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedDayEvents(null)}
                      className="text-xs font-medium transition-colors"
                      style={{ color: 'var(--ink-400)' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--ink-700)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-400)'}
                    >
                      Bağla
                    </button>
                  </div>

                  <div className="space-y-2">
                    {selectedDayEvents.events.map(event => {
                      const accent = TYPE_ACCENT[event.type] || 'var(--brand-500)'
                      return (
                        <div
                          key={event.id}
                          className="flex items-start gap-3 rounded-tile"
                          style={{
                            background: 'var(--surface)',
                            padding: '10px 14px',
                            border: '1px solid var(--hairline)',
                          }}
                        >
                          <div
                            className="w-1 self-stretch rounded-full flex-shrink-0"
                            style={{ background: accent, minHeight: 32 }}
                          />
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-sm font-semibold"
                              style={{ color: 'var(--ink-900)' }}
                            >
                              {event.title}
                            </p>
                            {event.description && (
                              <p
                                className="text-xs mt-0.5"
                                style={{ color: 'var(--ink-600)' }}
                              >
                                {event.description}
                              </p>
                            )}
                          </div>
                          <TypeBadge type={event.type} />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* ── List View ── */}
          {view === 'list' && (
            <Card hover={false} className="p-0 overflow-hidden">
              {filteredEvents.length === 0 ? (
                <EmptyState
                  tier={1}
                  icon={CalendarDays}
                  title="Tədbir tapılmadı"
                  description="Bu seçimlə heç bir tədbir tapılmadı."
                />
              ) : (
                <div>
                  {filteredEvents.map((event, i) => {
                    const sameDay = event.start_date === event.end_date
                    const dateLabel = sameDay
                      ? formatDate(event.start_date)
                      : `${formatDate(event.start_date)} – ${formatDate(event.end_date)}`
                    const accent = TYPE_ACCENT[event.type] || 'var(--brand-500)'
                    const isLast = i === filteredEvents.length - 1

                    return (
                      <div
                        key={event.id}
                        className="flex items-start gap-4 px-6 py-4 transition-colors duration-150"
                        style={{
                          borderBottom: isLast ? 'none' : '1px solid var(--hairline)',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(20,22,40,0.025)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        {/* Accent bar */}
                        <div
                          className="flex-shrink-0 rounded-full self-stretch"
                          style={{ width: 3, minHeight: 48, background: accent }}
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm font-semibold"
                            style={{ color: 'var(--ink-900)' }}
                          >
                            {event.title}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Clock className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--ink-400)' }} />
                            <p className="text-xs" style={{ color: 'var(--ink-600)' }}>{dateLabel}</p>
                          </div>
                          {event.description && (
                            <p
                              className="text-xs mt-1 line-clamp-2"
                              style={{ color: 'var(--ink-400)' }}
                            >
                              {event.description}
                            </p>
                          )}
                        </div>
                        <TypeBadge type={event.type} />
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="lg:col-span-1 space-y-4">

          {/* Upcoming events card */}
          <Card hover={false} className="p-5">
            <div className="flex items-center gap-2 mb-1">
              <div className="icon-chip icon-chip-periwinkle" style={{ width: 32, height: 32 }}>
                <Clock className="w-4 h-4" />
              </div>
              <h2
                style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink-900)' }}
              >
                Yaxınlaşan tədbirlər
              </h2>
            </div>
            <p className="text-xs mb-4 ml-10" style={{ color: 'var(--ink-400)' }}>
              Növbəti 5 tədbir
            </p>

            {upcomingEvents.length === 0 ? (
              <div
                className="flex flex-col items-center text-center py-6 rounded-tile"
                style={{ background: 'var(--surface-2)', border: '1px dashed var(--hairline-strong)' }}
              >
                <CalendarDays
                  className="w-8 h-8 mb-2"
                  style={{ color: 'var(--ink-400)' }}
                />
                <p className="text-sm font-medium" style={{ color: 'var(--ink-600)' }}>
                  Yaxın tədbir yoxdur
                </p>
              </div>
            ) : (
              <div className="space-y-0">
                {upcomingEvents.map(event => (
                  <UpcomingEventItem key={event.id} event={event} />
                ))}
              </div>
            )}
          </Card>

          {/* Legend card */}
          <Card hover={false} className="p-5">
            <h3
              className="mb-3"
              style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-400)', letterSpacing: '0.04em', textTransform: 'uppercase' }}
            >
              Növlər
            </h3>
            <div className="flex flex-wrap gap-2">
              {Object.keys(TYPE_LABELS).map(type => (
                <LegendItem key={type} type={type} />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
