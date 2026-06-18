import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Search, UserPlus, Users } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import { generateTempPassword } from '../../lib/password'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Table from '../../components/ui/Table'
import { TableRowSkeleton } from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import Avatar from '../../components/ui/Avatar'
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
    // Use an isolated client so the new user's signup session doesn't replace the admin's session.
    // After signUp the temp client holds the new user's session, satisfying the RLS
    // "users insert own profile" policy (auth.uid() = id).
    const tempClient = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY,
      { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
    )
    const { data: signUpData, error: signUpError } = await tempClient.auth.signUp({ email, password })
    if (signUpError) throw new Error(signUpError.message)
    if (!signUpData?.user) throw new Error('İstifadəçi yaradıla bilmədi')
    const userId = signUpData.user.id
    const { error: profileError } = await tempClient.from('profiles').insert({
      id: userId,
      full_name,
      email,
      role: 'parent',
      school_id: profile.school_id,
    })
    if (profileError) throw new Error(profileError.message)
    return userId
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
    await createUser(row.email.trim(), row.password?.trim() || generateTempPassword(), row.full_name.trim())
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

  // Family-connection status (§4.1) — derived from already-fetched data, no new
  // logic. A parent linked to ≥1 child is treated as Connected; otherwise the
  // account exists but is not yet attached to a family → Not connected.
  // ("Invite sent" is reserved for a pending-invite signal the data may carry.)
  function connectionStatus(parent) {
    const linked = (parent.children || []).length
    if (linked > 0) return { hue: 'pill-mint', label: 'Bağlı' }
    if (parent.invite_pending) return { hue: 'pill-peach', label: 'Dəvət göndərilib' }
    return { hue: 'pill-muted', label: 'Bağlı deyil' }
  }

  // Overlapping avatar stack for linked children (caps at 3 + "+N" count).
  function ChildrenStack({ children }) {
    if (!children || children.length === 0) {
      return <span className="text-ink-400" style={{ fontSize: 13 }}>—</span>
    }
    const shown = children.slice(0, 3)
    const extra = children.length - shown.length
    return (
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="flex items-center -space-x-2 shrink-0">
          {shown.map(c => (
            <Avatar
              key={c.id}
              name={c.full_name}
              variant="gem"
              size="xs"
              ring
              title={c.full_name}
            />
          ))}
          {extra > 0 && (
            <span
              className="inline-flex items-center justify-center rounded-full font-semibold tabular-nums"
              style={{
                width: 24, height: 24, fontSize: 11,
                background: 'var(--brand-50)', color: 'var(--brand-700)',
                boxShadow: '0 0 0 2px var(--surface)',
              }}
            >
              +{extra}
            </span>
          )}
        </div>
        <span className="truncate text-ink-600" style={{ fontSize: 13 }}>
          {children.length === 1 ? children[0].full_name : `${children.length} şagird`}
        </span>
      </div>
    )
  }

  const columns = [
    {
      key: 'full_name',
      label: 'Ad Soyad',
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <Avatar name={val} size="sm" ring={false} />
          <div className="min-w-0">
            <p className="font-semibold text-ink-900 truncate leading-tight">{val}</p>
            <p className="text-ink-400 truncate mt-0.5" style={{ fontSize: 12 }}>{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      label: t('email'),
      render: () => null,
    },
    {
      key: 'children',
      label: 'Şagirdlər',
      render: (val) => <ChildrenStack children={val} />,
    },
    {
      key: 'connection',
      label: 'Əlaqə',
      render: (_, row) => {
        const s = connectionStatus(row)
        return <span className={s.hue}>{s.label}</span>
      },
    },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); openEditModal(row) }}
            className="p-1.5 rounded-input text-ink-400 hover:text-brand-500 hover:bg-brand-50 transition-colors"
            aria-label="Redaktə et"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setDeleteModal(row) }}
            className="p-1.5 rounded-input text-ink-400 hover:text-danger hover:bg-red-50 transition-colors"
            aria-label="Sil"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  // Inline student multi-select component for modals — LOW dial: token styling, no glass
  const StudentPicker = ({ selected, onToggle }) => (
    <div className="w-full">
      <label className="block text-xs font-semibold text-ink-700 uppercase tracking-wide mb-1.5">
        Şagirdlər <span className="text-danger normal-case font-normal">*</span>
      </label>
      {students.length === 0 ? (
        <div className="border border-hairline rounded-input p-4 text-center bg-canvas">
          <p className="text-xs text-ink-400">Hələ şagird əlavə edilməyib. Əvvəlcə şagirdlər əlavə edin.</p>
        </div>
      ) : (
        <div className="border border-hairline rounded-input p-3 max-h-48 overflow-y-auto space-y-1.5 bg-surface">
          {students.map(s => (
            <label key={s.id} className="flex items-center gap-3 cursor-pointer rounded-ctl px-1.5 py-1 hover:bg-brand-50 transition-colors">
              <input
                type="checkbox"
                checked={selected.includes(s.id)}
                onChange={() => onToggle(s.id)}
                className="rounded border-hairline text-brand-500 focus:ring-brand-500 focus:ring-offset-0"
              />
              <Avatar name={s.full_name} variant="gem" size="xs" ring={false} />
              <span className="text-ink-700" style={{ fontSize: 13 }}>{s.full_name}</span>
            </label>
          ))}
        </div>
      )}
      {selected.length > 0 && (
        <p className="text-xs text-brand-500 font-medium mt-1">{selected.length} şagird seçilib</p>
      )}
    </div>
  )

  if (loading) return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="pastel-skeleton h-8 w-40 rounded-input" />
        <div className="flex gap-2">
          <div className="pastel-skeleton h-9 w-28 rounded-input" />
          <div className="pastel-skeleton h-9 w-36 rounded-input" />
        </div>
      </div>
      <div className="pastel-skeleton h-10 rounded-input" />
      <div className="bg-surface rounded-tile border border-hairline overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-hairline bg-canvas">
              {['Ad Soyad', 'Şagirdlər', 'Əlaqə', ''].map((h, i) => (
                <th key={h || i} className="text-left px-5 py-3 text-xs font-semibold text-ink-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRowSkeleton key={i} cols={4} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Page header — LOW dial: surface card, single brand accent, hairline only */}
      <div className="bg-surface rounded-tile border border-hairline px-6 py-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="icon-chip icon-chip-periwinkle" style={{ width: 44, height: 44 }}>
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-ink-900 leading-tight">Valideynlər</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="pill-muted">{parents.length} ümumi</span>
                {filtered.length !== parents.length && (
                  <span className="pill-muted">{filtered.length} nəticə</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="ghost" size="sm" onClick={() => setBulkModal(true)}>
              <span className="flex items-center gap-1.5"><UserPlus className="w-4 h-4" /> Toplu əlavə</span>
            </Button>
            <Button size="sm" onClick={() => { resetForm(); setAddModal(true) }}>
              <span className="flex items-center gap-1.5"><Plus className="w-4 h-4" /> Valideyn əlavə et</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Warning banner — token styling, no glass */}
      {students.length === 0 && (
        <div className="rounded-input px-4 py-3 text-sm" style={{ background: '#FEF3C7', border: '1px solid #FDE68A', color: '#B45309' }}>
          Valideyn əlavə etmək üçün əvvəlcə şagirdlər əlavə edilməlidir.
        </div>
      )}

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
        <input
          type="text"
          placeholder={t('search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pastel-input w-full pl-10"
        />
      </div>

      {error && (
        <div className="rounded-input px-4 py-2.5 text-sm font-medium" style={{ background: '#FEE2E2', color: '#B91C1C', border: '1px solid #FECACA' }}>
          {error}
        </div>
      )}

      <Card hover={false} className="p-0 overflow-hidden rounded-tile">
        {filtered.length === 0 ? (
          <EmptyState
            tier={1}
            icon={Users}
            title="Valideyn yoxdur"
            description="Valideyn əlavə et düyməsini basın."
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
          {error && (
            <p className="text-sm rounded-input px-3 py-2" style={{ background: '#FEE2E2', color: '#B91C1C' }}>{error}</p>
          )}
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
          {error && (
            <p className="text-sm rounded-input px-3 py-2" style={{ background: '#FEE2E2', color: '#B91C1C' }}>{error}</p>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => { setEditModal(null); setError(null) }}>{t('cancel')}</Button>
            <Button onClick={handleEdit} loading={saving}>{t('save')}</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title={t('delete')} size="sm">
        <p className="text-sm text-ink-600 mb-6">
          <strong className="text-ink-900">{deleteModal?.full_name}</strong> adlı valideyni silmək istədiyinizə əminsiniz?
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
