import { useState, useEffect } from 'react'
import { Search, Plus, BookOpen, ChevronLeft, TrendingUp, Activity, Heart } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import Table from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import { PageSpinner } from '../../components/ui/Spinner'
import { fmtNumeric } from '../../lib/dateUtils'
import EmptyState from '../../components/ui/EmptyState'
import Avatar from '../../components/ui/Avatar'
import Input from '../../components/ui/Input'
import { Textarea, Select } from '../../components/ui/Input'

const TARGET_HOURS = 50

function casStatus(c, a, s) {
  const total = c + a + s
  if (total >= TARGET_HOURS && c >= 10 && a >= 10 && s >= 10) return 'complete'
  if (total >= TARGET_HOURS * 0.6) return 'on_track'
  return 'at_risk'
}

const statusStyles = {
  complete: 'bg-teal-light text-[#085041] border border-teal-mid',
  on_track: 'bg-purple-light text-purple-dark border border-[#AFA9EC]',
  at_risk: 'bg-red-50 text-red-700 border border-red-200',
}
const statusLabels = { complete: 'Tamamlandı', on_track: 'Yolundadır', at_risk: 'Risk altında' }

export default function CAS() {
  const { profile, t } = useAuth()
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState([])
  const [search, setSearch] = useState('')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [entries, setEntries] = useState([])
  const [entriesLoading, setEntriesLoading] = useState(false)
  const [addModal, setAddModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({ student_id: '', type: 'creativity', hours: '', description: '', date: '' })

  useEffect(() => {
    if (profile?.school_id) fetchStudents()
  }, [profile?.school_id])

  async function fetchStudents() {
    try {
      setLoading(true)
      const { data: studentsData, error: sErr } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('school_id', profile.school_id)
        .eq('role', 'student')
        .order('full_name')

      if (sErr) throw sErr

      // Try to fetch CAS entries — table may not exist yet
      let casMap = {}
      try {
        const { data: casData } = await supabase
          .from('cas_entries')
          .select('student_id, type, hours')
          .in('student_id', (studentsData || []).map(s => s.id))

        ;(casData || []).forEach(entry => {
          if (!casMap[entry.student_id]) casMap[entry.student_id] = { creativity: 0, activity: 0, service: 0 }
          casMap[entry.student_id][entry.type] = (casMap[entry.student_id][entry.type] || 0) + (entry.hours || 0)
        })
      } catch {
        // cas_entries table doesn't exist yet — use zeroes
      }

      const withHours = (studentsData || []).map(s => ({
        ...s,
        creativity: casMap[s.id]?.creativity || 0,
        activity: casMap[s.id]?.activity || 0,
        service: casMap[s.id]?.service || 0,
      }))

      setStudents(withHours)
    } catch (err) {
      console.error(err)
      setError(t('error'))
    } finally {
      setLoading(false)
    }
  }

  async function fetchEntries(studentId) {
    setEntriesLoading(true)
    try {
      const { data } = await supabase
        .from('cas_entries')
        .select('*')
        .eq('student_id', studentId)
        .order('date', { ascending: false })
      setEntries(data || [])
    } catch {
      setEntries([])
    } finally {
      setEntriesLoading(false)
    }
  }

  function openStudent(student) {
    setSelectedStudent(student)
    fetchEntries(student.id)
  }

  async function handleAdd() {
    try {
      setSaving(true)
      setError(null)
      const hours = parseFloat(form.hours)
      if (isNaN(hours) || hours <= 0) {
        setError('Saat sayı müsbət rəqəm olmalıdır')
        setSaving(false)
        return
      }
      const { error: err } = await supabase.from('cas_entries').insert({
        student_id: form.student_id,
        type: form.type,
        hours,
        description: form.description,
        date: form.date,
        school_id: profile.school_id,
      })
      if (err) throw err
      setAddModal(false)
      setForm({ student_id: '', type: 'creativity', hours: '', description: '', date: '' })
      await fetchStudents()
      if (selectedStudent) fetchEntries(selectedStudent.id)
    } catch (err) {
      setError(err.message || t('error'))
    } finally {
      setSaving(false)
    }
  }

  const filtered = students.filter(s =>
    s.full_name?.toLowerCase().includes(search.toLowerCase())
  )

  const columns = [
    {
      key: 'full_name',
      label: 'Şagird',
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <Avatar name={val} size="sm" />
          <span className="font-medium text-gray-900">{val}</span>
        </div>
      ),
    },
    {
      key: 'creativity',
      label: <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-purple" /> Yaradıcılıq</span>,
      render: (val) => <span className="font-medium">{val}s</span>,
    },
    {
      key: 'activity',
      label: <span className="flex items-center gap-1"><Activity className="w-3.5 h-3.5 text-teal" /> Fəaliyyət</span>,
      render: (val) => <span className="font-medium">{val}s</span>,
    },
    {
      key: 'service',
      label: <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-red-400" /> Xidmət</span>,
      render: (val) => <span className="font-medium">{val}s</span>,
    },
    {
      key: 'total',
      label: 'Cəmi',
      render: (_, row) => {
        const total = row.creativity + row.activity + row.service
        return (
          <div className="flex items-center gap-2">
            <div className="w-20 bg-gray-100 rounded-full h-2">
              <div
                className="bg-purple h-2 rounded-full"
                style={{ width: `${Math.min(100, (total / TARGET_HOURS) * 100)}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">{total}/{TARGET_HOURS}s</span>
          </div>
        )
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (_, row) => {
        const st = casStatus(row.creativity, row.activity, row.service)
        return (
          <span className={`rounded-full text-xs font-medium px-3 py-0.5 inline-flex items-center ${statusStyles[st]}`}>
            {statusLabels[st]}
          </span>
        )
      },
    },
  ]

  const entryColumns = [
    {
      key: 'date',
      label: 'Tarix',
      render: (val) => val ? fmtNumeric(val) : '—',
    },
    {
      key: 'type',
      label: 'Növ',
      render: (val) => {
        const labels = { creativity: 'Yaradıcılıq', activity: 'Fəaliyyət', service: 'Xidmət' }
        const colors = { creativity: 'bg-purple-light text-purple-dark', activity: 'bg-teal-light text-[#085041]', service: 'bg-red-50 text-red-700' }
        return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors[val] || ''}`}>{labels[val] || val}</span>
      },
    },
    { key: 'hours', label: 'Saat', render: (val) => `${val}s` },
    { key: 'description', label: 'Açıqlama', render: (val) => <span className="text-gray-600">{val}</span> },
  ]

  if (loading) return <PageSpinner />

  if (selectedStudent) {
    const total = selectedStudent.creativity + selectedStudent.activity + selectedStudent.service
    const st = casStatus(selectedStudent.creativity, selectedStudent.activity, selectedStudent.service)
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setSelectedStudent(null)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Geri
          </button>
          <h1 className="font-serif text-3xl text-gray-900">{selectedStudent.full_name} — CAS Jurnalı</h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Yaradıcılıq', val: selectedStudent.creativity, color: 'text-purple', bg: 'bg-purple-light' },
            { label: 'Fəaliyyət', val: selectedStudent.activity, color: 'text-teal', bg: 'bg-teal-light' },
            { label: 'Xidmət', val: selectedStudent.service, color: 'text-red-500', bg: 'bg-red-50' },
            { label: 'Cəmi', val: total, color: 'text-gray-900', bg: 'bg-surface' },
          ].map(({ label, val, color, bg }) => (
            <Card key={label} hover={false} className={`p-5 ${bg}`}>
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{val}s</p>
            </Card>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <span className={`rounded-full text-sm font-medium px-4 py-1 ${statusStyles[st]}`}>{statusLabels[st]}</span>
          <Button onClick={() => { setForm(f => ({ ...f, student_id: selectedStudent.id })); setAddModal(true) }}>
            <span className="flex items-center gap-2"><Plus className="w-4 h-4" /> Giriş əlavə et</span>
          </Button>
        </div>

        <Card hover={false} className="p-0 overflow-hidden">
          {entriesLoading ? <PageSpinner /> : (
            entries.length === 0 ? (
              <EmptyState icon={BookOpen} title="CAS girişi yoxdur" description="Bu şagird hələ CAS fəaliyyəti qeyd etməyib." actionLabel="Giriş əlavə et" onAction={() => { setForm(f => ({ ...f, student_id: selectedStudent.id })); setAddModal(true) }} />
            ) : (
              <Table columns={entryColumns} data={entries} />
            )
          )}
        </Card>

        <Modal open={addModal} onClose={() => { setAddModal(false); setError(null) }} title="CAS Girişi Əlavə Et">
          <div className="space-y-4">
            <Select label="Növ" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              <option value="creativity">Yaradıcılıq</option>
              <option value="activity">Fəaliyyət</option>
              <option value="service">Xidmət</option>
            </Select>
            <Input label="Saat sayı" type="number" min="0.5" step="0.5" value={form.hours} onChange={e => setForm({ ...form, hours: e.target.value })} placeholder="5" />
            <Input label="Tarix" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            <Textarea label="Açıqlama" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Bu fəaliyyət haqqında..." />
            {error && <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{error}</p>}
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="ghost" onClick={() => { setAddModal(false); setError(null) }}>{t('cancel')}</Button>
              <Button onClick={handleAdd} loading={saving} disabled={!form.hours || !form.date}>{t('add')}</Button>
            </div>
          </div>
        </Modal>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-3xl text-gray-900">CAS Tracker</h1>
          <p className="text-sm text-gray-500 mt-1">Creativity · Activity · Service — IB DP tələbi: {TARGET_HOURS} saat</p>
        </div>
        <Button onClick={() => { setForm({ student_id: '', type: 'creativity', hours: '', description: '', date: '' }); setAddModal(true) }}>
          <span className="flex items-center gap-2"><Plus className="w-4 h-4" /> Giriş əlavə et</span>
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
          <EmptyState icon={BookOpen} title="Şagird tapılmadı" description="CAS izləmə üçün şagird qeydiyyatı tələb olunur." />
        ) : (
          <Table columns={columns} data={filtered} onRowClick={openStudent} />
        )}
      </Card>

      <Modal open={addModal} onClose={() => { setAddModal(false); setError(null) }} title="CAS Girişi Əlavə Et">
        <div className="space-y-4">
          <Select label="Şagird" value={form.student_id} onChange={e => setForm({ ...form, student_id: e.target.value })}>
            <option value="">— Şagird seçin —</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
          </Select>
          <Select label="Növ" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
            <option value="creativity">Yaradıcılıq</option>
            <option value="activity">Fəaliyyət</option>
            <option value="service">Xidmət</option>
          </Select>
          <Input label="Saat sayı" type="number" min="0.5" step="0.5" value={form.hours} onChange={e => setForm({ ...form, hours: e.target.value })} placeholder="5" />
          <Input label="Tarix" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          <Textarea label="Açıqlama" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Bu fəaliyyət haqqında..." />
          {error && <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{error}</p>}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => { setAddModal(false); setError(null) }}>{t('cancel')}</Button>
            <Button onClick={handleAdd} loading={saving} disabled={!form.student_id || !form.hours || !form.date}>{t('add')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
