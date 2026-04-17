import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, BookOpen, Search } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'

export default function AdminSubjects() {
  const { profile } = useAuth()
  const [loading, setLoading]     = useState(true)
  const [subjects, setSubjects]   = useState([])
  const [search, setSearch]       = useState('')
  const [addModal, setAddModal]   = useState(false)
  const [editModal, setEditModal] = useState(null)  // subject object
  const [deleteModal, setDeleteModal] = useState(null)
  const [form, setForm]           = useState({ name: '', name_az: '' })
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState(null)

  useEffect(() => {
    if (profile?.school_id) fetchSubjects()
  }, [profile?.school_id])

  async function fetchSubjects() {
    setLoading(true)
    const { data } = await supabase
      .from('subjects')
      .select('*')
      .eq('school_id', profile.school_id)
      .order('name')
    setSubjects(data || [])
    setLoading(false)
  }

  function openAdd() {
    setForm({ name: '', name_az: '' })
    setError(null)
    setAddModal(true)
  }

  function openEdit(sub) {
    setForm({ name: sub.name, name_az: sub.name_az || '' })
    setError(null)
    setEditModal(sub)
  }

  async function handleAdd() {
    if (!form.name.trim()) { setError('Fənn adı tələb olunur.'); return }
    setSaving(true); setError(null)
    const { error: err } = await supabase.from('subjects').insert({
      name: form.name.trim(),
      name_az: form.name_az.trim() || null,
      school_id: profile.school_id,
    })
    setSaving(false)
    if (err) { setError(err.message); return }
    setAddModal(false)
    fetchSubjects()
  }

  async function handleEdit() {
    if (!form.name.trim()) { setError('Fənn adı tələb olunur.'); return }
    setSaving(true); setError(null)
    const { error: err } = await supabase.from('subjects')
      .update({ name: form.name.trim(), name_az: form.name_az.trim() || null })
      .eq('id', editModal.id)
    setSaving(false)
    if (err) { setError(err.message); return }
    setEditModal(null)
    fetchSubjects()
  }

  async function handleDelete() {
    setSaving(true)
    await supabase.from('subjects').delete().eq('id', deleteModal.id)
    setSaving(false)
    setDeleteModal(null)
    fetchSubjects()
  }

  const filtered = subjects.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.name_az?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <PageSpinner />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-3xl text-gray-900">Fənlər</h1>
          <p className="text-sm text-gray-500 mt-0.5">{subjects.length} fənn qeydə alınıb</p>
        </div>
        <Button onClick={openAdd}>
          <span className="flex items-center gap-2"><Plus className="w-4 h-4" /> Fənn əlavə et</span>
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Fənn axtar..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border border-border-soft rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple focus:border-transparent"
        />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Fənn yoxdur"
          description="Məktəbiniz üçün fənn əlavə edin"
          actionLabel="Fənn əlavə et"
          onAction={openAdd}
        />
      ) : (
        <div className="bg-white rounded-xl border border-border-soft shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface border-b border-border-soft">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fənn adı</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Azərbaycan adı</th>
                <th className="w-20" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border-soft">
              {filtered.map(sub => (
                <tr key={sub.id} className="hover:bg-surface/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-purple-light flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-4 h-4 text-purple" />
                      </span>
                      <span className="font-semibold text-gray-900">{sub.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 hidden sm:table-cell">
                    {sub.name_az || <span className="text-gray-300 italic">—</span>}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(sub)}
                        className="p-1.5 text-gray-400 hover:text-purple transition-colors rounded-lg hover:bg-purple-light"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteModal(sub)}
                        className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Modal */}
      <Modal open={addModal} onClose={() => setAddModal(false)} title="Fənn əlavə et">
        <div className="space-y-4">
          <Input
            label="Fənn adı *"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="məs. Mathematics, Physics..."
          />
          <Input
            label="Azərbaycanca adı (isteğe bağlı)"
            value={form.name_az}
            onChange={e => setForm({ ...form, name_az: e.target.value })}
            placeholder="məs. Riyaziyyat, Fizika..."
          />
          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setAddModal(false)}>Ləğv et</Button>
            <Button onClick={handleAdd} loading={saving} disabled={!form.name.trim()}>Əlavə et</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editModal} onClose={() => setEditModal(null)} title="Fənni düzəlt">
        <div className="space-y-4">
          <Input
            label="Fənn adı *"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="Azərbaycanca adı"
            value={form.name_az}
            onChange={e => setForm({ ...form, name_az: e.target.value })}
          />
          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setEditModal(null)}>Ləğv et</Button>
            <Button onClick={handleEdit} loading={saving} disabled={!form.name.trim()}>Saxla</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="Fənni sil" size="sm">
        <p className="text-sm text-gray-600 mb-6">
          <strong>{deleteModal?.name}</strong> fənnini silmək istədiyinizə əminsiniz?
          Bu fənnə aid qiymətlər və cədvəl məlumatları da təsirlənə bilər.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeleteModal(null)}>Ləğv et</Button>
          <Button variant="danger" onClick={handleDelete} loading={saving}>Sil</Button>
        </div>
      </Modal>
    </div>
  )
}
