import { useState, useEffect } from 'react'
import { BookOpen, Plus, Edit2, Download, FileText } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import { Select } from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Table from '../../components/ui/Table'
import StatCard from '../../components/ui/StatCard'
import { PageSpinner } from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'


function escapeCsvField(val) {
  if (val == null) return ''
  const str = String(val)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"'
  }
  return str
}

export default function IBPanel() {
  const { profile, t } = useAuth()

  if (profile?.school?.edition !== 'ib') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <BookOpen className="w-12 h-12 text-purple-mid mb-4" />
        <h2 className="font-serif text-2xl text-gray-900 mb-2">{t('ib_panel')}</h2>
        <p className="text-sm text-gray-500">Bu bolma yalniz IB maktablari ucundur</p>
      </div>
    )
  }

  return <IBPanelContent />
}

function IBPanelContent() {
  const { profile, t } = useAuth()
  const [loading, setLoading] = useState(true)
  const [mypCount, setMypCount] = useState(0)
  const [dpCount, setDpCount] = useState(0)
  const [essays, setEssays] = useState([])
  const [teachers, setTeachers] = useState([])
  const [students, setStudents] = useState([])
  const [essayModal, setEssayModal] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({ student_id: '', topic: '', supervisor_id: '', status: 'draft', submitted_date: '' })

  useEffect(() => {
    if (profile?.school_id) fetchData()
  }, [profile?.school_id])

  async function fetchData() {
    try {
      setLoading(true)
      const [mypRes, dpRes, essaysRes, teachersRes, studentsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('school_id', profile.school_id).eq('role', 'student').eq('ib_programme', 'MYP'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('school_id', profile.school_id).eq('role', 'student').eq('ib_programme', 'DP'),
        supabase.from('ib_extended_essays').select('*, student:profiles!ib_extended_essays_student_id_fkey(full_name), supervisor:profiles!ib_extended_essays_supervisor_id_fkey(full_name)').eq('school_id', profile.school_id).order('created_at', { ascending: false }),
        supabase.from('profiles').select('id, full_name').eq('school_id', profile.school_id).eq('role', 'teacher').order('full_name'),
        supabase.from('profiles').select('id, full_name').eq('school_id', profile.school_id).eq('role', 'student').order('full_name'),
      ])
      setMypCount(mypRes.count || 0)
      setDpCount(dpRes.count || 0)
      setEssays(essaysRes.data || [])
      setTeachers(teachersRes.data || [])
      setStudents(studentsRes.data || [])
    } catch {
      setError(t('error'))
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setForm({ student_id: '', topic: '', supervisor_id: '', status: 'draft', submitted_date: '' })
  }

  function openEditEssay(essay) {
    setForm({
      student_id: essay.student_id || '',
      topic: essay.topic || '',
      supervisor_id: essay.supervisor_id || '',
      status: essay.status || 'draft',
      submitted_date: essay.submitted_date || '',
    })
    setEssayModal(essay)
  }

  async function handleSaveEssay() {
    try {
      setSaving(true)
      setError(null)
      const payload = {
        school_id: profile.school_id,
        student_id: form.student_id || null,
        topic: form.topic,
        supervisor_id: form.supervisor_id || null,
        status: form.status,
        submitted_date: form.submitted_date || null,
      }

      if (essayModal?.id) {
        const { error: err } = await supabase.from('ib_extended_essays').update(payload).eq('id', essayModal.id).eq('school_id', profile.school_id)
        if (err) throw err
      } else {
        const { error: err } = await supabase.from('ib_extended_essays').insert(payload)
        if (err) throw err
      }

      setEssayModal(null)
      resetForm()
      await fetchData()
    } catch {
      setError(t('error'))
    } finally {
      setSaving(false)
    }
  }

  function exportIBReport() {
    const headers = [t('students'), t('subject'), 'Supervisor', 'Status', t('date')]
    const rows = essays.map(e => [
      e.student?.full_name || '',
      e.topic || '',
      e.supervisor?.full_name || '',
      e.status || '',
      e.submitted_date || '',
    ])
    const csv = [headers.map(escapeCsvField).join(','), ...rows.map(r => r.map(escapeCsvField).join(','))].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ib_report.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  function exportCEESA() {
    const headers = ['Student Name', 'Topic', 'Supervisor', 'Status', 'Submitted Date']
    const rows = essays.map(e => [
      e.student?.full_name || '',
      e.topic || '',
      e.supervisor?.full_name || '',
      e.status || '',
      e.submitted_date || '',
    ])
    const csv = [headers.map(escapeCsvField).join(','), ...rows.map(r => r.map(escapeCsvField).join(','))].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ceesa_export.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`
  }

  const statusLabels = {
    not_started: 'Başlanmayıb',
    draft: 'Qaralama',
    in_progress: 'Davam edir',
    submitted: 'Təslim edildi',
    graded: 'Qiymətləndirilib',
  }
  const statusVariants = {
    not_started: 'absent',
    draft: 'late',
    in_progress: 'default',
    submitted: 'present',
    graded: 'excellent',
  }

  const columns = [
    { key: 'student', label: t('students'), render: (val) => val?.full_name || '—' },
    { key: 'topic', label: t('subject'), render: (val) => <span className="font-medium text-gray-900">{val || '—'}</span> },
    { key: 'supervisor', label: 'Supervisor', render: (val) => val?.full_name || '—' },
    { key: 'status', label: 'Status', render: (val) => <Badge variant={statusVariants[val] || 'default'}>{statusLabels[val] || val}</Badge> },
    { key: 'submitted_date', label: t('date'), render: (val) => formatDate(val) },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <button onClick={() => openEditEssay(row)} className="p-1.5 text-gray-400 hover:text-purple transition-colors">
          <Edit2 className="w-4 h-4" />
        </button>
      ),
    },
  ]

  if (loading) return <PageSpinner />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl text-gray-900">{t('ib_panel')}</h1>
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={exportIBReport}>
            <span className="flex items-center gap-2"><FileText className="w-4 h-4" /> IB {t('reports')}</span>
          </Button>
          <Button variant="ghost" onClick={exportCEESA}>
            <span className="flex items-center gap-2"><Download className="w-4 h-4" /> CEESA {t('export_csv')}</span>
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div>
        <p className="text-xs tracking-widest text-gray-400 uppercase mb-3">{t('ib_panel')}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard label={`MYP ${t('students')}`} value={mypCount} icon={BookOpen} />
          <StatCard label={`DP ${t('students')}`} value={dpCount} icon={BookOpen} />
        </div>
      </div>

      <Card hover={false}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-xl text-gray-900">Extended Essay</h2>
          <Button onClick={() => { resetForm(); setEssayModal({}) }}>
            <span className="flex items-center gap-2"><Plus className="w-4 h-4" /> {t('add')}</span>
          </Button>
        </div>
        <Table columns={columns} data={essays} emptyMessage={t('no_data')} />
      </Card>

      <Modal open={!!essayModal} onClose={() => { setEssayModal(null); resetForm(); setError(null) }} title={essayModal?.id ? t('edit') : t('add')}>
        <div className="space-y-4">
          <Select label={t('students')} value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })}>
            <option value="">{t('students')}</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
          </Select>
          <Input label={t('subject')} value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} placeholder="Extended essay movzusu" />
          <Select label="Supervisor" value={form.supervisor_id} onChange={(e) => setForm({ ...form, supervisor_id: e.target.value })}>
            <option value="">Supervisor</option>
            {teachers.map(tc => <option key={tc.id} value={tc.id}>{tc.full_name}</option>)}
          </Select>
          <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="not_started">Başlanmayıb</option>
            <option value="draft">Qaralama</option>
            <option value="in_progress">Davam edir</option>
            <option value="submitted">Təslim edildi</option>
            <option value="graded">Qiymətləndirilib</option>
          </Select>
          <Input label={t('date')} type="date" value={form.submitted_date} onChange={(e) => setForm({ ...form, submitted_date: e.target.value })} />
          {error && <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{error}</p>}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => { setEssayModal(null); resetForm(); setError(null) }}>{t('cancel')}</Button>
            <Button onClick={handleSaveEssay} loading={saving}>{t('save')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
