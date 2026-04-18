import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { Select, Textarea } from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import {
  ClipboardList,
  Plus,
  Sparkles,
  Loader2,
  Filter,
  Eye,
  BarChart2,
  Clock,
  CheckSquare,
  Paperclip,
  Download,
  Check,
  AlertCircle,
  Save,
} from 'lucide-react'

// ── Subject colour palette ────────────────────────────────────────────────────

const SUBJECT_PALETTE = [
  'bg-purple',
  'bg-teal',
  'bg-amber-500',
  'bg-blue-500',
  'bg-pink-500',
  'bg-orange-500',
]

function subjectTopColor(name = '') {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return SUBJECT_PALETTE[Math.abs(h) % SUBJECT_PALETTE.length]
}

// ── Due-date countdown chip ───────────────────────────────────────────────────

function DueDateChip({ dueDate }) {
  if (!dueDate) return null

  const now = new Date()
  const due = new Date(dueDate)
  const diffMs = due.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0)
  const diffDays = Math.round(diffMs / 86400000)

  if (diffDays < 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-50 text-red-600">
        <Clock className="w-3 h-3" />
        {Math.abs(diffDays)} gün keçdi
      </span>
    )
  }
  if (diffDays === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-50 text-amber-600">
        <Clock className="w-3 h-3" />
        Bu gün!
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-surface text-gray-500">
      <Clock className="w-3 h-3" />
      {diffDays} gün qaldı
    </span>
  )
}

// ── Submission progress bar ───────────────────────────────────────────────────

function SubmissionBar({ submitted, total }) {
  const pct = total > 0 ? Math.round((submitted / total) * 100) : 0
  return (
    <div className="flex items-center gap-2 mt-3">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-teal rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-500">
        {submitted}/{total}
      </span>
    </div>
  )
}

// ── Submission status badge ───────────────────────────────────────────────────

function SubStatusBadge({ status }) {
  const map = {
    graded:    { cls: 'bg-teal-light text-teal',          label: 'Qiymətləndirildi' },
    submitted: { cls: 'bg-purple-light text-purple-dark', label: 'Təhvil verildi'   },
    late:      { cls: 'bg-amber-50 text-amber-600',       label: 'Gecikən'          },
  }
  const s = map[status] || { cls: 'bg-surface text-gray-500', label: status || 'Naməlum' }
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${s.cls}`}>
      {s.label}
    </span>
  )
}

// ── Assignment card ───────────────────────────────────────────────────────────

function AssignmentCard({ assignment, onClick }) {
  const subjectName = assignment.subject?.name || ''
  const className   = assignment.class?.name   || ''
  const topColor    = subjectTopColor(subjectName)

  const ungradedCount = assignment.ungradedCount || 0

  return (
    <div
      className="bg-white rounded-xl border border-border-soft shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden flex flex-col"
      onClick={() => onClick(assignment)}
    >
      {/* Colour bar */}
      <div className={`h-1 w-full ${topColor}`} />

      {/* Card body */}
      <div className="p-5 flex flex-col flex-1">

        {/* Top row: badges + due date */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {subjectName && (
              <Badge variant="default">{subjectName}</Badge>
            )}
            {className && (
              <Badge variant="national">{className}</Badge>
            )}
          </div>
          <div className="flex-shrink-0">
            <DueDateChip dueDate={assignment.due_date} />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-gray-900 leading-snug mb-1">
          {assignment.title}
        </h3>

        {/* Description — 2-line clamp */}
        {assignment.description && (
          <p
            className="text-sm text-gray-500 leading-relaxed mb-auto"
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

        {/* Spacer so bar always sits at bottom */}
        <div className="flex-1" />

        {/* Progress bar */}
        <SubmissionBar
          submitted={assignment.submissionCount}
          total={assignment.totalStudents}
        />

        {/* Footer row */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-soft">
          <span className="text-xs text-gray-500">
            {assignment.submissionCount}/{assignment.totalStudents} şagird təhvil verib
          </span>
          <div className="flex items-center gap-2">
            {ungradedCount > 0 && (
              <span className="rounded-full bg-amber-50 text-amber-600 text-xs font-medium px-2 py-0.5">
                {ungradedCount} gözləyir
              </span>
            )}
            <button
              className="flex items-center gap-1 text-xs font-medium text-purple hover:text-purple-dark transition-colors"
              onClick={e => { e.stopPropagation(); onClick(assignment) }}
            >
              <Eye className="w-3.5 h-3.5" />
              Bax
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Filter tab ────────────────────────────────────────────────────────────────

const FILTERS = [
  { key: 'all',       label: 'Hamısı'            },
  { key: 'active',    label: 'Aktiv'             },
  { key: 'ungraded',  label: 'Qiymətləndirilməyib' },
  { key: 'finished',  label: 'Bitmiş'            },
]

// ── Main component ────────────────────────────────────────────────────────────

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
  const [gradeStatus, setGradeStatus]         = useState({}) // { [submissionId]: 'saving'|'saved'|'error' }
  const [teacherFeedback, setTeacherFeedback] = useState({}) // { [submissionId]: string }
  const [feedbackSaving, setFeedbackSaving]   = useState(null)

  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    class_id: '',
    subject_id: '',
    due_date: '',
    max_score: 10,
    notify: false,
  })

  useEffect(() => {
    if (!profile) return
    loadData()
  }, [profile])

  // ── Data loading ────────────────────────────────────────────────────────────

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

    // Submission counts (total) + ungraded counts
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

    // Student counts per class
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

  // ── Create assignment ───────────────────────────────────────────────────────

  async function handleCreate() {
    setSaving(true)
    setSaveError(null)
    const { notify, ...rest } = newAssignment
    const { error } = await supabase.from('assignments').insert({
      title:      rest.title.trim(),
      description: rest.description.trim() || null,
      class_id:   rest.class_id,
      subject_id: rest.subject_id,
      due_date:   rest.due_date || null,   // empty string → null (Postgres rejects '')
      max_score:  Number(rest.max_score),
      teacher_id: profile.id,
    })

    if (error) {
      setSaveError(error.message)
    } else {
      setShowNewModal(false)
      setSaveError(null)
      setNewAssignment({
        title: '', description: '', class_id: '', subject_id: '',
        due_date: '', max_score: 10, notify: false,
      })
      loadData()
    }
    setSaving(false)
  }

  // ── Open detail panel ───────────────────────────────────────────────────────

  async function openDetail(assignment) {
    setSelectedAssignment(assignment)
    setGradeStatus({})
    setTeacherFeedback({})

    // Step 1: fetch submissions (no join — avoids potential RLS join failure)
    const { data: subs, error: subErr } = await supabase
      .from('submissions')
      .select('*')
      .eq('assignment_id', assignment.id)
      .order('submitted_at', { ascending: false })

    if (subErr) console.error('submissions fetch error:', subErr)

    const submissions = subs || []

    // Step 2: fetch student profiles separately
    let profileMap = {}
    if (submissions.length > 0) {
      const studentIds = [...new Set(submissions.map(s => s.student_id).filter(Boolean))]
      const { data: profileData, error: profErr } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', studentIds)
      if (profErr) console.error('profiles fetch error:', profErr)
      ;(profileData || []).forEach(p => { profileMap[p.id] = p })
    }

    // Merge student info into each submission
    const merged = submissions.map(s => ({
      ...s,
      student: profileMap[s.student_id] || { id: s.student_id, full_name: 'Naməlum' },
    }))

    setDetailSubmissions(merged)

    // Pre-fill teacher feedback state from existing feedback
    const fb = {}
    merged.forEach(s => { if (s.feedback) fb[s.id] = s.feedback })
    setTeacherFeedback(fb)
    setShowDetailModal(true)
  }

  // ── Grade submission ────────────────────────────────────────────────────────

  async function gradeSubmission(submissionId, score) {
    const val = parseFloat(score)
    if (isNaN(val) || val < 0) return
    setGradeStatus(prev => ({ ...prev, [submissionId]: 'saving' }))
    const { error } = await supabase
      .from('submissions')
      .update({ score: val, status: 'graded', graded_at: new Date().toISOString() })
      .eq('id', submissionId)
    if (error) {
      setGradeStatus(prev => ({ ...prev, [submissionId]: 'error' }))
      console.error('Grade save error:', error)
      return
    }
    setGradeStatus(prev => ({ ...prev, [submissionId]: 'saved' }))
    setDetailSubmissions(prev =>
      prev.map(s => s.id === submissionId ? { ...s, score: val, status: 'graded' } : s)
    )
    setTimeout(() => setGradeStatus(prev => ({ ...prev, [submissionId]: null })), 2500)
  }

  // ── Save teacher feedback ───────────────────────────────────────────────────

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

  // ── AI feedback ─────────────────────────────────────────────────────────────

  async function generateAIFeedback(submission) {
    setAiLoading(submission.id)
    // Update feedback in textarea as AI streams
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

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const reader  = response.body.getReader()
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
              // Stream text into the feedback textarea live
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
    } catch (err) {
      console.error('AI feedback error:', err)
      const errMsg = 'AI rəyi əldə edilə bilmədi. Yenidən cəhd edin.'
      setTeacherFeedback(prev => ({ ...prev, [submission.id]: errMsg }))
    } finally {
      setAiLoading(null)
    }
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

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

  // ── Stats ───────────────────────────────────────────────────────────────────

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

  // ── Filtered assignments ────────────────────────────────────────────────────

  const filteredAssignments = assignments.filter(a => {
    if (activeFilter === 'active')   return isActive(a)
    if (activeFilter === 'ungraded') return (a.ungradedCount || 0) > 0
    if (activeFilter === 'finished') return !isActive(a)
    return true
  })

  // ── Derived form data ───────────────────────────────────────────────────────

  if (loading) return <PageSpinner />

  const uniqueClasses    = [...new Map(teacherClasses.map(tc => [tc.class_id, tc.class])).values()]
  const subjectsForClass = (classId) =>
    teacherClasses.filter(tc => tc.class_id === classId).map(tc => tc.subject)

  // ── Submission panel summary ────────────────────────────────────────────────

  const submittedCount = detailSubmissions.length
  const gradedCount    = detailSubmissions.filter(s => s.status === 'graded').length
  const pendingCount   = submittedCount - gradedCount

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-4xl text-gray-900 tracking-tight">
          Tapşırıqlar
        </h1>
        <Button onClick={() => setShowNewModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Yeni tapşırıq
        </Button>
      </div>

      {/* ── Stats row ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Total tapşırıqlar */}
        <div className="bg-white rounded-2xl border border-border-soft p-5 flex items-center gap-4">
          <span className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
            <ClipboardList className="w-5 h-5 text-blue-500" />
          </span>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">
              Ümumi tapşırıq
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{totalCount}</p>
          </div>
        </div>

        {/* Gözləyən qiymətləndirmə */}
        <div className="bg-white rounded-2xl border border-border-soft p-5 flex items-center gap-4">
          <span className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-amber-500" />
          </span>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">
              Gözləyən qiymətləndir.
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{ungradedTotal}</p>
          </div>
        </div>

        {/* Bu həftə son tarix */}
        <div className="bg-white rounded-2xl border border-border-soft p-5 flex items-center gap-4">
          <span className="w-10 h-10 rounded-xl bg-teal-light flex items-center justify-center flex-shrink-0">
            <CheckSquare className="w-5 h-5 text-teal" />
          </span>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">
              Bu həftə son tarix
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{thisWeekCount}</p>
          </div>
        </div>

        {/* Ortalama təhvil % */}
        <div className="bg-white rounded-2xl border border-border-soft p-5 flex items-center gap-4">
          <span className="w-10 h-10 rounded-xl bg-purple-light flex items-center justify-center flex-shrink-0">
            <BarChart2 className="w-5 h-5 text-purple" />
          </span>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">
              Ortalama təhvil %
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{avgPct}%</p>
          </div>
        </div>

      </div>

      {/* ── Filter tabs ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 bg-surface rounded-xl p-1 w-fit border border-border-soft">
        <Filter className="w-4 h-4 text-gray-400 mx-2 flex-shrink-0" />
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === f.key
                ? 'bg-white text-gray-900 shadow-sm border border-border-soft'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {f.label}
            {f.key === 'ungraded' && ungradedTotal > 0 && (
              <span className="ml-1.5 rounded-full bg-amber-100 text-amber-600 text-xs font-semibold px-1.5 py-0.5">
                {ungradedTotal}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Assignment grid ──────────────────────────────────────────────────── */}
      {filteredAssignments.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Tapşırıq yoxdur"
          description="Yeni tapşırıq yaradın"
          actionLabel="Yeni tapşırıq"
          onAction={() => setShowNewModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredAssignments.map(a => (
            <AssignmentCard key={a.id} assignment={a} onClick={openDetail} />
          ))}
        </div>
      )}

      {/* ── New assignment modal ─────────────────────────────────────────────── */}
      <Modal
        open={showNewModal}
        onClose={() => setShowNewModal(false)}
        title="Yeni tapşırıq"
        size="md"
      >
        <div className="space-y-4">

          <Input
            label="Başlıq"
            placeholder="Tapşırığın adını daxil edin"
            value={newAssignment.title}
            onChange={e => setNewAssignment(p => ({ ...p, title: e.target.value }))}
          />

          <Textarea
            label="Açıqlama"
            rows={4}
            placeholder="Tapşırıq haqqında ətraflı məlumat..."
            value={newAssignment.description}
            onChange={e => setNewAssignment(p => ({ ...p, description: e.target.value }))}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Sinif"
              value={newAssignment.class_id}
              onChange={e =>
                setNewAssignment(p => ({ ...p, class_id: e.target.value, subject_id: '' }))
              }
            >
              <option value="">Sinif seçin</option>
              {uniqueClasses.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>

            <Select
              label="Fənn"
              value={newAssignment.subject_id}
              onChange={e => setNewAssignment(p => ({ ...p, subject_id: e.target.value }))}
              disabled={!newAssignment.class_id}
            >
              <option value="">Fənn seçin</option>
              {subjectsForClass(newAssignment.class_id).map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Son tarix"
              type="date"
              value={newAssignment.due_date}
              onChange={e => setNewAssignment(p => ({ ...p, due_date: e.target.value }))}
            />
            <Input
              label="Maksimal bal"
              type="number"
              min={1}
              max={100}
              value={newAssignment.max_score}
              onChange={e => setNewAssignment(p => ({ ...p, max_score: e.target.value }))}
            />
          </div>

          {/* Announcement toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              className={`relative w-10 h-6 rounded-full transition-colors ${newAssignment.notify ? 'bg-purple' : 'bg-gray-200'}`}
              onClick={() => setNewAssignment(p => ({ ...p, notify: !p.notify }))}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${newAssignment.notify ? 'translate-x-4' : ''}`}
              />
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Valideyn/şagirdlərə bildiriş göndər</span>
              <p className="text-xs text-gray-400">Tapşırıq yaradıldıqda avtomatik bildiriş</p>
            </div>
          </label>

          {saveError && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{saveError}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => { setShowNewModal(false); setSaveError(null) }}>
              Ləğv et
            </Button>
            <Button
              onClick={handleCreate}
              loading={saving}
              disabled={!newAssignment.title || !newAssignment.class_id || !newAssignment.subject_id}
            >
              Yarat
            </Button>
          </div>

        </div>
      </Modal>

      {/* ── Submission review panel ──────────────────────────────────────────── */}
      <Modal
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={selectedAssignment?.title || ''}
        size="lg"
      >
        {selectedAssignment && (
          <div className="space-y-5">

            {/* Assignment meta */}
            <div className="flex flex-wrap gap-2 items-center">
              {selectedAssignment.class?.name && (
                <Badge variant="national">{selectedAssignment.class.name}</Badge>
              )}
              {selectedAssignment.subject?.name && (
                <Badge variant="default">{selectedAssignment.subject.name}</Badge>
              )}
              {selectedAssignment.due_date && (
                <span className="text-xs text-gray-500">
                  Son tarix: {formatDate(selectedAssignment.due_date)}
                </span>
              )}
              {selectedAssignment.max_score && (
                <span className="text-xs text-gray-500">
                  Maks. bal: {selectedAssignment.max_score}
                </span>
              )}
            </div>

            {selectedAssignment.description && (
              <p className="text-sm text-gray-600 bg-surface rounded-lg p-3">
                {selectedAssignment.description}
              </p>
            )}

            {/* Summary bar */}
            <div className="flex items-center gap-4 py-3 px-4 bg-surface rounded-xl border border-border-soft text-sm">
              <span className="text-gray-500">
                <span className="font-semibold text-gray-900">{submittedCount}</span> təhvil
              </span>
              <span className="w-px h-4 bg-border-soft" />
              <span className="text-gray-500">
                <span className="font-semibold text-teal">{gradedCount}</span> qiymətləndirildi
              </span>
              <span className="w-px h-4 bg-border-soft" />
              <span className="text-gray-500">
                <span className="font-semibold text-amber-500">{pendingCount}</span> gözləyir
              </span>
            </div>

            {/* Submissions list */}
            {detailSubmissions.length === 0 ? (
              <p className="text-center py-10 text-sm text-gray-400">
                Hələ təhvil verilmiş cavab yoxdur
              </p>
            ) : (
              <div className="space-y-4">
                {detailSubmissions.map(sub => {
                  const status = gradeStatus[sub.id]
                  return (
                    <div
                      key={sub.id}
                      className="border border-border-soft rounded-xl overflow-hidden"
                    >
                      {/* Student header row */}
                      <div className="flex items-center justify-between gap-3 px-4 py-3 bg-surface/60">
                        <div className="flex items-center gap-3">
                          <Avatar name={sub.student?.full_name || '?'} size="sm" />
                          <span className="text-sm font-semibold text-gray-900">
                            {sub.student?.full_name}
                          </span>
                          <SubStatusBadge status={sub.status} />
                        </div>

                        {/* Score input + feedback */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {status === 'saved' && (
                            <span className="flex items-center gap-1 text-xs text-teal font-medium">
                              <Check className="w-3.5 h-3.5" /> Saxlandı
                            </span>
                          )}
                          {status === 'error' && (
                            <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
                              <AlertCircle className="w-3.5 h-3.5" /> Xəta
                            </span>
                          )}
                          <input
                            type="number"
                            min={0}
                            max={selectedAssignment?.max_score || 10}
                            defaultValue={sub.score ?? ''}
                            placeholder="—"
                            className={`w-16 border rounded-md px-2 py-1.5 text-sm text-center font-bold focus:outline-none focus:ring-2 focus:ring-purple transition-colors ${
                              status === 'saving' ? 'border-purple bg-purple-light/30' :
                              status === 'saved'  ? 'border-teal bg-teal-light'        :
                              status === 'error'  ? 'border-red-300 bg-red-50'         :
                              'border-border-soft'
                            }`}
                            onBlur={e => gradeSubmission(sub.id, e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && e.target.blur()}
                          />
                          <span className="text-xs text-gray-400 font-medium">
                            / {selectedAssignment?.max_score}
                          </span>
                        </div>
                      </div>

                      <div className="px-4 py-3 space-y-3">
                        {/* Uploaded file link */}
                        {sub.file_url && (
                          <a
                            href={sub.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-colors"
                          >
                            <Paperclip className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate max-w-[240px]">
                              {sub.file_url.split('/').pop()?.split('?')[0] || 'Fayl'}
                            </span>
                            <Download className="w-3.5 h-3.5 flex-shrink-0 ml-auto" />
                          </a>
                        )}

                        {/* Submission text content */}
                        {sub.content && (
                          <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 leading-relaxed whitespace-pre-wrap">
                            {sub.content}
                          </p>
                        )}

                        {/* No content — file not saved or text-only gap */}
                        {!sub.content && !sub.file_url && (
                          <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                            <p className="text-xs text-amber-700">
                              Şagird fayl yükləyib, lakin keçmiş cavablar üçün fayl linki saxlanılmayıb. Yeni göndərmələr düzgün görünəcək.
                            </p>
                          </div>
                        )}

                        {/* Teacher feedback textarea */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                            Müəllim rəyi
                          </label>
                          <textarea
                            rows={2}
                            placeholder="Şagirdə rəy yazın..."
                            value={teacherFeedback[sub.id] ?? (sub.feedback && !sub.feedback.startsWith('AI') ? sub.feedback : '')}
                            onChange={e => setTeacherFeedback(prev => ({ ...prev, [sub.id]: e.target.value }))}
                            className="w-full border border-border-soft rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple resize-none"
                          />
                          <div className="flex justify-end mt-1.5 gap-2">
                            <Button
                              variant="ghost"
                              className="text-xs px-2.5 py-1"
                              onClick={() => generateAIFeedback(sub)}
                              disabled={aiLoading === sub.id}
                            >
                              {aiLoading === sub.id
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                                : <Sparkles className="w-3.5 h-3.5 mr-1" />
                              }
                              AI rəyi
                            </Button>
                            <Button
                              className="text-xs px-2.5 py-1"
                              onClick={() => saveTeacherFeedback(sub.id)}
                              loading={feedbackSaving === sub.id}
                              disabled={feedbackSaving === sub.id}
                            >
                              <Save className="w-3.5 h-3.5 mr-1" />
                              Rəyi saxla
                            </Button>
                          </div>
                        </div>

                        {/* AI feedback display (read-only, shown when AI generated) */}
                        {sub.feedback && (
                          <div className="bg-purple-light rounded-lg p-3">
                            <p className="text-xs text-purple-dark font-semibold mb-1.5 flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5" />
                              Mövcud rəy
                            </p>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                              {sub.feedback}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

          </div>
        )}
      </Modal>

    </div>
  )
}
