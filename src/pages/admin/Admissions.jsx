import { useState, useEffect } from 'react'
import { Search, Plus, UserPlus, CheckCircle, XCircle, Users, Clock, TrendingUp } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import StatCard from '../../components/ui/StatCard'
import { fmtNumeric } from '../../lib/dateUtils'
import Avatar from '../../components/ui/Avatar'
import Input from '../../components/ui/Input'
import { Select } from '../../components/ui/Input'

// LOW dial: pill-* classes, no glass blur, tight radius, one brand accent
const STATUS_PILLS = {
  pending:  'pill-peach',
  accepted: 'pill-mint',
  rejected: 'pill-rose',
}

const STATUS_LABELS = {
  pending:  'Gözlənilir',
  accepted: 'Qəbul edildi',
  rejected: 'Rədd edildi',
}

const GRADES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11']

export default function Admissions() {
  const { profile, t } = useAuth()
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState([])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedApp, setSelectedApp] = useState(null)
  const [addModal, setAddModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [form, setForm] = useState({ full_name: '', email: '', grade_applying: '1', parent_name: '', parent_phone: '', notes: '' })

  useEffect(() => {
    if (profile?.school_id) fetchData()
  }, [profile?.school_id])

  async function fetchData() {
    try {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('admissions')
        .select('*')
        .eq('school_id', profile.school_id)
        .order('applied_at', { ascending: false })

      if (err) throw err
      setApplications(data || [])
    } catch {
      setApplications([])
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setForm({ full_name: '', email: '', grade_applying: '1', parent_name: '', parent_phone: '', notes: '' })
  }

  async function handleAdd() {
    try {
      setSaving(true)
      setError(null)
      const { error: err } = await supabase.from('admissions').insert({
        ...form,
        status: 'pending',
        applied_at: new Date().toISOString().split('T')[0],
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

  async function updateStatus(id, status, reason = '') {
    try {
      setSaving(true)
      const { error: err } = await supabase.from('admissions').update({ status, reject_reason: reason || null }).eq('id', id)
      if (err) throw err
      setSelectedApp(prev => prev ? { ...prev, status } : null)
      await fetchData()
    } catch (err) {
      setError(err.message || t('error'))
    } finally {
      setSaving(false)
    }
  }

  // Search-filtered set; the kanban groups by status (columns = pipeline stages).
  const searched = applications
    .filter(a => a.full_name?.toLowerCase().includes(search.toLowerCase()) || a.email?.toLowerCase().includes(search.toLowerCase()))

  const pendingCount  = applications.filter(a => a.status === 'pending').length
  const acceptedCount = applications.filter(a => a.status === 'accepted').length
  const rejectedCount = applications.filter(a => a.status === 'rejected').length

  // Pipeline columns. `filterStatus` (≠ all) focuses a single stage.
  const PIPELINE = [
    { id: 'pending',  label: STATUS_LABELS.pending,  dot: 'var(--warning)' },
    { id: 'accepted', label: STATUS_LABELS.accepted, dot: 'var(--success)' },
    { id: 'rejected', label: STATUS_LABELS.rejected, dot: 'var(--danger)' },
  ].filter(col => filterStatus === 'all' || filterStatus === col.id)

  const totalShown = searched.length

  // Single application card inside a pipeline column.
  const PipelineCard = ({ app }) => (
    <button
      onClick={() => setSelectedApp(app)}
      className="w-full text-left bg-surface border border-hairline rounded-tile p-3 transition-all duration-150 hover:border-brand-200 hover:shadow-soft-lg"
    >
      <div className="flex items-center gap-2.5">
        <Avatar name={app.full_name} size="sm" />
        <div className="min-w-0">
          <p className="font-semibold text-ink-900 text-[13px] truncate">{app.full_name}</p>
          <p className="text-xs text-ink-400 truncate">{app.email}</p>
        </div>
      </div>
      <div className="flex items-center justify-between mt-2.5 text-xs">
        <span className="font-medium text-ink-600 tabular-nums">{app.grade_applying}-ci sinif</span>
        <span className="text-ink-400 tabular-nums">{app.applied_at ? fmtNumeric(app.applied_at) : '—'}</span>
      </div>
    </button>
  )

  if (loading) return <PageSpinner />

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-900 font-display">Qəbul İdarəetməsi</h1>
          <p className="text-sm text-ink-400 mt-0.5">
            {pendingCount} gözlənilən · {acceptedCount} qəbul edilən · {rejectedCount} rədd edilən
          </p>
        </div>
        <Button onClick={() => { resetForm(); setAddModal(true) }}>
          <span className="flex items-center gap-2"><Plus className="w-4 h-4" /> Müraciət əlavə et</span>
        </Button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Cəmi müraciət"  value={applications.length} icon={Users}      tone="periwinkle" />
        <StatCard label="Gözlənilir"     value={pendingCount}         icon={Clock}      tone="sun" />
        <StatCard label="Qəbul edilən"   value={acceptedCount}        icon={TrendingUp} tone="mint" />
        <StatCard label="Rədd edilən"    value={rejectedCount}        icon={XCircle}    tone="coral" />
      </div>

      {/* Toolbar: column-focus segmented (neutral grey active) + search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="inline-flex items-center gap-1 p-1 rounded-input bg-surface-2 border border-hairline w-fit">
          {[
            ['all',      'Hamısı'],
            ['pending',  'Gözlənilir'],
            ['accepted', 'Qəbul edildi'],
            ['rejected', 'Rədd edildi'],
          ].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilterStatus(val)}
              className={[
                'px-3 py-1.5 rounded-ctl text-[13px] whitespace-nowrap transition-colors',
                filterStatus === val
                  ? 'bg-hairline-strong font-semibold text-ink-900'
                  : 'text-ink-600 font-medium hover:text-ink-900',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="relative sm:ml-auto sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            type="text"
            placeholder="Ad və ya e-poçt axtar..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pastel-input w-full pl-10 pr-4"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-danger bg-[rgba(239,68,68,0.08)] rounded-input px-3 py-2 border border-[rgba(239,68,68,0.2)]">
          {error}
        </p>
      )}

      {/* Kanban pipeline */}
      {totalShown === 0 ? (
        <EmptyState
          tier={1}
          icon={UserPlus}
          title="Müraciət tapılmadı"
          description={search ? `"${search}" üçün nəticə tapılmadı.` : 'Hələ müraciət daxil olmayıb.'}
          actionLabel="Müraciət əlavə et"
          onAction={() => { resetForm(); setAddModal(true) }}
        />
      ) : (
        <div className={`grid gap-4 ${PIPELINE.length === 1 ? 'grid-cols-1 max-w-md' : 'grid-cols-1 md:grid-cols-3'}`}>
          {PIPELINE.map(col => {
            const cards = searched.filter(a => a.status === col.id)
            return (
              <div key={col.id} className="flex flex-col rounded-tile bg-surface-2 border border-hairline">
                {/* Quiet column header — dot + label + count */}
                <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-hairline">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: col.dot }} />
                  <span className="text-[13px] font-semibold text-ink-700">{col.label}</span>
                  <span className="ml-auto text-xs font-medium text-ink-400 tabular-nums">{cards.length}</span>
                </div>
                {/* Cards */}
                <div className="flex-1 p-2.5 space-y-2.5 min-h-[80px]">
                  {cards.length === 0 ? (
                    <p className="text-xs text-ink-400 text-center py-6">Boş</p>
                  ) : (
                    cards.map(app => <PipelineCard key={app.id} app={app} />)
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Detail Modal */}
      <Modal open={!!selectedApp} onClose={() => setSelectedApp(null)} title="Müraciət Detalları" size="lg">
        {selectedApp && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar name={selectedApp.full_name} size="lg" />
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-ink-900 truncate">{selectedApp.full_name}</h3>
                <p className="text-sm text-ink-400 mt-0.5">{selectedApp.email}</p>
              </div>
              <span className={`pill ${STATUS_PILLS[selectedApp.status] || STATUS_PILLS.pending} shrink-0`}>
                {STATUS_LABELS[selectedApp.status] || STATUS_LABELS.pending}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-canvas rounded-tile p-4 border border-hairline">
                <p className="text-xs font-semibold text-ink-400 uppercase tracking-[0.04em] mb-1">Müraciət etdiyi sinif</p>
                <p className="font-semibold text-ink-900">{selectedApp.grade_applying}-ci sinif</p>
              </div>
              <div className="bg-canvas rounded-tile p-4 border border-hairline">
                <p className="text-xs font-semibold text-ink-400 uppercase tracking-[0.04em] mb-1">Müraciət tarixi</p>
                <p className="font-semibold text-ink-900 tabular-nums">{selectedApp.applied_at ? fmtNumeric(selectedApp.applied_at) : '—'}</p>
              </div>
              {selectedApp.parent_name && (
                <div className="bg-canvas rounded-tile p-4 border border-hairline">
                  <p className="text-xs font-semibold text-ink-400 uppercase tracking-[0.04em] mb-1">Valideyn adı</p>
                  <p className="font-semibold text-ink-900">{selectedApp.parent_name}</p>
                </div>
              )}
              {selectedApp.parent_phone && (
                <div className="bg-canvas rounded-tile p-4 border border-hairline">
                  <p className="text-xs font-semibold text-ink-400 uppercase tracking-[0.04em] mb-1">Valideyn telefonu</p>
                  <p className="font-semibold text-ink-900 tabular-nums">{selectedApp.parent_phone}</p>
                </div>
              )}
            </div>

            {selectedApp.notes && (
              <div className="bg-canvas rounded-tile p-4 border border-hairline">
                <p className="text-xs font-semibold text-ink-400 uppercase tracking-[0.04em] mb-1">Qeydlər</p>
                <p className="text-sm text-ink-700 leading-relaxed">{selectedApp.notes}</p>
              </div>
            )}

            {selectedApp.status === 'pending' && (
              <div className="border-t border-hairline pt-4 space-y-3">
                <Input
                  label="Rədd səbəbi (ixtiyari)"
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  placeholder="Rədd etmə səbəbini qeyd edin..."
                />
                <div className="flex gap-3">
                  <Button
                    className="flex-1"
                    onClick={() => updateStatus(selectedApp.id, 'accepted')}
                    loading={saving}
                  >
                    <span className="flex items-center justify-center gap-2"><CheckCircle className="w-4 h-4" /> Qəbul et</span>
                  </Button>
                  <Button
                    variant="danger"
                    className="flex-1"
                    onClick={() => updateStatus(selectedApp.id, 'rejected', rejectReason)}
                    loading={saving}
                  >
                    <span className="flex items-center justify-center gap-2"><XCircle className="w-4 h-4" /> Rədd et</span>
                  </Button>
                </div>
              </div>
            )}

            {selectedApp.status !== 'pending' && (
              <div className="flex justify-end">
                <Button variant="ghost" onClick={() => setSelectedApp(null)}>Bağla</Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Add Modal */}
      <Modal open={addModal} onClose={() => { setAddModal(false); setError(null) }} title="Müraciət Əlavə Et" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Ad Soyad" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} placeholder="Şagirdin adı" />
            <Input label="E-poçt" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@mail.com" />
          </div>
          <Select label="Müraciət etdiyi sinif" value={form.grade_applying} onChange={e => setForm({ ...form, grade_applying: e.target.value })}>
            {GRADES.map(g => <option key={g} value={g}>{g}-ci sinif</option>)}
          </Select>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Valideyn adı" value={form.parent_name} onChange={e => setForm({ ...form, parent_name: e.target.value })} placeholder="Valideynin adı soyadı" />
            <Input label="Valideyn telefonu" value={form.parent_phone} onChange={e => setForm({ ...form, parent_phone: e.target.value })} placeholder="+994 50 000 0000" />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-ink-700 mb-1.5">Qeydlər</label>
            <textarea
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              rows={3}
              placeholder="Əlavə məlumat..."
              className="pastel-input w-full resize-none"
            />
          </div>
          {error && (
            <p className="text-sm text-danger bg-[rgba(239,68,68,0.08)] rounded-input px-3 py-2 border border-[rgba(239,68,68,0.2)]">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => { setAddModal(false); setError(null) }}>{t('cancel')}</Button>
            <Button onClick={handleAdd} loading={saving} disabled={!form.full_name || !form.email}>{t('add')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
