import { useState, useEffect } from 'react'
import { Plus, ClipboardList, ChevronLeft, Save, Eye, EyeOff, Edit2, Trash2, X, AlertCircle, Check, Calendar, Clock as ClockIcon } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { fmtNumeric } from '../../lib/dateUtils'

const emptyForm = {
  title: '',
  class_id: '',
  subject_id: '',
  exam_date: '',
  duration_minutes: 60,
  max_score: 100,
  published: false,
}

function formatDate(d) {
  if (!d) return ''
  return fmtNumeric(d)
}

export default function TeacherExams() {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [teacherClasses, setTeacherClasses] = useState([])
  const [exams, setExams] = useState([])
  const [filterClass, setFilterClass] = useState('')
  const [addModal, setAddModal] = useState(false)
  const [editModal, setEditModal] = useState(null)
  const [deleteModal, setDeleteModal] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const [resultsExam, setResultsExam] = useState(null)
  const [students, setStudents] = useState([])
  const [scores, setScores] = useState({})
  const [savingResults, setSavingResults] = useState(false)
  const [resultsLoading, setResultsLoading] = useState(false)
  const [resultsSaved, setResultsSaved] = useState(false)
  const [resultsError, setResultsError] = useState(null)

  useEffect(() => {
    if (!profile) return
    loadTeacherClasses()
  }, [profile])

  async function loadTeacherClasses() {
    try {
      const { data } = await supabase
        .from('teacher_classes')
        .select('class_id, subject_id, class:classes(id, name), subject:subjects(id, name)')
        .eq('teacher_id', profile.id)
      setTeacherClasses(data || [])
      await loadExams(data || [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  async function loadExams(tc) {
    const classIds = [...new Set((tc || teacherClasses).map(t => t.class_id))]
    if (!classIds.length) return
    try {
      const { data, error } = await supabase
        .from('exams')
        .select('*, class:classes(id, name), subject:subjects(id, name)')
        .in('class_id', classIds)
        .eq('created_by', profile.id)
        .order('exam_date', { ascending: false })
        .limit(200)
      if (error) throw error
      setExams(data || [])
    } catch {
      setError('İmtahanları yükləmək alınmadı')
    }
  }

  async function openResults(exam) {
    setResultsExam(exam)
    setResultsLoading(true)
    try {
      const [membersRes, resultsRes] = await Promise.all([
        supabase.from('class_members').select('student:profiles(id, full_name)').eq('class_id', exam.class_id),
        supabase.from('exam_results').select('*').eq('exam_id', exam.id),
      ])
      const studentList = (membersRes.data || []).map(m => m.student).filter(Boolean)
      studentList.sort((a, b) => a.full_name.localeCompare(b.full_name))
      setStudents(studentList)
      const scoreMap = {}
      ;(resultsRes.data || []).forEach(r => {
        scoreMap[r.student_id] = { score: r.score ?? '', notes: r.notes ?? '' }
      })
      setScores(scoreMap)
    } finally {
      setResultsLoading(false)
    }
  }

  async function saveResults() {
    if (!resultsExam) return
    try {
      setSavingResults(true)
      const rows = students
        .filter(s => scores[s.id]?.score !== '' && scores[s.id]?.score != null)
        .map(s => ({
          exam_id: resultsExam.id,
          student_id: s.id,
          score: parseFloat(scores[s.id].score),
          notes: scores[s.id].notes || null,
        }))
      if (rows.length > 0) {
        const { error: err } = await supabase.from('exam_results').upsert(rows, { onConflict: 'exam_id,student_id' })
        if (err) throw err
      }
      setResultsSaved(true)
      setResultsError(null)
      setTimeout(() => setResultsSaved(false), 3000)
    } catch {
      setResultsError('Nəticələri saxlayarkən xəta baş verdi')
    } finally {
      setSavingResults(false)
    }
  }

  async function handleSave() {
    if (!form.title.trim() || !form.class_id || !form.subject_id || !form.exam_date) {
      setError('Zəruri sahələri doldurun')
      return
    }
    try {
      setSaving(true)
      setError(null)
      const payload = {
        school_id: profile.school_id,
        title: form.title.trim(),
        class_id: form.class_id,
        subject_id: form.subject_id,
        exam_date: form.exam_date,
        duration_minutes: parseInt(form.duration_minutes) || 60,
        max_score: parseFloat(form.max_score) || 100,
        published: form.published,
        created_by: profile.id,
      }
      if (editModal) {
        const { error: err } = await supabase.from('exams').update(payload).eq('id', editModal.id)
        if (err) throw err
      } else {
        const { error: err } = await supabase.from('exams').insert(payload)
        if (err) throw err
      }
      setAddModal(false)
      setEditModal(null)
      setForm(emptyForm)
      await loadExams()
    } catch {
      setError('Xəta baş verdi')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteModal) return
    try {
      setSaving(true)
      await supabase.from('exam_results').delete().eq('exam_id', deleteModal.id)
      await supabase.from('exams').delete().eq('id', deleteModal.id)
      setDeleteModal(null)
      await loadExams()
    } finally {
      setSaving(false)
    }
  }

  async function togglePublish(exam) {
    await supabase.from('exams').update({ published: !exam.published }).eq('id', exam.id)
    setExams(prev => prev.map(e => e.id === exam.id ? { ...e, published: !e.published } : e))
  }

  function openEdit(exam) {
    setForm({
      title: exam.title,
      class_id: exam.class_id,
      subject_id: exam.subject_id,
      exam_date: exam.exam_date,
      duration_minutes: exam.duration_minutes ?? 60,
      max_score: exam.max_score ?? 100,
      published: exam.published ?? false,
    })
    setEditModal(exam)
  }

  const uniqueClasses = teacherClasses.reduce((acc, tc) => {
    if (!acc.find(c => c.id === tc.class_id)) {
      acc.push({ id: tc.class_id, name: tc.class?.name })
    }
    return acc
  }, [])

  const availableSubjectsForForm = teacherClasses
    .filter(tc => tc.class_id === form.class_id)
    .map(tc => tc.subject)
    .filter(Boolean)

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="pastel-skeleton h-12 w-72" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[0,1,2,3,4,5].map(i => <div key={i} className="pastel-skeleton h-44" />)}
        </div>
      </div>
    )
  }

  // Results view
  if (resultsExam) {
    return (
      <div className="space-y-5">
        <div className="flex items-start gap-3">
          <button
            onClick={() => setResultsExam(null)}
            className="p-2 rounded-xl smooth-trans"
            style={{ color: '#64748b', background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(124,110,224,0.15)' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#7c6ee0'; e.currentTarget.style.background = 'rgba(124,110,224,0.08)' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = 'rgba(255,255,255,0.5)' }}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#1a1a2e' }}>
              <span className="pastel-text">{resultsExam.title}</span>
            </h1>
            <p className="text-sm mt-0.5" style={{ color: '#64748b' }}>
              {resultsExam.class?.name} · {resultsExam.subject?.name} · {formatDate(resultsExam.exam_date)} · Max: {resultsExam.max_score}
            </p>
          </div>
        </div>
        {resultsLoading ? (
          <div className="pastel-skeleton h-64" />
        ) : students.length === 0 ? (
          <div className="liquid-card p-12 text-center">
            <div className="icon-chip icon-chip-periwinkle mx-auto mb-3" style={{ width: 64, height: 64 }}>
              <ClipboardList className="w-8 h-8" />
            </div>
            <p className="text-base font-semibold" style={{ color: '#1a1a2e' }}>Şagird yoxdur</p>
            <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>Bu sinfə heç bir şagird əlavə edilməyib.</p>
          </div>
        ) : (
          <div className="liquid-card p-6">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
              <h2 className="text-xl font-bold" style={{ color: '#1a1a2e' }}>İmtahan nəticələri</h2>
              <div className="flex items-center gap-3 flex-wrap">
                {resultsSaved && (
                  <span className="pastel-badge pastel-badge-mint">
                    <Check className="w-3 h-3" /> Nəticələr saxlandı
                  </span>
                )}
                {resultsError && (
                  <span className="pastel-badge pastel-badge-rose">
                    <AlertCircle className="w-3 h-3" /> {resultsError}
                  </span>
                )}
                <button onClick={saveResults} disabled={savingResults} className="btn-pastel" style={{ padding: '10px 20px', fontSize: 13, opacity: savingResults ? 0.5 : 1 }}>
                  <Save className="w-4 h-4" /> {savingResults ? '...' : 'Saxla'}
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="pastel-table">
                <thead>
                  <tr>
                    <th>Şagird</th>
                    <th style={{ textAlign: 'center' }}>Bal (max: {resultsExam.max_score})</th>
                    <th>Qeyd</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => (
                    <tr key={student.id}>
                      <td style={{ fontWeight: 600 }}>{student.full_name}</td>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="number"
                          min={0}
                          max={resultsExam.max_score}
                          step="0.5"
                          value={scores[student.id]?.score ?? ''}
                          onChange={e =>
                            setScores(prev => ({
                              ...prev,
                              [student.id]: { ...prev[student.id], score: e.target.value },
                            }))
                          }
                          className="pastel-input"
                          style={{ width: 96, textAlign: 'center', padding: '6px 8px' }}
                          placeholder="—"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={scores[student.id]?.notes ?? ''}
                          onChange={e =>
                            setScores(prev => ({
                              ...prev,
                              [student.id]: { ...prev[student.id], notes: e.target.value },
                            }))
                          }
                          className="pastel-input"
                          style={{ padding: '6px 10px' }}
                          placeholder="Qeyd əlavə et..."
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    )
  }

  const filtered = exams.filter(e => !filterClass || e.class_id === filterClass)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: '#1a1a2e' }}>
            <span className="pastel-text">İmtahanlar</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: '#64748b' }}>Siniflərinizdəki imtahanları idarə edin</p>
        </div>
        {teacherClasses.length > 0 && (
          <button onClick={() => { setForm(emptyForm); setError(null); setAddModal(true) }} className="btn-pastel" style={{ padding: '12px 22px', fontSize: 13 }}>
            <Plus className="w-4 h-4" /> İmtahan planla
          </button>
        )}
      </div>

      {uniqueClasses.length > 1 && (
        <div className="w-56">
          <select className="pastel-input" value={filterClass} onChange={e => setFilterClass(e.target.value)}>
            <option value="">Bütün siniflər</option>
            {uniqueClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      )}

      {teacherClasses.length === 0 ? (
        <div className="liquid-card p-12 text-center">
          <div className="icon-chip icon-chip-periwinkle mx-auto mb-3" style={{ width: 64, height: 64 }}>
            <ClipboardList className="w-8 h-8" />
          </div>
          <p className="text-base font-semibold" style={{ color: '#1a1a2e' }}>Sinif tapılmadı</p>
          <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>Sizə hələ sinif təyin edilməyib.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="liquid-card p-12 text-center">
          <div className="icon-chip icon-chip-blue mx-auto mb-3" style={{ width: 64, height: 64 }}>
            <ClipboardList className="w-8 h-8" />
          </div>
          <p className="text-base font-semibold" style={{ color: '#1a1a2e' }}>İmtahan yoxdur</p>
          <p className="text-sm mt-1 mb-4" style={{ color: '#94a3b8' }}>Hələ heç bir imtahan planlanmayıb.</p>
          <button onClick={() => { setForm(emptyForm); setError(null); setAddModal(true) }} className="btn-pastel" style={{ padding: '10px 20px', fontSize: 13 }}>
            <Plus className="w-4 h-4" /> İmtahan planla
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(exam => (
            <div key={exam.id} className="liquid-card p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold truncate" style={{ color: '#1a1a2e' }}>{exam.title}</h3>
                  <p className="text-sm mt-0.5" style={{ color: '#64748b' }}>{exam.class?.name} · {exam.subject?.name}</p>
                </div>
                <span className={exam.published ? 'pastel-badge pastel-badge-mint' : 'pastel-badge pastel-badge-slate'}>
                  {exam.published ? 'Dərc edilib' : 'Qaralama'}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs flex-wrap" style={{ color: '#64748b' }}>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(exam.exam_date)}</span>
                <span className="flex items-center gap-1"><ClockIcon className="w-3 h-3" /> {exam.duration_minutes} dəq</span>
                <span>Max: <strong style={{ color: '#7c6ee0' }}>{exam.max_score}</strong></span>
              </div>

              <div className="flex items-center gap-2 flex-wrap pt-3" style={{ borderTop: '1px solid rgba(124,110,224,0.10)' }}>
                <button
                  onClick={() => openResults(exam)}
                  className="btn-ghost-pastel"
                  style={{ padding: '6px 12px', fontSize: 12 }}
                >
                  <ClipboardList className="w-3.5 h-3.5" /> Nəticələr
                </button>
                <button
                  onClick={() => togglePublish(exam)}
                  className="btn-ghost-pastel"
                  style={{ padding: '6px 12px', fontSize: 12, borderColor: 'rgba(93,184,163,0.4)', color: '#3d8a73' }}
                >
                  {exam.published ? <><EyeOff className="w-3.5 h-3.5" /> Gizlət</> : <><Eye className="w-3.5 h-3.5" /> Dərc et</>}
                </button>
                <button
                  onClick={() => openEdit(exam)}
                  className="p-2 rounded-lg smooth-trans"
                  style={{ color: '#64748b' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#7c6ee0'; e.currentTarget.style.background = 'rgba(124,110,224,0.08)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = 'transparent' }}
                  aria-label="Redaktə et"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteModal(exam)}
                  className="p-2 rounded-lg smooth-trans"
                  style={{ color: '#64748b' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#b83b54'; e.currentTarget.style.background = 'rgba(229,107,127,0.08)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = 'transparent' }}
                  aria-label="Sil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {(addModal || editModal) && (
        <div className="liquid-backdrop" onClick={() => { setAddModal(false); setEditModal(null); setError(null); setForm(emptyForm) }}>
          <div className="liquid-card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: '#1a1a2e' }}>{editModal ? 'İmtahanı redaktə et' : 'İmtahan planla'}</h3>
              <button onClick={() => { setAddModal(false); setEditModal(null); setError(null); setForm(emptyForm) }} className="smooth-trans hover:opacity-70" style={{ color: '#64748b' }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              {error && <p className="pastel-badge pastel-badge-rose"><AlertCircle className="w-3 h-3" /> {error}</p>}
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#64748b' }}>Başlıq *</label>
                <input className="pastel-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="İmtahan başlığı" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#64748b' }}>Sinif *</label>
                <select className="pastel-input" value={form.class_id} onChange={e => setForm(f => ({ ...f, class_id: e.target.value, subject_id: '' }))}>
                  <option value="">Sinif seçin</option>
                  {uniqueClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#64748b' }}>Fənn *</label>
                <select className="pastel-input" value={form.subject_id} onChange={e => setForm(f => ({ ...f, subject_id: e.target.value }))}>
                  <option value="">Fənn seçin</option>
                  {(form.class_id ? availableSubjectsForForm : teacherClasses.map(tc => tc.subject).filter(Boolean)).map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#64748b' }}>Tarix *</label>
                <input type="date" className="pastel-input" value={form.exam_date} onChange={e => setForm(f => ({ ...f, exam_date: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#64748b' }}>Müddət (dəqiqə)</label>
                  <input type="number" min={1} className="pastel-input" value={form.duration_minutes} onChange={e => setForm(f => ({ ...f, duration_minutes: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#64748b' }}>Maksimum bal</label>
                  <input type="number" min={1} className="pastel-input" value={form.max_score} onChange={e => setForm(f => ({ ...f, max_score: e.target.value }))} />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.published} onChange={e => setForm(f => ({ ...f, published: e.target.checked }))} className="w-4 h-4" style={{ accentColor: '#7c6ee0' }} />
                <span className="text-sm" style={{ color: '#1a1a2e' }}>Şagirdlərə dərc et</span>
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => { setAddModal(false); setEditModal(null); setError(null); setForm(emptyForm) }} className="btn-ghost-pastel" style={{ padding: '10px 20px', fontSize: 13 }}>Ləğv et</button>
                <button onClick={handleSave} disabled={saving} className="btn-pastel" style={{ padding: '10px 22px', fontSize: 13, opacity: saving ? 0.5 : 1 }}>
                  {saving ? '...' : (editModal ? 'Yenilə' : 'Planla')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <div className="liquid-backdrop" onClick={() => setDeleteModal(null)}>
          <div className="liquid-card p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-3">
              <span className="icon-chip icon-chip-peach" style={{ width: 40, height: 40 }}>
                <AlertCircle className="w-5 h-5" />
              </span>
              <h3 className="text-lg font-bold" style={{ color: '#1a1a2e' }}>İmtahanı sil</h3>
            </div>
            <p className="text-sm mb-5" style={{ color: '#64748b' }}>
              <strong style={{ color: '#1a1a2e' }}>{deleteModal?.title}</strong> imtahanını silmək istədiyinizə əminsiniz?
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteModal(null)} className="btn-ghost-pastel" style={{ padding: '10px 20px', fontSize: 13 }}>Ləğv et</button>
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
                {saving ? '...' : 'Sil'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
