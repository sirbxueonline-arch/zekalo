import { useState, useEffect } from 'react'
import { Search, Plus, Edit2, Trash2, Download, Users, UserPlus } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import { Select } from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Table from '../../components/ui/Table'
import { PageSpinner } from '../../components/ui/Spinner'
import { GradeBadge } from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import Avatar from '../../components/ui/Avatar'
import BulkAddModal from '../../components/ui/BulkAddModal'

export default function Students() {
  const { profile, t } = useAuth()
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState([])
  const [classes, setClasses] = useState([])
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('full_name')
  const [sortDir, setSortDir] = useState('asc')
  const [addModal, setAddModal] = useState(false)
  const [editModal, setEditModal] = useState(null)
  const [deleteModal, setDeleteModal] = useState(null)
  const [bulkModal, setBulkModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({ full_name: '', email: '', password: '', class_id: '', parent_email: '' })

  useEffect(() => {
    if (profile?.school_id) fetchData()
  }, [profile?.school_id])

  async function fetchData() {
    try {
      setLoading(true)
      const [studentsRes, classesRes, membersRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('school_id', profile.school_id).eq('role', 'student'),
        supabase.from('classes').select('id, name').eq('school_id', profile.school_id).order('name'),
        supabase.from('class_members').select('student_id, class_id, class:classes(id, name)'),
      ])
      if (studentsRes.error) throw studentsRes.error

      const classMap = {}
      ;(membersRes.data || []).forEach(m => {
        if (m.student_id && m.class) classMap[m.student_id] = m.class
      })

      const studentsWithClass = (studentsRes.data || []).map(s => ({
        ...s,
        class: classMap[s.id] || null,
      }))

      setStudents(studentsWithClass)
      setClasses(classesRes.data || [])
    } catch (err) {
      console.error('fetchData error:', err)
      setError(t('error'))
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setForm({ full_name: '', email: '', password: '', class_id: '', parent_email: '' })
  }

  async function createUser(email, password, full_name) {
    const { data, error } = await supabase.functions.invoke('create-user', {
      body: { email, password, full_name, role: 'student', school_id: profile.school_id },
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

      if (form.class_id) {
        await supabase.from('class_members').insert({
          class_id: form.class_id,
          student_id: userId,
        })
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

      await supabase.from('class_members').delete().eq('student_id', editModal.id)
      if (form.class_id) {
        await supabase.from('class_members').insert({
          class_id: form.class_id,
          student_id: editModal.id,
        })
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
      const { error: err } = await supabase.from('profiles').delete().eq('id', deleteModal.id)
      if (err) throw err
      setDeleteModal(null)
      await fetchData()
    } catch {
      setError(t('error'))
    } finally {
      setSaving(false)
    }
  }

  function openEditModal(student) {
    setForm({
      full_name: student.full_name,
      email: student.email,
      password: '',
      class_id: student.class?.id || '',
      parent_email: student.parent_email || '',
    })
    setEditModal(student)
  }

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  function exportCsv() {
    const headers = ['Ad Soyad', 'Sinif', 'E-poçt', 'Davamiyyət %', 'Ortalama qiymət']
    const rows = filtered.map(s => [
      s.full_name,
      s.class?.name || '',
      s.email,
      s.attendance_pct ?? '',
      s.avg_grade ?? '',
    ])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'students_export.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  // Bulk import handler — called per-row by BulkAddModal
  async function handleBulkImport(row) {
    const userId = await createUser(row.email.trim(), row.password?.trim() || 'Zirva2025!', row.full_name.trim())

    const className = row.class_name?.trim()
    if (className) {
      // Find existing class by name (case-insensitive), or create it on the fly
      let classId
      const existing = classes.find(c => c.name.toLowerCase() === className.toLowerCase())
      if (existing) {
        classId = existing.id
      } else {
        const { data: newClass } = await supabase
          .from('classes')
          .insert({ name: className, school_id: profile.school_id })
          .select('id')
          .single()
        if (newClass) {
          classId = newClass.id
          // Keep local classes list in sync so subsequent rows reuse the same class
          setClasses(prev => [...prev, { id: newClass.id, name: className }])
        }
      }
      if (classId) {
        await supabase.from('class_members').insert({
          class_id: classId,
          student_id: userId,
        })
      }
    }
  }

  const bulkColumns = [
    { key: 'full_name', label: 'Ad Soyad', required: true, placeholder: 'Əli Əliyev' },
    { key: 'email', label: 'E-poçt', required: true, type: 'email', placeholder: 'sehifad@mekteb.az' },
    { key: 'password', label: 'Şifrə', placeholder: 'Zirva2025!' },
    {
      key: 'class_name',
      label: 'Sinif',
      type: 'select',
      options: Array.from({ length: 11 }, (_, i) => ({ value: String(i + 1), label: `${i + 1}` })),
    },
  ]

  const filtered = students
    .filter(s => s.full_name?.toLowerCase().includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const aVal = a[sortKey] ?? ''
      const bVal = b[sortKey] ?? ''
      if (typeof aVal === 'number' && typeof bVal === 'number') return sortDir === 'asc' ? aVal - bVal : bVal - aVal
      return sortDir === 'asc' ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal))
    })

  const columns = [
    {
      key: 'full_name',
      label: (
        <button onClick={() => handleSort('full_name')} className="flex items-center gap-1">
          {t('full_name')} {sortKey === 'full_name' && (sortDir === 'asc' ? '↑' : '↓')}
        </button>
      ),
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <Avatar name={val} size="sm" />
          <span className="font-medium text-gray-900">{val}</span>
        </div>
      ),
    },
    { key: 'class', label: t('class_name'), render: (val) => val?.name || '—' },
    { key: 'email', label: t('email') },
    {
      key: 'attendance_pct',
      label: (
        <button onClick={() => handleSort('attendance_pct')} className="flex items-center gap-1">
          Davamiyyət {sortKey === 'attendance_pct' && (sortDir === 'asc' ? '↑' : '↓')}
        </button>
      ),
      render: (val) => val != null ? `${val}%` : '—',
    },
    {
      key: 'avg_grade',
      label: (
        <button onClick={() => handleSort('avg_grade')} className="flex items-center gap-1">
          Ortalama {sortKey === 'avg_grade' && (sortDir === 'asc' ? '↑' : '↓')}
        </button>
      ),
      render: (val) => val != null ? <GradeBadge score={val} /> : '—',
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

  if (loading) return <PageSpinner />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-serif text-3xl text-gray-900">{t('students')}</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="ghost" onClick={exportCsv}>
            <span className="flex items-center gap-2"><Download className="w-4 h-4" /> {t('export_csv')}</span>
          </Button>
          <Button variant="ghost" onClick={() => setBulkModal(true)}>
            <span className="flex items-center gap-2"><UserPlus className="w-4 h-4" /> Toplu əlavə</span>
          </Button>
          <Button onClick={() => { resetForm(); setAddModal(true) }}>
            <span className="flex items-center gap-2"><Plus className="w-4 h-4" /> {t('add_student')}</span>
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
          <EmptyState icon={Users} title={t('no_data')} description={t('add_student')} actionLabel={t('add_student')} onAction={() => { resetForm(); setAddModal(true) }} />
        ) : (
          <Table columns={columns} data={filtered} />
        )}
      </Card>

      {/* Single Add Modal */}
      <Modal open={addModal} onClose={() => setAddModal(false)} title={t('add_student')}>
        <div className="space-y-4">
          <Input label={t('full_name')} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          <Input label={t('email')} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Şifrə" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <Select label={t('class_name')} value={form.class_id} onChange={(e) => setForm({ ...form, class_id: e.target.value })}>
            <option value="">— Sinif seçin —</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
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
          <Select label={t('class_name')} value={form.class_id} onChange={(e) => setForm({ ...form, class_id: e.target.value })}>
            <option value="">— Sinif seçin —</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setEditModal(null)}>{t('cancel')}</Button>
            <Button onClick={handleEdit} loading={saving}>{t('save')}</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title={t('delete')} size="sm">
        <p className="text-sm text-gray-600 mb-6">
          <strong>{deleteModal?.full_name}</strong> adlı şagirdi silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz.
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
        title="Toplu şagird əlavəsi"
        columns={bulkColumns}
        onImport={handleBulkImport}
        onDone={fetchData}
      />
    </div>
  )
}
