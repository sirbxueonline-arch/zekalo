import { useState, useEffect } from 'react'
import { Search, Plus, GraduationCap, Edit2, Trash2, ExternalLink } from 'lucide-react'
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
import { Select, Textarea } from '../../components/ui/Input'

const appStatusConfig = {
  researching: { label: 'Araşdırma', className: 'bg-surface text-gray-600 border border-border-soft' },
  drafting: { label: 'Sənədlər hazırlanır', className: 'bg-[#faeeda] text-[#633806] border border-[#EF9F27]' },
  submitted: { label: 'Göndərildi', className: 'bg-purple-light text-purple-dark border border-[#AFA9EC]' },
  accepted: { label: 'Qəbul edildi', className: 'bg-teal-light text-[#085041] border border-teal-mid' },
  rejected: { label: 'Rədd edildi', className: 'bg-red-50 text-red-700 border border-red-200' },
  waitlisted: { label: 'Gözleme siyahısı', className: 'bg-blue-50 text-blue-700 border border-blue-200' },
}

const DEMO_DATA = [
  {
    id: 'cc1',
    student_name: 'Aynur Quliyeva',
    universities: [
      { name: 'UCL', status: 'submitted' },
      { name: 'KCL', status: 'accepted' },
      { name: 'Edinburgh', status: 'drafting' },
    ],
    deadline: '2027-01-15',
    counselor_notes: 'Güclü şəxsi bəyanatı var.',
  },
  {
    id: 'cc2',
    student_name: 'Tural Həsənov',
    universities: [
      { name: 'TU Delft', status: 'submitted' },
      { name: 'ETH Zürich', status: 'researching' },
    ],
    deadline: '2027-02-01',
    counselor_notes: 'Müsahibəyə hazırlıq lazımdır.',
  },
]

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
      setApplications(formatted.length > 0 ? formatted : DEMO_DATA)
      setStudents(studentRes.data || [])
    } catch {
      setApplications(DEMO_DATA)
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

  const UniversityFields = () => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Universitetlər</label>
      {form.universities.map((uni, idx) => (
        <div key={idx} className="flex gap-2 items-center">
          <input
            value={uni.name}
            onChange={e => updateUniversity(idx, 'name', e.target.value)}
            placeholder={`Universitet ${idx + 1}`}
            className="flex-1 border border-border-soft rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple focus:border-transparent"
          />
          <select
            value={uni.status}
            onChange={e => updateUniversity(idx, 'status', e.target.value)}
            className="border border-border-soft rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple bg-white"
          >
            {Object.entries(appStatusConfig).map(([val, { label }]) => <option key={val} value={val}>{label}</option>)}
          </select>
          {form.universities.length > 1 && (
            <button type="button" onClick={() => removeUniversity(idx)} className="text-red-400 hover:text-red-600 p-1">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
      <button type="button" onClick={addUniversity} className="text-sm text-purple hover:underline flex items-center gap-1 mt-1">
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
          <span className="font-medium text-gray-900">{val}</span>
        </div>
      ),
    },
    {
      key: 'universities',
      label: 'Universitetlər',
      render: (val) => (
        <div className="flex flex-wrap gap-1">
          {(val || []).slice(0, 4).map((u, i) => {
            const cfg = appStatusConfig[u.status] || appStatusConfig.researching
            return (
              <span key={i} className={`rounded-full text-xs font-medium px-2 py-0.5 ${cfg.className}`}>
                {u.name}
              </span>
            )
          })}
          {(val || []).length > 4 && <span className="text-xs text-gray-400">+{val.length - 4}</span>}
        </div>
      ),
    },
    {
      key: 'deadline',
      label: 'Son müraciət tarixi',
      render: (val) => val ? new Date(val).toLocaleDateString('az-AZ') : '—',
    },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          <button onClick={() => openEdit(row)} className="p-1.5 text-gray-400 hover:text-purple transition-colors">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={() => setDeleteModal(row)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  if (loading) return <PageSpinner />

  const acceptedCount = applications.reduce((sum, a) => sum + (a.universities || []).filter(u => u.status === 'accepted').length, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-3xl text-gray-900">Kollec Məsləhəti</h1>
          <p className="text-sm text-gray-500 mt-1">
            {applications.length} şagird · {applications.reduce((s, a) => s + (a.universities || []).length, 0)} müraciət · {acceptedCount} qəbul
          </p>
        </div>
        <Button onClick={() => { resetForm(); setAddModal(true) }}>
          <span className="flex items-center gap-2"><Plus className="w-4 h-4" /> Şagird əlavə et</span>
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Şagird axtar..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border border-border-soft rounded-md pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple focus:border-transparent"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Card hover={false} className="p-0 overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={GraduationCap} title="Şagird tapılmadı" description="Kollec müraciət prosesinə başlamaq üçün şagird əlavə edin." actionLabel="Şagird əlavə et" onAction={() => { resetForm(); setAddModal(true) }} />
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
          {error && <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{error}</p>}
          <div className="flex justify-end gap-3 pt-4">
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
          {error && <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{error}</p>}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => { setEditModal(null); setError(null) }}>{t('cancel')}</Button>
            <Button onClick={handleEdit} loading={saving}>{t('save')}</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title={t('delete')} size="sm">
        <p className="text-sm text-gray-600 mb-6">
          <strong>{deleteModal?.student_name}</strong> adlı şagirdin müraciət məlumatlarını silmək istədiyinizə əminsiniz?
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeleteModal(null)}>{t('cancel')}</Button>
          <Button variant="danger" onClick={handleDelete} loading={saving}>{t('delete')}</Button>
        </div>
      </Modal>
    </div>
  )
}
