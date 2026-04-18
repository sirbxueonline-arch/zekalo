import { useState, useEffect, useMemo } from 'react'
import { Plus, AlertTriangle, Check, Trash2, Filter } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import { Select } from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import { PageSpinner } from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'

const DAYS = ['Bazar ertəsi', 'Çərşənbə axşamı', 'Çərşənbə', 'Cümə axşamı', 'Cümə', 'Şənbə']
// day_of_week: 1=Monday … 6=Saturday (matches timetable_slots.day_of_week int)
const DAY_KEYS = [1, 2, 3, 4, 5, 6]
const PERIODS = Array.from({ length: 8 }, (_, i) => i + 1)

const PERIOD_TIMES = [
  '08:00', '08:50', '09:40', '10:40', '11:30', '12:20', '13:30', '14:20'
]

const SUBJECT_PALETTE = [
  { bg: 'bg-purple-light', text: 'text-purple', border: 'border-purple/30' },
  { bg: 'bg-teal-light',   text: 'text-teal',   border: 'border-teal/30' },
  { bg: 'bg-amber-50',     text: 'text-amber-700', border: 'border-amber-300' },
  { bg: 'bg-blue-50',      text: 'text-blue-700',  border: 'border-blue-300' },
  { bg: 'bg-pink-50',      text: 'text-pink-700',  border: 'border-pink-300' },
  { bg: 'bg-orange-50',    text: 'text-orange-700', border: 'border-orange-300' },
  { bg: 'bg-green-50',     text: 'text-green-700',  border: 'border-green-300' },
  { bg: 'bg-indigo-50',    text: 'text-indigo-700', border: 'border-indigo-300' },
]

export default function Timetable() {
  const { profile, t } = useAuth()
  const [loading, setLoading] = useState(true)
  const [slots, setSlots] = useState([])
  const [classes, setClasses] = useState([])
  const [teachers, setTeachers] = useState([])
  const [subjects, setSubjects] = useState([])
  const [assignModal, setAssignModal] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [publishConfirm, setPublishConfirm] = useState(false)
  const [error, setError] = useState(null)
  const [conflicts, setConflicts] = useState([])
  const [form, setForm] = useState({ class_id: '', subject_id: '', teacher_id: '', room: '' })
  const [activeClassFilter, setActiveClassFilter] = useState('all')

  useEffect(() => {
    if (profile?.school_id) fetchData()
  }, [profile?.school_id])

  async function fetchData() {
    try {
      setLoading(true)
      const [slotsRes, classesRes, teachersRes, subjectsRes] = await Promise.all([
        supabase.from('timetable_slots').select('*, class:classes(name), teacher:profiles(full_name), subject:subjects(name)').eq('school_id', profile.school_id),
        supabase.from('classes').select('id, name').eq('school_id', profile.school_id).order('name'),
        supabase.from('profiles').select('id, full_name').eq('school_id', profile.school_id).eq('role', 'teacher').order('full_name'),
        supabase.from('subjects').select('id, name').eq('school_id', profile.school_id).order('name'),
      ])
      setSlots(slotsRes.data || [])
      setClasses(classesRes.data || [])
      setTeachers(teachersRes.data || [])
      setSubjects(subjectsRes.data || [])
    } catch {
      setError(t('error'))
    } finally {
      setLoading(false)
    }
  }

  // Build subject color map from all slots' subject names
  const subjectColorMap = useMemo(() => {
    const names = []
    slots.forEach(s => {
      const name = s.subject?.name
      if (name && !names.includes(name)) names.push(name)
    })
    const map = {}
    names.forEach((name, idx) => {
      map[name] = SUBJECT_PALETTE[idx % SUBJECT_PALETTE.length]
    })
    return map
  }, [slots])

  // Unique subject names present in slots (for legend)
  const uniqueSubjectNames = useMemo(() => {
    const names = []
    slots.forEach(s => {
      const name = s.subject?.name
      if (name && !names.includes(name)) names.push(name)
    })
    return names
  }, [slots])

  // Filtered slots based on active class tab
  const filteredSlots = useMemo(() => {
    if (activeClassFilter === 'all') return slots
    return slots.filter(s => s.class_id === activeClassFilter)
  }, [slots, activeClassFilter])

  function getSlot(dayNum, period) {
    return filteredSlots.find(s => s.day_of_week === dayNum && s.period === period)
  }

  function checkConflicts(dayNum, period, teacherId, classId, excludeId) {
    const found = []
    slots.forEach(s => {
      if (s.id === excludeId) return
      if (s.day_of_week === dayNum && s.period === period) {
        if (s.teacher_id === teacherId) found.push(`${s.teacher?.full_name || t('teachers')} bu vaxtda başqa dərsdədir`)
        if (s.class_id === classId) found.push(`${s.class?.name || t('class_name')} bu vaxtda başqa dərsdədir`)
      }
    })
    return found
  }

  function handleSlotClick(dayNum, period) {
    const existing = getSlot(dayNum, period)
    if (existing) {
      setForm({
        class_id: existing.class_id || '',
        subject_id: existing.subject_id || '',
        teacher_id: existing.teacher_id || '',
        room: existing.room || '',
      })
    } else {
      setForm({ class_id: '', subject_id: '', teacher_id: '', room: '' })
    }
    setConflicts([])
    setAssignModal({ day: dayNum, period, existing })
  }

  function handleFormChange(updates) {
    const newForm = { ...form, ...updates }
    setForm(newForm)
    if (assignModal && newForm.teacher_id && newForm.class_id) {
      const c = checkConflicts(assignModal.day, assignModal.period, newForm.teacher_id, newForm.class_id, assignModal.existing?.id)
      setConflicts(c)
    } else {
      setConflicts([])
    }
  }

  async function handleAssign() {
    if (!form.class_id && !form.teacher_id && !form.subject_id) {
      setError('Ən azı sinif, müəllim və ya fənn seçilməlidir')
      return
    }
    try {
      setSaving(true)
      setError(null)
      const payload = {
        school_id: profile.school_id,
        day_of_week: assignModal.day,
        period: assignModal.period,
        class_id: form.class_id || null,
        subject_id: form.subject_id || null,
        teacher_id: form.teacher_id || null,
        room: form.room || null,
        published: assignModal.existing ? assignModal.existing.published : false,
      }

      if (assignModal.existing) {
        const { error: err } = await supabase.from('timetable_slots').update(payload).eq('id', assignModal.existing.id)
        if (err) throw err
      } else {
        const { error: err } = await supabase.from('timetable_slots').insert(payload)
        if (err) throw err
      }

      setAssignModal(null)
      await fetchData()
    } catch {
      setError(t('error'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!assignModal?.existing?.id) return
    try {
      setDeleting(true)
      await supabase.from('timetable_slots').delete().eq('id', assignModal.existing.id)
      setAssignModal(null)
      await fetchData()
    } catch {
      setError(t('error'))
    } finally {
      setDeleting(false)
    }
  }

  async function handlePublish() {
    try {
      setPublishing(true)
      setError(null)
      const { error: err } = await supabase.from('timetable_slots').update({ published: true }).eq('school_id', profile.school_id)
      if (err) throw err
      await fetchData()
    } catch {
      setError(t('error'))
    } finally {
      setPublishing(false)
    }
  }

  if (loading) return <PageSpinner />

  const totalCount = slots.length
  const publishedCount = slots.filter(s => s.published).length
  const draftCount = slots.filter(s => !s.published).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl text-gray-900">{t('timetable')}</h1>
        <div className="flex items-center gap-3">
          {draftCount > 0 && (
            <span className="text-xs text-gray-500">{draftCount} dəyişiklik dərc edilməyib</span>
          )}
          <Button onClick={() => setPublishConfirm(true)} loading={publishing} variant="teal">
            <span className="flex items-center gap-2"><Check className="w-4 h-4" /> {t('publish')}</span>
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Stats bar */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5">
          <span className="text-xs text-gray-500">Cəmi dərs</span>
          <span className="text-xs font-bold text-gray-700">{totalCount}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-teal-light border border-teal/20 rounded-lg px-3 py-1.5">
          <Check className="w-3 h-3 text-teal" />
          <span className="text-xs text-gray-500">Dərc edilib</span>
          <span className="text-xs font-bold text-teal">{publishedCount}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
          <span className="text-xs text-gray-500">Qaralama</span>
          <span className="text-xs font-bold text-amber-700">{draftCount}</span>
        </div>
      </div>

      {/* Class filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-gray-400 shrink-0" />
        <button
          onClick={() => setActiveClassFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeClassFilter === 'all'
              ? 'bg-purple text-white shadow-sm'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Bütün Siniflər
        </button>
        {classes.map(cls => (
          <button
            key={cls.id}
            onClick={() => setActiveClassFilter(cls.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeClassFilter === cls.id
                ? 'bg-purple text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cls.name}
          </button>
        ))}
      </div>

      {/* Timetable grid */}
      <Card hover={false} className="p-4 overflow-x-auto">
        <table className="w-full border-collapse min-w-[900px]">
          <thead>
            <tr>
              <th className="text-xs font-medium text-gray-400 uppercase tracking-wider px-3 py-2 text-left w-24">Dərs</th>
              {DAYS.map((day, i) => (
                <th key={i} className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-3 text-center">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERIODS.map((period, periodIdx) => (
              <tr key={period} className="border-t border-border-soft">
                {/* Period label column */}
                <td className="px-3 py-2 text-left align-top">
                  <div className="flex flex-col items-start gap-0.5 pt-1">
                    <span className="text-sm font-bold text-gray-700">{period}</span>
                    <span className="text-[10px] text-gray-400 font-medium">{PERIOD_TIMES[periodIdx]}</span>
                  </div>
                </td>

                {DAY_KEYS.map((dayNum, di) => {
                  const slot = getSlot(dayNum, period)
                  const subjectName = slot?.subject?.name
                  const colors = subjectName && subjectColorMap[subjectName]
                    ? subjectColorMap[subjectName]
                    : null
                  const isDraft = slot && !slot.published

                  return (
                    <td
                      key={di}
                      className="px-2 py-2 align-top cursor-pointer"
                      onClick={() => handleSlotClick(dayNum, period)}
                    >
                      {slot ? (
                        <div
                          className={`rounded-xl p-3 border text-left transition-all hover:shadow-md ${
                            colors
                              ? `${colors.bg} ${colors.border}`
                              : 'bg-white border-border-soft'
                          } ${isDraft ? 'ring-1 ring-amber-400' : ''}`}
                        >
                          <p className={`text-xs font-bold truncate ${colors ? colors.text : 'text-gray-900'}`}>
                            {subjectName || '—'}
                          </p>
                          <p className="text-xs text-gray-600 truncate mt-0.5">{slot.class?.name}</p>
                          <p className="text-xs text-gray-400 truncate">{slot.teacher?.full_name}</p>
                          {slot.room && (
                            <p className="text-[10px] text-gray-400 mt-1">🏫 {slot.room}</p>
                          )}
                          {isDraft && (
                            <span className="text-[10px] text-amber-600 font-medium">Qaralama</span>
                          )}
                        </div>
                      ) : (
                        <div className="h-24 flex items-center justify-center rounded-xl border-2 border-dashed border-gray-100 hover:border-purple/30 hover:bg-purple-light/30 transition-all group">
                          <Plus className="w-4 h-4 text-gray-200 group-hover:text-purple/50 transition-colors" />
                        </div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Subject color legend */}
      {uniqueSubjectNames.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-medium text-gray-500">Fənn rəngləri:</span>
          {uniqueSubjectNames.map(name => {
            const colors = subjectColorMap[name]
            return (
              <span
                key={name}
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                  colors ? `${colors.bg} ${colors.text} ${colors.border}` : 'bg-gray-100 text-gray-600 border-gray-200'
                }`}
              >
                {name}
              </span>
            )
          })}
        </div>
      )}

      {/* Publish confirmation modal */}
      <Modal
        open={publishConfirm}
        onClose={() => setPublishConfirm(false)}
        title="Cədvəli dərc et"
      >
        <div className="space-y-6">
          <p className="text-sm text-gray-600">
            Cədvəli bütün məktəb üçün dərc etmək istədiyinizə əminsiniz?
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setPublishConfirm(false)}>{t('cancel')}</Button>
            <Button
              variant="teal"
              loading={publishing}
              onClick={async () => {
                setPublishConfirm(false)
                await handlePublish()
              }}
            >
              <span className="flex items-center gap-2"><Check className="w-4 h-4" /> {t('publish')}</span>
            </Button>
          </div>
        </div>
      </Modal>

      {/* Assign / Edit modal */}
      <Modal
        open={!!assignModal}
        onClose={() => setAssignModal(null)}
        title={assignModal ? `${DAYS[(assignModal.day ?? 1) - 1]} — Dərs ${assignModal.period}` : ''}
      >
        <div className="space-y-4">
          {conflicts.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-700">Ziddiyyət aşkarlandı</span>
              </div>
              {conflicts.map((c, i) => (
                <p key={i} className="text-xs text-red-600">{c}</p>
              ))}
            </div>
          )}

          <Select label={t('class_name')} value={form.class_id} onChange={(e) => handleFormChange({ class_id: e.target.value })}>
            <option value="">{t('class_name')}</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>

          <Select label={t('subject')} value={form.subject_id} onChange={(e) => handleFormChange({ subject_id: e.target.value })}>
            <option value="">{t('subject')}</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>

          <Select label={t('teachers')} value={form.teacher_id} onChange={(e) => handleFormChange({ teacher_id: e.target.value })}>
            <option value="">{t('teachers')}</option>
            {teachers.map(tc => <option key={tc.id} value={tc.id}>{tc.full_name}</option>)}
          </Select>

          <Input
            label="Otaq"
            value={form.room}
            onChange={(e) => setForm({ ...form, room: e.target.value })}
            placeholder="Məs: 201"
          />

          <div className="flex items-center justify-between gap-3 pt-4">
            {/* Delete button — only shown when editing an existing slot */}
            {assignModal?.existing ? (
              <Button
                variant="ghost"
                onClick={handleDelete}
                loading={deleting}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200"
              >
                <span className="flex items-center gap-1.5">
                  <Trash2 className="w-4 h-4" />
                  Sil
                </span>
              </Button>
            ) : (
              <span />
            )}

            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => setAssignModal(null)}>{t('cancel')}</Button>
              <Button onClick={handleAssign} loading={saving} disabled={conflicts.length > 0}>{t('save')}</Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
