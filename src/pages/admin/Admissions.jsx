import { useState, useEffect } from 'react'
import { Search, Plus, UserPlus, CheckCircle, XCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import Table from '../../components/ui/Table'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import Avatar from '../../components/ui/Avatar'
import Input from '../../components/ui/Input'
import { Select } from '../../components/ui/Input'

const statusConfig = {
  pending: { label: 'Gözlənilir', className: 'bg-[#faeeda] text-[#633806] border border-[#EF9F27]' },
  accepted: { label: 'Qəbul edildi', className: 'bg-teal-light text-[#085041] border border-teal-mid' },
  rejected: { label: 'Rədd edildi', className: 'bg-red-50 text-red-700 border border-red-200' },
}

const GRADES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11']

const DEMO_DATA = [
  { id: '1', full_name: 'Aynur Quliyeva', email: 'aynur@mail.com', grade_applying: '5', applied_at: '2026-03-10', status: 'pending', parent_name: 'Leyla Quliyeva', parent_phone: '+994 50 123 4567', notes: 'Əvvəlki məktəbdən gəlir.' },
  { id: '2', full_name: 'Tural Həsənov', email: 'tural@mail.com', grade_applying: '9', applied_at: '2026-03-12', status: 'accepted', parent_name: 'Rauf Həsənov', parent_phone: '+994 55 987 6543', notes: '' },
  { id: '3', full_name: 'Nigar Məmmədova', email: 'nigar@mail.com', grade_applying: '1', applied_at: '2026-03-15', status: 'rejected', parent_name: 'Samirə Məmmədova', parent_phone: '+994 77 111 2233', notes: 'Yaş uyğun deyil.' },
]

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
      setApplications(data && data.length > 0 ? data : DEMO_DATA)
    } catch {
      setApplications(DEMO_DATA)
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

  const filtered = applications
    .filter(a => filterStatus === 'all' || a.status === filterStatus)
    .filter(a => a.full_name?.toLowerCase().includes(search.toLowerCase()) || a.email?.toLowerCase().includes(search.toLowerCase()))

  const columns = [
    {
      key: 'full_name',
      label: 'Müraciətçi',
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <Avatar name={val} size="sm" />
          <div>
            <p className="font-medium text-gray-900">{val}</p>
            <p className="text-xs text-gray-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'grade_applying',
      label: 'Sinif',
      render: (val) => <span className="font-medium">{val}-ci sinif</span>,
    },
    {
      key: 'applied_at',
      label: 'Müraciət tarixi',
      render: (val) => val ? new Date(val).toLocaleDateString('az-AZ') : '—',
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => {
        const cfg = statusConfig[val] || statusConfig.pending
        return <span className={`rounded-full text-xs font-medium px-3 py-0.5 inline-flex items-center ${cfg.className}`}>{cfg.label}</span>
      },
    },
  ]

  if (loading) return <PageSpinner />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-3xl text-gray-900">Qəbul İdarəetməsi</h1>
          <p className="text-sm text-gray-500 mt-1">
            {applications.filter(a => a.status === 'pending').length} gözlənilən ·{' '}
            {applications.filter(a => a.status === 'accepted').length} qəbul edilən
          </p>
        </div>
        <Button onClick={() => { resetForm(); setAddModal(true) }}>
          <span className="flex items-center gap-2"><Plus className="w-4 h-4" /> Müraciət əlavə et</span>
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[['all', 'Hamısı'], ['pending', 'Gözlənilir'], ['accepted', 'Qəbul edildi'], ['rejected', 'Rədd edildi']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilterStatus(val)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterStatus === val ? 'bg-purple text-white' : 'bg-surface text-gray-600 hover:text-purple'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Ad və ya e-poçt axtar..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border border-border-soft rounded-md pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple focus:border-transparent"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Card hover={false} className="p-0 overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={UserPlus} title="Müraciət tapılmadı" description="Hələ müraciət daxil olmayıb." actionLabel="Müraciət əlavə et" onAction={() => { resetForm(); setAddModal(true) }} />
        ) : (
          <Table columns={columns} data={filtered} onRowClick={setSelectedApp} />
        )}
      </Card>

      {/* Detail Modal */}
      <Modal open={!!selectedApp} onClose={() => setSelectedApp(null)} title="Müraciət Detalları" size="lg">
        {selectedApp && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar name={selectedApp.full_name} size="lg" />
              <div>
                <h3 className="font-serif text-2xl text-gray-900">{selectedApp.full_name}</h3>
                <p className="text-sm text-gray-500">{selectedApp.email}</p>
              </div>
              <div className="ml-auto">
                <span className={`rounded-full text-sm font-medium px-4 py-1 ${(statusConfig[selectedApp.status] || statusConfig.pending).className}`}>
                  {(statusConfig[selectedApp.status] || statusConfig.pending).label}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">Müraciət etdiyi sinif</p>
                <p className="font-medium text-gray-900">{selectedApp.grade_applying}-ci sinif</p>
              </div>
              <div className="bg-surface rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">Müraciət tarixi</p>
                <p className="font-medium text-gray-900">{selectedApp.applied_at ? new Date(selectedApp.applied_at).toLocaleDateString('az-AZ') : '—'}</p>
              </div>
              {selectedApp.parent_name && (
                <div className="bg-surface rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Valideyn adı</p>
                  <p className="font-medium text-gray-900">{selectedApp.parent_name}</p>
                </div>
              )}
              {selectedApp.parent_phone && (
                <div className="bg-surface rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Valideyn telefonu</p>
                  <p className="font-medium text-gray-900">{selectedApp.parent_phone}</p>
                </div>
              )}
            </div>

            {selectedApp.notes && (
              <div className="bg-surface rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">Qeydlər</p>
                <p className="text-gray-700">{selectedApp.notes}</p>
              </div>
            )}

            {selectedApp.status === 'pending' && (
              <div className="border-t border-border-soft pt-4">
                <div className="mb-3">
                  <Input
                    label="Rədd səbəbi (ixtiyari)"
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    placeholder="Rədd etmə səbəbini qeyd edin..."
                  />
                </div>
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
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Qeydlər</label>
            <textarea
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              rows={3}
              placeholder="Əlavə məlumat..."
              className="w-full border border-border-soft rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple focus:border-transparent resize-none"
            />
          </div>
          {error && <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{error}</p>}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => { setAddModal(false); setError(null) }}>{t('cancel')}</Button>
            <Button onClick={handleAdd} loading={saving} disabled={!form.full_name || !form.email}>{t('add')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
