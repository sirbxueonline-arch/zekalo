import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, BookOpen, Search } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'

// Deterministically pick one of 8 palette entries based on subject name
const SUBJECT_PALETTE = [
  { bg: 'bg-[rgba(124,110,224,0.12)]', text: 'text-[#5e4fc7]', dot: '#7c6ee0' },
  { bg: 'bg-[rgba(93,184,163,0.14)]',  text: 'text-[#3a8170]', dot: '#5db8a3' },
  { bg: 'bg-[rgba(232,168,124,0.16)]', text: 'text-[#a55f33]', dot: '#e8a87c' },
  { bg: 'bg-[rgba(107,157,222,0.14)]', text: 'text-[#3d6da7]', dot: '#6b9dde' },
  { bg: 'bg-[rgba(157,146,234,0.14)]', text: 'text-[#5e4fc7]', dot: '#9d92ea' },
  { bg: 'bg-[rgba(127,202,184,0.16)]', text: 'text-[#3a8170]', dot: '#7fcab8' },
  { bg: 'bg-[rgba(231,154,98,0.14)]',  text: 'text-[#a55f33]', dot: '#e79a62' },
  { bg: 'bg-[rgba(82,131,199,0.14)]',  text: 'text-[#3d6da7]', dot: '#5283c7' },
]

function subjectColor(name = '') {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return SUBJECT_PALETTE[Math.abs(hash) % SUBJECT_PALETTE.length]
}

export default function AdminSubjects() {
  const { profile } = useAuth()
  const [loading, setLoading]     = useState(true)
  const [subjects, setSubjects]   = useState([])
  const [search, setSearch]       = useState('')
  const [sortKey, setSortKey]     = useState('name')
  const [sortDir, setSortDir]     = useState('asc')
  const [addModal, setAddModal]   = useState(false)
  const [editModal, setEditModal] = useState(null)  // subject object
  const [deleteModal, setDeleteModal] = useState(null)
  const [form, setForm]           = useState({ name: '', name_az: '' })
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState(null)
  const [classCounts, setClassCounts] = useState({}) // subject_id -> count

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  useEffect(() => {
    if (profile?.school_id) fetchSubjects()
  }, [profile?.school_id])

  async function fetchSubjects() {
    setLoading(true)
    const [subjectsRes, timetableRes] = await Promise.all([
      supabase.from('subjects').select('*').eq('school_id', profile.school_id).order('name'),
      supabase.from('timetable').select('subject_id').eq('school_id', profile.school_id),
    ])
    const subs = subjectsRes.data || []
    setSubjects(subs)

    // Count how many timetable entries (proxy for class usage) each subject has
    const counts = {}
    for (const row of (timetableRes.data || [])) {
      if (row.subject_id) counts[row.subject_id] = (counts[row.subject_id] || 0) + 1
    }
    setClassCounts(counts)
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
    setError(null)
    const { error: err } = await supabase.from('subjects').delete().eq('id', deleteModal.id).eq('school_id', profile.school_id)
    setSaving(false)
    if (err) { setError(err.message); return }
    setDeleteModal(null)
    fetchSubjects()
  }

  const filtered = subjects
    .filter(s =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.name_az?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const av = a[sortKey] ?? ''
      const bv = b[sortKey] ?? ''
      const cmp = String(av).localeCompare(String(bv), 'az')
      return sortDir === 'asc' ? cmp : -cmp
    })

  if (loading) return <PageSpinner />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight"><span className="pastel-text">Fənlər</span></h1>
          <p className="text-sm text-[#64748b] mt-0.5">{subjects.length} fənn qeydə alınıb</p>
        </div>
        <Button onClick={openAdd}>
          <span className="flex items-center gap-2"><Plus className="w-4 h-4" /> Fənn əlavə et</span>
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#7c6ee0' }} />
        <input
          type="text"
          placeholder="Fənn axtar..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full rounded-full pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all"
          style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(124,110,224,0.25)', color: '#1a1a2e' }}
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
        <div className="liquid-card overflow-hidden" style={{ padding: 0 }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface border-b border-border-soft">
                <th
                  className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:bg-surface"
                  onClick={() => handleSort('name')}
                >
                  <span className="flex items-center gap-1">
                    Fənn adı
                    <span className="text-gray-400 text-xs">
                      {sortKey === 'name' ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}
                    </span>
                  </span>
                </th>
                <th
                  className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell cursor-pointer select-none hover:bg-surface"
                  onClick={() => handleSort('name_az')}
                >
                  <span className="flex items-center gap-1">
                    Azərbaycan adı
                    <span className="text-gray-400 text-xs">
                      {sortKey === 'name_az' ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}
                    </span>
                  </span>
                </th>
                <th className="w-20" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border-soft">
              {filtered.map(sub => {
                const palette = subjectColor(sub.name)
                const usageCount = classCounts[sub.id] || 0
                return (
                  <tr key={sub.id} className="hover:bg-purple-light/20 transition-colors duration-100">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className={`w-9 h-9 rounded-xl ${palette.bg} flex items-center justify-center flex-shrink-0`}>
                          <BookOpen className="w-4 h-4" style={{ color: palette.dot }} />
                        </span>
                        <div>
                          <span className="font-semibold text-gray-900">{sub.name}</span>
                          {usageCount > 0 && (
                            <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${palette.bg} ${palette.text}`}>
                              {usageCount} dərs
                            </span>
                          )}
                        </div>
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
                          aria-label="Redaktə et"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteModal(sub)}
                          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                          aria-label="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Modal */}
      <Modal open={addModal} onClose={() => setAddModal(false)} title="Fənn əlavə et">
        <div className="space-y-4" onKeyDown={e => { if (e.key === 'Enter' && !saving) handleAdd() }}>
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
