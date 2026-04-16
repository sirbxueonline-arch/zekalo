import { useState, useEffect } from 'react'
import { Plus, BarChart2, Users, CheckSquare, Edit2, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import Table from '../../components/ui/Table'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import Input from '../../components/ui/Input'
import { Select, Textarea } from '../../components/ui/Input'

const audienceConfig = {
  all: { label: 'Hamısı', className: 'bg-purple-light text-purple-dark border border-[#AFA9EC]' },
  parents: { label: 'Valideynlər', className: 'bg-teal-light text-[#085041] border border-teal-mid' },
  teachers: { label: 'Müəllimlər', className: 'bg-[#faeeda] text-[#633806] border border-[#EF9F27]' },
  students: { label: 'Şagirdlər', className: 'bg-blue-50 text-blue-700 border border-blue-200' },
}

const statusConfig = {
  draft: { label: 'Qaralama', className: 'bg-surface text-gray-600 border border-border-soft' },
  active: { label: 'Aktiv', className: 'bg-teal-light text-[#085041] border border-teal-mid' },
  closed: { label: 'Bağlandı', className: 'bg-red-50 text-red-700 border border-red-200' },
}

const DEMO_SURVEYS = [
  { id: 's1', title: 'Tədris ili məmnuniyyət sorğusu', audience: 'parents', responses_count: 47, created_at: '2026-03-01', status: 'active', description: 'Valideynlərin məktəbdən məmnuniyyəti' },
  { id: 's2', title: 'Müəllim geri bildiriş forması', audience: 'teachers', responses_count: 12, created_at: '2026-02-15', status: 'closed', description: 'Müəllimlərin iş şəraitindən məmnuniyyəti' },
  { id: 's3', title: 'Şagird refahı qiymətləndirməsi', audience: 'students', responses_count: 0, created_at: '2026-04-10', status: 'draft', description: 'Şagirdlərin məktəb həyatından razılığı' },
]

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
      setSurveys(data && data.length > 0 ? data : DEMO_SURVEYS)
    } catch {
      setSurveys(DEMO_SURVEYS)
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
      await supabase.from('surveys').update({ status }).eq('id', id)
      await fetchData()
      if (detailModal?.id === id) setDetailModal(prev => ({ ...prev, status }))
    } catch (err) {
      setError(err.message || t('error'))
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
      render: (val, row) => (
        <div>
          <p className="font-medium text-gray-900">{val}</p>
          {row.description && <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{row.description}</p>}
        </div>
      ),
    },
    {
      key: 'audience',
      label: 'Auditoriya',
      render: (val) => {
        const cfg = audienceConfig[val] || audienceConfig.all
        return <span className={`rounded-full text-xs font-medium px-3 py-0.5 ${cfg.className}`}>{cfg.label}</span>
      },
    },
    {
      key: 'responses_count',
      label: 'Cavablar',
      render: (val) => (
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-gray-400" />
          <span className="font-medium text-gray-900">{val || 0}</span>
        </div>
      ),
    },
    {
      key: 'created_at',
      label: 'Yaradıldı',
      render: (val) => val ? new Date(val).toLocaleDateString('az-AZ') : '—',
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => {
        const cfg = statusConfig[val] || statusConfig.draft
        return <span className={`rounded-full text-xs font-medium px-3 py-0.5 inline-flex items-center ${cfg.className}`}>{cfg.label}</span>
      },
    },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          <button onClick={() => setDetailModal(row)} className="p-1.5 text-gray-400 hover:text-purple transition-colors">
            <BarChart2 className="w-4 h-4" />
          </button>
          <button onClick={() => setDeleteModal(row)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors">
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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-3xl text-gray-900">Sorğular</h1>
          <p className="text-sm text-gray-500 mt-1">{surveys.length} sorğu · {activeCount} aktiv · {totalResponses} cavab</p>
        </div>
        <Button onClick={() => { resetForm(); setAddModal(true) }}>
          <span className="flex items-center gap-2"><Plus className="w-4 h-4" /> Sorğu yarat</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card hover={false} className="p-5">
          <p className="text-xs text-gray-500 mb-1">Aktiv sorğular</p>
          <p className="text-3xl font-bold text-purple">{activeCount}</p>
        </Card>
        <Card hover={false} className="p-5">
          <p className="text-xs text-gray-500 mb-1">Ümumi cavablar</p>
          <p className="text-3xl font-bold text-teal">{totalResponses}</p>
        </Card>
        <Card hover={false} className="p-5">
          <p className="text-xs text-gray-500 mb-1">Cəmi sorğu</p>
          <p className="text-3xl font-bold text-gray-900">{surveys.length}</p>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {[['all', 'Hamısı'], ['draft', 'Qaralama'], ['active', 'Aktiv'], ['closed', 'Bağlandı']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilterStatus(val)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterStatus === val ? 'bg-purple text-white' : 'bg-surface text-gray-600 hover:text-purple'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Card hover={false} className="p-0 overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={CheckSquare} title="Sorğu tapılmadı" description="İlk sorğunuzu yaradın." actionLabel="Sorğu yarat" onAction={() => { resetForm(); setAddModal(true) }} />
        ) : (
          <Table columns={columns} data={filtered} onRowClick={setDetailModal} />
        )}
      </Card>

      {/* Detail / Responses Modal */}
      <Modal open={!!detailModal} onClose={() => setDetailModal(null)} title={detailModal?.title || ''} size="lg">
        {detailModal && (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <span className={`rounded-full text-sm font-medium px-4 py-1 ${(audienceConfig[detailModal.audience] || audienceConfig.all).className}`}>
                {(audienceConfig[detailModal.audience] || audienceConfig.all).label}
              </span>
              <span className={`rounded-full text-sm font-medium px-4 py-1 ${(statusConfig[detailModal.status] || statusConfig.draft).className}`}>
                {(statusConfig[detailModal.status] || statusConfig.draft).label}
              </span>
            </div>

            {detailModal.description && (
              <p className="text-gray-600">{detailModal.description}</p>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface rounded-xl p-5 text-center">
                <p className="text-4xl font-bold text-purple">{detailModal.responses_count || 0}</p>
                <p className="text-sm text-gray-500 mt-1">Ümumi cavab</p>
              </div>
              <div className="bg-surface rounded-xl p-5 text-center">
                <p className="text-4xl font-bold text-gray-900">{detailModal.created_at ? new Date(detailModal.created_at).toLocaleDateString('az-AZ') : '—'}</p>
                <p className="text-sm text-gray-500 mt-1">Yaradılma tarixi</p>
              </div>
            </div>

            <div className="bg-surface rounded-xl p-5">
              <p className="text-sm text-gray-500 text-center">Sorğu cavablarının ətraflı analizi tezliklə əlavə ediləcək.</p>
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-border-soft">
              {detailModal.status === 'draft' && (
                <Button onClick={() => updateStatus(detailModal.id, 'active')}>Aktivləşdir</Button>
              )}
              {detailModal.status === 'active' && (
                <Button variant="danger" onClick={() => updateStatus(detailModal.id, 'closed')}>Sorğunu bağla</Button>
              )}
              <Button variant="ghost" onClick={() => setDetailModal(null)} className="ml-auto">Bağla</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Modal */}
      <Modal open={addModal} onClose={() => { setAddModal(false); setError(null) }} title="Yeni Sorğu">
        <div className="space-y-4">
          <Input label="Sorğu başlığı" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Sorğunun adı" />
          <Select label="Auditoriya" value={form.audience} onChange={e => setForm({ ...form, audience: e.target.value })}>
            {Object.entries(audienceConfig).map(([val, { label }]) => <option key={val} value={val}>{label}</option>)}
          </Select>
          <Textarea label="Açıqlama" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Sorğunun məqsədi..." />
          <Select label="Başlanğıc status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
            <option value="draft">Qaralama</option>
            <option value="active">Aktiv</option>
          </Select>
          {error && <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{error}</p>}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => { setAddModal(false); setError(null) }}>{t('cancel')}</Button>
            <Button onClick={handleAdd} loading={saving} disabled={!form.title}>{t('add')}</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title={t('delete')} size="sm">
        <p className="text-sm text-gray-600 mb-6">
          <strong>{deleteModal?.title}</strong> sorğusunu silmək istədiyinizə əminsiniz?
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeleteModal(null)}>{t('cancel')}</Button>
          <Button variant="danger" onClick={handleDelete} loading={saving}>{t('delete')}</Button>
        </div>
      </Modal>
    </div>
  )
}
