import { useState, useEffect } from 'react'
import { Plus, BookOpen, Calendar, Clock, Edit2, Trash2, X, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { fmtDate } from '../../lib/dateUtils'

const ATL_SKILLS = ['Düşüncə', 'Ünsiyyət', 'Sosial', 'Özünüidarəetmə', 'Tədqiqat']

const statusBadge = {
  draft:    'pastel-badge pastel-badge-slate',
  active:   'pastel-badge pastel-badge-periwinkle',
  complete: 'pastel-badge pastel-badge-mint',
}
const statusLabel = {
  draft: 'Qaralama',
  active: 'Aktiv',
  complete: 'Tamamlandı',
}

// Subject hash → pastel hue
const SUBJ_HUES = [
  { bg: 'rgba(124,110,224,0.12)', text: '#5b4fb8' },
  { bg: 'rgba(93,184,163,0.14)',  text: '#3d8a73' },
  { bg: 'rgba(232,168,124,0.18)', text: '#b46a3e' },
  { bg: 'rgba(107,157,222,0.14)', text: '#4a7cb5' },
  { bg: 'rgba(200,158,212,0.16)', text: '#8b599c' },
]
function subjectHue(name = '') {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return SUBJ_HUES[Math.abs(h) % SUBJ_HUES.length]
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
          <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#64748b' }}>Vahid başlığı</label>
          <input className="pastel-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Məs: Trigonometriya Vahidi" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#64748b' }}>Fənn</label>
            <input className="pastel-input" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Riyaziyyat" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#64748b' }}>Sinif</label>
            <select className="pastel-input" value={form.class_id} onChange={e => setForm({ ...form, class_id: e.target.value })}>
              <option value="">— Sinif —</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#64748b' }}>Öyrənmə məqsədləri</label>
          <textarea className="pastel-input" rows={3} value={form.objectives} onChange={e => setForm({ ...form, objectives: e.target.value })} placeholder="Şagirdlər bu vahidin sonunda..." />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: '#64748b' }}>ATL Bacarıqları</label>
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
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#64748b' }}>Başlama tarixi</label>
            <input type="date" className="pastel-input" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#64748b' }}>Bitmə tarixi</label>
            <input type="date" className="pastel-input" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#64748b' }}>Status</label>
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
        <div className="pastel-skeleton h-12 w-72" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="pastel-skeleton h-48" />
          <div className="pastel-skeleton h-48" />
          <div className="pastel-skeleton h-48" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: '#1a1a2e' }}>
            <span className="pastel-text">Vahid Planlayıcı</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: '#64748b' }}>{units.length} vahid · {units.filter(u => u.status === 'active').length} aktiv</p>
        </div>
        <button onClick={() => { resetForm(); setAddModal(true) }} className="btn-pastel" style={{ padding: '12px 22px', fontSize: 13 }}>
          <Plus className="w-4 h-4" /> Yeni vahid
        </button>
      </div>

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
        <div className="flex items-center gap-2 text-sm" style={{ color: '#b83b54' }}>
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="liquid-card p-12">
          <div className="text-center">
            <div className="icon-chip icon-chip-periwinkle mx-auto mb-3" style={{ width: 64, height: 64 }}>
              <BookOpen className="w-8 h-8" />
            </div>
            <p className="text-base font-semibold" style={{ color: '#1a1a2e' }}>Vahid tapılmadı</p>
            <p className="text-sm mt-1 mb-4" style={{ color: '#94a3b8' }}>İlk tədris vahidinizi əlavə edin.</p>
            <button onClick={() => { resetForm(); setAddModal(true) }} className="btn-pastel" style={{ padding: '10px 20px', fontSize: 13 }}>
              <Plus className="w-4 h-4" /> Yeni vahid
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(unit => {
            const dur = durationLabel(unit.start_date, unit.end_date)
            const hue = subjectHue(unit.subject || '')
            return (
              <div key={unit.id} className="liquid-card p-5 flex flex-col gap-3 drop-target">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <span className="pastel-badge" style={{ background: hue.bg, color: hue.text }}>
                      {unit.subject || 'Fənn yoxdur'}
                    </span>
                    <h3 className="text-lg font-bold mt-2 leading-tight" style={{ color: '#1a1a2e' }}>{unit.title}</h3>
                  </div>
                  <span className={statusBadge[unit.status] || statusBadge.draft}>
                    {statusLabel[unit.status] || statusLabel.draft}
                  </span>
                </div>

                {unit.class && (
                  <p className="text-sm" style={{ color: '#64748b' }}>{unit.class.name}</p>
                )}

                {unit.objectives && (
                  <p className="text-sm line-clamp-2" style={{ color: '#475569' }}>{unit.objectives}</p>
                )}

                {(unit.atl_skills || []).length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {unit.atl_skills.map(skill => (
                      <span key={skill} className="pastel-badge pastel-badge-periwinkle" style={{ fontSize: 10 }}>{skill}</span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between mt-auto pt-3" style={{ borderTop: '1px solid rgba(124,110,224,0.10)' }}>
                  <div className="flex items-center gap-3 text-xs" style={{ color: '#94a3b8' }}>
                    {unit.start_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {fmtDate(new Date(unit.start_date), { day: 'numeric', month: 'short' })}
                      </span>
                    )}
                    {dur && (
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{dur}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(unit)} className="p-1.5 rounded-lg smooth-trans hover:bg-white" style={{ color: '#64748b' }} onMouseEnter={e => e.currentTarget.style.color = '#7c6ee0'} onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteModal(unit)} className="p-1.5 rounded-lg smooth-trans hover:bg-white" style={{ color: '#64748b' }} onMouseEnter={e => e.currentTarget.style.color = '#b83b54'} onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>
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
          <div className="liquid-card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: '#1a1a2e' }}>Yeni Vahid</h3>
              <button onClick={() => { setAddModal(false); setError(null); resetForm() }} className="smooth-trans hover:opacity-70" style={{ color: '#64748b' }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <UnitFormFields />
            {error && <p className="text-sm flex items-center gap-1.5 mt-3" style={{ color: '#b83b54' }}><AlertCircle className="w-4 h-4" /> {error}</p>}
            <div className="flex justify-end gap-2 pt-4">
              <button onClick={() => { setAddModal(false); setError(null); resetForm() }} className="btn-ghost-pastel" style={{ padding: '10px 20px', fontSize: 13 }}>{t('cancel')}</button>
              <button onClick={handleAdd} disabled={saving || !form.title} className="btn-pastel" style={{ padding: '10px 22px', fontSize: 13, opacity: (saving || !form.title) ? 0.5 : 1 }}>{saving ? '...' : t('add')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div className="liquid-backdrop" onClick={() => { setEditModal(null); setError(null); resetForm() }}>
          <div className="liquid-card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: '#1a1a2e' }}>Vahidi Düzənlə</h3>
              <button onClick={() => { setEditModal(null); setError(null); resetForm() }} className="smooth-trans hover:opacity-70" style={{ color: '#64748b' }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <UnitFormFields />
            {error && <p className="text-sm flex items-center gap-1.5 mt-3" style={{ color: '#b83b54' }}><AlertCircle className="w-4 h-4" /> {error}</p>}
            <div className="flex justify-end gap-2 pt-4">
              <button onClick={() => { setEditModal(null); setError(null); resetForm() }} className="btn-ghost-pastel" style={{ padding: '10px 20px', fontSize: 13 }}>{t('cancel')}</button>
              <button onClick={handleEdit} disabled={saving || !form.title} className="btn-pastel" style={{ padding: '10px 22px', fontSize: 13, opacity: (saving || !form.title) ? 0.5 : 1 }}>{saving ? '...' : t('save')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteModal && (
        <div className="liquid-backdrop" onClick={() => setDeleteModal(null)}>
          <div className="liquid-card p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-3">
              <span className="icon-chip icon-chip-peach" style={{ width: 40, height: 40 }}>
                <AlertCircle className="w-5 h-5" />
              </span>
              <h3 className="text-lg font-bold" style={{ color: '#1a1a2e' }}>{t('delete')}</h3>
            </div>
            <p className="text-sm mb-5" style={{ color: '#64748b' }}>
              <strong style={{ color: '#1a1a2e' }}>{deleteModal?.title}</strong> vahidini silmək istədiyinizə əminsiniz?
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteModal(null)} className="btn-ghost-pastel" style={{ padding: '10px 20px', fontSize: 13 }}>{t('cancel')}</button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="px-5 py-2.5 rounded-full font-semibold text-white text-sm smooth-trans"
                style={{
                  background: 'linear-gradient(135deg, #e56b7f, #d85268)',
                  boxShadow: '0 4px 12px rgba(229,107,127,0.3)',
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
