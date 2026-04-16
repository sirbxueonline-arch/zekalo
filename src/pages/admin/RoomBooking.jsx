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

const roomTypeColors = {
  classroom: 'bg-blue-50 text-blue-700',
  lab: 'bg-green-50 text-green-700',
  meeting: 'bg-purple-light text-purple-dark',
  sports: 'bg-orange-50 text-orange-700',
  library: 'bg-amber-50 text-amber-700',
  arts: 'bg-pink-50 text-pink-700',
}

const bookingColors = [
  'bg-purple text-white',
  'bg-teal text-white',
  'bg-blue-500 text-white',
  'bg-orange-400 text-white',
  'bg-pink-500 text-white',
  'bg-indigo-500 text-white',
]

function formatDate(date) {
  return date.toISOString().split('T')[0]
}

function displayDate(dateStr) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('az-AZ', { weekday: 'long', day: 'numeric', month: 'long' })
}

function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

const DEMO_BOOKINGS = [
  { id: '1', room_id: 'r1', teacher_name: 'Aytən Nəcəfova', date: formatDate(new Date()), time_from: '09:00', time_to: '10:00', purpose: 'Riyaziyyat dərsi' },
  { id: '2', room_id: 'r3', teacher_name: 'Rauf Əliyev', date: formatDate(new Date()), time_from: '11:00', time_to: '13:00', purpose: 'Kimya eksperimenti' },
  { id: '3', room_id: 'r5', teacher_name: 'Gülnar İsmayılova', date: formatDate(new Date()), time_from: '14:00', time_to: '15:00', purpose: 'Müəllim toplantısı' },
]

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
      setBookings(formatted.length > 0 ? formatted : DEMO_BOOKINGS)
      setTeachers(teacherRes.data || [])
    } catch {
      setBookings(DEMO_BOOKINGS)
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

  function bookingStyle(booking, colorIndex) {
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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-3xl text-gray-900">Otaq Rezervasiyası</h1>
          <p className="text-sm text-gray-500 mt-1">{bookings.length} bu gün üçün rezervasiya</p>
        </div>
        <Button onClick={() => { resetForm(); setAddModal(true) }}>
          <span className="flex items-center gap-2"><Plus className="w-4 h-4" /> Rezervasiya et</span>
        </Button>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center gap-4">
        <button onClick={() => changeDate(-1)} className="p-2 rounded-lg border border-border-soft hover:border-purple hover:text-purple transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h2 className="font-medium text-gray-900 capitalize">{displayDate(selectedDate)}</h2>
        <button onClick={() => changeDate(1)} className="p-2 rounded-lg border border-border-soft hover:border-purple hover:text-purple transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
        <button onClick={() => setSelectedDate(formatDate(new Date()))} className="text-sm text-purple hover:underline">Bu gün</button>
      </div>

      {/* Hour Header */}
      <Card hover={false} className="p-4 overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Time axis */}
          <div className="flex mb-2 pl-36">
            {HOURS.map(h => (
              <div key={h} className="flex-1 text-xs text-gray-400 font-medium">{h}</div>
            ))}
          </div>

          {/* Rooms */}
          <div className="space-y-3">
            {ROOMS.map((room, ri) => {
              const roomBookings = getBookingsForRoom(room.id)
              return (
                <div key={room.id} className="flex items-center gap-3">
                  {/* Room label */}
                  <div className="w-32 shrink-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{room.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${roomTypeColors[room.type] || 'bg-surface text-gray-600'}`}>
                      {room.type}
                    </span>
                  </div>

                  {/* Timeline bar */}
                  <div className="flex-1 relative h-10 bg-surface rounded-lg border border-border-soft overflow-hidden">
                    {/* Hour gridlines */}
                    {HOURS.slice(0, -1).map((_, i) => (
                      <div
                        key={i}
                        className="absolute top-0 bottom-0 w-px bg-gray-100"
                        style={{ left: `${(i / (HOURS.length - 1)) * 100}%` }}
                      />
                    ))}

                    {/* Bookings */}
                    {roomBookings.map((booking, bi) => (
                      <div
                        key={booking.id}
                        className={`absolute top-1 bottom-1 rounded px-2 flex items-center overflow-hidden ${bookingColors[bi % bookingColors.length]}`}
                        style={bookingStyle(booking, bi)}
                        title={`${booking.teacher_name}: ${booking.purpose}`}
                      >
                        <span className="text-xs font-medium truncate">{booking.teacher_name} · {booking.purpose}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Card>

      {/* Today's Bookings List */}
      <div>
        <h3 className="font-serif text-xl text-gray-900 mb-4">Bugünün rezervasiyaları</h3>
        {bookings.length === 0 ? (
          <EmptyState icon={DoorOpen} title="Bu gün rezervasiya yoxdur" description="Yeni rezervasiya əlavə edin." actionLabel="Rezervasiya et" onAction={() => { resetForm(); setAddModal(true) }} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookings.map((booking, i) => {
              const room = ROOMS.find(r => r.id === booking.room_id)
              return (
                <Card key={booking.id} className="p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${roomTypeColors[room?.type] || 'bg-surface text-gray-600'}`}>
                      {room?.name || booking.room_id}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${bookingColors[i % bookingColors.length]}`}>
                      {booking.time_from} – {booking.time_to}
                    </span>
                  </div>
                  <p className="font-medium text-gray-900">{booking.purpose}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-3.5 h-3.5" />
                    {booking.teacher_name}
                  </div>
                </Card>
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
          {error && <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{error}</p>}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => { setAddModal(false); setError(null) }}>{t('cancel')}</Button>
            <Button onClick={handleAdd} loading={saving} disabled={!form.room_id || !form.date}>{t('add')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
