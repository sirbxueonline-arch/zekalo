import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, ClipboardList, Eye, EyeOff, ChevronLeft, Save, CalendarDays, Clock, Check } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import { Select } from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import Badge from '../../components/ui/Badge'
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
  const date = new Date(d)
  return fmtNumeric(date)
}

export default function AdminExams() {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [exams, setExams] = useState([])
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [filterClass, setFilterClass] = useState('')
  const [filterSubject, setFilterSubject] = useState('')
  const [sortKey, setSortKey] = useState('exam_date')
  const [sortDir, setSortDir] = useState('desc')

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }
  const [addModal, setAddModal] = useState(false)
  const [editModal, setEditModal] = useState(null)
  const [deleteModal, setDeleteModal] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  // Results view state
  const [resultsExam, setResultsExam] = useState(null)
  const [students, setStudents] = useState([])
  const [scores, setScores] = useState({}) // { student_id: { score, notes } }
  const [savingResults, setSavingResults] = useState(false)
  const [resultsLoading, setResultsLoading] = useState(false)
  const [resultsSaved, setResultsSaved] = useState(false)
  const [resultsError, setResultsError] = useState(null)

  useEffect(() => {
    if (profile?.school_id) fetchData()
  }, [profile?.school_id])

  async function fetchData() {
    try {
      setLoading(true)
      const [examsRes, classesRes, subjectsRes] = await Promise.all([
        supabase
          .from('exams')
          .select('*, class:classes(id, name), subject:subjects(id, name)')
          .eq('school_id', profile.school_id)
          .order('exam_date', { ascending: false })
          .limit(200),
        supabase.from('classes').select('id, name').eq('school_id', profile.school_id).order('name'),
        supabase.from('subjects').select('id, name').eq('school_id', profile.school_id).order('name'),
      ])
      setExams(examsRes.data || [])
      setClasses(classesRes.data || [])
      setSubjects(subjectsRes.data || [])
    } catch (err) {
      console.error(err)
      setError('Xəta baş verdi')
    } finally {
      setLoading(false)
    }
  }

  async function openResults(exam) {
    setResultsExam(exam)
    setResultsLoading(true)
    try {
      const [membersRes, resultsRes] = await Promise.all([
        supabase
          .from('class_members')
          .select('student:profiles(id, full_name)')
          .eq('class_id', exam.class_id)
          .limit(500),
        supabase.from('exam_results').select('*').eq('exam_id', exam.id).limit(500),
      ])
      const studentList = (membersRes.data || []).map(m => m.student).filter(Boolean)
      studentList.sort((a, b) => a.full_name.localeCompare(b.full_name))
      setStudents(studentList)
      const scoreMap = {}
      ;(resultsRes.data || []).forEach(r => {
        scoreMap[r.student_id] = { score: r.score ?? '', notes: r.notes ?? '' }
      })
      setScores(scoreMap)
    } catch (err) {
      console.error(err)
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
        const { error: err } = await supabase
          .from('exam_results')
          .upsert(rows, { onConflict: 'exam_id,student_id' })
        if (err) throw err
      }
      setResultsSaved(true)
      setResultsError(null)
      setTimeout(() => setResultsSaved(false), 3000)
    } catch (err) {
      console.error(err)
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
      await fetchData()
    } catch (err) {
      console.error(err)
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
      const { error: err } = await supabase.from('exams').delete().eq('id', deleteModal.id)
      if (err) throw err
      setDeleteModal(null)
      await fetchData()
    } catch (err) {
      console.error(err)
      setError('Silmə uğursuz oldu. Yenidən cəhd edin.')
    } finally {
      setSaving(false)
    }
  }

  async function togglePublish(exam) {
    try {
      await supabase.from('exams').update({ published: !exam.published }).eq('id', exam.id)
      setExams(prev => prev.map(e => e.id === exam.id ? { ...e, published: !e.published } : e))
    } catch (err) {
      console.error(err)
    }
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

  if (loading) return <PageSpinner />

  // Results view
  if (resultsExam) {
    return (
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <button
            onClick={() => setResultsExam(null)}
            className="flex items-center gap-1.5 text-sm text-ink-400 hover:text-brand-500 transition-colors mt-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Geri
          </button>
          <div>
            <h1 className="text-2xl font-display font-bold text-ink-900 tracking-tight">{resultsExam.title}</h1>
            <p className="text-sm text-ink-400 mt-0.5">
              {resultsExam.class?.name} · {resultsExam.subject?.name} · {formatDate(resultsExam.exam_date)} · Max: {resultsExam.max_score}
            </p>
          </div>
        </div>

        {resultsLoading ? (
          <PageSpinner />
        ) : students.length === 0 ? (
          <EmptyState tier={1} icon={ClipboardList} title="Şagird yoxdur" description="Bu sinfə heç bir şagird əlavə edilməyib." />
        ) : (
          <Card hover={false}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[15px] font-semibold text-ink-900">İmtahan nəticələri</h2>
              <div className="flex items-center gap-3">
                {resultsSaved && (
                  <span className="pill-mint text-xs inline-flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Nəticələr saxlandı
                  </span>
                )}
                {resultsError && (
                  <span className="pill-rose text-xs">{resultsError}</span>
                )}
                <Button size="sm" onClick={saveResults} loading={savingResults}>
                  <Save className="w-4 h-4 mr-1.5" />
                  Saxla
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto rounded-tile border border-hairline">
              <table className="pastel-table w-full">
                <thead>
                  <tr>
                    <th className="text-left">Şagird</th>
                    <th className="text-center">
                      Bal (max: {resultsExam.max_score})
                    </th>
                    <th className="text-left">Qeyd</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => (
                    <tr key={student.id}>
                      <td className="font-medium text-ink-900">{student.full_name}</td>
                      <td className="text-center">
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
                          className="pastel-input w-24 text-center tabular-nums"
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
                          className="pastel-input w-full"
                          placeholder="Qeyd əlavə et..."
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    )
  }

  const filtered = exams
    .filter(e => {
      if (filterClass && e.class_id !== filterClass) return false
      if (filterSubject && e.subject_id !== filterSubject) return false
      return true
    })
    .sort((a, b) => {
      const av = a[sortKey] ?? ''
      const bv = b[sortKey] ?? ''
      const cmp = String(av).localeCompare(String(bv), 'az')
      return sortDir === 'asc' ? cmp : -cmp
    })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink-900 tracking-tight">İmtahanlar</h1>
          <p className="text-sm text-ink-400 mt-0.5">Məktəb imtahanlarını idarə edin</p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setForm(emptyForm)
            setError(null)
            setAddModal(true)
          }}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          İmtahan planla
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="w-44">
          <Select value={filterClass} onChange={e => setFilterClass(e.target.value)}>
            <option value="">Bütün siniflər</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </div>
        <div className="w-44">
          <Select value={filterSubject} onChange={e => setFilterSubject(e.target.value)}>
            <option value="">Bütün fənlər</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </Select>
        </div>
        <div className="flex gap-2 ml-auto">
          {[['title', 'Başlıq'], ['exam_date', 'Tarix']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => handleSort(key)}
              className={`px-3 py-1.5 rounded-pill text-xs font-semibold transition-colors flex items-center gap-1 border ${
                sortKey === key
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'bg-surface text-ink-600 border-hairline-strong hover:border-brand-300 hover:text-brand-600'
              }`}
            >
              {label}
              {sortKey === key && <span className="text-[10px]">{sortDir === 'asc' ? '▲' : '▼'}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Exams list */}
      {filtered.length === 0 ? (
        <EmptyState
          tier={1}
          icon={ClipboardList}
          title="İmtahan yoxdur"
          description="Hələ heç bir imtahan planlanmayıb."
          actionLabel="İmtahan planla"
          onAction={() => { setForm(emptyForm); setError(null); setAddModal(true) }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(exam => (
            <div key={exam.id} className="liquid-card p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[15px] text-ink-900 truncate">{exam.title}</h3>
                  <p className="text-xs text-ink-400 mt-0.5">{exam.class?.name} · {exam.subject?.name}</p>
                </div>
                <Badge variant={exam.published ? 'present' : 'default'}>
                  {exam.published ? 'Dərc edilib' : 'Qaralama'}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-xs text-ink-600">
                <span className="flex items-center gap-1">
                  <CalendarDays className="w-3.5 h-3.5 text-ink-400" />
                  {formatDate(exam.exam_date)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-ink-400" />
                  {exam.duration_minutes} dəq
                </span>
                <span className="text-ink-400">Max: <span className="font-semibold text-ink-700 tabular-nums">{exam.max_score}</span></span>
              </div>

              <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-hairline">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openResults(exam)}
                >
                  <ClipboardList className="w-3.5 h-3.5 mr-1" />
                  Nəticələr
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => togglePublish(exam)}
                >
                  {exam.published ? (
                    <><EyeOff className="w-3.5 h-3.5 mr-1" />Gizlət</>
                  ) : (
                    <><Eye className="w-3.5 h-3.5 mr-1" />Dərc et</>
                  )}
                </Button>
                <button
                  onClick={() => openEdit(exam)}
                  className="p-2 text-ink-400 hover:text-brand-500 transition-colors rounded-tile hover:bg-brand-50"
                  aria-label="Redaktə et"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteModal(exam)}
                  className="p-2 text-ink-400 hover:text-danger-text transition-colors rounded-tile hover:bg-danger-tint"
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
      <Modal
        open={addModal || !!editModal}
        onClose={() => { setAddModal(false); setEditModal(null); setError(null) }}
        title={editModal ? 'İmtahanı redaktə et' : 'İmtahan planla'}
        size="md"
      >
        <div className="space-y-4">
          {error && (
            <p className="text-sm text-danger-text bg-danger-tint border border-danger/20 px-4 py-2.5 rounded-input">
              {error}
            </p>
          )}
          <Input
            label="Başlıq *"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Məsələn: Riyaziyyat yarımillik imtahanı"
          />
          <Select
            label="Sinif *"
            value={form.class_id}
            onChange={e => setForm(f => ({ ...f, class_id: e.target.value }))}
          >
            <option value="">Sinif seçin</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Select
            label="Fənn *"
            value={form.subject_id}
            onChange={e => setForm(f => ({ ...f, subject_id: e.target.value }))}
          >
            <option value="">Fənn seçin</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
          <Input
            label="Tarix *"
            type="date"
            value={form.exam_date}
            onChange={e => setForm(f => ({ ...f, exam_date: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Müddət (dəqiqə)"
              type="number"
              min={1}
              value={form.duration_minutes}
              onChange={e => setForm(f => ({ ...f, duration_minutes: e.target.value }))}
            />
            <Input
              label="Maksimum bal"
              type="number"
              min={1}
              value={form.max_score}
              onChange={e => setForm(f => ({ ...f, max_score: e.target.value }))}
            />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.published}
              onChange={e => setForm(f => ({ ...f, published: e.target.checked }))}
              className="w-4 h-4 accent-brand-500 rounded"
            />
            <span className="text-sm text-ink-700">Şagirdlərə dərc et</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => { setAddModal(false); setEditModal(null); setError(null) }}>
              Ləğv et
            </Button>
            <Button onClick={handleSave} loading={saving}>
              {editModal ? 'Yenilə' : 'Planla'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="İmtahanı sil"
        size="sm"
      >
        <p className="text-sm text-ink-600 mb-6">
          <strong className="text-ink-900">{deleteModal?.title}</strong> imtahanını silmək istədiyinizə əminsiniz? Bütün nəticələr də silinəcək.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeleteModal(null)}>Ləğv et</Button>
          <Button variant="danger" onClick={handleDelete} loading={saving}>Sil</Button>
        </div>
      </Modal>
    </div>
  )
}
