import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import { ClipboardList, Users, Calendar, CheckCircle, AlertCircle, Award } from 'lucide-react'
import { fmtNumeric } from '../../lib/dateUtils'

const PASTEL_COLORS = ['#7c6ee0', '#5db8a3', '#e8a87c', '#6b9dde']
function pastelColor(name = '') {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return PASTEL_COLORS[Math.abs(h) % PASTEL_COLORS.length]
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

  let label, bg, color, border
  if (diff < 0) {
    label = `${Math.abs(diff)} gün gecikmiş`
    bg = 'rgba(232,168,124,0.18)'; color = '#c47a4a'; border = '1px solid rgba(232,168,124,0.3)'
  } else if (diff === 0) {
    label = 'Bu gün'
    bg = 'rgba(232,168,124,0.18)'; color = '#c47a4a'; border = '1px solid rgba(232,168,124,0.3)'
  } else if (diff <= 3) {
    label = `${diff} gün qalıb`
    bg = 'rgba(232,168,124,0.12)'; color = '#c47a4a'; border = '1px solid rgba(232,168,124,0.25)'
  } else {
    label = fmtNumeric(dueDate)
    bg = 'rgba(124,110,224,0.08)'; color = '#64748b'; border = '1px solid rgba(124,110,224,0.15)'
  }

  return (
    <span
      className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold"
      style={{ background: bg, color, border }}
    >
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

  const statusLabels = { pending: t('pending'), submitted: t('submitted'), late: t('overdue'), graded: t('graded') }

  const statusStyles = {
    pending:   { bg: 'rgba(124,110,224,0.10)', color: '#7c6ee0', border: 'rgba(124,110,224,0.25)' },
    submitted: { bg: 'rgba(93,184,163,0.12)',  color: '#5db8a3', border: 'rgba(93,184,163,0.25)'  },
    late:      { bg: 'rgba(232,168,124,0.15)', color: '#c47a4a', border: 'rgba(232,168,124,0.3)'  },
    graded:    { bg: 'rgba(107,157,222,0.12)', color: '#6b9dde', border: 'rgba(107,157,222,0.25)' },
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
    { label: 'Hamısı',            value: counts.all,     color: '#7c6ee0', icon: ClipboardList },
    { label: 'Gözləyən',          value: counts.pending, color: '#6b9dde', icon: AlertCircle },
    { label: 'Gecikmiş',          value: counts.late,    color: '#e8a87c', icon: Calendar },
    { label: 'Qiymətləndirilmiş', value: counts.graded,  color: '#5db8a3', icon: Award },
  ]

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold" style={{ color: '#1a1a2e', letterSpacing: '-0.02em' }}>
          <span className="pastel-text">Tapşırıqlar</span>
        </h1>
        <p className="text-sm mt-1" style={{ color: '#64748b' }}>Uşağınızın bütün tapşırıqları</p>
      </div>

      {/* Child glass switcher */}
      {children.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {children.map(child => {
            const active = selectedChild?.id === child.id
            const color = pastelColor(child.full_name)
            return (
              <button
                key={child.id}
                onClick={() => setSelectedChild(child)}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0"
                style={
                  active
                    ? {
                        background: 'linear-gradient(135deg, #7c6ee0 0%, #5db8a3 100%)',
                        color: '#fff',
                        border: '1px solid rgba(124,110,224,0.3)',
                        boxShadow: '0 4px 12px rgba(124,110,224,0.25)',
                      }
                    : {
                        background: 'rgba(255,255,255,0.6)',
                        color: '#1a1a2e',
                        border: '1px solid rgba(124,110,224,0.2)',
                        backdropFilter: 'blur(12px)',
                      }
                }
              >
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
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
        <div className="liquid-card p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(124,110,224,0.12)' }}
            >
              <ClipboardList className="w-8 h-8" style={{ color: '#7c6ee0' }} />
            </div>
            <h3 className="text-lg font-bold" style={{ color: '#1a1a2e' }}>{t('no_assignments')}</h3>
            <p className="text-sm mt-1" style={{ color: '#64748b' }}>{t('assignments_will_appear')}</p>
          </div>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {pills.map(pill => {
              const Icon = pill.icon
              return (
                <div key={pill.label} className="liquid-card p-4 flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${pill.color}20`, color: pill.color }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-2xl font-extrabold leading-none" style={{ color: pill.color }}>
                      {pill.value}
                    </p>
                    <p className="text-xs mt-1 truncate" style={{ color: '#64748b' }}>{pill.label}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {tabs.map(tab => {
              const active = activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all"
                  style={
                    active
                      ? {
                          background: 'linear-gradient(135deg, #7c6ee0 0%, #5db8a3 100%)',
                          color: '#fff',
                          border: '1px solid rgba(124,110,224,0.3)',
                          boxShadow: '0 4px 12px rgba(124,110,224,0.2)',
                        }
                      : {
                          background: 'rgba(255,255,255,0.6)',
                          color: '#64748b',
                          border: '1px solid rgba(124,110,224,0.2)',
                          backdropFilter: 'blur(12px)',
                        }
                  }
                >
                  {tab.label}
                  {tab.key !== 'submitted' && (
                    <span className="ml-1.5 opacity-70">
                      {tab.key === 'all'    ? counts.all    :
                       tab.key === 'pending' ? counts.pending :
                       tab.key === 'late'    ? counts.late    :
                       tab.key === 'graded'  ? counts.graded  : ''}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Cards */}
          {filtered.length === 0 ? (
            <div className="liquid-card p-10 text-center">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{ background: 'rgba(124,110,224,0.10)' }}
              >
                <ClipboardList className="w-7 h-7" style={{ color: '#7c6ee0' }} />
              </div>
              <h3 className="text-base font-bold" style={{ color: '#1a1a2e' }}>Bu kateqoriyada tapşırıq yoxdur</h3>
              <p className="text-sm mt-1" style={{ color: '#64748b' }}>Başqa filtrlərə baxın</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(a => {
                const status   = getStatus(a)
                const sub      = submissions.find(s => s.assignment_id === a.id)
                const subjName = a.subject?.name || ''
                const topColor = pastelColor(subjName)
                const sStyle   = statusStyles[status]

                return (
                  <div key={a.id} className="liquid-card overflow-hidden">
                    {/* Colored top bar */}
                    <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${topColor}, ${topColor}80)` }} />

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-2">
                            {subjName && (
                              <span
                                className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                                style={{ background: `${topColor}1F`, color: topColor, border: `1px solid ${topColor}40` }}
                              >
                                {subjName}
                              </span>
                            )}
                            <span
                              className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                              style={{ background: sStyle.bg, color: sStyle.color, border: `1px solid ${sStyle.border}` }}
                            >
                              {statusLabels[status]}
                            </span>
                          </div>

                          <h3 className="text-sm font-bold leading-snug" style={{ color: '#1a1a2e' }}>{a.title}</h3>

                          {a.description && (
                            <p className="text-xs mt-1 line-clamp-2" style={{ color: '#64748b' }}>{a.description}</p>
                          )}

                          {a.due_date && (
                            <div className="mt-2.5">
                              <DueDateChip dueDate={a.due_date} />
                            </div>
                          )}
                        </div>

                        {sub?.score != null && (
                          <div
                            className="flex-shrink-0 flex flex-col items-center justify-center rounded-2xl px-3.5 py-2.5 min-w-[60px]"
                            style={{
                              background: 'rgba(93,184,163,0.12)',
                              border: '1px solid rgba(93,184,163,0.3)',
                            }}
                          >
                            <span className="text-xl font-extrabold leading-none" style={{ color: '#5db8a3' }}>{sub.score}</span>
                            {a.max_score != null && (
                              <span className="text-[10px] mt-0.5 font-medium" style={{ color: '#5db8a3' }}>/ {a.max_score}</span>
                            )}
                          </div>
                        )}
                      </div>

                      {sub?.feedback && (
                        <div
                          className="rounded-xl p-3 mt-3"
                          style={{
                            background: 'rgba(124,110,224,0.06)',
                            border: '1px solid rgba(124,110,224,0.12)',
                          }}
                        >
                          <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#7c6ee0' }}>
                            {t('teacher_feedback')}
                          </p>
                          <p className="text-xs leading-relaxed" style={{ color: '#1a1a2e' }}>{sub.feedback}</p>
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
