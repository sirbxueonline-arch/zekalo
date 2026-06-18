import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { FileText, Send, Printer, Sparkles } from 'lucide-react'
import EmptyState from '../../components/ui/EmptyState'
import Button from '../../components/ui/Button'

const reportTypeKeys = [
  { value: 'class', labelKey: 'class_report' },
  { value: 'student', labelKey: 'student_report' },
  { value: 'attendance', labelKey: 'attendance_report' },
  { value: 'ministry', labelKey: 'ministry_report' },
]

export default function TeacherReports() {
  const { profile, t } = useAuth()
  const [loading, setLoading] = useState(true)
  const [reportType, setReportType] = useState('class')
  const [teacherClasses, setTeacherClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [reportData, setReportData] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitToast, setSubmitToast] = useState('')
  const [ministryReports, setMinistryReports] = useState([])
  const previewRef = useRef(null)

  const isGovernment = profile?.school?.edition === 'government'

  useEffect(() => {
    if (!profile) return
    loadInitial()
  }, [profile])

  async function loadInitial() {
    const [tcRes, mrRes] = await Promise.all([
      supabase.from('teacher_classes').select('*, class:classes(id, name)').eq('teacher_id', profile.id),
      supabase.from('ministry_reports').select('*').eq('submitted_by', profile.id).order('created_at', { ascending: false }),
    ])

    const unique = [...new Map((tcRes.data || []).map(tc => [tc.class_id, tc.class])).values()]
    setTeacherClasses(unique)
    if (unique.length) setSelectedClass(unique[0].id)
    setMinistryReports(mrRes.data || [])

    const today = new Date()
    const monthAgo = new Date(today)
    monthAgo.setMonth(today.getMonth() - 1)
    setDateFrom(monthAgo.toISOString().split('T')[0])
    setDateTo(today.toISOString().split('T')[0])

    setLoading(false)
  }

  async function generateReport() {
    if (!selectedClass) return
    setGenerating(true)
    setReportData(null)

    try {
      if (reportType === 'class' || reportType === 'student') {
        const [studentsRes, gradesRes] = await Promise.all([
          supabase.from('class_members').select('*, student:profiles(id, full_name)').eq('class_id', selectedClass),
          supabase.from('grades').select('*, subject:subjects(name)').eq('class_id', selectedClass)
            .gte('date', dateFrom).lte('date', dateTo),
        ])

        const students = (studentsRes.data || []).map(m => m.student).filter(Boolean)
        const grades = gradesRes.data || []

        const studentData = students.map(s => {
          const sGrades = grades.filter(g => g.student_id === s.id)
          const avg = sGrades.length
            ? Math.round((sGrades.reduce((sum, g) => sum + (g.max_score > 0 ? (g.score / g.max_score) * 10 : g.score), 0) / sGrades.length) * 10) / 10
            : null
          return { ...s, grades: sGrades, avg }
        })

        setReportData({ type: reportType, students: studentData, className: teacherClasses.find(c => c.id === selectedClass)?.name })
      } else if (reportType === 'attendance') {
        const [studentsRes, attRes] = await Promise.all([
          supabase.from('class_members').select('*, student:profiles(id, full_name)').eq('class_id', selectedClass),
          supabase.from('attendance').select('*').eq('class_id', selectedClass)
            .gte('date', dateFrom).lte('date', dateTo),
        ])

        const students = (studentsRes.data || []).map(m => m.student).filter(Boolean)
        const attendance = attRes.data || []

        const studentData = students.map(s => {
          const sAtt = attendance.filter(a => a.student_id === s.id)
          const present = sAtt.filter(a => a.status === 'present').length
          const late = sAtt.filter(a => a.status === 'late').length
          const absent = sAtt.filter(a => a.status === 'absent').length
          const pct = sAtt.length ? Math.round((present / sAtt.length) * 100) : 0
          return { ...s, present, late, absent, total: sAtt.length, pct }
        })

        setReportData({ type: 'attendance', students: studentData, className: teacherClasses.find(c => c.id === selectedClass)?.name })
      } else if (reportType === 'ministry') {
        const [studentsRes, gradesRes, attRes] = await Promise.all([
          supabase.from('class_members').select('*, student:profiles(id, full_name)').eq('class_id', selectedClass),
          supabase.from('grades').select('*').eq('class_id', selectedClass).gte('date', dateFrom).lte('date', dateTo),
          supabase.from('attendance').select('*').eq('class_id', selectedClass).gte('date', dateFrom).lte('date', dateTo),
        ])

        const students = (studentsRes.data || []).map(m => m.student).filter(Boolean)
        const grades = gradesRes.data || []
        const attendance = attRes.data || []

        const studentData = students.map(s => {
          const sGrades = grades.filter(g => g.student_id === s.id)
          const avg = sGrades.length
            ? Math.round((sGrades.reduce((sum, g) => sum + (g.max_score > 0 ? (g.score / g.max_score) * 10 : g.score), 0) / sGrades.length) * 10) / 10
            : null
          const sAtt = attendance.filter(a => a.student_id === s.id)
          const present = sAtt.filter(a => a.status === 'present').length
          const pct = sAtt.length ? Math.round((present / sAtt.length) * 100) : 0
          return { ...s, avg, attendancePct: pct }
        })

        setReportData({ type: 'ministry', students: studentData, className: teacherClasses.find(c => c.id === selectedClass)?.name })
      }
    } catch {
      setReportData(null)
    }
    setGenerating(false)
  }

  function handlePrint() {
    if (!previewRef.current) return
    const printWindow = window.open('', '', 'width=800,height=600')
    printWindow.document.write(`
      <html><head><title>${t('reports')}</title>
      <style>body{font-family:system-ui;padding:2rem;color:#1E2233}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ECEDF3;padding:8px;text-align:left;font-size:13px}th{background:#F6F6FB;color:#9AA0B0;font-weight:600}h2{color:#574FCF}</style>
      </head><body>${previewRef.current.innerHTML}</body></html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  async function handleMinistrySubmit() {
    if (!reportData || reportType !== 'ministry') return
    setSubmitting(true)
    const { data, error } = await supabase.from('ministry_reports').insert({
      school_id: profile.school_id,
      submitted_by: profile.id,
      class_id: selectedClass,
      report_type: 'class_summary',
      data: reportData,
      date_from: dateFrom,
      date_to: dateTo,
      status: 'submitted',
    }).select().single()

    if (!error && data) {
      setMinistryReports(prev => [data, ...prev])
      setSubmitToast('success')
    } else {
      setSubmitToast('error')
    }
    setTimeout(() => setSubmitToast(''), 2400)
    setSubmitting(false)
  }

  const formatDate = (d) => {
    if (!d) return ''
    const dt = new Date(d)
    return `${String(dt.getDate()).padStart(2, '0')}.${String(dt.getMonth() + 1).padStart(2, '0')}.${dt.getFullYear()}`
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="pastel-skeleton h-12 w-72" />
        <div className="pastel-skeleton h-32" />
        <div className="pastel-skeleton h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-5 relative">
      {/* Toast */}
      {submitToast && (
        <div
          className={`fixed top-6 right-6 px-4 py-3 rounded-tile text-sm font-semibold z-50 flex items-center gap-2 shadow-modal ${
            submitToast === 'success' ? 'toast-success' : 'toast-error'
          }`}
        >
          {submitToast === 'success' ? 'Hesabat göndərildi' : 'Xəta baş verdi'}
        </div>
      )}

      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="icon-chip icon-chip-periwinkle">
          <FileText className="w-5 h-5" />
        </div>
        <h1 className="font-display font-bold text-[26px] text-ink-900 tracking-[-0.01em]">
          {t('reports')}
        </h1>
      </div>

      {/* Filters card */}
      <div className="liquid-card p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-[13px] font-semibold mb-1.5 uppercase tracking-[0.04em] text-ink-400">
              {t('reports')}
            </label>
            <select className="pastel-input" value={reportType} onChange={e => setReportType(e.target.value)}>
              {reportTypeKeys.map(rt => (
                <option key={rt.value} value={rt.value}>{t(rt.labelKey)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-semibold mb-1.5 uppercase tracking-[0.04em] text-ink-400">
              {t('class_name')}
            </label>
            <select className="pastel-input" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
              {teacherClasses.length === 0 && <option>—</option>}
              {teacherClasses.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-semibold mb-1.5 uppercase tracking-[0.04em] text-ink-400">
              {t('date')}
            </label>
            <input type="date" className="pastel-input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </div>
          <div>
            <label className="block text-[13px] font-semibold mb-1.5 uppercase tracking-[0.04em] text-ink-400">
              {t('date')}
            </label>
            <input type="date" className="pastel-input" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
        </div>

        <div className="flex gap-3 mt-5 flex-wrap">
          <Button
            onClick={generateReport}
            disabled={generating || !selectedClass}
            loading={generating}
            variant="primary"
            size="md"
          >
            <Sparkles className="w-4 h-4" />
            {generating ? '...' : t('reports')}
          </Button>

          {reportData && (
            <>
              <Button onClick={handlePrint} variant="secondary" size="md">
                <Printer className="w-4 h-4" /> {t('print')}
              </Button>
              {reportType === 'ministry' && isGovernment && (
                <Button
                  onClick={handleMinistrySubmit}
                  disabled={submitting}
                  loading={submitting}
                  variant="teal"
                  size="md"
                >
                  <Send className="w-4 h-4" /> {submitting ? '...' : t('submit_egov')}
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Report preview */}
      {reportData && (
        <div className="liquid-card p-6">
          <div ref={previewRef}>
            <h2 className="font-display font-bold text-xl text-ink-900 mb-1 tracking-[-0.01em]">
              {reportData.className}
            </h2>
            <p className="text-sm text-ink-400 mb-6 tabular-nums">
              {formatDate(dateFrom)} — {formatDate(dateTo)}
            </p>

            {(reportData.type === 'class' || reportData.type === 'student') && (
              <table className="pastel-table">
                <thead>
                  <tr>
                    <th>{t('full_name')}</th>
                    <th style={{ textAlign: 'center' }}>{t('grades')}</th>
                    <th style={{ textAlign: 'center' }}>{t('avg_grade')}</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.students.map(s => (
                    <tr key={s.id}>
                      <td className="font-semibold text-ink-900">{s.full_name}</td>
                      <td className="text-center tabular-nums">{s.grades.length}</td>
                      <td style={{ textAlign: 'center' }}>
                        {s.avg != null ? (
                          <span
                            className="inline-flex items-center px-2.5 py-0.5 rounded-pill text-xs font-semibold tabular-nums"
                            style={{
                              background: s.avg >= 8
                                ? 'rgba(34,197,94,0.14)'
                                : s.avg >= 5
                                ? 'rgba(245,158,11,0.14)'
                                : 'rgba(239,68,68,0.12)',
                              color: s.avg >= 8 ? '#15803D' : s.avg >= 5 ? '#B45309' : '#B91C1C',
                            }}
                          >
                            {String(s.avg).replace('.', ',')}
                          </span>
                        ) : (
                          <span className="text-ink-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {reportData.type === 'attendance' && (
              <table className="pastel-table">
                <thead>
                  <tr>
                    <th>{t('full_name')}</th>
                    <th style={{ textAlign: 'center' }}>{t('present')}</th>
                    <th style={{ textAlign: 'center' }}>{t('late')}</th>
                    <th style={{ textAlign: 'center' }}>{t('absent')}</th>
                    <th style={{ textAlign: 'center' }}>%</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.students.map(s => (
                    <tr key={s.id}>
                      <td className="font-semibold text-ink-900">{s.full_name}</td>
                      <td className="text-center tabular-nums font-semibold" style={{ color: '#15803D' }}>{s.present}</td>
                      <td className="text-center tabular-nums font-semibold" style={{ color: '#B45309' }}>{s.late}</td>
                      <td className="text-center tabular-nums font-semibold" style={{ color: '#B91C1C' }}>{s.absent}</td>
                      <td
                        className="text-center tabular-nums font-bold"
                        style={{ color: s.pct >= 85 ? '#15803D' : '#B91C1C' }}
                      >
                        {s.pct}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {reportData.type === 'ministry' && (
              <table className="pastel-table">
                <thead>
                  <tr>
                    <th>{t('full_name')}</th>
                    <th style={{ textAlign: 'center' }}>{t('avg_grade')}</th>
                    <th style={{ textAlign: 'center' }}>{t('attendance_pct')}</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.students.map(s => (
                    <tr key={s.id}>
                      <td className="font-semibold text-ink-900">{s.full_name}</td>
                      <td className="text-center tabular-nums">
                        {s.avg != null ? String(s.avg).replace('.', ',') : <span className="text-ink-400">—</span>}
                      </td>
                      <td
                        className="text-center tabular-nums font-bold"
                        style={{ color: s.attendancePct >= 85 ? '#15803D' : '#B91C1C' }}
                      >
                        {s.attendancePct}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!reportData && !generating && (
        <EmptyState
          tier={1}
          icon={FileText}
          title={t('reports')}
          description={t('no_data')}
        />
      )}

      {/* Ministry report history */}
      {ministryReports.length > 0 && (
        <div className="liquid-card overflow-hidden">
          <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--hairline)' }}>
            <h2 className="text-[13px] tracking-[0.04em] uppercase font-semibold text-ink-400">
              {t('ministry_report')}
            </h2>
          </div>
          <table className="pastel-table">
            <thead>
              <tr>
                <th>{t('date')}</th>
                <th>{t('reports')}</th>
                <th>{t('date')}</th>
                <th>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {ministryReports.map(r => (
                <tr key={r.id}>
                  <td className="tabular-nums">{formatDate(r.created_at)}</td>
                  <td>{r.report_type}</td>
                  <td className="tabular-nums">{formatDate(r.date_from)} — {formatDate(r.date_to)}</td>
                  <td>
                    <span
                      className={
                        r.status === 'approved'
                          ? 'pill-mint'
                          : r.status === 'submitted'
                          ? 'pill-blue'
                          : 'pill-muted'
                      }
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
