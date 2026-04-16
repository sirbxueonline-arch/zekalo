import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { Select, Textarea } from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Table from '../../components/ui/Table'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import Badge from '../../components/ui/Badge'
import { ClipboardList, Plus, Sparkles, Loader2 } from 'lucide-react'

export default function TeacherAssignments() {
  const { profile, t } = useAuth()
  const [loading, setLoading] = useState(true)
  const [teacherClasses, setTeacherClasses] = useState([])
  const [assignments, setAssignments] = useState([])
  const [submissions, setSubmissions] = useState({})
  const [showNewModal, setShowNewModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [detailSubmissions, setDetailSubmissions] = useState([])
  const [saving, setSaving] = useState(false)
  const [aiLoading, setAiLoading] = useState(null)

  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    class_id: '',
    subject_id: '',
    due_date: '',
    max_score: 10,
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
    let subCounts = {}

    if (assignIds.length) {
      const { data: subData } = await supabase
        .from('submissions')
        .select('assignment_id')
        .in('assignment_id', assignIds)

      const counts = {}
      ;(subData || []).forEach(s => {
        counts[s.assignment_id] = (counts[s.assignment_id] || 0) + 1
      })
      subCounts = counts
    }

    // Get student counts per class
    const classCounts = {}
    for (const cid of [...new Set(classIds)]) {
      const { count } = await supabase
        .from('class_members')
        .select('id', { count: 'exact', head: true })
        .eq('class_id', cid)
      classCounts[cid] = count || 0
    }

    setSubmissions(subCounts)
    setAssignments(
      (assignData || []).map(a => ({
        ...a,
        submissionCount: subCounts[a.id] || 0,
        totalStudents: classCounts[a.class_id] || 0,
      }))
    )
    setLoading(false)
  }

  async function handleCreate() {
    setSaving(true)
    const { error } = await supabase.from('assignments').insert({
      ...newAssignment,
      teacher_id: profile.id,
      max_score: Number(newAssignment.max_score),
    })

    if (!error) {
      setShowNewModal(false)
      setNewAssignment({ title: '', description: '', class_id: '', subject_id: '', due_date: '', max_score: 10 })
      loadData()
    }
    setSaving(false)
  }

  async function openDetail(assignment) {
    setSelectedAssignment(assignment)
    const { data } = await supabase
      .from('submissions')
      .select('*, student:profiles(id, full_name)')
      .eq('assignment_id', assignment.id)
      .order('created_at', { ascending: false })

    setDetailSubmissions(data || [])
    setShowDetailModal(true)
  }

  async function gradeSubmission(submissionId, score) {
    const val = parseFloat(score)
    if (isNaN(val)) return
    await supabase.from('submissions').update({ score: val, status: 'graded' }).eq('id', submissionId)
    setDetailSubmissions(prev => prev.map(s => s.id === submissionId ? { ...s, score: val, status: 'graded' } : s))
  }

  async function generateAIFeedback(submission) {
    setAiLoading(submission.id)
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/zeka-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            messages: [{ role: 'user', content: `Bu tapshiriq cavabina rəy ver:\n\nTapshiriq: ${selectedAssignment.title}\n${selectedAssignment.description || ''}\n\nCavab:\n${submission.content}` }],
            userProfile: profile,
            mode: 'assignment_feedback',
            language: 'az',
          }),
        }
      )

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
            const data = JSON.parse(line.slice(6))
            if (data.type === 'content_block_delta' && data.delta?.text) {
              fullContent += data.delta.text
            }
          } catch {}
        }
      }

      await supabase.from('submissions').update({ feedback: fullContent }).eq('id', submission.id)
      setDetailSubmissions(prev => prev.map(s => s.id === submission.id ? { ...s, feedback: fullContent } : s))
    } catch {
      setDetailSubmissions(prev => prev.map(s =>
        s.id === submission.id ? { ...s, feedback: 'AI rəyi əldə edilə bilmədi. Yenidən cəhd edin.' } : s
      ))
    } finally {
      setAiLoading(null)
    }
  }

  const formatDate = (d) => {
    if (!d) return ''
    const dt = new Date(d)
    return `${String(dt.getDate()).padStart(2, '0')}.${String(dt.getMonth() + 1).padStart(2, '0')}.${dt.getFullYear()}`
  }

  if (loading) return <PageSpinner />

  const uniqueClasses = [...new Map(teacherClasses.map(tc => [tc.class_id, tc.class])).values()]
  const subjectsForClass = (classId) => teacherClasses.filter(tc => tc.class_id === classId).map(tc => tc.subject)

  const columns = [
    { key: 'class', label: t('class_name'), render: (_, row) => row.class?.name },
    { key: 'subject', label: t('subject'), render: (_, row) => <Badge variant="default">{row.subject?.name}</Badge> },
    { key: 'title', label: t('assignments'), render: (v) => <span className="font-medium text-gray-900">{v}</span> },
    { key: 'due_date', label: t('date'), render: (v) => formatDate(v) },
    {
      key: 'submissionCount',
      label: t('submit'),
      render: (v, row) => (
        <span className="text-sm">
          {v}/{row.totalStudents}
          <span className="text-gray-400 ml-1">
            ({row.totalStudents > 0 ? Math.round((v / row.totalStudents) * 100) : 0}%)
          </span>
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-4xl text-gray-900 tracking-tight">{t('assignments')}</h1>
        <Button onClick={() => setShowNewModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          {t('new_assignment')}
        </Button>
      </div>

      {assignments.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={t('no_data')}
          description={t('new_assignment')}
          actionLabel={t('new_assignment')}
          onAction={() => setShowNewModal(true)}
        />
      ) : (
        <Card hover={false}>
          <Table columns={columns} data={assignments} onRowClick={openDetail} />
        </Card>
      )}

      <Modal open={showNewModal} onClose={() => setShowNewModal(false)} title={t('new_assignment')}>
        <div className="space-y-4">
          <Input
            label={t('assignments')}
            value={newAssignment.title}
            onChange={e => setNewAssignment(p => ({ ...p, title: e.target.value }))}
          />
          <Textarea
            label={t('note')}
            rows={4}
            value={newAssignment.description}
            onChange={e => setNewAssignment(p => ({ ...p, description: e.target.value }))}
          />
          <Select
            label={t('class_name')}
            value={newAssignment.class_id}
            onChange={e => setNewAssignment(p => ({ ...p, class_id: e.target.value, subject_id: '' }))}
          >
            <option value="">{t('class_name')}</option>
            {uniqueClasses.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
          <Select
            label={t('subject')}
            value={newAssignment.subject_id}
            onChange={e => setNewAssignment(p => ({ ...p, subject_id: e.target.value }))}
          >
            <option value="">{t('subject')}</option>
            {subjectsForClass(newAssignment.class_id).map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </Select>
          <Input
            label={t('date')}
            type="date"
            value={newAssignment.due_date}
            onChange={e => setNewAssignment(p => ({ ...p, due_date: e.target.value }))}
          />
          <Input
            label={t('score')}
            type="number"
            value={newAssignment.max_score}
            onChange={e => setNewAssignment(p => ({ ...p, max_score: e.target.value }))}
          />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowNewModal(false)}>{t('cancel')}</Button>
            <Button onClick={handleCreate} loading={saving} disabled={!newAssignment.title || !newAssignment.class_id || !newAssignment.subject_id}>{t('submit')}</Button>
          </div>
        </div>
      </Modal>

      <Modal open={showDetailModal} onClose={() => setShowDetailModal(false)} title={selectedAssignment?.title || ''} size="lg">
        <div className="space-y-4">
          {selectedAssignment?.description && (
            <p className="text-sm text-gray-500">{selectedAssignment.description}</p>
          )}

          {detailSubmissions.length === 0 ? (
            <p className="text-center py-8 text-sm text-gray-400">Hələ təhvil verilmiş cavab yoxdur</p>
          ) : (
            <div className="space-y-4">
              {detailSubmissions.map(sub => (
                <div key={sub.id} className="border border-border-soft rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-900">{sub.student?.full_name}</span>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min={0}
                        max={selectedAssignment?.max_score || 10}
                        defaultValue={sub.score || ''}
                        placeholder="Bal"
                        className="w-20 border border-border-soft rounded-md px-3 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-purple"
                        onBlur={e => gradeSubmission(sub.id, e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && e.target.blur()}
                      />
                      <span className="text-xs text-gray-400">/ {selectedAssignment?.max_score}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 bg-surface rounded-lg p-3 mb-3">{sub.content}</p>
                  {sub.feedback ? (
                    <div className="bg-purple-light rounded-lg p-3">
                      <p className="text-xs text-purple-dark font-medium mb-1">Zəka rəyi</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{sub.feedback}</p>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      onClick={() => generateAIFeedback(sub)}
                      disabled={aiLoading === sub.id}
                    >
                      {aiLoading === sub.id ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Sparkles className="w-4 h-4 mr-2" />
                      )}
                      Zəka rəyi yarat
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
