import { useState, useEffect } from 'react'
import { Search, Plus, BookOpen, AlertTriangle, Award, FileText, X, AlertCircle, Check } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Avatar from '../../components/ui/Avatar'

const TYPE_LABELS = {
  warning: 'Xəbərdarlıq',
  detention: 'Qalma',
  suspension: 'Uzaqlaşdırma',
  commendation: 'Təşəkkür',
  note: 'Qeyd',
}

const TYPE_BADGE = {
  warning:      'pastel-badge pastel-badge-peach',
  detention:    'pastel-badge pastel-badge-peach',
  suspension:   'pastel-badge pastel-badge-rose',
  commendation: 'pastel-badge pastel-badge-mint',
  note:         'pastel-badge pastel-badge-slate',
}

function TypeBadge({ type }) {
  return <span className={TYPE_BADGE[type] || TYPE_BADGE.note}>{TYPE_LABELS[type] || type}</span>
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

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="pastel-skeleton h-12 w-72" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0,1,2,3].map(i => <div key={i} className="pastel-skeleton h-24" />)}
        </div>
        <div className="pastel-skeleton h-96" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: '#1a1a2e' }}>
          <span className="pastel-text">İntizam Jurnalı</span>
        </h1>
        <button
          onClick={() => { resetForm(); setAddModal(true) }}
          disabled={myStudents.length === 0}
          className="btn-pastel"
          style={{ padding: '12px 22px', fontSize: 13, opacity: myStudents.length === 0 ? 0.5 : 1 }}
        >
          <Plus className="w-4 h-4" /> Qeyd əlavə et
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Xəbərdarlıq (bu ay)', value: statsWarnings, icon: AlertTriangle, chip: 'icon-chip-peach' },
          { label: 'Uzaqlaşdırma (bu ay)', value: statsSuspensions, icon: AlertTriangle, chip: 'icon-chip-peach' },
          { label: 'Təşəkkür (bu ay)', value: statsCommendations, icon: Award, chip: 'icon-chip-mint' },
          { label: 'Cəmi qeydlər', value: statsTotal, icon: FileText, chip: 'icon-chip-periwinkle' },
        ].map((s, i) => (
          <div key={i} className="liquid-card p-4 flex items-start gap-3">
            <span className={`icon-chip ${s.chip}`}>
              <s.icon className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider truncate" style={{ color: '#64748b' }}>{s.label}</p>
              <p className="text-2xl font-bold mt-0.5 leading-none" style={{ color: '#1a1a2e' }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="liquid-card p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Şagird adı ilə axtar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pastel-input"
              style={{ paddingLeft: 36 }}
            />
          </div>
          <div className="w-44">
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="pastel-input">
              <option value="all">Bütün növlər</option>
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div className="w-44">
            <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="pastel-input">
              <option value="week">Bu həftə</option>
              <option value="month">Bu ay</option>
              <option value="all">Bütün vaxt</option>
            </select>
          </div>
        </div>
      </div>

      {error && <p className="text-sm flex items-center gap-1.5" style={{ color: '#b83b54' }}><AlertCircle className="w-4 h-4" /> {error}</p>}

      {/* Table */}
      <div className="liquid-card overflow-hidden">
        {myStudents.length === 0 ? (
          <div className="p-12 text-center">
            <div className="icon-chip icon-chip-periwinkle mx-auto mb-3" style={{ width: 64, height: 64 }}>
              <BookOpen className="w-8 h-8" />
            </div>
            <p className="text-base font-semibold" style={{ color: '#1a1a2e' }}>Sinif tapılmadı</p>
            <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>Sizə təyin edilmiş sinif yoxdur</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="icon-chip icon-chip-mint mx-auto mb-3" style={{ width: 64, height: 64 }}>
              <Check className="w-8 h-8" />
            </div>
            <p className="text-base font-semibold" style={{ color: '#1a1a2e' }}>Qeyd tapılmadı</p>
            <p className="text-sm mt-1 mb-4" style={{ color: '#94a3b8' }}>Filtrə uyğun intizam qeydi yoxdur</p>
            <button onClick={() => { resetForm(); setAddModal(true) }} className="btn-pastel" style={{ padding: '10px 20px', fontSize: 13 }}>
              <Plus className="w-4 h-4" /> Qeyd əlavə et
            </button>
          </div>
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
                  <tr key={r.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar name={r.student?.full_name} size="sm" />
                        <span style={{ fontWeight: 600, color: '#1a1a2e' }}>{r.student?.full_name || '—'}</span>
                      </div>
                    </td>
                    <td><TypeBadge type={r.type} /></td>
                    <td>{formatDate(r.date)}</td>
                    <td title={r.description} style={{ color: '#475569' }}>
                      {r.description && r.description.length > 60 ? r.description.slice(0, 60) + '…' : r.description || '—'}
                    </td>
                    <td style={{ color: '#64748b' }}>{r.recorder?.full_name || '—'}</td>
                    <td>
                      {r.parent_notified
                        ? <span className="pastel-badge pastel-badge-mint"><Check className="w-3 h-3" /></span>
                        : <span className="pastel-badge pastel-badge-slate">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {addModal && (
        <div className="liquid-backdrop" onClick={() => { setAddModal(false); resetForm() }}>
          <div className="liquid-card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: '#1a1a2e' }}>Qeyd əlavə et</h3>
              <button onClick={() => { setAddModal(false); resetForm() }} className="smooth-trans hover:opacity-70" style={{ color: '#64748b' }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#64748b' }}>Şagird</label>
                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(124,110,224,0.2)', background: 'rgba(255,255,255,0.5)' }}>
                  <div className="p-2" style={{ borderBottom: '1px solid rgba(124,110,224,0.12)' }}>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#94a3b8' }} />
                      <input
                        type="text"
                        placeholder="Axtar..."
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-sm bg-transparent outline-none"
                        style={{ color: '#1a1a2e' }}
                      />
                    </div>
                  </div>
                  <div className="max-h-40 overflow-y-auto scrollbar-thin">
                    {filteredStudents.length === 0 && (
                      <p className="text-center py-4 text-xs" style={{ color: '#94a3b8' }}>Şagird tapılmadı</p>
                    )}
                    {filteredStudents.map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, student_id: s.id }))}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left smooth-trans"
                        style={{
                          background: form.student_id === s.id ? 'rgba(124,110,224,0.10)' : 'transparent',
                          color: form.student_id === s.id ? '#5b4fb8' : '#1a1a2e',
                          fontWeight: form.student_id === s.id ? 600 : 400,
                        }}
                      >
                        <Avatar name={s.full_name} size="sm" />
                        {s.full_name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#64748b' }}>Tarix</label>
                <input type="date" className="pastel-input" value={form.date} onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))} />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#64748b' }}>Növ</label>
                <select className="pastel-input" value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}>
                  {Object.entries(TYPE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#64748b' }}>Təsvir</label>
                <textarea
                  className="pastel-input"
                  value={form.description}
                  onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  placeholder="İntizam hadisəsini təsvir edin..."
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.parent_notified}
                  onChange={(e) => setForm(f => ({ ...f, parent_notified: e.target.checked }))}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: '#7c6ee0' }}
                />
                <span className="text-sm" style={{ color: '#1a1a2e' }}>Valideyn bildirildi</span>
              </label>

              {error && <p className="text-sm flex items-center gap-1.5" style={{ color: '#b83b54' }}><AlertCircle className="w-4 h-4" /> {error}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => { setAddModal(false); resetForm() }} className="btn-ghost-pastel" style={{ padding: '10px 20px', fontSize: 13 }}>Ləğv et</button>
                <button onClick={handleAdd} disabled={saving} className="btn-pastel" style={{ padding: '10px 22px', fontSize: 13, opacity: saving ? 0.5 : 1 }}>
                  {saving ? '...' : 'Əlavə et'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
