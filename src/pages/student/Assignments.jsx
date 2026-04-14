import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { Textarea } from '../../components/ui/Input'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import { ClipboardList } from 'lucide-react'

export default function StudentAssignments() {
  const { profile, t } = useAuth()

  const tabs = [
    { key: 'all', label: t('all') },
    { key: 'pending', label: t('pending') },
    { key: 'submitted', label: t('submitted') },
    { key: 'late', label: t('overdue') },
  ]

  const [loading, setLoading] = useState(true)
  const [assignments, setAssignments] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [activeTab, setActiveTab] = useState('all')
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [submitContent, setSubmitContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!profile) return
    loadData()
  }, [profile])

  async function loadData() {
    const { data: memberData } = await supabase
      .from('class_members')
      .select('class_id')
      .eq('student_id', profile.id)

    const classIds = (memberData || []).map(m => m.class_id)
    if (!classIds.length) { setLoading(false); return }

    const [assignRes, subRes] = await Promise.all([
      supabase.from('assignments').select('*, subject:subjects(name)').in('class_id', classIds).order('due_date', { ascending: false }),
      supabase.from('submissions').select('*').eq('student_id', profile.id),
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

  const filtered = activeTab === 'all'
    ? assignments
    : assignments.filter(a => getStatus(a) === activeTab)

  async function handleSubmit() {
    setSubmitting(true)
    try {
      const isLate = selectedAssignment.due_date && new Date(selectedAssignment.due_date) < new Date()
      await supabase.from('submissions').insert({
        assignment_id: selectedAssignment.id,
        student_id: profile.id,
        content: submitContent,
        status: isLate ? 'late' : 'submitted',
      })
      setSelectedAssignment(null)
      setSubmitContent('')
      loadData()
    } catch {}
    setSubmitting(false)
  }

  if (loading) return <PageSpinner />
  if (assignments.length === 0) return <EmptyState icon={ClipboardList} title={t('no_assignments')} description={t('assignments_will_appear')} />

  const statusLabels = { pending: t('pending'), submitted: t('submitted'), late: t('overdue'), graded: t('graded') }
  const statusVariants = { pending: 'default', submitted: 'good', late: 'late', graded: 'excellent' }

  return (
    <div className="space-y-6">
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
              {status === 'pending' && (
                <Button variant="ghost" className="mt-4" onClick={() => setSelectedAssignment(a)}>
                  {t('submit_assignment')}
                </Button>
              )}
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

      <Modal open={!!selectedAssignment} onClose={() => setSelectedAssignment(null)} title={t('submit_assignment')}>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-900">{selectedAssignment?.title}</h3>
            {selectedAssignment?.description && <p className="text-xs text-gray-500 mt-1">{selectedAssignment.description}</p>}
          </div>
          <Textarea
            label={t('your_answer')}
            rows={6}
            value={submitContent}
            onChange={e => setSubmitContent(e.target.value)}
            placeholder={t('your_answer')}
          />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setSelectedAssignment(null)}>{t('cancel')}</Button>
            <Button onClick={handleSubmit} loading={submitting} disabled={!submitContent.trim()}>{t('submit_assignment')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
