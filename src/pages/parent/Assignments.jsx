import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import StatCard from '../../components/ui/StatCard'
import CountUp from '../../components/ui/CountUp'
import { ClipboardList, Calendar, CheckCircle, AlertCircle, Award } from 'lucide-react'
import { fmtNumeric } from '../../lib/dateUtils'

const AVATAR_COLORS = ['var(--brand-400)', 'var(--grape)', 'var(--mint)', 'var(--sky)']
function avatarColor(name = '') {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}

function childInitials(name = '') {
  return name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?'
}

function DueDateChip({ dueDate }) {
  if (!dueDate) return null
  const due = new Date(dueDate)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  due.setHours(0, 0, 0, 0)
  const diff = Math.round((due - now) / (1000 * 60 * 60 * 24))

  let pillClass, label
  if (diff < 0) {
    pillClass = 'pill pill-peach'
    label = `${Math.abs(diff)} gün gecikmiş`
  } else if (diff === 0) {
    pillClass = 'pill pill-peach'
    label = 'Bu gün'
  } else if (diff <= 3) {
    pillClass = 'pill pill-peach'
    label = `${diff} gün qalıb`
  } else {
    pillClass = 'pill pill-peri'
    label = fmtNumeric(dueDate)
  }

  return (
    <span className={`${pillClass} inline-flex items-center gap-1`}>
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

  const [loading, setLoading]             = useState(true)
  const [children, setChildren]           = useState([])
  const [selectedChild, setSelectedChild] = useState(null)
  const [assignments, setAssignments]     = useState([])
  const [submissions, setSubmissions]     = useState([])
  const [activeTab, setActiveTab]         = useState('all')

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
        pose="thinking"
        title="Uşaq tapılmadı"
        description="Hesabınıza bağlı uşaq profili yoxdur."
      />
    )
  }

  const statusLabels = {
    pending: t('pending'),
    submitted: t('submitted'),
    late: t('overdue'),
    graded: t('graded'),
  }

  // Map statuses to design-system pill classes
  const statusPillClass = {
    pending:   'pill pill-peri',
    submitted: 'pill pill-mint',
    late:      'pill pill-peach',
    graded:    'pill pill-blue',
  }

  const filtered = activeTab === 'all'
    ? assignments
    : assignments.filter(a => getStatus(a) === activeTab)

  const counts = {
    all:     assignments.length,
    pending: assignments.filter(a => getStatus(a) === 'pending').length,
    late:    assignments.filter(a => getStatus(a) === 'late').length,
    graded:  assignments.filter(a => getStatus(a) === 'graded').length,
  }

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div className="flex items-start gap-3">
        <div
          className="icon-chip icon-chip-periwinkle flex-shrink-0"
          style={{ width: 48, height: 48 }}
        >
          <ClipboardList className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-display text-[30px] font-extrabold text-ink-900" style={{ letterSpacing: '-0.02em' }}>
            Tapşırıqlar
          </h1>
          <p className="text-[15px] text-ink-400 mt-0.5">Uşağınızın bütün tapşırıqları</p>
        </div>
      </div>

      {/* Child pill switcher */}
      {children.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {children.map(child => {
            const active = selectedChild?.id === child.id
            const color = avatarColor(child.full_name)
            return (
              <button
                key={child.id}
                onClick={() => setSelectedChild(child)}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-pill text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0"
                style={
                  active
                    ? { background: 'var(--brand-500)', color: '#fff' }
                    : { background: 'var(--surface)', color: 'var(--ink-700)', border: '1px solid var(--hairline)' }
                }
              >
                <span
                  className="w-7 h-7 rounded-pill flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: active ? 'rgba(255,255,255,0.25)' : color }}
                >
                  {childInitials(child.full_name)}
                </span>
                {child.full_name}
              </button>
            )
          })}
        </div>
      )}

      {loading ? (
        <PageSpinner />
      ) : assignments.length === 0 ? (
        <EmptyState
          pose="reading"
          title={t('no_assignments')}
          description={t('assignments_will_appear')}
        />
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Hamısı"            value={<CountUp to={counts.all}     duration={600} />} icon={ClipboardList} tone="periwinkle" />
            <StatCard label="Gözləyən"          value={<CountUp to={counts.pending} duration={600} />} icon={AlertCircle}   tone="blue"      />
            <StatCard label="Gecikmiş"          value={<CountUp to={counts.late}    duration={600} />} icon={Calendar}      tone="peach"     />
            <StatCard label="Qiymətləndirilmiş" value={<CountUp to={counts.graded}  duration={600} />} icon={Award}         tone="mint"      />
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {tabs.map(tab => {
              const active = activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="px-4 py-2 rounded-pill text-xs font-semibold whitespace-nowrap transition-all"
                  style={
                    active
                      ? { background: 'var(--brand-500)', color: '#fff' }
                      : { background: 'var(--surface)', color: 'var(--ink-600)', border: '1px solid var(--hairline)' }
                  }
                >
                  {tab.label}
                  {tab.key !== 'submitted' && (
                    <span className="ml-1.5 opacity-70">
                      {tab.key === 'all'     ? counts.all     :
                       tab.key === 'pending' ? counts.pending :
                       tab.key === 'late'    ? counts.late    :
                       tab.key === 'graded'  ? counts.graded  : ''}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Assignment cards */}
          {filtered.length === 0 ? (
            <EmptyState
              tier={1}
              icon={ClipboardList}
              title="Bu kateqoriyada tapşırıq yoxdur"
              description="Başqa filtrlərə baxın"
            />
          ) : (
            <div className="space-y-3">
              {filtered.map(a => {
                const status   = getStatus(a)
                const sub      = submissions.find(s => s.assignment_id === a.id)
                const subjName = a.subject?.name || ''

                return (
                  <div key={a.id} className="liquid-card overflow-hidden transition-transform hover:-translate-y-0.5">
                    {/* Brand top accent bar */}
                    <div className="h-1 w-full" style={{ background: 'var(--brand-500)' }} />

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-2">
                            {subjName && (
                              <span
                                className="px-2.5 py-0.5 rounded-chip text-xs font-semibold"
                                style={{
                                  background: 'var(--surface-2)',
                                  color: 'var(--ink-600)',
                                  border: '1px solid var(--hairline)',
                                }}
                              >
                                {subjName}
                              </span>
                            )}
                            <span className={statusPillClass[status]}>
                              {statusLabels[status]}
                            </span>
                          </div>

                          <h3 className="text-[15px] font-semibold text-ink-900 leading-snug">{a.title}</h3>

                          {a.description && (
                            <p className="text-[13px] text-ink-400 mt-1 line-clamp-2">{a.description}</p>
                          )}

                          {a.due_date && (
                            <div className="mt-2.5">
                              <DueDateChip dueDate={a.due_date} />
                            </div>
                          )}
                        </div>

                        {sub?.score != null && (
                          <div
                            className="flex-shrink-0 flex flex-col items-center justify-center rounded-tile px-4 py-3 min-w-[68px]"
                            style={{ background: 'rgba(31,168,85,0.10)', border: '1px solid rgba(31,168,85,0.22)' }}
                          >
                            <span className="font-display font-extrabold leading-none tabular-nums" style={{ fontSize: 26, color: 'var(--mint)' }}>
                              <CountUp to={sub.score} duration={700} />
                            </span>
                            {a.max_score != null && (
                              <span className="text-[11px] mt-0.5 font-semibold" style={{ color: 'var(--mint)' }}>
                                / {a.max_score}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {sub?.feedback && (
                        <div
                          className="rounded-tile p-3 mt-3"
                          style={{ background: 'var(--brand-50)', border: '1px solid var(--brand-100)' }}
                        >
                          <p className="text-[11px] font-semibold uppercase tracking-[0.04em] mb-1 text-brand-500">
                            {t('teacher_feedback')}
                          </p>
                          <p className="text-[13px] leading-relaxed text-ink-900">{sub.feedback}</p>
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
