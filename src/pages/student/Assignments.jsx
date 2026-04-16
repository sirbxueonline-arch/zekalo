import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import { Textarea } from '../../components/ui/Input'
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  Upload,
  FileText,
} from 'lucide-react'

// ─── Subject color helpers ────────────────────────────────────────────────────

const HEX_PALETTE = [
  '#534AB7', // purple
  '#1D9E75', // teal
  '#D97706', // amber
  '#2563EB', // blue
  '#DB2777', // pink
  '#EA580C', // orange
]

function subjectHex(name = '') {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return HEX_PALETTE[Math.abs(hash) % HEX_PALETTE.length]
}

// Light bg tint (10% opacity hex) for subject badge pill
const BG_PALETTE = [
  '#EEEDFE', // purple-light
  '#E1F5EE', // teal-light
  '#FEF3C7', // amber-100
  '#DBEAFE', // blue-100
  '#FCE7F3', // pink-100
  '#FFEDD5', // orange-100
]

function subjectBg(name = '') {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return BG_PALETTE[Math.abs(hash) % BG_PALETTE.length]
}

// ─── Date / countdown helpers ─────────────────────────────────────────────────

function daysDiff(isoDate) {
  if (!isoDate) return null
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const due = new Date(isoDate)
  due.setHours(0, 0, 0, 0)
  return Math.round((due - now) / (1000 * 60 * 60 * 24))
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('az-AZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// ─── Due-date countdown chip ─────────────────────────────────────────────────

function DueDateChip({ dueDate, status }) {
  if (!dueDate) return null
  const days = daysDiff(dueDate)

  // Already submitted / graded — just show a plain date
  if (status === 'submitted' || status === 'graded') {
    return (
      <span className="inline-flex items-center gap-1 text-xs rounded-full px-2.5 py-0.5 bg-surface text-gray-500 border border-border-soft">
        <Clock className="w-3 h-3" />
        {formatDate(dueDate)}
      </span>
    )
  }

  if (days < 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs rounded-full px-2.5 py-0.5 bg-red-50 text-red-600 border border-red-200 font-medium">
        <AlertCircle className="w-3 h-3" />
        {Math.abs(days)} gün gecikmişdir
      </span>
    )
  }
  if (days === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs rounded-full px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 font-medium">
        <Clock className="w-3 h-3" />
        Bu gün son tarixdir!
      </span>
    )
  }
  if (days <= 3) {
    return (
      <span className="inline-flex items-center gap-1 text-xs rounded-full px-2.5 py-0.5 bg-amber-50 text-amber-600 border border-amber-200">
        <Clock className="w-3 h-3" />
        {days} gün qaldı
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs rounded-full px-2.5 py-0.5 bg-surface text-gray-500 border border-border-soft">
      <Clock className="w-3 h-3" />
      {days} gün qaldı
    </span>
  )
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_META = {
  pending: {
    label: 'Gözləyən',
    className: 'bg-purple-light text-purple-dark border border-[#AFA9EC]',
  },
  submitted: {
    label: 'Təhvil verilmiş',
    className: 'bg-teal-light text-[#085041] border border-teal-mid',
  },
  late: {
    label: 'Gecikmiş',
    className: 'bg-red-50 text-red-700 border border-red-200',
  },
  graded: {
    label: 'Qiymətləndirilmiş',
    className: 'bg-blue-50 text-blue-700 border border-blue-200',
  },
}

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.pending
  return (
    <span className={`inline-flex items-center rounded-full text-xs font-medium px-3 py-0.5 ${meta.className}`}>
      {meta.label}
    </span>
  )
}

// ─── Score badge + mini progress bar ─────────────────────────────────────────

function ScoreDisplay({ score, maxScore }) {
  if (score == null) return null
  const pct = maxScore ? Math.min(Math.round((score / maxScore) * 100), 100) : 0
  const color = pct >= 80 ? '#1D9E75' : pct >= 50 ? '#D97706' : '#DC2626'

  return (
    <div className="flex items-center gap-2">
      <span
        className="inline-flex items-center rounded-full text-xs font-semibold px-2.5 py-0.5 text-white"
        style={{ backgroundColor: color }}
      >
        {score}/{maxScore ?? '—'}
      </span>
      {maxScore != null && (
        <div className="w-16 bg-gray-100 rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full transition-all"
            style={{ width: `${pct}%`, backgroundColor: color }}
          />
        </div>
      )}
    </div>
  )
}

// ─── Feedback panel (teacher + AI tabs) ──────────────────────────────────────

function FeedbackPanel({ feedback, aiReview }) {
  const [activeTab, setActiveTab] = useState('teacher')
  const hasFeedback = !!feedback
  const hasAI = !!aiReview

  if (!hasFeedback && !hasAI) return null

  const tabs = [
    { key: 'teacher', label: 'Müəllim rəyi', visible: hasFeedback },
    { key: 'ai', label: 'Zəka AI rəyi', visible: hasAI },
  ].filter(t => t.visible)

  const content = activeTab === 'teacher' ? feedback : aiReview

  return (
    <div className="mt-4 border-t border-border-soft pt-4">
      <div className="flex gap-1 bg-surface rounded-lg p-0.5 w-fit mb-3">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-purple shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="bg-purple-light rounded-lg p-4">
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  )
}

// ─── Submit modal ─────────────────────────────────────────────────────────────

function SubmitModal({ assignment, open, onClose, onSubmit, submitting }) {
  const [content, setContent] = useState('')
  const isLate = assignment?.due_date && new Date(assignment.due_date) < new Date()

  // Reset textarea whenever modal opens for a new assignment
  useEffect(() => {
    if (open) setContent('')
  }, [open, assignment?.id])

  return (
    <Modal open={open} onClose={onClose} title="Tapşırığı Təhvil Ver" size="lg">
      {assignment && (
        <div className="space-y-5">
          {/* Assignment header */}
          <div className="flex items-start gap-3 p-4 bg-surface rounded-xl border border-border-soft">
            <div
              className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: subjectBg(assignment.subject?.name) }}
            >
              <FileText
                className="w-4 h-4"
                style={{ color: subjectHex(assignment.subject?.name) }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-xs font-medium mb-0.5"
                style={{ color: subjectHex(assignment.subject?.name) }}
              >
                {assignment.subject?.name}
              </p>
              <h3 className="text-sm font-semibold text-gray-900">{assignment.title}</h3>
              {assignment.description && (
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{assignment.description}</p>
              )}
            </div>
          </div>

          {/* Late warning */}
          {isLate && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-700 font-medium">
                Son tarix keçib. Cavabınız gecikmiş kimi qeyd ediləcək.
              </p>
            </div>
          )}

          {/* Answer textarea */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Cavabınız
            </label>
            <textarea
              className="w-full border border-border-soft rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple focus:border-transparent resize-none"
              rows={7}
              placeholder="Cavabınızı buraya yazın..."
              value={content}
              onChange={e => setContent(e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{content.length} simvol</p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-1">
            <Button variant="ghost" onClick={onClose} disabled={submitting}>
              Ləğv et
            </Button>
            <Button
              onClick={() => onSubmit(content)}
              loading={submitting}
              disabled={!content.trim() || submitting}
            >
              <span className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Təhvil ver
              </span>
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

// ─── Assignment card ──────────────────────────────────────────────────────────

function AssignmentCard({ assignment, status, submission, onSubmitClick }) {
  const color = subjectHex(assignment.subject?.name)
  const bg = subjectBg(assignment.subject?.name)

  return (
    <div
      className="bg-white border border-border-soft rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
      style={{ borderLeftWidth: '6px', borderLeftColor: color, borderLeftStyle: 'solid' }}
    >
      <div className="px-6 py-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Subject badge */}
            <span
              className="inline-flex items-center rounded-full text-xs font-semibold px-3 py-0.5"
              style={{ backgroundColor: bg, color }}
            >
              {assignment.subject?.name || 'Fənn'}
            </span>
          </div>

          {/* Due date countdown chip — right side */}
          <DueDateChip dueDate={assignment.due_date} status={status} />
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-gray-900 mb-1.5 leading-snug">
          {assignment.title}
        </h3>

        {/* Description — 2-line clamp */}
        {assignment.description && (
          <p
            className="text-sm text-gray-500 leading-relaxed mb-4"
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

        {/* Footer row */}
        <div className="flex items-center justify-between gap-3 mt-3 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <StatusBadge status={status} />
            {status === 'graded' && submission?.score != null && (
              <ScoreDisplay score={submission.score} maxScore={assignment.max_score} />
            )}
          </div>

          {status === 'pending' && (
            <button
              onClick={() => onSubmitClick(assignment)}
              className="inline-flex items-center gap-1.5 bg-purple text-white rounded-md px-4 py-2 text-xs font-medium hover:bg-purple-dark transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              Təhvil ver
            </button>
          )}
        </div>

        {/* Feedback panel */}
        <FeedbackPanel feedback={submission?.feedback} aiReview={submission?.ai_review} />
      </div>
    </div>
  )
}

// ─── Overview pill ────────────────────────────────────────────────────────────

function OverviewPill({ icon: Icon, label, count, pillClass }) {
  return (
    <div className={`flex items-center gap-2.5 rounded-full px-4 py-2 text-sm font-medium ${pillClass}`}>
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span>{label}</span>
      <span className="ml-auto font-bold tabular-nums">{count}</span>
    </div>
  )
}

// ─── Filter tabs ──────────────────────────────────────────────────────────────

const FILTER_TABS = [
  { key: 'all', label: 'Hamısı' },
  { key: 'pending', label: 'Gözləyən' },
  { key: 'submitted', label: 'Təhvil verilmiş' },
  { key: 'late', label: 'Gecikmiş' },
  { key: 'graded', label: 'Qiymətləndirilmiş' },
]

// ─── Main component ───────────────────────────────────────────────────────────

export default function StudentAssignments() {
  const { profile } = useAuth()

  const [loading, setLoading] = useState(true)
  const [assignments, setAssignments] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [activeTab, setActiveTab] = useState('all')
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!profile) return
    loadData()
  }, [profile])

  async function loadData() {
    setLoading(true)
    const { data: memberData } = await supabase
      .from('class_members')
      .select('class_id')
      .eq('student_id', profile.id)

    const classIds = (memberData || []).map(m => m.class_id)

    if (!classIds.length) {
      setLoading(false)
      return
    }

    const [assignRes, subRes] = await Promise.all([
      supabase
        .from('assignments')
        .select('*, subject:subjects(name)')
        .in('class_id', classIds)
        .order('due_date', { ascending: true }),
      supabase
        .from('submissions')
        .select('*')
        .eq('student_id', profile.id),
    ])

    setAssignments(assignRes.data || [])
    setSubmissions(subRes.data || [])
    setLoading(false)
  }

  function getStatus(assignment) {
    const sub = submissions.find(s => s.assignment_id === assignment.id)
    if (sub) {
      if (sub.status === 'graded') return 'graded'
      return 'submitted'
    }
    if (assignment.due_date && new Date(assignment.due_date) < new Date()) return 'late'
    return 'pending'
  }

  function getSubmission(assignment) {
    return submissions.find(s => s.assignment_id === assignment.id) || null
  }

  async function handleSubmit(content) {
    if (!selectedAssignment) return
    setSubmitting(true)
    try {
      const isLate =
        selectedAssignment.due_date && new Date(selectedAssignment.due_date) < new Date()
      await supabase.from('submissions').insert({
        assignment_id: selectedAssignment.id,
        student_id: profile.id,
        content,
        status: isLate ? 'late' : 'submitted',
      })
      setSelectedAssignment(null)
      await loadData()
    } catch (err) {
      console.error('Submit error:', err)
    }
    setSubmitting(false)
  }

  // ── Derived counts ──────────────────────────────────────────────────────────

  const counts = { pending: 0, submitted: 0, late: 0, graded: 0 }
  assignments.forEach(a => {
    const s = getStatus(a)
    counts[s] = (counts[s] || 0) + 1
  })

  const filtered =
    activeTab === 'all'
      ? assignments
      : assignments.filter(a => getStatus(a) === activeTab)

  // ── Loading / empty states ──────────────────────────────────────────────────

  if (loading) return <PageSpinner />

  if (assignments.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="Tapşırıq yoxdur"
        description="Müəllimləriniz tapşırıq əlavə etdikdə burada görünəcək."
      />
    )
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Status overview bar ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <OverviewPill
          icon={ClipboardList}
          label="Gözləyən"
          count={counts.pending}
          pillClass="bg-purple-light text-purple-dark border border-[#AFA9EC]"
        />
        <OverviewPill
          icon={CheckCircle2}
          label="Təhvil verilmiş"
          count={counts.submitted}
          pillClass="bg-teal-light text-[#085041] border border-teal-mid"
        />
        <OverviewPill
          icon={AlertCircle}
          label="Gecikmiş"
          count={counts.late}
          pillClass="bg-red-50 text-red-700 border border-red-200"
        />
        <OverviewPill
          icon={Send}
          label="Qiymətləndirilmiş"
          count={counts.graded}
          pillClass="bg-blue-50 text-blue-700 border border-blue-200"
        />
      </div>

      {/* ── Filter tabs ───────────────────────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTER_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? 'border-purple bg-purple-light text-purple'
                : 'border-border-soft text-gray-500 hover:bg-surface'
            }`}
          >
            {tab.label}
            {tab.key !== 'all' && counts[tab.key] > 0 && (
              <span
                className={`ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold ${
                  activeTab === tab.key ? 'bg-purple text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {counts[tab.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Assignment cards ──────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 bg-surface rounded-xl flex items-center justify-center mb-3">
            <ClipboardList className="w-6 h-6 text-gray-300" />
          </div>
          <p className="text-sm text-gray-400">Bu kateqoriyada tapşırıq yoxdur.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(a => {
            const status = getStatus(a)
            const submission = getSubmission(a)
            return (
              <AssignmentCard
                key={a.id}
                assignment={a}
                status={status}
                submission={submission}
                onSubmitClick={setSelectedAssignment}
              />
            )
          })}
        </div>
      )}

      {/* ── Submit modal ──────────────────────────────────────────────────── */}
      <SubmitModal
        assignment={selectedAssignment}
        open={!!selectedAssignment}
        onClose={() => setSelectedAssignment(null)}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </div>
  )
}
