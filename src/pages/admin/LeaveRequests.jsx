import { useState, useEffect } from 'react'
import { Search, Plus, CheckCircle, XCircle, CalendarOff } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import Table from '../../components/ui/Table'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import { fmtNumeric } from '../../lib/dateUtils'
import Avatar from '../../components/ui/Avatar'
import Input from '../../components/ui/Input'
import { Select, Textarea } from '../../components/ui/Input'

const leaveTypes = {
  sick: { label: 'Xəstəlik', className: 'bg-red-50 text-red-700 border border-red-200' },
  personal: { label: 'Şəxsi', className: 'bg-[#faeeda] text-[#633806] border border-[#EF9F27]' },
  professional: { label: 'Peşəkar inkişaf', className: 'bg-purple-light text-purple-dark border border-[#AFA9EC]' },
  maternity: { label: 'Doğuş məzuniyyəti', className: 'bg-pink-50 text-pink-700 border border-pink-200' },
  other: { label: 'Digər', className: 'bg-surface text-gray-600 border border-border-soft' },
}

const statusConfig = {
  pending: { label: 'Gözlənilir', className: 'bg-[#faeeda] text-[#633806] border border-[#EF9F27]' },
  approved: { label: 'Təsdiqləndi', className: 'bg-teal-light text-[#085041] border border-teal-mid' },
  rejected: { label: 'Rədd edildi', className: 'bg-red-50 text-red-700 border border-red-200' },
}

function daysBetween(start, end) {
  if (!start || !end) return 0
  return Math.round((new Date(end) - new Date(start)) / 86400000) + 1
}

export default function LeaveRequests() {
  const { profile, t } = useAuth()
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState([])
  const [teachers, setTeachers] = useState([])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedReq, setSelectedReq] = useState(null)
  const [addModal, setAddModal] = useState(false)
  const [adminNote, setAdminNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({ teacher_id: '', leave_type: 'sick', start_date: '', end_date: '', reason: '' })

  useEffect(() => {
    if (profile?.school_id) fetchData()
  }, [profile?.school_id])

  async function fetchData() {
    try {
      setLoading(true)
      const [reqRes, teacherRes] = await Promise.all([
        supabase.from('leave_requests').select('*, teacher:profiles(id,full_name)').eq('school_id', profile.school_id).order('created_at', { ascending: false }).limit(200),
        supabase.from('profiles').select('id,full_name').eq('school_id', profile.school_id).eq('role', 'teacher'),
      ])

      if (reqRes.error) throw reqRes.error

      const formatted = (reqRes.data || []).map(r => ({
        ...r,
        teacher_name: r.teacher?.full_name || r.teacher_name || '—',
      }))

      setRequests(formatted)
      setTeachers(teacherRes.data || [])
    } catch {
      setRequests([])
      try {
        const { data } = await supabase.from('profiles').select('id,full_name').eq('school_id', profile.school_id).eq('role', 'teacher')
        setTeachers(data || [])
      } catch {}
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setForm({ teacher_id: '', leave_type: 'sick', start_date: '', end_date: '', reason: '' })
  }

  async function handleAdd() {
    try {
      setSaving(true)
      setError(null)
      const teacher = teachers.find(t => t.id === form.teacher_id)
      const { error: err } = await supabase.from('leave_requests').insert({
        teacher_id: form.teacher_id,
        teacher_name: teacher?.full_name || '',
        leave_type: form.leave_type,
        start_date: form.start_date,
        end_date: form.end_date,
        reason: form.reason,
        status: 'pending',
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

  async function updateStatus(id, status) {
    try {
      setSaving(true)
      const { error: err } = await supabase.from('leave_requests').update({ status, admin_note: adminNote || null }).eq('id', id)
      if (err) throw err
      setSelectedReq(prev => prev ? { ...prev, status, admin_note: adminNote } : null)
      setAdminNote('')
      await fetchData()
    } catch (err) {
      setError(err.message || t('error'))
    } finally {
      setSaving(false)
    }
  }

  const filtered = requests
    .filter(r => filterStatus === 'all' || r.status === filterStatus)
    .filter(r => r.teacher_name?.toLowerCase().includes(search.toLowerCase()))

  const columns = [
    {
      key: 'teacher_name',
      label: 'Müəllim',
      render: (val) => (
        <div className="flex items-center gap-3">
          <Avatar name={val} size="sm" />
          <span className="font-medium text-gray-900">{val}</span>
        </div>
      ),
    },
    {
      key: 'leave_type',
      label: 'Növ',
      render: (val) => {
        const cfg = leaveTypes[val] || leaveTypes.other
        return <span className={`rounded-full text-xs font-medium px-3 py-0.5 ${cfg.className}`}>{cfg.label}</span>
      },
    },
    {
      key: 'start_date',
      label: 'Tarix aralığı',
      render: (val, row) => (
        <span className="text-sm text-gray-700">
          {val ? fmtNumeric(val) : '—'} – {row.end_date ? fmtNumeric(row.end_date) : '—'}
        </span>
      ),
    },
    {
      key: 'days',
      label: 'Gün',
      render: (_, row) => <span className="font-medium">{daysBetween(row.start_date, row.end_date)}</span>,
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
          <h1 className="font-serif text-3xl text-gray-900">Məzuniyyət Sorğuları</h1>
          <p className="text-sm text-gray-500 mt-1">
            {requests.filter(r => r.status === 'pending').length} gözlənilən sorğu
          </p>
        </div>
        <Button onClick={() => { resetForm(); setAddModal(true) }}>
          <span className="flex items-center gap-2"><Plus className="w-4 h-4" /> Sorğu əlavə et</span>
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[['all', 'Hamısı'], ['pending', 'Gözlənilir'], ['approved', 'Təsdiqləndi'], ['rejected', 'Rədd edildi']].map(([val, label]) => (
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
          placeholder="Müəllim adı axtar..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border border-border-soft rounded-md pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple focus:border-transparent"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Card hover={false} className="p-0 overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={CalendarOff} title="Sorğu tapılmadı" description="Hələ məzuniyyət sorğusu yoxdur." actionLabel="Sorğu əlavə et" onAction={() => { resetForm(); setAddModal(true) }} />
        ) : (
          <Table columns={columns} data={filtered} onRowClick={row => { setSelectedReq(row); setAdminNote(row.admin_note || '') }} />
        )}
      </Card>

      {/* Detail Modal */}
      <Modal open={!!selectedReq} onClose={() => setSelectedReq(null)} title="Məzuniyyət Sorğusu" size="lg">
        {selectedReq && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar name={selectedReq.teacher_name} size="lg" />
              <div>
                <h3 className="font-serif text-2xl text-gray-900">{selectedReq.teacher_name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`rounded-full text-xs font-medium px-3 py-0.5 ${(leaveTypes[selectedReq.leave_type] || leaveTypes.other).className}`}>
                    {(leaveTypes[selectedReq.leave_type] || leaveTypes.other).label}
                  </span>
                  <span className={`rounded-full text-xs font-medium px-3 py-0.5 ${(statusConfig[selectedReq.status] || statusConfig.pending).className}`}>
                    {(statusConfig[selectedReq.status] || statusConfig.pending).label}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-surface rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">Başlama</p>
                <p className="font-medium">{selectedReq.start_date ? fmtNumeric(selectedReq.start_date) : '—'}</p>
              </div>
              <div className="bg-surface rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">Bitmə</p>
                <p className="font-medium">{selectedReq.end_date ? fmtNumeric(selectedReq.end_date) : '—'}</p>
              </div>
              <div className="bg-surface rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">Gün sayı</p>
                <p className="font-medium text-purple">{daysBetween(selectedReq.start_date, selectedReq.end_date)} gün</p>
              </div>
            </div>

            {selectedReq.reason && (
              <div className="bg-surface rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">Səbəb</p>
                <p className="text-gray-700">{selectedReq.reason}</p>
              </div>
            )}

            {selectedReq.admin_note && (
              <div className="bg-teal-light rounded-lg p-4">
                <p className="text-xs text-[#085041] mb-1">Admin qeydi</p>
                <p className="text-[#085041]">{selectedReq.admin_note}</p>
              </div>
            )}

            {selectedReq.status === 'pending' && (
              <div className="border-t border-border-soft pt-4 space-y-3">
                <Textarea
                  label="Admin qeydi (ixtiyari)"
                  value={adminNote}
                  onChange={e => setAdminNote(e.target.value)}
                  rows={2}
                  placeholder="Qərarınız barədə qeyd..."
                />
                <div className="flex gap-3">
                  <Button className="flex-1" onClick={() => updateStatus(selectedReq.id, 'approved')} loading={saving}>
                    <span className="flex items-center justify-center gap-2"><CheckCircle className="w-4 h-4" /> Təsdiqlə</span>
                  </Button>
                  <Button variant="danger" className="flex-1" onClick={() => updateStatus(selectedReq.id, 'rejected')} loading={saving}>
                    <span className="flex items-center justify-center gap-2"><XCircle className="w-4 h-4" /> Rədd et</span>
                  </Button>
                </div>
              </div>
            )}

            {selectedReq.status !== 'pending' && (
              <div className="flex justify-end">
                <Button variant="ghost" onClick={() => setSelectedReq(null)}>Bağla</Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Add Modal */}
      <Modal open={addModal} onClose={() => { setAddModal(false); setError(null) }} title="Məzuniyyət Sorğusu Əlavə Et" size="lg">
        <div className="space-y-4">
          <Select label="Müəllim" value={form.teacher_id} onChange={e => setForm({ ...form, teacher_id: e.target.value })}>
            <option value="">— Müəllim seçin —</option>
            {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
          </Select>
          <Select label="Məzuniyyət növü" value={form.leave_type} onChange={e => setForm({ ...form, leave_type: e.target.value })}>
            {Object.entries(leaveTypes).map(([val, { label }]) => <option key={val} value={val}>{label}</option>)}
          </Select>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Başlama tarixi" type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
            <Input label="Bitmə tarixi" type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} />
          </div>
          <Textarea label="Səbəb" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} rows={3} placeholder="Məzuniyyət səbəbi..." />
          {form.start_date && form.end_date && (
            <p className="text-sm text-purple font-medium">{daysBetween(form.start_date, form.end_date)} gün</p>
          )}
          {error && <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{error}</p>}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => { setAddModal(false); setError(null) }}>{t('cancel')}</Button>
            <Button onClick={handleAdd} loading={saving} disabled={!form.teacher_id || !form.start_date || !form.end_date}>{t('add')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
