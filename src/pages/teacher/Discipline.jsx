import { useState, useEffect } from 'react'
import { Search, Plus, BookOpen, AlertTriangle, Award, FileText, X, AlertCircle, Check } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import StatCard from '../../components/ui/StatCard'
import Modal from '../../components/ui/Modal'
import Badge from '../../components/ui/Badge'

const TYPE_LABELS = {
  warning:      'Xəbərdarlıq',
  detention:    'Qalma',
  suspension:   'Uzaqlaşdırma',
  commendation: 'Təşəkkür',
  note:         'Qeyd',
}

// Map discipline types to Badge variant
const TYPE_VARIANT = {
  warning:      'warning',
  detention:    'warning',
  suspension:   'error',
  commendation: 'success',
  note:         'neutral',
}

// Left-border accent per type — semantic token colors
const TYPE_ROW_BORDER = {
  warning:      '#F59E0B',
  detention:    '#F59E0B',
  suspension:   '#EF4444',
  commendation: 'var(--mint)',
  note:         'var(--hairline-strong)',
}

function TypeBadge({ type }) {
  return <Badge variant={TYPE_VARIANT[type] || 'neutral'}>{TYPE_LABELS[type] || type}</Badge>
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

  const thisMonthRecords   = records.filter(r => r.date >= MONTH_START && r.date <= TODAY)
  const statsWarnings      = thisMonthRecords.filter(r => r.type === 'warning').length
  const statsSuspensions   = thisMonthRecords.filter(r => r.type === 'suspension').length
  const statsCommendations = thisMonthRecords.filter(r => r.type === 'commendation').length
  const statsTotal         = records.length

  const filteredStudents = myStudents.filter(s =>
    s.full_name.toLowerCase().includes(studentSearch.toLowerCase())
  )

  const formatDate = (d) => {
    if (!d) return '—'
    const [y, m, day] = d.split('-')
    return `${day}.${m}.${y}`
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="pastel-skeleton h-10 w-64 rounded-tile" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0,1,2,3].map(i => <div key={i} className="pastel-skeleton h-24 rounded-card" />)}
        </div>
        <div className="pastel-skeleton h-96 rounded-tile" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* ── Page header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-ink-900 tracking-tight leading-tight">
            İntizam Jurnalı
          </h1>
          <p className="text-sm mt-1 text-ink-400">
            Sinif intizam qeydlərini izləyin
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          disabled={myStudents.length === 0}
          onClick={() => { resetForm(); setAddModal(true) }}
        >
          <Plus className="w-4 h-4" /> Qeyd əlavə et
        </Button>
      </div>

      {/* ── KPI strip ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Xəbərdarlıq (bu ay)"  value={statsWarnings}      icon={AlertTriangle} tone="periwinkle" />
        <StatCard label="Uzaqlaşdırma (bu ay)" value={statsSuspensions}   icon={AlertTriangle} tone="periwinkle" />
        <StatCard label="Təşəkkür (bu ay)"      value={statsCommendations} icon={Award}         tone="periwinkle" />
        <StatCard label="Cəmi qeydlər"          value={statsTotal}         icon={FileText}      tone="periwinkle" />
      </div>

      {/* ── Filters toolbar ── */}
      <div className="liquid-card p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Şagird adı ilə axtar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pastel-input"
              style={{ paddingLeft: 36 }}
            />
          </div>
          <div className="w-44">
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="pastel-input"
            >
              <option value="all">Bütün növlər</option>
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div className="w-44">
            <select
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="pastel-input"
            >
              <option value="week">Bu həftə</option>
              <option value="month">Bu ay</option>
              <option value="all">Bütün vaxt</option>
            </select>
          </div>
        </div>
      </div>

      {/* Global error banner */}
      {error && (
        <p className="text-sm flex items-center gap-1.5 text-danger">
          <AlertCircle className="w-4 h-4" /> {error}
        </p>
      )}

      {/* ── Records table ── */}
      <div className="bg-surface rounded-tile border border-hairline overflow-hidden">
        {myStudents.length === 0 ? (
          <EmptyState
            tier={1}
            icon={BookOpen}
            title="Sinif tapılmadı"
            description="Sizə təyin edilmiş sinif yoxdur."
            className="border-0 shadow-none"
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            tier={1}
            icon={FileText}
            title="Qeyd tapılmadı"
            description="Filtrə uyğun intizam qeydi yoxdur."
            actionLabel="Qeyd əlavə et"
            onAction={() => { resetForm(); setAddModal(true) }}
            className="border-0 shadow-none"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="pastel-table">
              <thead>
                <tr>
                  <th>Şagird</th>
                  <th>Növ</th>
                  <th>Tarix</th>
                  <th>Təsvir</th>
                  <th>Qeyd edən</th>
                  <th>Valideyn bildirildi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr
                    key={r.id}
                    style={{ borderLeft: `3px solid ${TYPE_ROW_BORDER[r.type] || 'transparent'}` }}
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar name={r.student?.full_name} size="sm" />
                        <span className="font-semibold text-ink-900">{r.student?.full_name || '—'}</span>
                      </div>
                    </td>
                    <td><TypeBadge type={r.type} /></td>
                    <td className="tabular-nums text-ink-600 whitespace-nowrap">{formatDate(r.date)}</td>
                    <td className="text-ink-600 max-w-[280px]" title={r.description}>
                      {r.description && r.description.length > 60
                        ? r.description.slice(0, 60) + '…'
                        : r.description || '—'}
                    </td>
                    <td className="text-ink-400">{r.recorder?.full_name || '—'}</td>
                    <td>
                      {r.parent_notified
                        ? <Badge variant="success"><Check className="w-3 h-3" /></Badge>
                        : <Badge variant="neutral">—</Badge>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Add Record Modal ── */}
      <Modal
        open={addModal}
        onClose={() => { setAddModal(false); resetForm() }}
        title="Qeyd əlavə et"
        size="md"
      >
        <div className="space-y-4">
          {/* Student picker */}
          <div>
            <label className="block text-[13px] font-semibold mb-1.5 text-ink-400 uppercase tracking-[0.04em]">Şagird</label>
            <div
              className="rounded-tile overflow-hidden"
              style={{ border: '1px solid var(--hairline-strong)' }}
            >
              {/* Search within picker */}
              <div className="p-2" style={{ borderBottom: '1px solid var(--hairline)' }}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Axtar..."
                    value={studentSearch}
                    onChange={e => setStudentSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-sm bg-transparent outline-none text-ink-900"
                  />
                </div>
              </div>
              <div className="max-h-44 overflow-y-auto">
                {filteredStudents.length === 0 && (
                  <p className="text-center py-4 text-xs text-ink-400">Şagird tapılmadı</p>
                )}
                {filteredStudents.map(s => {
                  const isSelected = form.student_id === s.id
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, student_id: s.id }))}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left smooth-trans"
                      style={{
                        background: isSelected ? 'var(--brand-50)' : 'transparent',
                        color: isSelected ? 'var(--brand-700)' : 'var(--ink-900)',
                        fontWeight: isSelected ? 600 : 400,
                        borderLeft: isSelected ? '3px solid var(--brand-500)' : '3px solid transparent',
                      }}
                    >
                      <Avatar name={s.full_name} size="sm" />
                      {s.full_name}
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 ml-auto text-brand-500" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-semibold mb-1.5 text-ink-400 uppercase tracking-[0.04em]">Tarix</label>
            <input
              type="date"
              className="pastel-input"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold mb-1.5 text-ink-400 uppercase tracking-[0.04em]">Növ</label>
            <select
              className="pastel-input"
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
            >
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[13px] font-semibold mb-1.5 text-ink-400 uppercase tracking-[0.04em]">Təsvir</label>
            <textarea
              className="pastel-input"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              placeholder="İntizam hadisəsini təsvir edin..."
            />
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={form.parent_notified}
              onChange={e => setForm(f => ({ ...f, parent_notified: e.target.checked }))}
              className="w-4 h-4 rounded"
              style={{ accentColor: 'var(--brand-500)' }}
            />
            <span className="text-sm text-ink-900 group-hover:text-ink-700">Valideyn bildirildi</span>
          </label>

          {error && (
            <p className="text-sm flex items-center gap-1.5 text-danger">
              <AlertCircle className="w-4 h-4" /> {error}
            </p>
          )}

          <div
            className="flex justify-end gap-2 pt-3"
            style={{ borderTop: '1px solid var(--hairline)' }}
          >
            <Button variant="ghost" size="sm" onClick={() => { setAddModal(false); resetForm() }}>
              Ləğv et
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={saving}
              disabled={saving}
              onClick={handleAdd}
            >
              Əlavə et
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
