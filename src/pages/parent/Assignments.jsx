import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import { ClipboardList, Users } from 'lucide-react'

export default function ParentAssignments() {
  const { profile, t } = useAuth()
  const tabs = [
    { key: 'all', label: t('all') },
    { key: 'pending', label: t('pending') },
    { key: 'submitted', label: t('submitted') },
    { key: 'late', label: t('overdue') },
  ]
  const [loading, setLoading] = useState(true)
  const [children, setChildren] = useState([])
  const [selectedChild, setSelectedChild] = useState(null)
  const [assignments, setAssignments] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [activeTab, setActiveTab] = useState('all')

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
        title={t('error')}
        description={t('error')}
      />
    )
  }

  const filtered = activeTab === 'all'
    ? assignments
    : assignments.filter(a => getStatus(a) === activeTab)

  const statusLabels = { pending: t('pending'), submitted: t('submitted'), late: t('overdue'), graded: t('graded') }
  const statusVariants = { pending: 'default', submitted: 'good', late: 'late', graded: 'excellent' }

  return (
    <div className="space-y-6">
      {children.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {children.map(child => (
            <button
              key={child.id}
              onClick={() => setSelectedChild(child)}
              className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${
                selectedChild?.id === child.id
                  ? 'border-purple bg-purple-light text-purple'
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
          <div className="flex gap-2 overflow-x-auto pb-2">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${
                  activeTab === tab.key ? 'border-purple bg-purple-light text-purple' : 'border-border-soft text-gray-500 hover:bg-surface'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {filtered.map(a => {
              const status = getStatus(a)
              const sub = submissions.find(s => s.assignment_id === a.id)
              return (
                <Card key={a.id} hover={false}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="default">{a.subject?.name}</Badge>
                        <Badge variant={statusVariants[status]}>{statusLabels[status]}</Badge>
                      </div>
                      <h3 className="text-sm font-medium text-gray-900">{a.title}</h3>
                      {a.description && <p className="text-xs text-gray-500 mt-1">{a.description}</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      {a.due_date && (
                        <p className="text-xs text-gray-500">
                          {new Date(a.due_date).toLocaleDateString('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </p>
                      )}
                      {sub?.score != null && (
                        <p className="text-sm font-medium text-purple mt-1">{sub.score}/{a.max_score}</p>
                      )}
                    </div>
                  </div>
                  {sub?.feedback && (
                    <div className="mt-4 bg-surface rounded-lg p-4">
                      <p className="text-xs text-gray-400 mb-1">{t('teacher_feedback')}</p>
                      <p className="text-sm text-gray-700">{sub.feedback}</p>
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
