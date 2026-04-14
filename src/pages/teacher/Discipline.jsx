import { useState, useEffect } from 'react'
import { Search, Plus, BookOpen, AlertTriangle, Award, FileText } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input, { Textarea, Select } from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Table from '../../components/ui/Table'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import Avatar from '../../components/ui/Avatar'
import StatCard from '../../components/ui/StatCard'

const TYPE_LABELS = {
  warning: 'Xəbərdarlıq',
  detention: 'Qalma',
  suspension: 'Uzaqlaşdırma',
  commendation: 'Təşəkkür',
  note: 'Qeyd',
}

const TYPE_BADGE_CLASSES = {
  warning: 'bg-amber-100 text-amber-800 border border-amber-200',
  detention: 'bg-orange-100 text-orange-800 border border-orange-200',
  suspension: 'bg-red-100 text-red-700 border border-red-200',
  commendation: 'bg-teal-50 text-teal-800 border border-teal-200',
  note: 'bg-gray-100 text-gray-600 border border-gray-200',
}

function TypeBadge({ type }) {
  return (
    <span className={`rounded-full text-xs font-medium px-3 py-0.5 inline-flex items-center ${TYPE_BADGE_CLASSES[type] || TYPE_BADGE_CLASSES.note}`}>
      {TYPE_LABELS[type] || type}
    </span>
  )
}

function getDateRange(filter) {
  const now = new Date()
  if (filter === 'week') {
    const monday = new Date(now)
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
    monday.setHours(0, 0, 0, 0)
    return { from: monday.toISOString().split('T')[0], to: now.toISOString().split('T')[0] }
  }
  if (filter === 'month') {
    const from = new Date(now.getFullYear(), now.getMonth(), 1)
    return { from: from.toISOString().split('T')[0], to: now.toISOString().split('T')[0] }
  }
  return { from: null, to: null }
}

const TODAY = new Date().toISOString().split('T')[0]
const MONTH_START = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]

export default function TeacherDiscipline() {
  const { profile } = useAuth()

  const [loading, setLoading] = useState(true)
  const [records, setRecords] = useState([])
  const [myStudents, setMyStudents] = useState([])
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('month')

  const [addModal, setAddModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [studentSearch, setStudentSearch] = useState('')

  const [form, setForm] = useState({
    student_id: '',
    date: TODAY,
    type: 'warning',
    description: '',
    parent_notified: false,
  })

  useEffect(() => {
    if (profile?.id && profile?.school_id) fetchData()
  }, [profile?.id, profile?.school_id])

  async function fetchData() {
    try {
      setLoading(true)

      // 1. Get teacher's class_ids
      const { data: teacherClassRows, error: tcErr } = await supabase
        .from('teacher_classes')
        .select('class_id')
        .eq('teacher_id', profile.id)
      if (tcErr) throw tcErr

      const classIds = (teacherClassRows || []).map(r => r.class_id)

      if (classIds.length === 0) {
        setMyStudents([])
        setRecords([])
        setLoading(false)
        return
      }

      // 2. Get students in those classes
      const { data: memberRows, error: memErr } = await supabase
        .from('class_members')
        .select('student_id, student:profiles(id, full_name)')
        .in('class_id', classIds)
      if (memErr) throw memErr

      const seen = new Set()
      const students = []
      for (const m of memberRows || []) {
        if (m.student && !seen.has(m.student.id)) {
          seen.add(m.student.id)
          students.push(m.student)
        }
      }
      students.sort((a, b) => a.full_name.localeCompare(b.full_name))
      setMyStudents(students)

      const studentIds = students.map(s => s.id)

      // 3. Get discipline records for those students
      const { data: recs, error: recErr } = await supabase
        .from('discipline_records')
        .select('*, student:profiles!discipline_records_student_id_fkey(id, full_name), recorder:profiles!discipline_records_recorded_by_fkey(id, full_name)')
        .eq('school_id', profile.school_id)
        .in('student_id', studentIds.length ? studentIds : ['00000000-0000-0000-0000-000000000000'])
        .order('date', { ascending: false })
      if (recErr) throw recErr
      setRecords(recs || [])
    } catch (err) {
      console.error(err)
      setError('Məlumat yüklənərkən xəta baş verdi')
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setForm({ student_id: '', date: TODAY, type: 'warning', description: '', parent_notified: false })
    setStudentSearch('')
  }

  async function handleAdd() {
    if (!form.student_id || !form.description.trim()) {
      setError('Şagird və təsvir tələb olunur')
      return
    }
    try {
      setSaving(true)
      setError(null)
      const { error: err } = await supabase.from('discipline_records').insert({
        school_id: profile.school_id,
        student_id: form.student_id,
        recorded_by: profile.id,
        date: form.date,
        type: form.type,
        description: form.description.trim(),
        parent_notified: form.parent_notified,
      })
      if (err) throw err
      setAddModal(false)
      resetForm()
      await fetchData()
    } catch (err) {
      console.error(err)
      setError(err.message || 'Xəta baş verdi')
    } finally {
      setSaving(false)
    }
  }

  const { from: rangeFrom, to: rangeTo } = getDateRange(dateFilter)

  const filtered = records.filter(r => {
    const name = r.student?.full_name?.toLowerCase() || ''
    if (search && !name.includes(search.toLowerCase())) return false
    if (typeFilter !== 'all' && r.type !== typeFilter) return false
    if (rangeFrom && r.date < rangeFrom) return false
    if (rangeTo && r.date > rangeTo) return false
    return true
  })

  const thisMonthRecords = records.filter(r => r.date >= MONTH_START && r.date <= TODAY)
  const statsWarnings = thisMonthRecords.filter(r => r.type === 'warning').length
  const statsSuspensions = thisMonthRecords.filter(r => r.type === 'suspension').length
  const statsCommendations = thisMonthRecords.filter(r => r.type === 'commendation').length
  const statsTotal = records.length

  const filteredStudents = myStudents.filter(s =>
    s.full_name.toLowerCase().includes(studentSearch.toLowerCase())
  )

  const formatDate = (d) => {
    if (!d) return '—'
    const [y, m, day] = d.split('-')
    return `${day}.${m}.${y}`
  }

  const columns = [
    {
      key: 'student',
      label: 'Şagird',
      render: (val) => (
        <div className="flex items-center gap-3">
          <Avatar name={val?.full_name} size="sm" />
          <span className="font-medium text-gray-900">{val?.full_name || '—'}</span>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Növ',
      render: (val) => <TypeBadge type={val} />,
    },
    {
      key: 'date',
      label: 'Tarix',
      render: (val) => <span className="text-gray-600">{formatDate(val)}</span>,
    },
    {
      key: 'description',
      label: 'Təsvir',
      render: (val) => (
        <span className="text-gray-600" title={val}>
          {val && val.length > 60 ? val.slice(0, 60) + '…' : val || '—'}
        </span>
      ),
    },
    {
      key: 'recorder',
      label: 'Qeyd edən',
      render: (val) => <span className="text-gray-500">{val?.full_name || '—'}</span>,
    },
    {
      key: 'parent_notified',
      label: 'Valideyn bildirildi',
      render: (val) => (
        <span className={`text-lg ${val ? 'text-teal' : 'text-gray-300'}`}>
          {val ? '✓' : '✗'}
        </span>
      ),
    },
  ]

  if (loading) return <PageSpinner />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-serif text-3xl text-gray-900">İntizam Jurnalı</h1>
        <Button onClick={() => { resetForm(); setAddModal(true) }} disabled={myStudents.length === 0}>
          <span className="flex items-center gap-2"><Plus className="w-4 h-4" /> Qeyd əlavə et</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Xəbərdarlıq (bu ay)" value={statsWarnings} icon={AlertTriangle} />
        <StatCard label="Uzaqlaşdırma (bu ay)" value={statsSuspensions} icon={AlertTriangle} />
        <StatCard label="Təşəkkür (bu ay)" value={statsCommendations} icon={Award} />
        <StatCard label="Cəmi qeydlər" value={statsTotal} icon={FileText} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Şagird adı ilə axtar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-border-soft rounded-md pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple focus:border-transparent"
          />
        </div>
        <div className="w-44">
          <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">Bütün növlər</option>
            {Object.entries(TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>
        </div>
        <div className="w-44">
          <Select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
            <option value="week">Bu həftə</option>
            <option value="month">Bu ay</option>
            <option value="all">Bütün vaxt</option>
          </Select>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Table */}
      <Card hover={false} className="p-0 overflow-hidden">
        {myStudents.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Sinif tapılmadı"
            description="Sizə təyin edilmiş sinif yoxdur"
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Qeyd tapılmadı"
            description="Filtrə uyğun intizam qeydi yoxdur"
            actionLabel="Qeyd əlavə et"
            onAction={() => { resetForm(); setAddModal(true) }}
          />
        ) : (
          <Table columns={columns} data={filtered} />
        )}
      </Card>

      {/* Add Modal */}
      <Modal open={addModal} onClose={() => { setAddModal(false); resetForm() }} title="Qeyd əlavə et" size="md">
        <div className="space-y-4">
          {/* Student picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Şagird</label>
            <div className="border border-border-soft rounded-md overflow-hidden">
              <div className="p-2 border-b border-border-soft">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Axtar..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-sm focus:outline-none"
                  />
                </div>
              </div>
              <div className="max-h-40 overflow-y-auto">
                {filteredStudents.length === 0 && (
                  <p className="text-center py-4 text-xs text-gray-400">Şagird tapılmadı</p>
                )}
                {filteredStudents.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, student_id: s.id }))}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-surface transition-colors ${form.student_id === s.id ? 'bg-purple-light text-purple' : 'text-gray-700'}`}
                  >
                    <Avatar name={s.full_name} size="sm" />
                    {s.full_name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Input
            label="Tarix"
            type="date"
            value={form.date}
            onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
          />

          <Select
            label="Növ"
            value={form.type}
            onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}
          >
            {Object.entries(TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>

          <Textarea
            label="Təsvir"
            value={form.description}
            onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
            rows={3}
            placeholder="İntizam hadisəsini təsvir edin..."
          />

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.parent_notified}
              onChange={(e) => setForm(f => ({ ...f, parent_notified: e.target.checked }))}
              className="w-4 h-4 rounded border-border-soft accent-purple"
            />
            <span className="text-sm text-gray-700">Valideyn bildirildi</span>
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => { setAddModal(false); resetForm() }}>Ləğv et</Button>
            <Button onClick={handleAdd} loading={saving}>Əlavə et</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
