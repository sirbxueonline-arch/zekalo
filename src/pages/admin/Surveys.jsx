import { useState, useEffect } from 'react'
import { Plus, BarChart2, Users, CheckSquare, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Table from '../../components/ui/Table'
import StatCard from '../../components/ui/StatCard'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import { fmtNumeric } from '../../lib/dateUtils'
import Input from '../../components/ui/Input'
import { Select, Textarea } from '../../components/ui/Input'

// ─── Audience config — categorical metadata, not status, so neutral grey chips
// (color restraint §2.2: saturated color is reserved for meaning-bearing status pills).
const audienceConfig = {
  all: {
    label: 'Hamısı',
    pillClass: 'pill-muted',
  },
  parents: {
    label: 'Valideynlər',
    pillClass: 'pill-muted',
  },
  teachers: {
    label: 'Müəllimlər',
    pillClass: 'pill-muted',
  },
  students: {
    label: 'Şagirdlər',
    pillClass: 'pill-muted',
  },
}

// ─── Status config ─────────────────────────────────────────────────────────
const statusConfig = {
  draft: {
    label: 'Qaralama',
    pillClass: 'pill-muted',
    dot: false,
  },
  active: {
    label: 'Aktiv',
    pillClass: 'pill-mint',
    dot: true,
  },
  closed: {
    label: 'Bağlandı',
    pillClass: 'pill-muted',
    dot: false,
  },
}

// Reusable pill renderer using shared pill-* classes from index.css.
// NOTE: pill-* classes already include display:inline-flex, padding, radius, font.
function AudiencePill({ value }) {
  const cfg = audienceConfig[value] || audienceConfig.all
  return (
    <span className={cfg.pillClass}>
      {cfg.label}
    </span>
  )
}

function StatusPill({ value }) {
  const cfg = statusConfig[value] || statusConfig.draft
  return (
    <span className={cfg.pillClass}>
      {cfg.label}
    </span>
  )
}

export default function Surveys() {
  const { profile, t } = useAuth()
  const [loading, setLoading] = useState(true)
  const [surveys, setSurveys] = useState([])
  const [filterStatus, setFilterStatus] = useState('all')
  const [addModal, setAddModal] = useState(false)
  const [detailModal, setDetailModal] = useState(null)
  const [deleteModal, setDeleteModal] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({ title: '', audience: 'all', description: '', status: 'draft' })

  useEffect(() => {
    if (profile?.school_id) fetchData()
  }, [profile?.school_id])

  async function fetchData() {
    try {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('surveys')
        .select('*')
        .eq('school_id', profile.school_id)
        .order('created_at', { ascending: false })

      if (err) throw err
      setSurveys(data || [])
    } catch {
      setSurveys([])
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setForm({ title: '', audience: 'all', description: '', status: 'draft' })
  }

  async function handleAdd() {
    try {
      setSaving(true)
      setError(null)
      const { error: err } = await supabase.from('surveys').insert({
        title: form.title,
        audience: form.audience,
        description: form.description,
        status: form.status,
        responses_count: 0,
        school_id: profile.school_id,
        created_by: profile.id,
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

  async function updateStatus(id, status) {
    try {
      setSaving(true)
      await supabase.from('surveys').update({ status }).eq('id', id)
      await fetchData()
      if (detailModal?.id === id) setDetailModal(prev => ({ ...prev, status }))
    } catch (err) {
      setError(err.message || t('error'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    try {
      setSaving(true)
      await supabase.from('surveys').delete().eq('id', deleteModal.id)
      setDeleteModal(null)
      await fetchData()
    } catch {
      setError(t('error'))
    } finally {
      setSaving(false)
    }
  }

  const filtered = surveys.filter(s => filterStatus === 'all' || s.status === filterStatus)

  const columns = [
    {
      key: 'title',
      label: 'Sorğu başlığı',
      sortable: true,
      render: (val, row) => (
        <div>
          <p className="font-semibold text-ink-900 text-[14px]">{val}</p>
          {row.description && (
            <p className="text-[12px] text-ink-400 mt-0.5 truncate max-w-xs">{row.description}</p>
          )}
        </div>
      ),
    },
    {
      key: 'audience',
      label: 'Auditoriya',
      render: (val) => <AudiencePill value={val} />,
    },
    {
      key: 'responses_count',
      label: 'Cavablar',
      sortable: true,
      render: (val) => {
        const count = val || 0
        return (
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-ink-400" />
            <span className={`font-bold tabular-nums text-[14px] ${count > 0 ? 'text-brand-500' : 'text-ink-400'}`}>
              {count}
            </span>
          </div>
        )
      },
    },
    {
      key: 'created_at',
      label: 'Yaradıldı',
      sortable: true,
      render: (val) => (
        <span className="text-ink-600 text-[13px] tabular-nums">
          {val ? fmtNumeric(val) : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <StatusPill value={val} />,
    },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => setDetailModal(row)}
            className="p-1.5 text-ink-400 hover:text-brand-500 transition-colors rounded"
            aria-label="Statistika"
          >
            <BarChart2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteModal(row)}
            className="p-1.5 text-ink-400 hover:text-danger transition-colors rounded"
            aria-label="Sil"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  if (loading) return <PageSpinner />

  const activeCount = surveys.filter(s => s.status === 'active').length
  const totalResponses = surveys.reduce((sum, s) => sum + (s.responses_count || 0), 0)

  return (
    <div className="space-y-6">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-[22px] text-ink-900 leading-snug">
            Sorğular
          </h1>
          <p className="text-[13px] text-ink-400 mt-0.5">
            {surveys.length} sorğu · {activeCount} aktiv · {totalResponses} cavab
          </p>
        </div>
        <Button onClick={() => { resetForm(); setAddModal(true) }}>
          <span className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Sorğu yarat
          </span>
        </Button>
      </div>

      {/* ── KPI row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Aktiv sorğular"
          value={activeCount}
          icon={CheckSquare}
          tone="periwinkle"
        />
        <StatCard
          label="Ümumi cavablar"
          value={totalResponses}
          icon={BarChart2}
          tone="periwinkle"
        />
        <StatCard
          label="Cəmi sorğu"
          value={surveys.length}
          icon={Users}
          tone="periwinkle"
        />
      </div>

      {/* ── Status filter tabs ── */}
      <div className="flex gap-2 flex-wrap">
        {[
          ['all', 'Hamısı'],
          ['draft', 'Qaralama'],
          ['active', 'Aktiv'],
          ['closed', 'Bağlandı'],
        ].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilterStatus(val)}
            className={[
              'px-4 py-1.5 rounded-pill text-[13px] font-semibold transition-all border',
              filterStatus === val
                ? 'bg-brand-500 text-white border-brand-500'
                : 'bg-surface text-ink-600 border-hairline-strong hover:bg-brand-50 hover:border-brand-200',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-tile border border-danger/30 bg-danger/5 px-4 py-3 text-[13px] text-danger font-medium">
          {error}
        </div>
      )}

      {/* ── Surveys table ── */}
      <div className="liquid-card overflow-hidden p-0">
        {filtered.length === 0 ? (
          <EmptyState
            tier={1}
            icon={CheckSquare}
            title="Sorğu tapılmadı"
            description="İlk sorğunuzu yaradın."
            actionLabel="Sorğu yarat"
            onAction={() => { resetForm(); setAddModal(true) }}
            className="border-none shadow-none"
          />
        ) : (
          <Table columns={columns} data={filtered} onRowClick={setDetailModal} />
        )}
      </div>

      {/* ── Detail / Responses Modal ── */}
      <Modal open={!!detailModal} onClose={() => setDetailModal(null)} title={detailModal?.title || ''} size="lg">
        {detailModal && (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <AudiencePill value={detailModal.audience} />
              <StatusPill value={detailModal.status} />
            </div>

            {detailModal.description && (
              <p className="text-[14px] text-ink-600 leading-relaxed">{detailModal.description}</p>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-tile bg-surface border border-hairline p-5 text-center">
                <p className="font-display font-bold text-[32px] text-brand-500 tabular-nums leading-none tracking-[-0.01em]">
                  {detailModal.responses_count || 0}
                </p>
                <p className="text-[13px] text-ink-400 mt-2">Ümumi cavab</p>
              </div>
              <div className="rounded-tile bg-surface border border-hairline p-5 text-center flex flex-col justify-center">
                <p className="text-[16px] font-semibold text-ink-900 tabular-nums leading-none">
                  {detailModal.created_at ? fmtNumeric(detailModal.created_at) : '—'}
                </p>
                <p className="text-[13px] text-ink-400 mt-2">Yaradılma tarixi</p>
              </div>
            </div>

            <div className="rounded-tile bg-surface-2 border border-hairline px-5 py-4">
              <p className="text-[13px] text-ink-400 text-center">
                Sorğu cavablarının ətraflı analizi tezliklə əlavə ediləcək.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-hairline">
              {detailModal.status === 'draft' && (
                <Button onClick={() => updateStatus(detailModal.id, 'active')}>
                  Aktivləşdir
                </Button>
              )}
              {detailModal.status === 'active' && (
                <Button variant="danger" onClick={() => updateStatus(detailModal.id, 'closed')}>
                  Sorğunu bağla
                </Button>
              )}
              <Button variant="ghost" onClick={() => setDetailModal(null)} className="ml-auto">
                Bağla
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Add Modal ── */}
      <Modal open={addModal} onClose={() => { setAddModal(false); setError(null) }} title="Yeni Sorğu">
        <div className="space-y-4">
          <Input
            label="Sorğu başlığı"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="Sorğunun adı"
          />
          <Select
            label="Auditoriya"
            value={form.audience}
            onChange={e => setForm({ ...form, audience: e.target.value })}
          >
            {Object.entries(audienceConfig).map(([val, { label }]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </Select>
          <Textarea
            label="Açıqlama"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            rows={3}
            placeholder="Sorğunun məqsədi..."
          />
          <Select
            label="Başlanğıc status"
            value={form.status}
            onChange={e => setForm({ ...form, status: e.target.value })}
          >
            <option value="draft">Qaralama</option>
            <option value="active">Aktiv</option>
          </Select>
          {error && (
            <div className="rounded-tile border border-danger/30 bg-danger/5 px-3 py-2 text-[13px] text-danger font-medium">
              {error}
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => { setAddModal(false); setError(null) }}>
              {t('cancel')}
            </Button>
            <Button onClick={handleAdd} loading={saving} disabled={!form.title}>
              {t('add')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Delete Modal ── */}
      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title={t('delete')} size="sm">
        <p className="text-[14px] text-ink-600 mb-6">
          <strong className="text-ink-900">{deleteModal?.title}</strong> sorğusunu silmək istədiyinizə əminsiniz?
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeleteModal(null)}>{t('cancel')}</Button>
          <Button variant="danger" onClick={handleDelete} loading={saving}>{t('delete')}</Button>
        </div>
      </Modal>
    </div>
  )
}
