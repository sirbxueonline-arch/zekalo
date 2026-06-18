import { useState, useEffect } from 'react'
import { Search, Plus, Edit2, Trash2, Download, Users, UserPlus, Filter, List, LayoutGrid, MoreHorizontal, X } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import { generateTempPassword } from '../../lib/password'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { Select } from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import { TableRowSkeleton } from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import Avatar from '../../components/ui/Avatar'
import BulkAddModal from '../../components/ui/BulkAddModal'


function escapeCsvField(val) {
  if (val == null) return ''
  const str = String(val)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"'
  }
  return str
}

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
  const [view, setView] = useState('list')            // 'list' (default, management) | 'grid' (engagement)
  const [selected, setSelected] = useState([])         // multi-select student ids
  const [menuFor, setMenuFor] = useState(null)         // kebab menu open for this student id

  useEffect(() => {
    if (profile?.school_id) fetchData()
  }, [profile?.school_id])

  async function fetchData() {
    try {
      setLoading(true)
      const [studentsRes, classesRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('school_id', profile.school_id).eq('role', 'student').limit(200),
        supabase.from('classes').select('id, name').eq('school_id', profile.school_id).order('name'),
      ])
      if (studentsRes.error) throw studentsRes.error

      const studentIds = (studentsRes.data || []).map(s => s.id)
      const classMap = {}
      if (studentIds.length) {
        const { data: membersData } = await supabase
          .from('class_members')
          .select('student_id, class_id, class:classes(id, name)')
          .in('student_id', studentIds)
        ;(membersData || []).forEach(m => {
          if (m.student_id && m.class) classMap[m.student_id] = m.class
        })
      }

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
      role: 'student',
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

      if (form.class_id) {
        const { error: cmError } = await supabase.from('class_members').insert({
          class_id: form.class_id,
          student_id: userId,
        })
        if (cmError) throw new Error(cmError.message)
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
    const csv = [headers.map(escapeCsvField).join(','), ...rows.map(r => r.map(escapeCsvField).join(','))].join('\n')
    const BOM = '﻿'
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'students_export.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleBulkImport(row) {
    const email    = row.email?.trim()
    const name     = row.full_name?.trim()
    const tempPassword = generateTempPassword()
    const password = row.password?.trim() || tempPassword

    if (!email || !name) throw new Error('Ad və e-poçt tələb olunur')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Yanlış e-poçt formatı: ' + email)

    const userId = await createUser(email, password, name)

    const classId = row.class_id?.trim()
    if (classId) {
      const { error: cmError } = await supabase.from('class_members').insert({
        class_id: classId,
        student_id: userId,
      })
      if (cmError) throw new Error(cmError.message)
    }
  }

  const bulkColumns = [
    { key: 'full_name', label: 'Ad Soyad',  required: true, placeholder: 'Əli Əliyev' },
    { key: 'email',     label: 'E-poçt',    required: true, type: 'email', placeholder: 'sagird@mekteb.az' },
    { key: 'password',  label: 'Şifrə',     placeholder: 'Boş buraxsanız təsadüfi şifrə yaradılır' },
    {
      key:  'class_id',
      label: 'Sinif',
      type: 'select',
      options: classes.map(c => ({ value: c.id, label: c.name })),
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

  // ── Multi-select (list mode) ───────────────────────────────────────────────
  const visibleIds = filtered.map(s => s.id)
  const allSelected = visibleIds.length > 0 && visibleIds.every(id => selected.includes(id))
  const someSelected = selected.length > 0 && !allSelected

  function toggleRow(id) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }
  function toggleAll() {
    setSelected(allSelected ? [] : visibleIds)
  }
  function clearSelection() {
    setSelected([])
  }

  // Family-connection status — 6px dot + label, never a chunky badge (§4.1).
  // Derived from existing data only; no schema assumptions.
  function familyStatus(s) {
    if (s.parent_linked || s.parent_id) return { tone: 'var(--mint, #1FA855)', label: 'Qoşulub' }
    if (s.parent_email)                 return { tone: 'var(--sun, #EAB308)',  label: 'Dəvət göndərilib' }
    return { tone: 'var(--ink-400)', label: 'Qoşulmayıb' }
  }

  if (loading) return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="pastel-skeleton h-8 w-40 rounded-input" />
        <div className="flex gap-2">
          <div className="pastel-skeleton h-9 w-28 rounded-input" />
          <div className="pastel-skeleton h-9 w-32 rounded-input" />
        </div>
      </div>
      <div className="pastel-skeleton h-10 rounded-input" />
      <div className="bg-surface rounded-tile border border-hairline overflow-hidden">
        <table className="pastel-table">
          <thead>
            <tr>
              {['', t('full_name'), t('class_name'), 'Ailə', ''].map((h, i) => (
                <th key={i}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }).map((_, i) => (
              <TableRowSkeleton key={i} cols={5} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Page header — LOW dial: title + count, no card chrome */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 leading-tight">{t('students')}</h1>
          <p className="text-sm text-ink-400 mt-1 tabular-nums">
            {students.length} ümumi
            {filtered.length !== students.length && <> · {filtered.length} nəticə</>}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="ghost" size="sm" onClick={() => setBulkModal(true)}>
            <span className="flex items-center gap-1.5"><UserPlus className="w-4 h-4" /> Toplu əlavə</span>
          </Button>
          <Button size="sm" onClick={() => { resetForm(); setAddModal(true) }}>
            <span className="flex items-center gap-1.5"><Plus className="w-4 h-4" /> {t('add_student')}</span>
          </Button>
        </div>
      </div>

      {/* Toolbar — segmented [Şagirdlər] left · [Filter][Export CSV] text-buttons + grid/list toggle right */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Segmented control (single tab today; structured for Groups later) */}
        <div
          className="inline-flex items-center rounded-pill p-0.5"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--hairline-strong)' }}
        >
          <span
            className="inline-flex items-center gap-1.5 rounded-pill px-3.5 h-8 text-[13px] font-semibold text-ink-900"
            style={{ background: 'var(--surface)', boxShadow: '0 1px 2px rgba(20,22,40,.06)' }}
          >
            <Users className="w-4 h-4 text-brand-500" />
            {t('students')}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-input text-[13px] font-medium text-ink-600 hover:text-ink-900 hover:bg-canvas transition-colors"
          >
            <Filter className="w-4 h-4" /> {t('filter')}
          </button>
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-input text-[13px] font-medium text-ink-600 hover:text-ink-900 hover:bg-canvas transition-colors"
          >
            <Download className="w-4 h-4" /> {t('export_csv')}
          </button>

          {/* grid ↔ list toggle */}
          <div
            className="inline-flex items-center rounded-input p-0.5 ml-1"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--hairline-strong)' }}
          >
            <button
              type="button"
              onClick={() => setView('list')}
              aria-label="Siyahı görünüşü"
              aria-pressed={view === 'list'}
              className="inline-flex items-center justify-center w-7 h-7 rounded-ctl transition-colors"
              style={view === 'list'
                ? { background: 'var(--surface)', color: 'var(--brand-500)', boxShadow: '0 1px 2px rgba(20,22,40,.06)' }
                : { color: 'var(--ink-400)' }}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setView('grid')}
              aria-label="Tor görünüşü"
              aria-pressed={view === 'grid'}
              className="inline-flex items-center justify-center w-7 h-7 rounded-ctl transition-colors"
              style={view === 'grid'
                ? { background: 'var(--surface)', color: 'var(--brand-500)', boxShadow: '0 1px 2px rgba(20,22,40,.06)' }
                : { color: 'var(--ink-400)' }}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

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
        <div className="rounded-input px-4 py-2.5 text-sm font-medium" style={{ background: 'var(--danger-bg, #FEE2E2)', color: '#B91C1C', border: '1px solid #FECACA' }}>
          {error}
        </div>
      )}

      {/* ── Content: empty / list / grid ─────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <EmptyState
          tier={1}
          icon={Users}
          title={search ? 'Nəticə tapılmadı' : t('no_data')}
          description={search ? 'Axtarış sorğunuzu dəyişdirin.' : 'Yeni şagird əlavə etmək üçün düyməni basın.'}
          actionLabel={search ? undefined : t('add_student')}
          onAction={search ? undefined : () => { resetForm(); setAddModal(true) }}
        />
      ) : view === 'list' ? (
        /* LIST — management mode: pastel-table, 40px rows, ☐ | Avatar+Name | Class | status | ⋯ */
        <div className="rounded-tile overflow-hidden bg-surface" style={{ border: '1px solid var(--hairline-strong)' }}>
          <div className="overflow-x-auto">
            <table className="pastel-table">
              <thead>
                <tr>
                  <th style={{ width: 44 }}>
                    <input
                      type="checkbox"
                      className="zk-check"
                      checked={allSelected}
                      ref={el => { if (el) el.indeterminate = someSelected }}
                      onChange={toggleAll}
                      aria-label="Hamısını seç"
                    />
                  </th>
                  <th
                    onClick={() => handleSort('full_name')}
                    className="cursor-pointer select-none"
                  >
                    <span className="inline-flex items-center gap-1">
                      {t('full_name')}
                      <span className="text-[10px]" style={{ color: sortKey === 'full_name' ? 'var(--brand-500)' : 'var(--ink-400)', opacity: sortKey === 'full_name' ? 1 : 0.5 }}>
                        {sortKey === 'full_name' ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}
                      </span>
                    </span>
                  </th>
                  <th>{t('class_name')}</th>
                  <th>Ailə</th>
                  <th style={{ width: 44 }} aria-label="" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const isSel = selected.includes(s.id)
                  const fs = familyStatus(s)
                  return (
                    <tr
                      key={s.id}
                      className="group"
                      style={isSel ? { background: 'var(--brand-50)' } : undefined}
                    >
                      <td style={isSel ? { background: 'var(--brand-50)' } : undefined}>
                        <input
                          type="checkbox"
                          className="zk-check"
                          checked={isSel}
                          onChange={() => toggleRow(s.id)}
                          aria-label={`${s.full_name} seç`}
                        />
                      </td>
                      <td style={isSel ? { background: 'var(--brand-50)' } : undefined}>
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Avatar name={s.full_name} variant="gem" size={28} ring={false} />
                          <div className="min-w-0">
                            <p className="font-semibold text-ink-900 truncate leading-tight">{s.full_name}</p>
                            <p className="text-xs text-ink-400 truncate mt-0.5">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td style={isSel ? { background: 'var(--brand-50)' } : undefined}>
                        {s.class?.name
                          ? <span className="text-ink-700">{s.class.name}</span>
                          : <span className="text-ink-400">—</span>}
                      </td>
                      <td style={isSel ? { background: 'var(--brand-50)' } : undefined}>
                        <span className="inline-flex items-center gap-2 text-ink-600">
                          <span className="inline-block rounded-full shrink-0" style={{ width: 6, height: 6, background: fs.tone }} />
                          {fs.label}
                        </span>
                      </td>
                      <td className="relative" style={isSel ? { background: 'var(--brand-50)' } : undefined}>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setMenuFor(menuFor === s.id ? null : s.id) }}
                          className={`p-1.5 rounded-input text-ink-400 hover:text-ink-900 hover:bg-canvas transition-all ${menuFor === s.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                          aria-label="Əməliyyatlar"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        {menuFor === s.id && (
                          <>
                            <div className="fixed inset-0 z-30" onClick={() => setMenuFor(null)} />
                            <div
                              className="absolute right-3 top-full -mt-1 z-40 w-40 rounded-tile bg-surface py-1"
                              style={{ border: '1px solid var(--hairline-strong)', boxShadow: 'var(--shadow-pop, 0 8px 24px -8px rgba(20,22,40,.14))' }}
                            >
                              <button
                                onClick={() => { setMenuFor(null); openEditModal(s) }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-ink-700 hover:bg-canvas transition-colors"
                              >
                                <Edit2 className="w-4 h-4 text-ink-400" /> {t('edit')}
                              </button>
                              <button
                                onClick={() => { setMenuFor(null); setDeleteModal(s) }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-[13px] hover:bg-red-50 transition-colors"
                                style={{ color: '#B91C1C' }}
                              >
                                <Trash2 className="w-4 h-4" /> {t('delete')}
                              </button>
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID — engagement mode: wrapping white tiles, Avatar 56 (gem), name below */
        <div className="flex flex-wrap gap-3">
          {filtered.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => openEditModal(s)}
              className="group flex flex-col items-center justify-center text-center bg-surface rounded-tile transition-all hover:-translate-y-0.5"
              style={{ width: 96, minHeight: 112, padding: '14px 8px', border: '1px solid var(--hairline)' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-soft-lg, 0 12px 28px -10px rgba(20,22,40,.14))' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none' }}
            >
              <Avatar name={s.full_name} variant="gem" size={56} ring={false} />
              <span className="mt-2.5 text-[13px] font-semibold text-ink-900 leading-tight line-clamp-2 w-full px-0.5">
                {s.full_name}
              </span>
            </button>
          ))}
          {/* Last tile — dashed "+ Şagird əlavə et" */}
          <button
            type="button"
            onClick={() => { resetForm(); setAddModal(true) }}
            className="flex flex-col items-center justify-center text-center rounded-tile transition-colors hover:bg-brand-50"
            style={{ width: 96, minHeight: 112, padding: '14px 8px', border: '1.5px dashed var(--hairline-strong)', color: 'var(--brand-500)' }}
          >
            <span className="inline-flex items-center justify-center rounded-full" style={{ width: 40, height: 40, background: 'var(--brand-50)' }}>
              <Plus className="w-5 h-5" />
            </span>
            <span className="mt-2.5 text-[13px] font-semibold leading-tight">{t('add_student')}</span>
          </button>
        </div>
      )}

      {/* ── Floating bulk-action bar (dark rounded pill, bottom-center) ───────── */}
      {selected.length > 0 && (
        <div
          className="fixed left-1/2 bottom-6 z-50 -translate-x-1/2"
          style={{ animation: 'zkBulkIn .18s cubic-bezier(.2,.8,.2,1)' }}
        >
          <div
            className="flex items-center gap-1 rounded-pill pl-4 pr-1.5 py-1.5"
            style={{ background: 'var(--ink-900, #1E2233)', boxShadow: '0 16px 48px -12px rgba(20,22,40,.45)' }}
          >
            <span className="text-[13px] font-semibold text-white tabular-nums">{selected.length} seçildi</span>
            <span className="mx-1 h-4 w-px" style={{ background: 'rgba(255,255,255,.18)' }} />
            <button
              type="button"
              onClick={() => { const first = students.find(x => x.id === selected[0]); if (first) openEditModal(first) }}
              className="inline-flex items-center gap-1.5 rounded-pill px-3 h-8 text-[13px] font-medium text-white/90 hover:bg-white/10 transition-colors"
            >
              <Edit2 className="w-4 h-4" /> {t('edit')}
            </button>
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex items-center gap-1.5 rounded-pill px-3 h-8 text-[13px] font-medium text-white/90 hover:bg-white/10 transition-colors"
            >
              <Download className="w-4 h-4" /> {t('export_csv')}
            </button>
            <button
              type="button"
              onClick={clearSelection}
              className="inline-flex items-center justify-center w-8 h-8 rounded-pill text-white/70 hover:bg-white/10 hover:text-white transition-colors"
              aria-label={t('cancel')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Single Add Modal */}
      <Modal open={addModal} onClose={() => { setAddModal(false); setError(null) }} title={t('add_student')}>
        <div className="space-y-4" onKeyDown={e => { if (e.key === 'Enter' && !saving) handleAdd() }}>
          <Input label={t('full_name')} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Şagirdin adı soyadı" />
          <Input label={t('email')} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="sagird@mekteb.az" />
          <Input label="Şifrə" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Minimum 6 simvol" />
          <Select label={t('class_name')} value={form.class_id} onChange={(e) => setForm({ ...form, class_id: e.target.value })}>
            <option value="">— Sinif seçin —</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          {error && (
            <p className="text-sm rounded-input px-3 py-2" style={{ background: '#FEE2E2', color: '#B91C1C' }}>{error}</p>
          )}
          <div className="flex justify-end gap-3 pt-2">
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
          <Select label={t('class_name')} value={form.class_id} onChange={(e) => setForm({ ...form, class_id: e.target.value })}>
            <option value="">— Sinif seçin —</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          {error && (
            <p className="text-sm rounded-input px-3 py-2" style={{ background: '#FEE2E2', color: '#B91C1C' }}>{error}</p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => { setEditModal(null); resetForm(); setError(null) }}>{t('cancel')}</Button>
            <Button onClick={handleEdit} loading={saving} disabled={!form.full_name || !form.email}>{t('save')}</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title={t('delete')} size="sm">
        <p className="text-sm text-ink-600 mb-6">
          <strong className="text-ink-900">{deleteModal?.full_name}</strong> adlı şagirdi silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz.
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
