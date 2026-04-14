import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Search, UserPlus } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Table from '../../components/ui/Table'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import BulkAddModal from '../../components/ui/BulkAddModal'

export default function Teachers() {
  const { profile, t } = useAuth()
  const [loading, setLoading] = useState(true)
  const [teachers, setTeachers] = useState([])
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [search, setSearch] = useState('')
  const [addModal, setAddModal] = useState(false)
  const [editModal, setEditModal] = useState(null)
  const [deleteModal, setDeleteModal] = useState(null)
  const [bulkModal, setBulkModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({ full_name: '', email: '', password: '', subject_ids: [], class_ids: [] })

  useEffect(() => {
    if (profile?.school_id) fetchData()
  }, [profile?.school_id])

  async function fetchData() {
    try {
      setLoading(true)
      const [teachersRes, classesRes, subjectsRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('*, teacher_classes(id, class:classes(id, name), subject:subjects(id, name))')
          .eq('school_id', profile.school_id)
          .eq('role', 'teacher'),
        supabase.from('classes').select('id, name').eq('school_id', profile.school_id).order('name'),
        supabase.from('subjects').select('id, name').eq('school_id', profile.school_id).order('name'),
      ])
      if (teachersRes.error) throw teachersRes.error
      setTeachers(teachersRes.data || [])
      setClasses(classesRes.data || [])
      setSubjects(subjectsRes.data || [])
    } catch (err) {
      console.error('fetchData error:', err)
      setError(t('error'))
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setForm({ full_name: '', email: '', password: '', subject_ids: [], class_ids: [] })
  }

  function toggleArrayItem(arr, item) {
    return arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item]
  }

  function buildTeacherClassEntries(teacherId, classIds, subjectIds) {
    const entries = []
    for (const cid of classIds) {
      for (const sid of subjectIds) {
        entries.push({ teacher_id: teacherId, class_id: cid, subject_id: sid })
      }
    }
    return entries.filter(e => e.class_id && e.subject_id)
  }

  async function createUser(email, password, full_name) {
    const { data, error } = await supabase.functions.invoke('create-user', {
      body: { email, password, full_name, role: 'teacher', school_id: profile.school_id },
    })
    if (error) throw error
    if (data?.error) throw new Error(data.error)
    return data.user_id
  }

  async function handleAdd() {
    try {
      setSaving(true)
      setError(null)
      const userId = await createUser(form.email.trim(), form.password, form.full_name.trim())

      const entries = buildTeacherClassEntries(userId, form.class_ids, form.subject_ids)
      if (entries.length > 0) {
        await supabase.from('teacher_classes').insert(entries)
      }

      setAddModal(false)
      resetForm()
      await fetchData()
    } catch (err) {
      console.error('handleAdd error:', err)
      setError(err.message || t('error'))
    } finally {
      setSaving(false)
    }
  }

  async function handleEdit() {
    try {
      setSaving(true)
      setError(null)
      const { error: err } = await supabase.from('profiles').update({
        full_name: form.full_name,
        email: form.email,
      }).eq('id', editModal.id)
      if (err) throw err

      await supabase.from('teacher_classes').delete().eq('teacher_id', editModal.id)
      const entries = buildTeacherClassEntries(editModal.id, form.class_ids, form.subject_ids)
      if (entries.length > 0) {
        await supabase.from('teacher_classes').insert(entries)
      }

      setEditModal(null)
      resetForm()
      await fetchData()
    } catch (err) {
      console.error('handleEdit error:', err)
      setError(t('error'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    try {
      setSaving(true)
      await supabase.from('teacher_classes').delete().eq('teacher_id', deleteModal.id)
      const { error: err } = await supabase.from('profiles').delete().eq('id', deleteModal.id)
      if (err) throw err
      setDeleteModal(null)
      await fetchData()
    } catch (err) {
      console.error('handleDelete error:', err)
      setError(t('error'))
    } finally {
      setSaving(false)
    }
  }

  function openEditModal(teacher) {
    const tcEntries = teacher.teacher_classes || []
    setForm({
      full_name: teacher.full_name,
      email: teacher.email,
      password: '',
      subject_ids: [...new Set(tcEntries.map(tc => tc.subject?.id).filter(Boolean))],
      class_ids: [...new Set(tcEntries.map(tc => tc.class?.id).filter(Boolean))],
    })
    setEditModal(teacher)
  }

  function getUniqueSubjects(tcEntries) {
    const map = new Map()
    ;(tcEntries || []).forEach(tc => { if (tc.subject?.id) map.set(tc.subject.id, tc.subject) })
    return [...map.values()]
  }

  function getUniqueClasses(tcEntries) {
    const map = new Map()
    ;(tcEntries || []).forEach(tc => { if (tc.class?.id) map.set(tc.class.id, tc.class) })
    return [...map.values()]
  }

  // Bulk import handler — called per-row by BulkAddModal
  async function handleBulkImport(row) {
    await createUser(row.email.trim(), row.password?.trim() || 'Zirva2025!', row.full_name.trim())
  }

  const bulkColumns = [
    { key: 'full_name', label: 'Ad Soyad', required: true, placeholder: 'Aysel Məmmədova' },
    { key: 'email', label: 'E-poçt', required: true, type: 'email', placeholder: 'muellim@mekteb.az' },
    { key: 'password', label: 'Şifrə', placeholder: 'Zirva2025!' },
  ]

  const filtered = teachers.filter(tc =>
    tc.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    tc.email?.toLowerCase().includes(search.toLowerCase())
  )

  const columns = [
    {
      key: 'full_name',
      label: t('full_name'),
      render: (val) => (
        <div className="flex items-center gap-3">
          <Avatar name={val} size="sm" />
          <span className="font-medium text-gray-900">{val}</span>
        </div>
      ),
    },
    { key: 'email', label: t('email') },
    {
      key: 'teacher_classes',
      label: t('subject'),
      render: (val) => {
        const unique = getUniqueSubjects(val)
        return unique.length > 0
          ? <div className="flex flex-wrap gap-1">{unique.map(s => <Badge key={s.id} variant="default">{s.name}</Badge>)}</div>
          : <span className="text-gray-400">—</span>
      },
    },
    {
      key: 'teacher_classes',
      label: t('classes'),
      render: (val) => {
        const unique = getUniqueClasses(val)
        return unique.length > 0
          ? <div className="flex flex-wrap gap-1">{unique.map(c => <Badge key={c.id} variant="default">{c.name}</Badge>)}</div>
          : <span className="text-gray-400">—</span>
      },
    },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); openEditModal(row) }} className="p-1.5 text-gray-400 hover:text-purple transition-colors">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setDeleteModal(row) }} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  const MultiSelect = ({ label, options, selected, onToggle }) => (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="border border-border-soft rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
        {options.map(opt => (
          <label key={opt.id} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selected.includes(opt.id)}
              onChange={() => onToggle(opt.id)}
              className="rounded border-border-soft text-purple focus:ring-purple"
            />
            <span className="text-sm">{opt.name}</span>
          </label>
        ))}
        {options.length === 0 && <p className="text-xs text-gray-400">{t('no_data')}</p>}
      </div>
    </div>
  )

  if (loading) return <PageSpinner />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-serif text-3xl text-gray-900">{t('teachers')}</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="ghost" onClick={() => setBulkModal(true)}>
            <span className="flex items-center gap-2"><UserPlus className="w-4 h-4" /> Toplu əlavə</span>
          </Button>
          <Button onClick={() => { resetForm(); setAddModal(true) }}>
            <span className="flex items-center gap-2"><Plus className="w-4 h-4" /> {t('add_teacher')}</span>
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder={t('search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-border-soft rounded-md pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple focus:border-transparent"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Card hover={false} className="p-0 overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            icon={Search}
            title={t('no_data')}
            description={t('add_teacher')}
            actionLabel={t('add_teacher')}
            onAction={() => { resetForm(); setAddModal(true) }}
          />
        ) : (
          <Table columns={columns} data={filtered} />
        )}
      </Card>

      {/* Add Modal */}
      <Modal open={addModal} onClose={() => setAddModal(false)} title={t('add_teacher')}>
        <div className="space-y-4">
          <Input label={t('full_name')} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          <Input label={t('email')} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Şifrə" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <MultiSelect label={t('subject')} options={subjects} selected={form.subject_ids} onToggle={(id) => setForm({ ...form, subject_ids: toggleArrayItem(form.subject_ids, id) })} />
          <MultiSelect label={t('classes')} options={classes} selected={form.class_ids} onToggle={(id) => setForm({ ...form, class_ids: toggleArrayItem(form.class_ids, id) })} />
          {form.class_ids.length > 0 && form.subject_ids.length === 0 && (
            <p className="text-xs text-amber-600 bg-amber-50 rounded px-3 py-2">Sinif seçmək üçün ən azı bir fənn də seçin.</p>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setAddModal(false)}>{t('cancel')}</Button>
            <Button onClick={handleAdd} loading={saving}>{t('add')}</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editModal} onClose={() => setEditModal(null)} title={t('edit')}>
        <div className="space-y-4">
          <Input label={t('full_name')} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          <Input label={t('email')} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <MultiSelect label={t('subject')} options={subjects} selected={form.subject_ids} onToggle={(id) => setForm({ ...form, subject_ids: toggleArrayItem(form.subject_ids, id) })} />
          <MultiSelect label={t('classes')} options={classes} selected={form.class_ids} onToggle={(id) => setForm({ ...form, class_ids: toggleArrayItem(form.class_ids, id) })} />
          {form.class_ids.length > 0 && form.subject_ids.length === 0 && (
            <p className="text-xs text-amber-600 bg-amber-50 rounded px-3 py-2">Sinif seçmək üçün ən azı bir fənn də seçin.</p>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setEditModal(null)}>{t('cancel')}</Button>
            <Button onClick={handleEdit} loading={saving}>{t('save')}</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title={t('delete')} size="sm">
        <p className="text-sm text-gray-600 mb-6">
          <strong>{deleteModal?.full_name}</strong> adlı müəllimi silmək istədiyinizə əminsiniz?
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeleteModal(null)}>{t('cancel')}</Button>
          <Button variant="danger" onClick={handleDelete} loading={saving}>{t('delete')}</Button>
        </div>
      </Modal>

      {/* Bulk Add Modal */}
      <BulkAddModal
        open={bulkModal}
        onClose={() => setBulkModal(false)}
        title="Toplu müəllim əlavəsi"
        columns={bulkColumns}
        onImport={handleBulkImport}
        onDone={fetchData}
      />
    </div>
  )
}
