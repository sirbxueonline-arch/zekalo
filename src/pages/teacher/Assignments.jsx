import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { notifyUsers } from '../../lib/notify'
import {
  ClipboardList, Plus, Sparkles, Loader2, Filter, Eye, BarChart2, Clock,
  CheckSquare, Paperclip, Download, Check, AlertCircle, Save, Trash2, Users, BookOpen, X,
} from 'lucide-react'
import EmptyState from '../../components/ui/EmptyState'
import StatCard from '../../components/ui/StatCard'

// ── Helpers ─────────────────────────────────────────────────────────────────

function DueDateChip({ dueDate }) {
  if (!dueDate) return null
  const now = new Date()
  const due = new Date(dueDate)
  const diffMs = due.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0)
  const diffDays = Math.round(diffMs / 86400000)

  if (diffDays < 0) {
    return (
      <span className="pill-danger">
        <Clock className="w-3 h-3" /> {Math.abs(diffDays)} gün keçdi
      </span>
    )
  }
  if (diffDays === 0) {
    return (
      <span className="pill-warning">
        <Clock className="w-3 h-3" /> Bu gün!
      </span>
    )
  }
  return (
    <span className="pill-neutral">
      <Clock className="w-3 h-3" /> {diffDays} gün qaldı
    </span>
  )
}

function SubStatusBadge({ status }) {
  const map = {
    graded:    'pill-success',
    submitted: 'pill-brand',
    late:      'pill-warning',
  }
  const labelMap = {
    graded: 'Qiymətləndirildi',
    submitted: 'Təhvil verildi',
    late: 'Gecikən',
  }
  return <span className={map[status] || 'pill-neutral'}>{labelMap[status] || status || 'Naməlum'}</span>
}

function getAssignmentStatus(assignment) {
  if (!assignment.due_date) return 'active'
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const due = new Date(assignment.due_date)
  due.setHours(0, 0, 0, 0)
  const diff = Math.round((due - now) / 86400000)
  if (diff < 0) return 'overdue'
  const allGraded = assignment.submissionCount > 0 &&
    assignment.ungradedCount === 0 &&
    assignment.submissionCount === assignment.totalStudents
  if (allGraded) return 'completed'
  return 'active'
}

const STATUS_BORDER_COLOR = {
  overdue:   'var(--danger)',
  active:    'var(--brand-500)',
  completed: 'var(--mint)',
}
const STATUS_PILL_CLASS = {
  overdue:   'pill-danger',
  active:    'pill-brand',
  completed: 'pill-success',
}
const STATUS_LABEL = {
  overdue: 'Gecikib',
  active: 'Aktiv',
  completed: 'Tamamlandı',
}

function AssignmentCard({ assignment, onClick, onDelete }) {
  const subjectName   = assignment.subject?.name || ''
  const className     = assignment.class?.name   || ''
  const ungradedCount = assignment.ungradedCount || 0
  const status        = getAssignmentStatus(assignment)

  const submitted  = assignment.submissionCount || 0
  const total      = assignment.totalStudents   || 0
  const pct        = total > 0 ? Math.round((submitted / total) * 100) : 0

  const progressColor = status === 'overdue'
    ? 'var(--danger)'
    : status === 'completed'
    ? 'var(--mint)'
    : 'var(--brand-500)'

  return (
    <div
      className="liquid-card p-5 cursor-pointer overflow-hidden flex flex-col hover:-translate-y-0.5 transition-transform duration-150"
      style={{ borderLeft: `3px solid ${STATUS_BORDER_COLOR[status]}` }}
      onClick={() => onClick(assignment)}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={STATUS_PILL_CLASS[status]}>{STATUS_LABEL[status]}</span>
          {subjectName && (
            <span className="pill-neutral">
              <BookOpen className="w-2.5 h-2.5" /> {subjectName}
            </span>
          )}
          {className && (
            <span className="pill-neutral">{className}</span>
          )}
        </div>
        <button
          onClick={e => { e.stopPropagation(); onDelete(assignment) }}
          className="p-1.5 rounded-tile transition-colors duration-150 text-ink-400 hover:text-danger hover:bg-danger/10"
          aria-label="Sil"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <h3 className="text-base font-bold leading-snug mb-1.5 text-ink-900">
        {assignment.title}
      </h3>

      {assignment.description && (
        <p
          className="text-sm leading-relaxed text-ink-600"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {assignment.description}
        </p>
      )}

      <div className="flex-1" />

      <div className="flex items-center justify-between mt-4 mb-3 gap-2 flex-wrap">
        <DueDateChip dueDate={assignment.due_date} />
        <span className="pill-neutral">
          <Users className="w-3 h-3" /> {submitted}/{total} təhvil
        </span>
      </div>

      <div className="h-1.5 w-full rounded-full overflow-hidden bg-hairline">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: progressColor }}
        />
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-hairline">
        <span className="text-xs text-ink-400 tabular-nums">{pct}% tamamlandı</span>
        <div className="flex items-center gap-2">
          {ungradedCount > 0 && (
            <span className="pill-warning">{ungradedCount} gözləyir</span>
          )}
          <button
            className="flex items-center gap-1 text-xs font-semibold text-brand-500 hover:text-brand-600 transition-colors"
            onClick={e => { e.stopPropagation(); onClick(assignment) }}
          >
            <Eye className="w-3.5 h-3.5" /> Bax
          </button>
        </div>
      </div>
    </div>
  )
}

const FILTERS = [
  { key: 'all',       label: 'Hamısı'             },
  { key: 'active',    label: 'Aktiv'              },
  { key: 'ungraded',  label: 'Qiymətləndirilməyib' },
  { key: 'finished',  label: 'Bitmiş'             },
]

export default function TeacherAssignments() {
  const { profile, t } = useAuth()

  const [loading, setLoading]                 = useState(true)
  const [teacherClasses, setTeacherClasses]   = useState([])
  const [assignments, setAssignments]         = useState([])
  const [showNewModal, setShowNewModal]       = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [detailSubmissions, setDetailSubmissions]   = useState([])
  const [saving, setSaving]                   = useState(false)
  const [saveError, setSaveError]             = useState(null)
  const [aiLoading, setAiLoading]             = useState(null)
  const [activeFilter, setActiveFilter]       = useState('all')
  const [gradeStatus, setGradeStatus]         = useState({})
  const [teacherFeedback, setTeacherFeedback] = useState({})
  const [feedbackSaving, setFeedbackSaving]   = useState(null)
  const [deleteTarget, setDeleteTarget]       = useState(null)
  const [deleting, setDeleting]               = useState(false)

  const [newAssignment, setNewAssignment] = useState({
    title: '', description: '', class_id: '', subject_id: '',
    due_date: '', max_score: 10, notify: false,
  })

  useEffect(() => {
    if (!profile) return
    loadData()
  }, [profile])

  async function loadData() {
    const { data: tcData } = await supabase
      .from('teacher_classes')
      .select('*, class:classes(id, name), subject:subjects(id, name)')
      .eq('teacher_id', profile.id)

    setTeacherClasses(tcData || [])

    const classIds = (tcData || []).map(tc => tc.class_id)
    if (!classIds.length) { setLoading(false); return }

    const { data: assignData } = await supabase
      .from('assignments')
      .select('*, subject:subjects(name), class:classes(name)')
      .eq('teacher_id', profile.id)
      .order('created_at', { ascending: false })

    const assignIds = (assignData || []).map(a => a.id)

    let subCounts    = {}
    let ungradedMap  = {}

    if (assignIds.length) {
      const { data: subData } = await supabase
        .from('submissions')
        .select('assignment_id, status')
        .in('assignment_id', assignIds)

      ;(subData || []).forEach(s => {
        subCounts[s.assignment_id]   = (subCounts[s.assignment_id]   || 0) + 1
        if (s.status !== 'graded') {
          ungradedMap[s.assignment_id] = (ungradedMap[s.assignment_id] || 0) + 1
        }
      })
    }

    const classCounts = {}
    for (const cid of [...new Set(classIds)]) {
      const { count } = await supabase
        .from('class_members')
        .select('id', { count: 'exact', head: true })
        .eq('class_id', cid)
      classCounts[cid] = count || 0
    }

    setAssignments(
      (assignData || []).map(a => ({
        ...a,
        submissionCount: subCounts[a.id]   || 0,
        ungradedCount:   ungradedMap[a.id] || 0,
        totalStudents:   classCounts[a.class_id] || 0,
      }))
    )
    setLoading(false)
  }

  async function handleCreate() {
    setSaving(true)
    setSaveError(null)
    const { notify, ...rest } = newAssignment
    const { data: inserted, error } = await supabase.from('assignments').insert({
      title: rest.title.trim(),
      description: rest.description.trim() || null,
      class_id: rest.class_id,
      subject_id: rest.subject_id,
      due_date: rest.due_date || null,
      max_score: Number(rest.max_score),
      teacher_id: profile.id,
    }).select().single()

    if (error) {
      setSaveError(error.message)
    } else {
      setShowNewModal(false)
      setSaveError(null)
      const savedClassId = rest.class_id
      const savedTitle = rest.title.trim()
      const savedDueDate = rest.due_date || null
      const newAssignmentId = inserted?.id || null
      setNewAssignment({ title: '', description: '', class_id: '', subject_id: '', due_date: '', max_score: 10, notify: false })
      loadData()

      ;(async () => {
        try {
          const { data: members } = await supabase.from('class_members').select('student_id').eq('class_id', savedClassId)
          const notifications = (members || []).map(m => ({
            profile_id: m.student_id,
            school_id: profile.school_id,
            title: 'Yeni tapşırıq',
            body: `${savedTitle} — son tarix: ${savedDueDate || '—'}`,
            type: 'assignment',
            reference_id: newAssignmentId,
          }))
          await notifyUsers(notifications)
        } catch (err) {
          console.error('Assignment notification error:', err)
        }
      })()
    }
    setSaving(false)
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    const { error } = await supabase.from('assignments').delete().eq('id', deleteTarget.id)
    if (!error) {
      setAssignments(prev => prev.filter(a => a.id !== deleteTarget.id))
    }
    setDeleteTarget(null)
    setDeleting(false)
  }

  async function openDetail(assignment) {
    setSelectedAssignment(assignment)
    setGradeStatus({})
    setTeacherFeedback({})

    const { data: subs } = await supabase
      .from('submissions')
      .select('*')
      .eq('assignment_id', assignment.id)
      .order('submitted_at', { ascending: false })

    const submissions = subs || []

    let profileMap = {}
    if (submissions.length > 0) {
      const studentIds = [...new Set(submissions.map(s => s.student_id).filter(Boolean))]
      const { data: profileData } = await supabase.from('profiles').select('id, full_name').in('id', studentIds)
      ;(profileData || []).forEach(p => { profileMap[p.id] = p })
    }

    const merged = submissions.map(s => ({
      ...s,
      student: profileMap[s.student_id] || { id: s.student_id, full_name: 'Naməlum' },
    }))

    setDetailSubmissions(merged)

    const fb = {}
    merged.forEach(s => { if (s.feedback) fb[s.id] = s.feedback })
    setTeacherFeedback(fb)
    setShowDetailModal(true)
  }

  async function gradeSubmission(submissionId, score) {
    if (gradeStatus[submissionId] === 'saving') return
    const val = parseFloat(score)
    const maxScore = selectedAssignment?.max_score ?? Infinity
    if (isNaN(val) || val < 0 || val > maxScore) return
    setGradeStatus(prev => ({ ...prev, [submissionId]: 'saving' }))
    const { error } = await supabase
      .from('submissions')
      .update({ score: val, status: 'graded', graded_at: new Date().toISOString() })
      .eq('id', submissionId)
    if (error) {
      setGradeStatus(prev => ({ ...prev, [submissionId]: 'error' }))
      return
    }
    setGradeStatus(prev => ({ ...prev, [submissionId]: 'saved' }))
    setDetailSubmissions(prev =>
      prev.map(s => s.id === submissionId ? { ...s, score: val, status: 'graded' } : s)
    )
    setTimeout(() => setGradeStatus(prev => ({ ...prev, [submissionId]: null })), 2500)
  }

  async function saveTeacherFeedback(submissionId) {
    const text = teacherFeedback[submissionId] || ''
    setFeedbackSaving(submissionId)
    const { error } = await supabase
      .from('submissions')
      .update({ feedback: text || null })
      .eq('id', submissionId)
    if (!error) {
      setDetailSubmissions(prev =>
        prev.map(s => s.id === submissionId ? { ...s, feedback: text } : s)
      )
    }
    setFeedbackSaving(null)
  }

  async function generateAIFeedback(submission) {
    setAiLoading(submission.id)
    setTeacherFeedback(prev => ({ ...prev, [submission.id]: '' }))
    try {
      const contentPart = submission.content
        ? `Şagirdin cavabı:\n${submission.content}`
        : submission.file_url
        ? `Şagird fayl göndərib (fayl məzmunu burada göstərilmir).`
        : `Şagird cavab göndərib, lakin məzmun saxlanılmayıb.`

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/zeka-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            messages: [
              {
                role: 'user',
                content: `Sən müəllim köməkçisisən. Aşağıdakı tapşırıq üçün şagirdə qısa Azərbaycan dilində rəy ver.\n\nTapşırıq: ${selectedAssignment.title}\n${selectedAssignment.description ? `Açıqlama: ${selectedAssignment.description}` : ''}\n\n${contentPart}`,
              },
            ],
            userProfile: profile,
            mode: 'assignment_feedback',
            language: 'az',
          }),
        }
      )

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '))
        for (const line of lines) {
          try {
            const parsed = JSON.parse(line.slice(6))
            if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
              fullContent += parsed.delta.text
              setTeacherFeedback(prev => ({ ...prev, [submission.id]: fullContent }))
            }
          } catch {}
        }
      }

      if (fullContent) {
        await supabase.from('submissions').update({ feedback: fullContent }).eq('id', submission.id)
        setDetailSubmissions(prev =>
          prev.map(s => s.id === submission.id ? { ...s, feedback: fullContent } : s)
        )
      }
    } catch {
      const errMsg = 'AI rəyi əldə edilə bilmədi. Yenidən cəhd edin.'
      setTeacherFeedback(prev => ({ ...prev, [submission.id]: errMsg }))
    } finally {
      setAiLoading(null)
    }
  }

  const formatDate = (d) => {
    if (!d) return ''
    const dt = new Date(d)
    if (isNaN(dt.getTime())) return ''
    return `${String(dt.getDate()).padStart(2, '0')}.${String(dt.getMonth() + 1).padStart(2, '0')}.${dt.getFullYear()}`
  }

  const isThisWeek = (dueDate) => {
    if (!dueDate) return false
    const now  = new Date()
    const due  = new Date(dueDate)
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay() + 1)
    startOfWeek.setHours(0, 0, 0, 0)
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)
    return due >= startOfWeek && due <= endOfWeek
  }

  const isActive = (a) => {
    if (!a.due_date) return true
    return new Date(a.due_date) >= new Date(new Date().setHours(0, 0, 0, 0))
  }

  const totalCount    = assignments.length
  const ungradedTotal = assignments.reduce((acc, a) => acc + (a.ungradedCount || 0), 0)
  const thisWeekCount = assignments.filter(a => isThisWeek(a.due_date)).length
  const avgPct = assignments.length
    ? Math.round(
        assignments.reduce((acc, a) =>
          acc + (a.totalStudents > 0 ? (a.submissionCount / a.totalStudents) * 100 : 0), 0
        ) / assignments.length
      )
    : 0

  const filteredAssignments = assignments.filter(a => {
    if (activeFilter === 'active')   return isActive(a)
    if (activeFilter === 'ungraded') return (a.ungradedCount || 0) > 0
    if (activeFilter === 'finished') return !isActive(a)
    return true
  })

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="pastel-skeleton h-12 w-72 rounded-tile" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0,1,2,3].map(i => <div key={i} className="pastel-skeleton h-24 rounded-card" />)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[0,1,2,3].map(i => <div key={i} className="pastel-skeleton h-56 rounded-card" />)}
        </div>
      </div>
    )
  }

  const uniqueClasses = [...new Map(teacherClasses.map(tc => [tc.class_id, tc.class])).values()]
  const subjectsForClass = (classId) =>
    teacherClasses.filter(tc => tc.class_id === classId).map(tc => tc.subject)

  const submittedCount = detailSubmissions.length
  const gradedCount    = detailSubmissions.filter(s => s.status === 'graded').length
  const pendingCount   = submittedCount - gradedCount

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-ink-900">
          Tapşırıqlar
        </h1>
        <button onClick={() => setShowNewModal(true)} className="btn-pastel flex items-center gap-2">
          <Plus className="w-4 h-4" /> Yeni tapşırıq
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Ümumi tapşırıq" value={totalCount} icon={ClipboardList} tone="periwinkle" />
        <StatCard label="Gözləyən qiymətləndir." value={ungradedTotal} icon={Clock} tone="peach" />
        <StatCard label="Bu həftə son tarix" value={thisWeekCount} icon={CheckSquare} tone="periwinkle" />
        <StatCard label="Ortalama təhvil %" value={`${avgPct}%`} icon={BarChart2} tone="periwinkle" />
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-ink-400" />
        <div className="pastel-tabs">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={activeFilter === f.key ? 'pastel-tab active' : 'pastel-tab'}
            >
              {f.label}
              {f.key === 'ungraded' && ungradedTotal > 0 && (
                <span
                  className="ml-1.5 inline-flex items-center justify-center text-[10px] font-bold px-1.5 py-0.5 rounded-pill"
                  style={{
                    background: activeFilter === f.key ? 'rgba(255,255,255,0.25)' : 'rgba(250,204,21,0.25)',
                    color: activeFilter === f.key ? '#fff' : '#92400e',
                  }}
                >
                  {ungradedTotal}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Assignment grid / empty state */}
      {filteredAssignments.length === 0 ? (
        <EmptyState
          tier={1}
          icon={ClipboardList}
          title={
            activeFilter === 'all' ? 'Hələ tapşırıq əlavə edilməyib' :
            activeFilter === 'active' ? 'Aktiv tapşırıq yoxdur' :
            activeFilter === 'ungraded' ? 'Qiymətləndirilməmiş tapşırıq yoxdur' :
            'Bitmiş tapşırıq yoxdur'
          }
          description={
            activeFilter === 'all'
              ? 'Şagirdlərə tapşırıq vermək üçün "Yeni tapşırıq" düyməsinə basın'
              : 'Filteri dəyişdirərək digər tapşırıqlara baxa bilərsiniz'
          }
          actionLabel={activeFilter === 'all' ? 'Yeni tapşırıq' : undefined}
          onAction={activeFilter === 'all' ? () => setShowNewModal(true) : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredAssignments.map(a => (
            <AssignmentCard key={a.id} assignment={a} onClick={openDetail} onDelete={setDeleteTarget} />
          ))}
        </div>
      )}

      {/* New assignment modal */}
      {showNewModal && (
        <div className="liquid-backdrop" onClick={() => { setShowNewModal(false); setSaveError(null) }}>
          <div
            className="bg-surface rounded-card shadow-modal w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-ink-900">Yeni tapşırıq</h3>
              <button
                onClick={() => { setShowNewModal(false); setSaveError(null) }}
                className="p-1.5 rounded-tile text-ink-400 hover:text-ink-700 hover:bg-canvas transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold mb-1.5 text-ink-700">Başlıq</label>
                <input className="pastel-input" placeholder="Tapşırığın adını daxil edin" value={newAssignment.title} onChange={e => setNewAssignment(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div>
                <label className="block text-[13px] font-semibold mb-1.5 text-ink-700">Açıqlama</label>
                <textarea className="pastel-input" rows={4} placeholder="Tapşırıq haqqında ətraflı məlumat..." value={newAssignment.description} onChange={e => setNewAssignment(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-semibold mb-1.5 text-ink-700">Sinif</label>
                  <select className="pastel-input" value={newAssignment.class_id} onChange={e => setNewAssignment(p => ({ ...p, class_id: e.target.value, subject_id: '' }))}>
                    <option value="">Sinif seçin</option>
                    {uniqueClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold mb-1.5 text-ink-700">Fənn</label>
                  <select className="pastel-input" value={newAssignment.subject_id} onChange={e => setNewAssignment(p => ({ ...p, subject_id: e.target.value }))} disabled={!newAssignment.class_id}>
                    <option value="">Fənn seçin</option>
                    {subjectsForClass(newAssignment.class_id).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-semibold mb-1.5 text-ink-700">Son tarix</label>
                  <input type="date" className="pastel-input" value={newAssignment.due_date} onChange={e => setNewAssignment(p => ({ ...p, due_date: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold mb-1.5 text-ink-700">Maksimal bal</label>
                  <input type="number" min={1} max={100} className="pastel-input" value={newAssignment.max_score} onChange={e => setNewAssignment(p => ({ ...p, max_score: e.target.value }))} />
                </div>
              </div>

              {/* Toggle */}
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <button
                  type="button"
                  onClick={() => setNewAssignment(p => ({ ...p, notify: !p.notify }))}
                  className="relative transition-colors duration-200 flex-shrink-0"
                  style={{
                    width: 44, height: 24, borderRadius: 999,
                    background: newAssignment.notify ? 'var(--brand-500)' : 'var(--hairline-strong)',
                  }}
                >
                  <span
                    className="absolute top-1 transition-all duration-200"
                    style={{
                      width: 16, height: 16, borderRadius: '50%', background: '#fff',
                      left: newAssignment.notify ? 24 : 4,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.18)',
                    }}
                  />
                </button>
                <div>
                  <span className="text-sm font-medium text-ink-900">Valideyn/şagirdlərə bildiriş göndər</span>
                  <p className="text-xs text-ink-400">Tapşırıq yaradıldıqda avtomatik bildiriş</p>
                </div>
              </label>

              {saveError && (
                <p className="pill-danger flex items-center gap-1.5">
                  <AlertCircle className="w-3 h-3" /> {saveError}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-hairline">
                <button
                  onClick={() => { setShowNewModal(false); setSaveError(null) }}
                  className="btn-ghost-pastel"
                  style={{ padding: '10px 20px', fontSize: 13 }}
                >
                  Ləğv et
                </button>
                <button
                  onClick={handleCreate}
                  disabled={saving || !newAssignment.title || !newAssignment.class_id || !newAssignment.subject_id}
                  className="btn-pastel"
                  style={{ padding: '10px 22px', fontSize: 13, opacity: (saving || !newAssignment.title || !newAssignment.class_id || !newAssignment.subject_id) ? 0.5 : 1 }}
                >
                  {saving ? '...' : 'Yarat'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submission review modal */}
      {showDetailModal && selectedAssignment && (
        <div className="liquid-backdrop" onClick={() => setShowDetailModal(false)}>
          <div
            className="bg-surface rounded-card shadow-modal w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-ink-900">{selectedAssignment.title}</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1.5 rounded-tile text-ink-400 hover:text-ink-700 hover:bg-canvas transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 items-center mb-4">
              {selectedAssignment.class?.name && (
                <span className="pill-neutral">{selectedAssignment.class.name}</span>
              )}
              {selectedAssignment.subject?.name && (
                <span className="pill-brand">{selectedAssignment.subject.name}</span>
              )}
              {selectedAssignment.due_date && (
                <span className="text-xs text-ink-600">Son tarix: {formatDate(selectedAssignment.due_date)}</span>
              )}
              {selectedAssignment.max_score && (
                <span className="text-xs text-ink-600">Maks. bal: {selectedAssignment.max_score}</span>
              )}
            </div>

            {selectedAssignment.description && (
              <p className="text-sm rounded-tile p-3 mb-4 text-ink-700 bg-brand-50 border border-hairline">
                {selectedAssignment.description}
              </p>
            )}

            {/* Summary row */}
            <div className="flex items-center gap-4 py-3 px-4 rounded-tile mb-4 text-sm flex-wrap bg-canvas border border-hairline">
              <span className="text-ink-600">
                <span className="font-bold text-ink-900 tabular-nums">{submittedCount}</span> təhvil
              </span>
              <span className="w-px h-4 bg-hairline-strong" />
              <span className="text-ink-600">
                <span className="font-bold tabular-nums" style={{ color: 'var(--mint)' }}>{gradedCount}</span> qiymətləndirildi
              </span>
              <span className="w-px h-4 bg-hairline-strong" />
              <span className="text-ink-600">
                <span className="font-bold tabular-nums" style={{ color: 'var(--warning)' }}>{pendingCount}</span> gözləyir
              </span>
            </div>

            {detailSubmissions.length === 0 ? (
              <EmptyState
                tier={1}
                icon={ClipboardList}
                title="Hələ heç bir cavab yoxdur"
                description="Şagirdlər tapşırığı təhvil verdikdə burada görünəcək"
              />
            ) : (
              <div className="space-y-3">
                {detailSubmissions.map(sub => {
                  const status = gradeStatus[sub.id]
                  const initials = (sub.student?.full_name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                  const submittedTime = sub.submitted_at
                    ? new Date(sub.submitted_at).toLocaleString('az-AZ', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                    : null
                  return (
                    <div key={sub.id} className="rounded-tile overflow-hidden border border-hairline">
                      {/* Sub-header */}
                      <div className="flex items-center justify-between gap-3 px-4 py-3 flex-wrap bg-canvas border-b border-hairline">
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="icon-chip icon-chip-periwinkle" style={{ width: 36, height: 36, fontSize: 12, fontWeight: 700 }}>
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <span className="text-sm font-semibold block text-ink-900">{sub.student?.full_name}</span>
                            {submittedTime && (
                              <span className="text-[11px] flex items-center gap-1 mt-0.5 text-ink-400">
                                <Clock className="w-2.5 h-2.5" /> {submittedTime}
                              </span>
                            )}
                          </div>
                          <SubStatusBadge status={sub.status} />
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {status === 'saved' && (
                            <span className="pill-success"><Check className="w-3 h-3" /> Saxlandı</span>
                          )}
                          {status === 'error' && (
                            <span className="pill-danger"><AlertCircle className="w-3 h-3" /> Xəta</span>
                          )}
                          <div className="flex items-center gap-1.5 rounded-tile px-3 py-1.5 bg-surface border border-hairline">
                            <input
                              key={sub.id}
                              type="number"
                              min={0}
                              max={selectedAssignment?.max_score || 10}
                              defaultValue={sub.score ?? ''}
                              placeholder="—"
                              className="w-12 text-sm text-center font-bold focus:outline-none bg-transparent transition-colors"
                              style={{
                                color: status === 'saving' ? 'var(--brand-500)'
                                     : status === 'saved' ? 'var(--mint)'
                                     : status === 'error' ? 'var(--danger)'
                                     : 'var(--ink-900)',
                              }}
                              onBlur={e => gradeSubmission(sub.id, e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && e.target.blur()}
                            />
                            <span className="text-xs font-medium text-ink-400">/ {selectedAssignment?.max_score}</span>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="px-4 py-3 space-y-3 bg-surface">
                        {sub.file_url && (
                          <a
                            href={sub.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-tile text-sm font-medium transition-colors bg-brand-50 text-brand-600 border border-hairline hover:bg-brand-100"
                          >
                            <Paperclip className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate max-w-[240px]">{sub.file_url.split('/').pop()?.split('?')[0] || 'Fayl'}</span>
                            <Download className="w-3.5 h-3.5 flex-shrink-0 ml-auto" />
                          </a>
                        )}

                        {sub.content && (
                          <p className="text-sm rounded-tile p-3 leading-relaxed whitespace-pre-wrap text-ink-700 bg-canvas">
                            {sub.content}
                          </p>
                        )}

                        {!sub.content && !sub.file_url && (
                          <div className="flex items-center gap-2 px-3 py-2 rounded-tile bg-warning/10 border border-warning/25">
                            <AlertCircle className="w-4 h-4 flex-shrink-0 text-warning" />
                            <p className="text-xs text-ink-700">
                              Şagird fayl yükləyib, lakin keçmiş cavablar üçün fayl linki saxlanılmayıb. Yeni göndərmələr düzgün görünəcək.
                            </p>
                          </div>
                        )}

                        <div>
                          <label className="block text-[13px] font-semibold mb-1.5 text-ink-700">Müəllim rəyi</label>
                          <textarea
                            rows={2}
                            placeholder="Şagirdə rəy yazın..."
                            value={teacherFeedback[sub.id] ?? (sub.feedback && !sub.feedback.startsWith('AI') ? sub.feedback : '')}
                            onChange={e => setTeacherFeedback(prev => ({ ...prev, [sub.id]: e.target.value }))}
                            className="pastel-input"
                            style={{ resize: 'none' }}
                          />
                          <div className="flex justify-end mt-2 gap-2">
                            <button
                              onClick={() => generateAIFeedback(sub)}
                              disabled={aiLoading === sub.id}
                              className="btn-ghost-pastel flex items-center gap-1.5"
                              style={{ padding: '6px 12px', fontSize: 12, opacity: aiLoading === sub.id ? 0.5 : 1 }}
                            >
                              {aiLoading === sub.id
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <Sparkles className="w-3.5 h-3.5" />
                              }
                              AI rəyi
                            </button>
                            <button
                              onClick={() => saveTeacherFeedback(sub.id)}
                              disabled={feedbackSaving === sub.id}
                              className="btn-pastel flex items-center gap-1.5"
                              style={{ padding: '6px 14px', fontSize: 12, opacity: feedbackSaving === sub.id ? 0.5 : 1 }}
                            >
                              <Save className="w-3.5 h-3.5" /> Rəyi saxla
                            </button>
                          </div>
                        </div>

                        {sub.feedback && (
                          <div className="rounded-tile p-3 bg-brand-50 border border-brand-100">
                            <p className="text-xs font-bold mb-1.5 flex items-center gap-1 text-brand-600">
                              <Sparkles className="w-3.5 h-3.5" /> Mövcud rəy
                            </p>
                            <p className="text-sm whitespace-pre-wrap leading-relaxed text-ink-900">{sub.feedback}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteTarget && (
        <div className="liquid-backdrop" onClick={() => setDeleteTarget(null)}>
          <div
            className="bg-surface rounded-card shadow-modal w-full max-w-sm p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="icon-chip icon-chip-coral" style={{ width: 40, height: 40 }}>
                <Trash2 className="w-5 h-5" />
              </span>
              <h3 className="text-lg font-bold text-ink-900">Tapşırığı sil</h3>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-tile mb-5 bg-danger/8 border border-danger/25">
              <div>
                <p className="text-sm font-semibold text-ink-900">{deleteTarget.title}</p>
                <p className="text-xs mt-1 text-danger">
                  Bu tapşırıq və bütün təhvil edilmiş cavablar birdəfəlik silinəcək.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="btn-ghost-pastel"
                style={{ padding: '10px 20px', fontSize: 13 }}
              >
                Ləğv et
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-pill font-semibold text-white text-sm transition-opacity"
                style={{
                  background: 'var(--danger)',
                  boxShadow: '0 1px 2px rgba(20,22,40,.08)',
                  opacity: deleting ? 0.5 : 1,
                }}
              >
                <Trash2 className="w-4 h-4" /> {deleting ? '...' : 'Sil'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
