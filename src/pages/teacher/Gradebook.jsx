import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { GradeBadge } from '../../components/ui/Badge'
import { BookOpen, Plus, Download, Search, ChevronDown, TrendingUp, Award, BarChart3, X } from 'lucide-react'
import { fmtDate } from '../../lib/dateUtils'
import { notifyUsers } from '../../lib/notify'

const assessmentTypes = [
  { value: 'test',      label: 'Test' },
  { value: 'homework',  label: 'Ev tapşırığı' },
  { value: 'project',   label: 'Layihə' },
  { value: 'exam',      label: 'İmtahan' },
  { value: 'classwork', label: 'Sinif işi' },
]

const TYPE_HUE = {
  test:      { bg: 'rgba(124,110,224,0.14)', text: '#5b4fb8', accent: '#7c6ee0' },
  homework:  { bg: 'rgba(93,184,163,0.14)',  text: '#3d8a73', accent: '#5db8a3' },
  project:   { bg: 'rgba(232,168,124,0.18)', text: '#b46a3e', accent: '#e8a87c' },
  exam:      { bg: 'rgba(229,107,127,0.14)', text: '#b83b54', accent: '#e56b7f' },
  classwork: { bg: 'rgba(107,157,222,0.14)', text: '#4a7cb5', accent: '#6b9dde' },
}

const typeLabelMap = {
  test:      'Test',
  homework:  'Ev tapşırığı',
  project:   'Layihə',
  exam:      'İmtahan',
  classwork: 'Sinif işi',
}

// Pastel color-coded cell colors based on score / max
function cellPastelStyle(score, maxScore) {
  if (score == null || score === '') return null
  const normalized = maxScore > 0 ? (score / maxScore) * 10 : Number(score)
  if (normalized >= 8)  return { bg: 'rgba(93,184,163,0.18)',  color: '#3d8a73' }   // mint — high
  if (normalized >= 6)  return { bg: 'rgba(124,110,224,0.16)', color: '#5b4fb8' }   // periwinkle — good
  if (normalized >= 4)  return { bg: 'rgba(232,168,124,0.20)', color: '#b46a3e' }   // peach — mid
  return                       { bg: 'rgba(229,107,127,0.16)', color: '#b83b54' }   // rose — low
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

    ;(async () => {
      try {
        const assessment = assessmentId ? assessments.find(a => a.id === assessmentId) : null
        const subjectName = assessment?.title ?? (criterion ? `Kriteriya ${criterion}` : 'Qiymət')
        const maxScore = assessment?.max_score ?? (criterion ? 8 : null)
        const bodyText = maxScore != null ? `${subjectName}: ${score}/${maxScore}` : `${subjectName}: ${score}`

        const toNotify = [
          { profile_id: studentId, school_id: profile.school_id, title: 'Yeni qiymət', body: bodyText, type: 'grade', reference_id: savedGradeId },
        ]

        const { data: parentLinks } = await supabase
          .from('parent_children')
          .select('parent_id')
          .eq('student_id', studentId)

        ;(parentLinks || []).forEach(link => {
          toNotify.push({ profile_id: link.parent_id, school_id: profile.school_id, title: 'Yeni qiymət', body: bodyText, type: 'grade', reference_id: savedGradeId })
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
      date:       newAssessment.date || null,
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
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `qiymetler_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="pastel-skeleton h-12 w-72" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[0,1,2,3].map(i => <div key={i} className="pastel-skeleton h-24" />)}
        </div>
        <div className="pastel-skeleton h-96" />
      </div>
    )
  }

  if (!teacherClasses.length) {
    return (
      <div className="liquid-card p-12 text-center">
        <div className="icon-chip icon-chip-periwinkle mx-auto mb-3" style={{ width: 64, height: 64 }}>
          <BookOpen className="w-8 h-8" />
        </div>
        <p className="text-base font-semibold" style={{ color: '#1a1a2e' }}>{t('no_data')}</p>
      </div>
    )
  }

  const uniqueClasses = [...new Map(teacherClasses.map(tc => [tc.class_id, tc.class])).values()]
  const subjectsForClass = teacherClasses.filter(tc => tc.class_id === selectedClass).map(tc => tc.subject)

  const filteredStudents = students.filter(s =>
    s.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const ibCriteria = ['A', 'B', 'C', 'D']

  const allAvgs = filteredStudents.map(s => getStudentAvg(s.id)).filter(v => v != null)
  const classAvg = allAvgs.length ? Math.round((allAvgs.reduce((a, b) => a + b, 0) / allAvgs.length) * 10) / 10 : null
  const highestScore = allAvgs.length ? Math.max(...allAvgs) : null
  const lowestScore  = allAvgs.length ? Math.min(...allAvgs) : null
  const submissionCount = Object.keys(grades).filter(k =>
    filteredStudents.some(s => k.startsWith(s.id + '_'))
  ).length
  const distA = allAvgs.filter(v => v >= 9).length
  const distB = allAvgs.filter(v => v >= 7 && v < 9).length
  const distC = allAvgs.filter(v => v >= 5 && v < 7).length
  const distD = allAvgs.filter(v => v < 5).length

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: '#1a1a2e' }}>
          <span className="pastel-text">{t('gradebook')}</span>
        </h1>
        <div className="flex gap-2 flex-wrap">
          <button onClick={exportCSV} className="btn-ghost-pastel" style={{ padding: '10px 18px', fontSize: 13 }}>
            <Download className="w-4 h-4" /> {t('export_csv')}
          </button>
          <button onClick={() => setShowModal(true)} className="btn-pastel" style={{ padding: '10px 22px', fontSize: 13 }}>
            <Plus className="w-4 h-4" /> {t('new_assignment')}
          </button>
        </div>
      </div>

      {/* Selectors */}
      <div className="liquid-card p-4">
        <div className="flex gap-3 items-end flex-wrap">
          <div className="min-w-[160px]">
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#64748b' }}>{t('class_name')}</label>
            <select className="pastel-input" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
              {uniqueClasses.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
          </div>
          <div className="min-w-[160px]">
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#64748b' }}>{t('subject')}</label>
            <select className="pastel-input" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
              {subjectsForClass.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}
            </select>
          </div>
          <div className="relative flex-1 min-w-[180px]">
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#64748b' }}>{t('search')}</label>
            <Search className="absolute left-3.5 bottom-3 w-4 h-4" style={{ color: '#94a3b8' }} />
            <input
              placeholder={t('search')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pastel-input"
              style={{ paddingLeft: 40 }}
            />
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Sinif orta', value: classAvg ?? '—', icon: TrendingUp, chip: 'icon-chip-periwinkle' },
          { label: 'Ən yüksək',   value: highestScore ?? '—', icon: Award, chip: 'icon-chip-mint' },
          { label: 'Ən aşağı',    value: lowestScore ?? '—', icon: ChevronDown, chip: 'icon-chip-peach' },
          { label: 'Qiymətlər',   value: submissionCount, icon: BarChart3, chip: 'icon-chip-blue' },
        ].map((s, i) => (
          <div key={i} className="liquid-card p-4 flex items-start gap-3">
            <span className={`icon-chip ${s.chip}`}>
              <s.icon className="w-5 h-5" />
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>{s.label}</p>
              <p className="text-2xl font-bold mt-0.5 leading-none" style={{ color: '#1a1a2e' }}>{s.value}</p>
              <p className="text-[10px] mt-0.5" style={{ color: '#94a3b8' }}>/ 10</p>
            </div>
          </div>
        ))}
      </div>

      {/* Gradebook table */}
      <div className="liquid-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[700px]">
            <thead>
              <tr style={{ background: 'rgba(248,247,251,0.8)', borderBottom: '1px solid rgba(124,110,224,0.12)' }}>
                <th className="sticky left-0 z-20 px-5 py-3 text-left whitespace-nowrap min-w-[180px]"
                  style={{ background: 'rgba(248,247,251,0.95)', color: '#64748b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}
                >
                  {t('full_name')}
                </th>

                {isIB ? (
                  ibCriteria.map(c => (
                    <th key={c} className="px-3 py-3 text-center min-w-[90px]"
                      style={{ borderTop: '3px solid #7c6ee0', color: '#475569' }}
                    >
                      <div className="font-bold text-sm" style={{ color: '#1a1a2e' }}>Kriteriya {c}</div>
                      <div className="text-[10px] mt-0.5" style={{ color: '#94a3b8' }}>maks: 8</div>
                    </th>
                  ))
                ) : (
                  assessments.map(a => {
                    const hue = TYPE_HUE[a.type] || TYPE_HUE.test
                    const label = typeLabelMap[a.type] || a.type
                    const dateStr = a.date ? fmtDate(new Date(a.date), { day: '2-digit', month: 'short' }) : ''
                    return (
                      <th key={a.id} className="px-3 py-3 text-center min-w-[110px]"
                        style={{ borderTop: `3px solid ${hue.accent}`, color: '#475569' }}
                      >
                        <div className="font-bold text-sm truncate max-w-[120px] mx-auto" title={a.title} style={{ color: '#1a1a2e' }}>
                          {a.title}
                        </div>
                        <div className="mt-1 flex flex-col items-center gap-1">
                          <span className="pastel-badge" style={{ background: hue.bg, color: hue.text, fontSize: 9 }}>{label}</span>
                          {dateStr && <span className="text-[10px]" style={{ color: '#94a3b8' }}>{dateStr}</span>}
                          <span className="text-[10px]" style={{ color: '#94a3b8' }}>maks: {a.max_score}</span>
                        </div>
                      </th>
                    )
                  })
                )}

                <th className="px-3 py-3 text-center min-w-[110px]"
                  style={{ borderTop: '3px solid #cbd5e1', color: '#64748b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}
                >
                  {t('avg_grade')}
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.map((s, idx) => {
                const avg = getStudentAvg(s.id)
                const isLow = avg != null && avg < 5
                const rowBg = isLow ? 'rgba(229,107,127,0.05)' : (idx % 2 === 0 ? 'transparent' : 'rgba(124,110,224,0.02)')

                return (
                  <tr key={s.id} className="smooth-trans"
                    style={{ borderBottom: '1px solid rgba(124,110,224,0.06)' }}
                  >
                    <td className="sticky left-0 z-10 px-5 py-3 text-sm font-semibold whitespace-nowrap"
                      style={{ background: rowBg, color: '#1a1a2e' }}
                    >
                      {s.full_name}
                    </td>

                    {isIB ? (
                      ibCriteria.map(c => {
                        const key = `${s.id}_${c}`
                        const g = grades[key]
                        const cellId = `${s.id}_crit_${c}`
                        const cellStyle = g ? cellPastelStyle(g.score, 8) : null
                        return (
                          <td key={c} className="px-3 py-2 text-center" style={{ background: rowBg }}>
                            {editingCell === cellId ? (
                              <input
                                ref={editRef}
                                type="number"
                                min={0}
                                max={8}
                                defaultValue={g?.score ?? ''}
                                className="pastel-input"
                                style={{ width: 64, padding: '4px 6px', fontSize: 13, textAlign: 'center', fontWeight: 600 }}
                                autoFocus
                                onBlur={e => saveGrade(s.id, null, c, e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && e.target.blur()}
                              />
                            ) : (
                              <button
                                onClick={() => setEditingCell(cellId)}
                                className="rounded-lg smooth-trans"
                                style={{
                                  width: 60,
                                  padding: '6px 0',
                                  fontSize: 13,
                                  fontWeight: 700,
                                  background: cellStyle?.bg || 'transparent',
                                  color: cellStyle?.color || '#cbd5e1',
                                  border: cellStyle ? 'none' : '1px dashed rgba(124,110,224,0.2)',
                                }}
                              >
                                {g ? g.score : '+'}
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
                        const cellStyle = g ? cellPastelStyle(g.score, a.max_score) : null
                        return (
                          <td key={a.id} className="px-3 py-2 text-center" style={{ background: rowBg }}>
                            {editingCell === cellId ? (
                              <input
                                ref={editRef}
                                type="number"
                                min={0}
                                max={a.max_score}
                                defaultValue={g?.score ?? ''}
                                className="pastel-input"
                                style={{ width: 64, padding: '4px 6px', fontSize: 13, textAlign: 'center', fontWeight: 600 }}
                                autoFocus
                                onBlur={e => saveGrade(s.id, a.id, null, e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && e.target.blur()}
                              />
                            ) : (
                              <button
                                onClick={() => setEditingCell(cellId)}
                                className="rounded-lg smooth-trans"
                                style={{
                                  width: 60,
                                  padding: '6px 0',
                                  fontSize: 13,
                                  fontWeight: 700,
                                  background: cellStyle?.bg || 'transparent',
                                  color: cellStyle?.color || '#cbd5e1',
                                  border: cellStyle ? 'none' : '1px dashed rgba(124,110,224,0.2)',
                                }}
                              >
                                {g ? g.score : '+'}
                              </button>
                            )}
                          </td>
                        )
                      })
                    )}

                    <td className="px-3 py-2 text-center" style={{ background: rowBg }}>
                      {avg != null ? (
                        <div className="flex flex-col items-center gap-1">
                          <GradeBadge score={avg} />
                          <div className="w-14 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(124,110,224,0.10)' }}>
                            <div
                              className="h-full rounded-full smooth-trans"
                              style={{
                                width: `${Math.min((avg / 10) * 100, 100)}%`,
                                background: avg >= 8 ? '#5db8a3' : avg >= 6 ? '#7c6ee0' : avg >= 4 ? '#e8a87c' : '#e56b7f',
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: '#cbd5e1' }} className="text-sm">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={isIB ? 6 : assessments.length + 2} className="text-center py-10 text-sm" style={{ color: '#94a3b8' }}>
                    {t('no_data')}
                  </td>
                </tr>
              )}

              {filteredStudents.length > 0 && classAvg != null && (
                <tr style={{ borderTop: '2px solid rgba(124,110,224,0.20)', background: 'linear-gradient(90deg, rgba(124,110,224,0.10), rgba(93,184,163,0.06))' }}>
                  <td className="sticky left-0 z-10 px-5 py-3" style={{ background: 'rgba(245,243,255,0.85)' }}>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c6ee0, #5db8a3)' }}>
                        <TrendingUp className="w-3 h-3" style={{ color: '#fff' }} />
                      </span>
                      <span className="text-sm font-bold" style={{ color: '#5b4fb8' }}>Sinif ortası</span>
                    </div>
                  </td>
                  {isIB ? (
                    ibCriteria.map(c => {
                      const grds = filteredStudents.map(s => grades[`${s.id}_${c}`]).filter(Boolean).map(g => g.score)
                      const avg = grds.length ? Math.round((grds.reduce((a, b) => a + b, 0) / grds.length) * 10) / 10 : null
                      return (
                        <td key={c} className="px-3 py-3 text-center">
                          {avg != null ? (
                            <span className="inline-flex items-center justify-center w-14 py-1.5 rounded-lg text-sm font-bold text-white"
                              style={{ background: 'linear-gradient(135deg, #7c6ee0, #5db8a3)' }}>{avg}</span>
                          ) : <span style={{ color: '#cbd5e1' }} className="text-sm">—</span>}
                        </td>
                      )
                    })
                  ) : (
                    assessments.map(a => {
                      const grds = filteredStudents.map(s => grades[`${s.id}_${a.id}`]).filter(Boolean).map(g => g.score)
                      const avg = grds.length ? Math.round((grds.reduce((x, y) => x + y, 0) / grds.length) * 10) / 10 : null
                      return (
                        <td key={a.id} className="px-3 py-3 text-center">
                          {avg != null ? (
                            <span className="inline-flex items-center justify-center w-14 py-1.5 rounded-lg text-sm font-bold text-white"
                              style={{ background: 'linear-gradient(135deg, #7c6ee0, #5db8a3)' }}>{avg}</span>
                          ) : <span style={{ color: '#cbd5e1' }} className="text-sm">—</span>}
                        </td>
                      )
                    })
                  )}
                  <td className="px-3 py-3 text-center">
                    <span className="inline-flex items-center justify-center w-14 py-1.5 rounded-lg text-sm font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, #7c6ee0, #5db8a3)', boxShadow: '0 4px 12px rgba(124,110,224,0.25)' }}>
                      {classAvg}
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Distribution */}
        {filteredStudents.length > 0 && allAvgs.length > 0 && (
          <div className="px-6 py-4" style={{ borderTop: '1px solid rgba(124,110,224,0.10)', background: 'rgba(248,247,251,0.5)' }}>
            <p className="text-xs font-semibold mb-3 flex items-center gap-1.5 uppercase tracking-wider" style={{ color: '#64748b' }}>
              <BarChart3 className="w-3.5 h-3.5" /> Qiymət paylanması
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="pastel-badge pastel-badge-mint" style={{ padding: '6px 12px' }}>A (≥9) — {distA} şagird</span>
              <span className="pastel-badge pastel-badge-blue" style={{ padding: '6px 12px' }}>B (7–8.9) — {distB} şagird</span>
              <span className="pastel-badge pastel-badge-peach" style={{ padding: '6px 12px' }}>C (5–6.9) — {distC} şagird</span>
              <span className="pastel-badge pastel-badge-rose" style={{ padding: '6px 12px' }}>D (&lt;5) — {distD} şagird</span>
            </div>
          </div>
        )}
      </div>

      {/* Add assessment modal */}
      {showModal && (
        <div className="liquid-backdrop" onClick={() => setShowModal(false)}>
          <div className="liquid-card p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: '#1a1a2e' }}>{t('new_assignment')}</h3>
              <button onClick={() => setShowModal(false)} className="smooth-trans hover:opacity-70" style={{ color: '#64748b' }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#64748b' }}>Başlıq</label>
                <input className="pastel-input" value={newAssessment.title} onChange={e => setNewAssessment(p => ({ ...p, title: e.target.value }))} placeholder="Məs: Yarımillik test" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#64748b' }}>Növ</label>
                <select className="pastel-input" value={newAssessment.type} onChange={e => setNewAssessment(p => ({ ...p, type: e.target.value }))}>
                  {assessmentTypes.map(at => <option key={at.value} value={at.value}>{at.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#64748b' }}>{t('date')}</label>
                <input type="date" className="pastel-input" value={newAssessment.date} onChange={e => setNewAssessment(p => ({ ...p, date: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#64748b' }}>Maksimum bal</label>
                <input type="number" className="pastel-input" value={newAssessment.max_score} onChange={e => setNewAssessment(p => ({ ...p, max_score: e.target.value }))} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowModal(false)} className="btn-ghost-pastel" style={{ padding: '10px 20px', fontSize: 13 }}>{t('cancel')}</button>
                <button onClick={handleAddAssessment} disabled={saving || !newAssessment.title} className="btn-pastel" style={{ padding: '10px 22px', fontSize: 13, opacity: (saving || !newAssessment.title) ? 0.5 : 1 }}>
                  {saving ? '...' : t('save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
