import { useState, useEffect } from 'react'
import { Plus, AlertTriangle, Check } from 'lucide-react'
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

export default function Timetable() {
  const { profile, t } = useAuth()
  const [loading, setLoading] = useState(true)
  const [slots, setSlots] = useState([])
  const [classes, setClasses] = useState([])
  const [teachers, setTeachers] = useState([])
  const [subjects, setSubjects] = useState([])
  const [assignModal, setAssignModal] = useState(null)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState(null)
  const [conflicts, setConflicts] = useState([])
  const [form, setForm] = useState({ class_id: '', subject_id: '', teacher_id: '', room: '' })

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

  function getSlot(dayNum, period) {
    return slots.find(s => s.day_of_week === dayNum && s.period === period)
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
        published: false,
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

  const unpublishedCount = slots.filter(s => !s.published).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl text-gray-900">{t('timetable')}</h1>
        <div className="flex items-center gap-3">
          {unpublishedCount > 0 && (
            <span className="text-xs text-gray-500">{unpublishedCount} dəyişiklik dərc edilməyib</span>
          )}
          <Button onClick={handlePublish} loading={publishing} variant="teal">
            <span className="flex items-center gap-2"><Check className="w-4 h-4" /> {t('publish')}</span>
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Card hover={false} className="p-4 overflow-x-auto">
        <table className="w-full border-collapse min-w-[800px]">
          <thead>
            <tr>
              <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2 text-left w-20">Dərs</th>
              {DAYS.map((day, i) => (
                <th key={i} className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2 text-center">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERIODS.map(period => (
              <tr key={period} className="border-t border-border-soft">
                <td className="px-3 py-2 text-sm font-medium text-gray-600 text-center">{period}</td>
                {DAY_KEYS.map((dayNum, di) => {
                  const slot = getSlot(dayNum, period)
                  return (
                    <td
                      key={di}
                      className={`px-2 py-2 text-center cursor-pointer transition-colors hover:bg-purple-light/50 ${slot && !slot.published ? 'bg-yellow-50' : ''}`}
                      onClick={() => handleSlotClick(dayNum, period)}
                    >
                      {slot ? (
                        <div className="bg-white border border-border-soft rounded-lg p-2 text-left space-y-1">
                          <p className="text-xs font-medium text-gray-900 truncate">{slot.subject?.name || '—'}</p>
                          <p className="text-xs text-gray-500 truncate">{slot.class?.name}</p>
                          <p className="text-xs text-gray-400 truncate">{slot.teacher?.full_name}</p>
                          {slot.room && <p className="text-xs text-gray-400">Otaq: {slot.room}</p>}
                          {!slot.published && (
                            <Badge variant="late">Qaralama</Badge>
                          )}
                        </div>
                      ) : (
                        <div className="h-20 flex items-center justify-center">
                          <Plus className="w-4 h-4 text-gray-300" />
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

      <Modal open={!!assignModal} onClose={() => setAssignModal(null)} title={assignModal ? `${DAYS[(assignModal.day ?? 1) - 1]} - Dərs ${assignModal.period}` : ''}>
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
          <Input label="Otaq" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} placeholder="Məs: 201" />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setAssignModal(null)}>{t('cancel')}</Button>
            <Button onClick={handleAssign} loading={saving} disabled={conflicts.length > 0}>{t('save')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
