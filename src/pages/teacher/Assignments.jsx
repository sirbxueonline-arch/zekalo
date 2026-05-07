import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { notifyUsers } from '../../lib/notify'
import {
  ClipboardList, Plus, Sparkles, Loader2, Filter, Eye, BarChart2, Clock,
  CheckSquare, Paperclip, Download, Check, AlertCircle, Save, Trash2, Users, BookOpen, X,
} from 'lucide-react'

// ── Helpers ─────────────────────────────────────────────────────────────────

function DueDateChip({ dueDate }) {
  if (!dueDate) return null
  const now = new Date()
  const due = new Date(dueDate)
  const diffMs = due.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0)
  const diffDays = Math.round(diffMs / 86400000)

  if (diffDays < 0) {
    return (
      <span className="pastel-badge pastel-badge-rose">
        <Clock className="w-3 h-3" /> {Math.abs(diffDays)} gün keçdi
      </span>
    )
  }
  if (diffDays === 0) {
    return (
      <span className="pastel-badge pastel-badge-peach">
        <Clock className="w-3 h-3" /> Bu gün!
      </span>
    )
  }
  return (
    <span className="pastel-badge pastel-badge-slate">
      <Clock className="w-3 h-3" /> {diffDays} gün qaldı
    </span>
  )
}

function SubStatusBadge({ status }) {
  const map = {
    graded:    'pastel-badge pastel-badge-mint',
    submitted: 'pastel-badge pastel-badge-periwinkle',
    late:      'pastel-badge pastel-badge-peach',
  }
  const labelMap = {
    graded: 'Qiymətləndirildi',
    submitted: 'Təhvil verildi',
    late: 'Gecikən',
  }
  return <span className={map[status] || 'pastel-badge pastel-badge-slate'}>{labelMap[status] || status || 'Naməlum'}</span>
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
  overdue:   '#e56b7f',
  active:    '#7c6ee0',
  completed: '#5db8a3',
}
const STATUS_BADGE_CLASS = {
  overdue:   'pastel-badge pastel-badge-rose',
  active:    'pastel-badge pastel-badge-periwinkle',
  completed: 'pastel-badge pastel-badge-mint',
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

  return (
    <div
      className="liquid-card p-5 cursor-pointer overflow-hidden flex flex-col"
      style={{ borderLeft: `4px solid ${STATUS_BORDER_COLOR[status]}` }}
      onClick={() => onClick(assignment)}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={STATUS_BADGE_CLASS[status]}>{STATUS_LABEL[status]}</span>
          {subjectName && (
            <span className="pastel-badge pastel-badge-slate">
              <BookOpen className="w-2.5 h-2.5" /> {subjectName}
            </span>
          )}
          {className && (
            <span className="pastel-badge pastel-badge-blue">{className}</span>
          )}
        </div>
        <button
          onClick={e => { e.stopPropagation(); onDelete(assignment) }}
          className="p-1.5 rounded-lg smooth-trans"
          style={{ color: '#cbd5e1' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#e56b7f'; e.currentTarget.style.background = 'rgba(229,107,127,0.08)' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#cbd5e1'; e.currentTarget.style.background = 'transparent' }}
          aria-label="Sil"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <h3 className="text-base font-bold leading-snug mb-1.5" style={{ color: '#1a1a2e' }}>
        {assignment.title}
      </h3>

      {assignment.description && (
        <p
          className="text-sm leading-relaxed"
          style={{
            color: '#64748b',
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
        <span className="pastel-badge pastel-badge-slate">
          <Users className="w-3 h-3" /> {submitted}/{total} təhvil
        </span>
      </div>

      <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'rgba(124,110,224,0.10)' }}>
        <div
          className="h-full rounded-full smooth-trans"
          style={{
            width: `${pct}%`,
            background: status === 'overdue'
              ? 'linear-gradient(90deg, #e56b7f, #d85268)'
              : status === 'completed'
              ? 'linear-gradient(90deg, #5db8a3, #6b9dde)'
              : 'linear-gradient(90deg, #7c6ee0, #5db8a3)',
          }}
        />
      </div>

      <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid rgba(124,110,224,0.08)' }}>
        <span className="text-xs" style={{ color: '#94a3b8' }}>{pct}% tamamlandı</span>
        <div className="flex items-center gap-2">
          {ungradedCount > 0 && (
            <span className="pastel-badge pastel-badge-peach">{ungradedCount} gözləyir</span>
          )}
          <button
            className="flex items-center gap-1 text-xs font-semibold smooth-trans hover:opacity-70"
            style={{ color: '#7c6ee0' }}
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
        <div className="pastel-skeleton h-12 w-72" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0,1,2,3].map(i => <div key={i} className="pastel-skeleton h-24" />)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[0,1,2,3].map(i => <div key={i} className="pastel-skeleton h-56" />)}
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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: '#1a1a2e' }}>
          <span className="pastel-text">Tapşırıqlar</span>
        </h1>
        <button onClick={() => setShowNewModal(true)} className="btn-pastel" style={{ padding: '12px 22px', fontSize: 13 }}>
          <Plus className="w-4 h-4" /> Yeni tapşırıq
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Ümumi tapşırıq', value: totalCount, icon: ClipboardList, chip: 'icon-chip-blue' },
          { label: 'Gözləyən qiymətləndir.', value: ungradedTotal, icon: Clock, chip: 'icon-chip-peach' },
          { label: 'Bu həftə son tarix', value: thisWeekCount, icon: CheckSquare, chip: 'icon-chip-mint' },
          { label: 'Ortalama təhvil %', value: `${avgPct}%`, icon: BarChart2, chip: 'icon-chip-periwinkle' },
        ].map((s, i) => (
          <div key={i} className="liquid-card p-4 flex items-center gap-4">
            <span className={`icon-chip ${s.chip}`}>
              <s.icon className="w-5 h-5" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: '#64748b' }}>{s.label}</p>
              <p className="text-2xl font-bold mt-0.5" style={{ color: '#1a1a2e' }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4" style={{ color: '#94a3b8' }} />
        <div className="pastel-tabs">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={activeFilter === f.key ? 'pastel-tab active' : 'pastel-tab'}
            >
              {f.label}
              {f.key === 'ungraded' && ungradedTotal > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{
                    background: activeFilter === f.key ? 'rgba(255,255,255,0.25)' : 'rgba(232,168,124,0.25)',
                    color: activeFilter === f.key ? '#fff' : '#b46a3e',
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
        <div className="liquid-card p-12">
          <div className="flex flex-col items-center justify-center text-center gap-4">
            <div className="icon-chip icon-chip-periwinkle" style={{ width: 72, height: 72 }}>
              <ClipboardList className="w-9 h-9" />
            </div>
            <div>
              <p className="text-base font-semibold" style={{ color: '#1a1a2e' }}>
                {activeFilter === 'all' ? 'Hələ tapşırıq əlavə edilməyib' :
                 activeFilter === 'active' ? 'Aktiv tapşırıq yoxdur' :
                 activeFilter === 'ungraded' ? 'Qiymətləndirilməmiş tapşırıq yoxdur' :
                 'Bitmiş tapşırıq yoxdur'}
              </p>
              <p className="text-sm mt-1 max-w-sm mx-auto" style={{ color: '#94a3b8' }}>
                {activeFilter === 'all'
                  ? 'Şagirdlərə tapşırıq vermək üçün "Yeni tapşırıq" düyməsinə basın'
                  : 'Filteri dəyişdirərək digər tapşırıqlara baxa bilərsiniz'}
              </p>
            </div>
            {activeFilter === 'all' && (
              <button onClick={() => setShowNewModal(true)} className="btn-pastel" style={{ padding: '10px 20px', fontSize: 13 }}>
                <Plus className="w-4 h-4" /> Yeni tapşırıq
              </button>
            )}
          </div>
        </div>
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
          <div className="liquid-card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: '#1a1a2e' }}>Yeni tapşırıq</h3>
              <button onClick={() => { setShowNewModal(false); setSaveError(null) }} className="smooth-trans hover:opacity-70" style={{ color: '#64748b' }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#64748b' }}>Başlıq</label>
                <input className="pastel-input" placeholder="Tapşırığın adını daxil edin" value={newAssignment.title} onChange={e => setNewAssignment(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#64748b' }}>Açıqlama</label>
                <textarea className="pastel-input" rows={4} placeholder="Tapşırıq haqqında ətraflı məlumat..." value={newAssignment.description} onChange={e => setNewAssignment(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#64748b' }}>Sinif</label>
                  <select className="pastel-input" value={newAssignment.class_id} onChange={e => setNewAssignment(p => ({ ...p, class_id: e.target.value, subject_id: '' }))}>
                    <option value="">Sinif seçin</option>
                    {uniqueClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#64748b' }}>Fənn</label>
                  <select className="pastel-input" value={newAssignment.subject_id} onChange={e => setNewAssignment(p => ({ ...p, subject_id: e.target.value }))} disabled={!newAssignment.class_id}>
                    <option value="">Fənn seçin</option>
                    {subjectsForClass(newAssignment.class_id).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#64748b' }}>Son tarix</label>
                  <input type="date" className="pastel-input" value={newAssignment.due_date} onChange={e => setNewAssignment(p => ({ ...p, due_date: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#64748b' }}>Maksimal bal</label>
                  <input type="number" min={1} max={100} className="pastel-input" value={newAssignment.max_score} onChange={e => setNewAssignment(p => ({ ...p, max_score: e.target.value }))} />
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <button
                  type="button"
                  onClick={() => setNewAssignment(p => ({ ...p, notify: !p.notify }))}
                  className="relative smooth-trans"
                  style={{
                    width: 44, height: 24, borderRadius: 999,
                    background: newAssignment.notify ? 'linear-gradient(135deg, #7c6ee0, #5db8a3)' : 'rgba(124,110,224,0.18)',
                    boxShadow: newAssignment.notify ? '0 4px 12px rgba(124,110,224,0.25)' : 'none',
                  }}
                >
                  <span
                    className="absolute top-1 smooth-trans"
                    style={{
                      width: 16, height: 16, borderRadius: '50%', background: '#fff',
                      left: newAssignment.notify ? 24 : 4,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                    }}
                  />
                </button>
                <div>
                  <span className="text-sm font-medium" style={{ color: '#1a1a2e' }}>Valideyn/şagirdlərə bildiriş göndər</span>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Tapşırıq yaradıldıqda avtomatik bildiriş</p>
                </div>
              </label>

              {saveError && <p className="pastel-badge pastel-badge-rose"><AlertCircle className="w-3 h-3" /> {saveError}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => { setShowNewModal(false); setSaveError(null) }} className="btn-ghost-pastel" style={{ padding: '10px 20px', fontSize: 13 }}>Ləğv et</button>
                <button onClick={handleCreate} disabled={saving || !newAssignment.title || !newAssignment.class_id || !newAssignment.subject_id} className="btn-pastel" style={{ padding: '10px 22px', fontSize: 13, opacity: (saving || !newAssignment.title || !newAssignment.class_id || !newAssignment.subject_id) ? 0.5 : 1 }}>
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
          <div className="liquid-card p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: '#1a1a2e' }}>{selectedAssignment.title}</h3>
              <button onClick={() => setShowDetailModal(false)} className="smooth-trans hover:opacity-70" style={{ color: '#64748b' }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 items-center mb-4">
              {selectedAssignment.class?.name && (
                <span className="pastel-badge pastel-badge-blue">{selectedAssignment.class.name}</span>
              )}
              {selectedAssignment.subject?.name && (
                <span className="pastel-badge pastel-badge-periwinkle">{selectedAssignment.subject.name}</span>
              )}
              {selectedAssignment.due_date && (
                <span className="text-xs" style={{ color: '#64748b' }}>Son tarix: {formatDate(selectedAssignment.due_date)}</span>
              )}
              {selectedAssignment.max_score && (
                <span className="text-xs" style={{ color: '#64748b' }}>Maks. bal: {selectedAssignment.max_score}</span>
              )}
            </div>

            {selectedAssignment.description && (
              <p className="text-sm rounded-xl p-3 mb-4" style={{ color: '#475569', background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(124,110,224,0.10)' }}>
                {selectedAssignment.description}
              </p>
            )}

            <div className="flex items-center gap-4 py-3 px-4 rounded-xl mb-4 text-sm flex-wrap"
              style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(124,110,224,0.12)' }}
            >
              <span style={{ color: '#64748b' }}><span className="font-bold" style={{ color: '#1a1a2e' }}>{submittedCount}</span> təhvil</span>
              <span className="w-px h-4" style={{ background: 'rgba(124,110,224,0.18)' }} />
              <span style={{ color: '#64748b' }}><span className="font-bold" style={{ color: '#3d8a73' }}>{gradedCount}</span> qiymətləndirildi</span>
              <span className="w-px h-4" style={{ background: 'rgba(124,110,224,0.18)' }} />
              <span style={{ color: '#64748b' }}><span className="font-bold" style={{ color: '#b46a3e' }}>{pendingCount}</span> gözləyir</span>
            </div>

            {detailSubmissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
                <div className="icon-chip icon-chip-periwinkle" style={{ width: 56, height: 56 }}>
                  <ClipboardList className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#1a1a2e' }}>Hələ heç bir cavab yoxdur</p>
                  <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>Şagirdlər tapşırığı təhvil verdikdə burada görünəcək</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {detailSubmissions.map(sub => {
                  const status = gradeStatus[sub.id]
                  const initials = (sub.student?.full_name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                  const submittedTime = sub.submitted_at
                    ? new Date(sub.submitted_at).toLocaleString('az-AZ', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                    : null
                  return (
                    <div key={sub.id} className="rounded-2xl overflow-hidden"
                      style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(124,110,224,0.12)' }}
                    >
                      <div className="flex items-center justify-between gap-3 px-4 py-3 flex-wrap"
                        style={{ background: 'rgba(248,247,251,0.6)', borderBottom: '1px solid rgba(124,110,224,0.08)' }}
                      >
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="icon-chip icon-chip-periwinkle" style={{ width: 36, height: 36, fontSize: 12, fontWeight: 700 }}>
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <span className="text-sm font-semibold block" style={{ color: '#1a1a2e' }}>{sub.student?.full_name}</span>
                            {submittedTime && (
                              <span className="text-[11px] flex items-center gap-1 mt-0.5" style={{ color: '#94a3b8' }}>
                                <Clock className="w-2.5 h-2.5" /> {submittedTime}
                              </span>
                            )}
                          </div>
                          <SubStatusBadge status={sub.status} />
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {status === 'saved' && (
                            <span className="pastel-badge pastel-badge-mint"><Check className="w-3 h-3" /> Saxlandı</span>
                          )}
                          {status === 'error' && (
                            <span className="pastel-badge pastel-badge-rose"><AlertCircle className="w-3 h-3" /> Xəta</span>
                          )}
                          <div className="flex items-center gap-1.5 rounded-xl px-3 py-1.5"
                            style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(124,110,224,0.18)' }}
                          >
                            <input
                              key={sub.id}
                              type="number"
                              min={0}
                              max={selectedAssignment?.max_score || 10}
                              defaultValue={sub.score ?? ''}
                              placeholder="—"
                              className="w-12 text-sm text-center font-bold focus:outline-none bg-transparent smooth-trans"
                              style={{
                                color: status === 'saving' ? '#7c6ee0'
                                     : status === 'saved' ? '#3d8a73'
                                     : status === 'error' ? '#b83b54'
                                     : '#1a1a2e',
                              }}
                              onBlur={e => gradeSubmission(sub.id, e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && e.target.blur()}
                            />
                            <span className="text-xs font-medium" style={{ color: '#94a3b8' }}>/ {selectedAssignment?.max_score}</span>
                          </div>
                        </div>
                      </div>

                      <div className="px-4 py-3 space-y-3">
                        {sub.file_url && (
                          <a
                            href={sub.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium smooth-trans"
                            style={{ background: 'rgba(107,157,222,0.10)', color: '#4a7cb5', border: '1px solid rgba(107,157,222,0.25)' }}
                          >
                            <Paperclip className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate max-w-[240px]">{sub.file_url.split('/').pop()?.split('?')[0] || 'Fayl'}</span>
                            <Download className="w-3.5 h-3.5 flex-shrink-0 ml-auto" />
                          </a>
                        )}

                        {sub.content && (
                          <p className="text-sm rounded-lg p-3 leading-relaxed whitespace-pre-wrap"
                            style={{ color: '#475569', background: 'rgba(248,247,251,0.6)' }}
                          >
                            {sub.content}
                          </p>
                        )}

                        {!sub.content && !sub.file_url && (
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
                            style={{ background: 'rgba(232,168,124,0.10)', border: '1px solid rgba(232,168,124,0.25)' }}
                          >
                            <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#d68a5a' }} />
                            <p className="text-xs" style={{ color: '#b46a3e' }}>
                              Şagird fayl yükləyib, lakin keçmiş cavablar üçün fayl linki saxlanılmayıb. Yeni göndərmələr düzgün görünəcək.
                            </p>
                          </div>
                        )}

                        <div>
                          <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#64748b' }}>Müəllim rəyi</label>
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
                              className="btn-ghost-pastel"
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
                              className="btn-pastel"
                              style={{ padding: '6px 14px', fontSize: 12, opacity: feedbackSaving === sub.id ? 0.5 : 1 }}
                            >
                              <Save className="w-3.5 h-3.5" /> Rəyi saxla
                            </button>
                          </div>
                        </div>

                        {sub.feedback && (
                          <div className="rounded-lg p-3" style={{ background: 'rgba(124,110,224,0.08)' }}>
                            <p className="text-xs font-bold mb-1.5 flex items-center gap-1" style={{ color: '#5b4fb8' }}>
                              <Sparkles className="w-3.5 h-3.5" /> Mövcud rəy
                            </p>
                            <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: '#1a1a2e' }}>{sub.feedback}</p>
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
          <div className="liquid-card p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-3">
              <span className="icon-chip icon-chip-peach" style={{ width: 40, height: 40 }}>
                <Trash2 className="w-5 h-5" />
              </span>
              <h3 className="text-lg font-bold" style={{ color: '#1a1a2e' }}>Tapşırığı sil</h3>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl mb-4"
              style={{ background: 'rgba(229,107,127,0.08)', border: '1px solid rgba(229,107,127,0.25)' }}
            >
              <div>
                <p className="text-sm font-semibold" style={{ color: '#1a1a2e' }}>{deleteTarget.title}</p>
                <p className="text-xs mt-1" style={{ color: '#b83b54' }}>
                  Bu tapşırıq və bütün təhvil edilmiş cavablar birdəfəlik silinəcək.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteTarget(null)} disabled={deleting} className="btn-ghost-pastel" style={{ padding: '10px 20px', fontSize: 13 }}>Ləğv et</button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-5 py-2.5 rounded-full font-semibold text-white text-sm smooth-trans flex items-center gap-1.5"
                style={{
                  background: 'linear-gradient(135deg, #e56b7f, #d85268)',
                  boxShadow: '0 4px 12px rgba(229,107,127,0.3)',
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
