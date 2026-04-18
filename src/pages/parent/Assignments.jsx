import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import { ClipboardList, Users, Calendar, CheckCircle, AlertCircle, Award } from 'lucide-react'
import { fmtNumeric } from '../../lib/dateUtils'

function subjectColor(name = '') {
  const palette = ['#534AB7', '#1D9E75', '#E67E22', '#3498DB', '#E74C3C', '#9B59B6', '#27AE60', '#F39C12']
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return palette[Math.abs(hash) % palette.length]
}

function DueDateChip({ dueDate }) {
  if (!dueDate) return null
  const due = new Date(dueDate)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  due.setHours(0, 0, 0, 0)
  const diff = Math.round((due - now) / (1000 * 60 * 60 * 24))

  let label, cls
  if (diff < 0) {
    label = `${Math.abs(diff)} gün gecikmiş`
    cls = 'bg-red-100 text-red-700'
  } else if (diff === 0) {
    label = 'Bu gün'
    cls = 'bg-amber-100 text-amber-700'
  } else if (diff <= 3) {
    label = `${diff} gün qalıb`
    cls = 'bg-amber-100 text-amber-700'
  } else {
    label = fmtNumeric(dueDate)
    cls = 'bg-gray-100 text-gray-500'
  }

  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>
      <Calendar size={10} />
      {label}
    </span>
  )
}

export default function ParentAssignments() {
  const { profile, t } = useAuth()

  const tabs = [
    { key: 'all',       label: 'Hamısı' },
    { key: 'pending',   label: 'Gözləyən' },
    { key: 'submitted', label: 'Təhvil Verilmiş' },
    { key: 'late',      label: 'Gecikmiş' },
    { key: 'graded',    label: 'Qiymətləndirilmiş' },
  ]

  const [loading, setLoading]           = useState(true)
  const [children, setChildren]         = useState([])
  const [selectedChild, setSelectedChild] = useState(null)
  const [assignments, setAssignments]   = useState([])
  const [submissions, setSubmissions]   = useState([])
  const [activeTab, setActiveTab]       = useState('all')

  useEffect(() => {
    if (!profile) return
    loadChildren()
  }, [profile])

  useEffect(() => {
    if (!selectedChild) return
    loadData(selectedChild.id)
  }, [selectedChild])

  async function loadChildren() {
    const { data } = await supabase
      .from('parent_children')
      .select('child:profiles!child_id(*, school:schools(*))')
      .eq('parent_id', profile.id)

    const kids = (data || []).map(d => d.child).filter(Boolean)
    setChildren(kids)
    if (kids.length > 0) setSelectedChild(kids[0])
    if (!kids.length) setLoading(false)
  }

  async function loadData(childId) {
    setLoading(true)
    const { data: memberData } = await supabase
      .from('class_members')
      .select('class_id')
      .eq('student_id', childId)

    const classIds = (memberData || []).map(m => m.class_id)
    if (!classIds.length) {
      setAssignments([])
      setSubmissions([])
      setLoading(false)
      return
    }

    const [assignRes, subRes] = await Promise.all([
      supabase.from('assignments').select('*, subject:subjects(name)').in('class_id', classIds).order('due_date', { ascending: false }),
      supabase.from('submissions').select('*').eq('student_id', childId),
    ])

    setAssignments(assignRes.data || [])
    setSubmissions(subRes.data || [])
    setLoading(false)
  }

  function getStatus(assignment) {
    const sub = submissions.find(s => s.assignment_id === assignment.id)
    if (sub) return sub.status === 'graded' ? 'graded' : 'submitted'
    if (assignment.due_date && new Date(assignment.due_date) < new Date()) return 'late'
    return 'pending'
  }

  if (loading && !children.length) return <PageSpinner />

  if (children.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Uşaq tapılmadı"
        description="Hesabınıza bağlı uşaq profili yoxdur."
      />
    )
  }

  const statusLabels   = { pending: t('pending'), submitted: t('submitted'), late: t('overdue'), graded: t('graded') }
  const statusVariants = { pending: 'default', submitted: 'good', late: 'late', graded: 'excellent' }

  const statusBadgeCls = {
    pending:   'bg-gray-100 text-gray-600',
    submitted: 'bg-green-100 text-green-700',
    late:      'bg-red-100 text-red-700',
    graded:    'bg-teal-100 text-teal-700',
  }

  const filtered = activeTab === 'all'
    ? assignments
    : assignments.filter(a => getStatus(a) === activeTab)

  const counts = {
    all:       assignments.length,
    pending:   assignments.filter(a => getStatus(a) === 'pending').length,
    late:      assignments.filter(a => getStatus(a) === 'late').length,
    graded:    assignments.filter(a => getStatus(a) === 'graded').length,
  }

  const pills = [
    { label: 'Hamısı',             value: counts.all,     color: 'text-gray-700',  dot: 'bg-gray-400'   },
    { label: 'Gözləyən',           value: counts.pending, color: 'text-amber-600', dot: 'bg-amber-400'  },
    { label: 'Gecikmiş',           value: counts.late,    color: 'text-red-600',   dot: 'bg-red-400'    },
    { label: 'Qiymətləndirilmiş',  value: counts.graded,  color: 'text-teal-600',  dot: 'bg-teal-400'   },
  ]

  return (
    <div className="space-y-6">

      {/* Child selector */}
      {children.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {children.map(child => (
            <button
              key={child.id}
              onClick={() => setSelectedChild(child)}
              className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${
                selectedChild?.id === child.id
                  ? 'bg-purple-light text-purple border-purple font-semibold'
                  : 'border-border-soft text-gray-500 hover:bg-surface'
              }`}
            >
              {child.full_name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <PageSpinner />
      ) : assignments.length === 0 ? (
        <EmptyState icon={ClipboardList} title={t('no_assignments')} description={t('assignments_will_appear')} />
      ) : (
        <>
          {/* Stat pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {pills.map(pill => (
              <div
                key={pill.label}
                className="flex flex-col items-center px-5 py-3 bg-white rounded-xl border border-border-soft"
              >
                <span className={`text-2xl font-bold ${pill.color}`}>{pill.value}</span>
                <span className="text-xs text-gray-400 mt-0.5 text-center">{pill.label}</span>
              </div>
            ))}
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'bg-purple-light text-purple border-purple font-semibold'
                    : 'border-border-soft text-gray-500 hover:bg-surface'
                }`}
              >
                {tab.label}
                {tab.key !== 'submitted' && (
                  <span className="ml-1.5 opacity-60">
                    {tab.key === 'all'    ? counts.all    :
                     tab.key === 'pending' ? counts.pending :
                     tab.key === 'late'    ? counts.late    :
                     tab.key === 'graded'  ? counts.graded  : ''}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Assignment cards */}
          {filtered.length === 0 ? (
            <EmptyState icon={ClipboardList} title="Tapılmadı" description="Bu kateqoriyada tapşırıq yoxdur." />
          ) : (
            <div className="space-y-3">
              {filtered.map(a => {
                const status    = getStatus(a)
                const sub       = submissions.find(s => s.assignment_id === a.id)
                const subjName  = a.subject?.name || ''
                const topColor  = subjectColor(subjName)

                return (
                  <div
                    key={a.id}
                    className="bg-white rounded-xl border border-border-soft overflow-hidden"
                  >
                    {/* Colored top bar */}
                    <div className="h-1 w-full" style={{ backgroundColor: topColor }} />

                    <div className="p-4">
                      {/* Header row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {/* Subject + status badges */}
                          <div className="flex flex-wrap items-center gap-1.5 mb-2">
                            {subjName && (
                              <span className="bg-purple-light text-purple px-2 py-0.5 rounded-full text-xs font-medium">
                                {subjName}
                              </span>
                            )}
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadgeCls[status]}`}>
                              {statusLabels[status]}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className="text-sm font-semibold text-gray-900 leading-snug">{a.title}</h3>

                          {/* Description */}
                          {a.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{a.description}</p>
                          )}

                          {/* Due date chip */}
                          {a.due_date && (
                            <div className="mt-2">
                              <DueDateChip dueDate={a.due_date} />
                            </div>
                          )}
                        </div>

                        {/* Score pill (graded only) */}
                        {sub?.score != null && (
                          <div className="flex-shrink-0 flex flex-col items-center justify-center bg-teal-50 border border-teal-200 rounded-xl px-3 py-2 min-w-[56px]">
                            <span className="text-lg font-bold text-teal-700 leading-none">{sub.score}</span>
                            {a.max_score != null && (
                              <span className="text-[10px] text-teal-500 mt-0.5">/ {a.max_score}</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Feedback block */}
                      {sub?.feedback && (
                        <div className="bg-surface rounded-lg p-3 mt-3">
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
                            {t('teacher_feedback')}
                          </p>
                          <p className="text-xs text-gray-700 leading-relaxed">{sub.feedback}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
