import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, BookOpen, Search } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import { TableRowSkeleton } from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'

// V3: subject palette collapsed to a single brand chip + neutral-grey ramp.
// Color is reserved for status, not categorical decoration. The function
// signature is preserved so call sites stay unchanged.
const SUBJECT_PALETTE = [
  { chip: 'icon-chip-periwinkle', dot: 'var(--brand-500)' },
]

function subjectPalette() {
  return SUBJECT_PALETTE[0]
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
    try {
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
    } catch (err) {
      console.error(err)
      setError('Məlumat yüklənərkən xəta baş verdi')
    } finally {
      setLoading(false)
    }
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

  if (loading) return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="pastel-skeleton h-8 w-40 rounded-input" />
        <div className="pastel-skeleton h-9 w-36 rounded-input" />
      </div>
      <div className="pastel-skeleton h-10 rounded-input" />
      <div className="bg-surface rounded-tile border border-hairline overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-hairline bg-canvas">
              {['Fənn adı', 'Azərbaycan adı', ''].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-ink-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRowSkeleton key={i} cols={3} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-surface rounded-tile border border-hairline px-6 py-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="icon-chip icon-chip-periwinkle" style={{ width: 44, height: 44 }}>
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-ink-900 leading-tight">Fənlər</h1>
              <span className="pill-muted mt-1 inline-block">{subjects.length} fənn qeydə alınıb</span>
            </div>
          </div>
          <Button size="sm" onClick={openAdd}>
            <span className="flex items-center gap-1.5"><Plus className="w-4 h-4" /> Fənn əlavə et</span>
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Fənn axtar..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pastel-input w-full pl-10"
        />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          tier={1}
          icon={BookOpen}
          title="Fənn yoxdur"
          description="Məktəbiniz üçün fənn əlavə edin."
          actionLabel="Fənn əlavə et"
          onAction={openAdd}
        />
      ) : (
        <div className="bg-surface rounded-tile border border-hairline overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-hairline bg-canvas">
                <th
                  className="text-left px-5 py-3 text-xs font-semibold text-ink-400 uppercase tracking-wider cursor-pointer select-none hover:text-ink-700 transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <span className="flex items-center gap-1">
                    Fənn adı
                    <span className="text-ink-400 text-xs">
                      {sortKey === 'name' ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}
                    </span>
                  </span>
                </th>
                <th
                  className="text-left px-5 py-3 text-xs font-semibold text-ink-400 uppercase tracking-wider hidden sm:table-cell cursor-pointer select-none hover:text-ink-700 transition-colors"
                  onClick={() => handleSort('name_az')}
                >
                  <span className="flex items-center gap-1">
                    Azərbaycan adı
                    <span className="text-ink-400 text-xs">
                      {sortKey === 'name_az' ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}
                    </span>
                  </span>
                </th>
                <th className="w-20" />
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {filtered.map(sub => {
                const palette = subjectPalette(sub.name)
                const usageCount = classCounts[sub.id] || 0
                return (
                  <tr key={sub.id} className="group hover:bg-[rgba(20,22,40,0.025)] transition-colors duration-100">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`icon-chip ${palette.chip} flex-shrink-0`} style={{ width: 36, height: 36 }}>
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-semibold text-ink-900">{sub.name}</span>
                          {usageCount > 0 && (
                            <span className="ml-2 pill-peri text-xs">{usageCount} dərs</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-ink-600 hidden sm:table-cell">
                      {sub.name_az || <span className="text-ink-400 italic">—</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(sub)}
                          className="p-1.5 rounded-input text-ink-400 hover:text-brand-500 hover:bg-brand-50 transition-colors"
                          aria-label="Redaktə et"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteModal(sub)}
                          className="p-1.5 rounded-input text-ink-400 hover:text-danger-text hover:bg-danger-tint transition-colors"
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
          {error && (
            <p className="text-sm rounded-input px-3 py-2 bg-danger-tint text-danger-text border border-danger/20">{error}</p>
          )}
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
          {error && (
            <p className="text-sm rounded-input px-3 py-2 bg-danger-tint text-danger-text border border-danger/20">{error}</p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setEditModal(null)}>Ləğv et</Button>
            <Button onClick={handleEdit} loading={saving} disabled={!form.name.trim()}>Saxla</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="Fənni sil" size="sm">
        <p className="text-sm text-ink-600 mb-6">
          <strong className="text-ink-900">{deleteModal?.name}</strong> fənnini silmək istədiyinizə əminsiniz?
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
