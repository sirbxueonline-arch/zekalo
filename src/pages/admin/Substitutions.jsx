import { useState, useEffect } from 'react'
import { Plus, Trash2, CalendarDays, AlertTriangle, RefreshCw, Check } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input, { Select } from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Table from '../../components/ui/Table'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'

const DAYS = ['Bazar ertəsi', 'Çərşənbə axşamı', 'Çərşənbə', 'Cümə axşamı', 'Cümə', 'Şənbə']
const DAY_KEYS = [1, 2, 3, 4, 5, 6]
const PERIODS = Array.from({ length: 8 }, (_, i) => i + 1)

// Returns ISO date string for day offset from a date
function addDays(dateStr, offset) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + offset)
  return d.toISOString().split('T')[0]
}

// Returns Monday of the week containing the given date string
function getMondayOf(dateStr) {
  const d = new Date(dateStr)
  const offset = (d.getDay() + 6) % 7 // Mon=0 … Sun=6
  d.setDate(d.getDate() - offset)
  return d.toISOString().split('T')[0]
}

// Returns day_of_week (1=Mon … 6=Sat, 0=Sun) for a date string
function dayOfWeek(dateStr) {
  const d = new Date(dateStr)
  const jsDay = d.getDay() // 0=Sun,1=Mon…6=Sat
  return jsDay === 0 ? 7 : jsDay // convert: Mon=1…Sun=7
}

function formatDate(d) {
  if (!d) return '—'
  const [y, m, day] = d.split('-')
  return `${day}.${m}.${y}`
}

const TODAY = new Date().toISOString().split('T')[0]

export default function Substitutions() {
  const { profile } = useAuth()

  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(TODAY)
  const [slots, setSlots] = useState([])               // timetable_slots for school
  const [teachers, setTeachers] = useState([])
  const [substitutions, setSubstitutions] = useState([]) // for selected week
  const [weekSubs, setWeekSubs] = useState([])           // full objects for list view

  const [addModal, setAddModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  // Modal form state
  const [form, setForm] = useState({
    date: TODAY,
    absent_teacher_id: '',
    slot_ids: [],         // multi-select of slots
    substitute_teacher_id: '',
    reason: '',
  })
  const [absentTeacherSlots, setAbsentTeacherSlots] = useState([]) // slots for absent teacher on chosen day

  useEffect(() => {
    if (profile?.school_id) fetchStaticData()
  }, [profile?.school_id])

  useEffect(() => {
    if (profile?.school_id) fetchSubstitutions()
  }, [profile?.school_id, selectedDate])

  // When absent teacher or date changes in modal, compute their slots
  useEffect(() => {
    if (!form.absent_teacher_id || !form.date) {
      setAbsentTeacherSlots([])
      return
    }
    const dow = dayOfWeek(form.date)
    const teacherSlots = slots.filter(
      s => s.teacher_id === form.absent_teacher_id && s.day_of_week === dow
    )
    setAbsentTeacherSlots(teacherSlots)
    setForm(f => ({ ...f, slot_ids: [] }))
  }, [form.absent_teacher_id, form.date, slots])

  async function fetchStaticData() {
    try {
      setLoading(true)
      const [slotsRes, teachersRes] = await Promise.all([
        supabase
          .from('timetable_slots')
          .select('*, class:classes(name), subject:subjects(name), teacher:profiles(id, full_name)')
          .eq('school_id', profile.school_id)
          .limit(500),
        supabase
          .from('profiles')
          .select('id, full_name')
          .eq('school_id', profile.school_id)
          .eq('role', 'teacher')
          .order('full_name')
          .limit(200),
      ])
      if (slotsRes.error) throw slotsRes.error
      if (teachersRes.error) throw teachersRes.error
      setSlots(slotsRes.data || [])
      setTeachers(teachersRes.data || [])
    } catch (err) {
      console.error(err)
      setError('Məlumat yüklənərkən xəta baş verdi')
    } finally {
      setLoading(false)
    }
  }

  async function fetchSubstitutions() {
    try {
      const monday = getMondayOf(selectedDate)
      const saturday = addDays(monday, 5)

      const { data, error: err } = await supabase
        .from('substitutions')
        .select(`
          *,
          absent_teacher:profiles!substitutions_absent_teacher_id_fkey(id, full_name),
          substitute_teacher:profiles!substitutions_substitute_teacher_id_fkey(id, full_name),
          slot:timetable_slots(id, day_of_week, period, class:classes(name), subject:subjects(name))
        `)
        .eq('school_id', profile.school_id)
        .gte('date', monday)
        .lte('date', saturday)
        .order('date', { ascending: true })

      if (err) throw err
      setSubstitutions(data || [])
      setWeekSubs(data || [])
    } catch (err) {
      console.error(err)
    }
  }

  function resetForm() {
    setForm({
      date: selectedDate,
      absent_teacher_id: '',
      slot_ids: [],
      substitute_teacher_id: '',
      reason: '',
    })
    setAbsentTeacherSlots([])
  }

  function openAddModal(prefillSlot = null) {
    resetForm()
    if (prefillSlot) {
      setForm(f => ({
        ...f,
        date: selectedDate,
        absent_teacher_id: prefillSlot.teacher_id || '',
      }))
    } else {
      setForm(f => ({ ...f, date: selectedDate }))
    }
    setAddModal(true)
  }

  function toggleSlotId(slotId) {
    setForm(f => {
      const already = f.slot_ids.includes(slotId)
      return {
        ...f,
        slot_ids: already ? f.slot_ids.filter(id => id !== slotId) : [...f.slot_ids, slotId],
      }
    })
  }

  async function handleAdd() {
    if (!form.absent_teacher_id) {
      setError('İcazəsiz müəllim seçin')
      return
    }
    if (form.slot_ids.length === 0) {
      setError('Ən az bir dərs saatı seçin')
      return
    }
    if (!form.substitute_teacher_id) {
      setError('Əvəzedici müəllim seçin')
      return
    }
    if (form.absent_teacher_id === form.substitute_teacher_id) {
      setError('İcazəsiz müəllim ilə əvəzedici eyni ola bilməz')
      return
    }
    try {
      setSaving(true)
      setError(null)
      const rows = form.slot_ids.map(slotId => ({
        school_id: profile.school_id,
        timetable_slot_id: slotId,
        absent_teacher_id: form.absent_teacher_id,
        substitute_teacher_id: form.substitute_teacher_id,
        date: form.date,
        reason: form.reason.trim() || null,
      }))

      const { error: err } = await supabase.from('substitutions').upsert(rows, {
        onConflict: 'timetable_slot_id,date',
      })
      if (err) throw err
      setAddModal(false)
      resetForm()
      await fetchSubstitutions()
    } catch (err) {
      console.error(err)
      setError(err.message || 'Xəta baş verdi')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    try {
      setSaving(true)
      const { error: err } = await supabase.from('substitutions').delete().eq('id', deleteModal.id)
      if (err) throw err
      setDeleteModal(null)
      await fetchSubstitutions()
    } catch {
      setError('Xəta baş verdi')
    } finally {
      setSaving(false)
    }
  }

  // Weekly calendar grid helpers
  const monday = getMondayOf(selectedDate)
  const weekDates = DAY_KEYS.map((_, i) => addDays(monday, i)) // [Mon, Tue, Wed, Thu, Fri, Sat]

  // Build a map: slotId+date -> substitution
  const subMap = {}
  substitutions.forEach(sub => {
    const key = `${sub.timetable_slot_id}__${sub.date}`
    subMap[key] = sub
  })

  // Build a map: day_of_week+period -> timetable_slots (all slots for that cell across classes)
  function getSlotsForCell(dayNum, period) {
    return slots.filter(s => s.day_of_week === dayNum && s.period === period)
  }

  // For selected date column highlighting
  const selectedDayOfWeek = dayOfWeek(selectedDate)

  // Teachers excluding absent (for substitute picker)
  const substituteOptions = teachers.filter(t => t.id !== form.absent_teacher_id)

  const listColumns = [
    { key: 'date', label: 'Tarix', render: (val) => <span className="tabular-nums text-ink-700">{formatDate(val)}</span> },
    {
      key: 'slot',
      label: 'Dərs saatı',
      render: (val) => val ? <span className="tabular-nums">{val.period}-ci dərs</span> : '—',
    },
    {
      key: 'slot',
      label: 'Sinif',
      render: (val) => val?.class?.name || '—',
    },
    {
      key: 'slot',
      label: 'Fənn',
      render: (val) => val?.subject?.name || '—',
    },
    {
      key: 'absent_teacher',
      label: 'İcazəsiz müəllim',
      render: (val) => <span className="text-ink-700">{val?.full_name || '—'}</span>,
    },
    {
      key: 'substitute_teacher',
      label: 'Əvəzedici',
      render: (val) => val ? (
        <span className="pill-mint">{val.full_name}</span>
      ) : (
        <span className="pill-rose">Əvəz yoxdur</span>
      ),
    },
    {
      key: 'reason',
      label: 'Səbəb',
      render: (val) => <span className="text-ink-400 text-sm">{val || '—'}</span>,
    },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <button
          onClick={(e) => { e.stopPropagation(); setDeleteModal(row) }}
          className="p-1.5 text-ink-400 hover:text-danger transition-colors rounded-md hover:bg-danger/8"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ]

  if (loading) return <PageSpinner />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-ink-900 font-display">Əvəzetmə</h1>
        <Button onClick={() => openAddModal()}>
          <span className="flex items-center gap-2"><Plus className="w-4 h-4" /> Əvəzetmə əlavə et</span>
        </Button>
      </div>

      {/* Date picker */}
      <div className="flex items-end gap-4 flex-wrap">
        <div className="w-52">
          <label className="block text-xs font-semibold text-ink-700 uppercase tracking-wide mb-1.5">Tarix seçin</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="pastel-input"
          />
        </div>
        <p className="text-sm text-ink-400 pb-2.5 tabular-nums">
          Həftə: <strong className="text-ink-700">{formatDate(monday)}</strong> — <strong className="text-ink-700">{formatDate(addDays(monday, 5))}</strong>
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-danger/8 border border-danger/20 rounded-input px-4 py-2.5">
          <AlertTriangle className="w-4 h-4 text-danger shrink-0" />
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}

      {/* Weekly grid */}
      <div className="bg-surface border border-hairline rounded-tile overflow-x-auto">
        <table className="w-full border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-surface-2">
              <th className="text-xs font-semibold text-ink-400 uppercase tracking-wide px-3 py-3 text-left w-16 border-b border-hairline-strong">Dərs</th>
              {DAY_KEYS.map((dayNum, i) => (
                <th
                  key={dayNum}
                  className={`text-xs font-semibold uppercase tracking-wide px-2 py-3 text-center cursor-pointer transition-colors border-b border-hairline-strong ${
                    dayNum === selectedDayOfWeek
                      ? 'text-brand-600 bg-brand-50'
                      : 'text-ink-400 hover:bg-surface'
                  }`}
                  onClick={() => setSelectedDate(weekDates[i])}
                >
                  <div>{DAYS[i]}</div>
                  <div className={`text-base font-bold mt-0.5 tabular-nums ${dayNum === selectedDayOfWeek ? 'text-brand-600' : 'text-ink-700'}`}>
                    {new Date(weekDates[i]).getDate()}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERIODS.map(period => (
              <tr key={period} className="border-t border-hairline">
                <td className="px-3 py-1.5 text-sm font-semibold text-ink-400 text-center align-top pt-3 border-r border-hairline tabular-nums">{period}</td>
                {DAY_KEYS.map((dayNum, di) => {
                  const dateForCell = weekDates[di]
                  const cellSlots = getSlotsForCell(dayNum, period)
                  const isSelectedCol = dayNum === selectedDayOfWeek

                  if (cellSlots.length === 0) {
                    return (
                      <td key={dayNum} className={`px-2 py-1.5 text-center align-top ${isSelectedCol ? 'bg-brand-50/30' : ''}`}>
                        <div className="h-14 flex items-center justify-center">
                          <button
                            onClick={() => { setSelectedDate(dateForCell); openAddModal() }}
                            className="w-6 h-6 rounded-full border-2 border-dashed border-hairline-strong flex items-center justify-center hover:border-brand-400 hover:bg-brand-50 transition-colors"
                          >
                            <Plus className="w-3 h-3 text-ink-400" />
                          </button>
                        </div>
                      </td>
                    )
                  }

                  return (
                    <td key={dayNum} className={`px-2 py-1.5 align-top ${isSelectedCol ? 'bg-brand-50/30' : ''}`}>
                      <div className="space-y-1">
                        {cellSlots.map(slot => {
                          const subKey = `${slot.id}__${dateForCell}`
                          const sub = subMap[subKey]

                          // §4.7 muted block: neutral by default, amber tint = substitution (status)
                          const accentBar = sub ? 'bg-warning' : 'bg-brand-300'
                          const cellBg = sub
                            ? 'bg-warning/8 border-warning/25'
                            : 'bg-surface-2 border-hairline'

                          return (
                            <div
                              key={slot.id}
                              className={`relative rounded-input p-2 pl-2.5 text-left space-y-0.5 cursor-pointer transition-shadow hover:shadow-soft border ${cellBg}`}
                              onClick={() => {
                                setSelectedDate(dateForCell)
                                openAddModal(slot)
                              }}
                            >
                              <span className={`absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-full ${accentBar}`} />
                              <p className="text-xs font-semibold text-ink-900 truncate">
                                {slot.subject?.name || '—'}
                              </p>
                              <p className="text-xs text-ink-600 truncate">{slot.class?.name}</p>
                              {slot.teacher_id && (
                                <p className="text-xs text-ink-400 truncate">{slot.teacher?.full_name}</p>
                              )}
                              {sub ? (
                                <p className="text-xs font-semibold text-warning truncate flex items-center gap-1">
                                  <RefreshCw className="w-3 h-3 shrink-0" />
                                  {sub.substitute_teacher?.full_name || 'Əvəz yoxdur'}
                                </p>
                              ) : null}
                            </div>
                          )
                        })}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Week list view */}
      <div>
        <h2 className="text-base font-semibold text-ink-900 mb-4">Bu həftənin əvəzetmələri</h2>
        <Card hover={false} className="p-0 overflow-hidden">
          {weekSubs.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="Əvəzetmə yoxdur"
              description="Bu həftə üçün əvəzetmə qeydi tapılmadı"
              actionLabel="Əvəzetmə əlavə et"
              onAction={() => openAddModal()}
            />
          ) : (
            <Table columns={listColumns} data={weekSubs} />
          )}
        </Card>
      </div>

      {/* Add Modal */}
      <Modal open={addModal} onClose={() => { setAddModal(false); resetForm() }} title="Əvəzetmə əlavə et" size="lg">
        <div className="space-y-4">
          {/* Date */}
          <Input
            label="Tarix"
            type="date"
            value={form.date}
            onChange={(e) => setForm(f => ({ ...f, date: e.target.value, slot_ids: [], absent_teacher_id: '' }))}
          />

          {/* Absent teacher */}
          <Select
            label="İcazəsiz müəllim"
            value={form.absent_teacher_id}
            onChange={(e) => setForm(f => ({ ...f, absent_teacher_id: e.target.value }))}
          >
            <option value="">— Müəllim seçin —</option>
            {teachers.map(t => (
              <option key={t.id} value={t.id}>{t.full_name}</option>
            ))}
          </Select>

          {/* Absent teacher's slots for that day */}
          {form.absent_teacher_id && (
            <div>
              <label className="block text-xs font-semibold text-ink-700 uppercase tracking-wide mb-1.5">
                Dərs saatları — {DAYS[dayOfWeek(form.date) - 1] || ''}
              </label>
              {absentTeacherSlots.length === 0 ? (
                <div className="flex items-center gap-2 bg-warning/8 border border-warning/25 rounded-input px-4 py-3">
                  <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
                  <span className="text-sm text-ink-600">Bu müəllimin seçilmiş günündə dərs saatı yoxdur</span>
                </div>
              ) : (
                <div className="border border-hairline rounded-tile overflow-hidden divide-y divide-hairline">
                  {absentTeacherSlots.map(slot => {
                    const selected = form.slot_ids.includes(slot.id)
                    // Check if sub already exists
                    const existingSub = subMap[`${slot.id}__${form.date}`]
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => toggleSlotId(slot.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors ${
                          selected ? 'bg-brand-50' : 'hover:bg-surface-2'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-ctl border-2 flex items-center justify-center shrink-0 transition-colors ${
                          selected ? 'border-brand-500 bg-brand-500' : 'border-hairline-strong'
                        }`}>
                          {selected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className={`font-semibold ${selected ? 'text-brand-700' : 'text-ink-700'}`}>
                            {slot.period}-ci dərs
                          </span>
                          <span className="text-ink-400 mx-2">·</span>
                          <span className="text-ink-600">{slot.subject?.name || '—'}</span>
                          <span className="text-ink-400 mx-2">·</span>
                          <span className="text-ink-500">{slot.class?.name || '—'}</span>
                        </div>
                        {existingSub && (
                          <span className="pill-peach text-[10px] shrink-0">
                            Artıq əvəz var
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Substitute teacher */}
          <Select
            label="Əvəzedici müəllim"
            value={form.substitute_teacher_id}
            onChange={(e) => setForm(f => ({ ...f, substitute_teacher_id: e.target.value }))}
          >
            <option value="">— Əvəzedici seçin —</option>
            {substituteOptions.map(t => (
              <option key={t.id} value={t.id}>{t.full_name}</option>
            ))}
          </Select>

          {/* Reason */}
          <Input
            label="Səbəb (istəyə bağlı)"
            value={form.reason}
            onChange={(e) => setForm(f => ({ ...f, reason: e.target.value }))}
            placeholder="Məs: Xəstəlik, şəxsi işlər..."
          />

          {error && (
            <div className="flex items-center gap-2 bg-danger/8 border border-danger/20 rounded-input px-4 py-3">
              <AlertTriangle className="w-4 h-4 text-danger shrink-0" />
              <span className="text-sm text-danger">{error}</span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2 border-t border-hairline">
            <Button variant="ghost" onClick={() => { setAddModal(false); resetForm() }}>Ləğv et</Button>
            <Button onClick={handleAdd} loading={saving}>
              <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4" /> Əlavə et</span>
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="Əvəzetməni sil" size="sm">
        <p className="text-sm text-ink-600 mb-2">
          Aşağıdakı əvəzetməni silmək istədiyinizə əminsiniz?
        </p>
        {deleteModal && (
          <div className="bg-surface-2 border border-hairline rounded-tile p-4 mb-6 space-y-1.5 text-sm">
            <p><span className="text-ink-400">Tarix:</span> <strong className="text-ink-900 tabular-nums">{formatDate(deleteModal.date)}</strong></p>
            <p><span className="text-ink-400">İcazəsiz:</span> <strong className="text-ink-900">{deleteModal.absent_teacher?.full_name}</strong></p>
            <p><span className="text-ink-400">Əvəzedici:</span> <strong className="text-ink-900">{deleteModal.substitute_teacher?.full_name || '—'}</strong></p>
          </div>
        )}
        <div className="flex justify-end gap-3 pt-4 border-t border-hairline">
          <Button variant="ghost" onClick={() => setDeleteModal(null)}>Ləğv et</Button>
          <Button variant="danger" onClick={handleDelete} loading={saving}>Sil</Button>
        </div>
      </Modal>
    </div>
  )
}
