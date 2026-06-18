import { useState, useEffect } from 'react'
import { Plus, ClipboardList, ChevronLeft, Save, Eye, EyeOff, Edit2, Trash2, X, AlertCircle, Check, Calendar, Clock as ClockIcon } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { fmtNumeric } from '../../lib/dateUtils'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import Badge from '../../components/ui/Badge'

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
        <div className="pastel-skeleton h-10 w-64 rounded-tile" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[0,1,2,3,4,5].map(i => <div key={i} className="pastel-skeleton h-44 rounded-card" />)}
        </div>
      </div>
    )
  }

  // ── Results entry view ──
  if (resultsExam) {
    return (
      <div className="space-y-5">
        {/* Back + title */}
        <div className="flex items-start gap-3">
          <button
            onClick={() => setResultsExam(null)}
            className="p-2 rounded-tile smooth-trans text-ink-400 hover:text-brand-500 hover:bg-brand-50 border border-hairline"
            aria-label="Geri"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-extrabold text-ink-900 leading-tight">
              {resultsExam.title}
            </h1>
            <p className="text-sm mt-0.5 text-ink-400">
              {resultsExam.class?.name}
              {' · '}
              {resultsExam.subject?.name}
              {' · '}
              {formatDate(resultsExam.exam_date)}
              {' · '}
              Max:{' '}
              <strong className="text-ink-700 tabular-nums">{resultsExam.max_score}</strong>
            </p>
          </div>
        </div>

        {resultsLoading ? (
          <div className="pastel-skeleton h-64 rounded-tile" />
        ) : students.length === 0 ? (
          <EmptyState
            tier={1}
            icon={ClipboardList}
            title="Şagird yoxdur"
            description="Bu sinfə heç bir şagird əlavə edilməyib."
          />
        ) : (
          <div className="bg-surface rounded-tile border border-hairline overflow-hidden">
            {/* Sticky action bar */}
            <div
              className="flex items-center justify-between px-6 py-4 flex-wrap gap-2"
              style={{ borderBottom: '1px solid var(--hairline)', background: 'var(--surface-2)' }}
            >
              <h2 className="text-base font-semibold text-ink-900">İmtahan nəticələri</h2>
              <div className="flex items-center gap-3 flex-wrap">
                {resultsSaved && (
                  <Badge variant="success">
                    <Check className="w-3 h-3 mr-1" /> Nəticələr saxlandı
                  </Badge>
                )}
                {resultsError && (
                  <Badge variant="error">
                    <AlertCircle className="w-3 h-3 mr-1" /> {resultsError}
                  </Badge>
                )}
                <Button
                  variant="primary"
                  size="sm"
                  loading={savingResults}
                  disabled={savingResults}
                  onClick={saveResults}
                >
                  <Save className="w-4 h-4" /> Saxla
                </Button>
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
                          className="pastel-input tabular-nums"
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
            {/* Bottom save row */}
            <div
              className="flex justify-end px-6 py-4"
              style={{ borderTop: '1px solid var(--hairline)', background: 'var(--surface-2)' }}
            >
              <Button
                variant="primary"
                size="sm"
                loading={savingResults}
                disabled={savingResults}
                onClick={saveResults}
              >
                <Save className="w-4 h-4" /> Saxla
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  const filtered = exams.filter(e => !filterClass || e.class_id === filterClass)

  return (
    <div className="space-y-5">
      {/* ── Page header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-ink-900 tracking-tight leading-tight">
            İmtahanlar
          </h1>
          <p className="text-sm mt-1 text-ink-400">Siniflərinizdəki imtahanları idarə edin</p>
        </div>
        {teacherClasses.length > 0 && (
          <Button
            variant="primary"
            size="md"
            onClick={() => { setForm(emptyForm); setError(null); setAddModal(true) }}
          >
            <Plus className="w-4 h-4" /> İmtahan planla
          </Button>
        )}
      </div>

      {/* ── Class filter ── */}
      {uniqueClasses.length > 1 && (
        <div className="w-56">
          <select
            className="pastel-input"
            value={filterClass}
            onChange={e => setFilterClass(e.target.value)}
          >
            <option value="">Bütün siniflər</option>
            {uniqueClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      )}

      {/* ── Empty states ── */}
      {teacherClasses.length === 0 ? (
        <EmptyState
          tier={1}
          icon={ClipboardList}
          title="Sinif tapılmadı"
          description="Sizə hələ sinif təyin edilməyib."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          tier={1}
          icon={ClipboardList}
          title="İmtahan yoxdur"
          description="Hələ heç bir imtahan planlanmayıb."
          actionLabel="İmtahan planla"
          onAction={() => { setForm(emptyForm); setError(null); setAddModal(true) }}
        />
      ) : (
        /* ── Exam card grid ── */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(exam => (
            <div
              key={exam.id}
              className="bg-surface rounded-card border border-hairline hover:shadow-soft-lg hover:-translate-y-0.5 smooth-trans flex flex-col gap-0 overflow-hidden"
            >
              {/* Published status top bar */}
              <div
                className="h-1 w-full"
                style={{
                  background: exam.published ? 'var(--mint)' : 'var(--hairline-strong)',
                }}
              />
              <div className="p-5 flex flex-col gap-3 flex-1">
                {/* Card header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[15px] font-semibold truncate text-ink-900">{exam.title}</h3>
                    <p className="text-sm mt-0.5 text-ink-400">{exam.class?.name} · {exam.subject?.name}</p>
                  </div>
                  <Badge variant={exam.published ? 'success' : 'neutral'}>
                    {exam.published ? 'Dərc edilib' : 'Qaralama'}
                  </Badge>
                </div>

                {/* Meta row */}
                <div className="flex items-center gap-3 text-xs text-ink-400 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {formatDate(exam.exam_date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <ClockIcon className="w-3 h-3" /> {exam.duration_minutes} dəq
                  </span>
                  <span>
                    Max:{' '}
                    <strong className="text-brand-500 tabular-nums">{exam.max_score}</strong>
                  </span>
                </div>

                {/* Action row */}
                <div
                  className="flex items-center gap-2 flex-wrap pt-3 mt-auto"
                  style={{ borderTop: '1px solid var(--hairline)' }}
                >
                  <Button variant="secondary" size="sm" onClick={() => openResults(exam)}>
                    <ClipboardList className="w-3.5 h-3.5" /> Nəticələr
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => togglePublish(exam)}>
                    {exam.published
                      ? <><EyeOff className="w-3.5 h-3.5" /> Gizlət</>
                      : <><Eye className="w-3.5 h-3.5" /> Dərc et</>}
                  </Button>
                  <button
                    onClick={() => openEdit(exam)}
                    className="ml-auto p-2 rounded-tile smooth-trans text-ink-400 hover:text-brand-500 hover:bg-brand-50"
                    aria-label="Redaktə et"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteModal(exam)}
                    className="p-2 rounded-tile smooth-trans text-ink-400 hover:text-danger hover:bg-danger/10"
                    aria-label="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      <Modal
        open={addModal || !!editModal}
        onClose={() => { setAddModal(false); setEditModal(null); setError(null); setForm(emptyForm) }}
        title={editModal ? 'İmtahanı redaktə et' : 'İmtahan planla'}
        size="md"
      >
        <div className="space-y-4">
          {error && (
            <div className="flex items-center gap-1.5 text-sm text-danger">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}
          <div>
            <label className="block text-[13px] font-semibold mb-1.5 text-ink-400 uppercase tracking-[0.04em]">Başlıq *</label>
            <input
              className="pastel-input"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="İmtahan başlığı"
            />
          </div>
          <div>
            <label className="block text-[13px] font-semibold mb-1.5 text-ink-400 uppercase tracking-[0.04em]">Sinif *</label>
            <select
              className="pastel-input"
              value={form.class_id}
              onChange={e => setForm(f => ({ ...f, class_id: e.target.value, subject_id: '' }))}
            >
              <option value="">Sinif seçin</option>
              {uniqueClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-semibold mb-1.5 text-ink-400 uppercase tracking-[0.04em]">Fənn *</label>
            <select
              className="pastel-input"
              value={form.subject_id}
              onChange={e => setForm(f => ({ ...f, subject_id: e.target.value }))}
            >
              <option value="">Fənn seçin</option>
              {(form.class_id ? availableSubjectsForForm : teacherClasses.map(tc => tc.subject).filter(Boolean)).map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-semibold mb-1.5 text-ink-400 uppercase tracking-[0.04em]">Tarix *</label>
            <input
              type="date"
              className="pastel-input"
              value={form.exam_date}
              onChange={e => setForm(f => ({ ...f, exam_date: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-semibold mb-1.5 text-ink-400 uppercase tracking-[0.04em]">Müddət (dəq)</label>
              <input
                type="number"
                min={1}
                className="pastel-input tabular-nums"
                value={form.duration_minutes}
                onChange={e => setForm(f => ({ ...f, duration_minutes: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold mb-1.5 text-ink-400 uppercase tracking-[0.04em]">Maks bal</label>
              <input
                type="number"
                min={1}
                className="pastel-input tabular-nums"
                value={form.max_score}
                onChange={e => setForm(f => ({ ...f, max_score: e.target.value }))}
              />
            </div>
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={form.published}
              onChange={e => setForm(f => ({ ...f, published: e.target.checked }))}
              className="w-4 h-4 rounded"
              style={{ accentColor: 'var(--brand-500)' }}
            />
            <span className="text-sm text-ink-900">Şagirdlərə dərc et</span>
          </label>
          <div
            className="flex justify-end gap-2 pt-3"
            style={{ borderTop: '1px solid var(--hairline)' }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setAddModal(false); setEditModal(null); setError(null); setForm(emptyForm) }}
            >
              Ləğv et
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={saving}
              disabled={saving}
              onClick={handleSave}
            >
              {editModal ? 'Yenilə' : 'Planla'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Delete Confirm Modal ── */}
      <Modal
        open={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="İmtahanı sil"
        size="sm"
      >
        <div className="space-y-5">
          <p className="text-sm text-ink-600">
            <strong className="text-ink-900">{deleteModal?.title}</strong> imtahanını silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz.
          </p>
          <div
            className="flex justify-end gap-2"
            style={{ borderTop: '1px solid var(--hairline)', paddingTop: 16 }}
          >
            <Button variant="ghost" size="sm" onClick={() => setDeleteModal(null)}>Ləğv et</Button>
            <Button
              variant="danger"
              size="sm"
              loading={saving}
              disabled={saving}
              onClick={handleDelete}
            >
              Sil
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
