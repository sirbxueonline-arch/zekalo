import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Search, UserPlus, Heart, X } from 'lucide-react'
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

export default function Parents() {
  const { profile, t } = useAuth()
  const [loading, setLoading] = useState(true)
  const [parents, setParents] = useState([])
  const [students, setStudents] = useState([])
  const [search, setSearch] = useState('')
  const [addModal, setAddModal] = useState(false)
  const [editModal, setEditModal] = useState(null)
  const [deleteModal, setDeleteModal] = useState(null)
  const [bulkModal, setBulkModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({ full_name: '', email: '', password: '', child_ids: [] })

  useEffect(() => {
    if (profile?.school_id) fetchData()
  }, [profile?.school_id])

  async function fetchData() {
    try {
      setLoading(true)
      const [parentsRes, studentsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('school_id', profile.school_id).eq('role', 'parent').order('full_name'),
        supabase.from('profiles').select('id, full_name').eq('school_id', profile.school_id).eq('role', 'student').order('full_name'),
      ])
      if (parentsRes.error) throw parentsRes.error

      // Build map: parent_id → [child profiles], scoped to this school's parents
      const parentIds = (parentsRes.data || []).map(p => p.id)
      const childMap = {}
      if (parentIds.length) {
        const { data: linksData } = await supabase
          .from('parent_children')
          .select('parent_id, child_id, child:profiles!parent_children_child_id_fkey(id, full_name)')
          .in('parent_id', parentIds)
        ;(linksData || []).forEach(link => {
          if (!childMap[link.parent_id]) childMap[link.parent_id] = []
          if (link.child) childMap[link.parent_id].push(link.child)
        })
      }

      const parentsWithChildren = (parentsRes.data || []).map(p => ({
        ...p,
        children: childMap[p.id] || [],
      }))

      setParents(parentsWithChildren)
      setStudents(studentsRes.data || [])
    } catch (err) {
      console.error('fetchData error:', err)
      setError(t('error'))
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setForm({ full_name: '', email: '', password: '', child_ids: [] })
  }

  function toggleChild(id) {
    setForm(f => ({
      ...f,
      child_ids: f.child_ids.includes(id)
        ? f.child_ids.filter(i => i !== id)
        : [...f.child_ids, id],
    }))
  }

  async function createUser(email, password, full_name) {
    const { data, error } = await supabase.functions.invoke('create-user', {
      body: { email, password, full_name, role: 'parent', school_id: profile.school_id },
    })
    if (error) throw error
    if (data?.error) throw new Error(data.error)
    return data.user_id
  }

  async function handleAdd() {
    if (!form.full_name.trim() || !form.email.trim() || !form.password) {
      setError('Ad, e-poçt və şifrə tələb olunur.')
      return
    }
    if (form.password.length < 6) {
      setError('Şifrə ən azı 6 simvol olmalıdır.')
      return
    }
    if (form.child_ids.length === 0) {
      setError('Ən azı bir şagird seçin.')
      return
    }
    try {
      setSaving(true)
      setError(null)

      const userId = await createUser(form.email.trim(), form.password, form.full_name.trim())

      // Link parent to selected children
      const links = form.child_ids.map(child_id => ({
        parent_id: userId,
        child_id,
      }))
      await supabase.from('parent_children').insert(links)

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
        full_name: form.full_name.trim(),
        email: form.email.trim(),
      }).eq('id', editModal.id)
      if (err) throw err

      // Replace all child links
      await supabase.from('parent_children').delete().eq('parent_id', editModal.id)
      if (form.child_ids.length > 0) {
        const links = form.child_ids.map(child_id => ({
          parent_id: editModal.id,
          child_id,
        }))
        await supabase.from('parent_children').insert(links)
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
      await supabase.from('parent_children').delete().eq('parent_id', deleteModal.id)
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

  function openEditModal(parent) {
    setForm({
      full_name: parent.full_name,
      email: parent.email,
      password: '',
      child_ids: (parent.children || []).map(c => c.id),
    })
    setEditModal(parent)
  }

  // Bulk import — creates parent account only; student linking done via edit
  async function handleBulkImport(row) {
    await createUser(row.email.trim(), row.password?.trim() || 'Zirva2025!', row.full_name.trim())
  }

  const bulkColumns = [
    { key: 'full_name', label: 'Ad Soyad', required: true, placeholder: 'Rəşad Əliyev' },
    { key: 'email', label: 'E-poçt', required: true, type: 'email', placeholder: 'valideyn@example.com' },
    { key: 'password', label: 'Şifrə', placeholder: 'Zirva2025!' },
  ]

  const filtered = parents.filter(p =>
    p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  )

  const columns = [
    {
      key: 'full_name',
      label: 'Ad Soyad',
      render: (val) => (
        <div className="flex items-center gap-3">
          <Avatar name={val} size="sm" />
          <span className="font-medium text-gray-900">{val}</span>
        </div>
      ),
    },
    { key: 'email', label: t('email') },
    {
      key: 'children',
      label: 'Şagirdlər',
      render: (val) => {
        if (!val || val.length === 0) return <span className="text-gray-400">—</span>
        return (
          <div className="flex flex-wrap gap-1">
            {val.map(c => <Badge key={c.id} variant="default">{c.full_name}</Badge>)}
          </div>
        )
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

  // Inline student multi-select component for modals
  const StudentPicker = ({ selected, onToggle }) => (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        Şagirdlər <span className="text-red-400">*</span>
      </label>
      {students.length === 0 ? (
        <div className="border border-border-soft rounded-md p-4 text-center">
          <p className="text-xs text-gray-400">Hələ şagird əlavə edilməyib. Əvvəlcə şagirdlər əlavə edin.</p>
        </div>
      ) : (
        <div className="border border-border-soft rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
          {students.map(s => (
            <label key={s.id} className="flex items-center gap-3 cursor-pointer hover:bg-surface rounded px-1 py-0.5">
              <input
                type="checkbox"
                checked={selected.includes(s.id)}
                onChange={() => onToggle(s.id)}
                className="rounded border-border-soft text-purple focus:ring-purple"
              />
              <Avatar name={s.full_name} size="sm" />
              <span className="text-sm">{s.full_name}</span>
            </label>
          ))}
        </div>
      )}
      {selected.length > 0 && (
        <p className="text-xs text-purple mt-1">{selected.length} şagird seçilib</p>
      )}
    </div>
  )

  if (loading) return <PageSpinner />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-serif text-3xl text-gray-900">Valideynlər</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="ghost" onClick={() => setBulkModal(true)}>
            <span className="flex items-center gap-2"><UserPlus className="w-4 h-4" /> Toplu əlavə</span>
          </Button>
          <Button onClick={() => { resetForm(); setAddModal(true) }}>
            <span className="flex items-center gap-2"><Plus className="w-4 h-4" /> Valideyn əlavə et</span>
          </Button>
        </div>
      </div>

      {students.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-700">
          Valideyn əlavə etmək üçün əvvəlcə şagirdlər əlavə edilməlidir.
        </div>
      )}

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
            icon={Heart}
            title="Valideyn yoxdur"
            description="Valideyn əlavə et düyməsini basın"
            actionLabel="Valideyn əlavə et"
            onAction={() => { resetForm(); setAddModal(true) }}
          />
        ) : (
          <Table columns={columns} data={filtered} />
        )}
      </Card>

      {/* Add Modal */}
      <Modal open={addModal} onClose={() => { setAddModal(false); setError(null) }} title="Valideyn əlavə et">
        <div className="space-y-4">
          <Input
            label="Ad Soyad"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            placeholder="Valideynin adı soyadı"
          />
          <Input
            label={t('email')}
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="valideyn@example.com"
          />
          <Input
            label="Şifrə"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Minimum 6 simvol"
          />
          <StudentPicker selected={form.child_ids} onToggle={toggleChild} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => { setAddModal(false); setError(null) }}>{t('cancel')}</Button>
            <Button
              onClick={handleAdd}
              loading={saving}
              disabled={!form.full_name || !form.email || !form.password || form.child_ids.length === 0}
            >
              {t('add')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editModal} onClose={() => { setEditModal(null); setError(null) }} title={t('edit')}>
        <div className="space-y-4">
          <Input
            label="Ad Soyad"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          />
          <Input
            label={t('email')}
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <StudentPicker selected={form.child_ids} onToggle={toggleChild} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => { setEditModal(null); setError(null) }}>{t('cancel')}</Button>
            <Button onClick={handleEdit} loading={saving}>{t('save')}</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title={t('delete')} size="sm">
        <p className="text-sm text-gray-600 mb-6">
          <strong>{deleteModal?.full_name}</strong> adlı valideyni silmək istədiyinizə əminsiniz?
          Bu əməliyyat geri qaytarıla bilməz.
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
        title="Toplu valideyn əlavəsi"
        columns={bulkColumns}
        onImport={handleBulkImport}
        onDone={fetchData}
      />
    </div>
  )
}
