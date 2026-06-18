import { useState, useEffect } from 'react'
import { Plus, BookOpen, Calendar, Clock, Edit2, Trash2, X, AlertCircle, Users } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { fmtDate } from '../../lib/dateUtils'
import EmptyState from '../../components/ui/EmptyState'

const ATL_SKILLS = ['Düşüncə', 'Ünsiyyət', 'Sosial', 'Özünüidarəetmə', 'Tədqiqat']

const STATUS_PILL = {
  draft:    'pill-neutral',
  active:   'pill-brand',
  complete: 'pill-success',
}
const statusLabel = {
  draft: 'Qaralama',
  active: 'Aktiv',
  complete: 'Tamamlandı',
}

// Subject chip — single brand tint (V3: color reserved for status, not categorical rotation)
const SUBJ_HUE = { bg: 'var(--brand-50)', text: 'var(--brand-600)' }
function subjectHue() {
  return SUBJ_HUE
}

// Status progress indicators
const STATUS_BAR = {
  draft:    { width: '15%', color: 'var(--ink-400)' },
  active:   { width: '55%', color: 'var(--brand-500)' },
  complete: { width: '100%', color: 'var(--mint)' },
}

export default function UnitPlanner() {
  const { profile, t } = useAuth()
  const [loading, setLoading] = useState(true)
  const [units, setUnits] = useState([])
  const [classes, setClasses] = useState([])
  const [addModal, setAddModal] = useState(false)
  const [editModal, setEditModal] = useState(null)
  const [deleteModal, setDeleteModal] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [form, setForm] = useState({
    title: '', subject: '', class_id: '', objectives: '',
    atl_skills: [], start_date: '', end_date: '', status: 'draft',
  })

  useEffect(() => {
    if (profile?.school_id) fetchData()
  }, [profile?.school_id])

  async function fetchData() {
    try {
      setLoading(true)
      const [unitsRes, classesRes] = await Promise.all([
        supabase.from('unit_plans').select('*, class:classes(id,name)').eq('school_id', profile.school_id).eq('teacher_id', profile.id).order('created_at', { ascending: false }).limit(200),
        supabase.from('classes').select('id,name').eq('school_id', profile.school_id).order('name').limit(100),
      ])
      setUnits(unitsRes.data || [])
      setClasses(classesRes.data || [])
    } catch {
      setUnits([])
      try {
        const { data } = await supabase.from('classes').select('id,name').eq('school_id', profile.school_id).order('name').limit(100)
        setClasses(data || [])
      } catch {}
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setForm({ title: '', subject: '', class_id: '', objectives: '', atl_skills: [], start_date: '', end_date: '', status: 'draft' })
  }

  function toggleATL(skill) {
    setForm(f => ({
      ...f,
      atl_skills: f.atl_skills.includes(skill)
        ? f.atl_skills.filter(s => s !== skill)
        : [...f.atl_skills, skill],
    }))
  }

  async function handleAdd() {
    if (form.start_date && form.end_date && form.end_date <= form.start_date) {
      setError('Bitmə tarixi başlama tarixindən sonra olmalıdır')
      return
    }
    try {
      setSaving(true)
      setError(null)
      const { error: err } = await supabase.from('unit_plans').insert({
        title: form.title,
        subject: form.subject,
        class_id: form.class_id || null,
        objectives: form.objectives,
        atl_skills: form.atl_skills,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        status: form.status,
        teacher_id: profile.id,
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
    if (form.start_date && form.end_date && form.end_date <= form.start_date) {
      setError('Bitmə tarixi başlama tarixindən sonra olmalıdır')
      return
    }
    try {
      setSaving(true)
      setError(null)
      const { error: err } = await supabase.from('unit_plans').update({
        title: form.title,
        subject: form.subject,
        class_id: form.class_id || null,
        objectives: form.objectives,
        atl_skills: form.atl_skills,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        status: form.status,
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
      await supabase.from('unit_plans').delete().eq('id', deleteModal.id)
      setDeleteModal(null)
      await fetchData()
    } catch {
      setError(t('error'))
    } finally {
      setSaving(false)
    }
  }

  function openEdit(unit) {
    setForm({
      title: unit.title || '',
      subject: unit.subject || '',
      class_id: unit.class_id || '',
      objectives: unit.objectives || '',
      atl_skills: unit.atl_skills || [],
      start_date: unit.start_date || '',
      end_date: unit.end_date || '',
      status: unit.status || 'draft',
    })
    setEditModal(unit)
  }

  function durationLabel(start, end) {
    if (!start || !end) return null
    const days = Math.round((new Date(end) - new Date(start)) / 86400000)
    return days > 0 ? `${days} gün` : null
  }

  const filtered = units.filter(u => filterStatus === 'all' || u.status === filterStatus)

  function UnitFormFields() {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-[13px] font-semibold mb-1.5 text-ink-700">Vahid başlığı</label>
          <input className="pastel-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Məs: Trigonometriya Vahidi" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-semibold mb-1.5 text-ink-700">Fənn</label>
            <input className="pastel-input" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Riyaziyyat" />
          </div>
          <div>
            <label className="block text-[13px] font-semibold mb-1.5 text-ink-700">Sinif</label>
            <select className="pastel-input" value={form.class_id} onChange={e => setForm({ ...form, class_id: e.target.value })}>
              <option value="">— Sinif —</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-[13px] font-semibold mb-1.5 text-ink-700">Öyrənmə məqsədləri</label>
          <textarea className="pastel-input" rows={3} value={form.objectives} onChange={e => setForm({ ...form, objectives: e.target.value })} placeholder="Şagirdlər bu vahidin sonunda..." />
        </div>
        <div>
          <label className="block text-[13px] font-semibold mb-2 text-ink-700">ATL Bacarıqları</label>
          <div className="flex flex-wrap gap-2">
            {ATL_SKILLS.map(skill => (
              <button
                key={skill}
                type="button"
                onClick={() => toggleATL(skill)}
                className={form.atl_skills.includes(skill) ? 'pastel-tab active' : 'pastel-tab'}
                style={{ padding: '6px 14px', fontSize: 12 }}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-semibold mb-1.5 text-ink-700">Başlama tarixi</label>
            <input type="date" className="pastel-input" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
          </div>
          <div>
            <label className="block text-[13px] font-semibold mb-1.5 text-ink-700">Bitmə tarixi</label>
            <input type="date" className="pastel-input" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="block text-[13px] font-semibold mb-1.5 text-ink-700">Status</label>
          <select className="pastel-input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
            <option value="draft">Qaralama</option>
            <option value="active">Aktiv</option>
            <option value="complete">Tamamlandı</option>
          </select>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="pastel-skeleton h-12 w-72 rounded-tile" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="pastel-skeleton h-48 rounded-card" />
          <div className="pastel-skeleton h-48 rounded-card" />
          <div className="pastel-skeleton h-48 rounded-card" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-ink-900">
            Vahid Planlayıcı
          </h1>
          <p className="text-sm mt-1 text-ink-600 tabular-nums">
            {units.length} vahid · {units.filter(u => u.status === 'active').length} aktiv
          </p>
        </div>
        <button onClick={() => { resetForm(); setAddModal(true) }} className="btn-pastel flex items-center gap-2">
          <Plus className="w-4 h-4" /> Yeni vahid
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="pastel-tabs">
        {[['all', 'Hamısı'], ['draft', 'Qaralama'], ['active', 'Aktiv'], ['complete', 'Tamamlandı']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilterStatus(val)}
            className={filterStatus === val ? 'pastel-tab active' : 'pastel-tab'}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-danger px-3 py-2 rounded-tile bg-danger/8 border border-danger/25">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          tier={1}
          icon={BookOpen}
          title={filterStatus === 'all' ? 'Hələ vahid əlavə edilməyib' : 'Bu statusda vahid yoxdur'}
          description={filterStatus === 'all' ? 'İlk tədris vahidinizi əlavə edin.' : 'Filteri dəyişdirərək digər vahidlərə baxa bilərsiniz'}
          actionLabel={filterStatus === 'all' ? 'Yeni vahid' : undefined}
          onAction={filterStatus === 'all' ? () => { resetForm(); setAddModal(true) } : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(unit => {
            const dur = durationLabel(unit.start_date, unit.end_date)
            const hue = subjectHue(unit.subject || '')
            const bar = STATUS_BAR[unit.status] || STATUS_BAR.draft
            return (
              <div
                key={unit.id}
                className="liquid-card p-5 flex flex-col gap-3 hover:-translate-y-0.5 transition-transform duration-150"
              >
                {/* Subject chip + status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill text-xs font-semibold"
                      style={{ background: hue.bg, color: hue.text }}
                    >
                      <BookOpen className="w-3 h-3" />
                      {unit.subject || 'Fənn yoxdur'}
                    </span>
                    <h3 className="text-base font-bold mt-2 leading-tight text-ink-900">{unit.title}</h3>
                  </div>
                  <span className={STATUS_PILL[unit.status] || STATUS_PILL.draft}>
                    {statusLabel[unit.status] || statusLabel.draft}
                  </span>
                </div>

                {/* Status progress bar */}
                <div className="h-1.5 w-full rounded-full bg-hairline overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: bar.width, background: bar.color }}
                  />
                </div>

                {unit.class && (
                  <p className="text-xs font-medium text-ink-400 flex items-center gap-1">
                    <Users className="w-3 h-3" /> {unit.class.name}
                  </p>
                )}

                {unit.objectives && (
                  <p className="text-sm line-clamp-2 text-ink-700 leading-relaxed">{unit.objectives}</p>
                )}

                {(unit.atl_skills || []).length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {unit.atl_skills.map(skill => (
                      <span key={skill} className="pill-brand" style={{ fontSize: 10, padding: '2px 8px' }}>{skill}</span>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-hairline">
                  <div className="flex items-center gap-3 text-xs text-ink-400">
                    {unit.start_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {fmtDate(new Date(unit.start_date), { day: 'numeric', month: 'short' })}
                      </span>
                    )}
                    {dur && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />{dur}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(unit)}
                      className="p-1.5 rounded-tile transition-colors text-ink-400 hover:text-brand-500 hover:bg-brand-50"
                      aria-label="Düzənlə"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteModal(unit)}
                      className="p-1.5 rounded-tile transition-colors text-ink-400 hover:text-danger hover:bg-danger/10"
                      aria-label="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Modal */}
      {addModal && (
        <div className="liquid-backdrop" onClick={() => { setAddModal(false); setError(null); resetForm() }}>
          <div
            className="bg-surface rounded-card shadow-modal w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-ink-900">Yeni Vahid</h3>
              <button
                onClick={() => { setAddModal(false); setError(null); resetForm() }}
                className="p-1.5 rounded-tile text-ink-400 hover:text-ink-700 hover:bg-canvas transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <UnitFormFields />
            {error && (
              <p className="text-sm flex items-center gap-1.5 mt-3 text-danger">
                <AlertCircle className="w-4 h-4" /> {error}
              </p>
            )}
            <div className="flex justify-end gap-2 pt-4 border-t border-hairline mt-4">
              <button
                onClick={() => { setAddModal(false); setError(null); resetForm() }}
                className="btn-ghost-pastel"
                style={{ padding: '10px 20px', fontSize: 13 }}
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleAdd}
                disabled={saving || !form.title}
                className="btn-pastel"
                style={{ padding: '10px 22px', fontSize: 13, opacity: (saving || !form.title) ? 0.5 : 1 }}
              >
                {saving ? '...' : t('add')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div className="liquid-backdrop" onClick={() => { setEditModal(null); setError(null); resetForm() }}>
          <div
            className="bg-surface rounded-card shadow-modal w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-ink-900">Vahidi Düzənlə</h3>
              <button
                onClick={() => { setEditModal(null); setError(null); resetForm() }}
                className="p-1.5 rounded-tile text-ink-400 hover:text-ink-700 hover:bg-canvas transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <UnitFormFields />
            {error && (
              <p className="text-sm flex items-center gap-1.5 mt-3 text-danger">
                <AlertCircle className="w-4 h-4" /> {error}
              </p>
            )}
            <div className="flex justify-end gap-2 pt-4 border-t border-hairline mt-4">
              <button
                onClick={() => { setEditModal(null); setError(null); resetForm() }}
                className="btn-ghost-pastel"
                style={{ padding: '10px 20px', fontSize: 13 }}
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleEdit}
                disabled={saving || !form.title}
                className="btn-pastel"
                style={{ padding: '10px 22px', fontSize: 13, opacity: (saving || !form.title) ? 0.5 : 1 }}
              >
                {saving ? '...' : t('save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteModal && (
        <div className="liquid-backdrop" onClick={() => setDeleteModal(null)}>
          <div
            className="bg-surface rounded-card shadow-modal w-full max-w-sm p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="icon-chip icon-chip-coral" style={{ width: 40, height: 40 }}>
                <AlertCircle className="w-5 h-5" />
              </span>
              <h3 className="text-lg font-bold text-ink-900">{t('delete')}</h3>
            </div>
            <p className="text-sm mb-5 text-ink-600">
              <strong className="text-ink-900">{deleteModal?.title}</strong> vahidini silmək istədiyinizə əminsiniz?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteModal(null)}
                className="btn-ghost-pastel"
                style={{ padding: '10px 20px', fontSize: 13 }}
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-pill font-semibold text-white text-sm transition-opacity"
                style={{
                  background: 'var(--danger)',
                  boxShadow: '0 1px 2px rgba(20,22,40,.08)',
                  opacity: saving ? 0.5 : 1,
                }}
              >
                {saving ? '...' : t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
