import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { Select } from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import { GradeBadge } from '../../components/ui/Badge'
import { BookOpen, Plus, Download, Search } from 'lucide-react'

const assessmentTypes = [
  { value: 'test', label: 'Test' },
  { value: 'homework', label: 'Ev tapşırığı' },
  { value: 'project', label: 'Layihə' },
  { value: 'exam', label: 'İmtahan' },
  { value: 'classwork', label: 'Sinif işi' },
]

export default function TeacherGradebook() {
  const { profile, t } = useAuth()
  const [loading, setLoading] = useState(true)
  const [teacherClasses, setTeacherClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [students, setStudents] = useState([])
  const [grades, setGrades] = useState({})
  const [assessments, setAssessments] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newAssessment, setNewAssessment] = useState({ title: '', type: 'test', date: '', max_score: 10 })
  const [editingCell, setEditingCell] = useState(null)
  const editRef = useRef(null)

  const isIB = profile?.edition === 'ib'

  useEffect(() => {
    if (!profile) return
    loadTeacherClasses()
  }, [profile])

  useEffect(() => {
    if (selectedClass && selectedSubject) loadGradebook()
  }, [selectedClass, selectedSubject])

  async function loadTeacherClasses() {
    const { data } = await supabase
      .from('teacher_classes')
      .select('*, class:classes(id, name), subject:subjects(id, name)')
      .eq('teacher_id', profile.id)

    setTeacherClasses(data || [])
    if (data?.length) {
      setSelectedClass(data[0].class_id)
      setSelectedSubject(data[0].subject_id)
    }
    setLoading(false)
  }

  async function loadGradebook() {
    const [studentsRes, gradesRes, assessmentsRes] = await Promise.all([
      supabase.from('class_members').select('*, student:profiles(id, full_name)').eq('class_id', selectedClass),
      supabase.from('grades').select('*').eq('class_id', selectedClass).eq('subject_id', selectedSubject),
      supabase.from('assessments').select('*').eq('class_id', selectedClass).eq('subject_id', selectedSubject).order('date', { ascending: false }),
    ])

    setStudents((studentsRes.data || []).map(m => m.student).filter(Boolean))

    const gradeMap = {}
    ;(gradesRes.data || []).forEach(g => {
      const key = `${g.student_id}_${g.assessment_id || g.criterion || 'score'}`
      gradeMap[key] = g
    })
    setGrades(gradeMap)
    setAssessments(assessmentsRes.data || [])
  }

  function getStudentAvg(studentId) {
    const studentGrades = Object.entries(grades)
      .filter(([k]) => k.startsWith(studentId + '_'))
      .map(([, g]) => g.max_score > 0 ? (g.score / g.max_score) * 10 : g.score)
    if (!studentGrades.length) return null
    return Math.round((studentGrades.reduce((a, b) => a + b, 0) / studentGrades.length) * 10) / 10
  }

  async function saveGrade(studentId, assessmentId, criterion, value) {
    const score = parseFloat(value)
    if (isNaN(score)) return

    const gradeData = {
      student_id: studentId,
      class_id: selectedClass,
      subject_id: selectedSubject,
      teacher_id: profile.id,
      school_id: profile.school_id,
      score,
      date: new Date().toISOString().split('T')[0],
    }

    if (assessmentId) {
      gradeData.assessment_id = assessmentId
      const assessment = assessments.find(a => a.id === assessmentId)
      if (assessment) gradeData.max_score = assessment.max_score
    }
    if (criterion) gradeData.criterion = criterion

    const key = `${studentId}_${assessmentId || criterion || 'score'}`
    const existing = grades[key]

    if (existing) {
      await supabase.from('grades').update({ score }).eq('id', existing.id)
    } else {
      const { data } = await supabase.from('grades').insert(gradeData).select().single()
      if (data) setGrades(prev => ({ ...prev, [key]: data }))
    }

    setGrades(prev => ({
      ...prev,
      [key]: { ...prev[key], ...gradeData, score },
    }))
    setEditingCell(null)
  }

  async function handleAddAssessment() {
    setSaving(true)
    const { data, error } = await supabase.from('assessments').insert({
      ...newAssessment,
      class_id: selectedClass,
      subject_id: selectedSubject,
      teacher_id: profile.id,
      max_score: Number(newAssessment.max_score),
    }).select().single()

    if (!error && data) {
      setAssessments(prev => [data, ...prev])
    }
    setShowModal(false)
    setNewAssessment({ title: '', type: 'test', date: '', max_score: 10 })
    setSaving(false)
  }

  function exportCSV() {
    const header = isIB
      ? ['Shagird', 'Kriteriya A', 'Kriteriya B', 'Kriteriya C', 'Kriteriya D', 'Orta']
      : ['Shagird', ...assessments.map(a => a.title), 'Orta']

    const rows = filteredStudents.map(s => {
      if (isIB) {
        const criteria = ['A', 'B', 'C', 'D'].map(c => {
          const g = grades[`${s.id}_${c}`]
          return g ? g.score : ''
        })
        const avg = getStudentAvg(s.id)
        return [s.full_name, ...criteria, avg != null ? String(avg).replace('.', ',') : '']
      } else {
        const scores = assessments.map(a => {
          const g = grades[`${s.id}_${a.id}`]
          return g ? g.score : ''
        })
        const avg = getStudentAvg(s.id)
        return [s.full_name, ...scores, avg != null ? String(avg).replace('.', ',') : '']
      }
    })

    const csv = [header, ...rows].map(r => r.join(';')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `qiymetler_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return <PageSpinner />

  if (!teacherClasses.length) {
    return <EmptyState icon={BookOpen} title={t('no_data')} description={t('no_data')} />
  }

  const uniqueClasses = [...new Map(teacherClasses.map(tc => [tc.class_id, tc.class])).values()]
  const subjectsForClass = teacherClasses.filter(tc => tc.class_id === selectedClass).map(tc => tc.subject)

  const filteredStudents = students.filter(s =>
    s.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const ibCriteria = ['A', 'B', 'C', 'D']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-4xl text-gray-900 tracking-tight">{t('gradebook')}</h1>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={exportCSV}>
            <Download className="w-4 h-4 mr-2" />
            {t('export_csv')}
          </Button>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t('new_assignment')}
          </Button>
        </div>
      </div>

      <div className="flex gap-4 items-end">
        <Select label={t('class_name')} value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
          {uniqueClasses.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>
        <Select label={t('subject')} value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
          {subjectsForClass.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </Select>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            placeholder={t('search')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full border border-border-soft rounded-md pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple focus:border-transparent"
          />
        </div>
      </div>

      <Card hover={false} className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-surface">
              <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-left">{t('full_name')}</th>
              {isIB ? (
                ibCriteria.map(c => (
                  <th key={c} className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-center">Kriteriya {c}</th>
                ))
              ) : (
                assessments.map(a => (
                  <th key={a.id} className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-center">
                    <div>{a.title}</div>
                    <div className="text-[10px] text-gray-400 font-normal normal-case">maks: {a.max_score}</div>
                  </th>
                ))
              )}
              <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 text-center">{t('avg_grade')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map(s => {
              const avg = getStudentAvg(s.id)
              const isLow = avg != null && avg < 5
              return (
                <tr key={s.id} className={`border-b border-border-soft transition-colors ${isLow ? 'bg-red-50' : 'hover:bg-surface'}`}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{s.full_name}</td>
                  {isIB ? (
                    ibCriteria.map(c => {
                      const key = `${s.id}_${c}`
                      const g = grades[key]
                      const cellId = `${s.id}_crit_${c}`
                      return (
                        <td key={c} className="px-6 py-4 text-center">
                          {editingCell === cellId ? (
                            <input
                              ref={editRef}
                              type="number"
                              min={0}
                              max={8}
                              defaultValue={g?.score || ''}
                              className="w-16 border border-purple rounded px-2 py-1 text-sm text-center focus:outline-none"
                              autoFocus
                              onBlur={e => saveGrade(s.id, null, c, e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && e.target.blur()}
                            />
                          ) : (
                            <button
                              onClick={() => setEditingCell(cellId)}
                              className="w-16 py-1 text-sm text-gray-700 hover:bg-purple-light rounded transition-colors"
                            >
                              {g ? g.score : '\u2014'}
                            </button>
                          )}
                        </td>
                      )
                    })
                  ) : (
                    assessments.map(a => {
                      const key = `${s.id}_${a.id}`
                      const g = grades[key]
                      const cellId = `${s.id}_${a.id}`
                      return (
                        <td key={a.id} className="px-6 py-4 text-center">
                          {editingCell === cellId ? (
                            <input
                              ref={editRef}
                              type="number"
                              min={0}
                              max={a.max_score}
                              defaultValue={g?.score || ''}
                              className="w-16 border border-purple rounded px-2 py-1 text-sm text-center focus:outline-none"
                              autoFocus
                              onBlur={e => saveGrade(s.id, a.id, null, e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && e.target.blur()}
                            />
                          ) : (
                            <button
                              onClick={() => setEditingCell(cellId)}
                              className="w-16 py-1 text-sm text-gray-700 hover:bg-purple-light rounded transition-colors"
                            >
                              {g ? g.score : '\u2014'}
                            </button>
                          )}
                        </td>
                      )
                    })
                  )}
                  <td className="px-6 py-4 text-center">
                    {avg != null ? <GradeBadge score={avg} /> : <span className="text-gray-400">\u2014</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filteredStudents.length === 0 && (
          <p className="text-center py-8 text-sm text-gray-400">{t('no_data')}</p>
        )}
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={t('new_assignment')}>
        <div className="space-y-4">
          <Input
            label="Başlıq"
            value={newAssessment.title}
            onChange={e => setNewAssessment(p => ({ ...p, title: e.target.value }))}
            placeholder="Məs: Yarımillik test"
          />
          <Select
            label="Növ"
            value={newAssessment.type}
            onChange={e => setNewAssessment(p => ({ ...p, type: e.target.value }))}
          >
            {assessmentTypes.map(at => (
              <option key={at.value} value={at.value}>{at.label}</option>
            ))}
          </Select>
          <Input
            label={t('date')}
            type="date"
            value={newAssessment.date}
            onChange={e => setNewAssessment(p => ({ ...p, date: e.target.value }))}
          />
          <Input
            label="Maksimum bal"
            type="number"
            value={newAssessment.max_score}
            onChange={e => setNewAssessment(p => ({ ...p, max_score: e.target.value }))}
          />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowModal(false)}>{t('cancel')}</Button>
            <Button onClick={handleAddAssessment} loading={saving} disabled={!newAssessment.title}>{t('save')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
