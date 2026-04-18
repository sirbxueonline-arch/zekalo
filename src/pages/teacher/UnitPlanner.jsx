import { useState, useEffect } from 'react'
import { Plus, BookOpen, Calendar, Clock, Edit2, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import Badge from '../../components/ui/Badge'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import Input from '../../components/ui/Input'
import { Textarea, Select } from '../../components/ui/Input'
import { fmtDate } from '../../lib/dateUtils'

const ATL_SKILLS = ['Düşüncə', 'Ünsiyyət', 'Sosial', 'Özünüidarəetmə', 'Tədqiqat']

const statusConfig = {
  draft: { label: 'Qaralama', className: 'bg-surface text-gray-600 border border-border-soft' },
  active: { label: 'Aktiv', className: 'bg-purple-light text-purple-dark border border-[#AFA9EC]' },
  complete: { label: 'Tamamlandı', className: 'bg-teal-light text-[#085041] border border-teal-mid' },
}

const subjectColors = {
  'Riyaziyyat': 'bg-blue-50 text-blue-700',
  'Fizika': 'bg-orange-50 text-orange-700',
  'Kimya': 'bg-green-50 text-green-700',
  'Biologiya': 'bg-teal-light text-[#085041]',
  'Tarix': 'bg-amber-50 text-amber-700',
  'Ədəbiyyat': 'bg-purple-light text-purple-dark',
  'İngilis dili': 'bg-indigo-50 text-indigo-700',
  default: 'bg-surface text-gray-600',
}

function getSubjectColor(subject) {
  return subjectColors[subject] || subjectColors.default
}

export default function UnitPlanner() {
  const { profile, t } = useAuth()
  const [loading, setLoading] = useState(true)
  const [units, setUnits] = useState([])
  const [classes, setClasses] = useState([])
  const [addModal, setAddModal] = useState(false)
  const [editModal, setEditModal] = useState(null)
  const [deleteModal, setDeleteModal] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [form, setForm] = useState({
    title: '', subject: '', class_id: '', objectives: '',
    atl_skills: [], start_date: '', end_date: '', status: 'draft',
  })

  useEffect(() => {
    if (profile?.school_id) fetchData()
  }, [profile?.school_id])

  async function fetchData() {
    try {
      setLoading(true)
      const [unitsRes, classesRes] = await Promise.all([
        supabase.from('unit_plans').select('*, class:classes(id,name)').eq('school_id', profile.school_id).eq('teacher_id', profile.id).order('created_at', { ascending: false }),
        supabase.from('classes').select('id,name').eq('school_id', profile.school_id).order('name'),
      ])
      setUnits(unitsRes.data || [])
      setClasses(classesRes.data || [])
    } catch {
      // unit_plans table may not exist — show empty state
      setUnits([])
      try {
        const { data } = await supabase.from('classes').select('id,name').eq('school_id', profile.school_id).order('name')
        setClasses(data || [])
      } catch {}
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setForm({ title: '', subject: '', class_id: '', objectives: '', atl_skills: [], start_date: '', end_date: '', status: 'draft' })
  }

  function toggleATL(skill) {
    setForm(f => ({
      ...f,
      atl_skills: f.atl_skills.includes(skill)
        ? f.atl_skills.filter(s => s !== skill)
        : [...f.atl_skills, skill],
    }))
  }

  async function handleAdd() {
    try {
      setSaving(true)
      setError(null)
      const { error: err } = await supabase.from('unit_plans').insert({
        title: form.title,
        subject: form.subject,
        class_id: form.class_id || null,
        objectives: form.objectives,
        atl_skills: form.atl_skills,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        status: form.status,
        teacher_id: profile.id,
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

  async function handleEdit() {
    try {
      setSaving(true)
      setError(null)
      const { error: err } = await supabase.from('unit_plans').update({
        title: form.title,
        subject: form.subject,
        class_id: form.class_id || null,
        objectives: form.objectives,
        atl_skills: form.atl_skills,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        status: form.status,
      }).eq('id', editModal.id)
      if (err) throw err
      setEditModal(null)
      resetForm()
      await fetchData()
    } catch (err) {
      setError(err.message || t('error'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    try {
      setSaving(true)
      await supabase.from('unit_plans').delete().eq('id', deleteModal.id)
      setDeleteModal(null)
      await fetchData()
    } catch {
      setError(t('error'))
    } finally {
      setSaving(false)
    }
  }

  function openEdit(unit) {
    setForm({
      title: unit.title || '',
      subject: unit.subject || '',
      class_id: unit.class_id || '',
      objectives: unit.objectives || '',
      atl_skills: unit.atl_skills || [],
      start_date: unit.start_date || '',
      end_date: unit.end_date || '',
      status: unit.status || 'draft',
    })
    setEditModal(unit)
  }

  function durationLabel(start, end) {
    if (!start || !end) return null
    const days = Math.round((new Date(end) - new Date(start)) / 86400000)
    return days > 0 ? `${days} gün` : null
  }

  const filtered = units.filter(u => filterStatus === 'all' || u.status === filterStatus)

  const UnitFormFields = () => (
    <div className="space-y-4">
      <Input label="Vahid başlığı" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Məs: Trigonometriya Vahidi" />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Fənn" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Riyaziyyat" />
        <Select label="Sinif" value={form.class_id} onChange={e => setForm({ ...form, class_id: e.target.value })}>
          <option value="">— Sinif —</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
      </div>
      <Textarea label="Öyrənmə məqsədləri" value={form.objectives} onChange={e => setForm({ ...form, objectives: e.target.value })} rows={3} placeholder="Şagirdlər bu vahidin sonunda..." />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">ATL Bacarıqları</label>
        <div className="flex flex-wrap gap-2">
          {ATL_SKILLS.map(skill => (
            <button
              key={skill}
              type="button"
              onClick={() => toggleATL(skill)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${form.atl_skills.includes(skill) ? 'bg-purple text-white border-purple' : 'bg-surface text-gray-600 border-border-soft hover:border-purple hover:text-purple'}`}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Başlama tarixi" type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
        <Input label="Bitmə tarixi" type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} />
      </div>
      <Select label="Status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
        <option value="draft">Qaralama</option>
        <option value="active">Aktiv</option>
        <option value="complete">Tamamlandı</option>
      </Select>
    </div>
  )

  if (loading) return <PageSpinner />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-3xl text-gray-900">Vahid Planlayıcı</h1>
          <p className="text-sm text-gray-500 mt-1">{units.length} vahid · {units.filter(u => u.status === 'active').length} aktiv</p>
        </div>
        <Button onClick={() => { resetForm(); setAddModal(true) }}>
          <span className="flex items-center gap-2"><Plus className="w-4 h-4" /> Yeni vahid</span>
        </Button>
      </div>

      <div className="flex gap-2">
        {[['all', 'Hamısı'], ['draft', 'Qaralama'], ['active', 'Aktiv'], ['complete', 'Tamamlandı']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilterStatus(val)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterStatus === val ? 'bg-purple text-white' : 'bg-surface text-gray-600 hover:text-purple'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {filtered.length === 0 ? (
        <EmptyState icon={BookOpen} title="Vahid tapılmadı" description="İlk tədris vahidinizi əlavə edin." actionLabel="Yeni vahid" onAction={() => { resetForm(); setAddModal(true) }} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(unit => {
            const cfg = statusConfig[unit.status] || statusConfig.draft
            const dur = durationLabel(unit.start_date, unit.end_date)
            return (
              <Card key={unit.id} className="p-6 flex flex-col gap-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getSubjectColor(unit.subject)}`}>{unit.subject || 'Fənn yoxdur'}</span>
                    <h3 className="font-serif text-xl text-gray-900 mt-2 leading-tight">{unit.title}</h3>
                  </div>
                  <span className={`rounded-full text-xs font-medium px-3 py-0.5 whitespace-nowrap ${cfg.className}`}>{cfg.label}</span>
                </div>

                {unit.class && (
                  <p className="text-sm text-gray-500">{unit.class.name}</p>
                )}

                {unit.objectives && (
                  <p className="text-sm text-gray-600 line-clamp-2">{unit.objectives}</p>
                )}

                {(unit.atl_skills || []).length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {unit.atl_skills.map(skill => (
                      <span key={skill} className="text-xs bg-purple-light text-purple-dark px-2 py-0.5 rounded-full">{skill}</span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between mt-auto pt-2 border-t border-border-soft">
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    {unit.start_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {fmtDate(new Date(unit.start_date), { day: 'numeric', month: 'short' })}
                      </span>
                    )}
                    {dur && (
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{dur}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(unit)} className="p-1.5 text-gray-400 hover:text-purple transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteModal(unit)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal open={addModal} onClose={() => { setAddModal(false); setError(null) }} title="Yeni Vahid" size="lg">
        <div className="space-y-4">
          <UnitFormFields />
          {error && <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{error}</p>}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => { setAddModal(false); setError(null) }}>{t('cancel')}</Button>
            <Button onClick={handleAdd} loading={saving} disabled={!form.title}>{t('add')}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!editModal} onClose={() => { setEditModal(null); setError(null) }} title="Vahidi Düzənlə" size="lg">
        <div className="space-y-4">
          <UnitFormFields />
          {error && <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{error}</p>}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => { setEditModal(null); setError(null) }}>{t('cancel')}</Button>
            <Button onClick={handleEdit} loading={saving} disabled={!form.title}>{t('save')}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title={t('delete')} size="sm">
        <p className="text-sm text-gray-600 mb-6">
          <strong>{deleteModal?.title}</strong> vahidini silmək istədiyinizə əminsiniz?
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeleteModal(null)}>{t('cancel')}</Button>
          <Button variant="danger" onClick={handleDelete} loading={saving}>{t('delete')}</Button>
        </div>
      </Modal>
    </div>
  )
}
