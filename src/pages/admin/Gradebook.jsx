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

function gradeColor(score, maxScore) {
  const pct = maxScore > 0 ? (score / maxScore) * 100 : score * 10
  if (pct >= 85) return 'bg-teal-light text-teal font-semibold'
  if (pct >= 60) return 'bg-blue-50 text-blue-700'
  if (pct >= 40) return 'bg-amber-50 text-amber-700'
  return 'bg-red-50 text-red-600'
}

function normalize(score, maxScore) {
  if (!maxScore || maxScore === 0) return score
  return (score / maxScore) * 10
}

// ── Distribution bar segment ───────────────────────────────────────────────

function DistBar({ label, count, total, color }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-semibold text-gray-500 w-4">{label}</span>
      <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-3 rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-500 w-8 text-right">{count}</span>
      <span className="text-xs text-gray-400 w-8 text-right">{pct}%</span>
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

    const csv  = [header, ...rows].map(r => r.join(';')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
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
        icon={BookOpen}
        title="Sinif tapılmadı"
        description="Bu məktəbdə hələ heç bir sinif yaradılmayıb."
      />
    )
  }

  const selectedClassName  = classes.find(c => c.id === selectedClass)?.name || ''
  const selectedSubjectName = subjects.find(s => s.id === selectedSubject)?.name || ''

  return (
    <div className="space-y-8">

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl text-gray-900 tracking-tight">Jurnal</h1>
          {selectedClassName && selectedSubjectName && (
            <p className="mt-1 text-sm text-gray-500">
              {selectedClassName} &mdash; {selectedSubjectName}
            </p>
          )}
        </div>
        <Button variant="secondary" onClick={exportCSV} disabled={!assessments.length}>
          <Download className="w-4 h-4 mr-2" />
          CSV ixrac et
        </Button>
      </div>

      {/* ── Selectors ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="sm:w-56">
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
        <div className="sm:w-56">
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

        <div className="rounded-2xl border border-border-soft shadow-sm bg-white p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs tracking-widest text-gray-400 uppercase">Ümumi Şagird</span>
            <span className="w-8 h-8 rounded-lg bg-purple-light flex items-center justify-center">
              <Users className="w-4 h-4 text-purple" />
            </span>
          </div>
          <p className="text-3xl font-semibold text-gray-900">{students.length}</p>
          <p className="text-xs text-gray-400 mt-1">bu sinifdə</p>
        </div>

        <div className="rounded-2xl border border-border-soft shadow-sm bg-white p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs tracking-widest text-gray-400 uppercase">Ortalama</span>
            <span className="w-8 h-8 rounded-lg bg-teal-light flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-teal" />
            </span>
          </div>
          <p className="text-3xl font-semibold text-gray-900">
            {classAvg != null ? classAvg.toString().replace('.', ',') : '—'}
          </p>
          <p className="text-xs text-gray-400 mt-1">sinif ortalama bal</p>
        </div>

        <div className="rounded-2xl border border-border-soft shadow-sm bg-white p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs tracking-widest text-gray-400 uppercase">Ən Yüksək</span>
            <span className="w-8 h-8 rounded-lg bg-purple-light flex items-center justify-center">
              <Award className="w-4 h-4 text-purple" />
            </span>
          </div>
          <p className="text-3xl font-semibold text-gray-900">
            {highestAvg != null ? highestAvg.toString().replace('.', ',') : '—'}
          </p>
          <p className="text-xs text-gray-400 mt-1">ən yüksək ortalama</p>
        </div>

        <div className="rounded-2xl border border-border-soft shadow-sm bg-white p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs tracking-widest text-gray-400 uppercase">Risk altında</span>
            <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${atRisk > 0 ? 'bg-red-50' : 'bg-teal-light'}`}>
              <BarChart3 className={`w-4 h-4 ${atRisk > 0 ? 'text-red-500' : 'text-teal'}`} />
            </span>
          </div>
          <p className={`text-3xl font-semibold ${atRisk > 0 ? 'text-red-600' : 'text-gray-900'}`}>
            {atRisk}
          </p>
          <p className="text-xs text-gray-400 mt-1">ortalama 5-dən aşağı</p>
        </div>

      </div>

      {/* ── Gradebook table ─────────────────────────────────────────────── */}
      {!selectedSubject ? (
        <EmptyState
          icon={BookOpen}
          title="Fənn seçin"
          description="Jurnalı görmək üçün yuxarıdan sinif və fənn seçin."
        />
      ) : tableLoading ? (
        <PageSpinner />
      ) : assessments.length === 0 ? (
        <Card hover={false} className="text-center py-12">
          <BookOpen className="w-10 h-10 text-purple-mid mx-auto mb-3" />
          <p className="font-serif text-xl text-gray-700 mb-1">Qiymətləndirmə yoxdur</p>
          <p className="text-sm text-gray-400">
            Bu sinif-fənn üçün hələ heç bir qiymətləndirmə əlavə edilməyib.
          </p>
        </Card>
      ) : (
        <div className="rounded-2xl border border-border-soft shadow-sm bg-white overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface border-b border-border-soft">
                <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4 text-left sticky left-0 bg-surface z-10 min-w-[200px]">
                  Şagird
                </th>
                {assessments.map(a => (
                  <th
                    key={a.id}
                    className="text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-4 text-center min-w-[110px]"
                  >
                    <div className="text-purple truncate max-w-[100px] mx-auto" title={a.title}>
                      {a.title}
                    </div>
                    <div className="text-[10px] text-gray-400 font-normal normal-case mt-0.5">
                      maks: {a.max_score}
                    </div>
                  </th>
                ))}
                <th className="text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4 text-center min-w-[100px]">
                  Ortalama
                </th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 && (
                <tr>
                  <td
                    colSpan={assessments.length + 2}
                    className="text-center py-10 text-sm text-gray-400"
                  >
                    Bu sinifdə şagird tapılmadı.
                  </td>
                </tr>
              )}
              {students.map((student, idx) => {
                const avg   = getStudentAvg(student.id)
                const isLow = avg != null && avg < 5
                return (
                  <tr
                    key={student.id}
                    className={`border-b border-border-soft transition-colors last:border-0 ${
                      isLow ? 'bg-red-50/60' : idx % 2 === 0 ? 'bg-white' : 'bg-surface/40'
                    } hover:bg-purple-light/30`}
                  >
                    {/* Name — sticky */}
                    <td className={`px-6 py-3.5 text-sm font-medium text-gray-900 sticky left-0 z-10 ${
                      isLow ? 'bg-red-50/60' : idx % 2 === 0 ? 'bg-white' : 'bg-surface/40'
                    }`}>
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-full bg-purple-light text-purple text-xs font-semibold flex items-center justify-center flex-shrink-0">
                          {student.full_name?.charAt(0).toUpperCase()}
                        </span>
                        <span>{student.full_name}</span>
                        {isLow && (
                          <span className="ml-auto text-[10px] font-medium text-red-500 bg-red-50 border border-red-200 rounded-full px-2 py-0.5">
                            risk
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Grade cells */}
                    {assessments.map(assessment => {
                      const key    = `${student.id}_${assessment.id}`
                      const grade  = grades[key]
                      const cellId = key

                      return (
                        <td key={assessment.id} className="px-4 py-3.5 text-center">
                          {editingCell === cellId ? (
                            <input
                              ref={editRef}
                              type="number"
                              min={0}
                              max={assessment.max_score}
                              step="0.5"
                              defaultValue={grade?.score ?? ''}
                              autoFocus
                              className="w-16 border border-purple rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-purple/30"
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
                              className={`w-16 py-1.5 rounded-lg text-sm transition-all hover:ring-2 hover:ring-purple/20 ${
                                grade
                                  ? gradeColor(grade.score, grade.max_score)
                                  : 'text-gray-300 hover:bg-purple-light'
                              }`}
                            >
                              {grade ? grade.score : '\u2014'}
                            </button>
                          )}
                        </td>
                      )
                    })}

                    {/* Average */}
                    <td className="px-6 py-3.5 text-center">
                      {avg != null
                        ? <GradeBadge score={avg} />
                        : <span className="text-gray-300 text-sm">\u2014</span>
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
        <div className="rounded-2xl border border-border-soft shadow-sm bg-white p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="w-5 h-5 text-purple" />
            <h2 className="font-semibold text-gray-800">Bal bölgüsü</h2>
            <span className="ml-auto text-xs text-gray-400">{studentAvgs.length} şagird</span>
          </div>
          <div className="space-y-3">
            <DistBar
              label="A"
              count={dist.A}
              total={studentAvgs.length}
              color="bg-teal"
            />
            <DistBar
              label="B"
              count={dist.B}
              total={studentAvgs.length}
              color="bg-purple"
            />
            <DistBar
              label="C"
              count={dist.C}
              total={studentAvgs.length}
              color="bg-amber-400"
            />
            <DistBar
              label="D"
              count={dist.D}
              total={studentAvgs.length}
              color="bg-red-400"
            />
          </div>
          <div className="mt-5 pt-4 border-t border-border-soft grid grid-cols-4 gap-3 text-center">
            {[
              { label: 'A', desc: '≥ 9', count: dist.A, color: 'text-teal' },
              { label: 'B', desc: '7 – 8.9', count: dist.B, color: 'text-purple' },
              { label: 'C', desc: '5 – 6.9', count: dist.C, color: 'text-amber-500' },
              { label: 'D', desc: '< 5', count: dist.D, color: 'text-red-500' },
            ].map(({ label, desc, count, color }) => (
              <div key={label} className="flex flex-col items-center">
                <span className={`text-2xl font-bold ${color}`}>{count}</span>
                <span className={`text-sm font-semibold ${color} opacity-80`}>{label}</span>
                <span className="text-[11px] text-gray-400">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
