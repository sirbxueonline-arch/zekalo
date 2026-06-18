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

// §2.2 LOW dial: collapse the rainbow rotation — every subject block is a single
// muted brand-tint (§4.7 calendar) with a thin accent left-bar. Color = status only.
const SUBJECT_BLOCK = 'bg-brand-50/70 border-brand-100'

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
        <h1 className="text-2xl font-bold text-ink-900 font-display">{t('timetable')}</h1>
        <div className="flex items-center gap-3">
          {draftCount > 0 && (
            <span className="text-xs text-ink-400 tabular-nums">{draftCount} dəyişiklik dərc edilməyib</span>
          )}
          <Button onClick={() => setPublishConfirm(true)} loading={publishing} variant="primary">
            <span className="flex items-center gap-2"><Check className="w-4 h-4" /> {t('publish')}</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-danger/8 border border-danger/20 rounded-input px-4 py-2.5">
          <AlertTriangle className="w-4 h-4 text-danger shrink-0" />
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}

      {/* Stats bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2 bg-surface border border-hairline rounded-input px-3 py-1.5">
          <span className="text-xs font-semibold text-ink-400 uppercase tracking-wide">Cəmi</span>
          <span className="text-sm font-semibold text-ink-900 tabular-nums">{totalCount}</span>
        </div>
        <div className="flex items-center gap-2 bg-surface border border-hairline rounded-input px-3 py-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
          <span className="text-xs font-semibold text-ink-400 uppercase tracking-wide">Dərc edilib</span>
          <span className="text-sm font-semibold text-ink-900 tabular-nums">{publishedCount}</span>
        </div>
        {draftCount > 0 && (
          <div className="flex items-center gap-2 bg-surface border border-hairline rounded-input px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-warning inline-block" />
            <span className="text-xs font-semibold text-ink-400 uppercase tracking-wide">Qaralama</span>
            <span className="text-sm font-semibold text-ink-900 tabular-nums">{draftCount}</span>
          </div>
        )}
      </div>

      {/* Class filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-3.5 h-3.5 shrink-0 text-ink-400" />
        <button
          onClick={() => setActiveClassFilter('all')}
          className={`px-3 py-1 rounded-input text-xs font-semibold transition-all border ${
            activeClassFilter === 'all'
              ? 'bg-brand-500 text-white border-brand-500 shadow-soft'
              : 'bg-surface text-ink-600 border-hairline hover:border-brand-300 hover:text-brand-600'
          }`}
        >
          Bütün Siniflər
        </button>
        {classes.map(cls => (
          <button
            key={cls.id}
            onClick={() => setActiveClassFilter(cls.id)}
            className={`px-3 py-1 rounded-input text-xs font-semibold transition-all border ${
              activeClassFilter === cls.id
                ? 'bg-brand-500 text-white border-brand-500 shadow-soft'
                : 'bg-surface text-ink-600 border-hairline hover:border-brand-300 hover:text-brand-600'
            }`}
          >
            {cls.name}
          </button>
        ))}
      </div>

      {/* Timetable grid */}
      <div className="bg-surface border border-hairline rounded-tile overflow-x-auto">
        <table className="w-full border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-surface-2">
              <th className="text-xs font-semibold text-ink-400 uppercase tracking-wide px-3 py-3 text-left w-24 border-b border-hairline-strong">Dərs</th>
              {DAYS.map((day, i) => (
                <th key={i} className="text-xs font-semibold text-ink-400 uppercase tracking-wide px-3 py-3 text-center border-b border-hairline-strong">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERIODS.map((period, periodIdx) => (
              <tr key={period} className="border-t border-hairline">
                {/* Period label column */}
                <td className="px-3 py-2 text-left align-top border-r border-hairline">
                  <div className="flex flex-col items-start gap-0.5 pt-1">
                    <span className="text-sm font-semibold text-ink-700 tabular-nums">{period}</span>
                    <span className="text-[10px] text-ink-400 font-medium tabular-nums">{PERIOD_TIMES[periodIdx]}</span>
                  </div>
                </td>

                {DAY_KEYS.map((dayNum, di) => {
                  const slot = getSlot(dayNum, period)
                  const subjectName = slot?.subject?.name
                  const isDraft = slot && !slot.published

                  return (
                    <td
                      key={di}
                      className="px-2 py-2 align-top cursor-pointer hover:bg-brand-50/40 transition-colors"
                      onClick={() => handleSlotClick(dayNum, period)}
                    >
                      {slot ? (
                        // §4.7 muted event block: brand-tint fill + 2px accent left-bar + dark text
                        <div
                          className={`relative rounded-input p-2.5 pl-3 border text-left transition-shadow hover:shadow-soft ${SUBJECT_BLOCK} ${isDraft ? 'ring-1 ring-warning/50' : ''}`}
                        >
                          <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-full bg-brand-400" />
                          <p className="text-xs font-semibold text-ink-900 truncate">
                            {subjectName || '—'}
                          </p>
                          <p className="text-xs text-ink-600 truncate mt-0.5">{slot.class?.name}</p>
                          <p className="text-xs text-ink-400 truncate">{slot.teacher?.full_name}</p>
                          {slot.room && (
                            <p className="text-[10px] text-ink-400 mt-1 flex items-center gap-1">
                              <span className="inline-block w-1.5 h-1.5 rounded-sm bg-ink-300" />
                              {slot.room}
                            </p>
                          )}
                          {isDraft && (
                            <span className="pill-peach mt-1 text-[10px]">Qaralama</span>
                          )}
                        </div>
                      ) : (
                        <div
                          className="h-20 flex items-center justify-center rounded-input border-2 border-dashed border-hairline-strong transition-all group hover:border-brand-300 hover:bg-brand-50/50"
                        >
                          <Plus className="w-3.5 h-3.5 text-ink-400 group-hover:text-brand-500 transition-colors" />
                        </div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Subjects present (neutral chips — color reserved for status only) */}
      {uniqueSubjectNames.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-ink-400 uppercase tracking-wide">Fənlər:</span>
          {uniqueSubjectNames.map(name => (
            <span
              key={name}
              className="inline-flex items-center px-2.5 py-0.5 rounded-chip text-xs font-medium bg-surface-2 text-ink-600 border border-hairline"
            >
              {name}
            </span>
          ))}
        </div>
      )}

      {/* Publish confirmation modal */}
      <Modal
        open={publishConfirm}
        onClose={() => setPublishConfirm(false)}
        title="Cədvəli dərc et"
      >
        <div className="space-y-6">
          <p className="text-sm text-ink-600">
            Cədvəli bütün məktəb üçün dərc etmək istədiyinizə əminsiniz?
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setPublishConfirm(false)}>{t('cancel')}</Button>
            <Button
              variant="primary"
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
            <div className="bg-danger/8 border border-danger/20 rounded-input p-3.5">
              <div className="flex items-center gap-2 mb-1.5">
                <AlertTriangle className="w-4 h-4 text-danger" />
                <span className="text-sm font-semibold text-danger">Ziddiyyət aşkarlandı</span>
              </div>
              {conflicts.map((c, i) => (
                <p key={i} className="text-xs text-danger/80">{c}</p>
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

          <div className="flex items-center justify-between gap-3 pt-4 border-t border-hairline">
            {/* Delete button — only shown when editing an existing slot */}
            {assignModal?.existing ? (
              <Button
                variant="ghost"
                onClick={handleDelete}
                loading={deleting}
                className="text-danger hover:text-danger hover:bg-danger/8 border border-danger/20"
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
