import { useState, useEffect } from 'react'
import { Search, Plus, BookOpen, ChevronLeft, TrendingUp, Activity, Heart, CheckCircle, AlertTriangle, Clock } from 'lucide-react'
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
import StatCard from '../../components/ui/StatCard'
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

// LOW dial: pill-* classes, no glass, tight tokens
const STATUS_PILLS = {
  complete: 'pill-mint',
  on_track: 'pill-peri',
  at_risk:  'pill-rose',
}
const STATUS_LABELS = { complete: 'Tamamlandı', on_track: 'Yolundadır', at_risk: 'Risk altında' }

// CAS type chip styles (muted tints — data surface)
const TYPE_CHIPS = {
  creativity: { pill: 'pill-peri',  label: 'Yaradıcılıq' },
  activity:   { pill: 'pill-mint',  label: 'Fəaliyyət' },
  service:    { pill: 'pill-peach', label: 'Xidmət' },
}

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

  // KPI aggregates for the overview
  const completeCount  = students.filter(s => casStatus(s.creativity, s.activity, s.service) === 'complete').length
  const onTrackCount   = students.filter(s => casStatus(s.creativity, s.activity, s.service) === 'on_track').length
  const atRiskCount    = students.filter(s => casStatus(s.creativity, s.activity, s.service) === 'at_risk').length

  const columns = [
    {
      key: 'full_name',
      label: 'Şagird',
      render: (val) => (
        <div className="flex items-center gap-3">
          <Avatar name={val} size="sm" />
          <span className="font-semibold text-ink-900 text-sm">{val}</span>
        </div>
      ),
    },
    {
      key: 'creativity',
      label: (
        <span className="flex items-center gap-1 text-ink-400">
          <TrendingUp className="w-3.5 h-3.5" /> Yaradıcılıq
        </span>
      ),
      render: (val) => <span className="font-semibold text-ink-700 tabular-nums">{val}s</span>,
    },
    {
      key: 'activity',
      label: (
        <span className="flex items-center gap-1 text-ink-400">
          <Activity className="w-3.5 h-3.5" /> Fəaliyyət
        </span>
      ),
      render: (val) => <span className="font-semibold text-ink-700 tabular-nums">{val}s</span>,
    },
    {
      key: 'service',
      label: (
        <span className="flex items-center gap-1 text-ink-400">
          <Heart className="w-3.5 h-3.5" /> Xidmət
        </span>
      ),
      render: (val) => <span className="font-semibold text-ink-700 tabular-nums">{val}s</span>,
    },
    {
      key: 'total',
      label: 'Cəmi',
      render: (_, row) => {
        const total = row.creativity + row.activity + row.service
        const pct = Math.min(100, (total / TARGET_HOURS) * 100)
        return (
          <div className="flex items-center gap-2.5 min-w-[120px]">
            <div className="flex-1 h-1.5 rounded-pill bg-hairline overflow-hidden">
              <div
                className="h-full rounded-pill bg-brand-500 transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs text-ink-400 tabular-nums shrink-0">{total}/{TARGET_HOURS}s</span>
          </div>
        )
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (_, row) => {
        const st = casStatus(row.creativity, row.activity, row.service)
        return <span className={`pill ${STATUS_PILLS[st]}`}>{STATUS_LABELS[st]}</span>
      },
    },
  ]

  const entryColumns = [
    {
      key: 'date',
      label: 'Tarix',
      render: (val) => <span className="text-ink-600 tabular-nums">{val ? fmtNumeric(val) : '—'}</span>,
    },
    {
      key: 'type',
      label: 'Növ',
      render: (val) => {
        const chip = TYPE_CHIPS[val]
        return chip
          ? <span className={`pill ${chip.pill}`}>{chip.label}</span>
          : <span className="pill pill-muted">{val}</span>
      },
    },
    {
      key: 'hours',
      label: 'Saat',
      render: (val) => <span className="font-semibold text-ink-700 tabular-nums">{val}s</span>,
    },
    {
      key: 'description',
      label: 'Açıqlama',
      render: (val) => <span className="text-ink-600 text-sm">{val}</span>,
    },
  ]

  if (loading) return <PageSpinner />

  // ── Student detail view ──────────────────────────────────────────────────
  if (selectedStudent) {
    const total = selectedStudent.creativity + selectedStudent.activity + selectedStudent.service
    const pct   = Math.min(100, (total / TARGET_HOURS) * 100)
    const st    = casStatus(selectedStudent.creativity, selectedStudent.activity, selectedStudent.service)

    return (
      <div className="space-y-6">
        {/* Back + header */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setSelectedStudent(null)}
            className="flex items-center gap-1.5 text-sm font-medium text-ink-400 hover:text-brand-500 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Geri
          </button>
          <span className="text-ink-300">/</span>
          <h1 className="text-2xl font-bold text-ink-900 font-display">
            {selectedStudent.full_name} — CAS Jurnalı
          </h1>
          <span className={`pill ${STATUS_PILLS[st]} ml-auto`}>{STATUS_LABELS[st]}</span>
        </div>

        {/* Hour breakdown — one calm brand accent across all dimensions (color restraint) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Yaradıcılıq" value={`${selectedStudent.creativity}s`} icon={TrendingUp} tone="periwinkle" />
          <StatCard label="Fəaliyyət"   value={`${selectedStudent.activity}s`}   icon={Activity}   tone="periwinkle" />
          <StatCard label="Xidmət"      value={`${selectedStudent.service}s`}    icon={Heart}      tone="periwinkle" />
          <StatCard label="Cəmi"        value={`${total}s`}                      icon={BookOpen}   tone="periwinkle" />
        </div>

        {/* Overall progress bar */}
        <Card hover={false} className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-semibold text-ink-400 uppercase tracking-[0.04em]">
              Ümumi tərəqqi — hədəf {TARGET_HOURS} saat
            </span>
            <span className="text-sm font-bold text-ink-700 tabular-nums">{total} / {TARGET_HOURS}s</span>
          </div>
          <div className="h-2 rounded-pill bg-hairline overflow-hidden">
            <div
              className="h-full rounded-pill bg-brand-500 transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-end">
          <Button onClick={() => { setForm(f => ({ ...f, student_id: selectedStudent.id })); setAddModal(true) }}>
            <span className="flex items-center gap-2"><Plus className="w-4 h-4" /> Giriş əlavə et</span>
          </Button>
        </div>

        {/* Entries table */}
        <Card hover={false} className="p-0 overflow-hidden">
          {entriesLoading ? <PageSpinner /> : (
            entries.length === 0 ? (
              <EmptyState
                tier={1}
                icon={BookOpen}
                title="CAS girişi yoxdur"
                description="Bu şagird hələ CAS fəaliyyəti qeyd etməyib."
                actionLabel="Giriş əlavə et"
                onAction={() => { setForm(f => ({ ...f, student_id: selectedStudent.id })); setAddModal(true) }}
              />
            ) : (
              <Table columns={entryColumns} data={entries} />
            )
          )}
        </Card>

        {/* Add entry modal */}
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
            {error && (
              <p className="text-sm text-danger bg-[rgba(239,68,68,0.08)] rounded-input px-3 py-2 border border-[rgba(239,68,68,0.2)]">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => { setAddModal(false); setError(null) }}>{t('cancel')}</Button>
              <Button onClick={handleAdd} loading={saving} disabled={!form.hours || !form.date}>{t('add')}</Button>
            </div>
          </div>
        </Modal>
      </div>
    )
  }

  // ── Overview list ────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-900 font-display">CAS Tracker</h1>
          <p className="text-sm text-ink-400 mt-0.5">
            Creativity · Activity · Service — IB DP tələbi: {TARGET_HOURS} saat
          </p>
        </div>
        <Button onClick={() => { setForm({ student_id: '', type: 'creativity', hours: '', description: '', date: '' }); setAddModal(true) }}>
          <span className="flex items-center gap-2"><Plus className="w-4 h-4" /> Giriş əlavə et</span>
        </Button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Tamamlandı"    value={completeCount}  icon={CheckCircle}    tone="mint" />
        <StatCard label="Yolundadır"    value={onTrackCount}   icon={TrendingUp}     tone="periwinkle" />
        <StatCard label="Risk altında"  value={atRiskCount}    icon={AlertTriangle}  tone="coral" />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
        <input
          type="text"
          placeholder="Şagird axtar..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pastel-input w-full pl-10 pr-4"
        />
      </div>

      {error && (
        <p className="text-sm text-danger bg-[rgba(239,68,68,0.08)] rounded-input px-3 py-2 border border-[rgba(239,68,68,0.2)]">
          {error}
        </p>
      )}

      {/* Table */}
      <Card hover={false} className="p-0 overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            tier={1}
            icon={BookOpen}
            title="Şagird tapılmadı"
            description="CAS izləmə üçün şagird qeydiyyatı tələb olunur."
          />
        ) : (
          <Table columns={columns} data={filtered} onRowClick={openStudent} />
        )}
      </Card>

      {/* Add global entry modal */}
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
          {error && (
            <p className="text-sm text-danger bg-[rgba(239,68,68,0.08)] rounded-input px-3 py-2 border border-[rgba(239,68,68,0.2)]">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => { setAddModal(false); setError(null) }}>{t('cancel')}</Button>
            <Button onClick={handleAdd} loading={saving} disabled={!form.student_id || !form.hours || !form.date}>{t('add')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
