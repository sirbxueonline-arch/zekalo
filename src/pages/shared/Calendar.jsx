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

const TYPE_BADGE_CLASSES = {
  holiday: 'bg-red-100 text-red-700',
  exam: 'bg-purple-light text-purple',
  meeting: 'bg-blue-50 text-blue-700',
  event: 'bg-teal-light text-teal',
  other: 'bg-gray-100 text-gray-600',
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

// ─── Type Badge ───────────────────────────────────────────────────────────────

function TypeBadge({ type }) {
  return (
    <span className={`rounded-full text-xs font-medium px-3 py-0.5 inline-flex items-center ${TYPE_BADGE_CLASSES[type] || 'bg-gray-100 text-gray-600'}`}>
      {TYPE_LABELS[type] || type}
    </span>
  )
}

// ─── Upcoming Event Card ───────────────────────────────────────────────────────

function UpcomingEventItem({ event }) {
  const sameDay = event.start_date === event.end_date
  const dateLabel = sameDay
    ? formatDate(event.start_date)
    : `${formatDate(event.start_date)} – ${formatDate(event.end_date)}`

  return (
    <div className="flex items-start gap-3 py-3 border-b border-border-soft last:border-b-0">
      <div
        className="w-1 self-stretch rounded-full flex-shrink-0 mt-0.5"
        style={{ backgroundColor: event.color || '#7C3AED', minHeight: '40px' }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <Clock className="w-3 h-3 text-gray-400 flex-shrink-0" />
          <p className="text-xs text-gray-500">{dateLabel}</p>
        </div>
        {event.description && (
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{event.description}</p>
        )}
      </div>
      <TypeBadge type={event.type} />
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

      // Build filter: show events visible to 'all' or to this specific role
      let query = supabase
        .from('events')
        .select('*')
        .eq('school_id', profile.school_id)
        .order('start_date')

      if (roleValue) {
        query = query.or(`visible_to.eq.all,visible_to.eq.${roleValue}`)
      } else {
        // Fallback: only show 'all' events for unknown roles
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
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) return <PageSpinner />

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-serif text-3xl text-gray-900">Təqvim</h1>
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
          {/* View toggle */}
          <div className="flex items-center border border-border-soft rounded-lg overflow-hidden">
            <button
              onClick={() => setView('calendar')}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm transition-colors ${view === 'calendar' ? 'bg-purple text-white' : 'text-gray-600 hover:bg-surface'}`}
            >
              <CalendarDays className="w-4 h-4" />
              Təqvim
            </button>
            <button
              onClick={() => setView('list')}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm transition-colors ${view === 'list' ? 'bg-purple text-white' : 'text-gray-600 hover:bg-surface'}`}
            >
              <List className="w-4 h-4" />
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
              {/* Month navigation */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border-soft">
                <button
                  onClick={prevMonth}
                  className="p-2 rounded-lg hover:bg-surface transition-colors text-gray-600"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="font-serif text-xl text-gray-900">
                  {AZ_MONTHS[currentMonth]} {currentYear}
                </h2>
                <button
                  onClick={nextMonth}
                  className="p-2 rounded-lg hover:bg-surface transition-colors text-gray-600"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Weekday headers */}
              <div className="grid grid-cols-7 border-b border-border-soft">
                {AZ_WEEKDAYS.map(d => (
                  <div key={d} className="py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
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

                  return (
                    <div
                      key={idx}
                      onClick={() => handleDayClick(day)}
                      className={`
                        min-h-[96px] border-b border-r border-border-soft p-1.5 relative
                        ${day && dayEvents.length > 0 ? 'cursor-pointer hover:bg-surface' : day ? 'cursor-default' : 'bg-gray-50/50'}
                        ${isSelected ? 'bg-purple-light/40' : ''}
                        ${idx % 7 === 6 ? 'border-r-0' : ''}
                        transition-colors
                      `}
                    >
                      {day && (
                        <>
                          <span className={`
                            inline-flex w-6 h-6 items-center justify-center rounded-full text-xs font-medium mb-1
                            ${isToday ? 'bg-purple text-white' : 'text-gray-700'}
                          `}>
                            {day}
                          </span>
                          <div className="space-y-0.5">
                            {dayEvents.slice(0, 3).map(event => (
                              <div
                                key={event.id}
                                className="w-full text-left text-xs px-1.5 py-0.5 rounded truncate font-medium"
                                style={{
                                  backgroundColor: (event.color || '#7C3AED') + '22',
                                  color: event.color || '#7C3AED',
                                }}
                                title={event.title}
                              >
                                {event.title}
                              </div>
                            ))}
                            {dayEvents.length > 3 && (
                              <p className="text-xs text-gray-400 px-1">+{dayEvents.length - 3} daha</p>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Selected day panel */}
              {selectedDayEvents && (
                <div className="border-t border-border-soft px-6 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900 text-sm">
                      {formatDate(selectedDayEvents.dateStr)} — tədbirlər
                    </h3>
                    <button
                      onClick={() => setSelectedDayEvents(null)}
                      className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      Bağla
                    </button>
                  </div>
                  <div className="space-y-2">
                    {selectedDayEvents.events.map(event => (
                      <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg bg-surface">
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                          style={{ backgroundColor: event.color || '#7C3AED' }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{event.title}</p>
                          {event.description && (
                            <p className="text-xs text-gray-500 mt-0.5">{event.description}</p>
                          )}
                        </div>
                        <TypeBadge type={event.type} />
                      </div>
                    ))}
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
                  icon={CalendarDays}
                  title="Tədbir yoxdur"
                  description="Bu seçimlə heç bir tədbir tapılmadı."
                />
              ) : (
                <div className="divide-y divide-border-soft">
                  {filteredEvents.map(event => {
                    const sameDay = event.start_date === event.end_date
                    const dateLabel = sameDay
                      ? formatDate(event.start_date)
                      : `${formatDate(event.start_date)} – ${formatDate(event.end_date)}`
                    return (
                      <div key={event.id} className="flex items-start gap-4 px-6 py-4 hover:bg-surface transition-colors">
                        <div
                          className="w-1.5 self-stretch rounded-full flex-shrink-0"
                          style={{ backgroundColor: event.color || '#7C3AED', minHeight: '48px' }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{event.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Clock className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            <p className="text-xs text-gray-500">{dateLabel}</p>
                          </div>
                          {event.description && (
                            <p className="text-xs text-gray-400 mt-1 line-clamp-2">{event.description}</p>
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

        {/* ── Upcoming Events Sidebar ── */}
        <div className="lg:col-span-1">
          <Card hover={false} className="p-6">
            <h2 className="font-serif text-lg text-gray-900 mb-1">Yaxınlaşan tədbirlər</h2>
            <p className="text-xs text-gray-400 mb-4">Növbəti 5 tədbir</p>
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center">Yaxın tədbir yoxdur</p>
            ) : (
              <div>
                {upcomingEvents.map(event => (
                  <UpcomingEventItem key={event.id} event={event} />
                ))}
              </div>
            )}
          </Card>

          {/* Legend */}
          <Card hover={false} className="p-6 mt-4">
            <h3 className="font-medium text-sm text-gray-700 mb-3">Növlər</h3>
            <div className="space-y-2">
              {Object.entries(TYPE_LABELS).map(([type, label]) => (
                <div key={type} className="flex items-center gap-2">
                  <span className={`rounded-full text-xs font-medium px-2.5 py-0.5 ${TYPE_BADGE_CLASSES[type]}`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
