import { useState, useEffect } from 'react'
import {
  Plus, ChevronLeft, ChevronRight, Edit2, Trash2,
  Calendar, List, CalendarDays,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Input'
import { Select } from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'

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

const VISIBLE_LABELS = {
  all: 'Hamı',
  teachers: 'Müəllimlər',
  students: 'Şagirdlər',
  parents: 'Valideynlər',
  admin: 'Admin',
}

// Low-dial: pill-* status pills. Type is categorical, so keep restrained —
// only genuinely meaning-bearing types (holiday/exam) carry a tint; rest stay muted.
const TYPE_PILL_CLASS = {
  holiday: 'pill-rose',
  exam:    'pill-peri',
  meeting: 'pill-muted',
  event:   'pill-muted',
  other:   'pill-muted',
}

// Left-border accent fallback (used when an event has no explicit color)
const TYPE_BORDER_COLORS = {
  holiday: 'var(--danger)',
  exam:    'var(--brand-500)',
  meeting: 'var(--brand-400)',
  event:   'var(--brand-400)',
  other:   'var(--ink-400)',
}

// V3 brand + muted-token palette (no legacy candy hex)
const PRESET_COLORS = [
  { value: '#574FCF', label: 'Bənövşəyi' },
  { value: '#3BA8E6', label: 'Mavi'       },
  { value: '#EAB308', label: 'Şəftəli'   },
  { value: '#1FA855', label: 'Yaşıl'     },
  { value: '#EF4444', label: 'Qırmızı'   },
]

const AZ_MONTHS = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun',
  'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr',
]

const AZ_WEEKDAYS = ['B.e', 'Ç.a', 'Çər', 'C.a', 'Cüm', 'Şən', 'Baz']

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildCalendarDays(year, month) {
  // month is 0-indexed
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  // JS Sunday=0, we want Monday=0
  const startOffset = (firstDay.getDay() + 6) % 7
  const days = []

  // Pad with nulls for days before the 1st
  for (let i = 0; i < startOffset; i++) days.push(null)
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(d)
  // Pad to complete the last row
  while (days.length % 7 !== 0) days.push(null)

  return days
}

function toDateStr(year, month, day) {
  const mm = String(month + 1).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  return `${year}-${mm}-${dd}`
}

function eventFallsOnDay(event, dateStr) {
  if (!event.start_date || !event.end_date) return false
  return event.start_date <= dateStr && event.end_date >= dateStr
}

function emptyForm() {
  return {
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    type: 'event',
    visible_to: 'all',
    color: PRESET_COLORS[0].value,
  }
}

// ─── Type Badge ───────────────────────────────────────────────────────────────

function TypeBadge({ type }) {
  return (
    <span className={`${TYPE_PILL_CLASS[type] || 'pill-muted'}`}>
      {TYPE_LABELS[type] || type}
    </span>
  )
}

// ─── Color Picker ─────────────────────────────────────────────────────────────

function ColorPicker({ value, onChange }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-ink-700 uppercase tracking-wide mb-1.5">Rəng</label>
      <div className="flex items-center gap-3">
        {PRESET_COLORS.map(c => (
          <button
            key={c.value}
            type="button"
            title={c.label}
            onClick={() => onChange(c.value)}
            className={`w-7 h-7 rounded-full border-2 transition-transform ${value === c.value ? 'border-ink-900 scale-110' : 'border-hairline hover:scale-105'}`}
            style={{ backgroundColor: c.value }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Events() {
  const { profile } = useAuth()

  const today = new Date()
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [view, setView] = useState('calendar') // 'calendar' | 'list'

  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const [addModal, setAddModal] = useState(false)
  const [editModal, setEditModal] = useState(null)
  const [deleteModal, setDeleteModal] = useState(null)

  const [form, setForm] = useState(emptyForm())

  // ── Data fetching ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (profile?.school_id) fetchEvents()
  }, [profile?.school_id])

  async function fetchEvents() {
    try {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('events')
        .select('*')
        .eq('school_id', profile.school_id)
        .order('start_date')
        .limit(500)
      if (err) throw err
      setEvents(data || [])
    } catch (err) {
      console.error('fetchEvents error:', err)
      setError('Xəta baş verdi')
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

  // ── Modal helpers ──────────────────────────────────────────────────────────

  function openAdd(prefillDate = '') {
    setForm({ ...emptyForm(), start_date: prefillDate, end_date: prefillDate })
    setError(null)
    setAddModal(true)
  }

  function openEdit(event) {
    setForm({
      title: event.title,
      description: event.description || '',
      start_date: event.start_date,
      end_date: event.end_date,
      type: event.type,
      visible_to: event.visible_to,
      color: event.color || PRESET_COLORS[0].value,
    })
    setError(null)
    setEditModal(event)
  }

  function setField(key, value) {
    setForm(f => ({ ...f, [key]: value }))
  }

  // ── CRUD ───────────────────────────────────────────────────────────────────

  async function handleAdd() {
    if (!form.title.trim()) { setError('Başlıq mütləqdir'); return }
    if (!form.start_date || !form.end_date) { setError('Tarixlər mütləqdir'); return }
    try {
      setSaving(true)
      setError(null)
      const { error: err } = await supabase.from('events').insert({
        school_id: profile.school_id,
        title: form.title.trim(),
        description: form.description.trim() || null,
        start_date: form.start_date,
        end_date: form.end_date,
        type: form.type,
        visible_to: form.visible_to,
        color: form.color,
        created_by: profile.id,
      })
      if (err) throw err
      setAddModal(false)
      await fetchEvents()
    } catch (err) {
      console.error('handleAdd error:', err)
      setError('Xəta baş verdi')
    } finally {
      setSaving(false)
    }
  }

  async function handleEdit() {
    if (!form.title.trim()) { setError('Başlıq mütləqdir'); return }
    if (!form.start_date || !form.end_date) { setError('Tarixlər mütləqdir'); return }
    try {
      setSaving(true)
      setError(null)
      const { error: err } = await supabase.from('events').update({
        title: form.title.trim(),
        description: form.description.trim() || null,
        start_date: form.start_date,
        end_date: form.end_date,
        type: form.type,
        visible_to: form.visible_to,
        color: form.color,
      }).eq('id', editModal.id)
      if (err) throw err
      setEditModal(null)
      await fetchEvents()
    } catch (err) {
      console.error('handleEdit error:', err)
      setError('Xəta baş verdi')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    try {
      setSaving(true)
      const { error: err } = await supabase.from('events').delete().eq('id', deleteModal.id)
      if (err) throw err
      setDeleteModal(null)
      await fetchEvents()
    } catch (err) {
      console.error('handleDelete error:', err)
      setError('Xəta baş verdi')
    } finally {
      setSaving(false)
    }
  }

  // ── Calendar helpers ───────────────────────────────────────────────────────

  function eventsOnDay(day) {
    if (!day) return []
    const dateStr = toDateStr(currentYear, currentMonth, day)
    return events.filter(e => eventFallsOnDay(e, dateStr))
  }

  const calendarDays = buildCalendarDays(currentYear, currentMonth)

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) return <PageSpinner />

  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate())

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-ink-900 font-display">Tədbirlər və Təqvim</h1>
        <div className="flex items-center gap-3">
          {/* View toggle — segmented pill group (admin LOW dial) */}
          <div className="flex items-center bg-surface-2 border border-hairline rounded-tile p-0.5 gap-0.5">
            <button
              onClick={() => setView('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-input transition-all ${
                view === 'calendar'
                  ? 'bg-surface text-brand-700 shadow-soft'
                  : 'text-ink-400 hover:text-ink-700'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              Təqvim
            </button>
            <button
              onClick={() => setView('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-input transition-all ${
                view === 'list'
                  ? 'bg-surface text-brand-700 shadow-soft'
                  : 'text-ink-400 hover:text-ink-700'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Siyahı
            </button>
          </div>
          <Button onClick={() => openAdd()}>
            <span className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> Tədbir əlavə et
            </span>
          </Button>
        </div>
      </div>

      {/* ── Calendar View ── */}
      {view === 'calendar' && (
        <div className="bg-surface border border-hairline rounded-tile overflow-hidden">
          {/* Month navigation */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-hairline bg-surface-2">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-input hover:bg-surface transition-colors text-ink-600 hover:text-ink-900"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3">
              <h2 className="text-base font-semibold text-ink-900">
                {AZ_MONTHS[currentMonth]} {currentYear}
              </h2>
              {(currentMonth !== today.getMonth() || currentYear !== today.getFullYear()) && (
                <button
                  onClick={() => { setCurrentMonth(today.getMonth()); setCurrentYear(today.getFullYear()) }}
                  className="pill-peri text-xs cursor-pointer"
                >
                  Bu gün
                </button>
              )}
            </div>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-input hover:bg-surface transition-colors text-ink-600 hover:text-ink-900"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-hairline">
            {AZ_WEEKDAYS.map(d => (
              <div key={d} className="py-2 text-center text-xs font-semibold text-ink-400 uppercase tracking-wide">
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

              return (
                <div
                  key={idx}
                  onClick={() => day && openAdd(dateStr)}
                  className={`
                    min-h-[88px] border-b border-r border-hairline p-1.5 relative
                    ${day ? 'cursor-pointer hover:bg-brand-50/40 transition-colors' : 'bg-surface-2/60'}
                    ${idx % 7 === 6 ? 'border-r-0' : ''}
                  `}
                >
                  {day && (
                    <>
                      <span
                        className={`inline-flex w-6 h-6 items-center justify-center rounded-full text-xs font-bold mb-1 tabular-nums ${
                          isToday
                            ? 'bg-brand-500 text-white shadow-soft'
                            : 'text-ink-700'
                        }`}
                      >
                        {day}
                      </span>
                      <div className="space-y-0.5">
                        {dayEvents.slice(0, 3).map(event => {
                          // §4.7 muted event block: ~12% tint fill + accent left-bar + dark text
                          const accent = event.color || 'var(--brand-500)'
                          return (
                            <button
                              key={event.id}
                              onClick={(e) => { e.stopPropagation(); openEdit(event) }}
                              className="w-full text-left text-[11px] pl-2 pr-1.5 py-0.5 rounded-ctl truncate font-semibold text-ink-700 hover:opacity-80 transition-opacity border-l-2"
                              style={{
                                backgroundColor: (event.color || '#574FCF') + '1F',
                                borderColor: accent,
                              }}
                              title={event.title}
                            >
                              {event.title}
                            </button>
                          )
                        })}
                        {dayEvents.length > 3 && (
                          <p className="text-[10px] text-ink-400 px-1 tabular-nums">+{dayEvents.length - 3} daha</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── List View ── */}
      {view === 'list' && (
        <>
          {events.length === 0 ? (
            <Card hover={false} className="p-0 overflow-hidden">
              <EmptyState
                icon={Calendar}
                title="Tədbir yoxdur"
                description="Hələ heç bir tədbir əlavə edilməyib."
                actionLabel="Tədbir əlavə et"
                onAction={() => openAdd()}
              />
            </Card>
          ) : (() => {
            // Group events by year-month of start_date
            const groups = {}
            for (const event of events) {
              if (!event.start_date) continue
              const [year, month] = event.start_date.split('-')
              const key = `${year}-${month}`
              if (!groups[key]) groups[key] = { year: Number(year), month: Number(month) - 1, items: [] }
              groups[key].items.push(event)
            }
            const sortedKeys = Object.keys(groups).sort()
            return (
              <div className="space-y-8">
                {sortedKeys.map(key => {
                  const group = groups[key]
                  return (
                    <div key={key}>
                      {/* Month heading */}
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xs font-semibold text-ink-400 uppercase tracking-wide">
                          {AZ_MONTHS[group.month]} {group.year}
                        </h3>
                        <div className="flex-1 h-px bg-hairline" />
                        <span className="text-xs text-ink-400 tabular-nums">{group.items.length} tədbir</span>
                      </div>

                      <div className="space-y-2">
                        {group.items.map(event => {
                          const isToday = event.start_date <= todayStr && event.end_date >= todayStr
                          const borderColor = event.color || TYPE_BORDER_COLORS[event.type] || 'var(--ink-400)'
                          const startParts = event.start_date?.split('-') || []
                          const endParts = event.end_date?.split('-') || []
                          const isSameDay = event.start_date === event.end_date
                          const dateLabel = isSameDay
                            ? `${startParts[2]} ${AZ_MONTHS[Number(startParts[1]) - 1] || ''}`
                            : `${startParts[2]} ${AZ_MONTHS[Number(startParts[1]) - 1] || ''} – ${endParts[2]} ${AZ_MONTHS[Number(endParts[1]) - 1] || ''}`

                          return (
                            <div
                              key={event.id}
                              className={`bg-surface border border-hairline rounded-tile flex items-stretch overflow-hidden transition-shadow hover:shadow-soft ${isToday ? 'ring-1 ring-brand-300' : ''}`}
                            >
                              {/* Colored left accent */}
                              <div className="w-1 flex-shrink-0" style={{ backgroundColor: borderColor }} />

                              {/* Date block */}
                              <div className="flex flex-col items-center justify-center px-4 py-3 min-w-[60px] border-r border-hairline">
                                <span className="text-lg font-bold text-ink-900 leading-none tabular-nums">
                                  {startParts[2]}
                                </span>
                                <span className="text-xs text-ink-400 mt-0.5">
                                  {AZ_MONTHS[Number(startParts[1]) - 1]?.slice(0, 3) || ''}
                                </span>
                                {isToday && (
                                  <span className="pill-peri mt-1 text-[10px]">Bu gün</span>
                                )}
                              </div>

                              {/* Event info */}
                              <div className="flex-1 px-4 py-3 flex items-center gap-3">
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-ink-900 truncate">{event.title}</p>
                                  {!isSameDay && (
                                    <p className="text-xs text-ink-400 mt-0.5 tabular-nums">{dateLabel}</p>
                                  )}
                                  {event.description && (
                                    <p className="text-xs text-ink-400 mt-0.5 truncate">{event.description}</p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <TypeBadge type={event.type} />
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-1 pr-3">
                                <button
                                  onClick={() => openEdit(event)}
                                  className="p-1.5 text-ink-400 hover:text-brand-600 transition-colors rounded-input hover:bg-brand-50"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setDeleteModal(event)}
                                  className="p-1.5 text-ink-400 hover:text-danger transition-colors rounded-input hover:bg-danger/8"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })()}
        </>
      )}

      {/* ── Event form (shared by Add & Edit) ── */}
      {[
        { open: addModal, onClose: () => { setAddModal(false); setForm(emptyForm()); setError(null) }, title: 'Tədbir əlavə et', onSubmit: handleAdd, submitLabel: 'Əlavə et' },
        { open: !!editModal, onClose: () => { setEditModal(null); setForm(emptyForm()); setError(null) }, title: 'Tədbiri redaktə et', onSubmit: handleEdit, submitLabel: 'Yadda saxla' },
      ].map(({ open, onClose, title, onSubmit, submitLabel }) => (
        <Modal key={title} open={open} onClose={onClose} title={title} size="lg">
          <div className="space-y-4">
            <Input
              label="Başlıq *"
              placeholder="Tədbirin adı"
              value={form.title}
              onChange={e => setField('title', e.target.value)}
            />
            <Textarea
              label="Təsvir"
              placeholder="Ətraflı məlumat..."
              rows={3}
              value={form.description}
              onChange={e => setField('description', e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Başlanğıc tarixi *"
                type="date"
                value={form.start_date}
                onChange={e => setField('start_date', e.target.value)}
              />
              <Input
                label="Bitmə tarixi *"
                type="date"
                value={form.end_date}
                onChange={e => setField('end_date', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select label="Növ" value={form.type} onChange={e => setField('type', e.target.value)}>
                {Object.entries(TYPE_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </Select>
              <Select label="Görünür" value={form.visible_to} onChange={e => setField('visible_to', e.target.value)}>
                {Object.entries(VISIBLE_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </Select>
            </div>
            <ColorPicker value={form.color} onChange={v => setField('color', v)} />
            {error && (
              <p className="text-sm text-danger bg-danger/8 border border-danger/20 rounded-input px-3 py-2">{error}</p>
            )}
            <div className="flex justify-end gap-3 pt-2 border-t border-hairline">
              <Button variant="ghost" onClick={onClose}>Ləğv et</Button>
              <Button onClick={onSubmit} loading={saving}>{submitLabel}</Button>
            </div>
          </div>
        </Modal>
      ))}

      {/* ── Delete Confirmation Modal ── */}
      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="Silmə təsdiqi" size="sm">
        <p className="text-sm text-ink-600 mb-6">
          <strong className="text-ink-900">{deleteModal?.title}</strong> adlı tədbiri silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz.
        </p>
        <div className="flex justify-end gap-3 pt-4 border-t border-hairline">
          <Button variant="ghost" onClick={() => setDeleteModal(null)}>Ləğv et</Button>
          <Button variant="danger" onClick={handleDelete} loading={saving}>Sil</Button>
        </div>
      </Modal>
    </div>
  )
}
