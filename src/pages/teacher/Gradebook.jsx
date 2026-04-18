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
import { BookOpen, Plus, Download, Search, ChevronDown, TrendingUp, Award, BarChart3 } from 'lucide-react'
import { fmtDate } from '../../lib/dateUtils'
import { notifyUsers } from '../../lib/notify'

const assessmentTypes = [
  { value: 'test',      label: 'Test' },
  { value: 'homework',  label: 'Ev tapşırığı' },
  { value: 'project',   label: 'Layihə' },
  { value: 'exam',      label: 'İmtahan' },
  { value: 'classwork', label: 'Sinif işi' },
]

const typeColors = {
  test:      'bg-purple-light text-purple border-purple',
  homework:  'bg-teal-light text-teal border-teal',
  project:   'bg-amber-50 text-amber-700 border-amber-400',
  exam:      'bg-red-50 text-red-600 border-red-400',
  classwork: 'bg-blue-50 text-blue-600 border-blue-400',
}

const typeHeaderBorder = {
  test:      'border-purple',
  homework:  'border-teal',
  project:   'border-amber-400',
  exam:      'border-red-400',
  classwork: 'border-blue-400',
}

const typeLabelMap = {
  test:      'Test',
  homework:  'Ev tapşırığı',
  project:   'Layihə',
  exam:      'İmtahan',
  classwork: 'Sinif işi',
}

function getCellStyle(score, maxScore) {
  if (score == null || score === '') return null
  const pct = maxScore > 0 ? (score / maxScore) * 100 : score * 10
  if (pct >= 85) return 'bg-teal-light text-teal font-semibold'
  if (pct >= 60) return 'bg-blue-50 text-blue-700 font-medium'
  if (pct >= 40) return 'bg-amber-50 text-amber-700 font-medium'
  return 'bg-red-50 text-red-600 font-medium'
}

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

    let savedGradeId = existing?.id || null

    if (existing) {
      await supabase.from('grades').update({ score }).eq('id', existing.id)
    } else {
      const { data } = await supabase.from('grades').insert(gradeData).select().single()
      if (data) {
        savedGradeId = data.id
        setGrades(prev => ({ ...prev, [key]: data }))
      }
    }

    setGrades(prev => ({
      ...prev,
      [key]: { ...prev[key], ...gradeData, score },
    }))
    setEditingCell(null)

    // Fire-and-forget notifications — notify student (and parent if linked)
    ;(async () => {
      try {
        const assessment = assessmentId ? assessments.find(a => a.id === assessmentId) : null
        const subjectName = assessment?.title
          ?? (criterion ? `Kriteriya ${criterion}` : 'Qiymət')
        const maxScore = assessment?.max_score ?? (criterion ? 8 : null)
        const bodyText = maxScore != null
          ? `${subjectName}: ${score}/${maxScore}`
          : `${subjectName}: ${score}`

        const toNotify = [
          {
            profile_id: studentId,
            school_id: profile.school_id,
            title: 'Yeni qiymət',
            body: bodyText,
            type: 'grade',
            reference_id: savedGradeId,
          },
        ]

        // Look up parent(s) via parent_children and notify them too
        const { data: parentLinks } = await supabase
          .from('parent_children')
          .select('parent_id')
          .eq('student_id', studentId)

        ;(parentLinks || []).forEach(link => {
          toNotify.push({
            profile_id: link.parent_id,
            school_id: profile.school_id,
            title: 'Yeni qiymət',
            body: bodyText,
            type: 'grade',
            reference_id: savedGradeId,
          })
        })

        await notifyUsers(toNotify)
      } catch (err) {
        console.error('Grade notification error:', err)
      }
    })()
  }

  async function handleAddAssessment() {
    const maxScoreNum = Number(newAssessment.max_score)
    if (!newAssessment.title.trim()) { setSaving(false); return }
    if (isNaN(maxScoreNum) || maxScoreNum <= 0) { setSaving(false); return }
    setSaving(true)
    const { data, error } = await supabase.from('assessments').insert({
      title:      newAssessment.title.trim(),
      type:       newAssessment.type,
      date:       newAssessment.date || null,   // empty string → null so Postgres uses DEFAULT CURRENT_DATE
      class_id:   selectedClass,
      subject_id: selectedSubject,
      teacher_id: profile.id,
      max_score:  Number(newAssessment.max_score),
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

  // --- Summary stats ---
  const allAvgs = filteredStudents.map(s => getStudentAvg(s.id)).filter(v => v != null)
  const classAvg = allAvgs.length
    ? Math.round((allAvgs.reduce((a, b) => a + b, 0) / allAvgs.length) * 10) / 10
    : null
  const highestScore = allAvgs.length ? Math.max(...allAvgs) : null
  const lowestScore  = allAvgs.length ? Math.min(...allAvgs) : null

  // Count total grade submissions
  const submissionCount = Object.keys(grades).filter(k =>
    filteredStudents.some(s => k.startsWith(s.id + '_'))
  ).length

  // --- Grade distribution (out of 10) ---
  const distA = allAvgs.filter(v => v >= 9).length
  const distB = allAvgs.filter(v => v >= 7 && v < 9).length
  const distC = allAvgs.filter(v => v >= 5 && v < 7).length
  const distD = allAvgs.filter(v => v < 5).length

  return (
    <div className="space-y-6">
      {/* Page header */}
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

      {/* Class / subject / search selectors */}
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

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Class Average */}
        <div className="bg-white border border-border-soft rounded-xl px-5 py-4 flex items-start gap-3 shadow-sm">
          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-purple-light flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-purple" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-0.5">Sinif orta</p>
            <p className="text-2xl font-bold text-gray-900 leading-none">
              {classAvg != null ? classAvg : '—'}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">/ 10</p>
          </div>
        </div>

        {/* Highest Score */}
        <div className="bg-white border border-border-soft rounded-xl px-5 py-4 flex items-start gap-3 shadow-sm">
          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-teal-light flex items-center justify-center">
            <Award className="w-4 h-4 text-teal" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-0.5">Ən yüksək</p>
            <p className="text-2xl font-bold text-gray-900 leading-none">
              {highestScore != null ? highestScore : '—'}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">/ 10</p>
          </div>
        </div>

        {/* Lowest Score */}
        <div className="bg-white border border-border-soft rounded-xl px-5 py-4 flex items-start gap-3 shadow-sm">
          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
            <ChevronDown className="w-4 h-4 text-red-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-0.5">Ən aşağı</p>
            <p className="text-2xl font-bold text-gray-900 leading-none">
              {lowestScore != null ? lowestScore : '—'}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">/ 10</p>
          </div>
        </div>

        {/* Submissions */}
        <div className="bg-white border border-border-soft rounded-xl px-5 py-4 flex items-start gap-3 shadow-sm">
          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-0.5">Qiymətlər</p>
            <p className="text-2xl font-bold text-gray-900 leading-none">{submissionCount}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">ümumi qeyd</p>
          </div>
        </div>
      </div>

      {/* Gradebook table */}
      <Card hover={false} className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-surface border-b border-border-soft">
                {/* Student name header — sticky */}
                <th className="sticky left-0 z-20 bg-surface text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 text-left whitespace-nowrap min-w-[180px]">
                  {t('full_name')}
                </th>

                {isIB ? (
                  ibCriteria.map(c => (
                    <th
                      key={c}
                      className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 text-center border-t-4 border-purple min-w-[90px]"
                    >
                      <div className="text-gray-700 font-semibold">Kriteriya {c}</div>
                      <div className="text-[10px] text-gray-400 font-normal normal-case mt-0.5">maks: 8</div>
                    </th>
                  ))
                ) : (
                  assessments.map(a => {
                    const borderClass = typeHeaderBorder[a.type] || 'border-gray-300'
                    const badgeClass  = typeColors[a.type]      || 'bg-gray-100 text-gray-600 border-gray-300'
                    const label       = typeLabelMap[a.type]    || a.type
                    const dateStr     = a.date ? fmtDate(new Date(a.date), { day: '2-digit', month: 'short' }) : ''
                    return (
                      <th
                        key={a.id}
                        className={`text-xs font-semibold text-gray-600 px-4 py-3 text-center border-t-4 ${borderClass} min-w-[110px]`}
                      >
                        <div className="font-semibold text-gray-800 truncate max-w-[120px] mx-auto" title={a.title}>
                          {a.title}
                        </div>
                        <div className="mt-1 flex flex-col items-center gap-1">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold border ${badgeClass}`}>
                            {label}
                          </span>
                          {dateStr && (
                            <span className="text-[10px] text-gray-400 font-normal normal-case">{dateStr}</span>
                          )}
                          <span className="text-[10px] text-gray-400 font-normal normal-case">maks: {a.max_score}</span>
                        </div>
                      </th>
                    )
                  })
                )}

                <th className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 text-center min-w-[110px] border-t-4 border-gray-200">
                  {t('avg_grade')}
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.map((s, idx) => {
                const avg   = getStudentAvg(s.id)
                const isLow = avg != null && avg < 5
                const rowBg = isLow ? 'bg-red-50/30' : idx % 2 === 0 ? 'bg-white' : 'bg-surface/50'

                return (
                  <tr
                    key={s.id}
                    className={`border-b border-border-soft transition-colors hover:bg-purple-light/20 ${rowBg}`}
                  >
                    {/* Sticky student name */}
                    <td className={`sticky left-0 z-10 px-6 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap ${rowBg}`}>
                      {s.full_name}
                    </td>

                    {isIB ? (
                      ibCriteria.map(c => {
                        const key    = `${s.id}_${c}`
                        const g      = grades[key]
                        const cellId = `${s.id}_crit_${c}`
                        const cellStyle = g ? getCellStyle(g.score, 8) : null

                        return (
                          <td key={c} className="px-3 py-2 text-center">
                            {editingCell === cellId ? (
                              <input
                                ref={editRef}
                                type="number"
                                min={0}
                                max={8}
                                defaultValue={g?.score ?? ''}
                                className="w-16 border border-purple rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-purple/50"
                                autoFocus
                                onBlur={e => saveGrade(s.id, null, c, e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && e.target.blur()}
                              />
                            ) : (
                              <button
                                onClick={() => setEditingCell(cellId)}
                                className={`w-16 py-1 rounded text-sm transition-colors ${
                                  cellStyle
                                    ? `${cellStyle} hover:opacity-80`
                                    : 'text-gray-400 hover:bg-purple-light hover:text-purple'
                                }`}
                              >
                                {g ? g.score : '—'}
                              </button>
                            )}
                          </td>
                        )
                      })
                    ) : (
                      assessments.map(a => {
                        const key      = `${s.id}_${a.id}`
                        const g        = grades[key]
                        const cellId   = `${s.id}_${a.id}`
                        const cellStyle = g ? getCellStyle(g.score, a.max_score) : null

                        return (
                          <td key={a.id} className="px-3 py-2 text-center">
                            {editingCell === cellId ? (
                              <input
                                ref={editRef}
                                type="number"
                                min={0}
                                max={a.max_score}
                                defaultValue={g?.score ?? ''}
                                className="w-16 border border-purple rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-purple/50"
                                autoFocus
                                onBlur={e => saveGrade(s.id, a.id, null, e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && e.target.blur()}
                              />
                            ) : (
                              <button
                                onClick={() => setEditingCell(cellId)}
                                className={`w-16 py-1 rounded text-sm transition-colors ${
                                  cellStyle
                                    ? `${cellStyle} hover:opacity-80`
                                    : 'text-gray-400 hover:bg-purple-light hover:text-purple'
                                }`}
                              >
                                {g ? g.score : '—'}
                              </button>
                            )}
                          </td>
                        )
                      })
                    )}

                    {/* Average column */}
                    <td className="px-4 py-2 text-center">
                      {avg != null ? (
                        <div className="flex flex-col items-center gap-1">
                          <GradeBadge score={avg} />
                          {/* Narrow progress bar showing score out of 10 */}
                          <div className="w-14 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                avg >= 9 ? 'bg-teal' :
                                avg >= 7 ? 'bg-blue-500' :
                                avg >= 5 ? 'bg-amber-400' :
                                'bg-red-400'
                              }`}
                              style={{ width: `${Math.min((avg / 10) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={isIB ? 6 : assessments.length + 2} className="text-center py-10 text-sm text-gray-400">
                    {t('no_data')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Grade distribution bar */}
        {filteredStudents.length > 0 && allAvgs.length > 0 && (
          <div className="border-t border-border-soft px-6 py-4 bg-surface/50">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" />
              Qiymət paylanması
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-light text-teal text-xs font-semibold border border-teal/20">
                <span className="w-2 h-2 rounded-full bg-teal inline-block" />
                A (≥9) — {distA} şagird
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                B (7–8.9) — {distB} şagird
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                C (5–6.9) — {distC} şagird
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-red-600 text-xs font-semibold border border-red-200">
                <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                D (&lt;5) — {distD} şagird
              </span>
            </div>
          </div>
        )}
      </Card>

      {/* Add assessment modal */}
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
