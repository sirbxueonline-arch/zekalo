import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import StatCard from '../../components/ui/StatCard'
import { fmtNumeric } from '../../lib/dateUtils'
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  Upload,
  FileText,
  X,
  Paperclip,
} from 'lucide-react'

// ─── Subject tag — single neutral brand tint (color reserved for status) ─────
const SUBJECT_TAG = {
  color: 'var(--brand-600)',
  bg: 'var(--brand-50)',
  border: 'var(--brand-200)',
}

function subjectStyle() {
  return SUBJECT_TAG
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
  return fmtNumeric(iso)
}

// ─── Due-date countdown chip ─────────────────────────────────────────────────
function DueDateChip({ dueDate, status }) {
  if (!dueDate) return null
  const days = daysDiff(dueDate)

  if (status === 'submitted' || status === 'graded') {
    return (
      <span
        className="inline-flex items-center gap-1 text-xs"
        style={{
          padding: '3px 10px', borderRadius: 9999,
          background: 'var(--surface)', color: 'var(--ink-400)',
          border: '1px solid var(--hairline-strong)', fontWeight: 500,
        }}
      >
        <Clock className="w-3 h-3" />
        {formatDate(dueDate)}
      </span>
    )
  }

  if (days < 0) {
    return (
      <span className="pill-rose inline-flex items-center gap-1 text-xs font-semibold" style={{ padding: '3px 10px', borderRadius: 9999 }}>
        <AlertCircle className="w-3 h-3" />
        {Math.abs(days)} gün gecikmişdir
      </span>
    )
  }
  if (days === 0) {
    return (
      <span className="pill-peach inline-flex items-center gap-1 text-xs font-semibold" style={{ padding: '3px 10px', borderRadius: 9999 }}>
        <Clock className="w-3 h-3" />
        Bu gün son tarixdir!
      </span>
    )
  }
  if (days <= 3) {
    return (
      <span className="pill-peach inline-flex items-center gap-1 text-xs font-medium" style={{ padding: '3px 10px', borderRadius: 9999 }}>
        <Clock className="w-3 h-3" />
        {days} gün qaldı
      </span>
    )
  }
  return (
    <span
      className="inline-flex items-center gap-1 text-xs"
      style={{
        padding: '3px 10px', borderRadius: 9999,
        background: 'var(--surface)', color: 'var(--ink-400)',
        border: '1px solid var(--hairline-strong)', fontWeight: 500,
      }}
    >
      <Clock className="w-3 h-3" />
      {days} gün qaldı
    </span>
  )
}

// ─── Status badge ─────────────────────────────────────────────────────────────
const STATUS_META = {
  pending:   { label: 'Gözləyən',           cls: 'pill-peri' },
  submitted: { label: 'Təhvil verilmiş',    cls: 'pill-mint' },
  late:      { label: 'Gecikmiş',           cls: 'pill-rose' },
  graded:    { label: 'Qiymətləndirilmiş',  cls: 'pill-blue' },
}

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.pending
  return (
    <span
      className={`${meta.cls} inline-flex items-center text-xs font-semibold`}
      style={{ padding: '3px 12px', borderRadius: 9999 }}
    >
      {meta.label}
    </span>
  )
}

// ─── Score display ───────────────────────────────────────────────────────────
function ScoreDisplay({ score, maxScore }) {
  if (score == null) return null
  const pct = maxScore ? Math.min(Math.round((score / maxScore) * 100), 100) : 0
  const color =
    pct >= 80 ? 'var(--mint)'
    : pct >= 50 ? 'var(--sun)'
    : 'var(--coral)'

  return (
    <div className="flex items-center gap-2">
      <span
        className="inline-flex items-center text-xs font-bold"
        style={{
          padding: '3px 12px', borderRadius: 9999,
          background: color, color: '#fff',
        }}
      >
        {score}/{maxScore ?? '—'}
      </span>
      {maxScore != null && (
        <div className="xp-track" style={{ width: 64, height: 6 }}>
          <div
            style={{
              height: '100%', borderRadius: 9999,
              width: `${pct}%`, background: color,
              transition: 'width .35s ease',
            }}
          />
        </div>
      )}
    </div>
  )
}

// ─── Teacher feedback panel ───────────────────────────────────────────────────
function FeedbackPanel({ feedback }) {
  if (!feedback) return null
  return (
    <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--hairline)' }}>
      <p className="text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: 'var(--brand-500)' }}>
        Müəllim rəyi
      </p>
      <div
        style={{
          background: 'var(--brand-50)', borderRadius: 12,
          padding: '10px 14px', border: '1px solid var(--brand-200)',
        }}
      >
        <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--ink-900)', lineHeight: 1.55 }}>
          {feedback}
        </p>
      </div>
    </div>
  )
}

// ─── Submit modal helpers ────────────────────────────────────────────────────
function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function validateFile(file) {
  const MAX_SIZE = 50 * 1024 * 1024
  const ALLOWED_TYPES = [
    'application/pdf',
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'application/zip',
  ]
  if (file.size > MAX_SIZE) return 'Fayl həcmi 50MB-dan çox ola bilməz'
  if (!ALLOWED_TYPES.includes(file.type)) return 'Bu fayl növü dəstəklənmir'
  return null
}

function SubmitModal({ assignment, open, onClose, onSubmit, submitting, error }) {
  const [content, setContent] = useState('')
  const [file, setFile]       = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [fileError, setFileError] = useState(null)
  const fileInputRef = useRef(null)
  const isLate = assignment?.due_date && new Date(assignment.due_date) < new Date()

  useEffect(() => {
    if (open) {
      setContent('')
      setFile(null)
      setDragOver(false)
      setFileError(null)
    }
  }, [open, assignment?.id])

  function handleFileChange(e) {
    const picked = e.target.files[0]
    if (!picked) return
    const err = validateFile(picked)
    if (err) { setFileError(err); e.target.value = ''; return }
    setFile(picked)
    setFileError(null)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (!dropped) return
    const err = validateFile(dropped)
    if (err) { setFileError(err); return }
    setFile(dropped)
    setFileError(null)
  }

  const canSubmit = (content.trim().length > 0 || file !== null) && !submitting
  const sStyle = subjectStyle(assignment?.subject?.name || '')

  return (
    <Modal open={open} onClose={onClose} title="Tapşırığı Təhvil Ver" size="lg">
      {assignment && (
        <div className="space-y-4">
          {/* Assignment summary header */}
          <div
            className="flex items-start gap-3 p-4"
            style={{
              background: 'var(--brand-50)',
              border: '1px solid var(--brand-200)',
              borderRadius: 12,
            }}
          >
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'var(--surface)', border: '1px solid var(--brand-200)',
              }}
            >
              <FileText className="w-4 h-4" style={{ color: sStyle.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: 12, fontWeight: 600, color: sStyle.color, marginBottom: 2 }}>
                {assignment.subject?.name}
              </p>
              <h3 className="font-semibold" style={{ fontSize: 14, color: 'var(--ink-900)' }}>
                {assignment.title}
              </h3>
              {assignment.description && (
                <p className="text-xs mt-1" style={{ color: 'var(--ink-400)', lineHeight: 1.5 }}>
                  {assignment.description}
                </p>
              )}
            </div>
          </div>

          {isLate && (
            <div
              className="flex items-center gap-2 px-4 py-3"
              style={{
                background: 'rgba(251,113,133,0.10)',
                border: '1px solid rgba(251,113,133,0.25)',
                borderRadius: 12,
              }}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--coral)' }} />
              <p className="text-xs font-medium" style={{ color: '#B91C1C' }}>
                Son tarix keçib. Cavabınız gecikmiş kimi qeyd ediləcək.
              </p>
            </div>
          )}

          <div>
            <label className="block" style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-900)', marginBottom: 6 }}>
              Mətn cavabı
              <span className="ml-1 text-xs font-normal" style={{ color: 'var(--ink-400)' }}>(istəyə görə)</span>
            </label>
            <textarea
              className="pastel-input"
              rows={4}
              placeholder="Cavabınızı buraya yazın..."
              value={content}
              onChange={e => setContent(e.target.value)}
              style={{ resize: 'vertical', minHeight: 90 }}
            />
            <p className="text-xs mt-1 text-right" style={{ color: 'var(--ink-400)' }}>
              {content.length} simvol
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: 'var(--hairline)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--ink-400)' }}>və ya fayl yükləyin</span>
            <div className="flex-1 h-px" style={{ background: 'var(--hairline)' }} />
          </div>

          {/* Drop zone */}
          <div
            style={{
              border: `2px dashed ${dragOver ? 'var(--brand-400)' : file ? 'var(--mint)' : 'var(--hairline-strong)'}`,
              borderRadius: 14,
              background: dragOver ? 'var(--brand-50)' : file ? 'rgba(31,168,85,0.06)' : 'var(--surface)',
              cursor: !file ? 'pointer' : 'default',
              transition: 'all .2s var(--ease-out-quint)',
            }}
            onDrop={handleDrop}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => !file && fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />

            {file ? (
              <div className="flex items-center gap-3 px-5 py-4">
                <div
                  className="flex items-center justify-center flex-shrink-0"
                  style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: 'rgba(34,197,94,0.14)',
                    border: '1px solid rgba(34,197,94,0.28)',
                  }}
                >
                  <Paperclip className="w-5 h-5" style={{ color: 'var(--mint)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: 'var(--ink-900)' }}>{file.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--ink-400)' }}>{formatFileSize(file.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); setFile(null) }}
                  className="flex-shrink-0 transition-all flex items-center justify-center"
                  style={{ width: 32, height: 32, borderRadius: 8, color: 'var(--ink-400)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(251,113,133,0.10)'; e.currentTarget.style.color = '#B91C1C' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink-400)' }}
                  aria-label="Bağla"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="px-5 py-8 text-center">
                <div className="icon-chip icon-chip-periwinkle mx-auto mb-3" style={{ width: 44, height: 44 }}>
                  <Upload className="w-5 h-5" />
                </div>
                <p className="font-semibold" style={{ fontSize: 14, color: 'var(--ink-900)' }}>
                  Faylı sürükləyin və ya seçin
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--ink-400)' }}>
                  PDF, Word, Excel, şəkil, mətn — maks. 50MB
                </p>
              </div>
            )}
          </div>

          {fileError && (
            <div
              className="flex items-start gap-2 px-4 py-3"
              style={{
                background: 'rgba(251,113,133,0.10)',
                border: '1px solid rgba(251,113,133,0.25)',
                borderRadius: 12,
              }}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--coral)' }} />
              <p className="text-xs font-medium" style={{ color: '#B91C1C' }}>{fileError}</p>
            </div>
          )}

          {error && (
            <div
              className="flex items-start gap-2 px-4 py-3"
              style={{
                background: 'rgba(251,113,133,0.10)',
                border: '1px solid rgba(251,113,133,0.25)',
                borderRadius: 12,
              }}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--coral)' }} />
              <p className="text-xs font-medium" style={{ color: '#B91C1C' }}>{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <Button variant="ghost" onClick={onClose} disabled={submitting}>
              Ləğv et
            </Button>
            <Button
              onClick={() => onSubmit(content, file)}
              loading={submitting}
              disabled={!canSubmit}
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

// ─── Assignment card — left accent bar + hover lift ───────────────────────────
function AssignmentCard({ assignment, status, submission, onSubmitClick }) {
  const sStyle = subjectStyle(assignment.subject?.name || '')

  return (
    <div
      className="liquid-card overflow-hidden"
      style={{
        padding: 0,
        borderLeft: '3px solid var(--brand-300)',
        transition: 'transform .15s var(--ease-out-quint), box-shadow .15s var(--ease-out-quint)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = 'var(--shadow-soft-lg)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = ''
      }}
    >
      <div className="px-6 py-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          {/* Subject tag — neutral brand chip */}
          <span
            style={{
              display: 'inline-flex', alignItems: 'center',
              background: sStyle.bg, color: sStyle.color,
              border: `1px solid ${sStyle.border}`,
              borderRadius: 8, padding: '4px 10px',
              fontSize: 12, fontWeight: 600,
            }}
          >
            {assignment.subject?.name || 'Fənn'}
          </span>
          <DueDateChip dueDate={assignment.due_date} status={status} />
        </div>

        <h3 className="font-semibold" style={{ fontSize: 15, color: 'var(--ink-900)', marginBottom: 6, lineHeight: 1.35 }}>
          {assignment.title}
        </h3>

        {assignment.description && (
          <p
            className="mb-4"
            style={{
              fontSize: 14, color: 'var(--ink-600)', lineHeight: 1.55,
              display: '-webkit-box', WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}
          >
            {assignment.description}
          </p>
        )}

        <div className="flex items-center justify-between gap-3 mt-3 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <StatusBadge status={status} />
            {status === 'graded' && submission?.score != null && (
              <ScoreDisplay score={submission.score} maxScore={assignment.max_score} />
            )}
          </div>

          {status === 'pending' && (
            <Button onClick={() => onSubmitClick(assignment)} size="sm">
              <span className="flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5" />
                Təhvil ver
              </span>
            </Button>
          )}
        </div>

        <FeedbackPanel feedback={submission?.feedback} />
      </div>
    </div>
  )
}

// ─── Filter pill ─────────────────────────────────────────────────────────────
const FILTER_TABS = [
  { key: 'all',       label: 'Hamısı' },
  { key: 'pending',   label: 'Gözləyən' },
  { key: 'submitted', label: 'Təhvil verilmiş' },
  { key: 'late',      label: 'Gecikmiş' },
  { key: 'graded',    label: 'Qiymətləndirilmiş' },
]

function FilterPill({ active, onClick, count, isOverdue, children }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center transition-all whitespace-nowrap flex-shrink-0"
      style={{
        padding: '8px 16px',
        borderRadius: 9999,
        fontSize: 13,
        fontWeight: 600,
        gap: 6,
        background: active ? 'var(--brand-100)' : 'var(--surface)',
        border: active ? '1.5px solid var(--brand-400)' : '1px solid var(--hairline-strong)',
        color: active ? 'var(--brand-600)' : 'var(--ink-600)',
        cursor: 'pointer',
      }}
    >
      {children}
      {count > 0 && (
        <span
          style={{
            background: isOverdue ? 'rgba(244,103,126,0.16)' : 'var(--brand-100)',
            color: isOverdue ? '#B91C1C' : 'var(--brand-600)',
            borderRadius: 9999,
            padding: '2px 8px',
            fontSize: 10,
            fontWeight: 700,
          }}
        >
          {count}
        </span>
      )}
    </button>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function StudentAssignments() {
  const { profile } = useAuth()

  const [loading, setLoading]                 = useState(true)
  const [assignments, setAssignments]         = useState([])
  const [submissions, setSubmissions]         = useState([])
  const [fetchError, setFetchError]           = useState(null)
  const [activeTab, setActiveTab]             = useState('all')
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [submitting, setSubmitting]           = useState(false)
  const [submitError, setSubmitError]         = useState(null)

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
        .order('due_date', { ascending: true })
        .limit(200),
      supabase
        .from('submissions')
        .select('*')
        .eq('student_id', profile.id)
        .limit(200),
    ])

    if (assignRes.error || subRes.error) {
      console.error('Assignments fetch error:', assignRes.error || subRes.error)
      setFetchError('Tapşırıqlar yüklənmədi. Səhifəni yeniləyin.')
    }

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

  async function handleSubmit(content, file) {
    if (!selectedAssignment) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const isLate =
        selectedAssignment.due_date && new Date(selectedAssignment.due_date) < new Date()

      let file_url = null
      if (file) {
        const ext = file.name.includes('.') ? file.name.split('.').pop() : 'bin'
        const path = `${profile.id}/${selectedAssignment.id}/${Date.now()}.${ext}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('submissions')
          .upload(path, file, { upsert: true })
        if (uploadError) {
          console.error('File upload error:', uploadError)
          setSubmitError(`Fayl yüklənmədi: ${uploadError.message}`)
          setSubmitting(false)
          return
        }
        const { data: urlData } = supabase.storage
          .from('submissions')
          .getPublicUrl(uploadData.path)
        file_url = urlData?.publicUrl || null
      }

      const payload = {
        assignment_id: selectedAssignment.id,
        student_id:    profile.id,
        content:       content.trim() || null,
        file_url,
        status:        isLate ? 'late' : 'submitted',
        submitted_at:  new Date().toISOString(),
      }
      const { error: upsertError } = await supabase
        .from('submissions')
        .upsert(payload, { onConflict: 'assignment_id,student_id' })

      if (upsertError) {
        console.error('Submission save error:', upsertError)
        setSubmitError(`Cavab saxlanılmadı: ${upsertError.message}`)
        setSubmitting(false)
        return
      }

      setSelectedAssignment(null)
      setSubmitError(null)
      await loadData()
    } catch (err) {
      console.error('Submit error:', err)
      setSubmitError(`Xəta: ${err.message}`)
    }
    setSubmitting(false)
  }

  // ── Counts ────────────────────────────────────────────────────────────────
  const counts = { pending: 0, submitted: 0, late: 0, graded: 0 }
  assignments.forEach(a => {
    const s = getStatus(a)
    counts[s] = (counts[s] || 0) + 1
  })

  const filtered =
    activeTab === 'all'
      ? assignments
      : assignments.filter(a => getStatus(a) === activeTab)

  if (loading) return <PageSpinner />

  if (fetchError) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="Xəta baş verdi"
        description={fetchError}
      />
    )
  }

  if (assignments.length === 0) {
    return (
      <div className="space-y-6">
        <h1
          className="font-display"
          style={{ fontSize: 32, fontWeight: 800, color: 'var(--ink-900)', letterSpacing: '-0.02em', lineHeight: 1.12 }}
        >
          Tapşırıqlar
        </h1>
        <EmptyState
          pose="reading"
          title="Tapşırıq yoxdur"
          description="Müəlliminiz tapşırıq əlavə etdikdə burada görünəcək."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* ── Page header ── */}
      <div className="flex items-center gap-3">
        <div className="icon-chip icon-chip-periwinkle" style={{ width: 44, height: 44 }}>
          <ClipboardList className="w-5 h-5" />
        </div>
        <h1
          className="font-display"
          style={{ fontSize: 32, fontWeight: 800, color: 'var(--ink-900)', letterSpacing: '-0.02em', lineHeight: 1.12 }}
        >
          Tapşırıqlar
        </h1>
      </div>

      {/* ── Status overview KPI cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Gözləyən"          value={counts.pending}   icon={ClipboardList} tone="periwinkle" />
        <StatCard label="Təhvil verilmiş"   value={counts.submitted} icon={CheckCircle2}  tone="mint" />
        <StatCard label="Gecikmiş"          value={counts.late}      icon={AlertCircle}   tone="coral" />
        <StatCard label="Qiymətləndirilmiş" value={counts.graded}    icon={Send}          tone="blue" />
      </div>

      {/* ── Filter pills ── */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTER_TABS.map(tab => (
          <FilterPill
            key={tab.key}
            active={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
            count={tab.key !== 'all' ? counts[tab.key] : 0}
            isOverdue={tab.key === 'late'}
          >
            {tab.label}
          </FilterPill>
        ))}
      </div>

      {/* ── Assignment cards ── */}
      {filtered.length === 0 ? (
        <EmptyState
          pose="thinking"
          title="Bu kateqoriyada tapşırıq yoxdur"
          description="Filtri dəyişərək digər tapşırıqları görə bilərsiniz."
        />
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

      {/* ── Submit modal ── */}
      <SubmitModal
        assignment={selectedAssignment}
        open={!!selectedAssignment}
        onClose={() => { setSelectedAssignment(null); setSubmitError(null) }}
        onSubmit={handleSubmit}
        submitting={submitting}
        error={submitError}
      />
    </div>
  )
}
