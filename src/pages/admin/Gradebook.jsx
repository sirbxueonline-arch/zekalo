import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { Select } from '../../components/ui/Input'
import { PageSpinner } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import { GradeBadge } from '../../components/ui/Badge'
import { BookOpen, Download, Users, TrendingUp, Award, BarChart3 } from 'lucide-react'

// ── Helpers ────────────────────────────────────────────────────────────────

function escapeCsvField(val) {
  if (val == null) return ''
  const str = String(val)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"'
  }
  return str
}

function gradeColor(score, maxScore) {
  const pct = maxScore > 0 ? (score / maxScore) * 100 : score * 10
  if (pct >= 85) return 'text-success-text font-semibold'
  if (pct >= 60) return 'text-ink-900 font-medium'
  if (pct >= 40) return 'text-warning-text font-medium'
  return 'text-danger-text font-medium'
}

function normalize(score, maxScore) {
  if (!maxScore || maxScore === 0) return score
  return (score / maxScore) * 10
}

// ── Distribution bar segment ───────────────────────────────────────────────

function DistBar({ label, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-semibold text-ink-600 w-4 tabular-nums">{label}</span>
      <div className="flex-1 h-2 bg-hairline rounded-full overflow-hidden">
        <div
          className="h-2 rounded-full bg-brand-500 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-ink-600 w-6 text-right tabular-nums">{count}</span>
      <span className="text-xs text-ink-400 w-9 text-right tabular-nums">{pct}%</span>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

export default function AdminGradebook() {
  const { profile } = useAuth()
  const editRef = useRef(null)

  const [loading, setLoading]               = useState(true)
  const [classes, setClasses]               = useState([])
  const [selectedClass, setSelectedClass]   = useState('')
  const [subjects, setSubjects]             = useState([])
  const [selectedSubject, setSelectedSubject] = useState('')
  const [students, setStudents]             = useState([])
  const [assessments, setAssessments]       = useState([])
  const [grades, setGrades]                 = useState({})   // keyed studentId_assessmentId
  const [editingCell, setEditingCell]       = useState(null)
  const [tableLoading, setTableLoading]     = useState(false)

  // ── 1. Load all classes for school ───────────────────────────────────────
  useEffect(() => {
    if (!profile?.school_id) return
    loadClasses()
  }, [profile])

  async function loadClasses() {
    const { data } = await supabase
      .from('classes')
      .select('id, name')
      .eq('school_id', profile.school_id)
      .order('name')

    setClasses(data || [])
    if (data?.length) setSelectedClass(data[0].id)
    setLoading(false)
  }

  // ── 2. Load subjects for selected class ──────────────────────────────────
  useEffect(() => {
    if (!selectedClass) return
    setSelectedSubject('')
    setSubjects([])
    loadSubjects()
  }, [selectedClass])

  async function loadSubjects() {
    // teacher_classes links teachers → classes+subjects; deduplicate subjects
    const { data } = await supabase
      .from('teacher_classes')
      .select('subject:subjects(id, name)')
      .eq('class_id', selectedClass)

    const unique = []
    const seen   = new Set()
    ;(data || []).forEach(row => {
      if (row.subject && !seen.has(row.subject.id)) {
        seen.add(row.subject.id)
        unique.push(row.subject)
      }
    })

    setSubjects(unique)
    if (unique.length) setSelectedSubject(unique[0].id)
  }

  // ── 3. Load gradebook data when class + subject are both set ─────────────
  useEffect(() => {
    if (selectedClass && selectedSubject) loadGradebook()
  }, [selectedClass, selectedSubject])

  async function loadGradebook() {
    setTableLoading(true)

    const [studentsRes, gradesRes, assessmentsRes] = await Promise.all([
      supabase
        .from('class_members')
        .select('student:profiles(id, full_name)')
        .eq('class_id', selectedClass),
      supabase
        .from('grades')
        .select('*')
        .eq('class_id', selectedClass)
        .eq('subject_id', selectedSubject),
      supabase
        .from('assessments')
        .select('*')
        .eq('class_id', selectedClass)
        .eq('subject_id', selectedSubject)
        .order('date', { ascending: false }),
    ])

    setStudents(
      (studentsRes.data || []).map(m => m.student).filter(Boolean)
    )

    const gradeMap = {}
    ;(gradesRes.data || []).forEach(g => {
      const key = `${g.student_id}_${g.assessment_id || 'score'}`
      gradeMap[key] = g
    })
    setGrades(gradeMap)
    setAssessments(assessmentsRes.data || [])
    setTableLoading(false)
  }

  // ── Grade helpers ─────────────────────────────────────────────────────────

  function getStudentAvg(studentId) {
    const vals = Object.entries(grades)
      .filter(([k]) => k.startsWith(studentId + '_'))
      .map(([, g]) => normalize(g.score, g.max_score))
    if (!vals.length) return null
    return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
  }

  // ── Save inline grade ─────────────────────────────────────────────────────

  async function saveGrade(studentId, assessmentId, rawValue) {
    const score = parseFloat(rawValue)
    if (isNaN(score)) { setEditingCell(null); return }

    const assessment = assessments.find(a => a.id === assessmentId)
    const key = `${studentId}_${assessmentId}`

    const gradeData = {
      student_id:  studentId,
      class_id:    selectedClass,
      subject_id:  selectedSubject,
      teacher_id:  null,   // admin edit — no specific teacher
      school_id:   profile.school_id,
      score,
      max_score:   assessment?.max_score ?? 10,
      date:        new Date().toISOString().split('T')[0],
      assessment_id: assessmentId,
    }

    const existing = grades[key]
    if (existing) {
      await supabase.from('grades').update({ score }).eq('id', existing.id)
    } else {
      const { data } = await supabase.from('grades').insert(gradeData).select().single()
      if (data) {
        setGrades(prev => ({ ...prev, [key]: data }))
        setEditingCell(null)
        return
      }
    }

    setGrades(prev => ({ ...prev, [key]: { ...prev[key], ...gradeData, score } }))
    setEditingCell(null)
  }

  // ── CSV export ────────────────────────────────────────────────────────────

  function exportCSV() {
    const header = ['Şagird', ...assessments.map(a => `${a.title} (/${a.max_score})`), 'Ortalama']
    const rows = students.map(s => {
      const scores = assessments.map(a => {
        const g = grades[`${s.id}_${a.id}`]
        return g != null ? g.score : ''
      })
      const avg = getStudentAvg(s.id)
      return [s.full_name, ...scores, avg != null ? String(avg).replace('.', ',') : '']
    })

    const csv  = [header, ...rows].map(r => r.map(escapeCsvField).join(';')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `jurnal_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Derived stats ─────────────────────────────────────────────────────────

  const allNormalized = Object.values(grades).map(g => normalize(g.score, g.max_score))
  const classAvg = allNormalized.length
    ? Math.round((allNormalized.reduce((a, b) => a + b, 0) / allNormalized.length) * 10) / 10
    : null

  const studentAvgs = students.map(s => getStudentAvg(s.id)).filter(v => v != null)
  const highestAvg  = studentAvgs.length ? Math.max(...studentAvgs) : null

  const dist = { A: 0, B: 0, C: 0, D: 0 }
  studentAvgs.forEach(avg => {
    if (avg >= 9)        dist.A++
    else if (avg >= 7)   dist.B++
    else if (avg >= 5)   dist.C++
    else                 dist.D++
  })

  const atRisk = dist.D

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) return <PageSpinner />

  if (!classes.length) {
    return (
      <EmptyState
        tier={1}
        icon={BookOpen}
        title="Sinif tapılmadı"
        description="Bu məktəbdə hələ heç bir sinif yaradılmayıb."
      />
    )
  }

  const selectedClassName  = classes.find(c => c.id === selectedClass)?.name || ''
  const selectedSubjectName = subjects.find(s => s.id === selectedSubject)?.name || ''

  return (
    <div className="space-y-6">

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink-900 tracking-tight">Jurnal</h1>
          {selectedClassName && selectedSubjectName && (
            <p className="mt-1 text-sm text-ink-400">
              {selectedClassName} &mdash; {selectedSubjectName}
            </p>
          )}
        </div>
        <Button variant="secondary" size="sm" onClick={exportCSV} disabled={!assessments.length}>
          <Download className="w-4 h-4 mr-1.5" />
          CSV ixrac et
        </Button>
      </div>

      {/* ── Selectors ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="sm:w-52">
          <Select
            label="Sinif"
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </div>
        <div className="sm:w-52">
          <Select
            label="Fənn"
            value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value)}
            disabled={!subjects.length}
          >
            {!subjects.length && <option value="">— fənn yoxdur —</option>}
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </Select>
        </div>
      </div>

      {/* ── Stat cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="bg-surface border border-hairline rounded-card p-5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-ink-400 uppercase tracking-[.04em]">Ümumi Şagird</p>
            <p className="font-display font-bold text-[27px] text-ink-900 mt-1.5 tabular-nums leading-none tracking-[-0.01em]">
              {students.length}
            </p>
            <p className="text-xs text-ink-400 mt-1.5">bu sinifdə</p>
          </div>
          <div className="icon-chip icon-chip-periwinkle flex-shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-surface border border-hairline rounded-card p-5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-ink-400 uppercase tracking-[.04em]">Ortalama</p>
            <p className="font-display font-bold text-[27px] text-ink-900 mt-1.5 tabular-nums leading-none tracking-[-0.01em]">
              {classAvg != null ? classAvg.toString().replace('.', ',') : '—'}
            </p>
            <p className="text-xs text-ink-400 mt-1.5">sinif ortalama bal</p>
          </div>
          <div className="icon-chip icon-chip-periwinkle flex-shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-surface border border-hairline rounded-card p-5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-ink-400 uppercase tracking-[.04em]">Ən Yüksək</p>
            <p className="font-display font-bold text-[27px] text-ink-900 mt-1.5 tabular-nums leading-none tracking-[-0.01em]">
              {highestAvg != null ? highestAvg.toString().replace('.', ',') : '—'}
            </p>
            <p className="text-xs text-ink-400 mt-1.5">ən yüksək ortalama</p>
          </div>
          <div className="icon-chip icon-chip-periwinkle flex-shrink-0">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-surface border border-hairline rounded-card p-5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-ink-400 uppercase tracking-[.04em]">Risk altında</p>
            <p className={`font-display font-bold text-[27px] mt-1.5 tabular-nums leading-none tracking-[-0.01em] ${atRisk > 0 ? 'text-danger-text' : 'text-ink-900'}`}>
              {atRisk}
            </p>
            <p className="text-xs text-ink-400 mt-1.5">ortalama 5-dən aşağı</p>
          </div>
          <div className={`icon-chip flex-shrink-0 ${atRisk > 0 ? 'icon-chip-coral' : 'icon-chip-periwinkle'}`}>
            <BarChart3 className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* ── Gradebook table ─────────────────────────────────────────────── */}
      {!selectedSubject ? (
        <EmptyState
          tier={1}
          icon={BookOpen}
          title="Fənn seçin"
          description="Jurnalı görmək üçün yuxarıdan sinif və fənn seçin."
        />
      ) : tableLoading ? (
        <PageSpinner />
      ) : assessments.length === 0 ? (
        <EmptyState
          tier={1}
          icon={BookOpen}
          title="Qiymətləndirmə yoxdur"
          description="Bu sinif-fənn üçün hələ heç bir qiymətləndirmə əlavə edilməyib."
        />
      ) : (
        <div className="bg-surface rounded-tile border border-hairline overflow-x-auto">
          <table className="pastel-table w-full">
            <thead>
              <tr>
                <th className="sticky left-0 bg-surface-2 z-10 min-w-[200px] text-left">
                  Şagird
                </th>
                {assessments.map(a => (
                  <th
                    key={a.id}
                    className="text-center min-w-[110px]"
                  >
                    <div className="text-ink-600 truncate max-w-[100px] mx-auto normal-case text-[12px] font-semibold" title={a.title}>
                      {a.title}
                    </div>
                    <div className="text-[10px] text-ink-400 font-normal mt-0.5">
                      maks: {a.max_score}
                    </div>
                  </th>
                ))}
                <th className="text-center min-w-[100px]">
                  Ortalama
                </th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 && (
                <tr>
                  <td
                    colSpan={assessments.length + 2}
                    className="text-center py-10 text-sm text-ink-400"
                  >
                    Bu sinifdə şagird tapılmadı.
                  </td>
                </tr>
              )}
              {students.map((student, idx) => {
                const avg   = getStudentAvg(student.id)
                const isLow = avg != null && avg < 5
                return (
                  <tr key={student.id}>
                    {/* Name — sticky */}
                    <td className={`sticky left-0 z-10 ${idx % 2 === 0 ? 'bg-surface' : 'bg-surface-2'}`}>
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-full bg-brand-100 text-brand-600 text-xs font-semibold flex items-center justify-center flex-shrink-0">
                          {student.full_name?.charAt(0).toUpperCase()}
                        </span>
                        <span className="text-[13px] font-medium text-ink-900">{student.full_name}</span>
                        {isLow && (
                          <span className="pill-rose ml-auto">risk</span>
                        )}
                      </div>
                    </td>

                    {/* Grade cells */}
                    {assessments.map(assessment => {
                      const key    = `${student.id}_${assessment.id}`
                      const grade  = grades[key]
                      const cellId = key

                      return (
                        <td key={assessment.id} className="text-center px-3 py-3.5">
                          {editingCell === cellId ? (
                            <input
                              ref={editRef}
                              type="number"
                              min={0}
                              max={assessment.max_score}
                              step="0.5"
                              defaultValue={grade?.score ?? ''}
                              autoFocus
                              className="w-16 border border-brand-400 rounded-input px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand-500/20 tabular-nums"
                              onBlur={e => saveGrade(student.id, assessment.id, e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') e.target.blur()
                                if (e.key === 'Escape') setEditingCell(null)
                              }}
                            />
                          ) : (
                            <button
                              onClick={() => setEditingCell(cellId)}
                              title="Redaktə et"
                              className={`w-16 py-1.5 rounded-input text-sm tabular-nums transition-all hover:ring-2 hover:ring-brand-400/25 ${
                                grade
                                  ? gradeColor(grade.score, grade.max_score)
                                  : 'text-ink-400 hover:bg-brand-50'
                              }`}
                            >
                              {grade ? grade.score : '—'}
                            </button>
                          )}
                        </td>
                      )
                    })}

                    {/* Average */}
                    <td className="text-center px-4 py-3.5">
                      {avg != null
                        ? <GradeBadge score={avg} />
                        : <span className="text-ink-400 text-sm">—</span>
                      }
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Grade distribution ───────────────────────────────────────────── */}
      {studentAvgs.length > 0 && (
        <div className="bg-surface border border-hairline rounded-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="icon-chip icon-chip-periwinkle" style={{ width: 36, height: 36, borderRadius: 10 }}>
              <BarChart3 className="w-4 h-4" />
            </div>
            <h2 className="font-semibold text-ink-900 text-[15px]">Bal bölgüsü</h2>
            <span className="ml-auto text-xs text-ink-400 tabular-nums">{studentAvgs.length} şagird</span>
          </div>
          <div className="space-y-3">
            <DistBar label="A" count={dist.A} total={studentAvgs.length} />
            <DistBar label="B" count={dist.B} total={studentAvgs.length} />
            <DistBar label="C" count={dist.C} total={studentAvgs.length} />
            <DistBar label="D" count={dist.D} total={studentAvgs.length} />
          </div>
          <div className="mt-5 pt-4 border-t border-hairline grid grid-cols-4 gap-3 text-center">
            {[
              { label: 'A', desc: '≥ 9',      count: dist.A, colorClass: 'text-success-text' },
              { label: 'B', desc: '7 – 8,9',  count: dist.B, colorClass: 'text-ink-900' },
              { label: 'C', desc: '5 – 6,9',  count: dist.C, colorClass: 'text-warning-text' },
              { label: 'D', desc: '< 5',       count: dist.D, colorClass: 'text-danger-text' },
            ].map(({ label, desc, count, colorClass }) => (
              <div key={label} className="flex flex-col items-center gap-0.5">
                <span className={`font-display font-bold text-2xl tabular-nums ${colorClass}`}>{count}</span>
                <span className={`text-[13px] font-semibold ${colorClass}`}>{label}</span>
                <span className="text-[11px] text-ink-400">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
