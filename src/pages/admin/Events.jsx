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
import Table from '../../components/ui/Table'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import Badge from '../../components/ui/Badge'

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

const TYPE_BADGE_CLASSES = {
  holiday: 'bg-red-100 text-red-700',
  exam: 'bg-purple-light text-purple',
  meeting: 'bg-blue-50 text-blue-700',
  event: 'bg-teal-light text-teal',
  other: 'bg-gray-100 text-gray-600',
}

const PRESET_COLORS = [
  { value: '#7C3AED', label: 'Bənövşəyi' },
  { value: '#0D9488', label: 'Firuzəyi' },
  { value: '#DC2626', label: 'Qırmızı' },
  { value: '#2563EB', label: 'Mavi' },
  { value: '#D97706', label: 'Narıncı' },
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
    <span className={`rounded-full text-xs font-medium px-3 py-0.5 inline-flex items-center ${TYPE_BADGE_CLASSES[type] || 'bg-gray-100 text-gray-600'}`}>
      {TYPE_LABELS[type] || type}
    </span>
  )
}

// ─── Color Picker ─────────────────────────────────────────────────────────────

function ColorPicker({ value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">Rəng</label>
      <div className="flex items-center gap-3">
        {PRESET_COLORS.map(c => (
          <button
            key={c.value}
            type="button"
            title={c.label}
            onClick={() => onChange(c.value)}
            className={`w-8 h-8 rounded-full border-2 transition-transform ${value === c.value ? 'border-gray-800 scale-110' : 'border-transparent hover:scale-105'}`}
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

  // ── Table columns ──────────────────────────────────────────────────────────

  const columns = [
    {
      key: 'title',
      label: 'Başlıq',
      render: (val, row) => (
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: row.color || '#7C3AED' }}
          />
          <span className="font-medium text-gray-900">{val}</span>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Növ',
      render: (val) => <TypeBadge type={val} />,
    },
    {
      key: 'start_date',
      label: 'Başlanğıc',
      render: (val) => val,
    },
    {
      key: 'end_date',
      label: 'Bitmə',
      render: (val) => val,
    },
    {
      key: 'visible_to',
      label: 'Görünür',
      render: (val) => VISIBLE_LABELS[val] || val,
    },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); openEdit(row) }}
            className="p-1.5 text-gray-400 hover:text-purple transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setDeleteModal(row) }}
            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) return <PageSpinner />

  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate())

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-serif text-3xl text-gray-900">Tədbirlər və Təqvim</h1>
        <div className="flex items-center gap-3">
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
          <Button onClick={() => openAdd()}>
            <span className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> Tədbir əlavə et
            </span>
          </Button>
        </div>
      </div>

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

              return (
                <div
                  key={idx}
                  onClick={() => day && openAdd(dateStr)}
                  className={`
                    min-h-[96px] border-b border-r border-border-soft p-1.5 relative
                    ${day ? 'cursor-pointer hover:bg-surface transition-colors' : 'bg-gray-50/50'}
                    ${idx % 7 === 6 ? 'border-r-0' : ''}
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
                          <button
                            key={event.id}
                            onClick={(e) => { e.stopPropagation(); openEdit(event) }}
                            className="w-full text-left text-xs px-1.5 py-0.5 rounded truncate font-medium hover:opacity-80 transition-opacity"
                            style={{
                              backgroundColor: (event.color || '#7C3AED') + '22',
                              color: event.color || '#7C3AED',
                            }}
                            title={event.title}
                          >
                            {event.title}
                          </button>
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
        </Card>
      )}

      {/* ── List View ── */}
      {view === 'list' && (
        <Card hover={false} className="p-0 overflow-hidden">
          {events.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="Tədbir yoxdur"
              description="Hələ heç bir tədbir əlavə edilməyib."
              actionLabel="Tədbir əlavə et"
              onAction={() => openAdd()}
            />
          ) : (
            <Table columns={columns} data={events} />
          )}
        </Card>
      )}

      {/* ── Add Modal ── */}
      <Modal open={addModal} onClose={() => setAddModal(false)} title="Tədbir əlavə et" size="lg">
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
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setAddModal(false)}>Ləğv et</Button>
            <Button onClick={handleAdd} loading={saving}>Əlavə et</Button>
          </div>
        </div>
      </Modal>

      {/* ── Edit Modal ── */}
      <Modal open={!!editModal} onClose={() => setEditModal(null)} title="Tədbiri redaktə et" size="lg">
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
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setEditModal(null)}>Ləğv et</Button>
            <Button onClick={handleEdit} loading={saving}>Yadda saxla</Button>
          </div>
        </div>
      </Modal>

      {/* ── Delete Confirmation Modal ── */}
      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="Silmə təsdiqi" size="sm">
        <p className="text-sm text-gray-600 mb-6">
          <strong>{deleteModal?.title}</strong> adlı tədbiri silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeleteModal(null)}>Ləğv et</Button>
          <Button variant="danger" onClick={handleDelete} loading={saving}>Sil</Button>
        </div>
      </Modal>
    </div>
  )
}
