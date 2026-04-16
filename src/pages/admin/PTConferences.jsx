import { useState, useEffect } from 'react'
import { Plus, Calendar, ChevronLeft, ChevronRight, Users, Clock } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import Input from '../../components/ui/Input'
import { Select } from '../../components/ui/Input'
import Avatar from '../../components/ui/Avatar'

const SLOT_DURATION = 15 // minutes
const DAY_START = 8 * 60 // 08:00 in minutes
const DAY_END = 17 * 60 // 17:00 in minutes

function formatDate(date) {
  return date.toISOString().split('T')[0]
}

function displayDate(dateStr) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('az-AZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function minutesToTime(min) {
  const h = Math.floor(min / 60).toString().padStart(2, '0')
  const m = (min % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}

function generateSlotTimes() {
  const times = []
  for (let m = DAY_START; m < DAY_END; m += SLOT_DURATION) {
    times.push(minutesToTime(m))
  }
  return times
}

const SLOT_TIMES = generateSlotTimes()

const TEACHER_COLORS = [
  { bg: 'bg-purple', text: 'text-white', light: 'bg-purple-light', lightText: 'text-purple-dark' },
  { bg: 'bg-teal', text: 'text-white', light: 'bg-teal-light', lightText: 'text-[#085041]' },
  { bg: 'bg-blue-500', text: 'text-white', light: 'bg-blue-50', lightText: 'text-blue-700' },
  { bg: 'bg-orange-400', text: 'text-white', light: 'bg-orange-50', lightText: 'text-orange-700' },
  { bg: 'bg-pink-500', text: 'text-white', light: 'bg-pink-50', lightText: 'text-pink-700' },
]

const DEMO_TEACHERS = [
  { id: 't1', full_name: 'Aytən Nəcəfova' },
  { id: 't2', full_name: 'Rauf Əliyev' },
  { id: 't3', full_name: 'Gülnar İsmayılova' },
]

const DEMO_SLOTS = [
  { id: 's1', teacher_id: 't1', teacher_name: 'Aytən Nəcəfova', date: formatDate(new Date()), time: '09:00', booked: true, parent_name: 'Leyla Quliyeva', student_name: 'Aynur Q.' },
  { id: 's2', teacher_id: 't1', teacher_name: 'Aytən Nəcəfova', date: formatDate(new Date()), time: '09:15', booked: false },
  { id: 's3', teacher_id: 't1', teacher_name: 'Aytən Nəcəfova', date: formatDate(new Date()), time: '09:30', booked: false },
  { id: 's4', teacher_id: 't2', teacher_name: 'Rauf Əliyev', date: formatDate(new Date()), time: '10:00', booked: true, parent_name: 'Rauf Həsənov', student_name: 'Tural H.' },
  { id: 's5', teacher_id: 't2', teacher_name: 'Rauf Əliyev', date: formatDate(new Date()), time: '10:15', booked: false },
  { id: 's6', teacher_id: 't3', teacher_name: 'Gülnar İsmayılova', date: formatDate(new Date()), time: '11:00', booked: true, parent_name: 'Samirə Məmmədova', student_name: 'Nigar M.' },
  { id: 's7', teacher_id: 't3', teacher_name: 'Gülnar İsmayılova', date: formatDate(new Date()), time: '11:15', booked: false },
  { id: 's8', teacher_id: 't3', teacher_name: 'Gülnar İsmayılova', date: formatDate(new Date()), time: '11:30', booked: false },
]

export default function PTConferences() {
  const { profile, t } = useAuth()
  const [loading, setLoading] = useState(true)
  const [teachers, setTeachers] = useState([])
  const [slots, setSlots] = useState([])
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()))
  const [addSlotModal, setAddSlotModal] = useState(false)
  const [bookModal, setBookModal] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [slotForm, setSlotForm] = useState({ teacher_id: '', date: formatDate(new Date()), time_start: '09:00', slots_count: 4 })
  const [bookForm, setBookForm] = useState({ parent_name: '', student_name: '' })

  useEffect(() => {
    if (profile?.school_id) fetchData()
  }, [profile?.school_id, selectedDate])

  async function fetchData() {
    try {
      setLoading(true)
      const [slotRes, teacherRes] = await Promise.all([
        supabase.from('pt_slots').select('*').eq('school_id', profile.school_id).eq('date', selectedDate).order('time'),
        supabase.from('profiles').select('id,full_name').eq('school_id', profile.school_id).eq('role', 'teacher'),
      ])
      if (slotRes.error) throw slotRes.error
      setSlots(slotRes.data && slotRes.data.length > 0 ? slotRes.data : DEMO_SLOTS)
      setTeachers(teacherRes.data && teacherRes.data.length > 0 ? teacherRes.data : DEMO_TEACHERS)
    } catch {
      setSlots(DEMO_SLOTS)
      setTeachers(DEMO_TEACHERS)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddSlots() {
    try {
      setSaving(true)
      setError(null)
      const teacher = teachers.find(t => t.id === slotForm.teacher_id)
      const newSlots = []
      let [h, m] = slotForm.time_start.split(':').map(Number)
      for (let i = 0; i < slotForm.slots_count; i++) {
        newSlots.push({
          teacher_id: slotForm.teacher_id,
          teacher_name: teacher?.full_name || '',
          date: slotForm.date,
          time: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`,
          booked: false,
          school_id: profile.school_id,
        })
        m += SLOT_DURATION
        if (m >= 60) { m -= 60; h++ }
      }
      const { error: err } = await supabase.from('pt_slots').insert(newSlots)
      if (err) throw err
      setAddSlotModal(false)
      await fetchData()
    } catch (err) {
      setError(err.message || t('error'))
    } finally {
      setSaving(false)
    }
  }

  async function handleBook() {
    try {
      setSaving(true)
      setError(null)
      const { error: err } = await supabase.from('pt_slots').update({
        booked: true,
        parent_name: bookForm.parent_name,
        student_name: bookForm.student_name,
      }).eq('id', bookModal.id)
      if (err) throw err
      setBookModal(null)
      setBookForm({ parent_name: '', student_name: '' })
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

  // Group slots by teacher
  const slotsByTeacher = {}
  slots.forEach(slot => {
    const tid = slot.teacher_id
    if (!slotsByTeacher[tid]) slotsByTeacher[tid] = { teacher_name: slot.teacher_name, slots: [] }
    slotsByTeacher[tid].slots.push(slot)
  })

  const teacherEntries = Object.entries(slotsByTeacher)
  const bookedCount = slots.filter(s => s.booked).length
  const availableCount = slots.filter(s => !s.booked).length

  if (loading) return <PageSpinner />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-3xl text-gray-900">Valideyn-Müəllim Görüşləri</h1>
          <p className="text-sm text-gray-500 mt-1">{bookedCount} rezerv · {availableCount} boş slot</p>
        </div>
        <Button onClick={() => { setSlotForm(f => ({ ...f, date: selectedDate })); setAddSlotModal(true) }}>
          <span className="flex items-center gap-2"><Plus className="w-4 h-4" /> Slot əlavə et</span>
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

      {slots.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="Bu gün üçün slot yoxdur"
          description="Müəllimlər üçün mövcud vaxt slotları əlavə edin."
          actionLabel="Slot əlavə et"
          onAction={() => { setSlotForm(f => ({ ...f, date: selectedDate })); setAddSlotModal(true) }}
        />
      ) : (
        <div className="space-y-4">
          {teacherEntries.map(([teacherId, { teacher_name, slots: teacherSlots }], tIdx) => {
            const color = TEACHER_COLORS[tIdx % TEACHER_COLORS.length]
            const bookedSlots = teacherSlots.filter(s => s.booked)
            const freeSlots = teacherSlots.filter(s => !s.booked)

            return (
              <Card key={teacherId} hover={false} className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <Avatar name={teacher_name} size="md" color={color.bg.replace('bg-', '#').replace('purple', '534AB7').replace('teal', '0f9688')} />
                  <div>
                    <h3 className="font-medium text-gray-900">{teacher_name}</h3>
                    <p className="text-xs text-gray-500">{bookedSlots.length} rezerv · {freeSlots.length} boş</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {teacherSlots.sort((a, b) => a.time.localeCompare(b.time)).map(slot => (
                    slot.booked ? (
                      <div
                        key={slot.id}
                        className={`${color.bg} ${color.text} rounded-lg px-3 py-2 min-w-[120px]`}
                      >
                        <p className="text-xs font-bold flex items-center gap-1"><Clock className="w-3 h-3" />{slot.time}</p>
                        <p className="text-xs mt-0.5 opacity-90">{slot.parent_name}</p>
                        <p className="text-xs opacity-75">{slot.student_name}</p>
                      </div>
                    ) : (
                      <button
                        key={slot.id}
                        onClick={() => { setBookModal(slot); setBookForm({ parent_name: '', student_name: '' }) }}
                        className="border-2 border-dashed border-gray-200 rounded-lg px-3 py-2 min-w-[120px] text-left hover:border-purple hover:bg-purple-light transition-colors group"
                      >
                        <p className="text-xs font-bold text-gray-500 group-hover:text-purple flex items-center gap-1"><Clock className="w-3 h-3" />{slot.time}</p>
                        <p className="text-xs text-gray-400 group-hover:text-purple-dark mt-0.5">Boş</p>
                      </button>
                    )
                  ))}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Summary */}
      {slots.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <Card hover={false} className="p-5 text-center">
            <p className="text-3xl font-bold text-purple">{bookedCount}</p>
            <p className="text-xs text-gray-500 mt-1">Rezerv edilmiş</p>
          </Card>
          <Card hover={false} className="p-5 text-center">
            <p className="text-3xl font-bold text-gray-400">{availableCount}</p>
            <p className="text-xs text-gray-500 mt-1">Boş slot</p>
          </Card>
          <Card hover={false} className="p-5 text-center">
            <p className="text-3xl font-bold text-gray-900">{teacherEntries.length}</p>
            <p className="text-xs text-gray-500 mt-1">Müəllim</p>
          </Card>
        </div>
      )}

      {/* Add Slots Modal */}
      <Modal open={addSlotModal} onClose={() => { setAddSlotModal(false); setError(null) }} title="Müraciət Slotları Əlavə Et">
        <div className="space-y-4">
          <Select label="Müəllim" value={slotForm.teacher_id} onChange={e => setSlotForm({ ...slotForm, teacher_id: e.target.value })}>
            <option value="">— Müəllim seçin —</option>
            {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
          </Select>
          <Input label="Tarix" type="date" value={slotForm.date} onChange={e => setSlotForm({ ...slotForm, date: e.target.value })} />
          <Select label="Başlama saatı" value={slotForm.time_start} onChange={e => setSlotForm({ ...slotForm, time_start: e.target.value })}>
            {SLOT_TIMES.map(t => <option key={t} value={t}>{t}</option>)}
          </Select>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Slot sayı ({SLOT_DURATION} dəq/slot)</label>
            <input
              type="range"
              min="1"
              max="20"
              value={slotForm.slots_count}
              onChange={e => setSlotForm({ ...slotForm, slots_count: parseInt(e.target.value) })}
              className="w-full accent-purple"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1</span>
              <span className="font-medium text-purple">{slotForm.slots_count} slot ({slotForm.slots_count * SLOT_DURATION} dəq)</span>
              <span>20</span>
            </div>
          </div>
          {error && <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{error}</p>}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => { setAddSlotModal(false); setError(null) }}>{t('cancel')}</Button>
            <Button onClick={handleAddSlots} loading={saving} disabled={!slotForm.teacher_id || !slotForm.date}>{t('add')}</Button>
          </div>
        </div>
      </Modal>

      {/* Book Modal */}
      <Modal open={!!bookModal} onClose={() => setBookModal(null)} title={`${bookModal?.time} — ${bookModal?.teacher_name}`} size="sm">
        <div className="space-y-4">
          <Input label="Valideynin adı" value={bookForm.parent_name} onChange={e => setBookForm({ ...bookForm, parent_name: e.target.value })} placeholder="Ad Soyad" />
          <Input label="Şagirdin adı" value={bookForm.student_name} onChange={e => setBookForm({ ...bookForm, student_name: e.target.value })} placeholder="Şagirdin adı" />
          {error && <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{error}</p>}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setBookModal(null)}>{t('cancel')}</Button>
            <Button onClick={handleBook} loading={saving} disabled={!bookForm.parent_name}>Rezerv et</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
