import { useState, useEffect } from 'react'
import { Search, Plus, GraduationCap, Edit2, Trash2, CheckCircle, Clock, FileText, TrendingUp } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import Table from '../../components/ui/Table'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import StatCard from '../../components/ui/StatCard'
import { fmtNumeric } from '../../lib/dateUtils'
import Avatar from '../../components/ui/Avatar'
import Input from '../../components/ui/Input'
import { Select, Textarea } from '../../components/ui/Input'

// LOW dial: pill-* tokens, no glass, tight 12–16px radius, one brand accent
const APP_STATUS_PILLS = {
  researching: 'pill-muted',
  drafting:    'pill-peach',
  submitted:   'pill-peri',
  accepted:    'pill-mint',
  rejected:    'pill-rose',
  waitlisted:  'pill-blue',
}

const APP_STATUS_LABELS = {
  researching: 'Araşdırma',
  drafting:    'Sənədlər hazırlanır',
  submitted:   'Göndərildi',
  accepted:    'Qəbul edildi',
  rejected:    'Rədd edildi',
  waitlisted:  'Gözleme siyahısı',
}

export default function CollegeCounseling() {
  const { profile, t } = useAuth()
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState([])
  const [students, setStudents] = useState([])
  const [search, setSearch] = useState('')
  const [selectedApp, setSelectedApp] = useState(null)
  const [addModal, setAddModal] = useState(false)
  const [editModal, setEditModal] = useState(null)
  const [deleteModal, setDeleteModal] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({ student_id: '', student_name: '', universities: [{ name: '', status: 'researching' }], deadline: '', counselor_notes: '' })

  useEffect(() => {
    if (profile?.school_id) fetchData()
  }, [profile?.school_id])

  async function fetchData() {
    try {
      setLoading(true)
      const [appRes, studentRes] = await Promise.all([
        supabase.from('college_applications').select('*, student:profiles(id,full_name)').eq('school_id', profile.school_id).order('created_at', { ascending: false }),
        supabase.from('profiles').select('id,full_name').eq('school_id', profile.school_id).eq('role', 'student'),
      ])
      if (appRes.error) throw appRes.error
      const formatted = (appRes.data || []).map(a => ({ ...a, student_name: a.student?.full_name || a.student_name }))
      setApplications(formatted)
      setStudents(studentRes.data || [])
    } catch {
      setApplications([])
      try {
        const { data } = await supabase.from('profiles').select('id,full_name').eq('school_id', profile.school_id).eq('role', 'student')
        setStudents(data || [])
      } catch {}
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setForm({ student_id: '', student_name: '', universities: [{ name: '', status: 'researching' }], deadline: '', counselor_notes: '' })
  }

  function addUniversity() {
    setForm(f => ({ ...f, universities: [...f.universities, { name: '', status: 'researching' }] }))
  }

  function removeUniversity(idx) {
    setForm(f => ({ ...f, universities: f.universities.filter((_, i) => i !== idx) }))
  }

  function updateUniversity(idx, field, val) {
    setForm(f => {
      const unis = [...f.universities]
      unis[idx] = { ...unis[idx], [field]: val }
      return { ...f, universities: unis }
    })
  }

  async function handleAdd() {
    try {
      setSaving(true)
      setError(null)
      const student = students.find(s => s.id === form.student_id)
      const { error: err } = await supabase.from('college_applications').insert({
        student_id: form.student_id || null,
        student_name: student?.full_name || form.student_name,
        universities: form.universities.filter(u => u.name),
        deadline: form.deadline || null,
        counselor_notes: form.counselor_notes,
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
      const { error: err } = await supabase.from('college_applications').update({
        universities: form.universities.filter(u => u.name),
        deadline: form.deadline || null,
        counselor_notes: form.counselor_notes,
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
      await supabase.from('college_applications').delete().eq('id', deleteModal.id)
      setDeleteModal(null)
      await fetchData()
    } catch {
      setError(t('error'))
    } finally {
      setSaving(false)
    }
  }

  function openEdit(app) {
    setForm({
      student_id: app.student_id || '',
      student_name: app.student_name || '',
      universities: app.universities && app.universities.length > 0 ? app.universities : [{ name: '', status: 'researching' }],
      deadline: app.deadline || '',
      counselor_notes: app.counselor_notes || '',
    })
    setEditModal(app)
  }

  const filtered = applications.filter(a =>
    a.student_name?.toLowerCase().includes(search.toLowerCase())
  )

  // KPI aggregates
  const totalUnis    = applications.reduce((s, a) => s + (a.universities || []).length, 0)
  const acceptedCount = applications.reduce((s, a) => s + (a.universities || []).filter(u => u.status === 'accepted').length, 0)
  const submittedCount = applications.reduce((s, a) => s + (a.universities || []).filter(u => u.status === 'submitted').length, 0)

  // University fields subcomponent — defined inside to close over form/setters
  const UniversityFields = () => (
    <div className="space-y-2">
      <label className="block text-[13px] font-semibold text-ink-700">Universitetlər</label>
      {form.universities.map((uni, idx) => (
        <div key={idx} className="flex gap-2 items-center">
          <input
            value={uni.name}
            onChange={e => updateUniversity(idx, 'name', e.target.value)}
            placeholder={`Universitet ${idx + 1}`}
            className="pastel-input flex-1"
          />
          <select
            value={uni.status}
            onChange={e => updateUniversity(idx, 'status', e.target.value)}
            className="pastel-input w-44 shrink-0"
          >
            {Object.entries(APP_STATUS_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
          {form.universities.length > 1 && (
            <button
              type="button"
              onClick={() => removeUniversity(idx)}
              className="p-1.5 text-ink-400 hover:text-danger transition-colors rounded-ctl"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={addUniversity}
        className="flex items-center gap-1.5 text-sm font-medium text-brand-500 hover:text-brand-600 transition-colors mt-1"
      >
        <Plus className="w-3.5 h-3.5" /> Universitet əlavə et
      </button>
    </div>
  )

  const columns = [
    {
      key: 'student_name',
      label: 'Şagird',
      render: (val) => (
        <div className="flex items-center gap-3">
          <Avatar name={val} size="sm" />
          <span className="font-semibold text-ink-900 text-sm">{val}</span>
        </div>
      ),
    },
    {
      key: 'universities',
      label: 'Universitetlər',
      render: (val) => (
        <div className="flex flex-wrap gap-1.5">
          {(val || []).slice(0, 4).map((u, i) => (
            <span
              key={i}
              className={`pill text-[11px] ${APP_STATUS_PILLS[u.status] || APP_STATUS_PILLS.researching}`}
            >
              {u.name}
            </span>
          ))}
          {(val || []).length > 4 && (
            <span className="text-xs text-ink-400 self-center">+{val.length - 4}</span>
          )}
        </div>
      ),
    },
    {
      key: 'deadline',
      label: 'Son müraciət tarixi',
      render: (val) => (
        <span className="text-ink-600 tabular-nums">{val ? fmtNumeric(val) : '—'}</span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => openEdit(row)}
            className="p-1.5 rounded-ctl text-ink-400 hover:text-brand-500 hover:bg-brand-50 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteModal(row)}
            className="p-1.5 rounded-ctl text-ink-400 hover:text-danger hover:bg-[rgba(239,68,68,0.08)] transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  if (loading) return <PageSpinner />

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-900 font-display">Kollec Məsləhəti</h1>
          <p className="text-sm text-ink-400 mt-0.5">
            {applications.length} şagird · {totalUnis} müraciət · {acceptedCount} qəbul
          </p>
        </div>
        <Button onClick={() => { resetForm(); setAddModal(true) }}>
          <span className="flex items-center gap-2"><Plus className="w-4 h-4" /> Şagird əlavə et</span>
        </Button>
      </div>

      {/* KPI strip — one brand accent; mint reserved for the "accepted" success metric */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Şagird"        value={applications.length} icon={GraduationCap} tone="periwinkle" />
        <StatCard label="Müraciət"      value={totalUnis}           icon={FileText}      tone="periwinkle" />
        <StatCard label="Göndərildi"    value={submittedCount}      icon={Clock}         tone="periwinkle" />
        <StatCard label="Qəbul edildi"  value={acceptedCount}       icon={CheckCircle}   tone="mint" />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
        <input
          type="text"
          placeholder="Şagird axtar..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pastel-input w-full pl-10 pr-4"
        />
      </div>

      {error && (
        <p className="text-sm text-danger bg-[rgba(239,68,68,0.08)] rounded-input px-3 py-2 border border-[rgba(239,68,68,0.2)]">
          {error}
        </p>
      )}

      {/* Table */}
      <Card hover={false} className="p-0 overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            tier={1}
            icon={GraduationCap}
            title="Şagird tapılmadı"
            description="Kollec müraciət prosesinə başlamaq üçün şagird əlavə edin."
            actionLabel="Şagird əlavə et"
            onAction={() => { resetForm(); setAddModal(true) }}
          />
        ) : (
          <Table columns={columns} data={filtered} onRowClick={row => { openEdit(row); setEditModal(row) }} />
        )}
      </Card>

      {/* Add Modal */}
      <Modal open={addModal} onClose={() => { setAddModal(false); setError(null) }} title="Şagird Əlavə Et" size="lg">
        <div className="space-y-4">
          <Select label="Şagird" value={form.student_id} onChange={e => {
            const s = students.find(s => s.id === e.target.value)
            setForm({ ...form, student_id: e.target.value, student_name: s?.full_name || '' })
          }}>
            <option value="">— Şagird seçin —</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
          </Select>
          <UniversityFields />
          <Input label="Son müraciət tarixi" type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
          <Textarea label="Məsləhətçi qeydləri" value={form.counselor_notes} onChange={e => setForm({ ...form, counselor_notes: e.target.value })} rows={3} placeholder="Şagird üçün qeydlər..." />
          {error && (
            <p className="text-sm text-danger bg-[rgba(239,68,68,0.08)] rounded-input px-3 py-2 border border-[rgba(239,68,68,0.2)]">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => { setAddModal(false); setError(null) }}>{t('cancel')}</Button>
            <Button onClick={handleAdd} loading={saving} disabled={!form.student_id}>{t('add')}</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editModal} onClose={() => { setEditModal(null); setError(null) }} title={`${editModal?.student_name} — Müraciətlər`} size="lg">
        <div className="space-y-4">
          <UniversityFields />
          <Input label="Son müraciət tarixi" type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
          <Textarea label="Məsləhətçi qeydləri" value={form.counselor_notes} onChange={e => setForm({ ...form, counselor_notes: e.target.value })} rows={3} placeholder="Şagird üçün qeydlər..." />
          {error && (
            <p className="text-sm text-danger bg-[rgba(239,68,68,0.08)] rounded-input px-3 py-2 border border-[rgba(239,68,68,0.2)]">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => { setEditModal(null); setError(null) }}>{t('cancel')}</Button>
            <Button onClick={handleEdit} loading={saving}>{t('save')}</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title={t('delete')} size="sm">
        <p className="text-sm text-ink-600 mb-6">
          <strong className="text-ink-900">{deleteModal?.student_name}</strong> adlı şagirdin müraciət məlumatlarını silmək istədiyinizə əminsiniz?
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeleteModal(null)}>{t('cancel')}</Button>
          <Button variant="danger" onClick={handleDelete} loading={saving}>{t('delete')}</Button>
        </div>
      </Modal>
    </div>
  )
}
