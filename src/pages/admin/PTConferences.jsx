import { useState, useEffect } from 'react'
import { Plus, Calendar, ChevronLeft, ChevronRight, Users, Clock, CheckSquare } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import StatCard from '../../components/ui/StatCard'
import Input from '../../components/ui/Input'
import { Select } from '../../components/ui/Input'
import Avatar from '../../components/ui/Avatar'
import { fmtDate } from '../../lib/dateUtils'

const SLOT_DURATION = 15 // minutes
const DAY_START = 8 * 60 // 08:00 in minutes
const DAY_END = 17 * 60 // 17:00 in minutes

function formatDate(date) {
  return date.toISOString().split('T')[0]
}

function displayDate(dateStr) {
  return fmtDate(new Date(dateStr + 'T12:00:00'), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
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

// LOW dial: ONE brand accent across all teachers (color restraint — no rainbow rotation).
// Booked = solid brand fill; free = neutral dashed tile with a quiet brand hover.
const SLOT_ACCENT = {
  booked: 'bg-brand-500 text-white',
  light:  'bg-brand-50 text-brand-600',
  border: 'border-brand-200',
}

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
      setSlots(slotRes.data || [])
      setTeachers(teacherRes.data || [])
    } catch {
      setSlots([])
      setTeachers([])
    } finally {
      setLoading(false)
    }
  }

  async function handleAddSlots() {
    try {
      setSaving(true)
      setError(null)
      const teacher = teachers.find(tc => tc.id === slotForm.teacher_id)
      const newSlots = []
      let [h, m] = slotForm.time_start.split(':').map(Number)
      for (let i = 0; i < slotForm.slots_count; i++) {
        if (h >= 24) break
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
      }).eq('id', bookModal.id).eq('booked', false)
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
  const bookedCount    = slots.filter(s => s.booked).length
  const availableCount = slots.filter(s => !s.booked).length

  if (loading) return <PageSpinner />

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-900 font-display">Valideyn-Müəllim Görüşləri</h1>
          <p className="text-sm text-ink-400 mt-0.5">
            {bookedCount} rezerv · {availableCount} boş slot
          </p>
        </div>
        <Button onClick={() => { setSlotForm(f => ({ ...f, date: selectedDate })); setAddSlotModal(true) }}>
          <span className="flex items-center gap-2"><Plus className="w-4 h-4" /> Slot əlavə et</span>
        </Button>
      </div>

      {/* Date navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => changeDate(-1)}
          className="p-2 rounded-input border border-hairline text-ink-400 hover:border-brand-300 hover:text-brand-500 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h2 className="font-semibold text-ink-900 capitalize text-base">{displayDate(selectedDate)}</h2>
        <button
          onClick={() => changeDate(1)}
          className="p-2 rounded-input border border-hairline text-ink-400 hover:border-brand-300 hover:text-brand-500 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => setSelectedDate(formatDate(new Date()))}
          className="text-sm font-medium text-brand-500 hover:text-brand-600 transition-colors"
        >
          Bu gün
        </button>
      </div>

      {/* KPI strip — only when data exists */}
      {slots.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Rezerv edilmiş" value={bookedCount}       icon={CheckSquare} tone="periwinkle" />
          <StatCard label="Boş slot"       value={availableCount}    icon={Clock}       tone="periwinkle" />
          <StatCard label="Müəllim"        value={teacherEntries.length} icon={Users}  tone="periwinkle" />
        </div>
      )}

      {/* Empty day */}
      {slots.length === 0 ? (
        <EmptyState
          tier={1}
          icon={Calendar}
          title="Bu gün üçün slot yoxdur"
          description="Müəllimlər üçün mövcud vaxt slotları əlavə edin."
          actionLabel="Slot əlavə et"
          onAction={() => { setSlotForm(f => ({ ...f, date: selectedDate })); setAddSlotModal(true) }}
        />
      ) : (
        <div className="space-y-4">
          {teacherEntries.map(([teacherId, { teacher_name, slots: teacherSlots }]) => {
            const accent     = SLOT_ACCENT
            const bookedSlots = teacherSlots.filter(s => s.booked)
            const freeSlots   = teacherSlots.filter(s => !s.booked)

            return (
              <Card key={teacherId} hover={false} className="p-5">
                {/* Teacher header */}
                <div className="flex items-center gap-3 mb-4">
                  <Avatar name={teacher_name} size="md" />
                  <div>
                    <h3 className="font-semibold text-ink-900 text-sm">{teacher_name}</h3>
                    <p className="text-xs text-ink-400">
                      {bookedSlots.length} rezerv · {freeSlots.length} boş
                    </p>
                  </div>
                </div>

                {/* Slot grid */}
                <div className="flex flex-wrap gap-2">
                  {teacherSlots
                    .slice()
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map(slot =>
                      slot.booked ? (
                        /* Booked slot — flat solid brand tile (no puffy shadow) */
                        <div
                          key={slot.id}
                          className={`${accent.booked} rounded-tile px-3 py-2.5 min-w-[118px]`}
                        >
                          <p className="text-xs font-bold flex items-center gap-1 tabular-nums">
                            <Clock className="w-3 h-3 opacity-80" />{slot.time}
                          </p>
                          <p className="text-xs mt-0.5 opacity-90 truncate">{slot.parent_name}</p>
                          <p className="text-[11px] opacity-70 truncate">{slot.student_name}</p>
                        </div>
                      ) : (
                        /* Free slot — dashed hairline, quiet brand tint on hover */
                        <button
                          key={slot.id}
                          onClick={() => { setBookModal(slot); setBookForm({ parent_name: '', student_name: '' }) }}
                          className="border border-dashed border-hairline-strong rounded-tile px-3 py-2.5 min-w-[118px] text-left transition-colors duration-150 group hover:border-brand-200 hover:bg-brand-50"
                        >
                          <p className="text-xs font-bold text-ink-400 group-hover:text-ink-700 flex items-center gap-1 tabular-nums">
                            <Clock className="w-3 h-3" />{slot.time}
                          </p>
                          <p className="text-[11px] text-ink-300 group-hover:text-ink-500 mt-0.5">Boş</p>
                        </button>
                      )
                    )
                  }
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add Slots Modal */}
      <Modal open={addSlotModal} onClose={() => { setAddSlotModal(false); setError(null) }} title="Müraciət Slotları Əlavə Et">
        <div className="space-y-4">
          <Select label="Müəllim" value={slotForm.teacher_id} onChange={e => setSlotForm({ ...slotForm, teacher_id: e.target.value })}>
            <option value="">— Müəllim seçin —</option>
            {teachers.map(tc => <option key={tc.id} value={tc.id}>{tc.full_name}</option>)}
          </Select>
          <Input label="Tarix" type="date" value={slotForm.date} onChange={e => setSlotForm({ ...slotForm, date: e.target.value })} />
          <Select label="Başlama saatı" value={slotForm.time_start} onChange={e => setSlotForm({ ...slotForm, time_start: e.target.value })}>
            {SLOT_TIMES.map(tc => <option key={tc} value={tc}>{tc}</option>)}
          </Select>
          {/* Slot count range */}
          <div>
            <label className="block text-[13px] font-semibold text-ink-700 mb-1.5">
              Slot sayı ({SLOT_DURATION} dəq/slot)
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={slotForm.slots_count}
              onChange={e => setSlotForm({ ...slotForm, slots_count: parseInt(e.target.value) })}
              className="w-full accent-brand-500"
            />
            <div className="flex justify-between text-xs text-ink-400 mt-1">
              <span>1</span>
              <span className="font-semibold text-brand-500 tabular-nums">
                {slotForm.slots_count} slot ({slotForm.slots_count * SLOT_DURATION} dəq)
              </span>
              <span>20</span>
            </div>
          </div>
          {error && (
            <p className="text-sm text-danger bg-[rgba(239,68,68,0.08)] rounded-input px-3 py-2 border border-[rgba(239,68,68,0.2)]">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => { setAddSlotModal(false); setError(null) }}>{t('cancel')}</Button>
            <Button onClick={handleAddSlots} loading={saving} disabled={!slotForm.teacher_id || !slotForm.date}>{t('add')}</Button>
          </div>
        </div>
      </Modal>

      {/* Book Modal */}
      <Modal open={!!bookModal} onClose={() => setBookModal(null)} title={`${bookModal?.time} — ${bookModal?.teacher_name}`} size="sm">
        <div className="space-y-4">
          <Input
            label="Valideynin adı"
            value={bookForm.parent_name}
            onChange={e => setBookForm({ ...bookForm, parent_name: e.target.value })}
            placeholder="Ad Soyad"
          />
          <Input
            label="Şagirdin adı"
            value={bookForm.student_name}
            onChange={e => setBookForm({ ...bookForm, student_name: e.target.value })}
            placeholder="Şagirdin adı"
          />
          {error && (
            <p className="text-sm text-danger bg-[rgba(239,68,68,0.08)] rounded-input px-3 py-2 border border-[rgba(239,68,68,0.2)]">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setBookModal(null)}>{t('cancel')}</Button>
            <Button onClick={handleBook} loading={saving} disabled={!bookForm.parent_name}>Rezerv et</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
