import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { GradeBadge } from '../../components/ui/Badge'
import { BookOpen, Plus, Download, Search, ChevronDown, TrendingUp, Award, BarChart3, X } from 'lucide-react'
import { fmtDate } from '../../lib/dateUtils'
import { notifyUsers } from '../../lib/notify'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import StatCard from '../../components/ui/StatCard'
import Modal from '../../components/ui/Modal'

const assessmentTypes = [
  { value: 'test',      label: 'Test' },
  { value: 'homework',  label: 'Ev tapşırığı' },
  { value: 'project',   label: 'Layihə' },
  { value: 'exam',      label: 'İmtahan' },
  { value: 'classwork', label: 'Sinif işi' },
]

// V3 color restraint: assessment-type is categorical, not status — render all
// type tags in a single neutral-grey chip. Color is reserved for grade status only.
const TYPE_CHIP = { bg: 'var(--surface-2)', text: 'var(--ink-600)' }

const typeLabelMap = {
  test:      'Test',
  homework:  'Ev tapşırığı',
  project:   'Layihə',
  exam:      'İmtahan',
  classwork: 'Sinif işi',
}

// Grade cells stay calm: a filled cell is plain ink on the row, no per-band
// background fill. Only a failing grade (meaning-bearing) earns a status tint.
function cellStatusStyle(score, maxScore) {
  if (score == null || score === '') return null
  const normalized = maxScore > 0 ? (score / maxScore) * 10 : Number(score)
  if (normalized < 4) return { color: '#B91C1C', fontWeight: 700 }
  return { color: 'var(--ink-900)', fontWeight: 600 }
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
        <div className="pastel-skeleton h-10 w-64 rounded-tile" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[0,1,2,3].map(i => <div key={i} className="pastel-skeleton h-24 rounded-card" />)}
        </div>
        <div className="pastel-skeleton h-96 rounded-tile" />
      </div>
    )
  }

  if (!teacherClasses.length) {
    return (
      <EmptyState
        tier={1}
        icon={BookOpen}
        title={t('no_data')}
        description="Sizə hələ sinif təyin edilməyib."
      />
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
      {/* ── Page header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-ink-900 tracking-tight leading-tight">
            {t('gradebook')}
          </h1>
          <p className="text-sm mt-1 text-ink-400">
            Qiymət cədvəlini idarə edin və statistikanı izləyin
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" size="sm" onClick={exportCSV}>
            <Download className="w-4 h-4" /> {t('export_csv')}
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4" /> {t('new_assignment')}
          </Button>
        </div>
      </div>

      {/* ── Selectors ── */}
      <div className="liquid-card p-4">
        <div className="flex gap-3 items-end flex-wrap">
          <div className="min-w-[160px]">
            <label className="block text-[13px] font-semibold mb-1.5 text-ink-400 uppercase tracking-[0.04em]">
              {t('class_name')}
            </label>
            <select className="pastel-input" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
              {uniqueClasses.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
          </div>
          <div className="min-w-[160px]">
            <label className="block text-[13px] font-semibold mb-1.5 text-ink-400 uppercase tracking-[0.04em]">
              {t('subject')}
            </label>
            <select className="pastel-input" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
              {subjectsForClass.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}
            </select>
          </div>
          <div className="relative flex-1 min-w-[180px]">
            <label className="block text-[13px] font-semibold mb-1.5 text-ink-400 uppercase tracking-[0.04em]">
              {t('search')}
            </label>
            <Search className="absolute left-3.5 bottom-3 w-4 h-4 text-ink-400 pointer-events-none" />
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

      {/* ── KPI strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Sinif orta"    value={classAvg ?? '—'}     icon={TrendingUp}  tone="periwinkle" />
        <StatCard label="Ən yüksək"     value={highestScore ?? '—'} icon={Award}        tone="periwinkle" />
        <StatCard label="Ən aşağı"      value={lowestScore ?? '—'}  icon={ChevronDown}  tone="periwinkle" />
        <StatCard label={t('grades') || 'Qiymətlər'} value={submissionCount} icon={BarChart3} tone="periwinkle" />
      </div>

      {/* ── Gradebook table ── */}
      <div className="bg-surface rounded-tile border border-hairline overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[700px]">
            <thead>
              <tr
                className="border-b border-hairline-strong"
                style={{ background: 'var(--surface-2)' }}
              >
                {/* Sticky name column */}
                <th
                  className="sticky left-0 z-20 px-4 py-2.5 text-left whitespace-nowrap min-w-[180px]"
                  style={{
                    background: 'var(--surface-2)',
                    color: 'var(--ink-400)',
                    fontSize: 12,
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {t('full_name')}
                </th>

                {isIB ? (
                  ibCriteria.map(c => (
                    <th key={c} className="px-3 py-2.5 text-center min-w-[90px]">
                      <div className="text-[13px] font-semibold text-ink-700">Kriteriya {c}</div>
                      <div className="text-[11px] mt-0.5 text-ink-400 font-normal">maks: 8</div>
                    </th>
                  ))
                ) : (
                  assessments.map(a => {
                    const label = typeLabelMap[a.type] || a.type
                    const dateStr = a.date ? fmtDate(new Date(a.date), { day: '2-digit', month: 'short' }) : ''
                    return (
                      <th key={a.id} className="px-3 py-2.5 text-center min-w-[110px]">
                        <div
                          className="text-[13px] font-semibold truncate max-w-[120px] mx-auto text-ink-700"
                          title={a.title}
                        >
                          {a.title}
                        </div>
                        <div className="mt-1 flex flex-col items-center gap-0.5">
                          <span
                            className="rounded-chip px-1.5 py-px text-[11px] font-medium"
                            style={{ background: TYPE_CHIP.bg, color: TYPE_CHIP.text }}
                          >
                            {label}
                          </span>
                          {dateStr && <span className="text-[11px] text-ink-400 font-normal">{dateStr}</span>}
                          <span className="text-[11px] text-ink-400 font-normal">maks: {a.max_score}</span>
                        </div>
                      </th>
                    )
                  })
                )}

                {/* Average column header */}
                <th
                  className="px-3 py-2.5 text-center min-w-[110px]"
                  style={{
                    color: 'var(--ink-400)',
                    fontSize: 12,
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {t('avg_grade')}
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.map((s) => {
                const avg = getStudentAvg(s.id)

                return (
                  <tr
                    key={s.id}
                    className="smooth-trans hover:bg-[rgba(20,22,40,0.025)]"
                    style={{ borderBottom: '1px solid var(--hairline)' }}
                  >
                    {/* Sticky name */}
                    <td
                      className="sticky left-0 z-10 px-4 py-2.5 text-[13px] font-semibold whitespace-nowrap text-ink-900"
                      style={{ background: 'var(--surface)' }}
                    >
                      {s.full_name}
                    </td>

                    {isIB ? (
                      ibCriteria.map(c => {
                        const key = `${s.id}_${c}`
                        const g = grades[key]
                        const cellId = `${s.id}_crit_${c}`
                        const cellStyle = g ? cellStatusStyle(g.score, 8) : null
                        return (
                          <td key={c} className="px-3 py-1.5 text-center">
                            {editingCell === cellId ? (
                              <input
                                ref={editRef}
                                type="number"
                                min={0}
                                max={8}
                                defaultValue={g?.score ?? ''}
                                className="pastel-input tabular-nums"
                                style={{ width: 64, padding: '4px 6px', fontSize: 13, textAlign: 'center', fontWeight: 600 }}
                                autoFocus
                                onBlur={e => saveGrade(s.id, null, c, e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && e.target.blur()}
                              />
                            ) : (
                              <button
                                onClick={() => setEditingCell(cellId)}
                                className="rounded-ctl smooth-trans tabular-nums hover:bg-[rgba(20,22,40,0.04)]"
                                style={{
                                  width: 56,
                                  padding: '5px 0',
                                  fontSize: 13,
                                  fontWeight: cellStyle?.fontWeight || 600,
                                  color: cellStyle?.color || 'var(--ink-400)',
                                  border: g ? 'none' : '1px dashed var(--hairline-strong)',
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
                        const cellStyle = g ? cellStatusStyle(g.score, a.max_score) : null
                        return (
                          <td key={a.id} className="px-3 py-1.5 text-center">
                            {editingCell === cellId ? (
                              <input
                                ref={editRef}
                                type="number"
                                min={0}
                                max={a.max_score}
                                defaultValue={g?.score ?? ''}
                                className="pastel-input tabular-nums"
                                style={{ width: 64, padding: '4px 6px', fontSize: 13, textAlign: 'center', fontWeight: 600 }}
                                autoFocus
                                onBlur={e => saveGrade(s.id, a.id, null, e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && e.target.blur()}
                              />
                            ) : (
                              <button
                                onClick={() => setEditingCell(cellId)}
                                className="rounded-ctl smooth-trans tabular-nums hover:bg-[rgba(20,22,40,0.04)]"
                                style={{
                                  width: 56,
                                  padding: '5px 0',
                                  fontSize: 13,
                                  fontWeight: cellStyle?.fontWeight || 600,
                                  color: cellStyle?.color || 'var(--ink-400)',
                                  border: g ? 'none' : '1px dashed var(--hairline-strong)',
                                }}
                              >
                                {g ? g.score : '+'}
                              </button>
                            )}
                          </td>
                        )
                      })
                    )}

                    {/* Average cell */}
                    <td className="px-3 py-1.5 text-center">
                      {avg != null ? (
                        <GradeBadge score={avg} />
                      ) : (
                        <span className="text-[13px] text-ink-400">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}

              {/* No-results row */}
              {filteredStudents.length === 0 && (
                <tr>
                  <td
                    colSpan={isIB ? 6 : assessments.length + 2}
                    className="py-14"
                  >
                    <div className="flex flex-col items-center gap-2 text-center">
                      <Search className="w-8 h-8 text-ink-400 opacity-40" strokeWidth={1.5} />
                      <p className="text-[13px] text-ink-400">{t('no_data')}</p>
                    </div>
                  </td>
                </tr>
              )}

              {/* Class average footer row */}
              {filteredStudents.length > 0 && classAvg != null && (
                <tr style={{ borderTop: '1px solid var(--hairline-strong)', background: 'var(--brand-50)' }}>
                  <td
                    className="sticky left-0 z-10 px-4 py-2.5"
                    style={{ background: 'var(--brand-50)' }}
                  >
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5 text-brand-500" />
                      <span className="text-[13px] font-semibold text-brand-700">Sinif ortası</span>
                    </div>
                  </td>
                  {isIB ? (
                    ibCriteria.map(c => {
                      const grds = filteredStudents.map(s => grades[`${s.id}_${c}`]).filter(Boolean).map(g => g.score)
                      const avg = grds.length ? Math.round((grds.reduce((a, b) => a + b, 0) / grds.length) * 10) / 10 : null
                      return (
                        <td key={c} className="px-3 py-2.5 text-center">
                          {avg != null ? (
                            <span className="text-[13px] font-semibold text-brand-700 tabular-nums">{avg}</span>
                          ) : <span className="text-[13px] text-ink-400">—</span>}
                        </td>
                      )
                    })
                  ) : (
                    assessments.map(a => {
                      const grds = filteredStudents.map(s => grades[`${s.id}_${a.id}`]).filter(Boolean).map(g => g.score)
                      const avg = grds.length ? Math.round((grds.reduce((x, y) => x + y, 0) / grds.length) * 10) / 10 : null
                      return (
                        <td key={a.id} className="px-3 py-2.5 text-center">
                          {avg != null ? (
                            <span className="text-[13px] font-semibold text-brand-700 tabular-nums">{avg}</span>
                          ) : <span className="text-[13px] text-ink-400">—</span>}
                        </td>
                      )
                    })
                  )}
                  <td className="px-3 py-2.5 text-center">
                    <span className="text-[13px] font-bold text-brand-700 tabular-nums">{classAvg}</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Grade distribution footer */}
        {filteredStudents.length > 0 && allAvgs.length > 0 && (
          <div
            className="px-6 py-4"
            style={{ borderTop: '1px solid var(--hairline)', background: 'var(--surface-2)' }}
          >
            <p
              className="text-[12px] font-medium mb-3 flex items-center gap-1.5 uppercase tracking-[0.04em] text-ink-400"
            >
              <BarChart3 className="w-3.5 h-3.5" /> Qiymət paylanması
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: `A (≥9) — ${distA} şagird`,    dot: 'var(--mint)' },
                { label: `B (7–8.9) — ${distB} şagird`, dot: 'var(--sky)' },
                { label: `C (5–6.9) — ${distC} şagird`, dot: '#F59E0B' },
                { label: `D (<5) — ${distD} şagird`,    dot: '#EF4444' },
              ].map(b => (
                <span
                  key={b.label}
                  className="inline-flex items-center gap-1.5 rounded-chip px-2.5 py-1 text-[12px] font-medium text-ink-700"
                  style={{ background: 'var(--surface)', border: '1px solid var(--hairline)' }}
                >
                  <span className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: b.dot }} />
                  {b.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Add Assessment Modal ── */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={t('new_assignment')} size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-[13px] font-semibold mb-1.5 text-ink-700 uppercase tracking-[0.04em]">Başlıq</label>
            <input
              className="pastel-input"
              value={newAssessment.title}
              onChange={e => setNewAssessment(p => ({ ...p, title: e.target.value }))}
              placeholder="Məs: Yarımillik test"
            />
          </div>
          <div>
            <label className="block text-[13px] font-semibold mb-1.5 text-ink-700 uppercase tracking-[0.04em]">Növ</label>
            <select
              className="pastel-input"
              value={newAssessment.type}
              onChange={e => setNewAssessment(p => ({ ...p, type: e.target.value }))}
            >
              {assessmentTypes.map(at => <option key={at.value} value={at.value}>{at.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-semibold mb-1.5 text-ink-700 uppercase tracking-[0.04em]">{t('date')}</label>
            <input
              type="date"
              className="pastel-input"
              value={newAssessment.date}
              onChange={e => setNewAssessment(p => ({ ...p, date: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-[13px] font-semibold mb-1.5 text-ink-700 uppercase tracking-[0.04em]">Maksimum bal</label>
            <input
              type="number"
              className="pastel-input tabular-nums"
              value={newAssessment.max_score}
              onChange={e => setNewAssessment(p => ({ ...p, max_score: e.target.value }))}
            />
          </div>
          <div
            className="flex justify-end gap-2 pt-1"
            style={{ borderTop: '1px solid var(--hairline)' }}
          >
            <Button variant="ghost" size="sm" onClick={() => setShowModal(false)}>{t('cancel')}</Button>
            <Button
              variant="primary"
              size="sm"
              loading={saving}
              disabled={saving || !newAssessment.title}
              onClick={handleAddAssessment}
            >
              {t('save')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
