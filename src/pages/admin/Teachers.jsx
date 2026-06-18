import { useState, useEffect, useRef } from 'react'
import { Plus, Edit2, Trash2, Search, UserPlus, GraduationCap, MoreHorizontal, Filter, Download } from 'lucide-react'
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
  const [classFilter, setClassFilter] = useState('')
  // Row kebab menu: { row, x, y } anchored to the button rect so the overlay
  // escapes the table wrapper's overflow clipping (fixed-position).
  const [menu, setMenu] = useState(null)
  const menuRef = useRef(null)

  function openRowMenu(e, row) {
    e.stopPropagation()
    if (menu?.row?.id === row.id) { setMenu(null); return }
    const r = e.currentTarget.getBoundingClientRect()
    setMenu({ row, x: r.right, y: r.bottom + 6 })
  }

  // Close the row kebab menu on outside click, scroll, or Escape.
  useEffect(() => {
    if (!menu) return
    function onDocClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenu(null)
    }
    function onKey(e) { if (e.key === 'Escape') setMenu(null) }
    function onScroll() { setMenu(null) }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onScroll, true)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [menu])

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
          .eq('role', 'teacher')
          .limit(200),
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
    if (!profile.school_id) throw new Error('Məktəb məlumatı tapılmadı. Zəhmət olmasa yenidən daxil olun.')
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
      role: 'teacher',
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
    await createUser(row.email.trim(), row.password?.trim() || generateTempPassword(), row.full_name.trim())
  }

  const bulkColumns = [
    { key: 'full_name', label: 'Ad Soyad', required: true, placeholder: 'Aysel Məmmədova' },
    { key: 'email', label: 'E-poçt', required: true, type: 'email', placeholder: 'muellim@mekteb.az' },
    { key: 'password', label: 'Şifrə', placeholder: 'Zirva2025!' },
  ]

  const filtered = teachers.filter(tc => {
    const matchesSearch =
      tc.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      tc.email?.toLowerCase().includes(search.toLowerCase())
    const matchesClass =
      !classFilter ||
      (tc.teacher_classes || []).some(e => e.class?.id === classFilter)
    return matchesSearch && matchesClass
  })

  // Export the current (filtered) roster to CSV — quiet admin-trust affordance.
  function exportCsv() {
    const head = [t('full_name'), t('email'), t('subject'), t('classes')]
    const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const lines = filtered.map(tc => [
      tc.full_name,
      tc.email,
      getUniqueSubjects(tc.teacher_classes).map(s => s.name).join('; '),
      getUniqueClasses(tc.teacher_classes).map(c => c.name).join('; '),
    ].map(escape).join(','))
    const csv = [head.map(escape).join(','), ...lines].join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'muellimler.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  // Quiet categorical chip (rounded-chip, neutral grey) — NOT a status pill.
  // Subjects/classes are tags, not meaning-bearing status, so they stay muted.
  const QuietChip = ({ children }) => (
    <span className="inline-flex items-center rounded-chip bg-canvas border border-hairline text-ink-700 px-2 py-0.5 text-xs leading-tight whitespace-nowrap">
      {children}
    </span>
  )

  // Quiet chip list with a "+N" overflow so rows stay one line dense.
  const ChipList = ({ items }) => {
    if (!items || items.length === 0) return <span className="text-ink-400">—</span>
    const shown = items.slice(0, 2)
    const extra = items.length - shown.length
    return (
      <div className="flex items-center gap-1">
        {shown.map(it => <QuietChip key={it.id}>{it.name}</QuietChip>)}
        {extra > 0 && <span className="text-xs text-ink-400 tabular-nums">+{extra}</span>}
      </div>
    )
  }

  const columns = [
    {
      key: 'full_name',
      label: t('full_name'),
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={val} size={28} ring={false} />
          <div className="min-w-0">
            <p className="font-semibold text-ink-900 truncate leading-tight">{val}</p>
            <p className="text-xs text-ink-400 truncate mt-0.5">{row.email}</p>
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
      key: 'teacher_classes',
      label: t('subject'),
      render: (val) => <ChipList items={getUniqueSubjects(val)} />,
    },
    {
      key: 'teacher_classes',
      label: t('classes'),
      render: (val) => <ChipList items={getUniqueClasses(val)} />,
    },
    {
      key: 'status',
      label: 'Status',
      render: (_, row) => {
        const assigned = (row.teacher_classes || []).length > 0
        return (
          <span className="inline-flex items-center gap-2 text-xs text-ink-600 whitespace-nowrap">
            <span
              aria-hidden="true"
              className="inline-block rounded-full"
              style={{ width: 6, height: 6, background: assigned ? 'var(--mint)' : 'var(--ink-400)' }}
            />
            {assigned ? 'Təyin edilib' : 'Təyin edilməyib'}
          </span>
        )
      },
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (_, row) => (
        <div className="inline-flex justify-end">
          <button
            onClick={(e) => openRowMenu(e, row)}
            className={`p-1.5 rounded-ctl transition-colors hover:text-ink-700 hover:bg-canvas ${menu?.row?.id === row.id ? 'text-ink-700 bg-canvas' : 'text-ink-400'}`}
            aria-label="Əməliyyatlar"
            aria-haspopup="menu"
            aria-expanded={menu?.row?.id === row.id}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  // Multi-select component for modal forms — LOW dial: clean token styling, no glass
  const MultiSelect = ({ label, options, selected, onToggle }) => (
    <div className="w-full">
      <label className="block text-xs font-semibold text-ink-700 uppercase tracking-wide mb-1.5">{label}</label>
      <div className="border border-hairline rounded-input p-3 max-h-40 overflow-y-auto space-y-1.5 bg-surface">
        {options.map(opt => (
          <label key={opt.id} className="flex items-center gap-2.5 cursor-pointer rounded-md px-1.5 py-1 hover:bg-brand-50 transition-colors">
            <input
              type="checkbox"
              checked={selected.includes(opt.id)}
              onChange={() => onToggle(opt.id)}
              className="rounded border-hairline text-brand-500 focus:ring-brand-500 focus:ring-offset-0"
            />
            <span className="text-sm text-ink-700">{opt.name}</span>
          </label>
        ))}
        {options.length === 0 && <p className="text-xs text-ink-400 py-1">{t('no_data')}</p>}
      </div>
    </div>
  )

  if (loading) return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="pastel-skeleton h-8 w-48 rounded-input" />
        <div className="flex gap-2">
          <div className="pastel-skeleton h-9 w-28 rounded-input" />
          <div className="pastel-skeleton h-9 w-32 rounded-input" />
        </div>
      </div>
      <div className="pastel-skeleton h-10 rounded-input" />
      <div className="bg-surface rounded-tile border border-hairline overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-hairline bg-surface-2">
              {[t('full_name'), t('email'), t('subject'), t('classes'), 'Status', ''].map((h, i) => (
                <th key={i} className="text-left px-4 py-2.5 text-xs font-medium text-ink-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRowSkeleton key={i} cols={6} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Page header — LOW dial: flat surface card, hairline only, icon-chip, token pills */}
      <div className="bg-surface rounded-tile border border-hairline px-6 py-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="icon-chip icon-chip-periwinkle" style={{ width: 44, height: 44 }}>
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-ink-900 leading-tight">{t('teachers')}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="pill-muted">{teachers.length} ümumi</span>
                {filtered.length !== teachers.length && (
                  <span className="pill-peri">{filtered.length} nəticə</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="ghost" size="sm" onClick={() => setBulkModal(true)}>
              <span className="flex items-center gap-1.5"><UserPlus className="w-4 h-4" /> Toplu əlavə</span>
            </Button>
            <Button size="sm" onClick={() => { resetForm(); setAddModal(true) }}>
              <span className="flex items-center gap-1.5"><Plus className="w-4 h-4" /> {t('add_teacher')}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Calm toolbar — search left, class filter + CSV export right (admin LOW dial) */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
          <input
            type="text"
            placeholder={t('search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pastel-input w-full pl-10"
          />
        </div>
        <div className="relative inline-flex items-center">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="pastel-input pl-9 pr-8 appearance-none cursor-pointer"
            aria-label={t('classes')}
          >
            <option value="">{t('classes')}</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <Button variant="ghost" size="sm" onClick={exportCsv} disabled={filtered.length === 0}>
          <span className="flex items-center gap-1.5"><Download className="w-4 h-4" /> CSV</span>
        </Button>
      </div>

      {error && (
        <div className="rounded-input px-4 py-2.5 text-sm font-medium" style={{ background: '#FEE2E2', color: '#B91C1C', border: '1px solid #FECACA' }}>
          {error}
        </div>
      )}

      <Card hover={false} className="p-0 overflow-hidden rounded-tile">
        {filtered.length === 0 ? (
          (() => {
            const hasFilter = !!search || !!classFilter
            return (
              <EmptyState
                tier={1}
                icon={GraduationCap}
                title={hasFilter ? 'Nəticə tapılmadı' : t('no_data')}
                description={hasFilter ? 'Axtarışı və ya filtri dəyişdirin.' : 'Yeni müəllim əlavə etmək üçün düyməni basın.'}
                action={hasFilter
                  ? <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setClassFilter('') }}>Filtri sıfırla</Button>
                  : undefined}
                actionLabel={hasFilter ? undefined : t('add_teacher')}
                onAction={hasFilter ? undefined : () => { resetForm(); setAddModal(true) }}
              />
            )
          })()
        ) : (
          <Table columns={columns} data={filtered} />
        )}
      </Card>

      {/* Add Modal */}
      <Modal open={addModal} onClose={() => { setAddModal(false); setError(null) }} title={t('add_teacher')}>
        <div className="space-y-4">
          <Input label={t('full_name')} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Müəllimin adı soyadı" />
          <Input label={t('email')} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="muellim@mekteb.az" />
          <Input label="Şifrə" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Minimum 6 simvol" />
          <MultiSelect label={t('subject')} options={subjects} selected={form.subject_ids} onToggle={(id) => setForm({ ...form, subject_ids: toggleArrayItem(form.subject_ids, id) })} />
          <MultiSelect label={t('classes')} options={classes} selected={form.class_ids} onToggle={(id) => setForm({ ...form, class_ids: toggleArrayItem(form.class_ids, id) })} />
          {form.class_ids.length > 0 && form.subject_ids.length === 0 && (
            <p className="text-xs rounded-input px-3 py-2" style={{ background: '#FEF3C7', color: '#B45309' }}>Sinif seçmək üçün ən azı bir fənn də seçin.</p>
          )}
          {error && (
            <p className="text-sm rounded-input px-3 py-2" style={{ background: '#FEE2E2', color: '#B91C1C' }}>{error}</p>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => { setAddModal(false); setError(null) }}>{t('cancel')}</Button>
            <Button onClick={handleAdd} loading={saving} disabled={!form.full_name || !form.email || !form.password}>{t('add')}</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editModal} onClose={() => { setEditModal(null); resetForm(); setError(null) }} title={t('edit')}>
        <div className="space-y-4">
          <Input label={t('full_name')} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          <Input label={t('email')} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <MultiSelect label={t('subject')} options={subjects} selected={form.subject_ids} onToggle={(id) => setForm({ ...form, subject_ids: toggleArrayItem(form.subject_ids, id) })} />
          <MultiSelect label={t('classes')} options={classes} selected={form.class_ids} onToggle={(id) => setForm({ ...form, class_ids: toggleArrayItem(form.class_ids, id) })} />
          {form.class_ids.length > 0 && form.subject_ids.length === 0 && (
            <p className="text-xs rounded-input px-3 py-2" style={{ background: '#FEF3C7', color: '#B45309' }}>Sinif seçmək üçün ən azı bir fənn də seçin.</p>
          )}
          {error && (
            <p className="text-sm rounded-input px-3 py-2" style={{ background: '#FEE2E2', color: '#B91C1C' }}>{error}</p>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => { setEditModal(null); resetForm(); setError(null) }}>{t('cancel')}</Button>
            <Button onClick={handleEdit} loading={saving} disabled={!form.full_name || !form.email}>{t('save')}</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title={t('delete')} size="sm">
        <p className="text-sm text-ink-600 mb-6">
          <strong className="text-ink-900">{deleteModal?.full_name}</strong> adlı müəllimi silmək istədiyinizə əminsiniz?
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeleteModal(null)}>{t('cancel')}</Button>
          <Button variant="danger" onClick={handleDelete} loading={saving}>{t('delete')}</Button>
        </div>
      </Modal>

      {/* Row kebab menu — fixed overlay so it escapes the table wrapper clipping */}
      {menu && (
        <div
          ref={menuRef}
          role="menu"
          className="fixed z-50 w-44 bg-surface rounded-tile border border-hairline shadow-pop py-1 text-left"
          style={{ top: menu.y, left: menu.x, transform: 'translateX(-100%)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            role="menuitem"
            onClick={() => { openEditModal(menu.row); setMenu(null) }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-ink-700 hover:bg-canvas transition-colors"
          >
            <Edit2 className="w-4 h-4 text-ink-400" /> {t('edit')}
          </button>
          <button
            role="menuitem"
            onClick={() => { setDeleteModal(menu.row); setMenu(null) }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-danger hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" /> {t('delete')}
          </button>
        </div>
      )}

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
