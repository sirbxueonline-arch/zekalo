import { useState, useEffect } from 'react'
import { Plus, DoorOpen, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import Input from '../../components/ui/Input'
import { Select, Textarea } from '../../components/ui/Input'
import { fmtDate } from '../../lib/dateUtils'

const ROOMS = [
  { id: 'r1', name: 'Sinif 101', type: 'classroom' },
  { id: 'r2', name: 'Sinif 102', type: 'classroom' },
  { id: 'r3', name: 'Elm laboratoriyası', type: 'lab' },
  { id: 'r4', name: 'Kompüter otağı', type: 'lab' },
  { id: 'r5', name: 'Konfrans zalı', type: 'meeting' },
  { id: 'r6', name: 'İdman zalı', type: 'sports' },
  { id: 'r7', name: 'Kitabxana', type: 'library' },
  { id: 'r8', name: 'Musiqi otağı', type: 'arts' },
]

const HOURS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']

// Low-dial (§2.2 color restraint): room type is categorical, not status — keep it
// muted. Saturated rainbow rotation collapses to a single neutral chip.
const roomTypePill = 'pill-muted'

function formatDate(date) {
  return date.toISOString().split('T')[0]
}

function displayDate(dateStr) {
  return fmtDate(new Date(dateStr + 'T12:00:00'), { weekday: 'long', day: 'numeric', month: 'long' })
}

function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}


export default function RoomBooking() {
  const { profile, t } = useAuth()
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState([])
  const [teachers, setTeachers] = useState([])
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()))
  const [addModal, setAddModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({ room_id: '', teacher_id: '', teacher_name: '', date: formatDate(new Date()), time_from: '09:00', time_to: '10:00', purpose: '' })

  useEffect(() => {
    if (profile?.school_id) fetchData()
  }, [profile?.school_id, selectedDate])

  async function fetchData() {
    try {
      setLoading(true)
      const [bookRes, teacherRes] = await Promise.all([
        supabase.from('room_bookings').select('*, teacher:profiles(id,full_name)').eq('school_id', profile.school_id).eq('date', selectedDate),
        supabase.from('profiles').select('id,full_name').eq('school_id', profile.school_id).eq('role', 'teacher'),
      ])

      if (bookRes.error) throw bookRes.error
      const formatted = (bookRes.data || []).map(b => ({ ...b, teacher_name: b.teacher?.full_name || b.teacher_name || '—' }))
      setBookings(formatted)
      setTeachers(teacherRes.data || [])
    } catch {
      setBookings([])
      try {
        const { data } = await supabase.from('profiles').select('id,full_name').eq('school_id', profile.school_id).eq('role', 'teacher')
        setTeachers(data || [])
      } catch {}
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setForm({ room_id: ROOMS[0].id, teacher_id: '', teacher_name: '', date: selectedDate, time_from: '09:00', time_to: '10:00', purpose: '' })
  }

  async function handleAdd() {
    try {
      setSaving(true)
      setError(null)

      // Validate that start time is before end time
      if (timeToMinutes(form.time_from) >= timeToMinutes(form.time_to)) {
        setError('Başlama saatı bitmə saatından əvvəl olmalıdır.')
        setSaving(false)
        return
      }

      // Check for overlapping bookings in the same room on the same date
      const { data: existing, error: overlapErr } = await supabase
        .from('room_bookings')
        .select('id, time_from, time_to')
        .eq('school_id', profile.school_id)
        .eq('room_id', form.room_id)
        .eq('date', form.date)
      if (overlapErr) throw overlapErr

      const newStart = timeToMinutes(form.time_from)
      const newEnd = timeToMinutes(form.time_to)
      const hasOverlap = (existing || []).some(b => {
        const bStart = timeToMinutes(b.time_from)
        const bEnd = timeToMinutes(b.time_to)
        return newStart < bEnd && newEnd > bStart
      })
      if (hasOverlap) {
        setError('Bu otaq seçilmiş vaxt aralığında artıq rezerv edilib.')
        setSaving(false)
        return
      }

      const teacher = teachers.find(t => t.id === form.teacher_id)
      const { error: err } = await supabase.from('room_bookings').insert({
        room_id: form.room_id,
        teacher_id: form.teacher_id || null,
        teacher_name: teacher?.full_name || form.teacher_name,
        date: form.date,
        time_from: form.time_from,
        time_to: form.time_to,
        purpose: form.purpose,
        school_id: profile.school_id,
      })
      if (err) throw err
      setAddModal(false)
      resetForm()
      await fetchData()
    } catch (err) {
      setError(err.message || t('error'))
    } finally {
      setSaving(false)
    }
  }

  function changeDate(delta) {
    const d = new Date(selectedDate + 'T12:00:00')
    d.setDate(d.getDate() + delta)
    setSelectedDate(formatDate(d))
  }

  function getBookingsForRoom(roomId) {
    return bookings.filter(b => b.room_id === roomId)
  }

  function bookingStyle(booking) {
    const startMin = timeToMinutes(booking.time_from)
    const endMin = timeToMinutes(booking.time_to)
    const dayStart = timeToMinutes('08:00')
    const dayEnd = timeToMinutes('18:00')
    const totalMinutes = dayEnd - dayStart
    const left = ((startMin - dayStart) / totalMinutes) * 100
    const width = ((endMin - startMin) / totalMinutes) * 100
    return { left: `${left}%`, width: `${width}%` }
  }

  if (loading) return <PageSpinner />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-900 font-display">Otaq Rezervasiyası</h1>
          <p className="text-sm text-ink-400 mt-0.5 tabular-nums">
            {bookings.length} bu gün üçün rezervasiya
          </p>
        </div>
        <Button onClick={() => { resetForm(); setAddModal(true) }}>
          <span className="flex items-center gap-2"><Plus className="w-4 h-4" /> Rezervasiya et</span>
        </Button>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => changeDate(-1)}
          className="p-1.5 rounded-input border border-hairline hover:border-brand-300 hover:text-brand-600 transition-colors text-ink-600"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h2 className="font-semibold text-ink-900 capitalize text-sm">{displayDate(selectedDate)}</h2>
        <button
          onClick={() => changeDate(1)}
          className="p-1.5 rounded-input border border-hairline hover:border-brand-300 hover:text-brand-600 transition-colors text-ink-600"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => setSelectedDate(formatDate(new Date()))}
          className="pill-peri cursor-pointer text-xs"
        >
          Bu gün
        </button>
      </div>

      {/* Timeline Grid */}
      <div className="bg-surface border border-hairline rounded-tile p-4 overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Time axis */}
          <div className="flex mb-3 pl-36">
            {HOURS.map(h => (
              <div key={h} className="flex-1 text-xs text-ink-400 font-semibold tabular-nums">{h}</div>
            ))}
          </div>

          {/* Rooms */}
          <div className="space-y-2.5">
            {ROOMS.map((room, ri) => {
              const roomBookings = getBookingsForRoom(room.id)
              return (
                <div key={room.id} className="flex items-center gap-3">
                  {/* Room label */}
                  <div className="w-32 shrink-0 pr-2">
                    <p className="text-sm font-semibold text-ink-700 truncate">{room.name}</p>
                    <span className={`${roomTypePill} text-[10px] mt-0.5`}>
                      {room.type}
                    </span>
                  </div>

                  {/* Timeline bar */}
                  <div className="flex-1 relative h-9 bg-surface-2 rounded-input border border-hairline overflow-hidden">
                    {/* Hour gridlines */}
                    {HOURS.slice(0, -1).map((_, i) => (
                      <div
                        key={i}
                        className="absolute top-0 bottom-0 w-px bg-hairline"
                        style={{ left: `${(i / (HOURS.length - 1)) * 100}%` }}
                      />
                    ))}

                    {/* Booking blocks — §4.7 muted: brand tint fill + accent left-bar + dark text */}
                    {roomBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="absolute top-1 bottom-1 rounded-ctl pl-2.5 pr-2 flex items-center overflow-hidden bg-brand-50 border-l-2 border-brand-400"
                        style={bookingStyle(booking)}
                        title={`${booking.teacher_name}: ${booking.purpose}`}
                      >
                        <span className="text-xs font-semibold text-ink-700 truncate">{booking.teacher_name} · {booking.purpose}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Booking Cards */}
      <div>
        <h3 className="text-base font-semibold text-ink-900 mb-4">Bugünün rezervasiyaları</h3>
        {bookings.length === 0 ? (
          <EmptyState
            icon={DoorOpen}
            title="Bu gün rezervasiya yoxdur"
            description="Yeni rezervasiya əlavə edin."
            actionLabel="Rezervasiya et"
            onAction={() => { resetForm(); setAddModal(true) }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookings.map((booking) => {
              const room = ROOMS.find(r => r.id === booking.room_id)
              return (
                <div key={booking.id} className="bg-surface border border-hairline rounded-tile p-4 flex flex-col gap-3 hover:shadow-soft-lg transition-shadow">
                  <div className="flex items-start justify-between gap-2">
                    <span className={roomTypePill}>
                      {room?.name || booking.room_id}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-input bg-brand-50 text-brand-700 tabular-nums">
                      {booking.time_from} – {booking.time_to}
                    </span>
                  </div>
                  <p className="font-semibold text-ink-900 text-sm">{booking.purpose}</p>
                  <div className="flex items-center gap-2 text-xs text-ink-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{booking.teacher_name}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Modal open={addModal} onClose={() => { setAddModal(false); setError(null) }} title="Yeni Rezervasiya" size="lg">
        <div className="space-y-4">
          <Select label="Otaq / Resurs" value={form.room_id} onChange={e => setForm({ ...form, room_id: e.target.value })}>
            <option value="">— Otaq seçin —</option>
            {ROOMS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </Select>
          <Select label="Müəllim" value={form.teacher_id} onChange={e => setForm({ ...form, teacher_id: e.target.value })}>
            <option value="">— Müəllim seçin —</option>
            {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
          </Select>
          <Input label="Tarix" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Başlama saatı" value={form.time_from} onChange={e => setForm({ ...form, time_from: e.target.value })}>
              {HOURS.slice(0, -1).map(h => <option key={h} value={h}>{h}</option>)}
            </Select>
            <Select label="Bitmə saatı" value={form.time_to} onChange={e => setForm({ ...form, time_to: e.target.value })}>
              {HOURS.slice(1).map(h => <option key={h} value={h}>{h}</option>)}
            </Select>
          </div>
          <Input label="Məqsəd" value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} placeholder="Dərs, toplantı, test..." />
          {error && (
            <p className="text-sm text-danger bg-danger/8 border border-danger/20 rounded-input px-3 py-2">{error}</p>
          )}
          <div className="flex justify-end gap-3 pt-4 border-t border-hairline">
            <Button variant="ghost" onClick={() => { setAddModal(false); setError(null) }}>{t('cancel')}</Button>
            <Button onClick={handleAdd} loading={saving} disabled={!form.room_id || !form.date}>{t('add')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
